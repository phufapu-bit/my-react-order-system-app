const express = require("express");
const mysql = require("mysql2/promise"); // ใช้ mysql2/promise
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const PORT = 3001;

// URL ของ Frontend (Production Domain จาก Vercel)
const allowedOrigin = "https://my-react-order-system-app.vercel.app"; // <--- Domain ของคุณ

const corsOptions = {
  origin: allowedOrigin,
  // อนุญาตให้ส่ง Credentials (เช่น Cookies, Authorization Headers) ซึ่งจำเป็นสำหรับระบบ Login/JWT
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Database connection using async/await
// const db = mysql.createPool({
//   // เปลี่ยนเป็น pool เพื่อประสิทธิภาพที่ดีกว่า
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "testdb",
// });

const db = mysql.createPool({
  host: process.env.DB_HOST, // อ่านค่าจากตัวแปร DB_HOST ที่ตั้งใน Railway
  user: process.env.DB_USER, // อ่านค่าจากตัวแปร DB_USER
  password: process.env.DB_PASSWORD, // อ่านค่าจากตัวแปร DB_PASSWORD
  database: process.env.DB_DATABASE, // อ่านค่าจากตัวแปร DB_DATABASE
});

// Start the server only after a successful database connection
(async function startServer() {
  try {
    await db.getConnection(); // ตรวจสอบการเชื่อมต่อ
    console.log("✅ Connected to MySQL");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

//---

// POST /login route (แก้ไขให้ใช้ async/await และ bcrypt)
app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res
      .status(400)
      .json({ success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
  }

  try {
    const sql = "SELECT * FROM testdb.user WHERE name = ?";
    const [results] = await db.query(sql, [name]);

    if (results.length > 0) {
      const user = results[0];
      // เปรียบเทียบรหัสผ่านที่เข้ารหัสแล้ว
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // ส่ง role กลับไปใน response
        res.json({
          success: true,
          message: "เข้าสู่ระบบสำเร็จ!",
          role: user.role,
          user: user,
        });
      } else {
        res.status(401).json({
          success: false,
          message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        });
      }
    } else {
      res
        .status(401)
        .json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.post("/api/getuser", async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้ทั้งหมด (ยกเว้นรหัสผ่าน ถ้าไม่จำเป็นต้องแสดง)
    const sql = "SELECT * FROM testdb.user ORDER BY id DESC";
    const [results] = await db.query(sql);

    // *** โครงสร้างการส่งข้อมูลกลับที่ถูกต้อง ***
    res.json({
      success: true,
      users: results, // ส่งข้อมูลเป็น Array ภายใต้คีย์ 'users'
    });
  } catch (err) {
    console.error("❌ Get user list error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.patch("/api/updateProfileByAdmin/:name", async (req, res) => {
  const oldName = req.params.name;
  const { newName, newPassword, newRole } = req.body;

  if (!newName && !newPassword && !newRole) {
    return res
      .status(400)
      .json({ success: false, message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข" });
  }

  try {
    const updates = [];
    const params = [];

    // 1. จัดการการเปลี่ยนชื่อผู้ใช้
    if (newName && newName !== oldName) {
      // ตรวจสอบชื่อใหม่ว่าถูกใช้ไปแล้วหรือไม่
      const checkSql = "SELECT name FROM testdb.user WHERE name = ?";
      const [existingUsers] = await db.query(checkSql, [newName]);
      if (existingUsers.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "ชื่อผู้ใช้ใหม่นี้ถูกใช้แล้ว" });
      }
      updates.push("name = ?");
      params.push(newName);
    }

    // 2. จัดการการเปลี่ยนรหัสผ่าน (ถ้ามีการป้อนรหัสผ่านใหม่)
    if (newPassword) {
      if (newPassword.length < 6) {
        // ตัวอย่างการตรวจสอบความยาวขั้นต่ำ
        return res.status(400).json({
          success: false,
          message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
        });
      }
      // เข้ารหัสรหัสผ่านใหม่ด้วย bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    // 3. จัดการการเปลี่ยนบทบาท
    if (newRole) {
      if (newRole !== "admin" && newRole !== "user") {
        return res
          .status(400)
          .json({ success: false, message: "บทบาทไม่ถูกต้อง" });
      }
      updates.push("role = ?");
      params.push(newRole);
    }

    // รวม SQL Query และทำการอัปเดต
    const sql = `UPDATE testdb.user SET ${updates.join(", ")} WHERE name = ?`;

    // หากมีการเปลี่ยนชื่อผู้ใช้ ต้องใช้ชื่อเดิม (oldName) ในการค้นหา
    // แต่ถ้าเปลี่ยนชื่อ, อัปเดต name = ? จะถูกเพิ่มเข้าไปใน params ก่อนแล้ว
    params.push(oldName);

    const [results] = await db.query(sql, params);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }
  } catch (error) {
    console.error("❌ Admin update profile error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
    });
  }
});

app.delete("/api/deleteuser/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // ป้องกันการลบตัวเอง (ถ้าคุณมี session หรือ token ของ admin)
    // if (req.user.id == id) {
    //     return res.status(403).json({ success: false, message: "ไม่สามารถลบบัญชีผู้ใช้ของคุณเองได้" });
    // }

    const sql = "DELETE FROM testdb.user WHERE id = ?";
    const [results] = await db.query(sql, [id]);

    if (results.affectedRows > 0) {
      res.json({ success: true, message: "ลบผู้ใช้สำเร็จ" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "ไม่พบผู้ใช้ ID นี้ที่ต้องการลบ" });
    }
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
    });
  }
});

//---

// POST /api/register (โค้ดเดิมที่ถูกต้องแล้ว)
app.post("/api/register", async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "ชื่อผู้ใช้, รหัสผ่าน, และบทบาท จำเป็นต้องระบุ",
    });
  }

  try {
    const checkSql = "SELECT name FROM testdb.user WHERE name = ?";
    const [existingUsers] = await db.query(checkSql, [name]);

    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertSql =
      "INSERT INTO testdb.user (name, password, role) VALUES (?, ?, ?)";
    await db.query(insertSql, [name, hashedPassword, role]);

    res.json({
      success: true,
      message: "ลงทะเบียนสำเร็จ!",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

// ส่วน API อื่นๆ ที่เหลือ ให้ปรับแก้จาก db.query(...) เป็น await db.query(...) ทั้งหมด

app.post("/api/order", async (req, res) => {
  const { tablenum, listorder, qty, price, total_price } = req.body;
  if (!tablenum || !listorder || !qty) {
    return res.status(400).json({
      success: false,
      message: "tableNumber, listOrder, qty required",
    });
  }
  try {
    const sql =
      "INSERT INTO testdb.listorder (tablenum, listorder, qty, price, total_price, status) VALUES (?, ?, ?, ?, ?, 'pending')";
    const [results] = await db.query(sql, [
      tablenum,
      listorder,
      qty,
      price,
      total_price,
    ]);
    res.json({
      success: true,
      message: "Order added successfully",
      orderId: results.insertId,
    });
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.patch("/api/completeOrder", async (req, res) => {
  const { id } = req.body;

  try {
    const sql = `
            UPDATE listorder 
            SET status = 'completed', update_status = CURRENT_TIMESTAMP() 
            WHERE id = ?;
        `;
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบออเดอร์ หรือออเดอร์เสร็จสิ้นไปแล้ว",
      });
    }

    res.json({ success: true, message: "ออเดอร์เสร็จสิ้นและบันทึกยอดขายแล้ว" });
  } catch (err) {
    console.error("❌ Error completing order:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.post("/api/getorder", async (req, res) => {
  try {
    const sql = "SELECT * FROM testdb.listorder ORDER BY id DESC LIMIT 1000";
    const [results] = await db.query(sql);
    res.json({ success: true, orders: results });
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.patch("/api/updateOrder", async (req, res) => {
  const { id, tablenum, listorder, qty, price, total_price } = req.body;
  if (!id || !tablenum || !listorder || !qty) {
    return res.status(400).json({
      success: false,
      message: "id, tableNumber, listOrder, qty required",
    });
  }
  try {
    const sql =
      "UPDATE testdb.listorder SET tablenum = ?, listorder = ?, qty = ?, price = ?, total_price = ? WHERE id = ?";
    const [results] = await db.query(sql, [
      tablenum,
      listorder,
      qty,
      price,
      total_price,
      id,
    ]);
    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Update order successfully" });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.delete("/api/deleteOrder/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "id required" });
  }
  try {
    const sql = "DELETE FROM testdb.listorder WHERE id = ?";
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Delete order successfully" });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.post("/api/getmenu", async (req, res) => {
  try {
    const sql = "SELECT * FROM testdb.masterorder ORDER BY id DESC LIMIT 1000";
    const [results] = await db.query(sql);
    res.json({ success: true, menu: results });
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.post("/api/addmenu", async (req, res) => {
  const { menuname, price } = req.body;
  if (!menuname || !price) {
    return res
      .status(400)
      .json({ success: false, message: "menuname, price required" });
  }
  try {
    const sql =
      "INSERT INTO testdb.masterorder (ordername, price) VALUES (?, ?)";
    const [results] = await db.query(sql, [menuname, price]);
    res.json({
      success: true,
      message: "Menu added successfully",
      orderId: results.insertId,
    });
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.patch("/api/updatemenu", async (req, res) => {
  const { id, menuname, price } = req.body;
  if (!id || !menuname || !price) {
    return res
      .status(400)
      .json({ success: false, message: "id, menuname, price required" });
  }
  try {
    const sql =
      "UPDATE testdb.masterorder SET ordername = ?, price = ? WHERE id = ?";
    const [results] = await db.query(sql, [menuname, price, id]);
    if (results.affectedRows > 0) {
      res.json({ success: true, message: "Update menu successfully" });
    } else {
      res.status(404).json({ success: false, message: "Menu not found" });
    }
  } catch (err) {
    console.error("❌ Query error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

//---

app.delete("/api/deletemenu/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "id required" });
  }
  try {
    const sql = "DELETE FROM testdb.masterorder WHERE id = ?";
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows > 0) {
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
    const sql =
      "SELECT COUNT(*) AS pending_count FROM testdb.listorder WHERE status = 'pending';";
    const [results] = await db.query(sql);
    const pendingCount = results.length > 0 ? results[0].pending_count : 0;
    res.json({ success: true, pendingCount: pendingCount });
  } catch (err) {
    console.error("❌ Error fetching pending count:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ดึงยอดขายรวมและออเดอร์วันนี้ (Total Sales & Today's Orders)
app.post("/api/getSalesSummary", async (req, res) => {
  try {
    // 1. ยอดขายรวมตลอดกาล (Total Sales)
    const sqlTotalSales = `
            SELECT SUM(total_price) AS total_sales
            FROM testdb.listorder 
            WHERE status = 'completed';
        `;

    // 2. จำนวนออเดอร์วันนี้ (Today's Order Count)
    const sqlTodayOrdersCount = `
            SELECT COUNT(id) AS today_orders_count
            FROM testdb.listorder
            WHERE status = 'completed' 
            AND DATE(update_status) = CURDATE();
        `;

    // 3. **✅ ยอดขายรวมวันนี้ (Today's Sales Amount)**
    const sqlTodaySalesAmount = `
            SELECT SUM(total_price) AS today_sales_amount
            FROM testdb.listorder 
            WHERE status = 'completed'
            AND DATE(update_status) = CURDATE();
        `;

    const [totalResults] = await db.query(sqlTotalSales);
    const [todayCountResults] = await db.query(sqlTodayOrdersCount);
    const [todayAmountResults] = await db.query(sqlTodaySalesAmount); // ✅ ดึงยอดขายวันนี้

    const totalSales =
      totalResults.length > 0 && totalResults[0].total_sales !== null
        ? totalResults[0].total_sales
        : 0;
    const todayOrders =
      todayCountResults.length > 0
        ? todayCountResults[0].today_orders_count
        : 0;
    // ✅ เตรียมค่าใหม่
    const todaySalesAmount =
      todayAmountResults.length > 0 &&
      todayAmountResults[0].today_sales_amount !== null
        ? todayAmountResults[0].today_sales_amount
        : 0;

    res.json({
      success: true,
      totalSales: totalSales,
      todayOrders: todayOrders,
      todaySalesAmount: todaySalesAmount, // ✅ ส่งค่าใหม่กลับไป
    });
  } catch (err) {
    console.error("❌ Error fetching sales summary:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// API สำหรับดึงข้อมูลยอดขายรายวันสำหรับกราฟ
app.post("/api/getDailySales", async (req, res) => {
  try {
    const sql = `
            SELECT 
                CASE DAYOFWEEK(update_status)
                    WHEN 1 THEN 'Sun'
                    WHEN 2 THEN 'Mon'
                    WHEN 3 THEN 'Tue'
                    WHEN 4 THEN 'Wed'
                    WHEN 5 THEN 'Thu'
                    WHEN 6 THEN 'Fri'
                    WHEN 7 THEN 'Sat'
                END AS day,
                SUM(total_price) AS sales,
                DAYOFWEEK(update_status) AS day_order
            FROM testdb.listorder 
            WHERE status = 'completed' 
            GROUP BY day, day_order
            ORDER BY day_order;
        `;

    const [results] = await db.query(sql);

    // Map ชื่อวันเป็นภาษาไทย (ถ้าต้องการ) และจัดการข้อมูลให้มี 7 วันเสมอ
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fullSalesData = daysOfWeek.map((dayName) => {
      const dataRow = results.find((row) => row.day === dayName);
      return {
        day: dayName,
        sales: dataRow ? parseFloat(dataRow.sales) : 0,
      };
    });

    res.json({ success: true, salesData: fullSalesData });
  } catch (err) {
    console.error("❌ Error fetching daily sales data:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});
