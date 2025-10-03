import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import axios from "axios";
import "../App.css";

export default function Orderpage() {
  const [tablenum, setTablenum] = useState("");

  const [orders, setOrders] = useState([]);
  const [menuOptions, setMenuOptions] = useState([]);
  const [menuList, setMenuList] = useState([]);

  const [listorder, setListorder] = useState(null);
  const [id, setId] = useState(null);
  
  const [qty, setQty] = useState(1);

  const [isEditing, setIsEditing] = useState(false);

  const fetchMenuData = async () => {
    try {
      // "http://localhost:3001/api/getmenu"
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/getmenu`);
      if (res.data.success) {
        // เก็บรายการเมนูทั้งหมด
        setMenuList(res.data.menu);

        // สร้าง options สำหรับ React Select
        const options = res.data.menu.map((item) => ({
          value: item.ordername,
          label: item.ordername,
        }));
        setMenuOptions(options);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };

  // ดึงข้อมูลออเดอร์
  const getListorder = async () => {
    try {
      // "http://localhost:3001/api/getorder"
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/getorder`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // เพิ่มออเดอร์
  const handleAdd = async () => {
    try {
      if (!tablenum || !listorder || !qty) {
        return Swal.fire({
          icon: "warning",
          title: "กรอกข้อมูลให้ครบ",
        });
      }

      //ค้นหาราคาจาก menuList โดยใช้ listorder.value (ชื่อเมนู)
      const selectedMenuItem = menuList.find(
        (item) => item.ordername === listorder.value
      );

      if (!selectedMenuItem) {
        return Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่พบข้อมูลราคาของรายการอาหารที่เลือก",
        });
      }

      const price = selectedMenuItem.price;
      const totalPrice = price * qty;
// "http://localhost:3001/api/order"
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/order`, {
        tablenum,
        listorder: listorder.value,
        qty: parseInt(qty),
        price,
        total_price: totalPrice,
      });

      if (response.data.success) {
        Swal.fire({
          title: "คุณต้องการเพิ่มออเดอร์ใช่ไหม?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "ใช่",
          cancelButtonText: "ไม่",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: "success",
              title: "เพิ่มออเดอร์ สำเร็จ!",
              timer: 1000,
              showConfirmButton: false,
            }).then(() => getListorder());
            setTablenum("");
            setListorder(null);
            setQty(1);
            window.location.reload();
          }
        });
      }
    } catch (error) {
      console.error("Error in handleAdd:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ Server ได้",
      });
    }
  };

  // ดึงข้อมูลไปแก้ไข
  const handleEdit = (order) => {
    setId(order.id);
    setTablenum(order.tablenum);
    const selectedOption = menuOptions.find(
      (option) => option.value === order.listorder
    );
    setListorder(selectedOption);
    setQty(order.qty);
    setIsEditing(true);
  };

  // อัปเดตออเดอร์
  const handleUpdate = async () => {
    Swal.fire({
      // ... (ส่วน Swal.fire เดิม)
      title: "คุณต้องการแก้ไขออเดอร์ใช่ไหม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // **ค้นหาราคาและคำนวณราคารวมใหม่**
          const selectedMenuItem = menuList.find(
            (item) => item.ordername === listorder.value
          );

          if (!selectedMenuItem) {
            throw new Error("Menu item not found for price calculation.");
          }

          const price = selectedMenuItem.price;
          const totalPrice = price * qty;

          // "http://localhost:3001/api/updateOrder"
          const response = await axios.patch(
            `${process.env.REACT_APP_API_URL}/api/updateOrder`,
            {
              id,
              tablenum,
              listorder: listorder.value,
              qty: parseInt(qty),
              price,
              total_price: totalPrice,
            }
          );

          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "แก้ไขออเดอร์ สำเร็จ!",
              timer: 1000,
              showConfirmButton: false,
            }).then(() => getListorder());
            setId(null);
            setTablenum("");
            setListorder(null);
            setQty(1);
            setIsEditing(false);
            window.location.reload();
          }
        } catch (error) {
          console.error("Error in handleUpdate:", error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อ Server หรือคำนวณราคาได้",
          });
        }
      }
    });
  };

  // ลบออเดอร์
  const handleDelete = (id) => {
    Swal.fire({
      title: "คุณต้องการลบออเดอร์นี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // `http://localhost:3001/api/deleteOrder/${id}`
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/deleteOrder/${id}`);
          setOrders(orders.filter((o) => o.id !== id));
          Swal.fire({
            icon: "success",
            title: "ลบเรียบร้อย",
            timer: 1000,
            showConfirmButton: false,
          });
          window.location.reload();
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

  const handleComplete = async (id) => {
    Swal.fire({
      title: "เสร็จสิ้นออเดอร์นี้ใช่หรือไม่?",
      text: "ออเดอร์นี้จะถูกบันทึกเป็นยอดขาย",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, เสร็จสิ้น",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // "http://localhost:3001/api/completeOrder"
          const response = await axios.patch(
            `${process.env.REACT_APP_API_URL}/api/completeOrder`,
            { id }
          );
          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "ออเดอร์เสร็จสิ้น!",
              timer: 1000,
              showConfirmButton: false,
            }).then(() => getListorder());
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถอัปเดตสถานะได้",
          });
        }
      }
    });
  };

  useEffect(() => {
    getListorder();
    fetchMenuData();
  }, []);

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        style={{ fontSize: "18px", fontFamily: "'Kanit', sans-serif" }}
      >
        <ol className="breadcrumb bg-light p-3 rounded shadow-sm">
          <li className="breadcrumb-item">
            <Link to="/">หน้าแรก</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            จัดการออเดอร์
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
        จัดการออเดอร์
      </h1>

      <div className="card shadow">
        <div
          className="card-body"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          {/* ฟอร์มเพิ่ม/แก้ไข */}
          <div className="card p-3 mb-4 shadow-sm">
            <h3>{isEditing ? "✏️ แก้ไขออเดอร์" : "➕ เพิ่มออเดอร์"}</h3>
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  style={{ fontSize: "20px" }}
                  type="text"
                  className="form-control"
                  placeholder="โต๊ะที่"
                  value={tablenum}
                  onChange={(e) => setTablenum(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              <div className="col-md-4">
                <Select
                  options={menuOptions}
                  value={listorder}
                  onChange={(selectedOption) => setListorder(selectedOption)}
                  placeholder="เลือกรายการอาหาร"
                  styles={{
                    control: (base) => ({ ...base, fontSize: "20px" }),
                    menu: (base) => ({ ...base, zIndex: 2000 }),
                  }}
                />
              </div>
              <div className="col-md-2">
                <input
                  style={{ fontSize: "20px" }}
                  type="number"
                  className="form-control"
                  placeholder="จำนวน"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min="1"
                />
              </div>
              <div className="col-md-3">
                {isEditing ? (
                  <button
                    style={{ fontSize: "20px" }}
                    className="btn btn-warning w-100"
                    onClick={handleUpdate}
                  >
                    ✅ อัปเดต
                  </button>
                ) : (
                  <button
                    style={{ fontSize: "20px" }}
                    className="btn btn-success w-100"
                    onClick={handleAdd}
                  >
                    ➕ เพิ่ม
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ตารางแสดงออเดอร์ */}
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
                  <th>โต๊ะที่</th>
                  <th>อาหาร</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย</th>
                  <th>ราคารวม</th>
                  <th>วันที่/เวลา</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, i) => (
                    <tr key={order.id || i}>
                      <td>{order.id}</td>
                      <td>{order.tablenum}</td>
                      <td>{order.listorder}</td>
                      <td>{order.qty}</td>
                      <td>{order.price || "N/A"}</td>
                      <td>{order.total_price || 0}</td>
                      <td>
                        {order.update_at
                          ? new Date(order.update_at).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : ""}
                      </td>
                      <td>
                        {order.status !== "completed" ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success flex-fill"
                              onClick={() => handleComplete(order.id)}
                            >
                              ✅ เสร็จสิ้น
                            </button>
                            <button
                              className="btn btn-primary flex-fill"
                              onClick={() => handleEdit(order)}
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              className="btn btn-danger flex-fill"
                              onClick={() => handleDelete(order.id)}
                            >
                              🗑️ ลบ
                            </button>
                          </div>
                        ) : (
                          <span className="text-success fw-bold d-flex justify-content-center align-items-center">
                            เสร็จสิ้นแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      ไม่มีออเดอร์
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
