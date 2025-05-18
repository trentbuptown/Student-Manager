"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { teachersData } from "@/lib/data";
import Image from "next/image";
import subjectService, { Teacher, Subject } from '@/services/subjectService';
import { getAllTeachers, Teacher as TeacherInterface } from '@/services/teacherService';
import { FaSearch, FaTimes, FaChevronDown, FaTrash } from 'react-icons/fa';

const SubjectForm = ({
    type,
    data,
    onSuccess
}: {
    type: "create" | "update";
    data?: any;
    onSuccess?: () => void;
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teachersList, setTeachersList] = useState<TeacherInterface[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Thêm các state mới để xử lý chức năng chọn môn học đã tạo
    const [existingSubjects, setExistingSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [chooseExisting, setChooseExisting] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
    const subjectDropdownRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: data
            ? {
                  id: data.id,
                  name: data.name,
                  teachers: data.teachers,
                  code: data.code,
                  description: data.description,
              }
            : undefined,
    });

    const watchTeachers = watch("teachers", []);

    useEffect(() => {
        if (data?.teachers) {
            setSelectedTeachers(Array.isArray(data.teachers) 
                ? data.teachers.map((t: any) => typeof t === 'object' ? t.id.toString() : t.toString())
                : [data.teachers.toString()]
            );
            setValue('teachers', Array.isArray(data.teachers) 
                ? data.teachers.map((t: any) => typeof t === 'object' ? t.id.toString() : t.toString())
                : [data.teachers.toString()]
            );
        }
    }, [data, setValue]);

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoadingTeachers(true);
            const fetchedTeachers = await getAllTeachers();
            setTeachersList(fetchedTeachers);
            setLoadingTeachers(false);
        };
        fetchTeachers();

        // Lấy danh sách môn học đã tạo
        const fetchSubjects = async () => {
            if (type === "create") { // Chỉ fetch khi tạo mới, không cần khi update
                setLoadingSubjects(true);
                try {
                    const subjects = await subjectService.getAll();
                    setExistingSubjects(subjects);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách môn học:", error);
                    toast.error("Không thể tải danh sách môn học");
                } finally {
                    setLoadingSubjects(false);
                }
            }
        };
        fetchSubjects();
    }, [type]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
                setSubjectDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredTeachers = teachersList.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTeacherSelect = (teacherId: string) => {
        const newSelectedTeachers = selectedTeachers.includes(teacherId)
            ? selectedTeachers.filter(id => id !== teacherId)
            : [...selectedTeachers, teacherId];
        
        setSelectedTeachers(newSelectedTeachers);
        setValue('teachers', newSelectedTeachers);
    };

    const handleRemoveTeacher = (teacherId: string) => {
        const newSelectedTeachers = selectedTeachers.filter(id => id !== teacherId);
        setSelectedTeachers(newSelectedTeachers);
        setValue('teachers', newSelectedTeachers);
    };

    const getTeacherNameById = (id: string) => {
        const teacher = teachersList.find(t => t.id.toString() === id);
        return teacher ? teacher.name : '';
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Xử lý khi chọn một môn học có sẵn
    const handleSelectExistingSubject = (subject: Subject) => {
        setSelectedSubject(subject);
        setSubjectDropdownOpen(false);
        
        // Cập nhật form với thông tin của môn học đã chọn
        reset({
            name: subject.name,
            code: subject.code || '',
            description: subject.description || '',
            teachers: subject.teachers?.map(t => t.id.toString()) || []
        });
        
        // Cập nhật selected teachers
        setSelectedTeachers(subject.teachers?.map(t => t.id.toString()) || []);
    };

    // Toggle giữa tạo mới và chọn môn học có sẵn
    const toggleChooseExisting = () => {
        // Reset form khi chuyển đổi mode
        reset({
            name: '',
            code: '',
            description: '',
            teachers: []
        });
        setSelectedTeachers([]);
        setSelectedSubject(null);
        setChooseExisting(!chooseExisting);
    };

    const onSubmit = handleSubmit(async (formData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log("===== FORM DATA BEING SUBMITTED =====");
            console.log("Form data:", formData);
            console.log("Type:", type);
            console.log("Selected teachers:", selectedTeachers);

            // Ensure formData.teachers has the correct values from selectedTeachers
            const teachersToUse = selectedTeachers.length > 0 ? selectedTeachers : 
                                (formData.teachers ? (Array.isArray(formData.teachers) ? formData.teachers : [formData.teachers]) : []);

            // Chuyển đổi mảng ID giáo viên thành mảng đối tượng Teacher
            const selectedTeachersObjects = teachersToUse.map(id => {
                const teacher = teachersList.find(t => t.id.toString() === id.toString());
                return {
                    id: teacher?.id || id,
                    name: teacher?.name || ''
                };
            });

            console.log("Teachers objects:", selectedTeachersObjects);

            // Nếu đang ở chế độ cập nhật
            if (type === 'update') {
                console.log("Updating subject with ID:", formData.id);
                const updatePayload = {
                    name: formData.name,
                    code: formData.code || '',
                    description: formData.description || '',
                    teachers: selectedTeachersObjects,
                };
                
                console.log("Update payload:", updatePayload);
                
                try {
                    const result = await subjectService.update(Number(formData.id), updatePayload);
                    console.log("Update result:", result);
                    
                    toast.success("Cập nhật môn học thành công");
                    
                    if (onSuccess) {
                        console.log('onSuccess called from SubjectForm');
                        onSuccess();
                    }
                    
                    // Tải lại trang để hiển thị dữ liệu mới nhất
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                    
                    return; // Thoát khỏi hàm sau khi cập nhật thành công
                } catch (updateError) {
                    console.error("Error in update API call:", updateError);
                    throw updateError;
                }
            } 
            // Nếu đang ở chế độ tạo mới và không chọn từ danh sách có sẵn
            else if (type === 'create' && !chooseExisting) {
                await subjectService.create({
                    name: formData.name,
                    code: formData.code || '',
                    description: formData.description || '',
                    teachers: selectedTeachersObjects,
                });
                
                toast.success("Tạo môn học thành công");
                
                if (onSuccess) {
                    console.log('onSuccess called from SubjectForm');
                    onSuccess();
                }
                
                window.location.replace('/list/subjects');
            } 
            // Nếu đang ở chế độ tạo mới và chọn từ danh sách có sẵn
            else if (type === 'create' && chooseExisting && selectedSubject) {
                // Nếu người dùng đã thay đổi giáo viên, cập nhật môn học hiện có
                if (JSON.stringify(selectedSubject.teachers?.map(t => t.id.toString()).sort()) !== 
                    JSON.stringify([...selectedTeachers].sort())) {
                    if (selectedSubject.id !== undefined) {
                        await subjectService.update(Number(selectedSubject.id), {
                            name: selectedSubject.name,  // Giữ nguyên tên
                            code: selectedSubject.code || '',  // Giữ nguyên mã
                            description: selectedSubject.description || '',  // Giữ nguyên mô tả
                            teachers: selectedTeachersObjects,  // Chỉ cập nhật giáo viên
                        });
                    }
                }
                
                toast.success("Tạo môn học thành công");
                
                if (onSuccess) {
                    console.log('onSuccess called from SubjectForm');
                    onSuccess();
                }
                
                window.location.replace('/list/subjects');
            }
        } catch (err: any) {
            console.error("Error in form submission:", err);
            console.error("Error details:", err.response?.data);
            setError(err.response?.data?.message || "Something went wrong when submitting the form");
            toast.error(err.response?.data?.message || "Failed to process your request");
        } finally {
            setIsSubmitting(false);
        }
    });

    // Thêm hàm xử lý xóa môn học
    const handleDelete = async () => {
        if (!data || data.id === undefined) {
            console.error("Không tìm thấy ID môn học để xóa");
            toast.error("Không thể xóa môn học: Thiếu ID");
            return;
        }
        
        if (!window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
            return;
        }
        
        try {
            setIsDeleting(true);
            console.log(`Đang xóa môn học với ID: ${data.id}`);
            
            // Đảm bảo id là một số
            const subjectId = Number(data.id);
            
            await subjectService.delete(subjectId);
            toast.success("Đã xóa môn học thành công");
            
            // Thoát khỏi form và tải lại trang danh sách hoàn toàn
            console.log("Đang tải lại trang danh sách môn học...");
            
            // Sử dụng hard reload trang với URL mới
            setTimeout(() => {
                // Sử dụng window.location.replace thay vì router.push để tải lại trang hoàn toàn
                window.location.replace('/list/subjects');
            }, 1000);
        } catch (err: any) {
            console.error("Chi tiết lỗi xóa môn học:", err);
            console.error("URL request:", err.config?.url);
            console.error("Status:", err.response?.status);
            console.error("Response data:", err.response?.data);
            
            toast.error(err.response?.data?.message || "Không thể xóa môn học. Lỗi: " + (err.message || "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Image src="/adduser.png" alt="" width={40} height={40} />
                <h1 className="text-xl font-semibold">
                    {type === "create"
                        ? "Thêm môn học mới"
                        : "Chỉnh sửa môn học"}
                </h1>
            </div>
            </div>

            {type === "create" && (
                <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            className="form-radio h-4 w-4 text-blue-600"
                            checked={!chooseExisting}
                            onChange={toggleChooseExisting}
                        />
                        <span>Tạo môn học mới</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            className="form-radio h-4 w-4 text-blue-600"
                            checked={chooseExisting}
                            onChange={toggleChooseExisting}
                        />
                        <span>Chọn từ danh sách môn học đã tạo</span>
                    </label>
                </div>
            )}

            {type === "create" && chooseExisting ? (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Chọn môn học</label>
                        {loadingSubjects ? (
                            <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải danh sách môn học...</div>
                        ) : (
                            <div className="relative" ref={subjectDropdownRef}>
                                <div 
                                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full flex justify-between items-center cursor-pointer"
                                    onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                                >
                                    <span>{selectedSubject ? selectedSubject.name : 'Chọn môn học'}</span>
                                    <FaChevronDown className={`text-gray-400 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                                </div>
                                
                                {subjectDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                        {existingSubjects.length > 0 ? (
                                            existingSubjects.map((subject) => (
                                                <div
                                                    key={`subject-${subject.id}`}
                                                    className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                                                        selectedSubject?.id === subject.id ? 'bg-blue-50' : ''
                                                    }`}
                                                    onClick={() => handleSelectExistingSubject(subject)}
                                                >
                                                    <div className="font-medium">{subject.name}</div>
                                                    {subject.code && <div className="text-xs text-gray-500">Mã: {subject.code}</div>}
                                                    {subject.teachers && subject.teachers.length > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            Giáo viên: {subject.teachers.map(t => t.name).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500">Không có môn học nào</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {selectedSubject && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-md">
                                <h3 className="font-medium text-blue-700 mb-2">Thông tin môn học đã chọn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Tên môn học:</p>
                                        <p className="text-sm">{selectedSubject.name}</p>
                                    </div>
                                    {selectedSubject.code && (
                                        <div>
                                            <p className="text-sm font-medium">Mã môn học:</p>
                                            <p className="text-sm">{selectedSubject.code}</p>
                                        </div>
                                    )}
                                    {selectedSubject.description && (
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium">Mô tả:</p>
                                            <p className="text-sm">{selectedSubject.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-medium text-blue-700 mb-2">Chọn giáo viên cho môn học</h3>
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-xs text-gray-500">Giáo viên</label>
                                    {loadingTeachers ? (
                                        <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải giáo viên...</div>
                                    ) : (
                                        <div className="relative" ref={dropdownRef}>
                                            {/* Selected teachers display */}
                                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                                                {selectedTeachers.map(teacherId => (
                                                    <div 
                                                        key={`selected-teacher-${teacherId}`}
                                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                                                    >
                                                        {getTeacherNameById(teacherId)}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveTeacher(teacherId)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Search input with dropdown toggle */}
                                            <div className="relative">
                                                <div className="flex items-center ring-[1.5px] ring-gray-300 rounded-md overflow-hidden">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaSearch className="text-gray-400" size={14} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="p-2 pl-10 text-sm w-full focus:outline-none"
                                                        placeholder="Tìm giáo viên..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onFocus={() => setIsDropdownOpen(true)}
                                                    />
                                                    <button 
                                                        type="button"
                                                        className="px-2 bg-gray-50 h-full border-l border-gray-300 flex items-center"
                                                        onClick={toggleDropdown}
                                                    >
                                                        <FaChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Dropdown list */}
                                            {isDropdownOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                                    {filteredTeachers.length > 0 ? (
                                                        filteredTeachers.map((teacher) => (
                                                            <div
                                                                key={`teacher-dropdown-${teacher.id}`}
                                                                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                                    selectedTeachers.includes(teacher.id.toString()) ? 'bg-blue-50' : ''
                                                                }`}
                                                                onClick={() => handleTeacherSelect(teacher.id.toString())}
                                                            >
                                                                <span>{teacher.name}</span>
                                                                {selectedTeachers.includes(teacher.id.toString()) && (
                                                                    <span className="text-blue-600">✓</span>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-gray-500">Không tìm thấy giáo viên</div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Hidden select for form validation */}
                                            <select
                                                multiple
                                                className="hidden"
                                                {...register("teachers")}
                                            >
                                                {teachersList.map((teacher) => (
                                                    <option value={teacher.id.toString()} key={`teacher-option-${teacher.id}`}>
                                                        {teacher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {errors.teachers?.message && (
                                        <p className="text-xs text-red-400">
                                            {errors.teachers.message.toString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Tên môn học"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />

                <InputField
                    label="Mã môn học"
                    name="code"
                    defaultValue={data?.code}
                    register={register}
                    error={errors?.code}
                />

                <InputField
                    label="Mô tả"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Giáo viên</label>
                    {loadingTeachers ? (
                        <div className="text-sm text-gray-600 h-10 flex items-center">Đang tải giáo viên...</div>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            {/* Selected teachers display */}
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                                {selectedTeachers.map(teacherId => (
                                    <div 
                                        key={`selected-teacher-${teacherId}`}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                                    >
                                        {getTeacherNameById(teacherId)}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTeacher(teacherId)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Search input with dropdown toggle */}
                            <div className="relative">
                                <div className="flex items-center ring-[1.5px] ring-gray-300 rounded-md overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        className="p-2 pl-10 text-sm w-full focus:outline-none"
                                        placeholder="Tìm giáo viên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                    />
                                    <button 
                                        type="button"
                                        className="px-2 bg-gray-50 h-full border-l border-gray-300 flex items-center"
                                        onClick={toggleDropdown}
                                    >
                                        <FaChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Dropdown list */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                    {filteredTeachers.length > 0 ? (
                                        filteredTeachers.map((teacher) => (
                                            <div
                                                key={`teacher-dropdown-${teacher.id}`}
                                                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                    selectedTeachers.includes(teacher.id.toString()) ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => handleTeacherSelect(teacher.id.toString())}
                                            >
                                                <span>{teacher.name}</span>
                                                {selectedTeachers.includes(teacher.id.toString()) && (
                                                    <span className="text-blue-600">✓</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">Không tìm thấy giáo viên</div>
                                    )}
                                </div>
                            )}
                            
                            {/* Hidden select for form validation */}
                            <select
                                multiple
                                className="hidden"
                                {...register("teachers")}
                            >
                                {teachersList.map((teacher) => (
                                    <option value={teacher.id.toString()} key={`teacher-option-${teacher.id}`}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {errors.teachers?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teachers.message.toString()}
                        </p>
                    )}
                </div>
            </div>
            )}

            {error && <span className="text-red-500">{error}</span>}

            <div className="flex justify-end">
            <button
                    className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors min-w-32"
                    disabled={isSubmitting || (chooseExisting && !selectedSubject)}
            >
                {isSubmitting
                    ? "Đang xử lý..."
                    : type === "create"
                        ? chooseExisting ? "Sử dụng môn học đã chọn" : "Thêm mới" 
                    : "Cập nhật"}
            </button>
            </div>
        </form>
    );
};

export default SubjectForm;
