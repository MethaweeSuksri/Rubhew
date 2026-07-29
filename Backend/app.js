import express from "express"
import session from'express-session'

import {
    regis, 
    login,
    getAllOrder,
    //createOrder,
    getOrderById,
    getAllOrdered,
    getOrderedById,
    getAllRubhewPosts,
    //addRubhewPost,
    getUnpaidOrder,
    getUnpaidOrderById,
    getCustomerUnpaidOrder,
    getCustomerUnpaidOrderById,
    getUserProfile,
    rubhew,
    ordering,
    updatePriceToPending,
    updatePriceToPaid,
    addprice,
    updateOrderNext,
    updateOrderCancel
} from "./controllers/controllers.js";

// แปลง request body เป็น JSON และ URL-encoded
const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// ใช้ express-session เพื่อจัดการ session
app.use(session({
  secret: 'rubHewGroup444',
  resave: false,
  saveUninitialized: true,
}))

// Function1: requireLogin
function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.status(400).json({ message: "Login required" });
  }
  next();
}

// Route function2: register
app.post("/register", regis);

// Route function3: login
app.post("/login",login)

// Route function4: แสดงโพสต์รับหิ้วทั้งหมด (หน้า RubHew/Home)
app.get("/home", getAllRubhewPosts);

// Route function5: สั่งเมนู (หลังกดโพสต์รับหิ้วนั้น ๆ ในหน้า RubHew/Home)
app.post("/ordering",ordering)

// Route function6: ประวัติรายการที่่สั่งไป
app.get("/order", getAllOrder);
app.get("/order/by", getOrderById);

// Route function7: รับหิ้วจ้า
app.post("/rubhew",rubhew)

// Route function8: รายการที่ต้องหิ้ว
app.get("/ordered",getAllOrdered);
app.get("/ordered/by", getOrderedById);

// Route function9: หน้ารายการที่เรายังไม่ชำระเงิน
app.get("/unpaid-order", getUnpaidOrder);
app.get("/unpaid-order/by", getUnpaidOrderById); 

// Route function10: หน้ารายการที่ลูกค้ายังไม่ชำระเงิน
app.get("/customer-unpaid-order/", getCustomerUnpaidOrder);
app.get("/customer-unpaid-order/by", getCustomerUnpaidOrderById); 

// Route function11: แสดงโปรไฟล์
app.get("/profile", getUserProfile);

app.post("/pending", updatePriceToPending); //เปลี่ยนสถานะการชำระเงิน หน้ารายการที่ฉันยังไม่จ่ายเงินเป็น pending
app.post("/paid", updatePriceToPaid); //เปลี่ยนสถานะ หน้ารายการที่ลูกค้ายังไม่จ่ายเงินเป็น paid

app.post("/addprice",addprice);

app.post("/updateOrderNext",updateOrderNext); //เปลี่ยนสถานะการส่ง หน้ารายการที่ต้องหิ้ว (buying->delivering->delivered)
app.post("/updateOrderCancel",updateOrderCancel); // ยกเลิกสถานะการส่ง หน้ารายการที่ต้องหิ้ว เป็น cancel


// Error handling for undefined routes
app.use((req,res)=>{
    console.log("Error: API not found")
    res.status(404).send("Error: API not found")
})

app.listen(5000,()=>{
    console.log("listening on port : 5000")
})

