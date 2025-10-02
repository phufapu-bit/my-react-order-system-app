import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Sidebar({ isOpen }) {
  const ROLE = localStorage.getItem("role");
  return (
    <div
      className="sidebar bg-dark text-white p-3"
      style={{
        left: isOpen ? "0" : "-300px",
        transition: "left 0.3s",
        width: "300px",
        top: "62px",
      }}
    >
      <h2 className="mb-4 fw-bold">
        <img
          src="src\assets\images\checkout (1).png"
          alt="Logo"
          style={{
            width: "55px",
            height: "55px",
            marginRight: "10px",
          }}
        />
        Order System
      </h2>
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link text-white"
            style={{
              fontFamily: "'Kanit', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <img
              src="src\assets\images\home.png"
              alt="Home"
              style={{
                width: "30px",
                height: "30px",
                marginRight: "8px",
              }}
            />
            หน้าแรก
          </Link>
        </li>
        <li>
          <Link
            to="/Orderpage"
            className="nav-link text-white"
            style={{
              fontFamily: "'Kanit', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <img
              src="src\assets\images\checklist.png"
              alt="Order"
              style={{
                width: "30px",
                height: "30px",
                marginRight: "8px",
              }}
            />
            จัดการออเดอร์
          </Link>
        </li>
        <li>
          <Link
            to="/Menupage"
            className="nav-link text-white"
            style={{
              fontFamily: "'Kanit', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <img
              src="src\assets\images\bar.png"
              alt="Menu"
              style={{
                width: "30px",
                height: "30px",
                marginRight: "8px",
              }}
            />
            จัดการเมนูอาหาร
          </Link>
        </li>
        {ROLE === "admin" && (
          <>
            <li>
              <Link
                to="/resultpage"
                className="nav-link text-white"
                style={{
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                <img
                  src="src\assets\images\results.png"
                  alt="Result"
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "8px",
                  }}
                />
                รายงาน
              </Link>
            </li>

            <li>
              <Link
                to="/EditUserpage"
                className="nav-link text-white"
                style={{
                  fontFamily: "'Kanit', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                <img
                  src="src\assets\images\man.png"
                  alt="Result"
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "8px",
                  }}
                />
                จัดการผู้ใช้
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
