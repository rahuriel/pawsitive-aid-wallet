
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import VetVerification from "@/components/VetVerification";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";


// Animal types for dropdown selection
const animalTypes = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Horse",
  "Other"
];

// Treatment category interface
interface TreatmentCategory {
  id: string;
  name: string;
  description: string | null;
}

// Default treatment categories (will be replaced with data from the database)
const defaultTreatmentCategories: TreatmentCategory[] = [
  { id: '1', name: 'Vaccine', description: 'Vaccination services for pets' },
  { id: '2', name: 'Surgery', description: 'Surgical procedures' },
  { id: '3', name: 'Routine Treatment', description: 'Regular check-ups and standard treatments' },
  { id: '4', name: 'Deworming', description: 'Parasite removal treatments' },
  { id: '5', name: 'Blood Transfusion', description: 'Blood transfer procedures' },
  { id: '6', name: 'Scanner', description: 'Imaging services like X-ray, MRI, etc.' },
  { id: '7', name: 'Blood Check', description: 'Blood tests and analysis' }
];

const TreatmentRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [animalName, setAnimalName] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [treatmentCategories, setTreatmentCategories] = useState<TreatmentCategory[]>(defaultTreatmentCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch treatment categories from the database
  useEffect(() => {
    const fetchTreatmentCategories = async () => {
      try {
        // Use type assertion to bypass TypeScript errors
        const { data, error } = await (supabase as any)
          .from('treatment_categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching treatment categories:', error);
          return;
        }
        
        if (data) {
          // Cast data to TreatmentCategory[] to fix TypeScript error
          setTreatmentCategories(data as TreatmentCategory[]);
        }
      } catch (error) {
        console.error('Exception fetching treatment categories:', error);
      }
    };
    
    fetchTreatmentCategories();
  }, []);
  
  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      // Create a preview URL for display
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a treatment request");
      return;
    }
    
    if (user.role !== "vet") {
      toast.error("Only veterinarians can submit treatment requests");
      return;
    }
    
    if (!user.is_vet_verified) {
      toast.error("Your account needs to be verified before submitting treatment requests");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let uploadedImageUrl = "";
      
      // Upload image if one was selected
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
        
        // Get the public URL for the uploaded image
        const { data } = supabase.storage
          .from('treatment-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrl = data.publicUrl;
      }
      
      // Insert the treatment request
      const { data: treatmentData, error: treatmentError } = await supabase
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
        })
        .select('id')
        .single();
        
      if (treatmentError) throw treatmentError;
      
      if (!treatmentData || !treatmentData.id) {
        throw new Error("Failed to retrieve the created treatment request ID");
      }
      
      // Insert treatment categories if any are selected
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map(categoryId => ({
          treatment_request_id: treatmentData.id,
          category_id: categoryId
        }));
        
        // Use type assertion to bypass TypeScript errors
        const { error: categoriesError } = await (supabase as any)
          .from('treatment_request_categories')
          .insert(categoryInserts);
        
        if (categoriesError) {
          console.error("Error inserting treatment categories:", categoriesError);
          // Continue despite error - the main treatment request was created
        }
      }
      
      toast.success("Treatment request submitted successfully");
      
      // Reset form
      setAnimalName("");
      setAnimalType("");
      setDescription("");
      setAmount("");
      setImage(null);
      setImageUrl("");
      setSelectedCategories([]);
      
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
              <p>Only veterinarians can submit treatment requests.</p>
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
            <CardTitle className="text-xl">Submit Treatment Request</CardTitle>
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
              
              <div className="space-y-4">
                <div>
                  <Label>Treatment Categories</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-2">Select all that apply</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {treatmentCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category.id}`} 
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        disabled={isLoading}
                      />
                      <Label 
                        htmlFor={`category-${category.id}`}
                        className="cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map(id => {
                      const category = treatmentCategories.find(c => c.id === id);
                      return category ? (
                        <Badge key={id} variant="outline" className="bg-pawsitive-primary/10">
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
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

export default TreatmentRequests;
