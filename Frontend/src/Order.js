import { useState, useEffect } from 'react';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/order', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const fetchOrderedById = async (id) => {
        const response = await fetch(`/order/by?id=${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลรายการตาม ID ได้');
        }
        const data = await response.json();
        return data;
    };

    const handleClick = async (id) => {
        if (expandedPost === id) {
            setExpandedPost(null);
            setSelectedOrder(null);
        } else {
            try {
                setLoadingDetail(true);
                const orderDetail = await fetchOrderedById(id);
                setSelectedOrder(orderDetail);
                setExpandedPost(id);
            } catch (err) {
                console.error(err);
                setError('เกิดข้อผิดพลาดในการดึงข้อมูลรายการที่เลือก');
                setSelectedOrder(null);
            } finally {
                setLoadingDetail(false);
            }
        }
    };

    const calculateTotalPrice = (menus) => {
        if (!menus || menus.length === 0) return 0;
        return menus.reduce((total, menu) => total + (menu.price * menu.count), 0);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (orders.length === 0) return <div>ไม่มีคำสั่งซื้อ</div>;

    return (
        <section className='Post-section'>
            <h2>ดูประวัติรายการที่สั่งไป</h2>
            <div className="Post-container">
                {orders.map((order) => {
                    const isExpanded = expandedPost === order._id;
                    return (
                        <div
                            key={order._id}
                            className="Post-box"
                            onClick={() => handleClick(order._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>Order #{order._id}</h3>

                            {isExpanded ? (
                                loadingDetail ? (
                                    <div>Loading รายละเอียด...</div>
                                ) : selectedOrder ? (
                                    <div className="expanded-content">
                                        <p>ผู้รับหิ้ว: {selectedOrder?.studentId_rider || order.studentId_rider}</p>
                                        <h4>รายการที่สั่ง:</h4>
                                        {selectedOrder.menus && selectedOrder.menus.length > 0 ? (
                                            <ul>
                                                {selectedOrder.menus.map((menu, idx) => (
                                                    <li key={idx}>
                                                        {menu.name} x{menu.count} &nbsp;&nbsp; - {menu.price} บาท
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>ไม่มีรายการที่สั่ง</p>
                                        )}
                                        <strong>ราคารวมทั้งหมด: {calculateTotalPrice(selectedOrder.menus)} บาท</strong>
                                        <p>หมายเหตุ: {selectedOrder.description || '-'}</p>
                                        <p>สถานะการจัดส่ง: {selectedOrder.delivery_status || order.delivery_status}</p>
                                        <p>สถานะการชำระเงิน: {selectedOrder.paid_status || order.paid_status}</p>
                                    </div>
                                ) : (
                                    <div>ไม่พบข้อมูลรายการ</div>
                                )
                            ) : (
                                <div className='postDetail'>
                                    <p>ผู้รับหิ้ว: {order.studentId_rider}</p>
                                    <p>สถานะการจัดส่ง: {order.delivery_status}</p>
                                    <p>สถานะการชำระเงิน: {order.paid_status}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Order;
