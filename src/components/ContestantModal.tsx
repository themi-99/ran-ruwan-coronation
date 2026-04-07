import { useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = contestant.photo_urls || [];

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !lightboxOpen) onClose(); }}>
        <DialogContent className="max-w-md rounded-2xl border border-gold/30 bg-background/95 shadow-[0_0_60px_hsl(43_76%_52%_/_0.15)] p-0 gap-0 max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{contestant.full_name}</DialogTitle>
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
              <div className="relative flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
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
                {/* Zoom button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                  className="absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full bg-background/60 border border-gold/20 flex items-center justify-center text-gold hover:bg-background/80 hover:scale-110 transition-all"
                  aria-label="Zoom image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                {photos.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-background/70 rounded-full px-3 py-1.5 z-20">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === photoIdx ? "bg-gold shadow-[0_0_6px_hsl(43_76%_52%_/_0.6)]" : "bg-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-6 flex flex-col gap-4 items-center text-center">
              <h3 className="font-heading font-bold text-3xl md:text-4xl gold-text-gradient tracking-wide leading-tight">
                {contestant.full_name}
              </h3>

              {contestant.about_me && (
                <p className="text-cream/90 font-body text-sm md:text-base leading-relaxed tracking-wide max-w-sm">
                  {contestant.about_me}
                </p>
              )}

              {isSelf ? (
                <p className="text-muted-foreground italic text-sm">You can't vote for yourself</p>
              ) : isVoted ? (
                <div className="text-gold font-heading font-semibold text-lg">
                  ✅ You voted for {contestant.full_name}
                </div>
              ) : (
                <button
                  onClick={() => onVote(contestant.nic, category)}
                  disabled={hasVoted}
                  className="w-full py-4 rounded-xl font-heading font-bold text-lg tracking-wide
                    gold-gradient text-primary-foreground
                    shadow-[0_0_25px_hsl(43_76%_52%_/_0.3)]
                    hover:shadow-[0_0_40px_hsl(43_76%_52%_/_0.5)]
                    hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                >
                  {hasVoted ? "Already Voted" : `Vote for ${contestant.full_name} 🗳️`}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox overlay */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLightboxOpen(false); }}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground/20 hover:scale-110 transition-all"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[10000]">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPhotoIdx(i); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === photoIdx ? "bg-gold shadow-[0_0_8px_hsl(43_76%_52%_/_0.6)]" : "bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          )}

          <img
            src={photos[photoIdx]}
            alt={contestant.full_name}
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default ContestantModal;
