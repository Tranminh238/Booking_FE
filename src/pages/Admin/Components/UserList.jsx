import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Mail, Phone, RefreshCw, User as UserIcon,
  Trash2, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, X
} from "lucide-react";

// ─── Toast System ──────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium min-w-[280px] max-w-xs transition-all duration-300 animate-slide-in
            ${t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : ""}
            ${t.type === "error"   ? "bg-red-50 border-red-200 text-red-800" : ""}
            ${t.type === "info"    ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
          `}
        >
          {t.type === "success" && <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />}
          {t.type === "error"   && <XCircle     className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />}
          {t.type === "info"    && <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, toast: add, removeToast: remove };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const BASE2 = "http://localhost:8889/account";
const BASE = "http://localhost:8889/users";


const TABS = [
  { key: "all",      label: "Tất cả",         endpoint: "/all-user" },
  { key: "active",   label: "Đang hoạt động", endpoint: "/all-user-active" },
  { key: "inactive", label: "Đã vô hiệu",     endpoint: "/all-user-inactive" },
];

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-pink-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-emerald-500",
  "from-rose-400 to-red-500",
];

function getInitials(name) {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return p.length >= 2 ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase() : name[0].toUpperCase();
}

function getColor(id) { return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]; }

function RoleBadge({ role }) {
  const map = {
    ADMIN:   { label: "Quản trị viên", cls: "bg-red-50 text-red-700 ring-red-200" },
    PARTNER: { label: "Đối tác",       cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  };
  const cfg = map[role] || { label: role || "Khách hàng", cls: "bg-sky-50 text-sky-700 ring-sky-200" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${cfg.cls}`}>
      <UserIcon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, page - 2);
  const end   = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {start > 0 && (
        <>
          <button onClick={() => onChange(0)} className="w-8 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition">1</button>
          {start > 1 && <span className="px-1 text-slate-400 text-xs">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition
            ${p === page ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300" : "text-slate-600 hover:bg-slate-100"}`}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="px-1 text-slate-400 text-xs">…</span>}
          <button onClick={() => onChange(totalPages - 1)} className="w-8 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UserList() {
  const { toasts, toast, removeToast } = useToast();

  const [activeTab, setActiveTab]         = useState("all");
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const currentTab = TABS.find((t) => t.key === activeTab);

  const fetchUsers = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const url = `${BASE}${currentTab.endpoint}?page=${p}&size=${PAGE_SIZE}&sort=id,desc`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.content ?? (Array.isArray(data) ? data : []));
      setTotalPages(data.page?.totalPages ?? 1);
      setTotalElements(data.page?.totalElements ?? 0);
    } catch (err) {
      toast("Không thể tải danh sách người dùng.", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // eslint-disable-line

  useEffect(() => {
    fetchUsers(page);
  }, [activeTab, page]); // eslint-disable-line

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
    setSearch("");
  };

  const handleDelete = async (user) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`${BASE2}/delete/${user.id}`, { method: "POST" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      // ← Thêm check này
      if (!res.ok || data.status !== 200) {
        throw new Error(data.message || "Vô hiệu tài khoản thất bại.");
      }

      toast(`Đã vô hiệu tài khoản "${user.name || user.email}".`, "success");
      fetchUsers(page);
    } catch (err) {
      toast(err.message || "Vô hiệu tài khoản thất bại.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (user) => {
    setActionLoading(user.id);

    try {
      const res = await fetch(`${BASE2}/restore/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        toast(`Đã khôi phục tài khoản "${user.name || user.email}".`, "success");
        fetchUsers(page);
      } else {
        throw new Error(data.message || "Khôi phục tài khoản thất bại.");
      }
    } catch (err) {
      toast(err.message || "Khôi phục tài khoản thất bại.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    const s = `${u.name || ""} ${u.email || ""} ${u.phone || ""}`.toLowerCase();
    return s.includes(search.toLowerCase());
  });

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease; }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* ── Header ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Quản lý người dùng</h1>
                <p className="text-xs text-slate-400 mt-0.5">Tổng cộng {totalElements} tài khoản</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, email, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-56 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                />
              </div>
              <button
                onClick={() => fetchUsers(page)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                title="Làm mới"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── Tabs + Table card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-slate-100 px-6 pt-4 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px
                    ${activeTab === tab.key
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/60"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin mb-4" />
                <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Không tìm thấy người dùng</p>
                <p className="text-slate-400 text-sm mt-1">Thử từ khóa khác hoặc chuyển tab.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3">Người dùng</th>
                      <th className="px-6 py-3">Liên hệ</th>
                      <th className="px-6 py-3">Vai trò</th>
                      <th className="px-6 py-3">Trạng thái</th>
                      <th className="px-6 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((user) => {
                      const isDeleted = user.isDeleted === 1;
                      const busy = actionLoading === user.id;
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">

                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getColor(user.id)} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${isDeleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                  {user.name?.trim() || "Người dùng ẩn danh"}
                                </p>
                                <p className="text-xs text-slate-400">#{user.id}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-3.5">
                            <div className="space-y-1">
                              {user.email ? (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-[160px]">{user.email}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Chưa có email</span>
                              )}
                              {user.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-3.5">
                            <RoleBadge role={user.role} />
                          </td>

                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1
                              ${isDeleted
                                ? "bg-slate-100 text-slate-500 ring-slate-200"
                                : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDeleted ? "bg-slate-400" : "bg-emerald-500"}`} />
                              {isDeleted ? "Vô hiệu" : "Hoạt động"}
                            </span>
                          </td>

                          <td className="px-6 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isDeleted ? (
                                <button
                                  onClick={() => handleRestore(user)}
                                  disabled={busy}
                                  title="Khôi phục tài khoản"
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg ring-1 ring-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                  Khôi phục
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={busy}
                                  title="Vô hiệu hoá tài khoản"
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg ring-1 ring-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  Vô hiệu
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer + Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Trang <span className="font-semibold text-slate-700">{page + 1}</span> / {totalPages}
                  &nbsp;·&nbsp;
                  <span className="font-semibold text-slate-700">{totalElements}</span> tài khoản
                </span>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}