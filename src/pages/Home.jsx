import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Homepage() {
  const [isGuest, setIsGuest] = useState(false);
  const ROLE = localStorage.getItem("role");
  const guestTablenum = localStorage.getItem("guest_tablenum");

  useEffect(() => {
    if (!ROLE && guestTablenum) {
      setIsGuest(true);
    } else {
      setIsGuest(false);
    }
  }, []);

  return (
    <div className="container my-5">
      <h1
        className="header-title mb-5"
        style={{
          background: "linear-gradient(90deg, #2e5d4f, #a8d5ba)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Kanit', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        {isGuest ? "ระบบสั่งอาหาร" : "ระบบจัดการร้านอาหาร"}
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
                {isGuest ? "สั่งอาหาร" : "จัดการออเดอร์"}
              </h3>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#333",
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                เพิ่ม แก้ไข และลบออเดอร์
              </p>
            </div>
          </Link>
        </div>

        {/* Card: จัดการเมนูอาหาร */}
        {!isGuest ? (
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
        ) : null}

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
                {isGuest ? "สถานะออเดอร์" : "รายงาน"}
              </h3>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#333",
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                {isGuest ? "ดูสถานะออเดอร์" : "ดูสรุปยอดขายและข้อมูลร้าน"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
