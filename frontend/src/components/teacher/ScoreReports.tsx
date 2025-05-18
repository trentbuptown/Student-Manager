import React, { useState, useEffect } from 'react';
import { getClassReport, getSubjectReport } from '@/services/scoreService';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, SearchIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ScoreReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('class'); // 'class' hoặc 'subject'
  const [reportData, setReportData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]); // Giả định từ API
  const [subjects, setSubjects] = useState<any[]>([]); // Giả định từ API
  const [selectedId, setSelectedId] = useState('');
  
  const fetchReport = async () => {
    if (!selectedId) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: `Vui lòng chọn ${reportType === 'class' ? 'lớp học' : 'môn học'} trước khi xem báo cáo.`,
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (reportType === 'class') {
        const response = await getClassReport(parseInt(selectedId));
        setReportData(response.data);
      } else {
        const response = await getSubjectReport(parseInt(selectedId));
        setReportData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải báo cáo');
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải báo cáo, vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    setSelectedId('');
    setReportData(null);
  };
  
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
  
  const renderClassReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lớp học</CardTitle>
            <CardDescription>
              Lớp: {reportData.class.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Tổng số học sinh: <span className="font-bold">{reportData.class.total_students}</span></p>
                <p className="text-sm font-medium">Số học sinh có điểm: <span className="font-bold">{reportData.class.students_with_scores}</span></p>
                <p className="text-sm font-medium">Điểm trung bình lớp: <span className={getScoreColor(reportData.overall.average_score)}>{reportData.overall.average_score}</span></p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Phân loại học lực:</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Giỏi ({reportData.overall.excellent.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.excellent.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.excellent.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-green-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Khá ({reportData.overall.good.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.good.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.good.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Trung bình ({reportData.overall.average.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.average.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.average.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-yellow-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Yếu/Kém ({reportData.overall.below_average.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.below_average.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.below_average.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bảng điểm học sinh</CardTitle>
            <CardDescription>
              Danh sách điểm của học sinh theo thứ tự điểm trung bình từ cao đến thấp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Điểm TB</TableHead>
                  <TableHead>Xếp loại</TableHead>
                  <TableHead>Tỷ lệ đạt</TableHead>
                  <TableHead>Số môn học</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.students.map((student: any, index: number) => (
                  <TableRow key={student.student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.student.name}</TableCell>
                    <TableCell className={getScoreColor(student.average_score)}>
                      {student.average_score}
                    </TableCell>
                    <TableCell>{getClassificationBadge(student.classification)}</TableCell>
                    <TableCell>{student.pass_rate}%</TableCell>
                    <TableCell>{student.subject_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderSubjectReport = () => {
    if (!reportData) return null;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin môn học</CardTitle>
            <CardDescription>
              Môn: {reportData.subject.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Tổng số học sinh: <span className="font-bold">{reportData.overall.total_students}</span></p>
                <p className="text-sm font-medium">Điểm trung bình: <span className={getScoreColor(reportData.overall.average_score)}>{reportData.overall.average_score}</span></p>
                <p className="text-sm font-medium">Tỷ lệ đạt: <span className="font-bold">{reportData.overall.pass_rate}%</span></p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Phân loại học lực:</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Giỏi ({reportData.overall.excellent.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.excellent.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.excellent.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-green-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Khá ({reportData.overall.good.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.good.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.good.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Trung bình ({reportData.overall.average.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.average.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.average.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-yellow-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Yếu/Kém ({reportData.overall.below_average.count} học sinh)</span>
                      <span className="text-sm font-bold">{reportData.overall.below_average.percentage}%</span>
                    </div>
                    <Progress value={reportData.overall.below_average.percentage} className="h-2 bg-gray-200" indicatorClassName="bg-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {reportData.classes && reportData.classes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Phân tích theo lớp</CardTitle>
              <CardDescription>
                So sánh kết quả giữa các lớp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Số học sinh</TableHead>
                    <TableHead>Điểm TB</TableHead>
                    <TableHead>Tỷ lệ đạt</TableHead>
                    <TableHead>Giỏi</TableHead>
                    <TableHead>Khá</TableHead>
                    <TableHead>Trung bình</TableHead>
                    <TableHead>Yếu/Kém</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.classes.map((classData: any) => (
                    <TableRow key={classData.class_id}>
                      <TableCell className="font-medium">{classData.class_name}</TableCell>
                      <TableCell>{classData.total_students}</TableCell>
                      <TableCell className={getScoreColor(classData.average_score)}>
                        {classData.average_score}
                      </TableCell>
                      <TableCell>{classData.pass_rate}%</TableCell>
                      <TableCell>{classData.excellence_count}</TableCell>
                      <TableCell>{classData.good_count}</TableCell>
                      <TableCell>{classData.average_count}</TableCell>
                      <TableCell>{classData.below_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Bảng điểm học sinh</CardTitle>
            <CardDescription>
              Danh sách điểm của học sinh theo thứ tự điểm từ cao đến thấp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Điểm TB</TableHead>
                  <TableHead>Xếp loại</TableHead>
                  <TableHead>Kết quả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.students.map((student: any, index: number) => (
                  <TableRow key={student.student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.student.name}</TableCell>
                    <TableCell>{student.student.class?.name || '-'}</TableCell>
                    <TableCell className={getScoreColor(student.average_score)}>
                      {student.average_score}
                    </TableCell>
                    <TableCell>{getClassificationBadge(student.classification)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.pass_status === 'Đạt' ? "default" : "destructive"}
                      >
                        {student.pass_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo và thống kê</CardTitle>
          <CardDescription>
            Xem báo cáo chi tiết về kết quả học tập của học sinh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="w-full md:w-auto">
                <Tabs 
                  value={reportType} 
                  onValueChange={handleReportTypeChange}
                  className="w-full md:w-[400px]"
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="class">Báo cáo theo lớp</TabsTrigger>
                    <TabsTrigger value="subject">Báo cáo theo môn</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-64">
                  {reportType === 'class' ? (
                    <Select
                      value={selectedId}
                      onValueChange={setSelectedId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id.toString()}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={selectedId}
                      onValueChange={setSelectedId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <Button onClick={fetchReport} className="gap-2" disabled={loading}>
                  {loading ? (
                    <>Đang tải...</>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4" />
                      Xem báo cáo
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : reportData ? (
              reportType === 'class' ? renderClassReport() : renderSubjectReport()
            ) : (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Thông báo</AlertTitle>
                <AlertDescription>
                  Vui lòng chọn {reportType === 'class' ? 'lớp học' : 'môn học'} và nhấn "Xem báo cáo" để xem thống kê.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 