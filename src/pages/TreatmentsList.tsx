
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentRequest } from "@/types/treatment";
import TreatmentRequestCard from "@/components/TreatmentRequestCard";

const TreatmentsList = () => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<TreatmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  useEffect(() => {
    fetchTreatments();
  }, [user]);
  
  const fetchTreatments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('treatment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If user is a vet, only show their requests
      if (user.role === 'vet') {
        query = query.eq('vet_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Ensure status is one of the allowed types
      const typedTreatments = data?.map(item => ({
        ...item,
        status: (item.status || "pending") as "pending" | "approved" | "rejected" | "completed"
      })) || [];
      
      setTreatments(typedTreatments);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      toast.error("Failed to load treatment requests");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (id: string) => {
    if (!user || user.role !== 'moderator') return;
    
    try {
      const { error } = await supabase
        .from('treatment_requests')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Treatment request approved");
      fetchTreatments();
    } catch (error: any) {
      console.error("Error approving treatment:", error);
      toast.error(error.message || "Failed to approve treatment");
    }
  };
  
  const handleReject = async (id: string, reason: string) => {
    if (!user || user.role !== 'moderator') return;
    
    try {
      const { error } = await supabase
        .from('treatment_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Treatment request rejected");
      fetchTreatments();
    } catch (error: any) {
      console.error("Error rejecting treatment:", error);
      toast.error(error.message || "Failed to reject treatment");
    }
  };
  
  const filteredTreatments = treatments.filter((treatment) => {
    // Apply status filter
    if (statusFilter !== "all" && treatment.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter to animal name, type, or vet name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const animalName = treatment.animal_name?.toLowerCase() || "";
      const animalType = treatment.animal_type.toLowerCase();
      const vetName = treatment.vet_name.toLowerCase();
      const description = treatment.description.toLowerCase();
      
      return (
        animalName.includes(query) || 
        animalType.includes(query) || 
        vetName.includes(query) ||
        description.includes(query)
      );
    }
    
    return true;
  });

  if (!user) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You need to log in to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Requests</CardTitle>
            <CardDescription>
              {user?.role === 'vet' 
                ? "Your submitted treatment requests" 
                : "All animal treatment requests submitted by veterinarians"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by animal name, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Label htmlFor="status" className="mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">Loading treatment requests...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTreatments.map((treatment) => (
                  <TreatmentRequestCard 
                    key={treatment.id} 
                    request={treatment}
                    onApprove={handleApprove}
                    onReject={handleReject} 
                  />
                ))}
                
                {filteredTreatments.length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== "all" 
                        ? "No treatment requests match your filters"
                        : "No treatment requests found"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-pawsitive-dark text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
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

export default TreatmentsList;
