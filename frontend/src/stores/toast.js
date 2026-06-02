import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    toasts.value.push({ id, message, type });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  return { toasts, addToast, removeToast };
});
