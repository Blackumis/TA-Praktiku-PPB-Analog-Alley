import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowRight, Camera, Shield, Truck, RotateCcw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { productsService, wishlistService, cartService } from '../services';
import { useAuth } from '../hooks/useAuth';

const brands = [
  { name: 'Pentax', color: 'from-yellow-500 to-yellow-700' },
  { name: 'Nikon', color: 'from-yellow-500 to-yellow-700' },
  { name: 'Leica', color: 'from-yellow-500 to-yellow-700' },
  { name: 'Canon', color: 'from-yellow-500 to-yellow-700' },
];

const features = [
  { icon: Camera, title: 'Authentic Vintage', desc: '100% original cameras' },
  { icon: Shield, title: '6 Month Warranty', desc: 'Full coverage guarantee' },
  { icon: Truck, title: 'Free Shipping', desc: 'Orders over Rp.2.000.000' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '14-day return policy' },
];

const formatPrice = (p) => p ? `Rp ${p.toLocaleString('id-ID')}` : 'Rp 0';

const HeroBanner = () => (
  <section className="relative pt-24 pb-8 px-4 sm:px-6">
    <div className="max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 via-orange-500/80 to-rose-500/90" />
        <div className="absolute inset-0 opacity-40 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=1200')" }} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 px-8 sm:px-12 py-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            New Collection Available
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Get <span className="text-yellow-300">10% off</span> for your first purchase
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-md">Discover our curated collection of premium cameras.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-amber-400 transition-all flex items-center gap-2 group shadow-xl">
              View Catalog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesBar = () => (
  <section className="px-4 sm:px-6 py-8">
    <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-amber-400/30 transition-all">
          <div className="p-3 rounded-xl bg-amber-500/20"><f.icon className="w-6 h-6 text-amber-400" /></div>
          <div>
            <h4 className="text-white font-semibold">{f.title}</h4>
            <p className="text-white/60 text-sm">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{children}</h2>
    {subtitle && <p className="text-white/60 max-w-md mx-auto">{subtitle}</p>}
    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
  </div>
);

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted }) => (
  <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
    {product.isNew && <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">NEW</span>}
    <button onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }} className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-all">
      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
    </button>
    <Link to={`/products/${product.id}`} className="block">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>
    </Link>
    <div className="p-5">
      <span className="text-amber-400/80 text-xs font-medium uppercase">{product.category}</span>
      <Link to={`/products/${product.id}`}>
        <h3 className="text-white font-semibold text-lg mt-1 mb-2 hover:text-amber-400 transition-colors">{product.name}</h3>
      </Link>
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-white font-medium text-sm">{product.rating}</span>
        <span className="text-white/40 text-sm">({product.reviews})</span>
      </div>
      <p className="text-amber-400 font-bold text-xl">{formatPrice(product.price)}</p>
      <button onClick={() => onAddToCart(product)} className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-2">
        <ShoppingCart className="w-4 h-4" /> Add to Cart
      </button>
    </div>
  </div>
);

const BrandCard = ({ brand }) => (
  <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${brand.color} p-1 hover:scale-105 transition-all cursor-pointer`}>
    <div className="w-full h-full rounded-xl bg-black/80 flex items-center justify-center">
      <span className="text-3xl font-bold text-white hover:text-amber-400 transition-colors">{brand.name}</span>
    </div>
  </div>
);



const Home = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsService.getProducts({ 
        limit: 4, 
        sortBy: 'created_at', 
        sortOrder: 'desc',
        filters: { is_active: true }
      });
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await cartService.addToCart(user.id, product.id, 1);
      alert(`Added ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistData = await wishlistService.getWishlist(user.id);
      const productIds = wishlistData.map(item => item.product_id);
      setWishlist(productIds);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const toggleWishlist = async (id) => {
    if (!user) {
      alert('Please login to add items to your wishlist');
      return;
    }

    try {
      if (wishlist.includes(id)) {
        await wishlistService.removeFromWishlist(user.id, id);
        setWishlist(wishlist.filter(i => i !== id));
      } else {
        await wishlistService.addToWishlist(user.id, id);
        setWishlist([...wishlist, id]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.message === 'Item already in wishlist') {
        if (user) loadWishlist();
      } else {
        alert('Failed to update wishlist');
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center  bg-no-repeat "
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      <Navbar cartCount={cart.length} wishlistCount={wishlist.length} />
      
      <main>
        <HeroBanner />
        <FeaturesBar />
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionTitle subtitle="Fresh arrivals from our latest collection">Latest Products</SectionTitle>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={{
                    ...p,
                    image: p.image_url || 'https://via.placeholder.com/400',
                    category: p.category || 'Camera',
                    isNew: true,
                    reviews: p.rating_count || 0
                  }} 
                  onAddToCart={addToCart} 
                  onToggleWishlist={toggleWishlist} 
                  isWishlisted={wishlist.includes(p.id)} 
                />
              ))}
            </div>
          )}
        </section>
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionTitle subtitle="Shop from iconic manufacturers">Popular Brands</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((b) => <BrandCard key={b.name} brand={b} />)}
          </div>
        </section>
        
      </main>
    </div>
  );
};

export default Home;