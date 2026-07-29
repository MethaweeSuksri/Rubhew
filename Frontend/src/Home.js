import "./css/home.css";
import { useEffect, useState } from "react";

function Home() {
  const [expandedPost, setExpandedPost] = useState(null);
  const [orderMap, setOrderMap] = useState({});
  const [noteMap, setNoteMap] = useState({});
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/home")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const handleClick = (postIndex) => {
    setExpandedPost(postIndex);
    if (!orderMap[postIndex]) {
      setOrderMap((prev) => ({
        ...prev,
        [postIndex]: [{ item: "", quantity: 0 }],
      }));
    }
    if (!noteMap[postIndex]) {
      setNoteMap((prev) => ({ ...prev, [postIndex]: "" }));
    }
  };

  const handleConfirm = (postTitle, postIndex) => {
  const orders = orderMap[postIndex] || [];
  const note = noteMap[postIndex] || "";
  const post = posts[postIndex];

  // Build menus array as required by backend
  const menus = orders.map(order => ({
    name: order.item,
    count: Number(order.quantity),
  }));


  const payload = {
    menus,
    description: note,
    studentId: post.studentId
  };

  fetch("/ordering", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      alert(`สั่งออเดอร์สำเร็จ: ${JSON.stringify(data)}`);
    })
    .catch(err => {
      alert("เกิดข้อผิดพลาดในการสั่งออเดอร์");
      console.error(err);
    });
};

  const handleChange = (postIndex, rowIndex, field, value) => {
    const updatedOrders = [...(orderMap[postIndex] || [])];
    updatedOrders[rowIndex][field] = value;
    setOrderMap((prev) => ({
      ...prev,
      [postIndex]: updatedOrders,
    }));
  };

  const handleAddRow = (postIndex) => {
    const updatedOrders = [...(orderMap[postIndex] || [])];
    updatedOrders.push({ item: "", quantity: 0 });
    setOrderMap((prev) => ({
      ...prev,
      [postIndex]: updatedOrders,
    }));
  };

  const handleNoteChange = (postIndex, value) => {
    setNoteMap((prev) => ({
      ...prev,
      [postIndex]: value,
    }));
  };

  return (
    <div className="Home">
      <section className="Post-section">
        <h2>บริการรับหิ้ว</h2>
        <div className="Post-container">
          {posts.map((post, index) => (
            <div
              key={index}
              className="Post-box"
              onClick={() => handleClick(index)}
            >
              <h3>{post.title}</h3>
    <div className="post-fields">
      <div><strong>username:</strong> {post.username}</div>
  <div><strong>studentId:</strong> {post.studentId}</div>
  <div><strong>paymentMethod:</strong> {post.paymentMethod}</div>
  <div><strong>email:</strong> {post.email}</div>
  <div><strong>department:</strong> {post.department}</div>
  <div><strong>phone:</strong> {post.phone}</div>
  <div><strong>availablefororder:</strong> {post.availablefororder}</div>
  <div><strong>from:</strong> {post.from}</div>
  <div><strong>to:</strong> {post.to}</div>
  <div><strong>rateInit:</strong> {post.rateInit}</div>
  <div><strong>ratePer:</strong> {post.ratePer}</div>
    </div>

              {expandedPost === index ? (
                <div className="expanded-content">
                  <p>ผู้รับหิ้ว: {post.deliverer}</p>
                  <p>
                    ให้บริการซื้อของจาก {post.from} ส่งถึง {post.to}
                  </p>
                  

                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>รายการ</th>
                        <th>จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orderMap[index] || []).map((order, rowIdx) => (
                        <tr key={rowIdx}>
                          <td>
                            <input
                              type="text"
                              value={order.item}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  rowIdx,
                                  "item",
                                  e.target.value
                                )
                              }
                              placeholder="รายการ"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={order.quantity}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  rowIdx,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="จำนวน"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="note-input-container">
                    <label>หมายเหตุ:</label>
                    <textarea
                      value={noteMap[index] || ""}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      placeholder="เช่น ขอช้อนส้อม ฯลฯ"
                      rows={3}
                      style={{ width: "100%", marginTop: "5px" }}
                    />
                  </div>

                  <div className="add-row-btn-container">
                    <button
                      className="add-row-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRow(index);
                      }}
                    >
                      เพิ่มรายการ
                    </button>
                  </div>

                  <div className="confirm-btn-container">
                    <button
                      className="confirm-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(post.title, index);
                      }}
                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              ) : (
                <div className="postDetail">
                  <p>ผู้รับหิ้ว: {post.deliverer}</p>
                  <p>
                    ให้บริการซื้อของจาก {post.from} ส่งถึง {post.to}
                  </p>
                  <p>
                    ค่าจัดส่ง: {post.rateInit} บาท สำหรับชิ้นแรก, ชิ้นถัดไปชิ้นละ {post.ratePer} บาท
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
