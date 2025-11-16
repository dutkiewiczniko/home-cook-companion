import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ADMIN_PIN = "6234";

interface Product {
  id: string;
  display_name: string;
  brand: string | null;
  category: string | null;
  package_size: string | null;
  barcode: string | null;
  nutrition_profile_id: string | null;
}

interface NutritionProfile {
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  serving_size_g: number;
}

interface ProductsAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductsAdminDialog({ open, onOpenChange }: ProductsAdminDialogProps) {
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>("pantry");
  const [packageSize, setPackageSize] = useState("");
  const [barcode, setBarcode] = useState("");
  const [energyKcal, setEnergyKcal] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [fatG, setFatG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [servingSizeG, setServingSizeG] = useState("100");

  const STORAGE_CATEGORIES = ["fridge", "freezer", "produce", "spices", "pantry"] as const;

  useEffect(() => {
    if (open && pinVerified) {
      fetchProducts();
    }
  }, [open, pinVerified]);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setPinVerified(true);
      setPinInput("");
      toast({ title: "Access granted", description: "Welcome to product management" });
    } else {
      toast({ 
        title: "Access denied", 
        description: "Incorrect PIN", 
        variant: "destructive" 
      });
      setPinInput("");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("display_name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setDisplayName("");
    setBrand("");
    setCategory("pantry");
    setPackageSize("");
    setBarcode("");
    setEnergyKcal("");
    setProteinG("");
    setFatG("");
    setCarbsG("");
    setServingSizeG("100");
    setEditingProduct(null);
    setIsCreating(false);
  };

  const loadProductForEdit = (product: Product) => {
    setEditingProduct(product);
    setDisplayName(product.display_name);
    setBrand(product.brand || "");
    setCategory(product.category || "pantry");
    setPackageSize(product.package_size || "");
    setBarcode(product.barcode || "");
    setIsCreating(true);

    // Fetch nutrition data if linked
    if (product.nutrition_profile_id) {
      fetchNutritionProfile(product.nutrition_profile_id);
    }
  };

  const fetchNutritionProfile = async (profileId: string) => {
    const { data } = await supabase
      .from("nutrition_profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (data) {
      setEnergyKcal(data.energy_kcal.toString());
      setProteinG(data.protein_g.toString());
      setFatG(data.fat_g.toString());
      setCarbsG(data.carbs_g.toString());
      setServingSizeG(data.serving_size_g.toString());
    }
  };

  const handleSaveProduct = async () => {
    if (!displayName.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let nutritionProfileId = editingProduct?.nutrition_profile_id;

      // Create or update nutrition profile if nutrition data is provided
      if (energyKcal || proteinG || fatG || carbsG) {
        const nutritionData = {
          food_name: displayName,
          energy_kcal: parseFloat(energyKcal) || 0,
          protein_g: parseFloat(proteinG) || 0,
          fat_g: parseFloat(fatG) || 0,
          carbs_g: parseFloat(carbsG) || 0,
          serving_size_g: parseFloat(servingSizeG) || 100,
          is_estimate: false,
        };

        if (nutritionProfileId) {
          // Update existing nutrition profile
          const { error } = await supabase
            .from("nutrition_profiles")
            .update(nutritionData)
            .eq("id", nutritionProfileId);

          if (error) throw error;
        } else {
          // Create new nutrition profile
          const { data, error } = await supabase
            .from("nutrition_profiles")
            .insert(nutritionData)
            .select()
            .single();

          if (error) throw error;
          nutritionProfileId = data.id;
        }
      }

      // Create or update product
      const productData = {
        display_name: displayName,
        brand: brand || null,
        category: category || null,
        package_size: packageSize || null,
        barcode: barcode || null,
        nutrition_profile_id: nutritionProfileId,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
        toast({ title: "Success", description: "Product created" });
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted" });
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!pinVerified) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access Required</DialogTitle>
            <DialogDescription>
              Enter the admin PIN to access product management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                maxLength={4}
              />
            </div>
            <Button onClick={handlePinSubmit} className="w-full">
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Product & Nutrition Manager</DialogTitle>
          <DialogDescription>
            Manage branded food items and their nutritional values
          </DialogDescription>
        </DialogHeader>

        {!isCreating ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="space-y-2 pr-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No products found. Create your first product!
                  </p>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.display_name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            {product.brand && <p>Brand: {product.brand}</p>}
                            {product.category && <p>Category: {product.category}</p>}
                            {product.package_size && <p>Size: {product.package_size}</p>}
                            {product.nutrition_profile_id && (
                              <p className="text-green-600">✓ Nutrition data linked</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadProductForEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingProduct ? "Edit Product" : "New Product"}
              </h3>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Product Name *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Brennans Chia Wholegrain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Brennans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Storage Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {STORAGE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageSize">Package Size</Label>
                    <Input
                      id="packageSize"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      placeholder="e.g. 400g, 1L"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="For future scanning"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-4">Nutrition Information (per 100g)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="energyKcal">Energy (kcal)</Label>
                      <Input
                        id="energyKcal"
                        type="number"
                        value={energyKcal}
                        onChange={(e) => setEnergyKcal(e.target.value)}
                        placeholder="e.g. 250"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servingSizeG">Serving Size (g)</Label>
                      <Input
                        id="servingSizeG"
                        type="number"
                        value={servingSizeG}
                        onChange={(e) => setServingSizeG(e.target.value)}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proteinG">Protein (g)</Label>
                      <Input
                        id="proteinG"
                        type="number"
                        value={proteinG}
                        onChange={(e) => setProteinG(e.target.value)}
                        placeholder="e.g. 8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fatG">Fat (g)</Label>
                      <Input
                        id="fatG"
                        type="number"
                        value={fatG}
                        onChange={(e) => setFatG(e.target.value)}
                        placeholder="e.g. 3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carbsG">Carbs (g)</Label>
                      <Input
                        id="carbsG"
                        type="number"
                        value={carbsG}
                        onChange={(e) => setCarbsG(e.target.value)}
                        placeholder="e.g. 45"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveProduct} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
