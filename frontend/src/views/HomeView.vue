<script setup>
import { ref, onMounted, computed } from 'vue';

const deals = ref([]);
const loading = ref(true);
const error = ref(null);
const homepageConfig = ref(null);
const currentSlide = ref(0);
const showFranchiseModal = ref(false);
const timeLeft = ref({ hours: 0, minutes: 0, seconds: 0 });

const updateTimer = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const diff = endOfDay - now;
    timeLeft.value = {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };
};

const fetchConfigs = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/homepage`);
        if (response.ok) {
            const data = await response.json();
            console.log('Homepage Config Loaded:', data);
            homepageConfig.value = data;
            
            // Auto cycle slides
            if (data.hero?.slides?.length > 1) {
                setInterval(() => {
                    currentSlide.value = (currentSlide.value + 1) % data.hero.slides.length;
                }, 6000);
            }
        } else {
            console.error('Failed to load homepage config:', response.status);
        }
    } catch (err) {
        console.error('Error fetching site config:', err);
    }
};

const defaultHubs = [
  { tag: 'Flagship Hub', name: 'Stella Anna Nagar', address: 'Shanthi Colony Main Rd, Anna Nagar, Chennai - 400040', phone: '+91 44 2626 XXXX', hours: '10 AM - 9 PM' },
  { tag: 'Express Hub', name: 'Stella T-Nagar', address: 'Pondy Bazaar Main Rd, T-Nagar, Chennai - 400017', phone: '+91 44 2828 XXXX', hours: '10 AM - 9 PM' },
  { tag: 'Premium Hub', name: 'Stella Adyar', address: 'MG Road, Shastri Nagar, Adyar, Chennai - 400020', phone: '+91 44 2424 XXXX', hours: '10 AM - 9 PM' },
  { tag: 'Tech Hub', name: 'Stella Velachery', address: 'Bypass Road, Velachery, Chennai - 400042', phone: '+91 44 2929 XXXX', hours: '10 AM - 9 PM' }
];

const categories = [
  { name: 'Smartphones', icon: '📱' },
  { name: 'Tablets', icon: '💻' },
  { name: 'Wearables', icon: '⌚' },
  { name: 'Audio', icon: '🎧' },
  { name: 'Accessories', icon: '🔌' },
  { name: 'Gadgets', icon: '🎮' },
];

const col1Reviews = computed(() => {
  return homepageConfig.value?.testimonials?.col1 || [
    { id: 1, name: 'Rahul S.', text: 'Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.', stars: 5 },
    { id: 2, name: 'Priya K.', text: 'Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!', stars: 5 },
    { id: 3, name: 'Vikram M.', text: 'Authentic products and 0% UPI fee makes a huge difference when buying flagships.', stars: 5 },
  ];
});

const col2Reviews = computed(() => {
  return homepageConfig.value?.testimonials?.col2 || [
    { id: 4, name: 'Anjali R.', text: 'Super fast checkout! The custom UPI payments are fully transparent and fee-free.', stars: 5 },
    { id: 5, name: 'Karthik B.', text: 'Elite premium customer support. Setup my new smartphone right in their luxury lounge.', stars: 5 },
    { id: 6, name: 'Deepa T.', text: 'Outstanding store design. The bento layout and dark mode look premium online & offline.', stars: 5 },
  ];
});

const col3Reviews = computed(() => {
  return homepageConfig.value?.testimonials?.col3 || [
    { id: 7, name: 'Sanjay V.', text: 'Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.', stars: 5 },
    { id: 8, name: 'Meera N.', text: 'Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.', stars: 5 },
    { id: 9, name: 'Arun K.', text: 'Stella franchise protocol is highly systematic. Excited to grow our partnership.', stars: 5 },
  ];
});

const fetchDeals = async () => {
    const dummyDeals = [
        {
            id: 'dummy-1',
            name: 'Stella Neo 15 Pro',
            price: '129900',
            oldPrice: 149900,
            tag: 'Save 15%',
            subtitle: 'Exclusive Stella Engineering Protocol',
            img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'dummy-2',
            name: 'Stella Pad Horizon',
            price: '79900',
            oldPrice: 94900,
            tag: 'Trending',
            subtitle: 'Premium Aluminum/Titanium Craftsmanship',
            img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'dummy-3',
            name: 'Stella Pods ANC',
            price: '12900',
            oldPrice: 17900,
            tag: 'Hot Deal',
            subtitle: '1-Year Stella Luxury Care Warranty',
            img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'dummy-4',
            name: 'Stella Watch Elite',
            price: '34900',
            oldPrice: 42900,
            tag: 'Limited Edition',
            subtitle: 'Experience next-generation performance',
            img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80'
        }
    ];

    try {
        // Fetch all products from API to map them dynamically
        const productsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const allProducts = await productsResponse.json();

        // Build deals from site config items if available
        if (homepageConfig.value?.deals?.items && homepageConfig.value.deals.items.length > 0) {
            const configuredDeals = [];
            homepageConfig.value.deals.items.forEach(item => {
                const prod = allProducts.find(p => p.id === parseInt(item.productId));
                if (prod) {
                    configuredDeals.push({
                        id: prod.id,
                        name: prod.name,
                        price: item.dealPrice && item.dealPrice > 0 ? item.dealPrice : prod.price,
                        oldPrice: parseFloat(prod.price),
                        tag: item.customLabel || prod.deal_label || 'Special Offer',
                        subtitle: item.subtitle || prod.description || 'Exclusive Stella Engineering Protocol',
                        img: prod.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80'
                    });
                }
            });
            
            if (configuredDeals.length > 0) {
                deals.value = configuredDeals;
                return;
            }
        }
        
        // Fallback to general products where is_deal_of_day = true
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/deals`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                deals.value = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    oldPrice: parseFloat(item.price) * 1.2,
                    tag: item.deal_label || 'Special Offer',
                    subtitle: item.description || 'Exclusive Stella Engineering Protocol',
                    img: item.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80'
                }));
                return;
            }
        }
        
        deals.value = dummyDeals;
    } catch (err) {
        console.error('Error fetching deals, falling back to premium dummy data:', err);
        deals.value = dummyDeals;
    }
};

import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { onUnmounted } from 'vue';

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const addToCart = (product) => {
    if (!authStore.isAuthenticated) {
        authStore.toggleLoginModal(true);
        return;
    }
    cartStore.addToCart(product);
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

const scrollContainer = ref(null);
let animationFrameId = null;
let isHovered = false;
let scrollPos = 0;

const animateScroll = () => {
    if (!scrollContainer.value) return;
    const el = scrollContainer.value;
    
    if (!isHovered) {
        scrollPos += 0.75; // Buttery-smooth sub-pixel incremental drift
        if (scrollPos >= el.scrollWidth / 2) {
            scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
    } else {
        // Keep scroll position state in sync with manual scrolling/touches
        scrollPos = el.scrollLeft;
    }
    animationFrameId = requestAnimationFrame(animateScroll);
};

const startAutoScroll = () => {
    stopAutoScroll();
    if (scrollContainer.value) {
        scrollPos = scrollContainer.value.scrollLeft;
    }
    animationFrameId = requestAnimationFrame(animateScroll);
};

const stopAutoScroll = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
};

const activeDealIndex = ref(0);
const enableTransition = ref(true);
let dealTimerId = null;

const loopingDeals = computed(() => {
    if (deals.value.length === 0) return [];
    // Append the first item to the end to act as the seamless wrap clone
    return [...deals.value, deals.value[0]];
});

const startDealTimer = () => {
    stopDealTimer();
    dealTimerId = setInterval(() => {
        if (deals.value.length > 0) {
            enableTransition.value = true;
            activeDealIndex.value++;
        }
    }, 6000); // Smooth slow scroll transition every 6 seconds
};

const stopDealTimer = () => {
    if (dealTimerId) {
        clearInterval(dealTimerId);
        dealTimerId = null;
    }
};

const pauseDealTimer = () => {
    stopDealTimer();
};

const selectDeal = (index) => {
    enableTransition.value = true;
    activeDealIndex.value = index;
    startDealTimer(); // Reset timer to allow reading
};

const handleTransitionEnd = () => {
    if (activeDealIndex.value >= deals.value.length) {
        // seamless reset back to 0 without transition
        enableTransition.value = false;
        activeDealIndex.value = 0;
        setTimeout(() => {
            enableTransition.value = true;
        }, 30);
    }
};

onMounted(async () => {
    loading.value = true;
    updateTimer();
    setInterval(updateTimer, 1000);
    await Promise.all([fetchDeals(), fetchConfigs()]);
    loading.value = false;
    startAutoScroll();
    startDealTimer();
});

onUnmounted(() => {
    stopAutoScroll();
    stopDealTimer();
});
</script>

<template>
  <div class="space-y-32 pb-32">
    <!-- Parallax Hero Banner -->
    <section v-if="homepageConfig?.hero?.slides?.length > 0" class="relative h-[92vh] flex items-center justify-center overflow-hidden">
      <div v-for="(slide, idx) in homepageConfig.hero.slides" :key="idx" 
           class="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
           :class="idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'">
        <!-- Background Image with parallax and fallback color -->
        <div 
          class="absolute inset-0 bg-fixed bg-cover bg-center scale-105 bg-stella-charcoal"
          :style="slide.image ? `background-image: url('${slide.image}');` : ''"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/40 to-stella-black/20 z-20"></div>
        
        <div class="relative z-30 text-center max-w-5xl px-6 mx-auto pt-20">
          <div class="inline-flex items-center space-x-3 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full mb-10 animate-fade-up">
            <span class="w-2 h-2 rounded-full bg-stella-red animate-pulse"></span>
            <span class="text-white font-black text-[10px] uppercase tracking-[0.3em]">{{ slide.subtitle || 'New Arrival' }}</span>
          </div>
          
          <h1 class="text-7xl md:text-[10rem] font-black uppercase tracking-tighter mb-10 leading-[0.85] animate-fade-up" style="animation-delay: 0.1s">
            {{ slide.title.split(' ')[0] }} <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20 drop-shadow-2xl">{{ slide.title.split(' ').slice(1).join(' ') }}</span>
          </h1>
          
          <p class="text-lg md:text-xl text-gray-400 mb-14 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-up" style="animation-delay: 0.2s">
            {{ slide.subtitle }}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center animate-fade-up" style="animation-delay: 0.3s">
            <button @click="$router.push('/products')" class="stella-button group bg-stella-red text-white px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-stella-red/40 hover:bg-red-700">
              <span class="relative z-10">{{ homepageConfig.hero.buttonText || 'Discover Elite' }}</span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
            <button class="stella-button bg-white/5 backdrop-blur-xl border border-white/10 text-white px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10">
              Technical Specs
            </button>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div class="w-[1px] h-16 bg-gradient-to-b from-stella-red to-transparent"></div>
      </div>
    </section>

    <!-- Default Hero if no config -->
    <section v-else class="relative h-[92vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0"></div>
      <div class="relative z-20 text-center max-w-4xl px-6">
        <h1 class="text-9xl font-black uppercase tracking-tighter text-white animate-fade-up">Stella <br/><span class="text-stella-red">Future</span></h1>
        <button @click="$router.push('/products')" class="mt-12 bg-stella-red text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest animate-fade-up">Enter Galaxy</button>
      </div>
    </section>



    <!-- Deals Section -->
    <section v-if="homepageConfig?.deals?.show !== false" class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div class="flex flex-col md:flex-row md:items-end gap-10">
            <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">Deals of <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-stella-gold to-stella-gold">the Day</span></h2>
            
            <!-- Mechanical Timer UI (Gold Accent) -->
            <div class="flex items-center space-x-4 mb-1">
                <div v-for="(val, unit) in timeLeft" :key="unit" class="flex flex-col items-center">
                    <div class="bg-white/5 border border-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-2 shadow-inner group">
                        <span class="text-2xl font-black text-white tracking-tighter group-hover:text-stella-gold transition-colors">{{ String(val).padStart(2, '0') }}</span>
                    </div>
                    <span class="text-[8px] text-stella-gold font-black uppercase tracking-[0.3em]">{{ unit }}</span>
                </div>
            </div>
        </div>
        <RouterLink to="/products" class="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] hover:text-white transition-all flex items-center mb-1">
            View All Assets
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </RouterLink>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div v-for="i in 3" :key="i" class="h-[500px] bg-stella-charcoal rounded-[2.5rem] animate-pulse"></div>
      </div>

      <div v-else class="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-stella-black/40 backdrop-blur-xl h-[70vh] md:h-[48vh] lg:h-[52vh] flex flex-col justify-between">
         <!-- Sliding Track -->
         <div 
           class="flex h-[calc(100%-60px)]"
           :class="enableTransition ? 'transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]' : ''"
           :style="`transform: translateX(-${activeDealIndex * 100}%);`"
           @transitionend="handleTransitionEnd"
         >
           <div 
             v-for="(deal, index) in loopingDeals" 
             :key="deal.id + '-' + index"
             class="w-full h-full flex-shrink-0 flex flex-col md:flex-row items-center justify-between p-6 md:p-10 lg:p-12 relative overflow-hidden"
           >
              <!-- Wishlist Toggle for Deal -->
              <button @click.stop="toggleWishlist(deal)" 
                      class="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-stella-black/75 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-stella-red/50 hover:bg-stella-black transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       class="h-5 w-5 transition-all"
                       :class="wishlistStore.isInWishlist(deal.id) ? 'fill-stella-red text-stella-red scale-110' : 'text-gray-400'"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
              </button>

              <!-- Radial background glow effect unique to each card -->
              <div 
                class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none"
                :class="index % 2 === 0 ? 'bg-stella-red' : 'bg-stella-gold'"
              ></div>

              <!-- Product Info Left Block -->
              <div class="w-full md:w-1/2 flex flex-col justify-center space-y-4 md:space-y-5 z-10 text-left">
                <div class="inline-flex items-center">
                  <span class="bg-stella-red text-white text-[8px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full shadow-lg shadow-stella-red/20">{{ deal.tag }}</span>
                </div>
                
                <h3 class="text-3xl md:text-4xl lg:text-[2.75rem] font-black uppercase tracking-tighter text-white leading-none">
                  {{ deal.name.split(' ').slice(0, 2).join(' ') }} <br/>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold via-white to-white">{{ deal.name.split(' ').slice(2).join(' ') }}</span>
                </h3>

                <!-- Short high-fidelity description list -->
                <p v-if="deal.subtitle" class="text-xs text-gray-400 font-medium leading-relaxed max-w-sm">
                  {{ deal.subtitle }}
                </p>
                <ul v-else class="space-y-1 text-[11px] text-gray-400 font-medium">
                  <li class="flex items-center space-x-2">
                    <span class="text-stella-gold text-xs">✓</span>
                    <span>Exclusive Stella Engineering Protocol</span>
                  </li>
                  <li class="flex items-center space-x-2">
                    <span class="text-stella-gold text-xs">✓</span>
                    <span>Premium Aluminum/Titanium Craftsmanship</span>
                  </li>
                  <li class="flex items-center space-x-2">
                    <span class="text-stella-gold text-xs">✓</span>
                    <span>1-Year Stella Luxury Care Warranty</span>
                  </li>
                </ul>

                <div class="flex items-baseline space-x-3">
                  <span class="text-2xl md:text-3xl font-black text-white">RS {{ deal.price }}</span>
                  <span class="text-xs text-gray-500 line-through font-bold">RS {{ deal.oldPrice.toFixed(0) }}</span>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-1">
                  <button @click.stop="addToCart(deal)" :disabled="deal.stock_quantity <= 0" 
                          class="stella-button text-white px-7 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center space-x-2"
                          :class="deal.stock_quantity <= 0 ? 'bg-white/10 cursor-not-allowed opacity-50' : 'bg-stella-red hover:bg-red-700 shadow-xl shadow-stella-red/20'">
                    <svg v-if="deal.stock_quantity > 0" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <span>{{ deal.stock_quantity <= 0 ? 'Out of Stock' : 'Purchase Asset' }}</span>
                  </button>
                  <button @click="$router.push(`/product/${deal.id}`)" class="stella-button bg-white/5 border border-white/10 text-white px-7 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all">
                    Technical Specs
                  </button>
                </div>
              </div>

              <!-- Product Image Right Block with floating anim -->
              <div class="w-full md:w-1/2 h-40 md:h-full flex items-center justify-center relative mt-4 md:mt-0">
                <div class="absolute inset-0 bg-gradient-radial from-white/[0.03] to-transparent pointer-events-none scale-125"></div>
                <img 
                  :src="deal.img" 
                  :alt="deal.name" 
                  class="w-auto h-40 md:h-56 lg:h-[280px] object-contain mix-blend-lighten animate-float relative z-10 transition-transform duration-700 hover:scale-105"
                />
              </div>
           </div>
         </div>

         <!-- Navigation Movement Circles (Flat Pill for active, small dots for inactive) -->
         <div class="w-full h-[60px] flex justify-center items-center py-4 bg-stella-black/25 border-t border-white/5 z-20">
           <div class="flex space-x-3 items-center">
             <button 
               v-for="(deal, index) in deals" 
               :key="'dot-'+deal.id" 
               @click="selectDeal(index)"
               @mouseenter="pauseDealTimer"
               @mouseleave="startDealTimer"
               class="rounded-full transition-all duration-500 cursor-pointer"
               :class="(activeDealIndex % deals.length) === index ? 'w-7 h-2 bg-stella-gold shadow-lg shadow-stella-gold/40' : 'w-2 h-2 bg-white/20 hover:bg-white/40'"
               :aria-label="'Go to slide ' + (index + 1)"
             ></button>
           </div>
         </div>
      </div>
    </section>

    
    <!-- ─── FRANCHISE SECTION ─── -->
    <section class="relative min-h-[52vh] py-16 flex flex-col justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
            <div class="absolute inset-0 bg-fixed bg-cover bg-center bg-stella-charcoal"
                 :style="`background-image: url('${homepageConfig?.franchise?.bannerImg || 'https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80'}');`"
            ></div>
            <div class="absolute inset-0 bg-stella-black/88 backdrop-blur-[2px] z-10"></div>
        </div>

        <div class="max-w-7xl mx-auto px-6 relative z-20 w-full">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <!-- Left: Text -->
                <div class="space-y-6">
                    <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                        {{ (homepageConfig?.franchise?.title || 'Partner with Stella').split(' ').slice(0, 2).join(' ') }}<br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-white">
                            {{ (homepageConfig?.franchise?.title || 'Partner with Stella').split(' ').slice(2).join(' ') }}
                        </span>
                    </h2>
                    <p class="text-gray-400 text-sm font-light leading-relaxed">
                        {{ homepageConfig?.franchise?.description || "Become a part of India's elite mobile retail chain. Leverage our brand authority, supply chain excellence, and zero franchise fee model." }}
                    </p>

                    <!-- Stats row -->
                    <div class="flex gap-10 pt-2">
                        <div v-for="stat in (homepageConfig?.franchise?.stats || [{label:'Outlets', value:'50+'},{label:'Growth', value:'200%'}])" :key="stat.label">
                            <p class="text-3xl font-black text-white">{{ stat.value }}</p>
                            <p class="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">{{ stat.label }}</p>
                        </div>
                    </div>

                    <!-- CTAs -->
                    <div class="flex flex-wrap gap-3 pt-2">
                        <a href="/stella_franchise_brochure.pdf" download="Stella_Franchise_Brochure.pdf"
                           class="stella-button bg-stella-red text-white px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px]
                                  hover:bg-red-700 flex items-center gap-2 shadow-xl shadow-stella-red/20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Brochure
                        </a>
                        <button @click="showFranchiseModal = true"
                                class="stella-button bg-white/5 border border-white/10 text-white px-7 py-3.5 rounded-xl
                                       font-black uppercase tracking-widest text-[9px] hover:bg-white/10 flex items-center gap-2">
                            View All Details
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Right: key points bento -->
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="(item, i) in [
                        {icon:'🏪', title:'Zero Franchise Fee', desc:'No upfront cost. Pure equity partnership.'},
                        {icon:'📦', title:'Elite Supply Chain', desc:'Direct access to Stella\'s premium inventory.'},
                        {icon:'📊', title:'200% Growth YOY', desc:'Fastest growing mobile retail brand in South India.'},
                        {icon:'🤝', title:'Full Brand Support', desc:'Training, marketing & operations backed by Stella.'}
                    ]" :key="i"
                         class="glass p-5 rounded-2xl border border-white/5 hover:border-stella-gold/20 transition-all duration-300 space-y-2">
                        <span class="text-xl">{{ item.icon }}</span>
                        <h4 class="text-white font-black text-[11px] uppercase tracking-wider">{{ item.title }}</h4>
                        <p class="text-gray-500 text-[10px] font-medium leading-relaxed">{{ item.desc }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Franchise Details Modal -->
    <Teleport to="body">
    <div v-if="showFranchiseModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6"
         @click.self="showFranchiseModal = false">
        <div class="absolute inset-0 bg-stella-black/95 backdrop-blur-2xl"></div>
        <div class="relative z-10 w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[2rem] bg-[#0d0d10] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-[#0d0d10]/95 backdrop-blur-xl border-b border-white/[0.05] px-10 py-6 flex items-center justify-between z-10">
                <div>
                    <h2 class="text-2xl font-black uppercase tracking-tighter text-white">Franchise Details</h2>
                    <p class="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">Stella Partnership Programme</p>
                </div>
                <button @click="showFranchiseModal = false"
                        class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                               text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg font-black">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="px-10 py-8 space-y-10">
                <!-- Title & Description -->
                <div class="space-y-4">
                    <h3 class="text-3xl font-black uppercase tracking-tighter text-white">
                        {{ homepageConfig?.franchise?.title || 'Partner with Stella' }}
                    </h3>
                    <p class="text-gray-400 text-sm font-light leading-relaxed">
                        {{ homepageConfig?.franchise?.description || "Become a part of India's elite mobile retail chain. Leverage our brand authority, supply chain excellence, and zero franchise fee model." }}
                    </p>
                </div>

                <!-- Stats -->
                <div class="flex gap-12 pb-8 border-b border-white/[0.05]">
                    <div v-for="stat in (homepageConfig?.franchise?.stats || [{label:'Outlets',value:'50+'},{label:'Growth YOY',value:'200%'}])" :key="stat.label">
                        <p class="text-4xl font-black text-white">{{ stat.value }}</p>
                        <p class="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">{{ stat.label }}</p>
                    </div>
                </div>

                <!-- Benefits -->
                <div class="space-y-4">
                    <h4 class="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Why Partner With Us</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="(item, i) in [
                            {icon:'🏪', title:'Zero Franchise Fee', desc:'No upfront cost. Pure equity partnership model with revenue sharing.'},
                            {icon:'📦', title:'Elite Supply Chain', desc:'Direct access to Stella premier inventory — latest flagships on day 1.'},
                            {icon:'📊', title:'200% Growth YOY', desc:'Fastest growing mobile retail brand in South India with proven metrics.'},
                            {icon:'🤝', title:'Full Brand Support', desc:'Training, marketing, store design, operations — all backed by Stella central.'},
                            {icon:'💳', title:'0% UPI Processing', desc:'Our proprietary payment gateway means zero transaction fees for partners.'},
                            {icon:'🔒', title:'Exclusive Territory', desc:'Protected geographic zones — no internal competition between partners.'}
                        ]" :key="i"
                             class="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all space-y-2">
                            <span class="text-lg">{{ item.icon }}</span>
                            <h5 class="text-white font-black text-xs uppercase tracking-wider">{{ item.title }}</h5>
                            <p class="text-gray-500 text-[10px] font-medium leading-relaxed">{{ item.desc }}</p>
                        </div>
                    </div>
                </div>

                <!-- Hub Locations -->
                <div class="space-y-4" v-if="(homepageConfig?.franchise?.hubs || defaultHubs).length > 0">
                    <h4 class="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Active Hub Locations</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="(hub, hidx) in (homepageConfig?.franchise?.hubs || defaultHubs)" :key="'modal-hub-'+hidx"
                             class="glass p-5 rounded-2xl border border-white/5 hover:border-stella-red/20 transition-all duration-300 space-y-3">
                            <div>
                                <span class="bg-stella-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{{ hub.tag }}</span>
                                <h5 class="text-white font-black uppercase tracking-wide text-sm mt-2">{{ hub.name }}</h5>
                            </div>
                            <p class="text-gray-400 text-[11px] leading-relaxed">{{ hub.address }}</p>
                            <div class="flex items-center justify-between pt-2 border-t border-white/5">
                                <a :href="'tel:' + hub.phone" class="text-stella-gold font-black text-[8px] uppercase tracking-widest hover:text-white transition-colors">{{ hub.phone }}</a>
                                <span class="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{{ hub.hours }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CTA -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href="/stella_franchise_brochure.pdf" download="Stella_Franchise_Brochure.pdf"
                       class="stella-button bg-stella-red text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px]
                              hover:bg-red-700 flex items-center justify-center gap-2 shadow-xl shadow-stella-red/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Download Full Brochure
                    </a>
                    <button @click="showFranchiseModal = false"
                            class="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
    </Teleport>

    <!-- ─── ABOUT US SECTION ─── -->
    <section id="about-us" class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <!-- Left: Image / visual -->
            <div class="relative rounded-[2rem] overflow-hidden border border-white/[0.05] h-80 md:h-[420px] bg-[#111114]">
                <div class="absolute inset-0 bg-fixed bg-cover bg-center opacity-30 grayscale"
                     :style="homepageConfig?.our_story?.hero_image ? `background-image:url('${homepageConfig.our_story.hero_image}')` : `background-image:url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80')`">
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-stella-black via-transparent to-transparent"></div>
                <!-- Stats bar -->
                <div class="absolute bottom-0 left-0 right-0 p-6 flex gap-8">
                    <div v-for="stat in (homepageConfig?.our_story?.stats || [{value:'15k+',label:'Happy Customers'},{value:'02',label:'Elite Hubs'},{value:'24h',label:'Express Delivery'}])" :key="stat.label">
                        <p class="text-2xl font-black text-white">{{ stat.value }}</p>
                        <p class="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{{ stat.label }}</p>
                    </div>
                </div>
            </div>

            <!-- Right: Text -->
            <div class="space-y-6">
                <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                    {{ (homepageConfig?.our_story?.vision_title || 'The Stella Vision').split(' ').slice(0,2).join(' ') }}<br/>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30">
                        {{ (homepageConfig?.our_story?.vision_title || 'The Stella Vision').split(' ').slice(2).join(' ') }}
                    </span>
                </h2>
                <p class="text-gray-400 text-sm font-light leading-relaxed">
                    {{ homepageConfig?.our_story?.vision_text || "Founded in the heart of Chennai, Stella Mobiles began with a simple belief: that premium technology should be accompanied by a premium experience. We don't just sell phones; we curate the finest mobile technology for those who demand the best." }}
                </p>
                <div class="flex flex-wrap gap-3 pt-2">
                    <a href="#branches" @click.prevent="document.getElementById('branches')?.scrollIntoView({behavior:'smooth'})"
                       class="stella-button bg-stella-red text-white px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700">
                        Visit Our Stores
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- ─── BRANCHES SECTION ─── -->
    <section id="branches" class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-end mb-12">
            <div>
                <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">Our <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30">Branches</span></h2>
            </div>
            <div class="space-y-4">
                <p class="text-gray-400 text-sm font-light leading-relaxed">
                    Stella operates across Chennai's most vibrant districts. Each hub is designed to deliver a premium, hands-on experience — from device selection to instant setup and after-sales support.
                </p>
                <div class="flex gap-10">
                    <div v-for="hub in (homepageConfig?.franchise?.hubs || defaultHubs).slice(0,3)" :key="'br-stat-'+hub.name">
                        <p class="text-xl font-black text-white">{{ hub.tag.split(' ')[0] }}</p>
                        <p class="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{{ hub.name }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scrolling bento hub cards -->
        <div
            ref="scrollContainer"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            class="flex overflow-x-auto gap-4 pb-4 pt-1 scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
        >
            <!-- Set 1 -->
            <div v-for="(hub, hidx) in (homepageConfig?.franchise?.hubs || defaultHubs)" :key="'br-'+hidx"
                 class="glass p-5 rounded-2xl min-w-[260px] md:min-w-[300px] text-left border border-white/5
                        hover:border-stella-red/30 transition-all duration-300 relative group overflow-hidden shrink-0">
                <div class="absolute top-0 right-0 w-16 h-16 bg-stella-red/5 rounded-full blur-xl group-hover:bg-stella-red/10 transition-all duration-500"></div>
                <span class="bg-stella-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">{{ hub.tag }}</span>
                <h3 class="text-base font-black uppercase tracking-wide text-white mt-2 mb-2 leading-tight">{{ hub.name }}</h3>
                <p class="text-gray-400 text-[11px] font-medium leading-relaxed mb-3">{{ hub.address }}</p>
                <div class="flex items-center justify-between pt-3 border-t border-white/5">
                    <a :href="'tel:' + hub.phone" class="text-stella-gold font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors">{{ hub.phone }}</a>
                    <span class="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{{ hub.hours }}</span>
                </div>
            </div>
            <!-- Set 2 (duplicate for seamless loop) -->
            <div v-for="(hub, hidx) in (homepageConfig?.franchise?.hubs || defaultHubs)" :key="'br-dup-'+hidx"
                 class="glass p-5 rounded-2xl min-w-[260px] md:min-w-[300px] text-left border border-white/5
                        hover:border-stella-red/30 transition-all duration-300 relative group overflow-hidden shrink-0">
                <div class="absolute top-0 right-0 w-16 h-16 bg-stella-red/5 rounded-full blur-xl group-hover:bg-stella-red/10 transition-all duration-500"></div>
                <span class="bg-stella-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">{{ hub.tag }}</span>
                <h3 class="text-base font-black uppercase tracking-wide text-white mt-2 mb-2 leading-tight">{{ hub.name }}</h3>
                <p class="text-gray-400 text-[11px] font-medium leading-relaxed mb-3">{{ hub.address }}</p>
                <div class="flex items-center justify-between pt-3 border-t border-white/5">
                    <a :href="'tel:' + hub.phone" class="text-stella-gold font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors">{{ hub.phone }}</a>
                    <span class="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{{ hub.hours }}</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Customer Trust Section -->
    <section class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10">
            <h2 class="text-4xl font-black uppercase tracking-tighter text-white mb-3">Customer's trust <br/><span class="text-stella-gold italic">on Stella Mobiles</span></h2>
            <p class="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">What our galaxy of customers say</p>
        </div>
        
        <!-- 3-Column Vertical Scrolling Bento Grid -->
        <div class="relative h-[380px] overflow-hidden mt-10">
            <!-- Top Fade Overlay -->
            <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none"></div>
            
            <!-- Bottom Fade Overlay -->
            <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none"></div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <!-- Column 1 (Scrolling Up) -->
                <div class="reviews-column overflow-hidden h-full relative p-3">
                    <div class="flex flex-col gap-4 animate-marquee-vertical-up">
                        <div v-for="review in col1Reviews" :key="review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                        <!-- Duplicated for seamless scrolling -->
                        <div v-for="review in col1Reviews" :key="'dup-'+review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Column 2 (Scrolling Down) -->
                <div class="reviews-column overflow-hidden h-full relative p-3">
                    <div class="flex flex-col gap-4 animate-marquee-vertical-down">
                        <div v-for="review in col2Reviews" :key="review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                        <!-- Duplicated for seamless scrolling -->
                        <div v-for="review in col2Reviews" :key="'dup-'+review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Column 3 (Scrolling Up) -->
                <div class="reviews-column overflow-hidden h-full relative p-3">
                    <div class="flex flex-col gap-4 animate-marquee-vertical-up">
                        <div v-for="review in col3Reviews" :key="review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                        <!-- Duplicated for seamless scrolling -->
                        <div v-for="review in col3Reviews" :key="'dup-'+review.id" class="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg"></div>
                            <div class="flex space-x-0.5 text-[9px] text-stella-gold">
                                <span v-for="s in review.stars" :key="s">★</span>
                            </div>
                            <p class="text-gray-300 text-xs italic font-medium leading-relaxed">"{{ review.text }}"</p>
                            <div class="flex items-center space-x-3 pt-3 border-t border-white/5">
                                <div class="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">{{ review.name[0] }}</div>
                                <span class="text-white font-black uppercase tracking-widest text-[9px]">{{ review.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes marquee-vertical-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

@keyframes marquee-vertical-down {
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}

.animate-marquee-vertical-up {
  animation: marquee-vertical-up 24s linear infinite;
}

.animate-marquee-vertical-down {
  animation: marquee-vertical-down 24s linear infinite;
}

/* 1. Bulletproof Pause on Hover */
.reviews-column:hover .animate-marquee-vertical-up,
.reviews-column:hover .animate-marquee-vertical-down {
  animation-play-state: paused !important;
}

/* 2. Premium Card Pop Up and Lift */
.review-card {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.review-card:hover {
  transform: scale(1.06) translateY(-8px) !important;
  border-color: rgba(230, 57, 70, 0.4) !important;
  box-shadow: 0 20px 45px rgba(230, 57, 70, 0.15) !important;
  background-color: rgba(26, 26, 26, 0.95) !important;
  z-index: 50 !important;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
