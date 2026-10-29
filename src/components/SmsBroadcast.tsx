import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/hr";
import type { Database } from "@/integrations/supabase/types";

export default function SmsBroadcast() {
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [clients, setClients] = useState<
    { id: string; full_name: string; phone: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [since, setSince] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
  );
  const [until, setUntil] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Database["public"]["Tables"]["sms_broadcasts"]["Row"][]
  >([]);
  const [preview, setPreview] = useState<{
    total: number;
    skipped: number;
  } | null>(null);
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState<{
    accepted: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [loadError, setLoadError] = useState("");
  const load = async () => {
    setLoadError("");
    const h = await supabase
      .from("sms_broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (h.error) setLoadError("Could not load SMS history");
    else setHistory(h.data ?? []);
    let offset = 0;
    let all: typeof clients = [];
    while (true) {
      const c = await supabase
        .from("clients")
        .select("id,full_name,phone")
        .order("full_name")
        .range(offset, offset + 999);
      if (c.error) {
        setLoadError("Could not load SMS recipients");
        break;
      }
      all.push(...(c.data ?? []));
      if ((c.data?.length ?? 0) < 1000) break;
      offset += 1000;
    }
    setClients(all);
  };
  useEffect(() => {
    load();
  }, []);
  const invoke = async (isPreview: boolean, id: string) => {
    const { data, error } = await supabase.functions.invoke(
      "client-broadcast-sms",
      {
        body: {
          audience,
          message,
          client_ids: selected,
          since: new Date(`${since}T00:00:00`).toISOString(),
          until: new Date(`${until}T23:59:59.999`).toISOString(),
          preview: isPreview,
          request_id: id,
        },
      },
    );
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const details = await error.context.json();
        throw new Error(details.error ?? "SMS request failed");
      }
      throw error;
    }
    return data;
  };
  const prepare = async () => {
    if (!message.trim() || message.length > 480)
      return toast.error("Enter a service message of 1–480 characters");
    if (audience === "selected" && !selected.length)
      return toast.error("Select clients first");
    if (audience === "recent" && (!since || !until || since > until))
      return toast.error("Choose a valid registration date range");
    setLoading(true);
    try {
      const id = crypto.randomUUID();
      setRequestId(id);
      const data = await invoke(true, id);
      if (!data.total)
        return toast.error(
          "No supported Kenyan mobile numbers in this audience",
        );
      setPreview(data);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not prepare broadcast",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="mb-8 border-b pb-8">
      <div className="mb-5 flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Client SMS</h2>
          <p className="text-sm text-muted-foreground">
            Service updates only · Airtouch production
          </p>
        </div>
      </div>
      {loadError && (
        <div className="mb-4 text-sm text-destructive">
          {loadError}
          <Button variant="ghost" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Recipients</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="recent">
                Recently registered clients
              </SelectItem>
              <SelectItem value="selected">Selected clients</SelectItem>
            </SelectContent>
          </Select>
          {audience === "recent" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sms-since">Registered from</Label>
                <Input
                  id="sms-since"
                  type="date"
                  value={since}
                  onChange={(e) => setSince(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sms-until">Registered through</Label>
                <Input
                  id="sms-until"
                  type="date"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                />
              </div>
            </div>
          )}
          {audience === "selected" && (
            <div className="space-y-3">
              <Input
                aria-label="Search SMS clients"
                placeholder="Search clients"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-44 overflow-y-auto rounded-md border p-3">
                {clients
                  .filter((c) =>
                    `${c.full_name} ${c.phone}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((c) => (
                    <Label
                      key={c.id}
                      className="flex items-center gap-3 py-2 font-normal"
                    >
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={(v) =>
                          setSelected((s) =>
                            v ? [...s, c.id] : s.filter((id) => id !== c.id),
                          )
                        }
                      />
                      <span>
                        {c.full_name}{" "}
                        <span className="text-xs text-muted-foreground">
                          {c.phone}
                        </span>
                      </span>
                    </Label>
                  ))}
                {!clients.length && (
                  <p className="text-sm text-muted-foreground">
                    No clients yet.
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selected.length} selected
              </p>
            </div>
          )}
          <div>
            <Label htmlFor="sms-message">Service message</Label>
            <Textarea
              id="sms-message"
              rows={4}
              maxLength={480}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/480
            </p>
          </div>
          <Button onClick={prepare} disabled={loading || !!loadError}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Review broadcast
          </Button>
          {result && (
            <p role="status" className="text-sm">
              {result.accepted} accepted · {result.failed} failed ·{" "}
              {result.skipped} skipped. Delivery is not confirmed.
            </p>
          )}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Recent broadcasts</h3>
          <div className="max-h-96 overflow-y-auto">
            {history.length ? (
              history.map((h) => (
                <div key={h.id} className="border-b py-4 first:pt-0">
                  <p className="line-clamp-2 text-sm">{h.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(h.created_at)} · {h.audience} ·{" "}
                    {h.status.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-xs">
                    {h.accepted} accepted / {h.total} · {h.failed} failed ·{" "}
                    {h.skipped} skipped
                  </p>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No broadcasts yet.
              </p>
            )}
          </div>
        </div>
      </div>
      <Dialog
        open={!!preview}
        onOpenChange={(v) => {
          if (!v && !loading) setPreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send this service message?</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            {preview?.total} unique recipients · {preview?.skipped} invalid or
            duplicate contacts skipped
          </p>
          <p className="whitespace-pre-line rounded-md border p-4 text-sm">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            This sends production SMS and may incur Airtouch charges.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setPreview(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await invoke(false, requestId);
                  setResult(data);
                  setPreview(null);
                  toast.success("Broadcast completed");
                  setMessage("");
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Broadcast failed",
                  );
                  setPreview(null);
                } finally {
                  setLoading(false);
                  load();
                }
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}Send SMS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
