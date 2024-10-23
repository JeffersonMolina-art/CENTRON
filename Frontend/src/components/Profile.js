import React from 'react';
import AdminComponent from './AdminComponent';
import EmployeeComponent from './EmployeeComponent';
const Profile = () => {
  const userRole = localStorage.getItem('role'); 

  return (
    <div>
      {userRole === 'admin' ? (
        <AdminComponent />
      ) : (
        <EmployeeComponent />
      )}
    </div>
  );
};

export default Profile;
