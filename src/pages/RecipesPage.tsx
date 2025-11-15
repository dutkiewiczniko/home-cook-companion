import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, RefreshCw, Wand2, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { RecipeConsumptionDialog } from "@/components/RecipeConsumptionDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: string;
  content: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

interface RecipesPageProps {
  items: Array<{
    name: string;
    quantity: string;
    category: string;
  }>;
}

export const RecipesPage = ({ items }: RecipesPageProps) => {
  const [mealType, setMealType] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [optionalIngredients, setOptionalIngredients] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [cookingFor, setCookingFor] = useState("1");
  const [budget, setBudget] = useState("");
  const [goingShopping, setGoingShopping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tweakingRecipeId, setTweakingRecipeId] = useState<string | null>(null);
  const [tweakText, setTweakText] = useState("");
  const [recipeToLog, setRecipeToLog] = useState<Recipe | null>(null);
  const [homeIngredientUsage, setHomeIngredientUsage] = useState(60); // 0-100%
  const [showPromptDebug, setShowPromptDebug] = useState(false);
  const [lastPromptData, setLastPromptData] = useState<any>(null);
  const [lastFullPrompt, setLastFullPrompt] = useState<string>("");
  const { toast } = useToast();


  const generateRecipes = async (regenerateAll = false, tweakRecipeId?: string, tweakPrompt?: string) => {
    if (items.length === 0) {
      toast({
        title: "No items in inventory",
        description: "Please add some items to your kitchen first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        items,
        mealType,
        dietaryPreference,
        optionalIngredients,
        generalNotes,
        cookingFor: parseInt(cookingFor) || 1,
        budget,
        goingShopping,
        homeIngredientUsage,
        regenerateAll,
        tweakRecipeId,
        tweakPrompt,
        currentRecipes: recipes,
      };
      
      setLastPromptData(requestBody); // Store for debug view
      
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: requestBody,
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402")) {
          toast({
            title: "Credits exhausted",
            description: "AI service credits have been exhausted.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (tweakRecipeId) {
        // Replace only the tweaked recipe
        setRecipes((prev) =>
          prev.map((r) => (r.id === tweakRecipeId ? data.recipe : r))
        );
        if (data.debugPrompt) setLastFullPrompt(data.debugPrompt);
      } else {
        setRecipes(data.recipes);
        if (data.debugPrompt) setLastFullPrompt(data.debugPrompt);
      }
    } catch (error: any) {
      console.error("Error generating recipes:", error);
      toast({
        title: "Error",
        description: "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTweakingRecipeId(null);
      setTweakText("");
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Input Form */}
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Recipe Generator
          </CardTitle>
          <CardDescription className="text-base">
            Get 5 personalized recipe ideas based on your ingredients
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="general-notes" className="text-base">General Notes (Optional)</Label>
              <Textarea
                id="general-notes"
                placeholder="e.g., avoid dairy, use leftovers, something high-protein..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="text-base min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal-type" className="text-base">Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="supper">Supper</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="drink">Drink/Smoothie</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary" className="text-base">Dietary Preference</Label>
                <Select value={dietaryPreference} onValueChange={setDietaryPreference}>
                  <SelectTrigger id="dietary">
                    <SelectValue placeholder="Select preference (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="low-effort">Low Effort</SelectItem>
                    <SelectItem value="flavorful">Flavorful</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="high-protein">High Protein</SelectItem>
                    <SelectItem value="low-carb">Low Carb</SelectItem>
                    <SelectItem value="comfort-food">Comfort Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optional-ingredients" className="text-base">Optional Ingredients to Try</Label>
              <Input
                id="optional-ingredients"
                placeholder="e.g., avocado, quinoa, coconut milk..."
                value={optionalIngredients}
                onChange={(e) => setOptionalIngredients(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooking-for" className="text-base">Cooking For (People)</Label>
              <Input
                id="cooking-for"
                type="number"
                min="1"
                max="20"
                value={cookingFor}
                onChange={(e) => setCookingFor(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="home-ingredient-slider" className="text-base">
                  Use ingredients from home
                </Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {homeIngredientUsage}%
                </span>
              </div>
              <input
                id="home-ingredient-slider"
                type="range"
                min="0"
                max="100"
                step="10"
                value={homeIngredientUsage}
                onChange={(e) => setHomeIngredientUsage(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shop-focused</span>
                <span>Balanced</span>
                <span>Pantry-first</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
              <div className="space-y-1">
                <Label htmlFor="shopping" className="text-base font-medium">Can go shopping</Label>
                <p className="text-sm text-muted-foreground">
                  Include recipes that need extra ingredients
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="shopping"
                  type="checkbox"
                  checked={goingShopping}
                  onChange={(e) => setGoingShopping(e.target.checked)}
                  className="w-10 h-6 rounded-full appearance-none bg-muted checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-background before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4"
                />
              </div>
            </div>

            {goingShopping && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label htmlFor="budget" className="text-base">Budget (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="20"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="text-base pl-7"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => generateRecipes(true)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg text-base py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating recipes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate 5 Recipes
                  </>
                )}
              </Button>
              
              {lastPromptData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPromptDebug(true)}
                  className="w-full"
                >
                  Show Debug Info
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Cards */}
      {recipes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Your Recipe Suggestions
            </h2>
            <Button
              variant="outline"
              onClick={() => generateRecipes(true)}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle className="text-xl">{recipe.title}</CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>⏱️ {recipe.time}</span>
                    <span>📊 {recipe.difficulty}</span>
                  </div>
                  {(recipe.calories || recipe.protein) && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {recipe.calories && <div className="bg-muted/50 px-2 py-1 rounded">🔥 {recipe.calories} kcal</div>}
                      {recipe.protein && <div className="bg-muted/50 px-2 py-1 rounded">🥩 {recipe.protein}g protein</div>}
                      {recipe.fat && <div className="bg-muted/50 px-2 py-1 rounded">🧈 {recipe.fat}g fat</div>}
                      {recipe.carbs && <div className="bg-muted/50 px-2 py-1 rounded">🍞 {recipe.carbs}g carbs</div>}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{recipe.content}</ReactMarkdown>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => setRecipeToLog(recipe)}
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      <Utensils className="w-4 h-4 mr-2" />
                      Log as Eaten
                    </Button>

                    {tweakingRecipeId === recipe.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="What would you like different?"
                          value={tweakText}
                          onChange={(e) => setTweakText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => generateRecipes(false, recipe.id, tweakText)}
                            disabled={!tweakText.trim() || loading}
                            className="flex-1"
                          >
                            Apply Tweak
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTweakingRecipeId(null);
                              setTweakText("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTweakingRecipeId(recipe.id)}
                          className="flex-1"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Tweak Recipe
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateRecipes(false, recipe.id, "Generate a similar recipe with different ingredients")}
                          disabled={loading}
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          More Like This
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Consumption Dialog */}
      <RecipeConsumptionDialog
        recipe={recipeToLog}
        open={!!recipeToLog}
        onOpenChange={(open) => !open && setRecipeToLog(null)}
        onRecipeLogged={() => {
          toast({
            title: "Success",
            description: "Recipe logged to nutrition tracker",
          });
        }}
      />

      {/* Debug Prompt Dialog */}
      <Dialog open={showPromptDebug} onOpenChange={setShowPromptDebug}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Debug: AI Request Details</DialogTitle>
            <DialogDescription>View and copy the exact request sent to Gemini</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] w-full">
            <div className="space-y-6 p-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">Full Prompt Sent to Gemini</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(lastFullPrompt);
                      toast({ title: "Copied!", description: "Prompt copied to clipboard" });
                    }}
                  >
                    Copy Prompt
                  </Button>
                </div>
                <div className="rounded-md border bg-muted/50 p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {lastFullPrompt || "No prompt available"}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Request Parameters</h3>
                <div className="rounded-md border bg-muted/50 p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {JSON.stringify(lastPromptData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
