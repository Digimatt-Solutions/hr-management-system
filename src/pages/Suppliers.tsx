import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Mail, Phone, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SupplierDialog } from "@/components/SupplierDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      toast.error("Failed to load suppliers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", supplierToDelete);

      if (error) throw error;
      toast.success("Supplier deleted successfully");
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete supplier");
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Suppliers</h2>
            <p className="text-muted-foreground">Manage your supplier network</p>
          </div>
          <Button onClick={() => { setSelectedSupplier(undefined); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers by name or contact person..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No suppliers found matching your search" : "No suppliers yet"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-heading font-semibold text-lg mb-1">
                            {supplier.name}
                          </h3>
                          {supplier.contact_person && (
                            <p className="text-sm text-muted-foreground">
                              Contact: {supplier.contact_person}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4 shrink-0" />
                              <a
                                href={`mailto:${supplier.email}`}
                                className="hover:text-primary transition-colors truncate"
                              >
                                {supplier.email}
                              </a>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4 shrink-0" />
                              <a
                                href={`tel:${supplier.phone}`}
                                className="hover:text-primary transition-colors"
                              >
                                {supplier.phone}
                              </a>
                            </div>
                          )}
                          {(supplier.address || supplier.city || supplier.state) && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                              <div>
                                {supplier.address && <div>{supplier.address}</div>}
                                {(supplier.city || supplier.state) && (
                                  <div>
                                    {supplier.city}
                                    {supplier.city && supplier.state && ", "}
                                    {supplier.state}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {supplier.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground italic">
                              {supplier.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSupplierToDelete(supplier.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        supplier={selectedSupplier}
        onSuccess={loadSuppliers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently delete this supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Suppliers;
