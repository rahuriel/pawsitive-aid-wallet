import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import NavBar from '@/components/NavBar';

const PaymentFailure = () => {
  const navigate = useNavigate();

  // Clear any pending donation data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pawsitive_pending_donation');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3 text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">Payment Unsuccessful</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">
              Your donation payment was not completed.
            </p>
            <p className="text-gray-600 mb-6">
              This could be due to a cancellation, insufficient funds, or a technical issue.
              No funds have been charged from your account.
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
        </Card>
      </main>
    </div>
  );
};

export default PaymentFailure;
