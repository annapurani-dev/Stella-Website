import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import LoginModal from '@/components/LoginModal';
import CartDrawer from '@/components/CartDrawer';
import ToastNotification from '@/components/ToastNotification';
import HomePage from '@/pages/HomePage';
import ProductListPage from '@/pages/ProductListPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CustomerAccountPage from '@/pages/CustomerAccountPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import LoginPage from '@/pages/LoginPage';
import Reveal3D from '@/components/Reveal3D';
import CleanLogo from '@/components/CleanLogo';
import LegalPage from '@/pages/LegalPage';

const API = import.meta.env.VITE_API_BASE_URL;

const defaultNavLinks = [
  { name: 'Smartphones', path: '/products?category=Smartphones' },
  { name: 'Accessories', path: '/products?category=Accessories' },
  { name: 'Our Story', path: '/#our-story' },
  { name: 'Franchise', path: '/#franchise' },
];

const footerSections = [
  {
    title: 'Legal & Policies',
    links: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Product Warranty', path: '/warranty' },
    ],
  },
  {
    title: 'Customer Support',
    links: [
      { name: 'My Account', path: '/account' },
      { name: 'Track Your Order', path: '/account?tab=tracking' },
      { name: 'Order History', path: '/account?tab=orders' },
      { name: 'Wishlist', path: '/account?tab=wishlist' },
    ],
  },
  {
    title: 'Stella Mobiles',
    links: [
      { name: 'Our Story', path: '/#our-story' },
      { name: 'Franchise Program', path: '/#franchise' },
      { name: 'Our Branches', path: '/#branches' },
    ],
  },
];

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 112;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);
  return null;
}

function getNavLinkPath(name) {
  if (!name) return '/';
  const norm = name.trim().toLowerCase();
  if (norm === 'home') return '/';
  if (norm === 'our story' || norm === 'about' || norm === 'about us') return '/#our-story';
  if (norm === 'franchise') return '/#franchise';
  return `/products?category=${encodeURIComponent(name.trim())}`;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const showLoginModal = useAuthStore((s) => s.showLoginModal);
  const toggleLoginModal = useAuthStore((s) => s.toggleLoginModal);
  const totalItems = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState(defaultNavLinks);

  const hideNav = location.pathname === '/login';

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const links = [];
          data.forEach((cat) => {
            links.push({ name: cat.name, path: `/products?category=${encodeURIComponent(cat.name)}` });
          });
          links.push({ name: 'Our Story', path: '/#our-story' });
          links.push({ name: 'Franchise', path: '/#franchise' });
          setNavLinks(links);
        }
      })
      .catch((err) => console.error('Error fetching dynamic categories:', err));
  }, []);

  const handleAccountClick = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/account');
    } else {
      toggleLoginModal(true);
    }
  };

  const goToCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  const handleNavClick = (e, path) => {
    if (path && path.startsWith('/#')) {
      e.preventDefault();
      const id = path.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 112;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="stella-bg" aria-hidden="true" />
      <div className="relative z-10">
      <ScrollManager />

      {!hideNav && (
        <header className="glass-dark fixed top-0 left-0 right-0 z-[60] border-b border-white/5 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="group flex flex-col items-center justify-center">
              <CleanLogo
                className="h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-500"
                height={56}
              />
              <span className="text-stella-gold font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] leading-none mt-1">
                Mobiles
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={getNavLinkPath(link.name)}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-stella-red transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4 md:space-x-6">
              <button onClick={handleAccountClick} className="flex items-center space-x-2 group">
                <div className="w-9 h-9 rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {user && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white hidden lg:block">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </button>
              <button onClick={() => setShowCart(true)} className="relative group">
                <div className="w-9 h-9 rounded-full bg-stella-gray border border-white/5 flex items-center justify-center group-hover:border-stella-red/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stella-red text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-stella-black animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-stella-gray border border-white/5 text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-stella-black/80 backdrop-blur-md md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 z-[70] w-[80%] max-w-sm bg-[#0d0d10] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] md:hidden flex flex-col animate-curtain-reveal">
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <div className="flex flex-col items-start">
              <CleanLogo className="h-10 object-contain" height={40} />
              <span className="text-stella-gold font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-1">Mobiles</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Reveal3D tag="div" variant="right" stagger={60} className="flex-1 overflow-y-auto px-6 py-8 space-y-3 custom-scrollbar" refreshKey="mobile-menu">
            {navLinks.map((link) => (
              <Link
                data-reveal-child
                key={link.name}
                to={getNavLinkPath(link.name)}
                onClick={(e) => {
                  handleNavClick(e, link.path);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-4 text-sm font-black uppercase tracking-widest text-gray-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.02] hover:border-stella-red/50 px-5 py-4 rounded-xl transition-all duration-300 hover:translate-x-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stella-red group-hover:shadow-[0_0_10px_rgba(229,9,20,0.8)] transition-shadow" />
                <span className="group-hover:text-glow-red transition-all duration-300">{link.name}</span>
              </Link>
            ))}
          </Reveal3D>
        </div>
      )}

      <main className={hideNav ? '' : 'pt-20'}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-stella-red border-t-transparent rounded-full animate-spin" /></div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/account" element={<CustomerAccountPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/warranty" element={<LegalPage type="warranty" />} />
          </Routes>
        </Suspense>
      </main>

      {showLoginModal && <LoginModal onClose={() => toggleLoginModal(false)} />}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} onCheckout={goToCheckout} />}

      {!hideNav && (
        <footer className="bg-stella-black border-t border-white/5 py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-1 md:col-span-1">
                <div className="flex flex-col items-start mb-3">
                  <CleanLogo className="h-10 object-contain" height={40} />
                  <span className="text-stella-gold font-bold text-[10px] uppercase tracking-[0.3em] leading-none mt-2">Mobiles</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 font-medium max-w-sm">
                  Redefining the premium mobile shopping experience across India. Innovation, trust, and zero-compromise service.
                </p>
                <div className="flex space-x-3">
                  {[1, 2, 3].map((i) => (
                    <a key={i} href="#" className="w-8 h-8 rounded-full bg-stella-charcoal flex items-center justify-center border border-white/5 hover:border-stella-red transition-all hover:-translate-y-1">
                      <span className="text-white text-[10px] font-bold">In</span>
                    </a>
                  ))}
                </div>
              </div>
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-3">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="text-gray-500 hover:text-white text-xs transition-colors font-medium">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
              <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest">&copy; 2026 Stella Mobiles. Master Control Systems.</p>
            </div>
          </div>
        </footer>
      )}

      <ToastNotification />

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        .animate-curtain-reveal { animation: curtainReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes curtainReveal {
          from {
            clip-path: circle(0% at 100% 0%);
          }
          to {
            clip-path: circle(150% at 100% 0%);
          }
        }
      `}</style>
      </div>
    </div>
  );
}
