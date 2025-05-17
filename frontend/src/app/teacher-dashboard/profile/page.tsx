'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaBook, FaChalkboardTeacher, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { getUser, isTeacher } from '@/utils/auth';
import { getTeacherById, updateTeacher } from '@/services/teacherService';
import toast from 'react-hot-toast';

interface TeacherProfile {
  id: number;
  name: string;
  specialization: string;
  is_gvcn: boolean;
  phone?: string;
  address?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    birthday?: string;
    sex?: 'MALE' | 'FEMALE';
    profile_photo?: string;
  };
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    specialization: '',
    email: ''
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();
      
      if (!userData) {
        router.replace('/sign-in');
        return;
      }
      
      if (!isTeacher()) {
        router.replace('/');
        return;
      }

      try {
        if (userData.teacher && userData.teacher.id) {
          // Lấy thông tin chi tiết giáo viên
          const teacherDetails = await getTeacherById(userData.teacher.id);
          if (teacherDetails) {
            setProfile(teacherDetails);
            setFormData({
              name: teacherDetails.name || '',
              phone: teacherDetails.phone || '',
              address: teacherDetails.address || '',
              specialization: teacherDetails.specialization || '',
              email: teacherDetails.user?.email || ''
            });
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin giáo viên:', error);
        toast.error('Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        specialization: formData.specialization,
        user: {
          email: formData.email
        }
      };
      
      const updatedTeacher = await updateTeacher(profile.id, updateData);
      if (updatedTeacher) {
        setProfile(updatedTeacher);
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toast.error('Không thể cập nhật thông tin');
    }
  };

  const formatSex = (sex?: string) => {
    if (sex === 'MALE') return 'Nam';
    if (sex === 'FEMALE') return 'Nữ';
    return 'Không xác định';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Không tìm thấy thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit />
            <span>Chỉnh sửa</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaSave />
              <span>Lưu</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profile.name || '',
                  phone: profile.phone || '',
                  address: profile.address || '',
                  specialization: profile.specialization || '',
                  email: profile.user?.email || ''
                });
              }}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaTimes />
              <span>Hủy</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {profile.user?.profile_photo ? (
                <img
                  src={profile.user.profile_photo}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="w-16 h-16 text-blue-500" />
              )}
            </div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">Giáo viên</p>
            
            <div className="mt-4 w-full">
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-500">Chuyên môn</p>
                <p className="font-medium">{profile.specialization}</p>
              </div>
              
              {profile.is_gvcn && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Vai trò</p>
                  <p className="font-medium text-green-700">Giáo viên chủ nhiệm</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-lg font-medium mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <FaUser className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaEnvelope className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.user?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaPhone className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{profile.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaMapMarkerAlt className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">{profile.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                {profile.user?.birthday && (
                  <div className="flex items-start">
                    <FaCalendarAlt className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày sinh</p>
                      <p className="font-medium">{profile.user.birthday}</p>
                    </div>
                  </div>
                )}
                
                {profile.user?.sex && (
                  <div className="flex items-start">
                    <FaUser className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Giới tính</p>
                      <p className="font-medium">{formatSex(profile.user.sex)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FaBook className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Chuyên môn</p>
                    <p className="font-medium">{profile.specialization}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaChalkboardTeacher className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <p className="font-medium">{profile.is_gvcn ? 'Giáo viên chủ nhiệm' : 'Giáo viên bộ môn'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 