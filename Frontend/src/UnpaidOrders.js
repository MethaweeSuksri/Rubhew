import React, { useState, useEffect } from 'react';
import './css/home.css';

const UnpaidOrders = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันดึงรายละเอียด order ทีละรายการ
  const fetchOrderById = async (id) => {
    const response = await fetch(`/unpaid-order/by?id=${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลรายการตาม ID ได้');
    const data = await response.json();
    // backend ส่งกลับ { order: {...}, menus: [...] }
    return data.order ? { ...data.order, menus: data.menus || [] } : null;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/unpaid-order', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      const data = await response.json();
      setUnpaidOrders(data.unpaidOrder || []);
      setPaidOrders(data.paidOrder || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const toggleDetails = async (orderKey) => {
    if (expandedIndex === orderKey) {
      setExpandedIndex(null);
      return;
    }
    try {
      const id = orderKey.split('-')[1];
      const detail = await fetchOrderById(id);
      // นำข้อมูล menus, delivery_status, paid_status มา merge ลงใน array เดิม
      const updateList = (arr) =>
        arr.map((o) =>
          o._id === id
            ? {
                ...o,
                menus: detail.menus,
                delivery_status: detail.delivery_status,
                paid_status: detail.paid_status,
              }
            : o
        );
      setUnpaidOrders(updateList(unpaidOrders));
      setPaidOrders(updateList(paidOrders));
      setExpandedIndex(orderKey);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderOrders = (orders, isPaid) => (
    <div className="Post-container">
      {orders.map((order) => {
        const orderKey = `${isPaid}-${order._id}`;
        const isExpanded = expandedIndex === orderKey;
        return (
          <div
            key={order._id}
            className="Post-box"
            onClick={() => toggleDetails(orderKey)}
            style={{ cursor: 'pointer' }}
          >
            <h3>Order #{order._id}</h3>

            {isExpanded ? (
              order.menus ? (
                <div className="expanded-content">
                  <p>ผู้รับหิ้ว: {order.studentId_rider}</p>
                  <p>โอนที่: {order.paymentMethod}</p>
                  <p>สถานะการจัดส่ง: {order.delivery_status}</p>
                  <p>
                    สถานะการชำระเงิน:{' '}
                    <span
                      className={
                        order.paid_status === 'unpaid'
                          ? 'status-pending'
                          : 'status-paid'
                      }
                    >
                      {order.paid_status}
                    </span>
                  </p>
                  {order.paid_status === 'unpaid' && (
                    <button
                      style={{
                        backgroundColor: '#d9534f',
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
                          const res = await fetch('/pending', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ orderId: order._id })
                          });
                          if (!res.ok) throw new Error('แจ้งชำระเงินไม่สำเร็จ');
                          alert('แจ้งชำระเงินสำเร็จ');
                          await fetchOrders(); // <-- refresh ข้อมูลใหม่
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    >
                      แจ้งชำระเงิน
                    </button>
                  )}
                      
                  <h4>รายการอาหาร:</h4>
                  {order.menus.length > 0 ? (
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>รายการ</th>
                          <th>ราคา (บาท)</th>
                          <th>จำนวน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.menus.map((item, i) => (
                          <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>รวมราคาอาหาร</td>
                          <td colSpan="2">
                            {calculateTotal(order.menus)} บาท
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p>ไม่มีรายการอาหาร</p>
                  )}
                </div>
              ) : (
                <div>กำลังโหลดรายละเอียด...</div>
              )
            ) : (
              <div className="postDetail">
                <p>ผู้รับหิ้ว: {order.studentId_rider}</p>
                <p>โอนที่: {order.paymentMethod}</p>
                <p>สถานะการจัดส่ง: {order.delivery_status}</p>
                <p>
                  สถานะการชำระเงิน:{' '}
                  <span
                    className={
                      order.paid_status === 'unpaid'
                        ? 'status-pending'
                        : 'status-paid'
                    }
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

  if (loading) return <p>กำลังโหลดคำสั่งซื้อ...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <section className="Post-section">
      <h2>รายการที่ฉันยังไม่ชำระเงิน</h2>
      {renderOrders(unpaidOrders, 'unpaid')}

      <h2>รายการที่ชำระเงินแล้ว</h2>
      {renderOrders(paidOrders, 'paid')}
    </section>
  );
};

export default UnpaidOrders;
