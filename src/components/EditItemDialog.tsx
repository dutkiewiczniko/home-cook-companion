import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface KitchenItem {
  id: string;
  name: string;
  quantity: string;
  category: "fridge" | "freezer" | "produce" | "spices" | "pantry";
  notes: string | null;
  best_before_date: string | null;
}

interface EditItemDialogProps {
  item: KitchenItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: () => void;
}

export const EditItemDialog = ({ item, open, onOpenChange, onItemUpdated }: EditItemDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity || "");
  const [category, setCategory] = useState<Database["public"]["Enums"]["storage_category"]>(item?.category || "pantry");
  const [bestBefore, setBestBefore] = useState(item?.best_before_date || "");
  const [notes, setNotes] = useState(item?.notes || "");
  const { toast } = useToast();

  // Update form when item changes
  useState(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setCategory(item.category);
      setBestBefore(item.best_before_date || "");
      setNotes(item.notes || "");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("kitchen_items")
        .update({
          name,
          quantity,
          category,
          notes: notes || null,
          best_before_date: bestBefore || null,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Item updated!",
        description: `${name} has been updated successfully.`,
      });

      onOpenChange(false);
      onItemUpdated();
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

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the details for this kitchen item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              placeholder="e.g., 500g or 3 items"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Storage Category</Label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Database["public"]["Enums"]["storage_category"])}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="pantry">Pantry</option>
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
              <option value="produce">Produce</option>
              <option value="spices">Spices</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-best-before">Best Before Date (optional)</Label>
            <Input
              id="edit-best-before"
              type="date"
              value={bestBefore}
              onChange={(e) => setBestBefore(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
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
              {loading ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
