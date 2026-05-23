
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistrationStep, VendorProfile } from '../types';
import { BUSINESS_TYPES } from '../constants';
import { ArrowRight, ArrowLeft, Mic, MapPin, Camera, Loader2, CheckCircle2, ShieldCheck, AlertCircle, User, Fingerprint, Upload, MicOff, RefreshCcw, Circle, Phone, ClipboardList, ScanLine, Settings2, Scan, X, ShieldAlert, Verified, Crosshair, Info, Sparkles, Send, Bot } from 'lucide-react';
import { getVoiceGuidance, verifyVendorIdentity, processSmartFill, performAadharOCR } from '../services/geminiService';
import { useLanguage } from '../App';

interface RegistrationProps {
  onComplete: (profile: VendorProfile) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete }) => {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.AUTH);
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [voiceHint, setVoiceHint] = useState('');
  
  // AI Assistant States
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [profile, setProfile] = useState<Partial<VendorProfile>>({
    name: '',
    businessName: '',
    mobile: '',
    aadharNumber: '',
    businessType: '',
    panCardNumber: '',
    profession: '',
    vendingType: 'fixed',
    location: { lat: 0, lng: 0, address: '' },
    activeSchemes: [],
    loanStatus: 'none',
    activityHistory: []
  });

  const [selfie, setSelfie] = useState<string | null>(null);
  const [aadharScan, setAadharScan] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ name: string; aadharNumber: string; dob: string; source?: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const fetchHint = async () => {
      setError(null);
      const hint = await getVoiceGuidance(step, lang);
      setVoiceHint(hint || '');
    };
    fetchHint();
  }, [step, lang]);

  useEffect(() => {
    if (isCameraActive && activeStream && videoRef.current) {
      videoRef.current.srcObject = activeStream;
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, activeStream]);

  const prevStep = () => {
    if (step === RegistrationStep.PROFILE) {
      setStep(RegistrationStep.AUTH);
    } else if (step === RegistrationStep.VERIFY_IDENTITY) {
      setStep(RegistrationStep.PROFILE);
    }
  };

  const handleAuth = () => {
    setError(null);
    if (mobile.length !== 10) {
      setError(t('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।', 'Please enter a valid 10-digit mobile number.'));
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(RegistrationStep.PROFILE);
    }, 1200);
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setActiveStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      setError(t('कैमरा एक्सेस करने में विफल। कृपया सेटिंग्स में अनुमति दें।', 'Camera access failed. Please allow in settings.'));
      console.error("Camera error:", err);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, width, height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelfie(dataUrl);
          if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            setActiveStream(null);
          }
          setIsCameraActive(false);
          setError(null);
        } catch (e) {
          setError(t('फोटो लेने में त्रुटि हुई।', 'Error capturing photo.'));
        }
      }
    }
  };

  const handleSmartFill = async () => {
    if (!aiInput.trim()) return;
    setIsAiProcessing(true);
    setError(null);
    try {
      const data = await processSmartFill(aiInput, lang);
      if (data) {
        setProfile(prev => ({
          ...prev,
          name: data.name || prev.name,
          aadharNumber: data.aadharNumber || prev.aadharNumber,
          businessType: data.businessType || prev.businessType,
          location: {
            ...prev.location!,
            address: data.address || prev.location?.address || ''
          }
        }));
        setAiInput('');
        setIsAiOpen(false);
        // Visual feedback for success
        const successMessage = t('AI ने आपका विवरण भर दिया है!', 'AI has auto-filled your details!');
        alert(successMessage);
      } else {
        setError(t('क्षमा करें, मैं विवरण नहीं ढूंढ पाया।', 'Sorry, I couldn\'t extract details.'));
      }
    } catch (e) {
      setError(t('AI सहायक अभी व्यस्त है।', 'AI Assistant is currently busy.'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileContent = reader.result as string;
        setAadharScan(fileContent);
        setError(null);
        setIsOcrProcessing(true);
        setOcrResult(null);

        try {
          const res = await performAadharOCR(fileContent);
          if (res && res.success) {
            setOcrResult({
              name: res.name || "",
              aadharNumber: res.aadharNumber || "",
              dob: res.dob || "",
              source: res.source
            });
            // Update the profile state with extracted details
            setProfile(prev => ({
              ...prev,
              name: res.name || prev.name,
              aadharNumber: res.aadharNumber || prev.aadharNumber,
              dob: res.dob || prev.dob || ""
            }));
          } else {
            setError(t('आधाৰ পৰীক্ষণ ব্যৰ্থ হৈছে।', 'Aadhar OCR check failed. Please try again.'));
          }
        } catch (err) {
          console.error("Aadhar OCR parsing failed:", err);
          setError(t('আধাৰৰ পৰা তথ্য উদ্ধাৰ কৰিব নোৱাৰিলে।', 'Could not read details from Aadhar photo.'));
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationDetect = () => {
    setError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile(prev => ({
            ...prev,
            location: {
              ...prev.location!,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: prev.location?.address || t("ফাঁচী বজাৰ, গুৱাহাটী", "Fancy Bazar, Guwahati")
            }
          }));
        },
        () => setError(t('স্থান প্ৰাপ্ত কৰাত ব্যৰ্থ।', 'Location access failed.')),
        { timeout: 5000 }
      );
    }
  };

  const runDPIVerification = async () => {
    if (!selfie || !aadharScan) return;
    setError(null);
    setStep(RegistrationStep.PROCESSING);
    try {
      const result = await verifyVendorIdentity({ ...profile, selfie, aadharScan });
      setTimeout(() => {
        if (result && result.success) {
          const finalProfile: VendorProfile = { 
            name: profile.name || '',
            businessName: profile.businessName || '',
            mobile: mobile,
            aadharNumber: profile.aadharNumber || '',
            businessType: profile.businessType || '',
            panCardNumber: profile.panCardNumber || '',
            profession: profile.profession || '',
            location: profile.location || { lat: 0, lng: 0, address: '' },
            vendingType: profile.vendingType || 'fixed',
            selfie: selfie,
            aadharScan: aadharScan,
            dob: profile.dob,
            isVerified: true,
            id: `ASM-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            activeSchemes: ['PM SVANidhi'],
            loanStatus: 'eligible' as const,
            creditScore: 650,
            activityHistory: [{ 
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), 
              action: 'Registration Completed via DPI Portal' 
            }]
          };
          onComplete(finalProfile);
        } else {
          setError(result?.message || t('সত্যাপন ব্যৰ্থ হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।', 'Verification failed. Please try again.', 'सत्यापन विफल। पुनः प्रयास करें।'));
          setStep(RegistrationStep.VERIFY_IDENTITY);
        }
      }, 3500);
    } catch (err) {
      setError(t('প্ৰণালীৰ আসোঁৱাহ। পিছত চেষ্টা কৰক।', 'System error. Please try again later.', 'सिस्टम त्रुटि। बाद में प्रयास करें।'));
      setStep(RegistrationStep.VERIFY_IDENTITY);
    }
  };

  const steps = [
    { id: RegistrationStep.AUTH, label: t('ম’বাইল', 'Mobile', 'मोबाइल'), icon: Phone },
    { id: RegistrationStep.PROFILE, label: t('ব্যৱসায়িক বিৱৰণ', 'Profile', 'व्यवसाय विवरण'), icon: User },
    { id: RegistrationStep.VERIFY_IDENTITY, label: t('ডিজিটেল চিনাক্তকৰণ', 'Verify', 'डिजिटल पहचान'), icon: ShieldCheck },
    { id: RegistrationStep.PROCESSING, label: t('প্ৰক্ৰিয়াকৰণ', 'Status', 'सत्यापन स्थिति'), icon: Loader2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  const canVerify = selfie !== null && aadharScan !== null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 animate-in fade-in duration-700">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* STUNNING CHROME/MODERN STEPPER WIZARD HEAD */}
      <div className="mb-12 bg-white/70 backdrop-blur-md border border-gray-100 p-6 md:p-8 rounded-[40px] shadow-sm">
        <div className="relative flex items-center justify-between max-w-3xl mx-auto">
          {/* Progress Connector Line behind the steps */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-700 ease-out"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Node Items */}
          {steps.map((s, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isActive = currentStepIndex === idx;
            const StepIcon = s.icon;

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center group">
                <button
                  onClick={() => {
                    // Only allow back navigation up to current maximum progress manually
                    if (isCompleted && s.id !== RegistrationStep.PROCESSING) {
                      setStep(s.id);
                    }
                  }}
                  disabled={!isCompleted || s.id === RegistrationStep.PROCESSING}
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-md ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white hover:scale-105 active:scale-95 cursor-pointer' 
                      : isActive 
                        ? 'bg-orange-600 border-orange-600 text-white ring-4 ring-orange-100 shadow-[0_0_20px_rgba(234,88,12,0.3)]' 
                        : 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title={s.label}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </button>
                
                {/* Responsive label indicator */}
                <div className="absolute top-12 sm:top-16 text-center">
                  <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                    isCompleted ? 'text-green-600 font-bold' : isActive ? 'text-orange-600 font-black' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </p>
                  <span className={`text-[7px] font-bold uppercase tracking-wider block text-gray-400 whitespace-nowrap mt-0.5 ${isActive ? 'text-orange-500/80' : ''}`}>
                    {t(`ধাপ ${idx + 1}`, `Step ${idx + 1}`, `चरण ${idx + 1}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Helper bottom container area inside the stepper box */}
        <div className="mt-12 sm:mt-14 pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3 text-gray-500">
            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-600 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">
              {t(`বৰ্তমান স্থিতি: ভাগ ${currentStepIndex + 1} / ${steps.length}`, `Current: Step ${currentStepIndex + 1} of ${steps.length}`, `वर्तमान चरण: कदम ${currentStepIndex + 1} / ${steps.length}`)}
            </span>
          </div>
          <div className="text-xs bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 font-bold text-gray-500">
            {t('পঞ্জীয়ন সম্পূৰ্ণ কৰিবলৈ ১ মিনিট সময় লাগে', 'Takes ~1 minute to complete registration', 'पंजीकरण पूरा करने में ~1 मिनट लगता है')}
          </div>
        </div>
      </div>

      {/* DOUBLE-COLUMN GRID CONTAINER: LEFT (FORM CARD), RIGHT (AI & INSTRUCTIONS PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE WORKSPACE FORM (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ERROR MESSAGE PANEL */}
          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-[32px] flex items-center space-x-4 text-red-700 animate-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs sm:text-sm font-black leading-tight">{error}</p>
            </div>
          )}

          {/* MAIN WIZARD CARD WRAPPER */}
          <div className="bg-white p-6 sm:p-10 md:p-14 rounded-[48px] shadow-2xl border border-gray-100 min-h-[460px] flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex-grow flex flex-col"
              >
                
                {/* STEP 1: MOBILE AUTHENTICATION */}
                {step === RegistrationStep.AUTH && (
                  <div className="flex-1 space-y-8 sm:space-y-10">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {t('ম’বাইল প্ৰমাণীকৰণ', 'Mobile Authentication', 'मोबाइल प्रमाणीकरण')}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                        {t('পঞ্জীয়ন প্ৰক্ৰিয়া আৰম্ভ কৰিবলৈ আপোনাৰ সক্ৰিয় ম’বাইল নম্বৰ দিয়ক।', 'Provide your active mobile number to start the verification process.', 'पंजीकरण प्रक्रिया शुरू करने के लिए अपना सक्रिय मोबाइल नंबर प्रदान करें।')}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          {t('ম’বাইল নম্বৰ', 'Mobile Number', 'मोबाइल नंबर')}
                        </label>
                        <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl sm:text-2xl">+91</span>
                          <input 
                            type="tel"
                            placeholder="00000 00000"
                            maxLength={10}
                            className="w-full pl-18 sm:pl-20 pr-6 py-5 sm:py-6 bg-gray-50 border-3 border-transparent rounded-[24px] focus:bg-white focus:border-orange-500 transition-all text-xl sm:text-2xl tracking-[0.2em] font-black"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleAuth} 
                        disabled={isVerifying} 
                        className="w-full py-5 sm:py-6 bg-orange-600 text-white rounded-[24px] font-black text-lg sm:text-xl flex items-center justify-center space-x-3 shadow-xl hover:bg-orange-700 transition-all active:scale-95"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <span>{t('অ’টিপি প্ৰাপ্ত কৰক', 'Get OTP', 'OTP प्राप्त करें')}</span> 
                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: BUSINESS PROFILE */}
                {step === RegistrationStep.PROFILE && (
                  <div className="flex-1 space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                          {t('ব্যৱসায়িক বিৱৰণ', 'Business Profile', 'व्यवसाय विवरण')}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                          {t('আপোনাৰ ব্যক্তিগত আৰু ব্যৱসায়িক তথ্যসমূহ দাখিল কৰক।', 'Fill in your personal and business credentials.', 'अपने व्यक्तिगत और व्यावसायिक क्रेडेंशियल भरें।')}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm animate-pulse shrink-0">
                         <Bot className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                          {t('পূৰ্ণ নাম', 'Full Name', 'पूर्ण नाम')}
                        </label>
                        <input 
                          type="text"
                          placeholder={t("পূৰ্ণ নাম", "Full Name", "पूर्ण नाम")}
                          className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-base sm:text-lg shadow-sm"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                          {t('ব্যৱসায়ৰ নাম', 'Business Name', 'व्यवसाय का नाम')}
                        </label>
                        <input 
                          type="text"
                          placeholder={t("ব্যৱসায়ৰ নাম লিখক", "Enter Business Name", "व्यवसाय का नाम दर्ज करें")}
                          className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-base sm:text-lg shadow-sm"
                          value={profile.businessName}
                          onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                          {t('আধাৰ সংখ্যা', 'Aadhaar Number', 'आधार संख्या')}
                        </label>
                        <input 
                          type="tel"
                          placeholder="0000 0000 0000"
                          maxLength={12}
                          className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-base sm:text-lg tracking-[0.1em] shadow-sm"
                          value={profile.aadharNumber}
                          onChange={(e) => setProfile({...profile, aadharNumber: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                            {t('ব্যৱসায়ৰ শ্ৰেণী বাছক', 'Select Business Category', 'व्यवसाय की श्रेणी चुनें')}
                          </label>
                          <select 
                            className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-sm sm:text-base shadow-sm appearance-none cursor-pointer"
                            value={profile.businessType}
                            onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                          >
                            <option value="">{t('বাছনি কৰক', 'Select Category', 'चुनें')}</option>
                            {BUSINESS_TYPES.map(t_type => <option key={t_type.id} value={t_type.label}>{t_type.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                            {t('পেন কাৰ্ড নম্বৰ', 'PAN CARD Number', 'पैन कार्ड नंबर')}
                          </label>
                          <input 
                            type="text"
                            maxLength={10}
                            placeholder="ABCDE1234F"
                            className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-sm sm:text-base font-mono uppercase tracking-wider shadow-sm"
                            value={profile.panCardNumber || ''}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase().slice(0, 10);
                              setProfile({...profile, panCardNumber: val, dob: val});
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                          {t('ব্যৱসায়ৰ প্ৰকাৰ / উপজীৱিকা', 'Profession / Specific Trade (e.g. Tea Vendor, Weaver, Vegetable Seller)', 'पेशा या व्यवसाय (जैसे: चाय की दुकान, बुनकर, सब्जी विक्रेता)')}
                        </label>
                        <input 
                          type="text"
                          placeholder={t("পেশা লিখক (যেনে: শাক-পাচলি বিক্ৰেতা, চাহৰ দোকান)", "Write profession (e.g. Vegetable Seller, Tea Stall)", "पेशा लिखें (जैसे: सब्जी विक्रेता, चाय की दुकान)")}
                          className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] focus:bg-white focus:border-orange-500 transition-all font-bold text-sm sm:text-base shadow-sm"
                          value={profile.profession || ''}
                          onChange={(e) => setProfile({...profile, profession: e.target.value})}
                        />
                        <div className="flex flex-wrap gap-2 mt-2 ml-1">
                          {['ফল বিক্ৰেতা (Fruit Vendor)', 'শাক-পাচli বিক্ৰেতা (Vegetable Seller)', 'চাহ দোকান (Tea Stall)', 'বয়ন শিল্পী (Textiles Weaver)', 'ফাষ্ট ফুড (Fast Food)'].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setProfile({...profile, profession: p})}
                              className={`text-[9px] font-black px-2.5 py-1.5 rounded-full border transition-all ${
                                profile.profession === p
                                  ? 'bg-orange-600 text-white border-orange-600'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200 hover:text-orange-600'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('দোকান বা ব্যৱসায়ৰ ঠিকনা', 'Shop Address', 'दुकान का पता')}</label>
                           <button onClick={handleLocationDetect} className="flex items-center space-x-1.5 text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-all">
                             <MapPin className="w-3 h-3" />
                             <span>{t('জি পি এছ যোগে স্থান পিন কৰক', 'Pin via GPS', 'जीपीएस द्वारा स्थान पिन करें')}</span>
                           </button>
                        </div>
                        <textarea 
                          className="w-full p-4 sm:p-5 bg-gray-50 border-3 border-transparent rounded-[20px] h-20 resize-none font-bold text-sm sm:text-base focus:bg-white focus:border-orange-500 transition-all shadow-sm"
                          placeholder={t("ঠিকনা ইয়াত লিখক", "Enter complete address", "अपना पूरा पता यहाँ लिखें")}
                          value={profile.location?.address}
                          onChange={(e) => setProfile({...profile, location: {...profile.location!, address: e.target.value}})}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if(!profile.name || !profile.businessName || !profile.aadharNumber || profile.aadharNumber.length < 12 || !profile.businessType) {
                          setError(t('অনুগ্ৰহ কৰি ব্যৱসায়ৰ নাম আৰু আটাইকেইটা অপৰিহাৰ্য তথ্য পূৰণ কৰক।', 'Please fill Business Name and all mandatory fields.', 'कृपया व्यवसाय का नाम और सभी अनिवार्य विवरण भरें।'));
                        } else {
                          setError(null);
                          setStep(RegistrationStep.VERIFY_IDENTITY);
                        }
                      }}
                      className="w-full py-5 sm:py-6 bg-orange-600 text-white rounded-[24px] font-black text-lg transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-xl hover:bg-orange-700"
                    >
                      <span>{t('সত্যপনৰ বাবে আগবাঢ়ক', 'Proceed to Verify', 'सत्यापन के लिए आगे बढ़ें')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* STEP 3: DIGITAL IDENTITY CAPTURE AND OCR */}
                {step === RegistrationStep.VERIFY_IDENTITY && (
                  <div className="flex-1 space-y-6 sm:space-y-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {t('ডিজিটেল পৰিচয়', 'Digital Identity', 'डिजिटल पहचान')}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                        {t('বায়’মেট্ৰিক আৰু আধাৰ কাৰ্ড পৰীক্ষণ সমাপ্ত কৰক।', 'Complete biometric and Aadhaar card real-time verification.', 'बायोमेट्रिक और आधार कार्ड रीयल-टाइम सत्यापन पूरा करें।')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                          {t('১. লাইভ চেলফি লওক', '1. Capture Live Selfie', '1. लाइव सेल्फी लें')}
                        </p>
                        <div className="relative aspect-square sm:aspect-video md:aspect-square bg-gray-950 rounded-[32px] overflow-hidden shadow-md border-4 border-white">
                          {!isCameraActive && !selfie ? (
                            <button onClick={startCamera} className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-4 hover:bg-gray-900 transition-colors">
                              <Camera className="w-10 h-10" />
                              <span className="font-black text-[9px] sm:text-xs uppercase tracking-[0.25em]">{t('কেমেৰা অন কৰক', 'Enable Camera', 'कैमरा शुरू करें')}</span>
                            </button>
                          ) : selfie ? (
                            <div className="relative w-full h-full group">
                              <img src={selfie} className="w-full h-full object-cover" alt="Selfie" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="w-16 h-16 text-white" />
                              </div>
                              <button onClick={() => {setSelfie(null); startCamera();}} className="absolute bottom-4 right-4 bg-orange-600 p-3 rounded-full text-white shadow-lg hover:bg-orange-700 transition-all">
                                <RefreshCcw className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                              <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none flex items-center justify-center">
                                 <div className="w-32 h-32 border-2 border-white/30 rounded-full border-dashed animate-pulse"></div>
                              </div>
                              <button onClick={captureSelfie} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-full border-4 border-white flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                  <Camera className="w-5 h-5 text-orange-600" />
                                </div>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                          {t('২. আধাৰ কাৰ্ডৰ ফ’টো', '2. Aadhar Card Photo', '2. आधार कार्ड फोटो')}
                        </p>
                        <label className={`relative aspect-square md:aspect-square border-4 border-dashed rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all ${aadharScan ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-orange-300'}`}>
                          <input type="file" accept="image/*" className="hidden" onChange={handleAadharUpload} />
                          {aadharScan ? (
                            <div className="flex flex-col items-center space-y-2">
                              <CheckCircle2 className="w-8 h-8 text-green-500" />
                              <span className="font-black text-green-700 uppercase text-[9px] tracking-widest">{t('ফ’টো আপলোড হ’ল', 'Photo Uploaded', 'फोटो अपलोड हो गई')}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 mb-2 text-gray-300" />
                              <span className="font-black text-gray-400 uppercase text-[9px] tracking-widest">{t('ফাইল বাছক', 'Choose File', 'फ़ाइल चुनें')}</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* OCR Results Display */}
                    {isOcrProcessing && (
                      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center space-x-3 animate-pulse">
                        <Loader2 className="w-5 h-5 text-orange-600 animate-spin shrink-0" />
                        <div>
                          <p className="text-xs font-black text-orange-900 uppercase tracking-wider">{t('এআই স্কেনিং চলি আছে...', 'AI OCR Scanning active...', 'एआई स्कैनिंग चल रही है...')}</p>
                          <p className="text-[9px] sm:text-[10px] text-orange-600 font-bold">{t('আধাৰখনৰ পৰা নাম, নম্বৰ আৰু জন্মৰ তাৰিখ চিনাক্ত কৰা হৈছে', 'Identifying details from Aadhaar image...', 'आधार से नाम, नंबर और जन्म तिथि निकाली जा रही है...')}</p>
                        </div>
                      </div>
                    )}

                    {ocrResult && (
                      <div className="p-4 bg-green-50/60 rounded-2xl border border-green-100 space-y-2.5 animate-in slide-in-from-top-2">
                        <div className="flex items-center space-x-2 text-green-800">
                          <Sparkles className="w-4 h-4 text-green-600" />
                          <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider">{t('এআই আধাৰ স্কেন সফল হৈছে', 'AI Aadhaar OCR Successful', 'एआई आधार स्कैन सफल रहा')}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs bg-white/85 p-3 rounded-xl shadow-sm border border-green-50 text-gray-700 font-medium font-bold">
                          <div>
                            <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">{t('নাম', 'Full Name', 'नाम')}</span>
                            <span className="text-gray-900 font-extrabold">{ocrResult.name || t('উপলব্ধ নাই', 'Not Detected', 'पहचान नहीं हुई')}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase text-gray-450 block tracking-wider">{t('আধাৰ সংখ্যা', 'Aadhaar Number', 'आधार संख्या')}</span>
                            <span className="text-gray-900 font-mono tracking-wider font-extrabold">
                              {ocrResult.aadharNumber ? ocrResult.aadharNumber.replace(/(\d{4})/g, '$1 ').trim() : t('উপলব্ধ নাই', 'Not Detected', 'पहचान नहीं हुई')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase text-gray-450 block tracking-wider">{t('জন্মৰ তাৰিখ', 'Date of Birth', 'जन्म तिथि')}</span>
                            <span className="text-gray-900 font-extrabold">{ocrResult.dob || t('উপলব্ধ নাই', 'Not Detected', 'पहचान नहीं हुई')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-3">
                      <button 
                        onClick={runDPIVerification}
                        disabled={!canVerify}
                        className={`w-full py-5 bg-gradient-to-r from-orange-600 to-red-650 text-white rounded-[24px] font-black text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all duration-300 ${!canVerify ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:opacity-90 hover:scale-[1.01]'}`}
                      >
                        <span>{t('সত্যপন কৰক আৰু কিউআৰ লাভ কৰক', 'Verify & Get QR', 'सत्यापित करें और क्यूआर प्राप्त करें')}</span>
                        <Fingerprint className="w-6 h-6 animate-pulse" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PROCESSING SCREEN */}
                {step === RegistrationStep.PROCESSING && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-6">
                    <div className="relative">
                      <div className="w-36 h-36 border-4 border-orange-50 rounded-[48px] animate-pulse shadow-inner"></div>
                      <div className="absolute inset-0 w-36 h-36 border-4 border-orange-600 border-t-transparent rounded-[48px] animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[40px]">
                        {selfie && <img src={selfie} className="w-full h-full object-cover opacity-30 grayscale" alt="Biometric Processing" />}
                        <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px]"></div>
                        <div className="absolute inset-x-0 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] animate-facial-scan"></div>
                        <ScanLine className="w-12 h-12 text-orange-600 relative z-10 opacity-60" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none animate-bounce">
                        {t('পৰিচয় পৰীক্ষক কৰি থকা হৈছে...', 'Verifying Identity...', 'पहचान की जाँच की जा रही है...')}
                      </h2>
                      <p className="text-gray-500 font-medium text-xs sm:text-sm italic">
                        "{t('আধাৰ আৰু বায়’মেট্ৰিক মিল কৰা হৈছে', 'Matching Aadhaar with Biometric data', 'आधार और बायोमेट्रिक्स का मिलान किया जा रहा है')}"
                      </p>
                    </div>
                  </div>
                )}

                {/* BACK BUTTON */}
                {step !== RegistrationStep.AUTH && step !== RegistrationStep.PROCESSING && (
                  <button onClick={prevStep} className="mt-8 self-start inline-flex items-center text-gray-450 font-black text-[10px] uppercase tracking-[0.3em] hover:text-orange-600 transition-all group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t('উভতি যাওক', 'Go Back', 'वापस जाएं')}
                  </button>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: SMART SAVVY INSTRUCTION/AI PANELS (4 cols on lg, sticky on desktop) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* AI ASSISTANT DIALOG / SARATHI AI */}
          <div className="bg-orange-50 p-6 sm:p-8 rounded-[40px] border border-orange-100 shadow-sm relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-200/15 rounded-full blur-xl"></div>
            
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm relative shrink-0">
                <div className="absolute inset-0 bg-orange-600/10 rounded-2xl animate-ping"></div>
                <Sparkles className="w-5 h-5 text-orange-600 relative z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-orange-850 uppercase font-black tracking-widest opacity-60">
                  {t('সাৰথি এআই সহায়ক', 'Sarathi AI Assistant', 'सारथी AI सहायक')}
                </p>
                <h4 className="text-sm font-bold text-orange-900">
                  {t('এআই ভইচ গাইডেন্স', 'Voice Assistance Active', 'आवाज सहायता सक्रिय')}
                </h4>
              </div>
            </div>

            <p className="text-sm font-bold text-orange-950 leading-relaxed italic mt-4 border-l-2 border-orange-200 pl-3">
              "{voiceHint || t('로드 হৈ আছে...', 'Loading...', 'लोड हो रहा है...')}"
            </p>

            {/* AI Assistant Expand Toggle (shows in Step 2: Profile) */}
            {step === RegistrationStep.PROFILE && (
              <div className="mt-5 space-y-3">
                <button 
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-2xl py-3.5 px-4 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  {isAiOpen ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>{t('বন্ধ কৰক', 'Close Speech Assistant', 'सहायक बंद करें')}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{t('স্মাৰ্ট ফিল ব্যৱহাৰ কৰক (এআই)', 'Use Smart Fill (AI)', 'स्मार्ट फिल का उपयोग करें')}</span>
                    </>
                  )}
                </button>
                
                {isAiOpen && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSmartFill()}
                        placeholder={t('যেনে: "মোৰ নাম ৰাহুল..."', 'E.g. "My name is Rahul..."', 'जैसे: "मेरा नाम राहुल है..."')}
                        className="w-full pl-4 pr-11 py-3 text-xs bg-white border border-orange-200 rounded-xl focus:border-orange-500 transition-all font-medium text-gray-800"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isAiProcessing ? (
                          <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                        ) : (
                          <button onClick={handleSmartFill} className="text-orange-600 hover:scale-110 transition-transform">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[8px] font-black text-orange-750 uppercase tracking-widest pl-1 leading-snug">
                      {t('আপোনাৰ বিৱৰণ কোৱক বা লিখক, এআইয়ে পূৰণ কৰিব', 'Speak or type details, AI will fill them', 'अपना विवरण बोलें या लिखें, AI उसे भर देगा')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* HELP COMPANION TIPS */}
          <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center mb-1">
              <Info className="w-4 h-4 text-orange-500 mr-2" />
              {t('সহায় মন কৰিবলগীয়া দিশ', 'Quick Help Instructions', 'त्वरित निर्देश')}
            </h4>
            <div className="space-y-3.5 text-xs font-semibold text-gray-600">
              <div className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                <p>{t('আপোনাৰ মোবাইল নম্বৰটো আধাৰৰ সৈতে সংযোগ হোৱাটো দৰকাৰী।', 'Make sure your mobile number is linkable/accessible.', 'सुनिश्चित करें कि आपका मोबाइल नंबर आधार से जुड़ा हो।')}</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                <p>{t('লাইভ চেলফি লওঁতে পৰিষ্কাৰ পোহৰ থকা স্থান লৈ যাওক।', 'Ensure decent lighting for capturing biometrics clearly.', 'बायोमेट्रिक्स को स्पष्ट रूप से लेने के लिए अच्छी रोशनी सुनिश्चित करें।')}</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                <p>{t('আধাৰখনৰ ফটো অ’ছিআৰ প্ৰযুক্তি দ্বাৰা নিজেই চিনাক্ত কৰিব।', 'OCR automatically matches & parses Aadhaar cards details.', 'OCR स्वचालित रूप से आधार कार्ड के विवरणों को पार्स करता है।')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes facial-scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-facial-scan {
          position: absolute;
          animation: facial-scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Registration;
