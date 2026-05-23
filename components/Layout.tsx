
import React from 'react';
import { ShieldCheck, User, Languages } from 'lucide-react';
import { useLanguage } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-200">
              AS
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">
                {t('ক্ষুদ্ৰ ব্যৱসায় প’ৰ্টেল', 'Small Business Portal')}
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Govt of Assam</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-10 text-sm font-black uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
              {t('মূল পৃষ্ঠা', 'Home')}
            </a>
            <a href="#" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
              {t('আঁচনিসমূহ', 'Schemes')}
            </a>
            <a href="#" className="hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
              {t('সহায়', 'Help')}
            </a>
          </nav>

          <div className="flex items-center space-x-6">
            {/* Language Switcher */}
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-inner">
              <button 
                onClick={() => setLang('as')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'as' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                অসমীয়া
              </button>
              <button 
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'hi' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                English
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-4 py-2.5 rounded-full border border-green-100">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('সুৰক্ষিত', 'Secure')}</span>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-all">
              <User className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-20 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-200 uppercase">Emblem</div>
               <span className="font-black text-xl text-gray-900 tracking-tight">{t('অসম চৰকাৰ', 'Assam Government')}</span>
            </div>
            <p className="text-gray-500 leading-relaxed font-medium">
              {t(
                'সশক্ত ক্ষুদ্ৰ ব্যৱসায়, সশক্ত অসম। এই প’ৰ্টেলটো অসমৰ ক্ষুদ্ৰ আৰু মজলীয়া ব্যৱসায়ীসকলক ডিজিটেল পৰিচয় আৰু চৰকাৰী আঁচনিৰ সুবিধা প্ৰদানৰ বাবে উচৰ্গিত।',
                'Empowered Small Business, Empowered Assam. This portal is dedicated to providing digital identity and government benefits to small and medium businesses of Assam.'
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">{t('যোগাযোগ', 'Contact')}</h3>
              <div className="space-y-2 text-sm text-gray-500 font-medium">
                <p>1800-345-1234</p>
                <p>support@assamvendor.gov.in</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">{t('আইনী', 'Legal')}</h3>
              <div className="space-y-2 text-sm text-gray-500 font-medium">
                <p>{t('গোপনীয়তা নীতি', 'Privacy Policy')}</p>
                <p>{t('নিয়মাৱলী আৰু চৰ্তসমূহ', 'Terms')}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50/50 p-10 rounded-[48px] border border-orange-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
               <ShieldCheck className="w-32 h-32" />
            </div>
            <h4 className="font-black text-orange-900 mb-3 uppercase text-xs tracking-widest">{t('ডিজিটেল সুশাসন', 'Digital Governance')}</h4>
            <p className="text-sm text-orange-800 opacity-80 leading-relaxed font-medium">
              {t(
                'এই প্লেটফৰ্মখন ব্যৱসায় কৰাৰ সহজ পদ্ধতি (Ease of Doing Business) বৃদ্ধিৰ দিশত এক ঐতিহাসিক পদক্ষেপ।',
                'This platform is a historic step towards promoting Ease of Doing Business.'
              )}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} {t('তথ্য আৰু জনসংযোগ বিভাগ, অসম।', 'Dept of Information & Public Relations, Assam.')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
