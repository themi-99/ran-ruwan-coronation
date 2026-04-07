import { useState } from "react";

const languages = [
  { key: "en", label: "English" },
  { key: "si", label: "සිංහල" },
  { key: "ta", label: "தமிழ்" },
] as const;

type Lang = (typeof languages)[number]["key"];

const content: Record<Lang, { heading?: string; items: string[] }[]> = {
  en: [
    {
      heading: "Photo Requirements",
      items: [
        "Swarna Kumariya – Traditional attire (photos matching the Avurudu theme): Redda & Hattaya, Osariya, or Tamil traditional saree (Pattu Saree).",
        "Swarna Kumara – Traditional attire (photos matching the Avurudu theme): Sarama & shirt.",
        "Selfies and photos that do not match the theme will NOT be accepted.",
      ],
    },
    {
      heading: "Important Dates",
      items: [
        "Photo uploads: 2026-04-09 to 2026-04-19.",
        "Voting: 2026-04-20 to 2026-04-22 only.",
        "Winners announcement: 2026-04-24 at 10.00 AM via the WEB PORTAL and WhatsApp Group.",
      ],
    },
    {
      heading: "Voting Rules",
      items: [
        "Each person can cast only one vote.",
        "Contestants are NOT allowed to vote for themselves.",
      ],
    },
    {
      heading: "Prizes & Decision",
      items: [
        "Winners selected as Swarna Kumara & Kumariya will receive valuable prizes from the organization.",
        "The winner is determined solely based on the number of votes received through the WEB PORTAL.",
        "Let's make this occasion exciting, entertaining, and successful with your participation!",
      ],
    },
  ],
  si: [
    {
      heading: "ඡායාරූප අවශ්‍යතා",
      items: [
        "ස්වර්ණ කුමරියන් - සාම්ප්‍රදායික (අවුරුදු තේමාවට ගැළපෙන Photo): රෙද්ද හා හැට්ටය, ඔසරිය හෝ දමිළ සාම්ප්‍රදායික සාරිය (පට්ටි සාරී).",
        "ස්වර්ණ කුමරුන් - සම්ප්‍රදායික (අවුරුදු තේමාවට ගැළපෙන Photo): සරම හා කමිසය.",
        "Selfie සහ තේමාවට ගැළපෙන නොවන පින්තූර පිළිගනු නොලැබේ.",
      ],
    },
    {
      heading: "වැදගත් දින",
      items: [
        "පින්තූර upload කිරීම: 2026-04-09 සිට 2026-04-19 දක්වා.",
        "ජන්දය ලබාදිම: 2026-04-20 සිට 2026-04-22 දක්වා පමණි.",
        "ජයග්‍රාහකයින් ප්‍රකාශයට පත් කිරීම: 2026-04-24 දින පෙ.ව. 10.00 ට WEB PORTAL එක හා WhatsApp Group හරහා සිදු කෙරේ.",
      ],
    },
    {
      heading: "ඡන්දය භාවිතා කිරීමේ රීති",
      items: [
        "එක් අයෙකුට එක් ජන්දයක් (VOTE) පමණක් ලබා දිය හැක.",
        "තරඟ කරුවන්ට තමන්ටම ඡන්දය ලබා දීමට අවසර නොමැත.",
      ],
    },
    {
      heading: "ත්‍යාග සහ තීරණය",
      items: [
        "ස්වර්ණ කුමරා හා කුමරිය ලෙස තේරී පත්වන ජයග්‍රාහකයින්ට ආයතනය මගින් වටිනා ත්‍යාගයන් පිරිනමනු ඇත.",
        "ජයග්‍රහණය තීරණය වන්නේ WEB PORTAL එක හරහා ලැබෙන ඡන්ද ප්‍රමාණය මත පමණි.",
        "ඔබගේ සහභාගීත්වයෙන් මෙම අවස්ථාව උද්යෝගී, විනෝදජනක සහ සාර්ථක එකක් කරමු!",
      ],
    },
  ],
  ta: [
    {
      heading: "புகைப்படத் தேவைகள்",
      items: [
        "ஸ்வர்ண குமரியர் (Swarna Kumariya) - பாரம்பரிய உடை (சித்திரை புத்தாண்டு கருப்பொருளுக்கு ஏற்ற புகைப்படங்கள்): சிங்கள கலாசார உடை அல்லது தமிழ் கலாசார உடை (பட்டு சேலை).",
        "ஸ்வர்ண குமரா - பாரம்பரிய ஆடை (புத்தாண்டு கருப்பொருளுக்குப் பொருந்தும் புகைப்படம்): பாரம்பரிய சாரம் மற்றும் சட்டை.",
        "Selfie மற்றும் கருப்பொருளுக்குப் பொருத்தமற்ற புகைப்படங்கள் ஏற்றுக்கொள்ளப்படமாட்டாது.",
      ],
    },
    {
      heading: "முக்கிய திகதிகள்",
      items: [
        "புகைப்படங்களைப் பதிவேற்றுதல்: 2026-04-09 முதல் 2026-04-19 வரை.",
        "வாக்களித்தல்: 2026-04-20 முதல் 2026-04-22 வரை மாத்திரம்.",
        "வெற்றியாளர்களை அறிவித்தல்: 2026-04-24 மு.ப. 10.00 மணிக்கு இணையத்தளம் மற்றும் வாட்ஸ்அப் (WhatsApp) குழு ஊடாக வெளியிடப்படும்.",
      ],
    },
    {
      heading: "வாக்களிக்கும் விதிகள்",
      items: [
        "ஒவ்வொரு நபரும் ஒரே ஒரு வாக்கு மட்டுமே அளிக்க முடியும்.",
        "போட்டியாளர்கள் தமக்கே வாக்களிக்க அனுமதியில்லை.",
      ],
    },
    {
      heading: "பரிசுகள் மற்றும் முடிவு",
      items: [
        "புத்தாண்டு இளவரசன் மற்றும் இளவரசியாகத் தெரிவு செய்யப்படும் வெற்றியாளர்களுக்கு நிறுவனத்தினால் பெறுமதிமிக்க பரிசில்கள் வழங்கப்படும்.",
        "வெற்றியானது WEB PORTAL ஊடாகக் கிடைக்கும் வாக்குகளின் எண்ணிக்கையின் அடிப்படையில் மாத்திரம் தீர்மானிக்கப்படும்.",
        "உங்கள் பங்களிப்புடன் இந்நிகழ்வை உற்சாகமான, மகிழ்ச்சியான மற்றும் வெற்றிகரமான ஒன்றாக மாற்றுவோம்!",
      ],
    },
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
