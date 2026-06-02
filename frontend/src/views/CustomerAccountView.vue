<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const cartStore = useCartStore();
const toastStore = useToastStore();
const route = useRoute();

// Tab system
const activeTab = ref('profile');
const isMobileTabMenuOpen = ref(false);
const tabs = [
    {id: 'profile', label: 'Profile'},
    {id: 'tracking', label: 'Tracking Details'},
    {id: 'orders', label: 'Order History'}
];

// States
const orders = ref([]);
const addresses = ref([]);
const loadingOrders = ref(false);
const loadingAddresses = ref(false);

// Edit Profile Form States
const editName = ref('');
const editEmail = ref('');
const savingProfile = ref(false);

// OTP Modal States for Phone Update
const showOtpModal = ref(false);
const newPhone = ref('');
const otpCode = ref('');
const otpStep = ref(1); // 1 = input phone, 2 = input code
const sendingOtp = ref(false);
const verifyingOtp = ref(false);

// Address Modal States
const showAddressModal = ref(false);
const editingAddress = ref(null); // null if adding, address object if editing
const addressForm = ref({
    address_name: '',
    street_address: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false
});
const savingAddress = ref(false);

// Accordion control for order history
const expandedOrders = ref({});

// Computed Values
const activeOrders = computed(() => {
    return orders.value.filter(o => ['pending', 'processing', 'shipped'].includes(o.status.toLowerCase()));
});

const completedOrders = computed(() => {
    return orders.value.filter(o => ['delivered', 'cancelled'].includes(o.status.toLowerCase()));
});

const defaultAddress = computed(() => {
    return addresses.value.find(a => a.is_default);
});

// Initializers
onMounted(async () => {
    if (route.query.tab) {
        activeTab.value = route.query.tab;
    }
    if (user.value) {
        editName.value = user.value.name || '';
        editEmail.value = user.value.email || '';
        await fetchUserOrders();
        await fetchUserAddresses();
    }
});

const downloadInvoice = (orderId) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/invoice`, '_blank');
};

// Fetch APIs
const fetchUserOrders = async () => {
    if (!user.value) return;
    try {
        loadingOrders.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/user/${user.value.id}`);
        if (response.ok) {
            orders.value = await response.json();
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
    } finally {
        loadingOrders.value = false;
    }
};

const fetchUserAddresses = async () => {
    if (!user.value) return;
    try {
        loadingAddresses.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses/user/${user.value.id}`);
        if (response.ok) {
            addresses.value = await response.json();
        }
    } catch (err) {
        console.error('Error fetching addresses:', err);
    } finally {
        loadingAddresses.value = false;
    }
};

// Profile Sync Actions
const saveProfile = async () => {
    if (!editName.value.trim()) {
        toastStore.addToast('Name is required', 'error');
        return;
    }
    try {
        savingProfile.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile/${user.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.value, email: editEmail.value })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            authStore.updateUser(data.user);
            toastStore.addToast('Profile changes saved successfully!', 'success');
        } else {
            toastStore.addToast(data.error || 'Failed to update profile', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Failed to connect to core authentication servers', 'error');
    } finally {
        savingProfile.value = false;
    }
};

// OTP Actions for Changing Phone Number
const openOtpModal = () => {
    newPhone.value = '';
    otpCode.value = '';
    otpStep.value = 1;
    showOtpModal.value = true;
};

const closeOtpModal = () => {
    showOtpModal.value = false;
};

const handleSendOtp = async () => {
    if (!newPhone.value.trim()) {
        toastStore.addToast('Valid sync number is required', 'error');
        return;
    }
    try {
        sendingOtp.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: newPhone.value })
        });
        const data = await response.json();
        if (response.ok) {
            otpStep.value = 2;
            toastStore.addToast('OTP secure protocol transmitted! Use code 123456.', 'success');
        } else {
            toastStore.addToast(data.error || 'Failed to initiate OTP protocol', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Failed to connect to telecom relays', 'error');
    } finally {
        sendingOtp.value = false;
    }
};

const handleVerifyOtp = async () => {
    if (!otpCode.value.trim()) {
        toastStore.addToast('Verification key is required', 'error');
        return;
    }
    try {
        verifyingOtp.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/update-mobile/${user.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPhoneNumber: newPhone.value, code: otpCode.value })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            authStore.updateUser(data.user);
            toastStore.addToast('Mobile sync database entry updated!', 'success');
            closeOtpModal();
        } else {
            toastStore.addToast(data.error || 'Verification rejected', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Authentication sync timeout', 'error');
    } finally {
        verifyingOtp.value = false;
    }
};

// Address CRUD actions
const openAddAddressModal = () => {
    editingAddress.value = null;
    addressForm.value = {
        address_name: '',
        street_address: '',
        landmark: '',
        city: '',
        state: '',
        postal_code: '',
        is_default: false
    };
    showAddressModal.value = true;
};

const openEditAddressModal = (addr) => {
    editingAddress.value = addr;
    addressForm.value = {
        address_name: addr.address_name || '',
        street_address: addr.street_address,
        landmark: addr.landmark || '',
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        is_default: addr.is_default
    };
    showAddressModal.value = true;
};

const closeAddressModal = () => {
    showAddressModal.value = false;
};

const saveAddress = async () => {
    const { street_address, city, state, postal_code } = addressForm.value;
    if (!street_address.trim() || !city.trim() || !state.trim() || !postal_code.trim()) {
        toastStore.addToast('Please fill in all required address fields', 'error');
        return;
    }
    try {
        savingAddress.value = true;
        let response;
        if (editingAddress.value) {
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses/${editingAddress.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm.value)
            });
        } else {
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...addressForm.value,
                    user_id: user.value.id
                })
            });
        }
        const data = await response.json();
        if (response.ok) {
            toastStore.addToast(
                editingAddress.value ? 'Shipping address updated successfully!' : 'Shipping address added successfully!',
                'success'
            );
            closeAddressModal();
            await fetchUserAddresses();
        } else {
            toastStore.addToast(data.error || 'Failed to save shipping address', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Failed to save shipping address', 'error');
    } finally {
        savingAddress.value = false;
    }
};

const deleteAddress = async (id) => {
    if (!confirm('Are you absolutely sure you want to remove these shipping details?')) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok && data.success) {
            toastStore.addToast('Shipping details removed.', 'success');
            await fetchUserAddresses();
        } else {
            toastStore.addToast(data.error || 'Failed to remove shipping details', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Purging protocol interrupted', 'error');
    }
};

const setAddressAsDefault = async (addr) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses/${addr.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                street_address: addr.street_address,
                city: addr.city,
                state: addr.state,
                postal_code: addr.postal_code,
                landmark: addr.landmark || null,
                address_name: addr.address_name || null,
                is_default: true
            })
        });
        const data = await response.json();
        if (response.ok) {
            toastStore.addToast('Primary address updated!', 'success');
            await fetchUserAddresses();
        } else {
            toastStore.addToast(data.error || 'Failed to set primary address', 'error');
        }
    } catch (err) {
        console.error(err);
        toastStore.addToast('Failed to update primary address', 'error');
    }
};

// Active Tracking Helpers
const isStepActive = (status, step) => {
    const s = status.toLowerCase();
    if (step === 1) return true;
    if (step === 2) return ['processing', 'shipped', 'delivered'].includes(s);
    if (step === 3) return ['shipped', 'delivered'].includes(s);
    if (step === 4) return ['delivered'].includes(s);
    return false;
};

const getProgressWidth = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return '100%';
    if (s === 'shipped') return '66%';
    if (s === 'processing') return '33%';
    return '0%';
};


// Accordion past orders
const toggleOrderExpanded = (orderId) => {
    expandedOrders.value[orderId] = !expandedOrders.value[orderId];
};

const handleLogout = () => {
    authStore.logout();
    window.location.href = '/';
};
</script>

<template>
  <div class="min-h-screen pb-32 relative overflow-hidden bg-stella-black">
    <!-- Deep futuristic background mesh overlays -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#e6394605,transparent_40%),radial-gradient(circle_at_70%_80%,#e6394608,transparent_50%)] pointer-events-none"></div>

    <!-- Account Header -->
    <section class="relative h-[38vh] flex items-end pb-14 px-6 overflow-hidden border-b border-white/[0.04]">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/40 to-transparent z-10"></div>
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-[0.03] grayscale scale-110 blur-xs"></div>
      </div>
      
      <div class="max-w-7xl mx-auto w-full relative z-20 flex flex-col md:flex-row justify-between items-end gap-10">
        <div class="space-y-4">
            <div class="flex items-center space-x-3 mb-2 animate-fade-up">
                <span class="w-10 h-[1.5px] bg-gradient-to-r from-stella-red to-transparent"></span>
                <span class="text-stella-red/80 font-black text-[10px] uppercase tracking-[0.6em] text-glow-red">Secure User Space</span>
            </div>
            <h1 class="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white animate-fade-up" style="animation-delay: 0.1s">
              Welcome <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-stella-red/60">{{ user?.name || 'Guest' }}</span>
            </h1>
        </div>
        
        <div class="flex items-center space-x-4 animate-fade-up" style="animation-delay: 0.15s">
            <button @click="handleLogout" class="glass border-white/10 text-gray-300 hover:text-stella-red hover:border-stella-red/50 hover:bg-stella-red/5 hover:shadow-[0_0_20px_rgba(230,57,70,0.15)] px-10 py-5 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] transition-all duration-300 cursor-pointer active:scale-95">
                Logout
            </button>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-6 mt-16">
      <!-- Tab Navigation (Premium Adaptive Layout: Dropdown on Mobile, Horizontal on Desktop) -->
      <div class="w-full mb-12 md:mb-16 animate-fade-up relative z-[60]" style="animation-delay: 0.2s">
          
          <!-- Mobile Dropdown Selector -->
          <div class="md:hidden relative">
              <button @click="isMobileTabMenuOpen = !isMobileTabMenuOpen" 
                      class="w-full flex items-center justify-between p-5 bg-[#09090b]/90 backdrop-blur-3xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/80">
                  <div class="flex items-center gap-3">
                      <span class="font-black uppercase tracking-[0.2em] text-[11px] text-white">
                          {{ tabs.find(t => t.id === activeTab)?.label || 'Menu' }}
                      </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 transition-transform duration-300" :class="isMobileTabMenuOpen ? 'rotate-180 text-white' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
              </button>
              
              <!-- Dropdown Menu List -->
              <Transition name="fade">
                  <div v-if="isMobileTabMenuOpen" class="absolute top-full left-0 right-0 mt-3 p-2 bg-[#0c0c0f]/95 backdrop-blur-3xl border border-white/10 rounded-[1.25rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-1 overflow-hidden origin-top">
                      <button v-for="tab in tabs" :key="tab.id"
                              @click="activeTab = tab.id; isMobileTabMenuOpen = false"
                              class="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all"
                              :class="activeTab === tab.id ? 'bg-stella-red/10 border-stella-red/30' : 'hover:bg-white/[0.04]'">
                          <span class="font-black uppercase tracking-[0.2em] text-[10px]"
                                :class="activeTab === tab.id ? 'text-stella-red' : 'text-gray-400'">
                              {{ tab.label }}
                          </span>
                          <svg v-if="activeTab === tab.id" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-stella-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                      </button>
                  </div>
              </Transition>
          </div>

          <!-- Desktop Horizontal Selector -->
          <div class="hidden md:flex items-center space-x-1 p-2 bg-[#09090b]/80 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-2xl shadow-black/80 w-auto max-w-fit mx-auto">
              <button v-for="tab in tabs" :key="tab.id"
              @click="activeTab = tab.id"
              class="px-10 py-4.5 rounded-[1.15rem] font-black uppercase tracking-[0.25em] text-xs transition-all duration-400 cursor-pointer select-none active:scale-[0.98] text-center"
              :class="activeTab === tab.id 
                  ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)] scale-[1.03] font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'">
                  {{ tab.label }}
              </button>
          </div>
      </div>

      <!-- Main Workspace (Spans full width, centered grid layout) -->
      <div class="animate-fade-up" style="animation-delay: 0.25s">
        <main class="w-full min-w-0">
          
          <!-- TAB 1: PROFILE & SHIPPING BASES -->
          <div v-if="activeTab === 'profile'" class="space-y-16 animate-fade-in">
            <!-- Account Details Card -->
            <div class="space-y-8">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        Profile Details
                    </h2>
                </div>
                
                <div class="stella-card p-12 space-y-10 relative overflow-hidden border-white/[0.06] bg-stella-charcoal/40 backdrop-blur-2xl">
                    <div class="absolute top-0 right-0 w-96 h-96 bg-stella-red/5 rounded-full filter blur-[80px] pointer-events-none"></div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div class="space-y-3 relative group">
                            <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Name</label>
                            <input v-model="editName" class="w-full bg-stella-black/60 border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red/60 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.12)] outline-none text-xs font-bold uppercase tracking-widest transition-all duration-300" />
                        </div>
                        <div class="space-y-3 relative group">
                            <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Email Address</label>
                            <input v-model="editEmail" placeholder="ENTER EMAIL NODE" class="w-full bg-stella-black/60 border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red/60 focus:bg-stella-black/80 focus:shadow-[0_0_20px_rgba(230,57,70,0.12)] outline-none text-xs font-bold uppercase tracking-widest transition-all duration-300" />
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Verified Mobile Link</label>
                        <div class="flex flex-col md:flex-row gap-5">
                            <input :value="user?.phone" disabled class="flex-1 bg-stella-black/20 border border-white/5 text-gray-600 rounded-2xl py-5 px-8 outline-none text-xs font-bold uppercase tracking-widest cursor-not-allowed select-none" />
                            <button @click="openOtpModal" class="px-10 py-5 bg-stella-black border border-stella-gold/30 hover:border-stella-gold text-stella-gold hover:text-white hover:bg-stella-gold/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all duration-300 cursor-pointer active:scale-95">
                                Change the mobile number
                            </button>
                        </div>
                    </div>
                    
                    <div class="pt-6 border-t border-white/5 flex justify-end">
                        <button @click="saveProfile" :disabled="savingProfile" class="stella-button bg-gradient-to-r from-stella-red to-[#b91c1c] text-white px-16 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-stella-red/20 hover:shadow-stella-red/40 hover:scale-102 transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-95">
                            {{ savingProfile ? 'Saving Changes...' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Shipping Details CRUD Integrated directly under Profile -->
            <div class="space-y-8 pt-8">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-stella-gold animate-pulse"></span>
                        Shipping Details
                    </h2>
                    <button @click="openAddAddressModal" class="px-8 py-4 bg-stella-red hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-stella-red/25 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-103 active:scale-95">
                        <span>+ Add Shipping Details</span>
                    </button>
                </div>

                <div v-if="loadingAddresses" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div v-for="i in 2" :key="i" class="h-52 bg-stella-charcoal/80 border border-white/5 rounded-[2.5rem] animate-pulse"></div>
                </div>

                <div v-else-if="addresses.length === 0" class="stella-card p-20 text-center flex flex-col items-center border-dashed border-white/10 bg-stella-charcoal/20">
                    <div class="text-6xl mb-6 opacity-10">📍</div>
                    <h3 class="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Shipping Details Configured</h3>
                    <p class="text-[10px] text-gray-600 uppercase tracking-widest mt-2">Add your first shipping details to enable direct shipping</p>
                    <button @click="openAddAddressModal" class="mt-6 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Add Shipping Details</button>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div v-for="addr in addresses" :key="addr.id" class="stella-card p-10 flex flex-col justify-between border-white/[0.05] bg-stella-charcoal/50 backdrop-blur-2xl hover:border-white/15 hover:-translate-y-1.5 transition-all duration-500 relative group overflow-hidden"
                         :class="addr.is_default ? 'border-stella-gold/30 shadow-[0_10px_30px_rgba(245,158,11,0.05)]' : ''">
                        
                        <div class="space-y-5">
                            <div class="flex justify-between items-start">
                                <div class="space-y-1.5">
                                    <p v-if="addr.address_name" class="text-white font-black text-sm uppercase tracking-[0.2em]">{{ addr.address_name }}</p>
                                    <span v-if="addr.is_default" class="inline-flex px-4 py-1.5 bg-stella-gold/10 border border-stella-gold/30 rounded-full text-[8px] font-black text-stella-gold uppercase tracking-[0.3em]">
                                        Primary Address
                                    </span>
                                </div>
                                <button @click="deleteAddress(addr.id)" class="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-stella-red hover:border-stella-red/50 flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0">
                                    ✕
                                </button>
                            </div>

                            <div class="space-y-1.5">
                                <p class="text-white font-bold text-sm leading-relaxed">{{ addr.street_address }}</p>
                                <p v-if="addr.landmark" class="text-gray-400 text-[10px] font-semibold uppercase tracking-[0.2em]">Near: {{ addr.landmark }}</p>
                                <p class="text-gray-400 font-bold text-[10px] uppercase tracking-[0.25em]">
                                    {{ addr.city }}, {{ addr.state }} - {{ addr.postal_code }}
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-3 pt-6 mt-6 border-t border-white/5">
                            <button @click="openEditAddressModal(addr)" class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/[0.08] hover:border-white/20 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 cursor-pointer active:scale-95">
                                Edit Address
                            </button>
                            <button v-if="!addr.is_default" @click="setAddressAsDefault(addr)"
                                class="flex-1 py-4 bg-stella-gold/10 hover:bg-stella-gold/20 text-stella-gold border border-stella-gold/40 hover:border-stella-gold rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]">
                                <span>★</span> Mark as Primary
                            </button>
                            <div v-else class="flex-1 py-4 flex items-center justify-center gap-1.5 bg-stella-gold/5 border border-stella-gold/20 rounded-xl text-[9px] font-black text-stella-gold uppercase tracking-widest select-none">
                                <span>★</span> Primary
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <!-- TAB 2: TRACKING DETAILS -->
          <div v-if="activeTab === 'tracking'" class="space-y-10 animate-fade-in">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                    Tracking Details
                </h2>
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">{{ activeOrders.length }} active order{{ activeOrders.length !== 1 ? 's' : '' }}</span>
            </div>

            <!-- Empty state -->
            <div v-if="activeOrders.length === 0" class="stella-card p-24 text-center flex flex-col items-center bg-stella-charcoal/20 border-white/[0.04]">
                <h3 class="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Active Orders</h3>
                <p class="text-[10px] text-gray-600 mt-2 leading-relaxed">Your orders will appear here once placed</p>
                <button @click="$router.push('/products')" class="mt-8 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Browse Products</button>
            </div>

            <!-- Order tracking cards -->
            <div v-else class="space-y-8">
                <div v-for="order in activeOrders" :key="order.id"
                     class="stella-card border border-white/[0.06] bg-stella-charcoal/40 backdrop-blur-2xl overflow-hidden relative">

                    <!-- Ambient glow -->
                    <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                         :class="order.status === 'shipped' ? 'bg-blue-500/5 blur-[80px]' : order.status === 'processing' ? 'bg-stella-gold/5 blur-[80px]' : 'bg-stella-red/5 blur-[80px]'"></div>

                    <!-- ── Card Header: Order ID + Status badge + Amount ── -->
                    <div class="px-8 pt-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05]">
                        <div class="flex items-center gap-4">
                            <!-- Status colour bar -->
                            <div class="w-1 h-10 rounded-full flex-shrink-0"
                                 :class="order.status === 'shipped' ? 'bg-blue-400' : order.status === 'processing' ? 'bg-stella-gold' : 'bg-stella-red'"></div>
                            <div>
                                <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Order ID</p>
                                <h3 class="text-base font-black text-white tracking-widest">#{{ order.id }}</h3>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 flex-wrap">
                            <!-- Status pill -->
                            <span class="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border"
                                  :class="order.status === 'shipped'    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                          order.status === 'processing' ? 'bg-stella-gold/10 border-stella-gold/30 text-stella-gold' :
                                                                          'bg-stella-red/10 border-stella-red/30 text-stella-red'">
                                {{ order.status === 'pending' ? 'Order Placed' : order.status === 'processing' ? 'Packing' : 'Out for Delivery' }}
                            </span>
                            <!-- Amount -->
                            <div class="text-right">
                                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total</p>
                                <p class="text-lg font-black text-white">₹{{ Number(order.total_amount).toLocaleString('en-IN') }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- ── Progress Stepper ── -->
                    <div class="px-8 py-8">
                        <div class="relative">
                            <!-- Track line background -->
                            <div class="absolute top-5 left-5 right-5 h-[2px] bg-white/[0.06] z-0"></div>
                            <!-- Track line fill -->
                            <div class="absolute top-5 left-5 h-[2px] z-0 transition-all duration-1000 rounded-full"
                                 :class="order.status === 'shipped'    ? 'bg-gradient-to-r from-stella-red via-stella-red to-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]' :
                                         order.status === 'processing' ? 'bg-gradient-to-r from-stella-red to-stella-gold shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                                                                         'bg-stella-red shadow-[0_0_10px_rgba(230,57,70,0.3)]'"
                                 :style="{ width: getProgressWidth(order.status) }"></div>

                            <!-- Steps -->
                            <div class="relative z-10 flex justify-between">
                            <div v-for="(step, i) in [
                                    { label: 'Order Placed', desc: 'Confirmed' },
                                    { label: 'Packing',      desc: 'Being prepared' },
                                    { label: 'On the Way',   desc: 'In transit' },
                                    { label: 'Delivered',    desc: 'At your door' }
                                ]" :key="i" class="flex flex-col items-center gap-2 flex-1">
                                    <!-- Circle node -->
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-500"
                                         :class="isStepActive(order.status, i+1)
                                            ? (i === 3 ? 'bg-green-500 border-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.5)]'
                                                       : 'bg-stella-red border-stella-red text-white shadow-[0_0_16px_rgba(230,57,70,0.4)]')
                                            : 'bg-[#0e0e11] border-white/10 text-gray-600'">
                                        {{ isStepActive(order.status, i+1) ? '✓' : (i+1) }}
                                    </div>
                                    <!-- Label -->
                                    <div class="text-center hidden sm:block">
                                        <p class="text-[9px] font-black uppercase tracking-[0.2em]"
                                           :class="isStepActive(order.status, i+1) ? (i === 3 ? 'text-green-400' : 'text-white') : 'text-gray-600'">
                                            {{ step.label }}
                                        </p>
                                        <p class="text-[8px] text-gray-600 mt-0.5">{{ step.desc }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ── Bottom info: Products + Delivery ── -->
                    <div class="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-5">

                        <!-- Items -->
                        <div class="bg-black/30 rounded-2xl p-5 border border-white/[0.04] space-y-4">
                            <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Items in this order</p>
                            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                    <img :src="item.image_url" class="max-h-full max-w-full object-contain mix-blend-lighten" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-bold text-white truncate">{{ item.name }}</p>
                                    <p class="text-[10px] text-gray-500">Qty: {{ item.quantity }} &nbsp;·&nbsp; ₹{{ Number(item.price).toLocaleString('en-IN') }}</p>
                                </div>
                                <p class="text-xs font-black text-white flex-shrink-0">₹{{ Number(item.price * item.quantity).toLocaleString('en-IN') }}</p>
                            </div>
                        </div>

                        <!-- Delivery info -->
                        <div class="bg-black/30 rounded-2xl p-5 border border-white/[0.04] space-y-4">
                            <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Delivery Details</p>
                            <div class="space-y-3">
                                <div class="flex items-start gap-3">
                                    <div>
                                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                            {{ order.delivery_type === 'delivery' ? 'Shipping To' : 'Store Pickup' }}
                                        </p>
                                        <p class="text-xs font-semibold text-gray-200 leading-relaxed">
                                            {{ order.delivery_type === 'delivery'
                                                ? `${order.street_address}, ${order.city}, ${order.state} - ${order.postal_code}`
                                                : `${order.branch_name}` }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                    <div>
                                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Payment</p>
                                        <p class="text-xs font-semibold text-gray-200 capitalize">{{ order.payment_method?.replace(/_/g, ' ') }}</p>
                                    </div>
                                    <span class="ml-auto text-[9px] font-black px-3 py-1.5 rounded-full border"
                                          :class="order.payment_status === 'paid' ? 'text-green-400 bg-green-950/30 border-green-500/20' : 'text-stella-gold bg-stella-gold/10 border-stella-gold/20'">
                                        {{ order.payment_status }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                                    <div>
                                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Placed On</p>
                                        <p class="text-xs font-semibold text-gray-200">{{ new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                                    </div>
                                </div>
                                <!-- Expected Delivery — only shown if set by admin -->
                                <div v-if="order.expected_delivery_date" class="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.04] bg-white/[0.02] rounded-xl px-4 py-3">
                                    <div>
                                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Expected Delivery</p>
                                        <p class="text-sm font-black text-white">{{ new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                                    </div>
                                    <span class="text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest"
                                          :class="order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-stella-gold/10 text-stella-gold border border-stella-gold/20'">
                                        {{ order.status === 'shipped' ? 'On the way' : 'Estimated' }}
                                    </span>
                                </div>
                                <div class="pt-4 mt-2">
                                    <button @click.stop="downloadInvoice(order.id)" class="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl transition-all border border-white/5">
                                        <span class="text-sm">📄</span> Download Invoice
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
          </div>


          <!-- TAB 3: ORDER HISTORY ACCORDIONS -->
          <div v-if="activeTab === 'orders'" class="space-y-12 animate-fade-in">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        Order History
                    </h2>
                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Past Orders</span>
                </div>

                <div v-if="loadingOrders" class="space-y-6">
                    <div v-for="i in 3" :key="i" class="h-32 bg-stella-charcoal/80 border border-white/5 rounded-[2.5rem] animate-pulse"></div>
                </div>
                
                <div v-else-if="completedOrders.length === 0" class="stella-card p-24 text-center flex flex-col items-center bg-stella-charcoal/20 border-white/[0.04]">
                    <div class="text-5xl mb-6 opacity-20">📦</div>
                    <h3 class="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No Past Orders Found</h3>
                    <p class="text-[10px] text-gray-600 mt-2 leading-relaxed">Your completed or cancelled orders will appear here</p>
                    <button @click="$router.push('/products')" class="mt-8 text-stella-red font-black uppercase tracking-[0.3em] text-[10px] border-b border-stella-red/20 pb-1 hover:border-stella-red transition-all cursor-pointer">Browse Products</button>
                </div>
                
                <div v-else class="space-y-6">
                    <div v-for="order in completedOrders" :key="order.id" class="stella-card overflow-hidden border border-white/[0.05] bg-stella-charcoal/40 backdrop-blur-2xl transition-all duration-300">
                        
                        <!-- Accordion Trigger Header (Rich Interactive State) -->
                        <div @click="toggleOrderExpanded(order.id)" class="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center group cursor-pointer hover:bg-white/[0.02] transition-all duration-300 select-none">
                            <div class="flex items-center gap-6 w-full md:w-auto mb-6 md:mb-0">
                                <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-105 group-hover:border-stella-gold/30 flex-shrink-0">
                                    {{ order.status === 'delivered' ? '📦' : '❌' }}
                                </div>
                                <div>
                                    <div class="flex items-center gap-3 mb-1.5">
                                        <h3 class="text-white font-black uppercase tracking-widest text-sm">Order #{{ order.id }}</h3>
                                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border" 
                                              :class="order.status === 'delivered' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-stella-red/30 text-stella-red bg-stella-red/10'">
                                            {{ order.status }}
                                        </span>
                                    </div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {{ new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }} • {{ order.items?.length || 0 }} Item{{ order.items?.length !== 1 ? 's' : '' }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between w-full md:w-auto gap-8">
                                <div class="text-right">
                                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                    <p class="text-xl font-black text-white tracking-tighter">₹{{ Number(order.total_amount).toLocaleString('en-IN') }}</p>
                                </div>
                                <button class="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20"
                                        :class="expandedOrders[order.id] ? 'rotate-180 bg-white/10' : ''">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Expandable Content Panel (Visually Premium Details Grid) -->
                        <div v-if="expandedOrders[order.id]" class="p-8 md:p-10 bg-black/40 border-t border-white/[0.04] space-y-8 animate-fade-in">
                            <!-- Product grid list -->
                            <div class="space-y-4">
                                <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Items in Order</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.03] hover:border-white/10 transition-colors">
                                        <div class="w-16 h-16 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center p-2 flex-shrink-0">
                                            <img :src="item.image_url" class="max-h-full max-w-full object-contain mix-blend-lighten" />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h5 class="text-white font-bold text-xs truncate mb-1">{{ item.name }}</h5>
                                            <p class="text-[10px] text-gray-500 font-bold">Qty: {{ item.quantity }} &nbsp;·&nbsp; ₹{{ Number(item.price).toLocaleString('en-IN') }}</p>
                                        </div>
                                        <div class="text-sm font-black text-white flex-shrink-0">
                                            ₹{{ Number(item.price * item.quantity).toLocaleString('en-IN') }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Logistics details -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <!-- Delivery Details -->
                                <div class="space-y-3 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.03]">
                                    <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Delivery Information</h4>
                                    <div class="flex items-start gap-3">
                                        <div>
                                            <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                                {{ order.delivery_type === 'delivery' ? 'Shipping Address' : 'Store Pickup' }}
                                            </p>
                                            <p class="text-xs font-semibold text-gray-200 leading-relaxed">
                                                {{ order.delivery_type === 'delivery'
                                                    ? `${order.street_address}, ${order.city}, ${order.state} - ${order.postal_code}`
                                                    : `${order.branch_name}` }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Details -->
                                <div class="space-y-3 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.03]">
                                    <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Payment Information</h4>
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Method</p>
                                            <p class="text-xs font-semibold text-gray-200 capitalize">{{ order.payment_method?.replace(/_/g, ' ') }}</p>
                                        </div>
                                        <div class="flex flex-col items-end">
                                            <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                            <span class="font-black px-3 py-1 rounded-full text-[9px] border" 
                                                  :class="order.payment_status === 'paid' ? 'text-green-400 bg-green-950/30 border-green-500/20' : 'text-stella-red bg-stella-red/10 border-stella-red/20'">
                                                {{ order.payment_status }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-span-1 md:col-span-2 mt-2">
                                    <button @click.stop="downloadInvoice(order.id)" class="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all border border-white/5">
                                        <span class="text-sm">📄</span> Download Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
          </div>
        </main>
      </div>
    </div>

    <!-- OTP SECURE LINK VERIFICATION MODAL (Vibrant Dark Glassmorphism) -->
    <div v-if="showOtpModal" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" @click.self="closeOtpModal">
        <div class="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 p-10 rounded-[2.5rem] space-y-8 animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button @click="closeOtpModal" class="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            
            <div class="space-y-3">
                <div class="flex items-center space-x-2">
                    <span class="w-6 h-[1.5px] bg-stella-gold"></span>
                    <h3 class="text-stella-gold font-black uppercase tracking-widest text-[9px]">Telecom Relay Protocol</h3>
                </div>
                <h2 class="text-2xl font-black uppercase tracking-tight text-white">Secure Mobile Sync</h2>
                <p class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-relaxed">
                    Updates the primary verification node associated with this portal credentials sync.
                </p>
            </div>

            <!-- STEP 1: Phone input -->
            <div v-if="otpStep === 1" class="space-y-6">
                <div class="space-y-3">
                    <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">New Mobile Synchronization Number</label>
                    <input v-model="newPhone" placeholder="+91 XXXXX XXXXX" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red outline-none text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 focus:shadow-[0_0_15px_rgba(230,57,70,0.1)]" />
                </div>
                <button @click="handleSendOtp" :disabled="sendingOtp" class="w-full py-5 bg-stella-red hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 shadow-lg shadow-stella-red/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95">
                    {{ sendingOtp ? 'TRANSMITTING OTP PROTOCOL...' : 'TRANSMIT OTP SECURE KEY' }}
                </button>
            </div>

            <!-- STEP 2: OTP verify input -->
            <div v-if="otpStep === 2" class="space-y-6">
                <div class="space-y-3">
                    <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Enter Secure OTP (MOCK: 123456)</label>
                    <input v-model="otpCode" placeholder="ENTER 6-DIGIT VERIFICATION KEY" maxlength="6" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-5 px-8 focus:border-stella-red outline-none text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 focus:shadow-[0_0_15px_rgba(230,57,70,0.15)]" />
                </div>
                <div class="flex gap-4">
                    <button @click="otpStep = 1" class="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all cursor-pointer">
                        Back
                    </button>
                    <button @click="handleVerifyOtp" :disabled="verifyingOtp" class="flex-[2] py-5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl transition-all shadow-lg shadow-green-500/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95">
                        {{ verifyingOtp ? 'SYNCHRONIZING System...' : 'VERIFY & FINALIZE SYNC' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ADDRESS MODAL (ADD/EDIT) -->
    <div v-if="showAddressModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" @click.self="closeAddressModal">
        <div class="relative w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-[2.5rem] animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <!-- Modal scroll wrapper -->
            <div class="overflow-y-auto max-h-[90vh] p-10 space-y-7">
                <button @click="closeAddressModal" class="absolute top-7 right-7 w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer">✕</button>

                <!-- Modal Header -->
                <div class="space-y-2 pr-10">
                    <h2 class="text-2xl font-black uppercase tracking-tight text-white">
                        {{ editingAddress ? 'Modify Shipping Address' : 'Add Shipping Address' }}
                    </h2>
                </div>

                <!-- Form Fields -->
                <div class="space-y-5">

                    <!-- Recipient Full Name -->
                    <div class="space-y-2">
                        <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Full Name *</label>
                        <input v-model="addressForm.address_name" placeholder="Recipient's full name" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                    </div>

                    <!-- Street Address -->
                    <div class="space-y-2">
                        <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Street Address *</label>
                        <input v-model="addressForm.street_address" placeholder="House / Flat No., Building, Street Name" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                    </div>

                    <!-- Landmark -->
                    <div class="space-y-2">
                        <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Landmark</label>
                        <input v-model="addressForm.landmark" placeholder="Near a school, mall, hospital, etc." class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                    </div>

                    <!-- City + State -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">City *</label>
                            <input v-model="addressForm.city" placeholder="City" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                        </div>
                        <div class="space-y-2">
                            <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">State *</label>
                            <input v-model="addressForm.state" placeholder="State" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                        </div>
                    </div>

                    <!-- Postal Code -->
                    <div class="space-y-2">
                        <label class="block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Postal Code *</label>
                        <input v-model="addressForm.postal_code" placeholder="6-digit postal code" class="w-full bg-stella-black border border-white/10 text-white rounded-2xl py-4 px-6 focus:border-stella-red outline-none text-sm font-semibold transition-all focus:shadow-[0_0_15px_rgba(230,57,70,0.1)] placeholder:text-gray-600" />
                    </div>

                    <!-- Primary Address Checkbox -->
                    <div class="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 cursor-pointer group" @click="addressForm.is_default = !addressForm.is_default">
                        <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                             :class="addressForm.is_default ? 'bg-stella-red border-stella-red' : 'border-white/20 bg-transparent'">
                            <span v-if="addressForm.is_default" class="text-white text-[10px] font-black">✓</span>
                        </div>
                        <label class="text-xs font-semibold text-gray-300 cursor-pointer select-none group-hover:text-white transition-colors">
                            Mark as Primary Address
                        </label>
                    </div>

                    <!-- Save Button -->
                    <button @click="saveAddress" :disabled="savingAddress" class="w-full py-5 bg-stella-red hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 shadow-lg shadow-stella-red/25 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95 mt-2">
                        {{ savingAddress ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-up {
  animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hover\:scale-102:hover {
  transform: scale(1.02);
}

.hover\:scale-103:hover {
  transform: scale(1.03);
}

.text-glow-red {
  text-shadow: 0 0 15px rgba(230, 57, 70, 0.35);
}
</style>
