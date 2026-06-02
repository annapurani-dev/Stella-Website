import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('stella_wishlist')) || [],
  }),
  getters: {
    isInWishlist: (state) => (productId) => state.items.some(item => item.id === productId),
    totalItems: (state) => state.items.length,
  },
  actions: {
    toggleWishlist(product) {
      const index = this.items.findIndex(item => item.id === product.id);
      if (index > -1) {
        this.items.splice(index, 1);
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img || product.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80'
        });
      }
      localStorage.setItem('stella_wishlist', JSON.stringify(this.items));
    },
    removeFromWishlist(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      localStorage.setItem('stella_wishlist', JSON.stringify(this.items));
    }
  }
});
