import React from "react";
import Header from "../components/Header";
import HotelCard from "../components/HotelCard";
import ExclusiveOffer from "../components/ExclusiveOffer";
import PopularDestinations from "../components/PopularDestinations";
import Footer from "../components/Footer";

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