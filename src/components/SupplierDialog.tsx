import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Supplier {
  id?: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
}

interface SupplierDialogProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier;
  onSuccess: () => void;
}

export const SupplierDialog = ({ open, onClose, supplier, onSuccess }: SupplierDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Supplier>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Arizona",
    zip_code: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        setFormData(supplier);
      } else {
        setFormData({
          name: "",
          contact_person: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "Arizona",
          zip_code: "",
          notes: "",
        });
      }
    }
  }, [open, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (supplier?.id) {
        const { error } = await supabase
          .from("suppliers")
          .update(formData)
          .eq("id", supplier.id);

        if (error) throw error;
        toast.success("Supplier updated successfully");
      } else {
        const { error } = await supabase
          .from("suppliers")
          .insert([formData]);

        if (error) throw error;
        toast.success("Supplier created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : supplier ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
