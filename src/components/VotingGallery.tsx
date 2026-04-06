import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch contestants with profile info
    const { data: contestantsData } = await supabase.from("contestants").select("*");
    const { data: profiles } = await supabase.from("profiles").select("nic, full_name, gender");

    if (contestantsData && profiles) {
      const merged = contestantsData.map((c) => {
        const profile = profiles.find((p) => p.nic === c.nic);
        return { ...c, full_name: profile?.full_name || "Unknown", gender: profile?.gender || null, nic: c.nic || "" };
      });
      setContestants(merged);
    }

    // Check existing votes
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

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading contestants...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient">🗳️ Cast Your Vote 🗳️</h2>
        <p className="text-muted-foreground">Vote for one Avurudu Kumara and one Avurudu Kumariya</p>
      </div>

      <CategorySection title="👑 Avurudu Kumara" contestants={males} category="kumara"
        voted={votedMale} onVote={vote} voterNic={voterNic} />
      <CategorySection title="👑 Avurudu Kumariya" contestants={females} category="kumariya"
        voted={votedFemale} onVote={vote} voterNic={voterNic} />
    </div>
  );
};

const CategorySection = ({ title, contestants, category, voted, onVote, voterNic }: {
  title: string; contestants: Contestant[]; category: "kumara" | "kumariya";
  voted: string | null; onVote: (nic: string, cat: "kumara" | "kumariya") => void; voterNic: string;
}) => (
  <div className="space-y-4">
    <h3 className="text-xl font-heading font-semibold text-gold">{title}</h3>
    {contestants.length === 0 ? (
      <p className="text-muted-foreground text-center py-4">No contestants yet in this category.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contestants.map((c) => (
          <ContestantCard key={c.id} contestant={c} category={category}
            isVoted={voted === c.nic} hasVoted={!!voted} onVote={onVote} isSelf={c.nic === voterNic} />
        ))}
      </div>
    )}
  </div>
);

const ContestantCard = ({ contestant, category, isVoted, hasVoted, onVote, isSelf }: {
  contestant: Contestant; category: "kumara" | "kumariya";
  isVoted: boolean; hasVoted: boolean; onVote: (nic: string, cat: "kumara" | "kumariya") => void; isSelf: boolean;
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = contestant.photo_urls || [];

  return (
    <div className={`bg-card rounded-lg overflow-hidden gold-border card-glow transition-all ${isVoted ? "ring-2 ring-gold" : ""}`}>
      {photos.length > 0 && (
        <div className="relative aspect-[3/4] overflow-hidden bg-gold-dark/30">
          <img src={photos[photoIdx]} alt={contestant.full_name} className="w-full h-full object-contain" loading="lazy" />
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/50 backdrop-blur-sm rounded-full px-2 py-1">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === photoIdx ? "bg-gold" : "bg-foreground/40"}`} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="p-4 space-y-2">
        <h4 className="font-heading font-semibold text-foreground">{contestant.full_name}</h4>
        {contestant.about_me && (
          <p className="text-sm text-muted-foreground line-clamp-3">{contestant.about_me}</p>
        )}
        {isSelf ? (
          <p className="text-xs text-muted-foreground italic">You can't vote for yourself</p>
        ) : isVoted ? (
          <div className="text-center py-1 text-gold font-medium text-sm">✅ Voted</div>
        ) : (
          <Button onClick={() => onVote(contestant.nic, category)} disabled={hasVoted}
            className="w-full gold-gradient text-primary-foreground text-sm hover:opacity-90"
            size="sm">
            {hasVoted ? "Already voted" : "Vote 🗳️"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VotingGallery;
