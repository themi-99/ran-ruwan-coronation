import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import avuruduFamily from "@/assets/avurudu-family.jpg";

interface Winner {
  nic: string;
  full_name: string;
  photo_urls: string[] | null;
  votes: number;
}

const WinnersStage = () => {
  const [kumara, setKumara] = useState<Winner | null>(null);
  const [kumariya, setKumariya] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWinners(); }, []);

  const fetchWinners = async () => {
    const { data: votes } = await supabase.from("votes").select("*");
    const { data: contestants } = await supabase.from("contestants").select("*");
    const { data: profiles } = await supabase.from("profiles").select("nic, full_name, gender");
    if (!votes || !contestants || !profiles) { setLoading(false); return; }

    const getWinner = (category: string): Winner | null => {
      const catVotes = votes.filter((v) => v.category === category);
      const counts: Record<string, number> = {};
      catVotes.forEach((v) => { if (v.candidate_nic) counts[v.candidate_nic] = (counts[v.candidate_nic] || 0) + 1; });
      const topNic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!topNic) return null;
      const profile = profiles.find((p) => p.nic === topNic[0]);
      const contestant = contestants.find((c) => c.nic === topNic[0]);
      return { nic: topNic[0], full_name: profile?.full_name || "Unknown", photo_urls: contestant?.photo_urls || null, votes: topNic[1] };
    };

    setKumara(getWinner("kumara"));
    setKumariya(getWinner("kumariya"));
    setLoading(false);
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading winners...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Festive background image */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-64 h-40 opacity-15 pointer-events-none">
        <img src={avuruduFamily} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="text-center space-y-3 relative">
        <div className="text-5xl" style={{ animation: "crown-entrance 1s ease-out forwards" }}>👑</div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold gold-text-gradient">
          The Royal Court of Avurudu 2026
        </h2>
        <p className="text-muted-foreground">The votes are in. Behold your champions!</p>
        <div className="flex justify-center gap-2">
          {["🎆", "🎇", "✨", "🎇", "🎆"].map((e, i) => (
            <span key={i} className="text-xl" style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WinnerCard title="Avurudu Kumara" winner={kumara} emoji="🤴" />
        <WinnerCard title="Avurudu Kumariya" winner={kumariya} emoji="👸" />
      </div>
    </div>
  );
};

const WinnerCard = ({ title, winner, emoji }: { title: string; winner: Winner | null; emoji: string }) => (
  <div className="bg-card/80 backdrop-blur-sm rounded-lg overflow-hidden gold-border card-glow text-center relative">
    <div className="absolute inset-0 shimmer pointer-events-none" />
    {winner ? (
      <>
        {winner.photo_urls?.[0] && (
          <div className="aspect-[3/4] overflow-hidden">
            <img src={winner.photo_urls[0]} alt={winner.full_name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-3 relative">
          <div className="text-4xl">{emoji}</div>
          <h3 className="text-xl font-heading font-bold text-gold">{title}</h3>
          <p className="text-2xl font-heading font-bold text-foreground">{winner.full_name}</p>
          <p className="text-muted-foreground">{winner.votes} votes</p>
          <div className="flex justify-center gap-2">
            {["🎊", "✨", "🌟", "✨", "🎊"].map((e, i) => (
              <span key={i} className="text-lg">{e}</span>
            ))}
          </div>
        </div>
      </>
    ) : (
      <div className="p-10 space-y-3">
        <div className="text-4xl">{emoji}</div>
        <h3 className="text-xl font-heading font-bold text-gold">{title}</h3>
        <p className="text-muted-foreground">No winner determined yet</p>
      </div>
    )}
  </div>
);

export default WinnersStage;
