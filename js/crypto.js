// Example using Coinbase Commerce (simplified)
const cryptoPayment = async (amount, productId, currency = 'BTC') => {
    // In a real app, you'd generate this on the server
    const chargeData = {
        name: `Product ${productId}`,
        description: 'Digital product purchase',
        pricing_type: 'fixed_price',
        local_price: {
            amount: amount,
            currency: currency
        },
        metadata: {
            product_id: productId
        },
        redirect_url: `https://yourwebsite.com/success.html?product=${productId}`,
        cancel_url: 'https://yourwebsite.com/cancel.html'
    };
    
    // Create charge (this would normally be server-side)
    try {
        const response = await fetch('https://api.commerce.coinbase.com/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': 'YOUR_COINBASE_API_KEY', // Never expose this in frontend in production!
                'X-CC-Version': '2018-03-22'
            },
            body: JSON.stringify(chargeData)
        });
        
        const data = await response.json();
        if (data.data && data.data.hosted_url) {
            window.location.href = data.data.hosted_url;
        } else {
            throw new Error('Failed to create payment');
        }
    } catch (error) {
        console.error('Crypto payment error:', error);
        alert('Failed to initiate crypto payment');
    }
};

// Webhook handler for crypto payments (this would be server-side)
// You'd set this up in your Coinbase Commerce settings
app.post('/crypto-webhook', (req, res) => {
    const event = req.body;
    
    if (event.type === 'charge:confirmed') {
        const productId = event.data.metadata.product_id;
        const transactionId = event.data.code;
        
        // Here you'd update your database to grant access
        // Then potentially send an email with download link
        
        res.status(200).send('Webhook received');
    }
});