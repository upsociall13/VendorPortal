
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  QrCode, 
  CheckCircle, 
  ShieldCheck, 
  Landmark, 
  Gift, 
  History, 
  Award, 
  Clock, 
  FileCheck, 
  Shield, 
  Zap,
  Star,
  Sparkles,
  X,
  Fingerprint,
  ExternalLink,
  ChevronDown,
  Activity,
  CreditCard,
  Verified,
  BadgeCheck,
  MousePointer2,
  Scan,
  Camera,
  Loader2,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Target,
  FileText,
  UserCheck,
  Lock,
  Cpu,
  RefreshCcw,
  Maximize2
} from 'lucide-react';
import { VendorProfile } from '../types';
import { useLanguage } from '../App';

interface VendorCardProps {
  profile: VendorProfile;
}

const VendorCard: React.FC<VendorCardProps> = ({ profile }) => {
  const { lang, t } = useLanguage();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVerifyingScan, setIsVerifyingScan] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), 500);
    return () => clearTimeout(timer);
  }, [profile.loanStatus]);

  const toggleQrModal = () => setIsQrModalOpen(!isQrModalOpen);
  
  const activeSchemes = profile.activeSchemes || [];
  const schemeCount = activeSchemes.length;
  const loanStatus = profile.loanStatus || 'none';

  const startScanner = async () => {
    setIsScannerOpen(true);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("কেমেৰা অন কৰিবলৈ অসমৰ্থ। (Unable to access camera.)");
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

  const getLoanStatusDisplay = () => {
    switch (loanStatus) {
      case 'eligible':
        return { text: t('ঋণৰ বাবে যোগ্য (Eligible)', 'Eligible for Loan'), subText: 'Pre-Approved Credit Limit', color: 'text-blue-700', bg: 'bg-blue-50/60', border: 'border-blue-100', indicator: 'bg-blue-500', progress: 30, grade: 'Grade A+' };
      case 'applied':
        return { text: t('আবেদন দাখিল কৰা হৈছে (Applied)', 'Applied'), subText: 'Under Bank Verification', color: 'text-orange-700', bg: 'bg-orange-50/60', border: 'border-orange-100', indicator: 'bg-orange-500', progress: 60, grade: 'Processing' };
      case 'under_review':
        return { text: t('পৰীক্ষাধীন (Review)', 'Review under DPI'), subText: 'Final DPI Validation', color: 'text-amber-700', bg: 'bg-amber-50/60', border: 'border-amber-100', indicator: 'bg-amber-500', progress: 85, grade: 'High Trust' };
      case 'approved':
        return { text: t('ঋণ অনুমোদিত (Approved)', 'Approved'), subText: 'Funds Disbursed', color: 'text-green-700', bg: 'bg-green-50/60', border: 'border-green-100', indicator: 'bg-green-600', progress: 100, grade: 'Verified' };
      default:
        return { text: t('মূল্যায়ন চলি আছে (Evaluation)', 'Evaluation active'), subText: 'System Analysis active', color: 'text-gray-600', bg: 'bg-gray-50/60', border: 'border-gray-100', indicator: 'bg-gray-400', progress: 15, grade: 'N/A' };
    }
  };

  const loanInfo = getLoanStatusDisplay();

  return (
    <>
      <motion.div 
        className="w-full max-w-sm mx-auto bg-white rounded-[64px] shadow-[0_60px_120px_-20px_rgba(249,115,22,0.18)] overflow-hidden border border-gray-100 relative group/card transition-all duration-700 hover:shadow-[0_80px_160px_-25px_rgba(249,115,22,0.25)]"
        animate={{
          y: [0, -10, 0]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.015,
          transition: { duration: 0.4, ease: "easeOut" }
        }}
      >
        
        {/* PASS-STYLE HEADER */}
        <div className="bg-gradient-to-br from-[#E65100] via-[#F57C00] to-[#FF9800] h-48 p-10 flex justify-between items-start text-white relative">
          <div className="absolute top-0 right-0 opacity-[0.15] pointer-events-none translate-x-12 -translate-y-12">
            <Award className="w-56 h-56" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg">
                 <span className="text-xs font-black">AS</span>
              </div>
              <div>
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-90">{t('ডিজিটেল ব্যৱসায়ী', 'Digital Vyapari')}</h2>
                <div className="h-0.5 w-8 bg-white/40 rounded-full"></div>
              </div>
            </div>
            <p className="text-lg font-black uppercase tracking-widest leading-none">{t('পৰিচয় পত্ৰ', 'Identity Card')}</p>
            <p className="text-[9px] opacity-75 uppercase font-black tracking-widest">{t('অসম চৰকাৰ', 'Govt of Assam')}</p>
          </div>
          <ShieldCheck className="w-10 h-10 text-white opacity-40 relative z-10" />
        </div>

        {/* PROFILE FLOATING CIRCLE */}
        <div className="px-10 -mt-20 relative z-20 flex items-end justify-between">
          <div className="w-36 h-36 bg-white rounded-[48px] border-[10px] border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-700 hover:scale-[1.05]">
            {profile.selfie ? (
              <img src={profile.selfie} alt="Vendor" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.mobile}`} alt="Vendor" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="pb-4">
             <div className="bg-green-600 text-white px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-green-200 flex items-center space-x-2 border border-green-500">
                <Verified className="w-3.5 h-3.5" />
                <span>Verified</span>
             </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-10 pt-6 space-y-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">{profile.name}</h3>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{profile.businessType}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('অসম ব্যৱসায়ী পৰিচয়', 'Assam Merchant ID')}</span>
            </div>
          </div>

          {/* LOAN DASHBOARD PREVIEW */}
          <div className={`p-7 rounded-[44px] border transition-all duration-700 ${loanInfo.border} ${loanInfo.bg} shadow-sm`}>
             <div className="flex justify-between items-center mb-5">
               <div className="space-y-0.5">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${loanInfo.color}`}>{loanInfo.text}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{loanInfo.subText}</p>
               </div>
               <div className="bg-white/80 px-3 py-1 rounded-xl text-[9px] font-black border border-white shadow-sm">{loanInfo.grade}</div>
             </div>
             <div className="relative pt-1">
                <div className="w-full bg-gray-200/40 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/50 relative">
                   <motion.div 
                      className={`h-full rounded-full ${loanInfo.indicator} shadow-sm relative`}
                      initial={{ width: '0%' }}
                      animate={{ width: animateProgress ? `${loanInfo.progress}%` : '0%' }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: loanStatus === 'approved' ? 45 : 70, 
                        damping: 14, 
                        mass: 1.1 
                      }}
                   >
                     {/* Smooth animated sheen and pulse effect for successful approved state (reached 100%) */}
                     {loanStatus === 'approved' && animateProgress && (
                       <>
                         <motion.div 
                           className="absolute inset-0 bg-white/40 rounded-full"
                           style={{ originX: 0 }}
                           animate={{ 
                             x: ['-100%', '100%']
                           }}
                           transition={{ 
                             repeat: Infinity, 
                             duration: 2, 
                             ease: 'linear' 
                           }}
                         />
                         <motion.div 
                           className="absolute inset-0 bg-white/30 rounded-full"
                           animate={{ 
                             opacity: [0.2, 0.7, 0.2]
                           }}
                           transition={{ 
                             repeat: Infinity, 
                             duration: 1.5, 
                             ease: 'easeInOut' 
                           }}
                         />
                         <motion.span 
                           className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                           animate={{ scale: [1, 1.8, 1] }}
                           transition={{ repeat: Infinity, duration: 1.5 }}
                         />
                       </>
                     )}
                   </motion.div>
                </div>
             </div>
          </div>

          {/* PROMINENT IDENTITY SECTION (QR + VERIFY BUTTONS) */}
          <div className="bg-gray-50/50 p-6 rounded-[52px] border border-gray-100 flex items-center gap-6 group/id-section">
             {/* PROMINENT QR CODE */}
             <div 
              onClick={toggleQrModal}
              className="w-24 h-24 bg-white rounded-3xl border border-gray-200 shadow-md flex items-center justify-center p-2.5 cursor-pointer group/qr hover:border-orange-500 hover:shadow-orange-200/40 transition-all active:scale-95 shrink-0"
             >
                <div className="relative">
                   <QrCode className="w-14 h-14 text-gray-900 group-hover/qr:text-orange-600 transition-colors" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity">
                      <Maximize2 className="w-5 h-5 text-orange-600" />
                   </div>
                </div>
             </div>

             {/* VERIFICATION BUTTONS & ID */}
             <div className="flex-1 flex flex-col gap-2.5">
                <button 
                  onClick={startScanner}
                  className="w-full py-3.5 bg-gray-950 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-md hover:bg-orange-600 hover:shadow-orange-400/20 transition-all active:scale-95 group/scan-btn"
                >
                  <Scan className="w-3.5 h-3.5 group-hover/scan-btn:rotate-90 transition-transform duration-500" />
                  <span>Officer Scan</span>
                </button>
                <button 
                  onClick={startScanner}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/20 transition-all active:scale-95 group/verify-btn"
                >
                  <ShieldCheck className="w-3.5 h-3.5 group-hover/verify-btn:scale-110 transition-transform duration-500" />
                  <span>Official Verification</span>
                </button>
                <div className="px-3 py-1.5 bg-white/60 rounded-xl border border-gray-100 text-center shadow-sm">
                   <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] mb-0.5">{t('পঞ্জীয়ন ইউআইডি', 'Registry UID')}</p>
                   <p className="text-[11px] font-mono font-black text-gray-900 tracking-widest">ASM-{profile.aadharNumber?.slice(-4) || '8291'}</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* MODAL: FULL QR VIEW */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-white rounded-[72px] p-12 max-w-sm w-full shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 relative">
              <button onClick={toggleQrModal} className="absolute top-10 right-10 text-gray-400 hover:text-gray-950 transition-colors">
                <X className="w-8 h-8" />
              </button>
              <div className="text-center space-y-10">
                 <div className="space-y-3">
                    <div className="inline-flex items-center space-x-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
                       <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                       <span className="text-[9px] font-black text-orange-700 uppercase tracking-widest">Secure Passport QR</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Identity Passport</h3>
                 </div>
                 <div className="aspect-square bg-gray-50 rounded-[56px] flex items-center justify-center p-14 border-4 border-gray-100 shadow-inner group/qr-large">
                    <QrCode className="w-full h-full text-gray-950 group-hover/qr-large:text-orange-600 transition-colors duration-700" />
                 </div>
                 <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <Award className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] mb-2">{t('ব্যৱসায়ী পঞ্জীয়ন ইউআইডি', 'Merchant Registration UID')}</p>
                    <p className="text-2xl font-mono font-black text-white tracking-[0.3em]">ASM-{profile.aadharNumber?.slice(-4)}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: OFFICIAL SCANNER (Officer Use Only) */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/95 backdrop-blur-3xl animate-in fade-in duration-700">
          <div className="relative w-full max-w-xl bg-white rounded-[80px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 flex flex-col max-h-[90vh]">
            <div className="bg-[#121212] p-12 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <div className="absolute top-0 right-0 p-12"><Scan className="w-48 h-48 rotate-12" /></div>
               </div>
               <div className="flex items-center space-x-8 relative z-10">
                 <div className="w-16 h-16 bg-orange-600 rounded-[32px] flex items-center justify-center shadow-2xl border border-orange-500/50">
                    <ShieldCheck className="w-9 h-9" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">DPI Terminal</h3>
                   <p className="text-[11px] text-gray-500 font-black tracking-[0.4em] uppercase">Auth Level 3 • Municipal Registry</p>
                 </div>
               </div>
               <button onClick={closeScanner} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 relative z-10">
                 <X className="w-8 h-8" />
               </button>
            </div>

            <div className="p-14 space-y-12 overflow-y-auto">
               <div className="relative aspect-square bg-gray-950 rounded-[72px] overflow-hidden border-[12px] border-white shadow-2xl flex items-center justify-center">
                 {!scanResult ? (
                   <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       {/* Biometric Scanning Grid */}
                       <div className="w-72 h-72 border-2 border-orange-500/20 rounded-[48px] relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl"></div>
                       </div>
                    </div>
                    <div className="absolute inset-x-0 h-1.5 bg-orange-500/80 shadow-[0_0_40px_rgba(249,115,22,1)] animate-scan-official"></div>
                    
                    {isVerifyingScan && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-white space-y-8">
                        <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
                        <div className="text-center">
                           <p className="text-lg font-black uppercase tracking-[0.4em] animate-pulse">Accessing DPI Vault...</p>
                           <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2">Hash: 0x821..D3F</p>
                        </div>
                      </div>
                    )}
                   </>
                 ) : (
                   <div className="w-full h-full bg-green-50/80 flex flex-col items-center justify-center p-16 text-center space-y-10 animate-in zoom-in-95 duration-700">
                      <div className="w-32 h-32 bg-green-600 rounded-[48px] flex items-center justify-center shadow-2xl text-white animate-bounce border-[6px] border-white">
                        <Verified className="w-16 h-16" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-4xl font-black text-green-950 tracking-tighter leading-none uppercase">Identity Certified</h4>
                        <div className="inline-block px-8 py-3 bg-white rounded-2xl text-[11px] font-black text-green-700 border border-green-100 shadow-sm uppercase tracking-widest">
                           MUNICIPAL AUDIT: PASS
                        </div>
                      </div>
                      <button onClick={() => setScanResult(null)} className="text-base font-black text-green-800 uppercase tracking-[0.3em] border-b-4 border-green-200 pb-2 active:scale-[0.96]">Scan Next Merchant</button>
                   </div>
                 )}
               </div>

               <div className="text-center space-y-10">
                  {!scanResult && (
                    <button 
                      onClick={simulateScan}
                      disabled={isVerifyingScan}
                      className="w-full py-9 bg-gray-950 text-white rounded-[40px] font-black text-2xl flex items-center justify-center space-x-6 shadow-2xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isVerifyingScan ? <Loader2 className="w-10 h-10 animate-spin" /> : <> <Camera className="w-10 h-10" /> <span>INITIATE IDENTITY SCAN</span> </>}
                    </button>
                  )}
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-40">
                     Official State Authority Interface v2.5
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-official {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-official { animation: scan-official 3s linear infinite; }
      `}</style>
    </>
  );
};

export default VendorCard;
