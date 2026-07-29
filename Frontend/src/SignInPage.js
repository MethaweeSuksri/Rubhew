import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/login.css';

function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const userData = {
      username: formData.get('username'),
      password: formData.get('password'),
      studentId: formData.get('studentId'), // Now treated as text
      paymentMethod: formData.get('paymentMethod'),
      email: formData.get('email'),
      department: formData.get('department'),
      phone: formData.get('phone'),
    };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'เกิดข้อผิดพลาดในการสมัคร';
        try {
          const data = await response.clone().json();
          errorMessage = data.message || errorMessage;
        } catch (_) {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      alert('สมัครสมาชิกสำเร็จ!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>SIGN IN</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="signin-form">
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          <input type="text" name="studentId" placeholder="เลขทะเบียนนักศึกษา" required />
          <input type="text" name="paymentMethod" placeholder="เลขบัญชี / prompay" required />
          <input type="email" name="email" placeholder="อีเมล" required />
          <select name="department" required>
            <option value="">-- กรุณาเลือกคณะ --</option>
            <option value="คณะนิติศาสตร์">คณะนิติศาสตร์</option>
            <option value="คณะพาณิชยศาสตร์และการบัญชี">คณะพาณิชยศาสตร์และการบัญชี</option>
            <option value="คณะสังคมวิทยาและมานุษยวิทยา">คณะสังคมวิทยาและมานุษยวิทยา</option>
            <option value="คณะรัฐศาสตร์">คณะรัฐศาสตร์</option>
            <option value="คณะเศรษฐศาสตร์">คณะเศรษฐศาสตร์</option>
            <option value="คณะสังคมสงเคราะห์ศาสตร์">คณะสังคมสงเคราะห์ศาสตร์</option>
            <option value="คณะศิลปศาสตร์">คณะศิลปศาสตร์</option>
            <option value="คณะวารสารศาสตร์และสื่อสารมวลชน">คณะวารสารศาสตร์และสื่อสารมวลชน</option>
            <option value="คณะวิทยาศาสตร์และเทคโนโลยี">คณะวิทยาศาสตร์และเทคโนโลยี</option>
            <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
            <option value="คณะแพทยศาสตร์">คณะแพทยศาสตร์</option>
            <option value="คณะสหเวชศาสตร์">คณะสหเวชศาสตร์</option>
            <option value="คณะทันตแพทยศาสตร์">คณะทันตแพทยศาสตร์</option>
            <option value="คณะพยาบาลศาสตร์">คณะพยาบาลศาสตร์</option>
            <option value="คณะสาธารณสุขศาสตร์">คณะสาธารณสุขศาสตร์</option>
            <option value="คณะเภสัชศาสตร์">คณะเภสัชศาสตร์</option>
            <option value="คณะวิทยาการเรียนรู้และศึกษาศาสตร์">คณะวิทยาการเรียนรู้และศึกษาศาสตร์</option>
            <option value="วิทยาลัยสหวิทยาการ">วิทยาลัยสหวิทยาการ</option>
          </select>
          <input type="tel" name="phone" placeholder="เบอร์โทรศัพท์" required />
          <button type="submit" disabled={loading}>
            {loading ? 'กำลังสมัคร...' : 'Sign In'}
          </button>
        </form>
        <div className="goto-login">
          <p><Link to="/login" className="sign-in">ย้อนกลับ</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;