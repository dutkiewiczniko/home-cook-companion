import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForms } from "@/components/AuthForms";
import { AddItemDialog } from "@/components/AddItemDialog";
import { KitchenInventory } from "@/components/KitchenInventory";
import { MealSuggestions } from "@/components/MealSuggestions";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <ChefHat className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading Kitchen AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForms />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="container max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Kitchen AI
              </h1>
              <p className="text-muted-foreground">Your smart cooking companion</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inventory */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Kitchen Inventory</h2>
              <AddItemDialog onItemAdded={() => setRefreshTrigger((prev) => prev + 1)} />
            </div>
            <KitchenInventory
              refreshTrigger={refreshTrigger}
              onItemsChange={setItems}
            />
          </div>

          {/* Right Column - AI Suggestions */}
          <div className="space-y-6">
            <MealSuggestions items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;