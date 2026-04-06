import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fireworks from "@/components/Fireworks";
import heroBanner from "@/assets/hero-banner.jpg";
import festiveScene from "@/assets/festive-scene.jpg";
import sunFace from "@/assets/sun-face.jpg";
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

    // Sign in anonymously to get a real Supabase session
    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) { setError("Authentication failed. Please try again."); setLoading(false); return; }

    // Call edge function to verify NIC and set secure app_metadata
    const { data, error: verifyError } = await supabase.functions.invoke("verify-nic", {
      body: { nic: nic.trim() },
    });

    if (verifyError || data?.error) {
      await supabase.auth.signOut();
      setError(data?.error || "NIC not found in our employee database.");
      setLoading(false);
      return;
    }

    // Refresh the session to get updated JWT with app_metadata
    await supabase.auth.refreshSession();

    setUser(data.profile);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Layered festive backgrounds */}
      <div className="absolute inset-0">
        <img src={festiveScene} alt="" className="w-full h-full object-cover opacity-15" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />

      {/* Floating sun decoration */}
      <img src={sunFace} alt="" className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32 opacity-30"
        style={{ animation: "float 4s ease-in-out infinite" }} />

      {/* Oil lamp border top */}
      <div className="absolute top-0 left-0 right-0 h-2 gold-gradient" />

      <Fireworks />

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo area */}
        <div className="text-center space-y-3">
          <img src={logo} alt="Ran Ruwan Gold Loan" className="w-32 h-32 mx-auto drop-shadow-lg"
            style={{ animation: "float 3s ease-in-out infinite" }} />
          <h1 className="text-3xl md:text-4xl font-heading font-bold gold-text-gradient">
            Ran Ruwan
          </h1>
          <h2 className="text-xl font-heading text-gold-light">
            Awurudu Abhiman 2026
          </h2>
          <p className="text-muted-foreground text-sm">
            Ran Ruwan Gold Loans Pvt Ltd
          </p>
          <div className="flex justify-center gap-2 text-xl">
            {["🪔", "🌺", "✨", "🌺", "🪔"].map((e, i) => (
              <span key={i} style={{ animation: `float ${2.5 + i * 0.2}s ease-in-out infinite` }}>{e}</span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-md rounded-lg p-6 gold-border card-glow space-y-4">
          <label className="block text-sm font-medium text-foreground">
            National Identity Card (NIC)
          </label>
          <Input
            placeholder="Enter your NIC number"
            value={nic}
            onChange={(e) => { setNic(e.target.value); setError(""); }}
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

        <p className="text-center text-xs text-muted-foreground">සුභ අලුත් අවුරුද්දක් වේවා! 🎊</p>
      </div>
    </div>
  );
};

export default LoginPage;
