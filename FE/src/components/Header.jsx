import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const Header = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-500 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg">TTS CLINIC</div>
                <div className="text-xs">Chăm sóc tận tâm</div>
              </div>
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-white focus:border-white sm:text-sm"
                  placeholder="Tìm kiếm dịch vụ, bác sĩ, bệnh viện..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="relative p-1 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-500 focus:ring-white">
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                  <span>{user.name || 'Nguyễn Văn A'}</span>
                  <button onClick={onLogout} className="text-sm hover:underline">Đăng xuất</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-white text-blue-500 hover:bg-gray-100 font-bold py-2 px-4 rounded-full text-sm transition-colors">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
