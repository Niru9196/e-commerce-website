import React from "react";
import Hero from "../Components/Hero/Hero";
import Popular from "../Components/Popular/Popular";
import Offers from "../Components/Offers/Offers";
import NewCollections from "../Components/NewCollections/NewCollections";
import RecentlyViewed from "../Components/RecentlyViewed/RecentlyViewed";
import NewsLetter from "../Components/Newsletter/NewsLetter";

const Shop = () => {
    return (
        <>
            <Hero />
            <Popular />
            <Offers />
            <NewCollections />
            <RecentlyViewed index="06" />
            <NewsLetter />
        </>
    );
};

export default Shop;
