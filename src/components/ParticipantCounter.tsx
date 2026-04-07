import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const ParticipantCounter = () => {
  const [target, setTarget] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("manual_participant_count")
        .eq("id", 1)
        .maybeSingle();
      if (data?.manual_participant_count) setTarget(data.manual_participant_count);
    };
    fetch();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [target]);

  if (target === 0) return null;

  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-center space-y-3 overflow-hidden">
      {/* Subtle gold shimmer border */}
      <div className="absolute inset-0 rounded-2xl border border-gold/20 pointer-events-none" />

      {/* Live dot + number */}
      <div className="flex items-center justify-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gold" />
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-heading font-black gold-text-gradient tabular-nums"
          style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}>
          {displayed}+
        </span>
      </div>

      {/* English */}
      <p className="text-sm md:text-base font-body text-foreground/85 leading-relaxed">
        Over <span className="text-gold font-semibold">{displayed}</span> Contestants Have Already Joined the Journey!
      </p>

      {/* Sinhala & Tamil */}
      <p className="text-xs md:text-sm font-body text-foreground/60 leading-loose">
        දැනටමත් තරඟකරුවන් <span className="text-gold">{displayed}</span> කට අධික සංඛ්‍යාවක් එක්වී ඇත
        <span className="mx-2 text-gold/40">|</span>
        ஏற்கனவே <span className="text-gold">{displayed}</span> க்கும் மேற்பட்ட போட்டியாளர்கள் இணைந்துள்ளனர்
      </p>
    </div>
  );
};

export default ParticipantCounter;
