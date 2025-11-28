import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsService, ordersService } from '../../services';
import { Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products with count
      const { data: productsData, count: totalProductsCount } = await productsService.getProducts({ limit: 5 });
      setRecentProducts(productsData || []);
      
      // Fetch order stats from database
      let orderStats = { total: 0, totalRevenue: 0 };
      try {
        orderStats = await ordersService.getSellerOrderStats();
      } catch (err) {
        console.error('Error fetching order stats:', err);
      }
      
      setStats({
        totalProducts: totalProductsCount || productsData?.length || 0,
        totalRevenue: orderStats.totalRevenue || 0, 
        totalOrders: orderStats.total || 0,
        lowStock: productsData?.filter(p => p.stock_quantity < (p.low_stock_threshold || 5)).length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link to={link} className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your camera store</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="text-blue-600"
            link="/seller/products"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`Rp ${stats.totalRevenue.toLocaleString()}`}
            color="text-green-600"
            link="/seller/orders"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            color="text-purple-600"
            link="/seller/orders"
          />
          <StatCard
            icon={TrendingUp}
            label="Low Stock Items"
            value={stats.lowStock}
            color="text-red-600"
            link="/seller/inventory"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/seller/products/new"
            className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            <Package className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-semibold">Add New Product</h3>
            <p className="text-blue-100 text-sm mt-2">Create a new camera listing</p>
          </Link>
          <Link
            to="/seller/products"
            className="bg-white text-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition text-center border-2 border-gray-200"
          >
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-xl font-semibold">Manage Products</h3>
            <p className="text-gray-600 text-sm mt-2">Edit and update inventory</p>
          </Link>
          <Link
            to="/seller/orders"
            className="bg-white text-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition text-center border-2 border-gray-200"
          >
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-xl font-semibold">View Orders</h3>
            <p className="text-gray-600 text-sm mt-2">Process customer orders</p>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Products</h2>
            <Link to="/seller/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet. Start adding your camera inventory!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        Rp {product.price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stock_quantity < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
