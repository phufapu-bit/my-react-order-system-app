import React, { useState, useEffect } from "react";
import axios from "axios"; // อย่าลืม import axios
import "../App.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Resultpage() {
  // **State สำหรับข้อมูล Dashboard**
  const [salesData, setSalesData] = useState([]); // สำหรับกราฟ
  const [todayOrders, setTodayOrders] = useState(0); // Card: ออเดอร์วันนี้
  const [totalSales, setTotalSales] = useState(0); // Card: ยอดขายรวม
  const [pendingCount, setPendingCount] = useState(0); // Card: กำลังทำอาหาร
  const [todaySalesAmount, setTodaySalesAmount] = useState(0);
  const [chartType, setChartType] = useState("line");

  // --- ฟังก์ชันดึงข้อมูลจาก API ---

  // 1. ดึงยอดขายรวมและออเดอร์วันนี้
  const fetchSalesSummary = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/getSalesSummary");
      if (res.data.success) {
        // ต้องแน่ใจว่า Backend ส่ง totalSales และ todayOrders กลับมา
        setTotalSales(res.data.totalSales || 0);
        setTodayOrders(res.data.todayOrders || 0);
        setTodaySalesAmount(res.data.todaySalesAmount || 0);
      }
    } catch (error) {
      console.error("Error fetching sales summary:", error);
    }
  };

  // 2. ดึงจำนวนออเดอร์กำลังทำ
  const fetchPendingCount = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/getPendingOrderCount"
      );
      if (res.data.success) {
        // ต้องแน่ใจว่า Backend ส่ง pendingCount กลับมา
        setPendingCount(res.data.pendingCount || 0);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  // 3. ดึงข้อมูลยอดขายรายวันสำหรับกราฟ (สมมติว่ามี API นี้)
  const fetchSalesData = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/getDailySales");
      if (res.data.success) {
        setSalesData(res.data.salesData); // คาดหวังรูปแบบ: [{ day: 'Mon', sales: 1000 }, ...]
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      // ข้อมูลจำลองสำรอง หากเชื่อมต่อ API กราฟไม่ได้
      setSalesData([
        { day: "Mon", sales: 200 },
        { day: "Tue", sales: 450 },
        { day: "Wed", sales: 300 },
        { day: "Thu", sales: 500 },
        { day: "Fri", sales: 700 },
        { day: "Sat", sales: 650 },
        { day: "Sun", sales: 400 },
      ]);
    }
  };

  // **useEffect สำหรับโหลดข้อมูลทั้งหมดเมื่อ Component ถูก Mount**
  useEffect(() => {
    fetchSalesSummary();
    fetchPendingCount();
    fetchSalesData();

    // หากต้องการอัปเดตข้อมูลอัตโนมัติทุกๆ 2 วินาที
    const interval = setInterval(() => {
      fetchSalesSummary();
      fetchPendingCount();
      fetchSalesData();
    }, 2000);

    return () => clearInterval(interval); // Clear interval เมื่อ Component ถูกถอดออก
  }, []);

  // function render chart ตามชนิด (ใช้ logic เดิม)
  const renderChart = () => {
    // ใช้ logic เดิมจากโค้ดของคุณ โดยใช้ salesData ที่ดึงมาจาก State
    switch (chartType) {
      case "line":
        return (
          <LineChart
            data={salesData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#555", fontSize: 16, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 16, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                borderColor: "#ccc",
                fontFamily: "sans-serif",
                letterSpacing: "0.5px",
              }}
              itemStyle={{ color: "#1f3b6f", fontWeight: 500 }}
              labelStyle={{ fontWeight: "bold", fontSize: "20px" }}
            />
            <Legend
              verticalAlign="top"
              height={30}
              wrapperStyle={{
                fontSize: "16px",
                color: "#1f3b6f",
                fontWeight: 600,
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="url(#colorLine)"
              strokeWidth={5}
              dot={{ r: 6, fill: "#1f3b6f", stroke: "#fff", strokeWidth: 1 }}
              activeDot={{ r: 8 }}
            />
            <defs>
              <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1f3b6f" />
                <stop offset="100%" stopColor="#f0c987" />
              </linearGradient>
            </defs>
          </LineChart>
        );
      case "bar":
        return (
          <BarChart
            data={salesData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#555", fontSize: 18, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 18, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={30}
              wrapperStyle={{
                fontSize: "16px",
                color: "#1f3b6f",
                fontWeight: 600,
              }}
            />
            <Bar dataKey="sales" fill="#1f3b6f" />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart
            data={salesData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#555", fontSize: 18, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 18, fontWeight: 500 }}
              axisLine={{ stroke: "#ccc" }}
            />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={30}
              wrapperStyle={{
                fontSize: "16px",
                color: "#1f3b6f",
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#1f3b6f"
              fill="url(#colorArea)"
            />
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f3b6f" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f0c987" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <h1
        className="header-title"
        style={{
          background: "linear-gradient(90deg, #2e5d4f, #a8d5ba)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Kanit', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        สรุปยอดรวม
      </h1>

      <div className="row mb-4">
        {/* Card 1: จำนวนออเดอร์วันนี้ (โทนสีส้มอ่อน/ขาว) */}
        <div className="col-md-3 mb-3">
          <div
            className="card p-4 shadow-sm text-center"
            style={{
              borderRadius: "15px",
              // 🟠 โทนส้ม
              background: "linear-gradient(135deg, #FFF0E6, #ffffff)",
              borderLeft: "5px solid #ff7f27", // เพิ่มแถบสีด้านซ้าย
            }}
          >
            <h3
              style={{
                color: "#ff7f27", // สีส้มเข้ม
                fontWeight: 700,
                fontFamily: "'Kanit', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              ออเดอร์วันนี้
            </h3>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#ff7f27",
                margin: 0,
              }}
            >
              {todayOrders}
            </p>
          </div>
        </div>

        {/* Card 2: ยอดขายวันนี้ (โทนสีเขียว/เหลือง) */}
        <div className="col-md-3 mb-3">
          <div
            className="card p-4 shadow-sm text-center"
            style={{
              borderRadius: "15px",
              // 🟢 โทนเขียว/เหลือง
              background: "linear-gradient(135deg, #ECF9E3, #ffffff)",
              borderLeft: "5px solid #2e5d4f",
            }}
          >
            <h3
              style={{
                color: "#2e5d4f", // สีเขียวเข้ม
                fontWeight: 700,
                fontFamily: "'Kanit', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              ยอดขายวันนี้
            </h3>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#2e5d4f",
                margin: 0,
              }}
            >
              ฿
              {Number(todaySalesAmount).toLocaleString("th-TH", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Card 3: ยอดขายรวมทั้งหมด (โทนสีม่วง/น้ำเงิน) */}
        <div className="col-md-3 mb-3">
          <div
            className="card p-4 shadow-sm text-center"
            style={{
              borderRadius: "15px",
              // 🟣 โทนม่วง
              background: "linear-gradient(135deg, #EBE6FF, #ffffff)",
              borderLeft: "5px solid #4b3f72",
            }}
          >
            <h3
              style={{
                color: "#4b3f72", // สีม่วงเข้ม
                fontWeight: 700,
                fontFamily: "'Kanit', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              ยอดขายรวมทั้งหมด
            </h3>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#4b3f72",
                margin: 0,
              }}
            >
              ฿
              {Number(totalSales).toLocaleString("th-TH", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Card 4: กำลังทำอาหาร (โทนสีฟ้า/น้ำเงินอ่อน) */}
        <div className="col-md-3 mb-3">
          <div
            className="card p-4 shadow-sm text-center"
            style={{
              borderRadius: "15px",
              // 🔵 โทนฟ้า
              background: "linear-gradient(135deg, #E6F7FF, #ffffff)",
              borderLeft: "5px solid #3b8ca7",
            }}
          >
            <h3
              style={{
                color: "#3b8ca7", // สีฟ้าเข้ม
                fontWeight: 700,
                fontFamily: "'Kanit', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              กำลังทำอาหาร
            </h3>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#3b8ca7",
                margin: 0,
              }}
            >
              {pendingCount}
            </p>
          </div>
        </div>
      </div>
      {/* Chart selector - ใช้ logic เดิม */}
      <div className="mb-3">
        <label
          style={{
            marginRight: "10px",
            fontWeight: 600,
            color: "black",
            fontFamily: "'Kanit', sans-serif",
            fontSize: "1.2rem",
            letterSpacing: "0.5px",
          }}
        >
          เลือกชนิดกราฟ:
        </label>
        <select
          value={chartType}
          style={{
            width: "110px",
            height: "40px",
            borderRadius: "10px",
            fontFamily: "'Kanit', sans-serif",
            letterSpacing: "0.5px",
          }}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>
      {/* Sales Chart - ใช้ logic เดิม */}
      <div
        className="card p-4 shadow-sm"
        style={{ borderRadius: "16px", backgroundColor: "#fdfcfb" }}
      >
        <h5
          className="text-center mb-4"
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            background: "linear-gradient(90deg, #1f3b6f, #f0c987)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Kanit', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          ยอดขายรายวัน
        </h5>
        <ResponsiveContainer width="100%" height={350}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
