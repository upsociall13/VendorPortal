import React, { useState, createContext, useContext } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { VendorProfile, Language } from './types';
import { generate100Vendors } from './utils/dummyGenerator';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (as: string, en: string, hi?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

// Central set of initial mock vendors in Assam main districts for Municipality Officers database
const INITIAL_VENDORS: VendorProfile[] = [
  {
    id: "ASM-GWH081",
    name: "ৰামু কাশ্যপ (Ramu Kashyap)",
    mobile: "9435012345",
    aadharNumber: "534211008899",
    businessType: "ठेला গাড়ী (Mobile Cart)",
    profession: "ফল বিক্ৰেতা (Fruit Vendor)",
    location: { lat: 26.1859, lng: 91.7478, address: "Fancy Bazar, Guwahati, Kamrup Metro" },
    vendingType: "mobile",
    isVerified: true,
    dob: "12/04/1985",
    activeSchemes: ["PM SVANidhi (Assam First)", "Mukhyamantri Vyapari Suraksha Bima"],
    loanStatus: "approved",
    selfie: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300",
    aadharScan: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300",
    activityHistory: [
      { date: "10 May 2026", action: "DPI Facial and biometric verification succeeded." },
      { date: "11 May 2026", action: "PM SVANidhi Loan Approved (Amount: ₹20,000)" }
    ]
  },
  {
    id: "ASM-TEZ112",
    name: "সীমা দেৱী (Seema Devi)",
    mobile: "9864098765",
    aadharNumber: "453288112233",
    businessType: "ক্ষুদ্ৰ উদ্যোগ (MSME/Small Scale)",
    profession: "বয়ন শিল্পী (Textiles Weaver)",
    location: { lat: 26.6338, lng: 92.7926, address: "Chowk Bazaar, Tezpur, Sonitpur" },
    vendingType: "fixed",
    isVerified: true,
    dob: "25/08/1990",
    activeSchemes: ["Mukhyamantri Atmanirbhar Asom", "SVAYEM Scheme"],
    loanStatus: "under_review",
    selfie: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300",
    aadharScan: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300",
    activityHistory: [
      { date: "15 May 2026", action: "Registered using Digital Public Infrastructure." },
      { date: "16 May 2026", action: "Applied for Mukhyamantri Atmanirbhar Asom." }
    ]
  },
  {
    id: "ASM-JOR409",
    name: "প্ৰণৱ বৰুৱা (Pranab Baruah)",
    mobile: "8876543210",
    aadharNumber: "882311445566",
    businessType: "স্থায়ী দোকান (Fixed Shop)",
    profession: "চাহ আৰু জলপানৰ দোকান (Tea & Snacks Stall)",
    location: { lat: 26.7509, lng: 94.2037, address: "Jorhat Main Road, Jorhat" },
    vendingType: "fixed",
    isVerified: true,
    dob: "15/08/1987",
    activeSchemes: ["Mukhyamantri Vyapari Suraksha Bima"],
    loanStatus: "none",
    selfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
    aadharScan: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300",
    activityHistory: [
      { date: "18 May 2026", action: "DPI Digital Certificate generated." }
    ]
  },
  {
    id: "ASM-GWH304",
    name: "মিনতি দাস (Minati Das)",
    mobile: "7002134567",
    aadharNumber: "772188443311",
    businessType: "ঋতুভিত্তিক বিক্ৰেতা (Seasonal)",
    profession: "ফুল বিক্ৰেতা (Flower Vendor)",
    location: { lat: 26.1844, lng: 91.7516, address: "Dighalipukhuri Road, Guwahati" },
    vendingType: "seasonal",
    isVerified: true,
    dob: "10/11/1993",
    activeSchemes: ["PM SVANidhi (Assam First)"],
    loanStatus: "eligible",
    selfie: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300",
    aadharScan: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300",
    activityHistory: [
      { date: "02 May 2026", action: "Registration submitted." }
    ]
  },
  {
    id: "ASM-DIB523",
    name: "জিতুল গগৈ (Jitul Gogoi)",
    mobile: "9101234567",
    aadharNumber: "331122558800",
    businessType: "ठेলা গাড়ী (Mobile Cart)",
    profession: "বাঁহ-বেতৰ সামগ্ৰী (Bamboo Crafts Seller)",
    location: { lat: 27.4728, lng: 94.9125, address: "Dibrugarh Chowk, Dibrugarh" },
    vendingType: "mobile",
    isVerified: false,
    dob: "05/02/1996",
    activeSchemes: [],
    loanStatus: "none",
    selfie: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300",
    aadharScan: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300&h=300",
    activityHistory: [
      { date: "21 May 2026", action: "Registration submitted, pending Municipality Officer approval." }
    ]
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'registration' | 'dashboard' | 'admin'>('home');
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [lang, setLang] = useState<Language>('as');

  // Shared Vendors Local State Backing
  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    let baseList = INITIAL_VENDORS;
    const saved = localStorage.getItem('state_vendors');
    if (saved) {
      try {
        baseList = JSON.parse(saved);
      } catch (e) {
        console.error("Local storage decode error. Reverting to base register.", e);
      }
    }
    const full100 = generate100Vendors(baseList);
    // Persist immediately if list was newly generated or expanded
    if (full100.length !== baseList.length || !saved) {
      localStorage.setItem('state_vendors', JSON.stringify(full100));
    }
    return full100;
  });

  const updateVendorsList = (updatedList: VendorProfile[]) => {
    setVendors(updatedList);
    localStorage.setItem('state_vendors', JSON.stringify(updatedList));
  };

  const handleStartRegistration = () => setView('registration');

  // On registration completion: update profile dashboard AND append to registry 
  const handleRegistrationComplete = (data: VendorProfile) => {
    setProfile(data);
    const newList = [data, ...vendors];
    updateVendorsList(newList);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = (as: string, en: string, hi?: string) => {
    if (lang === 'as') return as;
    return en;
  };

  const handleNavigate = (targetView: string) => {
    if (targetView === 'dashboard' && !profile) {
      setProfile(vendors[0] || INITIAL_VENDORS[0]);
    }
    setView(targetView as any);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Layout 
        currentView={view} 
        onNavigate={handleNavigate}
      >
        {view === 'home' && <Home onStart={handleStartRegistration} onViewDashboard={() => handleNavigate('admin')} />}
        {view === 'registration' && <Registration onComplete={handleRegistrationComplete} />}
        {view === 'dashboard' && profile && <Dashboard profile={profile} />}
        {view === 'admin' && (
          <AdminDashboard 
            vendors={vendors} 
            setVendors={updateVendorsList} 
            onBackToHome={() => setView('home')} 
          />
        )}
      </Layout>
    </LanguageContext.Provider>
  );
};

export default App;
