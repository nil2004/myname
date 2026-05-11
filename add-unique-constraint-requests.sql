-- Add Unique Constraint to Requests Table
-- This prevents duplicate requests from same customer (name + phone)
-- Run this SQL in Supabase SQL Editor

-- Add unique constraint on customer_name and customer_phone combination
ALTER TABLE requests 
ADD CONSTRAINT unique_customer_request 
UNIQUE (customer_name, customer_phone);

-- Verify constraint was added
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'requests'::regclass
AND conname = 'unique_customer_request';
