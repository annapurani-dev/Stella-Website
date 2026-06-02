<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const products = ref([]);
const loading = ref(true);
const error = ref(null);

const categoryName = computed(() => route.query.category || '');

const allFiltersConfig = ref({});
const activeFiltersConfig = computed(() => {
  if (!categoryName.value) return [];
  return allFiltersConfig.value[categoryName.value] || [];
});

const selectedFilters = ref({});
const searchInput = ref('');
const sortBy = ref('Newest First');

// Collapsible group state
const openGroups = ref({});
const toggleGroup = (groupKey) => {
  openGroups.value[groupKey] = !isGroupOpen(groupKey);
};
const isGroupOpen = (groupKey) => {
  return openGroups.value[groupKey] !== false; // True by default
};

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return Object.values(selectedFilters.value).some(arr => arr && arr.length > 0);
});

const toggleFilter = (groupKey, option) => {
  if (!selectedFilters.value[groupKey]) {
    selectedFilters.value[groupKey] = [];
  }
  const idx = selectedFilters.value[groupKey].indexOf(option);
  if (idx > -1) {
    selectedFilters.value[groupKey].splice(idx, 1);
  } else {
    selectedFilters.value[groupKey].push(option);
  }
};

const isFilterActive = (groupKey, option) => {
  return selectedFilters.value[groupKey] && selectedFilters.value[groupKey].includes(option);
};

const clearFilters = () => {
  selectedFilters.value = {};
};

const goToDetail = (id) => {
  router.push(`/product/${id}`);
};

// Case-insensitive, whitespace-agnostic matching against specs JSONB, name, and description
const matchProductOption = (product, groupKey, option) => {
  const normOption = option.toLowerCase().replace(/\s+/g, '');
  
  // 1. Match inside specs JSONB
  if (product.specs && typeof product.specs === 'object') {
    for (const key of Object.keys(product.specs)) {
      if (key.toLowerCase() === groupKey.toLowerCase()) {
        const val = String(product.specs[key]).toLowerCase().replace(/\s+/g, '');
        if (val.includes(normOption)) return true;
      }
    }
  }
  
  // 2. Match in product name
  const normName = product.name.toLowerCase().replace(/\s+/g, '');
  if (normName.includes(normOption)) return true;
  
  // 3. Match in product description
  if (product.description) {
    const normDesc = product.description.toLowerCase().replace(/\s+/g, '');
    if (normDesc.includes(normOption)) return true;
  }
  
  return false;
};

const fetchProducts = async () => {
  try {
    loading.value = true;
    const url = categoryName.value 
      ? `${import.meta.env.VITE_API_BASE_URL}/products?category=${encodeURIComponent(categoryName.value)}`
      : `${import.meta.env.VITE_API_BASE_URL}/products`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    
    // Map backend data to frontend structure and retain specs + description
    products.value = data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      specs: item.specs,
      originalPrice: item.deal_label ? parseFloat(item.price) * 1.2 : null,
      rating: 4.8 + Math.random() * 0.2, // Premium products rating
      reviews: Math.floor(60 + Math.random() * 140),
      img: item.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
      isNew: (new Date() - new Date(item.created_at)) < 14 * 24 * 60 * 60 * 1000 // 14 days
    }));
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchFiltersConfig = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/category_filters`);
    if (response.ok) {
      allFiltersConfig.value = await response.json();
    }
  } catch (err) {
    console.error('Error fetching filters config:', err);
  }
};

const filteredProducts = computed(() => {
  let list = [...products.value];
  
  // 1. Search filter
  if (searchInput.value.trim()) {
    const query = searchInput.value.toLowerCase().trim();
    list = list.filter(p => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)));
  }
  
  // 2. Left dynamic filters filter
  const activeFilterGroups = Object.keys(selectedFilters.value).filter(gKey => selectedFilters.value[gKey] && selectedFilters.value[gKey].length > 0);
  
  if (activeFilterGroups.length > 0) {
    list = list.filter(p => {
      // Must satisfy ALL active filter groups (AND match across groups)
      return activeFilterGroups.every(gKey => {
        const options = selectedFilters.value[gKey];
        // Must satisfy AT LEAST one option in this group (OR match inside group)
        return options.some(opt => matchProductOption(p, gKey, opt));
      });
    });
  }
  
  // 3. Sorting
  if (sortBy.value === 'Price: Low-High') {
    list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy.value === 'Price: High-Low') {
    list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else {
    // Newest First (default, or sorted by id)
    list.sort((a, b) => b.id - a.id);
  }
  
  return list;
});

const addToCart = (product) => {
  if (!authStore.isAuthenticated) {
    authStore.toggleLoginModal(true);
    return;
  }
  cartStore.addToCart({
    ...product,
    images: [product.img]
  });
  toastStore.addToast(`${product.name} added to cart!`, 'success');
};

const toggleWishlist = (product) => {
  if (!authStore.isAuthenticated) {
    authStore.toggleLoginModal(true);
    return;
  }
  const wasInWishlist = wishlistStore.isInWishlist(product.id);
  wishlistStore.toggleWishlist(product);
  if (wasInWishlist) {
    toastStore.addToast(`Removed ${product.name} from Wishlist`, 'error');
  } else {
    toastStore.addToast(`Added ${product.name} to Wishlist!`, 'success');
  }
};

const isMobileFiltersOpen = ref(false);

const categoryBgImages = {
  'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1920&q=80',
  'tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1920&q=80',
  'wearables': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1920&q=80',
  'audio': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1920&q=80',
  'accessories': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1920&q=80',
  'gadgets': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=80'
};

const activeHeaderBgImage = computed(() => {
  const cat = (categoryName.value || '').trim();
  if (allFiltersConfig.value && allFiltersConfig.value["_category_images"] && allFiltersConfig.value["_category_images"][cat]) {
    return allFiltersConfig.value["_category_images"][cat];
  }
  const normCat = cat.toLowerCase();
  return categoryBgImages[normCat] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80';
});

watch(categoryName, () => {
  clearFilters();
  fetchProducts();
});

onMounted(() => {
  fetchProducts();
  fetchFiltersConfig();
});
</script>

<template>
  <div class="min-h-screen pb-32 bg-transparent text-white relative">
    
    <!-- Hero Header (Ultra-Premium Leica/Apple Minimal Style) -->
    <header class="relative h-[42vh] flex items-end pb-12 px-8 overflow-hidden border-b border-white/[0.03]">
      <!-- Beautiful background image with custom luxury matte overlay -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-fixed bg-cover bg-center opacity-45 transition-all duration-1000 ease-in-out" :style="`background-image: url('${activeHeaderBgImage}');`"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/55 to-[#0e0708]/75"></div>
      </div>
      <!-- Translucent floating watermarks -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span class="text-[12vw] font-extralight uppercase tracking-[0.25em] text-white/[0.012] whitespace-nowrap leading-none transition-all select-none">
          {{ categoryName || 'STELLA' }}
        </span>
      </div>

      <div class="max-w-7xl mx-auto w-full relative z-10">
        <h1 class="text-5xl md:text-7xl font-bold uppercase tracking-tight text-white font-display mb-2">
          {{ categoryName || 'The' }} <span class="font-extralight text-white/50">Collection.</span>
        </h1>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-8 mt-16 relative z-10">
      <div class="flex flex-col gap-6">
        
        <!-- Catalog Search & Sort Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 animate-fade-up" style="animation-delay: 0.1s">
            <!-- Search bar -->
            <div class="relative w-full sm:w-96">
                <input type="text" 
                       v-model="searchInput" 
                       placeholder="Search collection..." 
                       class="bg-stella-charcoal/30 border border-white/[0.08] text-white rounded-2xl py-4 px-6 focus:border-stella-red/50 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.1)] outline-none text-xs font-bold uppercase tracking-wider w-full transition-all" />
            </div>
            
            <div class="flex items-center space-x-4 w-full sm:w-auto">
                <span class="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] whitespace-nowrap">Sort by:</span>
                <select v-model="sortBy" 
                        class="bg-stella-charcoal/30 border border-white/[0.08] text-white rounded-2xl py-4 px-6 focus:border-white/20 focus:bg-stella-black/80 outline-none text-[10px] font-black uppercase tracking-[0.15em] cursor-pointer w-full sm:w-auto transition-all appearance-none pr-10 relative">
                    <option value="Newest First">Newest First</option>
                    <option value="Price: Low-High">Price: Low-High</option>
                    <option value="Price: High-Low">Price: High-Low</option>
                </select>
                <!-- Custom chevron for select since appearance is none -->
                <div class="absolute right-[4.5rem] pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>

        <!-- Filter Toggle Button & Overlay Drawer -->
        
        <!-- Toggle Button (Below Search) -->
        <div class="pt-2 pb-6 animate-fade-up" style="animation-delay: 0.15s">
            <button @click.stop="isMobileFiltersOpen = true" 
                    class="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 bg-stella-charcoal/30 border border-white/[0.08] hover:border-stella-red/50 text-white hover:text-stella-red hover:bg-stella-black/80 px-8 py-3.5 rounded-2xl transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span class="text-[10px] font-black uppercase tracking-[0.2em]">Filter Collection</span>
                <div v-if="hasActiveFilters" class="ml-2 w-2 h-2 rounded-full bg-stella-red animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.8)]"></div>
            </button>
        </div>

        <!-- Filter Drawer Overlay -->
        <Transition name="fade">
            <div v-if="isMobileFiltersOpen" class="fixed inset-0 z-[80] bg-stella-black/80 backdrop-blur-sm" @click.stop="isMobileFiltersOpen = false"></div>
        </Transition>

        <!-- Right Filter Drawer (Applies to all screen sizes) -->
        <aside class="fixed inset-y-0 right-0 z-[90] w-[85%] sm:w-[400px] bg-[#050507]/85 backdrop-blur-3xl border-l border-white/10 p-6 sm:p-8 overflow-y-auto shadow-[-30px_0_60px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
               :class="isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'">
               
            <!-- Drawer Header -->
            <div class="flex justify-between items-center mb-8 pb-5 border-b border-white/5">
                <div class="flex items-center gap-3 flex-1 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-stella-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    <span class="text-[13px] font-black uppercase tracking-[0.2em] text-white truncate">Filters</span>
                </div>
                <button @click.stop="isMobileFiltersOpen = false" class="shrink-0 ml-4 px-4 h-10 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-stella-red hover:border-stella-red transition-all shadow-lg">
                    <span class="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Parameters Title & Reset -->
            <div class="flex justify-between items-center mb-6">
                <span class="text-xs font-black uppercase tracking-[0.2em] text-white">Parameters</span>
                <button v-if="hasActiveFilters" 
                        @click="clearFilters" 
                        class="text-[10px] font-black uppercase tracking-widest text-stella-red hover:text-white transition-colors">
                    Reset
                </button>
            </div>

            <!-- Dynamic Filter Groups -->
            <div class="space-y-6">
                <div v-for="group in activeFiltersConfig" :key="group.name" class="border-b border-white/[0.03] pb-6 last:border-b-0 last:pb-0">
                    <button @click="toggleGroup(group.key)" 
                            class="w-full flex items-center justify-between text-left py-2 group/btn">
                        <h4 class="text-[12px] font-bold text-white uppercase tracking-[0.2em] flex items-center">
                            <span class="w-2.5 h-[2px] bg-stella-red mr-3 opacity-60 group-hover/btn:opacity-100 transition-opacity"
                                  :class="isGroupOpen(group.key) ? 'opacity-100 w-4' : ''"></span>
                            {{ group.name }}
                        </h4>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             class="h-5 w-5 text-gray-500 group-hover/btn:text-white transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
                             :class="isGroupOpen(group.key) ? 'rotate-180 text-white' : ''"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    <div v-show="isGroupOpen(group.key)" class="space-y-4 mt-5 pl-4">
                        <label v-for="option in group.options" :key="option" 
                               class="flex items-center space-x-4 cursor-pointer group/item text-[13px] text-gray-400 hover:text-white transition-colors">
                            <input type="checkbox" :checked="isFilterActive(group.key, option)" @change="toggleFilter(group.key, option)" class="hidden" />
                            <div class="w-5 h-5 rounded-full border border-white/10 bg-black/40 flex items-center justify-center transition-all duration-300 relative group-hover/item:border-white/30 shrink-0"
                                 :class="isFilterActive(group.key, option) ? 'border-stella-red bg-stella-red scale-110 shadow-[0_0_15px_rgba(230,57,70,0.4)]' : ''">
                                <span v-if="isFilterActive(group.key, option)" class="w-2 h-2 rounded-full bg-white animate-scale"></span>
                            </div>
                            <span class="font-bold uppercase tracking-wider text-[11px] transition-colors"
                                  :class="isFilterActive(group.key, option) ? 'text-white' : 'text-gray-400 group-hover/item:text-gray-200'">{{ option }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div v-if="activeFiltersConfig.length === 0" class="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl text-center mt-4">
                Select a dynamic category in the header menu to load specifications parameters filters.
            </div>
        </aside>

        <!-- Floating Active Dismissible Pill Badges -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pb-8 border-b border-white/[0.03] animate-fade-up" style="animation-delay: 0.3s">
            <span class="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">Active:</span>
            <template v-for="(options, key) in selectedFilters" :key="key">
                <div v-for="opt in options" :key="opt"
                     class="bg-stella-red/10 border border-stella-red/30 text-stella-red pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2 transition-all text-[9px] font-black uppercase tracking-[0.1em] shadow-[0_0_10px_rgba(230,57,70,0.1)]">
                    <span>{{ opt }}</span>
                    <button @click="toggleFilter(key, opt)" class="w-5 h-5 rounded-full flex items-center justify-center hover:bg-stella-red hover:text-white transition-colors">
                        <span class="text-[10px] leading-none">×</span>
                    </button>
                </div>
            </template>
            <button @click="clearFilters" class="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white ml-4 transition-colors underline decoration-white/20 hover:decoration-white underline-offset-4">
                Clear All
            </button>
        </div>
        <div v-else class="border-b border-white/[0.03] pb-8"></div>

        <!-- Right Catalog Products Area (Now Full Width) -->
        <div class="w-full space-y-6">
            <!-- Products Grid — Minimal Cards -->
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">

                <!-- Loading Skeletons -->
                <div v-if="loading" v-for="i in 6" :key="i"
                     class="h-[260px] sm:h-[380px] bg-white/[0.02] rounded-2xl border border-white/[0.03] animate-pulse"></div>

                <!-- Product Cards -->
                <article v-else v-for="product in filteredProducts" :key="product.id"
                     @click="goToDetail(product.id)"
                     class="group flex flex-col bg-[#0c0c0f] border border-white/[0.05] rounded-2xl overflow-hidden cursor-pointer
                            hover:border-white/15 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]
                            transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">

                  <!-- Image -->
                  <div class="relative bg-[#111114] overflow-hidden h-[160px] sm:h-[260px]">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(230,57,70,0.05)_0%,transparent_70%)]
                                opacity-0 group-hover:opacity-100 transition-opacity duration-600 z-0"></div>
                    
                    <!-- Action Buttons Container (Top Right) -->
                    <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col items-center gap-2">
                        <!-- Wishlist Toggle -->
                        <button @click.stop="toggleWishlist(product)" title="Toggle Wishlist"
                                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stella-black/75 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-stella-red/50 hover:bg-stella-black transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 class="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 transition-all"
                                 :class="wishlistStore.isInWishlist(product.id) ? 'fill-stella-red text-stella-red scale-110' : 'text-gray-400'"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                        
                        <!-- Add to Cart -->
                        <button @click.stop="addToCart(product)" title="Add to Cart"
                                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stella-black/75 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-stella-red/50 hover:bg-stella-black transition-all text-white hover:text-stella-red">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                    </div>

                    <img :src="product.img" :alt="product.name"
                         class="absolute inset-0 m-auto object-contain z-10
                                transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]
                                group-hover:scale-[1.06]
                                drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                         style="max-height: 220px; max-width: 80%;" />
                  </div>

                  <!-- Info -->
                  <div class="px-3 py-3 sm:px-5 sm:py-4 flex flex-col justify-center border-t border-white/[0.04] bg-[#0c0c0f]">
                    <h3 class="text-[10px] sm:text-[13px] font-bold uppercase tracking-tight text-white group-hover:text-stella-red transition-colors duration-300 truncate font-display">
                      {{ product.name }}
                    </h3>
                    <p class="text-[11px] sm:text-[13px] font-black text-gray-400 mt-0.5">
                      ₹{{ Number(product.price).toLocaleString('en-IN') }}
                    </p>
                  </div>
                </article>

                <!-- Empty State -->
                <div v-if="!loading && filteredProducts.length === 0"
                     class="col-span-full py-24 flex flex-col items-center justify-center
                            border border-dashed border-white/[0.05] rounded-2xl">
                  <h3 class="text-white font-black uppercase tracking-[0.3em] text-xs mb-2">No Products Found</h3>
                  <p class="text-gray-600 text-[9px] font-bold uppercase tracking-wider mb-5 text-center leading-relaxed">
                    Adjust your filters to reveal the collection.
                  </p>
                  <button @click="clearFilters"
                          class="border border-white/10 text-white hover:bg-white hover:text-black
                                 px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300">
                    Reset Filters
                  </button>
                </div>
            </div>

            <!-- Footer Pagination (Luxury Circle Indicator) -->
            <div v-if="filteredProducts.length > 0" class="flex justify-center items-center mt-16 animate-fade-up">
              <div class="px-5 py-3 rounded-full flex items-center space-x-3">
                  <div class="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors duration-300"></div>
                  <!-- Flat Pill active state -->
                  <div class="w-6 h-2 rounded-full bg-stella-red shadow-lg shadow-stella-red/20 transition-all duration-300"></div>
                  <div class="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors duration-300"></div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: var(--font-display);
}

/* Animations */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale {
  animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
