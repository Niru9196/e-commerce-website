import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import CartDrawer from "./Components/CartDrawer/CartDrawer";
import AskWidget from "./Components/AskWidget/AskWidget";
import CartDrawerProvider from "./Context/CartDrawerContext";
import ScrollToTop from "./Components/Layout/ScrollToTop";
import PageTransition from "./Components/Motion/PageTransition";
import Shop from "./Pages/Shop";
import ShopCategory from "./Pages/ShopCategory";
import Collection from "./Pages/Collection";
import Search from "./Pages/Search";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import LoginSignup from "./Pages/LoginSignup";
import Wishlist from "./Pages/Wishlist";
import Account from "./Pages/Account";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import men_banner from "./Components/Assets/banner_mens.png";
import women_banner from "./Components/Assets/banner_women.png";
import kid_banner from "./Components/Assets/banner_kids.png";

/**
 * Route tree. Separated from App so AnimatePresence can read useLocation().
 *
 * Keyed on pathname (not the full location) so changing filters via search
 * params refines the current page instead of replaying the page transition.
 */
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
                <Routes location={location}>
                    <Route path="/" element={<Shop />} />

                    <Route
                        path="/mens"
                        element={
                            <ShopCategory banner={men_banner} category="men" />
                        }
                    />
                    <Route
                        path="/womens"
                        element={
                            <ShopCategory
                                banner={women_banner}
                                category="women"
                            />
                        }
                    />
                    <Route
                        path="/kids"
                        element={
                            <ShopCategory banner={kid_banner} category="kid" />
                        }
                    />

                    <Route
                        path="/new-arrivals"
                        element={<Collection collection="new-arrivals" />}
                    />
                    <Route path="/sale" element={<Collection collection="sale" />} />

                    <Route path="/search" element={<Search />} />

                    {/* Flattened: the previous nested `/product` > `:productId`
                        pairing rendered Product with no id (white screen) and
                        the child route never mounted because Product has no
                        Outlet. */}
                    <Route path="/product/:productId" element={<Product />} />
                    <Route path="/product" element={<NotFound />} />

                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<LoginSignup />} />

                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <Account />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </PageTransition>
        </AnimatePresence>
    );
};

function App() {
    return (
        // reducedMotion="user" makes Framer Motion drop transform and layout
        // animations automatically when the OS requests reduced motion,
        // keeping opacity changes so state is still perceivable.
        <MotionConfig reducedMotion="user">
            <CartDrawerProvider>
                <ScrollToTop />
                <div className="grain-overlay" aria-hidden="true" />
                <a className="skip-link" href="#main-content">
                    Skip to content
                </a>
                <Navbar />
                <main id="main-content" tabIndex={-1}>
                    <AnimatedRoutes />
                </main>
                <Footer />
                <CartDrawer />
                <AskWidget />
            </CartDrawerProvider>
        </MotionConfig>
    );
}

export default App;
