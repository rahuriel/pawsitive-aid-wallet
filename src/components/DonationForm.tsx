
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

interface DonationOption {
  amount: number;
  description: string;
}

const donationOptions: DonationOption[] = [
  { amount: 10, description: "Basic care for one stray animal" },
  { amount: 25, description: "Vaccinations and deworming" },
  { amount: 50, description: "Minor surgery or extended treatment" },
  { amount: 100, description: "Emergency surgery or complex care" },
];

const DonationForm = () => {
  const { isLoggedIn, user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please select or enter a valid donation amount");
      return;
    }
    
    setIsDonating(true);
    
    // Simulate donation processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      <div className="flex flex-col">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
          <span className="font-semibold">Thank you for your donation!</span>
        </div>
        <p className="text-sm mt-1">Your donation of ${finalAmount.toFixed(2)} will help provide care for stray animals.</p>
      </div>
    );
    
    // Reset form
    setSelectedAmount(null);
    setCustomAmount("");
    setMessage("");
    setIsDonating(false);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value);
  };

  return (
    <div id="donation-form" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-pawsitive-dark">Make a Donation</h2>
          <p className="mt-2 text-lg text-gray-600">
            Your generosity directly funds veterinary care for stray animals in need
          </p>
        </div>
        
        <div className="md:flex md:gap-8">
          {/* Left side - Donation form */}
          <Card className="md:w-2/3 mb-8 md:mb-0">
            <CardContent className="pt-6">
              <form onSubmit={handleDonationSubmit}>
                <div className="mb-6">
                  <Label className="mb-2 block">Choose an amount</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {donationOptions.map((option) => (
                      <Button
                        key={option.amount}
                        type="button"
                        variant={selectedAmount === option.amount ? "default" : "outline"}
                        className={`h-auto py-3 flex flex-col items-center justify-center ${
                          selectedAmount === option.amount 
                            ? "bg-pawsitive-primary hover:bg-pawsitive-secondary" 
                            : "hover:bg-pawsitive-primary/10"
                        }`}
                        onClick={() => handleAmountSelect(option.amount)}
                      >
                        <span className="text-lg font-bold">${option.amount}</span>
                        <span className="text-xs mt-1 text-center line-clamp-2">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="custom-amount" className="mb-2 block">Or enter a custom amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="pl-7"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="message" className="mb-2 block">Leave a message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why you're donating..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                {isLoggedIn && (
                  <div className="flex items-center mb-6">
                    <input
                      id="anonymous"
                      type="checkbox"
                      className="h-4 w-4 text-pawsitive-primary rounded border-gray-300 focus:ring-pawsitive-primary"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                      Make my donation anonymous
                    </label>
                  </div>
                )}

                {isLoggedIn ? (
                  <Button
                    type="submit"
                    className="w-full py-6 flex items-center justify-center bg-pawsitive-primary hover:bg-pawsitive-secondary"
                    disabled={isDonating || (!selectedAmount && !customAmount)}
                  >
                    {isDonating ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Donate Now
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full py-6 flex items-center justify-center bg-pawsitive-primary hover:bg-pawsitive-secondary"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Login to Donate
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Right side - Impact summary */}
          <div className="md:w-1/3">
            <div className="bg-pawsitive-accent rounded-lg p-6">
              <h3 className="text-xl font-bold text-pawsitive-dark mb-4">Your Impact</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 text-pawsitive-primary mr-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">100% Transparent:</span> Every donation is tracked and publicly viewable
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 text-pawsitive-primary mr-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Direct Impact:</span> Funds go straight to veterinary care, not overhead
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 text-pawsitive-primary mr-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Community Governed:</span> Moderators elected by users approve all expenditures
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 text-pawsitive-primary mr-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Real-time Updates:</span> Follow the animals' journey to health and happiness
                  </p>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-pawsitive-primary/20">
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1">This month we've helped:</p>
                  <div className="flex justify-between">
                    <span>Treated animals</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surgeries performed</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vaccinations given</span>
                    <span className="font-semibold">76</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Animals rehomed</span>
                    <span className="font-semibold">23</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="login"
      />
    </div>
  );
};

export default DonationForm;
