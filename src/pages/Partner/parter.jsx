import React from "react";
import { useLocation } from "react-router-dom";
import PartnerHero from "./Components/PartnerHero";
import PartnerRegisterCard from "./Components/PartnerRegisterCard";
import PartnerNavbar from "./Components/PartnerNavbar";
import PartnerLogin from "./Components/PartnerLogin";
import PartnerRegister from "./Components/PartnerRegister";
import "./partner.css";

const Partner = () => {
    const location = useLocation();
    const isLogin = location.pathname.includes("/login-partner");
    const isRegister = location.pathname.includes("/register-partner");
    return (
        <div className="partner-page relative">
            <PartnerNavbar />
            <main className="partner-main">
                <div className="partner-container">
                    <PartnerHero />
                    <PartnerRegisterCard />
                </div>
            </main>

            {/* Modal Overlays */}
            {isLogin && <PartnerLogin />}
            {isRegister && <PartnerRegister />}
        </div>
    );
};

export default Partner;
