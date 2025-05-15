import React from 'react';
import { FaTag, FaFireAlt, FaPercentage } from 'react-icons/fa';
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
  const statusClass = stock > 0 
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
    : 'bg-rose-50 text-rose-800 border-rose-200';
  const displayTags = isEditing ? editedProduct.tags : sellerInfo?.tags?.map((tag) => tag.name || tag) || [];

  // Promotion details
  const activePromotion = sellerInfo?.promotions?.find(promo => 
    promo.isActive && promo.promotionId?._id.toString() === sellerInfo?.activePromotion?._id.toString()
  );
  const hasActivePromotion = !!activePromotion;
  const oldPrice = hasActivePromotion ? activePromotion.oldPrice?.toFixed(2) : null;
  const newPrice = hasActivePromotion ? activePromotion.newPrice?.toFixed(2) : null;
  const discountRate = hasActivePromotion ? activePromotion.promotionId?.discountRate : 0;
  const promotionName = hasActivePromotion ? activePromotion.promotionId?.name : '';
  const promotionEndDate = hasActivePromotion ? new Date( activePromotion.promotionId.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  return (
    <div className="space-y-6">
      {/* Product Information section remains the same */}
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
              {/* Enhanced Promotion Banner */}
              {hasActivePromotion && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <FaFireAlt className="text-orange-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-orange-800">{promotionName}</h4>
                          <p className="text-sm text-orange-600">Promotion ends {promotionEndDate}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center">
                          <FaPercentage className="mr-1" /> {discountRate}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Price</p>
                  <div className="space-y-2">
                    {hasActivePromotion ? (
                      <>
                        <div className="flex items-baseline space-x-3">
                          <p className="font-bold text-3xl text-indigo-600">${newPrice}</p>
                          <p className="font-medium text-lg text-gray-400 line-through">${oldPrice}</p>

                        </div>
                        <p className="text-sm text-gray-500">
                          You save <span className="font-medium text-red-600">${(oldPrice - newPrice).toFixed(2)}</span>
                        </p>
                      </>
                    ) : (
                      <p className="font-bold text-3xl text-indigo-600">${price}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock & Availability</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div 
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${stock > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                        >
                          <span className="font-bold text-xl">{stock}</span>
                          {stock > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusClass}`}>
                          {status}
                        </p>
                        {stock > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Available for immediate shipment</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Warranty</p>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg border ${warranty ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                      {warranty ? (
                        <>
                          <p className="font-medium">{warranty}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">No warranty</p>
                      )}
                    </div>
                  </div>
                </div>
                

              </div>
            </div>
          </div>

          {/* Product Tags section remains the same */}
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