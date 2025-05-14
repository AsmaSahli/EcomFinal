import React from 'react';
import { FaTag } from 'react-icons/fa';
import ProductEditForm from './ProductEditForm';

const ProductDetailsTab = ({
  product,
  sellerInfo,
  isEditing,
  editedProduct,
  onSave,
  onCancel,
  onChange,
  loading,
}) => {
  const price = isEditing ? editedProduct.price : sellerInfo?.price?.toFixed(2) || '0.00';
  const stock = isEditing ? editedProduct.stock : sellerInfo?.stock || 0;
  const warranty = isEditing ? editedProduct.warranty : sellerInfo?.warranty || 'N/A';
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const statusClass = stock > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200';
  const displayTags = isEditing ? editedProduct.tags : sellerInfo?.tags?.map((tag) => tag.name || tag) || [];
  
  // Calculate discounted price if there's an active promotion
  const hasActivePromotion = sellerInfo?.hasActivePromotion || false;
  const discountRate = sellerInfo?.activeDiscountRate || 0;
  const discountedPrice = hasActivePromotion
    ? (sellerInfo.price * (1 - discountRate / 100)).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-5">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Product Information</h3>
        </div>
        <div className="space-y-4 pl-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Reference</p>
              <p className="font-mono bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-200">{product.reference || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</p>
              <p className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-200">
                {product.categoryDetails?.category?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
              <p className={`px-3 py-2 rounded-lg text-sm font-medium border ${statusClass}`}>
                {status}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <ProductEditForm
          product={product}
          sellerInfo={sellerInfo}
          editedProduct={editedProduct}
          onSave={onSave}
          onCancel={onCancel}
          onChange={onChange}
          loading={loading}
        />
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-5">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h3>
            </div>
            <div className="space-y-4 pl-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Price</p>
                  <div className="flex items-center space-x-3">
                    {hasActivePromotion ? (
                      <>
                        <p className="font-bold text-xl text-gray-500 line-through">${price}</p>
                        <p className="font-bold text-2xl text-red-600">${discountedPrice}</p>
                      </>
                    ) : (
                      <p className="font-bold text-2xl text-indigo-600">${price}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock</p>
                  <div className="flex items-center space-x-4">
                    <p className="font-medium text-2xl">{stock}</p>
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusClass}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Warranty</p>
                <p className={`px-3 py-2 rounded-lg text-sm font-medium border inline-block ${warranty ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                  {warranty || 'No warranty'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-5">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 mr-3">
                <FaTag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Product Tags</h3>
            </div>
            <div className="pl-14">
              <div className="flex flex-wrap gap-2">
                {displayTags.length > 0 ? (
                  displayTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100 flex items-center"
                    >
                      <FaTag className="mr-2 h-3 w-3 text-indigo-500" />
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No tags added to this product</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetailsTab;