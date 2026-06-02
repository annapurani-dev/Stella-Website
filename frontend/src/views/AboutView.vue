<template>
  <div class="min-h-screen">
    <!-- Hero Header -->
    <section class="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-gray-900">
      <div 
        class="absolute inset-0 z-0 opacity-20 bg-fixed bg-cover bg-center grayscale transition-all duration-700"
        :style="heroImage ? `background-image: url('${heroImage}');` : `background-image: url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80');`"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-t from-stella-black to-transparent z-10"></div>
      <div class="relative z-20 text-center px-6">
        <h1 class="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6">{{ story.hero_title || 'Our Story' }}</h1>
        <p class="text-stella-red font-bold uppercase tracking-[0.5em] text-sm">{{ story.hero_subtitle || 'Redefining Mobile Excellence' }}</p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 class="text-3xl font-black uppercase tracking-wider text-white mb-8">{{ story.vision_title || 'The Stella Vision' }}</h2>
        <p class="text-gray-400 text-lg font-light leading-relaxed mb-12">
            {{ story.vision_text || '' }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div v-for="stat in story.stats" :key="stat.label">
                <h4 class="text-stella-red font-black text-4xl mb-2">{{ stat.value }}</h4>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{{ stat.label }}</p>
            </div>
        </div>
    </section>

    <!-- Our Hubs -->
    <section v-if="story.hubs && story.hubs.length > 0" class="bg-stella-charcoal py-24 border-y border-gray-900">
        <div class="max-w-7xl mx-auto px-6">
            <h2 class="text-3xl font-black uppercase tracking-wider text-white mb-16 text-center">Visit Our Hubs</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div v-for="hub in story.hubs" :key="hub.name"
                     class="bg-stella-black border border-gray-800 rounded-2xl overflow-hidden group hover:border-stella-red transition-all duration-500 shadow-2xl">
                    <div class="h-64 bg-gray-900 relative">
                        <img :src="hub.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'" 
                             class="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                             :alt="hub.name">
                        <div class="absolute inset-0 bg-gradient-to-t from-stella-black to-transparent"></div>
                        <div class="absolute bottom-6 left-8">
                            <span class="bg-stella-red text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">{{ hub.tag }}</span>
                            <h3 class="text-2xl font-black text-white mt-2 uppercase tracking-wide">{{ hub.name }}</h3>
                        </div>
                    </div>
                    <div class="p-8">
                        <p class="text-gray-400 text-sm mb-6 leading-relaxed">{{ hub.description }}</p>
                        <div class="space-y-3 text-xs text-gray-500 uppercase tracking-widest font-bold">
                            <p v-if="hub.address" class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3 text-stella-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {{ hub.address }}
                            </p>
                            <p v-if="hub.phone" class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3 text-stella-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {{ hub.phone }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Form -->
    <section class="max-w-4xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
            <h2 class="text-3xl font-black uppercase tracking-wider text-white mb-4">Get In Touch</h2>
            <p class="text-gray-500 uppercase tracking-widest text-xs font-bold">Inquiries, Support, or Franchise Feedback</p>
        </div>
        <div class="bg-stella-charcoal border border-gray-800 rounded-2xl p-10 shadow-2xl shadow-black">
            <form class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                        <input type="text" class="w-full bg-stella-black border border-gray-700 text-white rounded py-3.5 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" class="w-full bg-stella-black border border-gray-700 text-white rounded py-3.5 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner" />
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                    <input type="text" class="w-full bg-stella-black border border-gray-700 text-white rounded py-3.5 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                    <textarea rows="5" class="w-full bg-stella-black border border-gray-700 text-white rounded py-3.5 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner leading-relaxed"></textarea>
                </div>
                <button class="w-full bg-stella-red text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 text-xs">
                    Send Inquiry
                </button>
            </form>
        </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const defaultStory = {
  hero_title: 'Our Story',
  hero_subtitle: 'Redefining Mobile Excellence',
  hero_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80',
  vision_title: 'The Stella Vision',
  vision_text: 'Founded in the heart of Chennai, Stella Mobiles began with a simple belief: that premium technology should be accompanied by a premium experience. We don\'t just sell phones; we curate the finest mobile technology for those who demand the best in performance, aesthetics, and service.',
  stats: [
    { value: '15k+', label: 'Happy Customers' },
    { value: '02', label: 'Elite Hubs' },
    { value: '24h', label: 'Express Delivery' }
  ],
  hubs: [
    { tag: 'Flagship Store', name: 'Stella Anna Nagar', description: 'Located in the vibrant heart of Shanthi Colony, our flagship hub offers the complete Stella experience with a dedicated lounge for device setup and personalized consulting.', address: 'Shanthi Colony Main Rd, Anna Nagar, Chennai - 400040', phone: '+91 44 2626 XXXX', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
    { tag: 'Express Hub', name: 'Stella T-Nagar', description: 'Our T-Nagar hub is optimized for the urban professional. Fast pickups, immediate technical support, and the latest accessory releases are always in stock.', address: 'Pondy Bazaar Main Rd, T-Nagar, Chennai - 400017', phone: '+91 44 2828 XXXX', image: 'https://images.unsplash.com/photo-1554941068-a252680d25d9?auto=format&fit=crop&w=800&q=80' }
  ]
};

const story = ref({ ...defaultStory });

const heroImage = computed(() => story.value.hero_image || defaultStory.hero_image);

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/site-config/homepage`);
    if (res.ok) {
      const data = await res.json();
      if (data.our_story) {
        story.value = {
          hero_title: data.our_story.hero_title || defaultStory.hero_title,
          hero_subtitle: data.our_story.hero_subtitle || defaultStory.hero_subtitle,
          hero_image: data.our_story.hero_image || defaultStory.hero_image,
          vision_title: data.our_story.vision_title || defaultStory.vision_title,
          vision_text: data.our_story.vision_text || defaultStory.vision_text,
          stats: data.our_story.stats?.length ? data.our_story.stats : defaultStory.stats,
          hubs: data.our_story.hubs?.length ? data.our_story.hubs : defaultStory.hubs
        };
      }
    }
  } catch (err) {
    console.error('Failed to load Our Story content:', err);
  }
});
</script>
