import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ContestantModal from "@/components/ContestantModal";
import JudgeBallotCounter from "@/components/JudgeBallotCounter";

interface Contestant {
  id: string;
  nic: string;
  about_me: string | null;
  photo_urls: string[] | null;
  full_name: string;
  gender: string | null;
}

interface Props {
  voterNic: string;
  isJudge?: boolean;
}

interface JudgeScore {
  id: string;
  candidate_nic: string;
  category: string;
  medal: string;
  points: number;
}

const NORMAL_LIMIT = 1;
const JUDGE_LIMIT = 5;
const HONORARY_NICS = ["991432752V", "842530300V"];

const MEDALS = [
  { key: "gold", emoji: "🥇", label: "Gold", points: 5 },
  { key: "silver", emoji: "🥈", label: "Silver", points: 3 },
  { key: "bronze", emoji: "🥉", label: "Bronze", points: 1 },
] as const;

const VotingGallery = ({ voterNic, isJudge = false }: Props) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [maleVotes, setMaleVotes] = useState<string[]>([]);
  const [femaleVotes, setFemaleVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"kumara" | "kumariya">("kumara");
  const [judgeScores, setJudgeScores] = useState<JudgeScore[]>([]);

  const voteLimit = isJudge ? JUDGE_LIMIT : NORMAL_LIMIT;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: contestantsData } = await supabase.from("contestants").select("*");
    const { data: profiles } = await supabase.from("profiles").select("nic, full_name, gender");
    if (contestantsData && profiles) {
      const merged = contestantsData.map((c) => {
        const profile = profiles.find((p) => p.nic === c.nic);
        return { ...c, full_name: profile?.full_name || "Unknown", gender: profile?.gender || null, nic: c.nic || "" };
      });
      setContestants(merged);
    }
    const { data: votes } = await supabase.from("votes").select("*").eq("voter_nic", voterNic);
    if (votes) {
      setMaleVotes(votes.filter((v) => v.category === "kumara").map((v) => v.candidate_nic!));
      setFemaleVotes(votes.filter((v) => v.category === "kumariya").map((v) => v.candidate_nic!));
    }
    if (isJudge) {
      const { data: scores } = await supabase.from("judge_scores").select("*").eq("judge_nic", voterNic);
      if (scores) setJudgeScores(scores as JudgeScore[]);
    }
    setLoading(false);
  };

  const vote = async (candidateNic: string, category: "kumara" | "kumariya") => {
    const currentVotes = category === "kumara" ? maleVotes : femaleVotes;
    if (currentVotes.length >= voteLimit) {
      toast.error(`You've used all ${voteLimit} vote(s) in this category!`); return;
    }
    if (currentVotes.includes(candidateNic)) {
      toast.error("You've already voted for this contestant!"); return;
    }

    const { data, error } = await supabase.functions.invoke("cast-vote", {
      body: { voter_nic: voterNic, candidate_nic: candidateNic, category },
    });

    if (error || data?.error) {
      toast.error(data?.error || "Failed to vote."); return;
    }

    if (category === "kumara") setMaleVotes((prev) => [...prev, candidateNic]);
    else setFemaleVotes((prev) => [...prev, candidateNic]);
    toast.success("Vote cast! 🗳️");
  };

  const handleMedalClick = async (candidateNic: string, category: "kumara" | "kumariya", medal: string, points: number) => {
    const existing = judgeScores.find((s) => s.candidate_nic === candidateNic);

    // If clicking the same medal, remove (undo)
    if (existing && existing.medal === medal) {
      const { error } = await supabase.from("judge_scores").delete().eq("id", existing.id);
      if (error) { toast.error("Failed to undo score"); return; }
      setJudgeScores((prev) => prev.filter((s) => s.id !== existing.id));
      toast.success("Score removed");
      return;
    }

    // If already scored this contestant, update
    if (existing) {
      const { error } = await supabase.from("judge_scores").update({ medal, points, category }).eq("id", existing.id);
      if (error) { toast.error("Failed to update score"); return; }
      setJudgeScores((prev) => prev.map((s) => s.id === existing.id ? { ...s, medal, points, category } : s));
      toast.success(`Updated to ${medal}!`);
      return;
    }

    // Insert new score
    const { data, error } = await supabase.from("judge_scores").insert({
      judge_nic: voterNic,
      candidate_nic: candidateNic,
      category,
      medal,
      points,
    }).select().single();

    if (error) { toast.error("Failed to score"); return; }
    setJudgeScores((prev) => [...prev, data as JudgeScore]);
    toast.success(`${medal} awarded!`);
  };

  const males = contestants.filter((c) => c.gender?.toLowerCase() === "male");
  const females = contestants.filter((c) => c.gender?.toLowerCase() === "female");
  const visibleContestants = selectedCategory === "kumara" ? males : females;

  const getVoteState = (nic: string, category: "kumara" | "kumariya") => {
    const votes = category === "kumara" ? maleVotes : femaleVotes;
    return {
      isVoted: votes.includes(nic),
      hasReachedLimit: votes.length >= voteLimit,
      isSelf: nic === voterNic,
    };
  };

  const getJudgeScore = (candidateNic: string) => {
    return judgeScores.find((s) => s.candidate_nic === candidateNic) || null;
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading contestants...</div>;

  return (
    <div className="relative space-y-8 animate-fade-in p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="absolute inset-0 -m-4 md:-m-6 bg-black/20 backdrop-blur-md rounded-3xl border border-foreground/10 pointer-events-none z-0" />

      {/* Header */}
      <div className="text-center space-y-3 relative z-10">
        <h2
          className="text-4xl md:text-5xl font-heading font-black uppercase gold-text-gradient tracking-wide"
          style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
        >
          {isJudge ? "⚖️ Judge Scoring ⚖️" : "🗳️ Cast Your Vote 🗳️"}
        </h2>
        <p className="font-heading italic text-sm md:text-base tracking-wide" style={{ color: "hsl(40 20% 75%)" }}>
          {isJudge
            ? "Award Gold (5pts), Silver (3pts), or Bronze (1pt) to contestants"
            : "Vote for one Swarna Kumara and one Swarna Kumariya"}
        </p>
      </div>

      {/* Category Toggle */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedCategory("kumara")}
          className={`relative py-3 px-4 rounded-xl font-heading font-bold text-sm md:text-base uppercase tracking-widest transition-all duration-300 overflow-hidden ${
            selectedCategory === "kumara"
              ? "gold-gradient text-primary-foreground shadow-[0_0_25px_hsl(43_76%_52%/0.4)]"
              : "bg-transparent border-2 border-gold/40 text-foreground/80 hover:border-gold/70 hover:bg-gold/5"
          }`}
        >
          👑 Swarna Kumara
        </button>
        <button
          onClick={() => setSelectedCategory("kumariya")}
          className={`relative py-3 px-4 rounded-xl font-heading font-bold text-sm md:text-base uppercase tracking-widest transition-all duration-300 overflow-hidden ${
            selectedCategory === "kumariya"
              ? "gold-gradient text-primary-foreground shadow-[0_0_25px_hsl(43_76%_52%/0.4)]"
              : "bg-transparent border-2 border-gold/40 text-foreground/80 hover:border-gold/70 hover:bg-gold/5"
          }`}
        >
          👑 Swarna Kumariya
        </button>
      </div>

      {/* Judge Ballot – contextual to selected category */}
      {isJudge && !isJudge && (
        <div className="relative z-10">
          <JudgeBallotCounter
            maleVotesCast={maleVotes.length}
            femaleVotesCast={femaleVotes.length}
            limit={JUDGE_LIMIT}
            activeCategory={selectedCategory}
          />
        </div>
      )}

      {/* Contestant Grid with cross-fade */}
      <section className="relative z-10">
        <div
          key={selectedCategory}
          className="animate-fade-in"
        >
          {visibleContestants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contestants yet in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleContestants.map((c) => {
                const vs = getVoteState(c.nic, selectedCategory);
                return (
                  <PosterCard
                    key={c.id}
                    contestant={c}
                    category={selectedCategory}
                    {...vs}
                    isJudge={isJudge}
                    judgeScore={getJudgeScore(c.nic)}
                    onVote={vote}
                    onMedalClick={handleMedalClick}
                    onViewDetails={() => { setSelectedContestant(c); }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedContestant && (
        <ContestantModal contestant={selectedContestant} category={selectedCategory}
          {...getVoteState(selectedContestant.nic, selectedCategory)}
          isJudge={isJudge}
          judgeScore={getJudgeScore(selectedContestant.nic)}
          onVote={vote}
          onMedalClick={handleMedalClick}
          onClose={() => setSelectedContestant(null)} />
      )}
    </div>
  );
};

/* ── Premium "Character Poster" Card ── */
const PosterCard = ({ contestant, category, isVoted, hasReachedLimit, isSelf, isJudge, judgeScore, onVote, onMedalClick, onViewDetails }: {
  contestant: { id: string; nic: string; full_name: string; photo_urls: string[] | null };
  category: "kumara" | "kumariya";
  isVoted: boolean; hasReachedLimit: boolean; isSelf: boolean;
  isJudge: boolean;
  judgeScore: JudgeScore | null;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onMedalClick: (nic: string, cat: "kumara" | "kumariya", medal: string, points: number) => void;
  onViewDetails: () => void;
}) => {
  const photo = contestant.photo_urls?.[0];

  return (
    <div
      className={`group relative w-full min-h-[320px] aspect-[3/4] overflow-hidden rounded-xl border border-foreground/10 backdrop-blur-sm transition-all duration-300 ${
        (isVoted || judgeScore) ? "ring-2 ring-gold shadow-[0_0_25px_hsl(43_76%_52%/0.3)]" : "hover:shadow-[0_0_20px_hsl(43_76%_52%/0.2)]"
      }`}
    >
      <button onClick={onViewDetails} className="absolute inset-0 z-10 h-full w-full cursor-pointer focus:outline-none">
        {photo ? (
          <img src={photo} alt={contestant.full_name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-4xl text-muted-foreground">👤</div>
        )}
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] z-20 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-6 space-y-3">
        <h4 className="font-heading text-sm font-bold text-foreground drop-shadow-lg md:text-base truncate">
          {contestant.full_name}
        </h4>
        <div className="flex flex-wrap justify-start gap-2">
          <Button onClick={(e) => { e.stopPropagation(); onViewDetails(); }} variant="outline" size="sm"
            className="min-w-[80px] flex-1 text-xs h-8 border-foreground/20 text-foreground/80 hover:bg-foreground/10 backdrop-blur-sm">
            Details
          </Button>
          {HONORARY_NICS.includes(contestant.nic) ? (
            <span className="min-w-[80px] flex-1 text-[10px] font-semibold text-amber-300 italic flex min-h-8 items-center justify-center rounded-md px-2 bg-amber-500/10 border border-amber-400/30">
              Honorary Participant ✨
            </span>
          ) : isJudge ? (
            <div className="flex gap-1 flex-1 min-w-[80px]">
              {MEDALS.map((m) => (
                <button
                  key={m.key}
                  onClick={(e) => { e.stopPropagation(); onMedalClick(contestant.nic, category, m.key, m.points); }}
                  className={`flex-1 text-base h-8 rounded-md transition-all duration-200 ${
                    judgeScore?.medal === m.key
                      ? "bg-gold/30 ring-1 ring-gold scale-110 shadow-[0_0_10px_hsl(43_76%_52%/0.4)]"
                      : "bg-foreground/10 hover:bg-foreground/20"
                  }`}
                  title={`${m.label} (${m.points}pts)`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          ) : isSelf ? (
            <span className="min-w-[80px] flex-1 text-[10px] text-muted-foreground italic flex min-h-8 items-center justify-center rounded-md px-2">You</span>
          ) : isVoted ? (
            <span className="min-w-[80px] flex-1 text-xs text-gold font-medium flex min-h-8 items-center justify-center rounded-md px-2">✅ Voted</span>
          ) : (
            <Button onClick={(e) => { e.stopPropagation(); onVote(contestant.nic, category); }} disabled={hasReachedLimit}
              size="sm" className="min-w-[80px] flex-1 text-xs h-8 gold-gradient text-primary-foreground hover:opacity-90">
              {hasReachedLimit ? "Limit" : "Vote"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface JudgeScore {
  id: string;
  candidate_nic: string;
  category: string;
  medal: string;
  points: number;
}

export default VotingGallery;
