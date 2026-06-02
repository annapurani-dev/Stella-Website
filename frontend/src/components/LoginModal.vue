<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const emit = defineEmits(['close']);

const phoneNumber = ref('');
const otp = ref('');
const step = ref(1); // 1 for Phone Input, 2 for OTP Input
const agreed = ref(false);

const requestOTP = async () => {
  if (phoneNumber.value && agreed.value) {
    try {
        await authStore.sendOTP(phoneNumber.value);
        step.value = 2;
    } catch (err) {
        alert(err.message);
    }
  }
};

const verifyOTP = async () => {
  if (otp.value.length === 6) {
    try {
        await authStore.verifyOTP(otp.value);
        emit('close');
        if (authStore.isAdmin) {
            router.push('/admin/dashboard');
        } else {
            router.push('/account');
        }
    } catch (err) {
        alert(err.message);
    }
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <!-- Modal Container -->
    <div class="bg-stella-charcoal border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative shadow-black animate-fade-in-up">
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-stella-black w-8 h-8 rounded-full flex items-center justify-center border border-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div class="p-8">
        <!-- Logo & Header -->
        <div class="text-center mb-8 border-b border-gray-800 pb-6">
          <div class="flex flex-col items-center justify-center mb-4">
            <img src="/logo2.jpeg" alt="Stella" class="h-10 object-contain mix-blend-screen" style="filter: brightness(1.2) contrast(1.1);" />
            <span class="text-stella-gold font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-2">Mobiles</span>
          </div>
          <h2 class="text-xl font-bold text-white mb-2 tracking-wide">Welcome Back</h2>
          <p class="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">Sign in to your account to view orders, track shipments, and access fast checkout.</p>
        </div>

        <!-- Step 1: Phone Number -->
        <div v-if="step === 1" class="space-y-6">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
            <div class="flex">
              <span class="bg-stella-black border border-gray-700 border-r-0 text-gray-400 rounded-l-md px-4 py-3 flex items-center font-bold">+91</span>
              <input type="tel" v-model="phoneNumber" placeholder="Enter 10-digit number" class="w-full bg-stella-charcoal border border-gray-700 text-white rounded-r-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner" maxlength="10" />
            </div>
          </div>

          <label class="flex items-start cursor-pointer group">
            <div class="relative flex items-center mt-0.5">
              <input type="checkbox" v-model="agreed" class="peer sr-only" />
              <div class="w-5 h-5 border border-gray-600 rounded bg-stella-black peer-checked:bg-stella-red peer-checked:border-stella-red transition-colors flex items-center justify-center">
                <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <span class="ml-3 text-[11px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              I agree to the <a href="#" class="text-stella-red hover:underline">Terms & Conditions</a> and <a href="#" class="text-stella-red hover:underline">Privacy Policy</a> of Stella Mobiles.
            </span>
          </label>

          <button @click="requestOTP" :disabled="!phoneNumber || !agreed" class="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            Get OTP
          </button>
        </div>

        <!-- Step 2: OTP Input -->
        <div v-if="step === 2" class="space-y-6">
          <div class="bg-stella-black/50 border border-gray-800 rounded-lg p-4 text-center mb-6">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">OTP sent to</p>
            <p class="font-bold text-white tracking-widest text-lg">+91 {{ phoneNumber }}</p>
            <button @click="step = 1" class="text-stella-red text-xs hover:underline mt-2 font-medium">Edit Number</button>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Enter 6-digit OTP</label>
            <input type="text" v-model="otp" placeholder="• • • • • •" class="w-full bg-stella-black border border-gray-700 text-white rounded-md py-4 px-4 focus:outline-none focus:border-stella-red transition-colors text-center text-2xl tracking-[0.5em] font-mono shadow-inner" maxlength="6" />
          </div>

          <button @click="verifyOTP" :disabled="otp.length !== 6" class="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            Verify & Login
          </button>

          <p class="text-center text-xs text-gray-500 mt-6">
            Didn't receive the code? <button class="text-white hover:text-stella-red transition-colors font-medium ml-1 underline underline-offset-2">Resend in 00:30</button>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
