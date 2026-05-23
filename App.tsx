
import React, { useState, createContext, useContext } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import { VendorProfile, Language } from './types';

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

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'registration' | 'dashboard'>('home');
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [lang, setLang] = useState<Language>('as');

  const handleStartRegistration = () => setView('registration');

  const handleRegistrationComplete = (data: VendorProfile) => {
    setProfile(data);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = (as: string, en: string, hi?: string) => {
    if (lang === 'hi') return hi || as;
    if (lang === 'as') return as;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Layout>
        {view === 'home' && <Home onStart={handleStartRegistration} />}
        {view === 'registration' && <Registration onComplete={handleRegistrationComplete} />}
        {view === 'dashboard' && profile && <Dashboard profile={profile} />}
      </Layout>
    </LanguageContext.Provider>
  );
};

export default App;
