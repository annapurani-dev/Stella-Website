/**
 * seed-customer-test-data.js
 * Seeds dummy addresses, active orders (for tracking tab) and
 * completed orders (for order history tab) for the test customer (user id = 2).
 *
 * Run: node seed-customer-test-data.js
 */

const db = require('./db/index');
require('dotenv').config();

const CUSTOMER_ID = 2; // John Doe in complete-seed.sql

async function seed() {
    const client = await db.pool.connect();
    try {
        await client.query('START TRANSACTION');
        console.log('🌱 Seeding customer test data for user ID:', CUSTOMER_ID);

        // ─────────────────────────────────────────
        // 1. ADDRESSES
        // ─────────────────────────────────────────
        // Clear existing addresses for this user first
        await client.query('DELETE FROM addresses WHERE user_id = $1', [CUSTOMER_ID]);
        console.log('  ✓ Cleared old addresses');

        const addr1 = await client.query(
            `INSERT INTO addresses (user_id, street_address, city, state, postal_code, is_default, landmark, address_name)
             VALUES ($1, '12, Lotus Apartments, 3rd Cross Street, Adyar', 'Chennai', 'Tamil Nadu', '600020', true, 'Near Adyar Bus Depot', 'Priya Sharma')
             RETURNING id`,
            [CUSTOMER_ID]
        );
        const addr2 = await client.query(
            `INSERT INTO addresses (user_id, street_address, city, state, postal_code, is_default, landmark, address_name)
             VALUES ($1, '45B, Brigade Road, Koramangala 5th Block', 'Bengaluru', 'Karnataka', '560095', false, 'Opposite Forum Mall', 'Rohan Mehta')
             RETURNING id`,
            [CUSTOMER_ID]
        );
        await client.query(
            `INSERT INTO addresses (user_id, street_address, city, state, postal_code, is_default, landmark, address_name)
             VALUES ($1, '8, Anand Nagar, Sector 14', 'Mumbai', 'Maharashtra', '400061', false, 'Near Andheri Railway Station', 'Ananya Pillai')`,
            [CUSTOMER_ID]
        );
        const addr1Id = addr1.rows[0].id;
        const addr2Id = addr2.rows[0].id;
        console.log('  ✓ Inserted 3 addresses');

        // ─────────────────────────────────────────
        // 2. CLEAN UP old test orders for this user
        // ─────────────────────────────────────────
        // Delete order_items first (FK constraint), then orders
        await client.query(
            `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)`,
            [CUSTOMER_ID]
        );
        await client.query('DELETE FROM orders WHERE user_id = $1', [CUSTOMER_ID]);
        console.log('  ✓ Cleared old orders');

        // ─────────────────────────────────────────
        // 3. ACTIVE ORDERS — for the Tracking tab
        //    (status: pending, processing, shipped)
        // ─────────────────────────────────────────

        // Order 1: "pending" — just placed
        const o1 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, payment_method, payment_status, created_at)
             VALUES ($1, 'pending', 134900.00, 'delivery', $2, 'razorpay', 'paid', NOW() - INTERVAL 2 HOUR)
             RETURNING id`,
            [CUSTOMER_ID, addr1Id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 1, 1, 134900.00)`,
            [o1.rows[0].id]
        );
        console.log('  ✓ Active order 1 — Pending (iPhone 15 Pro)');

        // Order 2: "processing" — being packed
        const o2 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, payment_method, payment_status, created_at)
             VALUES ($1, 'processing', 142998.00, 'delivery', $2, 'upi_qr', 'paid', NOW() - INTERVAL 1 DAY)
             RETURNING id`,
            [CUSTOMER_ID, addr2Id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 2, 1, 129999.00)`,
            [o2.rows[0].id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 3, 1, 12999.00)`,
            [o2.rows[0].id]
        );
        console.log('  ✓ Active order 2 — Processing (Samsung S24 Ultra + Stella Buds Pro)');

        // Order 3: "shipped" — on the way
        const o3 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, payment_method, payment_status, created_at)
             VALUES ($1, 'shipped', 59900.00, 'delivery', $2, 'razorpay', 'paid', NOW() - INTERVAL 3 DAY)
             RETURNING id`,
            [CUSTOMER_ID, addr1Id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 4, 1, 59900.00)`,
            [o3.rows[0].id]
        );
        console.log('  ✓ Active order 3 — Shipped (iPad Air M2)');

        // ─────────────────────────────────────────
        // 4. COMPLETED ORDERS — for Order History tab
        //    (status: delivered, cancelled)
        // ─────────────────────────────────────────

        // Order 4: "delivered" — store pickup
        const o4 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, branch_id, payment_method, payment_status, created_at)
             VALUES ($1, 'delivered', 151999.00, 'pickup', 1, 'pay_at_store', 'paid', NOW() - INTERVAL 8 DAY)
             RETURNING id`,
            [CUSTOMER_ID]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 5, 1, 106999.00)`,
            [o4.rows[0].id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 8, 1, 45000.00)`,
            [o4.rows[0].id]
        );
        console.log('  ✓ History order 4 — Delivered (Pixel 8 Pro + Stella Watch, Pickup)');

        // Order 5: "delivered" — home delivery
        const o5 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, payment_method, payment_status, created_at)
             VALUES ($1, 'delivered', 5900.00, 'delivery', $2, 'razorpay', 'paid', NOW() - INTERVAL 15 DAY)
             RETURNING id`,
            [CUSTOMER_ID, addr1Id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 11, 1, 5900.00)`,
            [o5.rows[0].id]
        );
        console.log('  ✓ History order 5 — Delivered (Stella Charger 100W)');

        // Order 6: "cancelled"
        const o6 = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, delivery_type, address_id, payment_method, payment_status, created_at)
             VALUES ($1, 'cancelled', 129999.00, 'delivery', $2, 'razorpay', 'pending', NOW() - INTERVAL 20 DAY)
             RETURNING id`,
            [CUSTOMER_ID, addr2Id]
        );
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 2, 1, 129999.00)`,
            [o6.rows[0].id]
        );
        console.log('  ✓ History order 6 — Cancelled (Samsung Galaxy S24 Ultra)');

        await client.query('COMMIT');
        console.log('\n✅ All test data seeded successfully!\n');
        console.log('  Addresses : 3 (Home → Priya Sharma, Rohan Mehta, Ananya Pillai)');
        console.log('  Tracking  : 3 active orders (pending / processing / shipped)');
        console.log('  History   : 3 completed orders (delivered x2, cancelled x1)');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await db.end();
    }
}

seed();
