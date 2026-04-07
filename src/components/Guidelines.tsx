import { useState } from "react";

const languages = [
  { key: "en", label: "English" },
  { key: "si", label: "සිංහල" },
  { key: "ta", label: "தமிழ்" },
] as const;

type Lang = (typeof languages)[number]["key"];

const content: Record<Lang, string[]> = {
  en: [
    "All contestants must be employees of the organization.",
    "Each contestant may submit up to 3 high-quality photographs.",
    "Photos must be recent (taken within the last 6 months).",
    "Voting is open to all registered users with a valid NIC.",
    "Each voter may cast one vote per category only.",
    "Any form of vote manipulation will result in disqualification.",
    "The judges' decision is final and binding.",
    "Winners will be announced during the Avurudu celebration event.",
  ],
  si: [
    "සියලුම තරඟකරුවන් ආයතනයේ සේවකයින් විය යුතුය.",
    "එක් තරඟකරුවෙකුට උපරිම ඡායාරූප 3ක් ඉදිරිපත් කළ හැකිය.",
    "ඡායාරූප මෑත කාලීන විය යුතුය (මාස 6ක් ඇතුළත ගත් ඒවා).",
    "වලංගු ජාතික හැඳුනුම්පතක් සහිත සියලුම ලියාපදිංචි පරිශීලකයින්ට ඡන්දය දැමිය හැකිය.",
    "එක් ඡන්දදායකයෙකුට එක් කාණ්ඩයකට එක් ඡන්දයක් පමණක් ලබා දිය හැකිය.",
    "ඡන්ද හැසිරවීමේ ඕනෑම ක්‍රමයක් අයෝග්‍ය කිරීමට හේතු වේ.",
    "විනිශ්චයකරුවන්ගේ තීරණය අවසාන සහ බැඳුනු ය.",
    "ජයග්‍රාහකයින් අවුරුදු සැමරුම් උත්සවයේදී නිවේදනය කෙරේ.",
  ],
  ta: [
    "அனைத்து போட்டியாளர்களும் நிறுவனத்தின் ஊழியர்களாக இருக்க வேண்டும்.",
    "ஒவ்வொரு போட்டியாளரும் அதிகபட்சம் 3 புகைப்படங்களை சமர்ப்பிக்கலாம்.",
    "புகைப்படங்கள் சமீபத்தியதாக இருக்க வேண்டும் (கடந்த 6 மாதங்களுக்குள் எடுக்கப்பட்டவை).",
    "செல்லுபடியாகும் தேசிய அடையாள அட்டை உள்ள அனைத்து பதிவு செய்த பயனர்களுக்கும் வாக்களிக்க முடியும்.",
    "ஒவ்வொரு வாக்காளரும் ஒவ்வொரு பிரிவிற்கும் ஒரு வாக்கு மட்டுமே அளிக்கலாம்.",
    "வாக்கு மோசடியின் எந்த வடிவமும் தகுதி நீக்கத்திற்கு வழிவகுக்கும்.",
    "நடுவர்களின் முடிவு இறுதியானது மற்றும் கட்டுப்படுத்தும்.",
    "வெற்றியாளர்கள் அவுருடு கொண்டாட்ட நிகழ்வின் போது அறிவிக்கப்படுவார்கள்.",
  ],
};

const Guidelines = () => {
  const [lang, setLang] = useState<Lang>("en");
  const isIndic = lang === "si" || lang === "ta";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 space-y-6">
      {/* Title */}
      <h3
        className="text-center text-xl md:text-2xl lg:text-3xl font-heading font-bold gold-text-gradient leading-snug"
        style={{ filter: "drop-shadow(0 0 12px hsl(43 76% 52% / 0.3))" }}
      >
        GUIDELINES / නීතිරීති / வழிகாட்டுதல்கள்
      </h3>

      {/* Language Toggle */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {languages.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-5 py-2 rounded-full text-sm font-body font-semibold transition-all duration-300 ${
              lang === key
                ? "bg-gold/20 text-foreground border border-gold/60 shadow-[0_0_14px_hsl(43_76%_52%/0.35)]"
                : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fading gold divider */}
      <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Content */}
      <ul
        className={`space-y-3 transition-opacity duration-300 ${
          isIndic ? "leading-loose" : "leading-relaxed"
        }`}
      >
        {content[lang].map((item, i) => (
          <li key={`${lang}-${i}`} className="flex items-start gap-3">
            <span className="mt-1 text-gold shrink-0 text-sm">🪷</span>
            <span className={`font-body text-sm md:text-base text-foreground/85 ${isIndic ? "text-base md:text-lg" : ""}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Guidelines;
