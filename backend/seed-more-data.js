const db = require('./db');

async function seed() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Seeding extended dummy data for the last 365 days...');

        // 1. Ensure user exists or use user_id = 1
        let userId = 1;

        // 2. Insert ~150 random orders over the last 365 days
        for (let i = 0; i < 150; i++) {
            const daysAgo = Math.floor(Math.random() * 365);
            const totalAmount = Math.floor(Math.random() * 80000) + 2000;
            const deliveryType = Math.random() > 0.5 ? 'home' : 'store';
            
            await client.query(
                `INSERT INTO orders (user_id, total_amount, delivery_type, payment_method, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${daysAgo} days')`,
                [userId, totalAmount, deliveryType, 'card', 'completed']
            );
        }

        await client.query('COMMIT');
        console.log('Extended dummy data seeded successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
