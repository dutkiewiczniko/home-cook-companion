import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface MealSuggestionsProps {
  items: Array<{
    name: string;
    quantity: string;
    category: string;
  }>;
}

export const MealSuggestions = ({ items }: MealSuggestionsProps) => {
  const [preferences, setPreferences] = useState("");
  const [goingShopping, setGoingShopping] = useState(false);
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string>("");
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (items.length === 0) {
      toast({
        title: "No items in inventory",
        description: "Please add some items to your kitchen first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuggestions("");

    try {
      const { data, error } = await supabase.functions.invoke("meal-suggestions", {
        body: {
          items,
          preferences,
          goingShopping,
          budget,
        },
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

      setSuggestions(data.suggestions);
    } catch (error: any) {
      console.error("Error getting suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get meal suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Meal Suggestions
        </CardTitle>
        <CardDescription className="text-base">
          Get personalized recipe ideas based on your ingredients
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferences" className="text-base">What are you in the mood for?</Label>
            <Input
              id="preferences"
              placeholder="e.g., healthy, low effort, flavorful, vegetarian..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
            <div className="space-y-1">
              <Label htmlFor="shopping" className="text-base font-medium">Can go shopping</Label>
              <p className="text-sm text-muted-foreground">
                Include recipes that need extra ingredients
              </p>
            </div>
            <Switch
              id="shopping"
              checked={goingShopping}
              onCheckedChange={setGoingShopping}
            />
          </div>

          {goingShopping && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label htmlFor="budget" className="text-base">Budget (optional)</Label>
              <Input
                id="budget"
                placeholder="e.g., $20, Budget-friendly"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="text-base"
              />
            </div>
          )}

          <Button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg text-base py-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Getting suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Meal Suggestions
              </>
            )}
          </Button>
        </div>

        {suggestions && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 border-t pt-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Personalized Suggestions
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="bg-card p-6 rounded-xl border whitespace-pre-wrap">
                {suggestions}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};