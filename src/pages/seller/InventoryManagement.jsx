import { useEffect, useState } from 'react';
import { productsService } from '../../services';
import { AlertTriangle, Package } from 'lucide-react';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsService.getProducts({ limit: 100 });
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await productsService.updateProduct(id, { stock_quantity: parseInt(newStock) });
      setProducts(products.map(p => 
        p.id === id ? { ...p, stock_quantity: parseInt(newStock) } : p
      ));
    } catch (error) {
      alert('Error updating stock: ' + error.message);
    }
  };

  const lowStockProducts = products.filter(p => p.stock_quantity < 5);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage stock levels</p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Out of Stock</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{outOfStockProducts.length}</p>
          <p className="text-sm text-red-700 mt-1">products need restocking</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">Low Stock</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{lowStockProducts.length}</p>
          <p className="text-sm text-orange-700 mt-1">products below threshold</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Current Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${
                      product.stock_quantity === 0 
                        ? 'text-red-600' 
                        : product.stock_quantity < 5 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock_quantity === 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Out of Stock
                      </span>
                    ) : product.stock_quantity < 5 ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stock_quantity}
                      onBlur={(e) => {
                        if (e.target.value !== product.stock_quantity.toString()) {
                          handleStockUpdate(product.id, e.target.value);
                        }
                      }}
                      className="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
