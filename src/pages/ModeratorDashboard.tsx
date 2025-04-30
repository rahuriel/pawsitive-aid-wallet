
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TreatmentRequestCard from "@/components/TreatmentRequestCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TreatmentRequest } from "@/types/treatment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from "@/components/NavBar";
import ModeratorVerification from "@/components/ModeratorVerification";

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TreatmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("treatments");

  useEffect(() => {
    if (user?.role === "moderator") {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // Use type assertion to bypass TypeScript errors
      const { data, error } = await (supabase as any)
        .from('treatment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Fetch categories for each treatment request
      const requestsWithCategories = await Promise.all(data.map(async (request) => {
        // Use type assertion to bypass TypeScript errors
        const { data: categoryData, error: categoryError } = await (supabase as any)
          .from('treatment_request_categories')
          .select(`
            category_id,
            treatment_categories(id, name, description)
          `)
          .eq('treatment_request_id', request.id);
          
        if (categoryError) {
          console.error("Error fetching categories for request:", categoryError);
          return {
            ...request,
            status: (request.status || "pending") as "pending" | "approved" | "rejected" | "completed",
            categories: []
          };
        }
        
        // Extract categories from the nested structure
        const categories = categoryData.map(item => ({
          id: item.treatment_categories.id,
          name: item.treatment_categories.name,
          description: item.treatment_categories.description
        }));
        
        return {
          ...request,
          status: (request.status || "pending") as "pending" | "approved" | "rejected" | "completed",
          categories
        };
      }));
      
      setRequests(requestsWithCategories);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load treatment requests");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treatment_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast.success(`Request approved successfully`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('treatment_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast.success(`Request rejected successfully`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  if (!user || user.role !== "moderator") {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Only moderators can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Debug function to check all profiles
  const debugCheckProfiles = async () => {
    try {
      // Get all profiles
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Failed to fetch profiles");
        return;
      }
      
      console.log("ALL PROFILES IN DATABASE:", allProfiles);
      toast.success(`Found ${allProfiles?.length || 0} profiles in database`);
      
      // Check vet profiles
      const vetProfiles = allProfiles?.filter(p => p.role === 'vet') || [];
      console.log("VET PROFILES:", vetProfiles);
      toast.success(`Found ${vetProfiles.length} vet profiles`);
      
      // Check profiles with verification documents
      const profilesWithDocs = allProfiles?.filter(p => 
        p.cin_document_url !== null && p.siret_document_url !== null
      ) || [];
      console.log("PROFILES WITH DOCS:", profilesWithDocs);
      toast.success(`Found ${profilesWithDocs.length} profiles with documents`);
      
      // Check specifically for vet profiles with verification documents
      const vetProfilesWithDocs = vetProfiles.filter(p => 
        p.cin_document_url !== null && p.siret_document_url !== null
      );
      console.log("VET PROFILES WITH DOCS:", vetProfilesWithDocs);
      toast.success(`Found ${vetProfilesWithDocs.length} vet profiles with documents`);
      
    } catch (error) {
      console.error("Debug error:", error);
      toast.error("Debug check failed");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-8 px-4 pb-8">
        <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
        
        {/* Debug button */}
        <Button 
          onClick={debugCheckProfiles} 
          className="mb-4 bg-yellow-600 hover:bg-yellow-700"
        >
          Debug: Check Profiles
        </Button>
        
        <Tabs defaultValue="treatments" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="treatments">Treatment Requests</TabsTrigger>
            <TabsTrigger value="verification">Vet Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="treatments">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {requests
                    .filter(request => request.status === 'pending')
                    .map((request) => (
                      <TreatmentRequestCard
                        key={request.id}
                        request={request}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  
                  {requests.filter(request => request.status === 'pending').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No pending requests at this time.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="approved">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {requests
                    .filter(request => request.status === 'approved')
                    .map((request) => (
                      <TreatmentRequestCard
                        key={request.id}
                        request={request}
                      />
                    ))}
                  
                  {requests.filter(request => request.status === 'approved').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No approved requests yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {requests
                    .filter(request => request.status === 'rejected')
                    .map((request) => (
                      <TreatmentRequestCard
                        key={request.id}
                        request={request}
                      />
                    ))}
                  
                  {requests.filter(request => request.status === 'rejected').length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No rejected requests yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="verification">
            <ModeratorVerification />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
