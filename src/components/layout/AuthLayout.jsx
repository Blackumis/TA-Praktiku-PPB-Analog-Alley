import { Outlet } from 'react-router-dom';

/**
 * Auth Layout Component
 * Background image layout for authentication pages
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start md:justify-center px-4 py-6 overflow-x-hidden overflow-y-auto">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      ></div>
      
      {/* Overlay for better readability */}
      <div className="fixed inset-0 bg-black/30"></div>
      
      {/* Logo - Responsive sizing */}
      <div className="relative z-10 mb-4 md:mb-6 mt-4 md:mt-0 flex-shrink-0">
        <img 
          src="/images/Analog_Alley_Logo.jpg" 
          alt="Analog Alley" 
          className="h-20 sm:h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-2xl rounded-lg" 
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex-shrink-0">
        <Outlet />
      </div>
      
      {/* Bottom spacing for mobile */}
      <div className="h-6 md:h-0 flex-shrink-0" />
    </div>
  );
};

export default AuthLayout;
