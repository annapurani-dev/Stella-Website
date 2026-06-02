<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const { isAuthenticated, user } = storeToRefs(authStore);

const productId = route.params.id;
const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const activeImage = ref(0);

// Reviews state
const reviews = ref([
  { id: 1, name: 'Michael T.', title: 'Exceeded all expectations!', content: 'I was hesitant about upgrading, but the display is the brightest I\'ve ever seen, and the battery lasts two full days.', stars: 5 },
  { id: 2, name: 'Priya K.', title: 'Premium experience, premium product', content: 'Picked up in-store and the team was incredibly helpful with setup. The device quality is unreal for the price.', stars: 5 },
  { id: 3, name: 'Arjun S.', title: 'Best purchase this year', content: 'Smooth, fast, and the camera is phenomenal. Stella\'s store experience makes it even better — will definitely return.', stars: 5 },
  { id: 4, name: 'Deepa R.', title: 'Worth every rupee', content: 'Bought for my husband as a gift. He absolutely loves it. The packaging and presentation from Stella was top class.', stars: 5 },
  { id: 5, name: 'Karthik B.', title: 'Stellar performance', content: 'Gaming, photography, everyday use — handles everything flawlessly. No lag, no heat issues. Very impressed.', stars: 5 },
]);

const showMore = computed(() => reviews.value.length > 3);
const loopingReviews = computed(() => showMore.value ? [...reviews.value, ...reviews.value] : reviews.value);

// Add review form
const newReview = ref({ title: '', content: '', stars: 5 });
const reviewSubmitting = ref(false);
const reviewSubmitted = ref(false);

const submitReview = () => {
  if (!newReview.value.title.trim() || !newReview.value.content.trim()) return;
  reviewSubmitting.value = true;
  setTimeout(() => {
    reviews.value.unshift({
      id: Date.now(),
      name: user.value?.name || 'Anonymous',
      title: newReview.value.title,
      content: newReview.value.content,
      stars: newReview.value.stars,
    });
    newReview.value = { title: '', content: '', stars: 5 };
    reviewSubmitting.value = false;
    reviewSubmitted.value = true;
    setTimeout(() => reviewSubmitted.value = false, 3000);
  }, 600);
};

// Auto-scroll for reviews column
let animFrameId = null;
let reviewScrollPos = 0;
let reviewHovered = false;
const reviewScrollEl = ref(null);

const animateReviewScroll = () => {
  if (!reviewScrollEl.value) return;
  const el = reviewScrollEl.value;
  if (!reviewHovered) {
    reviewScrollPos += 0.6;
    if (reviewScrollPos >= el.scrollHeight / 2) reviewScrollPos = 0;
    el.scrollTop = reviewScrollPos;
  } else {
    reviewScrollPos = el.scrollTop;
  }
  animFrameId = requestAnimationFrame(animateReviewScroll);
};

const fetchProduct = async () => {
  try {
    loading.value = true;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error('Product not found');
    const data = await response.json();
    product.value = {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description,
      images: data.image_url ? [data.image_url, ...(data.additional_images || [])] : [
        'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=800&q=80'
      ],
      specs: Object.entries(data.specs || {}).map(([label, value]) => ({ label, value }))
    };
  } catch (err) {
    console.error('Error fetching product:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const addToCart = () => {
  if (!isAuthenticated.value) {
    authStore.toggleLoginModal(true);
    return;
  }
  if (product.value) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addToCart({ ...product.value, img: product.value.images[0] });
    }
    toastStore.addToast(`${product.value.name} added to cart!`, 'success');
  }
};

const buyNow = () => {
  if (!isAuthenticated.value) {
    authStore.toggleLoginModal(true);
    return;
  }
  addToCart();
  router.push('/checkout');
};

const toggleWishlist = () => {
  if (!isAuthenticated.value) {
    authStore.toggleLoginModal(true);
    return;
  }
  if (product.value) {
    const wasInWishlist = wishlistStore.isInWishlist(product.value.id);
    wishlistStore.toggleWishlist({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      img: product.value.images[0]
    });
    if (wasInWishlist) {
      toastStore.addToast(`Removed ${product.value.name} from Wishlist`, 'error');
    } else {
      toastStore.addToast(`Added ${product.value.name} to Wishlist!`, 'success');
    }
  }
};

const increaseQty = () => { if (quantity.value < 10) quantity.value++; };
const decreaseQty = () => { if (quantity.value > 1) quantity.value--; };

onMounted(async () => {
  await fetchProduct();
  if (showMore.value) {
    animFrameId = requestAnimationFrame(animateReviewScroll);
  }
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
});
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="w-12 h-12 border-4 border-stella-red border-t-transparent rounded-full animate-spin"></div>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <h2 class="text-3xl font-black uppercase tracking-tighter text-white mb-4">Product Not Found</h2>
    <RouterLink to="/products" class="stella-button bg-stella-red text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Back to Catalog</RouterLink>
  </div>

  <!-- Product Page -->
  <div v-else-if="product" class="max-w-7xl mx-auto px-6 py-12 space-y-20">

    <!-- Breadcrumbs -->
    <nav class="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
      <RouterLink to="/" class="hover:text-white transition-colors">Home</RouterLink>
      <span>/</span>
      <RouterLink to="/products" class="hover:text-white transition-colors">Catalog</RouterLink>
      <span>/</span>
      <span class="text-white">{{ product.name }}</span>
    </nav>

    <!-- ── TOP SECTION: Image + Info ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">

      <!-- Image Gallery -->
      <div>
        <div class="bg-[#0e0e11] rounded-2xl border border-white/[0.05] h-[460px] flex items-center justify-center mb-4 relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(230,57,70,0.04)_0%,transparent_70%)]"></div>
          
          <!-- Wishlist Toggle -->
          <button @click.stop="toggleWishlist" 
                  class="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-stella-black/75 border border-white/10 flex items-center justify-center backdrop-blur-md hover:border-stella-red/50 hover:bg-stella-black transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   class="h-5.5 w-5.5 transition-all"
                   :class="wishlistStore.isInWishlist(product.id) ? 'fill-stella-red text-stella-red scale-110' : 'text-gray-400'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
          </button>

          <img :src="product.images[activeImage]" :alt="product.name"
               class="max-h-[85%] max-w-[80%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-500 relative z-10" />
        </div>
        <div v-if="product.images.length > 1" class="flex gap-3">
          <div v-for="(img, idx) in product.images" :key="idx"
               @click="activeImage = idx"
               class="flex-1 bg-[#0e0e11] border rounded-xl h-20 flex items-center justify-center cursor-pointer transition-all p-2"
               :class="activeImage === idx ? 'border-stella-red shadow-lg shadow-stella-red/20' : 'border-white/[0.05] hover:border-white/20'">
            <img :src="img" :alt="`thumb-${idx}`" class="max-h-full object-contain" />
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex flex-col justify-center space-y-6">
        <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-tight">{{ product.name }}</h1>

        <p class="text-3xl font-black text-white">
          ₹{{ Number(product.price).toLocaleString('en-IN') }}
        </p>

        <p class="text-gray-400 font-light leading-relaxed text-sm border-b border-white/[0.05] pb-6">
          {{ product.description }}
        </p>

        <!-- Compact Actions -->
        <div class="space-y-3">
          <!-- Quantity + Add to Cart + Buy Now in one row -->
          <div class="flex items-center gap-3">
            <!-- Quantity -->
            <div class="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden shrink-0">
              <button @click="decreaseQty"
                      class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-base">−</button>
              <span class="w-8 text-center text-white font-black text-sm">{{ quantity }}</span>
              <button @click="increaseQty"
                      class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-base">+</button>
            </div>

            <!-- Add to Cart -->
            <button @click="addToCart" :disabled="product.stock_quantity <= 0"
                    class="flex-1 text-white py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                    :class="product.stock_quantity <= 0 ? 'bg-white/10 cursor-not-allowed opacity-50' : 'bg-stella-red hover:bg-red-700 shadow-lg shadow-stella-red/20 active:scale-[0.98]'">
              {{ product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>

            <!-- Buy Now -->
            <button @click="buyNow" :disabled="product.stock_quantity <= 0"
                    class="flex-1 bg-white/[0.04] border border-white/[0.08] text-white py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                    :class="product.stock_quantity <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:text-black active:scale-[0.98]'">
              {{ product.stock_quantity <= 0 ? 'Unavailable' : 'Buy Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── BOTTOM SECTION: Specs + Reviews ── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/[0.04] pt-16">

      <!-- Specifications -->
      <div>
        <h2 class="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
          <span class="w-1.5 h-6 bg-stella-red rounded-full"></span>
          Specifications
        </h2>
        <div class="rounded-2xl border border-white/[0.05] overflow-hidden">
          <div v-for="(spec, idx) in product.specs" :key="idx"
               class="flex border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
            <div class="w-2/5 px-5 py-3.5 bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center">
              {{ spec.label }}
            </div>
            <div class="w-3/5 px-5 py-3.5 text-white text-sm font-semibold flex items-center">
              {{ spec.value }}
            </div>
          </div>
          <div v-if="!product.specs || product.specs.length === 0"
               class="px-5 py-8 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
            No specifications available
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div>
        <h2 class="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
          <span class="w-1.5 h-6 bg-stella-red rounded-full"></span>
          Reviews
        </h2>

        <!-- Scrolling reviews (if > 3) -->
        <div v-if="showMore"
             ref="reviewScrollEl"
             @mouseenter="reviewHovered = true"
             @mouseleave="reviewHovered = false"
             class="h-[340px] overflow-hidden relative">
          <!-- Top/bottom fades -->
          <div class="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-stella-black to-transparent z-10 pointer-events-none"></div>
          <div class="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-stella-black to-transparent z-10 pointer-events-none"></div>

          <div class="flex flex-col gap-3">
            <div v-for="(review, idx) in loopingReviews" :key="'rv-' + idx"
                 class="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 space-y-2 transition-all duration-300 relative
                        hover:border-stella-red/30 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-stella-red/10 hover:z-20">
              <div class="flex gap-0.5">
                <svg v-for="s in review.stars" :key="s" class="w-3 h-3 fill-stella-gold text-stella-gold" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-white font-bold text-xs uppercase tracking-wider">{{ review.title }}</p>
              <p class="text-gray-400 text-xs font-light leading-relaxed">{{ review.content }}</p>
              <p class="text-gray-600 text-[9px] font-black uppercase tracking-widest">— {{ review.name }}</p>
            </div>
          </div>
        </div>

        <!-- Static reviews (≤ 3) -->
        <div v-else class="flex flex-col gap-3">
          <div v-for="review in reviews" :key="review.id"
               class="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 space-y-2 transition-all duration-300 relative
                      hover:border-stella-red/30 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-stella-red/10 hover:z-20">
            <div class="flex gap-0.5">
              <svg v-for="s in review.stars" :key="s" class="w-3 h-3 fill-stella-gold text-stella-gold" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-white font-bold text-xs uppercase tracking-wider">{{ review.title }}</p>
            <p class="text-gray-400 text-xs font-light leading-relaxed">{{ review.content }}</p>
            <p class="text-gray-600 text-[9px] font-black uppercase tracking-widest">— {{ review.name }}</p>
          </div>
        </div>

        <!-- Add Review Form (logged-in users only) -->
        <div class="mt-6">
          <div v-if="isAuthenticated" class="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-black uppercase tracking-[0.3em] text-white">Write a Review</h3>

            <!-- Star picker -->
            <div class="flex gap-1">
              <button v-for="s in 5" :key="s"
                      @click="newReview.stars = s"
                      class="transition-transform hover:scale-110">
                <svg class="w-5 h-5" :class="s <= newReview.stars ? 'fill-stella-gold text-stella-gold' : 'fill-white/10 text-white/10'" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            </div>

            <input v-model="newReview.title"
                   placeholder="Review title"
                   class="w-full bg-black/30 border border-white/[0.06] text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-stella-red outline-none placeholder-gray-600" />

            <textarea v-model="newReview.content"
                      placeholder="Share your experience..."
                      rows="3"
                      class="w-full bg-black/30 border border-white/[0.06] text-white rounded-xl px-4 py-2.5 text-xs font-light leading-relaxed focus:border-stella-red outline-none placeholder-gray-600 resize-none"></textarea>

            <div class="flex items-center gap-3">
              <button @click="submitReview"
                      :disabled="reviewSubmitting || !newReview.title.trim() || !newReview.content.trim()"
                      class="bg-stella-red text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px]
                             hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                {{ reviewSubmitting ? 'Submitting...' : 'Post Review' }}
              </button>
              <span v-if="reviewSubmitted" class="text-stella-gold text-[9px] font-black uppercase tracking-widest">
                ✓ Review posted!
              </span>
            </div>
          </div>

          <!-- Not logged in prompt -->
          <div v-else class="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 text-center">
            <p class="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Sign in to leave a review</p>
            <button @click="authStore.toggleLoginModal(true)"
                    class="inline-block bg-white/[0.05] border border-white/10 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Sign In
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.fill-stella-gold {
  fill: #c9a84c;
}
</style>
