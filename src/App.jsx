import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // <-- เพิ่ม useLocation
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";
import Home from "./pages/Home";
import Resultpage from "./pages/Result";
import Login from "./login/Loginpage";
import PrivateRoute from "./components/PrivateRoute";
import Orderpage from "./pages/Order";
import Footer from "./components/footer";
import Menupage from "./pages/Menu";
import EditUserpage from "./pages/EditUser"; 

function MainApp() { // เปลี่ยน App component หลักเป็น MainApp
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation(); // <-- ใช้ useLocation เพื่อดึง Path ปัจจุบัน
  
  // ตรวจสอบว่า Path ปัจจุบันคือ /login หรือไม่
  const isLoginPage = location.pathname === "/login"; 
  
  // กำหนด margin-left สำหรับ content
  const contentMargin = isLoginPage ? "0" : (sidebarOpen ? "300px" : "0");
  // กำหนด padding-top สำหรับเนื้อหาหลัก
  const contentPaddingTop = isLoginPage ? "0" : "70px";

  return (
    <> {/* ไม่ใช้ <Router> ที่นี่ เพราะ MainApp ถูกห่อด้วย Router ด้านล่าง */}
      
      {/* 1. Sidebar (ซ่อนถ้าเป็นหน้า Login) */}
      {!isLoginPage && <Sidebar isOpen={sidebarOpen} />}

      {/* Main content container */}
      <div
        style={{
          marginLeft: contentMargin, // ใช้ margin ที่ปรับตามหน้า Login
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* 2. Navbar (ซ่อนถ้าเป็นหน้า Login) */}
        {!isLoginPage && <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}

        {/* ส่วนเนื้อหา */}
        <div
          style={{ flex: 1, paddingTop: contentPaddingTop }} // ใช้ paddingTop ที่ปรับตามหน้า Login
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route path="/resultpage" element={<Resultpage />} />
            <Route path="/Orderpage" element={<Orderpage />} />
            <Route path="/Menupage" element={<Menupage />} />
            <Route
              path="/EditUserpage"
              element={
                <PrivateRoute>
                  <EditUserpage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

        {/* Footer (คุณอาจต้องการซ่อน Footer ในหน้า Login ด้วย) */}
        {!isLoginPage && <Footer />} 
      </div>
    </>
  );
}

// Component App() เดิม ใช้สำหรับห่อ MainApp ด้วย Router
export default function App() {
    return (
        <Router>
            <MainApp />
        </Router>
    );
}