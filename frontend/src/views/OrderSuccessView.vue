<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-24 text-center">
    <!-- Success Icon -->
    <div class="mb-10 inline-flex items-center justify-center w-24 h-24 bg-stella-red/10 rounded-full border border-stella-red/20 shadow-2xl shadow-stella-red/20 animate-bounce-subtle">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-stella-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
    </div>

    <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Order Confirmed!</h1>
    <p class="text-gray-400 text-lg mb-12 max-w-md mx-auto">Your order <span class="text-white font-bold tracking-widest">#STELLA-98241</span> has been placed successfully.</p>
    
    <div class="bg-stella-charcoal border border-gray-800 rounded-2xl p-10 mb-14 text-left shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      </div>

      <h3 class="text-white font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center">
        <span class="w-1.5 h-4 bg-stella-red mr-3"></span> Next Steps
      </h3>
      
      <ul class="space-y-8">
        <li class="flex items-start">
          <div class="w-6 h-6 rounded-full bg-stella-black border border-gray-700 flex items-center justify-center text-[10px] text-stella-red font-bold mr-4 shrink-0">1</div>
          <p class="text-gray-400 text-sm leading-relaxed">We've sent a confirmation email and SMS with your order details to <span class="text-white">+91 98765 43210</span>.</p>
        </li>
        <li class="flex items-start">
          <div class="w-6 h-6 rounded-full bg-stella-black border border-gray-700 flex items-center justify-center text-[10px] text-stella-red font-bold mr-4 shrink-0">2</div>
          <p class="text-gray-400 text-sm leading-relaxed">Our team is currently verifying your payment and preparing your items for dispatch/pickup.</p>
        </li>
        <li class="flex items-start">
          <div class="w-6 h-6 rounded-full bg-stella-black border border-gray-700 flex items-center justify-center text-[10px] text-stella-red font-bold mr-4 shrink-0">3</div>
          <p class="text-gray-400 text-sm leading-relaxed">You will receive a tracking link via SMS once your order leaves our hub.</p>
        </li>
      </ul>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <RouterLink to="/products" class="bg-stella-red text-white px-10 py-4.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 text-xs">
        Continue Shopping
      </RouterLink>
      <RouterLink to="/account" class="border border-white text-white px-10 py-4.5 rounded font-bold uppercase tracking-widest hover:bg-white hover:text-stella-black transition-all text-xs">
        View Order Status
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite ease-in-out;
}

@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
