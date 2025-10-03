import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    { value: "user", label: "พนักงาน" },
    { value: "admin", label: "ผู้ดูแลระบบ" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password) {
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลให้ครบ",
      });
    }
    // "http://localhost:3001/api/login"
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
        name,
        password,
      });

      if (response.data.success) {
        Swal.fire({
          title: "คุณต้องการเข้าสู่ระบบใช่ไหม?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "ใช่",
          cancelButtonText: "ไม่",
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("name", name);
            // Save the user's role in localStorage for later use
            localStorage.setItem("role", response.data.role);
            window.dispatchEvent(new Event("storage"));

            Swal.fire({
              icon: "success",
              title: "Login สำเร็จ!",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => navigate("/"));
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login ล้มเหลว",
          text: response.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ Server ได้",
      });
    }
  };

  //ฟังก์ชันใหม่สำหรับ Guest Login
  const handleGuestLogin = () => {
    //ให้สิทธิ์ Guest เป็น 'user' (พนักงาน) เพื่อดูหน้า Order
    const guestName = "GUEST";
    const guestRole = "user";

    Swal.fire({
      title: "เข้าสู่ระบบในฐานะผู้เข้าชม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, เข้าสู่ระบบ",
      cancelButtonText: "ไม่",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("name", guestName);
        localStorage.setItem("role", guestRole); // กำหนด role เป็น 'user' สำหรับ Guest
        window.dispatchEvent(new Event("storage"));

        Swal.fire({
          icon: "info",
          title: `ยินดีต้อนรับ ${guestName}!`,
          text: "คุณกำลังใช้งานในโหมดสาธิต",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate("/"));
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !password || !role) {
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลให้ครบ",
      });
    }

    // http://localhost:3001/api/register
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, {
        name,
        password,
        role: role.value,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "ลงทะเบียนสำเร็จ!",
          text: "ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          setName("");
          setPassword("");
          setRole(null);
          setIsRegistering(false);
        });
      } else {
        // กรณี success: false แต่ไม่ได้มาจาก try-catch
        Swal.fire({
          icon: "error",
          title: "ลงทะเบียนล้มเหลว",
          text: response.data.message, // แสดงข้อความ error จาก backend
        });
      }
    } catch (error) {
      // ตรวจสอบ error จาก Axios
      const errorMessage =
        error.response?.data?.message || "ไม่สามารถเชื่อมต่อ Server ได้";
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage, // แสดงข้อความ error จาก backend
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 overflow-hidden">
      <div
        className="card shadow-lg p-4 w-100"
        style={{
          backgroundColor: "#F9F6EE",
          maxWidth: "350px",
          textAlign: "center",
          borderRadius: "15px",
        }}
      >
        <h2
          className="mb-4 text-primary"
          style={{ fontFamily: "'Kanit', sans-serif", letterSpacing: "0.5px" }}
        >
          {isRegistering ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
        </h2>

        <div className="card-body p-0">
          <div
            className="login-container"
            style={{
              fontFamily: "'Kanit', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            {/* Username */}
            <input
              type="text"
              className="form-control mb-3"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="กรุณาใส่ชื่อผู้ใช้งาน"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  isRegistering ? handleRegister(e) : handleSubmit(e);
              }}
            />

            {/* Password */}
            <div className="mb-3" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรุณาใส่รหัสผู้ใช้งาน"
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    isRegistering ? handleRegister(e) : handleSubmit(e);
                }}
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-slash text-secondary"
                        : "bi bi-eye text-secondary"
                    }
                  ></i>
                </button>
              )}
            </div>

            {/* Role selection dropdown (only for registration) */}
            {isRegistering && (
              <Select
                options={roleOptions}
                value={role}
                onChange={setRole}
                placeholder="เลือกบทบาท"
                className="mb-3"
                styles={{ control: (base) => ({ ...base, fontSize: "16px" }) }}
              />
            )}
          </div>
        </div>

        {/* ปุ่ม Submit */}
        <button
          className={`btn ${
            isRegistering ? "btn-primary" : "btn-success"
          } mt-4 w-100`}
          onClick={isRegistering ? handleRegister : handleSubmit}
          style={{
            fontFamily: "'Kanit', sans-serif",
            letterSpacing: "0.5px",
            fontSize: "20px",
          }}
        >
          {isRegistering ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
        </button>

        {/* ปุ่ม Guest Login (เฉพาะโหมด Login เท่านั้น) */}
        {!isRegistering && (
          <button
            className="btn btn-warning mt-2 w-100"
            onClick={handleGuestLogin}
            style={{
              fontFamily: "'Kanit', sans-serif",
              letterSpacing: "0.5px",
              fontSize: "20px",
            }}
          >
            เข้าสู่ระบบในฐานะ Guest
          </button>
        )}

        {/* ปุ่มสลับโหมด */}
        <div className="mt-3">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setName("");
              setPassword("");
              setRole(null);
            }}
            disabled={true}
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            {isRegistering
              ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"
              : "ไม่มีบัญชี? ลงทะเบียน"}
          </button>
        </div>
      </div>
    </div>
  );
}
