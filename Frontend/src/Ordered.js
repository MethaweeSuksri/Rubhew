import { useState, useEffect } from 'react';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [place, setPlace] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [menusWithPrice, setMenusWithPrice] = useState([]);
  const [originalMenus, setOriginalMenus] = useState([]);

  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/ordered', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
        const data = await response.json();

        if (Array.isArray(data.order)) {
          setOrders(data.order);
        } else {
          setOrders([]);
        }

        if (data.place) {
          setPlace(data.place);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderedById = async (id) => {
    const response = await fetch(`/ordered/by?id=${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลรายการตาม ID ได้');
    const data = await response.json();
    return data;
  };

  const handleClick = async (id) => {
    if (expandedPost === id) {
      setExpandedPost(null);
      setSelectedOrder(null);
      setMenusWithPrice([]);
      setOriginalMenus([]);
      setIsEditingPrice(false);
    } else {
      try {
        setLoadingDetail(true);
        const orderDetail = await fetchOrderedById(id);

        setSelectedOrder(orderDetail.order || {});
        if (Array.isArray(orderDetail.menus)) {
          setMenusWithPrice(orderDetail.menus.map((menu) => ({ ...menu })));
          setOriginalMenus(orderDetail.menus.map((menu) => ({ ...menu }))); // เก็บสำรองราคาเดิมไว้
        } else {
          setMenusWithPrice([]);
          setOriginalMenus([]);
        }

        setExpandedPost(id);
        setIsEditingPrice(false);
      } catch (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลรายการที่เลือก');
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const handlePriceChange = (index, newPrice) => {
    const updatedMenus = [...menusWithPrice];
    if (newPrice === '') {
      updatedMenus[index].price = '';
    } else {
      const priceNumber = Number(newPrice);
      updatedMenus[index].price = isNaN(priceNumber) ? 0 : priceNumber;
    }
    setMenusWithPrice(updatedMenus);
  };

  const handleSavePrice = async () => {
    if (!selectedOrder?._id) return;
    setSavingPrice(true);
    try {
        const body = {
            orderId: selectedOrder._id,
            menus: menusWithPrice.map(({ name, count, price }) => ({
                name,
                count: Number(count) || 0, // Ensure count is a valid number
                price: Number(price) || 0, // Ensure price is a valid number
            })),
        };

        const response = await fetch('/addprice', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('ไม่สามารถบันทึกราคาสินค้าได้');

        alert('บันทึกราคาสำเร็จ');
        setIsEditingPrice(false);
        setOriginalMenus(menusWithPrice.map((menu) => ({ ...menu }))); // Update original menus
    } catch (err) {
        alert(err.message);
    } finally {
        setSavingPrice(false);
    }
  };

  const handleCancelEdit = () => {
    setMenusWithPrice(originalMenus.map((menu) => ({ ...menu })));
    setIsEditingPrice(false);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
        const response = await fetch('/updateOrderNext', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'ไม่สามารถอัปเดตสถานะการจัดส่งได้');
        }

        alert('สถานะการจัดส่งถูกอัปเดตเรียบร้อยแล้ว');

        // Update the delivery status locally
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order._id === orderId
                    ? { ...order, delivery_status: order.delivery_status === 'buying' ? 'delivering' : 'delivered' }
                    : order
            )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder((prevOrder) => ({
                ...prevOrder,
                delivery_status: prevOrder.delivery_status === 'buying' ? 'delivering' : 'delivered',
            }));
        }
    } catch (err) {
        alert(err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch('/updateOrderCancel', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error('ไม่สามารถยกเลิกรายการได้');

      alert('รายการถูกยกเลิกเรียบร้อยแล้ว');
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId) // ลบโพสต์ที่ถูกยกเลิกออกจาก orders
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!Array.isArray(orders) || orders.length === 0) return <div>ไม่มีคำสั่งซื้อ</div>;

  return (
    <section className="Post-section">
      <h2>ดูรายการต้องหิ้ว</h2>

      <div className="Post-container">
        {orders.map((order) => (
          <div
            key={order._id}
            className="Post-box"
            onClick={() => handleClick(order._id)}
          >
            <h3>Order #{order._id}</h3>

            {expandedPost === order._id ? (
              loadingDetail ? (
                <div>Loading รายละเอียด...</div>
              ) : selectedOrder && selectedOrder._id === order._id ? (
                <div className="expanded-content">
                  <p>ผู้สั่ง: {selectedOrder.studentId_taker}</p>
                  <p>โอนที่: {selectedOrder.paymentMethod}</p>
                  <strong>จาก:</strong> {place && place.from ? place.from : '-'} &nbsp;&nbsp; <strong>ถึง:</strong> {place && place.to ? place.to : '-'}
                  <h4>รายการที่สั่ง:</h4>
                  {menusWithPrice.length > 0 ? (
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>รายการ</th>
                          <th>จำนวน</th>
                          <th>ราคา (บาท)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menusWithPrice.map((menu, idx) => (
                          <tr key={idx}>
                            <td>{menu.name}</td>
                            <td>{menu.count}</td>
                            <td>
                              
                                <input
                                  type="number"
                                  value={menu.price ?? ''}
                                  onChange={(e) => handlePriceChange(idx, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  style={{ width: '80px' }}
                                />
                              
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            รวมทั้งหมด
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            {menusWithPrice.reduce((sum, menu) => sum + ((Number(menu.price) || 0) * menu.count), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p>ไม่มีรายการที่สั่ง</p>
                  )}
                  <div className="button-row">
                    {!isEditingPrice && (
                      <button
                        className="confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingPrice(true);
                        }}
                      >
                        แก้ไขราคา
                      </button>
                    )}

                    {isEditingPrice && (
                      <>
                        <button
                          className="decline-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          ยกเลิก
                        </button>
                        <button
                          className="confirm-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSavePrice();
                          }}
                          disabled={savingPrice}
                          style={{ marginLeft: '1rem' }}
                        >
                          {savingPrice ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                      </>
                    )}
                  </div>

                  <p>หมายเหตุ: {selectedOrder.description || '-'}</p>
                  <p>สถานะการจัดส่ง: {selectedOrder.delivery_status}</p>
                  <button
                    className="confirm-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(order._id);
                    }}
                  >
                    อัปเดตสถานะการจัดส่ง
                  </button>
                  <p>สถานะการชำระเงิน: {selectedOrder.paid_status}</p>
                  <button
                    className="decline-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelOrder(order._id);
                    }}
                  >
                    ยกเลิกรายการ
                  </button>
                </div>
              ) : (
                <div>เกิดข้อผิดพลาดในการโหลดรายละเอียด</div>
              )
            ) : (
              <div className="postDetail">
                <p>ผู้สั่ง: {order.studentId_taker}</p>
                <p>โอนที่: {order.paymentMethod}</p>
                <strong>จาก:</strong> {place.from || '-'} &nbsp;&nbsp; <strong>ถึง:</strong> {place.to || '-'}
                <p>สถานะการจัดส่ง: {order.delivery_status}</p>
                <p>สถานะการชำระเงิน: {order.paid_status}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Order;
