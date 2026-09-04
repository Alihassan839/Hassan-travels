# Hassan Travels - Full Stack Travel Platform & Admin CMS

A luxury, cinematic travel booking platform and Content Management System (CMS) for Northern Pakistan and Pilgrimage (Hajj & Umrah) journeys.

---

## 🚀 Key Features

### 🌐 Customer Website (`index.html`)
- **Cinematic Luxury Aesthetic:** Deep dark-navy palette (`#020617`), vibrant turquoise/teal accents, glassmorphism cards, and high-resolution visuals.
- **Dynamic Content & Tour Hydration:** All popular destinations, curated journeys, stats, hero banners, and contact information are dynamically loaded and update live from the Admin Panel.
- **Side-by-Side Dual Action Cards:** "Book Now" (triggers instant booking modal) and "View Details" (expands day-by-day itinerary & inclusions in place).
- **Fast Booking System:** Responsive booking modal with auto-selected destinations and real-time backend persistence.

### 🛡️ Professional Admin Panel (`admin.html`)
- **Secure Authentication:** Protected login dashboard with session persistence (Default credentials: `admin` / `admin123`).
- **Dashboard Overview:** Real-time KPI metrics (Total Bookings, Pending Review, Confirmed Tours, Revenue Volume in PKR) and quick action shortcuts.
- **Bookings Hub:**
  - Real-time search by customer name, email, phone, or destination.
  - Filter tabs: `All`, `Pending`, `Confirmed`, `Rejected`.
  - One-click **Accept (Confirm)** and **Reject** actions.
  - Comprehensive **Booking Drawer & Editor** to update customer contact info, travel dates, travelers, total price, and internal guide assignment notes.
  - Export all bookings to CSV with a single click.
- **Destinations & Places Manager:** Full CRUD to add new destinations (e.g. Chitral, Kalam, Swat), upload/set images, starting prices in PKR, star ratings, and itinerary highlights.
- **Tour Packages Manager:** Create curated journeys with interactive day-by-day itinerary builder (`+ Add Day`), pricing, duration, and inclusions.
- **Website CMS:** Live visual editor for Hero headlines, Taglines, Statistics counters, Hajj & Umrah package details, and Company Contact info.
- **Live Sync & Dual-Mode:** Works seamlessly both with the Node.js/SQLite backend (`http://localhost:3000`) and in standalone offline mode (`file:///`) with cross-tab live synchronization.

---

## 💻 How to Run & Test

### Option 1: Full-Stack Mode (Node.js + SQLite Database)
1. Open your terminal in the project directory:
   ```bash
   cd "C:\Users\dcui\Documents\antigravity demo proj"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access in your browser:
   - **Main Website:** `http://localhost:3000/index.html`
   - **Admin Panel:** `http://localhost:3000/admin.html`

### Option 2: Standalone Browser Mode
You can also directly open `index.html` and `admin.html` in any modern web browser. The built-in client data service (`assets/js/data-service.js`) will automatically use persistent LocalStorage with cross-tab BroadcastChannel sync. Any change you save in `admin.html` will instantly appear on `index.html`!

---

## 🔑 Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`
*(You can also change the password anytime directly in Admin Settings)*
