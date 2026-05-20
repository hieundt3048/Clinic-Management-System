import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordChecklist = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[\W_]/.test(password),
  };

  const CheckItem = ({ text, checked }) => (
    <li className={`text-sm ${checked ? 'text-green-500' : 'text-red-500'}`}>
      {checked ? '✓' : '✗'} {text}
    </li>
  );

  return (
    <ul className="mt-2 list-none pl-0">
      <CheckItem text="Ít nhất 8 ký tự" checked={checks.length} />
      <CheckItem text="Ít nhất một chữ hoa" checked={checks.uppercase} />
      <CheckItem text="Ít nhất một chữ thường" checked={checks.lowercase} />
      <CheckItem text="Ít nhất một số" checked={checks.number} />
      <CheckItem text="Ít nhất một ký tự đặc biệt" checked={checks.specialChar} />
    </ul>
  );
};


const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Xóa thông báo lỗi cũ
    try {
      const response = await registerUser(formData);
      setMessage('Đăng ký thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        // Hiển thị lỗi cụ thể từ backend
        const errorDetails = Object.values(error.response.data.errors).join('; ');
        setMessage(errorDetails);
      } else if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Lỗi kết nối tới máy chủ.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg flex">
          
          <div className="w-1/2 hidden md:flex items-center justify-center p-8">
            <img src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg" alt="Doctor Illustration" className="max-w-full h-auto" />
          </div>

          
          <div className="w-full md:w-1/2 p-8 bg-blue-50 rounded-r-lg">
            <div className="flex justify-center mb-6">
              <button onClick={() => navigate('/login')} className="py-2 px-6 text-gray-600 rounded-full">Đăng nhập</button>
              <button className="py-2 px-6 bg-blue-600 text-white rounded-full ml-2">Đăng ký</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Trang đăng ký</h2>
            
            <form onSubmit={handleSubmit}>
              {/* ... form fields ... */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                  Họ và tên *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="fullName"
                  type="text"
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex -mx-2 mb-4">
                <div className="w-1/2 px-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
                    Ngày sinh *
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="dateOfBirth"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="w-1/2 px-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                    Giới tính *
                  </label>
                  <select
                    id="gender"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Khác</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Số điện thoại *
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  type="tel"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    style={{ top: '-8px' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {formData.password && <PasswordChecklist password={formData.password} />}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Nhập lại mật khẩu *
                </label>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                   <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    style={{ top: '-8px' }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              
              {message && <p className="text-center text-red-500 mb-4">{message}</p>}

              <div className="flex items-center justify-center">
                <button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-8 rounded-full focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
