CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'customer', -- 'customer' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT, -- Primary image
    additional_images TEXT[], -- Array of image URLs
    specs JSONB, -- Detailed specifications
    is_deal_of_day BOOLEAN DEFAULT false,
    deal_label VARCHAR(255), -- e.g. "Flat 10% Off"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_type VARCHAR(50) NOT NULL, -- 'delivery' or 'pickup'
    address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'upi_qr', 'pay_at_store'
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    razorpay_order_id VARCHAR(255),
    upi_utr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- Site Configuration Table for Homepage/Franchise settings
CREATE TABLE IF NOT EXISTS site_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed for Site Config
INSERT INTO site_config (config_key, config_value) VALUES 
('homepage_hero', '{
    "slides": [
        {
            "id": 1,
            "title": "Unleash the Future",
            "subtitle": "The Next Generation is here.",
            "image": "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1920&q=80"
        }
    ],
    "buttonText": "Pre-Order Now"
}'),
('franchise_details', '{
    "title": "Partner with Stella",
    "description": "Join the fastest growing mobile franchise in India.",
    "bannerImg": "https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80",
    "stats": [
        {"label": "Outlets", "value": "50+"},
        {"label": "Growth", "value": "200%"}
    ]
}')
ON CONFLICT (config_key) DO NOTHING;
