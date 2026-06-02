<script setup>
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed top-8 right-8 z-[1000] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="toast in toastStore.toasts" :key="toast.id"
           class="pointer-events-auto flex items-center justify-between min-w-[300px] max-w-sm p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all duration-300"
           :class="{
             'bg-stella-red/90 border-stella-red/50 text-white': toast.type === 'error',
             'bg-green-600/90 border-green-500/50 text-white': toast.type === 'success',
             'bg-[#1a1a1e]/90 border-white/10 text-white': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <span v-if="toast.type === 'success'" class="text-lg">✓</span>
          <span v-else-if="toast.type === 'error'" class="text-lg font-black">!</span>
          <span v-else class="text-lg">ℹ</span>
          <p class="text-xs font-bold uppercase tracking-widest">{{ toast.message }}</p>
        </div>
        <button @click="toastStore.removeToast(toast.id)" class="ml-4 opacity-60 hover:opacity-100 transition-opacity">
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
