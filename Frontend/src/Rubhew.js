import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';




const Rubhew = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const formData = new FormData(e.target);

  const deliveryData = {
    availablefororder: parseInt(formData.get('maxItems')),
    sendfrom: formData.get('pickupLocation'),
    sendto: formData.get('deliveryLocation'),
    rateInit: parseFloat(formData.get('baseFee')),
    ratePer: parseFloat(formData.get('perItemFee')),
  };

  try {
    const response = await fetch('/rubhew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryData),
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = 'เกิดข้อผิดพลาดในการส่งข้อมูล';
      try {
        const data = await response.clone().json();
        errorMessage = data.message || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    alert('ส่งข้อมูลเรียบร้อยแล้ว!');
    e.target.reset();


  } catch (err) {
    setError(err.message || 'เกิดข้อผิดพลาด');
  } finally {
    setLoading(false);
  }
};


  return (
    <section className='Post-section'>
      <form className="Delivery-form" onSubmit={handleSubmit}>
        <h2>ฉันจะรับหิ้วที่</h2>
        <select name="pickupLocation" required>
          <option value="">-- กรุณาเลือกสถานที่ --</option>
          <option value="Green Canteen">Green Canteen</option>
          <option value="TewSone Canteen">TewSone Canteen</option>
          <option value="SC Canteen">SC Canteen</option>
          <option value="JC Canteen">JC Canteen</option>
          <option value="Chaeng Rak 1">Chaeng Rak 1</option>
          <option value="Chaeng Rak 2">Chaeng Rak 2</option>
        </select>

        <h2>ฉันสามารถจัดส่งได้ที่</h2>
        <select name="deliveryLocation" required>
          <option value="">-- กรุณาเลือกสถานที่จัดส่ง --</option>
          <option value="domeAB">Dormitory Zone A-B</option>
          <option value="domeC">Dormitory Zone C</option>
          <option value="domeEF">Dormitory Zone F-M</option>
          <option value="domeOut">Off-campus Dormitory</option> 
        </select>

        <h2>ฉันจะรับหิ้วจำนวน</h2>
        <input type="number" name="maxItems" min="1" placeholder="จำนวนที่รับหิ้ว" required />

        <h2>ฉันจะคิดค่าส่ง</h2>
        <div className="Shipping-fee">
          <label>
            <strong>เริ่มต้น:</strong>
            <input type="number" name="baseFee" min="0" placeholder="เช่น 20" required />
          </label>
          <label>
            <strong>ต่อชิ้น:</strong>
            <input type="number" name="perItemFee" min="0" placeholder="เช่น 5" required />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'กำลังส่งข้อมูล...' : 'รับหิ้ว!'}
        </button>
      </form>
    </section>
  );
};

export default Rubhew;