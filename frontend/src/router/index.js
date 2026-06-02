import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductListView from '../views/ProductListView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CustomerAccountView from '../views/CustomerAccountView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return new Promise((resolve) => {
        // Small delay lets the page render before scrolling
        setTimeout(() => {
          resolve({ el: to.hash, behavior: 'smooth', top: 80 });
        }, 100);
      });
    }
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductListView,
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: '/account',
      name: 'account',
      component: CustomerAccountView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/order-success',
      name: 'order-success',
      component: OrderSuccessView,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
