import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/products');
      // Make sure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.warn("Expected an array of products but got:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="p-4 text-lg">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Products Catalog</h2>
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="border rounded-2xl shadow p-4 hover:shadow-lg transition">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="h-40 w-full object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{product.category?.name || 'No category'}</p>
              <p className="text-lg font-medium text-blue-600">${product.price}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(product.tags || []).map(tag => (
                  <span
                    key={tag._id || tag}
                    className="text-xs bg-gray-100 border rounded-full px-2 py-0.5"
                  >
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashProducts;
