import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KitchenItem {
  id: string;
  name: string;
  quantity: string;
  category: "fridge" | "freezer" | "produce" | "spices" | "pantry";
}

interface ConsumeItemDialogProps {
  item: KitchenItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemConsumed: () => void;
}

// Simple nutrition fallback values per 100g
const NUTRITION_FALLBACK: Record<string, { energy_kcal: number; protein_g: number; fat_g: number; carbs_g: number }> = {
  "default": { energy_kcal: 150, protein_g: 5, fat_g: 5, carbs_g: 20 },
};

const parseQuantity = (quantityStr: string): number => {
  const match = quantityStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 100;
};

export const ConsumeItemDialog = ({ item, open, onOpenChange, onItemConsumed }: ConsumeItemDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [consumedAmount, setConsumedAmount] = useState("");
  const { toast } = useToast();

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !consumedAmount) return;
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const amountNum = parseQuantity(consumedAmount);
      const currentNum = parseQuantity(item.quantity);

      // Get nutrition profile or use fallback
      const { data: nutritionProfile } = await supabase
        .from("nutrition_profiles")
        .select("*")
        .ilike("food_name", `%${item.name}%`)
        .limit(1)
        .maybeSingle();

      const nutrition = nutritionProfile || {
        ...NUTRITION_FALLBACK.default,
        is_estimate: true,
      };

      // Calculate nutrition based on consumed amount (assuming per 100g)
      const multiplier = amountNum / 100;
      const calories = nutrition.energy_kcal * multiplier;
      const protein = nutrition.protein_g * multiplier;
      const fat = nutrition.fat_g * multiplier;
      const carbs = nutrition.carbs_g * multiplier;

      // Update or insert daily nutrition log
      const today = new Date().toISOString().split("T")[0];
      const { data: existingLog } = await supabase
        .from("daily_nutrition_log")
        .select("*")
        .eq("date", today)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingLog) {
        await supabase
          .from("daily_nutrition_log")
          .update({
            total_calories: existingLog.total_calories + calories,
            total_protein: existingLog.total_protein + protein,
            total_fat: existingLog.total_fat + fat,
            total_carbs: existingLog.total_carbs + carbs,
          })
          .eq("id", existingLog.id);
      } else {
        await supabase.from("daily_nutrition_log").insert({
          user_id: user.id,
          date: today,
          total_calories: calories,
          total_protein: protein,
          total_fat: fat,
          total_carbs: carbs,
        });
      }

      // Update or delete kitchen item
      const newAmount = currentNum - amountNum;
      if (newAmount <= 0) {
        await supabase.from("kitchen_items").delete().eq("id", item.id);
      } else {
        const newQuantity = item.quantity.replace(/\d+(\.\d+)?/, newAmount.toString());
        await supabase
          .from("kitchen_items")
          .update({ quantity: newQuantity })
          .eq("id", item.id);
      }

      toast({
        title: "Item consumed!",
        description: `${consumedAmount} of ${item.name} logged to nutrition tracker.${nutrition.is_estimate ? " (Estimated values)" : ""}`,
      });

      onOpenChange(false);
      onItemConsumed();
    } catch (error: any) {
      console.error("Error consuming item:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConsumedAmount("");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Consume Item</DialogTitle>
          <DialogDescription>
            Log consumption of {item.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConsume} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="consumed-amount">Amount Consumed</Label>
            <Input
              id="consumed-amount"
              placeholder="e.g., 200g or 2 items"
              value={consumedAmount}
              onChange={(e) => setConsumedAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available: {item.quantity}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {loading ? "Logging..." : "Consume & Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
