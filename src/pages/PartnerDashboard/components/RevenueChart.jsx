import React, { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { useHotels } from '../../../api/HotelContext';
import '../partnerDashboard.css';

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const API_BASE = 'http://localhost:8889';

const formatVND = (n) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + 'tr ₫'
    : n.toLocaleString('vi-VN') + ' ₫';

export default function RevenueChart() {
  const { active } = useHotels();

  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  const now = new Date();

  // ========================= STATE =========================
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [dailyData, setDailyData] = useState([]);
  const [totalRevenueChart, setTotalRevenueChart] = useState(0);
  const [avgDayRevenue, setAvgDayRevenue] = useState(0);
  const [totalBooking, setTotalBooking] = useState(0);
  const [totalBookingByMonth, setTotalBookingByMonth] = useState(0);
  const [totalRevenues, setTotalRevenues] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('all');

  const role = sessionStorage.getItem('partner_role');
  const userId = sessionStorage.getItem('partner_userId');

  // ========================= STATS =========================
  const totalRevenue = active.reduce((s, p) => s + p.revenue, 0);

  const totalBookings = active.reduce(
    (s, p) => s + p.bookings,
    0
  );

  const avgRating =
    active.length > 0
      ? (
          active.reduce((s, p) => s + p.rating, 0) /
          active.length
        ).toFixed(1)
      : '—';

  const stats = [
    {
      label: 'Chỗ nghỉ hoạt động',
      value: active.length,
      icon: '',
      color: '#003580',
    },
    {
      label: 'Tổng đặt phòng',
      value: totalBooking,
      icon: '',
      color: '#0ea5e9',
    },
    {
      label: 'Doanh thu tháng',
      value: totalRevenueChart.toLocaleString('vi-VN'),
      icon: '',
      color: '#10b981',
    },
    {
      label: 'Tổng doanh thu',
      value: totalRevenues.toLocaleString('vi-VN'),
      icon: '',
      color: '#f59e0b',
    },
  ];

  // ========================= LOAD HOTELS =========================
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        let res;

        if (role === 'ADMIN') {
          res = await fetch(
            `${API_BASE}/api/hotel/gethotelactive`
          );
        } else if (role === 'PARTNER') {
          res = await fetch(
            `${API_BASE}/api/hotel/gethotelactivebyuserid/${userId}`
          );
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
        console.error(
          'Lỗi tải danh sách khách sạn:',
          err
        );
      }
    };

    if (userId && role) {
      fetchHotels();
    }
  }, [role, userId]);

  // ========================= FETCH REVENUE =========================
  const fetchRevenue = useCallback(async () => {
    if (!userId || !role) {
      setError(
        'Không tìm thấy thông tin đối tác/admin.'
      );
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

      if (!url) {
        throw new Error(
          'Không thể xác định API'
        );
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const days = MONTH_DAYS[month - 1];

      const filled = Array.from(
        { length: days },
        (_, i) => {
          const found = (data.daily || []).find(
            (d) => d.day === i + 1
          );

          return found ? found.revenue : 0;
        }
      );

      setDailyData(filled);
      setTotalRevenueChart(
        data.totalRevenue ?? 0
      );
      setAvgDayRevenue(
        data.avgDayRevenue ?? 0
      );
      setTotalBooking(
        data.totalBooking ?? 0
      );
      setTotalBookingByMonth(
        data.totalBookingByMonth ?? 0
      );
      setTotalRevenues(
        data.totalRevenues ?? 0
      );
    } catch (err) {
      console.error(
        'Lỗi tải doanh thu:',
        err
      );

      setError(
        'Không thể tải dữ liệu doanh thu.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    year,
    month,
    selectedHotel,
    role,
    userId,
  ]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // ========================= CHART =========================
  useEffect(() => {
    const ctx =
      chartRef.current?.getContext('2d');

    if (!ctx || loading) return;

    const days = MONTH_DAYS[month - 1];

    const labels = Array.from(
      { length: days },
      (_, i) =>
        String(i + 1).padStart(2, '0')
    );

    const avg = avgDayRevenue;

    if (instanceRef.current) {
      instanceRef.current.destroy();
    }

    instanceRef.current = new Chart(ctx, {
      type: 'bar',

      data: {
        labels,

        datasets: [
          {
            label: 'Doanh thu ngày',
            data: dailyData,
            backgroundColor:
              'rgba(83,74,183,0.75)',
            borderRadius: 4,
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
          legend: {
            display: false,
          },

          tooltip: {
            callbacks: {
              label: (ctx) =>
                ' ' +
                ctx.parsed.y.toLocaleString(
                  'vi-VN'
                ) +
                ' ₫',
            },
          },
        },

        scales: {
          x: {
            ticks: {
              font: {
                size: 11,
              },
              autoSkip: true,
              maxTicksLimit: 16,
            },

            grid: {
              color: 'rgba(0,0,0,0.06)',
            },
          },

          y: {
            title: {
              display: true,
              text: 'Doanh thu (VND)',
              font: {
                size: 11,
              },
            },

            ticks: {
              callback: (v) =>
                v >= 1e6
                  ? v / 1e6 + 'tr'
                  : v.toLocaleString(
                      'vi-VN'
                    ),
            },

            grid: {
              color: 'rgba(0,0,0,0.06)',
              borderDash: [4, 3],
            },
          },
        },
      },
    });

    return () =>
      instanceRef.current?.destroy();
  }, [
    dailyData,
    avgDayRevenue,
    month,
    loading,
  ]);

  // ========================= UI =========================
  return (
    <>
      {/* ================= STATS ================= */}
      <div className="pd-stats">
        {stats.map((s) => (
          <div
            key={s.label}
            className="pd-stats__card"
            style={{
              borderLeft: `4px solid ${s.color}`,
            }}
          >
            <div className="pd-stats__icon">
              {s.icon}
            </div>

            <div className="pd-stats__value">
              {s.value}
            </div>

            <div className="pd-stats__label">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="pd-revenue-chart">
        <div className="pd-revenue-chart__header">
          <span className="pd-revenue-chart__title">
            Biểu đồ doanh thu
          </span>

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* HOTEL */}
            <select
              value={selectedHotel}
              onChange={(e) =>
                setSelectedHotel(
                  e.target.value
                )
              }
              className="pd-revenue-chart__select"
              style={{ maxWidth: 180 }}
            >
              <option value="all">
                Tất cả{' '}
                {role === 'ADMIN'
                  ? '(Hệ thống)'
                  : 'khách sạn'}
              </option>

              {hotels.map((h) => (
                <option
                  key={h.id}
                  value={h.id}
                >
                  {h.name}
                </option>
              ))}
            </select>

            {/* YEAR */}
            <select
              value={year}
              onChange={(e) =>
                setYear(
                  Number(e.target.value)
                )
              }
              className="pd-revenue-chart__select"
            >
              {[
                now.getFullYear() - 1,
                now.getFullYear(),
                now.getFullYear() + 1,
              ].map((y) => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              ))}
            </select>

            {/* MONTH */}
            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  Number(e.target.value)
                )
              }
              className="pd-revenue-chart__select"
            >
              {Array.from(
                { length: 12 },
                (_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                  >
                    Tháng {i + 1}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        

        {/* LEGEND */}
        <div className="pd-revenue-chart__legend">
          <span>
            <span className="legend-bar" />
            Doanh thu ngày
          </span>

          <span>
            <span className="legend-line" />
            Trung bình
          </span>
        </div>

        {/* CHART */}
        <div
          style={{
            position: 'relative',
            height: 240,
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                background:
                  'rgba(255,255,255,0.7)',
                fontSize: 14,
                color: '#888',
                zIndex: 2,
              }}
            >
              Đang tải...
            </div>
          )}

          {error && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                color: '#e55',
                fontSize: 13,
                zIndex: 2,
              }}
            >
              {error}
            </div>
          )}

          <canvas
            ref={chartRef}
            role="img"
            aria-label="Biểu đồ doanh thu theo ngày"
          />
        </div>
      </div>
    </>
  );
}
