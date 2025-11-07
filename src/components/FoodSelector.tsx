import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { IRISH_FOOD_ITEMS, searchFoodItems, getCategoryItems, type FoodItem } from "@/data/irishFoodItems";
import { CategoryIcon } from "./CategoryIcon";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FoodSelectorProps {
  onSelect: (item: FoodItem) => void;
  selectedCategory?: string;
}

export const FoodSelector = ({ onSelect, selectedCategory }: FoodSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return searchFoodItems(searchQuery);
  }, [searchQuery]);

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
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </p>
          <FoodGrid items={filteredItems} />
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

          {categoryItems && Object.entries(categoryItems).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <FoodGrid items={items} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
