import React, { useEffect, useRef, useState } from 'react';
import { useHotels } from '../../../api/HotelContext';
import Chart from 'chart.js/auto';

const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

export default function RevenueChart() {
  const { active } = useHotels();
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    // Tổng hợp doanh thu từ context hoặc dùng dữ liệu mẫu
    const days = MONTH_DAYS[month];
    const dailyData = Array.from({ length: days }, (_, i) => {
      return active.reduce((sum, hotel) => {
        // Nếu hotel.dailyRevenue là array theo ngày
        return sum + (hotel.dailyRevenue?.[month]?.[i] ?? hotel.revenue / days);
      }, 0);
    });

    const avg = dailyData.reduce((a, b) => a + b, 0) / days;
    const labels = Array.from({ length: days }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );

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
            data: Array(days).fill(parseFloat(avg.toFixed(0))),
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
            title: {
              display: true,
              text: 'Doanh thu (VND)',
              font: { size: 11 },
            },
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
  }, [month, active]);

  return (
    <div className="pd-revenue-chart">
      <div className="pd-revenue-chart__header">
        <span className="pd-revenue-chart__title">Biểu đồ doanh thu</span>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="pd-revenue-chart__select"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>Tháng {i + 1}</option>
          ))}
        </select>
      </div>
      <div className="pd-revenue-chart__legend">
        <span><span className="legend-bar" />Doanh thu ngày</span>
        <span><span className="legend-line" />Trung bình</span>
      </div>
      <div style={{ position: 'relative', height: 240 }}>
        <canvas ref={chartRef} role="img" aria-label="Biểu đồ doanh thu theo ngày" />
      </div>
    </div>
  );
}