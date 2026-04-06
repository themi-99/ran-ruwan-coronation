import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

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

    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("nic", nic.trim())
      .maybeSingle();

    if (dbError) { setError("Something went wrong. Please try again."); setLoading(false); return; }
    if (!data) { setError("NIC not found in our employee database."); setLoading(false); return; }

    setUser(data);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo area */}
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-full gold-gradient gold-glow">
            <span className="text-4xl">🪔</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold gold-text-gradient">
            Ran Ruwan
          </h1>
          <h2 className="text-xl font-heading text-gold-light">
            Awurudu Abhiman 2026
          </h2>
          <p className="text-muted-foreground text-sm">
            Ran Ruwan Gold Loans Pvt Ltd
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 gold-border card-glow space-y-4">
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
          >
            {loading ? "Verifying..." : "Enter the Celebration 🎉"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
