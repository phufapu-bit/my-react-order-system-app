import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import "../App.css";

export default function EditUserpage() {
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [users, setUsers] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState(null);

  const API_URL = "https://my-react-order-system-app-pvj5.onrender.com/api";

  const roleOptions = [
    { value: "user", label: "พนักงาน" },
    { value: "admin", label: "ผู้ดูแลระบบ" },
  ];

  //ฟังก์ดึงชื่อผู้ใช้งาน
  const getuser = async () => {
    try {
      // `${API_URL}/getuser`
      // "http://localhost:3001/api/getuser"
      const res = await axios.post(`${API_URL}/getuser`);
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

  // --- ฟังก์ชันสำหรับจัดการการแก้ไข Modal ---
  const closeEditModal = () => {
    //ซ่อน Modal ผ่าน Bootstrap JS
    const modalElement = document.getElementById("editUserModal");
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    //ล้าง State เพื่อปิด Modal Logic
    setEditingUser(null);
  };

  //เปิด Modal และกำหนดค่าเริ่มต้น
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword("");
    const currentRole = roleOptions.find((opt) => opt.value === user.role);
    setEditRole(currentRole || null);

    //แสดง Modal ผ่าน Bootstrap JS
    setTimeout(() => {
      const modalElement = document.getElementById("editUserModal");
      let modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new window.bootstrap.Modal(modalElement);
      }
      modalInstance.show();
    }, 100);
  };

  //ส่งข้อมูลการแก้ไขไปยัง Backend
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
      // `${API_URL}/updateProfileByAdmin/${oldName}`
      // `http://localhost:3001/api/updateProfileByAdmin/${oldName}`
      const response = await axios.patch(
        `${API_URL}/updateProfileByAdmin/${oldName}`,
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

  // --- ฟังก์ชันสำหรับการลบผู้ใช้ ---
  const handleDelete = async (id, name) => {
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
          // `${API_URL}/deleteuser/${id}`
          // `http://localhost:3001/api/deleteuser/${id}`
          const res = await axios.delete(
            `${API_URL}/deleteuser/${id}`
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

  return (
    <div className="container-fluid">
      {/* ส่วน Breadcrumb และ Header */}
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
          background: "linear-gradient(90deg, #2e5d4f, #a8d5ba)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Kanit', sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        จัดการผู้ใช้
      </h1>

      {/* ส่วนตารางแสดงข้อมูล */}
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
                  <th>ชื่อ</th>
                  <th>บทบาท</th>
                  <th>รหัสผ่าน</th>
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
                            แก้ไข
                          </button>
                          <button
                            className="btn btn-danger flex-fill"
                            onClick={() => handleDelete(val.id, val.name)}
                          >
                            ลบ
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

      {/* MODAL สำหรับแก้ไขผู้ใช้  */}
      <div
        className="modal"
        id="editUserModal"
        tabIndex="-1"
        aria-labelledby="editUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5
                className="modal-title"
                id="editUserModalLabel"
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
                  </label>
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
                  </label>
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
                  </label>
                  <Select
                    options={roleOptions}
                    value={editRole}
                    onChange={setEditRole}
                    placeholder="เลือกบทบาท"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "16px", // ปรับสีตัวหนังสือพื้นฐานของ control
                        color: "#333", // สีเทาเข้ม
                      }),
                      singleValue: (base) => ({
                        ...base, // ✅ ทำให้ตัวหนังสือของค่าที่เลือกเข้มขึ้น
                        color: "#333", // สีเทาเข้ม
                        fontWeight: "500", // เพิ่มความหนา
                        fontSize: "18px", // เพิ่มขนาดเล็กน้อยให้ดูเด่น
                      }),
                      placeholder: (base) => ({
                        ...base, // ✅ ทำให้ตัวหนังสือ placeholder เข้มขึ้น
                        color: "#666", // สีเทาปานกลาง
                        fontSize: "18px", // เพิ่มขนาดเล็กน้อย
                      }),
                      option: (base, state) => ({
                        ...base, // ✅ สีตัวหนังสือในตัวเลือก
                        color: "#333", // สีเทาเข้ม
                        fontSize: "16px", // ปรับสีพื้นหลังเมื่อ Hover หรือ Selected
                        backgroundColor: state.isSelected
                          ? "#e0e0e0"
                          : state.isFocused
                          ? "#f0f0f0"
                          : null,
                      }),
                      // หากต้องการให้ Dropdown แสดงผลอยู่ด้านหน้าเสมอ (แก้ปัญหาเรื่อง z-index)
                      menu: (base) => ({ ...base, zIndex: 2000 }),
                    }}
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
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
