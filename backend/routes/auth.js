const express = require('express');
const router = express.Router();
const db = require('../db');
const twilio = require('twilio');

// Initialize Twilio client
let client = null;
const serviceSid = process.env.TWILIO_SERVICE_SID;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
    console.warn('⚠️ TWILIO_ACCOUNT_SID is missing or invalid. Auth routes will operate in mock mode.');
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        if (!client) {
            console.log(`[Mock Auth] Sending mock OTP '123456' to ${phoneNumber}`);
            return res.json({ success: true, status: 'pending', mock: true });
        }

        // Use Twilio Verify Service to send OTP
        const verification = await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });

        res.json({ success: true, status: verification.status });
    } catch (err) {
        console.error('Twilio Error:', err);
        res.status(500).json({ error: 'Failed to send OTP', details: err.message });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, code, name } = req.body; // 'name' only needed for new users

    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    try {
        if (!client) {
            // Mock mode OTP verification
            if (code !== '123456') {
                return res.status(400).json({ error: 'Invalid mock OTP. Use 123456' });
            }
        } else {
            // Verify OTP with Twilio
            const verificationCheck = await client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({ to: phoneNumber, code: code });

            if (verificationCheck.status !== 'approved') {
                return res.status(400).json({ error: 'Invalid or expired OTP' });
            }
        }

        // OTP is valid, now check if user exists in DB
        let userResult = await db.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
        let user;

        if (userResult.rows.length === 0) {
            // Create new user if they don't exist
            const newUser = await db.query(
                'INSERT INTO users (name, phone_number) VALUES ($1, $2) RETURNING *',
                [name || 'Stella', phoneNumber]
            );
            user = newUser.rows[0];
        } else {
            user = userResult.rows[0];
        }

        // In a real app, you would generate a JWT here
        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone_number,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
});

// PUT /api/auth/profile/:id
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone_number,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
});

// PUT /api/auth/update-mobile/:id
router.put('/update-mobile/:id', async (req, res) => {
    const { id } = req.params;
    const { newPhoneNumber, code } = req.body;

    if (!newPhoneNumber || !code) {
        return res.status(400).json({ error: 'New number and code are required' });
    }

    try {
        if (!client) {
            // Mock mode OTP verification
            if (code !== '123456') {
                return res.status(400).json({ error: 'Invalid mock OTP. Use 123456' });
            }
        } else {
            // Verify OTP with Twilio
            const verificationCheck = await client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({ to: newPhoneNumber, code: code });

            if (verificationCheck.status !== 'approved') {
                return res.status(400).json({ error: 'Invalid or expired OTP' });
            }
        }

        const result = await db.query(
            'UPDATE users SET phone_number = $1 WHERE id = $2 RETURNING *',
            [newPhoneNumber, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone_number,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Update Mobile Error:', err);
        res.status(500).json({ error: 'Failed to update mobile number', details: err.message });
    }
});

module.exports = router;
