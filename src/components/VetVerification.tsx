
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, File } from "lucide-react";

const VetVerification = () => {
  const { user, refreshUserData } = useAuth();
  const [cinDocument, setCinDocument] = useState<File | null>(null);
  const [siretDocument, setSiretDocument] = useState<File | null>(null);
  const [cinPreview, setCinPreview] = useState<string>("");
  const [siretPreview, setSiretPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if documents are already uploaded
  const hasSubmittedVerification = user?.cin_document_url || user?.siret_document_url || user?.verification_submitted_at;

  const handleCinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCinDocument(e.target.files[0]);
      setCinPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSiretDocument(e.target.files[0]);
      setSiretPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit verification documents");
      return;
    }
    
    if (!cinDocument || !siretDocument) {
      toast.error("Please upload both CIN and SIRET documents");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Starting verification submission for user:", user.id);
      
      // Upload CIN document
      const cinFileName = `${user.id}-cin-${Math.random().toString(36).substring(2, 15)}.${cinDocument.name.split('.').pop()}`;
      const { error: cinError, data: cinData } = await supabase.storage
        .from('vet-verification')
        .upload(cinFileName, cinDocument);
      
      if (cinError) throw cinError;
      
      const cinUrl = supabase.storage
        .from('vet-verification')
        .getPublicUrl(cinFileName).data.publicUrl;
      
      console.log("CIN document uploaded successfully:", cinUrl);
      
      // Upload SIRET document
      const siretFileName = `${user.id}-siret-${Math.random().toString(36).substring(2, 15)}.${siretDocument.name.split('.').pop()}`;
      const { error: siretError, data: siretData } = await supabase.storage
        .from('vet-verification')
        .upload(siretFileName, siretDocument);
      
      if (siretError) throw siretError;
      
      const siretUrl = supabase.storage
        .from('vet-verification')
        .getPublicUrl(siretFileName).data.publicUrl;
      
      console.log("SIRET document uploaded successfully:", siretUrl);
      
      // Check if a verification request already exists for this user
      const { data: existingRequest, error: checkError } = await supabase
        .from('vet_verification_requests')
        .select('*')
        .eq('vet_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      const submissionTime = new Date().toISOString();
      
      // Create or update the verification request
      if (existingRequest) {
        console.log("Updating existing verification request");
        const { error: updateError } = await supabase
          .from('vet_verification_requests')
          .update({
            cin_document_url: cinUrl,
            siret_document_url: siretUrl,
            submitted_at: submissionTime,
            status: 'pending'
          })
          .eq('id', existingRequest.id);
        
        if (updateError) throw updateError;
      } else {
        console.log("Creating new verification request");
        const { error: insertError } = await supabase
          .from('vet_verification_requests')
          .insert([
            {
              vet_id: user.id,
              cin_document_url: cinUrl,
              siret_document_url: siretUrl,
              submitted_at: submissionTime,
              status: 'pending'
            }
          ]);
        
        if (insertError) throw insertError;
      }
      
      // Update the vet's profile to indicate verification is pending
      console.log("Updating vet profile to indicate verification is pending");
      const { error: verificationUpdateError } = await supabase
        .from('profiles')
        .update({
          is_vet_verified: false,
          verification_submitted_at: submissionTime
        })
        .eq('id', user.id);
      
      if (verificationUpdateError) {
        console.error("Error updating vet verification status:", verificationUpdateError);
        throw verificationUpdateError;
      }
      
      // Also ensure the user's role is set to 'vet' in the profiles table
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role: 'vet' })
        .eq('id', user.id);
      
      if (roleUpdateError) {
        console.error("Error updating vet role:", roleUpdateError);
        throw roleUpdateError;
      }
      
      toast.success("Verification documents submitted successfully");
      refreshUserData();
      
    } catch (error: any) {
      console.error("Error submitting verification documents:", error);
      toast.error(error.message || "Failed to submit verification documents");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to directly create a test verification entry
  const debugCreateTestVerification = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Creating test verification for user:", user.id);
      
      // Create test document URLs
      const cinUrl = "https://example.com/test-cin-document.jpg";
      const siretUrl = "https://example.com/test-siret-document.jpg";
      
      // First check if the profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      console.log("Current profile data:", profileData);
      
      // Update the profile with test verification data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cin_document_url: cinUrl,
          siret_document_url: siretUrl,
          verification_submitted_at: new Date().toISOString(),
          role: 'vet',
          is_vet_verified: false
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (verifyError) throw verifyError;
      console.log("Updated profile data:", verifyData);
      
      toast.success("Test verification created successfully");
      refreshUserData();
      
    } catch (error: any) {
      console.error("Error creating test verification:", error);
      toast.error(error.message || "Failed to create test verification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Veterinarian Verification
        </CardTitle>
        <CardDescription>
          Submit your identification documents to verify your veterinarian status
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Debug button */}
        <Button 
          onClick={debugCreateTestVerification} 
          className="mb-4 bg-yellow-600 hover:bg-yellow-700 w-full"
        >
          Debug: Create Test Verification
        </Button>
        
        {user?.is_vet_verified ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-800 font-medium">
              Your account is verified as a veterinarian.
            </p>
          </div>
        ) : hasSubmittedVerification ? (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800 font-medium">
              Your verification is pending review by a moderator.
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              You'll be able to submit treatment requests once verified.
            </p>
            <div className="mt-4">
              <Button 
                onClick={async () => {
                  toast.info("Checking verification status...");
                  await refreshUserData();
                  toast.success("Verification status updated");
                }} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Checking..." : "Check Verification Status"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cinDocument">National ID Card (CIN)</Label>
              <Input 
                id="cinDocument"
                type="file"
                accept="image/*"
                onChange={handleCinChange}
                disabled={isLoading}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pawsitive-primary file:text-white hover:file:bg-pawsitive-secondary"
              />
              {cinPreview && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <img 
                    src={cinPreview} 
                    alt="CIN Preview" 
                    className="h-32 border rounded object-contain"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siretDocument">SIRET Document</Label>
              <Input 
                id="siretDocument"
                type="file"
                accept="image/*"
                onChange={handleSiretChange}
                disabled={isLoading}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pawsitive-primary file:text-white hover:file:bg-pawsitive-secondary"
              />
              {siretPreview && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <img 
                    src={siretPreview} 
                    alt="SIRET Preview" 
                    className="h-32 border rounded object-contain"
                  />
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-pawsitive-primary hover:bg-pawsitive-secondary"
              disabled={isLoading || !cinDocument || !siretDocument}
            >
              {isLoading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>
          Note: Your verification status needs to be approved by a moderator before 
          you can submit treatment requests.
        </p>
      </CardFooter>
    </Card>
  );
};

export default VetVerification;
