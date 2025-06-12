import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    addItem: (state, action) => {
      const newItem = {
        ...action.payload,
        price: action.payload.price || 0,
        stock: action.payload.stock || 0,
        quantity: action.payload.quantity || 1,
      };
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.productId._id === newItem.productId._id &&
          (item.sellerId?._id === newItem.sellerId?._id ||
            (!item.sellerId && !newItem.sellerId))
      );
      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item._id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  updateItemQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;
