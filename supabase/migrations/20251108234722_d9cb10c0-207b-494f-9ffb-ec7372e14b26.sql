-- Create nutrition_profiles table for ingredient nutritional data
CREATE TABLE public.nutrition_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_name TEXT NOT NULL UNIQUE,
  energy_kcal NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  is_estimate BOOLEAN NOT NULL DEFAULT false,
  serving_size_g NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_nutrition_log table for tracking daily totals
CREATE TABLE public.daily_nutrition_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein NUMERIC NOT NULL DEFAULT 0,
  total_fat NUMERIC NOT NULL DEFAULT 0,
  total_carbs NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_log ENABLE ROW LEVEL SECURITY;

-- Nutrition profiles are viewable by everyone (read-only reference data)
CREATE POLICY "Nutrition profiles are viewable by everyone" 
ON public.nutrition_profiles 
FOR SELECT 
USING (true);

-- Users can view their own nutrition logs
CREATE POLICY "Users can view their own nutrition logs" 
ON public.daily_nutrition_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own nutrition logs
CREATE POLICY "Users can insert their own nutrition logs" 
ON public.daily_nutrition_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own nutrition logs
CREATE POLICY "Users can update their own nutrition logs" 
ON public.daily_nutrition_log 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_nutrition_profiles_updated_at
BEFORE UPDATE ON public.nutrition_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_nutrition_log_updated_at
BEFORE UPDATE ON public.daily_nutrition_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common Irish food nutrition data (per 100g)
INSERT INTO public.nutrition_profiles (food_name, energy_kcal, protein_g, fat_g, carbs_g, is_estimate, serving_size_g) VALUES
('rice', 130, 2.7, 0.3, 28, false, 100),
('chicken breast', 165, 31, 3.6, 0, false, 100),
('egg', 155, 13, 11, 1.1, false, 100),
('milk', 42, 3.4, 1, 5, false, 100),
('bread', 265, 9, 3.2, 49, false, 100),
('banana', 89, 1.1, 0.3, 23, false, 100),
('cheese', 402, 25, 33, 1.3, false, 100),
('potato', 77, 2, 0.1, 17, false, 100),
('pasta', 131, 5, 1.1, 25, false, 100),
('butter', 717, 0.9, 81, 0.1, false, 100),
('beef mince', 250, 26, 15, 0, false, 100),
('salmon', 208, 20, 13, 0, false, 100),
('yogurt', 59, 10, 0.4, 3.6, false, 100),
('carrots', 41, 0.9, 0.2, 10, false, 100),
('broccoli', 34, 2.8, 0.4, 7, false, 100),
('tomato', 18, 0.9, 0.2, 3.9, false, 100),
('onion', 40, 1.1, 0.1, 9, false, 100),
('apple', 52, 0.3, 0.2, 14, false, 100),
('orange', 47, 0.9, 0.1, 12, false, 100),
('bacon', 541, 37, 42, 1.4, false, 100);