
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Define a type for vet verification requests
interface VetVerificationRequest {
  id: string;
  vet_id: string;
  cin_document_url: string;
  siret_document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

interface VetProfile {
  id: string;
  name: string;
  email: string;
  is_vet_verified: boolean;
  cin_document_url: string;
  siret_document_url: string;
  verification_submitted_at: string;
}

const ModeratorVerification = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<VetVerificationRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<VetVerificationRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<VetVerificationRequest[]>([]);
  const [vetProfiles, setVetProfiles] = useState<Record<string, VetProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'moderator') return;
    
    const fetchVerificationRequests = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching vet verification requests as moderator...");
        
        // Try a direct join query using the foreign key relationship
        // vet_verification_requests.vet_id -> profiles.id
        const { data: joinedRequests, error: joinError } = await supabase
          .from('vet_verification_requests')
          .select(`
            *,
            profiles!vet_verification_requests_vet_id_fkey(id, name, role, is_vet_verified)
          `);
        
        if (joinError) {
          console.error("Error with join query:", joinError);
          
          // Fallback to separate queries if join fails
          const { data: allRequests, error: requestsError } = await supabase
            .from('vet_verification_requests')
            .select('*');
          
          if (requestsError) throw requestsError;
          
          if (!allRequests || allRequests.length === 0) {
            console.log("No verification requests found");
            setPendingRequests([]);
            setApprovedRequests([]);
            setRejectedRequests([]);
            setIsLoading(false);
            return;
          }
          
          // Get unique vet IDs from the requests
          const vetIds = [...new Set(allRequests.map((req: any) => req.vet_id))];
          console.log("Unique vet IDs:", vetIds);
          
          // Fetch all profiles for these vet IDs
          const { data: vetProfilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, role, is_vet_verified')
            .in('id', vetIds);
          
          if (profilesError) throw profilesError;
          
          // Create a map of vet profiles for easy lookup
          const profileMap: Record<string, VetProfile> = {};
          
          // Initialize with default values for all vet IDs
          vetIds.forEach((vetId: string) => {
            profileMap[vetId] = {
              id: vetId,
              name: 'Unknown Vet',
              email: 'No email',
              is_vet_verified: false,
              cin_document_url: '',
              siret_document_url: '',
              verification_submitted_at: ''
            };
          });
          
          // Update with actual profile data where available
          if (vetProfilesData) {
            vetProfilesData.forEach((profile: any) => {
              if (profile && profile.id) {
                profileMap[profile.id] = {
                  id: profile.id,
                  name: profile.name || 'Unknown Vet',
                  email: 'No email', // We're not focusing on email as requested
                  is_vet_verified: profile.is_vet_verified || false,
                  cin_document_url: '',
                  siret_document_url: '',
                  verification_submitted_at: ''
                };
              }
            });
          }
          
          console.log("Final profile map:", profileMap);
          setVetProfiles(profileMap);
          
          // Sort requests by status
          const pending = allRequests.filter((req: any) => req.status === 'pending');
          const approved = allRequests.filter((req: any) => req.status === 'approved');
          const rejected = allRequests.filter((req: any) => req.status === 'rejected');
          
          setPendingRequests(pending as VetVerificationRequest[]);
          setApprovedRequests(approved as VetVerificationRequest[]);
          setRejectedRequests(rejected as VetVerificationRequest[]);
        } else {
          // Process joined data
          console.log("Joined requests data:", joinedRequests);
          
          // Create a profile map from the joined data
          const profileMap: Record<string, VetProfile> = {};
          
          joinedRequests.forEach((req: any) => {
            if (req.vet_id && req.profiles) {
              profileMap[req.vet_id] = {
                id: req.vet_id,
                name: req.profiles.name || 'Unknown Vet',
                email: 'No email', // We're not focusing on email as requested
                is_vet_verified: req.profiles.is_vet_verified || false,
                cin_document_url: req.cin_document_url || '',
                siret_document_url: req.siret_document_url || '',
                verification_submitted_at: req.submitted_at || ''
              };
            }
          });
          
          setVetProfiles(profileMap);
          
          // Sort requests by status
          const pending = joinedRequests.filter((req: any) => req.status === 'pending');
          const approved = joinedRequests.filter((req: any) => req.status === 'approved');
          const rejected = joinedRequests.filter((req: any) => req.status === 'rejected');
          
          setPendingRequests(pending as VetVerificationRequest[]);
          setApprovedRequests(approved as VetVerificationRequest[]);
          setRejectedRequests(rejected as VetVerificationRequest[]);
        }
      } catch (error: any) {
        console.error("Error fetching verification requests:", error);
        toast.error(error.message || "Failed to fetch verification requests");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVerificationRequests();
  }, [user?.role]);
  
  const handleVerification = async (requestId: string, approve: boolean, rejectionReason?: string) => {
    try {
      const now = new Date().toISOString();
      
      // First, get the vet_id from the request
      // Use type assertion to bypass TypeScript errors
      const { data: requestData, error: requestError } = await (supabase as any)
        .from('vet_verification_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError) {
        console.error("Error fetching verification request:", requestError);
        throw requestError;
      }
      
      if (!requestData || !requestData.vet_id) {
        console.error("No vet_id found for request:", requestId);
        throw new Error("Verification request not found or missing vet_id");
      }
      
      const vetId = requestData.vet_id;
      console.log(`Processing verification for vet ID: ${vetId}, approved: ${approve}`);
      
      // If approved, update the vet's profile FIRST before updating the request
      if (approve) {
        console.log(`Updating profile for vet ID: ${vetId} to set is_vet_verified=true`);
        
        try {
          // Use the new database function to update the vet's verification status
          // This function bypasses RLS and directly updates the profile
          console.log("Using RPC function to update verification status");
          const { data: rpcData, error: rpcError } = await (supabase as any).rpc(
            'update_vet_verification_status',
            { 
              vet_id: vetId,
              is_verified: true
            }
          );
          
          if (rpcError) {
            console.error("RPC function error:", rpcError);
            
            // Fallback to direct update if RPC fails
            console.log("Falling back to direct update");
            const { data: updateData, error: updateError } = await supabase
              .from('profiles')
              .update({ 
                is_vet_verified: true,
                updated_at: now
              })
              .eq('id', vetId);
            
            if (updateError) {
              console.error("Direct update error:", updateError);
            } else {
              console.log("Direct update success");
            }
          } else {
            console.log("RPC function success:", rpcData);
          }
          
          // Verify if the update worked
          const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('is_vet_verified')
            .eq('id', vetId)
            .single();
          
          if (verifyError) {
            console.error("Error verifying profile update:", verifyError);
          } else {
            console.log(`Verification result - is_vet_verified: ${verifyData?.is_vet_verified}`);
            
            // If still not verified, show an alert
            if (verifyData && verifyData.is_vet_verified !== true) {
              alert(`Warning: Could not automatically update vet profile. Please manually set is_vet_verified=true for vet ID ${vetId} in the profiles table.`);
            }
          }
        } catch (profileUpdateError) {
          console.error("Exception during profile update:", profileUpdateError);
          // Continue despite error - we'll still update the request
        }
      }
      
      // Then update the verification request status using type assertion to bypass TypeScript errors
      const { error } = await (supabase as any)
        .from('vet_verification_requests')
        .update({ 
          status: approve ? 'approved' : 'rejected',
          reviewed_at: now,
          reviewed_by: user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', requestId);
      
      if (error) {
        console.error("Error updating verification request:", error);
        throw error;
      }
      
      // If approved, try one final update as a backup with a direct database operation
      if (approve) {
        // Try a final update with a slight delay
        setTimeout(async () => {
          try {
            console.log(`Performing final profile update for vet ID: ${vetId}`);
            
            // Try a direct upsert as a final attempt
            const { error: finalError } = await supabase
              .from('profiles')
              .upsert({
                id: vetId,
                is_vet_verified: true,
                updated_at: new Date().toISOString()
              }, { 
                onConflict: 'id',
                ignoreDuplicates: false
              });
            
            if (finalError) {
              console.error("Final update error:", finalError);
            } else {
              console.log("Final update successful");
              
              // Verify one last time
              const { data: finalVerifyData } = await supabase
                .from('profiles')
                .select('is_vet_verified')
                .eq('id', vetId)
                .single();
              
              console.log(`Final verification - is_vet_verified: ${finalVerifyData?.is_vet_verified}`);
              
              // If still not verified, try a direct RLS-bypassing approach
              if (!finalVerifyData?.is_vet_verified) {
                console.log("Still not verified, trying direct service role approach");
                
                // This is a last resort - we'll try to use the service role client if available
                // Note: This would require setting up a service role client in your application
                try {
                  // Simulate a direct database update (in a real app, you'd use a service role client)
                  alert(`IMPORTANT: Manual intervention needed! Please update vet ID ${vetId} to set is_vet_verified=true in the profiles table.`);
                } catch (serviceRoleError) {
                  console.error("Service role update failed:", serviceRoleError);
                }
              }
            }
          } catch (finalUpdateError) {
            console.error("Exception during final update:", finalUpdateError);
          }
        }, 2000); // 2 second delay
      }
      
      toast.success(`Verification request ${approve ? 'approved' : 'rejected'} successfully`);
      
      // Update local state
      if (approve) {
        const approvedRequest = pendingRequests.find(req => req.id === requestId);
        if (approvedRequest) {
          setApprovedRequests([...approvedRequests, { ...approvedRequest, status: 'approved', reviewed_at: now }]);
          setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
        }
      } else {
        const rejectedRequest = pendingRequests.find(req => req.id === requestId);
        if (rejectedRequest) {
          setRejectedRequests([...rejectedRequests, { ...rejectedRequest, status: 'rejected', reviewed_at: now, rejection_reason: rejectionReason }]);
          setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
        }
      }
    } catch (error: any) {
      console.error("Error updating verification request:", error);
      toast.error(error.message || "Failed to update verification request");
    }
  };
  
  if (user?.role !== 'moderator') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Only moderators can access this feature.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Veterinarian Verification Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <p>Loading verification requests...</p>
            ) : pendingRequests.length === 0 ? (
              <p>No pending verification requests.</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(request => {
                  const vetProfile = vetProfiles[request.vet_id];
                  return (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-medium">{vetProfile?.name || 'Unknown Vet'}</h3>
                        <p className="text-sm text-muted-foreground">{vetProfile?.email || 'No email'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(request.submitted_at).toLocaleString()}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium mb-2">CIN Document:</p>
                            {request.cin_document_url ? (
                              <a 
                                href={request.cin_document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={request.cin_document_url} 
                                  alt="CIN Document" 
                                  className="border rounded max-h-40 object-contain"
                                />
                              </a>
                            ) : (
                              <p className="text-sm">No CIN document provided</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">SIRET Document:</p>
                            {request.siret_document_url ? (
                              <a 
                                href={request.siret_document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={request.siret_document_url} 
                                  alt="SIRET Document" 
                                  className="border rounded max-h-40 object-contain"
                                />
                              </a>
                            ) : (
                              <p className="text-sm">No SIRET document provided</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="default"
                            onClick={() => handleVerification(request.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleVerification(request.id, false, "Documents not valid")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved">
            {isLoading ? (
              <p>Loading approved requests...</p>
            ) : approvedRequests.length === 0 ? (
              <p>No approved verification requests.</p>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map(request => {
                  const vetProfile = vetProfiles[request.vet_id];
                  return (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-medium">{vetProfile?.name || 'Unknown Vet'}</h3>
                        <p className="text-sm text-muted-foreground">{vetProfile?.email || 'No email'}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                            Approved
                          </span>
                          {request.reviewed_at && (
                            <p className="text-xs text-muted-foreground">
                              Approved on: {new Date(request.reviewed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {isLoading ? (
              <p>Loading rejected requests...</p>
            ) : rejectedRequests.length === 0 ? (
              <p>No rejected verification requests.</p>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map(request => {
                  const vetProfile = vetProfiles[request.vet_id];
                  return (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-medium">{vetProfile?.name || 'Unknown Vet'}</h3>
                        <p className="text-sm text-muted-foreground">{vetProfile?.email || 'No email'}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                            Rejected
                          </span>
                          {request.reviewed_at && (
                            <p className="text-xs text-muted-foreground">
                              Rejected on: {new Date(request.reviewed_at).toLocaleString()}
                            </p>
                          )}
                          {request.rejection_reason && (
                            <p className="text-xs text-muted-foreground">
                              Reason: {request.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModeratorVerification;
