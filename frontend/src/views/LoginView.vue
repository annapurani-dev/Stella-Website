<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const phone = ref('');
const otp = ref('');
const name = ref('');
const acceptedTerms = ref(false);
const step = ref(1); // 1: Phone, 2: OTP

const handleSendOTP = async () => {
    if (!phone.value || phone.value.length < 10) return toastStore.addToast('Enter a valid phone number', 'error');
    if (!acceptedTerms.value) return toastStore.addToast('Please accept the Terms & Conditions', 'error');
    
    try {
        await authStore.sendOTP(phone.value);
        step.value = 2;
        toastStore.addToast('OTP sent successfully', 'success');
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    }
};

const handleLogin = async () => {
    if (!otp.value || otp.value.length < 4) return toastStore.addToast('Enter a valid OTP', 'error');
    
    try {
        await authStore.verifyOTP(otp.value, name.value);
        router.push('/account');
        toastStore.addToast('Login successful', 'success');
    } catch (err) {
        toastStore.addToast(err.message, 'error');
    }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-stella-black relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-stella-red/5 rounded-full blur-[100px]"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-stella-gold/5 rounded-full blur-[100px]"></div>

    <div class="w-full max-w-md bg-stella-charcoal border border-gray-800 rounded-2xl p-10 shadow-2xl relative z-10">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-black uppercase tracking-widest text-white mb-2">Stella <span class="text-stella-red">Mobiles</span></h1>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">{{ step === 1 ? 'Customer Login' : 'Verify Identity' }}</p>
      </div>

      <!-- Step 1: Phone Input -->
      <div v-if="step === 1" class="space-y-6 animate-fade-in">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Mobile Number</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">+91</span>
            <input 
                type="tel" 
                v-model="phone" 
                placeholder="98765 43210" 
                class="w-full bg-stella-black border border-gray-700 text-white rounded-lg py-4 pl-14 pr-4 focus:outline-none focus:border-stella-red transition-all font-mono tracking-widest" 
            />
          </div>
        </div>

        <div class="flex items-start space-x-3 group cursor-pointer" @click="acceptedTerms = !acceptedTerms">
          <div class="mt-0.5 w-5 h-5 border rounded flex items-center justify-center transition-colors shrink-0" :class="acceptedTerms ? 'bg-stella-red border-stella-red' : 'border-gray-700 group-hover:border-gray-500'">
            <svg v-if="acceptedTerms" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p class="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
            I agree to the <span class="text-stella-gold border-b border-stella-gold/30">Terms & Conditions</span> and allow Stella Mobiles to access my contact details for order processing.
          </p>
        </div>

        <button 
            @click="handleSendOTP" 
            :disabled="authStore.loading"
            class="w-full bg-stella-red text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-stella-red/20 active:scale-[0.98] disabled:opacity-50"
        >
          {{ authStore.loading ? 'Sending...' : 'Send Verification OTP' }}
        </button>
      </div>

      <!-- Step 2: OTP Input -->
      <div v-else class="space-y-6 animate-fade-in">
        <p class="text-[10px] text-center text-gray-400 uppercase tracking-widest mb-8">OTP sent to <span class="text-white font-bold">{{ phone }}</span></p>
        
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Verification Code</label>
          <input 
            type="text" 
            v-model="otp" 
            placeholder="0 0 0 0" 
            maxlength="6"
            class="w-full bg-stella-black border border-gray-700 text-white text-center rounded-lg py-5 text-2xl focus:outline-none focus:border-stella-red transition-all font-black tracking-[0.5em]" 
          />
        </div>

        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Full Name (Optional)</label>
            <input 
              type="text" 
              v-model="name" 
              placeholder="Your Name" 
              class="w-full bg-stella-black border border-gray-700 text-white rounded-lg py-4 px-4 focus:outline-none focus:border-stella-red transition-all text-sm font-bold tracking-wide" 
            />
          </div>

        <button 
            @click="handleLogin" 
            :disabled="authStore.loading"
            class="w-full bg-stella-red text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-stella-red/20 active:scale-[0.98] disabled:opacity-50"
        >
          {{ authStore.loading ? 'Verifying...' : 'Verify & Log In' }}
        </button>

        <button @click="step = 1" class="w-full text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors">
          Change Phone Number
        </button>
      </div>

      <div class="mt-12 text-center border-t border-gray-800 pt-8">
        <p class="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Secure SSL Encrypted Access</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
