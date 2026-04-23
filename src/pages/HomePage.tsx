import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import CompeteForm from "@/components/CompeteForm";
import VotingGallery from "@/components/VotingGallery";
import CalculatingStage from "@/components/CalculatingStage";
import WinnersStage from "@/components/WinnersStage";
import AdminPanel from "@/components/AdminPanel";
import Fireworks from "@/components/Fireworks";
import Guidelines from "@/components/Guidelines";
import ParticipantCounter from "@/components/ParticipantCounter";
import logo from "@/assets/logo.png";
import avuruduBanner from "@/assets/avurudu-banner.jpg";
import awuruduBg from "@/assets/awurudu-bg.jpg";

const HomePage = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [stage, setStage] = useState<string>("competing");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCompeteForm, setShowCompeteForm] = useState(false);
  const [hasCompeted, setHasCompeted] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchStage();
    checkIfCompeted();
  }, [user]);

  const fetchStage = async () => {
    const { data } = await supabase.from("app_config").select("current_stage").eq("id", 1).maybeSingle();
    if (data?.current_stage) setStage(data.current_stage);
  };

  const checkIfCompeted = async () => {
    if (!user) return;
    const { data } = await supabase.from("contestants").select("id").eq("nic", user.nic).maybeSingle();
    setHasCompeted(!!data);
  };

  if (!user) return null;

  const isAdmin = showAdmin && user.is_admin;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom Awurudu background */}
      <div className="fixed inset-0">
        <img src={awuruduBg} alt="" className="w-full h-full object-cover" width={1920} height={1920} />
        {isAdmin && <div className="absolute inset-0 bg-background/60" />}
      </div>

      <Fireworks />

      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gold-gradient" />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Ran Ruwan" className="w-10 h-10 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-heading font-bold gold-text-gradient leading-tight">Ran Ruwan</h1>
              <p className="text-xs text-muted-foreground">Swarna Kumara & Kumariya 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xs sm:text-sm text-foreground block truncate max-w-[100px] sm:max-w-none">
              <span className="hidden sm:inline">Welcome, </span>
              <span className="sm:hidden">Hi, </span>
              <span className="text-gold font-medium">{user.full_name}</span>
            </span>
            {user.is_admin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdmin(!showAdmin)}
                className="border-gold text-gold hover:bg-gold/10 flex-shrink-0"
              >
                {showAdmin ? "Close Admin" : "Admin Panel"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}
              className="text-muted-foreground hover:text-foreground flex-shrink-0">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {isAdmin ? (
          <AdminPanel currentStage={stage} onStageChange={(s) => setStage(s)} adminNic={user.nic} />
        ) : (
          <div className="animate-fade-in">
            {stage === "competing" && (
              <div className="space-y-6">
                {/* Cinematic Hero Banner */}
                <div className="relative rounded-xl overflow-hidden gold-border card-glow">
                  <img src={avuruduBanner} alt="Avurudu" className="w-full h-40 sm:h-52 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 flex items-center justify-center">
                    <div className="text-center px-4 space-y-2">
                      <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-heading font-black uppercase gold-text-gradient drop-shadow-2xl leading-tight"
                        style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
                      >
                        Ran Ruwan Awurudu Abhiman
                      </h2>
                      <p className="text-gold-light font-heading text-xl md:text-2xl tracking-[0.4em] font-bold drop-shadow-lg">
                        2026
                      </p>
                      <p className="text-white/90 text-sm md:text-base font-heading italic tracking-wide drop-shadow-md">
                        Swarna Kumara & Kumariya
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center gap-3 justify-center">
                  {["🪔", "✨", "🌺", "✨", "🪔"].map((e, i) => (
                    <span key={i} className="text-lg" style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
                  ))}
                </div>

                <Guidelines />

                <ParticipantCounter />

                {hasCompeted ? (
                  <div className="relative bg-card/30 backdrop-blur-xl rounded-2xl p-8 md:p-10 text-center space-y-4 border border-gold/30 overflow-hidden"
                    style={{ boxShadow: "0 0 40px hsl(43 76% 52% / 0.1), inset 0 1px 0 hsl(43 76% 52% / 0.15)" }}
                  >
                    {/* Pulsing gold ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-gold/40 animate-pulse pointer-events-none" />

                    <div className="text-5xl" style={{ filter: "drop-shadow(0 0 15px hsl(43 76% 52% / 0.5))" }}>🎉</div>
                    <h3 className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient leading-snug">
                      You are in the running!
                    </h3>
                    <p className="text-white/70 font-heading italic text-lg">
                      ඔබ තරගයට ඇතුලත් වී ඇත
                    </p>
                    <p className="text-muted-foreground text-sm font-body leading-relaxed max-w-md mx-auto">
                      Your submission has been received successfully. Check back when the voting stage begins!
                    </p>
                  </div>
                ) : !showCompeteForm ? (
                  <div className="text-center space-y-4">
                     <p className="text-muted-foreground">
                       Upload your best photos and tell us about yourself to compete for Swarna Kumara / Kumariya!
                     </p>
                    <Button
                      onClick={() => setShowCompeteForm(true)}
                      className="gold-gradient text-primary-foreground font-semibold text-lg px-8 py-6 gold-glow hover:opacity-90 transition-all"
                      style={{ animation: "pulse-gold 2s ease-in-out infinite" }}
                    >
                      ✨ Compete Now ✨
                    </Button>
                  </div>
                ) : (
                  <CompeteForm userNic={user.nic} onComplete={() => { setShowCompeteForm(false); setHasCompeted(true); }} />
                )}
              </div>
            )}
            {stage === "voting" && <VotingGallery voterNic={user.nic} isJudge={user.is_judge === true} />}
            {stage === "calculating" && <CalculatingStage />}
            {stage === "winners" && <WinnersStage />}
          </div>
        )}
      </main>
      <p className="text-xs text-muted-foreground text-center py-4 relative z-10">v1.1</p>
    </div>
  );
};

export default HomePage;
