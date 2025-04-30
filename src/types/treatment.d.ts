
export interface TreatmentCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface TreatmentRequest {
  id: string;
  animal_name: string;
  animal_type: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  vet_id: string; 
  vet_name: string;
  image_url?: string;
  rejection_reason?: string;
  categories?: TreatmentCategory[];
}
