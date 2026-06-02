const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');

// POST /api/orders
router.post('/', async (req, res) => {
    const { 
        user_id, 
        items, 
        total_amount, 
        delivery_type, 
        address_id, 
        branch_id, 
        payment_method 
    } = req.body;

    // Start a transaction
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Create the order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, delivery_type, address_id, branch_id, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, total_amount, delivery_type, address_id, branch_id, payment_method]
        );
        
        const order = orderResult.rows[0];

        // 2. Add order items and deduct stock
        for (const item of items) {
            // Add to order_items
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [order.id, item.product_id, item.quantity, item.price]
            );

            // Deduct stock
            const updateResult = await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING id',
                [item.quantity, item.product_id]
            );
            
            if (updateResult.rowCount === 0) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}`);
            }
        }

        await client.query('COMMIT');
        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Order Error:', err);
        res.status(500).json({ error: 'Failed to create order', details: err.message });
    } finally {
        client.release();
    }
});

// GET /api/orders/user/:userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT o.*, 
                    a.street_address, a.city, a.state, a.postal_code,
                    b.name as branch_name, b.address as branch_address,
                    COALESCE(
                        (SELECT json_agg(
                            json_build_object(
                                'id', oi.id,
                                'product_id', p.id,
                                'name', p.name,
                                'price', oi.price_at_purchase,
                                'quantity', oi.quantity,
                                'image_url', p.image_url
                            )
                        )
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = o.id),
                        '[]'::json
                    ) as items
             FROM orders o 
             LEFT JOIN addresses a ON o.address_id = a.id
             LEFT JOIN branches b ON o.branch_id = b.id
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders (all orders for admin dashboard logs)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.*, u.name as user_name, u.phone_number as user_phone,
                   (SELECT json_agg(DISTINCT c.name)
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    JOIN categories c ON p.category_id = c.id
                    WHERE oi.order_id = o.id) as categories
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/status (update order status + optional expected delivery date)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, expected_delivery_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE orders SET status = $1, expected_delivery_date = COALESCE($2, expected_delivery_date) WHERE id = $3 RETURNING *',
            [status, expected_delivery_date || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/orders/:id/delivery-date (set expected delivery date only)
router.put('/:id/delivery-date', async (req, res) => {
    const { id } = req.params;
    const { expected_delivery_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE orders SET expected_delivery_date = $1 WHERE id = $2 RETURNING *',
            [expected_delivery_date || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/:id/invoice (download PDF invoice)
router.get('/:id/invoice', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone_number as user_phone,
                   b.name as branch_name, a.street_address, a.city, a.state, a.postal_code,
                   (SELECT json_agg(json_build_object('id', p.id, 'name', p.name, 'price', oi.price_at_purchase, 'quantity', oi.quantity))
                    FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN addresses a ON o.address_id = a.id
            WHERE o.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = result.rows[0];

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_ORD-${order.id}.pdf`);
        
        // Stream to response
        doc.pipe(res);

        const path = require('path');
        const logo1Path = path.join(__dirname, '../../Logo - 1 - transparent.png');
        const logo2Path = path.join(__dirname, '../../Logo - 2 - transparent.png');

        const topY = 40;

        // Draw a black header background across the top of the page
        doc.rect(0, 0, doc.page.width, 140).fill('#0e0e11'); 

        // Top Center: Logo 2 + "MOBILES"
        try {
            // Increased size to 150 width, and updated x position to center it
            doc.image(logo2Path, 231, topY, { width: 150, height: 90, fit: [150, 90] });
        } catch(e) {
            console.error('Logo 2 not found', e);
        }
        
        // Move "MOBILES" text up even closer to the logo (was topY + 65, now topY + 50)
        doc.y = topY + 50;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#B8860B'); 
        doc.text('MOBILES', { align: 'center', characterSpacing: 5 });

        // Right Corner: Logo 1
        try {
            const l1Size = 70;
            const l1X = doc.page.width - 120;
            const l1Y = topY;
            doc.image(logo1Path, l1X, l1Y, { width: l1Size, height: l1Size });
        } catch(e) {
            console.error('Logo 1 not found', e);
        }

        doc.y = 170; // Give some spacing before layout columns
        doc.fillColor('black');

        // Layout Columns
        const leftX = 50;
        const rightX = doc.page.width / 2 + 50;
        const currentY = doc.y;

        // Left Column (Date, Order ID, Payment Method, Payment Status)
        doc.font('Helvetica-Bold').fontSize(10).text('Order Details', leftX, currentY);
        doc.font('Helvetica');
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, leftX, currentY + 15);
        doc.text(`Order ID: ORD-${order.id}`, leftX, currentY + 30);
        doc.text(`Payment Method: ${order.payment_method?.replace(/_/g, ' ').toUpperCase() || 'N/A'}`, leftX, currentY + 45);
        doc.text(`Payment Status: ${order.payment_status?.toUpperCase() || 'N/A'}`, leftX, currentY + 60);

        // Right Column (Bill to, Name, Address, Mobile, Email)
        doc.font('Helvetica-Bold').text('Bill To', rightX, currentY);
        doc.font('Helvetica');
        doc.text(`Name: ${order.user_name || 'Guest'}`, rightX, currentY + 15);
        
        if (order.delivery_type === 'delivery') {
            doc.text(`Address: ${order.street_address}`, rightX, currentY + 30);
            doc.text(`${order.city}, ${order.state} - ${order.postal_code}`, rightX, currentY + 45);
        } else {
            doc.text(`Address: Store Pickup - ${order.branch_name}`, rightX, currentY + 30);
        }
        
        doc.text(`Mobile: ${order.user_phone || 'N/A'}`, rightX, currentY + 60);
        doc.text(`Email: ${order.user_email || 'N/A'}`, rightX, currentY + 75);
        
        // Colored Table Header
        let y = currentY + 110; 
        const tableTop = y;
        
        // Table Background
        doc.rect(50, tableTop, 500, 20).fill('#0e0e11'); 
        doc.fillColor('white').font('Helvetica-Bold');
        doc.text('Item', 60, tableTop + 5);
        doc.text('Qty', 350, tableTop + 5);
        doc.text('Unit Price', 400, tableTop + 5);
        doc.text('Total', 480, tableTop + 5);
        
        y = tableTop + 25;
        doc.fillColor('black').font('Helvetica');

        // Items
        if (order.items && order.items.length > 0) {
            order.items.forEach((item, index) => {
                // Add alternating row colors for styling
                if (index % 2 === 0) {
                    doc.rect(50, y - 5, 500, 20).fill('#f9f9f9');
                    doc.fillColor('black');
                }
                doc.text(item.name, 60, y);
                doc.text(item.quantity.toString(), 350, y);
                doc.text(`RS ${item.price}`, 400, y);
                doc.text(`RS ${(item.price * item.quantity).toFixed(2)}`, 480, y);
                y += 20;
            });
        }
        
        doc.moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
        doc.moveDown(2);
        
        // Totals
        y += 15;
        doc.font('Helvetica-Bold').fillColor('black');
        doc.text('Total Amount:', 350, y);
        doc.text(`RS ${Number(order.total_amount).toFixed(2)}`, 480, y);
        
        doc.moveDown(4);
        
        // Footer texts
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
        doc.text('Thank you for shopping with Stella Mobiles!', 50, y + 40, { align: 'center', width: 500 });
        
        doc.moveDown(2);
        doc.font('Helvetica').fontSize(9).fillColor('gray'); 
        doc.text('This is a computer generated invoice\nand does not require a physical\nsignature.', { align: 'center', width: 500 });

        doc.end();
    } catch (err) {
        console.error('Invoice generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate invoice' });
        }
    }
});

module.exports = router;
