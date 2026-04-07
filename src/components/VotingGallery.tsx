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

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error("You've already voted in this category!");
      return;
    }

    const { error } = await supabase.from("votes").insert({
      voter_nic: voterNic,
      candidate_nic: candidateNic,
      category,
    });

    if (error) { toast.error("Failed to vote. You may have already voted."); return; }

    if (category === "kumara") setVotedMale(candidateNic);
    else setVotedFemale(candidateNic);
    toast.success("Vote cast! 🗳️");
  };

  const males = contestants.filter((c) => c.gender?.toLowerCase() === "male");
  const females = contestants.filter((c) => c.gender?.toLowerCase() === "female");

  const getVoteState = (nic: string, category: "kumara" | "kumariya") => {
    const voted = category === "kumara" ? votedMale : votedFemale;
    const isVoted = voted === nic;
    const hasVoted = !!voted;
    const isSelf = nic === voterNic;
    return { isVoted, hasVoted, isSelf };
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading contestants...</div>;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-heading font-black uppercase gold-text-gradient tracking-wide"
          style={{ filter: "drop-shadow(0 0 15px hsl(43 76% 52% / 0.3))" }}>🗳️ Cast Your Vote 🗳️</h2>
        <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed">Vote for one Swarna Kumara and one Swarna Kumariya</p>
      </div>

      {/* Kumara Section */}
      <section className="space-y-3">
        <h3 className="text-xl md:text-2xl font-heading font-bold text-gold tracking-wide">👑 Swarna Kumara</h3>
        {males.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No contestants yet in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {males.map((c) => {
              const { isVoted, hasVoted, isSelf } = getVoteState(c.nic, "kumara");
              return (
                <ThumbnailCard key={c.id} contestant={c} category="kumara"
                  isVoted={isVoted} hasVoted={hasVoted} isSelf={isSelf}
                  onVote={vote} onViewDetails={() => { setSelectedContestant(c); setSelectedCategory("kumara"); }} />
              );
            })}
          </div>
        )}
      </section>

      {/* Kumariya Section */}
      <section className="space-y-3">
        <h3 className="text-xl md:text-2xl font-heading font-bold text-gold tracking-wide">👑 Swarna Kumariya</h3>
        {females.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No contestants yet in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {females.map((c) => {
              const { isVoted, hasVoted, isSelf } = getVoteState(c.nic, "kumariya");
              return (
                <ThumbnailCard key={c.id} contestant={c} category="kumariya"
                  isVoted={isVoted} hasVoted={hasVoted} isSelf={isSelf}
                  onVote={vote} onViewDetails={() => { setSelectedContestant(c); setSelectedCategory("kumariya"); }} />
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedContestant && (
        <ContestantModal
          contestant={selectedContestant}
          category={selectedCategory}
          {...getVoteState(selectedContestant.nic, selectedCategory)}
          onVote={vote}
          onClose={() => setSelectedContestant(null)}
        />
      )}
    </div>
  );
};

/* ── Thumbnail Card ── */
const ThumbnailCard = ({ contestant, category, isVoted, hasVoted, isSelf, onVote, onViewDetails }: {
  contestant: Contestant; category: "kumara" | "kumariya";
  isVoted: boolean; hasVoted: boolean; isSelf: boolean;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onViewDetails: () => void;
}) => {
  const photo = contestant.photo_urls?.[0];

  return (
    <div className={`bg-card rounded-lg overflow-hidden gold-border card-glow transition-all ${isVoted ? "ring-2 ring-gold" : ""}`}>
      <button onClick={onViewDetails} className="w-full cursor-pointer focus:outline-none">
        <div className="aspect-[4/5] overflow-hidden bg-gold-dark/30">
          {photo ? (
            <img src={photo} alt={contestant.full_name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">👤</div>
          )}
        </div>
      </button>
      <div className="p-2.5 space-y-1.5">
        <h4 className="font-heading font-bold text-sm text-foreground truncate">{contestant.full_name}</h4>
        <div className="flex gap-1.5">
          <Button onClick={onViewDetails} variant="outline" size="sm"
            className="flex-1 text-xs h-7 border-gold/30 text-gold hover:bg-gold/10">
            Details
          </Button>
          {isSelf ? (
            <span className="flex-1 text-[10px] text-muted-foreground italic flex items-center justify-center">You</span>
          ) : isVoted ? (
            <span className="flex-1 text-xs text-gold font-medium flex items-center justify-center">✅</span>
          ) : (
            <Button onClick={() => onVote(contestant.nic, category)} disabled={hasVoted}
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
