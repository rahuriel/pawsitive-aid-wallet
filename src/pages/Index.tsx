
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import DonationForm from "@/components/DonationForm";
import ActivityFeed from "@/components/ActivityFeed";
import StatCard from "@/components/StatCard";
import { 
  Calendar, 
  Coins, 
  Heart, 
  User, 
  Loader2, 
  Syringe, 
  Scissors, 
  Stethoscope, 
  Bug, 
  Droplets, 
  ScanLine, 
  Thermometer 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats, DashboardStats } from "@/services/dashboardService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
        console.log('Dashboard stats loaded:', dashboardStats); // Debug log
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
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
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-pawsitive-primary animate-spin" />
                <span className="ml-2 text-pawsitive-dark">Loading dashboard data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Donations"
                    value={formatCurrency(stats?.totalDonations || 0)}
                    description={`From ${stats?.donorCount || 0} generous donors`}
                    icon={<Heart />}
                    className="border-pawsitive-primary/20"
                  />
                  <StatCard
                    title="Animals Treated"
                    value={stats?.animalsTreated.toString() || "0"}
                    description="Successfully treated animals"
                    icon={<Calendar />}
                    className="border-pawsitive-primary/20"
                  />
                  <StatCard
                    title="Available Funds"
                    value={formatCurrency(stats?.availableFunds || 0)}
                    description="Ready for immediate care"
                    icon={<Coins />}
                    className="border-pawsitive-primary/20"
                  />
                  <StatCard
                    title="Community Members"
                    value={stats?.communityMembers.toString() || "0"}
                    description={`Including ${stats?.verifiedVets || 0} verified vets`}
                    icon={<User />}
                    className="border-pawsitive-primary/20"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Your Impact This Month Section */}
        <div className="py-12 bg-gradient-to-b from-pawsitive-accent/10 to-pawsitive-accent/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-pawsitive-dark">Your Impact This Month</h2>
              <p className="mt-2 text-lg text-gray-600">
                See how your donations are helping animals in need by treatment category
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-pawsitive-primary animate-spin" />
                <span className="ml-2 text-pawsitive-dark">Loading impact data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stats?.thisMonthTreatmentsByCategory.map((category) => {
                  // Determine the appropriate icon based on category name
                  let CategoryIcon = Stethoscope; // Default icon
                  
                  if (category.categoryName.includes('Vaccine')) {
                    CategoryIcon = Syringe;
                  } else if (category.categoryName.includes('Surgery')) {
                    CategoryIcon = Scissors;
                  } else if (category.categoryName.includes('Routine')) {
                    CategoryIcon = Stethoscope;
                  } else if (category.categoryName.includes('Deworming')) {
                    CategoryIcon = Bug;
                  } else if (category.categoryName.includes('Blood Transfusion')) {
                    CategoryIcon = Droplets;
                  } else if (category.categoryName.includes('Scanner')) {
                    CategoryIcon = ScanLine;
                  } else if (category.categoryName.includes('Blood Check')) {
                    CategoryIcon = Thermometer;
                  }
                  
                  return (
                    <Card 
                      key={category.categoryId} 
                      className="overflow-hidden border-pawsitive-primary/20 hover:shadow-md transition-shadow duration-300 group"
                    >
                      <CardHeader className="pb-2 border-b border-pawsitive-accent/30">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-pawsitive-accent/20 group-hover:bg-pawsitive-accent/40 transition-colors duration-300">
                            <CategoryIcon className="h-5 w-5 text-pawsitive-primary" />
                          </div>
                          <CardTitle className="text-lg">{category.categoryName}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Heart className="h-5 w-5 text-pawsitive-primary mr-2" />
                              <span className="text-sm font-medium text-gray-600">Animals Helped</span>
                            </div>
                            <span className="text-2xl font-bold text-pawsitive-primary">{category.count}</span>
                          </div>
                          
                          <div className="flex items-center justify-between border-t pt-3 border-pawsitive-accent/20">
                            <div className="flex items-center">
                              <Coins className="h-5 w-5 text-amber-500 mr-2" />
                              <span className="text-sm font-medium text-gray-600">Funds Used</span>
                            </div>
                            <span className="text-lg font-semibold text-pawsitive-dark">
                              {formatCurrency(category.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
