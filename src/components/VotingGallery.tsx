import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ContestantModal from "@/components/ContestantModal";

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
}

const VotingGallery = ({ voterNic }: Props) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votedMale, setVotedMale] = useState<string | null>(null);
  const [votedFemale, setVotedFemale] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"kumara" | "kumariya">("kumara");

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
      const maleVote = votes.find((v) => v.category === "kumara");
      const femaleVote = votes.find((v) => v.category === "kumariya");
      if (maleVote) setVotedMale(maleVote.candidate_nic);
      if (femaleVote) setVotedFemale(femaleVote.candidate_nic);
    }
    setLoading(false);
  };

  const vote = async (candidateNic: string, category: "kumara" | "kumariya") => {
    if ((category === "kumara" && votedMale) || (category === "kumariya" && votedFemale)) {
      toast.error("You've already voted in this category!"); return;
    }
    const { error } = await supabase.from("votes").insert({ voter_nic: voterNic, candidate_nic: candidateNic, category });
    if (error) { toast.error("Failed to vote. You may have already voted."); return; }
    if (category === "kumara") setVotedMale(candidateNic);
    else setVotedFemale(candidateNic);
    toast.success("Vote cast! 🗳️");
  };

  const males = contestants.filter((c) => c.gender?.toLowerCase() === "male");
  const females = contestants.filter((c) => c.gender?.toLowerCase() === "female");

  const getVoteState = (nic: string, category: "kumara" | "kumariya") => {
    const voted = category === "kumara" ? votedMale : votedFemale;
    return { isVoted: voted === nic, hasVoted: !!voted, isSelf: nic === voterNic };
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading contestants...</div>;

  return (
    <div className="relative space-y-10 animate-fade-in p-6">
      {/* Frosted glass wrapper */}
      <div className="absolute inset-0 -m-6 bg-black/20 backdrop-blur-md rounded-3xl border border-foreground/10 pointer-events-none z-0" />

      {/* Cinematic Header */}
      <div className="text-center space-y-3 relative z-10">
        <h2
          className="text-4xl md:text-5xl font-heading font-black uppercase gold-text-gradient tracking-wide"
          style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
        >
          🗳️ Cast Your Vote 🗳️
        </h2>
        <p className="font-heading italic text-sm md:text-base tracking-wide" style={{ color: "hsl(40 20% 75%)" }}>
          Vote for one Swarna Kumara and one Swarna Kumariya
        </p>
      </div>

      {/* Kumara Section */}
      <section className="space-y-4 relative z-10">
        <div className="flex items-center gap-4">
          <h3
            className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient whitespace-nowrap"
            style={{ filter: "drop-shadow(0 0 10px hsl(43 76% 52% / 0.3))" }}
          >
            👑 Swarna Kumara
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
        </div>
        {males.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No contestants yet in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {males.map((c) => {
              const vs = getVoteState(c.nic, "kumara");
              return (
                <PosterCard key={c.id} contestant={c} category="kumara" {...vs}
                  onVote={vote} onViewDetails={() => { setSelectedContestant(c); setSelectedCategory("kumara"); }} />
              );
            })}
          </div>
        )}
      </section>

      {/* Kumariya Section */}
      <section className="space-y-4 relative z-10">
        <div className="flex items-center gap-4">
          <h3
            className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient whitespace-nowrap"
            style={{ filter: "drop-shadow(0 0 10px hsl(43 76% 52% / 0.3))" }}
          >
            👑 Swarna Kumariya
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
        </div>
        {females.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No contestants yet in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {females.map((c) => {
              const vs = getVoteState(c.nic, "kumariya");
              return (
                <PosterCard key={c.id} contestant={c} category="kumariya" {...vs}
                  onVote={vote} onViewDetails={() => { setSelectedContestant(c); setSelectedCategory("kumariya"); }} />
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedContestant && (
        <ContestantModal contestant={selectedContestant} category={selectedCategory}
          {...getVoteState(selectedContestant.nic, selectedCategory)}
          onVote={vote} onClose={() => setSelectedContestant(null)} />
      )}
    </div>
  );
};

/* ── Premium "Character Poster" Card ── */
const PosterCard = ({ contestant, category, isVoted, hasVoted, isSelf, onVote, onViewDetails }: {
  contestant: { id: string; nic: string; full_name: string; photo_urls: string[] | null };
  category: "kumara" | "kumariya";
  isVoted: boolean; hasVoted: boolean; isSelf: boolean;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onViewDetails: () => void;
}) => {
  const photo = contestant.photo_urls?.[0];

  return (
    <div
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 border border-foreground/10 backdrop-blur-sm ${
        isVoted ? "ring-2 ring-gold shadow-[0_0_25px_hsl(43_76%_52%/0.3)]" : "hover:shadow-[0_0_20px_hsl(43_76%_52%/0.2)]"
      }`}
      style={{ aspectRatio: "3/4" }}
    >
      {/* Full-bleed image */}
      <button onClick={onViewDetails} className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none z-10">
        {photo ? (
          <img src={photo} alt={contestant.full_name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-4xl">👤</div>
        )}
      </button>

      {/* Cinematic gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-20" style={{ top: "40%" }} />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 z-30 space-y-2">
        <h4 className="font-heading font-bold text-sm md:text-base text-foreground truncate drop-shadow-lg">
          {contestant.full_name}
        </h4>
        <div className="flex gap-1.5">
          <Button onClick={(e) => { e.stopPropagation(); onViewDetails(); }} variant="outline" size="sm"
            className="flex-1 text-xs h-7 border-foreground/20 text-foreground/80 hover:bg-foreground/10 backdrop-blur-sm">
            Details
          </Button>
          {isSelf ? (
            <span className="flex-1 text-[10px] text-muted-foreground italic flex items-center justify-center">You</span>
          ) : isVoted ? (
            <span className="flex-1 text-xs text-gold font-medium flex items-center justify-center">✅ Voted</span>
          ) : (
            <Button onClick={(e) => { e.stopPropagation(); onVote(contestant.nic, category); }} disabled={hasVoted}
              size="sm" className="flex-1 text-xs h-7 gold-gradient text-primary-foreground hover:opacity-90">
              {hasVoted ? "Voted" : "Vote"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingGallery;
