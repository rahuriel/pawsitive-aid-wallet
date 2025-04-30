import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TreatmentRequestCard from "./TreatmentRequestCard";
import { TreatmentRequest } from "@/types/treatment";
import { toast } from "sonner";
import { Heart, Calendar, Check, X, ArrowRight, User } from 'lucide-react';

// Mock data
interface ActivityItem {
  id: string;
  type: "donation" | "request" | "approval" | "rejection" | "treatment" | "join";
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  amount?: number;
  message?: string;
  requestId?: string;
}

// Sample activity data
const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act1",
    type: "donation",
    userId: "user1",
    userName: "Maria Garcia",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    amount: 50,
    message: "For the puppies found last week. Hope they recover soon!"
  },
  {
    id: "act2",
    type: "request",
    userId: "vet1",
    userName: "Dr. James Wilson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    amount: 120,
    requestId: "req1"
  },
  {
    id: "act3",
    type: "approval",
    userId: "mod1",
    userName: "Sarah Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    amount: 85,
    requestId: "req2"
  },
  {
    id: "act4",
    type: "join",
    userId: "user2",
    userName: "David Lee",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "act5",
    type: "treatment",
    userId: "vet2",
    userName: "Dr. Emily Chen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    requestId: "req3"
  }
];

// Sample treatment requests
const MOCK_REQUESTS: TreatmentRequest[] = [
  {
    id: "req1",
    vet_name: "Dr. James Wilson",
    vet_id: "vet1",
    animal_type: "Dog",
    animal_name: "Max",
    description: "Found with a broken leg and malnutrition. Needs surgery to repair the fracture and intensive care for at least two weeks.",
    amount: 120,
    status: "pending",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "req2",
    vet_name: "Dr. Lisa Brown",
    vet_id: "vet3",
    animal_type: "Cat",
    animal_name: "Whiskers",
    description: "Severe respiratory infection and eye infection. Needs antibiotics, eye drops, and monitoring.",
    amount: 85,
    status: "approved",
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "req3",
    vet_name: "Dr. Emily Chen",
    vet_id: "vet2",
    animal_type: "Rabbit",
    animal_name: "Fluffy",
    description: "Dental issues requiring teeth trimming and possible removal. Also needs nutritional supplements.",
    amount: 65,
    status: "completed",
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&auto=format&fit=crop&q=80"
  },
];

const ActivityFeed = () => {
  const { user } = useAuth();
  const isModerator = user?.role === "moderator";
  const [pendingRequests, setPendingRequests] = useState<TreatmentRequest[]>(
    MOCK_REQUESTS.filter(req => req.status === "pending")
  );
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(MOCK_ACTIVITY);
  
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const handleApproveRequest = (requestId: string) => {
    // In a real app, this would be an API call
    setPendingRequests(prevRequests => 
      prevRequests.filter(req => req.id !== requestId)
    );
    
    // Add new activity
    const request = MOCK_REQUESTS.find(req => req.id === requestId);
    if (request) {
      const newActivity = {
        id: `act-${Date.now()}`,
        type: "approval" as const,
        userId: user?.id || "",
        userName: user?.name || "",
        userAvatar: user?.avatarUrl,
        timestamp: new Date().toISOString(),
        amount: request.amount,
        requestId
      };
      
      setRecentActivity([newActivity, ...recentActivity]);
      toast.success(`You approved the treatment request for ${request.animal_name || request.animal_type}`);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    // In a real app, this would be an API call
    setPendingRequests(prevRequests => 
      prevRequests.filter(req => req.id !== requestId)
    );
    
    // Add new activity
    const request = MOCK_REQUESTS.find(req => req.id === requestId);
    if (request) {
      const newActivity = {
        id: `act-${Date.now()}`,
        type: "rejection" as const,
        userId: user?.id || "",
        userName: user?.name || "",
        userAvatar: user?.avatarUrl,
        timestamp: new Date().toISOString(),
        amount: request.amount,
        requestId
      };
      
      setRecentActivity([newActivity, ...recentActivity]);
      toast.info(`You rejected the treatment request for ${request.animal_name || request.animal_type}`);
    }
  };

  const renderActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'donation':
        return <Heart className="h-4 w-4 text-rose-500" />;
      case 'request':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'approval':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'rejection':
        return <X className="h-4 w-4 text-red-500" />;
      case 'treatment':
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case 'join':
        return <User className="h-4 w-4 text-violet-500" />;
      default:
        return null;
    }
  };
  
  const renderActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'donation':
        return <>donated <span className="font-semibold">{activity.amount?.toFixed(2)} TND</span></>;
      case 'request':
        return <>requested <span className="font-semibold">{activity.amount?.toFixed(2)} TND</span> for treatment</>;
      case 'approval':
        return <>approved a treatment request for <span className="font-semibold">{activity.amount?.toFixed(2)} TND</span></>;
      case 'rejection':
        return <>rejected a treatment request</>;
      case 'treatment':
        return <>completed a treatment</>;
      case 'join':
        return <>joined the community</>;
      default:
        return null;
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-pawsitive-dark">Activity & Updates</h2>
          <p className="mt-2 text-lg text-gray-600">
            See how your donations are making a difference
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="bg-white p-2 rounded-full border">
                      {renderActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback>{activity.userName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-pawsitive-dark">{activity.userName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {renderActivityText(activity)}
                      </p>
                      {activity.message && (
                        <p className="text-sm text-gray-500 italic">"{activity.message}"</p>
                      )}
                    </div>
                  </div>
                ))}

                <Button variant="ghost" className="w-full text-pawsitive-primary hover:text-pawsitive-secondary mt-4">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <span>{isModerator ? "Pending Treatment Requests" : "Recent Treatment Requests"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isModerator ? (
                  pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => (
                      <TreatmentRequestCard
                        key={request.id}
                        request={request}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pending requests at this time.</p>
                    </div>
                  )
                ) : (
                  MOCK_REQUESTS.slice(0, 2).map((request) => (
                    <TreatmentRequestCard
                      key={request.id}
                      request={request}
                    />
                  ))
                )}

                {!isModerator && (
                  <Button variant="ghost" className="w-full text-pawsitive-primary hover:text-pawsitive-secondary mt-4">
                    View All Treatments
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
