import { VendorProfile } from '../types';

const ASSAM_FIRST_NAMES = [
  { as: "অনন্যা", en: "Ananya" },
  { as: "বিতোপন", en: "Bitopan" },
  { as: "চয়নিকা", en: "Chayanika" },
  { as: "দীপক", en: "Deepak" },
  { as: "এলিনা", en: "Elina" },
  { as: "গৌৰৱ", en: "Gaurav" },
  { as: "হিমাদ্ৰী", en: "Himadri" },
  { as: "ঈশান", en: "Ishan" },
  { as: "জ্যোতি", en: "Jyoti" },
  { as: "কংকনা", en: "Kangkana" },
  { as: "লক্ষিমী", en: "Lakhimi" },
  { as: "মানৱ", en: "Manab" },
  { as: "নয়ন", en: "Nayan" },
  { as: "পাৰ্থ", en: "Partha" },
  { as: "ৰিণী", en: "Rini" },
  { as: "সুব্ৰত", en: "Subrata" },
  { as: "ত্ৰিদীপ", en: "Tridip" },
  { as: "উৎপল", en: "Utpal" },
  { as: "প্ৰতিমা", en: "Pratima" },
  { as: "সুভাষ", en: "Subhash" },
  { as: "ৰুণজুন", en: "Runjun" },
  { as: "দেৱশ্ৰী", en: "Debashree" },
  { as: "কিশোৰ", en: "Kishore" },
  { as: "মৃদুল", en: "Mridul" },
  { as: "কবিতা", en: "Kabita" },
  { as: "নিলয়", en: "Niloy" },
  { as: "সঞ্জীৱ", en: "Sanjib" },
  { as: "ৰূপৰেখা", en: "Ruprekha" },
  { as: "ধীৰাজ", en: "Dhiraj" },
  { as: "পবিত্ৰ", en: "Pabitra" }
];

const ASSAM_LAST_NAMES = [
  { as: "বৰা", en: "Borah" },
  { as: "গগৈ", en: "Gogoi" },
  { as: "কলিতা", en: "Kalita" },
  { as: "শৰ্মা", en: "Sarma" },
  { as: "শইকীয়া", en: "Saikia" },
  { as: "দাস", en: "Das" },
  { as: "ফুকন", en: "Phukan" },
  { as: "বৰুৱা", en: "Baruah" },
  { as: "ডেকা", en: "Deka" },
  { as: "চৌধুৰী", en: "Choudhury" },
  { as: "মেধি", en: "Medhi" },
  { as: "নাথ", en: "Nath" },
  { as: "বৰ্মন", en: "Barman" },
  { as: "ৰাজখোৱা", en: "Rajkhowa" },
  { as: "তালুকদাৰ", en: "Talukdar" },
  { as: "হাজৰিকা", en: "Hazarika" },
  { as: "দুৱৰা", en: "Duarah" },
  { as: "ভূঞা", en: "Bhuyan" },
  { as: "চেতিয়া", en: "Chetia" },
  { as: "গোস্বামী", en: "Goswami" }
];

const BUSINESS_CATEGORIES = [
  {
    type: "স্থায়ী দোকান (Fixed Shop)",
    vendingType: "fixed" as const,
    professions: [
      "চাহ আৰু জলপানৰ দোকান (Tea & Snacks Stall)",
      "किराना দোকান (Grocery Shop)",
      "ষ্টেচনাৰী দোকান (Stationery shop)",
      "দৰ্জী আৰু কাপোৰ চিলাই (Tailor Shop)",
      "মোবাইল মেৰামতি দোকান (Mobile Repair Stall)"
    ]
  },
  {
    type: "ठेলা গাড়ী (Mobile Cart)",
    vendingType: "mobile" as const,
    professions: [
      "ফল বিক্ৰেতা (Fruit Vendor)",
      "শাক-পাছলি বিক্ৰেতা (Vegetables Seller)",
      "লঘু খাদ্য ঠেলা (Fast Food Cart)",
      "আইচক্ৰীম ঠেলা (Ice Cream Cart)"
    ]
  },
  {
    type: "ঋতুভিত্তিক বিক্ৰেতা (Seasonal)",
    vendingType: "seasonal" as const,
    professions: [
      "ফুল বিক্ৰেতা (Flower Vendor)",
      "ঋতুভিত্তিক ফল বিক্ৰেতা (Seasonal Fruits Seller)",
      "পূজা সামগ্ৰী বিক্ৰেতা (Festival Items Seller)",
      "শীতকালীন কাপোৰ (Winter Clothes Vendor)"
    ]
  },
  {
    type: "ক্ষুদ্ৰ উদ্যোগ (MSME/Small Scale)",
    vendingType: "fixed" as const,
    professions: [
      "বাঁহ-বেতৰ সামগ্ৰী (Bamboo Crafts Seller)",
      "বয়ন শিল্পী (Textiles Weaver)",
      "কুটিৰ উদ্যোগ (Handicrafts Maker)",
      "মৃৎ শিল্পী (Pottery Maker)"
    ]
  }
];

const ASSAM_DISTRICT_LOCATIONS = [
  { district: "Kamrup Metro", coords: { lat: 26.1158, lng: 91.7086 }, places: ["Fancy Bazar, Guwahati, Kamrup Metro", "Paltan Bazar, Guwahati, Kamrup Metro", "Ganeshguri, Guwahati, Kamrup Metro", "Maligaon, Guwahati, Kamrup Metro"] },
  { district: "Sonitpur", coords: { lat: 26.6338, lng: 92.7926 }, places: ["Chowk Bazaar, Tezpur, Sonitpur", "Mission Chariali, Tezpur, Sonitpur", "Dekargaon, Tezpur, Sonitpur"] },
  { district: "Jorhat", coords: { lat: 26.7509, lng: 94.2037 }, places: ["Jorhat Main Road, Jorhat", "Gar-Ali, Jorhat", "Barua Chariali, Jorhat"] },
  { district: "Dibrugarh", coords: { lat: 27.4728, lng: 94.9125 }, places: ["Dibrugarh Chowk, Dibrugarh", "HS Road, Dibrugarh", "Marwari Patty, Dibrugarh"] },
  { district: "Nagaon", coords: { lat: 26.3478, lng: 92.6838 }, places: ["Nagaon Town, Nagaon", "Haiborgaon, Nagaon", "Christianpatty, Nagaon"] },
  { district: "Cachar", coords: { lat: 24.8333, lng: 92.8055 }, places: ["Central Road, Silchar, Cachar", "Sadar Bazar, Silchar, Cachar", "Goldighi Mall Road, Silchar, Cachar"] },
  { district: "Tinsukia", coords: { lat: 27.5002, lng: 95.3524 }, places: ["Daily Bazar, Tinsukia", "GNB Road, Tinsukia", "Makum Road, Tinsukia"] },
  { district: "Sivsagar", coords: { lat: 26.9822, lng: 94.6403 }, places: ["Sivsagar Central, Sivsagar", "Temple Road, Sivsagar", "Asthapit Market, Sivsagar"] }
];

const SCHEMES_POOL = [
  "PM SVANidhi (Assam First)",
  "Mukhyamantri Atmanirbhar Asom",
  "Mukhyamantri Vyapari Suraksha Bima",
  "SVAYEM Scheme"
];

const LOAN_STATUS_POOL: ('eligible' | 'applied' | 'under_review' | 'approved' | 'none')[] = [
  'eligible', 'applied', 'under_review', 'approved', 'none'
];

export function generate100Vendors(existingVendors: VendorProfile[]): VendorProfile[] {
  // Use existing vendors to preserve any manually added registrations
  const baseList = [...existingVendors];
  
  // Create unique set of mobile numbers and aadhar numbers to prevent collisions
  const existingMobiles = new Set(baseList.map(v => v.mobile));
  const existingAadhars = new Set(baseList.map(v => v.aadharNumber));
  const existingIds = new Set(baseList.map(v => v.id));

  // We want exactly 100 vendors
  const neededCount = 100 - baseList.length;

  if (neededCount <= 0) {
    return baseList.slice(0, 100);
  }

  // Seeded random generator helper to maintain stability but dynamic feel
  let seed = 42;
  function random(): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)];
  }

  const avatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300"
  ];

  for (let i = 0; i < neededCount; i++) {
    // 1. Name Generator
    const firstSeed = pickRandom(ASSAM_FIRST_NAMES);
    const lastSeed = pickRandom(ASSAM_LAST_NAMES);
    const name = `${firstSeed.as} ${lastSeed.as} (${firstSeed.en} ${lastSeed.en})`;

    // 2. Identity Unique Keys
    let mobile = "";
    do {
      mobile = "9" + Math.floor(100000000 + random() * 900000000).toString();
    } while (existingMobiles.has(mobile));
    existingMobiles.add(mobile);

    let aadharNumber = "";
    do {
      aadharNumber = Math.floor(100000000000 + random() * 900000000000).toString();
    } while (existingAadhars.has(aadharNumber));
    existingAadhars.add(aadharNumber);

    // 3. District & Location Coords
    const distLoc = pickRandom(ASSAM_DISTRICT_LOCATIONS);
    const address = pickRandom(distLoc.places);
    // Add minor offset so maps are correct
    const lat = distLoc.coords.lat + (random() - 0.5) * 0.04;
    const lng = distLoc.coords.lng + (random() - 0.5) * 0.04;

    // 4. Profession & Category
    const category = pickRandom(BUSINESS_CATEGORIES);
    const profession = pickRandom(category.professions);

    // 5. Short ID e.g., ASM-TEZ382
    const distPrefix = distLoc.district.substring(0, 3).toUpperCase();
    let id = "";
    do {
      id = `ASM-${distPrefix}${Math.floor(100 + random() * 900)}`;
    } while (existingIds.has(id));
    existingIds.add(id);

    // 6. Verification Statuses (80% verified, 20% pending)
    const isVerified = random() < 0.8;

    // DOB
    const birthYear = Math.floor(1975 + random() * 25);
    const birthMonth = Math.floor(1 + random() * 12).toString().padStart(2, '0');
    const birthDay = Math.floor(1 + random() * 28).toString().padStart(2, '0');
    const dob = `${birthDay}/${birthMonth}/${birthYear}`;

    // Loan Status & Schemes (Verified people have schemes)
    let loanStatus: 'eligible' | 'applied' | 'under_review' | 'approved' | 'none' = 'none';
    const activeSchemes: string[] = [];

    if (isVerified) {
      loanStatus = pickRandom(LOAN_STATUS_POOL);
      
      const numSchemes = Math.floor(random() * 3); // 0, 1, or 2 schemes
      const shuffledSchemes = [...SCHEMES_POOL].sort(() => 0.5 - random());
      for (let s = 0; s < numSchemes; s++) {
        activeSchemes.push(shuffledSchemes[s]);
      }
    }

    // Selfie
    const selfie = pickRandom(avatars);
    const aadharScan = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300";

    // History
    const activityHistory = [
      { date: `${Math.floor(1 + random() * 20)} May 2026`, action: "DPI Facial and biometric verification succeeded." }
    ];
    if (loanStatus !== 'none') {
      activityHistory.unshift({
        date: `${Math.floor(21 + random() * 4)} May 2026`,
        action: `Applied for micro-credit line. Status check updated to: ${loanStatus.toUpperCase()}`
      });
    }

    baseList.push({
      id,
      name,
      mobile,
      aadharNumber,
      businessType: category.type,
      profession,
      location: { lat, lng, address },
      vendingType: category.vendingType,
      isVerified,
      dob,
      activeSchemes,
      loanStatus,
      selfie,
      aadharScan,
      activityHistory
    });
  }

  return baseList;
}
