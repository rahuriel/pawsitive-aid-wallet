
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const HeroSection = () => {
  const { isLoggedIn } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-pawsitive-primary/5 paw-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-10 pb-12 md:pt-16 md:pb-20 lg:pt-20 lg:pb-28 text-center md:text-left flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-pawsitive-dark tracking-tight">
              Help Stray Animals <span className="text-pawsitive-primary">Get the Care They Need</span>
            </h1>
            <p className="mt-4 md:mt-6 text-lg text-gray-600 max-w-3xl">
              PAWsitive Aid brings together donors and veterinarians to provide essential medical care for stray animals. Every donation goes directly to treatment, with full transparency and community governance.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
              <Button 
                className="text-lg px-8 py-6 bg-pawsitive-primary hover:bg-pawsitive-secondary"
                onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Donate Now
              </Button>
              {!isLoggedIn && (
                <Button 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-pawsitive-primary text-pawsitive-primary hover:bg-pawsitive-primary/10"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Join Our Community
                </Button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 max-w-md mx-auto md:max-w-none">
            <div className="relative animate-float">
              <img 
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&auto=format&fit=crop&q=80" 
                alt="Dog in need of care" 
                className="rounded-xl shadow-lg" 
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-md">
                <div className="text-xl font-bold text-pawsitive-primary">$12,450</div>
                <div className="text-sm text-gray-500">Raised this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView="register"
      />
    </div>
  );
};

export default HeroSection;
