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
import logo from "@/assets/logo.png";
import avuruduBanner from "@/assets/avurudu-banner.jpg";
import festiveScene from "@/assets/festive-scene.jpg";
import sunOrnate from "@/assets/sun-ornate.jpg";

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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Festive background layer */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={festiveScene} alt="" className="w-full h-full object-cover opacity-8" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />
      </div>

      {/* Floating decorative sun */}
      <img src={sunOrnate} alt="" className="fixed bottom-10 right-5 w-20 h-20 opacity-15 pointer-events-none"
        style={{ animation: "float 5s ease-in-out infinite" }} />

      <Fireworks />

      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gold-gradient" />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Ran Ruwan" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-heading font-bold gold-text-gradient leading-tight">Ran Ruwan</h1>
              <p className="text-xs text-muted-foreground">Awurudu Abhiman 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground hidden sm:block">
              Welcome, <span className="text-gold font-medium">{user.full_name}</span>
            </span>
            {user.is_admin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdmin(!showAdmin)}
                className="border-gold text-gold hover:bg-gold/10"
              >
                {showAdmin ? "Close Admin" : "Admin Panel"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}
              className="text-muted-foreground hover:text-foreground">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {showAdmin && user.is_admin ? (
          <AdminPanel currentStage={stage} onStageChange={(s) => setStage(s)} />
        ) : (
          <div className="animate-fade-in">
            {stage === "competing" && (
              <div className="space-y-6">
                {/* Festive banner */}
                <div className="relative rounded-xl overflow-hidden gold-border card-glow">
                  <img src={avuruduBanner} alt="Avurudu" className="w-full h-32 sm:h-44 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient drop-shadow-lg">
                        🎊 The Competition is On! 🎊
                      </h2>
                      <p className="text-foreground/80 text-sm mt-1">
                        Show the world your Avurudu spirit!
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

                {hasCompeted ? (
                  <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 gold-border text-center space-y-2">
                    <span className="text-4xl">✅</span>
                    <p className="text-gold font-heading text-lg">You've already entered the competition!</p>
                    <p className="text-muted-foreground text-sm">Wait for the voting stage to begin.</p>
                  </div>
                ) : !showCompeteForm ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Upload your best photos and tell us about yourself to compete for Avurudu Kumara / Kumariya!
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
            {stage === "voting" && <VotingGallery voterNic={user.nic} />}
            {stage === "calculating" && <CalculatingStage />}
            {stage === "winners" && <WinnersStage />}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
