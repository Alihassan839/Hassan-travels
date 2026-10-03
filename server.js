const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Initialize PostgreSQL Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hassan_travels',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        release();
        initDatabaseTables();
    }
});

async function initDatabaseTables() {
    try {
        // 1. Bookings Table
        await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            destination TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            travelers TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            special_requests TEXT,
            status TEXT DEFAULT 'Pending',
            notes TEXT DEFAULT '',
            total_price INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Destinations Table
        await pool.query(`CREATE TABLE IF NOT EXISTS destinations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            region TEXT NOT NULL,
            rating REAL DEFAULT 4.8,
            price INTEGER NOT NULL,
            image TEXT NOT NULL,
            description TEXT,
            highlights TEXT,
            history TEXT,
            distance TEXT,
            is_popular INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 3. Tour Packages Table
        await pool.query(`CREATE TABLE IF NOT EXISTS tours (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            duration TEXT NOT NULL,
            tour_type TEXT NOT NULL,
            badge TEXT DEFAULT '',
            rating REAL DEFAULT 4.8,
            price INTEGER NOT NULL,
            image TEXT NOT NULL,
            overview TEXT,
            inclusions TEXT,
            itinerary_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 4. Site Content (CMS) Table
        await pool.query(`CREATE TABLE IF NOT EXISTS site_content (
            section_key TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 5. Admin Users Table
        await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed initial data if empty
        await seedInitialData();
    } catch (err) {
        console.error('Error initializing tables:', err);
    }
}

async function seedInitialData() {
    try {
        // Seed Admin User
        const adminRes = await pool.query(`SELECT COUNT(*) as count FROM admin_users`);
        if (parseInt(adminRes.rows[0].count) === 0) {
            await pool.query(`INSERT INTO admin_users (username, password, name, role) VALUES ($1, $2, $3, $4)`,
                ['admin', 'admin123', 'Hassan Travel Admin', 'Super Admin']);
            console.log('Default admin user created: admin / admin123');
        }

        // Seed Destinations
        const destRes = await pool.query(`SELECT COUNT(*) as count FROM destinations`);
        if (parseInt(destRes.rows[0].count) === 0) {
            const dests = [
                ['Hunza Valley', 'Gilgit-Baltistan', 4.9, 45000, 'images/hunza.jpg', 'Experience the breathtaking views of the Karakoram peaks. Best time to visit is from April to October.', '5 to 7 Days Packages\nLuxury & Standard Hotels\nDedicated 4x4 Transport', 'An ancient princely state that survived for over 900 years, known for its longevity myths and Silk Road heritage.', '600 km from Islamabad', 1, 1],
                ['Skardu', 'Gilgit-Baltistan', 4.8, 55000, 'images/skardu.jpg', 'Explore the cold desert, Shangrila lake, and Deosai plains. Perfect for adventure lovers.', 'Direct Flights from Islamabad\nLakefront Resorts available\nPrivate Jeeps for Deosai', 'A historic gateway to the 8,000-meter peaks, once part of the Tibetan Empire.', '630 km from Islamabad (1 hr flight)', 1, 2],
                ['Naran Kaghan', 'Khyber Pakhtunkhwa', 4.7, 35000, 'images/naran.jpg', 'The ultimate family getaway to Lake Saif ul Malook, Babusar Top, and Lulusar Lake.', '3 to 5 Days Itineraries\nFamily Suite Accommodations\nRafting & Trekking options', 'Historically a major route for merchants and travelers heading to Gilgit.', '280 km from Islamabad', 1, 3],
                ['Swat Valley', 'Khyber Pakhtunkhwa', 4.9, 38000, 'images/swat.jpg', 'The Switzerland of the East. Enjoy the lush green valleys of Kalam, Malam Jabba, and Mahodand Lake.', '4 Days / 3 Nights Packages\nSkiing in Malam Jabba (Winter)\nRiverside Camping available', 'A major center of early Buddhism, later ruled by various dynasties including the Ghaznavids.', '250 km from Islamabad', 1, 4],
                ['Fairy Meadows', 'Diamer District', 4.9, 42000, 'images/fairy_meadows.jpg', 'A majestic trek to the base camp of Nanga Parbat, the 9th highest mountain in the world.', '5 Days Adventure Trek\nWooden Cabins & Camping\nJeep Safari & Trekking Guide', 'Named "Märchenwiese" (Fairy Tale Meadows) by German climbers in the 1930s.', '400 km from Islamabad', 1, 5],
                ['Neelum Valley', 'Azad Kashmir', 4.8, 40000, 'images/neelum.jpg', 'Crystal-clear rivers, lush green mountains, and wooden villages of Kashmir.', 'Arang Kel Cable Car\nSharda University Ruins\nRiverside Resorts', 'A valley rich in Kashmiri culture, historically a major center of learning in ancient India.', '240 km from Islamabad', 1, 6]
            ];
            for (const d of dests) {
                await pool.query(`INSERT INTO destinations (name, region, rating, price, image, description, highlights, history, distance, is_popular, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, d);
            }
            console.log('Default destinations seeded.');
        }

        // Seed Tour Packages
        const tourRes = await pool.query(`SELECT COUNT(*) as count FROM tours`);
        if (parseInt(tourRes.rows[0].count) === 0) {
            const tours = [
                [
                    'Hunza & Skardu Escape', '7 Days / 6 Nights', 'Private Tour', 'Best Seller', 4.9, 120000, 'images/gilgit.jpg',
                    'A comprehensive journey through the Karakoram Highway covering the best of Gilgit-Baltistan.',
                    'Luxury 4x4 Prado with fuel & driver\n4-Star Hotel stays with daily breakfast\nAttabad lake boat ride & Fort entry tickets\nDedicated 24/7 travel guide support',
                    JSON.stringify([
                        { day: 'Day 1', title: 'Arrival in Gilgit & Transfer to Hunza' },
                        { day: 'Day 2', title: 'Baltit Fort & Altit Fort' },
                        { day: 'Day 3', title: 'Attabad Lake & Passu Cones' },
                        { day: 'Day 4', title: 'Drive to Skardu via Deosai' },
                        { day: 'Day 5', title: 'Shangrila Resort & Kachura Lake' },
                        { day: 'Day 6', title: 'Shigar Fort & Cold Desert' },
                        { day: 'Day 7', title: 'Departure from Skardu' }
                    ])
                ],
                [
                    'Kashmir Valley Retreat', '5 Days / 4 Nights', 'Group / Private', 'Scenic Nature', 4.8, 45000, 'images/neelum.jpg',
                    'Explore the lush green forests and rivers of Neelum Valley, Arang Kel, and Sharda.',
                    'Dedicated Grand Cabin / Coaster or Private Car\nRiverside Hotel Accommodations\nDaily Breakfast & Dinner\nArang Kel chairlift & local guide',
                    JSON.stringify([
                        { day: 'Day 1', title: 'Arrival in Muzaffarabad & Transfer to Keran' },
                        { day: 'Day 2', title: 'Sharda & Kel Exploration' },
                        { day: 'Day 3', title: 'Hike to Arang Kel' },
                        { day: 'Day 4', title: 'Return via Kutton Waterfall' },
                        { day: 'Day 5', title: 'Departure' }
                    ])
                ],
                [
                    'Swat & Kalam Wonders', '4 Days / 3 Nights', 'Family Tour', 'Family Friendly', 4.7, 35000, 'images/kalam.jpg',
                    'Discover the Switzerland of the East with its waterfalls, pine forests, and cool weather.',
                    'Dedicated comfortable AC vehicle\n3-Star family resort stays\nDaily breakfast\nJeep safari to Mahodand Lake',
                    JSON.stringify([
                        { day: 'Day 1', title: 'Arrival in Swat & Mingora' },
                        { day: 'Day 2', title: 'Malam Jabba Ski Resort' },
                        { day: 'Day 3', title: 'Kalam Valley & Ushu Forest' },
                        { day: 'Day 4', title: 'Mahodand Lake & Departure' }
                    ])
                ]
            ];
            for (const t of tours) {
                await pool.query(`INSERT INTO tours (title, duration, tour_type, badge, rating, price, image, overview, inclusions, itinerary_json) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, t);
            }
            console.log('Default tour packages seeded.');
        }

        // Seed Site Content
        const contentRes = await pool.query(`SELECT COUNT(*) as count FROM site_content`);
        if (parseInt(contentRes.rows[0].count) === 0) {
            const defaultContent = {
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
            };
            
            for (const [key, val] of Object.entries(defaultContent)) {
                await pool.query(`INSERT INTO site_content (section_key, data_json) VALUES ($1, $2)`, [key, JSON.stringify(val)]);
            }
            console.log('Default site content seeded.');
        }

        // Seed Sample Bookings
        const bookingsRes = await pool.query(`SELECT COUNT(*) as count FROM bookings`);
        if (parseInt(bookingsRes.rows[0].count) === 0) {
            const sampleBookings = [
                ['Hunza & Skardu Escape', '2026-10-15', '2 Adults', 'Dr. Zeeshan Tariq', 'zeeshan.tariq@gmail.com', '+92 321 8844221', 'Honeymoon couple, mountain view room requested.', 'Confirmed', 'Deposit received.', 120000],
                ['Swat & Kalam Wonders', '2026-09-22', 'Family (3-4)', 'Ayesha Siddiqui', 'ayesha.s@outlook.com', '+92 300 4591188', 'Traveling with elderly parents, ground floor rooms.', 'Pending', 'Awaiting date confirmation.', 70000],
                ['Fairy Meadows', '2026-09-28', 'Group (5+)', 'Usman Ali Cheema', 'usman.cheema@yahoo.com', '+92 333 9922110', 'Trekking expedition with camping equipment.', 'Confirmed', '6 people group, Jeeps reserved.', 252000]
            ];
            for (const b of sampleBookings) {
                await pool.query(`INSERT INTO bookings (destination, travel_date, travelers, full_name, email, phone, special_requests, status, notes, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, b);
            }
            console.log('Default sample bookings seeded.');
        }
    } catch (err) {
        console.error('Error seeding data:', err);
    }
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database Initialization (for Serverless / Vercel)
app.get('/api/init', async (req, res) => {
    try {
        await initDatabaseTables();
        res.json({ success: true, message: 'Database tables created and seeded successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query(`SELECT id, username, name, role FROM admin_users WHERE username = $1 AND password = $2`, [username, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = result.rows[0];
        const token = 'ht_token_' + Buffer.from(`${user.id}_${Date.now()}`).toString('base64');
        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'New password must be at least 4 characters' });
        }
        const result = await pool.query(`SELECT id FROM admin_users WHERE username = 'admin' AND password = $1`, [oldPassword]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const user = result.rows[0];
        await pool.query(`UPDATE admin_users SET password = $1 WHERE id = $2`, [newPassword, user.id]);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. BOOKINGS
app.get('/api/bookings', async (req, res) => {
    try {
        const { status, search } = req.query;
        let sql = `SELECT * FROM bookings WHERE 1=1`;
        const params = [];
        let pIndex = 1;

        if (status && status !== 'All') {
            sql += ` AND status = $${pIndex++}`;
            params.push(status);
        }
        if (search) {
            sql += ` AND (full_name ILIKE $${pIndex} OR email ILIKE $${pIndex} OR phone ILIKE $${pIndex} OR destination ILIKE $${pIndex})`;
            const q = `%${search}%`;
            params.push(q);
            pIndex++;
        }
        sql += ` ORDER BY created_at DESC`;

        const result = await pool.query(sql, params);
        res.json({ count: result.rows.length, bookings: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const { destination, travel_date, travelers, full_name, email, phone, special_requests, total_price } = req.body;
        if (!destination || !full_name || !email || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sql = `INSERT INTO bookings (destination, travel_date, travelers, full_name, email, phone, special_requests, status, total_price) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8) RETURNING id`;
        const params = [destination, travel_date || 'Flexible', travelers || '2 Adults', full_name, email, phone, special_requests || 'None', total_price || 0];

        const result = await pool.query(sql, params);
        res.status(201).json({ success: true, message: 'Booking submitted', bookingId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/bookings/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;
        let sql = `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP`;
        const params = [status];
        let pIndex = 2;

        if (notes !== undefined && notes !== null) {
            sql += `, notes = $${pIndex++}`;
            params.push(notes);
        }
        sql += ` WHERE id = $${pIndex}`;
        params.push(req.params.id);

        const result = await pool.query(sql, params);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/bookings/:id', async (req, res) => {
    try {
        const { full_name, email, phone, destination, travel_date, travelers, special_requests, status, notes, total_price } = req.body;
        const sql = `UPDATE bookings SET full_name = $1, email = $2, phone = $3, destination = $4, travel_date = $5, travelers = $6, special_requests = $7, status = $8, notes = $9, total_price = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11`;
        const params = [full_name, email, phone, destination, travel_date, travelers, special_requests, status, notes, total_price, req.params.id];

        const result = await pool.query(sql, params);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM bookings WHERE id = $1`, [req.params.id]);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. DESTINATIONS
app.get('/api/destinations', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM destinations ORDER BY sort_order ASC, id ASC`);
        res.json({ destinations: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/destinations', async (req, res) => {
    try {
        const { name, region, rating, price, image, description, highlights, history, distance, is_popular, sort_order } = req.body;
        const sql = `INSERT INTO destinations (name, region, rating, price, image, description, highlights, history, distance, is_popular, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;
        const params = [name, region, rating || 4.8, price || 40000, image || 'images/hunza.jpg', description || '', highlights || '', history || '', distance || '', is_popular ? 1 : 0, sort_order || 0];

        const result = await pool.query(sql, params);
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/destinations/:id', async (req, res) => {
    try {
        const { name, region, rating, price, image, description, highlights, history, distance, is_popular, sort_order } = req.body;
        const sql = `UPDATE destinations SET name = $1, region = $2, rating = $3, price = $4, image = $5, description = $6, highlights = $7, history = $8, distance = $9, is_popular = $10, sort_order = $11 WHERE id = $12`;
        const params = [name, region, rating, price, image, description, highlights, history || '', distance || '', is_popular ? 1 : 0, sort_order || 0, req.params.id];

        const result = await pool.query(sql, params);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/destinations/:id', async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM destinations WHERE id = $1`, [req.params.id]);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. TOURS & PACKAGES
app.get('/api/tours', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM tours ORDER BY id ASC`);
        const tours = result.rows.map(r => ({
            ...r,
            itinerary: r.itinerary_json ? JSON.parse(r.itinerary_json) : []
        }));
        res.json({ tours });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tours', async (req, res) => {
    try {
        const { title, duration, tour_type, badge, rating, price, image, overview, inclusions, itinerary } = req.body;
        const sql = `INSERT INTO tours (title, duration, tour_type, badge, rating, price, image, overview, inclusions, itinerary_json) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;
        const params = [title, duration, tour_type, badge || '', rating || 4.8, price, image || 'images/gilgit.jpg', overview || '', inclusions || '', JSON.stringify(itinerary || [])];

        const result = await pool.query(sql, params);
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tours/:id', async (req, res) => {
    try {
        const { title, duration, tour_type, badge, rating, price, image, overview, inclusions, itinerary } = req.body;
        const sql = `UPDATE tours SET title = $1, duration = $2, tour_type = $3, badge = $4, rating = $5, price = $6, image = $7, overview = $8, inclusions = $9, itinerary_json = $10 WHERE id = $11`;
        const params = [title, duration, tour_type, badge || '', rating || 4.8, price, image || 'images/gilgit.jpg', overview || '', inclusions || '', JSON.stringify(itinerary || []), req.params.id];

        const result = await pool.query(sql, params);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tours/:id', async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM tours WHERE id = $1`, [req.params.id]);
        res.json({ success: true, changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SITE CONTENT (CMS)
app.get('/api/content', async (req, res) => {
    try {
        const result = await pool.query(`SELECT section_key, data_json FROM site_content`);
        const content = {};
        result.rows.forEach(r => {
            try { content[r.section_key] = JSON.parse(r.data_json); } catch (e) {}
        });
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/content/:section', async (req, res) => {
    try {
        const section = req.params.section;
        const dataJson = JSON.stringify(req.body);
        const sql = `INSERT INTO site_content (section_key, data_json, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
                     ON CONFLICT(section_key) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP`;
        
        await pool.query(sql, [section, dataJson]);
        res.json({ success: true, section });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. DASHBOARD AGGREGATE STATS
app.get('/api/stats/dashboard', async (req, res) => {
    try {
        const bookingsRes = await pool.query(`SELECT status, total_price FROM bookings`);
        const destRes = await pool.query(`SELECT COUNT(*) as destcount FROM destinations`);
        const tourRes = await pool.query(`SELECT COUNT(*) as tourcount FROM tours`);

        const bookings = bookingsRes.rows;
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
        const revenue = bookings
            .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
            .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

        res.json({
            totalBookings: total,
            pendingBookings: pending,
            confirmedBookings: confirmed,
            totalRevenue: revenue,
            totalDestinations: parseInt(destRes.rows[0].destcount),
            totalTours: parseInt(tourRes.rows[0].tourcount)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server locally if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`Hassan Travels Backend Server Online`);
        console.log(`Main Website:    http://localhost:${PORT}/index.html`);
        console.log(`Admin Dashboard: http://localhost:${PORT}/admin.html`);
        console.log(`REST API Base:   http://localhost:${PORT}/api/health`);
        console.log(`========================================`);
    });
}

// Export Express app for Vercel Serverless Functions
module.exports = app;

// Graceful Shutdown
process.on('SIGINT', () => {
    pool.end(() => {
        console.log('PostgreSQL database connection closed.');
        process.exit(0);
    });
});

