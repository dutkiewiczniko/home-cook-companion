-- Add best_before_date column to kitchen_items table
ALTER TABLE public.kitchen_items 
ADD COLUMN best_before_date date;