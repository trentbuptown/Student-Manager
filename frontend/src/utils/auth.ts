// Lưu token vào localStorage
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Lấy token từ localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Xóa token khi đăng xuất
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Lưu thông tin người dùng
export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Lấy thông tin người dùng
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

// Kiểm tra xem người dùng có phải là giáo viên không
export const isTeacher = (): boolean => {
  const user = getUser();
  return user && user.teacher;
};

// Kiểm tra xem người dùng có phải là học sinh không
export const isStudent = (): boolean => {
  const user = getUser();
  return user && user.student;
};

// Kiểm tra xem người dùng có phải là admin không
export const isAdmin = (): boolean => {
  const user = getUser();
  return user && user.admin;
}; 