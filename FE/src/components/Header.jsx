import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Header = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img className="h-10 w-10" src="https://tailwindui.com/img/logos/workflow-mark-white.svg" alt="Logo" />
              <span className="text-white text-xl font-bold">HealthCare</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-8 w-8 text-white"/>
                  <span className="text-white font-medium">Xin chào, {user.name}</span>
                </div>
                <button onClick={onLogout} className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-4 rounded-full text-sm transition-colors">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div>
                <Link to="/login" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-4 rounded-full text-sm transition-colors">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
