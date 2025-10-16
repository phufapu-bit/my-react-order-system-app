import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  const contentMargin = isLoginPage ? "0" : sidebarOpen ? "300px" : "0";
  const contentPaddingTop = isLoginPage ? "0" : "70px"; // Padding-top สำหรับเว้นพื้นที่ Navbar

  return (
    <>
      {/* Sidebar ถูกแยกออกจาก div หลักเพื่อให้อยู่ในตำแหน่ง fixed/absolute */}
      {!isLoginPage && <Sidebar isOpen={sidebarOpen} />}

      {/* 🟢 Container หลัก: จัดการ Layout Flexbox */}
      <div
        style={{
          marginLeft: contentMargin,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh", 
        }}
      >
        {!isLoginPage && (
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <div style={{ flex: 1, paddingTop: contentPaddingTop }}>
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

        {!isLoginPage && <Footer />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
