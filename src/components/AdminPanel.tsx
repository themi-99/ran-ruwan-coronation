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
  branch: string | null;
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
    const [{ data: votes }, { data: judgeScores }, { data: profiles }] = await Promise.all([
      supabase.from("votes").select("*"),
      supabase.from("judge_scores").select("*"),
      supabase.from("profiles").select("nic, full_name, branch"),
    ]);
    if (!votes || !profiles) return;

    const build = (category: string): LeaderEntry[] => {
      // Normal votes
      const voteCounts: Record<string, number> = {};
      votes.filter((v) => v.category === category).forEach((v) => {
        if (v.candidate_nic) voteCounts[v.candidate_nic] = (voteCounts[v.candidate_nic] || 0) + 1;
      });

      // Judge points
      const judgePts: Record<string, number> = {};
      (judgeScores || []).filter((s) => s.category === category).forEach((s) => {
        judgePts[s.candidate_nic] = (judgePts[s.candidate_nic] || 0) + s.points;
      });

      const allNics = new Set([...Object.keys(voteCounts), ...Object.keys(judgePts)]);
      return Array.from(allNics).map((nic) => {
        const profile = profiles.find((p) => p.nic === nic);
        const nv = voteCounts[nic] || 0;
        const jp = judgePts[nic] || 0;
        return { nic, full_name: profile?.full_name || "Unknown", branch: profile?.branch || null, normalVotes: nv, judgePoints: jp, totalScore: nv + jp };
      }).sort((a, b) => b.totalScore - a.totalScore);
    };

    setKumaraBoard(build("kumara"));
    setKumariyaBoard(build("kumariya"));
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
          <Input type="number" min={0} value={participantCount} onChange={(e) => setParticipantCount(Number(e.target.value))}
            className="w-32 bg-input border-border text-foreground text-lg font-heading font-bold" />
          <Button onClick={saveParticipantCount} disabled={savingCount}
            className="gold-gradient text-primary-foreground font-semibold hover:opacity-90">
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

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Leaderboard title="👑 Swarna Kumara Leaderboard" entries={kumaraBoard} />
        <Leaderboard title="👑 Swarna Kumariya Leaderboard" entries={kumariyaBoard} />
      </div>

      {/* Contestants Directory */}
      <ContestantsDirectory />
    </div>
  );
};

const Leaderboard = ({ title, entries }: { title: string; entries: LeaderEntry[] }) => (
  <div className="bg-card rounded-lg p-5 gold-border space-y-3">
    <h3 className="font-heading font-bold text-lg text-gold tracking-wide">{title}</h3>
    {entries.length === 0 ? (
      <p className="text-muted-foreground text-sm">No votes yet</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-2 text-muted-foreground font-heading text-xs">#</th>
              <th className="py-2 pr-2 text-muted-foreground font-heading text-xs">Name</th>
              <th className="py-2 pr-2 text-muted-foreground font-heading text-xs">Branch</th>
              <th className="py-2 pr-2 text-muted-foreground font-heading text-xs text-right">Votes</th>
              <th className="py-2 pr-2 text-muted-foreground font-heading text-xs text-right">Judge</th>
              <th className="py-2 text-muted-foreground font-heading text-xs text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.nic} className={`border-b border-border last:border-0 ${i === 0 ? "bg-gold/5" : ""}`}>
                <td className="py-2 pr-2">
                  <span className={i === 0 ? "text-gold font-bold" : "text-muted-foreground"}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                </td>
                <td className="py-2 pr-2 text-foreground font-body truncate max-w-[120px]">
                  {e.full_name}
                  {i === 0 && <span className="ml-1 text-[10px] text-gold font-heading">WINNER</span>}
                </td>
                <td className="py-2 pr-2 text-muted-foreground font-body text-xs truncate max-w-[80px]">{e.branch || "—"}</td>
                <td className="py-2 pr-2 text-foreground font-body text-right">{e.normalVotes}</td>
                <td className="py-2 pr-2 text-foreground font-body text-right">{e.judgePoints}</td>
                <td className="py-2 text-gold font-heading font-bold text-right">{e.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AdminPanel;
