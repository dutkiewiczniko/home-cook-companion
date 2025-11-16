import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForms } from "@/components/AuthForms";
import { AddItemDialog } from "@/components/AddItemDialog";
import { KitchenInventory } from "@/components/KitchenInventory";
import { RecipesPage } from "@/pages/RecipesPage";
import { NutritionPage } from "@/pages/NutritionPage";
import { ProductsAdminDialog } from "@/components/ProductsAdminDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, LogOut, Package, Sparkles, BarChart3, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
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
      <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pantry Pal
              </h1>
              <p className="text-muted-foreground">Your smart cooking companion</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdminDialog(true)}
              title="Product Manager (Admin)"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="recipes" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Recipes
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Nutrition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
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
          </TabsContent>

          <TabsContent value="recipes">
            <RecipesPage items={items} />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionPage />
          </TabsContent>
        </Tabs>

        {/* Products Admin Dialog */}
        <ProductsAdminDialog 
          open={showAdminDialog} 
          onOpenChange={setShowAdminDialog} 
        />
      </div>
    </div>
  );
};

export default Index;