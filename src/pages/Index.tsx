
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import DonationForm from "@/components/DonationForm";
import ActivityFeed from "@/components/ActivityFeed";
import StatCard from "@/components/StatCard";
import { Calendar, Coins, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Stats Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pawsitive-dark">Impact Dashboard</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/activities')}
              >
                View All Activity
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Donations"
                value="$32,450"
                description="From 1,245 generous donors"
                icon={<Heart />}
                className="border-pawsitive-primary/20"
              />
              <StatCard
                title="Animals Treated"
                value="287"
                description="Since our launch in January"
                icon={<Calendar />}
                className="border-pawsitive-primary/20"
              />
              <StatCard
                title="Available Funds"
                value="$8,392"
                description="Ready for immediate care"
                icon={<Coins />}
                className="border-pawsitive-primary/20"
              />
              <StatCard
                title="Community Members"
                value="1,893"
                description="Including 42 verified vets"
                icon={<User />}
                className="border-pawsitive-primary/20"
              />
            </div>
          </div>
        </div>
        
        <DonationForm />

        {/* Activity Feed Section with View All Link */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pawsitive-dark">Recent Treatments</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/treatments')}
              >
                View All Treatments
              </Button>
            </div>
            <ActivityFeed />
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-pawsitive-dark">How PAWsitive Aid Works</h2>
              <p className="mt-2 text-lg text-gray-600">
                Our transparent, community-governed approach ensures every donation helps animals in need
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center px-4">
                <div className="w-16 h-16 rounded-full bg-pawsitive-accent flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-pawsitive-primary" />
                </div>
                <h3 className="text-xl font-bold text-pawsitive-dark mb-2">1. Donate</h3>
                <p className="text-gray-600">Contribute any amount to our community pool. 100% of funds go directly to animal care.</p>
              </div>
              
              <div className="text-center px-4">
                <div className="w-16 h-16 rounded-full bg-pawsitive-accent flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-pawsitive-primary" />
                </div>
                <h3 className="text-xl font-bold text-pawsitive-dark mb-2">2. Vets Request</h3>
                <p className="text-gray-600">Verified veterinarians submit treatment requests with detailed cost estimates.</p>
              </div>
              
              <div className="text-center px-4">
                <div className="w-16 h-16 rounded-full bg-pawsitive-accent flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-pawsitive-primary" />
                </div>
                <h3 className="text-xl font-bold text-pawsitive-dark mb-2">3. Community Approves</h3>
                <p className="text-gray-600">Elected moderators review and approve requests, ensuring transparency and accountability.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-pawsitive-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-pawsitive-primary" />
              <span className="ml-2 font-bold text-lg">PAWsitive Aid</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} PAWsitive Aid. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
