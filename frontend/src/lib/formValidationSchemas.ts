import { date, z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập tên môn học." }),
    teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Vui lòng nhập tên môn học." }),
    capacity: z.coerce.number().min(1, { message: "Vui lòng nhập số lượng." }),
    gradeId: z.union([z.literal(10), z.literal(11), z.literal(12)], {
        message: "Vui lòng chọn khối lớp.",
    }),
    supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Tên người dùng phải chứa ít nhất 4 ký tự. " })
        .max(20, { message: "Tên người dùng không được vượt quá 20 ký tự." }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải chứa ít nhất 8 ký tự. " })
        .optional()
        .or(z.literal("")),
    firstName: z.string().min(1, { message: "Vui lòng nhập tên." }),
    lastName: z.string().min(1, { message: " Vui lòng nhập họ." }),
    email: z
        .string()
        .email({ message: "Email không hợp lệ." })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    birthday: z.coerce.date({ message: "Vui lòng nhập ngày sinh." }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Vui lòng chọn giới tính." }),
    subjects: z.array(z.coerce.number()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Tên người dùng phải chứa ít nhất 4 ký tự. " })
        .max(20, { message: "Tên người dùng không được vượt quá 20 ký tự." }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải chứa ít nhất 8 ký tự. " })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "Vui lòng nhập tên." }),
    surname: z.string().min(1, { message: " Vui lòng nhập họ." }),
    email: z
        .string()
        .email({ message: "Email không hợp lệ." })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    birthday: z.coerce.date({ message: "Vui lòng nhập ngày sinh." }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Vui lòng nhập giới tính." }),
    gradeId: z.union([z.literal(10), z.literal(11), z.literal(12)], {
        message: "Vui lòng chọn khối lớp.",
    }),
    classId: z.coerce.number().min(1, { message: "Vui lòng nhập lớp." }),
    parentId: z.string().min(1, { message: "Vui lòng nhập tên phụ huynh." }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

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
