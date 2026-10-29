import { useState } from "react";
import { modules } from "@/lib/modules";
import { useModules } from "@/contexts/ModuleContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ModuleVisibility() {
  const { enabled, loading, error, reload, setEnabled } = useModules();
  const [saving, setSaving] = useState<string | null>(null);
  return <section className="py-4">
    <h3 className="mb-4 text-lg font-semibold">Module visibility</h3>
    {error && <div className="mb-4 flex items-center gap-3 text-sm text-destructive">{error}<Button variant="outline" onClick={reload}>Retry</Button></div>}
    <div className="divide-y border-y">
      {modules.map(module => <div key={module.key} className="flex items-center justify-between gap-4 py-4">
        <Label htmlFor={`visibility-${module.key}`} className="text-sm font-medium">{module.label}</Label>
        <Switch id={`visibility-${module.key}`} checked={enabled(module.key)} disabled={loading || !!error || saving !== null} onCheckedChange={async value => {
          setSaving(module.key);
          try { await setEnabled(module.key, value); toast.success(`${module.label} ${value ? "shown" : "hidden"}`); }
          catch { toast.error("Could not save module visibility"); }
          finally { setSaving(null); }
        }} />
      </div>)}
    </div>
  </section>;
}