import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";

interface Contestant {
  id: string;
  nic: string;
  about_me: string | null;
  photo_urls: string[] | null;
  full_name: string;
  gender: string | null;
}

interface JudgeScore {
  id: string;
  candidate_nic: string;
  category: string;
  medal: string;
  points: number;
}

const MEDALS = [
  { key: "gold", emoji: "🥇", label: "Gold", points: 5 },
  { key: "silver", emoji: "🥈", label: "Silver", points: 3 },
  { key: "bronze", emoji: "🥉", label: "Bronze", points: 1 },
] as const;

interface Props {
  contestant: Contestant;
  category: "kumara" | "kumariya";
  isVoted: boolean;
  hasReachedLimit: boolean;
  isSelf: boolean;
  isJudge?: boolean;
  judgeScore?: JudgeScore | null;
  onVote: (nic: string, cat: "kumara" | "kumariya") => void;
  onMedalClick?: (nic: string, cat: "kumara" | "kumariya", medal: string, points: number) => void;
  onClose: () => void;
}

const ContestantModal = ({ contestant, category, isVoted, hasReachedLimit, isSelf, isJudge, judgeScore, onVote, onMedalClick, onClose }: Props) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = contestant.photo_urls || [];

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !lightboxOpen) onClose(); }}>
        <DialogContent className="max-w-md rounded-2xl border border-gold/30 bg-background/95 shadow-[0_0_60px_hsl(43_76%_52%_/_0.15)] p-0 gap-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{contestant.full_name}</DialogTitle>
            <DialogDescription>
              Contestant details, photos, and voting actions for {contestant.full_name}.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-background/80 border border-gold/20 flex items-center justify-center text-gold hover:bg-background hover:scale-110 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            {photos.length > 0 && (
              <div
                className="relative flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={openLightbox}
              >
                <img
                  src={photos[photoIdx]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-110"
                />
                <img
                  src={photos[photoIdx]}
                  alt={contestant.full_name}
                  className="relative w-full max-h-[45vh] object-contain z-10"
                />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openLightbox();
                  }}
                  className="absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-background/60 border border-gold/20 flex items-center justify-center text-gold hover:bg-background/80 hover:scale-110 transition-all"
                  aria-label="Zoom image"
                  type="button"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {photos.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-background/70 rounded-full px-3 py-1.5 z-20">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPhotoIdx(i);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === photoIdx ? "bg-gold shadow-[0_0_6px_hsl(43_76%_52%_/_0.6)]" : "bg-foreground/40"
                        }`}
                        aria-label={`View photo ${i + 1}`}
                        type="button"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-6 flex flex-col gap-5 items-center text-center">
              <h3
                className="font-heading font-black text-3xl md:text-4xl gold-text-gradient tracking-wide leading-tight uppercase"
                style={{ filter: "drop-shadow(0 0 15px hsl(43 76% 52% / 0.3))" }}
              >
                {contestant.full_name}
              </h3>

              {contestant.about_me && (
                <p className="text-cream/90 font-body text-sm md:text-base leading-loose tracking-wide max-w-sm">
                  {contestant.about_me}
                </p>
              )}

              {HONORARY_NICS.includes(contestant.nic) ? (
                <div className="w-full flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/30">
                    Honorary Participant ✨
                  </span>
                </div>
              ) : isJudge && onMedalClick ? (
                <div className="w-full space-y-3">
                  <p className="text-muted-foreground text-sm font-heading">Award a medal:</p>
                  <div className="flex gap-3 justify-center">
                    {MEDALS.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => onMedalClick(contestant.nic, category, m.key, m.points)}
                        className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200 ${
                          judgeScore?.medal === m.key
                            ? "bg-gold/20 ring-2 ring-gold scale-105 shadow-[0_0_15px_hsl(43_76%_52%/0.4)]"
                            : "bg-foreground/10 hover:bg-foreground/20 hover:scale-105"
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-xs font-heading font-bold text-foreground">{m.label}</span>
                        <span className="text-[10px] text-muted-foreground">{m.points} pts</span>
                      </button>
                    ))}
                  </div>
                  {judgeScore && (
                    <p className="text-gold text-sm font-heading">
                      ✅ {judgeScore.medal.charAt(0).toUpperCase() + judgeScore.medal.slice(1)} awarded ({judgeScore.points} pts)
                      <span className="text-muted-foreground text-xs ml-1">(click again to undo)</span>
                    </p>
                  )}
                </div>
              ) : isSelf ? (
                <p className="text-muted-foreground italic text-sm">You can't vote for yourself</p>
              ) : isVoted ? (
                <div className="text-gold font-heading font-semibold text-lg">
                  ✅ You voted for {contestant.full_name}
                </div>
              ) : (
                <button
                  onClick={() => onVote(contestant.nic, category)}
                  disabled={hasReachedLimit}
                  className="w-full py-4 rounded-xl font-heading font-bold text-lg tracking-wide
                    gold-gradient text-primary-foreground
                    shadow-[0_0_25px_hsl(43_76%_52%_/_0.3)]
                    hover:shadow-[0_0_40px_hsl(43_76%_52%_/_0.5)]
                    hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                  type="button"
                >
                  {hasReachedLimit ? "Limit Reached" : `Vote for ${contestant.full_name} 🗳️`}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[10000] w-auto max-w-[95vw] -translate-x-1/2 -translate-y-1/2 outline-none"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <DialogTitle className="sr-only">Expanded photo of {contestant.full_name}</DialogTitle>
              <DialogDescription className="sr-only">
                Enlarged contestant photo viewer for {contestant.full_name}.
              </DialogDescription>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="absolute top-4 right-4 z-[10001] w-10 h-10 rounded-full bg-background/70 border border-gold/20 flex items-center justify-center text-foreground hover:bg-background/90 hover:scale-110 transition-all"
                aria-label="Close lightbox"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={photos[photoIdx]}
                alt={contestant.full_name}
                className="max-w-[95vw] max-h-[95vh] object-contain"
                draggable={false}
              />

              {photos.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[10001] rounded-full bg-background/70 px-4 py-2">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPhotoIdx(i);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i === photoIdx ? "bg-gold shadow-[0_0_8px_hsl(43_76%_52%_/_0.6)]" : "bg-foreground/40"
                      }`}
                      aria-label={`View expanded photo ${i + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default ContestantModal;
