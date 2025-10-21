import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import axios from "axios";
import "../App.css";
import AddIcon from "../assets/images/plus.png";
import editIcon from "../assets/images/edit.png";

export default function Orderpage() {
  const [tablenum, setTablenum] = useState("");
  const [takeawayInput, setTakeawayInput] = useState(""); // State สำหรับรหัสออเดอร์กลับบ้านที่ไม่ซ้ำกัน
  const [takeawayCounter, setTakeawayCounter] = useState(1);
  const [filterTableNum, setFilterTableNum] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [menuOptions, setMenuOptions] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [cart, setCart] = useState([]); // State สำหรับตะกร้าสินค้า
  const [filterListOrder, setFilterListOrder] = useState(null);
  const [listorder, setListorder] = useState(null);
  const [id, setId] = useState(null);
  const [cartIndexToEdit, setCartIndexToEdit] = useState(null); // State สำหรับเก็บ Index รายการในตะกร้าที่จะแก้ไข
  const [qty, setQty] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const navigate = useNavigate();
  const ROLE = localStorage.getItem("role");
  const guestTablenum = localStorage.getItem("guest_tablenum");
  const API_URL = "https://my-react-order-system-app-pvj5.onrender.com/api";

  const filteredOrders = orders.filter((order) => {
    let matches = true;
    if (filterTableNum.trim()) {
      const tableNumString = String(order.tablenum);
      if (!tableNumString.includes(filterTableNum.trim())) {
        matches = false;
      }
    }
    if (!matches) return false;
    if (filterListOrder) {
      const filterValue =
        typeof filterListOrder === "string"
          ? filterListOrder.trim()
          : filterListOrder.value
          ? String(filterListOrder.value).trim()
          : "";

      if (filterValue) {
        const lowerCaseFilter = filterValue.toLowerCase();
        const lowerCaseOrder = order.listorder.toLowerCase();
        if (!lowerCaseOrder.includes(lowerCaseFilter)) {
          matches = false;
        }
      }
    }
    if (!matches) return false;
    if (order.update_at) {
      const orderDate = order.update_at.substring(0, 10);

      // กรอง 'จากวันที่' (Start Date)
      if (startDate) {
        // ถ้ามีการกำหนดค่า startDate
        if (orderDate < startDate) {
          matches = false;
        }
      }

      if (endDate) {
        if (matches && orderDate > endDate) {
          matches = false;
        }
      }
    }
    return matches;
  });

  const fetchMenuData = async () => {
    try {
      // `${API_URL}/getmenu`
      // "http://localhost:3001/api/getmenu"
      const res = await axios.post(`${API_URL}/getmenu`);
      if (res.data.success) {
        setMenuList(res.data.menu);
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
      // `${API_URL}/getorder`
      // "http://localhost:3001/api/getorder"
      const res = await axios.post(`${API_URL}/getorder`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const generateNextTakeawayId = (currentCounter) => {
    // Format the number with leading zeros (e.g., TW-1)
    const formattedNumber = String(currentCounter).padStart(0, "0");
    return `TW-${formattedNumber}`;
  };

  //จัดการการเปลี่ยนแปลงสถานะ Takeaway
  const handleTakeawayToggle = (e) => {
    const isChecked = e.target.checked;
    setIsTakeaway(isChecked);

    if (isChecked) {
      setTablenum("");
      const newId = generateNextTakeawayId(takeawayCounter);
      setTakeawayInput(newId);
    }
    // ถ้าเปลี่ยนกลับ และไม่ใช่ Guest ที่มี tablenum อยู่แล้ว ให้ล้างเลขโต๊ะ
    else {
      setTablenum("");
      setTakeawayInput("");
    }
  };

  //ฟังก์ชันยกเลิกการแก้ไขและล้างฟอร์ม
  const handleCancelEdit = () => {
    setId(null);
    setListorder(null);
    setQty(1);
    setIsEditing(false);
    setCartIndexToEdit(null);
    // รีเซ็ตสถานะ Takeaway
    setIsTakeaway(false);
    setTakeawayInput("");

    // การจัดการเลขโต๊ะ: ถ้าเป็น Guest ให้รีเซ็ตกลับไปเป็นค่าเดิม
    if (isGuest && guestTablenum) {
      setTablenum(guestTablenum);
    } else {
      setTablenum("");
    }
  };

  //  ฟังก์ชันเพิ่มลงตะกร้า (Add to Cart)
  const handleAddToCart = () => {
    //  ตรวจสอบว่าต้องมี tablenum หรือเป็น Takeaway
    if (!listorder || !qty) {
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลให้ครบ",
        text: "โปรดระบุรายการอาหาร จำนวน และระบุ 'โต๊ะที่' หรือเลือก 'สั่งกลับบ้าน'",
      });
    }

    // Check if tablenum/takeawayInput is filled
    if (!isTakeaway && !tablenum) {
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลให้ครบ",
        text: "โปรดระบุ 'โต๊ะที่'",
      });
    } else if (isTakeaway && !takeawayInput) {
      // กรณีนี้ไม่ควรเกิดขึ้นถ้าใช้รหัสอัตโนมัติ แต่เพิ่มไว้เป็น Fallback
      return Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลให้ครบ",
        text: "โปรดระบุ 'รหัสออเดอร์กลับบ้าน'",
      });
    }

    //Logic: ถ้าเป็น Takeaway ให้ใช้ "TAKEAWAY" เป็น tablenum
    const finalTablenum = isTakeaway ? takeawayInput.toUpperCase() : tablenum;

    const selectedMenuItem = menuList.find(
      (item) => item.ordername === listorder.value
    );

    if (!selectedMenuItem) {
      return Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลเมนู",
        text: "ไม่สามารถคำนวณราคาได้",
      });
    }

    const price = selectedMenuItem.price;
    const totalPrice = price * qty;

    const newItem = {
      tablenum: finalTablenum, // ใช้ค่าที่กำหนดแล้ว
      listorder: listorder.value,
      qty: parseInt(qty),
      price: price,
      total_price: totalPrice,
    };
    setCart([...cart, newItem]);
    setListorder(null);
    setQty(1);

    Swal.fire({
      icon: "info",
      title: "เพิ่มในตะกร้าแล้ว",
      text: `${newItem.listorder} (${newItem.qty} รายการ)`,
      timer: 800,
      showConfirmButton: false,
    });
  };

  //ฟังก์ชันยืนยันการสั่งซื้อทั้งหมด
  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;

    //การจัดการ Guest Session: ไม่ควรเซ็ต/เคลียร์ guest_tablenum ถ้าเป็น Takeaway
    if (isGuest && tablenum) {
      localStorage.setItem("guest_tablenum", tablenum);
    }

    try {
      // วนลูปส่งรายการในตะกร้าไป Backend ทีละรายการ
      for (const item of cart) {
        // `${API_URL}/order`
        // "http://localhost:3001/api/order"
        await axios.post(`${API_URL}/order`, item);
      }

      Swal.fire({
        icon: "success",
        title: "ส่งรายการสั่งซื้อทั้งหมดสำเร็จ!",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        if (isTakeaway) {
          setTakeawayCounter((prev) => prev + 1);
        }

        setCart([]); // ล้างตะกร้าเมื่อสั่งซื้อสำเร็จ
        getListorder(); // รีเฟรชรายการออเดอร์ในตารางด้านล่าง

        // Logic นำทางและล้างฟอร์ม:
        if (isGuest && !isTakeaway) {
          navigate("/resultpage"); // Guest (ที่นั่งโต๊ะ) ไปหน้าดูสถานะ
        } else {
          // Admin/User หรือ Guest ที่เป็น TAKEAWAY ล้างฟอร์ม
          setTablenum("");
          setIsTakeaway(false);
          setTakeawayInput("");
        }
        setListorder(null);
        setQty(1);
      });
    } catch (error) {
      console.error("Error confirming order:", error);
      Swal.fire("ผิดพลาด!", "มีข้อผิดพลาดในการยืนยันการสั่งซื้อ", "error");
    }
  };

  //ฟังก์ชันดึงข้อมูลไปแก้ไข (ใช้สำหรับทั้ง orders และ cart)
  const handleEdit = (item, index = null) => {
    const isTakeawayOrder =
      item.tablenum.startsWith("TW-") || item.tablenum.includes("-");
    setId(item.id || null); // id จะมีค่าเฉพาะถ้ามาจากตาราง orders
    setTablenum(isTakeawayOrder ? "" : item.tablenum);
    setTakeawayInput(isTakeawayOrder ? item.tablenum : "");

    //ตั้งค่า isTakeaway ตามค่า tablenum
    setIsTakeaway(isTakeawayOrder);

    const selectedOption = menuOptions.find(
      (option) => option.value === item.listorder
    );
    setListorder(selectedOption);
    setQty(item.qty);
    setIsEditing(true);
    setCartIndexToEdit(index);
  };

  // 🟢 ฟังก์ชันอัปเดตรายการในตะกร้า
  const handleUpdateCartItem = () => {
    // 1. ตรวจสอบข้อมูลพื้นฐาน
    // 💡 ไม่ต้องเช็ค tablenum เพราะถูกตั้งค่าแล้วตอน handleEdit
    if (!listorder || !qty || cartIndexToEdit === null) {
      return Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่สมบูรณ์",
        text: "ไม่สามารถอัปเดตรายการในตะกร้าได้",
      });
    }

    // Check for Takeaway ID update
    if (isTakeaway && !takeawayInput) {
      return Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่สมบูรณ์",
        text: "โปรดระบุ 'รหัสออเดอร์กลับบ้าน'",
      });
    }

    // 2. ค้นหาราคาใหม่
    const selectedMenuItem = menuList.find(
      (item) => item.ordername === listorder.value
    );

    if (!selectedMenuItem) {
      return Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลเมนู",
        text: "ไม่สามารถคำนวณราคาได้",
      });
    }

    const price = selectedMenuItem.price;
    const totalPrice = price * qty;

    // 3. สร้าง Object รายการที่แก้ไขใหม่
    const finalTablenum = isTakeaway ? takeawayInput.toUpperCase() : tablenum;
    const updatedItem = {
      tablenum: finalTablenum,
      listorder: listorder.value,
      qty: parseInt(qty),
      price: price,
      total_price: totalPrice,
    };

    // 4. อัปเดต State ตะกร้า (ใช้ Array.map() เพื่อสร้าง Array ใหม่)
    const newCart = cart.map((item, index) =>
      index === cartIndexToEdit ? updatedItem : item
    );
    setCart(newCart);

    // 5. ล้างโหมดแก้ไขและฟอร์ม
    handleCancelEdit();

    Swal.fire({
      icon: "success",
      title: "อัปเดตตะกร้าแล้ว",
      timer: 800,
      showConfirmButton: false,
    });
  };

  const handleUpdateOrder = async () => {
    // การแก้ไขรายการใน DB จะยังคงใช้ tablenum ที่ถูกดึงมาตอนแรก
    if (cartIndexToEdit !== null || id === null) return;
    if (isTakeaway && !takeawayInput) {
      return Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่สมบูรณ์",
        text: "โปรดระบุ 'รหัสออเดอร์กลับบ้าน'",
      });
    }
    Swal.fire({
      title: "คุณต้องการแก้ไขออเดอร์ใช่ไหม?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const selectedMenuItem = menuList.find(
            (item) => item.ordername === listorder.value
          );

          if (!selectedMenuItem) {
            throw new Error("Menu item not found for price calculation.");
          }

          const price = selectedMenuItem.price;
          const totalPrice = price * qty;

          // ตรวจสอบ: ถ้า isTakeaway เป็นจริง ต้องให้แน่ใจว่า tablenum ยังคงเป็น "TAKEAWAY"
          const finalTablenum = isTakeaway
            ? takeawayInput.toUpperCase()
            : tablenum;
          // `${API_URL}/updateOrder`
          // "http://localhost:3001/api/updateOrder"
          const response = await axios.patch(`${API_URL}/updateOrder`, {
            id, // id นี้คือ id ของรายการใน Database (orders)
            tablenum: finalTablenum,
            listorder: listorder.value,
            qty: parseInt(qty),
            price,
            total_price: totalPrice,
          });

          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "แก้ไขออเดอร์ สำเร็จ!",
              timer: 1000,
              showConfirmButton: false,
            }).then(() => getListorder());

            // 🟢 เรียกใช้ handleCancelEdit เพื่อล้างฟอร์มและรีเซ็ต State
            handleCancelEdit();
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
          // `${API_URL}/deleteOrder/${id}`
          // `http://localhost:3001/api/deleteOrder/${id}`
          await axios.delete(`${API_URL}/deleteOrder/${id}`);
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

  const handleDone = async (id) => {
    Swal.fire({
      title: "รายการนี้ทำเสร็จแล้วใช่หรือไม่?",
      text: "สถานะจะเปลี่ยนเป็น 'Done' (พร้อมชำระเงิน)",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, เสร็จสิ้น",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // "http://localhost:3001/api/doneOrder"
        // `${API_URL}/doneOrder`
        try {
          const response = await axios.patch(`${API_URL}/doneOrder`, {
            id,
          });
          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: "อัปเดตเป็นเสร็จสิ้น (Done)!",
              timer: 1000,
              showConfirmButton: false,
            }).then(() => getListorder());
          } else {
            Swal.fire({
              icon: "error",
              title: "ไม่สามารถอัปเดตสถานะ",
              text: response.data.message || "เกิดข้อผิดพลาดในการอัปเดต",
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อ Server ได้",
          });
        }
      }
    });
  };

  const handlePaymentAndComplete = async (id) => {
    Swal.fire({
      title: `รับชำระเงินโต๊ะ/ออเดอร์ ${tablenum} ใช่หรือไม่?`,
      text: "รายการทั้งหมดของชุดนี้จะถูกบันทึกเป็นยอดขาย",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ใช่, รับชำระเงิน",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // `${API_URL}/completeTableOrders`
        // "http://localhost:3001/api/completeTableOrders"
        try {
          const response = await axios.patch(`${API_URL}/completeTableOrders`, {
            tablenum: tablenum,
          });
          if (response.data.success) {
            Swal.fire({
              icon: "success",
              title: `โต๊ะ/ออเดอร์ ${tablenum} ชำระเงินเสร็จสิ้น!`,
              timer: 1500,
              showConfirmButton: false,
            }).then(() => getListorder()); // Refresh list
          } else {
            Swal.fire({
              icon: "error",
              title: "ไม่สามารถอัปเดตสถานะ",
              text: response.data.message || "เกิดข้อผิดพลาดในการอัปเดต",
            });
          }
        } catch (error) {
          console.error("Error completing table order:", error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อ Server ได้",
          });
        }
      }
    });
  };

  const handleClearFilters = () => {
    setFilterTableNum("");
    setFilterListOrder(null);
    setStartDate("");
    setEndDate("");
  };

  const handleClearContent = () => {
    // ถ้าเป็น Takeaway ให้ล้างแค่รายการ
    setListorder(null);
    setTablenum("");
    setTakeawayInput("");
  };

  const handleClearContentGuest = () => {
    setListorder(null);
    setTakeawayInput("");
  };

  useEffect(() => {
    getListorder();
    fetchMenuData();
    if (!ROLE && guestTablenum) {
      setIsGuest(true);
      // 📝 ถ้าเป็น Guest ให้ตั้งค่า tablenum อัตโนมัติจาก localStorage
      setTablenum(guestTablenum);
    } else {
      setIsGuest(false);
    }
  }, []);

  const incompleteOrders = orders.filter(
    (order) => order.status !== "completed"
  );

  const tablesToPayMap = incompleteOrders.reduce((acc, order) => {
    const tableKey = order.tablenum;
    if (!acc[tableKey]) {
      acc[tableKey] = {
        tablenum: tableKey,
        totalAmount: 0,
        items: [],
      };
    }
    const totalPrice = parseFloat(order.total_price) || 0;
    const pricePerUnit = parseFloat(order.price) || 0;

    acc[tableKey].totalAmount += totalPrice;
    acc[tableKey].items.push({
      listorder: order.listorder,
      qty: order.qty,
      price: pricePerUnit,
    });
    return acc;
  }, {});

  const tablesToPay = Object.values(tablesToPayMap);

  return (
    <div className="container-fluid">
      {/* container-fluid */}
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
            {isGuest ? "สั่งอาหาร" : "จัดการออเดอร์"}
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
        {isGuest ? "สั่งอาหาร" : "จัดการออเดอร์"}
      </h1>

      {/* ส่วนแสดงตะกร้าสินค้า (Cart Display) */}
      <div
        className="mt-4 p-3 border rounded shadow-lg bg-light"
        style={{ borderColor: "#4b3f72", fontFamily: "'Kanit', sans-serif" }}
      >
        <h3 className="text-primary mb-3">
          รายการอาหาร
          {isTakeaway ? (
            <span className="text-info">ออเดอร์กลับบ้าน: {takeawayInput} </span>
          ) : (
            `โต๊ะที่ ${tablenum}`
          )}
          ({cart.length} รายการ)
        </h3>
        {cart.length > 0 ? (
          <>
            {cart.map((item, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center border-bottom py-2 text-dark"
                style={{ fontFamily: "'Kanit', sans-serif" }}
              >
                <span className="fw-bold me-3 " style={{ fontSize: "24px" }}>
                  {item.listorder} ({item.qty}x)
                </span>
                <div
                  className="d-flex align-items-center gap-2"
                  style={{ fontSize: "24px" }}
                >
                  <span className="me-3">฿{item.total_price.toFixed(2)}</span>

                  {/*ปุ่มแก้ไขในตะกร้า */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(item, index)} // ส่ง item และ index ไป
                  >
                    <i className="fas fa-edit" style={{ fontSize: "30px" }}></i>
                  </button>
                  {/* ปุ่มลบในตะกร้า */}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setCart(cart.filter((_, i) => i !== index))}
                  >
                    <i
                      className="fas fa-trash-alt"
                      style={{ fontSize: "30px" }}
                    ></i>
                  </button>
                </div>
              </div>
            ))}

            <h4 className="mt-3 pt-2 border-top fw-bold text-success">
              รวมทั้งหมด: ฿
              {cart.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
            </h4>

            <button
              className="btn btn-warning w-100 mt-3"
              onClick={handleConfirmOrder}
              style={{ fontSize: "20px" }}
              disabled={isEditing} // ปิดปุ่มยืนยันเมื่อกำลังแก้ไขรายการอยู่
            >
              ยืนยันการสั่งอาหารทั้งหมด
            </button>
          </>
        ) : (
          // แสดงข้อความนี้เมื่อตะกร้าว่าง
          <div className="text-center p-3 text-muted">
            <p className="mb-0">ไม่มีรายการอาหาร</p>
            <small>โปรดเลือกรายการอาหารและกด "เพิ่มรายการสั่งอาหาร"</small>
          </div>
        )}
      </div>

      {(ROLE === "admin" || ROLE === "user") && tablesToPay.length > 0 && (
        <div className="alert alert-warning shadow-sm mt-3 p-3">
          <h4 className="alert-heading">
            <i className="fas fa-money-bill-wave me-2"></i>{" "}
            ออเดอร์ที่รอลูกค้าชำระเงิน
          </h4>
          <p>
            มีโต๊ะ/ออเดอร์ที่ยังไม่ชำระเงินทั้งหมด:{" "}
            <strong>{tablesToPay.length}</strong> รายการ
          </p>
          <hr />
          <div className="d-flex flex-wrap gap-3 justify-content-start">
            {tablesToPay.map((tableSummary) => (
              <div
                key={tableSummary.tablenum}
                className="card shadow-sm"
                // เน้นด้วย Border ซ้ายสีส้ม
                style={{ width: "18rem", borderLeft: "5px solid #ffc107" }}
              >
                <div className="card-body p-3">
                  <h5 className="card-title mb-1">
                    {tableSummary.tablenum.startsWith("TW-") ||
                    tableSummary.tablenum.includes("-") ? (
                      <>
                        <i className="fas fa-shopping-bag me-1 text-info"></i>
                        ออเดอร์กลับบ้าน: {tableSummary.tablenum}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-utensils me-1 text-info"></i>
                        โต๊ะที่ {tableSummary.tablenum}
                      </>
                    )}
                  </h5>
                  {/* แสดงยอดรวม */}
                  <p className="card-text fw-bold text-success display-6 mb-2 mt-2 border-bottom pb-1">
                    ฿{tableSummary.totalAmount.toFixed(2)}
                  </p>

                  <h6 className="card-subtitle mb-2 text-muted">
                    รายการ ({tableSummary.items.length} ชิ้น):
                  </h6>

                  {/* แสดงรายการอาหาร */}
                  <ul
                    className="list-group list-group-flush mb-3 overflow-auto"
                    style={{ maxHeight: "150px" }}
                  >
                    {tableSummary.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="list-group-item p-1 d-flex justify-content-between"
                        style={{ fontSize: "14px", border: "none" }}
                      >
                        <span>{item.listorder}</span>
                        <span className="fw-bold text-end">
                          {item.qty} x ฿{item.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() =>
                      handlePaymentAndComplete(tableSummary.tablenum)
                    }
                  >
                    <i className="fas fa-money-bill-wave me-1"></i>
                    รับชำระเงิน
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card shadow">
        <div
          className="card-body"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          {/* ฟอร์มเพิ่ม/แก้ไข */}
          <div className="card p-3 mb-4 shadow-sm">
            <h3>
              {isEditing ? (
                <>
                  <img
                    src={editIcon}
                    alt="เพิ่มรายการ"
                    style={{
                      marginRight: "8px",
                      marginBottom: "5px",
                      height: "20px",
                      width: "20px",
                    }}
                  />
                  แก้ไขรายการอาหาร
                  {cartIndexToEdit !== null ? (
                    <span className="text-warning ms-2">(ในตะกร้า)</span>
                  ) : (
                    <span className="text-danger ms-2">(ในออเดอร์)</span>
                  )}
                </>
              ) : (
                // หากอยู่ในโหมดเพิ่มรายการ (isEditing เป็น false)
                <>
                  <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                    {/* ส่วนหัวข้อ "สั่งอาหาร" และไอคอน - ชิดซ้าย (Auto) */}
                    <div className="d-flex align-items-center">
                      <img
                        src={AddIcon}
                        alt="เพิ่มรายการ"
                        style={{
                          marginRight: "8px",
                          marginBottom: "5px",
                          height: "20px",
                          width: "20px",
                        }}
                      />
                      สั่งอาหาร
                    </div>

                    {!isEditing && !isGuest && (
                      <div className="form-check form-switch m-0 d-flex align-items-center">
                        <label
                          className="form-check-label"
                          htmlFor="takeawaySwitch"
                          style={{
                            fontSize: "18px",
                            marginBottom: 0,
                            marginRight: "80px",
                          }}
                        >
                          ** สั่งกลับบ้าน (Takeaway) **
                        </label>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="takeawaySwitch"
                          checked={isTakeaway}
                          onChange={handleTakeawayToggle}
                          style={{ width: "3em", height: "1.5em" }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </h3>

            <div className="row g-4">
              <div className="col-md-2 my-5">
                <h4>{isTakeaway ? <>รหัสออเดอร์กลับบ้าน</> : <>โต๊ะที่</>}</h4>
                <input
                  style={{ fontSize: "20px" }}
                  type="text"
                  className="form-control"
                  placeholder={isTakeaway ? "รหัส TW-XXX" : "โต๊ะที่"}
                  value={isTakeaway ? takeawayInput : tablenum}
                  onChange={(e) =>
                    isTakeaway
                      ? setTakeawayInput(e.target.value.toUpperCase())
                      : setTablenum(e.target.value.toUpperCase())
                  }
                  disabled={
                    (isGuest && !isTakeaway) || (isTakeaway && !isEditing)
                  }
                />
              </div>
              <div className="col-md-4 my-5">
                <h4>เลือกรายการอาหาร</h4>
                <Select
                  options={menuOptions}
                  value={listorder}
                  isClearable={true}
                  onChange={(selectedOption) => setListorder(selectedOption)}
                  placeholder="เลือกรายการอาหาร"
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "20px",
                      width: "100%",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: "170px",
                      fontSize: "20px",
                      overflowY: "auto",
                    }),
                  }}
                />
              </div>
              <div className="col-md-2 my-5">
                <h4>จำนวน</h4>
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
              <div className="col-md-3 my-5 d-flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      style={{ fontSize: "20px", marginTop: "35px" }}
                      className="btn btn-warning w-50"
                      // ใช้ฟังก์ชันที่แตกต่างกันตามที่มา (ตะกร้า หรือ ออเดอร์ใน DB)
                      onClick={
                        cartIndexToEdit !== null
                          ? handleUpdateCartItem
                          : handleUpdateOrder
                      }
                    >
                      แก้ไข
                    </button>
                    <button
                      style={{ fontSize: "20px", marginTop: "35px" }}
                      className="btn btn-secondary w-50"
                      onClick={handleCancelEdit}
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    style={{ fontSize: "20px", marginTop: "35px" }}
                    className="btn btn-success w-100"
                    onClick={handleAddToCart}
                  >
                    <img
                      src={AddIcon}
                      alt="เพิ่มรายการ"
                      style={{
                        marginRight: "8px",
                        marginBottom: "5px",
                        height: "20px",
                        width: "20px",
                      }}
                    />
                    เพิ่มรายการสั่งอาหาร
                  </button>
                )}
              </div>
              {ROLE === "admin" || ROLE === "user" ? (
                <>
                  <div className="col-md-1 my-5">
                    <button
                      style={{ fontSize: "20px", marginTop: "35px" }}
                      className="btn btn-danger w-100"
                      onClick={handleClearContent}
                    >
                      ลบ
                    </button>
                  </div>
                </>
              ) : (
                <div className="col-md-1 my-5">
                  <button
                    style={{ fontSize: "20px", marginTop: "35px" }}
                    className="btn btn-danger w-100"
                    onClick={handleClearContentGuest}
                  >
                    ลบ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ตารางแสดงออเดอร์ */}
          {(ROLE === "admin" || ROLE === "user") && (
            <div className="table-container">
              <table
                className="table table-bordered table-striped"
                style={{ fontSize: "18px" }}
              >
                <thead
                  className="table-dark"
                  style={{ position: "sticky", zIndex: "1000", top: "0" }}
                >
                  {/* 1. แถวชื่อคอลัมน์หลัก */}
                  <tr>
                    <th>โต๊ะ</th>
                    <th>อาหาร</th>
                    <th>จำนวน</th>
                    <th>ราคา/หน่วย</th>
                    <th>ราคารวม</th>
                    <th style={{ width: "400px" }}>วันที่/เวลา</th>
                    <th>จัดการ</th>
                  </tr>

                  <tr className="bg-light">
                    {/* 1. Filter: โต๊ะที่ (ใช้ 1 คอลัมน์) */}
                    <th className="p-1" style={{ width: "100px" }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="ค้นหาโต๊ะ"
                        value={filterTableNum}
                        onChange={(e) => setFilterTableNum(e.target.value)}
                        style={{
                          fontSize: "16px",
                          height: "38px",
                          fontWeight: "400",
                        }}
                      />
                    </th>

                    {/* 2. Filter: อาหาร (ใช้ 1 คอลัมน์) */}
                    <th className="p-1 text-dark">
                      <Select
                        options={menuOptions}
                        value={filterListOrder}
                        onChange={(selectedOption) =>
                          setFilterListOrder(selectedOption)
                        }
                        placeholder="ค้นหาอาหาร"
                        styles={{
                          control: (base) => ({
                            ...base,
                            fontSize: "16px",
                            width: "100%",
                            fontWeight: "400",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 2000,
                            fontWeight: "400",
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "300px",
                            fontSize: "16px",
                            overflowY: "auto",
                          }),
                        }}
                      />
                    </th>

                    {/* 3. คอลัมน์ว่าง (จำนวน, ราคา/หน่วย, ราคารวม) - ใช้ colSpan="3" */}
                    <th className="p-1" colSpan="3"></th>

                    {/* 4. Filter: วันที่/เวลา (ใช้ 1 คอลัมน์) */}
                    <th className="p-1">
                      {/* ใช้ flex-column เพื่อวาง Input ซ้อนกัน */}
                      <div className="row g-1 align-items-center">
                        <div className="col-5">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ fontSize: "16px", height: "38px" }}
                            title="จากวันที่"
                          />
                        </div>
                        <div className="col-2 text-center">
                          <label className="m-0">ถึง</label>
                        </div>
                        <div className="col-5">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ fontSize: "16px", height: "38px" }}
                            title="ถึงวันที่"
                          />
                        </div>
                      </div>
                    </th>

                    {/* 5. Filter: จัดการ (ใช้ 1 คอลัมน์) */}
                    <th className="p-1">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ height: "100%" }} // ทำให้ปุ่มอยู่ตรงกลางแนวตั้ง
                      >
                        <button
                          className="btn btn-sm btn-danger w-100"
                          onClick={handleClearFilters}
                          style={{
                            fontSize: "16px",
                            padding: "4px 8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ล้างตัวกรอง
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const tableStatusClass =
                        order.status === "completed"
                          ? "table-success"
                          : order.status === "done"
                          ? "table-warning" // Highlight 'done' status
                          : "";

                      const isDoneOrCompleted =
                        order.status === "done" || order.status === "completed";

                      return (
                        <tr key={order.id} className={tableStatusClass}>
                          <td>
                            <span
                              className={
                                order.tablenum.startsWith("TW-") || order.tablenum.includes("-")
                                  ? "fw-bold text-primary"
                                  : ""
                              }
                            >
                              {order.tablenum}
                            </span>
                          </td>
                          <td>{order.listorder}</td>
                          <td>{order.qty}</td>
                          <td>{order.price || "N/A"}</td>
                          <td>{order.total_price || 0}</td>
                          <td>
                            {order.update_at
                              ? new Date(order.update_at).toLocaleString(
                                  "th-TH",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )
                              : ""}
                          </td>
                          <td>
                            {order.status !== "completed" ? (
                              <div className="d-flex gap-2">
                                {/* ปุ่มเสร็จสิ้น */}
                                {order.status !== "done" && (
                                  <button
                                    className="btn btn-success flex-fill"
                                    onClick={() => handleDone(order.id)}
                                    disabled={isEditing}
                                  >
                                    เสร็จสิ้น
                                  </button>
                                )}

                                {/* ปุ่มแก้ไข */}
                                <button
                                  className="btn btn-primary flex-fill"
                                  onClick={() => handleEdit(order)}
                                  disabled={isDoneOrCompleted}
                                >
                                  แก้ไข
                                </button>

                                <button
                                  className="btn btn-danger flex-fill"
                                  onClick={() => handleDelete(order.id)}
                                  disabled={isDoneOrCompleted}
                                >
                                  ลบ
                                </button>
                              </div>
                            ) : (
                              <span className="text-success fw-bold d-flex justify-content-center align-items-center">
                                เสร็จสิ้นแล้ว
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      {/* ปรับ colSpan เป็น 7 ตามจำนวนคอลัมน์รวม */}
                      <td colSpan="7" className="text-center">
                        {orders.length > 0
                          ? "ไม่พบออเดอร์ที่ตรงตามเงื่อนไข"
                          : "ไม่มีออเดอร์"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer"></div>
      </div>
    </div>
  );
}
