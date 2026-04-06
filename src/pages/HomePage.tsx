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
import logo from "@/assets/logo.png";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {showAdmin && user.is_admin ? (
          <AdminPanel currentStage={stage} onStageChange={(s) => setStage(s)} />
        ) : (
          <div className="animate-fade-in">
            {stage === "competing" && (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold gold-text-gradient">
                    🎊 The Competition is On! 🎊
                  </h2>
                  <p className="text-muted-foreground">
                    Show the world your Avurudu spirit! Upload your best photos and tell us about yourself.
                  </p>
                </div>
                {hasCompeted ? (
                  <div className="bg-card rounded-lg p-6 gold-border text-center space-y-2">
                    <span className="text-4xl">✅</span>
                    <p className="text-gold font-heading text-lg">You've already entered the competition!</p>
                    <p className="text-muted-foreground text-sm">Wait for the voting stage to begin.</p>
                  </div>
                ) : !showCompeteForm ? (
                  <div className="text-center">
                    <Button
                      onClick={() => setShowCompeteForm(true)}
                      className="gold-gradient text-primary-foreground font-semibold text-lg px-8 py-6 gold-glow hover:opacity-90 transition-all"
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
