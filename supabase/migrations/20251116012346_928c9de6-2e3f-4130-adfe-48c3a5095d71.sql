-- Create products table for branded food items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  package_size TEXT,
  barcode TEXT,
  nutrition_profile_id UUID REFERENCES public.nutrition_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone (so they can be used in recipes/shopping)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Anyone can insert products (PIN protection handled in UI)
CREATE POLICY "Anyone can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

-- Anyone can update products (PIN protection handled in UI)
CREATE POLICY "Anyone can update products" 
ON public.products 
FOR UPDATE 
USING (true);

-- Anyone can delete products (PIN protection handled in UI)
CREATE POLICY "Anyone can delete products" 
ON public.products 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster name searches
CREATE INDEX idx_products_display_name ON public.products(display_name);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_barcode ON public.products(barcode);