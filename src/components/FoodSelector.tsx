import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package } from "lucide-react";
import { IRISH_FOOD_ITEMS, searchFoodItems, getCategoryItems, type FoodItem } from "@/data/irishFoodItems";
import { CategoryIcon } from "./CategoryIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  display_name: string;
  brand: string | null;
  category: string | null;
}

interface FoodSelectorProps {
  onSelect: (item: FoodItem) => void;
  selectedCategory?: string;
}

export const FoodSelector = ({ onSelect, selectedCategory }: FoodSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, display_name, brand, category")
      .order("display_name");
    
    if (data) setProducts(data);
  };

  const filteredItems = useMemo(() => {
    return searchFoodItems(searchQuery);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(
      (p) =>
        p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, products]);

  const categoryItems = useMemo(() => {
    if (searchQuery) return null;
    return {
      fridge: getCategoryItems("fridge"),
      freezer: getCategoryItems("freezer"),
      produce: getCategoryItems("produce"),
      spices: getCategoryItems("spices"),
      pantry: getCategoryItems("pantry"),
    };
  }, [searchQuery]);

  const FoodGrid = ({ items }: { items: FoodItem[] }) => (
    <ScrollArea className="h-[400px] pr-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border/50 bg-card hover:border-primary hover:bg-primary/5 transition-all hover:scale-105 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
              <CategoryIcon category={item.category as any} className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-center line-clamp-2">{item.name}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search" className="text-base">Search for food items</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="e.g., tomatoes, chicken, rice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchQuery ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
            {filteredProducts.length > 0 && ` • ${filteredProducts.length} branded product${filteredProducts.length !== 1 ? "s" : ""}`}
          </p>

          {/* Show branded products first */}
          {filteredProducts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Branded Products
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      const item: FoodItem = {
                        id: `product-${product.id}`,
                        name: product.display_name,
                        category: (product.category as any) || "pantry",
                        commonNames: [],
                      };
                      onSelect(item);
                    }}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center w-full">
                      {product.brand && (
                        <span className="text-xs text-muted-foreground italic block">
                          {product.brand}
                        </span>
                      )}
                      <span className="text-sm font-medium line-clamp-2">
                        {product.display_name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.category || "pantry"}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredItems.length > 0 && <FoodGrid items={filteredItems} />}

          {searchQuery.trim().length > 0 && (
            <Button
              type="button"
              className="w-full justify-center mt-2"
              onClick={() => {
                const name = searchQuery.trim();

                const customItem: FoodItem = {
                  id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
                  name,
                  category: "pantry" as any,
                  commonNames: [],
                };

                onSelect(customItem);
              }}
            >
              Add &quot;{searchQuery.trim()}&quot; as a custom item
            </Button>
          )}
        </div>
      ) : (
        <Tabs defaultValue={selectedCategory || "fridge"} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="fridge" className="gap-2">
              <CategoryIcon category="fridge" className="w-4 h-4" />
              <span className="hidden sm:inline">Fridge</span>
            </TabsTrigger>
            <TabsTrigger value="freezer" className="gap-2">
              <CategoryIcon category="freezer" className="w-4 h-4" />
              <span className="hidden sm:inline">Freezer</span>
            </TabsTrigger>
            <TabsTrigger value="produce" className="gap-2">
              <CategoryIcon category="produce" className="w-4 h-4" />
              <span className="hidden sm:inline">Produce</span>
            </TabsTrigger>
            <TabsTrigger value="spices" className="gap-2">
              <CategoryIcon category="spices" className="w-4 h-4" />
              <span className="hidden sm:inline">Spices</span>
            </TabsTrigger>
            <TabsTrigger value="pantry" className="gap-2">
              <CategoryIcon category="pantry" className="w-4 h-4" />
              <span className="hidden sm:inline">Pantry</span>
            </TabsTrigger>
          </TabsList>

          {categoryItems &&
            Object.entries(categoryItems).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <FoodGrid items={items} />
              </TabsContent>
            ))}
        </Tabs>
      )}

    </div>
  );
};
