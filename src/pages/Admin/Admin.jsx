import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BedDouble,
  Home,
  ChevronLeft,
  TrendingUp,
  Star,
  DollarSign,
  Users,
  Menu,
  Bell,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard", active: true },
  { icon: BookOpen, label: "Quản lý đặt phòng", key: "bookings" },
  { icon: BedDouble, label: "Quản lý phòng", key: "rooms" },
  { icon: Home, label: "Về trang chủ", key: "home" },
];

const stats = [
  {
    label: "Tổng số đặt phòng",
    value: "1,284",
    icon: BookOpen,
    change: "+12.5%",
    up: true,
    color: "#FF6B35",
    bg: "#fff4ef",
  },
  {
    label: "Tổng doanh thu",
    value: "48.6M ₫",
    icon: DollarSign,
    change: "+8.2%",
    up: true,
    color: "#2563EB",
    bg: "#eff6ff",
  },
  {
    label: "Tổng số khách sạn",
    value: "38",
    icon: Users,
    change: "+3",
    up: true,
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    label: "Xếp hạng trung bình",
    value: "4.7",
    icon: Star,
    change: "-0.1",
    up: false,
    color: "#D97706",
    bg: "#fffbeb",
  },
];

const months = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const revenueData = [
  { day: "1", value: 3200000 },
  { day: "5", value: 5800000 },
  { day: "10", value: 4100000 },
  { day: "15", value: 7600000 },
  { day: "20", value: 6200000 },
  { day: "25", value: 9100000 },
  { day: "30", value: 8400000 },
];

const recentBookings = [
  { id: "#BK-0041", guest: "Nguyễn Văn A", hotel: "Melia Hanoi", room: "Deluxe", date: "06/04/2026", status: "Confirmed", amount: "2,400,000 ₫" },
  { id: "#BK-0040", guest: "Trần Thị B", hotel: "Sofitel Legend", room: "Suite", date: "05/04/2026", status: "Pending", amount: "5,200,000 ₫" },
  { id: "#BK-0039", guest: "Lê Hoàng C", hotel: "Lotte Hotel", room: "Standard", date: "04/04/2026", status: "Confirmed", amount: "1,100,000 ₫" },
  { id: "#BK-0038", guest: "Phạm Minh D", hotel: "Hilton Hanoi", room: "Junior Suite", date: "03/04/2026", status: "Cancelled", amount: "3,800,000 ₫" },
  { id: "#BK-0037", guest: "Vũ Thu E", hotel: "JW Marriott", room: "Deluxe", date: "02/04/2026", status: "Confirmed", amount: "2,900,000 ₫" },
];

const statusStyle = {
  Confirmed: { bg: "#ecfdf5", color: "#059669", label: "Xác nhận" },
  Pending: { bg: "#fffbeb", color: "#D97706", label: "Chờ xử lý" },
  Cancelled: { bg: "#fef2f2", color: "#DC2626", label: "Đã huỷ" },
};

const maxVal = Math.max(...revenueData.map((d) => d.value));

export default function HotelAdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState("Tháng 4");
  const successRate = 73;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8fafd", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240,
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: 68 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #FF6B35, #f59e0b)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🏨</span>
          </div>
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>
              Hotel <span style={{ color: "#FF6B35" }}>Booking</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {sidebarItems.map(({ icon: Icon, label, key }) => {
            const isActive = activeNav === key;
            return (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "linear-gradient(90deg, #FF6B35, #f59e0b22)" : "transparent",
                  color: isActive ? "#FF6B35" : "rgba(255,255,255,0.55)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  width: "100%",
                  textAlign: "left",
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(255,107,53,0.3)" : "none",
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: isActive ? "#FF6B35" : "rgba(255,255,255,0.45)" }} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse btn */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "10px", borderRadius: 10,
              border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)",
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft size={18} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
            {!collapsed && <span style={{ fontSize: 13, marginLeft: 8 }}>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{
          background: "#fff",
          borderBottom: "1px solid #e9eef6",
          padding: "0 28px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 9,
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                placeholder="Tìm kiếm..."
                style={{
                  paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                  border: "1.5px solid #e9eef6", borderRadius: 10, fontSize: 14,
                  background: "#f8fafd", color: "#1e293b", outline: "none", width: 220,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ position: "relative", background: "#f8fafd", border: "1.5px solid #e9eef6", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
              <Bell size={18} style={{ color: "#64748b" }} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#FF6B35", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Admin</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Quản trị viên</div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: "28px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Page title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Tổng quan</h1>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>Thứ Hai, 06 tháng 4 năm 2026</p>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10, border: "none",
              background: "#FF6B35", color: "#fff", fontWeight: 600, fontSize: 14,
              cursor: "pointer", boxShadow: "0 4px 14px rgba(255,107,53,0.3)",
            }}>
              <Calendar size={15} /> Báo cáo tháng này
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f4fa",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: s.up ? "#059669" : "#DC2626",
                      background: s.up ? "#ecfdf5" : "#fef2f2",
                      padding: "3px 8px", borderRadius: 20,
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {s.change}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress & Chart Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18 }}>
            {/* Success rate */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              border: "1px solid #f0f4fa",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Tỉ lệ đặt phòng thành công</div>
              {/* Circular progress */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <svg viewBox="0 0 120 120" width="120" height="120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f4fa" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="url(#grad)" strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - successRate / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{successRate}%</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#64748b", fontSize: 13, textAlign: "center" }}>
                  {successRate}% đơn đặt phòng đã được<br />thanh toán thành công
                </p>
              </div>

              {/* Mini breakdown */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Xác nhận", pct: 73, color: "#059669" },
                  { label: "Đang chờ", pct: 18, color: "#D97706" },
                  { label: "Đã huỷ", pct: 9, color: "#DC2626" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#64748b", width: 72 }}>{item.label}</span>
                    <div style={{ flex: 1, height: 6, background: "#f0f4fa", borderRadius: 99 }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", width: 30 }}>{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue chart */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              border: "1px solid #f0f4fa",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Biểu đồ doanh thu</div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: "7px 28px 7px 12px",
                    border: "1.5px solid #e9eef6",
                    borderRadius: 10,
                    fontSize: 13,
                    background: "#f8fafd",
                    color: "#1e293b",
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: 500,
                  }}
                >
                  {months.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160 }}>
                {revenueData.map((d) => {
                  const h = Math.round((d.value / maxVal) * 140);
                  return (
                    <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>
                        {(d.value / 1000000).toFixed(1)}M
                      </div>
                      <div
                        title={`Ngày ${d.day}: ${(d.value / 1000000).toFixed(1)}M ₫`}
                        style={{
                          width: "100%",
                          height: h,
                          background: "linear-gradient(180deg, #FF6B35, #f59e0b)",
                          borderRadius: "8px 8px 4px 4px",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                          minHeight: 8,
                        }}
                      />
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{d.day}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f4fa", display: "flex", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Tổng tháng này</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>44.4M ₫</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Trung bình / ngày</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>1.48M ₫</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "4px 10px", borderRadius: 20 }}>
                    <ArrowUpRight size={12} style={{ display: "inline" }} /> +8.2% so với tháng trước
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent bookings */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid #f0f4fa",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Đặt phòng gần đây</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid #e9eef6", borderRadius: 10, background: "#f8fafd", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                  <Filter size={14} /> Lọc
                </button>
                <button style={{ padding: "7px 16px", border: "none", borderRadius: 10, background: "linear-gradient(90deg,#FF6B35,#f59e0b)", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  Xem tất cả
                </button>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Mã đơn", "Khách hàng", "Khách sạn", "Loại phòng", "Ngày", "Trạng thái", "Số tiền", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #f0f4fa", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => {
                  const s = statusStyle[b.status];
                  return (
                    <tr key={b.id} style={{ borderBottom: i < recentBookings.length - 1 ? "1px solid #f8fafd" : "none" }}>
                      <td style={{ padding: "14px 14px", fontSize: 13, fontWeight: 700, color: "#FF6B35" }}>{b.id}</td>
                      <td style={{ padding: "14px 14px", fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${i * 40 + 200}, 60%, 92%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: `hsl(${i * 40 + 200}, 60%, 40%)` }}>
                            {b.guest.charAt(b.guest.lastIndexOf(" ") + 1)}
                          </div>
                          {b.guest}
                        </div>
                      </td>
                      <td style={{ padding: "14px 14px", fontSize: 13, color: "#64748b" }}>{b.hotel}</td>
                      <td style={{ padding: "14px 14px", fontSize: 13, color: "#64748b" }}>{b.room}</td>
                      <td style={{ padding: "14px 14px", fontSize: 13, color: "#64748b" }}>{b.date}</td>
                      <td style={{ padding: "14px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 20 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "14px 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.amount}</td>
                      <td style={{ padding: "14px 14px" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}