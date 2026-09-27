import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useShop } from "../Context/ShopContext";
import Breadcrumbs from "../Components/Breadcrums/Breadcrumbs";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
import DescriptionBox from "../Components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../Components/RelatedProducts/RelatedProducts";
import RecentlyViewed from "../Components/RecentlyViewed/RecentlyViewed";
import NotFound from "./NotFound";

const Product = () => {
    const { all_product, recordView } = useShop();
    const { productId } = useParams();

    const numericId = Number(productId);
    const product = Number.isFinite(numericId)
        ? all_product.find((item) => item.id === numericId)
        : undefined;

    // Records the view for the "Recently viewed" rails. Runs after render so
    // it never blocks the page, and is a no-op in the reducer when this
    // product is already the most recent entry.
    useEffect(() => {
        if (product) recordView(product.id);
    }, [product, recordView]);

    // Unknown, missing, or non-numeric ids get a real page instead of a
    // TypeError from reading `product.category` further down the tree.
    if (!product) {
        return (
            <NotFound
                title="Product not found"
                message="We couldn't find that piece. It may have sold out or been retired from the catalogue."
            />
        );
    }

    return (
        <div>
            <Breadcrumbs product={product} />
            <ProductDisplay product={product} />
            <DescriptionBox product={product} />
            <RelatedProducts product={product} />
            <RecentlyViewed excludeId={product.id} index="07" />
        </div>
    );
};

export default Product;
