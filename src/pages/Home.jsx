import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Homepage() {
  const ROLE = localStorage.getItem("role");
  return (
    <div className="container my-5">
      <h1
        className="header-title mb-5"
        style={{
          background: "linear-gradient(90deg, #0d1b2a, #1b4332)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Kanit', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        ระบบจัดการร้านอาหาร
      </h1>

      <div className="row justify-content-center">
        {/* Card: จัดการออเดอร์ */}
        <div className="col-md-4 mb-4">
          <Link to="/Orderpage" style={{ textDecoration: "none" }}>
            <div
              className="card shadow-lg text-center p-4 h-100"
              style={{
                borderRadius: "20px",
                transition: "0.3s",
                background: "linear-gradient(135deg, #fbe8d3, #fff)",
              }}
            >
              <h3
                style={{
                  color: "#d47c3c",
                  fontWeight: 700,
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                จัดการออเดอร์
              </h3>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#333",
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                เพิ่ม แก้ไข และติดตามออเดอร์
              </p>
            </div>
          </Link>
        </div>

        {/* Card: จัดการเมนูอาหาร */}
        <div className="col-md-4 mb-4">
          <Link to="/Menupage" style={{ textDecoration: "none" }}>
            <div
              className="card shadow-lg text-center p-4 h-100"
              style={{
                borderRadius: "20px",
                transition: "0.3s",
                background: "linear-gradient(135deg, #e0d8f7, #fff)",
              }}
            >
              <h3
                style={{
                  color: "#4b3f72",
                  fontWeight: 700,
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                จัดการเมนูอาหาร
              </h3>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#333",
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                เพิ่มและแก้ไขเมนูอาหารในระบบ
              </p>
            </div>
          </Link>
        </div>

        {/* Card: รายงาน */}
        <div className="col-md-4 mb-4">
          <Link to="/resultpage" style={{ textDecoration: "none" }}>
            <div
              className="card shadow-lg text-center p-4 h-100"
              style={{
                borderRadius: "20px",
                transition: "0.3s",
                background: "linear-gradient(135deg, #d0f0f7, #fff)",
              }}
            >
              <h3
                style={{
                  color: "#3b8ca7",
                  fontWeight: 700,
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                รายงาน
              </h3>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#333",
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                ดูสรุปยอดขายและข้อมูลร้าน
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
