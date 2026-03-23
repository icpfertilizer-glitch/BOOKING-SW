# BOOKING-SW

ระบบจองห้องประชุมออนไลน์ (Meeting Room Booking System)

## Tech Stack
- **Frontend:** HTML / CSS / JavaScript (Vanilla)
- **Backend:** Firebase (Auth, Firestore)
- **UI:** Bootstrap 5, FullCalendar, Chart.js
- **Style:** Glassmorphism + Gradient Theme

## Pages
| หน้า | ไฟล์ | คำอธิบาย |
|------|------|----------|
| Login | `index.html` | เข้าสู่ระบบ |
| Register | `Register.html` | สมัครสมาชิก (เฉพาะอีเมลองค์กร) |
| Bookings | `bookings.html` | ปฏิทินจองห้องประชุม |
| Dashboard | `dashboard.html` | สถานะห้องประชุมแบบ realtime |
| Meeting Rooms | `meeting-rooms.html` | จัดการห้องประชุม (Admin) |
| Admin | `Admin.html` | จัดการสิทธิ์ผู้ใช้ + เพิ่ม user (Admin) |
| Reports | `reportsummarize.html` | รายงานภาพรวมการจอง |
| Settings | `settings.html` | ตั้งค่าโปรไฟล์ / ระบบ |

## Run Locally
```bash
cd public
python -m http.server 8080
# open http://localhost:8080
```