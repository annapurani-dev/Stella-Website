const db = require('./db');

async function seed() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Seeding dummy data...');

        // 1. Create a dummy user if none exist
        let userId = 1;

        // 2. Insert dummy orders over the last 7 days
        for (let i = 0; i < 20; i++) {
            // random day within last 7 days
            const daysAgo = Math.floor(Math.random() * 7);
            const totalAmount = Math.floor(Math.random() * 50000) + 1000;
            const deliveryType = Math.random() > 0.5 ? 'home' : 'store';
            
            await client.query(
                `INSERT INTO orders (user_id, total_amount, delivery_type, payment_method, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${daysAgo} days')`,
                [userId, totalAmount, deliveryType, 'card', 'completed']
            );
        }

        // 3. Make some products have low stock
        // (Assuming products exist. If not, this won't do anything)
        const products = await client.query('SELECT id FROM products LIMIT 3');
        for (const p of products.rows) {
            await client.query('UPDATE products SET stock_quantity = 2 WHERE id = $1', [p.id]);
        }

        await client.query('COMMIT');
        console.log('Dummy data seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
