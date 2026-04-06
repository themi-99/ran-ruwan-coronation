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

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo area */}
        <div className="text-center space-y-3">
          <img src={logo} alt="Ran Ruwan Gold Loan" className="w-32 h-32 mx-auto drop-shadow-lg"
            style={{ animation: "float 3s ease-in-out infinite" }} />
          <h1 className="text-3xl md:text-4xl font-heading font-bold gold-text-gradient drop-shadow-md">
            Ran Ruwan
          </h1>
          <h2 className="text-xl font-heading text-gold-dark font-semibold">
            Awurudu Abhiman 2026
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Ran Ruwan Gold Loans Pvt Ltd
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
