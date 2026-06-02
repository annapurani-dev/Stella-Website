import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('stella_user')) || null,
    loading: false,
    error: null,
    otpSent: false,
    phoneNumber: '',
    showLoginModal: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    toggleLoginModal(show) {
      this.showLoginModal = show;
    },
    async sendOTP(phoneNumber) {
      try {
        this.loading = true;
        this.error = null;
        this.phoneNumber = phoneNumber;
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to send OTP');
        }
        
        this.otpSent = true;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async verifyOTP(code, name = '') {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phoneNumber: this.phoneNumber, 
            code,
            name
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid OTP');
        
        this.user = data.user;
        localStorage.setItem('stella_user', JSON.stringify(data.user));
        return data.user;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    updateUser(updatedUser) {
      this.user = updatedUser;
      localStorage.setItem('stella_user', JSON.stringify(updatedUser));
    },
    
    logout() {
      this.user = null;
      localStorage.removeItem('stella_user');
      this.otpSent = false;
      this.phoneNumber = '';
    }
  }
});
