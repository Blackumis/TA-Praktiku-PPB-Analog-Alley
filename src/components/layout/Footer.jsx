import { Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Analog<span className="text-amber-400">Alley</span>
          </h3>
          <p className="text-white/60 text-sm mb-4">Your trusted source for premium vintage cameras since 2020.</p>
          <div className="flex gap-3">
            <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-white transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-white transition-all">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-amber-400 transition-colors">Products</Link></li>
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>📞 08331143113</li>
            <li>📧 lacha@gmail.com</li>
            <li>📍 Semarang, Indonesia</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/40 text-sm">
        <p>© 2024 Analog Alley. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;