import React from "react";
import Header from "../../pages/Home/components/Header";
import HotelCard from "../../pages/Home/components/HotelCard";
import ExclusiveOffer from "../../pages/Home/components/ExclusiveOffer";
import PopularDestinations from "../../pages/Home/components/PopularDestinations";
import Footer from "../../components/Footer";

const Home = () => {
    return (
        <div>
            <Header />
            <HotelCard />
            <ExclusiveOffer />
            <PopularDestinations />
            <Footer />
        </div>
    );
};

export default Home;