import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeContext } from "@/pages/EmployeeDetail";
import { formatDate, titleCase } from "@/lib/hr";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  name: string;
  doc_type: string;
  expires_at: string | null;
  created_at: string;
}

const DocumentsTab = () => {
  const { employee, canManage } = useEmployeeContext();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("contract");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("employee_documents")
      .select("id, name, doc_type, expires_at, created_at")
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false });
    setDocs((data as Doc[]) ?? []);
  }, [employee.id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!name.trim()) return toast.error("Give the document a name");
    setSaving(true);
    const { error } = await supabase.from("employee_documents").insert({
      employee_id: employee.id,
      name: name.trim(),
      doc_type: docType,
      expires_at: expiresAt || null,
    });
    setSaving(false);
    if (error) return toast.error("Could not save the document");
    toast.success("Document recorded");
    setName("");
    setExpiresAt("");
    setOpen(false);
    load();
  };

  const isExpired = (value: string | null) => value && new Date(value) < new Date();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Documents</CardTitle>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Name</Label>
                  <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Type</Label>
                  <Input id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-expiry">Expires</Label>
                  <Input
                    id="doc-expiry"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={save} disabled={saving}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{titleCase(doc.doc_type)}</TableCell>
                <TableCell>{formatDate(doc.created_at)}</TableCell>
                <TableCell>
                  {doc.expires_at ? (
                    <Badge variant={isExpired(doc.expires_at) ? "destructive" : "outline"}>
                      {formatDate(doc.expires_at)}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No documents on file.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
