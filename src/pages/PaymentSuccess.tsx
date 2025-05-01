import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { verifyPayment, saveDonation } from '@/services/paymentService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [donationDetails, setDonationDetails] = useState<any>(null);

  useEffect(() => {
    const verifyDonation = async () => {
      try {
        // Get payment ID from URL query params
        const params = new URLSearchParams(location.search);
        const paymentId = params.get('payment_id');
        
        console.log('Payment ID from URL:', paymentId);
        
        // Get stored donation details
        const storedDonation = localStorage.getItem('pawsitive_pending_donation');
        console.log('Stored donation details:', storedDonation);
        
        if (!paymentId) {
          console.error('Missing payment ID in URL');
          setIsVerifying(false);
          return;
        }
        
        // Even if we don't have stored donation details, we can still verify the payment
        // This handles cases where the user might have closed the browser during payment
        // and returned directly to the success URL
        let donationData: any = null;
        
        if (storedDonation) {
          try {
            donationData = JSON.parse(storedDonation);
            setDonationDetails(donationData);
          } catch (e) {
            console.error('Error parsing stored donation data:', e);
          }
        } else {
          // Create minimal donation details if none are stored
          donationData = {
            amount: 0, // Will be updated from verification if possible
            message: '',
            payment_id: paymentId
          };
          setDonationDetails(donationData);
        }
        
        // Verify payment with Flouci
        console.log('Verifying payment with ID:', paymentId);
        const verificationResult = await verifyPayment(paymentId);
        console.log('Verification result:', verificationResult);
        
        // For our mock implementation, all payments with mock_payment_ prefix are successful
        if (verificationResult && verificationResult.success) {
          // Payment verified successfully
          setVerificationSuccess(true);
          
          // Save donation to database
          if (donationData) {
            await saveDonation({
              amount: donationData.amount,
              note: donationData.message || '',
              order_id: paymentId
            }, paymentId);
          }
          
          // Clear pending donation from localStorage
          localStorage.removeItem('pawsitive_pending_donation');
        } else {
          // Payment verification failed
          setVerificationSuccess(false);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyDonation();
  }, [location.search]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <Card className="w-full max-w-md">
          {isVerifying ? (
            <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-pawsitive-primary animate-spin mb-4" />
              <CardTitle className="text-xl mb-2">Verifying Your Donation</CardTitle>
              <p className="text-center text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          ) : verificationSuccess ? (
            <>
              <CardHeader className="pb-3 text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">Thank You!</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg mb-4">
                  Your donation of {donationDetails && formatCurrency(donationDetails.amount)} has been successfully processed.
                </p>
                <p className="text-gray-600 mb-6">
                  Your generosity will help provide care for stray animals in need. 
                  We've sent a confirmation receipt to your email.
                </p>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Homepage
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    View Your Donations
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="pb-3 text-center">
                <CardTitle className="text-2xl font-bold text-pawsitive-dark">Payment Verification Failed</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  We couldn't verify your payment. This could be due to a temporary issue with our payment processor.
                </p>
                <p className="text-gray-600 mb-6">
                  If your payment was processed, it will appear in your donation history within 24 hours.
                  If not, please try again.
                </p>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Homepage
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/#donation-form')}
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
};

export default PaymentSuccess;
