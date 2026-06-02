const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const client = await db.pool.connect();
        try {
            const filter = req.query.filter || 'week';
            let dateInterval = '7 days';
            let groupBy = 'DATE(created_at)';
            let dateFormat = "YYYY-MM-DD";
            
            if (filter === 'month') {
                dateInterval = '30 days';
                groupBy = 'DATE(created_at)';
            } else if (filter === 'year') {
                dateInterval = '1 year';
                groupBy = "TO_CHAR(created_at, 'YYYY-MM')"; // Group by month
            }

            // Get Total Revenue
            const revenueResult = await client.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '${dateInterval}'`);
            const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

            // Get Total Orders
            const ordersResult = await client.query(`SELECT COUNT(*) as count FROM orders WHERE created_at >= NOW() - INTERVAL '${dateInterval}'`);
            const totalOrders = parseInt(ordersResult.rows[0].count) || 0;

            // Get New Customers (distinct users in the interval)
            const customersResult = await client.query(`SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE created_at >= NOW() - INTERVAL '${dateInterval}'`);
            const newCustomers = parseInt(customersResult.rows[0].count) || 0;

            // Get Low Stock Products (stock <= 5)
            const stockResult = await client.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5");
            const lowStock = parseInt(stockResult.rows[0].count) || 0;

            // Get Chart Revenue
            const dailyRevenueResult = await client.query(`
                SELECT ${groupBy} as date, COALESCE(SUM(total_amount), 0) as revenue 
                FROM orders 
                WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '${dateInterval}'
                GROUP BY ${groupBy}
                ORDER BY date ASC
            `);

            // Format for frontend
            const stats = [
                { label: filter === 'year' ? 'Yearly Revenue' : filter === 'month' ? 'Monthly Revenue' : 'Weekly Revenue', value: 'RS ' + totalRevenue.toLocaleString(), color: 'text-white' },
                { label: 'Orders', value: totalOrders.toString(), color: 'text-white' },
                { label: 'Customers', value: newCustomers.toString(), color: 'text-white' },
                { label: 'Low Stock', value: lowStock.toString(), color: 'text-stella-red' }
            ];

            const chartData = dailyRevenueResult.rows.map(row => {
                let dateStr = row.date;
                // If it's a Date object (for week/month), extract YYYY-MM-DD
                if (row.date instanceof Date) {
                    dateStr = row.date.toISOString().split('T')[0];
                }
                return {
                    date: dateStr,
                    revenue: parseFloat(row.revenue)
                };
            });

            res.json({
                stats,
                chartData
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

module.exports = router;
