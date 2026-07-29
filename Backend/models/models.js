import mongoose from 'mongoose'
import bcrypt from "bcrypt";


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', {
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true },
  paymentMethod: { type: String, required: false },
  email: { type: String, required: true },
  department : { type: String, required: true },
  phone : { type: String, required: true },
  availablefororder : { type: Number, required: false,default: 0 },
  from: { type: String, required: false },
  to: { type: String, required: false },
  rateInit: { type: Number, required: false },
  ratePer: { type: Number, required: false },
});

// Menu Schema
const menuSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  count: { type: Number, required: true },
  price: { type: Number, required: false }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  //orderId: { type: Number , required: true },
  studentId_rider: { type: String, required: true },
  studentId_taker: { type: String, required: true },
  description: { type: String },
  delivery_status: { type: String, enum: ['buying', 'delivering', 'delivered','cancelled'], default: 'buying' },
  paid_status: { type: String ,enum: ['unpaid', 'pending', 'paid'], required:true ,default: 'unpaid'},
  totalprice:{ type: Number, required: false },
  paymenttimestamp:{ type : Date ,required:false},
  paymentMethod: { type: String, required: true }
});

// Define models
const User = mongoose.model('User', userSchema);
const Menu = mongoose.model('Menu', menuSchema);
const Order = mongoose.model('Order', orderSchema);

// Function to insert default data
export async function insertDefaultData() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword1 = await bcrypt.hash("123456", salt);
  const hashedPassword2 = await bcrypt.hash("123458", salt);

  const defaultUsers = [
    {
      username: "ginger",
      password: hashedPassword1,
      studentId: "111111",
      paymentMethod: "กศิกร 0000000000",
      email: "ginger@mail",
      department: "CS",
      phone: "1234567890",
      availablefororder: 2,
      from: "Location A",
      to: "Location B",
      rateInit: 10,
      ratePer: 5,
    },
    {
      username: "gingee",
      password: hashedPassword2,
      studentId: "111112",
      paymentMethod: "prompay 0621616115",
      email: "gingee@mail",
      department: "CS",
      phone: "1234567899",
      availablefororder: 0,
      from: "Location A",
      to: "Location B",
      rateInit: 10,
      ratePer: 5,
    }
  ];

  const defaultOrdersData = [
    {
      studentId_rider: '111111',
      studentId_taker: '111112',
      description: 'Order for source',
      delivery_status: 'buying',
      paid_status: 'pending',
      paymentMethod: "กศิกร 0000000000"
    },
    {
      studentId_rider: '111112',
      studentId_taker: '111111',
      delivery_status: 'delivering',
      paid_status: 'unpaid',
      paymentMethod: "prompay 0621616115"
      // paymenttimestamp: 
    },
    {
      studentId_rider: '111111',
      studentId_taker: '111112',
      description: 'Not Spicy',
      delivery_status: 'delivered',
      paid_status: 'paid',
      paymentMethod: "กศิกร 0000000000"
      // paymenttimestamp: ,
    },
    {
      studentId_rider: '111112',
      studentId_taker: '111111',
      description: 'Extra Spicy',
      delivery_status: 'cancelled',
      paid_status: 'unpaid',
      paymentMethod: "prompay 0621616115"
    }
  ];

  try {
    await User.deleteMany({}); // Clear existing users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(defaultUsers);
      console.log('Inserted default users');
    }

    await Order.deleteMany({});
    const orderCount = await Order.countDocuments();
    let orderDocs = [];
    if (orderCount === 0) {
      orderDocs = await Order.insertMany(defaultOrdersData);
      console.log('Inserted default orders');
    }

    await Menu.deleteMany({});
    const menuCount = await Menu.countDocuments();
    if (menuCount === 0 && orderDocs.length > 0) {
      await Menu.insertMany([
        {
          orderId: orderDocs[0]._id,
          name: 'Pizza',
          count: 1
        },
        {
          orderId: orderDocs[0]._id,
          name: 'Pasta',
          count: 2
        },
        {
          orderId: orderDocs[1]._id,
          name: 'Pasta',
          count: 2,
        },      
        {
          orderId: orderDocs[2]._id,
          name: 'Burger',
          count: 2,
          price: 50
        },
        {
          orderId: orderDocs[2]._id,
          name: 'Fries',
          count: 1,
          price: 20
        },
        {
          orderId: orderDocs[2]._id,
          name: 'Chicken',
          count: 1,
          price: 25
        },
        {
          orderId: orderDocs[3]._id,
          name: 'Rice',
          count: 1,
          price: 10
        },
        {
          orderId: orderDocs[3]._id,
          name: 'Salad',
          count: 1,
          price: 15
        }
      ]);
      console.log('Inserted default menu items');
    }

  } catch (err) {
    console.error('Error inserting default data:', err);
  } finally {

  }
}

insertDefaultData();

// Export models
export { User, Menu, Order };
