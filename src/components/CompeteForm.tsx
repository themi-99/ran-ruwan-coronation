import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import refKumara from "@/assets/ref-kumara.jpg";
import refKumariyaSinhala from "@/assets/ref-kumariya-sinhala.jpg";
import refKumariyaTamil from "@/assets/ref-kumariya-tamil.jpg";

interface Props {
  userNic: string;
  onComplete: () => void;
}

const CompeteForm = ({ userNic, onComplete }: Props) => {
  const [aboutMe, setAboutMe] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    const updated = [...photos, ...newFiles].slice(0, 5);
    setPhotos(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (i: number) => {
    const newPhotos = photos.filter((_, idx) => idx !== i);
    setPhotos(newPhotos);
    setPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (photos.length < 3) { toast.error("Please upload at least 3 photos."); return; }
    if (!aboutMe.trim()) { toast.error("Please write something about yourself."); return; }

    setLoading(true);
    try {
      const urls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${userNic}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("contestant-photos").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("contestant-photos").getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }

      const { error: dbError } = await supabase.from("contestants").insert({
        nic: userNic,
        about_me: aboutMe.trim(),
        photo_urls: urls,
      });

      if (dbError) throw dbError;
      toast.success("Entry submitted successfully! 🎉");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 gold-border card-glow space-y-5 animate-fade-in">
      <h3 className="text-xl md:text-2xl font-heading font-bold text-gold tracking-wide">Enter the Competition</h3>

      <div className="space-y-2">
        <label className="text-sm font-body font-medium text-foreground tracking-wide">About Me</label>
        <Textarea
          placeholder="Tell us about yourself and why you should be crowned Swarna Kumara / Kumariya!"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{aboutMe.length}/500</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-body font-medium text-foreground tracking-wide">
          Photos <span className="text-muted-foreground font-normal">(3-5 photos required)</span>
        </label>

        {/* Reference images */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-xs font-body font-semibold text-gold tracking-wide uppercase">
            📸 Reference — Accepted Dress Codes & Poses
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { src: refKumara, label: "Kumara – සරම & කමිසය" },
              { src: refKumariyaSinhala, label: "Kumariya – රෙද්ද & හැට්ටය" },
              { src: refKumariyaTamil, label: "Kumariya – பட்டு சேலை" },
            ].map((ref, i) => (
              <div key={i} className="space-y-1.5">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gold/30">
                  <img src={ref.src} alt={ref.label} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-[10px] md:text-xs text-center text-muted-foreground leading-tight">{ref.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/70 text-center italic">
            Selfie සහ තේමාවට නොගැළපෙන පින්තූර පිළිගනු නොලැබේ
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden gold-border">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-gold hover:text-gold transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <Button onClick={handleSubmit} disabled={loading}
        className="w-full gold-gradient text-primary-foreground font-semibold hover:opacity-90">
        {loading ? "Submitting..." : "Submit Entry 🌟"}
      </Button>
    </div>
  );
};

export default CompeteForm;
