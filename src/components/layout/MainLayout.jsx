import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { cartService, wishlistService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

/**
 * Main Layout Component
 * Wraps pages with consistent navbar, footer, and mobile bottom nav
 */
const MainLayout = () => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  const loadCounts = async () => {
    try {
      const [cart, wishlist] = await Promise.all([
        cartService.getCartCount(user.id),
        wishlistService.getWishlistCount(user.id)
      ]);
      setCartCount(cart);
      setWishlistCount(wishlist);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav cartCount={cartCount} wishlistCount={wishlistCount} />
    </div>
  );
};

export default MainLayout;
