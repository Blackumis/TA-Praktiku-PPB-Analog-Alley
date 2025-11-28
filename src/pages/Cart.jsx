import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, CreditCard, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { wishlistService, cartService } from '../services';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCart();
      loadWishlistCount();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        console.log('Migrating localStorage cart to database...');
        await cartService.syncLocalStorageToDb(user.id, localCart);
        localStorage.removeItem('cart');
      }

      const cartData = await cartService.getCart(user.id);
      setCart(cartData || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const count = await wishlistService.getWishlistCount(user.id);
      setWishlistCount(count);
    } catch (error) {
      console.error('Error loading wishlist count:', error);
    }
  };

  const formatPrice = (p) => p ? `Rp ${p.toLocaleString('id-ID')}` : 'Rp 0';

  const updateQuantity = async (cartItemId, productId, change) => {
    if (!user) return;

    try {
      const item = cart.find(c => c.id === cartItemId);
      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        await removeItem(cartItemId);
        return;
      }

      if (newQuantity > (item.products?.stock_quantity || 1)) {
        alert('Cannot exceed available stock');
        return;
      }

      await cartService.updateQuantity(cartItemId, newQuantity);
      setCart(prevCart => 
        prevCart.map(c => 
          c.id === cartItemId ? { ...c, quantity: newQuantity } : c
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId) => {
    if (!user) return;

    try {
      await cartService.removeFromCart(cartItemId);
      setCart(cart.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await cartService.clearCart(user.id);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  
  const subtotal = cart.reduce((sum, item) => {
    const price = item.products?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  const shipping = subtotal > 2000000 ? 0 : 50000;
  const tax = Math.round(subtotal * 0.11); 
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: "url('/images/background.jpg')" }} />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <Navbar cartCount={0} wishlistCount={wishlistCount} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        <Navbar cartCount={0} wishlistCount={wishlistCount} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
              <ShoppingCart className="w-12 h-12 text-white/40" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-white/60 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg"
            >
              Browse Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      <Navbar cartCount={cart.length} wishlistCount={wishlistCount} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            Shopping Cart
            <span className="ml-4 text-lg text-white/60">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
          </h1>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = item.products;
              if (!product) return null;
              
              return (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-amber-400/30 transition-all shadow-xl"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="shrink-0">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-xl hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-xl font-semibold text-white mb-2 hover:text-amber-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        {product.brand && (
                          <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                            {product.brand}
                          </span>
                        )}
                        {product.category && (
                          <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-sm">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <p className="text-amber-400 font-bold text-2xl mb-4">
                        {formatPrice(product.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, product.id, -1)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="px-4 py-1 text-white font-semibold">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, product.id, 1)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            disabled={item.quantity >= (product.stock_quantity || 1)}
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {product.stock_quantity && product.stock_quantity <= 5 && (
                      <p className="text-orange-400 text-sm mt-3">
                        Only {product.stock_quantity} left in stock
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tax (11%)</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
                
                {subtotal < 2000000 && (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 text-sm">
                      Add {formatPrice(2000000 - subtotal)} more for FREE shipping!
                    </p>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span className="text-amber-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl group"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/products"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-all border border-white/20"
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Package className="w-5 h-5 text-green-400" />
                  <span>Free shipping over Rp 2.000.000</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>100% Authentic products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
