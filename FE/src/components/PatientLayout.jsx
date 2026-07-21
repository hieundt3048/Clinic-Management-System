import React from 'react';

// PatientSidebar đã được render toàn cục trong App.jsx (qua Sidebar chính)
// PatientLayout giờ chỉ wrap nội dung trang
const PatientLayout = ({ children, pageTitle }) => {
  return (
    <div className="flex-1 overflow-auto bg-slate-100">
      {pageTitle && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
        </div>
      )}
      {children}
    </div>
  );
};

export default PatientLayout;
