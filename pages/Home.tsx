
import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, HelpCircle, Star, Quote, Award, Landmark, Gift, Briefcase, Globe, Cpu, Scale, Shield } from 'lucide-react';
import { SCHEMES } from '../constants';
import { useLanguage } from '../App';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const { lang, t } = useLanguage();

  const visionPillars = [
    { text: t('প্ৰশাসনিক শক্তি', 'Administrative strength'), icon: <Shield className="w-3 h-3" /> },
    { text: t('ব্যৱসায় কৰাৰ সহজ পদ্ধতি', 'Ease of doing business'), icon: <Cpu className="w-3 h-3" /> },
    { text: t('বিক্ৰেতাসকলৰ সন্মান', 'Respect for vendors'), icon: <Scale className="w-3 h-3" /> },
    { text: t('ডিজিটেল সুশাসন', 'Digital governance'), icon: <Globe className="w-3 h-3" /> }
  ];

  const testimonials = [
    {
      name: t("ৰামু কাশ্যপ", "Ramu Kashyap"),
      type: t("ফল বিক্ৰেতা, গুৱাহাটী", "Fruit Vendor, Guwahati"),
      text: t("আগতে দোকানখন কোনোবাই তুলি দিব বুলি ভয় আছিল, কিন্তু এতিয়া মোৰ এই ডিজিটেল কাৰ্ডখনেই মোৰ পৰিচয়।", "Earlier there was fear of eviction, but now my digital card is my identity."),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
      rating: 5
    },
    {
      name: t("সীমা দেৱী", "Seema Devi"),
      type: t("মহিলা উদ্যমী, তেজপুৰ", "Woman Entrepreneur, Tezpur"),
      text: t("কোনো দালাল নোহোৱাকৈয়ে মোৰ পঞ্জীয়ন হৈছিল আৰু এতিয়া মই বেংকৰ পৰা ঋণ লাভ কৰিবলৈ সক্ষম হৈছোঁ।", "My registration was done without any middleman and now I have received a bank loan."),
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
      rating: 5
    }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <section className="relative bg-[#FDFCFB] pt-20 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 z-10">
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="inline-flex items-center space-x-3 bg-orange-50 text-orange-700 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-orange-600 animate-pulse"></span>
                  <span>{t('অসম চৰকাৰৰ পদক্ষেপ', 'Assam Government Initiative')}</span>
                </div>
                <div className="bg-white px-6 py-2.5 rounded-full shadow-md border border-orange-50 flex items-center space-x-4">
                  <p className="text-2xl font-black text-orange-600 leading-none">15 Lakh+</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-tight">{t('সশক্ত ক্ষুদ্ৰ ব্যৱসায়', 'Small Businesses Empowered')}</p>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-10 tracking-tighter">
                {t('সশক্ত ক্ষুদ্ৰ ব্যৱসায়,', 'Empowered Small Business,')} <br />
                <span className="text-orange-600">{t('সশক্ত অসম।', 'Empowered Assam.')}</span>
              </h1>
              
              <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl font-medium opacity-90">
                {t(
                  'মুখ্যমন্ত্ৰী মহোদয়ৰ লক্ষ্যৰ সৈতে সংগতি ৰাখি, ক্ষুদ্ৰ বিক্ৰেতাসকলৰ মৰ্যাদা আৰু সমৃদ্ধিৰ বাবে। আপোনাৰ ডিজিটেল পৰিচয় সৃষ্টি কৰক আৰু চৰকাৰী আঁচনিৰ পোনপটীয়া লাভ লওক।',
                  'In line with the CM\'s vision, for the dignity and prosperity of small vendors. Create your digital identity and get direct benefits of govt schemes.'
                )}
              </p>

              <div className="mb-14">
                <div className="inline-block bg-gray-900/5 px-8 py-5 rounded-[40px] border border-gray-100 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-4 border-b border-orange-100 pb-2">{t('অভিযানৰ নীতিসমূহ', 'Mission Principles')}</p>
                  <div className="flex flex-wrap gap-x-10 gap-y-4">
                    {visionPillars.map((pillar, idx) => (
                      <div key={idx} className="flex items-center space-x-3 group cursor-default">
                        <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                          {pillar.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">
                          {pillar.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-8">
                <button 
                  onClick={onStart}
                  className="group inline-flex items-center justify-center px-12 py-7 bg-orange-600 text-white rounded-[32px] font-black text-2xl shadow-2xl shadow-orange-600/30 hover:bg-orange-700 hover:scale-[1.03] transition-all active:scale-95"
                >
                  {t('পঞ্জীয়ন আৰম্ভ কৰক', 'Start Registration')}
                  <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  className="inline-flex items-center justify-center px-12 py-7 bg-white text-gray-900 rounded-[32px] font-black text-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all shadow-sm"
                >
                  {t('আঁচনিসমূহ চাওক', 'View Schemes')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-16 lg:mt-0 flex justify-center w-full">
              {/* Subtle background elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-amber-500/5 rounded-full blur-3xl -z-10 transform scale-125"></div>
              <div className="absolute -inset-6 border-2 border-dashed border-orange-500/15 rounded-[88px] -z-10 animate-[spin_180s_linear_infinite] hidden sm:block"></div>
              <div className="absolute -inset-12 border border-orange-500/10 rounded-[106px] -z-10 hidden sm:block"></div>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-100/40 rounded-full blur-2xl -z-10"></div>

              <div className="relative z-10 w-full max-w-[400px] lg:max-w-none animate-in slide-in-from-right-16 duration-1000">
                <div className="relative overflow-hidden rounded-[72px] border-[14px] border-white shadow-[0_48px_96px_-24px_rgba(0,0,0,0.18)] aspect-[4/5] bg-gradient-to-br from-orange-500 to-orange-700 group">
                   <img 
                    src="/assam_cm.jpg" 
                    alt="CM Dr. Himanta Biswa Sarma" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-white">
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase opacity-80 mb-3">{t('মাননীয় মুখ্যমন্ত্রী', 'Hon\'ble Chief Minister')}</p>
                    <h3 className="text-4xl font-black tracking-tighter leading-none mb-4">Dr. Himanta Biswa Sarma</h3>
                    <div className="h-1.5 w-20 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                  </div>
                </div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl p-6 px-8 rounded-[36px] shadow-2xl border border-white/60 z-20 flex items-center space-x-6 min-w-[280px]">
                  <div className="w-16 h-16 bg-orange-50 rounded-[22px] flex items-center justify-center border border-orange-100 shadow-sm shrink-0">
                    <Award className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">No. 1</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('বিক্ৰেতা কল্যাণত', 'In Vendor Welfare')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-40 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100 shadow-sm">
              <Landmark className="w-4 h-4" />
              <span>{t('বিত্তীয় সাহায্য আঁচনিসমূহ', 'Financial Assistance Schemes')}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
              {t('অসমৰ বিশেষ আঁচনিসমূহ', 'Special Schemes of Assam')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {SCHEMES.map((scheme) => (
              <div key={scheme.id} className="bg-gray-50/50 p-12 rounded-[64px] border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-orange-100/30 hover:border-orange-100 transition-all duration-500 group">
                <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 border border-gray-50 group-hover:border-orange-500">
                  <Gift className="w-10 h-10 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                  {lang === 'as' ? scheme.titleAs : scheme.title}
                </h3>
                <p className="text-gray-500 leading-relaxed font-medium mb-12 flex-grow text-lg">
                  {lang === 'as' ? scheme.descriptionAs : scheme.description}
                </p>
                <button 
                  onClick={onStart}
                  className="flex items-center text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] hover:translate-x-3 transition-transform"
                >
                  {t('এতিয়াই আবেদন কৰক', 'Apply Now')} <ArrowRight className="ml-3 w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified Testimonials for this change block */}
      <section className="bg-orange-50/30 py-40 px-4">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-20">{t('বিক্ৰেতাসকলৰ বিশ্বাস', 'Vendors Trust')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {testimonials.map((t, idx) => (
                    <div key={idx} className="bg-white p-14 rounded-[64px] shadow-xl border border-gray-50 text-left relative group hover:-translate-y-2 transition-all">
                        <Quote className="absolute top-14 right-14 w-20 h-20 text-orange-50 opacity-50" />
                        <p className="text-2xl text-gray-700 italic font-medium leading-relaxed mb-12 relative z-10">"{t.text}"</p>
                        <div className="flex items-center space-x-6 border-t border-gray-50 pt-10">
                            <div className="w-20 h-20 rounded-[30px] overflow-hidden border-4 border-gray-50 shadow-md">
                                <img src={t.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">{t.name}</h4>
                                <p className="text-xs font-black text-orange-600 uppercase tracking-widest">{t.type}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
