-- Add vendor_options column to store all matched vendors per category
ALTER TABLE vendor_suggestions 
  ADD COLUMN IF NOT EXISTS vendor_options JSONB DEFAULT '{}';

-- Add selected_vendor_indices to track which vendor is selected per category
ALTER TABLE vendor_suggestions 
  ADD COLUMN IF NOT EXISTS selected_vendor_indices JSONB DEFAULT '{}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_suggestions_vendor_options 
  ON vendor_suggestions USING GIN (vendor_options);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns added
SELECT 
  'vendor_options' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendor_suggestions' 
    AND column_name = 'vendor_options'
  ) as exists;

SELECT '✅ Enhanced columns added successfully!' as message;
