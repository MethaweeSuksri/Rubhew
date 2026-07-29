import { User, Menu, Order } from "../models/models.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Function2: Registration
export const regis = async (req, res) => {
  const {
    username,
    password,
    studentId,
    paymentMethod,
    email,
    department,
    phone,
  } = req.body;

  try {
    // Check if required fields are provided
    if (
      !username ||
      !password ||
      !studentId ||
      !paymentMethod ||
      !email ||
      !department ||
      !phone
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user already exists (by email or studentId)
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or student ID already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      studentId,
      paymentMethod,
      email,
      department,
      phone,
    });

    // Save user to database
    await user.save();

    res.status(201).json({ message: "User registered successfully", userId: user._id,User : user.userId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Function3: Login
export const login = async (req,res)=>{
    const {username,password}= req.body;
    console.log(username)
    //console.log(password)

    try{
        if(!username||!password){
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        const existingUser = await User.findOne({ username: username });
        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        req.session.username = username;
        req.session.studentId = existingUser.studentId;
        return res.status(200).json({ message: "Success" });

    }catch(error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
    }
}

// Function4: แสดงโพสต์รับหิ้วทั้งหมด (หน้า RubHew/Home)
export const getAllRubhewPosts = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        const rubhewPosts = await User.find({ availablefororder: { $gt: 0 } , studentId : { $ne : studentId} }); // ค้นหา user ที่มี availablefororder > 0
        res.status(200).json(rubhewPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function6: ประวัติรายการที่่สั่งไป //เหลือ timestamp
export const getAllOrder = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        // studentId_rider: studentId 
        const order = await Order.find({studentId_taker: studentId ,paid_status: 'paid' }, '_id studentId_taker studentId_rider description delivery_status paid_status totalprice paymentMethod');
        res.status(200).json(order);
        console.log("getAllOrder ok")
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function6: ประวัติรายการที่่สั่งไป by id
export const getOrderById = async (req, res) => {
    const orderId = req.query.id;
    try {
        const order = await Order.findOne({ _id: orderId }, '_id studentId_rider studentId_taker description delivery_status paid_status totalprice paymenttimestamp paymentMethod');
        const menus = await Menu.find({orderId: orderId }, 'name count price');

        res.status(200).json({
            order: order.toObject(),
            menus: menus
        });
        console.log("getOrderById ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Function8: รายการที่ต้องหิ้ว
export const getAllOrdered = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        const order = await Order.find({studentId_rider: studentId, delivery_status: { $in: ['buying', 'delivering']}}, '_id studentId_taker description delivery_status paid_status totalprice paymenttimestamp paymentMethod');
        const place = await User.findOne({studentId: studentId}, 'from to');

        res.status(200).json({
            order: order,
            place: place.toObject()
        });
        console.log("getAllOrdered ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function8: รายการที่ต้องหิ้ว by id
export const getOrderedById = async (req, res) => {
    const orderId = req.query.id;
    try {
        const order = await Order.findOne({ _id: orderId }, '_id studentId_rider studentId_taker description delivery_status paid_status totalprice paymenttimestamp paymentMethod');
        const menus = await Menu.find({orderId: orderId }, 'name count price');

        res.status(200).json({
            order: order.toObject(),
            menus: menus
        });
        console.log("getOrderedById ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function9: หน้ารายการที่เรายังไม่ชำระเงิน
export const getUnpaidOrder = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        const unpaidOrder = await Order.find({
            studentId_taker: studentId,
            paid_status: 'unpaid',
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');

        const paidOrder = await Order.find({
            studentId_taker: studentId,
            paid_status: { $in: ['pending', 'paid']}, //timestamp ยัง
            // ต้องระบุ timestamp หลังกดยืืนยันก่อน ค่อยเช็คเงื่อนไขได้
            // paymenttimestamp: { $lt: new Date(Date.now() - 5 * 60 * 1000)}, // 5 นาทีที่ผ่านมา
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');

        res.status(200).json({
            unpaidOrder: unpaidOrder,
            paidOrder: paidOrder
        });
        console.log("getUnpaidOrder ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function9: หน้ารายการที่เรายังไม่ชำระเงิน by id
export const getUnpaidOrderById = async (req, res) => {
    const studentId = req.session.studentId;
    const orderId = req.query.id;
    try {
        const order = await Order.findOne({
            studentId_taker: studentId,
            _id: orderId,
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');
        
        const menu = await Menu.find({ 
            orderId: orderId
        }, 'name count price');

        res.status(200).json({
            order: order.toObject(),
            menus: menu
        });
        console.log("getUnpaidOrderById ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function10: หน้ารายการที่ลูกค้ายังไม่ชำระเงิน
export const getCustomerUnpaidOrder = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        const customerUnpaidOrder = await Order.find({
            studentId_rider: studentId,
            paid_status: { $in: ['unpaid', 'pending']},
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');

        const customerPaidOrder = await Order.find({
            studentId_rider: studentId,
            paid_status: 'paid',
            //paymenttimestamp: { $lt: new Date(Date.now() - 5 * 60 * 1000)}, // 5 นาทีที่ผ่านมา
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');

        res.status(200).json({
            customerUnpaidOrder: customerUnpaidOrder,
            customerPaidOrder: customerPaidOrder
        });
        console.log("getCustomerUnpaidOrder ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function10: หน้ารายการที่ลูกค้ายังไม่ชำระเงิน by id
export const getCustomerUnpaidOrderById = async (req, res) => {
    const studentId = req.session.studentId;
    const orderId = req.query.id;
    try {
        const order = await Order.findOne({
            studentId_rider: studentId,
            _id: orderId,
        }, '_id studentId_rider delivery_status paid_status totalprice paymentMethod');

        const menu = await Menu.find({
            orderId: orderId
        }, 'name count price'); 

        console.log(menu)

        res.status(200).json({
            order: order.toObject(),
            menus: menu
        });
        console.log("getCustomerUnpaidOrderById ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function11: แสดงโปรไฟล์
export const getUserProfile = async (req, res) => {
    const studentId = req.session.studentId;
    try {
        const user = await User.findOne({ studentId: studentId });
        console.log("getUserProfile ok");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function7: รับหิ้วจ้า post
export const rubhew =async (req,res)=>{
    const {availablefororder,sendfrom,sendto,rateInit,ratePer}= req.body;
    const currentID = req.session.studentId;

    if(!currentID){
        return res.status(400).json({ message: "must login first" });
    }

    if(!availablefororder||!sendfrom||!sendto||!rateInit||!ratePer
        ||rateInit<0||ratePer<0){
        return res.status(400).json({ message: "please fill all the data" });        
    }    


    try{
        const existingUser = await User.findOneAndUpdate({ studentId: `${currentID}` },{
        availablefororder:`${availablefororder}`,
        from:`${sendfrom}`,
        to:`${sendto}`,
        rateInit:`${rateInit}`,
        ratePer:`${ratePer}`});
    }catch(error){
        console.error("rubhew error:", error);
        res.status(500).json({ message: "Server error" });
    }

    return res.status(200).json({ message: "Success" });
}

// Function5: สั่งเมนู post (หลังกดโพสต์รับหิ้วนั้น ๆ ในหน้า RubHew/Home)
export const ordering = async (req,res)=>{
  const { menus, description, studentId } = req.body;
  const riderID = studentId;
  const takerID = req.session.studentId;
try {
    // Validate inputs
    if (!takerID) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!menus || !Array.isArray(menus) || menus.length === 0) {
      return res.status(400).json({ message: "Menus must be a non-empty array" });
    }
    if (!riderID) {
      return res.status(400).json({ message: "studentId_rider is required" });
    }

    const takerCheck = await User.findOne({ studentId: studentId });
    if (takerCheck.availablefororder<=0) {
      return res.status(400).json({ message: "rider not ready" });
    }
    // Validate each menu
    for (const menu of menus) {
        if (!menu.name || !menu.count) {
            return res.status(400).json({ message: "Each menu must have name and count" });
        }
    }
    
   // Calculate total price
    const totalprice = menus.reduce((sum, menu) => {
      return sum + (menu.price || 0) * menu.count;
    }, 0);

    const topay = await User.findOne({studentId:riderID},'paymentMethod')

    // Create order
    const order = new Order({
      studentId_rider: riderID,
      studentId_taker: takerID,
      description,
      delivery_status: "buying",
      paid_status: "unpaid",
      totalprice,
      paymenttimestamp: null,
      paymentMethod: topay.paymentMethod
    });
    await order.save();

    // Prepare menus with orderId
    const menuDocs = menus.map((menu) => ({
      orderId: order._id,
      name: menu.name,
      count: menu.count,
      price: menu.price || 0,
    }));
    await Menu.insertMany(menuDocs);
    
    const taker = await User.findOneAndUpdate(
      { studentId: riderID },
      { $inc: { availablefororder: -1 } },
      { new: true }
    );

    if (!taker) {
      return res.status(404).json({ message: "Taker not found" });
    }

    res.status(201).json({ message: "Order created successfully", orderId: order.orderId});
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const updatePriceToPending = async (req,res)=>{
    const { orderId } = req.body;
    const takerID = req.session.studentId;

    const _id = new mongoose.Types.ObjectId(orderId);

    if (!takerID) {
        return res.status(500).json({ message: "not logged in" });
    }

    const result = await Order.findOneAndUpdate(
        { studentId_taker: takerID, _id: _id },
        { paid_status: "pending", paymenttimestamp: new Date() }
    );

    if (!result) {
        return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Success" });
}

export const updatePriceToPaid = async (req,res)=>{
   const { orderId } = req.body;
    const riderID = req.session.studentId;

    const _id = new mongoose.Types.ObjectId(orderId);

    if (!riderID) {
        return res.status(500).json({ message: "not logged in" });
    }

    const result = await Order.findOneAndUpdate(
        { studentId_rider: riderID, _id: _id },
        { paid_status: "paid", paymenttimestamp: new Date() }
    );

    if (!result) {
        return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Success" });
}

export const addprice= async (req,res)=>{
    const { menus,orderId } = req.body;

    const _id = new mongoose.Types.ObjectId(orderId);

    const order = await Order.findOne({_id})
    const rider =  await User.findOne({
        studentId: order.studentId_rider
    })
    console.log(rider)

    let runner = Number(rider.rateInit) || 0;
    for (const element of menus) {
        console.log(element)
        const price = element.price;
        const menu = await Menu.findOneAndUpdate({ name: `${element.name}`, orderId: _id }, { price: price });
        const count = menu.count;
        runner = runner + ((price+Number(rider.ratePer)) * count);
    }

    console.log(runner)

    const result = await Order.findOneAndUpdate(
        { _id },
        { totalprice: runner }
    );

    if (!result) {
        return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Success" });
}


export const updateOrderNext = async (req,res)=>{
    const { orderId } = req.body;

    const _id = new mongoose.Types.ObjectId(orderId);


    const order = await Order.findOne({_id})

    if(order.studentId_rider!=req.session.studentId){
        return res.status(404).json({ message: "You are not this order's rider" });
    }


    switch(order.delivery_status) {
  case 'buying':
    order.delivery_status = 'delivering'
    break;
  case 'delivering':
    order.delivery_status = 'delivered'
    break;
  default:
    return res.status(404).json({ message: "Order not found" });
} 

    await order.save();

    return res.status(200).json({ message: "Success" });
}


export const updateOrderCancel = async (req,res)=>{
    const { orderId } = req.body;

    const _id = new mongoose.Types.ObjectId(orderId);


    const orderCheck = await Order.findOne({_id})
    
    if(orderCheck.studentId_rider!=req.session.studentId){
        return res.status(404).json({ message: "You are not this order's rider" });
    }

    const order = await Order.findOneAndUpdate({_id},{delivery_status:'cancelled'})

    return res.status(200).json({ message: "Success" });
}