import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { moduleEnabled, type ModuleKey, type Visibility } from "@/lib/modules";

const ModuleContext = createContext<{
  enabled: (key: string) => boolean;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  setEnabled: (key: ModuleKey, enabled: boolean) => Promise<void>;
} | undefined>(undefined);

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<Visibility>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    if (!user) { setSettings({}); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const result = await supabase.from("module_visibility").select("module_key,enabled");
      if (result.error) throw result.error;
      setSettings(Object.fromEntries((result.data ?? []).map(row => [row.module_key, row.enabled])));
    } catch {
      setError("Could not load module visibility. Please retry.");
    } finally { setLoading(false); }
  }, [user?.id]);
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    const refresh = () => { void reload(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [reload]);
  const setEnabled = async (key: ModuleKey, enabled: boolean) => {
    if (!isAdmin) throw new Error("Administrator access required");
    const result = await supabase.from("module_visibility").upsert({ module_key: key, enabled, updated_at: new Date().toISOString() }).select("module_key,enabled").single();
    if (result.error) throw result.error;
    setSettings(previous => ({ ...previous, [key]: result.data.enabled }));
  };
  return <ModuleContext.Provider value={{ enabled: key => moduleEnabled(settings, key), loading, error, reload, setEnabled }}>{children}</ModuleContext.Provider>;
}
export function useModules() {
  const context = useContext(ModuleContext);
  if (!context) throw new Error("ModuleProvider is required");
  return context;
}