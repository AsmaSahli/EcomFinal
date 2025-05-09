import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    addItem: (state, action) => {
      const newItem = action.payload;
      const exists = state.items.some(item => 
        item.productId._id === newItem.productId._id && 
        (item.sellerId?._id || null) === (newItem.sellerId?._id || null)
      );
      if (!exists) {
        state.items.push(newItem);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setWishlist, 
  addItem, 
  removeItem, 
  clearWishlist,
  setLoading,
  setError
} = wishlistSlice.actions;

export default wishlistSlice.reducer;