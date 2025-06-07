const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ message: 'Amount and currency are required' });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive integer' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

module.exports = { createPaymentIntent };