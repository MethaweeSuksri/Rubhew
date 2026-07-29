import React, { useEffect, useState } from 'react';
import './css/UserProfile.css'; 
import student_pic from './student.png';

const UserProfile = () => {
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

    return (
        <div className="UserProfile-container">
            <header className="UserProfile-header">
                <div className="UserProfile-header-left">
                    <button className="UserProfile-back-button" onClick={() => window.history.back()}>
                        ← ย้อนกลับ
                    </button>
                </div>
                <div className="UserProfile-header-right">
                    <h2>โปรไฟล์ผู้ใช้</h2>
                </div>
            </header>
            <main className="UserProfile-main">
                <div className="UserProfile-details">
                    <img 
                        src={student_pic} 
                        className="user-pic" 
                        alt="User Profile" 
                    />
                    <p><strong>ชื่อผู้ใช้:</strong> {user.username}</p>
                    <p><strong>รหัสนักศึกษา:</strong> {user.studentId}</p>
                    <p><strong>คณะ:</strong> {user.department}</p>
                    <p><strong>อีเมล:</strong> {user.email}</p>
                    <p><strong>เบอร์โทร:</strong> {user.phone}</p>
                    <p><strong>วิธีจ่าย:</strong>{user.paymentMethod}</p>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;