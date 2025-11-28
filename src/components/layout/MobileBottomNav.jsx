import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const MobileBottomNav = ({ cartCount = 0, wishlistCount = 0 }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Products', 
      path: '/products', 
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: User,
      color: 'from-amber-500 to-orange-500',
      isCenter: true
    },
    { 
      name: 'Wishlist', 
      path: '/wishlist', 
      icon: Heart,
      color: 'from-red-500 to-rose-500',
      badge: wishlistCount
    },
    { 
      name: 'Cart', 
      path: '/cart', 
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-500',
      badge: cartCount
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind navbar */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10" />
        
        <div className="relative px-1 pb-safe">
          <div className="flex items-end justify-around h-16">
            {navItems.map((item) => {
              const isActive = activeTab === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center flex-1 h-full"
                >
                  {/* Center Profile Button - Elevated Style */}
                  {item.isCenter ? (
                    <div className="relative -mt-4 flex flex-col items-center">
                      {/* Outer ring glow */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 blur-lg opacity-50 scale-125' 
                          : 'opacity-0'
                      }`} />
                      
                      {/* Button container */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40 scale-105' 
                          : 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-black/30'
                      }`}>
                        {/* Inner highlight */}
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                        
                        <Icon className={`relative w-5 h-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-white/70'
                        }`} />
                      </div>
                      
                      {/* Label */}
                      <span className={`mt-1 text-[10px] font-medium transition-all duration-300 ${
                        isActive ? 'text-amber-400' : 'text-white/50'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  ) : (
                    /* Regular Navigation Items */
                    <div className="flex flex-col items-center justify-center py-2">
                      {/* Icon with background */}
                      <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} shadow-lg` 
                          : 'bg-transparent'
                      }`}>
                        <Icon className={`w-5 h-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-white/50'
                        }`} />
                        
                        {/* Badge */}
                        {item.badge > 0 && (
                          <span className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-white text-gray-900 shadow-md' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      
                      {/* Label */}
                      <span className={`mt-0.5 text-[10px] font-medium transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-white/40'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
