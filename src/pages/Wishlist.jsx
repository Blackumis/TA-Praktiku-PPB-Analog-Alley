import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Star, Package } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { wishlistService, cartService } from '../services';
import { useAuth } from '../hooks/useAuth';

const formatPrice = (price) => price ? `Rp ${price.toLocaleString('id-ID')}` : 'Rp 0';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (localWishlist.length > 0) {
        console.log('Migrating localStorage wishlist to database...');
        await wishlistService.syncLocalStorageToDb(user.id, localWishlist);
        localStorage.removeItem('wishlist'); 
      }
      const wishlistData = await wishlistService.getWishlist(user.id);
      const items = wishlistData.map(item => item.products).filter(Boolean);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(user.id, productId);
      setWishlistItems(items => items.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const addToCart = async (product) => {
    try {
      await cartService.addToCart(user.id, product.id, 1);
      alert(`Added ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Item already in cart') {
        alert('This item is already in your cart');
      } else {
        alert('Failed to add item to cart');
      }
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await wishlistService.clearWishlist(user.id);
        setWishlistItems([]);
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        alert('Failed to clear wishlist');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      <div className="relative z-10">
        <Navbar wishlistCount={wishlistItems.length} />
        
        <main className="pt-24 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">My Wishlist</h1>
                <p className="text-white/60">
                  {wishlistItems.length === 0 
                    ? 'Your wishlist is empty' 
                    : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} saved`
                  }
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
              </div>
            ) : wishlistItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                  <Heart className="w-12 h-12 text-white/40" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Your Wishlist is Empty</h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Start adding products to your wishlist by clicking the heart icon on any product.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-all shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Browse Products
                </Link>
              </div>
            ) : (
              /* Wishlist Items Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                  <WishlistCard
                    key={product.id}
                    product={product}
                    onRemove={removeFromWishlist}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}

            {/* Continue Shopping */}
            {wishlistItems.length > 0 && (
              <div className="mt-12 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-semibold rounded-full hover:bg-white/20 transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const WishlistCard = ({ product, onRemove, onAddToCart }) => {
  const inStock = product.stock_quantity > 0;
  const imageUrl = product.image_url || 'https://via.placeholder.com/400';

  return (
    <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
      {/* Stock Badge */}
      {!inStock && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
          Out of Stock
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-red-500/80 backdrop-blur hover:bg-red-600 transition-all hover:scale-110"
        title="Remove from wishlist"
      >
        <Trash2 className="w-5 h-5 text-white" />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {product.brand && (
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 text-xs font-medium">
              {product.brand}
            </span>
          )}
          {product.category && (
            <span className="px-2 py-1 bg-white/10 rounded text-white/60 text-xs font-medium">
              {product.category}
            </span>
          )}
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 hover:text-amber-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-white font-medium text-sm">
            {product.rating_average?.toFixed(1) || '0.0'}
          </span>
          <span className="text-white/40 text-sm">
            ({product.rating_count || 0})
          </span>
        </div>

        {/* Price */}
        <p className="text-amber-400 font-bold text-xl mb-4">{formatPrice(product.price)}</p>

        {/* Stock Info */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Package className="w-4 h-4 text-white/60" />
          <span className="text-white/80">
            {inStock ? (
              <>{product.stock_quantity} in stock</>
            ) : (
              <span className="text-red-400 font-medium">Out of stock</span>
            )}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => inStock && onAddToCart(product)}
          disabled={!inStock}
          className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            inStock
              ? 'bg-white/10 text-white hover:bg-amber-500 hover:text-black shadow-lg'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default Wishlist;
