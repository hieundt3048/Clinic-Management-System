import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, mapAuthResponse, getMyHealthProfile, getMyDoctorProfile } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser(formData);
      const user = mapAuthResponse(data);

      // Lưu token trước để interceptor đính vào các request lấy profile.
      localStorage.setItem('token', user.accessToken);

      if (user.role === 'PATIENT' && !user.patientId) {
        try {
          const profileRes = await getMyHealthProfile();
          user.patientId = profileRes.patientId;
        } catch {
          // Vẫn cho đăng nhập; các trang bệnh nhân sẽ báo thiếu hồ sơ nếu cần.
        }
      }

      if (user.role === 'DOCTOR' && !user.doctorId) {
        try {
          const profileRes = await getMyDoctorProfile();
          user.doctorId = profileRes.doctorId;
        } catch {
          // Vẫn cho đăng nhập; các trang bác sĩ sẽ báo lỗi tải dữ liệu nếu cần.
        }
      }

      localStorage.setItem('user', JSON.stringify(user));
      setMessage('Đăng nhập thành công!');
      onLogin(user);

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`Lỗi: ${error.response.data.message || 'Sai tên đăng nhập hoặc mật khẩu'}`);
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
              <button className="py-2 px-6 bg-blue-600 text-white rounded-full">Đăng nhập</button>
              <button onClick={() => navigate('/register')} className="py-2 px-6 text-gray-600 rounded-full ml-2">Đăng ký</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Trang đăng nhập</h2>
            
            {message && <p className="text-center text-red-500 mb-4">{message}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Số điện thoại hoặc Email *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </span>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="username"
                    type="text"
                    placeholder="Số điện thoại hoặc Email"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Mật khẩu *
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </span>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <span 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="ml-2 text-sm text-gray-700">Lưu đăng nhập</span>
                </label>
                <a href="#" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                  Quên mật khẩu?
                </a>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-8 rounded-full focus:outline-none focus:shadow-outline w-full"
                  type="submit"
                >
                  Đăng nhập
                </button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">hoặc</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="flex items-center justify-center">
                <Link to="/register"
                  className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-100 font-bold py-2 px-8 rounded-full focus:outline-none focus:shadow-outline w-full text-center"
                >
                  Đăng ký tài khoản mới
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

