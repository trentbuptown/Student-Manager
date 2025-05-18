import React, { useState, useEffect } from 'react';
import { getStudentReport } from '@/services/scoreService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function StudentScores() {
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentScores = async () => {
      try {
        setLoading(true);
        if (user?.student_id) {
          const response = await getStudentReport(user.student_id);
          setReport(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải điểm');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentScores();
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 font-bold';
    if (score >= 7.0) return 'text-blue-600 font-bold';
    if (score >= 5.0) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'Giỏi':
        return <Badge className="bg-green-600">Giỏi</Badge>;
      case 'Khá':
        return <Badge className="bg-blue-600">Khá</Badge>;
      case 'Trung bình':
        return <Badge className="bg-yellow-600">Trung bình</Badge>;
      case 'Yếu':
        return <Badge className="bg-orange-600">Yếu</Badge>;
      case 'Kém':
        return <Badge className="bg-red-600">Kém</Badge>;
      default:
        return <Badge className="bg-gray-500">{classification}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lỗi!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Thông báo</AlertTitle>
        <AlertDescription>Không có dữ liệu điểm cho học sinh này.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin học sinh</CardTitle>
          <CardDescription>Bảng tổng hợp điểm của học sinh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium">Học sinh: <span className="font-bold">{report.student.name}</span></p>
              {report.student.student_code && (
                <p className="text-sm font-medium">Mã học sinh: <span className="font-bold">{report.student.student_code}</span></p>
              )}
              {report.student.class && (
                <p className="text-sm font-medium">Lớp: <span className="font-bold">{report.student.class.name}</span></p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Điểm trung bình: <span className={getScoreColor(report.overall.average_score)}>{report.overall.average_score}</span></p>
              <p className="text-sm font-medium">Xếp loại: {getClassificationBadge(report.overall.classification)}</p>
              <p className="text-sm font-medium">Tỷ lệ đạt: <span className="font-bold">{report.overall.pass_rate}%</span> ({report.overall.passed_subjects}/{report.overall.total_subjects} môn)</p>
            </div>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Tổng hợp điểm</TabsTrigger>
              <TabsTrigger value="details">Chi tiết điểm</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Điểm TB</TableHead>
                    <TableHead>Xếp loại</TableHead>
                    <TableHead>Kết quả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.subjects.map((subject: any, index: number) => (
                    <TableRow key={subject.subject_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{subject.subject_name}</TableCell>
                      <TableCell className={getScoreColor(subject.average_score)}>
                        {subject.average_score}
                      </TableCell>
                      <TableCell>{getClassificationBadge(subject.classification)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={subject.pass_status === 'Đạt' ? "default" : "destructive"}
                        >
                          {subject.pass_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="details">
              {report.subjects.map((subject: any) => (
                <div key={subject.subject_id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{subject.subject_name}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loại điểm</TableHead>
                        <TableHead>Điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subject.details.map((detail: any) => (
                        <TableRow key={`${subject.subject_id}-${detail.type}`}>
                          <TableCell>{detail.type_text}</TableCell>
                          <TableCell className={getScoreColor(detail.score)}>
                            {detail.score}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-bold">Điểm trung bình</TableCell>
                        <TableCell className={getScoreColor(subject.average_score)}>
                          {subject.average_score}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 