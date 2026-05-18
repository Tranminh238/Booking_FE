import React, { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const API_BASE = 'http://localhost:8889';

export default function RevenueChart() {
  const chartRef   = useRef(null);
  const instanceRef = useRef(null);

  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);   // 1-indexed (tháng thực)
  const [year,  setYear]  = useState(now.getFullYear());

  const [dailyData,     setDailyData]     = useState([]);
  const [totalRevenue,  setTotalRevenue]  = useState(0);
  const [avgDayRevenue, setAvgDayRevenue] = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('all');

  const role = sessionStorage.getItem('partner_role');
  const userId = sessionStorage.getItem('partner_userId');

  // Lấy danh sách khách sạn để filter
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        let res;
        if (role === 'ADMIN') {
          res = await fetch(`${API_BASE}/api/hotel/gethotelactive`);
        } else if (role === 'PARTNER') {
          res = await fetch(`${API_BASE}/api/hotel/gethotelactivebyuserid/${userId}`);
        } else {
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.status === 200 && data.data) {
            setHotels(data.data);
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách khách sạn:', err);
      }
    };
    if (userId && role) {
      fetchHotels();
    }
  }, [role, userId]);

  /* ────────────────────────────── fetch API ──────────────────────────────── */
  const fetchRevenue = useCallback(async () => {
    if (!userId || !role) {
      setError('Không tìm thấy thông tin đối tác/admin.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (selectedHotel !== 'all') {
        url = `${API_BASE}/api/thongke/revenue-hotel?hotelId=${selectedHotel}&year=${year}&month=${month}`;
      } else {
        if (role === 'ADMIN') {
          url = `${API_BASE}/api/thongke/revenue-admin?year=${year}&month=${month}`;
        } else if (role === 'PARTNER') {
          url = `${API_BASE}/api/thongke/revenue-partner?userId=${userId}&year=${year}&month=${month}`;
        }
      }

      if (!url) throw new Error('Không thể xác định đường dẫn gọi API');

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // data.daily = [{ day: 1, revenue: 500000 }, ...]
      const days = MONTH_DAYS[month - 1];
      const filled = Array.from({ length: days }, (_, i) => {
        const found = (data.daily || []).find(d => d.day === i + 1);
        return found ? found.revenue : 0;
      });

      setDailyData(filled);
      setTotalRevenue(data.totalRevenue  ?? 0);
      setAvgDayRevenue(data.avgDayRevenue ?? 0);
    } catch (err) {
      console.error('Lỗi tải doanh thu:', err);
      setError('Không thể tải dữ liệu doanh thu.');
    } finally {
      setLoading(false);
    }
  }, [year, month, selectedHotel, role, userId]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  /* ──────────────────────────── vẽ biểu đồ ───────────────────────────────── */
  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx || loading) return;

    const days   = MONTH_DAYS[month - 1];
    const labels = Array.from({ length: days }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );
    const avg = avgDayRevenue;

    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu ngày',
            data: dailyData,
            backgroundColor: 'rgba(83,74,183,0.75)',
            borderRadius: 3,
            borderSkipped: false,
            order: 2,
          },
          {
            label: 'Trung bình',
            data: Array(days).fill(avg),
            type: 'line',
            borderColor: '#85B7EB',
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointRadius: 0,
            fill: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ' ' + ctx.parsed.y.toLocaleString('vi-VN') + ' ₫',
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, autoSkip: true, maxTicksLimit: 16 },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          y: {
            title: { display: true, text: 'Doanh thu (VND)', font: { size: 11 } },
            ticks: {
              callback: (v) =>
                v >= 1e6 ? v / 1e6 + 'tr' : v.toLocaleString('vi-VN'),
            },
            grid: { color: 'rgba(0,0,0,0.06)', borderDash: [4, 3] },
          },
        },
      },
    });

    return () => instanceRef.current?.destroy();
  }, [dailyData, avgDayRevenue, month, loading]);

  /* ─────────────────────────────── UI ────────────────────────────────────── */
  return (
    <div className="pd-revenue-chart">
      <div className="pd-revenue-chart__header">
        <span className="pd-revenue-chart__title">Biểu đồ doanh thu</span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Chọn khách sạn */}
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="pd-revenue-chart__select"
            style={{ maxWidth: 160 }}
          >
            <option value="all">
              Tất cả {role === 'ADMIN' ? '(Hệ thống)' : 'khách sạn'}
            </option>
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {/* Chọn năm */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="pd-revenue-chart__select"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Chọn tháng */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="pd-revenue-chart__select"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tóm tắt */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 8, fontSize: 13 }}>
        <span>
          <b>Tổng:</b>{' '}
          <span style={{ color: '#5349b7' }}>
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </span>
        </span>
        <span>
          <b>Trung bình/ngày:</b>{' '}
          {avgDayRevenue.toLocaleString('vi-VN')} ₫
        </span>
      </div>

      <div className="pd-revenue-chart__legend">
        <span><span className="legend-bar" />Doanh thu ngày</span>
        <span><span className="legend-line" />Trung bình</span>
      </div>

      <div style={{ position: 'relative', height: 240 }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)', fontSize: 14, color: '#888'
          }}>
            Đang tải...
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#e55', fontSize: 13
          }}>
            {error}
          </div>
        )}
        <canvas ref={chartRef} role="img" aria-label="Biểu đồ doanh thu theo ngày" />
      </div>
    </div>
  );
}