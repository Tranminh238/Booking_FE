import React from "react";
import { Link } from "react-router-dom";

const benefits = [
    "45% host nhận được đơn đặt đầu tiên trong vòng 1 tuần",
    "Tùy chọn: nhận đơn tức thì hoặc khách gửi yêu cầu đặt phòng",
    "Chúng tôi sẽ hỗ trợ xử lý thanh toán cho Quý vị",
];

const PartnerRegisterCard = () => {
    return (
        <div className="partner-card">
            <h2 className="partner-card__title">Đăng ký miễn phí</h2>

            <ul className="partner-card__benefits">
                {benefits.map((benefit, index) => (
                    <li key={index} className="partner-card__benefit-item">
                        <span className="partner-card__checkmark">✓</span>
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>

            <Link to="/register-partner" className="partner-card__cta-btn">
                Bắt đầu ngay &nbsp;⟶
            </Link>

            <div className="partner-card__footer">
                <p className="partner-card__footer-text">
                    Quý vị đã bắt đầu quá trình đăng ký?
                </p>
                <Link to="/login-partner" className="partner-card__footer-link">
                    Tiếp tục các bước đăng ký
                </Link>
            </div>
        </div>
    );
};

export default PartnerRegisterCard;
