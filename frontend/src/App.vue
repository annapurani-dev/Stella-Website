<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import LoginModal from './components/LoginModal.vue'
import CartDrawer from './components/CartDrawer.vue'
import ToastNotification from './components/ToastNotification.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const { isAuthenticated, user, showLoginModal } = storeToRefs(authStore)
const { totalItems } = storeToRefs(cartStore)

const showCart = ref(false)
const isMobileMenuOpen = ref(false)

const handleAccountClick = () => {
  if (isAuthenticated.value) {
    router.push('/account')
  } else {
    authStore.toggleLoginModal(true)
  }
}

const goToCheckout = () => {
  showCart.value = false
  router.push('/checkout')
}

// Dynamic categories in header loaded reactively from Admin Control
const navLinks = ref([
  { name: 'Home', path: '/' },
  { name: 'Smartphones', path: '/products?category=Smartphones' },
  { name: 'Accessories', path: '/products?category=Accessories' },
  { name: 'About Us', path: '/#about-us' }
])

const fetchNavLinks = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`)
    if (response.ok) {
      const data = await response.json()
      if (data && Array.isArray(data) && data.length > 0) {
        // Build nav links from categories dynamically
        const newLinks = [{ name: 'Home', path: '/' }];
        data.forEach(cat => {
            newLinks.push({ name: cat.name, path: `/products?category=${encodeURIComponent(cat.name)}` });
        });
        newLinks.push({ name: 'About Us', path: '/#about-us' });
        navLinks.value = newLinks;
      }
    }
  } catch (err) {
    console.error('Error fetching dynamic categories:', err)
  }
}

const getNavLinkPath = (name) => {
  if (!name) return '/';
  const norm = name.trim().toLowerCase();
  if (norm === 'home') return '/';
  if (norm === 'our story' || norm === 'about' || norm === 'about us') return '/#about-us';
  return `/products?category=${encodeURIComponent(name.trim())}`;
};

const handleNavClick = (e, path) => {
  // If link is a hash on the home page, scroll manually
  // (router won't re-navigate when already on '/')
  if (path && path.startsWith('/#')) {
    e.preventDefault();
    const id = path.slice(2); // strip '/#'
    if (route.path === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push(path);
    }
  }
};

onMounted(() => {
  fetchNavLinks()
})

const footerSections = computed(() => {
  return [
    { 
      title: 'Support', 
      links: [
        { name: 'Order Tracking', path: '/account?tab=tracking' },
        { name: 'My Account', path: '/account' }
      ] 
    },
    { 
      title: 'Company', 
      links: [
        { name: 'About Us', path: '/#about-us' }
      ] 
    }
  ];
});
</script>

<template>
  <div class="stella-bg"></div>
  <header v-if="!route.meta.hideNav" class="glass-dark fixed top-0 left-0 right-0 z-[60] border-b border-white/5 px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <!-- Logo -->
      <RouterLink to="/" class="group flex flex-col items-center justify-center">
        <!-- Logo Image with background removal (screen mode for dark bg, invert for white bg) -->
        <img src="/logo2.jpeg" alt="Stella" class="h-12 md:h-14 object-contain mix-blend-screen hover:scale-105 transition-transform duration-500" style="filter: brightness(1.2) contrast(1.1);" />
        <span class="text-stella-gold font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] leading-none mt-1">Mobiles</span>
      </RouterLink>
      
      <!-- Nav Links -->
      <nav class="hidden md:flex items-center space-x-10">
        <RouterLink v-for="link in navLinks" :key="link.name" :to="getNavLinkPath(link.name)"
          @click="(e) => handleNavClick(e, link.path)"
          class="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group">
          {{ link.name }}
          <span class="absolute -bottom-1 left-0 w-0 h-[2px] bg-stella-red transition-all duration-300 group-hover:w-full"></span>
        </RouterLink>
      </nav>
      
      <!-- Icons & Mobile Menu Toggle -->
      <div class="flex items-center space-x-4 md:space-x-6">
        <button @click="handleAccountClick" class="flex items-center space-x-2 group">
          <div class="w-9 h-9 rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <span v-if="isAuthenticated" class="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white hidden lg:block">{{ user.name.split(' ')[0] }}</span>
        </button>
        <button @click="showCart = true" class="relative group">
          <div class="w-9 h-9 rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <span v-if="totalItems > 0" class="absolute -top-1 -right-1 bg-stella-red text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-stella-black animate-pulse">{{ totalItems }}</span>
        </button>
        <!-- Mobile Hamburger Menu Button -->
        <button @click="isMobileMenuOpen = true" class="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-stella-gray border border-white/5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  <Transition name="fade">
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[60] bg-stella-black/80 backdrop-blur-md md:hidden" @click="isMobileMenuOpen = false"></div>
  </Transition>

  <Transition name="slide-right">
    <div v-if="isMobileMenuOpen" class="fixed inset-y-0 right-0 z-[70] w-[80%] max-w-sm bg-[#0d0d10] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] md:hidden flex flex-col">
      <div class="flex justify-between items-center p-6 border-b border-white/5">
        <div class="flex flex-col items-start">
          <img src="/logo2.jpeg" alt="Stella" class="h-10 object-contain mix-blend-screen" style="filter: brightness(1.2) contrast(1.1);" />
          <span class="text-stella-gold font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-1">Mobiles</span>
        </div>
        <button @click="isMobileMenuOpen = false" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-8 space-y-3 custom-scrollbar">
        <RouterLink v-for="link in navLinks" :key="link.name" :to="getNavLinkPath(link.name)"
          @click="(e) => { handleNavClick(e, link.path); isMobileMenuOpen = false; }"
          class="flex items-center space-x-4 text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.02] hover:border-stella-red/50 px-5 py-4 rounded-xl transition-all group">
          <span class="w-1.5 h-1.5 rounded-full bg-stella-red group-hover:shadow-[0_0_10px_rgba(229,9,20,0.8)] transition-shadow"></span>
          <span>{{ link.name }}</span>
        </RouterLink>
      </div>
    </div>
  </Transition>

  <main class="pt-20">
    <RouterView />
  </main>
  
  <LoginModal v-if="showLoginModal" @close="authStore.toggleLoginModal(false)" />
  <CartDrawer v-if="showCart" @close="showCart = false" @checkout="goToCheckout" />
  
  <footer v-if="!route.meta.hideNav" class="bg-stella-black border-t border-white/5 py-10 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div class="col-span-1 md:col-span-1">
          <div class="flex flex-col items-start mb-3">
            <img src="/logo2.jpeg" alt="Stella" class="h-10 object-contain mix-blend-screen" style="filter: brightness(1.2) contrast(1.1);" />
            <span class="text-stella-gold font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-2">Mobiles</span>
          </div>
          <p class="text-gray-500 text-xs leading-relaxed mb-4 font-medium max-w-sm">
            Redefining the premium mobile shopping experience across India. Innovation, trust, and zero-compromise service.
          </p>
          <div class="flex space-x-3">
            <a v-for="i in 3" :key="i" href="#" class="w-8 h-8 rounded-full bg-stella-charcoal flex items-center justify-center border border-white/5 hover:border-stella-red transition-all hover:-translate-y-1">
              <span class="text-white text-[10px] font-bold">In</span>
            </a>
          </div>
        </div>
        
        <div v-for="section in footerSections" :key="section.title">
          <h4 class="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-3">{{ section.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.name">
              <RouterLink :to="link.path" class="text-gray-500 hover:text-white text-xs transition-colors font-medium">{{ link.name }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
        <p class="text-gray-600 text-[10px] font-medium uppercase tracking-widest">&copy; 2026 Stella Mobiles. Master Control Systems.</p>
      </div>
    </div>
  </footer>

  <ToastNotification />
</template>

<style>
/* Override default vue wrapper padding */
#app {
  max-width: 100% !important;
  padding: 0 !important;
  display: block !important;
}

/* Mobile Drawer Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
