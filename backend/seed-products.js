const db = require('./db');

async function seed() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Seeding dummy products...');

        const dummyProducts = [
            {
                name: "Stella Pro Max X",
                price: 129900,
                stock_quantity: 45,
                description: "The ultimate flagship device. Unprecedented power wrapped in titanium.",
                image_url: "https://images.unsplash.com/photo-1592899677974-c460ce17b44c?q=80&w=600&auto=format&fit=crop",
                category_id: 1, // Assume 1 is Phones
                specs: JSON.stringify({ Processor: "Stellar A1", RAM: "16GB", Storage: "1TB", Camera: "200MP Leica" }),
                is_deal_of_day: false
            },
            {
                name: "Stella Earbuds Pro",
                price: 24900,
                stock_quantity: 120,
                description: "Studio quality audio in a form factor that disappears in your ear.",
                image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
                category_id: 2, // Assume 2 is Accessories
                specs: JSON.stringify({ Battery: "30 Hours", ANC: "Adaptive", WaterResistant: "IPX4" }),
                is_deal_of_day: false
            },
            {
                name: "Stella Watch Series 9",
                price: 45000,
                stock_quantity: 60,
                description: "Track your health with military precision.",
                image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop",
                category_id: 2,
                specs: JSON.stringify({ Display: "OLED Edge", Battery: "3 Days", Sensors: "ECG, O2" }),
                is_deal_of_day: false
            },
            {
                name: "Stella Lite",
                price: 54000,
                stock_quantity: 200,
                description: "Everything you need, nothing you don't. Pure minimalist elegance.",
                image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
                category_id: 1,
                specs: JSON.stringify({ Processor: "Stellar A1", RAM: "8GB", Storage: "256GB" }),
                is_deal_of_day: false
            },
            {
                name: "Stella Fold Premium",
                price: 189000,
                stock_quantity: 15,
                description: "Unfold the future with our revolutionary hinge mechanism.",
                image_url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop",
                category_id: 1,
                specs: JSON.stringify({ Screen: "8-inch Foldable OLED", RAM: "16GB" }),
                is_deal_of_day: false
            },
            {
                name: "Stella Charger 100W",
                price: 5900,
                stock_quantity: 300,
                description: "Charge your devices from 0 to 100 in 20 minutes.",
                image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop",
                category_id: 2,
                specs: JSON.stringify({ Output: "100W PD", Ports: "2x USB-C" }),
                is_deal_of_day: false
            }
        ];

        for (const p of dummyProducts) {
            await client.query(
                `INSERT INTO products (name, price, stock_quantity, description, image_url, category_id, specs, is_deal_of_day)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                 [p.name, p.price, p.stock_quantity, p.description, p.image_url, p.category_id, p.specs, p.is_deal_of_day]
            );
        }

        await client.query('COMMIT');
        console.log('Dummy products seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding products:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
