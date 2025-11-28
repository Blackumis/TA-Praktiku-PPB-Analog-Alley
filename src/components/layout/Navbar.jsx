import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Download, LogIn, ChevronRight } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { authService } from '../../services';

const Navbar = ({ cartCount = 0, wishlistCount = 0 }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWAInstall();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Profile', path: '/profile' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2 bg-gray-900/95 backdrop-blur-2xl shadow-xl shadow-black/20 border-b border-white/5' 
          : 'py-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="relative flex items-center group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="/images/Analog_Alley_Logo.jpg" 
                alt="Analog Alley" 
                className={`relative w-auto rounded-lg transition-all duration-300 group-hover:scale-105 ${
                  scrolled ? 'h-10' : 'h-12'
                }`} 
              />
            </Link>
            
            {/* Centered Desktop Nav */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-12">
              <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.05]">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 group"
                    >
                      {/* Active background */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25" />
                      )}
                      {/* Hover background */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-300" />
                      )}
                      <span className={`relative z-10 transition-colors duration-300 ${
                        isActive 
                          ? 'text-gray-900 font-semibold' 
                          : 'text-white/60 group-hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <div className={`relative transition-all duration-300 ${searchFocused ? 'w-72' : 'w-52 lg:w-60'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search products..."
                    className="relative w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-amber-500/50 transition-all duration-300"
                  />
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                    searchFocused ? 'text-amber-400' : 'text-white/40'
                  }`} />
                </div>
              </form>
              
              {/* Action Buttons Container */}
              <div className="flex items-center gap-2">
                {/* Install App Button */}
                {isInstallable && (
                  <button 
                    onClick={installApp}
                    className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-amber-400 hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-300"
                    title="Install App"
                  >
                    <Download className="w-[18px] h-[18px]" />
                  </button>
                )}
                
                {/* Wishlist */}
                <Link 
                  to="/wishlist" 
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-amber-400 hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-300"
                >
                  <Heart className="w-[18px] h-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
                
                {/* Cart */}
                <Link 
                  to="/cart" 
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-amber-400 hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-300"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] text-gray-900 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                
                {/* Profile or Sign In */}
                {!loading && (
                  user ? (
                    <Link 
                      to="/profile" 
                      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-gray-900 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300"
                    >
                      <User className="w-[18px] h-[18px]" />
                    </Link>
                  ) : (
                    <Link 
                      to="/login" 
                      className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] transition-all duration-300"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  )
                )}
                
                {/* Mobile Menu Toggle */}
                <button 
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-all duration-300" 
                  onClick={() => setMobileMenu(!mobileMenu)}
                >
                  <div className="relative w-5 h-5">
                    <span className={`absolute left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenu ? 'top-[9px] rotate-45' : 'top-1'}`} />
                    <span className={`absolute left-0 top-[9px] w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenu ? 'opacity-0 scale-0' : 'opacity-100'}`} />
                    <span className={`absolute left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenu ? 'top-[9px] -rotate-45' : 'top-[17px]'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenu(false)}
      />
      
      {/* Enhanced Mobile Menu */}
      <div className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-gray-900/98 backdrop-blur-2xl border-l border-white/[0.05] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
        mobileMenu ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
            <span className="text-white font-semibold">Menu</span>
            <button 
              onClick={() => setMobileMenu(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/[0.08] focus:border-amber-500/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </form>

            {/* Mobile Install Button */}
            {isInstallable && (
              <button 
                onClick={() => { installApp(); setMobileMenu(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/70 hover:bg-white/[0.05] hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-amber-400" />
                  <span className="font-medium">Install App</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>
            )}
            
            {/* Mobile Nav Links */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 font-semibold shadow-lg shadow-amber-500/20' 
                      : 'bg-white/[0.03] border border-white/[0.05] text-white/70 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-gray-900/50' : 'text-white/30'}`} />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Footer */}
          {!loading && !user && (
            <div className="p-4 border-t border-white/[0.05]">
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;