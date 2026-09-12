import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InventoryAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  inventoryId: string;
  currentQuantity: number;
  currentReorderLevel: number;
  productName: string;
  onSuccess: () => void;
}

export const InventoryAdjustDialog = ({
  open,
  onClose,
  inventoryId,
  currentQuantity,
  currentReorderLevel,
  productName,
  onSuccess,
}: InventoryAdjustDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(currentQuantity);
  const [reorderLevel, setReorderLevel] = useState(currentReorderLevel);
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity(currentQuantity);
      setReorderLevel(currentReorderLevel);
      loadLocation();
    }
  }, [open, currentQuantity, currentReorderLevel]);

  const loadLocation = async () => {
    try {
      const { data } = await supabase
        .from("inventory")
        .select("location")
        .eq("id", inventoryId)
        .single();

      if (data) setLocation(data.location || "");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("inventory")
        .update({
          quantity,
          reorder_level: reorderLevel,
          location: location || null,
          last_restocked: new Date().toISOString(),
        })
        .eq("id", inventoryId);

      if (error) throw error;
      toast.success("Inventory updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Inventory - {productName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Current Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorder_level">Reorder Level *</Label>
            <Input
              id="reorder_level"
              type="number"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Aisle 3, Shelf B"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
