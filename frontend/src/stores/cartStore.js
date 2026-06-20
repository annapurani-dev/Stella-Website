import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  get totalItems() {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
  get totalPrice() {
    return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  addToCart: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img || product.image_url,
            quantity: 1,
          },
        ],
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    })),

  clearCart: () => set({ items: [] }),
}));
