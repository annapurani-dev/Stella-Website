<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();
const cartStore = useCartStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const { items: cartItems, totalPrice: subtotal } = storeToRefs(cartStore);
const { user, isAuthenticated } = storeToRefs(authStore);

const shippingMethod = ref('delivery'); // 'delivery' or 'pickup'
const paymentMethod = ref('online'); // 'online', 'cod', 'store'
const isSubmitting = ref(false);

const addresses = ref([]);
const branches = ref([]);
const selectedAddressId = ref(null);
const selectedBranchId = ref(null);

const isAddressDropdownOpen = ref(false);
const isBranchDropdownOpen = ref(false);
const isPaymentDropdownOpen = ref(false);
const showRazorpayModal = ref(false);

const showAddAddressForm = ref(false);
const newAddress = ref({
  street_address: '',
  city: '',
  state: '',
  postal_code: '',
  address_name: 'Home'
});

const loadData = async () => {
    try {
        const userId = (isAuthenticated.value && user.value?.id) ? user.value.id : 1;
        const addrRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses/user/${userId}`);
        if (addrRes.ok) {
            addresses.value = await addrRes.json();
            if (addresses.value.length > 0) {
                selectedAddressId.value = addresses.value.find(a => a.is_default)?.id || addresses.value[0].id;
            }
        }
        
        const branchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/branches`);
        if (branchRes.ok) {
            branches.value = await branchRes.json();
            if (branches.value.length > 0) {
                selectedBranchId.value = branches.value[0].id;
            }
        }
    } catch (err) {
        console.error('Error loading checkout data', err);
    }
};

onMounted(() => {
    loadData();
});

const saveNewAddress = async () => {
    try {
        const userId = (isAuthenticated.value && user.value?.id) ? user.value.id : 1;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                ...newAddress.value,
                is_default: addresses.value.length === 0
            })
        });
        if (res.ok) {
            const added = await res.json();
            addresses.value.push(added);
            selectedAddressId.value = added.id;
            showAddAddressForm.value = false;
            toastStore.addToast('Address added', 'success');
            newAddress.value = { street_address: '', city: '', state: '', postal_code: '', address_name: 'Home' };
        } else {
            const err = await res.json();
            toastStore.addToast(err.error || 'Failed to add address', 'error');
        }
    } catch (err) {
        toastStore.addToast('Error saving address', 'error');
    }
};

const shipping = computed(() => 0); 
const total = computed(() => subtotal.value + shipping.value);

const initiateOrder = () => {
  if (cartItems.value.length === 0) return toastStore.addToast('Cart is empty', 'error');
  
  if (shippingMethod.value === 'delivery' && !selectedAddressId.value) {
      return toastStore.addToast('Please select a delivery address', 'error');
  }
  if (shippingMethod.value === 'pickup' && !selectedBranchId.value) {
      return toastStore.addToast('Please select a pickup store', 'error');
  }
  
  if (paymentMethod.value === 'online') {
      showRazorpayModal.value = true;
  } else {
      finalizeOrder();
  }
};

const finalizeOrder = async (razorpayPaymentId = null) => {
  try {
    showRazorpayModal.value = false;
    isSubmitting.value = true;
    
    const userId = (isAuthenticated.value && user.value?.id) ? user.value.id : 1;
    const orderData = {
      user_id: userId,
      items: cartItems.value.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: total.value,
      delivery_type: shippingMethod.value,
      address_id: shippingMethod.value === 'delivery' ? selectedAddressId.value : null,
      branch_id: shippingMethod.value === 'pickup' ? selectedBranchId.value : null,
      payment_method: paymentMethod.value,
      razorpay_payment_id: razorpayPaymentId
    };

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) throw new Error('Failed to place order');
    
    const result = await response.json();
    cartStore.clearCart();
    toastStore.addToast('Order placed successfully!', 'success');
    router.push({ path: '/account', query: { tab: 'tracking' } });
  } catch (err) {
    console.error('Order error:', err);
    toastStore.addToast('There was an error placing your order. Please try again.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleRazorpaySuccess = () => {
    finalizeOrder('pay_dummy_' + Math.random().toString(36).substr(2, 9));
};

const handleRazorpayCancel = () => {
    showRazorpayModal.value = false;
    toastStore.addToast('Payment cancelled', 'error');
};
</script>

<template>
  <div class="min-h-screen pb-32">
    <!-- Header Section -->
    <section class="relative h-[30vh] flex items-end pb-12 px-6 overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-t from-stella-black to-transparent z-10"></div>
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
      </div>
      
      <div class="max-w-7xl mx-auto w-full relative z-20">
        <h1 class="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 animate-fade-up">
          Checkout.
        </h1>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col lg:flex-row gap-16">
        <!-- Left: Form Area -->
        <div class="flex-1 space-y-16">
          
          <!-- Step 1: Logistics / Pickup -->
          <section class="relative z-50 animate-fade-up" style="animation-delay: 0.2s">
            <div class="flex items-center space-x-4 mb-6">
                <h2 class="text-xl font-black uppercase tracking-widest text-white">Delivery Method</h2>
            </div>
            
            <div class="flex space-x-4">
              <div @click="shippingMethod = 'delivery'" 
                   class="stella-card px-6 py-5 cursor-pointer flex-1 flex items-center justify-center space-x-4 transition-all duration-300 rounded-2xl border"
                   :class="shippingMethod === 'delivery' ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'">
                  <div class="text-2xl transition-transform" :class="{'scale-110': shippingMethod === 'delivery'}">🚚</div>
                  <h3 class="font-black uppercase tracking-widest text-xs transition-colors" :class="shippingMethod === 'delivery' ? 'text-white' : 'text-gray-400'">Home delivery</h3>
              </div>

              <div @click="shippingMethod = 'pickup'" 
                   class="stella-card px-6 py-5 cursor-pointer flex-1 flex items-center justify-center space-x-4 transition-all duration-300 rounded-2xl border"
                   :class="shippingMethod === 'pickup' ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'">
                  <div class="text-2xl transition-transform" :class="{'scale-110': shippingMethod === 'pickup'}">🏪</div>
                  <h3 class="font-black uppercase tracking-widest text-xs transition-colors" :class="shippingMethod === 'pickup' ? 'text-white' : 'text-gray-400'">Shop pickup</h3>
              </div>
            </div>
          </section>

          <!-- Step 2: Protocol (Address or Hub) -->
          <section v-if="shippingMethod === 'delivery'" class="relative z-40 animate-fade-up" style="animation-delay: 0.3s">
            <div class="flex items-center justify-between mb-6 mt-10">
                <h2 class="text-xl font-black uppercase tracking-widest text-white">Select Delivery Address</h2>
                <button @click="showAddAddressForm = !showAddAddressForm" class="flex items-center space-x-2 text-stella-gold hover:text-white transition-colors">
                    <span class="text-[10px] font-black uppercase tracking-widest">+ New Address</span>
                </button>
            </div>
            
            <div v-if="showAddAddressForm" class="stella-card p-6 mb-6 border border-stella-gold/20 animate-fade-in">
                <h3 class="text-white font-black uppercase tracking-widest text-sm mb-6">Add New Address</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input v-model="newAddress.address_name" placeholder="Name (e.g. Home, Work)" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs" />
                    <input v-model="newAddress.street_address" placeholder="Street Address" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs" />
                    <input v-model="newAddress.city" placeholder="City" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs" />
                    <input v-model="newAddress.state" placeholder="State" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs" />
                    <input v-model="newAddress.postal_code" placeholder="Postal Code" class="w-full bg-stella-black border border-white/5 text-white rounded-xl py-3 px-6 text-xs" />
                </div>
                <div class="mt-6 flex justify-end space-x-4">
                    <button @click="showAddAddressForm = false" class="text-xs text-gray-500 hover:text-white font-black uppercase tracking-widest">Cancel</button>
                    <button @click="saveNewAddress" class="bg-stella-red text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-red-700 transition-colors">Save Address</button>
                </div>
            </div>

            <div v-if="addresses.length > 0" class="relative z-50">
                <!-- Custom Address Dropdown Trigger -->
                <div @click="isAddressDropdownOpen = !isAddressDropdownOpen" 
                     class="w-full bg-stella-black border border-white/10 text-white rounded-xl py-4 px-6 flex justify-between items-center cursor-pointer hover:border-stella-red/50 transition-colors"
                     :class="{'border-stella-red': isAddressDropdownOpen}">
                    <span class="text-xs font-bold uppercase tracking-widest truncate">
                        <template v-if="selectedAddressId">
                            {{ addresses.find(a => a.id === selectedAddressId)?.address_name || 'Address' }} - 
                            {{ addresses.find(a => a.id === selectedAddressId)?.street_address }}, 
                            {{ addresses.find(a => a.id === selectedAddressId)?.city }}
                        </template>
                        <template v-else>Select Address</template>
                    </span>
                    <span class="text-stella-gold transition-transform duration-300" :class="{'rotate-180': isAddressDropdownOpen}">▼</span>
                </div>
                
                <!-- Custom Address Dropdown Menu -->
                <div v-if="isAddressDropdownOpen" 
                     class="absolute z-50 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                    <div v-for="addr in addresses" :key="addr.id" 
                         @click="selectedAddressId = addr.id; isAddressDropdownOpen = false"
                         class="px-6 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                         :class="{'bg-stella-red/10 border-l-2 border-l-stella-red': selectedAddressId === addr.id}">
                        <div class="text-xs font-bold uppercase tracking-widest text-white mb-1">{{ addr.address_name || 'Address' }}</div>
                        <div class="text-[10px] text-gray-500 tracking-wider">{{ addr.street_address }}, {{ addr.city }} {{ addr.postal_code }}</div>
                    </div>
                </div>
            </div>
            <div v-else-if="!showAddAddressForm" class="text-center py-6">
                <p class="text-gray-500 text-sm font-medium">No saved addresses found. Please add a new address.</p>
            </div>
          </section>

          <section v-if="shippingMethod === 'pickup'" class="relative z-40 animate-fade-up" style="animation-delay: 0.3s">
            <div class="flex items-center space-x-4 mb-6 mt-10">
                <h2 class="text-xl font-black uppercase tracking-widest text-white">Select Hub Location</h2>
            </div>
            
            <div v-if="branches.length > 0" class="relative z-50">
                <!-- Custom Branch Dropdown Trigger -->
                <div @click="isBranchDropdownOpen = !isBranchDropdownOpen" 
                     class="w-full bg-stella-black border border-white/10 text-white rounded-xl py-4 px-6 flex justify-between items-center cursor-pointer hover:border-stella-red/50 transition-colors"
                     :class="{'border-stella-red': isBranchDropdownOpen}">
                    <span class="text-xs font-bold uppercase tracking-widest truncate">
                        <template v-if="selectedBranchId">
                            {{ branches.find(b => b.id === selectedBranchId)?.name }}
                        </template>
                        <template v-else>Select Hub</template>
                    </span>
                    <span class="text-stella-gold transition-transform duration-300" :class="{'rotate-180': isBranchDropdownOpen}">▼</span>
                </div>
                
                <!-- Custom Branch Dropdown Menu -->
                <div v-if="isBranchDropdownOpen" 
                     class="absolute z-50 w-full mt-2 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                    <div v-for="branch in branches" :key="branch.id" 
                         @click="selectedBranchId = branch.id; isBranchDropdownOpen = false"
                         class="px-6 py-4 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                         :class="{'bg-stella-red/10 border-l-2 border-l-stella-red': selectedBranchId === branch.id}">
                        <div class="text-xs font-bold uppercase tracking-widest text-white mb-1">{{ branch.name }}</div>
                        <div class="text-[10px] text-gray-500 tracking-wider">{{ branch.address }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-6">
                <p class="text-gray-500 text-sm font-medium">No branches available.</p>
            </div>
          </section>

          <!-- Step 3: Payment Gateway -->
          <section class="relative z-30 animate-fade-up" style="animation-delay: 0.4s">
            <div class="flex items-center space-x-4 mb-6 mt-10">
                <h2 class="text-xl font-black uppercase tracking-widest text-white">Payment Method</h2>
            </div>
            
            <div class="flex flex-col md:flex-row gap-4">
                <label class="stella-card px-6 py-4 flex-1 cursor-pointer flex items-center justify-between transition-all duration-300 rounded-2xl border"
                       :class="paymentMethod === 'online' ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'">
                    <h3 class="font-black uppercase tracking-widest text-xs transition-colors" :class="paymentMethod === 'online' ? 'text-white' : 'text-gray-400'">Online Payment</h3>
                    <div class="w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors"
                         :class="paymentMethod === 'online' ? 'border-stella-red bg-stella-red' : 'border-white/20'">
                        <div v-if="paymentMethod === 'online'" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <input type="radio" value="online" v-model="paymentMethod" class="hidden" />
                </label>

                <label class="stella-card px-6 py-4 flex-1 cursor-pointer flex items-center justify-between transition-all duration-300 rounded-2xl border"
                       :class="paymentMethod === 'cod' ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'">
                    <h3 class="font-black uppercase tracking-widest text-xs transition-colors" :class="paymentMethod === 'cod' ? 'text-white' : 'text-gray-400'">Cash on Delivery</h3>
                    <div class="w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors"
                         :class="paymentMethod === 'cod' ? 'border-stella-red bg-stella-red' : 'border-white/20'">
                        <div v-if="paymentMethod === 'cod'" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <input type="radio" value="cod" v-model="paymentMethod" class="hidden" />
                </label>

                <label class="stella-card px-6 py-4 flex-1 cursor-pointer flex items-center justify-between transition-all duration-300 rounded-2xl border"
                       :class="paymentMethod === 'store' ? 'bg-stella-red/10 border-stella-red shadow-[0_0_20px_rgba(229,9,20,0.2)]' : 'bg-stella-black/50 border-white/5 hover:border-white/20'">
                    <h3 class="font-black uppercase tracking-widest text-xs transition-colors" :class="paymentMethod === 'store' ? 'text-white' : 'text-gray-400'">Pay In Store</h3>
                    <div class="w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors"
                         :class="paymentMethod === 'store' ? 'border-stella-red bg-stella-red' : 'border-white/20'">
                        <div v-if="paymentMethod === 'store'" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <input type="radio" value="store" v-model="paymentMethod" class="hidden" />
                </label>
            </div>
          </section>
        </div>

        <!-- Right: Transaction Summary -->
        <div class="lg:w-[450px]">
            <div class="stella-card p-12 sticky top-32 animate-fade-up shadow-3xl shadow-black/50" style="animation-delay: 0.5s">
                <h2 class="text-3xl font-black uppercase tracking-tighter text-white mb-10">Purchase Summary</h2>
                
                <div class="space-y-8 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    <div v-for="item in cartItems" :key="item.id" class="flex items-center justify-between group pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-stella-black rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img :src="item.img" class="w-full h-full object-contain p-2 mix-blend-lighten" />
                            </div>
                            <div class="flex flex-col space-y-1">
                                <h4 class="text-white font-black uppercase tracking-widest text-sm group-hover:text-stella-red transition-colors">{{ item.name }}</h4>
                                <p class="text-xs text-gray-500 font-black uppercase tracking-[0.2em]">QTY: {{ item.quantity }}</p>
                            </div>
                        </div>
                        <span class="text-white font-black tracking-widest text-sm whitespace-nowrap">RS {{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                </div>

                <div class="space-y-6 pt-6 mb-12">
                    <div class="flex justify-between items-center">
                        <span class="text-white font-black uppercase tracking-widest text-lg">Total Cost</span>
                        <span class="text-white font-black text-2xl tracking-tighter">RS {{ total.toFixed(2) }}</span>
                    </div>
                </div>

                <button @click="initiateOrder" :disabled="isSubmitting" class="stella-button w-full bg-stella-red text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-stella-red/30 hover:bg-red-700 disabled:opacity-50 group">
                    <span class="relative z-10">{{ isSubmitting ? 'Synchronizing...' : 'Proceed to Order' }}</span>
                    <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- Dummy Razorpay Modal -->
    <div v-if="showRazorpayModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="handleRazorpayCancel"></div>
      <div class="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in flex flex-col items-center p-8">
          <div class="w-full flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-[#02042B] rounded-sm flex items-center justify-center">
                      <span class="text-white font-bold text-xs">R</span>
                  </div>
                  <span class="text-[#02042B] font-bold text-lg tracking-tight">Razorpay</span>
                  <span class="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Test Mode</span>
              </div>
              <button @click="handleRazorpayCancel" class="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
          </div>
          
          <div class="w-20 h-20 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border border-gray-200">
              <span class="text-2xl">📱</span>
          </div>
          
          <h3 class="text-gray-800 font-bold text-xl mb-1">Stella Mobiles</h3>
          <p class="text-gray-500 text-sm mb-8 font-medium">Order Payment</p>
          
          <div class="w-full flex justify-between items-center border-t border-b border-gray-100 py-4 mb-8">
              <span class="text-gray-500 text-sm font-medium">Amount to Pay</span>
              <span class="text-[#02042B] font-bold text-2xl">₹ {{ total.toFixed(2) }}</span>
          </div>
          
          <div class="w-full space-y-3">
              <button @click="handleRazorpaySuccess" class="w-full bg-[#3399CC] hover:bg-[#2b88b7] text-white py-4 rounded-md font-bold text-sm transition-colors flex items-center justify-center space-x-2">
                  <span>Pay Now</span>
              </button>
              <button @click="handleRazorpayCancel" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-md font-bold text-sm transition-colors">
                  Cancel Payment
              </button>
          </div>
          
          <p class="text-[10px] text-gray-400 mt-6 flex items-center">
             <span class="mr-1">🔒</span> Secured by Razorpay
          </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-stella-gray);
  border-radius: 10px;
}
</style>
