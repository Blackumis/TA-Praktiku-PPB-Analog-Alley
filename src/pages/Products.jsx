import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, X, ChevronDown, ChevronUp, Star, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { productsService, wishlistService, cartService } from '../services';
import { useAuth } from '../hooks/useAuth';

const formatPrice = (price) => price ? `Rp ${price.toLocaleString('id-ID')}` : 'Rp 0';



const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm">
    {label}
    <button onClick={onRemove} className="hover:bg-amber-500/30 rounded-full p-0.5 transition-colors">
      <X className="w-4 h-4" />
    </button>
  </span>
);

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-white/10 pb-4 mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-white font-semibold mb-3 hover:text-amber-400 transition-colors"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
};

const CheckboxFilter = ({ label, count, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-amber-500 border-amber-500' : 'border-white/60 group-hover:border-amber-400'
    }`}>
      {checked && <span className="text-black text-xs font-bold">✓</span>}
    </div>
    <span className="text-white group-hover:text-white transition-colors flex-1 font-bold">{label}</span>
    <span className="text-white text-sm font-bold">({count})</span>
  </label>
);

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, cartQty }) => {
  const inStock = product.stock_quantity > 0;
  const imageUrl = product.image_url || 'https://via.placeholder.com/400';
  
  return (
    <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10">
      {!inStock && (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
          <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-full">Out of Stock</span>
        </div>
      )}
    
    <button 
      onClick={(e) => {
        e.preventDefault();
        onToggleWishlist(product.id);
      }}
      className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-all hover:scale-110"
    >
      <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
    </button>
    
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-amber-100/20 to-orange-100/20 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {product.brand && <span className="px-2 py-1 bg-white/10 rounded text-white/60 text-xs">{product.brand}</span>}
          {product.category && <span className="px-2 py-1 bg-black/50 rounded text-white/100 text-xs">{product.category}</span>}
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 hover:text-amber-400 transition-colors">{product.name}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-white font-medium text-sm">{product.rating_average?.toFixed(1) || '0.0'}</span>
          <span className="text-white/40 text-sm">({product.rating_count || 0})</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-amber-400 font-bold text-xl">{formatPrice(product.price)}</p>
          {cartQty > 0 && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
              Qty: {cartQty}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => inStock && onAddToCart(product)}
          disabled={!inStock}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            inStock 
              ? 'bg-white/10 text-white hover:bg-amber-500 hover:text-black' 
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


export default function ProductsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
    if (user) {
      loadWishlist();
    }
  }, [user]);

 
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsService.getProducts({ 
        limit: 100,
        filters: { is_active: true }
      });
      setAllProducts(data || []);
      
      const uniqueBrands = [...new Set(data?.map(p => p.brand).filter(Boolean))];
      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))];
      setBrands(uniqueBrands);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const searchMatch = searchQuery === '' || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return brandMatch && categoryMatch && searchMatch;
    });
  }, [allProducts, selectedBrands, selectedCategories, searchQuery]);

  const getBrandCount = (brand) => {
    return allProducts.filter(p => {
      const brandMatch = p.brand === brand;
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const searchMatch = searchQuery === '' || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return brandMatch && categoryMatch && searchMatch;
    }).length;
  };

  const getCategoryCount = (category) => {
    return allProducts.filter(p => {
      const categoryMatch = p.category === category;
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const searchMatch = searchQuery === '' || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return brandMatch && categoryMatch && searchMatch;
    }).length;
  };

  const getCartQty = (productId) => cart.filter(item => item.id === productId).length;

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

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  const activeFilters = [...selectedBrands, ...selectedCategories];

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center opacity-100 bg-no-repeat "
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      <Navbar cartCount={cart.length} />
      
      <main className="pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Title & Search */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-4xl font-bold text-white">
                <span className="border-b-4 border-amber-400">Products</span>
              </h1>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all shadow-lg"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-amber-500/20 rounded-full">
                  <Search className="w-4 h-4 text-amber-400" />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchQuery && (
              <p className="text-white/60 text-sm">
                Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </div>
          
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Filter</h2>
                  {activeFilters.length > 0 && (
                    <button onClick={clearFilters} className="text-amber-400 text-sm hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                
                <FilterSection title="Brand Name">
                  {brands.length === 0 ? (
                    <p className="text-white/40 text-sm">No brands available</p>
                  ) : (
                    brands.map(brand => (
                      <CheckboxFilter
                        key={brand}
                        label={brand}
                        count={getBrandCount(brand)}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                    ))
                  )}
                </FilterSection>
                
                <FilterSection title="Category">
                  {categories.length === 0 ? (
                    <p className="text-white/40 text-sm">No categories available</p>
                  ) : (
                    categories.map(category => (
                      <CheckboxFilter
                        key={category}
                        label={category}
                        count={getCategoryCount(category)}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                    ))
                  )}
                </FilterSection>
              </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Active Filters & Mobile Filter Button */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button 
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                
                {activeFilters.map(filter => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    onRemove={() => {
                      if (brands.includes(filter)) toggleBrand(filter);
                      else toggleCategory(filter);
                    }}
                  />
                ))}
              </div>
              
              {/* Product Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10  ">
                  <p className="text-3xl font-bold text-white border-b-4 border-amber-400 ">
                    {allProducts.length === 0 ? 'No products available yet.' : 'No products match your filters.'}
                  </p>
                  {activeFilters.length > 0 && (
                    <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-amber-500 text-black rounded-full font-medium">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                      cartQty={getCartQty(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button onClick={() => setShowMobileFilter(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <FilterSection title="Brand Name">
              {brands.length === 0 ? (
                <p className="text-white/40 text-sm">No brands available</p>
              ) : (
                brands.map(brand => (
                  <CheckboxFilter
                    key={brand}
                    label={brand}
                    count={getBrandCount(brand)}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                ))
              )}
            </FilterSection>
            
            <FilterSection title="Category">
              {categories.length === 0 ? (
                <p className="text-white/40 text-sm">No categories available</p>
              ) : (
                categories.map(category => (
                  <CheckboxFilter
                    key={category}
                    label={category}
                    count={getCategoryCount(category)}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                ))
              )}
            </FilterSection>
            
            <button 
              onClick={() => setShowMobileFilter(false)}
              className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}