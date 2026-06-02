<script setup>
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['close', 'checkout']);

const cartStore = useCartStore();
const { items: cartItems, totalPrice: subtotal } = storeToRefs(cartStore);

const increaseQty = (item) => { 
  cartStore.updateQuantity(item.id, item.quantity + 1); 
};
const decreaseQty = (item) => { 
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1); 
  } else {
    cartStore.removeFromCart(item.id);
  }
};

const removeItem = (id) => {
  cartStore.removeFromCart(id);
};
</script>

<template>
  <div class="fixed inset-0 z-[60] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" @click="$emit('close')"></div>

    <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
      <!-- Drawer Panel -->
      <div class="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 translate-x-0 bg-stella-charcoal border-l border-gray-800 shadow-2xl flex flex-col h-full animate-slide-in-right">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-6 border-b border-gray-800 bg-[#0a0a0a]">
          <h2 class="text-xl font-black uppercase tracking-wider text-white flex items-center" id="slide-over-title">
            <span class="w-1.5 h-6 bg-stella-red mr-3"></span> Your Cart
          </h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors bg-stella-black w-8 h-8 rounded-full flex items-center justify-center border border-gray-800 shadow-inner">
            <span class="sr-only">Close panel</span>
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p class="text-gray-400 text-lg font-light">Your cart is empty.</p>
            <button @click="$emit('close')" class="mt-6 text-stella-red font-bold uppercase tracking-widest text-xs hover:underline hover:text-white transition-colors border border-stella-red px-6 py-2 rounded">Start Shopping</button>
          </div>

          <ul v-else class="space-y-6">
            <li v-for="item in cartItems" :key="item.id" class="flex pb-6 border-b border-gray-800 last:border-b-0 last:pb-0 group">
              <!-- Item Image -->
              <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 bg-[#080808] p-2 flex items-center justify-center group-hover:border-gray-500 transition-colors">
                <img :src="item.img" :alt="item.name" class="h-full w-full object-contain mix-blend-lighten">
              </div>

              <!-- Item Details -->
              <div class="ml-4 flex flex-1 flex-col justify-between">
                <div>
                  <div class="flex justify-between text-base font-bold text-white mb-1">
                    <h3 class="text-sm tracking-wide">{{ item.name }}</h3>
                    <p class="ml-4">RS {{ (item.price * item.quantity).toFixed(2) }}</p>
                  </div>
                  <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">In Stock</p>
                </div>
                <div class="flex flex-1 items-end justify-between">
                  <!-- Quantity Controls -->
                  <div class="flex items-center border border-gray-700 rounded bg-stella-black h-8 shadow-inner">
                    <button @click="decreaseQty(item)" class="px-3 text-gray-400 hover:text-white transition-colors">-</button>
                    <span class="px-2 text-sm font-bold text-white w-6 text-center">{{ item.quantity }}</span>
                    <button @click="increaseQty(item)" class="px-3 text-gray-400 hover:text-white transition-colors">+</button>
                  </div>

                  <!-- Remove Button -->
                  <button @click="removeItem(item.id)" type="button" class="font-medium text-gray-500 hover:text-stella-red text-xs uppercase tracking-widest transition-colors">Remove</button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Footer (Subtotal & Checkout) -->
        <div v-if="cartItems.length > 0" class="border-t border-gray-800 px-6 py-8 bg-[#0a0a0a]">
          <div class="flex justify-between text-base font-black text-white mb-4 items-end">
            <p class="uppercase tracking-wider text-sm">Subtotal</p>
            <p class="text-2xl">RS {{ subtotal.toFixed(2) }}</p>
          </div>
          <p class="text-xs text-gray-500 mb-6 font-light">Shipping and taxes calculated at checkout.</p>
          <div class="mt-6">
            <button @click="$emit('checkout')" class="w-full bg-stella-red border border-transparent rounded shadow-lg shadow-stella-red/20 py-4 px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-colors">
              Proceed to Checkout
            </button>
          </div>
          <div class="mt-6 flex justify-center text-center text-xs text-gray-500">
            <p>
              or
              <button @click="$emit('close')" type="button" class="font-bold text-white hover:text-stella-red ml-1 transition-colors uppercase tracking-widest">
                Continue Shopping
              </button>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
