import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ContestantsDirectory from "@/components/ContestantsDirectory";

interface Props {
  currentStage: string;
  onStageChange: (stage: string) => void;
  adminNic: string;
}

interface LeaderEntry {
  nic: string;
  full_name: string;
  branch: string;
  normalVotes: number;
  judgePoints: number;
  totalScore: number;
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
    const [{ data: votes }, { data: profiles }, { data: judgeScores }] = await Promise.all([
      supabase.from("votes").select("*"),
      supabase.from("profiles").select("nic, full_name, branch"),
      supabase.from("judge_scores").select("*"),
    ]);
    if (!votes || !profiles) return;

    const buildBoard = (category: string): LeaderEntry[] => {
      // Get all candidate NICs from both votes and judge_scores for this category
      const allNics = new Set<string>();
      votes.filter((v) => v.category === category).forEach((v) => { if (v.candidate_nic) allNics.add(v.candidate_nic); });
      (judgeScores || []).filter((s) => s.category === category).forEach((s) => { if (s.candidate_nic) allNics.add(s.candidate_nic); });

      return Array.from(allNics).map((nic) => {
        const profile = profiles.find((p) => p.nic === nic);
        const normalVotes = votes.filter((v) => v.category === category && v.candidate_nic === nic).length;
        const judgePoints = (judgeScores || [])
          .filter((s) => s.category === category && s.candidate_nic === nic)
          .reduce((sum, s) => sum + (s.points as number), 0);
        return {
          nic,
          full_name: profile?.full_name || "Unknown",
          branch: profile?.branch || "—",
          normalVotes,
          judgePoints,
          totalScore: normalVotes + judgePoints,
        };
      }).sort((a, b) => b.totalScore - a.totalScore);
    };

    setKumaraBoard(buildBoard("kumara"));
    setKumariyaBoard(buildBoard("kumariya"));
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

  const switchStage = async (stage: string) => {
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

      {/* Participant Count */}
      <div className="bg-card rounded-lg p-5 gold-border space-y-3">
        <h3 className="font-heading font-bold text-lg text-foreground tracking-wide">📊 Social Proof Counter</h3>
        <p className="text-xs text-muted-foreground font-body">This number is shown on the homepage as "Over X Contestants Have Already Joined"</p>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={0}
            value={participantCount}
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            className="w-32 bg-input border-border text-foreground text-lg font-heading font-bold"
          />
          <Button
            onClick={saveParticipantCount}
            disabled={savingCount}
            className="gold-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            {savingCount ? "Saving..." : "Update Count"}
          </Button>
        </div>
      </div>

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

      {/* Combined Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CombinedLeaderboard title="👑 Swarna Kumara" entries={kumaraBoard} />
        <CombinedLeaderboard title="👑 Swarna Kumariya" entries={kumariyaBoard} />
      </div>

      {/* Contestants Directory */}
      <ContestantsDirectory />
    </div>
  );
};

const CombinedLeaderboard = ({ title, entries }: { title: string; entries: LeaderEntry[] }) => (
  <div className="bg-card rounded-lg p-5 gold-border space-y-3">
    <h3 className="font-heading font-bold text-lg text-gold tracking-wide">{title}</h3>
    {entries.length === 0 ? (
      <p className="text-muted-foreground text-sm">No scores yet</p>
    ) : (
      <div className="space-y-0">
        {/* Header row */}
        <div className="flex items-center gap-2 py-2 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-heading">
          <span className="w-6">#</span>
          <span className="flex-1">Name</span>
          <span className="w-14 text-center">Branch</span>
          <span className="w-12 text-center">Votes</span>
          <span className="w-12 text-center">Judge</span>
          <span className="w-14 text-center font-bold">Total</span>
        </div>
        {entries.map((e, i) => (
          <div key={e.nic} className={`flex items-center gap-2 py-2 border-b border-border/50 last:border-0 ${i === 0 ? "bg-gold/5" : ""}`}>
            <span className={`w-6 text-sm ${i === 0 ? "text-gold font-bold" : "text-muted-foreground"}`}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <span className={`flex-1 text-sm font-body truncate ${i === 0 ? "text-gold font-semibold" : "text-foreground"}`}>
              {e.full_name}
            </span>
            <span className="w-14 text-center text-xs text-muted-foreground truncate">{e.branch}</span>
            <span className="w-12 text-center text-sm text-foreground">{e.normalVotes}</span>
            <span className="w-12 text-center text-sm text-foreground">{e.judgePoints}</span>
            <span className={`w-14 text-center text-sm font-bold ${i === 0 ? "text-gold" : "text-foreground"}`}>
              {e.totalScore}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminPanel;
