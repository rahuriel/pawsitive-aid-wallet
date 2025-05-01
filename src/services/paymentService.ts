import axios from 'axios';

// Types for Flouci payment
export interface PaymentRequest {
  amount: number;
  note?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  order_id?: string;
}

export interface PaymentResponse {
  payment_url: string;
  payment_id: string;
}

export interface FlouciApiResponse {
  result?: {
    link: string;
    payment_id: string;
    developer_tracking_id: string;
    success: boolean;
  };
  code?: number;
  name?: string;
  version?: string;
  error_code?: string;
  error_message?: string;
}

// Backend server URL for payment processing
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Base URL for the application (for success/failure redirects)
const APP_BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Create a payment request with Flouci
 * @param paymentData Payment data including amount and optional user details
 * @returns Payment URL and ID
 */
export const createPaymentRequest = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    console.log('Creating payment request with data:', {
      ...paymentData,
      amount: paymentData.amount
    });
    
    // Make the API request to our backend server
    // The server will handle the communication with Flouci
    const response = await axios.post(
      `${SERVER_URL}/api/payment/create`,
      paymentData
    );
    
    console.log('Payment creation response:', response.data);
    
    if (response.data && response.data.success) {
      const paymentUrl = response.data.payment_url;
      const paymentId = response.data.payment_id;
      
      console.log('Received payment URL:', paymentUrl);
      console.log('Received payment ID:', paymentId);
      
      return {
        payment_url: paymentUrl,
        payment_id: paymentId
      };
    } else {
      throw new Error(response.data?.error || 'Failed to create payment');
    }
  } catch (error: any) {
    console.error('Error creating payment request:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify a payment status with Flouci
 * @param paymentId The payment ID to verify
 * @returns Payment verification status
 */
export const verifyPayment = async (paymentId: string): Promise<any> => {
  try {
    console.log('Verifying payment with ID:', paymentId);
    
    // Make the API request to our backend server
    // The server will handle the communication with Flouci
    const response = await axios.get(`${SERVER_URL}/api/payment/verify/${paymentId}`);
    
    console.log('Payment verification response:', response.data);
    
    // Process the response according to Flouci's documentation
    console.log('Full payment verification response:', JSON.stringify(response.data));
    
    // Check for various success indicators in the Flouci response
    // The API might return different status formats
    if (response.data) {
      if (
        response.data.status === 'SUCCESS' || 
        response.data.status === 'PAID' ||
        response.data.payment_status === 'paid' ||
        (response.data.result && response.data.result.status === 'SUCCESS')
      ) {
        return {
          success: true,
          result: response.data
        };
      }
    }
    
    // If none of the success conditions are met, return failure
    return {
      success: false,
      result: response.data
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save donation details to Supabase after successful payment
 * This function would be called after payment verification
 * @param paymentData Payment data including amount and user details
 * @param paymentId Flouci payment ID
 */
export const saveDonation = async (paymentData: PaymentRequest, paymentId: string): Promise<void> => {
  // This would integrate with Supabase to save donation records
  // Implementation would depend on your Supabase schema
  console.log('Saving donation to database:', { ...paymentData, paymentId });
  
  // TODO: Implement Supabase integration when donations table is available
};
