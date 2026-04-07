import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fireworks from "@/components/Fireworks";
import awuruduBg from "@/assets/awurudu-bg.jpg";
import logo from "@/assets/logo.png";

const LoginPage = () => {
  const [nic, setNic] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!nic.trim()) { setError("Please enter your NIC number."); return; }
    setLoading(true);
    setError("");

    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) { setError("Authentication failed. Please try again."); setLoading(false); return; }

    const { data, error: verifyError } = await supabase.functions.invoke("verify-nic", {
      body: { nic: nic.trim() },
    });

    if (verifyError || data?.error) {
      await supabase.auth.signOut();
      setError(data?.error || "NIC not found in our employee database.");
      setLoading(false);
      return;
    }

    await supabase.auth.refreshSession();
    setUser(data.profile);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Custom Awurudu background */}
      <div className="fixed inset-0">
        <img src={awuruduBg} alt="" className="w-full h-full object-cover" width={1920} height={1920} />
      </div>

      <Fireworks />

      <div className="relative z-10 w-full max-w-md space-y-10 animate-fade-in">
        {/* Logo & Title — Movie Poster Style */}
        <div className="text-center space-y-5">
          <img src={logo} alt="Ran Ruwan Gold Loan" className="w-28 h-28 mx-auto drop-shadow-lg"
            style={{ animation: "float 3s ease-in-out infinite" }} />

          {/* Pre-title / Sponsor line */}
          <p className="uppercase tracking-[0.3em] text-xs font-body font-medium text-cream/70">
            Ran Ruwan Gold Loans Pvt Ltd
          </p>

          {/* Main Event Title */}
          <h1
            className="font-heading font-black uppercase leading-tight text-4xl md:text-5xl gold-text-gradient drop-shadow-md"
            style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
          >
            Ran Ruwan<br />Awurudu Abhiman
          </h1>

          {/* Year */}
          <p className="font-heading font-bold text-2xl md:text-3xl uppercase tracking-[0.5em] gold-text-gradient">
            2026
          </p>

          {/* Subtitle / Competition Name */}
          <p className="font-heading italic text-lg md:text-xl text-white/90 tracking-wide">
            Swarna Kumara &amp; Kumariya
          </p>

          <div className="flex justify-center gap-2 text-xl">
            {["🪔", "🌺", "✨", "🌺", "🪔"].map((e, i) => (
              <span key={i} style={{ animation: `float ${2.5 + i * 0.2}s ease-in-out infinite` }}>{e}</span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="bg-card/85 backdrop-blur-md rounded-lg p-6 gold-border card-glow space-y-4">
          <label className="block text-sm font-medium text-foreground">
            National Identity Card (NIC)
          </label>
          <Input
            placeholder="Enter your NIC number"
            value={nic}
            onChange={(e) => { setNic(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full gold-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            style={{ animation: "pulse-gold 2s ease-in-out infinite" }}
          >
            {loading ? "Verifying..." : "Enter the Celebration 🎉"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground font-medium">සුභ අලුත් අවුරුද්දක් වේවා! 🎊</p>
      </div>
    </div>
  );
};

export default LoginPage;
