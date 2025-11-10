import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { FoodSelector } from "./FoodSelector";
import type { FoodItem } from "@/data/irishFoodItems";
import { getDefaultQuantity } from "@/data/defaultQuantities";

interface AddItemDialogProps {
  onItemAdded: () => void;
}

export const AddItemDialog = ({ onItemAdded }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [bestBefore, setBestBefore] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [storageCategory, setStorageCategory] =
    useState<Database["public"]["Enums"]["storage_category"]>("pantry");

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setStorageCategory(
      food.category as Database["public"]["Enums"]["storage_category"]
    );
    // Set default quantity based on item type
    setQuantity(getDefaultQuantity(food.name));
    setStep("details");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const itemName = selectedFood.name;
      const itemQuantity = quantity || getDefaultQuantity(itemName);

      // Check if item already exists (case-insensitive)
      const { data: existingItems } = await supabase
        .from("kitchen_items")
        .select("*")
        .eq("user_id", user.id)
        .ilike("name", itemName);

      if (existingItems && existingItems.length > 0) {
        // Item exists - merge quantities
        const existingItem = existingItems[0];
        
        // Parse existing quantity
        const existingQtyMatch = existingItem.quantity.match(/(\d+(?:\.\d+)?)/);
        const existingQty = existingQtyMatch ? parseFloat(existingQtyMatch[1]) : 0;
        
        // Parse new quantity
        const newQtyMatch = itemQuantity.match(/(\d+(?:\.\d+)?)/);
        const newQty = newQtyMatch ? parseFloat(newQtyMatch[1]) : 0;
        
        // Get unit (g, kg, L, ml, items, etc.)
        const unit = existingItem.quantity.match(/[a-zA-Z]+/)?.[0] || itemQuantity.match(/[a-zA-Z]+/)?.[0] || "";
        
        const mergedQuantity = `${existingQty + newQty} ${unit}`.trim();
        
        // Update existing item with merged quantity
        const { error } = await supabase
          .from("kitchen_items")
          .update({ 
            quantity: mergedQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (error) throw error;

        toast({
          title: "Item updated!",
          description: `Merged ${itemName}: ${existingItem.quantity} + ${itemQuantity} = ${mergedQuantity}`,
        });
      } else {
        // Item doesn't exist - insert new
        const { error } = await supabase.from("kitchen_items").insert([{
          user_id: user.id,
          name: itemName,
          quantity: itemQuantity,
          category: storageCategory,
          notes: notes || null,
          best_before_date: bestBefore || null,
        }]);

        if (error) throw error;

        toast({
          title: "Item added!",
          description: `${itemName} has been added to your ${selectedFood.category}.`,
        });
      }

      setSelectedFood(null);
      setQuantity("");
      setBestBefore("");
      setNotes("");
      setStep("select");
      setOpen(false);
      onItemAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep("select");
      setSelectedFood(null);
      setQuantity("");
      setBestBefore("");
      setNotes("");
      setStorageCategory("pantry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Select Food Item" : `Add ${selectedFood?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === "select" 
              ? "Choose an item from our Irish grocery selection" 
              : "Add quantity and details for your item"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <FoodSelector onSelect={handleFoodSelect} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                placeholder="e.g., 500g or 3 items"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-category">Storage Category</Label>
              <select
                id="storage-category"
                value={storageCategory}
                onChange={(e) => setStorageCategory(e.target.value as Database["public"]["Enums"]["storage_category"])}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pantry">Pantry</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
                <option value="produce">Produce</option>
                <option value="spices">Spices</option>
              </select>
            </div>

            

            <div className="space-y-2">
              <Label htmlFor="best-before">Best Before Date (optional)</Label>
              <Input
                id="best-before"
                type="date"
                value={bestBefore}
                onChange={(e) => setBestBefore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};