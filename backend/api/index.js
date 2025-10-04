// const express = require("express");
// const mysql = require("mysql2/promise"); 
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// const app = express();
// const PORT = 3001;

// // URL ของ Frontend (Production Domain จาก Vercel)
// const allowedOrigin = "https://my-react-order-system-app.vercel.app"; // <--- Domain ของคุณ

// const corsOptions = {
//   origin: allowedOrigin,
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());

// // Database connection using async/await
// // const db = mysql.createPool({
// //   // เปลี่ยนเป็น pool เพื่อประสิทธิภาพที่ดีกว่า
// //   host: "localhost",
// //   user: "root",
// //   password: "root",
// //   database: "testdb",
// // });

// const db = mysql.createPool({
//   host: process.env.DB_HOST, // อ่านค่าจากตัวแปร DB_HOST ที่ตั้งใน Railway
//   user: process.env.DB_USER, // อ่านค่าจากตัวแปร DB_USER
//   password: process.env.DB_PASSWORD, // อ่านค่าจากตัวแปร DB_PASSWORD
//   database: process.env.DB_DATABASE, // อ่านค่าจากตัวแปร DB_DATABASE
// });

// // Start the server only after a successful database connection
// (async function startServer() {
//   try {
//     await db.getConnection(); // ตรวจสอบการเชื่อมต่อ
//     console.log("✅ Connected to MySQL");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//   }
// })();

// //---

// // POST /login route (แก้ไขให้ใช้ async/await และ bcrypt)
// app.post("/api/login", async (req, res) => {
//   const { name, password } = req.body;

//   if (!name || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
//   }

//   try {
//     const sql = "SELECT * FROM testdb.user WHERE name = ?";
//     const [results] = await db.query(sql, [name]);

//     if (results.length > 0) {
//       const user = results[0];
//       // เปรียบเทียบรหัสผ่านที่เข้ารหัสแล้ว
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (isMatch) {
//         // ส่ง role กลับไปใน response
//         res.json({
//           success: true,
//           message: "เข้าสู่ระบบสำเร็จ!",
//           role: user.role,
//           user: user,
//         });
//       } else {
//         res.status(401).json({
//           success: false,
//           message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
//         });
//       }
//     } else {
//       res
//         .status(401)
//         .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.post("/api/getuser", async (req, res) => {
//   try {
//     // ดึงข้อมูลผู้ใช้ทั้งหมด (ยกเว้นรหัสผ่าน ถ้าไม่จำเป็นต้องแสดง)
//     const sql = "SELECT * FROM testdb.user ORDER BY id DESC";
//     const [results] = await db.query(sql);

//     // *** โครงสร้างการส่งข้อมูลกลับที่ถูกต้อง ***
//     res.json({
//       success: true,
//       users: results, // ส่งข้อมูลเป็น Array ภายใต้คีย์ 'users'
//     });
//   } catch (err) {
//     console.error("❌ Get user list error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// app.patch("/api/updateProfileByAdmin/:name", async (req, res) => {
//   const oldName = req.params.name;
//   const { newName, newPassword, newRole } = req.body;

//   if (!newName && !newPassword && !newRole) {
//     return res
//       .status(400)
//       .json({ success: false, message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข" });
//   }

//   try {
//     const updates = [];
//     const params = [];

//     // 1. จัดการการเปลี่ยนชื่อผู้ใช้
//     if (newName && newName !== oldName) {
//       // ตรวจสอบชื่อใหม่ว่าถูกใช้ไปแล้วหรือไม่
//       const checkSql = "SELECT name FROM testdb.user WHERE name = ?";
//       const [existingUsers] = await db.query(checkSql, [newName]);
//       if (existingUsers.length > 0) {
//         return res
//           .status(409)
//           .json({ success: false, message: "ชื่อผู้ใช้ใหม่นี้ถูกใช้แล้ว" });
//       }
//       updates.push("name = ?");
//       params.push(newName);
//     }

//     // 2. จัดการการเปลี่ยนรหัสผ่าน (ถ้ามีการป้อนรหัสผ่านใหม่)
//     if (newPassword) {
//       if (newPassword.length < 6) {
//         // ตัวอย่างการตรวจสอบความยาวขั้นต่ำ
//         return res.status(400).json({
//           success: false,
//           message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
//         });
//       }
//       // เข้ารหัสรหัสผ่านใหม่ด้วย bcrypt
//       const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
//       updates.push("password = ?");
//       params.push(hashedPassword);
//     }

//     // 3. จัดการการเปลี่ยนบทบาท
//     if (newRole) {
//       if (newRole !== "admin" && newRole !== "user") {
//         return res
//           .status(400)
//           .json({ success: false, message: "บทบาทไม่ถูกต้อง" });
//       }
//       updates.push("role = ?");
//       params.push(newRole);
//     }

//     // รวม SQL Query และทำการอัปเดต
//     const sql = `UPDATE testdb.user SET ${updates.join(", ")} WHERE name = ?`;

//     // หากมีการเปลี่ยนชื่อผู้ใช้ ต้องใช้ชื่อเดิม (oldName) ในการค้นหา
//     // แต่ถ้าเปลี่ยนชื่อ, อัปเดต name = ? จะถูกเพิ่มเข้าไปใน params ก่อนแล้ว
//     params.push(oldName);

//     const [results] = await db.query(sql, params);

//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!" });
//     } else {
//       res
//         .status(404)
//         .json({ success: false, message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
//     }
//   } catch (error) {
//     console.error("❌ Admin update profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
//     });
//   }
// });

// app.delete("/api/deleteuser/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     // ป้องกันการลบตัวเอง (ถ้าคุณมี session หรือ token ของ admin)
//     // if (req.user.id == id) {
//     //     return res.status(403).json({ success: false, message: "ไม่สามารถลบบัญชีผู้ใช้ของคุณเองได้" });
//     // }

//     const sql = "DELETE FROM testdb.user WHERE id = ?";
//     const [results] = await db.query(sql, [id]);

//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "ลบผู้ใช้สำเร็จ" });
//     } else {
//       res
//         .status(404)
//         .json({ success: false, message: "ไม่พบผู้ใช้ ID นี้ที่ต้องการลบ" });
//     }
//   } catch (error) {
//     console.error("❌ Delete user error:", error);
//     res.status(500).json({
//       success: false,
//       message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
//     });
//   }
// });

// //---

// // POST /api/register (โค้ดเดิมที่ถูกต้องแล้ว)
// app.post("/api/register", async (req, res) => {
//   const { name, password, role } = req.body;

//   if (!name || !password || !role) {
//     return res.status(400).json({
//       success: false,
//       message: "ชื่อผู้ใช้, รหัสผ่าน, และบทบาท จำเป็นต้องระบุ",
//     });
//   }

//   try {
//     const checkSql = "SELECT name FROM testdb.user WHERE name = ?";
//     const [existingUsers] = await db.query(checkSql, [name]);

//     if (existingUsers.length > 0) {
//       return res
//         .status(409)
//         .json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" });
//     }

//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const insertSql =
//       "INSERT INTO testdb.user (name, password, role) VALUES (?, ?, ?)";
//     await db.query(insertSql, [name, hashedPassword, role]);

//     res.json({
//       success: true,
//       message: "ลงทะเบียนสำเร็จ!",
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     return res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// // ส่วน API อื่นๆ ที่เหลือ ให้ปรับแก้จาก db.query(...) เป็น await db.query(...) ทั้งหมด

// app.post("/api/order", async (req, res) => {
//   const { tablenum, listorder, qty, price, total_price } = req.body;
//   if (!tablenum || !listorder || !qty) {
//     return res.status(400).json({
//       success: false,
//       message: "tableNumber, listOrder, qty required",
//     });
//   }
//   try {
//     const sql =
//       "INSERT INTO testdb.listorder (tablenum, listorder, qty, price, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')";
//     const [results] = await db.query(sql, [
//       tablenum,
//       listorder,
//       qty,
//       price,
//       total_price,
//     ]);
//     res.json({
//       success: true,
//       message: "Order added successfully",
//       orderId: results.insertId,
//     });
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.patch("/api/completeOrder", async (req, res) => {
//   const { id } = req.body;

//   try {
//     const sql = `
//             UPDATE listorder 
//             SET status = 'completed', update_status = CURRENT_TIMESTAMP() 
//             WHERE id = ?;
//         `;
//     const [result] = await db.query(sql, [id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "ไม่พบออเดอร์ หรือออเดอร์เสร็จสิ้นไปแล้ว",
//       });
//     }

//     res.json({ success: true, message: "ออเดอร์เสร็จสิ้นและบันทึกยอดขายแล้ว" });
//   } catch (err) {
//     console.error("❌ Error completing order:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.post("/api/getorder", async (req, res) => {
//   try {
//     const sql = "SELECT * FROM testdb.listorder ORDER BY id DESC LIMIT 1000";
//     const [results] = await db.query(sql);
//     res.json({ success: true, orders: results });
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.patch("/api/updateOrder", async (req, res) => {
//   const { id, tablenum, listorder, qty, price, total_price } = req.body;
//   if (!id || !tablenum || !listorder || !qty) {
//     return res.status(400).json({
//       success: false,
//       message: "id, tableNumber, listOrder, qty required",
//     });
//   }
//   try {
//     const sql =
//       "UPDATE testdb.listorder SET tablenum = ?, listorder = ?, qty = ?, price = ?, total_price = ? WHERE id = ?";
//     const [results] = await db.query(sql, [
//       tablenum,
//       listorder,
//       qty,
//       price,
//       total_price,
//       id,
//     ]);
//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "Update order successfully" });
//     } else {
//       res.status(404).json({ success: false, message: "Order not found" });
//     }
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.delete("/api/deleteOrder/:id", async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).json({ success: false, message: "id required" });
//   }
//   try {
//     const sql = "DELETE FROM testdb.listorder WHERE id = ?";
//     const [results] = await db.query(sql, [id]);
//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "Delete order successfully" });
//     } else {
//       res.status(404).json({ success: false, message: "Order not found" });
//     }
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.post("/api/getmenu", async (req, res) => {
//   try {
//     const sql = "SELECT * FROM testdb.masterorder ORDER BY id DESC LIMIT 1000";
//     const [results] = await db.query(sql);
//     res.json({ success: true, menu: results });
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.post("/api/addmenu", async (req, res) => {
//   const { menuname, price } = req.body;
//   if (!menuname || !price) {
//     return res
//       .status(400)
//       .json({ success: false, message: "menuname, price required" });
//   }
//   try {
//     const sql =
//       "INSERT INTO testdb.masterorder (ordername, price) VALUES (?, ?)";
//     const [results] = await db.query(sql, [menuname, price]);
//     res.json({
//       success: true,
//       message: "Menu added successfully",
//       orderId: results.insertId,
//     });
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.patch("/api/updatemenu", async (req, res) => {
//   const { id, menuname, price } = req.body;
//   if (!id || !menuname || !price) {
//     return res
//       .status(400)
//       .json({ success: false, message: "id, menuname, price required" });
//   }
//   try {
//     const sql =
//       "UPDATE testdb.masterorder SET ordername = ?, price = ? WHERE id = ?";
//     const [results] = await db.query(sql, [menuname, price, id]);
//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "Update menu successfully" });
//     } else {
//       res.status(404).json({ success: false, message: "Menu not found" });
//     }
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// //---

// app.delete("/api/deletemenu/:id", async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).json({ success: false, message: "id required" });
//   }
//   try {
//     const sql = "DELETE FROM testdb.masterorder WHERE id = ?";
//     const [results] = await db.query(sql, [id]);
//     if (results.affectedRows > 0) {
//       res.json({ success: true, message: "Delete order successfully" });
//     } else {
//       res.status(404).json({ success: false, message: "Order not found" });
//     }
//   } catch (err) {
//     console.error("❌ Query error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// // ดึงจำนวน "กำลังทำอาหาร" (Pending Count)
// app.post("/api/getPendingOrderCount", async (req, res) => {
//   try {
//     const sql =
//       "SELECT COUNT(*) AS pending_count FROM testdb.listorder WHERE status = 'pending';";
//     const [results] = await db.query(sql);
//     const pendingCount = results.length > 0 ? results[0].pending_count : 0;
//     res.json({ success: true, pendingCount: pendingCount });
//   } catch (err) {
//     console.error("❌ Error fetching pending count:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// // ดึงยอดขายรวมและออเดอร์วันนี้ (Total Sales & Today's Orders)
// app.post("/api/getSalesSummary", async (req, res) => {
//   try {
//     // 1. ยอดขายรวมตลอดกาล (Total Sales)
//     const sqlTotalSales = `
//             SELECT SUM(total_price) AS total_sales
//             FROM testdb.listorder 
//             WHERE status = 'completed';
//         `;

//     // 2. จำนวนออเดอร์วันนี้ (Today's Order Count)
//     const sqlTodayOrdersCount = `
//             SELECT COUNT(id) AS today_orders_count
//             FROM testdb.listorder
//             WHERE status = 'completed' 
//             AND DATE(update_status) = CURDATE();
//         `;

//     // 3. **✅ ยอดขายรวมวันนี้ (Today's Sales Amount)**
//     const sqlTodaySalesAmount = `
//             SELECT SUM(total_price) AS today_sales_amount
//             FROM testdb.listorder 
//             WHERE status = 'completed'
//             AND DATE(update_status) = CURDATE();
//         `;

//     const [totalResults] = await db.query(sqlTotalSales);
//     const [todayCountResults] = await db.query(sqlTodayOrdersCount);
//     const [todayAmountResults] = await db.query(sqlTodaySalesAmount); // ✅ ดึงยอดขายวันนี้

//     const totalSales =
//       totalResults.length > 0 && totalResults[0].total_sales !== null
//         ? totalResults[0].total_sales
//         : 0;
//     const todayOrders =
//       todayCountResults.length > 0
//         ? todayCountResults[0].today_orders_count
//         : 0;
//     // ✅ เตรียมค่าใหม่
//     const todaySalesAmount =
//       todayAmountResults.length > 0 &&
//       todayAmountResults[0].today_sales_amount !== null
//         ? todayAmountResults[0].today_sales_amount
//         : 0;

//     res.json({
//       success: true,
//       totalSales: totalSales,
//       todayOrders: todayOrders,
//       todaySalesAmount: todaySalesAmount, // ✅ ส่งค่าใหม่กลับไป
//     });
//   } catch (err) {
//     console.error("❌ Error fetching sales summary:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });

// // API สำหรับดึงข้อมูลยอดขายรายวันสำหรับกราฟ
// app.post("/api/getDailySales", async (req, res) => {
//   try {
//     const sql = `
//             SELECT 
//                 CASE DAYOFWEEK(update_status)
//                     WHEN 1 THEN 'Sun'
//                     WHEN 2 THEN 'Mon'
//                     WHEN 3 THEN 'Tue'
//                     WHEN 4 THEN 'Wed'
//                     WHEN 5 THEN 'Thu'
//                     WHEN 6 THEN 'Fri'
//                     WHEN 7 THEN 'Sat'
//                 END AS day,
//                 SUM(total_price) AS sales,
//                 DAYOFWEEK(update_status) AS day_order
//             FROM testdb.listorder 
//             WHERE status = 'completed' 
//             GROUP BY day, day_order
//             ORDER BY day_order;
//         `;

//     const [results] = await db.query(sql);

//     // Map ชื่อวันเป็นภาษาไทย (ถ้าต้องการ) และจัดการข้อมูลให้มี 7 วันเสมอ
//     const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const fullSalesData = daysOfWeek.map((dayName) => {
//       const dataRow = results.find((row) => row.day === dayName);
//       return {
//         day: dayName,
//         sales: dataRow ? parseFloat(dataRow.sales) : 0,
//       };
//     });

//     res.json({ success: true, salesData: fullSalesData });
//   } catch (err) {
//     console.error("❌ Error fetching daily sales data:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });



const express = require("express");
const mongoose = require("mongoose"); // เปลี่ยนจาก mysql2
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken"); // เพิ่ม JWT (ถ้าใช้)

const app = express();

// Middleware
const allowedOrigin = "https://my-react-order-system-app.vercel.app"; // <--- Domain ของคุณ
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// ----------------------------------------------------------------
// 1. Mongoose Schema: จำลองโครงสร้างตาราง MySQL เดิม
// ----------------------------------------------------------------

// 1.1 User Schema (สำหรับตาราง user)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
}, { collection: 'user' }); // กำหนดชื่อ Collection (เหมือนตาราง)

// 1.2 MasterOrder Schema (สำหรับตาราง masterorder/menu)
const MasterOrderSchema = new mongoose.Schema({
    ordername: { type: String, required: true },
    price: { type: Number, required: true },
    // id จะถูกสร้างโดย MongoDB อัตโนมัติ (_id)
}, { collection: 'masterorder' });

// 1.3 ListOrder Schema (สำหรับตาราง listorder/order)
const ListOrderSchema = new mongoose.Schema({
    tablenum: { type: String, required: true },
    listorder: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total_price: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    update_status: { type: Date, default: Date.now } // สำหรับการนับยอดขายรายวัน
}, { collection: 'listorder' });

const User = mongoose.model('User', UserSchema);
const MasterOrder = mongoose.model('MasterOrder', MasterOrderSchema);
const ListOrder = mongoose.model('ListOrder', ListOrderSchema);


// ----------------------------------------------------------------
// 2. Database Connection (เชื่อมต่อเมื่อมีการเรียกใช้ Function)
// ----------------------------------------------------------------

let isConnected;

// ฟังก์ชันเชื่อมต่อ MongoDB
async function connectToDatabase() {
    if (isConnected) {
        // console.log('=> Using existing database connection');
        return;
    }

    try {
        // MONGODB_URI ต้องถูกตั้งค่าใน Environment Variables ของ Vercel
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // ไม่ต้องใช้ useCreateIndex และ useFindAndModify แล้วใน Mongoose 6+
        });
        isConnected = true;
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        throw new Error("Database connection failed");
    }
}

// ----------------------------------------------------------------
// 3. API Routes (แปลงจาก SQL Query เป็น Mongoose/MDB)
// ----------------------------------------------------------------

// Middleware: ใช้เชื่อมต่อ DB ทุกครั้งที่เรียก API
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Database connection failed" });
    }
});


// POST /api/login route
app.post("/api/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findOne({ name }); // Mongoose Find

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // ถ้าใช้ JWT: const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
                res.json({
                    success: true,
                    message: "เข้าสู่ระบบสำเร็จ!",
                    role: user.role,
                    user: { name: user.name, role: user.role, id: user._id },
                });
            } else {
                res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
            }
        } else {
            res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// POST /api/register
app.post("/api/register", async (req, res) => {
    const { name, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ name });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            password: hashedPassword,
            role: role || 'user', // กำหนดค่าเริ่มต้นถ้าไม่ได้ระบุ
        });

        await newUser.save(); // Mongoose Insert

        res.json({
            success: true,
            message: "ลงทะเบียนสำเร็จ!",
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});

// POST /api/getuser
app.post("/api/getuser", async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ _id: -1 }); // Mongoose Find & Sort
        res.json({ success: true, users: users });
    } catch (err) {
        console.error("❌ Get user list error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// PATCH /api/updateProfileByAdmin/:name
app.patch("/api/updateProfileByAdmin/:name", async (req, res) => {
    const oldName = req.params.name;
    const { newName, newPassword, newRole } = req.body;

    const updateFields = {};

    try {
        // 1. จัดการการเปลี่ยนชื่อผู้ใช้
        if (newName && newName !== oldName) {
            const existingUser = await User.findOne({ name: newName });
            if (existingUser) {
                return res.status(409).json({ success: false, message: "ชื่อผู้ใช้ใหม่นี้ถูกใช้แล้ว" });
            }
            updateFields.name = newName;
        }

        // 2. จัดการการเปลี่ยนรหัสผ่าน
        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
            }
            updateFields.password = await bcrypt.hash(newPassword, saltRounds);
        }

        // 3. จัดการการเปลี่ยนบทบาท
        if (newRole) {
            if (newRole !== "admin" && newRole !== "user") {
                return res.status(400).json({ success: false, message: "บทบาทไม่ถูกต้อง" });
            }
            updateFields.role = newRole;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข" });
        }

        const result = await User.findOneAndUpdate(
            { name: oldName },
            { $set: updateFields },
            { new: true } // Mongoose update
        );

        if (result) {
            res.json({ success: true, message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!" });
        } else {
            res.status(404).json({ success: false, message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
        }

    } catch (error) {
        console.error("❌ Admin update profile error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
    }
});

// DELETE /api/deleteuser/:id
app.delete("/api/deleteuser/:id", async (req, res) => {
    const { id } = req.params; // ID ใน MongoDB คือ _id
    try {
        const result = await User.findByIdAndDelete(id); // Mongoose delete

        if (result) {
            res.json({ success: true, message: "ลบผู้ใช้สำเร็จ" });
        } else {
            res.status(404).json({ success: false, message: "ไม่พบผู้ใช้ ID นี้ที่ต้องการลบ" });
        }
    } catch (error) {
        console.error("❌ Delete user error:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
    }
});

// ----------------------------------------------------------------
// 4. Order & Menu API
// ----------------------------------------------------------------

// POST /api/order
app.post("/api/order", async (req, res) => {
    const { tablenum, listorder, qty, price, total_price } = req.body;
    try {
        const newOrder = new ListOrder({
            tablenum,
            listorder,
            qty,
            price,
            total_price,
            status: 'pending'
        });
        const result = await newOrder.save();
        res.json({ success: true, message: "Order added successfully", orderId: result._id });
    } catch (err) {
        console.error("❌ Order save error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// PATCH /api/completeOrder
app.patch("/api/completeOrder", async (req, res) => {
    const { id } = req.body;
    try {
        const result = await ListOrder.findByIdAndUpdate(
            id,
            { status: 'completed', update_status: new Date() },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: "ไม่พบออเดอร์ หรือออเดอร์เสร็จสิ้นไปแล้ว" });
        }
        res.json({ success: true, message: "ออเดอร์เสร็จสิ้นและบันทึกยอดขายแล้ว" });
    } catch (err) {
        console.error("❌ Error completing order:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// POST /api/getorder
app.post("/api/getorder", async (req, res) => {
    try {
        const orders = await ListOrder.find().sort({ _id: -1 }).limit(1000);
        res.json({ success: true, orders: orders });
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// PATCH /api/updateOrder
app.patch("/api/updateOrder", async (req, res) => {
    const { id, tablenum, listorder, qty, price, total_price } = req.body;
    try {
        const result = await ListOrder.findByIdAndUpdate(
            id,
            { tablenum, listorder, qty, price, total_price },
            { new: true }
        );
        if (result) {
            res.json({ success: true, message: "Update order successfully" });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// DELETE /api/deleteOrder/:id
app.delete("/api/deleteOrder/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await ListOrder.findByIdAndDelete(id);
        if (result) {
            res.json({ success: true, message: "Delete order successfully" });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// POST /api/getmenu
app.post("/api/getmenu", async (req, res) => {
    try {
        const menu = await MasterOrder.find().sort({ _id: -1 }).limit(1000);
        res.json({ success: true, menu: menu });
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// POST /api/addmenu
app.post("/api/addmenu", async (req, res) => {
    const { menuname, price } = req.body;
    try {
        const newMenu = new MasterOrder({ ordername: menuname, price });
        const result = await newMenu.save();
        res.json({ success: true, message: "Menu added successfully", orderId: result._id });
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// PATCH /api/updatemenu
app.patch("/api/updatemenu", async (req, res) => {
    const { id, menuname, price } = req.body;
    try {
        const result = await MasterOrder.findByIdAndUpdate(
            id,
            { ordername: menuname, price },
            { new: true }
        );
        if (result) {
            res.json({ success: true, message: "Update menu successfully" });
        } else {
            res.status(404).json({ success: false, message: "Menu not found" });
        }
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// DELETE /api/deletemenu/:id
app.delete("/api/deletemenu/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await MasterOrder.findByIdAndDelete(id);
        if (result) {
            res.json({ success: true, message: "Delete order successfully" });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (err) {
        console.error("❌ Query error:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ดึงจำนวน "กำลังทำอาหาร" (Pending Count)
app.post("/api/getPendingOrderCount", async (req, res) => {
    try {
        const pendingCount = await ListOrder.countDocuments({ status: 'pending' });
        res.json({ success: true, pendingCount: pendingCount });
    } catch (err) {
        console.error("❌ Error fetching pending count:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ดึงยอดขายรวมและออเดอร์วันนี้ (Total Sales & Today's Orders)
app.post("/api/getSalesSummary", async (req, res) => {
    try {
        // หา Total Sales และ Today's Sales/Count โดยใช้ Aggregation Pipeline (วิธีที่ดีที่สุดสำหรับ MongoDB)
        const totalSalesData = await ListOrder.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total_price" },
                    data: { $push: "$$ROOT" } // เก็บเอกสารทั้งหมดไว้ใน array เพื่อใช้ต่อ
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    todaySalesAmount: {
                        $sum: {
                            $filter: {
                                input: "$data",
                                as: "item",
                                cond: {
                                    $gte: [
                                        "$$item.update_status",
                                        new Date(new Date().setHours(0, 0, 0, 0)) // วันที่เริ่มต้นวันนี้
                                    ]
                                }
                            }
                        }
                    },
                    todayOrdersCount: {
                        $size: {
                            $filter: {
                                input: "$data",
                                as: "item",
                                cond: {
                                    $gte: [
                                        "$$item.update_status",
                                        new Date(new Date().setHours(0, 0, 0, 0)) // วันที่เริ่มต้นวันนี้
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const summary = totalSalesData[0] || {};
        const totalSales = summary.totalSales || 0;
        const todaySalesAmount = summary.todaySalesAmount || 0;
        const todayOrders = summary.todayOrdersCount || 0;

        res.json({
            success: true,
            totalSales: totalSales,
            todayOrders: todayOrders,
            todaySalesAmount: todaySalesAmount,
        });

    } catch (err) {
        console.error("❌ Error fetching sales summary:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// API สำหรับดึงข้อมูลยอดขายรายวันสำหรับกราฟ
app.post("/api/getDailySales", async (req, res) => {
    try {
        const dailySales = await ListOrder.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: { $dayOfWeek: "$update_status" }, // 1 (อาทิตย์) ถึง 7 (เสาร์)
                    sales: { $sum: "$total_price" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const fullSalesData = daysOfWeek.map((dayName, index) => {
            const dataRow = dailySales.find(row => row._id === index + 1); // 1-based index for dayOfWeek
            return {
                day: dayName,
                sales: dataRow ? dataRow.sales : 0,
            };
        });

        res.json({ success: true, salesData: fullSalesData });
    } catch (err) {
        console.error("❌ Error fetching daily sales data:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ----------------------------------------------------------------
// 5. Vercel Serverless Export
// ----------------------------------------------------------------

// Vercel Serverless Function จะใช้การ Export นี้แทน app.listen()
module.exports = app;

