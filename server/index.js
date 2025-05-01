const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - redirect to the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Flouci API credentials
const FLOUCI_API_URL = 'https://developers.flouci.com/api/generate_payment';
const FLOUCI_VERIFY_URL = 'https://developers.flouci.com/api/verify_payment';
const FLOUCI_TOKEN = process.env.VITE_FLOUCI_TOKEN;
const FLOUCI_SECRET = process.env.VITE_FLOUCI_SECRET;
const FLOUCI_ID = process.env.VITE_FLOUCI_ID;

// Validate environment variables
if (!FLOUCI_TOKEN || !FLOUCI_SECRET) {
  console.error('Missing Flouci API credentials. Please check your .env file.');
  process.exit(1);
}

// Routes
app.post('/api/payment/create', async (req, res) => {
  try {
    const { amount, note, first_name, last_name, email, phone, order_id } = req.body;
    
    // Convert amount to millimes (Tunisian currency unit)
    // 1 TND = 1000 millimes
    const amountInMillimes = Math.round(amount * 1000);
    
    // Get the base URL from the request for success/failure redirects
    const baseUrl = req.headers.origin || 'http://localhost:5173';
    
    // Prepare the request payload according to the Flouci documentation
    const payload = {
      app_token: FLOUCI_TOKEN,
      app_secret: FLOUCI_SECRET,
      amount: amountInMillimes.toString(), // Flouci expects amount in millimes as string
      accept_card: "true",
      session_timeout_secs: 1200, // 20 minutes
      success_link: `${baseUrl}/payment/success`,
      fail_link: `${baseUrl}/payment/failure`,
      developer_tracking_id: order_id || `donation_${Date.now()}`
      // Removed vendor_id to test if that helps
    };
    
    console.log('Using redirect URLs:', {
      success_link: payload.success_link,
      fail_link: payload.fail_link
    });

    console.log('Sending payment request to Flouci:', {
      ...payload,
      app_secret: '***' // Hide secret in logs
    });

    // Make the API request to Flouci
    const response = await axios.post(
      FLOUCI_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Flouci API response:', response.data);

    // Check if the response is successful according to the documentation
    if (response.data && response.data.result && response.data.result.link) {
      res.status(200).json({
        success: true,
        payment_url: response.data.result.link,
        payment_id: response.data.result.payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.data?.error_message || 'Invalid response from Flouci API'
      });
    }
  } catch (error) {
    console.error('Error creating payment request:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error processing payment request',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/payment/verify/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    console.log('Verifying payment with ID:', paymentId);
    
    // Make the API request to Flouci to verify the payment
    const response = await axios.get(
      `${FLOUCI_VERIFY_URL}/${paymentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apppublic': FLOUCI_TOKEN,
          'appsecret': FLOUCI_SECRET
          // Removed vendorid to match the documentation example
        },
      }
    );

    console.log('Payment verification response:', response.data);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error verifying payment',
      details: error.response?.data || error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Flouci API URL: ${FLOUCI_API_URL}`);
  console.log(`Flouci Token: ${FLOUCI_TOKEN.substring(0, 8)}...`);
});
