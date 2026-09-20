/**
 * Hassan Travels - Unified Client Data Service
 * Supports dual-mode persistence:
 * 1. REST API mode (when running backend server on http://localhost:3000)
 * 2. Standalone LocalStorage mode (with cross-tab BroadcastChannel sync for instant file:/// preview)
 */

(function(window) {
  const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? ''
    : 'http://localhost:3000';

  const STORAGE_KEY_PREFIX = 'ht_travels_';
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ht_live_sync') : null;

  // Rich initial dataset
  const DEFAULT_DATA = {
    auth: {
      user: 'admin',
      name: 'Hassan Travel Admin',
      password: 'admin123',
      token: 'admin_session_token_' + Date.now()
    },
    site_content: {
      hero: {
        tagline: 'DISCOVER PAKISTAN',
        headline: 'Journeys That Stay With You',
        subtext: 'Discover breathtaking landscapes, unforgettable experiences, and carefully crafted journeys across the majestic mountains of Pakistan.',
        badge: 'Top Rated Tour Operator in Northern Pakistan',
        bg_image: 'images/pakistan_hero.jpg'
      },
      stats: {
        destinations: '500+',
        travelers: '10K+',
        experts: '150+',
        rating: '4.9'
      },
      umrah: {
        badge: 'Spiritual Journeys',
        headline: 'Your Sacred Journey, Carefully Planned',
        subtext: 'Experience profound peace of mind. We provide bespoke Hajj & Umrah services, handling every detail from visas and flights to luxury accommodations steps away from the Haram.',
        image: 'images/mecca.jpg',
        features: [
          'Premium Hajj & Umrah Packages',
          '5-Star Hotels (Clock Tower & Medina)',
          'VIP Private Transport & Ziyarat',
          'Full Visa & Flight Assistance'
        ]
      },
      contact: {
        phone: '+92 300 1234567',
        email: 'info@hassantravels.com',
        whatsapp: '+92 300 1234567',
        address: 'Blue Area, Islamabad, Pakistan'
      }
    },
    destinations: [
      {
        id: 1,
        name: 'Hunza Valley',
        region: 'Gilgit-Baltistan',
        rating: 4.9,
        price: 45000,
        image: 'images/hunza.jpg',
        description: 'Experience the breathtaking views of the Karakoram peaks. Best time to visit is from April to October.',
        highlights: '5 to 7 Days Packages\nLuxury & Standard Hotels\nDedicated 4x4 Transport',
        is_popular: true,
        sort_order: 1
      },
      {
        id: 2,
        name: 'Skardu',
        region: 'Gilgit-Baltistan',
        rating: 4.8,
        price: 55000,
        image: 'images/skardu.jpg',
        description: 'Explore the cold desert, Shangrila lake, and Deosai plains. Perfect for adventure lovers.',
        highlights: 'Direct Flights from Islamabad\nLakefront Resorts available\nPrivate Jeeps for Deosai',
        is_popular: true,
        sort_order: 2
      },
      {
        id: 3,
        name: 'Naran Kaghan',
        region: 'Khyber Pakhtunkhwa',
        rating: 4.7,
        price: 35000,
        image: 'images/naran.jpg',
        description: 'The ultimate family getaway to Lake Saif ul Malook, Babusar Top, and Lulusar Lake.',
        highlights: '3 to 5 Days Itineraries\nFamily Suite Accommodations\nRafting & Trekking options',
        is_popular: true,
        sort_order: 3
      },
      {
        id: 4,
        name: 'Swat Valley',
        region: 'Khyber Pakhtunkhwa',
        rating: 4.9,
        price: 38000,
        image: 'images/swat.jpg',
        description: 'The Switzerland of the East. Enjoy the lush green valleys of Kalam, Malam Jabba, and Mahodand Lake.',
        highlights: '4 Days / 3 Nights Packages\nSkiing in Malam Jabba (Winter)\nRiverside Camping available',
        is_popular: true,
        sort_order: 4
      },
      {
        id: 5,
        name: 'Fairy Meadows',
        region: 'Diamer District',
        rating: 4.9,
        price: 42000,
        image: 'images/fairy_meadows.jpg',
        description: 'A majestic trek to the base camp of Nanga Parbat, the 9th highest mountain in the world.',
        highlights: '5 Days Adventure Trek\nWooden Cabins & Camping\nJeep Safari & Trekking Guide',
        is_popular: true,
        sort_order: 5
      },
      {
        id: 6,
        name: 'Neelum Valley',
        region: 'Azad Kashmir',
        rating: 4.8,
        price: 40000,
        image: 'images/neelum.jpg',
        description: 'Crystal-clear rivers, lush green mountains, and wooden villages of Kashmir.',
        highlights: 'Arang Kel Cable Car\nSharda University Ruins\nRiverside Resorts',
        is_popular: true,
        sort_order: 6
      }
    ],
    tours: [
      {
        id: 1,
        title: 'Hunza & Skardu Escape',
        duration: '7 Days / 6 Nights',
        tour_type: 'Private Tour',
        badge: 'Best Seller',
        rating: 4.9,
        price: 120000,
        image: 'images/gilgit.jpg',
        overview: 'A comprehensive journey through the Karakoram Highway covering the best of Gilgit-Baltistan.',
        inclusions: 'Luxury 4x4 Prado with fuel & driver\n4-Star Hotel stays with daily breakfast\nAttabad lake boat ride & Fort entry tickets\nDedicated 24/7 travel guide support',
        itinerary: [
          { day: 'Day 1', title: 'Arrival in Gilgit & Transfer to Hunza' },
          { day: 'Day 2', title: 'Baltit Fort & Altit Fort' },
          { day: 'Day 3', title: 'Attabad Lake & Passu Cones' },
          { day: 'Day 4', title: 'Drive to Skardu via Deosai' },
          { day: 'Day 5', title: 'Shangrila Resort & Kachura Lake' },
          { day: 'Day 6', title: 'Shigar Fort & Cold Desert' },
          { day: 'Day 7', title: 'Departure from Skardu' }
        ]
      },
      {
        id: 2,
        title: 'Kashmir Valley Retreat',
        duration: '5 Days / 4 Nights',
        tour_type: 'Group / Private',
        badge: 'Scenic Nature',
        rating: 4.8,
        price: 45000,
        image: 'images/neelum.jpg',
        overview: 'Explore the lush green forests and rivers of Neelum Valley, Arang Kel, and Sharda.',
        inclusions: 'Dedicated Grand Cabin / Coaster or Private Car\nRiverside Hotel Accommodations\nDaily Breakfast & Dinner\nArang Kel chairlift & local guide',
        itinerary: [
          { day: 'Day 1', title: 'Arrival in Muzaffarabad & Transfer to Keran' },
          { day: 'Day 2', title: 'Sharda & Kel Exploration' },
          { day: 'Day 3', title: 'Hike to Arang Kel' },
          { day: 'Day 4', title: 'Return via Kutton Waterfall' },
          { day: 'Day 5', title: 'Departure' }
        ]
      },
      {
        id: 3,
        title: 'Swat & Kalam Wonders',
        duration: '4 Days / 3 Nights',
        tour_type: 'Family Tour',
        badge: 'Family Friendly',
        rating: 4.7,
        price: 35000,
        image: 'images/kalam.jpg',
        overview: 'Discover the Switzerland of the East with its waterfalls, pine forests, and cool weather.',
        inclusions: 'Dedicated comfortable AC vehicle\n3-Star family resort stays\nDaily breakfast\nJeep safari to Mahodand Lake',
        itinerary: [
          { day: 'Day 1', title: 'Arrival in Swat & Mingora' },
          { day: 'Day 2', title: 'Malam Jabba Ski Resort' },
          { day: 'Day 3', title: 'Kalam Valley & Ushu Forest' },
          { day: 'Day 4', title: 'Mahodand Lake & Departure' }
        ]
      }
    ],
    bookings: [
      {
        id: 1001,
        full_name: 'Dr. Zeeshan Tariq',
        email: 'zeeshan.tariq@gmail.com',
        phone: '+92 321 8844221',
        destination: 'Hunza & Skardu Escape',
        travel_date: '2026-10-15',
        travelers: '2 Adults',
        special_requests: 'Honeymoon couple, require quiet room with mountain view and private guide.',
        status: 'Confirmed',
        notes: 'Deposit paid via Bank Transfer. Driver assigned: Bilal Ahmed.',
        total_price: 120000,
        created_at: '2026-09-01T14:30:00Z'
      },
      {
        id: 1002,
        full_name: 'Ayesha Siddiqui',
        email: 'ayesha.s@outlook.com',
        phone: '+92 300 4591188',
        destination: 'Swat & Kalam Wonders',
        travel_date: '2026-09-22',
        travelers: 'Family (3-4)',
        special_requests: 'Traveling with elderly parents, please arrange ground floor rooms.',
        status: 'Pending',
        notes: 'Inquiry follow-up required.',
        total_price: 70000,
        created_at: '2026-09-02T04:15:00Z'
      },
      {
        id: 1003,
        full_name: 'Usman Ali Cheema',
        email: 'usman.cheema@yahoo.com',
        phone: '+92 333 9922110',
        destination: 'Fairy Meadows',
        travel_date: '2026-09-28',
        travelers: 'Group (5+)',
        special_requests: 'Trekking expedition with camping equipment.',
        status: 'Confirmed',
        notes: 'Confirmed for 6 people. Jeeps reserved from Raikot Bridge.',
        total_price: 252000,
        created_at: '2026-09-02T06:00:00Z'
      }
    ]
  };

  // Internal LocalStorage Helpers
  function getLocal(key, defaultVal) {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function setLocal(key, val) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'DATA_UPDATED', key, timestamp: Date.now() });
      }
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Initialize LocalStorage with seed data if not present
  function initSeedData() {
    if (!getLocal('initialized', false)) {
      setLocal('site_content', DEFAULT_DATA.site_content);
      setLocal('destinations', DEFAULT_DATA.destinations);
      setLocal('tours', DEFAULT_DATA.tours);
      setLocal('bookings', DEFAULT_DATA.bookings);
      setLocal('auth', DEFAULT_DATA.auth);
      setLocal('initialized', true);
    }
  }

  initSeedData();

  // Test API connectivity
  let isApiOnline = null;
  async function checkApiOnline() {
    if (isApiOnline !== null) return isApiOnline;
    try {
      const res = await fetch(`${API_BASE}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1000) });
      isApiOnline = res.ok;
    } catch (e) {
      isApiOnline = false;
    }
    return isApiOnline;
  }

  const DataService = {
    // Event listener for live cross-tab updates
    onSync(callback) {
      if (syncChannel) {
        syncChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'DATA_UPDATED') {
            callback(event.data);
          }
        };
      }
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(STORAGE_KEY_PREFIX)) {
          callback({ key: event.key.replace(STORAGE_KEY_PREFIX, ''), timestamp: Date.now() });
        }
      });
    },

    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    async login(username, password) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            sessionStorage.setItem('ht_admin_token', data.token);
            sessionStorage.setItem('ht_admin_user', JSON.stringify(data.user));
            return { success: true, user: data.user, token: data.token };
          }
          if (res.status === 500) {
            throw new Error('Server error, falling back to local storage');
          }
          return { success: false, error: data.error || 'Invalid credentials' };
        } catch (e) {
          console.warn('API login failed, falling back to local storage auth:', e);
        }
      }

      // Local fallback
      const auth = getLocal('auth', DEFAULT_DATA.auth);
      if (username === auth.user && password === auth.password) {
        const sessionUser = { user: auth.user, name: auth.name };
        sessionStorage.setItem('ht_admin_token', auth.token);
        sessionStorage.setItem('ht_admin_user', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser, token: auth.token };
      }
      return { success: false, error: 'Invalid username or password (Default: admin / admin123)' };
    },

    isAuthenticated() {
      return !!sessionStorage.getItem('ht_admin_token');
    },

    getCurrentUser() {
      try {
        const u = sessionStorage.getItem('ht_admin_user');
        return u ? JSON.parse(u) : { user: 'admin', name: 'Hassan Travel Admin' };
      } catch (e) {
        return { user: 'admin', name: 'Hassan Travel Admin' };
      }
    },

    logout() {
      sessionStorage.removeItem('ht_admin_token');
      sessionStorage.removeItem('ht_admin_user');
      return true;
    },

    async changePassword(oldPassword, newPassword) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const token = sessionStorage.getItem('ht_admin_token');
          const res = await fetch(`${API_BASE}/api/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ oldPassword, newPassword })
          });
          if (res.ok) return { success: true };
          const data = await res.json();
          return { success: false, error: data.error };
        } catch (e) {}
      }

      const auth = getLocal('auth', DEFAULT_DATA.auth);
      if (auth.password !== oldPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }
      auth.password = newPassword;
      setLocal('auth', auth);
      return { success: true };
    },

    // ----------------------------------------------------
    // BOOKINGS
    // ----------------------------------------------------
    async getBookings(filters = {}) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const params = new URLSearchParams(filters).toString();
          const res = await fetch(`${API_BASE}/api/bookings?${params}`);
          if (res.ok) {
            const data = await res.json();
            return data.bookings || [];
          }
        } catch (e) {}
      }

      let list = getLocal('bookings', DEFAULT_DATA.bookings);
      if (filters.status && filters.status !== 'All') {
        list = list.filter(b => b.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(b => 
          (b.full_name && b.full_name.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.phone && b.phone.toLowerCase().includes(q)) ||
          (b.destination && b.destination.toLowerCase().includes(q)) ||
          (String(b.id).includes(q))
        );
      }
      return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    async createBooking(bookingData) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
          });
          if (res.ok) {
            const data = await res.json();
            return { success: true, bookingId: data.bookingId };
          }
        } catch (e) {}
      }

      const list = getLocal('bookings', DEFAULT_DATA.bookings);
      const newBooking = {
        id: Date.now(),
        destination: bookingData.destination || 'Custom Tour',
        travel_date: bookingData.travel_date || 'Flexible',
        travelers: bookingData.travelers || '2 Adults',
        full_name: bookingData.full_name,
        email: bookingData.email,
        phone: bookingData.phone,
        special_requests: bookingData.special_requests || 'None',
        status: 'Pending',
        notes: 'Submitted from website',
        total_price: bookingData.total_price || 45000,
        created_at: new Date().toISOString()
      };
      list.unshift(newBooking);
      setLocal('bookings', list);
      return { success: true, bookingId: newBooking.id };
    },

    async updateBookingStatus(id, newStatus, notes = null) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, notes })
          });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      const list = getLocal('bookings', DEFAULT_DATA.bookings);
      const idx = list.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) {
        list[idx].status = newStatus;
        if (notes !== null) list[idx].notes = notes;
        list[idx].updated_at = new Date().toISOString();
        setLocal('bookings', list);
        return { success: true };
      }
      return { success: false, error: 'Booking not found' };
    },

    async updateBooking(id, updatedFields) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
          });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      const list = getLocal('bookings', DEFAULT_DATA.bookings);
      const idx = list.findIndex(b => String(b.id) === String(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatedFields, updated_at: new Date().toISOString() };
        setLocal('bookings', list);
        return { success: true };
      }
      return { success: false, error: 'Booking not found' };
    },

    async deleteBooking(id) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      let list = getLocal('bookings', DEFAULT_DATA.bookings);
      list = list.filter(b => String(b.id) !== String(id));
      setLocal('bookings', list);
      return { success: true };
    },

    // ----------------------------------------------------
    // DESTINATIONS
    // ----------------------------------------------------
    async getDestinations() {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/destinations`);
          if (res.ok) {
            const data = await res.json();
            return data.destinations || [];
          }
        } catch (e) {}
      }
      return getLocal('destinations', DEFAULT_DATA.destinations);
    },

    async saveDestination(destData) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const method = destData.id ? 'PUT' : 'POST';
          const url = destData.id ? `${API_BASE}/api/destinations/${destData.id}` : `${API_BASE}/api/destinations`;
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(destData)
          });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      const list = getLocal('destinations', DEFAULT_DATA.destinations);
      if (destData.id) {
        const idx = list.findIndex(d => String(d.id) === String(destData.id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...destData };
        }
      } else {
        const newDest = { ...destData, id: Date.now() };
        list.push(newDest);
      }
      setLocal('destinations', list);
      return { success: true };
    },

    async deleteDestination(id) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/destinations/${id}`, { method: 'DELETE' });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      let list = getLocal('destinations', DEFAULT_DATA.destinations);
      list = list.filter(d => String(d.id) !== String(id));
      setLocal('destinations', list);
      return { success: true };
    },

    // ----------------------------------------------------
    // TOURS & PACKAGES
    // ----------------------------------------------------
    async getTours() {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/tours`);
          if (res.ok) {
            const data = await res.json();
            return data.tours || [];
          }
        } catch (e) {}
      }
      return getLocal('tours', DEFAULT_DATA.tours);
    },

    async saveTour(tourData) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const method = tourData.id ? 'PUT' : 'POST';
          const url = tourData.id ? `${API_BASE}/api/tours/${tourData.id}` : `${API_BASE}/api/tours`;
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tourData)
          });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      const list = getLocal('tours', DEFAULT_DATA.tours);
      if (tourData.id) {
        const idx = list.findIndex(t => String(t.id) === String(tourData.id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...tourData };
        }
      } else {
        const newTour = { ...tourData, id: Date.now() };
        list.push(newTour);
      }
      setLocal('tours', list);
      return { success: true };
    },

    async deleteTour(id) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/tours/${id}`, { method: 'DELETE' });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      let list = getLocal('tours', DEFAULT_DATA.tours);
      list = list.filter(t => String(t.id) !== String(id));
      setLocal('tours', list);
      return { success: true };
    },

    // ----------------------------------------------------
    // SITE CONTENT (CMS)
    // ----------------------------------------------------
    async getContent() {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/content`);
          if (res.ok) {
            const data = await res.json();
            return data.content || DEFAULT_DATA.site_content;
          }
        } catch (e) {}
      }
      return getLocal('site_content', DEFAULT_DATA.site_content);
    },

    async saveContent(section, sectionData) {
      const online = await checkApiOnline();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/api/content/${section}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sectionData)
          });
          if (res.ok) return { success: true };
        } catch (e) {}
      }

      const content = getLocal('site_content', DEFAULT_DATA.site_content);
      content[section] = { ...content[section], ...sectionData };
      setLocal('site_content', content);
      return { success: true };
    },

    // ----------------------------------------------------
    // DASHBOARD STATS
    // ----------------------------------------------------
    async getDashboardStats() {
      const bookings = await this.getBookings();
      const destinations = await this.getDestinations();
      const tours = await this.getTours();

      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
      const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
      const totalRevenue = bookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

      return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        totalDestinations: destinations.length,
        totalTours: tours.length,
        latestBooking: bookings.length > 0 ? bookings[0] : null
      };
    },

    // Reset everything to clean defaults
    resetToDefaults() {
      setLocal('site_content', DEFAULT_DATA.site_content);
      setLocal('destinations', DEFAULT_DATA.destinations);
      setLocal('tours', DEFAULT_DATA.tours);
      setLocal('bookings', DEFAULT_DATA.bookings);
      setLocal('auth', DEFAULT_DATA.auth);
      setLocal('initialized', true);
      return true;
    }
  };

  window.DataService = DataService;
})(window);

