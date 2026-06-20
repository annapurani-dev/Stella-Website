-- ==============================================
-- Stella Mobiles - Complete Dummy Data Seed (MariaDB)
-- ==============================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE addresses;
TRUNCATE TABLE categories;
TRUNCATE TABLE branches;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (name, phone_number, role) VALUES
('Stella Admin', '9999999999', 'admin'),
('John Doe', '9876543210', 'customer'),
('Jane Smith', '9876543211', 'customer'),
('Rahul Sharma', '9876543212', 'customer'),
('Priya Patel', '9876543213', 'customer'),
('Arun Kumar', '9876543214', 'customer');

-- Addresses
INSERT INTO addresses (user_id, street_address, city, state, postal_code, is_default) VALUES
(2, '45 MG Road, Koramangala', 'Bangalore', 'Karnataka', '560034', 1),
(2, '12 Tech Park Avenue, Whitefield', 'Bangalore', 'Karnataka', '560066', 0),
(3, '78 Marine Drive', 'Mumbai', 'Maharashtra', '400020', 1),
(4, '102 Shanthi Colony', 'Chennai', 'Tamil Nadu', '600040', 1),
(5, '55 Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 1);

-- Branches
INSERT INTO branches (name, address, phone_number, latitude, longitude) VALUES
('Stella Anna Nagar (Flagship)', 'Shanthi Colony Main Rd, Anna Nagar, Chennai', '+91 44 2626 1111', 13.0850, 80.2100),
('Stella T-Nagar', 'Pondy Bazaar Main Rd, T-Nagar, Chennai', '+91 44 2828 2222', 13.0396, 80.2330),
('Stella Adyar', 'MG Road, Shastri Nagar, Adyar, Chennai', '+91 44 2424 3333', 13.0012, 80.2565),
('Stella Indiranagar', '100 Feet Road, Indiranagar, Bangalore', '+91 80 4141 4444', 12.9784, 77.6408),
('Stella Bandra', 'Linking Road, Bandra West, Mumbai', '+91 22 2626 5555', 19.0596, 72.8295);

-- Categories
INSERT INTO categories (name, description) VALUES
('Smartphones', 'Flagship and premium smartphones'),
('Tablets', 'iPads, Galaxy Tabs, and more'),
('Wearables', 'Smartwatches and fitness trackers'),
('Audio', 'TWS, headphones, and speakers'),
('Accessories', 'Cases, chargers, hubs, and cables'),
('Gadgets', 'Drones, gimbals, and smart home tech');

-- Products
INSERT INTO products (name, category_id, description, price, stock_quantity, image_url, additional_images, specs, is_deal_of_day, deal_label) VALUES
('iPhone 15 Pro Max', 1, 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.', 159900.00, 25, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1696446702183-cbd13d789078?auto=format&fit=crop&w=800&q=80'), JSON_OBJECT('Display', '6.7-inch Super Retina XDR', 'Chip', 'A17 Pro', 'Camera', '48MP Main, 5x Telephoto'), 1, 'BEST SELLER'),
('Samsung Galaxy S24 Ultra', 1, 'Welcome to the era of mobile AI. Unleash whole new levels of creativity and productivity.', 129999.00, 15, 'https://images.unsplash.com/photo-1707064434685-6e06821ba293?auto=format&fit=crop&w=800&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1707064434195-076f8319f39a?auto=format&fit=crop&w=800&q=80'), JSON_OBJECT('Display', '6.8-inch QHD+ Dynamic AMOLED', 'Chip', 'Snapdragon 8 Gen 3', 'Pen', 'Built-in S Pen'), 1, 'GALAXY AI'),
('Google Pixel 8 Pro', 1, 'The all-pro phone engineered by Google. Features the best Pixel camera yet and Google AI.', 106999.00, 30, 'https://images.unsplash.com/photo-1697525381677-674b898d9255?auto=format&fit=crop&w=800&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1697525381373-3e75a6c17e33?auto=format&fit=crop&w=800&q=80'), JSON_OBJECT('Display', '6.7-inch Super Actua', 'Chip', 'Tensor G3', 'Camera', '50MP Main'), 0, NULL),
('OnePlus 12 5G', 1, 'Smooth beyond belief. Experience the ultimate flagship performance with Hasselblad cameras.', 64999.00, 45, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Display', '6.82-inch ProXDR', 'Chip', 'Snapdragon 8 Gen 3', 'Battery', '5400mAh'), 0, NULL),
('iPad Air M2', 2, 'Light. Bright. Full of might. Supercharged by the Apple M2 chip.', 59900.00, 40, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=800&q=80'), JSON_OBJECT('Display', '11-inch Liquid Retina', 'Chip', 'Apple M2'), 1, '15% OFF'),
('Samsung Galaxy Tab S9 Ultra', 2, 'The ultimate tablet experience with Dynamic AMOLED 2X and water resistance.', 119999.00, 10, 'https://images.unsplash.com/photo-1627918386377-b952f44760a9?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Display', '14.6-inch AMOLED', 'Pen', 'S Pen Included'), 0, NULL),
('Apple Watch Ultra 2', 3, 'The most rugged and capable Apple Watch. Designed for outdoor adventures and supercharged workouts.', 89900.00, 20, 'https://images.unsplash.com/photo-1434493789847-2f02b0c166d2?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Case', '49mm Titanium', 'Display', '3000 nits OLED'), 0, NULL),
('Samsung Galaxy Watch 6 Classic', 3, 'The smartwatch that knows you best, with a rotating bezel and advanced health tracking.', 36999.00, 35, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Dial', '47mm Stainless Steel', 'Battery', '425mAh'), 0, NULL),
('Stella Premium TWS Buds', 4, 'Immersive active noise cancellation with spatial audio support.', 14999.00, 100, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('ANC', 'Up to 45dB', 'Battery', '30 Hours'), 1, 'HOT SELLER'),
('Sony WH-1000XM5', 4, 'Industry-leading noise canceling headphones with Auto NC Optimizer.', 29990.00, 15, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Type', 'Over-Ear', 'Battery', '30 Hours'), 0, NULL),
('Stella MagSafe Fast Charger', 5, '15W wireless magnetic charging pad with premium braided cable.', 2999.00, 200, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Output', '15W', 'Type', 'Magnetic Wireless'), 0, NULL),
('Stella Carbon Fiber Case for iPhone 15 Pro', 5, 'Ultra-thin, military-grade drop protection with a sleek carbon fiber finish.', 1999.00, 150, 'https://images.unsplash.com/photo-1603313011101-320f66a4f360?auto=format&fit=crop&w=800&q=80', JSON_ARRAY(), JSON_OBJECT('Material', 'Aramid Fiber', 'Weight', '12g'), 0, NULL);

-- Orders
INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, branch_id, payment_method, payment_status, created_at) VALUES
(2, 'delivered', 159900.00, 'delivery', 1, NULL, 'razorpay', 'paid', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'shipped', 29990.00, 'delivery', 3, NULL, 'upi_qr', 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'processing', 14999.00, 'pickup', NULL, 1, 'pay_at_store', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'pending', 89900.00, 'delivery', 5, NULL, 'razorpay', 'paid', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 'cancelled', 2999.00, 'delivery', 1, NULL, 'upi_qr', 'failed', DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 159900.00),
(2, 10, 1, 29990.00),
(3, 9, 1, 14999.00),
(4, 7, 1, 89900.00),
(5, 11, 1, 2999.00);

-- Reviews
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
(2, 1, 5, 'The titanium finish is absolutely stunning. Upgraded from the 13 Pro and the camera is a huge leap.', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 10, 5, 'Best noise cancellation I have ever experienced. Perfect for my daily commute.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 9, 4, 'Great sound quality for the price. The ANC is good but could be slightly better in windy conditions.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 7, 5, 'Battery life is incredible. I only charge it once every 3 days. A must-have for runners.', DATE_SUB(NOW(), INTERVAL 20 DAY));

-- Site config: homepage
INSERT INTO site_config (config_key, config_value) VALUES
('homepage', '{
    "hero": {
        "slides": [
            {
                "id": 1,
                "title": "Unleash the Future",
                "subtitle": "Experience the next generation of mobile performance and design.",
                "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80"
            },
            {
                "id": 2,
                "title": "Titanium Strength",
                "subtitle": "Aerospace-grade titanium design. Incredibly strong. Incredibly light.",
                "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80"
            },
            {
                "id": 3,
                "title": "Pure Audio Bliss",
                "subtitle": "Crystal clear sound with advanced active noise cancellation technology.",
                "image": "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1920&q=80"
            }
        ],
        "buttonText": "Discover Elite",
        "deals": { "show": true, "items": [] }
    },
    "franchise": {
        "title": "Partner with Stella",
        "description": "Join the fastest growing mobile franchise in India with zero franchise fees and full marketing support.",
        "bannerImg": "https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80",
        "stats": [
            {"label": "Outlets", "value": "50+"},
            {"label": "Growth", "value": "200%"}
        ],
        "hubs": [
            {"tag": "Flagship Hub", "name": "Stella Anna Nagar", "address": "Shanthi Colony Main Rd, Anna Nagar, Chennai - 400040", "phone": "+91 44 2626 XXXX", "hours": "10 AM - 9 PM"},
            {"tag": "Express Hub", "name": "Stella T-Nagar", "address": "Pondy Bazaar Main Rd, T-Nagar, Chennai - 400017", "phone": "+91 44 2828 XXXX", "hours": "10 AM - 9 PM"},
            {"tag": "Premium Hub", "name": "Stella Adyar", "address": "MG Road, Shastri Nagar, Adyar, Chennai - 400020", "phone": "+91 44 2424 XXXX", "hours": "10 AM - 9 PM"}
        ]
    },
    "our_story": {
        "vision_title": "The Stella Vision",
        "vision_text": "Founded in the heart of Chennai, Stella Mobiles began with a simple belief: that premium technology should be accompanied by a premium experience.",
        "hero_image": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80",
        "stats": [
            {"value": "15k+", "label": "Happy Customers"},
            {"value": "02", "label": "Elite Hubs"},
            {"value": "24h", "label": "Express Delivery"}
        ]
    },
    "testimonials": {
        "col1": [
            {"id": 1, "name": "Rahul S.", "text": "Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.", "stars": 5},
            {"id": 2, "name": "Priya K.", "text": "Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!", "stars": 5},
            {"id": 3, "name": "Vikram M.", "text": "Authentic products and 0% UPI fee makes a huge difference when buying flagships.", "stars": 5}
        ],
        "col2": [
            {"id": 4, "name": "Anjali R.", "text": "Super fast checkout! The custom UPI payments are fully transparent and fee-free.", "stars": 5},
            {"id": 5, "name": "Karthik B.", "text": "Elite premium customer support. Setup my new smartphone right in their luxury lounge.", "stars": 5},
            {"id": 6, "name": "Deepa T.", "text": "Outstanding store design. The bento layout and dark mode look premium online & offline.", "stars": 5}
        ],
        "col3": [
            {"id": 7, "name": "Sanjay V.", "text": "Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.", "stars": 5},
            {"id": 8, "name": "Meera N.", "text": "Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.", "stars": 5},
            {"id": 9, "name": "Arun K.", "text": "Stella franchise protocol is highly systematic. Excited to grow our partnership.", "stars": 5}
        ]
    }
}')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

INSERT INTO site_config (config_key, config_value) VALUES
('category_filters', '{
    "Smartphones": [
        { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Google", "OnePlus"] },
        { "name": "Storage", "key": "Storage", "options": ["128GB", "256GB", "512GB", "1TB"] },
        { "name": "RAM", "key": "RAM", "options": ["8GB", "12GB", "16GB"] }
    ],
    "Audio": [
        { "name": "Brand", "key": "brand", "options": ["Stella", "Sony", "Bose", "Apple"] },
        { "name": "Type", "key": "Type", "options": ["ANC Earbuds", "Wireless Over-Ear", "Gaming Headset"] }
    ],
    "Accessories": [
        { "name": "Type", "key": "Type", "options": ["Chargers", "Protective Cases", "Cables", "Power Banks"] }
    ],
    "Tablets": [
        { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Lenovo"] },
        { "name": "Storage", "key": "Storage", "options": ["64GB", "128GB", "256GB", "512GB"] }
    ],
    "Wearables": [
        { "name": "Brand", "key": "brand", "options": ["Apple", "Samsung", "Garmin"] },
        { "name": "Feature", "key": "Feature", "options": ["Cellular", "GPS Only", "Rugged"] }
    ]
}')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);
