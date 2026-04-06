import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ornateFrame from "@/assets/ornate-frame.png";
import goldSeparator from "@/assets/gold-separator.png";
import ornateClose from "@/assets/ornate-close.png";

interface Contestant {
  id: string;
  nic: string;
  about_me: string | null;
  photo_urls: string[] | null;
  full_name: string;
  gender: string | null;
}

interface Props {
  contestant: Contestant;
  category: "kumara" | "kumariya";
  isVoted: boolean;
  hasVoted: boolean;
  isSelf: boolean;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onClose: () => void;
}

const ContestantModal = ({ contestant, category, isVoted, hasVoted, isSelf, onVote, onClose }: Props) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = contestant.photo_urls || [];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg p-0 bg-transparent border-none shadow-none gap-0 max-h-[95vh] overflow-visible [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{contestant.full_name}</DialogTitle>
        </DialogHeader>

        {/* Falling petals background effect */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xl opacity-40 animate-falling-petal"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>

        {/* Ornate card container */}
        <div className="relative max-h-[90vh] overflow-y-auto ornate-scrollbar">
          {/* Ornate frame overlay */}
          <img
            src={ornateFrame}
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10 opacity-30"
            aria-hidden="true"
          />

          {/* Custom ornate close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-30 w-10 h-10 hover:scale-110 transition-transform focus:outline-none"
            aria-label="Close"
          >
            <img src={ornateClose} alt="Close" className="w-full h-full" />
          </button>

          <div className="relative z-20 rounded-xl overflow-hidden border-2 border-gold/50 gold-glow">
            {/* Photo area with royal portrait framing */}
            {photos.length > 0 && (
              <div className="relative bg-gold-dark/40">
                {/* Soft spotlight effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_76%_52%_/_0.15)_0%,_transparent_70%)] pointer-events-none z-[1]" />

                {/* Inner decorative gold border */}
                <div className="m-3 border-2 border-gold/40 rounded-lg overflow-hidden shadow-[inset_0_0_30px_hsl(43_76%_52%_/_0.1)]">
                  <div className="max-h-[50vh] flex items-center justify-center bg-gold-dark/30">
                    <img
                      src={photos[photoIdx]}
                      alt={contestant.full_name}
                      className="w-full max-h-[50vh] object-contain"
                    />
                  </div>
                </div>

                {/* Carousel dots */}
                {photos.length > 1 && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-[2]">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i === photoIdx
                            ? "bg-gold scale-110 shadow-[0_0_8px_hsl(43_76%_52%_/_0.6)]"
                            : "bg-foreground/40 hover:bg-foreground/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Maroon velvet content panel */}
            <div className="bg-maroon/90 relative">
              {/* Velvet texture overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(345_60%_30%_/_0.5)_0%,_transparent_70%)] pointer-events-none" />

              <div className="relative p-6 space-y-4">
                {/* Gold leaf name */}
                <h3 className="font-heading font-black text-2xl md:text-3xl text-center gold-text-gradient tracking-wide">
                  {contestant.full_name}
                </h3>

                {/* Ornate separator */}
                <div className="flex justify-center">
                  <img
                    src={goldSeparator}
                    alt=""
                    className="w-48 h-auto opacity-80"
                    aria-hidden="true"
                    loading="lazy"
                  />
                </div>

                {/* About me text */}
                {contestant.about_me && (
                  <p className="text-gold-light/90 font-body text-sm md:text-base leading-relaxed tracking-wide text-center about-me-text">
                    {contestant.about_me}
                  </p>
                )}

                {/* Voting section */}
                <div className="pt-2">
                  {isSelf ? (
                    <p className="text-gold-light/60 italic text-center font-body text-sm">
                      You can't vote for yourself
                    </p>
                  ) : isVoted ? (
                    <div className="text-center py-3">
                      <span className="font-heading font-bold text-lg gold-text-gradient">
                        ✅ You voted for {contestant.full_name}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onVote(contestant.nic, category)}
                      disabled={hasVoted}
                      className="w-full py-4 rounded-xl font-heading font-bold text-lg tracking-wider
                        gold-gradient text-primary-foreground
                        border-2 border-gold-light/50
                        shadow-[0_0_20px_hsl(43_76%_52%_/_0.3),_inset_0_1px_0_hsl(43_80%_70%_/_0.4)]
                        hover:shadow-[0_0_30px_hsl(43_76%_52%_/_0.5),_inset_0_1px_0_hsl(43_80%_70%_/_0.5)]
                        hover:scale-[1.02] active:scale-[0.98]
                        transition-all duration-300
                        shimmer
                        disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                    >
                      {hasVoted ? "Already Voted" : `🗳️ Vote for ${contestant.full_name} 🗳️`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContestantModal;
