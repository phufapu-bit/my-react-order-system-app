import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import "../App.css";

export default function EditUserpage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState(null);

  const roleOptions = [
    { value: "user", label: "พนักงาน" },
    { value: "admin", label: "ผู้ดูแลระบบ" },
  ];

  const getuser = async () => {
    // ... (ฟังก์ชัน getuser เดิม)
    try {
      const res = await axios.post("http://localhost:3001/api/getuser");
      if (res.data.success && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.warn("Backend response success but no user array:", res.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ Server หรือดึงรายการผู้ใช้ได้",
      });
    }
  };

  useEffect(() => {
    getuser();
  }, []);

  // ------------------------------------
  // --- ฟังก์ชันสำหรับจัดการการแก้ไข Modal ---
  // ------------------------------------

  const closeEditModal = () => {
    // 1. ซ่อน Modal ผ่าน Bootstrap JS
    const modalElement = document.getElementById("editUserModal");
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    // 2. ล้าง State เพื่อปิด Modal Logic
    setEditingUser(null);
  };

  // 1. เปิด Modal และกำหนดค่าเริ่มต้น
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword("");
    const currentRole = roleOptions.find((opt) => opt.value === user.role);
    setEditRole(currentRole || null);

    // 3. แสดง Modal ผ่าน Bootstrap JS
    // ใช้ setTimeout เพื่อให้ React State อัปเดตเสร็จก่อน Bootstrap JS จะทำงาน
    setTimeout(() => {
      const modalElement = document.getElementById("editUserModal");
      // ถ้า Modal ถูกสร้างแล้ว ให้ใช้ getInstance
      let modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (!modalInstance) {
        // ถ้ายังไม่ถูกสร้าง ให้สร้างใหม่
        modalInstance = new window.bootstrap.Modal(modalElement);
      }
      modalInstance.show();
    }, 100);
  };

  // 2. ส่งข้อมูลการแก้ไขไปยัง Backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName && !editPassword && !editRole) {
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลอย่างน้อยหนึ่งช่อง",
        text: "กรุณากรอกชื่อผู้ใช้, รหัสผ่าน หรือบทบาทใหม่",
      });
    }

    const oldName = editingUser.name;

    try {
      const response = await axios.patch(
        `http://localhost:3001/api/updateProfileByAdmin/${oldName}`,
        {
          newName: editName,
          newPassword: editPassword,
          newRole: editRole ? editRole.value : undefined,
        }
      );

      if (response.data.success) {
        Swal.fire("แก้ไขสำเร็จ!", response.data.message, "success");
        closeEditModal(); // ปิด Modal
        getuser(); // โหลดข้อมูลผู้ใช้ใหม่
      } else {
        Swal.fire("ล้มเหลว!", response.data.message, "error");
      }
    } catch (error) {
      Swal.fire(
        "ผิดพลาด!",
        error.response?.data?.message || "ไม่สามารถเชื่อมต่อ Server ได้",
        "error"
      );
    }
  };

  // ----------------------------------
  // --- ฟังก์ชันสำหรับการลบผู้ใช้ ---
  // ----------------------------------
  const handleDelete = async (id, name) => {
    // ... (ฟังก์ชัน handleDelete เดิม)
    Swal.fire({
      title: `ต้องการลบผู้ใช้ ${name} ใช่หรือไม่?`,
      text: "คุณจะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `http://localhost:3001/api/deleteuser/${id}`
          );
          if (res.data.success) {
            Swal.fire("ลบสำเร็จ!", res.data.message, "success");
            getuser();
          } else {
            Swal.fire("ล้มเหลว!", res.data.message, "error");
          }
        } catch (error) {
          Swal.fire("ผิดพลาด!", "ไม่สามารถเชื่อมต่อ Server ได้", "error");
        }
      }
    });
  };

  // ----------------------------------
  // --- ส่วนแสดงผล (Return JSX) ---
  // ----------------------------------

  return (
    <div className="container-fluid">
      {/* ... ส่วน Breadcrumb และ Header ... */}
      <nav
        aria-label="breadcrumb"
        style={{ fontSize: "18px", fontFamily: "'Kanit', sans-serif" }}
      >
        <ol className="breadcrumb bg-light p-3 rounded shadow-sm">
          <li className="breadcrumb-item">
            <Link to="/">หน้าแรก</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            จัดการผู้ใช้
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
        จัดการผู้ใช้
      </h1>

      {/* ... ส่วนตารางแสดงข้อมูล ... */}
      <div className="card shadow">
        <div
          className="card-body"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          <div className="table-container">
            <table
              className="table table-bordered table-striped"
              style={{ fontSize: "20px" }}
            >
              <thead className="table">
                <tr>
                  {/* <th>ID</th> */}
                  <th>ชื่อ</th>
                  <th>บทบาท</th>
                  <th>รหัสผ่าน</th>
                  {/* (Hash) */}
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((val) => (
                    <tr key={val.id}>
                      {/* <td>{val.id}</td> */}
                      <td>{val.name}</td>
                      <td>
                        {val.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
                      </td>
                      <td
                        style={{
                          fontSize: "14px",
                          maxWidth: "200px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {val.password}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary flex-fill"
                            onClick={() => handleEdit(val)}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            className="btn btn-danger flex-fill"
                            onClick={() => handleDelete(val.id, val.name)}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------ */}
      {/* *** MODAL สำหรับแก้ไขผู้ใช้ *** */}
      {/* ------------------------------------ */}
      <div
        // ลบคลาส 'fade' ออกไปก่อน ถ้า Bootstrap CSS/JS มีปัญหาเรื่อง Transition
        className="modal"
        id="editUserModal"
        tabIndex="-1"
        aria-labelledby="editUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              {" "}
              {/* <--- ปรับพื้นหลังหัว Modal เป็นสีน้ำเงิน (Primary) และตัวอักษรเป็นสีขาว (White) */}
              <h5
                className="modal-title"
                id="editUserModalLabel"
                // เพิ่ม Style เพื่อเน้นให้ชัดเจนยิ่งขึ้น
                style={{ fontWeight: "600" }}
              >
                แก้ไขผู้ใช้: {editingUser ? editingUser.name : ""}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white" // <--- เพิ่ม btn-close-white เพื่อให้ไอคอนปิดเห็นชัดบนพื้นหลังสีเข้ม
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeEditModal}
              ></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div
                className="modal-body"
                style={{ fontFamily: "'Kanit', sans-serif" }}
              >
                <div className="mb-3">
                  <label className="form-label text-dark fw-bold">
                    ชื่อผู้ใช้ใหม่
                  </label>{" "}
                  {/* <--- เน้น label */}
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value.toUpperCase())}
                    placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark fw-bold">
                    รหัสผ่านใหม่
                  </label>{" "}
                  {/* <--- เน้น label */}
                  <input
                    type="password"
                    className="form-control"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark fw-bold">
                    บทบาทใหม่
                  </label>{" "}
                  {/* <--- เน้น label */}
                  <Select
                    options={roleOptions}
                    value={editRole}
                    onChange={setEditRole}
                    placeholder="เลือกบทบาท"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary" // <--- เปลี่ยนเป็น Outline เพื่อให้เป็นปุ่มรอง
                  data-bs-dismiss="modal"
                  onClick={closeEditModal}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-success">
                  {" "}
                  {/* <--- เปลี่ยนเป็นสีเขียว (Success) เพื่อสื่อถึงการยืนยัน */}
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* ------------------------------------ */}
    </div>
  );
}
