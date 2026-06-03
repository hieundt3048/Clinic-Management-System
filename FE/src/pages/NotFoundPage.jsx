import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center my-10">
      <h1 className="text-4xl font-bold">404 - Không tìm thấy trang</h1>
      <p className="mt-4">Trang bạn đang tìm kiếm không tồn tại.</p>
      <Link to="/" className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
