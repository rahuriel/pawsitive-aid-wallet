
-- Add image_url field to the treatment_requests table
ALTER TABLE treatment_requests ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add rejection_reason field to the treatment_requests table
ALTER TABLE treatment_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create a storage bucket for treatment images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('treatment-images', 'Treatment Images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload treatment images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'treatment-images');

-- Allow all users to view treatment images
CREATE POLICY "All users can view treatment images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'treatment-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'treatment-images' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'treatment-images' AND auth.uid() = owner);
