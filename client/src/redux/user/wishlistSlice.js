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
      const newItem = {
        ...action.payload,
        price: action.payload.price || 0,
        stock: action.payload.stock || 0
      };
      if (!state.items.some(item => item._id === newItem._id)) {
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