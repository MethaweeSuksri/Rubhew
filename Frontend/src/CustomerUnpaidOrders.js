import React, { useState, useEffect } from 'react';
import './css/home.css';

const CustomerUnpaidOrders = () => {
  // State สำหรับขยายรายละเอียดและเก็บคำสั่งซื้อที่เลือก
  const [expandedPost, setExpandedPost] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State สำหรับเก็บรายการ unpaid/paid, loading และ error
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันดึงรายละเอียด order ทีละรายการ (backend ส่ง { order: {...}, menus: [...] })
  const fetchOrderById = async (id) => {
    const response = await fetch(`/customer-unpaid-order/by?id=${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลรายการตาม ID ได้');
    }
    const data = await response.json();
    // backend ส่งกลับ { order: {...}, menus: [...] }
    return data.order ? { ...data.order, menus: data.menus || [] } : null;
  };

  // ฟังก์ชันคลิกดู/ย่อรายละเอียด
  const toggleDetails = async (orderKey) => {
    if (loadingDetail) return; // ป้องกันการคลิกซ้ำขณะโหลด
    if (expandedPost === orderKey) {
      setExpandedPost(null);
      setSelectedOrder(null);
      return;
    }
    try {
      setLoadingDetail(true);
      const id = orderKey.split('-')[1];
      const detail = await fetchOrderById(id);
      setSelectedOrder(detail);
      setExpandedPost(orderKey);
    } catch (err) {
      setError(err.message);
      setSelectedOrder(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ย้าย fetchOrders ออกมาอยู่นอก useEffect
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/customer-unpaid-order', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      }
      const data = await response.json();
      setUnpaidOrders(data.customerUnpaidOrder || []);
      setPaidOrders(data.customerPaidOrder || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // คำนวณราคารวมของเมนู (ถ้ามี)
  const calculateTotalPrice = (menus) => {
    if (!menus || menus.length === 0) return 0;
    return menus.reduce((sum, item) => sum + item.price * item.count, 0);
  };

  // แสดงรายการแต่ละกลุ่ม (unpaid หรือ paid) พร้อมเมนูและราคา
  const renderOrders = (orders, isPaid) => (
    <div className="Post-container">
      {orders.map((order) => {
        const orderKey = `${isPaid}-${order._id}`;
        const isExpanded = expandedPost === orderKey;

        return (
          <div
            key={order._id}
            className="Post-box"
            onClick={() => toggleDetails(orderKey)}
            style={{ cursor: 'pointer' }}
          >
            <h3>Order #{order._id}</h3>

            {isExpanded ? (
              loadingDetail ? (
                <div>กำลังโหลดรายละเอียด...</div>
              ) : selectedOrder && selectedOrder._id === order._id ? (
                <div className="expanded-content">
                  <p><strong>ผู้รับหิ้ว:</strong> {selectedOrder.studentId_rider}</p>
                  <p><strong>โอนที่:</strong> {selectedOrder.paymentMethod}</p>
                  <h4>รายการที่สั่ง:</h4>
                  {selectedOrder.menus && selectedOrder.menus.length > 0 ? (
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>รายการ</th>
                          <th>จำนวน</th>
                          <th>ราคา (บาท)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.menus.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.count}</td>
                            <td>{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            ราคารวมทั้งหมด
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            {calculateTotalPrice(selectedOrder.menus)} บาท
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p>ไม่มีรายการอาหาร</p>
                  )}

                  <p><strong>หมายเหตุ:</strong> {selectedOrder.description || '-'}</p>
                  <p><strong>สถานะการจัดส่ง:</strong> {selectedOrder.delivery_status}</p>
                  <p>
                    <strong>สถานะการชำระเงิน:</strong>{' '}
                    <span
                      className={
                        selectedOrder.paid_status === 'unpaid' ? 'status-pending' : 'status-paid'
                      }
                    >
                      {selectedOrder.paid_status}
                    </span>
                  </p>
                  {selectedOrder.paid_status === 'pending' && (
                    <button
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        fontFamily: 'Kanit, sans-serif',
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch('/paid', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ orderId: selectedOrder._id })
                          });
                          if (!res.ok) throw new Error('ยืนยันรับเงินไม่สำเร็จ');
                          alert('ยืนยันรับเงินสำเร็จ');
                          await fetchOrders();
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    >
                      ยืนยันรับเงิน
                    </button>
                  )}
                </div>
              ) : (
                <div>ไม่พบข้อมูล</div>
              )
            ) : (
              <div className="postDetail">
                <p><strong>ผู้รับหิ้ว:</strong> {order.studentId_rider}</p>
                <p><strong>โอนที่:</strong> {order.paymentMethod}</p>
                <p><strong>สถานะการจัดส่ง:</strong> {order.delivery_status}</p>
                <p>
                  <strong>สถานะการชำระเงิน:</strong>{' '}
                  <span
                    className={ order.paid_status === 'unpaid' ? 'status-pending' : 'status-paid' }
                  >
                    {order.paid_status}
                  </span>
                </p>
                
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ถ้ายังโหลดไม่เสร็จ
  if (loading) return <p>กำลังโหลดคำสั่งซื้อ...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <section className="Post-section">
      <h2>รายการที่ลูกค้ายังไม่ชำระเงิน</h2>
      {renderOrders(unpaidOrders, 'unpaid')}

      <h2>รายการที่ชำระเงินแล้ว</h2>
      {renderOrders(paidOrders, 'paid')}
    </section>
  );
};

export default CustomerUnpaidOrders;
