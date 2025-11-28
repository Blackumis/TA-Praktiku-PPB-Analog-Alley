import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, Smartphone, Wallet, Building2, CheckCircle, 
  Package, Truck, MapPin, User, Mail, Phone, Home, ArrowLeft,
  AlertCircle, Sparkles, Gift, Shield, Plus, Edit2, Loader
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { wishlistService, cartService, profileService, ordersService } from '../services';
import { useAuth } from '../hooks/useAuth';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (user) {
      loadCart();
      loadWishlistCount();
      loadAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      
    
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        await cartService.syncLocalStorageToDb(user.id, localCart);
        localStorage.removeItem('cart');
      }

      const cartData = await cartService.getCart(user.id);
      setCart(cartData || []);
      setCartLoaded(true);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartLoaded(true);
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

  const loadAddresses = async () => {
    try {
      const addressesData = await profileService.getAddresses(user.id);
      setAddresses(addressesData || []);
      
  
      const defaultAddr = addressesData?.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (addressesData?.length > 0) {
        setSelectedAddress(addressesData[0]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const [step, setStep] = useState(1); 
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);


  const [newAddressData, setNewAddressData] = useState({
    street: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Indonesia',
    is_default: false
  });

  const formatPrice = (p) => p ? `Rp ${p.toLocaleString('id-ID')}` : 'Rp 0';
  

  const subtotal = cart.reduce((sum, item) => {
    const price = item.products?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  const shipping = subtotal > 2000000 ? 0 : 50000;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + shipping + tax;


  const paymentMethods = [
    { 
      id: 'credit', 
      name: 'Credit/Debit Card', 
      icon: CreditCard, 
      color: 'from-blue-500 to-indigo-600',
      description: 'Visa, Mastercard, Amex'
    },
    { 
      id: 'ewallet', 
      name: 'E-Wallet', 
      icon: Smartphone, 
      color: 'from-green-500 to-emerald-600',
      description: 'GoPay, OVO, Dana, ShopeePay'
    },
    { 
      id: 'bank', 
      name: 'Bank Transfer', 
      icon: Building2, 
      color: 'from-purple-500 to-pink-600',
      description: 'BCA, Mandiri, BNI, BRI'
    },
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: Wallet, 
      color: 'from-amber-500 to-orange-600',
      description: 'Pay when you receive'
    },
  ];

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    if (useNewAddress) {
      try {
        const savedAddress = await profileService.addAddress(user.id, newAddressData);
        setSelectedAddress(savedAddress);
        setAddresses([...addresses, savedAddress]);
      } catch (error) {
        console.error('Error saving address:', error);
        alert('Failed to save address. Please try again.');
        return;
      }
    }

    if (!selectedAddress && !useNewAddress) {
      alert('Please select or add a shipping address.');
      return;
    }

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleCompleteOrder = async () => {
    if (!paymentMethod || !user || !selectedAddress) {
      alert('Please select a payment method and shipping address.');
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        // Build order items matching database schema
        const orderItems = cart.map(item => ({
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          quantity: item.quantity || 1,
          unit_price: item.products?.price || 0,
          product_snapshot: {
            name: item.products?.name,
            price: item.products?.price,
            image_url: item.products?.image_url
          }
        }));

        // Build shipping address as JSON for storage
        const shippingAddressJson = {
          street: selectedAddress.street,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country || 'Indonesia'
        };

        // Build order data matching exact database schema
        const orderData = {
          subtotal: subtotal,
          shipping_cost: shipping,
          tax: tax,
          discount: 0,
          total: total,
          shipping_address: shippingAddressJson,
          payment_method: paymentMethod,
          notes: null,
          items: orderItems
        };

        console.log('Submitting order:', orderData);

        const createdOrder = await ordersService.createOrder(user.id, orderData);
        console.log('Order created successfully:', createdOrder);
        
        setOrderNumber(createdOrder.order_number || createdOrder.id?.slice(0, 8).toUpperCase());

        await cartService.clearCart(user.id);
        setCart([]);
        
        setProcessing(false);
        setStep(3);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error completing order:', error);
        setProcessing(false);
        alert(`Failed to complete order: ${error.message || 'Please try again.'}`);
      }
    }, 2500);
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  // Only redirect if cart has been loaded, is empty, and not on success screen
  if (cartLoaded && cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Browse Products
          </button>
        </div>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Success Screen */}
        {step === 3 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
              {/* Success Animation */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-20 h-20 text-white" />
                </div>
                <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-amber-400 animate-spin" />
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-white/60 text-lg mb-2">
                Thank you for your purchase!
              </p>
              <p className="text-white/40 mb-8">
                Your order is being prepared with love and care
              </p>

              {/* Order Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-white/80">
                    <span>Order Number</span>
                    <span className="font-mono text-amber-400">#{orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Total Amount</span>
                    <span className="font-bold text-amber-400">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Payment Method</span>
                    <span className="capitalize">{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Shipping To</span>
                    <span className="text-right max-w-xs">{selectedAddress?.city}, {selectedAddress?.province}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Estimated Delivery</span>
                    <span>3-5 Business Days</span>
                  </div>
                </div>
              </div>

              {/* Fun Messages */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white text-sm">Purchase Protected</p>
                </div>
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <Truck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white text-sm">Fast Shipping</p>
                </div>
                <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                  <Gift className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-white text-sm">Gift Wrapped</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg text-center"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/profile"
                  className="flex-1 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-center"
                >
                  View Orders
                </Link>
              </div>

              {/* Fun Note */}
              <div className="mt-8 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                <p className="text-purple-300 text-sm">
                  📸 <strong>Fun Fact:</strong> This is a demo payment system! No real money was charged. 
                  In production, you'd integrate with a real payment gateway like Midtrans or Stripe.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                {[
                  { num: 1, label: 'Shipping Address', icon: MapPin },
                  { num: 2, label: 'Payment', icon: CreditCard },
                  { num: 3, label: 'Confirmation', icon: CheckCircle }
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
                      step >= s.num 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg' 
                        : 'bg-white/10 text-white/40'
                    }`}>
                      <s.icon className="w-5 h-5" />
                      <span className="font-semibold hidden sm:inline">{s.label}</span>
                      <span className="font-bold">{s.num}</span>
                    </div>
                    {idx < 2 && (
                      <div className={`w-12 h-1 ${step > s.num ? 'bg-amber-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                {step === 1 && (
                  <form onSubmit={handleProceedToPayment} className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-amber-400" />
                        Select Shipping Address
                      </h2>

                      {/* Saved Addresses */}
                      {addresses.length > 0 && !useNewAddress && (
                        <div className="space-y-4 mb-6">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              onClick={() => setSelectedAddress(address)}
                              className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                selectedAddress?.id === address.id
                                  ? 'border-amber-400 bg-amber-500/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-amber-400" />
                                    {address.is_default && (
                                      <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white font-medium">{address.street}</p>
                                  <p className="text-white/70 text-sm">{address.city}, {address.province} {address.postal_code}</p>
                                  <p className="text-white/70 text-sm">{address.country}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedAddress?.id === address.id
                                    ? 'border-amber-400 bg-amber-400'
                                    : 'border-white/20'
                                }`}>
                                  {selectedAddress?.id === address.id && (
                                    <CheckCircle className="w-4 h-4 text-black" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Address Toggle */}
                      {!useNewAddress && (
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(true)}
                          className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 mb-6"
                        >
                          <Plus className="w-5 h-5" />
                          Add New Address
                        </button>
                      )}

                      {/* New Address Form */}
                      {(useNewAddress || addresses.length === 0) && (
                        <div className="space-y-6 p-6 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">New Shipping Address</h3>
                            {addresses.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setUseNewAddress(false)}
                                className="text-white/60 hover:text-white text-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-white font-semibold mb-2">Street Address *</label>
                            <textarea
                              required
                              value={newAddressData.street}
                              onChange={(e) => setNewAddressData({ ...newAddressData, street: e.target.value })}
                              rows="3"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all resize-none"
                              placeholder="Enter your complete street address"
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white font-semibold mb-2">City *</label>
                              <input
                                type="text"
                                required
                                value={newAddressData.city}
                                onChange={(e) => setNewAddressData({ ...newAddressData, city: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                                placeholder="Semarang"
                              />
                            </div>

                            <div>
                              <label className="block text-white font-semibold mb-2">Province *</label>
                              <input
                                type="text"
                                required
                                value={newAddressData.province}
                                onChange={(e) => setNewAddressData({ ...newAddressData, province: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                                placeholder="Jawa Tengah"
                              />
                            </div>

                            <div>
                              <label className="block text-white font-semibold mb-2">Postal Code *</label>
                              <input
                                type="text"
                                required
                                value={newAddressData.postal_code}
                                onChange={(e) => setNewAddressData({ ...newAddressData, postal_code: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                                placeholder="50123"
                              />
                            </div>

                            <div>
                              <label className="block text-white font-semibold mb-2">Country *</label>
                              <input
                                type="text"
                                required
                                value={newAddressData.country}
                                onChange={(e) => setNewAddressData({ ...newAddressData, country: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                                placeholder="Indonesia"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="is_default"
                              checked={newAddressData.is_default}
                              onChange={(e) => setNewAddressData({ ...newAddressData, is_default: e.target.checked })}
                              className="w-5 h-5 rounded border-white/20 text-amber-500"
                            />
                            <label htmlFor="is_default" className="text-white cursor-pointer">
                              Set as default address
                            </label>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!selectedAddress && !useNewAddress}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Selected Address Summary */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-400" />
                        Shipping To:
                      </h3>
                      <div className="text-white/80">
                        <p className="font-medium">{selectedAddress?.street}</p>
                        <p>{selectedAddress?.city}, {selectedAddress?.province} {selectedAddress?.postal_code}</p>
                        <p>{selectedAddress?.country}</p>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-3 text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Change Address
                      </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-amber-400" />
                        Select Payment Method
                      </h2>

                      <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-6 rounded-2xl border-2 transition-all text-left ${
                              paymentMethod === method.id
                                ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4`}>
                              <method.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-white font-bold mb-1">{method.name}</h3>
                            <p className="text-white/60 text-sm">{method.description}</p>
                          </button>
                        ))}
                      </div>

                      {/* Fun Demo Notice */}
                      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-blue-300 font-semibold mb-1">Demo Mode Active</p>
                            <p className="text-blue-200/80 text-sm">
                              This is a simulated checkout for demonstration purposes. No actual payment will be processed!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
                        >
                          <ArrowLeft className="w-5 h-5 inline mr-2" />
                          Back
                        </button>
                        <button
                          onClick={handleCompleteOrder}
                          disabled={!paymentMethod || processing}
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader className="w-5 h-5 animate-spin" />
                              Processing Payment...
                            </span>
                          ) : (
                            'Complete Order'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
                  <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => {
                      const product = item.products;
                      if (!product) return null;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm line-clamp-1">{product.name}</p>
                            <p className="text-white/60 text-xs">Qty: {item.quantity}</p>
                            <p className="text-amber-400 font-bold text-sm">{formatPrice(product.price * item.quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-white/80">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Shipping</span>
                      <span className="font-semibold">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Tax (11%)</span>
                      <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-amber-400">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Checkout;
