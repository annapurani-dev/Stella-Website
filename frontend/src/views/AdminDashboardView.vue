<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const activeTab = ref('overview');
const showProductModal = ref(false);
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const productImages = ref([]);
const specsList = ref([]);
const editingProduct = ref(null);
const loading = ref(false);

const stats = ref([]);
const chartData = ref([]);
const selectedTimeFilter = ref('week');

const setTimeFilter = (filter) => {
    selectedTimeFilter.value = filter;
    fetchStats();
};

const fetchStats = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats?filter=${selectedTimeFilter.value}`);
        if (response.ok) {
            const data = await response.json();
            stats.value = data.stats;
            chartData.value = data.chartData;
        }
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
};

const products = ref([]);
const orders = ref([]);

const selectedCategoryFilter = ref('All');

const uniqueCategories = computed(() => {
    const cats = new Set(products.value.map(p => p.category_name).filter(Boolean));
    return ['All', ...cats];
});

const filteredProductsList = computed(() => {
    if (selectedCategoryFilter.value === 'All') return products.value;
    return products.value.filter(p => p.category_name === selectedCategoryFilter.value);
});

const fetchProducts = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
        if (response.ok) {
            products.value = await response.json();
            updateDealsCategoryIds();
        }
    } catch (err) {
        console.error('Error fetching products:', err);
    }
};

const updateDealsCategoryIds = () => {
    if (!products.value || products.value.length === 0) return;
    if (!homepage.value?.deals?.items) return;
    homepage.value.deals.items.forEach(deal => {
        if (!deal.categoryId && deal.productId) {
            const prod = products.value.find(p => p.id === parseInt(deal.productId));
            if (prod) {
                deal.categoryId = prod.category_id;
            }
        }
    });
};

const orderStatusFilter = ref('All');
const orderTimeFilter = ref('All');
const orderCategoryFilter = ref('All');
const orderPaymentFilter = ref('All');

const filteredOrdersList = computed(() => {
    let result = orders.value;
    if (orderStatusFilter.value !== 'All') {
        result = result.filter(o => o.status === orderStatusFilter.value);
    }
    if (orderCategoryFilter.value !== 'All') {
        result = result.filter(o => o.categories && o.categories.includes(orderCategoryFilter.value));
    }
    if (orderPaymentFilter.value !== 'All') {
        result = result.filter(o => o.payment_method === orderPaymentFilter.value);
    }
    if (orderTimeFilter.value !== 'All') {
        const now = new Date();
        result = result.filter(o => {
            const orderDate = new Date(o.created_at);
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
            if (orderTimeFilter.value === 'Day') return diffDays <= 1;
            if (orderTimeFilter.value === 'Week') return diffDays <= 7;
            if (orderTimeFilter.value === 'Month') return diffDays <= 30;
            if (orderTimeFilter.value === 'Year') return diffDays <= 365;
            return true;
        });
    }
    return result;
});

const fetchOrders = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`);
        if (response.ok) {
            orders.value = await response.json();
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
};

const productForm = ref({ 
    name: '', 
    category_id: 1, 
    price: 0, 
    stock_quantity: 0, 
    description: '', 
    image_url: '', 
    additional_images: [], 
    specs: {},
    is_deal_of_day: false,
    deal_label: ''
});

const homepage = ref({
  hero: { 
    slides: [
      { id: 1, title: 'Unleash the Future', subtitle: 'The Next Generation is here.', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1920&q=80' }
    ],
    buttonText: 'Pre-Order Now'
  },
  deals: {
    show: true,
    items: [
      { productId: 1, customLabel: 'Flat 10% Off' },
      { productId: 2, customLabel: 'Limited Stock' }
    ]
  },
  franchise: {
    title: 'Partner with Stella',
    description: 'Join the fastest growing mobile retail franchise in India. Zero franchise fees, elite brand authority, and high-fidelity logistics support.',
    bannerImg: 'https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80',
    stats: [
      { label: 'Outlets', value: '50+' },
      { label: 'Growth', value: '200%' }
    ],
    hubs: [
      { tag: 'Flagship Hub', name: 'Stella Anna Nagar', address: 'Shanthi Colony Main Rd, Anna Nagar, Chennai - 400040', phone: '+91 44 2626 XXXX', hours: '10 AM - 9 PM' },
      { tag: 'Express Hub', name: 'Stella T-Nagar', address: 'Pondy Bazaar Main Rd, T-Nagar, Chennai - 400017', phone: '+91 44 2828 XXXX', hours: '10 AM - 9 PM' },
      { tag: 'Premium Hub', name: 'Stella Adyar', address: 'MG Road, Shastri Nagar, Adyar, Chennai - 400020', phone: '+91 44 2424 XXXX', hours: '10 AM - 9 PM' },
      { tag: 'Tech Hub', name: 'Stella Velachery', address: 'Bypass Road, Velachery, Chennai - 400042', phone: '+91 44 2929 XXXX', hours: '10 AM - 9 PM' }
    ]
  },
  testimonials: {
    col1: [
      { id: 1, name: 'Rahul S.', text: 'Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.', stars: 5 },
      { id: 2, name: 'Priya K.', text: 'Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!', stars: 5 },
      { id: 3, name: 'Vikram M.', text: 'Authentic products and 0% UPI fee makes a huge difference when buying flagships.', stars: 5 }
    ],
    col2: [
      { id: 4, name: 'Anjali R.', text: 'Super fast checkout! The custom UPI payments are fully transparent and fee-free.', stars: 5 },
      { id: 5, name: 'Karthik B.', text: 'Elite premium customer support. Setup my new smartphone right in their luxury lounge.', stars: 5 },
      { id: 6, name: 'Deepa T.', text: 'Outstanding store design. The bento layout and dark mode look premium online & offline.', stars: 5 }
    ],
    col3: [
      { id: 7, name: 'Sanjay V.', text: 'Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.', stars: 5 },
      { id: 8, name: 'Meera N.', text: 'Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.', stars: 5 },
      { id: 9, name: 'Arun K.', text: 'Stella franchise protocol is highly systematic. Excited to grow our partnership.', stars: 5 }
    ]
  },
  navLinks: [
    { name: 'Home', path: '/' },
    { name: 'Smartphones', path: '/products?category=Smartphones' },
    { name: 'Accessories', path: '/products?category=Accessories' },
    { name: 'About Us', path: '/#about-us' }
  ],
  our_story: {
    hero_title: 'Our Story',
    hero_subtitle: 'Redefining Mobile Excellence',
    hero_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80',
    vision_title: 'The Stella Vision',
    vision_text: 'Founded in the heart of Chennai, Stella Mobiles began with a simple belief: that premium technology should be accompanied by a premium experience. We don\'t just sell phones; we curate the finest mobile technology for those who demand the best in performance, aesthetics, and service.',
    stats: [
      { value: '15k+', label: 'Happy Customers' },
      { value: '02', label: 'Elite Hubs' },
      { value: '24h', label: 'Express Delivery' }
    ],
    hubs: [
      { tag: 'Flagship Store', name: 'Stella Anna Nagar', description: 'Located in the vibrant heart of Shanthi Colony, our flagship hub offers the complete Stella experience with a dedicated lounge for device setup and personalized consulting.', address: 'Shanthi Colony Main Rd, Anna Nagar, Chennai - 400040', phone: '+91 44 2626 XXXX', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
      { tag: 'Express Hub', name: 'Stella T-Nagar', description: 'Our T-Nagar hub is optimized for the urban professional. Fast pickups, immediate technical support, and the latest accessory releases are always in stock.', address: 'Pondy Bazaar Main Rd, T-Nagar, Chennai - 400017', phone: '+91 44 2828 XXXX', image: 'https://images.unsplash.com/photo-1554941068-a252680d25d9?auto=format&fit=crop&w=800&q=80' }
    ]
  }
});

const addHeroSlide = () => homepage.value.hero.slides.push({ id: Date.now(), title: '', subtitle: '', image: '' });
const removeHeroSlide = (idx) => homepage.value.hero.slides.splice(idx, 1);

const categoryFilters = ref({});
const dbCategories = ref([]);
const selectedFilterCategory = ref('');

const categoryHeaderImage = computed({
    get() {
        if (!selectedFilterCategory.value) return '';
        if (!categoryFilters.value["_category_images"]) {
            categoryFilters.value["_category_images"] = {};
        }
        return categoryFilters.value["_category_images"][selectedFilterCategory.value] || '';
    },
    set(val) {
        if (!selectedFilterCategory.value) return;
        if (!categoryFilters.value["_category_images"]) {
            categoryFilters.value["_category_images"] = {};
        }
        categoryFilters.value["_category_images"][selectedFilterCategory.value] = val;
    }
});

const fetchCategories = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/categories`);
        if (response.ok) {
            dbCategories.value = await response.json();
            if (dbCategories.value.length > 0) {
                selectedFilterCategory.value = dbCategories.value[0].name;
            }
        }
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
};

const showCategoryModal = ref(false);
const categoryForm = ref({ name: '', description: '' });
const editingCategory = ref(null);

const openAddCategory = () => {
    editingCategory.value = null;
    categoryForm.value = { name: '', description: '' };
    showCategoryModal.value = true;
};

const openEditCategory = (cat) => {
    editingCategory.value = cat;
    categoryForm.value = { name: cat.name, description: cat.description || '' };
    showCategoryModal.value = true;
};

const saveCategory = async () => {
    try {
        loading.value = true;
        const url = editingCategory.value
            ? `${import.meta.env.VITE_API_BASE_URL}/categories/${editingCategory.value.id}`
            : `${import.meta.env.VITE_API_BASE_URL}/categories`;
            
        const response = await fetch(url, {
            method: editingCategory.value ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryForm.value)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to save category');
        }
        
        toastStore.addToast('Category saved successfully', 'success');
        await fetchCategories();
        showCategoryModal.value = false;
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    } finally {
        loading.value = false;
    }
};

const executeDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category? All products in this category will have their category set to null.')) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${catId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete category');
        toastStore.addToast('Category deleted successfully', 'success');
        await fetchCategories();
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    }
};

const fetchConfigs = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/homepage`);
        if (response.ok) {
            const data = await response.json();
            // Safe deep merge to fill database gaps for all custom modules (prevents Vue render crashes)
            homepage.value = {
                hero: data.hero || homepage.value.hero,
                deals: data.deals || homepage.value.deals,
                franchise: {
                    title: data.franchise?.title || homepage.value.franchise.title,
                    description: data.franchise?.description || homepage.value.franchise.description,
                    bannerImg: data.franchise?.bannerImg || homepage.value.franchise.bannerImg,
                    stats: data.franchise?.stats || homepage.value.franchise.stats,
                    hubs: data.franchise?.hubs || homepage.value.franchise.hubs
                },
                testimonials: {
                    col1: data.testimonials?.col1 || homepage.value.testimonials.col1,
                    col2: data.testimonials?.col2 || homepage.value.testimonials.col2,
                    col3: data.testimonials?.col3 || homepage.value.testimonials.col3
                },
                navLinks: data.navLinks || homepage.value.navLinks,
                our_story: {
                    hero_title: data.our_story?.hero_title || homepage.value.our_story.hero_title,
                    hero_subtitle: data.our_story?.hero_subtitle || homepage.value.our_story.hero_subtitle,
                    hero_image: data.our_story?.hero_image || homepage.value.our_story.hero_image,
                    vision_title: data.our_story?.vision_title || homepage.value.our_story.vision_title,
                    vision_text: data.our_story?.vision_text || homepage.value.our_story.vision_text,
                    stats: data.our_story?.stats || homepage.value.our_story.stats,
                    hubs: data.our_story?.hubs || homepage.value.our_story.hubs
                }
            };
            updateDealsCategoryIds();
        }
        
        // Fetch category filters
        const filterResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/category_filters`);
        if (filterResponse.ok) {
            categoryFilters.value = await filterResponse.json();
        } else {
            // Initial fallback preset map
            categoryFilters.value = {
                "Smartphones": [
                    { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Google", "OnePlus"] },
                    { "name": "Storage", "key": "Storage", "options": ["128GB", "256GB", "512GB"] },
                    { "name": "RAM", "key": "RAM", "options": ["8GB", "12GB"] }
                ],
                "Audio": [
                    { "name": "Brand", "key": "brand", "options": ["Stella", "Sony", "Bose", "Apple"] },
                    { "name": "Type", "key": "Type", "options": ["ANC Earbuds", "Wireless Over-Ear"] }
                ],
                "Accessories": [
                    { "name": "Type", "key": "Type", "options": ["Chargers", "Protective Cases", "Cables", "Power Banks"] }
                ],
                "Tablets": [
                    { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Lenovo"] },
                    { "name": "Storage", "key": "Storage", "options": ["64GB", "128GB", "256GB"] }
                ]
            };
        }
    } catch (err) {
        console.error('Error fetching site config:', err);
    }
};

onMounted(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchConfigs();
});

const openAddProduct = () => {
  editingProduct.value = null;
  productForm.value = { 
      name: '', 
      category_id: '', 
      price: 0, 
      stock_quantity: 0, 
      description: '', 
      image_url: '', 
      additional_images: [], 
      specs: {}
  };
  productImages.value = [];
  specsList.value = [];
  activeTab.value = 'product-editor';
};

const openEditProduct = (p) => {
  editingProduct.value = p;
  productForm.value = { 
      ...p
  };
  productImages.value = [];
  specsList.value = Object.entries(p.specs || {}).map(([key, value]) => ({ key, value }));
  activeTab.value = 'product-editor';
};



const handleImageSelect = (e) => {
    productImages.value = Array.from(e.target.files);
};

const addSpecRow = () => {
    specsList.value.push({ key: '', value: '' });
};

const removeSpecRow = (idx) => {
    specsList.value.splice(idx, 1);
};

const saveProduct = async () => {
  try {
    loading.value = true;
    const url = editingProduct.value 
        ? `${import.meta.env.VITE_API_BASE_URL}/products/${editingProduct.value.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/products`;
    
    // Reconstruct specs from specsList
    const specsObj = {};
    specsList.value.forEach(s => {
        if (s.key.trim() && s.value.trim()) {
            specsObj[s.key.trim()] = s.value.trim();
        }
    });

    const formData = new FormData();
    formData.append('name', productForm.value.name);
    formData.append('description', productForm.value.description || '');
    formData.append('price', productForm.value.price);
    formData.append('stock_quantity', productForm.value.stock_quantity);
    formData.append('category_id', productForm.value.category_id);
    formData.append('specs', JSON.stringify(specsObj));

    // Append files
    productImages.value.forEach(file => {
        formData.append('images', file);
    });

    // If editing and no new images, send old ones (as strings)
    if (editingProduct.value && productImages.value.length === 0) {
        formData.append('image_url', productForm.value.image_url);
        formData.append('additional_images', JSON.stringify(productForm.value.additional_images));
    }

    const response = await fetch(url, {
        method: editingProduct.value ? 'PUT' : 'POST',
        body: formData // No Content-Type header so browser sets multipart boundary automatically
    });

    if (!response.ok) throw new Error('Failed to save product');
    
    toastStore.addToast('Product saved successfully', 'success');
    await fetchProducts();
    activeTab.value = 'inventory';
  } catch (err) {
    toastStore.addToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const openDeleteModal = (id) => {
    productToDelete.value = id;
    showDeleteModal.value = true;
};

const executeDeleteProduct = async () => { 
    if (!productToDelete.value) return;
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${productToDelete.value}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        toastStore.addToast('Product deleted successfully', 'success');
        await fetchProducts();
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    } finally {
        showDeleteModal.value = false;
        productToDelete.value = null;
    }
};

const saveHomepage = async () => {
    try {
        loading.value = true;
        // Save homepage assets
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/homepage`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: homepage.value })
        });
        
        if (!response.ok) throw new Error('Failed to sync site assets');
        
        // Save category custom filters
        const filterResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/category_filters`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: categoryFilters.value })
        });
        
        if (!filterResponse.ok) throw new Error('Failed to sync custom filters');
        
        toastStore.addToast('Changes saved successfully: Homepage content and category filters updated.', 'success');
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    } finally {
        loading.value = false;
    }
};

const updateOrderStatus = async (order, newStatus) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${order.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            order.status = newStatus;
            toastStore.addToast('Order status updated', 'success');
        } else {
            throw new Error('Failed to update status');
        }
    } catch (err) {
        console.error('Failed to update order status:', err);
        toastStore.addToast('Error updating order fulfillment status: ' + err.message, 'error');
    }
};

const updateDeliveryDate = async (order, date) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${order.id}/delivery-date`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expected_delivery_date: date || null })
        });
        if (response.ok) {
            order.expected_delivery_date = date || null;
            toastStore.addToast('Expected delivery date saved', 'success');
        } else {
            throw new Error('Failed to update delivery date');
        }
    } catch (err) {
        console.error('Failed to update delivery date:', err);
        toastStore.addToast('Error saving delivery date: ' + err.message, 'error');
    }
};

const downloadInvoice = (orderId) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/invoice`, '_blank');
};
</script>

<template>
  <div class="min-h-screen pb-32">
    <!-- Master Header -->
    <section class="relative h-[40vh] flex items-end pb-16 px-6 overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/40 to-transparent z-10"></div>
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
      </div>
      
      <div class="max-w-7xl mx-auto w-full relative z-20">
        <div class="flex items-center space-x-3 mb-6 animate-fade-up">
            <span class="w-12 h-[1px] bg-stella-red"></span>
            <span class="text-stella-red font-black text-[10px] uppercase tracking-[0.5em]">Command Center</span>
        </div>
        <h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 animate-fade-up" style="animation-delay: 0.1s">
          Admin.<span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Dashboard</span>
        </h1>
        
        <!-- Tab Navigation (High Tech) -->
        <div class="flex items-center space-x-1 p-2 bg-[#0a0a0c] backdrop-blur-3xl rounded-[1.5rem] border border-white/10 w-fit animate-fade-up shadow-3xl" style="animation-delay: 0.2s">
            <button v-for="tab in [
                {id: 'overview', label: 'Overview'},
                {id: 'inventory', label: 'Products'},
                {id: 'categories', label: 'Categories'},
                {id: 'page-editor', label: 'Page Editor'},
                {id: 'fulfillment', label: 'Orders'}
            ]" :key="tab.id"
            @click="activeTab = tab.id"
            class="px-8 py-4 rounded-[1rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all"
            :class="activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'">
                <span>{{ tab.label }}</span>
            </button>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-6">
      
      <!-- Telemetry Insights -->
      <div v-if="activeTab === 'overview'" class="space-y-12 animate-fade-up">
        
        <!-- Filter Control -->
        <div class="flex items-center space-x-2 bg-white/5 p-1 rounded-[1rem] w-fit border border-white/[0.05]">
            <button @click="setTimeFilter('week')" :class="selectedTimeFilter === 'week' ? 'bg-white text-black shadow-md shadow-white/10' : 'text-gray-400 hover:text-white'" class="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Week</button>
            <button @click="setTimeFilter('month')" :class="selectedTimeFilter === 'month' ? 'bg-white text-black shadow-md shadow-white/10' : 'text-gray-400 hover:text-white'" class="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Month</button>
            <button @click="setTimeFilter('year')" :class="selectedTimeFilter === 'year' ? 'bg-white text-black shadow-md shadow-white/10' : 'text-gray-400 hover:text-white'" class="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Year</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl p-8 lg:p-12 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4 group-hover:text-white transition-colors relative z-10">{{ stat.label }}</p>
            <p class="text-3xl lg:text-4xl font-black tracking-tighter relative z-10" :class="stat.color">{{ stat.value }}</p>
          </div>
        </div>
        
        <div class="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl p-10 lg:p-16 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stella-red/5 to-transparent pointer-events-none blur-3xl"></div>
            <h3 class="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-3 relative z-10">
                <span class="w-1.5 h-1.5 bg-stella-red rounded-full"></span> {{ selectedTimeFilter === 'year' ? '12-Month' : selectedTimeFilter === 'month' ? '30-Day' : '7-Day' }} Revenue Matrix
            </h3>
            
            <div class="h-64 flex items-end gap-2 lg:gap-4 w-full relative z-10" v-if="chartData.length > 0">
                <!-- Simple CSS Bar Chart -->
                <div v-for="(point, idx) in chartData" :key="idx" class="flex-1 flex flex-col items-center justify-end h-full group">
                    <div class="w-full bg-white/5 rounded-t-lg group-hover:bg-stella-red transition-all duration-300 relative"
                         :style="{ height: (point.revenue / Math.max(...chartData.map(d => d.revenue)) * 100) + '%' }">
                        <!-- Tooltip -->
                        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            ₹{{ point.revenue.toLocaleString() }}
                        </div>
                    </div>
                    <span class="text-[8px] font-bold text-gray-500 uppercase mt-4 rotate-45 origin-left lg:rotate-0 lg:origin-center">
                        {{ selectedTimeFilter === 'year' 
                            ? new Date(point.date + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) 
                            : new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                    </span>
                </div>
            </div>
            <div v-else class="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                <p class="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Data Available for {{ selectedTimeFilter }}</p>
            </div>
        </div>
      </div>

      <!-- Product Management -->
      <div v-if="activeTab === 'inventory'" class="space-y-8 animate-fade-in">
        <div class="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl overflow-hidden">
            <div class="p-10 border-b border-white/[0.05] flex justify-between items-center">
                <div class="flex items-center space-x-6">
                    <h2 class="text-3xl font-black uppercase tracking-tighter text-white">Product Inventory</h2>
                    <select v-model="selectedCategoryFilter" class="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                        <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <button @click="openAddProduct"
                        class="stella-button bg-stella-red text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 relative group overflow-hidden">
                <span class="relative z-10">+ Add New Product</span>
                <div class="absolute inset-0 bg-stella-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/[0.05] text-xs font-black uppercase tracking-widest text-gray-400 bg-white/[0.01]">
                            <th class="px-12 py-8">Product</th>
                            <th class="px-12 py-8">Stock available</th>
                            <th class="px-12 py-8">Price</th>
                            <th class="px-12 py-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="product in filteredProductsList" :key="product.id" class="hover:bg-white/[0.02] transition-colors group">
                            <td class="px-12 py-10">
                                <div class="flex items-center space-x-6">
                                    <div class="w-14 h-14 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center p-2">
                                        <img :src="product.image_url" class="w-full h-full object-contain mix-blend-lighten" />
                                    </div>
                                    <span class="text-white font-black uppercase tracking-widest text-xs">{{ product.name }}</span>
                                </div>
                            </td>
                            <td class="px-12 py-10">
                                <span class="glass px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]" :class="product.stock_quantity > 5 ? 'border-green-500/20 text-green-400' : 'border-stella-red/20 text-stella-red'">
                                    {{ product.stock_quantity }} Units
                                </span>
                            </td>
                            <td class="px-12 py-10 text-white font-black tracking-widest text-sm">RS {{ product.price }}</td>
                            <td class="px-12 py-10 text-right">
                                <div class="flex items-center justify-end space-x-6">
                                    <button @click="openEditProduct(product)" class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Edit</button>
                                    <button @click="openDeleteModal(product.id)" class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-600 hover:text-stella-red transition-colors">Delete</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <!-- Order Fulfillment Logs -->
      <div v-if="activeTab === 'fulfillment'" class="space-y-12 animate-fade-up">
        <div class="flex justify-between items-center glass p-8 rounded-[2.5rem]">
            <div class="flex items-center space-x-6">
                <div class="w-12 h-12 rounded-2xl bg-stella-red/20 flex items-center justify-center text-stella-red text-xl">📋</div>
                <h2 class="text-3xl font-black uppercase tracking-tighter text-white">Order Logs</h2>
            </div>
            <div class="flex items-center space-x-4">
                <select v-model="orderCategoryFilter" class="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                    <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat === 'All' ? 'All Products' : cat }}</option>
                </select>
                <select v-model="orderPaymentFilter" class="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                    <option value="All">All Payments</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="upi">UPI</option>
                    <option value="store">Store Hub</option>
                </select>
                <select v-model="orderStatusFilter" class="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                    <option value="All">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select v-model="orderTimeFilter" class="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                    <option value="All">All Time</option>
                    <option value="Day">Past Day</option>
                    <option value="Week">Past Week</option>
                    <option value="Month">Past Month</option>
                    <option value="Year">Past Year</option>
                </select>
            </div>
        </div>

        <div class="stella-card overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-stella-black/50 border-b border-white/5 text-xs uppercase tracking-[0.4em] text-gray-500 font-black">
                    <tr>
                        <th class="px-12 py-10">Order Details</th>
                        <th class="px-12 py-10">Customer Details</th>
                        <th class="px-12 py-10">Payment Method</th>
                        <th class="px-12 py-10">Price</th>
                        <th class="px-12 py-10">Status</th>
                        <th class="px-12 py-10">Invoice</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="order in filteredOrdersList" :key="order.id" class="hover:bg-white/[0.02] transition-colors group">
                        <td class="px-12 py-10">
                            <div class="flex flex-col">
                                <span class="text-white font-black tracking-widest text-sm">#ST-{{ order.id }}</span>
                                <span class="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">{{ new Date(order.created_at).toLocaleString() }}</span>
                            </div>
                        </td>
                        <td class="px-12 py-10">
                            <div class="flex flex-col">
                                <span class="text-white font-black uppercase tracking-widest text-sm">{{ order.user_name || 'Walk-in Buyer' }}</span>
                                <span class="text-gray-400 font-mono text-[10px] md:text-xs mt-1">{{ order.user_phone || 'Direct Store' }}</span>
                            </div>
                        </td>
                        <td class="px-12 py-10">
                            <div class="flex flex-col">
                                <span class="text-white font-black uppercase tracking-widest text-sm">{{ order.delivery_type }}</span>
                                <span class="text-gray-500 text-[10px] mt-1 uppercase tracking-wider font-bold">{{ order.payment_method }}</span>
                            </div>
                        </td>
                        <td class="px-12 py-10 text-white font-black tracking-widest text-sm">RS {{ order.total_amount }}</td>
                        <td class="px-12 py-10">
                            <select :value="order.status" @change="(e) => updateOrderStatus(order, e.target.value)"
                            class="bg-stella-black border border-white/10 text-xs font-black uppercase tracking-wider text-white rounded-xl px-4 py-2 outline-none focus:border-stella-red">
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </td>
                        <td class="px-8 py-10">
                            <div class="flex flex-col gap-1">
                                <span class="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Expected Delivery</span>
                                <input
                                    type="date"
                                    :value="order.expected_delivery_date ? order.expected_delivery_date.split('T')[0] : ''"
                                    @change="(e) => updateDeliveryDate(order, e.target.value)"
                                    class="bg-stella-black border border-white/10 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-stella-red cursor-pointer"
                                />
                            </div>
                        </td>
                        <td class="px-12 py-10 text-center">
                            <button @click="downloadInvoice(order.id)" class="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/10 transition-colors flex items-center justify-center text-white" title="Download Invoice">
                                📄
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredOrdersList.length === 0">
                        <td colspan="5" class="text-center py-20 text-gray-500 font-black uppercase tracking-[0.3em] text-xs">
                            No logs registered in system database
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <!-- Page Content Editor (Site Config) -->
      <div v-if="activeTab === 'page-editor'" class="space-y-20 animate-fade-up pb-32">
        <div class="glass p-12 rounded-[3rem] border-stella-red/10">
            <div class="flex items-center justify-between mb-16">
                <div>
                    <h2 class="text-4xl font-black uppercase tracking-tighter text-white">Homepage Content</h2>
                    <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-2">Configure banners, slides, and sections</p>
                </div>
                <button @click="saveHomepage" :disabled="loading" class="stella-button bg-stella-red text-white px-16 py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] shadow-3xl shadow-stella-red/30">
                    {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>

            <!-- Hero Slides Config -->
            <div class="space-y-12 mb-20">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                        <span class="w-8 h-[2px] bg-stella-red mr-4"></span> Hero Slides
                    </h3>
                    <button @click="addHeroSlide" class="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] border-b border-stella-gold/20 pb-1 hover:border-stella-gold">+ Add Slide</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div v-for="(slide, idx) in homepage.hero.slides" :key="idx" class="stella-card p-10 relative group">
                        <button @click="removeHeroSlide(idx)" class="absolute top-6 right-6 text-gray-700 hover:text-stella-red transition-colors font-black">REMOVE</button>
                        <div class="space-y-8">
                            <div class="space-y-3">
                                <label class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">SLIDE {{ idx + 1 }} HEADLINE</label>
                                <input v-model="slide.title" class="w-full bg-stella-black border border-white/5 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-xs font-bold uppercase" />
                            </div>
                            <div class="space-y-3">
                                <label class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">BANNER IMAGE URL</label>
                                <input v-model="slide.image" class="w-full bg-stella-black border border-white/5 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-[10px] font-mono" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Deals Section Config -->
            <div class="space-y-12 border-t border-white/5 pt-20">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                            <span class="w-8 h-[2px] bg-stella-gold mr-4"></span> Deals of the Day
                        </h3>
                        <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">Manage seasonal price drops</p>
                    </div>
                    <div @click="homepage.deals.show = !homepage.deals.show" 
                         class="w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300"
                         :class="homepage.deals.show ? 'bg-stella-red' : 'bg-gray-800'">
                        <div class="w-6 h-6 bg-white rounded-full transition-transform duration-300" :class="{'translate-x-8': homepage.deals.show}"></div>
                    </div>
                </div>

                <div v-if="homepage.deals.show" class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div v-for="(deal, idx) in homepage.deals.items" :key="idx" class="stella-card p-10 relative flex flex-col justify-between">
                        <button @click="homepage.deals.items.splice(idx, 1)" class="absolute top-6 right-6 text-[9px] font-black text-stella-red uppercase tracking-widest hover:text-white transition-colors">Remove</button>
                        <div class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Select Category</label>
                                    <select v-model="deal.categoryId" @change="deal.productId = 0" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs appearance-none">
                                        <option value="" disabled>Select a category...</option>
                                        <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Select Product</label>
                                    <select v-model="deal.productId" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs appearance-none">
                                        <option value="0" disabled>{{ deal.categoryId ? 'Select a product...' : 'Please select a category first...' }}</option>
                                        <option v-for="prod in (deal.categoryId ? products.filter(p => p.category_id === parseInt(deal.categoryId)) : [])" :key="prod.id" :value="prod.id">{{ prod.name }} (₹{{ prod.price }})</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Deal Price (₹)</label>
                                    <input type="number" v-model="deal.dealPrice" placeholder="Override price" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Deal Label / Tag</label>
                                    <input v-model="deal.customLabel" placeholder="e.g. 10% OFF" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs" />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Deal Subtitle / Note</label>
                                <input v-model="deal.subtitle" placeholder="e.g. Experience next-generation performance" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs" />
                            </div>
                        </div>
                    </div>
                    <button @click="homepage.deals.items.push({ productId: 0, dealPrice: 0, customLabel: 'SPECIAL OFFER', subtitle: '', categoryId: '' })" 
                            class="stella-card p-10 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-stella-red transition-all">
                        <span class="text-3xl mb-4">+</span>
                        <span class="text-[9px] font-black uppercase tracking-widest">Add Deal Item</span>
                    </button>
                </div>
            </div>

            <!-- Franchise Network Config -->
            <div class="space-y-12 border-t border-white/5 pt-20">
                <div>
                    <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                        <span class="w-8 h-[2px] bg-stella-gold mr-4"></span> Franchise Network Settings
                    </h3>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">Manage franchise page details and active branch store locations</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-4">
                        <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Franchise Title</label>
                        <input v-model="homepage.franchise.title" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs font-bold" />
                    </div>
                    <div class="space-y-4">
                        <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Banner Background Image URL</label>
                        <input v-model="homepage.franchise.bannerImg" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs font-mono" />
                    </div>
                </div>

                <div class="space-y-4">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Franchise Description Details</label>
                    <textarea v-model="homepage.franchise.description" rows="3" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-4 px-6 focus:border-stella-red outline-none text-xs font-medium leading-relaxed"></textarea>
                </div>

                <!-- Store Location Bento Cards Editor -->
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h4 class="text-sm font-black uppercase tracking-widest text-white">Active Branch Store Locations</h4>
                        <button @click="homepage.franchise.hubs.push({ tag: 'Premium Hub', name: 'New Stella Hub', address: '', phone: '+91 ', hours: '10 AM - 9 PM' })" class="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] border-b border-stella-gold/20 pb-1 hover:border-stella-gold">+ Add Store Location</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="(hub, hidx) in homepage.franchise.hubs" :key="hidx" class="stella-card p-8 border border-white/5 bg-white/[0.01] relative group">
                            <button @click="homepage.franchise.hubs.splice(hidx, 1)" class="absolute top-4 right-4 text-[9px] font-black text-stella-red uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Remove</button>
                            <div class="space-y-6">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Location Tag (e.g. Flagship, Express)</label>
                                        <input v-model="hub.tag" placeholder="e.g. Flagship Hub" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs" />
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Branch Name</label>
                                        <input v-model="hub.name" placeholder="e.g. Stella Adyar" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-bold" />
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Store Address Details</label>
                                    <input v-model="hub.address" placeholder="e.g. MG Road, Shastri Nagar" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs" />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Contact Phone Number</label>
                                        <input v-model="hub.phone" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-mono" />
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Operating Hours</label>
                                        <input v-model="hub.hours" placeholder="e.g. 10 AM - 9 PM" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customer Testimonials Config -->
            <div class="space-y-12 border-t border-white/5 pt-20">
                <div>
                    <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                        <span class="w-8 h-[2px] bg-stella-gold mr-4"></span> Customer Trust Testimonials
                    </h3>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">Manage customer review cards featured in the 3 vertical scrolling marquee columns</p>
                </div>

                <!-- Testimonials Column Tabs -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <!-- Column 1 Reviews -->
                    <div class="space-y-6 p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <div class="flex justify-between items-center pb-4 border-b border-white/5">
                            <h4 class="text-xs font-black uppercase tracking-widest text-stella-gold">Column 1 (Scrolls Up)</h4>
                            <button @click="homepage.testimonials.col1.push({ id: Date.now(), name: 'New Customer', text: 'Amazing service!', stars: 5 })" class="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors">+ Add Card</button>
                        </div>
                        <div class="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="(review, ridx) in homepage.testimonials.col1" :key="review.id" class="p-4 rounded-xl border border-white/5 bg-stella-black relative">
                                <button @click="homepage.testimonials.col1.splice(ridx, 1)" class="absolute top-2 right-2 text-[8px] font-black text-stella-red uppercase tracking-widest">Delete</button>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Name</label>
                                            <input v-model="review.name" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold" />
                                        </div>
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Stars (1-5)</label>
                                            <input type="number" min="1" max="5" v-model="review.stars" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px]" />
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[7px] text-gray-500 font-bold uppercase">Review Quote Text</label>
                                        <textarea v-model="review.text" rows="2" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium leading-relaxed"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Column 2 Reviews -->
                    <div class="space-y-6 p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <div class="flex justify-between items-center pb-4 border-b border-white/5">
                            <h4 class="text-xs font-black uppercase tracking-widest text-stella-gold">Column 2 (Scrolls Down)</h4>
                            <button @click="homepage.testimonials.col2.push({ id: Date.now(), name: 'New Customer', text: 'Amazing service!', stars: 5 })" class="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors">+ Add Card</button>
                        </div>
                        <div class="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="(review, ridx) in homepage.testimonials.col2" :key="review.id" class="p-4 rounded-xl border border-white/5 bg-stella-black relative">
                                <button @click="homepage.testimonials.col2.splice(ridx, 1)" class="absolute top-2 right-2 text-[8px] font-black text-stella-red uppercase tracking-widest">Delete</button>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Name</label>
                                            <input v-model="review.name" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold" />
                                        </div>
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Stars (1-5)</label>
                                            <input type="number" min="1" max="5" v-model="review.stars" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px]" />
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[7px] text-gray-500 font-bold uppercase">Review Quote Text</label>
                                        <textarea v-model="review.text" rows="2" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium leading-relaxed"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Column 3 Reviews -->
                    <div class="space-y-6 p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <div class="flex justify-between items-center pb-4 border-b border-white/5">
                            <h4 class="text-xs font-black uppercase tracking-widest text-stella-gold">Column 3 (Scrolls Up)</h4>
                            <button @click="homepage.testimonials.col3.push({ id: Date.now(), name: 'New Customer', text: 'Amazing service!', stars: 5 })" class="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors">+ Add Card</button>
                        </div>
                        <div class="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="(review, ridx) in homepage.testimonials.col3" :key="review.id" class="p-4 rounded-xl border border-white/5 bg-stella-black relative">
                                <button @click="homepage.testimonials.col3.splice(ridx, 1)" class="absolute top-2 right-2 text-[8px] font-black text-stella-red uppercase tracking-widest">Delete</button>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Name</label>
                                            <input v-model="review.name" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold" />
                                        </div>
                                        <div class="space-y-1">
                                            <label class="text-[7px] text-gray-500 font-bold uppercase">Stars (1-5)</label>
                                            <input type="number" min="1" max="5" v-model="review.stars" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px]" />
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[7px] text-gray-500 font-bold uppercase">Review Quote Text</label>
                                        <textarea v-model="review.text" rows="2" class="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium leading-relaxed"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Header Navigation Config -->
            <div class="space-y-12 border-t border-white/5 pt-20">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                            <span class="w-8 h-[2px] bg-stella-gold mr-4"></span> Header Navigation Menu
                        </h3>
                        <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">Manage links appearing in the top navigation bar</p>
                    </div>
                    <button @click="homepage.navLinks.push({ name: 'New Category' })" class="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] border-b border-stella-gold/20 pb-1 hover:border-stella-gold">+ Add Category</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="(link, lidx) in homepage.navLinks" :key="lidx" class="stella-card p-6 border border-white/5 bg-white/[0.01] relative group">
                        <button @click="homepage.navLinks.splice(lidx, 1)" class="absolute top-4 right-4 text-[9px] font-black text-stella-red uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Remove</button>
                        <div class="space-y-4 pt-4">
                            <div class="space-y-2">
                                <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Navigation Name</label>
                                <input v-model="link.name" placeholder="e.g. Smartphones" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-bold" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Categories Tab -->
      <div v-if="activeTab === 'categories'" class="space-y-20 animate-fade-up pb-32">
        <div class="glass p-12 rounded-[3rem] border-stella-red/10">
            <!-- Product Category Management -->
            <div class="space-y-12">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-4xl font-black uppercase tracking-tighter text-white">Product Categories</h2>
                        <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-2">Manage dynamic catalog categories</p>
                    </div>
                    <button @click="openAddCategory" class="stella-button bg-stella-red text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 shadow-xl shadow-stella-red/20">
                        + Add Category
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="cat in dbCategories" :key="cat.id" class="stella-card p-6 border border-white/5 bg-white/[0.01] relative group flex flex-col justify-between">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="bg-stella-red/20 text-stella-red text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-stella-red/10">ID #{{ cat.id }}</span>
                                <div class="flex items-center space-x-3 opacity-65 group-hover:opacity-100 transition-opacity">
                                    <button @click="openEditCategory(cat)" class="text-[9px] font-black text-stella-gold uppercase tracking-widest hover:text-white transition-colors">Edit</button>
                                    <button @click="executeDeleteCategory(cat.id)" class="text-[9px] font-black text-stella-red uppercase tracking-widest hover:text-white transition-colors">Delete</button>
                                </div>
                            </div>
                            <h4 class="text-sm font-black uppercase tracking-wide text-white">{{ cat.name }}</h4>
                            <p class="text-gray-500 text-[10px] font-medium leading-relaxed">{{ cat.description || 'No description provided.' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category Filters Config -->
            <div class="space-y-12 border-t border-white/5 mt-20 pt-20">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-black uppercase tracking-widest text-white flex items-center">
                            <span class="w-8 h-[2px] bg-stella-gold mr-4"></span> Dynamic Category Filters
                        </h3>
                        <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">Configure left-side filters shown to customers on category catalog pages</p>
                    </div>
                </div>

                <!-- Active Category Selector Buttons -->
                <div class="flex flex-wrap items-center gap-3 p-2 bg-white/5 rounded-2xl w-fit">
                    <button v-for="cat in dbCategories" :key="cat.id"
                            @click="selectedFilterCategory = cat.name"
                            class="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                            :class="selectedFilterCategory === cat.name ? 'bg-stella-red text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'">
                        {{ cat.name }}
                    </button>
                </div>

                <!-- Dynamic Category Header Background Image URL -->
                <div v-if="selectedFilterCategory" class="stella-card p-6 border border-white/5 bg-white/[0.01] space-y-4 max-w-2xl animate-fade-up">
                    <div class="flex items-center justify-between">
                        <label class="text-[9px] font-black text-stella-gold uppercase tracking-widest flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-stella-gold"></span>
                            Header Background Image URL for {{ selectedFilterCategory }}
                        </label>
                        <span class="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Category Banner Image</span>
                    </div>
                    <input v-model="categoryHeaderImage" 
                           placeholder="e.g. https://images.unsplash.com/photo-1556656793-08538906a9f8" 
                           class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-semibold" />
                    <p class="text-[8px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">Set a custom header banner image for this category. A standard background is loaded if left empty.</p>
                </div>

                <div v-if="selectedFilterCategory" class="space-y-10">
                    <div class="flex justify-between items-center pb-2 border-b border-white/5">
                        <span class="text-[10px] text-stella-gold font-black uppercase tracking-widest">Active Filters for {{ selectedFilterCategory }}</span>
                        <button @click="() => {
                            if (!categoryFilters[selectedFilterCategory]) {
                                categoryFilters[selectedFilterCategory] = [];
                            }
                            categoryFilters[selectedFilterCategory].push({ name: 'New Filter', key: 'specs_key', options: ['Option 1'] });
                        }" class="text-stella-gold font-black uppercase tracking-[0.3em] text-[8px] border-b border-stella-gold/20 pb-0.5 hover:border-stella-gold">+ Add Filter Group</button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div v-for="(filt, fidx) in categoryFilters[selectedFilterCategory]" :key="fidx" class="stella-card p-6 border border-white/5 bg-white/[0.01] relative group">
                            <button @click="categoryFilters[selectedFilterCategory].splice(fidx, 1)" class="absolute top-4 right-4 text-[9px] font-black text-stella-red uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Remove</button>
                            <div class="space-y-4 pt-4">
                                <div class="space-y-2">
                                    <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Filter Name (UI Title)</label>
                                    <input v-model="filt.name" placeholder="e.g. Brand / Storage" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-bold" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Match Key (Name or specs attribute)</label>
                                    <input v-model="filt.key" placeholder="e.g. brand, Storage, RAM" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-mono" />
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Options (Comma-separated)</label>
                                    <input :value="filt.options ? filt.options.join(', ') : ''" 
                                           @input="(e) => filt.options = e.target.value.split(',').map(s => s.trim()).filter(Boolean)" 
                                           placeholder="e.g. Apple, Samsung, Google" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-4 focus:border-stella-red outline-none text-xs font-medium" />
                                </div>
                            </div>
                        </div>
                        <div v-if="!categoryFilters[selectedFilterCategory] || categoryFilters[selectedFilterCategory].length === 0" 
                             class="col-span-full py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[9px] border border-dashed border-white/10 rounded-2xl">
                            No filter parameters configured for this category yet.
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <!-- Product Editor Tab -->
      <div v-if="activeTab === 'product-editor'" class="space-y-8 animate-fade-in pb-32">
          <div class="w-full bg-[#050505] border border-white/[0.05] rounded-[2rem] shadow-2xl overflow-hidden relative">
              <!-- Premium ambient glow -->
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[200px] bg-stella-red/5 blur-[120px] pointer-events-none"></div>
              
              <div class="p-8 sm:p-12 border-b border-white/[0.05] flex justify-between items-center bg-[#050505]/95 backdrop-blur-xl z-10 relative">
                  <div>
                      <h2 class="text-4xl font-black uppercase tracking-tighter text-white">{{ editingProduct ? 'Modify Product' : 'Add New Product' }}</h2>
                      <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Product Specifications & Metadata</p>
                  </div>
                  <button @click="activeTab = 'inventory'" class="text-gray-500 hover:text-white transition-colors w-12 h-12 flex items-center justify-center bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.05]">✕</button>
              </div>
              
              <div class="p-8 sm:p-12 relative z-10">
                  <form @submit.prevent="saveProduct" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      
                      <!-- Left Column: Basic Info -->
                      <div class="lg:col-span-7 space-y-8">
                          <div class="bg-white/[0.01] border border-white/[0.03] rounded-[1.5rem] p-8 space-y-8">
                              <h3 class="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                  <span class="w-1.5 h-1.5 bg-stella-red rounded-full"></span> Core Details
                              </h3>
                              <div class="space-y-6">
                                  <div>
                                      <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Product Name</label>
                                      <input v-model="productForm.name" required class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-5 text-white text-sm focus:border-stella-red outline-none transition-colors" placeholder="e.g. Stella Phone X" />
                                  </div>
                                  <div class="grid grid-cols-2 gap-6">
                                      <div>
                                          <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Price (₹)</label>
                                          <input v-model="productForm.price" type="number" required class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-5 text-white text-sm focus:border-stella-red outline-none transition-colors" placeholder="0.00" />
                                      </div>
                                      <div>
                                          <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Stock Qty</label>
                                          <input v-model="productForm.stock_quantity" type="number" required class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-5 text-white text-sm focus:border-stella-red outline-none transition-colors" placeholder="0" />
                                      </div>
                                  </div>
                                  <div>
                                      <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Category</label>
                                      <select v-model="productForm.category_id" required class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-5 text-white text-sm focus:border-stella-red outline-none transition-colors appearance-none">
                                          <option value="" disabled>Select a Category</option>
                                          <option v-for="cat in dbCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Description</label>
                                      <textarea v-model="productForm.description" rows="4" class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-5 text-white text-sm focus:border-stella-red outline-none transition-colors resize-none" placeholder="Elaborate on the premium features..."></textarea>
                                  </div>
                              </div>
                          </div>
                      </div>
    
                      <!-- Right Column: Specs & Images -->
                      <div class="lg:col-span-5 space-y-8">
                          <!-- Specifications Bento -->
                          <div class="bg-white/[0.01] border border-white/[0.03] rounded-[1.5rem] p-8">
                              <div class="flex justify-between items-center mb-6">
                                  <h3 class="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                      <span class="w-1.5 h-1.5 bg-white/20 rounded-full"></span> Specifications
                                  </h3>
                                  <button type="button" @click="addSpecRow" class="text-stella-red text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">+ Add Spec</button>
                              </div>
                              
                              <div class="space-y-3">
                                  <div v-for="(spec, idx) in specsList" :key="idx" class="flex gap-3">
                                      <input v-model="spec.key" placeholder="Key (e.g. RAM)" class="w-1/3 bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white text-xs focus:border-stella-red outline-none" />
                                      <input v-model="spec.value" placeholder="Value (e.g. 12GB)" class="flex-1 bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3 text-white text-xs focus:border-stella-red outline-none" />
                                      <button type="button" @click="removeSpecRow(idx)" class="w-10 h-10 flex shrink-0 items-center justify-center bg-white/[0.02] border border-white/[0.05] hover:border-stella-red hover:text-stella-red rounded-xl text-gray-500 transition-colors">✕</button>
                                  </div>
                                  <div v-if="specsList.length === 0" class="text-center py-6 border border-dashed border-white/[0.05] rounded-xl">
                                      <p class="text-gray-600 text-[9px] font-black uppercase tracking-widest">No specifications added</p>
                                  </div>
                              </div>
                          </div>
    
                          <!-- Media Bento -->
                          <div class="bg-white/[0.01] border border-white/[0.03] rounded-[1.5rem] p-8">
                              <h3 class="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                  <span class="w-1.5 h-1.5 bg-white/20 rounded-full"></span> Media
                              </h3>
                              <div>
                                  <div class="relative w-full h-40 border-2 border-dashed border-white/[0.1] rounded-2xl flex flex-col items-center justify-center hover:border-stella-red/50 transition-colors bg-black/40 overflow-hidden group">
                                      <input type="file" multiple accept="image/*" @change="handleImageSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-600 mb-3 group-hover:text-stella-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                      <span class="text-xs text-white font-bold group-hover:text-stella-red transition-colors">Select files from device</span>
                                      <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">{{ productImages.length }} files selected</span>
                                  </div>
                                  
                                  <p v-if="editingProduct && productImages.length === 0" class="text-[9px] text-stella-red mt-4 font-black uppercase tracking-widest text-center">
                                      Leaving empty keeps existing images
                                  </p>
                              </div>
                          </div>
                      </div>
                  </form>
              </div>
              
              <div class="p-8 sm:px-10 sm:py-6 border-t border-white/[0.05] bg-[#0e0e11] flex justify-end gap-4">
                  <button type="button" @click="activeTab = 'inventory'" class="px-8 py-4 rounded-xl text-gray-400 font-black uppercase tracking-widest text-[9px] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button @click="saveProduct" :disabled="loading" class="stella-button bg-stella-red text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 flex items-center gap-2">
                      <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Save Product
                  </button>
              </div>
          </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-stella-black/80 backdrop-blur-sm" @click="showDeleteModal = false"></div>
      <div class="relative bg-stella-charcoal border border-white/10 rounded-[2rem] w-full max-w-md p-10 shadow-2xl animate-fade-up">
        <div class="flex items-center space-x-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-stella-red/10 flex items-center justify-center border border-stella-red/20 text-stella-red font-bold text-xl">!</div>
            <h2 class="text-2xl font-black uppercase tracking-widest text-white">Delete Product</h2>
        </div>
        <p class="text-gray-400 text-xs uppercase tracking-widest font-bold leading-relaxed mb-10">Are you sure you want to delete this product?</p>
        
        <div class="flex items-center space-x-4">
            <button @click="showDeleteModal = false" class="flex-1 bg-white/[0.03] border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors">Cancel</button>
            <button @click="executeDeleteProduct" class="flex-1 bg-stella-red text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-stella-red/20 hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-stella-black/80 backdrop-blur-sm" @click="showCategoryModal = false"></div>
      <div class="relative bg-stella-charcoal border border-white/10 rounded-[2rem] w-full max-w-lg p-10 shadow-2xl animate-fade-up">
        <div class="flex items-center space-x-4 mb-8">
            <div class="w-12 h-12 rounded-2xl bg-stella-red/10 flex items-center justify-center border border-stella-red/20 text-stella-red font-bold text-xl">📁</div>
            <h2 class="text-2xl font-black uppercase tracking-widest text-white">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h2>
        </div>
        
        <form @submit.prevent="saveCategory" class="space-y-6">
            <div class="space-y-2">
                <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Category Name</label>
                <input v-model="categoryForm.name" required class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-4 text-white text-sm focus:border-stella-red outline-none transition-colors" placeholder="e.g. Tablets" />
            </div>
            <div class="space-y-2">
                <label class="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Description</label>
                <textarea v-model="categoryForm.description" rows="3" class="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-4 text-white text-sm focus:border-stella-red outline-none transition-colors resize-none" placeholder="Brief description..."></textarea>
            </div>
            
            <div class="flex items-center space-x-4 pt-4">
                <button type="button" @click="showCategoryModal = false" class="flex-1 bg-white/[0.03] border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" :disabled="loading" class="flex-1 bg-stella-red text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-stella-red/20 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ editingCategory ? 'Save Changes' : 'Create Category' }}
                </button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
</style>
