
import React, { useState, useRef, useEffect } from 'react';
import { VendorProfile, Scheme } from '../types';
import { SCHEMES } from '../constants';
import VendorCard from '../components/VendorCard';
import { 
  Download, 
  Share2, 
  CreditCard, 
  Gift, 
  Landmark, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  TrendingUp, 
  Scan, 
  X, 
  Camera, 
  ShieldAlert,
  Fingerprint,
  Verified,
  Star,
  Quote,
  PlayCircle,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../App';

interface DashboardProps {
  profile: VendorProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const { lang, t } = useLanguage();
  const [bankConsent, setBankConsent] = useState(false);
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [appliedSchemes, setAppliedSchemes] = useState<string[]>([]);
  const [checkingOffers, setCheckingOffers] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVerifyingScan, setIsVerifyingScan] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localProfile, setLocalProfile] = useState<VendorProfile>(profile);

  const downloadIDCard = (prof: VendorProfile) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1200);

    // Draw Rounded corner base shadow/clip
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, 800, 1200, 60);
    ctx.clip();

    // Saffron background header
    const grad = ctx.createLinearGradient(0, 0, 800, 400);
    grad.addColorStop(0, '#E65100');
    grad.addColorStop(0.5, '#F57C00');
    grad.addColorStop(1, '#FF9800');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 384);

    // Header circle overlays
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(800, 0, 320, 0, Math.PI * 2);
    ctx.fill();

    // Top texts
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText('DIGITAL VYAPARI', 80, 100);

    ctx.font = '900 44px "Inter", sans-serif';
    ctx.fillText('IDENTITY CARD', 80, 220);

    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('GOVERNMENT OF ASSAM', 80, 275);

    // Verified Stamp
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(700, 180, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 48px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 700, 196);
    ctx.textAlign = 'left';

    ctx.restore();

    // Draw Avatar base
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.roundRect(80, 300, 240, 240, 42);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(90, 310, 220, 220, 32);
    ctx.clip();
    ctx.fillStyle = '#FFF7ED';
    ctx.fillRect(90, 310, 220, 220);
    
    // Draw beautiful geometric character
    ctx.fillStyle = '#FFEDD5';
    ctx.beginPath();
    ctx.arc(200, 400, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(200, 375, 52, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(200, 520, 85, 85, 0, Math.PI, 0);
    ctx.fill();
    ctx.restore();

    // Verified badge pill
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.roundRect(420, 460, 280, 60, 30);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED SMALL BUSINESS', 560, 498);
    ctx.textAlign = 'left';

    // Text content
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 48px "Inter", sans-serif';
    ctx.fillText(prof.name || 'Small Business', 80, 640);

    ctx.fillStyle = '#EA580C';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText((prof.businessType || 'Assam Small Business').toUpperCase(), 80, 690);

    // Separator line
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 750);
    ctx.lineTo(720, 750);
    ctx.stroke();

    // Details Grid
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('REGISTRATION UID', 80, 800);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`ASM-${prof.aadharNumber?.slice(-4) || '8291'}`, 80, 840);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('MOBILE NUMBER', 400, 800);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`+91 ${prof.mobile || 'XXXXXX'}`, 400, 840);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('DATE OF ISSUE', 80, 910);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText('2026-05-21', 80, 950);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('AUTHORITY STATE', 400, 910);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText('Govt of Assam', 400, 950);

    // QR Code
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(80, 1020, 120, 120);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(100, 1040, 80, 80);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(115, 1055, 50, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(125, 1065, 30, 30);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(135, 1075, 10, 10);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(170, 1020, 30, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(175, 1025, 20, 20);
    ctx.fillRect(80, 1110, 30, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(85, 1115, 20, 20);

    // Footer terms
    ctx.fillStyle = '#64748B';
    ctx.font = 'normal 15px "Inter", sans-serif';
    ctx.fillText('This official identity card guarantees direct access to Assam state welfare benefits', 228, 1070);
    ctx.fillText('and enables swift micro-credit disbursement from registered financial partner portals.', 228, 1100);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Assam_Small_Business_ID_${prof.name || 'Merchant'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleApplyScheme = (schemeId: string) => {
    setApplyingFor(schemeId);
    setTimeout(() => {
      setAppliedSchemes(prev => [...prev, schemeId]);
      const schemeTitle = SCHEMES.find(s => s.id === schemeId)?.title || schemeId;
      setLocalProfile(prev => ({
        ...prev,
        activeSchemes: Array.from(new Set([...(prev.activeSchemes || []), schemeTitle])),
        loanStatus: schemeId === 'svanidhi' ? 'applied' : prev.loanStatus,
        activityHistory: [
          { date: 'Just Now', action: `Applied for ${schemeTitle}` },
          ...(prev.activityHistory || [])
        ]
      }));
      setApplyingFor(null);
    }, 2000);
  };

  const handleCheckOffers = () => {
    setCheckingOffers(true);
    setTimeout(() => {
      setCheckingOffers(false);
      setLocalProfile(prev => ({
        ...prev,
        loanStatus: 'under_review',
        activityHistory: [
          { date: 'Just Now', action: 'Credit Review Started' },
          ...(prev.activityHistory || [])
        ]
      }));
      alert(t('অপোনাক অভিনন্দন! আপুনি ₹৫০,০০০ লৈকে ঋণ লাভৰ যোগ্যতা অৰ্জন কৰিছে।', 'Congratulations! You are eligible for a credit up to ₹50,000.'));
    }, 3000);
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert(t("কেমেৰা অন কৰিবলৈ অসমৰ্থ।", "Unable to access camera."));
      setIsScannerOpen(false);
    }
  };

  const closeScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScannerOpen(false);
    setIsVerifyingScan(false);
    setScanResult(null);
  };

  const simulateScan = () => {
    setIsVerifyingScan(true);
    setTimeout(() => {
      setIsVerifyingScan(false);
      setScanResult('success');
    }, 2500);
  };

  const toggleExpandScheme = (id: string) => {
    setExpandedSchemeId(prev => prev === id ? null : id);
  };

  const loanStatus = localProfile.loanStatus || 'none';

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: ID Card & Quick Actions */}
        <div className="lg:col-span-4 space-y-10">
          <div className="sticky top-24 space-y-10">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('আপোনাৰ ডিজিটেল কাৰ্ড', 'Your Digital ID')}</h2>
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                 <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>

            <VendorCard profile={localProfile} />
            
            <div className="grid grid-cols-2 gap-5">
              <button 
                onClick={() => downloadIDCard(localProfile)}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-600 transition-all duration-500">
                  <Download className="w-7 h-7 text-orange-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{t('ডাউনলোড', 'Download ID')}</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t('শ্বেয়াৰিং লিংক কপি কৰা হৈছে।', 'Sharing link copied to clipboard.'));
                }}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                  <Share2 className="w-7 h-7 text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{t('শ্বেয়াৰ কৰক', 'Share Card')}</span>
              </button>
            </div>

            {/* Official Verification Feature Section */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-[40px] border border-green-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <ShieldCheck className="w-20 h-20" />
               </div>
               <div className="flex items-center space-x-3 mb-4">
                 <ShieldCheck className="w-6 h-6 text-green-600" />
                 <h3 className="font-black text-green-900 uppercase text-xs tracking-widest">{t('আঞ্চলিক সত্যতা প্ৰমাণ', 'Official Verification')}</h3>
               </div>
               <p className="text-xs text-green-800 opacity-80 leading-relaxed font-medium mb-6">
                 {t('এই কাৰ্ডখন অসম চৰকাৰৰ উদ্যোগ মন্ত্ৰণালয়ৰ নীতি অনুসৰি স্বীকৃত আৰু বৈধ।', 'This card is recognized and valid under the guidelines deigned by the Govt of Assam.')}
               </p>
               <button 
                onClick={startScanner}
                className="w-full py-4 bg-green-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95"
               >
                 <Scan className="w-4 h-4" />
                 <span>{t('বিষয়া সত্যতা পৰীক্ষা', 'Official Scan')}</span>
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Schemes & Banking */}
        <div className="lg:col-span-8 space-y-16">
          <div className="relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-500 rounded-full hidden md:block"></div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">{t(`নমস্কাৰ, ${profile.name}!`, `Welcome, ${profile.name}!`)}</h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
              {t('ক্ষুদ্ৰ ব্যৱসায় সশক্তিকৰণ আঁচনিৰ ডেশ্বব’ৰ্ডত আপোনাক আদৰণি জনাইছোঁ। আপোনাৰ ক্ষুদ্ৰ উদ্যোগৰ সৰ্বাংগীণ বৃদ্ধিৰ বাবে সকলো চৰকাৰী সুবিধা উপলব্ধ কৰা হৈছে।', 'Welcome to the Assam Small Business Empowerment Dashboard. All government facilities for your micro-enterprise growth are available here.')}
            </p>
          </div>

          {/* Redesigned Dashboard Stats / Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/20 p-8 rounded-[40px] border border-green-100/80 flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.15em] leading-none mb-1.5">{t('পৰিচয় স্থিতি', 'Identity Status')}</p>
                <p className="text-[16px] md:text-lg font-black text-gray-900 leading-none">{t('প্ৰমাণিত ব্যৱসায়', 'Verified Merchant')}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50/20 p-8 rounded-[40px] border border-orange-100/80 flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-200">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-700 uppercase tracking-[0.15em] leading-none mb-1.5">{t('সক্ৰিয় আঁচনি', 'Active Benefits')}</p>
                <p className="text-[16px] md:text-lg font-black text-gray-900 leading-none">{localProfile.activeSchemes?.length || 0} {t('আঁচনি সক্ৰিয়', 'Applied')}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/20 p-8 rounded-[40px] border border-blue-100/80 flex items-center space-x-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                <Landmark className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.15em] leading-none mb-1.5">{t('ঋণ স্থিতি', 'Credit pre-approval')}</p>
                <p className="text-[16px] md:text-lg font-black text-gray-900 leading-none">{loanStatus === 'applied' ? t('পৰীক্ষাধীন', 'Review Mode') : t('₹৫০,০০০ অনুমোদিত', '₹50,000 Pre-App')}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Special Schemes Discovery Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                <Gift className="w-8 h-8 mr-4 text-orange-500" />
                {t('আপোনাৰ বাবে উপযোগী আঁচনিসমূহ', 'Special Schemes for You')}
              </h2>
              <button className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-[0.2em] border-b-2 border-orange-200 pb-1">{t('সকলো চাওক', 'View All')}</button>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {SCHEMES.slice(0, 4).map((scheme) => {
                const isApplied = appliedSchemes.includes(scheme.id) || localProfile.activeSchemes?.some(s => s === scheme.title);
                const isExpanded = expandedSchemeId === scheme.id;
                
                return (
                  <div 
                    key={scheme.id} 
                    className={`bg-white rounded-[56px] border border-gray-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-orange-200/10 transition-all duration-500 overflow-hidden flex flex-col group relative ${isExpanded ? 'ring-2 ring-orange-100' : ''}`}
                  >
                    <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-start md:items-center space-x-8 flex-1">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] shrink-0 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100">
                          <TrendingUp className="w-9 h-9" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-black text-gray-900 asomiya leading-tight">{lang === 'as' ? scheme.titleAs : scheme.title}</h3>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isApplied ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                              {isApplied ? 'Active' : 'Eligible'}
                            </div>
                          </div>
                          <p className="text-gray-500 leading-relaxed font-medium italic">"{lang === 'as' ? scheme.descriptionAs : scheme.description}"</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 shrink-0">
                        <button 
                          onClick={() => toggleExpandScheme(scheme.id)}
                          className="flex items-center space-x-2 px-6 py-4 bg-gray-50 text-gray-700 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:text-orange-700 transition-all"
                        >
                          <span>{isExpanded ? t('সংকোচন কৰক', 'Hide Details') : t('বিৱৰণ চাওক', 'View Details')}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {isApplied ? (
                          <div className="px-8 py-4 bg-green-50 text-green-700 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-3 border-2 border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('আবেদন কৰা হ’ল', 'Applied')}</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleApplyScheme(scheme.id)}
                            disabled={!!applyingFor}
                            className="px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 active:scale-95 shadow-xl shadow-gray-900/10"
                          >
                            {applyingFor === scheme.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{t('এতিয়াই আবেদন কৰক', 'Apply')}</span> <ArrowRight className="w-4 h-4" /></>}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 border-t border-gray-50' : 'max-h-0 opacity-0'} overflow-hidden bg-gray-50/30`}>
                       <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-orange-600">
                               <Info className="w-5 h-5" />
                               <h4 className="text-[11px] font-black uppercase tracking-widest">{t('যোগ্যতাৰ চৰ্তসমূহ', 'Eligibility Criteria')}</h4>
                            </div>
                            <p className="text-gray-700 font-medium leading-relaxed">{lang === 'as' ? scheme.eligibilityAs : scheme.eligibility}</p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-blue-600">
                               <FileText className="w-5 h-5" />
                               <h4 className="text-[11px] font-black uppercase tracking-widest">{t('প্ৰয়োজনীয় নথি-পত্ৰ', 'Required Documents')}</h4>
                            </div>
                            <ul className="space-y-2">
                               {(lang === 'as' ? scheme.documentsAs : scheme.documents).map((doc, i) => (
                                 <li key={i} className="flex items-center space-x-2 text-gray-700 font-medium font-sans">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                    <span>{doc}</span>
                                 </li>
                               ))}
                            </ul>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-red-600">
                               <CalendarDays className="w-5 h-5" />
                               <h4 className="text-[11px] font-black uppercase tracking-widest">{t('আবেদনৰ শেষ সময়সীমা', 'Application Deadline')}</h4>
                            </div>
                            <div className="inline-block px-5 py-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
                               <span className="text-lg font-black tracking-tight">{lang === 'as' ? scheme.deadlineAs : scheme.deadline}</span>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="p-12 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 rounded-[64px] text-white overflow-hidden relative shadow-[0_40px_80px_-12px_rgba(30,58,138,0.3)] border-4 border-white/5">
            <div className="relative z-10 space-y-10">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-2xl border border-white/20 shadow-2xl">
                   <Landmark className="w-10 h-10 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-1">{t('वित्तीय समावेशन', 'Financial Inclusion')}</h2>
                  <p className="text-blue-200 text-lg font-medium opacity-80">{t('बिना गारंटी के ऋण सुविधा', 'Collateral-free Loan Facility')}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div 
                  className="flex items-start space-x-6 bg-white/5 p-8 rounded-[40px] border border-white/10 group cursor-pointer hover:bg-white/[0.08] transition-all" 
                  onClick={() => setBankConsent(!bankConsent)}
                >
                   <div className="pt-1">
                      <div className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${bankConsent ? 'bg-orange-500 border-orange-500' : 'border-white/30 bg-white/5'}`}>
                        {bankConsent && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                   </div>
                   <label className="text-base text-blue-50 leading-relaxed font-medium cursor-pointer hindi">
                     {t('मैं अपनी जानकारी बैंकों के साथ साझा करने की सहमति देता हूँ।', 'I consent to sharing my information with banks for loan offers.')}
                   </label>
                </div>
                <button 
                  onClick={handleCheckOffers}
                  disabled={!bankConsent || checkingOffers}
                  className="w-full py-6 bg-white text-indigo-950 rounded-[32px] font-black text-xl hover:bg-blue-50 transition-all disabled:opacity-30 shadow-2xl shadow-black/20 flex items-center justify-center space-x-4 active:scale-[0.98]"
                >
                  {checkingOffers ? <Loader2 className="w-7 h-7 animate-spin" /> : <><span>{t('बैंक ऑफर्स की जाँच करें', 'Check Bank Offers')}</span> <ArrowRight className="w-6 h-6" /></>}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Official Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-2xl bg-white rounded-[56px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
            <div className="bg-[#121212] p-8 flex justify-between items-center text-white shrink-0">
               <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Official DPI Scanner</h3>
                   <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Municipal Authority Portal</p>
                 </div>
               </div>
               <button onClick={closeScanner} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-10 flex flex-col items-center space-y-10 overflow-y-auto">
               <div className="relative aspect-square w-full max-w-sm bg-gray-950 rounded-[48px] overflow-hidden border-8 border-white shadow-inner flex items-center justify-center group">
                 {!scanResult ? (
                   <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-65" />
                    
                    {/* High-Tech HUD Viewfinder Overlay */}
                    <div className="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between select-none z-10">
                      {/* Modern Corner brackets */}
                      <div className="absolute top-6 left-6 w-8 h-8 border-t-[4px] border-l-[4px] border-green-500 rounded-tl-xl opacity-90 filter drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                      <div className="absolute top-6 right-6 w-8 h-8 border-t-[4px] border-r-[4px] border-green-500 rounded-tr-xl opacity-90 filter drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[4px] border-l-[4px] border-green-500 rounded-bl-xl opacity-90 filter drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[4px] border-r-[4px] border-green-500 rounded-br-xl opacity-90 filter drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>

                      {/* Concentric targets & grid lines */}
                      <div className="absolute inset-14 border border-green-500/10 rounded-[36px] flex items-center justify-center">
                        <div className="w-10 h-px bg-green-500/30"></div>
                        <div className="h-10 w-px bg-green-500/30"></div>
                        <div className="absolute w-28 h-28 border border-green-500/15 rounded-full animate-[pulse_2.5s_infinite]"></div>
                        <div className="absolute w-14 h-14 border border-green-500/25 border-dashed rounded-full animate-[spin_15s_linear_infinite]"></div>
                      </div>

                      {/* Header signals */}
                      <div className="flex justify-between items-center w-full z-20">
                        <span className="text-[9px] font-mono font-black tracking-widest text-green-400 bg-green-950/65 px-2.5 py-1 rounded-lg border border-green-500/20 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                          DPI_LINK_OK
                        </span>
                        <span className="text-[9px] font-mono font-black tracking-widest text-red-400 bg-red-950/65 px-2.5 py-1 rounded-lg border border-red-500/20 uppercase flex items-center animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
                          SCANNING
                        </span>
                      </div>

                      {/* Footer tracking telemetry */}
                      <div className="flex justify-between items-center w-full mt-auto z-20 text-[8px] font-mono font-bold tracking-widest text-green-400/40">
                        <span>FPS 60 // RAW.YUV</span>
                        <span>RES.1080P // AUTO</span>
                      </div>
                    </div>

                    {/* Smooth laser line & holographic sweeping cone */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                      <div className="absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-green-500/[0.04] to-green-500/[0.22] border-b-[3px] border-green-400 shadow-[0_4px_15px_rgba(74,222,128,0.5)] animate-scan-holographic top-0"></div>
                    </div>
                   </>
                 ) : (
                   <div className="w-full h-full bg-green-50 flex flex-col items-center justify-center text-center p-12 space-y-6">
                      <Verified className="w-20 h-20 text-green-600 animate-bounce" />
                      <h4 className="text-3xl font-black text-green-900 tracking-tight uppercase">{t('प्रमाणित विक्रेता', 'Verified Vendor')}</h4>
                      <button onClick={() => setScanResult(null)} className="text-xs font-black text-green-700 uppercase tracking-widest border-b-2 border-green-200 pb-1">{t('पुनः स्कैन करें', 'Scan Another')}</button>
                   </div>
                 )}
               </div>
               {!scanResult && (
                 <button onClick={simulateScan} disabled={isVerifyingScan} className="w-full py-6 bg-gray-900 text-white rounded-[28px] font-black text-lg flex items-center justify-center space-x-4 shadow-xl active:scale-95">
                   {isVerifyingScan ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Camera className="w-6 h-6" /> <span>SCAN VENDOR QR</span> </>}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes scan-holographic {
          0% { transform: translateY(-110%); }
          50% { transform: translateY(310%); }
          100% { transform: translateY(-110%); }
        }
        .animate-scan-holographic {
          animation: scan-holographic 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
