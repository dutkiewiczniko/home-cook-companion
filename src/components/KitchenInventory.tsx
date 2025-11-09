import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Utensils } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { EditItemDialog } from "./EditItemDialog";
import { ConsumeItemDialog } from "./ConsumeItemDialog";

interface KitchenItem {
  id: string;
  name: string;
  quantity: string;
  category: "fridge" | "freezer" | "produce" | "spices" | "pantry";
  notes: string | null;
  best_before_date: string | null;
}

interface KitchenInventoryProps {
  refreshTrigger: number;
  onItemsChange: (items: KitchenItem[]) => void;
}

export const KitchenInventory = ({ refreshTrigger, onItemsChange }: KitchenInventoryProps) => {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<KitchenItem | null>(null);
  const [consumingItem, setConsumingItem] = useState<KitchenItem | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("kitchen_items")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      
      setItems(data || []);
      onItemsChange(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("kitchen_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Item removed",
        description: `${name} has been removed from your kitchen.`,
      });

      fetchItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KitchenItem[]>);

  const categoryLabels = {
    fridge: "Fridge",
    freezer: "Freezer",
    produce: "Fruits & Vegetables",
    spices: "Spices & Seasonings",
    pantry: "Pantry",
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading your kitchen inventory...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-muted-foreground text-lg mb-2">Your kitchen is empty!</p>
          <p className="text-sm text-muted-foreground">Start by adding some items to your inventory.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onItemUpdated={fetchItems}
      />
      <ConsumeItemDialog
        item={consumingItem}
        open={!!consumingItem}
        onOpenChange={(open) => !open && setConsumingItem(null)}
        onItemConsumed={fetchItems}
      />
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category} className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="flex items-center gap-3">
              <CategoryIcon category={category as any} />
              <span className="text-xl">{categoryLabels[category as keyof typeof categoryLabels]}</span>
              <Badge variant="secondary" className="ml-auto">
                {categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted/50 transition-all border border-border/50 group"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConsumingItem(item)}
                      className="hover:bg-primary/10 hover:text-primary"
                      title="Consume & Log"
                    >
                      <Utensils className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItem(item)}
                      className="hover:bg-secondary/10 hover:text-secondary"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        ))}
      </div>
    </>
  );
};