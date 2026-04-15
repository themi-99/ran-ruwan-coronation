import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface ContestantEntry {
  nic: string;
  full_name: string;
  gender: string | null;
  branch: string | null;
  about_me: string | null;
  photo_urls: string[] | null;
  created_at: string | null;
}

const ContestantsDirectory = () => {
  const [contestants, setContestants] = useState<ContestantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContestantEntry | null>(null);

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    setLoading(true);
    const { data: contestantRows } = await supabase
      .from("contestants")
      .select("nic, about_me, photo_urls, created_at")
      .order("created_at", { ascending: false });

    if (!contestantRows || contestantRows.length === 0) {
      setContestants([]);
      setLoading(false);
      return;
    }

    const nics = contestantRows.map((c) => c.nic).filter(Boolean) as string[];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("nic, full_name, gender, branch")
      .in("nic", nics);

    const merged: ContestantEntry[] = contestantRows.map((c) => {
      const profile = profiles?.find((p) => p.nic === c.nic);
      return {
        nic: c.nic || "",
        full_name: profile?.full_name || "Unknown",
        gender: profile?.gender || null,
        branch: profile?.branch || null,
        about_me: c.about_me,
        photo_urls: c.photo_urls,
        created_at: c.created_at,
      };
    });

    setContestants(merged);
    setLoading(false);
  };

  const categoryLabel = (gender: string | null) => {
    if (gender === "male") return "Swarna Kumara";
    if (gender === "female") return "Swarna Kumariya";
    return "—";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-lg p-5 gold-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-foreground tracking-wide">
          📋 Contestants Directory
        </h3>
        <span className="text-sm text-muted-foreground font-body">
          {contestants.length} contestant{contestants.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading contestants...</p>
      ) : contestants.length === 0 ? (
        <p className="text-muted-foreground text-sm">No contestants registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Submitted</TableHead>
                <TableHead className="text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contestants.map((c, i) => (
                <TableRow key={c.nic} className="border-border">
                  <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                  <TableCell className="text-foreground font-body font-medium">{c.full_name}</TableCell>
                  <TableCell className="text-foreground font-body text-sm">{categoryLabel(c.gender)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:border-gold hover:text-gold"
                      onClick={() => setSelected(c)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">{selected?.full_name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {categoryLabel(selected?.gender ?? null)} • {selected?.branch || "No branch"}
            </DialogDescription>
          </DialogHeader>

          {selected?.photo_urls && selected.photo_urls.length > 0 && (
            <div className="space-y-3 flex flex-col items-center">
              {selected.photo_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${selected.full_name} photo ${i + 1}`}
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                />
              ))}
            </div>
          )}

          {selected?.about_me && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground font-heading">About Me</p>
              <p className="text-sm text-muted-foreground font-body whitespace-pre-wrap">{selected.about_me}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            NIC: {selected?.nic} • Submitted: {formatDate(selected?.created_at ?? null)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContestantsDirectory;
