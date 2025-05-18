import React, { useState, useEffect } from 'react';
import { getScores, createScore, updateScore, deleteScore } from '@/services/scoreService';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  InfoIcon,
  SearchIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const scoreTypes = [
  { value: 'mieng', label: 'Điểm miệng' },
  { value: '15_phut', label: 'Điểm 15 phút' },
  { value: '1_tiet', label: 'Điểm 1 tiết' },
  { value: 'giua_ky', label: 'Điểm giữa kỳ' },
  { value: 'cuoi_ky', label: 'Điểm cuối kỳ' }
];

const ScoreFormSchema = z.object({
  student_id: z.string().min(1, { message: 'Vui lòng chọn học sinh' }),
  subject_id: z.string().min(1, { message: 'Vui lòng chọn môn học' }),
  score_details: z.array(
    z.object({
      type: z.string().min(1, { message: 'Vui lòng chọn loại điểm' }),
      score: z.string().refine(val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 10;
      }, { message: 'Điểm phải là số từ 0 đến 10' })
    })
  ).min(1, { message: 'Phải có ít nhất một điểm' })
});

export function ScoreManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]); // Giả định từ API
  const [subjects, setSubjects] = useState<any[]>([]); // Giả định từ API
  const [scoreDetails, setScoreDetails] = useState<any[]>([{ type: '', score: '' }]);
  const [filters, setFilters] = useState({ student_id: '', subject_id: '' });
  
  const form = useForm<z.infer<typeof ScoreFormSchema>>({
    resolver: zodResolver(ScoreFormSchema),
    defaultValues: {
      student_id: '',
      subject_id: '',
      score_details: [{ type: '', score: '' }]
    }
  });
  
  useEffect(() => {
    fetchScores();
    // Giả định API calls để lấy danh sách học sinh và môn học
    // fetchStudents();
    // fetchSubjects();
  }, []);
  
  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await getScores(filters);
      setScores(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải điểm');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = () => {
    fetchScores();
  };
  
  const resetFilters = () => {
    setFilters({ student_id: '', subject_id: '' });
  };
  
  const openAddDialog = () => {
    form.reset({
      student_id: '',
      subject_id: '',
      score_details: [{ type: '', score: '' }]
    });
    setIsAddDialogOpen(true);
  };
  
  const openEditDialog = (score: any) => {
    setSelectedScore(score);
    form.reset({
      student_id: score.student.id.toString(),
      subject_id: score.subject.id.toString(),
      score_details: score.score_details.map((detail: any) => ({
        type: detail.type,
        score: detail.score.toString()
      }))
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (score: any) => {
    setSelectedScore(score);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddScoreDetail = () => {
    const currentDetails = form.getValues().score_details;
    form.setValue('score_details', [...currentDetails, { type: '', score: '' }]);
  };
  
  const handleRemoveScoreDetail = (index: number) => {
    const currentDetails = form.getValues().score_details;
    if (currentDetails.length > 1) {
      form.setValue('score_details', currentDetails.filter((_, i) => i !== index));
    }
  };
  
  const onAddSubmit = async (data: z.infer<typeof ScoreFormSchema>) => {
    try {
      const payload = {
        student_id: parseInt(data.student_id),
        subject_id: parseInt(data.subject_id),
        score_details: data.score_details.map(detail => ({
          type: detail.type,
          score: parseFloat(detail.score)
        }))
      };
      
      const response = await createScore(payload);
      if (response.status === 'success') {
        toast({
          title: 'Thành công',
          description: 'Thêm điểm mới thành công',
        });
        setIsAddDialogOpen(false);
        fetchScores();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi thêm điểm',
      });
    }
  };
  
  const onEditSubmit = async (data: z.infer<typeof ScoreFormSchema>) => {
    try {
      const payload = {
        student_id: parseInt(data.student_id),
        subject_id: parseInt(data.subject_id),
        score_details: data.score_details.map(detail => ({
          type: detail.type,
          score: parseFloat(detail.score)
        }))
      };
      
      const response = await updateScore(selectedScore.id, payload);
      if (response.status === 'success') {
        toast({
          title: 'Thành công',
          description: 'Cập nhật điểm thành công',
        });
        setIsEditDialogOpen(false);
        fetchScores();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật điểm',
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      const response = await deleteScore(selectedScore.id);
      if (response.status === 'success') {
        toast({
          title: 'Thành công',
          description: 'Xóa điểm thành công',
        });
        setIsDeleteDialogOpen(false);
        fetchScores();
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.response?.data?.message || 'Có lỗi xảy ra khi xóa điểm',
      });
    }
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý điểm số</CardTitle>
          <CardDescription>Thêm, chỉnh sửa và xóa điểm cho học sinh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select
                  value={filters.student_id}
                  onValueChange={(value) => handleFilterChange('student_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học sinh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả học sinh</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-64">
                <Select
                  value={filters.subject_id}
                  onValueChange={(value) => handleFilterChange('subject_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả môn học</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="gap-2">
                <SearchIcon className="h-4 w-4" />
                Tìm kiếm
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Đặt lại
              </Button>
            </div>
            <Button onClick={openAddDialog} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Thêm điểm
            </Button>
          </div>
          
          {scores.length === 0 ? (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Không có dữ liệu</AlertTitle>
              <AlertDescription>Không tìm thấy bản ghi điểm nào phù hợp với bộ lọc.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Điểm TB</TableHead>
                  <TableHead>Xếp loại</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score, index) => (
                  <TableRow key={score.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{score.student.name}</TableCell>
                    <TableCell>{score.subject.name}</TableCell>
                    <TableCell className={getScoreColor(score.average_score)}>
                      {score.average_score}
                    </TableCell>
                    <TableCell>{getClassificationBadge(score.classification)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={score.pass_status === 'Đạt' ? "default" : "destructive"}
                      >
                        {score.pass_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditDialog(score)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => openDeleteDialog(score)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog Thêm điểm */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm điểm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin điểm cho học sinh.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học sinh</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn học sinh" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn môn học" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Chi tiết điểm</FormLabel>
                {form.getValues().score_details.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`score_details.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Loại điểm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {scoreTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`score_details.${index}.score`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              placeholder="Điểm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveScoreDetail(index)}
                      disabled={form.getValues().score_details.length <= 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddScoreDetail}
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm điểm
                </Button>
              </div>
              
              <DialogFooter>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Chỉnh sửa điểm */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa điểm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin điểm cho học sinh.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học sinh</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn học sinh" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn môn học" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Chi tiết điểm</FormLabel>
                {form.getValues().score_details.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`score_details.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Loại điểm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {scoreTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`score_details.${index}.score`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              placeholder="Điểm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveScoreDetail(index)}
                      disabled={form.getValues().score_details.length <= 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddScoreDetail}
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm điểm
                </Button>
              </div>
              
              <DialogFooter>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Xóa điểm */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa điểm này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedScore && (
            <div className="py-4">
              <p className="mb-2">Thông tin điểm sẽ bị xóa:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Học sinh: <span className="font-semibold">{selectedScore.student.name}</span></li>
                <li>Môn học: <span className="font-semibold">{selectedScore.subject.name}</span></li>
                <li>Điểm trung bình: <span className="font-semibold">{selectedScore.average_score}</span></li>
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 