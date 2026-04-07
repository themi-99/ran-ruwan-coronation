import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  currentStage: string;
  onStageChange: (stage: string) => void;
  adminNic: string;
}

interface LeaderEntry {
  nic: string;
  full_name: string;
  votes: number;
}

const STAGES = [
  { key: "competing", label: "Competing", emoji: "🏆" },
  { key: "voting", label: "Voting", emoji: "🗳️" },
  { key: "calculating", label: "Calculating", emoji: "⏳" },
  { key: "winners", label: "Winners", emoji: "👑" },
];

const AdminPanel = ({ currentStage, onStageChange, adminNic }: Props) => {
  const [kumaraBoard, setKumaraBoard] = useState<LeaderEntry[]>([]);
  const [kumariyaBoard, setKumariyaBoard] = useState<LeaderEntry[]>([]);
  const [switching, setSwitching] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [savingCount, setSavingCount] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    fetchParticipantCount();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    const { data: votes } = await supabase.from("votes").select("*");
    const { data: profiles } = await supabase.from("profiles").select("nic, full_name");
    if (!votes || !profiles) return;

    const count = (category: string) => {
      const catVotes = votes.filter((v) => v.category === category);
      const counts: Record<string, number> = {};
      catVotes.forEach((v) => { if (v.candidate_nic) counts[v.candidate_nic] = (counts[v.candidate_nic] || 0) + 1; });
      return Object.entries(counts)
        .map(([nic, c]) => ({ nic, full_name: profiles.find((p) => p.nic === nic)?.full_name || "Unknown", votes: c }))
        .sort((a, b) => b.votes - a.votes);
    };

    setKumaraBoard(count("kumara"));
    setKumariyaBoard(count("kumariya"));
  };

  const fetchParticipantCount = async () => {
    const { data } = await supabase.from("app_config").select("manual_participant_count").eq("id", 1).maybeSingle();
    if (data?.manual_participant_count != null) setParticipantCount(data.manual_participant_count);
  };

  const saveParticipantCount = async () => {
    setSavingCount(true);
    try {
      const { error } = await supabase.functions.invoke("admin-update-stage", {
        body: { admin_nic: adminNic, participant_count: participantCount },
      });
      if (error) throw error;
      toast.success("Participant count updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update count");
    }
    setSavingCount(false);
  };

    setSwitching(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-stage", {
        body: { admin_nic: adminNic, stage },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onStageChange(stage);
      toast.success(`Switched to ${stage}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to switch stage");
    }
    setSwitching(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-heading font-black uppercase gold-text-gradient tracking-wide">⚙️ Admin Panel</h2>

      {/* Stage Switcher */}
      <div className="bg-card rounded-lg p-5 gold-border space-y-3">
        <h3 className="font-heading font-bold text-lg text-foreground tracking-wide">Stage Control</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAGES.map((s) => (
            <Button key={s.key} onClick={() => switchStage(s.key)} disabled={switching || currentStage === s.key}
              variant={currentStage === s.key ? "default" : "outline"}
              className={currentStage === s.key
                ? "gold-gradient text-primary-foreground"
                : "border-border text-foreground hover:border-gold hover:text-gold"}>
              {s.emoji} {s.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground font-body">Current: <span className="text-gold font-semibold">{currentStage}</span></p>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Leaderboard title="👑 Swarna Kumara Leaderboard" entries={kumaraBoard} />
        <Leaderboard title="👑 Swarna Kumariya Leaderboard" entries={kumariyaBoard} />
      </div>
    </div>
  );
};

const Leaderboard = ({ title, entries }: { title: string; entries: LeaderEntry[] }) => (
  <div className="bg-card rounded-lg p-5 gold-border space-y-3">
    <h3 className="font-heading font-bold text-lg text-gold tracking-wide">{title}</h3>
    {entries.length === 0 ? (
      <p className="text-muted-foreground text-sm">No votes yet</p>
    ) : (
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={e.nic} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-2">
              <span className={`text-lg ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </span>
              <span className="text-foreground text-sm font-body">{e.full_name}</span>
            </div>
            <span className="text-gold font-semibold">{e.votes}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminPanel;
