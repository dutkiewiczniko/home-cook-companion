import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  fetchNutritionProfile,
  scaleNutritionByGrams,
  logNutritionToDaily,
  type NutritionData,
  type ScaledNutrition,
} from "@/lib/nutritionService";

interface Recipe {
  id: string;
  title: string;
  content: string;
}

interface RecipeConsumptionDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeLogged: () => void;
}

interface Ingredient {
  name: string;
  amount: number;
  nutrition?: NutritionData;
}

/**
 * Extract ingredients from recipe markdown content
 */
function parseIngredientsFromRecipe(content: string): Ingredient[] {
  const ingredientSection = content.split("Ingredients:")[1]?.split("Instructions:")[0];
  if (!ingredientSection) return [];

  const lines = ingredientSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+/));

  return lines.map((line) => {
    // Remove leading dash or number
    const cleaned = line.replace(/^[-\d.]+\s*/, "").trim();
    // Extract amount if present (simple heuristic)
    const amountMatch = cleaned.match(/(\d+)\s*(g|ml|kg|l)/i);
    const amount = amountMatch ? parseInt(amountMatch[1]) : 100;
    // Extract name (everything before amount or just the whole thing)
    const name = cleaned.split(/\d+\s*(g|ml|kg|l)/i)[0].trim() || cleaned;

    return { name, amount };
  });
}

export const RecipeConsumptionDialog = ({
  recipe,
  open,
  onOpenChange,
  onRecipeLogged,
}: RecipeConsumptionDialogProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingNutrition, setFetchingNutrition] = useState(false);
  const [totals, setTotals] = useState<ScaledNutrition>({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const { toast } = useToast();

  // Parse ingredients and fetch nutrition when dialog opens
  useEffect(() => {
    if (open && recipe) {
      const parsed = parseIngredientsFromRecipe(recipe.content);
      setIngredients(parsed);
      fetchAllNutrition(parsed);
    }
  }, [open, recipe]);

  // Recalculate totals whenever ingredients change
  useEffect(() => {
    calculateTotals();
  }, [ingredients]);

  const fetchAllNutrition = async (ingredientList: Ingredient[]) => {
    setFetchingNutrition(true);
    try {
      const withNutrition = await Promise.all(
        ingredientList.map(async (ing) => {
          const nutrition = await fetchNutritionProfile(ing.name);
          return { ...ing, nutrition };
        })
      );
      setIngredients(withNutrition);
    } catch (error) {
      console.error("Error fetching nutrition:", error);
    } finally {
      setFetchingNutrition(false);
    }
  };

  const calculateTotals = () => {
    const total = ingredients.reduce(
      (acc, ing) => {
        if (!ing.nutrition) return acc;
        const scaled = scaleNutritionByGrams(ing.nutrition, ing.amount);
        return {
          calories: acc.calories + scaled.calories,
          protein: acc.protein + scaled.protein,
          fat: acc.fat + scaled.fat,
          carbs: acc.carbs + scaled.carbs,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    setTotals(total);
  };

  const updateIngredient = (index: number, field: "name" | "amount", value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing;
        const updated = { ...ing, [field]: value };
        // If name changed, refetch nutrition
        if (field === "name" && typeof value === "string") {
          fetchNutritionProfile(value).then((nutrition) => {
            setIngredients((current) =>
              current.map((item, idx) => (idx === index ? { ...item, nutrition } : item))
            );
          });
        }
        return updated;
      })
    );
  };

  const handleConfirm = async () => {
    if (!recipe) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await logNutritionToDaily(user.id, totals);

      toast({
        title: "Recipe logged!",
        description: `${recipe.title} added to your nutrition tracker.`,
      });

      onOpenChange(false);
      onRecipeLogged();
    } catch (error: any) {
      console.error("Error logging recipe:", error);
      toast({
        title: "Error",
        description: "Failed to log recipe to nutrition tracker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Recipe: {recipe.title}</DialogTitle>
          <DialogDescription>
            Review and adjust ingredients before logging to your nutrition tracker
          </DialogDescription>
        </DialogHeader>

        {fetchingNutrition ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Fetching nutrition data...</span>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Ingredients list */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Ingredients</h4>
              {ingredients.map((ing, idx) => (
                <Card key={idx} className="p-3 border-border/50">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Ingredient</Label>
                        <Input
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Amount (g)</Label>
                        <Input
                          type="number"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(idx, "amount", parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {ing.nutrition && (
                      <div className="flex gap-1 flex-wrap">
                        {ing.nutrition.is_estimate && (
                          <Badge variant="secondary" className="text-xs">Estimated</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {Math.round(scaleNutritionByGrams(ing.nutrition, ing.amount).calories)} cal
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Totals */}
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-border/50">
              <h4 className="font-semibold mb-3">Nutrition Totals</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="text-lg font-bold">{Math.round(totals.calories)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="text-lg font-bold">{Math.round(totals.protein)}g</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Fat</div>
                  <div className="text-lg font-bold">{Math.round(totals.fat)}g</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="text-lg font-bold">{Math.round(totals.carbs)}g</div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading || fetchingNutrition}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  "Confirm & Log"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
