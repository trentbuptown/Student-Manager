'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { changePassword } from '@/services/auth.service';
import { role } from '@/lib/data';

interface ChangePasswordModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ userId, isOpen, onClose }: ChangePasswordModalProps) => {
  const isAdmin = role === 'admin';
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!isAdmin && !formData.current_password) {
      newErrors.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const passwordData = isAdmin ? {
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation,
        is_admin: true,
        user_id: userId
      } : {
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation
      };
      
      const response = await changePassword(passwordData);
      
      toast.success('Thay đổi mật khẩu thành công');
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      onClose();
    } catch (error: any) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const serverErrors = error.response.data.errors;
          const formattedErrors: Record<string, string> = {};
          
          Object.keys(serverErrors).forEach(key => {
            formattedErrors[key] = serverErrors[key][0];
          });
          
          setErrors(formattedErrors);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Có lỗi xảy ra khi thay đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thay đổi mật khẩu</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isAdmin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="current_password">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.current_password ? 'border-red-500' : ''
                }`}
              />
              {errors.current_password && (
                <p className="text-red-500 text-xs italic">{errors.current_password}</p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new_password">
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.new_password ? 'border-red-500' : ''
              }`}
            />
            {errors.new_password && (
              <p className="text-red-500 text-xs italic">{errors.new_password}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new_password_confirmation">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="new_password_confirmation"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.new_password_confirmation ? 'border-red-500' : ''
              }`}
            />
            {errors.new_password_confirmation && (
              <p className="text-red-500 text-xs italic">{errors.new_password_confirmation}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 