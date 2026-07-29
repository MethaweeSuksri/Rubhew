import React , { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import student_pic from './student.png';


const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null); 
      const [error, setError] = useState(null); 
  
      useEffect(() => {
          // Fetch
          const fetchUserProfile = async () => {
              try {
                  const response = await fetch('/profile', {
                      method: 'GET',
                      credentials: 'include', 
                  });
                  if (!response.ok) {
                      throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ใช้ได้');
                  }
                  const data = await response.json();
                  setUser(data);
              } catch (err) {
                  setError(err.message);
              }
          };
  
          fetchUserProfile();
      }, []);
  
      if (error) {
          return <div>Error: {error}</div>;
      }
  
      if (!user) {
          return <div>Loading...</div>;
      }

  const handleLogout = () => {
    navigate('/'); 
  };

  return (
    <div className="layout">
      <header className="Home-header">
        <div className="header-left">
          <button className="rubhew-button" onClick={() => navigate('/home')}>
            RubHew
          </button>
        </div>

        <div className="header-right">
          <div className="User-info">
            <p className="Username">ชื่อผู้ใช้: {user.username}</p>
            <p className="StudentID">รหัสนักศึกษา: {user.studentId}</p>
          </div>
          <img 
            src={student_pic} 
            className="user-pic" 
            alt="User" 
            onClick={() => navigate('/profile')} 
            style={{ cursor: 'pointer' }} 
          />
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="Nav-bar">
        <div><Link to="/order" className={location.pathname === '/order' ? 'active' : ''}>ดูประวัติ  รายการที่สั่งไป</Link></div>
        <div><Link to="/rubhew" className={location.pathname === '/rubhew' ? 'active' : ''}>รับหิ้วจ้า</Link></div>
        <div><Link to="/ordered" className={location.pathname === '/ordered' ? 'active' : ''}>ดูรายการต้องหิ้ว</Link></div>
        <div><Link to="/unpaid-orders" className={location.pathname === '/unpaid-orders' ? 'active' : ''}>รายการที่ฉันยังไม่ชำระเงิน</Link></div>
        <div><Link to="/customer-unpaid-orders" className={location.pathname === '/customer-unpaid-orders' ? 'active' : ''}>รายการที่ลูกค้ายังไม่ชำระเงิน</Link></div>
      </nav>


      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
