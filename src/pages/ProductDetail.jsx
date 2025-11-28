import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Package,
  Info,
  Ruler,
  Weight,
  Palette,
  Calendar,
  Check,
  X,
  Camera,
  Aperture,
  Focus,
  MessageCircle,
  ThumbsUp,
  User as UserIcon
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { productsService, cartService, wishlistService } from '../services';
import { useAuth } from '../hooks/useAuth';

const formatPrice = (price) => price ? `Rp ${price.toLocaleString('id-ID')}` : 'Rp 0';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkUserReview();
    }
  }, [user, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getProductById(id);
      setProduct(data);
      setSelectedImage(0);
      // Increment view count
      productsService.incrementProductViews(id);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await productsService.getProductReviews(id);
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;
    const reviewed = await productsService.hasUserReviewed(user.id, id);
    setHasReviewed(reviewed);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await productsService.addProductReview(user.id, id, {
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        is_verified_purchase: false // Could check if user purchased this product
      });

      // Refresh reviews and product data
      await Promise.all([fetchReviews(), fetchProduct()]);
      setNewReview({ rating: 5, comment: '' });
      setActiveTab('reviews');
      setHasReviewed(true);
      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert('Please login to mark reviews as helpful');
      return;
    }

    try {
      await productsService.markReviewHelpful(reviewId, user.id);
      // Refresh reviews to show updated count
      await fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    if (product && product.stock_quantity >= quantity) {
      try {
        await cartService.addToCart(user.id, product.id, quantity);
        alert(`Added ${quantity} ${product.name} to cart!`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
      }
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(user.id, product.id);
        setIsWishlisted(false);
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-90" style={{ backgroundImage: "url('/images/background.jpg')" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: "url('/images/background.jpg')" }} />
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative z-10">
          <Navbar />
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Product Not Found</h2>
            <p className="text-white/60 mb-8">{error || 'The product you are looking for does not exist.'}</p>
            <Link
              to="/products"
              className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-all"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;
  const imageUrl = product.image_url || 'https://via.placeholder.com/800';
  const specifications = product.specifications || {};

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10">
        <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                {!inStock && (
                  <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                    <span className="px-6 py-3 bg-red-500 text-white font-bold rounded-full text-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="flex items-center gap-3">
                {product.brand && (
                  <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
                    {product.brand}
                  </span>
                )}
                {product.category && (
                  <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm font-medium">
                    {product.category}
                  </span>
                )}
                {product.is_active && (
                  <span className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Active
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-white">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating_average || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-medium">{product.rating_average?.toFixed(1) || '0.0'}</span>
                <span className="text-white/40">({product.rating_count || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="py-4 border-t border-b border-white/10">
                <p className="text-5xl font-bold text-amber-400">{formatPrice(product.price)}</p>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-white/70 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Stock Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Package className="w-5 h-5 text-amber-400" />
                <span className="text-white/80">
                  {inStock ? (
                    <>
                      <span className="font-semibold text-white">{product.stock_quantity}</span> units available
                    </>
                  ) : (
                    <span className="font-semibold text-red-400">Out of Stock</span>
                  )}
                </span>
              </div>

              {/* Quantity Selector & Actions */}
              {inStock && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-white font-medium">Quantity:</label>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="px-6 text-white font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={toggleWishlist}
                      className={`px-6 py-4 rounded-xl border-2 transition-all ${
                        isWishlisted
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-white/5 border-white/20 text-white hover:border-white/40'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <Truck className="w-8 h-8 text-amber-400 mb-2" />
                  <span className="text-white/60 text-sm">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-8 h-8 text-amber-400 mb-2" />
                  <span className="text-white/60 text-sm">Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <RotateCcw className="w-8 h-8 text-amber-400 mb-2" />
                  <span className="text-white/60 text-sm">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          {Object.keys(specifications).length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-white mb-6">Technical Specifications</h2>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {/* Left Column */}
                  <div className="p-6 space-y-4">
                    {specifications.sensor_type && (
                      <SpecRow icon={<Camera />} label="Sensor Type" value={specifications.sensor_type} />
                    )}
                    {specifications.megapixels && (
                      <SpecRow icon={<Camera />} label="Megapixels" value={`${specifications.megapixels} MP`} />
                    )}
                    {specifications.iso_range && (
                      <SpecRow icon={<Aperture />} label="ISO Range" value={specifications.iso_range} />
                    )}
                    {specifications.video_resolution && (
                      <SpecRow icon={<Camera />} label="Video Resolution" value={specifications.video_resolution} />
                    )}
                    {specifications.lens_mount && (
                      <SpecRow icon={<Focus />} label="Lens Mount" value={specifications.lens_mount} />
                    )}
                    {specifications.focal_length && (
                      <SpecRow icon={<Focus />} label="Focal Length" value={specifications.focal_length} />
                    )}
                    {specifications.max_aperture && (
                      <SpecRow icon={<Aperture />} label="Max Aperture" value={specifications.max_aperture} />
                    )}
                    {specifications.min_aperture && (
                      <SpecRow icon={<Aperture />} label="Min Aperture" value={specifications.min_aperture} />
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="p-6 space-y-4">
                    {specifications.lens_type && (
                      <SpecRow icon={<Focus />} label="Lens Type" value={specifications.lens_type} />
                    )}
                    {specifications.weight && (
                      <SpecRow icon={<Weight />} label="Weight" value={specifications.weight} />
                    )}
                    {specifications.dimensions && (
                      <SpecRow icon={<Ruler />} label="Dimensions" value={specifications.dimensions} />
                    )}
                    {specifications.color && (
                      <SpecRow icon={<Palette />} label="Color" value={specifications.color} />
                    )}
                    {specifications.material && (
                      <SpecRow icon={<Info />} label="Material" value={specifications.material} />
                    )}
                    {specifications.compatibility && (
                      <SpecRow icon={<Check />} label="Compatibility" value={specifications.compatibility} />
                    )}
                    {product.created_at && (
                      <SpecRow 
                        icon={<Calendar />} 
                        label="Listed Date" 
                        value={new Date(product.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Product Details */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product ID */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Product ID</h3>
                </div>
                <p className="text-white/60 font-mono">{product.id}</p>
            </div>

            {/* SKU */}
            {product.sku && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">SKU</h3>
                </div>
                <p className="text-white/60 font-mono">{product.sku}</p>
              </div>
            )}

            {/* Last Updated */}
            {product.updated_at && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Last Updated</h3>
                </div>
                <p className="text-white/60">
                  {new Date(product.updated_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Ratings & Reviews Section */}
          <div className="mt-12">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              {/* Section Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <MessageCircle className="w-8 h-8 text-amber-400" />
                    <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      <span className="text-3xl font-bold text-white">{product.rating_average?.toFixed(1) || '0.0'}</span>
                    </div>
                    <p className="text-white/60">Based on {product.rating_count || reviews.length} reviews</p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-white text-sm">{stars}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-amber-400 h-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === 'reviews'
                      ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('writeReview')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === 'writeReview'
                      ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Write a Review
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'reviews' ? (
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-amber-400/30 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                                {review.profiles?.avatar_url ? (
                                  <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold">
                                    {review.profiles?.full_name || 'Anonymous User'}
                                  </h4>
                                  {review.is_verified_purchase && (
                                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-white/20'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-white/40 text-sm">
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-white/80 mb-4 leading-relaxed">{review.comment}</p>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleMarkHelpful(review.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">Helpful ({review.helpful_count || 0})</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    {!user ? (
                      <div className="text-center py-8">
                        <UserIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                        <p className="text-white/60 mb-6">Please login to write a review</p>
                        <button 
                          onClick={() => navigate('/login')}
                          className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-all"
                        >
                          Login to Review
                        </button>
                      </div>
                    ) : hasReviewed ? (
                      <div className="text-center py-8">
                        <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Review Submitted</h3>
                        <p className="text-white/60">You have already reviewed this product. Thank you!</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-white mb-6">Share Your Experience</h3>
                        <form className="space-y-6" onSubmit={handleSubmitReview}>
                          {/* Rating Selector */}
                          <div>
                            <label className="block text-white font-semibold mb-3">Your Rating</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-10 h-10 ${
                                      star <= newReview.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-white/20 hover:text-amber-400/50'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comment */}
                          <div>
                            <label className="block text-white font-semibold mb-3">Your Review</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              rows={6}
                              required
                              placeholder="Share your thoughts about this product..."
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all resize-none"
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {submittingReview ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                Submitting...
                              </>
                            ) : (
                              'Submit Review'
                            )}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};


const SpecRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  </div>
);

export default ProductDetail;
