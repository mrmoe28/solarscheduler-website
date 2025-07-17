// SolarScheduler Stripe Payment Server
// This is a Node.js/Express server for handling Stripe payments
// Configure your environment variables in .env file

// Load environment variables
require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('.')); // Serve static files from current directory

// Store customer and subscription data (use a real database in production)
const customers = new Map();
const subscriptions = new Map();

// Serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the app landing page
app.get('/landing.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Serve the login page
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the PWA app
app.get('/app.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

// Serve PWA manifest
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve service worker
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { email, name, company } = req.body;

        console.log('Creating checkout session for:', { email, name, company });

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID || 'your_stripe_price_id_here',
                    quantity: 1,
                },
            ],
            customer_email: email,
            metadata: {
                customer_name: name || '',
                company: company || '',
                source: 'solarscheduler_website'
            },
            subscription_data: {
                metadata: {
                    customer_name: name || '',
                    company: company || '',
                    source: 'solarscheduler_website'
                }
            },
            success_url: `${req.protocol}://${req.get('host')}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/payment-checkout.html?canceled=true`,
            automatic_tax: { enabled: false },
            billing_address_collection: 'auto',
            consent_collection: {
                terms_of_service: 'required',
            },
            custom_text: {
                submit: {
                    message: 'Start your SolarScheduler Pro subscription today and transform your solar business.'
                }
            }
        });

        console.log('Checkout session created successfully:', session.id);

        res.json({
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to create checkout session' 
        });
    }
});

// Handle Stripe webhooks for subscription events
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
            console.log('Subscription created:', event.data.object.id);
            // Send welcome email, provision access, etc.
            break;
        
        case 'customer.subscription.updated':
            console.log('Subscription updated:', event.data.object.id);
            // Handle subscription changes
            break;
        
        case 'customer.subscription.deleted':
            console.log('Subscription cancelled:', event.data.object.id);
            // Revoke access, send cancellation email, etc.
            break;
        
        case 'invoice.payment_succeeded':
            console.log('Payment succeeded for invoice:', event.data.object.id);
            // Confirm payment, extend access, send receipt, etc.
            break;
        
        case 'invoice.payment_failed':
            console.log('Payment failed for invoice:', event.data.object.id);
            // Handle failed payment, send dunning email, etc.
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Get customer subscription status
app.get('/subscription-status/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;
        
        const subscriptions = await stripe.subscriptions.list({
            customer: customer_id,
            status: 'all',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        const subscription = subscriptions.data[0];
        
        res.json({
            subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end
        });

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// Cancel subscription
app.post('/cancel-subscription', async (req, res) => {
    try {
        const { subscription_id } = req.body;
        
        const subscription = await stripe.subscriptions.update(subscription_id, {
            cancel_at_period_end: true
        });

        res.json({
            subscription_id: subscription.id,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: subscription.current_period_end
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(400).json({ error: 'Failed to cancel subscription' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        subscriptions_count: subscriptions.size,
        customers_count: customers.size
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SolarScheduler payment server running on port ${PORT}`);
    console.log(`📱 Website available at: http://localhost:${PORT}`);
    console.log(`💳 Payment endpoint: http://localhost:${PORT}/create-checkout-session`);
    console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log('');
    console.log('⚠️  SETUP REQUIRED:');
    console.log('1. Copy .env.example to .env and fill in your Stripe keys');
    console.log('2. Set up webhook in Stripe dashboard');
    console.log('3. Update client-side publishable key');
    console.log('4. Deploy to production server');
});

module.exports = app;