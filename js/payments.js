// M-Pesa API Integration
const mpesaPayment = async (phone, amount, productId) => {
    const apiKey = 'YOUR_MPESA_API_KEY'; // In production, this should be handled server-side
    const apiUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                BusinessShortCode: 'YOUR_SHORTCODE',
                Password: 'YOUR_PASSWORD',
                Timestamp: new Date().toISOString(),
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: 'YOUR_BUSINESS_NUMBER',
                PhoneNumber: phone,
                CallBackURL: 'https://yourwebsite.com/callback',
                AccountReference: 'DigitalProduct',
                TransactionDesc: `Payment for product ${productId}`
            })
        });
        
        const data = await response.json();
        if (data.ResponseCode === '0') {
            // Poll for payment confirmation
            checkPaymentStatus(data.CheckoutRequestID, productId);
            return { success: true, message: 'Payment initiated' };
        } else {
            return { success: false, message: data.errorMessage };
        }
    } catch (error) {
        console.error('M-Pesa error:', error);
        return { success: false, message: 'Payment failed' };
    }
};

// Check payment status
const checkPaymentStatus = async (checkoutRequestId, productId) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkStatus = async () => {
        attempts++;
        const response = await fetch(`/api/check-payment?requestId=${checkoutRequestId}`);
        const data = await response.json();
        
        if (data.status === 'Paid') {
            // Redirect to success page with product access
            window.location.href = `success.html?product=${productId}&txn=${data.transactionId}`;
        } else if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000); // Check again after 3 seconds
        } else {
            alert('Payment verification timed out. Please contact support.');
        }
    };
    
    checkStatus();
};