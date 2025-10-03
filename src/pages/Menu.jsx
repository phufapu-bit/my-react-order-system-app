import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "../App.css";

export default function Menupage() {
  const [menuname, setMenuname] = useState("");
  const [price, setPrice] = useState("");

  const [menuList, setMenuList] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState(null);

  // ฟังก์ชันดึงเมนู
  const getMenuList = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/getmenu");
      if (res.data.success) {
        setMenuList(res.data.menu);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ Server เพื่อดึงรายการเมนูได้",
      });
    }
  };

  // ฟังก์เพิ่มเมนู
  const handleAddMenu = async () => {
    try {
      if (!menuname || !price) {
        return Swal.fire({
          icon: "warning",
          title: "กรอกข้อมูลให้ครบ",
        });
      }

      await axios.post("http://localhost:3001/api/addmenu", {
        menuname,
        price,
      });

      Swal.fire({
        icon: "success",
        title: "เพิ่มเมนูสำเร็จ!",
        timer: 1000,
        showConfirmButton: false,
      }).then(() => {
        getMenuList();
        resetForm();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มเมนูได้",
      });
    }
  };

  // ปุ่มการอัพเดต
  const handleEdit = (menu) => {
    setId(menu.id);
    setMenuname(menu.ordername);
    setPrice(menu.price);
    setIsEditing(true);
  };

  // ฟังก์ชันการแก้ไข
  const handleUpdate = async () => {
    Swal.fire({
      title: "คุณต้องการแก้ไขเมนูนี้ใช่ไหม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch("http://localhost:3001/api/updatemenu", {
            id,
            menuname,
            price,
          });
          Swal.fire({
            icon: "success",
            title: "แก้ไขเมนูสำเร็จ!",
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            getMenuList();
            resetForm();
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถแก้ไขเมนูได้",
          });
        }
      }
    });
  };

  // ฟังก์การลบ
  const handleDelete = (id) => {
    Swal.fire({
      title: "คุณต้องการลบเมนูนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3001/api/deletemenu/${id}`);
          setMenuList(menuList.filter((menu) => menu.id !== id));
          Swal.fire({
            icon: "success",
            title: "ลบเรียบร้อย",
            timer: 1000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อ Server ได้",
          });
        }
      }
    });
  };

  // การรีเชตค่า
  const resetForm = () => {
    setMenuname("");
    setPrice("");
    setId(null);
    setIsEditing(false);
  };

  // การดึงข้อมูล
  useEffect(() => {
    getMenuList();
  }, []);

  return (
    <div className="container-fluid">
      <nav
        aria-label="breadcrumb"
        style={{ fontSize: "18px", fontFamily: "'Kanit', sans-serif" }}
      >
        <ol className="breadcrumb bg-light p-3 rounded shadow-sm">
          <li className="breadcrumb-item">
            <Link to="/">หน้าแรก</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            จัดการเมนู
          </li>
        </ol>
      </nav>
      <h1
        className="header-title"
        style={{
          background: "linear-gradient(90deg, #0d1b2a, #1b4332)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Kanit', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        จัดการเมนู
      </h1>
      <div className="card shadow">
        <div
          className="card-body"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          {/* ฟอร์มเพิ่ม/แก้ไขเมนู */}
          <div className="card p-3 mb-4 shadow-sm">
            <h3>{isEditing ? "✏️ แก้ไขเมนู" : "➕ เพิ่มเมนู"}</h3>
            <div className="row g-3">
              <div className="col-md-5">
                <input
                  style={{ fontSize: "20px" }}
                  type="text"
                  className="form-control"
                  placeholder="ชื่อเมนู"
                  value={menuname}
                  onChange={(e) => setMenuname(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="col-md-3">
                <input
                  style={{ fontSize: "20px" }}
                  type="number"
                  className="form-control"
                  placeholder="ราคา"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </div>
              <div className="col-md-4">
                {isEditing ? (
                  <button
                    style={{ fontSize: "20px" }}
                    className="btn btn-warning w-100"
                    onClick={handleUpdate}
                  >
                    ✅ อัปเดตเมนู
                  </button>
                ) : (
                  <button
                    style={{ fontSize: "20px" }}
                    className="btn btn-success w-100"
                    onClick={handleAddMenu}
                  >
                    ➕ เพิ่มเมนู
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ตารางแสดงรายการเมนู */}
          <div className="table-container">
            <table
              className="table table-bordered table-striped"
              style={{ fontSize: "20px" }}
            >
              <thead
                className="table-dark"
                style={{ position: "sticky", zIndex: "1000", top: "0" }}
              >
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อเมนู</th>
                  <th>ราคา</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {menuList.length > 0 ? (
                  menuList.map((menu, i) => (
                    <tr key={menu.id || i}>
                      <td>{menu.id}</td>
                      <td>{menu.ordername}</td>
                      <td>{menu.price} บาท</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary flex-fill"
                            onClick={() => handleEdit(menu)}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            className="btn btn-danger flex-fill"
                            onClick={() => handleDelete(menu.id)}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      ไม่มีรายการเมนู
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer"></div>
      </div>
    </div>
  );
}
