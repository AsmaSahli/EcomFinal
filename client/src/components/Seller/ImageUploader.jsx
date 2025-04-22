import React from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ImageUploader = ({ 
  images, 
  onUpload, 
  onRemove, 
  loading 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Product Images*</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <div className="flex text-sm text-gray-600 justify-center">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
              <span>Upload images</span>
              <input
                type="file"
                multiple
                onChange={onUpload}
                className="sr-only"
                accept="image/*"
                disabled={loading}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
        </div>
      </div>
      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
              <img 
                src={typeof image === 'string' ? image : image.url} 
                alt={`Preview ${index}`} 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                disabled={loading}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;