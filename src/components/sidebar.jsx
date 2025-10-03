import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import LogoIcon from "../assets/images/checkout (1).png";
import HomeIcon from "../assets/images/home.png";
import OrderIcon from "../assets/images/checklist.png";
import MenuIcon from "../assets/images/bar.png";
import ResultIcon from "../assets/images/results.png";
import UserIcon from "../assets/images/man.png";

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
          src={LogoIcon}
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
              src={HomeIcon}
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
              src={OrderIcon}
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
              src={MenuIcon}
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
              src={ResultIcon}
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
        {ROLE === "admin" && (
          <>
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
                  src={UserIcon}
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
