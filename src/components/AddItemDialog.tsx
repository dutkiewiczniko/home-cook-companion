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

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
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

      const { error } = await supabase.from("kitchen_items").insert([{
        user_id: user.id,
        name: selectedFood.name,
        quantity: quantity || "1",
        category: selectedFood.category as Database["public"]["Enums"]["storage_category"],
        notes: notes || null,
        best_before_date: bestBefore || null,
      }]);

      if (error) throw error;

      toast({
        title: "Item added!",
        description: `${selectedFood.name} has been added to your ${selectedFood.category}.`,
      });

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