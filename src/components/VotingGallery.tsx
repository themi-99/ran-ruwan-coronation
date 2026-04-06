import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { X } from "lucide-react";

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
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient">🗳️ Cast Your Vote 🗳️</h2>
        <p className="text-muted-foreground font-body">Vote for one Avurudu Kumara and one Avurudu Kumariya</p>
      </div>

      {/* Kumara Section */}
      <section className="space-y-3">
        <h3 className="text-xl font-heading font-semibold text-gold">👑 Avurudu Kumara</h3>
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
        <h3 className="text-xl font-heading font-semibold text-gold">👑 Avurudu Kumariya</h3>
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

/* ── Detail Modal ── */
const ContestantModal = ({ contestant, category, isVoted, hasVoted, isSelf, onVote, onClose }: {
  contestant: Contestant; category: "kumara" | "kumariya";
  isVoted: boolean; hasVoted: boolean; isSelf: boolean;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onClose: () => void;
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = contestant.photo_urls || [];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 bg-card border-gold/30 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{contestant.full_name}</DialogTitle>
        </DialogHeader>

        {/* Carousel */}
        {photos.length > 0 && (
          <div className="relative aspect-[3/4] overflow-hidden bg-gold-dark/30">
            <img src={photos[photoIdx]} alt={contestant.full_name}
              className="w-full h-full object-contain" />
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${i === photoIdx ? "bg-gold" : "bg-foreground/40"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="p-5 space-y-4">
          <h3 className="font-heading font-bold text-xl text-foreground">{contestant.full_name}</h3>
          {contestant.about_me && (
            <p className="text-sm text-muted-foreground about-me-text leading-relaxed">{contestant.about_me}</p>
          )}

          {isSelf ? (
            <p className="text-sm text-muted-foreground italic text-center">You can't vote for yourself</p>
          ) : isVoted ? (
            <div className="text-center py-2 text-gold font-heading font-semibold">✅ You voted for {contestant.full_name}</div>
          ) : (
            <Button onClick={() => onVote(contestant.nic, category)} disabled={hasVoted}
              className="w-full gold-gradient text-primary-foreground hover:opacity-90 h-11 text-base font-heading font-semibold"
              size="lg">
              {hasVoted ? "Already Voted" : `Vote for ${contestant.full_name} 🗳️`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VotingGallery;
