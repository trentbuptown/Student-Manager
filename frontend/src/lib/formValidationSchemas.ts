import { date, z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập tên môn học." }),
    code: z.string().optional(),
    description: z.string().optional(),
    teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập tên lớp học." }),
    capacity: z.coerce.number().optional(),
    gradeId: z.coerce.number({ message: "Vui lòng chọn khối lớp" }),
    supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập họ và tên giáo viên." }),
    specialization: z.string().min(1, { message: "Vui lòng nhập chuyên môn." }),
    is_gvcn: z.boolean().or(z.enum(["true", "false"])),
    user_id: z.number().optional(),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    user_name: z.string().min(1, { message: "Vui lòng nhập tên hiển thị." }),
    email: z.string().email({ message: "Email không hợp lệ." }),
    username: z.string().optional().or(z.literal("")),
    password: z.string().min(8, { message: "Mật khẩu phải chứa ít nhất 8 ký tự." }).optional(),
    birthday: z.string().optional().or(z.literal("")),
    sex: z.enum(["MALE", "FEMALE"], { message: "Vui lòng chọn giới tính." }),
    profile_photo: z.string().optional().or(z.literal("")),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập họ và tên đầy đủ của học sinh"),
    birth_date: z.string().min(1, "Vui lòng chọn ngày sinh"),
    gender: z.enum(["male", "female", "other"], { message: "Vui lòng chọn giới tính" }),
    phone: z.string().optional(),
    class_id: z.coerce.number().min(1, "Vui lòng chọn lớp học"),
    email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").optional(),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").optional(),
    id: z.number().optional(),
    user_id: z.number().optional()
});

export type StudentFormData = z.infer<typeof studentSchema>;

export const examSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Vui lòng nhập tên kỳ thi." }),
    date: z.coerce.date({ message: "Vui lòng nhập ngày kiểm tra." }),
    startTime: z.coerce.date({ message: "Vui lòng nhập thời gian bắt đầu." }),
    lessonId: z.coerce.number({ message: "Vui lòng nhập tên bài." }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const reportSchema = z.object({
    classId: z.string().min(1, { message: "Vui lòng nhập tên lớp." }),
    studentId: z.string().min(1, { message: "Vui lòng nhập tên học sinh." }),
    subjectId: z.string().min(1, { message: "Vui lòng nhập tên môn học." }),
    semester: z.union([z.literal(1), z.literal(2)], {
        message: "Vui lòng chọn học kỳ.",
    }),
    year: z
        .string()
        .regex(/^\d{4}-\d{4}$/, { message: "Năm học phải có dạng YYYY-YYYY." }),
    fifteenMinExam: z
        .number()
        .min(0, { message: "Điểm phải từ 0 đến 10." })
        .max(10, { message: "Điểm phải từ 0 đến 10." }),
    midtermExam: z
        .number()
        .min(0, { message: "Điểm phải từ 0 đến 10." })
        .max(10, { message: "Điểm phải từ 0 đến 10." }),
    finalExam: z
        .number()
        .min(0, { message: "Điểm phải từ 0 đến 10." })
        .max(10, { message: "Điểm phải từ 0 đến 10." }),
    average: z
        .number()
        .min(0, { message: "Điểm phải từ 0 đến 10." })
        .max(10, { message: "Điểm phải từ 0 đến 10." }),
    behavior: z.string().min(1, { message: "Vui lòng nhập xếp loại." }),
});

export type ReportSchema = z.infer<typeof reportSchema>;
