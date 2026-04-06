import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-md rounded-2xl bg-white border-none shadow-xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{contestant.full_name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Image area */}
          {photos.length > 0 && (
            <div className="relative max-h-[400px] bg-gray-100 flex items-center justify-center rounded-t-2xl overflow-hidden">
              <img
                src={photos[photoIdx]}
                alt={contestant.full_name}
                className="w-full max-h-[400px] object-contain"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i === photoIdx ? "bg-primary" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-xl text-gray-900 text-center">
              {contestant.full_name}
            </h3>

            {contestant.about_me && (
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                {contestant.about_me}
              </p>
            )}

            {isSelf ? (
              <p className="text-gray-400 italic text-center text-sm">You can't vote for yourself</p>
            ) : isVoted ? (
              <div className="text-center text-primary font-semibold">✅ You voted for {contestant.full_name}</div>
            ) : (
              <Button
                onClick={() => onVote(contestant.nic, category)}
                disabled={hasVoted}
                className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold text-base hover:opacity-90"
              >
                {hasVoted ? "Already Voted" : `Vote for ${contestant.full_name}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContestantModal;
