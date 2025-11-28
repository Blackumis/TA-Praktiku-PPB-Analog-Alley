import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Package, Heart, ShoppingBag, 
  Edit, Edit2, Save, X, Camera, Calendar, CreditCard, Truck, 
  Check, Clock, AlertCircle, ChevronRight, Star, Settings,
  LogOut, Shield, Eye, EyeOff, Loader
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { authService, profileService, ordersService, wishlistService, cartService } from '../services';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, wishlistCount: 0 });
  
  const [userData, setUserData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orders, setOrders] = useState([]);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Indonesia',
    is_default: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      setUserData({
        full_name: currentUser.user_metadata?.full_name || currentUser.email || '',
        phone: '',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&size=200&background=f59e0b&color=000`
      });

      try {
        let profileData;
        try {
          profileData = await profileService.getProfile(currentUser.id);
        } catch (profileError) {
          if (profileError.message?.includes('No rows') || profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile...');
            profileData = await profileService.createProfile(currentUser.id, {
              email: currentUser.email,
              full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
              phone: '',
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&size=200&background=f59e0b&color=000`
            });
          } else {
            throw profileError;
          }
        }

        setProfile(profileData);
        setUserData({
          full_name: profileData.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
          phone: profileData.phone || '',
          avatar_url: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&size=200&background=f59e0b&color=000`
        });

        try {
          const addressesData = await profileService.getAddresses(currentUser.id);
          setAddresses(addressesData || []);
        } catch (addrError) {
          console.warn('Addresses table not available:', addrError.message);
          setAddresses([]);
        }

        try {
          const ordersData = await ordersService.getUserOrders(currentUser.id);
          setOrders(ordersData || []);
        } catch (orderError) {
          console.warn('Orders table not available:', orderError.message);
          setOrders([]);
        }

        try {
          const statsData = await profileService.getUserStats(currentUser.id);
          setStats(statsData || { totalOrders: 0, totalSpent: 0, wishlistCount: 0 });
        } catch (statsError) {
          console.warn('Stats calculation failed:', statsError.message);
          setStats({ totalOrders: 0, totalSpent: 0, wishlistCount: 0 });
        }

        try {
          const count = await wishlistService.getWishlistCount(currentUser.id);
          setWishlistCount(count);
        } catch (wishlistError) {
          console.warn('Wishlist count failed:', wishlistError.message);
          setWishlistCount(0);
        }

        try {
          const count = await cartService.getCartCount(currentUser.id);
          setCartCount(count);
        } catch (cartError) {
          console.warn('Cart count failed:', cartError.message);
          setCartCount(0);
        }
      } catch (dbError) {
        console.warn('Database not set up yet:', dbError);
        console.info('To enable full profile features, run the SQL schema from SUPABASE-PROFILE-SCHEMA.md in your Supabase SQL Editor');
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      
      let updatedProfile;
      try {
        updatedProfile = await profileService.updateProfile(user.id, userData);
      } catch (updateError) {
        if (updateError.message?.includes('No rows') || updateError.code === 'PGRST116') {
          console.log('Profile not found during update, creating new profile...');
          updatedProfile = await profileService.createProfile(user.id, userData);
        } else {
          throw updateError;
        }
      }
      
      setProfile(updatedProfile);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      setUpdating(true);
      await authService.updatePassword(passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const addressesData = await profileService.getAddresses(user.id);
      setAddresses(addressesData || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      street: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Indonesia',
      is_default: addresses.length === 0 
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      street: address.street,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      country: address.country || 'Indonesia',
      is_default: address.is_default
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      if (editingAddress) {
        await profileService.updateAddress(editingAddress.id, user.id, addressFormData);
      } else {
        await profileService.addAddress(user.id, addressFormData);
      }
      await loadAddresses();
      setShowAddressModal(false);
      alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    if (!user) return;

    try {
      await profileService.deleteAddress(addressId, user.id);
      await loadAddresses();
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!user) return;

    try {
      await profileService.setDefaultAddress(addressId, user.id);
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;


    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    try {
      setUpdating(true);
      const avatarUrl = await profileService.uploadAvatar(user.id, file);
      setUserData({ ...userData, avatar_url: avatarUrl });
      setProfile({ ...profile, avatar_url: avatarUrl });
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative">
        <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: "url('/images/background.jpg')" }} />
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusConfig = {
    delivered: { color: 'text-green-400', bg: 'bg-green-500/20', icon: Check, label: 'Delivered' },
    shipped: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Truck, label: 'Shipped' },
    processing: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock, label: 'Processing' },
    cancelled: { color: 'text-red-400', bg: 'bg-red-500/20', icon: X, label: 'Cancelled' }
  };

  const formatPrice = (p) => p ? `Rp ${p.toLocaleString('id-ID')}` : 'Rp 0';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/50 shadow-xl shadow-amber-500/20">
                <img src={userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&size=200&background=f59e0b&color=000`} alt={userData.full_name || user.email} className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-amber-500 rounded-full hover:bg-amber-600 transition-all shadow-lg cursor-pointer">
                <Camera className="w-4 h-4 text-black" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating} />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{userData.full_name || user?.email}</h1>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/60 mb-4">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || 'Not available'}
                </span>
                {userData.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {userData.phone}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="px-6 py-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
                  <div className="text-2xl font-bold text-amber-400">{stats.totalOrders}</div>
                  <div className="text-white/60 text-sm">Total Orders</div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{formatPrice(stats.totalSpent)}</div>
                  <div className="text-white/60 text-sm">Total Spent</div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl">
                  <div className="text-2xl font-bold text-red-400">{stats.wishlistCount}</div>
                  <div className="text-white/60 text-sm">Wishlist Items</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setEditMode(true)}
                className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
              <button className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editMode && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Edit2 className="w-6 h-6 text-amber-400" />
                  Edit Profile
                </h2>
                <button 
                  onClick={() => setEditMode(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/50">
                    <img src={userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&size=200&background=f59e0b&color=000`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="cursor-pointer px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all inline-flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Change Avatar
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating} />
                    </label>
                    <p className="text-white/60 text-sm mt-2">Max size: 2MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 mb-2 block font-medium">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-white/40"
                      placeholder="Enter your full name"
                      value={userData.full_name}
                      onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-white/80 mb-2 block font-medium">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl cursor-not-allowed"
                      value={user?.email || ''}
                      disabled
                    />
                    <p className="text-white/40 text-sm mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-white/80 mb-2 block font-medium">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-white/40"
                      placeholder="Enter your phone number"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setEditMode(false)}
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2 mb-8 shadow-xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-6 h-6 text-amber-400" />
                    Personal Information
                  </h2>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-5 h-5 text-amber-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/40 text-sm">Full Name</label>
                    <p className="text-white font-medium">{userData.full_name || user?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm">Email Address</label>
                    <p className="text-white font-medium">{user?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm">Phone Number</label>
                    <p className="text-white font-medium">{userData.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm">Member Since</label>
                    <p className="text-white font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-amber-400" />
                    Default Address
                  </h2>
                  <button 
                    onClick={() => setActiveTab('addresses')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-5 h-5 text-amber-400" />
                  </button>
                </div>
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.find(a => a.is_default) ? (
                      <>
                        <p className="text-white font-medium">{addresses.find(a => a.is_default).street}</p>
                        <p className="text-white/80">{addresses.find(a => a.is_default).city}, {addresses.find(a => a.is_default).province}</p>
                        <p className="text-white/80">{addresses.find(a => a.is_default).postal_code}</p>
                        <p className="text-white/80">{addresses.find(a => a.is_default).country}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-medium">{addresses[0].street}</p>
                        <p className="text-white/80">{addresses[0].city}, {addresses[0].province}</p>
                        <p className="text-white/80">{addresses[0].postal_code}</p>
                        <p className="text-white/80">{addresses[0].country}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/60 text-sm">No address added yet</p>
                  </div>
                )}
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className="mt-6 w-full px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {addresses.length > 0 ? 'Manage Addresses' : 'Add New Address'}
                </button>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-400" />
                  Recent Activity
                </h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order, idx) => {
                      const status = statusConfig[order.status] || statusConfig.processing;
                      return (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400/30 transition-all">
                          <div className={`p-3 rounded-xl ${status.bg}`}>
                            <status.icon className={`w-5 h-5 ${status.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">Order #{order.id?.slice(0, 8)}</p>
                            <p className="text-white/60 text-sm">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">{formatPrice(order.total_amount)}</p>
                            <span className={`text-sm ${status.color}`}>{status.label}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/40" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Order History</h2>
                <div className="flex gap-3">
                  <select className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400">
                    <option>All Orders</option>
                    <option>Delivered</option>
                    <option>Shipped</option>
                    <option>Processing</option>
                  </select>
                </div>
              </div>

              {orders.length > 0 ? orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.processing;
                return (
                  <div key={order.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-amber-400/30 transition-all">
                    {/* Order Header */}
                    <div className="p-6 bg-white/5 border-b border-white/10">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${status.bg}`}>
                            <status.icon className={`w-6 h-6 ${status.color}`} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Order #{order.id?.slice(0, 8)}</h3>
                            <p className="text-white/60">
                              Ordered on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400 font-bold text-xl">{formatPrice(order.total_amount)}</p>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                            <status.icon className="w-4 h-4" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      {order.order_items && order.order_items.length > 0 ? (
                        <div className="space-y-4">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                              <img src={item.products?.image_url || 'https://via.placeholder.com/80'} alt={item.product_name} className="w-20 h-20 object-cover rounded-lg" />
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{item.product_name}</h4>
                                <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                              </div>
                              <p className="text-amber-400 font-bold">{formatPrice(item.price)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/60 text-center py-4">No items in this order</p>
                      )}

                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetailsModal(true);
                          }}
                          className="flex-1 px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">No Orders Yet</h3>
                  <p className="text-white/60 text-sm mb-6">Start shopping to see your orders here!</p>
                  <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg">
                    <ShoppingBag className="w-5 h-5" />
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">My Addresses</h2>
                <button
                  onClick={handleAddAddress}
                  className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Add New Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-white/5 backdrop-blur-lg border rounded-2xl p-6 shadow-xl transition-all ${
                        address.is_default
                          ? 'border-amber-400 ring-2 ring-amber-400/20'
                          : 'border-white/10 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-amber-400" />
                          {address.is_default && (
                            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="Edit Address"
                          >
                            <Edit2 className="w-4 h-4 text-white/70 hover:text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="Delete Address"
                          >
                            <X className="w-4 h-4 text-white/70 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-white/90 mb-4">
                        <p className="font-medium">{address.street}</p>
                        <p>{address.city}, {address.province}</p>
                        <p>{address.postal_code}</p>
                        <p>{address.country}</p>
                      </div>

                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="w-full px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-all border border-white/10"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 text-center shadow-xl">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
                    <MapPin className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No addresses yet</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Add your shipping address to complete your orders faster. You can manage multiple addresses and set a default one.
                  </p>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg"
                  >
                    <MapPin className="w-5 h-5" />
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">My Wishlist</h2>
                <Link to="/wishlist" className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg flex items-center gap-2">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 text-center shadow-xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
                  <Heart className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Your wishlist is waiting</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Save your favorite cameras and accessories for later. Browse our collection and add items to your wishlist.
                </p>
                <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg">
                  Browse Products <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Security Settings */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-amber-400" />
                  Security Settings
                </h2>
                <form className="space-y-4" onSubmit={handlePasswordChange}>
                  <div>
                    <label className="text-white/80 mb-2 block">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-white/60" /> : <Eye className="w-5 h-5 text-white/60" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 mb-2 block">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-white/80 mb-2 block">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:border-amber-400"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={updating}
                    className="w-full px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg mt-4 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Account Actions */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Account Actions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => alert('Privacy settings feature coming soon!')}
                    className="px-6 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-left flex items-center gap-3"
                  >
                    <Shield className="w-5 h-5 text-amber-400" />
                    <div>
                      <div>Privacy Settings</div>
                      <div className="text-sm text-white/60">Manage your data</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => alert('Payment methods feature coming soon!')}
                    className="px-6 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-left flex items-center gap-3"
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <div>
                      <div>Payment Methods</div>
                      <div className="text-sm text-white/60">Manage cards</div>
                    </div>
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="px-6 py-4 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all text-left flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <div>
                      <div>Sign Out</div>
                      <div className="text-sm text-red-400/60">Logout from account</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        alert('Account deletion feature coming soon!');
                      }
                    }}
                    className="px-6 py-4 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all text-left flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <div>Delete Account</div>
                      <div className="text-sm text-red-400/60">Permanently remove</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500 to-orange-500">
              <div>
                <h2 className="text-xl font-bold text-black">Order Details</h2>
                <p className="text-black/70 text-sm font-mono">#{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}</p>
              </div>
              <button 
                onClick={() => setShowOrderDetailsModal(false)}
                className="p-2 text-black/70 hover:text-black hover:bg-black/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Order Status</p>
                    <p className="text-white font-semibold capitalize mt-1">{selectedOrder.status || 'Processing'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Payment Status</p>
                    <p className={`font-semibold capitalize mt-1 ${selectedOrder.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedOrder.payment_status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-white/70">
                    {typeof selectedOrder.shipping_address === 'object' ? (
                      <>
                        <p className="font-medium text-white">{selectedOrder.shipping_address.recipient_name}</p>
                        <p>{selectedOrder.shipping_address.street_address || selectedOrder.shipping_address.street}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state || selectedOrder.shipping_address.province} {selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                        {selectedOrder.shipping_address.phone && (
                          <p className="mt-2 flex items-center gap-1 text-white/60">
                            <Phone className="w-3 h-3" /> {selectedOrder.shipping_address.phone}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>{selectedOrder.shipping_address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Order Items ({selectedOrder.order_items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.length > 0 ? (
                    selectedOrder.order_items.map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-4 bg-white/5 rounded-lg p-3 border border-white/10">
                        {item.products?.image_url ? (
                          <img 
                            src={item.products.image_url} 
                            alt={item.product_name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{item.product_name}</p>
                          <p className="text-sm text-white/60">
                            Qty: {item.quantity} × Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="font-semibold text-amber-400">
                          Rp {(item.total_price || item.unit_price * item.quantity || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-center py-4">No items in this order</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>Rp {(selectedOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Shipping</span>
                    <span>Rp {(selectedOrder.shipping_cost || 0).toLocaleString('id-ID')}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-white/70">
                      <span>Tax</span>
                      <span>Rp {(selectedOrder.tax || 0).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-Rp {(selectedOrder.discount || 0).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-amber-400 text-lg">Rp {(selectedOrder.total || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Order Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {selectedOrder.payment_method || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <MapPin className="w-6 h-6 text-amber-400" />
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Street Address *</label>
                <textarea
                  required
                  value={addressFormData.street}
                  onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all resize-none"
                  placeholder="Enter your complete street address"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                    placeholder="Semarang"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Province *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.province}
                    onChange={(e) => setAddressFormData({ ...addressFormData, province: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                    placeholder="Jawa Tengah"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.postal_code}
                    onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                    placeholder="50123"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
                    placeholder="Indonesia"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={addressFormData.is_default}
                  onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-white/10"
                />
                <label htmlFor="is_default" className="text-white cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
