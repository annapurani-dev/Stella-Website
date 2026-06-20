import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DealsCountdown from '@/components/DealsCountdown';
import DealsHoverExpand from '@/components/DealsHoverExpand';
import KineticTitle from '@/components/KineticTitle';
import Reveal3D from '@/components/Reveal3D';
import TiltCard from '@/components/TiltCard';
import FranchiseHubsGallery from '@/components/FranchiseHubsGallery';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToastStore } from '@/stores/toastStore';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const API = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_HOMEPAGE_CONFIG = {
  hero: {
    slides: [
      {
        id: 1,
        title: 'Unleash the Future',
        subtitle: 'Experience the next generation of mobile performance and design.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 2,
        title: 'Titanium Strength',
        subtitle: 'Aerospace-grade titanium design. Incredibly strong. Incredibly light.',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 3,
        title: 'Pure Audio Bliss',
        subtitle: 'Crystal clear sound with advanced active noise cancellation technology.',
        image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1920&q=80',
      },
    ],
    buttonText: 'Discover Elite',
  },
  deals: { show: true },
};

function parseMaybeJson(value) {
  let parsed = value;
  while (typeof parsed === 'string') {
    try {
      const next = JSON.parse(parsed);
      if (next === parsed) break;
      parsed = next;
    } catch {
      break;
    }
  }
  return parsed;
}

const defaultHubs = [
  { tag: 'Own Outlet', name: 'Unit I, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Own Outlet', name: 'Unit II, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Own Outlet', name: 'Thalamuthunagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Own Outlet', name: 'Chidambara Nagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Own Outlet', name: 'Kulathur', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Franchise Outlet', name: 'Pudukottai', address: 'Pudukottai', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Franchise Outlet', name: 'Kulathur', address: 'Kulathur', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
  { tag: 'Franchise Outlet', name: 'MR.93 Thoothukudi', address: 'Thoothukudi', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
];

const defaultCol1Reviews = [
  { id: 1, name: 'Rahul S.', text: 'Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.', stars: 5 },
  { id: 2, name: 'Priya K.', text: 'Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!', stars: 5 },
  { id: 3, name: 'Vikram M.', text: 'Authentic products and 0% UPI fee makes a huge difference when buying flagships.', stars: 5 },
];

const defaultCol2Reviews = [
  { id: 4, name: 'Anjali R.', text: 'Super fast checkout! The custom UPI payments are fully transparent and fee-free.', stars: 5 },
  { id: 5, name: 'Karthik B.', text: 'Elite premium customer support. Setup my new smartphone right in their luxury lounge.', stars: 5 },
  { id: 6, name: 'Deepa T.', text: 'Outstanding store design. The bento layout and dark mode look premium online & offline.', stars: 5 },
];

const defaultCol3Reviews = [
  { id: 7, name: 'Sanjay V.', text: 'Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.', stars: 5 },
  { id: 8, name: 'Meera N.', text: 'Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.', stars: 5 },
  { id: 9, name: 'Arun K.', text: 'Stella franchise protocol is highly systematic. Excited to grow our partnership.', stars: 5 },
];

const dummyDeals = [
  {
    id: 'dummy-1',
    name: 'Stella Neo 15 Pro',
    price: '129900',
    oldPrice: 149900,
    tag: 'Save 15%',
    subtitle: 'Exclusive Stella Engineering Protocol',
    img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dummy-2',
    name: 'Stella Pad Horizon',
    price: '79900',
    oldPrice: 94900,
    tag: 'Trending',
    subtitle: 'Premium Aluminum/Titanium Craftsmanship',
    img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dummy-3',
    name: 'Stella Pods ANC',
    price: '12900',
    oldPrice: 17900,
    tag: 'Hot Deal',
    subtitle: '1-Year Stella Luxury Care Warranty',
    img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dummy-4',
    name: 'Stella Watch Elite',
    price: '34900',
    oldPrice: 42900,
    tag: 'Limited Edition',
    subtitle: 'Experience next-generation performance',
    img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
  },
];

const franchiseBentoItems = [
  { icon: '🏪', title: 'Zero Franchise Fee', desc: 'No upfront cost. Pure equity partnership.' },
  { icon: '📦', title: 'Elite Supply Chain', desc: "Direct access to Stella's premium inventory." },
  { icon: '📊', title: '200% Growth YOY', desc: 'Fastest growing mobile retail brand in South India.' },
  { icon: '🤝', title: 'Full Brand Support', desc: 'Training, marketing & operations backed by Stella.' },
];

const franchiseModalBenefits = [
  { icon: '📱', title: 'Comprehensive Mobile Solutions', desc: 'Stella Hit Tech offers not only mobile sales but also top-tier after-sales services, ensuring a seamless experience.' },
  { icon: '💻', title: 'Tech Expertise', desc: 'With a strong foundation in software development and customized applications, we understand diverse business needs.' },
  { icon: '🚀', title: 'Innovation-Driven', desc: 'We stay ahead of industry trends, constantly evolving with the latest technologies like AI and cloud solutions.' },
  { icon: '❤️', title: 'Customer-Centric Approach', desc: 'Customer satisfaction is at the heart of what we do. We provide personalized services to meet client needs.' },
  { icon: '👥', title: 'Skilled Team', desc: 'Our passionate professionals bring expertise in both mobile technology and software development.' },
  { icon: '📈', title: 'Affordable & Scalable', desc: 'We offer scalable solutions that are both cost-effective and tailored to your unique requirements.' },
];

const aboutUsCards = [
  { id: 1, image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80', alt: 'Premium Curation' },
  { id: 2, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', alt: 'Elite Customer Care' },
  { id: 3, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', alt: 'Flagship Store' },
  { id: 4, image: 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=800&q=80', alt: 'Transparent Value' },
];

function ReviewCard({ review, keyPrefix = '' }) {
  return (
    <div className="review-card glass p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/[0.01] rounded-full blur-lg" />
      <div className="flex space-x-0.5 text-[9px] text-stella-gold">
        {Array.from({ length: review.stars }, (_, s) => (
          <span key={`${keyPrefix}star-${s}`}>★</span>
        ))}
      </div>
      <p className="text-gray-300 text-xs italic font-medium leading-relaxed">&quot;{review.text}&quot;</p>
      <div className="flex items-center space-x-3 pt-3 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-stella-red/10 border border-stella-red/20 flex items-center justify-center text-stella-red font-black text-[9px]">
          {review.name[0]}
        </div>
        <span className="text-white font-black uppercase tracking-widest text-[9px]">{review.name}</span>
      </div>
    </div>
  );
}

function HubCard({ hub, className = '' }) {
  return (
    <div
      className={`glass p-5 rounded-2xl min-w-[260px] md:min-w-[300px] text-left border border-white/5 hover:border-stella-red/30 transition-all duration-300 relative group overflow-hidden shrink-0 ${className}`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-stella-red/5 rounded-full blur-xl group-hover:bg-stella-red/10 transition-all duration-500" />
      <span className="bg-stella-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">{hub.tag}</span>
      <h3 className="text-base font-black uppercase tracking-wide text-white mt-2 mb-2 leading-tight">{hub.name}</h3>
      <p className="text-gray-400 text-[11px] font-medium leading-relaxed mb-3">{hub.address}</p>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <a href={`tel:${hub.phone}`} className="text-stella-gold font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors">
          {hub.phone}
        </a>
        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">{hub.hours}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const toggleLoginModal = useAuthStore((s) => s.toggleLoginModal);
  const addToCartStore = useCartStore((s) => s.addToCart);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addToast = useToastStore((s) => s.addToast);

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homepageConfig, setHomepageConfig] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);

  const homepageConfigRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const scrollPosRef = useRef(0);
  const animationFrameRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const stackContainerRef = useRef(null);
  const aboutCardRefs = useRef([]);

  const hubs = homepageConfig?.franchise?.hubs || defaultHubs;

  const col1Reviews = useMemo(
    () => homepageConfig?.testimonials?.col1 || defaultCol1Reviews,
    [homepageConfig],
  );
  const col2Reviews = useMemo(
    () => homepageConfig?.testimonials?.col2 || defaultCol2Reviews,
    [homepageConfig],
  );
  const col3Reviews = useMemo(
    () => homepageConfig?.testimonials?.col3 || defaultCol3Reviews,
    [homepageConfig],
  );
  const allMobileReviews = useMemo(
    () => [...col1Reviews, ...col2Reviews, ...col3Reviews],
    [col1Reviews, col2Reviews, col3Reviews],
  );

  const fetchConfigs = useCallback(async () => {
    try {
      const response = await fetch(`${API}/site-config/homepage`);
      if (response.ok) {
        let data = parseMaybeJson(await response.json());
        if (!data?.hero?.slides?.length) {
          data = DEFAULT_HOMEPAGE_CONFIG;
        }
        console.log('Homepage Config Loaded:', data);
        homepageConfigRef.current = data;
        setHomepageConfig(data);

        if (data.hero?.slides?.length > 1) {
          slideIntervalRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % data.hero.slides.length);
          }, 6000);
        }
      } else {
        console.error('Failed to load homepage config:', response.status);
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
      homepageConfigRef.current = DEFAULT_HOMEPAGE_CONFIG;
      setHomepageConfig(DEFAULT_HOMEPAGE_CONFIG);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      const productsResponse = await fetch(`${API}/products`);
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const allProducts = await productsResponse.json();

      const config = homepageConfigRef.current;
      if (config?.deals?.items && config.deals.items.length > 0) {
        const configuredDeals = [];
        config.deals.items.forEach((item) => {
          const prod = allProducts.find((p) => p.id === parseInt(item.productId, 10));
          if (prod) {
            configuredDeals.push({
              id: prod.id,
              name: prod.name,
              price: item.dealPrice && item.dealPrice > 0 ? item.dealPrice : prod.price,
              oldPrice: parseFloat(prod.price),
              tag: item.customLabel || prod.deal_label || 'Special Offer',
              subtitle: item.subtitle || prod.description || 'Exclusive Stella Engineering Protocol',
              img: prod.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
            });
          }
        });

        if (configuredDeals.length > 0) {
          setDeals(configuredDeals);
          return;
        }
      }

      const response = await fetch(`${API}/products/deals`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setDeals(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              oldPrice: parseFloat(item.price) * 1.2,
              tag: item.deal_label || 'Special Offer',
              subtitle: item.description || 'Exclusive Stella Engineering Protocol',
              img: item.image_url || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
            })),
          );
          return;
        }
      }

      setDeals(dummyDeals);
    } catch (err) {
      console.error('Error fetching deals, falling back to premium dummy data:', err);
      setDeals(dummyDeals);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const animateScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (!isHoveredRef.current) {
      scrollPosRef.current += 0.75;
      if (scrollPosRef.current >= el.scrollWidth / 2) {
        scrollPosRef.current = 0;
      }
      el.scrollLeft = scrollPosRef.current;
    } else {
      scrollPosRef.current = el.scrollLeft;
    }
    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (scrollContainerRef.current) {
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, [animateScroll, stopAutoScroll]);

  const addToCart = (product) => {
    if (!user) {
      toggleLoginModal(true);
      return;
    }
    addToCartStore(product);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const toggleWishlist = (product) => {
    if (!user) {
      toggleLoginModal(true);
      return;
    }
    const wasInWishlist = isInWishlist(product.id);
    toggleWishlistStore(product);
    if (wasInWishlist) {
      addToast(`Removed ${product.name} from Wishlist`, 'error');
    } else {
      addToast(`Added ${product.name} to Wishlist!`, 'success');
    }
  };

  const viewProduct = (deal) => {
    navigate(`/product/${deal.id}`);
  };

  const scrollToBranches = (e) => {
    e.preventDefault();
    document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      await Promise.all([fetchDeals(), fetchConfigs()]);
      if (mounted) setLoading(false);
    }

    load();

    return () => {
      mounted = false;
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [fetchDeals, fetchConfigs]);

  useEffect(() => {
    if (!loading) startAutoScroll();
    return stopAutoScroll;
  }, [loading, startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const franchiseTitle = homepageConfig?.franchise?.title || 'Partner with Stella';
  const franchiseTitleParts = franchiseTitle.split(' ');
  const visionTitle = homepageConfig?.our_story?.vision_title || 'The Stella Vision';
  const visionTitleParts = visionTitle.split(' ');

  const franchiseStats = homepageConfig?.franchise?.stats || [
    { label: 'Own Outlets', value: '5' },
    { label: 'Franchise Outlets', value: '3' },
  ];

  const modalFranchiseStats = homepageConfig?.franchise?.stats || [
    { label: 'Outlets', value: '50+' },
    { label: 'Growth YOY', value: '200%' },
  ];

  const ourStoryStats = homepageConfig?.our_story?.stats || [
    { value: '15k+', label: 'Happy Customers' },
    { value: '02', label: 'Elite Hubs' },
    { value: '24h', label: 'Express Delivery' },
  ];

  const mouseXY = useRef([0, 0]);
  const heroRef = useRef(null);
  const slideLayerRef = useRef(null);

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseXY.current = [
        ((clientX - rect.left) / rect.width - 0.5) * 2,
        ((clientY - rect.top) / rect.height - 0.5) * 2,
      ];
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchMove);
    };
  }, []);

  useEffect(() => {
    const layer = slideLayerRef.current;
    if (!layer) return;

    let rafId = 0;
    const update = () => {
      const [mx, my] = mouseXY.current;
      layer.style.transform = `translate(${mx * -10}px, ${my * -6}px) scale(1.06)`;
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [currentSlide]);

  const activeConfig = homepageConfig?.hero?.slides?.length ? homepageConfig : DEFAULT_HOMEPAGE_CONFIG;
  const currentSlideData = activeConfig.hero.slides[currentSlide] ?? activeConfig.hero.slides[0];
  const titleWords = (currentSlideData?.title || 'Stella Future').split(' ');

  return (
    <div className="space-y-16 md:space-y-24 pb-32">
      {/* ── Hybrid Bento Hero ── */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-[#050508]"
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 md:grid-rows-[2fr_1fr] gap-4 md:gap-6 h-auto md:h-[80vh]">
          
          {/* Main Anchor: Video Mask Tile */}
          <TiltCard
            maxTilt={3}
            scale={1.01}
            className="md:col-span-8 md:row-span-2 relative rounded-[2.5rem] overflow-hidden bg-[#050508] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] group flex flex-col min-h-[50vh] md:min-h-0"
          >
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[3000ms] ease-out"
                src="https://cdn.pixabay.com/video/2020/05/24/40061-424750131_tiny.mp4"
              />
            </div>
            {/* The Mask */}
            <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center mix-blend-multiply pointer-events-none p-4">
              <h1 className="text-[18vw] md:text-[10vw] font-black uppercase tracking-tighter text-white leading-[0.8] text-center">
                {titleWords.slice(0, -1).join(' ')}<br/>
                {titleWords[titleWords.length - 1]}
              </h1>
            </div>
            {/* Overlay Elements (Must not be multiplied) */}
            <div className="absolute bottom-8 left-8 z-20">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <span className="w-2 h-2 rounded-full animate-pulse bg-stella-red" />
                <span className="text-white font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em]">
                  {currentSlideData?.subtitle || 'Stella Exclusives'}
                </span>
              </span>
            </div>
          </TiltCard>

          {/* Product Showcase Tile */}
          <TiltCard
            maxTilt={5}
            scale={1.02}
            className="md:col-span-4 md:row-span-1 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#0a0a0c] border border-white/10 shadow-xl group min-h-[40vh] md:min-h-0 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-stella-red/5 group-hover:bg-stella-red/20 transition-colors duration-500 z-0" />
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2000ms] ease-out z-0 mix-blend-luminosity group-hover:mix-blend-normal"
              style={{ backgroundImage: `url('${currentSlideData?.image || 'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=800&q=80'}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-0 pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <h3 className="text-white font-black uppercase tracking-widest text-xl mb-2 drop-shadow-md">Flagship Vision</h3>
              <p className="text-gray-300 text-xs font-medium leading-relaxed drop-shadow-md">Engineered for absolute perfection.</p>
            </div>
          </TiltCard>

          {/* Action Tile */}
          <div className="md:col-span-2 md:row-span-1 flex flex-col gap-4 md:gap-6">
            <TiltCard
              maxTilt={8}
              className="flex-1 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-stella-red to-red-900 border border-red-500/50 shadow-lg shadow-stella-red/20 group flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-stella-red/40 transition-all"
              onClick={() => navigate('/products')}
            >
              <span className="text-white font-black uppercase tracking-[0.25em] text-[11px] md:text-xs text-center drop-shadow-sm group-hover:scale-105 transition-transform">
                Discover Elite
              </span>
            </TiltCard>
            
            <TiltCard
              maxTilt={8}
              className="flex-1 relative rounded-[2.5rem] overflow-hidden bg-[#0a0a0c] border border-white/10 shadow-lg group flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => navigate('/products')}
            >
              <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] text-center group-hover:text-white transition-colors">
                View Catalog
              </span>
            </TiltCard>
          </div>

          {/* Stats / Info Tile */}
          <TiltCard
            maxTilt={5}
            className="md:col-span-2 md:row-span-1 relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#0a0a0c] border border-white/10 shadow-xl p-8 flex flex-col justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-stella-gold/10 border border-stella-gold/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stella-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-black text-4xl leading-none mb-2">2.4x</h4>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Processing Power</p>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* Deals Section */}
      {homepageConfig?.deals?.show !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-4 md:pt-6">
          <Reveal3D variant="up">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="flex flex-col md:flex-row md:items-end gap-10">
                <KineticTitle className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                  Deals of{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stella-gold to-stella-gold">
                    the Day
                  </span>
                </KineticTitle>
                <DealsCountdown />
              </div>
              <Link
                to="/products"
                className="text-stella-gold font-black uppercase tracking-[0.3em] text-[9px] hover:text-white transition-all flex items-center mb-1"
              >
                View All Assets
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </Reveal3D>

          <Reveal3D variant="zoom" delay={120} refreshKey={loading ? 'loading' : `deals-${deals.length}`}>
            {loading ? (
              <div className="h-[28rem] md:h-[26rem] rounded-[2rem] bg-stella-charcoal animate-pulse border border-white/5" />
            ) : deals.length > 0 ? (
              <DealsHoverExpand
                deals={deals}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onViewProduct={viewProduct}
              />
            ) : null}
          </Reveal3D>
        </section>
      )}

      {/* Franchise Section */}
      <section className="relative py-24 flex flex-col justify-center overflow-hidden w-full border-t border-white/5 bg-gradient-to-b from-stella-black to-[#0a0a0c]">
        {/* Background elements */}
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-stella-red/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-stella-gold/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <Reveal3D variant="up" stagger={120} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left side: intro */}
            <div data-reveal-child className="lg:col-span-5 space-y-6">
              <KineticTitle className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                {franchiseTitleParts.slice(0, 2).join(' ')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-white">
                  {franchiseTitleParts.slice(2).join(' ')}
                </span>
              </KineticTitle>
              <p className="text-gray-400 text-sm font-light leading-relaxed max-w-xl">
                {homepageConfig?.franchise?.description ||
                  "Stella Hi Tech Private Limited combines local market experience with a structured franchise system to deliver consistent success. With successful outlets already operating, we provide complete business support including branding, supply chain, technical guidance, and marketing assistance."}
              </p>

              <div className="flex gap-12 pt-2 border-b border-white/[0.05] pb-6">
                {franchiseStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="/Business_Brochure.pdf"
                  download="Business_Brochure.pdf"
                  className="stella-button bg-stella-red text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 flex items-center gap-2 shadow-xl shadow-stella-red/20 w-fit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Brochure
                </a>
                <button
                  type="button"
                  onClick={() => setShowFranchiseModal(true)}
                  className="stella-button bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 flex items-center gap-2"
                >
                  View All Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right side: Franchise hub cards gallery instead of bento benefits grid */}
            <div data-reveal-child className="lg:col-span-7 w-full">
              {hubs.length > 0 && (
                <FranchiseHubsGallery hubs={hubs} />
              )}
            </div>
          </Reveal3D>
        </div>
      </section>

      {/* Franchise Details Modal */}
      {showFranchiseModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] w-full h-screen overflow-y-auto bg-stella-black/98 backdrop-blur-3xl flex flex-col custom-scrollbar">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-stella-black/90 backdrop-blur-md border-b border-white/[0.05] px-6 md:px-16 py-6 md:py-8 flex items-center justify-between z-10 w-full">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Franchise Program</h2>
                <p className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">Stella Partnership Programme</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFranchiseModal(false)}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xl font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto w-full px-6 md:px-16 py-12 md:py-20 flex-1 space-y-12 md:space-y-16">
              <div className="space-y-6">
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-tight">
                  {homepageConfig?.franchise?.title || 'Partner with Stella'}
                </h3>
                <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-4xl">
                  {homepageConfig?.franchise?.description ||
                    "Stella Hi Tech Private Limited combines local market experience with a structured franchise system to deliver consistent success. With successful outlets already operating, we provide complete business support including branding, supply chain, technical guidance, and marketing assistance."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="flex gap-16 pb-12 border-b border-white/[0.05]">
                {franchiseStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-5xl md:text-6xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.3em] mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Benefits Grid */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Why Partner With Us</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(homepageConfig?.franchise?.benefits || franchiseModalBenefits).map((item, i) => (
                    <div key={i} className="glass p-8 rounded-3xl border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 space-y-4 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-full blur-xl group-hover:bg-stella-red/5 transition-all duration-500" />
                      <span className="text-3xl block">{item.icon}</span>
                      <h5 className="text-white font-black text-sm uppercase tracking-wider">{item.title}</h5>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <a
                  href="/Business_Brochure.pdf"
                  download="Business_Brochure.pdf"
                  className="stella-button bg-stella-red text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 flex items-center justify-center gap-3 shadow-2xl shadow-stella-red/25"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Full Brochure
                </a>
                <button
                  type="button"
                  onClick={() => setShowFranchiseModal(false)}
                  className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 cursor-pointer"
                >
                  Close Franchise View
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}



      {/* About Us Section */}
      <section id="about-us" className="border-t border-white/5 bg-[#08080a]">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Text content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="w-12 h-[1px] bg-stella-gold" />
                <span className="text-stella-gold font-black text-[10px] uppercase tracking-[0.5em]">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                Redefining <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stella-gold to-stella-gold">
                  Mobile Excellence
                </span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-xl">
              <p>
                Stella Hi Tech Private Limited, an emerging SAP solutions firm, was established on January 26, 2025, in the heart of the Pearl City, Tuticorin, by its visionary founder, Mr. Maheshkumar V.
              </p>
              <p>
                The journey began in 2007 when Mr. Maheshkumar V started as a dedicated home appliance agency, creating the brand “STELLA” (Stella Home Appliances) in his hometown, Kulathur, Tuticorin.
              </p>
              <p>
                Subsequently, Stella Mobiles opened its doors at Hongkong Plaza, Tuticorin, providing reliable and customer-satisfying mobile services. In 2015, it evolved into a full-fledged Mobile Sales Showroom. Today, Stella Mobiles stands as a leading multi-brand retail chain, offering a wide range of mobile phones, accessories, smart gadgets, tablets, laptops, and TVs.
              </p>
              <p>
                With consistent growth and transformation, the brand expanded across Tuticorin town, establishing branches in multiple locations. Building on this strong foundation, we united as a team to launch our technology solutions firm, Stella Hi Tech Private Limited, in Polepettai, Tuticorin.
              </p>
              <p>
                Stella Hi Tech Private Limited takes pride in its deep understanding of customer needs. Its greatest strength lies in its well-trained, customer-friendly team and an unwavering passion for delivering exceptional service.
              </p>
            </div>

            {/* Brand Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.05]">
              {ourStoryStats.map((stat, idx) => (
                <div key={idx}>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Curated Image Grid */}
          <div className="lg:col-span-6 w-full grid grid-cols-2 gap-4">
            {aboutUsCards.map((card) => (
              <div key={card.id} className="relative aspect-square overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] group shadow-2xl">
                <img
                  src={card.image}
                  alt={card.alt || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-wider">{card.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="max-w-7xl mx-auto px-6 py-24 w-full">
         <Reveal3D variant="up">
           <div className="text-center mb-16">
              <KineticTitle className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-stella-gold to-yellow-300">Network</span>
              </KineticTitle>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Stella operates across multiple vibrant districts. Each hub is designed to deliver a premium, hands-on experience — from device selection to instant setup and after-sales support.
              </p>
           </div>
         </Reveal3D>

         {/* Head Office */}
         <Reveal3D variant="zoom" delay={100}>
           <div className="mb-12 glass p-8 md:p-12 rounded-[2.5rem] border border-stella-gold/30 bg-gradient-to-br from-stella-gold/5 to-transparent relative overflow-hidden group shadow-2xl shadow-stella-gold/5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-stella-gold/10 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-stella-gold/20" />
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-8">
                  <div>
                     <span className="inline-block bg-stella-gold/20 text-stella-gold text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-lg mb-4">Head Office</span>
                     <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Stella Hi Tech Pvt Ltd</h3>
                     <p className="text-gray-300 max-w-lg leading-relaxed text-sm">102/5a/1a, Polepettai, Melur, Thoothukudi, Tamil Nadu - 628 002</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                     <a href="tel:+919095510510" className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-xl transition-all group-hover:border-white/20">
                        <span className="text-xl">📞</span>
                        <span className="text-white font-bold tracking-wider text-sm">+91 9095510510</span>
                     </a>
                     <a href="https://maps.app.goo.gl/kJK1iod8Bk9sn5K46" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-stella-gold text-black hover:bg-yellow-500 border border-stella-gold px-6 py-4 rounded-xl transition-all shadow-lg shadow-stella-gold/20">
                        <span className="text-xl">📍</span>
                        <span className="tracking-wider uppercase text-xs font-black">Get Directions</span>
                     </a>
                  </div>
              </div>
           </div>
         </Reveal3D>

         {/* Bento Grid for Branches */}
         <Reveal3D variant="up" delay={200}>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               {hubs.map((hub, idx) => {
                   const isFranchise = hub.tag.includes('Franchise');
                   return (
                       <div key={idx} className={`glass p-6 md:p-8 rounded-[2rem] border ${isFranchise ? 'border-stella-red/20 hover:border-stella-red/50 bg-gradient-to-br from-stella-red/5 to-transparent' : 'border-white/10 hover:border-white/30 bg-white/[0.02]'} transition-all duration-500 hover:-translate-y-1 group flex flex-col justify-between min-h-[220px]`}>
                           <div>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-5 inline-block ${isFranchise ? 'bg-stella-red/20 text-stella-red' : 'bg-white/10 text-gray-300'}`}>{hub.tag}</span>
                              <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-3 leading-tight group-hover:text-stella-gold transition-colors">{hub.name}</h4>
                              <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 pr-4">{hub.address}</p>
                           </div>
                           <div className="mt-8 flex items-end justify-between border-t border-white/5 pt-5">
                              <div>
                                 <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-black mb-1.5">Managed By</p>
                                 <p className="text-gray-200 text-sm font-bold tracking-wide">{hub.manager || 'N/A'}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 {hub.link && (
                                   <a href={hub.link} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" title="Get Directions">
                                      📍
                                   </a>
                                 )}
                                 <a href={`tel:${hub.phone.replace(/\\s+/g,'')}`} className="text-stella-gold hover:text-white font-black text-xs tracking-wider transition-colors">
                                    {hub.phone}
                                 </a>
                              </div>
                           </div>
                       </div>
                   )
               })}
           </div>
         </Reveal3D>
      </section>

      {/* Customer Trust Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <Reveal3D variant="flip">
        <div className="text-center mb-10">
          <KineticTitle className="text-4xl font-black uppercase tracking-tighter text-white mb-3">
            Customer&apos;s trust{' '}
            <span className="text-stella-gold italic">on Stella Mobiles</span>
          </KineticTitle>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">What our galaxy of customers say</p>
        </div>
        </Reveal3D>

        <Reveal3D variant="up" delay={100}>
        <div className="relative h-[380px] overflow-hidden mt-10">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stella-black via-stella-black/70 to-transparent z-20 pointer-events-none" />

          <div className="hidden md:grid grid-cols-3 gap-6 h-full">
            <div className="reviews-column overflow-hidden h-full relative p-3">
              <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                {col1Reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {col1Reviews.map((review) => (
                  <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                ))}
              </div>
            </div>

            <div className="reviews-column overflow-hidden h-full relative p-3">
              <div className="flex flex-col gap-4 animate-marquee-vertical-down">
                {col2Reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {col2Reviews.map((review) => (
                  <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                ))}
              </div>
            </div>

            <div className="reviews-column overflow-hidden h-full relative p-3">
              <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                {col3Reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {col3Reviews.map((review) => (
                  <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                ))}
                {col3Reviews.map((review) => (
                  <ReviewCard key={`dup2-${review.id}`} review={review} keyPrefix="dup2-" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:hidden grid-cols-1 gap-6 h-full">
            <div className="reviews-column overflow-hidden h-full relative p-3">
              <div className="flex flex-col gap-4 animate-marquee-vertical-up">
                {allMobileReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {allMobileReviews.map((review) => (
                  <ReviewCard key={`dup-${review.id}`} review={review} keyPrefix="dup-" />
                ))}
              </div>
            </div>
          </div>
        </div>
        </Reveal3D>
      </section>

      <style>{`
        @keyframes marquee-vertical-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-vertical-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-vertical-up {
          animation: marquee-vertical-up 24s linear infinite;
        }
        .animate-marquee-vertical-down {
          animation: marquee-vertical-down 24s linear infinite;
        }
        .reviews-column:hover .animate-marquee-vertical-up,
        .reviews-column:hover .animate-marquee-vertical-down {
          animation-play-state: paused !important;
        }
        .review-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
        .review-card:hover {
          transform: scale(1.06) translateY(-8px) !important;
          border-color: rgba(230, 57, 70, 0.4) !important;
          box-shadow: 0 20px 45px rgba(230, 57, 70, 0.15) !important;
          background-color: rgba(26, 26, 26, 0.95) !important;
          z-index: 50 !important;
        }
      `}</style>
    </div>
  );
}
