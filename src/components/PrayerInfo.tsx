import InfoModal from "@/components/InfoModal";

// Educational reference, following the Diyanet (Hanafî) tradition the timings use.
const PRAYERS = [
  { name: "Sabah (Fajr)", when: "Dawn, before sunrise", rakat: "2 sünnet + 2 farz" },
  { name: "Öğle (Zuhr)", when: "After midday", rakat: "4 sünnet + 4 farz + 2 sünnet" },
  { name: "İkindi (Asr)", when: "Afternoon", rakat: "4 sünnet + 4 farz" },
  { name: "Akşam (Maghrib)", when: "Just after sunset", rakat: "3 farz + 2 sünnet" },
  { name: "Yatsı (Isha)", when: "Night", rakat: "4 sünnet + 4 farz + 2 sünnet + 3 vitir" },
];

const ABDEST = [
  "Make the intention (niyet) to perform wudu.",
  "Wash both hands up to the wrists, three times.",
  "Rinse the mouth three times.",
  "Draw water into the nose and clean it, three times.",
  "Wash the face from forehead to chin, ear to ear, three times.",
  "Wash the right arm to the elbow three times, then the left.",
  "Wipe (mesh) over the head once with wet hands.",
  "Wipe the ears and back of the neck.",
  "Wash the right foot to the ankle three times, then the left.",
];

const PRAYSTEPS = [
  "Stand facing the qibla, make the intention for the specific prayer.",
  "Raise the hands and say “Allāhu Akbar” (opening takbir).",
  "Recite Sûre-i Fâtiha, then a short sûre.",
  "Bow (rükû), saying “Subhâna Rabbiye’l-Azîm” three times.",
  "Stand upright, then prostrate (secde), saying “Subhâna Rabbiye’l-A‘lâ” three times.",
  "Sit briefly, prostrate a second time — that completes one rekât.",
  "Repeat for the required rekâts; in the sitting, read Tahiyyât.",
  "Finish by turning the head right then left, saying “Es-selâmü aleyküm ve rahmetullah.”",
];

export default function PrayerInfo() {
  return (
    <InfoModal label="Prayer — a short guide">
      <p className="text-faded">A simple reference following the Diyanet tradition. Times above are for Güney.</p>

      <h4 className="font-semibold text-olive-deep mt-4 mb-1.5">The five daily prayers</h4>
      <div className="space-y-1.5">
        {PRAYERS.map((p) => (
          <div key={p.name} className="bg-sand/50 rounded-lg px-3 py-2">
            <div className="flex justify-between items-baseline">
              <span className="font-medium">{p.name}</span>
              <span className="text-[11px] text-faded">{p.when}</span>
            </div>
            <p className="text-[12px] text-faded">{p.rakat}</p>
          </div>
        ))}
        <p className="text-[12px] text-faded">Farz are obligatory; sünnet follow the Prophet&apos;s practice; vitir is a nightly prayer. Friday noon adds the congregational Cuma prayer.</p>
      </div>

      <h4 className="font-semibold text-olive-deep mt-4 mb-1.5">Abdest (wudu) — ritual washing</h4>
      <ol className="list-decimal pl-5 space-y-1 text-[13px]">
        {ABDEST.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <p className="text-[12px] text-faded mt-1.5">Abdest is kept until it is broken (e.g. by using the toilet or sleeping), then renewed before prayer.</p>

      <h4 className="font-semibold text-olive-deep mt-4 mb-1.5">How a rekât is prayed</h4>
      <ol className="list-decimal pl-5 space-y-1 text-[13px]">
        {PRAYSTEPS.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </InfoModal>
  );
}
