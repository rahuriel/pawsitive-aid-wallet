
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import VetVerification from "@/components/VetVerification";

const animalTypes = ["Dog", "Cat", "Bird", "Rabbit", "Horse", "Other"];

const VetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [animalName, setAnimalName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a treatment request");
      return;
    }
    
    if (!user.is_vet_verified) {
      toast.error("Your account needs to be verified before submitting treatment requests");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let uploadedImageUrl = "";
      
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('treatment-images')
          .upload(filePath, image);
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('treatment-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrl = data.publicUrl;
      }
      
      const { error } = await supabase
        .from('treatment_requests')
        .insert({
          animal_name: animalName,
          animal_type: animalType,
          description,
          amount: parseFloat(amount),
          status: 'pending',
          vet_id: user.id,
          vet_name: user.name,
          image_url: uploadedImageUrl
        });
        
      if (error) throw error;
      
      toast.success("Treatment request submitted successfully");
      
      // Reset form
      setAnimalName("");
      setAnimalType("");
      setDescription("");
      setAmount("");
      setImage(null);
      setImageUrl("");
      
      // Navigate to treatments list
      navigate('/treatments');
      
    } catch (error: any) {
      console.error("Error submitting treatment request:", error);
      toast.error(error.message || "Failed to submit treatment request");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (user.role !== "vet") {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Only veterinarians can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user.is_vet_verified) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Your account needs to be verified before submitting treatment requests.</p>
              <VetVerification />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Submit Treatment Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalName">Animal Name</Label>
                  <Input 
                    id="animalName"
                    value={animalName}
                    onChange={(e) => setAnimalName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="animalType">Animal Type</Label>
                  <Select 
                    value={animalType} 
                    onValueChange={setAnimalType}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="animalType">
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {animalTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description of Treatment</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  disabled={isLoading}
                  placeholder="Describe the condition and treatment provided..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Treatment Cost (TND)</Label>
                  <Input 
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Treatment Photo (Optional)</Label>
                  <Input 
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-pawsitive-primary file:text-white hover:file:bg-pawsitive-secondary"
                  />
                </div>
              </div>
              
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Image Preview</p>
                  <img 
                    src={imageUrl} 
                    alt="Treatment preview" 
                    className="max-h-48 rounded border"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full md:w-auto bg-pawsitive-primary hover:bg-pawsitive-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VetDashboard;
