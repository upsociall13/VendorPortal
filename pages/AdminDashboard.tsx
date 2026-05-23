import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VendorProfile } from '../types';
import { 
  ShieldCheck, Search, Filter, Ban, CheckCircle2, UserCheck, Eye, 
  Download, FileSpreadsheet, Loader2, LogOut, Lock, MapPin, Phone, 
  Layers, ShoppingBag, Truck, Calendar, Store, ArrowLeft, Trash2,
  RefreshCw, Award, Activity, FileCheck, Check, X, AlertOctagon, HelpCircle, Clock,
  Sparkles, TrendingUp, Coins, Users2, Map, Globe, Fingerprint, Share2, AlertTriangle, LineChart, Compass, Zap, QrCode
} from 'lucide-react';
import { useLanguage } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { RealTimeMap } from '../components/RealTimeMap';

const DISTRICTS = [
  { id: 'Kamrup Metro', name: 'Kamrup Metro', nameAs: 'কামৰূপ মহানগৰ', nameHi: 'कामरूप मेट्रो' },
  { id: 'Sonitpur', name: 'Sonitpur', nameAs: 'শোণিতপুৰ', nameHi: 'सोनितपुर' },
  { id: 'Jorhat', name: 'Jorhat', nameAs: 'যোৰহাট', nameHi: 'जोरहाट' },
  { id: 'Dibrugarh', name: 'Dibrugarh', nameAs: 'ডিব্ৰুগড়', nameHi: 'डिब्रूगढ़' },
  { id: 'Nagaon', name: 'Nagaon', nameAs: 'নগাঁও', nameHi: 'नगांव' },
  { id: 'Cachar', name: 'Cachar', nameAs: 'কাছাৰ', nameHi: 'काछार' },
  { id: 'Tinsukia', name: 'Tinsukia', nameAs: 'তিনিচুকীয়া', nameHi: 'तिनसुकिया' },
  { id: 'Sivsagar', name: 'Sivsagar', nameAs: 'শিৱসাগৰ', nameHi: 'शिवसागर' }
];

interface AdminDashboardProps {
  vendors: VendorProfile[];
  setVendors: (vendors: VendorProfile[]) => void;
  onBackToHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ vendors, setVendors, onBackToHome }) => {
  const { t, lang } = useLanguage();
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Command Center Navigation & Intelligence States
  const [activeTab, setActiveTab] = useState<'economic' | 'audit' | 'compliance' | 'citizen'>('economic');
  const [selectedHeatmapDistrict, setSelectedHeatmapDistrict] = useState<string>('Kamrup Metro');
  const [complianceScanLoading, setComplianceScanLoading] = useState(false);
  const [activeQRVendorId, setActiveQRVendorId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, verified, pending
  const [auditFilter, setAuditFilter] = useState<'all' | 'pending'>('all');
  
  // Detail Modal inspection
  const [activeInspectorVendor, setActiveInspectorVendor] = useState<VendorProfile | null>(null);
  
  // Action state trackers
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [economicViewMode, setEconomicViewMode] = useState<'heatmap' | 'gis'>('gis');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Handle Administrative Access Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    setTimeout(() => {
      if (username.trim().toLowerCase() === 'officer' && passcode === '1234') {
        setIsAuthenticated(true);
        showToast(t('প্ৰশাসনিক লগইন সফল হৈছে!', 'Administrative Login Successful!', 'प्रशासनिक लॉगिन सफल!'), 'success');
      } else {
        setAuthError(t('ভুল ব্যৱহাৰকাৰী নাম বা পিন কোড!', 'Invalid Username or Pin Code!', 'अमान्य उपयोगकर्ता नाम या पिन कोड!'));
      }
      setIsAuthLoading(false);
    }, 1000);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle Verification status of a street vendor
  const handleToggleVerification = (vendorId: string) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) {
        const nextVerified = !v.isVerified;
        const newHistory = [
          {
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            action: nextVerified 
              ? 'Approved & Verified manually by Municipality Officer' 
              : 'Registration Put On Hold/Suspended by Municipality Officer'
          },
          ...(v.activityHistory || [])
        ];
        
        // Show notification
        showToast(
          nextVerified 
            ? `${v.name || 'Vendor'} is now Verified and Certificate is Active!`
            : `${v.name || 'Vendor'} verification status is put on hold.`,
          nextVerified ? 'success' : 'info'
        );

        return { 
          ...v, 
          isVerified: nextVerified,
          activityHistory: newHistory,
          // Grant schemes pre-approval on verification if appropriate
          loanStatus: nextVerified && v.loanStatus === 'none' ? 'eligible' : v.loanStatus
        };
      }
      return v;
    });
    setVendors(updated);
    
    // Also update current inspected modal if open
    if (activeInspectorVendor && activeInspectorVendor.id === vendorId) {
      setActiveInspectorVendor(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          isVerified: !prev.isVerified,
          loanStatus: !prev.isVerified && prev.loanStatus === 'none' ? 'eligible' : prev.loanStatus
        };
      });
    }
  };

  // Approve a vendor loan scheme application
  const handleApproveScheme = (vendorId: string, schemeName: string) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) {
        showToast(`Loan Application for: ${schemeName} approved!`, 'success');
        return {
          ...v,
          loanStatus: 'approved' as const,
          activityHistory: [
            {
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              action: `Approved applied Scheme: ${schemeName} by Officer.`
            },
            ...(v.activityHistory || [])
          ]
        };
      }
      return v;
    });
    setVendors(updated);
    if (activeInspectorVendor && activeInspectorVendor.id === vendorId) {
      setActiveInspectorVendor(prev => prev ? { ...prev, loanStatus: 'approved' } : null);
    }
  };

  // Reject/Hold scheme application
  const handleHoldScheme = (vendorId: string, schemeName: string) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) {
        showToast(`Scheme Application for: ${schemeName} set Under Review.`, 'info');
        return {
          ...v,
          loanStatus: 'under_review' as const,
          activityHistory: [
            {
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              action: `Eligibility review triggered for scheme: ${schemeName}.`
            },
            ...(v.activityHistory || [])
          ]
        };
      }
      return v;
    });
    setVendors(updated);
    if (activeInspectorVendor && activeInspectorVendor.id === vendorId) {
      setActiveInspectorVendor(prev => prev ? { ...prev, loanStatus: 'under_review' } : null);
    }
  };

  // Delete/De-register vendor records (municipality control)
  const handleDeleteVendor = (vendorId: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the central registry?`)) {
      const updated = vendors.filter(v => v.id !== vendorId);
      setVendors(updated);
      showToast(`${name} removed successfully.`, 'error');
      if (activeInspectorVendor && activeInspectorVendor.id === vendorId) {
        setActiveInspectorVendor(null);
      }
    }
  };

  // Run Export Simulation
  const handleExportSpreadsheet = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast(t('পৰ্টেলৰ তথ্যসমুহ এক্সেল শ্বীট হিচাপে ডাউনলোড কৰা হ’ল!', 'Vendor Directory Spreadsheet exported successfully!', 'विक्रेताओं की एक्सेल शीट सफलतापूर्वक निर्यात की गई!'), 'success');
    }, 2000);
  };

  // Filter vendors based on active selections
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mobile.includes(searchTerm);
    
    // Check if business type matches category label or id
    const categoryQuery = selectedCategory.toLowerCase();
    const matchesCategory = selectedCategory === '' || v.businessType.toLowerCase().includes(categoryQuery);

    const matchesStatus = 
      selectedStatus === 'all' ||
      (selectedStatus === 'verified' && v.isVerified) ||
      (selectedStatus === 'pending' && !v.isVerified);

    const matchesDistrict = 
      selectedDistrict === '' || 
      (v.location?.address || '').toLowerCase().includes(selectedDistrict.toLowerCase()) ||
      (selectedDistrict === 'Kamrup Metro' && (v.location?.address || '').toLowerCase().includes('guwahati'));

    return matchesSearch && matchesCategory && matchesStatus && matchesDistrict;
  });

  // Category distributions & counters
  const totalCount = vendors.length;
  const verifiedCount = vendors.filter(v => v.isVerified).length;
  const pendingCount = totalCount - verifiedCount;
  
  const mobileCartCount = vendors.filter(v => v.businessType.includes('ঠেলা গাড়ী') || v.businessType.includes('Mobile') || v.vendingType === 'mobile').length;
  const fixedShopCount = vendors.filter(v => v.businessType.includes('স্থায়ী') || v.businessType.includes('Fixed') || v.vendingType === 'fixed').length;
  const seasonalCount = vendors.filter(v => v.businessType.includes('ঋতুভিত্তিক') || v.businessType.includes('Seasonal') || v.vendingType === 'seasonal').length;
  const msmeCount = vendors.filter(v => v.businessType.includes('ক্ষুদ্ৰ') || v.businessType.includes('MSME')).length;

  // -- Strategic Econ Pulse Calculations --
  // Let's compute average monthly transacting economics:
  // Fixed Shop: ₹45,000, Mobile Cart: ₹28,000, Seasonal: ₹15,000, MSME: ₹95,000
  const estimatedMonthlyEconomicActivity = (fixedShopCount * 45000) + (mobileCartCount * 28000) + (seasonalCount * 15000) + (msmeCount * 95000);
  const estimatedLivelihoodsSupported = Math.round((fixedShopCount * 2.2) + (mobileCartCount * 1.2) + (seasonalCount * 1.1) + (msmeCount * 4.5));

  // Count women owned dynamically by key female name seeds from dummyGenerator
  const womenOwnedCount = vendors.filter(v => 
    v.name.includes("অনন্যা") || v.name.includes("চয়নিকা") || v.name.includes("এলিনা") ||
    v.name.includes("হিমাদ্ৰী") || v.name.includes("জ্যোতি") || v.name.includes("কংকনা") ||
    v.name.includes("লক্ষিমী") || v.name.includes("ৰিণী") || v.name.includes("ৰুণজুন") ||
    v.name.includes("দেৱশ্ৰী") || v.name.includes("কবিতা") || v.name.includes("ৰূপৰেখা") ||
    v.name.toLowerCase().includes("ananya") || v.name.toLowerCase().includes("chayanika") ||
    v.name.toLowerCase().includes("elina") || v.name.toLowerCase().includes("himadri") ||
    v.name.toLowerCase().includes("lakhimi") || v.name.toLowerCase().includes("kabita") ||
    v.name.toLowerCase().includes("ruprekha")
  ).length;

  // Credit Facilitation (Approved microloans: ₹20,000; In Review: ₹10,000; Eligible: ₹5,000)
  const creditEnabledAmount = vendors.reduce((acc, v) => {
    if (v.loanStatus === 'approved') return acc + 20000;
    if (v.loanStatus === 'applied' || v.loanStatus === 'under_review') return acc + 10000;
    if (v.loanStatus === 'eligible') return acc + 5000;
    return acc;
  }, 0) + (verifiedCount * 10000); // SVANidhi leverage base

  // Tourism and handicraft active participants
  const tourismImpactCount = vendors.filter(v => 
    v.profession.includes("কুটিৰ") || v.profession.includes("কাৰু") || v.profession.includes("বাঁহ") ||
    v.profession.includes("ফুল") || v.profession.includes("বয়ন") ||
    v.profession.toLowerCase().includes("bamboo") || v.profession.toLowerCase().includes("handicraft") ||
    v.profession.toLowerCase().includes("textiles") || v.profession.toLowerCase().includes("flower") ||
    v.location.address.includes("Tezpur") || v.location.address.includes("Sivsagar") ||
    v.location.address.includes("Guwahati")
  ).length;

  // Calculable district statistics
  const getSubmissionsByDistrict = (distId: string) => {
    return vendors.filter(v => 
      (v.location?.address || '').toLowerCase().includes(distId.toLowerCase()) ||
      (distId === 'Kamrup Metro' && (v.location?.address || '').toLowerCase().includes('guwahati'))
    ).length;
  };

  // Find topmost active district leader
  let leaderDistrictName = "Kamrup Metro";
  let maxCount = 0;
  DISTRICTS.forEach(d => {
    const c = getSubmissionsByDistrict(d.id);
    if (c > maxCount) {
      maxCount = c;
      leaderDistrictName = d.name;
    }
  });

  const chartData = [
    {
      name: t('স্থায়ী দোকান', 'Fixed Shop', 'स्थायी दुकान'),
      count: fixedShopCount,
      color: '#3B82F6',
    },
    {
      name: t('ঠেলা গাড়ী', 'Mobile Cart', 'ठेला गाड़ी'),
      count: mobileCartCount,
      color: '#F97316',
    },
    {
      name: t('ঋতুভিত্তিক', 'Seasonal', 'ऋतुतांत्रिक'),
      count: seasonalCount,
      color: '#A855F7',
    },
    {
      name: t('ক্ষুদ্ৰ ব্যৱসায়', 'MSME', 'लघु व्यवसाय'),
      count: msmeCount,
      color: '#10B981',
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10 px-4 md:px-8 relative">
      
      {/* Dynamic Action Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-24 right-6 z-50 p-5 px-8 rounded-3xl shadow-xl flex items-center space-x-3 border ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-600 animate-bounce" />}
            {notification.type === 'error' && <Ban className="w-6 h-6 text-red-600 animate-pulse" />}
            {notification.type === 'info' && <Activity className="w-6 h-6 text-blue-600" />}
            <span className="font-extrabold text-sm md:text-base">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN VIEW IF NOT AUTHENTICATED */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto my-12 md:my-20">
          <div className="text-center mb-8">
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('মূল পৃষ্ঠালৈ', 'Back to Home', 'मुख्य पृष्ठ पर')}
            </button>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
              {t('পৌৰ বিষয়া প’ৰ্টেল', 'Municipality Officer Portal', 'नगरपालिका अधिकारी पोर्टल')}
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {t('অসম চৰকাৰৰ প্ৰশাসনিক প্ৰৱেশ', 'Assam Government Administrative Access', 'असम सरकार प्रशासनिक पहुंच')}
            </p>
          </div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 md:p-10 rounded-[48px] shadow-2xl shadow-gray-200/60 border border-gray-100"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8 border border-orange-100">
              <Lock className="w-8 h-8" />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  {t('ব্যৱহাৰকাৰীৰ নাম', 'Officer Username', 'अधिकारी उपयोगकर्ता नाम')}
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. officer"
                  className="w-full p-4.5 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 font-bold text-gray-900 transition-all shadow-sm outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  {t('প্ৰৱেশ পিন কোড', 'Administrative Passcode PIN', 'प्रवेश पिन कोड')}
                </label>
                <input 
                  type="password"
                  required
                  placeholder="e.g. 1234"
                  className="w-full p-4.5 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 font-bold tracking-[0.3em] text-lg text-gray-900 transition-all shadow-sm outline-none"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>

              {authError && (
                <div className="p-4 bg-red-50 text-red-800 text-xs font-black uppercase tracking-wider rounded-2xl border border-red-100 flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* DEMO ACCREDITATIONS PILL IN LOGIN SCREEN */}
              <div className="p-4.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-blue-700 font-mono">
                  🔑 PREVIEW LOGIN CREDENTIALS
                </p>
                <p className="text-xs text-blue-800 font-bold font-mono">
                  Username: <span className="bg-white p-0.5 px-1.5 rounded-md border border-blue-200">officer</span>
                </p>
                <p className="text-xs text-blue-800 font-bold font-mono">
                  PIN Passcode: <span className="bg-white p-0.5 px-1.5 rounded-md border border-blue-200">1234</span>
                </p>
              </div>

              <button 
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {isAuthLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{t('সুৰক্ষিতভাৱে প্ৰৱেশ কৰক', 'Deploy Portal Credentials', 'सुरक्षित रूप से प्रवेश करें')}</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        /* MAIN AUTHENTICATED ADMINISTRATOR BOARD */
        <div className="max-w-7xl mx-auto space-y-10">
          {/* ASSAM DIGITAL ECONOMIC PULSE HIGHLIGHT MARQUEE */}
          <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-amber-950 text-white rounded-[32px] p-5.5 shadow-xl border border-amber-900/30 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 text-amber-500 shrink-0">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">Assam DECOS Pulse</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[8px] font-bold font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 uppercase tracking-widest">LIVE DIGITAL FLOW</span>
                  </div>
                  <h3 className="text-sm font-black text-white/90 tracking-tight mt-0.5">
                    {t('অসম ক্ষুদ্ৰ অৰ্থনীতি ডিজিটেল কমাণ্ড চেন্টাৰ', 'Central Public Ledger Monitoring & Economic Evaluation Gateway', 'असम डिजिटल आर्थिक कमान केंद्र')}
                  </h3>
                </div>
              </div>
              
              <div className="flex-grow max-w-2xl bg-black/35 rounded-2xl p-3 border border-gray-800/60 overflow-hidden">
                <div className="whitespace-nowrap animation-marquee flex items-center space-x-12 text-xs font-mono font-bold text-gray-300">
                  <span className="flex items-center space-x-2 text-amber-400">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong>100 B2C Nodes</strong> registered state-wide</span>
                  </span>
                  <span className="flex items-center space-x-2 text-green-400">
                    <Coins className="w-3.5 h-3.5 text-green-500" />
                    <span>Est. Annual Local GDP Flow: <strong>₹{((estimatedMonthlyEconomicActivity * 12) / 10000000).toFixed(2)} Cr</strong></span>
                  </span>
                  <span className="flex items-center space-x-2 text-blue-400">
                    <Users2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Livelihoods Sustained: <strong>{estimatedLivelihoodsSupported.toLocaleString()} workers</strong></span>
                  </span>
                  <span className="flex items-center space-x-2 text-purple-400">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Women-owned leadership: <strong>{womenOwnedCount} Nodes</strong></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/60">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button 
                  onClick={onBackToHome}
                  className="p-2 sm:px-4 bg-white hover:bg-gray-100 border border-gray-200/80 rounded-xl text-gray-500 hover:text-gray-900 transition-colors flex items-center space-x-2 text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('মূল পৃষ্ঠা', 'Home')}</span>
                </button>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 uppercase tracking-widest leading-none">
                  STATE_ECONOMY_GOVERNOR_NODE_ACTIVE
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                {t('অসম ডিজিটেল অৰ্থনৈতিক কাৰ্য্যপ্ৰণালী', 'Assam Digital Economic Operating System (DECOS)', 'असम डिजिटल आर्थिक कमान केंद्र')}
              </h1>
              <p className="text-gray-500 font-extrabold text-xs md:text-sm mt-1.5 uppercase tracking-wide">
                💼 {t('CM Office Economic Monitoring Desk • Informal Economy Digitization Infrastructure', "Chief Minister's Office Economic Monitoring Core Desk • National-Level Governance Blueprint")}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportSpreadsheet}
                disabled={isExporting}
                className="px-5 py-3.5 bg-white hover:bg-gray-950 hover:text-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 shrink-0 shadow-sm cursor-pointer"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? t('ৰপ্তানি হৈ আছে...', 'Exporting...') : t('তথ্যাৱলী ৰপ্তানি কৰক', 'Export Ledger (CSV)')}</span>
              </button>
            </div>
          </div>

          {/* CONTROL SWITCHBOARD TABS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-100/60 p-2 rounded-3xl border border-gray-200/40">
            <button
              onClick={() => setActiveTab('economic')}
              className={`py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#2E4053] transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'economic' 
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' 
                  : 'text-gray-655 hover:text-gray-900 hover:bg-white bg-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{t('অৰ্থনৈতিক প্ৰভাৱ সূচক', 'Economic Command', 'आर्थिक कमान')}</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#2E4053] transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'audit' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-gray-655 hover:text-gray-900 hover:bg-white bg-transparent'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>{t('কাৰ্য্যপ্ৰণালী নিৰীক্ষণ', 'Operational Audit', 'ऑपरेशनल ऑडिट')}</span>
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#2E4053] transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'compliance' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' 
                  : 'text-gray-655 hover:text-gray-900 hover:bg-white bg-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('সংগতি সুৰক্ষা সূচক', 'Identity & Compliance', 'अनुपालन')}</span>
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#2E4053] transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeTab === 'citizen' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                  : 'text-gray-655 hover:text-gray-900 hover:bg-white bg-transparent'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{t('নাগৰিক সেৱা সন্ধান', 'Citizen Service', 'नागरिक सेवा')}</span>
            </button>
          </div>

          {activeTab === 'economic' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* SIX COGNITIVE ECONOMIC COMMAND METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CARD 1: EST LOCAL GDP FLOW */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-amber-600 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-24 h-24" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>{t('স্থানীয় জিডিপি সক্ষমতা', 'Est. Monthly Economic Flow', 'अनुमानित स्थानीय जीडीपी')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      ₹{estimatedMonthlyEconomicActivity.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {t('বাৰ্ষিক জিডিপি অনুদান:', 'Annualized Contribution:')} <span className="text-amber-600 font-black">₹{((estimatedMonthlyEconomicActivity * 12) / 10000000).toFixed(2)} Cr</span>
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('উপাৰ্জনৰ ক্ষমতা সূচক', 'Velocity score: 9.4/10')}</span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">+14.2% MoM</span>
                  </div>
                </div>

                {/* CARD 2: LIVELIHOODS PROTECTED */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-150 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-blue-600 group-hover:scale-110 transition-transform duration-500">
                    <Users2 className="w-24 h-24" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{t('সংৰক্ষিত জীৱিকা', 'Livelihoods Sustained', 'सुरक्षित आजीविका')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      {estimatedLivelihoodsSupported.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {t('পৰিয়ালৰ লোক লাভান্বিত:', 'Family Beneficiaries Estimated:')} <span className="text-blue-600 font-black">{Math.round(estimatedLivelihoodsSupported * 3.4)} {t('ব্যক্তি', 'Members')}</span>
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('পৰিয়াল কল্যান সূচী', 'Socio-economic secure')}</span>
                    <span className="text-blue-600 bg-blue-50 px-2 rounded font-bold">STABLE</span>
                  </div>
                </div>

                {/* CARD 3: MOUNT OF MICRO CREDIT DEPLOYED */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                    <Coins className="w-24 h-24" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{t('বিত্তীয় সাহায্য', 'Credit Enabled & Disbursed', 'वित्तीय सहायता')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      ₹{creditEnabledAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {t('পিএম স্বনিধি আৰু ৰাজ্যিক সাহায্য', 'PM SVANidhi Micro Credit leverage')}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('ঋণ বিতৰণৰ হাৰ', 'Disbursement status')}</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 rounded font-mono">92% OK</span>
                  </div>
                </div>

                {/* CARD 4: WOMEN SELF RELIANCE RATE */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-purple-600 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-purple-600 uppercase tracking-widest leading-none mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      <span>{t('মহিলা আত্মনিৰ্ভৰশীলতা', 'Women-Owned Enterprise Ratio', 'महिला स्वावलंबन')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      {Math.round((womenOwnedCount / totalCount) * 100)}%
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {womenOwnedCount} {t('সক্ৰিয় মহিলা কৰ্মী', 'Registered Women Business Nodes', 'महिला उद्यमी')}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('মহিলা সবলীকৰণ', 'Empowerment quotient')}</span>
                    <span className="text-purple-600 font-bold">State High</span>
                  </div>
                </div>

                {/* CARD 5: TOURISM ECONOMY */}
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-sky-600 group-hover:scale-110 transition-transform duration-500">
                    <Globe className="w-24 h-24" />
                        <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('বিত্তীয় অন্তৰ্ভুক্তি', 'Financial integration')}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 rounded font-bold">ADVANCED</span>
                  </div>
                </div>50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('বিত্তীয় অন্তৰ্ভুক্তি', 'Financial integration')}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 rounded font-bold">ADVANCED</span>
                  </div>
                </div>�र')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      {tourismImpactCount} {t('ব্যৱসায়ী', 'Cluster Nodes')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {t('পৰম্পৰাগত শিপিনী, হস্তশিল্প আৰু চাহ বিক্ৰেতা', 'Handicrafts, local handloom, & tea culture nodes')}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('কৃষ্টি-সংস্কৃতি মূলক', 'Cultural preservation nodes')}</span>
                    <span className="text-sky-600 bg-sky-50 px-2 rounded font-mono">Eco-Link</span>
                  </div>
                </div>

                {/* CARD 6: DIGITAL DIGITIZATION INDEX */}
                <div className="bg-white p-6.5 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-24 h-24" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>{t('অনানুষ্ঠানিক ডিজিটাইজেচন সূচক', 'Informal Economy Digitization', 'अनौपचारिक अर्थव्यवस्था सूचकांक')}</span>
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5">
                      82.4 / 100
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                      {t('উপীআই আৰু ম’বাইল বেংকিং সংযোগ', 'Verified biometric ledger + payment QR mapping level')}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                    <span>{t('বিত্তীয় অন্তৰ্ভুক্তি', 'Financial integration')}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 rounded font-bold">ADVANCED</span>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE COMPREHENSIVE ASSAM ECONOMIC HEATMAP GRID / GIS CONSOLE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {economicViewMode === 'gis' ? (
                  <div className="lg:col-span-2 space-y-3">
                    <RealTimeMap 
                      vendors={vendors}
                      setVendors={setVendors}
                      selectedDistrict={selectedHeatmapDistrict}
                      setSelectedDistrict={setSelectedHeatmapDistrict}
                      onInspectVendor={setActiveInspectorVendor}
                    />
                    <div className="text-right">
                      <button
                        onClick={() => setEconomicViewMode('heatmap')}
                        className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-250 px-4.5 py-2 rounded-full cursor-pointer transition-all shadow-xs"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Show Analytical Heatmap List</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* DISTRICT HEATMAP CONSOLE */
                  <div className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                      <div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                          {t('ভৌগোলিক তথ্য বিশ্লেষণ', 'Geographic Intelligence Council', 'भौगोलिक डेटा विश्लेषण')}
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-3 leading-snug">
                          {t('অসম ক্ষুদ্ৰ ব্যৱসায় অৰ্থনৈতিক Heatmap', 'Assam District-Wise Economic Heatmap Console', 'असम जिला-वार आर्थिक हीटमैप')}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          {t('জিলা-ভিত্তিত পঞ্জীয়ন ঘনীভুততা আৰু বিত্তীয় প্ৰভাৱ পৰ্যবেক্ষণ বুক। জিলা নিৰ্বাচন কৰিলে ডেচবৰ্ড পৰিৱৰ্তন হ’ব।', 'Direct analytical monitoring across state territories. Click on any dynamic district badge below to inspect real-time metrics.', 'क्षेत्रवार पंजीकरण घनत्व और जिला प्रदर्शन सूचकांक।')}
                        </p>
                      </div>

                      <button
                        onClick={() => setEconomicViewMode('gis')}
                        className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#2E4053] bg-amber-100 hover:bg-amber-200 hover:scale-[1.02] border border-amber-300 px-5 py-3 rounded-2xl cursor-pointer transition-all shadow-xs shrink-0 self-start sm:self-center"
                      >
                        <Map className="w-4 h-4 text-amber-700 anim-pulse animate-bounce" />
                        <span>Open Live GIS Web Map</span>
                      </button>
                    </div>

                    {/* STYLIZED DISTRICT GRID MAP BOARD */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      {DISTRICTS.map((d) => {
                        const count = getSubmissionsByDistrict(d.id);
                        const isSelected = selectedHeatmapDistrict === d.id;
                        // Determine heat color intensity
                        let heatColor = 'border-amber-100 bg-amber-50/30 text-amber-700';
                        if (count > 15) heatColor = 'border-amber-200 bg-amber-100/40 text-amber-800';
                        if (count > 25) heatColor = 'border-amber-300 bg-amber-500/10 text-amber-900';

                        return (
                          <button
                            key={d.id}
                            onClick={() => setSelectedHeatmapDistrict(d.id)}
                            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between h-28 ${
                              isSelected 
                                ? 'border-amber-600 bg-amber-600 text-white shadow-lg shadow-amber-655/10 scale-102 z-10' 
                                : `${heatColor} hover:border-amber-400 hover:bg-white`
                            }`}
                          >
                            <div>
                              <p className={`text-[8px] font-black uppercase tracking-widest leading-none ${isSelected ? 'text-amber-100' : 'text-gray-400'}`}>
                                {d.id === 'Kamrup Metro' ? 'Capital-Hub' : d.id === 'Majuli' ? 'Eco-Hub' : 'District'}
                              </p>
                              <h4 className="font-extrabold text-sm tracking-tight mt-1 leading-tight">
                                {lang === 'as' ? d.nameAs : d.name}
                              </h4>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-xl font-black">{count}</span>
                              <span className={`text-[8px] font-black ${isSelected ? 'text-amber-200' : 'text-gray-500'}`}>NODES</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                  {/* DYNAMIC DISTRICT ANALYTICAL PANEL - INTERACTIVE OUTCOME */}
                  <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">
                        {t('জিলা পঞ্জীয়ন পদাৰ্পণ', 'Territorial Registries')}
                      </p>
                      <h4 className="text-lg font-black text-gray-900 leading-tight">
                        {lang === 'as' ? DISTRICTS.find(d => d.id === selectedHeatmapDistrict)?.nameAs : selectedHeatmapDistrict}
                      </h4>
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        {t('অসম চৰকাৰ ম্যাপ্ড কৰা নোড', 'Official public nodes mapped.')}
                      </p>
                    </div>

                    <div className="border-l border-gray-200 pl-6 shrink-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                        {t('স্থানীয় বিত্তীয় প্ৰবাহ', 'District Economic Activity')}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 leading-none">
                        ₹{(getSubmissionsByDistrict(selectedHeatmapDistrict) * 41000).toLocaleString('en-IN')}/mo
                      </p>
                      <p className="text-[8px] uppercase font-black text-gray-400 mt-1">
                        Est. local GDP impact
                      </p>
                    </div>

                    <div className="border-l border-gray-200 pl-6 shrink-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                        {t('বিত্তীয় অন্তৰ্ভুক্তি', 'PM SVANidhi Infiltration')}
                      </p>
                      <p className="text-xl font-extrabold text-green-600 leading-none">
                        {Math.round((getSubmissionsByDistrict(selectedHeatmapDistrict) * 0.72) + 1)} {t('আবেদন মঞ্জুৰ', 'Loans Approved')}
                      </p>
                      <p className="text-[8px] uppercase font-black text-green-700/60 mt-1">
                        72% Micro-credit rate
                      </p>
                    </div>
                  </div>
                </div>
              )}

                {/* AI ECONOMIC POLICY INSIGHTS (SMART CM BRIEFING CORE) */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-amber-950/80 p-8 rounded-[40px] border border-amber-950/40 text-white shadow-xl flex flex-col justify-between space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                        AI Economic Governance Assistant
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white/95 tracking-tight mt-4">
                      {t('স্মাৰ্ট মন্ত্ৰীসভা নীতি অন্তৰ্দৃষ্টি', 'CM Executive Briefing Desk', 'मुख्यमंत्री नीति अंतर्दृष्टि')}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">
                      {t('পঞ্জীভূত তথ্য আৰু ক্ৰেডিট ট্ৰেণ্ড বিশ্লেষণ কৰি স্বয়ংক্ৰিয়ভাৱে প্ৰস্তুত কৰা অৰ্থনৈতিক নীতি প পৰামৰ্শসমূহ।', 'Automated macroeconomic recommendations generated dynamically from the live state registration indexes.', 'पंजीकृत आंकड़ों और आर्थिक प्रवृत्तियों का स्वतः विश्लेषण।')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Recommendation 1 */}
                    <div className="p-4.5 bg-white/5 hover:bg-white/8 rounded-2xl border border-white/10 transition-colors space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <h4 className="text-xs font-black uppercase tracking-wide text-amber-300">
                          {t('শিপিনী আৰু কলা-সংস্কৃতি ঋণ বৃদ্ধি', 'Sustained Organic Craft Cluster')}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal">
                        Majuli handicraft operators hold a high transaction velocity of ₹36,000/mo. Activating specialized handloom incentives can double regional export value.
                      </p>
                    </div>

                    {/* Recommendation 2 */}
                    <div className="p-4.5 bg-white/5 hover:bg-white/8 rounded-2xl border border-white/10 transition-colors space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <h4 className="text-xs font-black uppercase tracking-wide text-blue-300">
                          {t('নগৰ সংস্থাপন আনুষ্ঠানিকীকৰণ', 'Guwahati Municipal formalization')}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal">
                        Guwahati (Kamrup Metro) street food nodes represent 34% of local informal sector jobs. formalizing municipal clusters is highly recommended.
                      </p>
                    </div>

                    {/* Recommendation 3 */}
                    <div className="p-4.5 bg-white/5 hover:bg-white/8 rounded-2xl border border-white/10 transition-colors space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <h4 className="text-xs font-black uppercase tracking-wide text-green-300">
                          {t('বিত্তীয় সাহায্য আৰু ক্ৰেডিট আঁচনি', 'PM SVANidhi Capital Deployments')}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal">
                        Assam state credit trust repayment rating sits at 98.4%. Standardizing local collateral-free credit will inject essential capital directly into rural GDP.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500">
                    <span>Generated Core Ledger: v2.60</span>
                    <button 
                      onClick={() => showToast('AI model synchronized with live registry', 'success')}
                      className="text-amber-400 hover:text-amber-300 uppercase tracking-widest font-black flex items-center space-x-1 border-b border-amber-400/30 font-sans cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>RE-GENERATE INSIGHTS</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* PREDICTIVE DIGITIZATION & ADOPTION ANALYSIS TREND */}
              <div className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest animate-pulse">
                      Predictive Forecast Matrix
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-3">
                      2026-2027 Informal Economy Digitization Trajectory
                    </h2>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                      <span>Target Base</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                      <span>Credit Adoption</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-3xl shrink-0 space-y-2">
                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 leading-none">Q1 2026 Forecast</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">14,250 Registrations</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Expected capital inflow ₹2.8 Cr over municipal registries.
                    </p>
                  </div>

                  <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-3xl shrink-0 space-y-2">
                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 leading-none font-mono">Q2 2026 Forecast</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">28,400 Registrations</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Forecast micro-credit leverage rate: 84.2%.
                    </p>
                  </div>

                  <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-3xl shrink-0 space-y-2">
                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 leading-none">Q3 2026 Forecast</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">42,800 Registrations</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      Expanded rural integration over Barak and Brahmaputra valleys.
                    </p>
                  </div>

                  <div className="p-5.5 bg-indigo-50/50 border border-indigo-100 rounded-3xl shrink-0 space-y-2">
                    <p className="text-[9px] uppercase font-black tracking-widest text-indigo-700 leading-none font-mono">CM Office Goal Q4 2026</p>
                    <p className="text-2xl font-black text-indigo-900 leading-none">100,000 Verified Nodes</p>
                    <p className="text-[10px] text-indigo-800 font-bold leading-normal">
                      Full-state compliance under Assam Small Business Act.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: REGISTRY & OPERATIONAL AUDIT */}
          {activeTab === 'audit' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* GOVEMENT SLA & ACTION CENTER SUMMARY CARD */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 rounded-[40px] border border-blue-100/60 shadow-inner grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-blue-700 bg-blue-100 px-2 rounded">
                    SLA Compliance Desk
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-2 leading-none">
                    Government Audit SLA Actions
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                    Under Assam Small Business Registration SLA directives. Verified percentage and queues are calculated dynamically.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-blue-100/50 flex items-center space-x-3 shadow-xs">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                    <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">SLA Resolution Rate</h4>
                    <p className="text-lg font-black text-gray-950 mt-1 leading-none">98.4% On-Time</p>
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-blue-100/50 flex items-center space-x-3 shadow-xs">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Queue Pending Review</h4>
                    <p className="text-lg font-black text-orange-600 mt-1 leading-none">{pendingCount} Applications</p>
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-blue-100/50 flex items-center space-x-3 shadow-xs">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Average Audit Velocity</h4>
                    <p className="text-lg font-black text-gray-950 mt-1 leading-none">3.4 mins/profile</p>
                  </div>
                </div>
              </div>

              {/* BAR CHART GRAPH BREAKDOWN */}
              <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 space-y-4">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                    {t('পৰিসংখ্যা বিশ্লেষণ', 'Data Analytics Distribution', 'सांख्यिकी विश्लेषण')}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-snug">
                    {t('ব্যৱসায় শ্ৰেণীৰ বিতৰণ', 'Verification Distribution', 'व्यवसाय श्रेणी वितरण')}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(
                      'পঞ্জীভূত ক্ষুদ্ৰ ব্যৱসায়সমূহৰ শ্ৰেণী অনুসৰি বিভাজন। ই চৰকাৰী নীতি আৰু উন্নয়ন আঁচনি ৰূপায়ণত সহায় কৰে।',
                      'Visual breakdown of registered small business operators based on their structural business type. This aids in targeted policy deployments and resource allocations.',
                      'पंजीकृत लघु व्यवसायों का श्रेणीवार विभाजन। यह सरकारी नीति और कल्याणकारी योजनाओं को लागू करने में मदद करता है।'
                    )}
                  </p>
                  <div className="pt-2 space-y-2">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-gray-50 pb-2 last:border-none">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-mono text-gray-900 mr-2 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        fontFamily="Inter, system-ui, sans-serif"
                        fontWeight={700}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        allowDecimals={false}
                        fontFamily="Inter, system-ui, sans-serif"
                        fontWeight={700}
                      />
                      <Tooltip 
                        cursor={{ fill: '#F9FAFB', radius: 12 }}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: '1px solid #F3F4F6', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={45}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RE-DIAL FILTER & THE COMPREHENSIVE DIRECTORY TABLE */}
              <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Custom search bar */}
                  <div className="relative flex-grow max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder={t('নাম, পঞ্জীয়ন আইডি বা পেশা বিচাৰক...', 'Search by name, registration ID, profession...', 'नाम, पंजीकरण आईडी या पेशा खोजें...')}
                      className="w-full pl-12 pr-4.5 py-4 bg-gray-50 border-3 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 font-bold text-gray-900 transition-all shadow-inner outline-none text-sm animate-pulse"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Categories & Filter Dials */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* District Dropdown */}
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <select 
                        className="pl-9 pr-8 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-500"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                      >
                        <option value="">{t('সকলো জিলা', 'All Districts', 'सभी जिले')}</option>
                        {DISTRICTS.map(d => (
                          <option key={d.id} value={d.id}>
                            {lang === 'as' ? d.nameAs : lang === 'hi' ? d.nameHi : d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative">
                      <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <select 
                        className="pl-9 pr-6 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">{t('সকলো ব্যৱসায় শ্ৰেণী', 'All Categories', 'सभी श्रेणियां')}</option>
                        <option value="fixed">{t('স্থায়ী দোকান (Fixed Shop)', 'Fixed Shop')}</option>
                        <option value="mobile">{t('ঠেলা গাড়ী (Mobile Cart)', 'Mobile Cart')}</option>
                        <option value="seasonal">{t('ঋতুভিত্তিক বিক্ৰেতা (Seasonal)', 'Seasonal')}</option>
                        <option value="MSME">{t('ক্ষুদ্ৰ উদ্যোগ (MSME)', 'MSME')}</option>
                      </select>
                    </div>

                    {/* Status selection */}
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner text-xs font-black uppercase tracking-wider text-gray-500 font-sans">
                      <button 
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}
                      >
                        {t('সকলো', 'All', 'सभी')}
                      </button>
                      <button 
                        onClick={() => setSelectedStatus('verified')}
                        className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${selectedStatus === 'verified' ? 'bg-green-500 text-white shadow-sm' : 'hover:text-green-600'}`}
                      >
                        {t('Verified', 'Verified', 'सत्यापित')}
                      </button>
                      <button 
                        onClick={() => setSelectedStatus('pending')}
                        className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${selectedStatus === 'pending' ? 'bg-orange-500 text-white shadow-sm' : 'hover:text-orange-600'}`}
                      >
                        {t('Pending', 'Pending', 'लंबित')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* DIRECTORY LIST TABLE CONTAINER */}
                <div className="overflow-x-auto rounded-[24px] border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-200/50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <th className="py-5 px-6">{t('পঞ্জীয়ন আইডি / নাম', 'UID / Business Owner', 'यूआईडी / विक्रेता नाम')}</th>
                        <th className="py-5 px-6">{t('উদ্যোগৰ শ্ৰেণী', 'Business Type', 'व्यवसाय श्रेणी')}</th>
                        <th className="py-5 px-6">{t('উপজীৱিকা বা পেশা', 'Profession / Trade', 'पेशा या व्यवसाय')}</th>
                        <th className="py-5 px-6">{t('ঠিকনা', 'Area Location', 'पता')}</th>
                        <th className="py-5 px-6">{t('স্থিতি', 'Status', 'स्थिति')}</th>
                        <th className="py-5 px-6 text-right">{t('কাৰ্য্যসমূহ', 'Actions', 'कार्रवाई')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                      {filteredVendors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-20 px-4">
                            <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                              <Ban className="w-12 h-12 text-gray-300" />
                              <h3 className="text-lg font-black text-gray-900 leading-tight">
                                {t('কোনো বিক্ৰেতা পোৱা নগ’ল', 'No matching vendor profiles found', 'कोई विक्रेता नहीं मिला')}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Change your search criteria or register a new vendor profile first from the application homepage.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredVendors.map((vendor) => (
                          <tr 
                            key={vendor.id} 
                            className="hover:bg-gray-50/50 transition-colors group"
                          >
                            {/* UID and Owner name */}
                            <td className="py-5.5 px-6">
                              <div className="flex items-center space-x-4">
                                {/* Profile image avatar fallback */}
                                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-amber-50 flex items-center justify-center">
                                  {vendor.selfie ? (
                                    <img src={vendor.selfie} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Selfie" />
                                  ) : (
                                    <span className="text-sm font-black text-amber-600 uppercase">
                                      {vendor.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-extrabold text-gray-900 truncate max-w-[180px]">{vendor.name}</p>
                                    {vendor.isVerified && (
                                      <ShieldCheck className="w-4 h-4 text-green-500 fill-green-50" />
                                    )}
                                  </div>
                                  <p className="text-[10px] font-mono font-black text-gray-400 mt-0.5 tracking-wider uppercase">
                                    {vendor.id || 'ASM-PENDING'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Business Category */}
                            <td className="py-5.5 px-6">
                              <div className="flex items-center space-x-2">
                                {vendor.businessType.includes('ঠেলা গাড়ী') || vendor.vendingType === 'mobile' ? (
                                  <Truck className="w-4 h-4 text-orange-600/70" />
                                ) : vendor.businessType.includes('স্থায়ী') || vendor.vendingType === 'fixed' ? (
                                  <Store className="w-4 h-4 text-blue-600/70" />
                                ) : vendor.businessType.includes('ঋতুভিত্তিক') || vendor.vendingType === 'seasonal' ? (
                                  <Calendar className="w-4 h-4 text-purple-600/70" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-green-600/70" />
                                )}
                                <span className="text-xs font-bold text-gray-600">
                                  {vendor.businessType.split('(')[0].trim()}
                                </span>
                              </div>
                            </td>

                            {/* PROFESSION COLUMN (Mandated) */}
                            <td className="py-5.5 px-6">
                              <span className="text-xs font-black bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200">
                                {vendor.profession || t('ক্ষুদ্ৰ ব্যৱসায় (General Trade)', 'General Trade')}
                              </span>
                            </td>

                            {/* Area Address */}
                            <td className="py-5.5 px-6">
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[180px]" title={vendor.location.address}>
                                {vendor.location.address}
                              </p>
                            </td>

                            {/* License Status verification */}
                            <td className="py-5.5 px-6">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                vendor.isVerified 
                                  ? 'bg-green-50 text-green-700 border-green-100' 
                                  : 'bg-orange-50 text-orange-700 border-orange-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${vendor.isVerified ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                {vendor.isVerified ? t('সত্যাপিত', 'Verified') : t('পেন্ডিং', 'Pending')}
                              </span>
                            </td>

                            {/* Administrative action choices */}
                            <td className="py-5.5 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {/* View complete details modal */}
                                <button 
                                  onClick={() => setActiveInspectorVendor(vendor)}
                                  className="p-2.5 bg-gray-50 hover:bg-orange-500 hover:text-white text-gray-500 rounded-xl transition-all border border-gray-200/50 group-hover:border-orange-500/20 cursor-pointer"
                                  title="Audit Vendor Credentials"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Verify manual toggle */}
                                <button 
                                  onClick={() => handleToggleVerification(vendor.id!)}
                                  className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
                                    vendor.isVerified 
                                      ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600' 
                                      : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white hover:border-green-600'
                                  }`}
                                  title={vendor.isVerified ? "Hold/Suspend Certificate" : "Issue & Verify Certificate"}
                                >
                                  {vendor.isVerified ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>

                                {/* Delete record */}
                                <button 
                                  onClick={() => handleDeleteVendor(vendor.id!, vendor.name)}
                                  className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200/50 rounded-xl transition-all cursor-pointer"
                                  title="Remove Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AUDIT & VERIFICATION WORKFLOW */}
          {activeTab === 'audit' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Audit Stats Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Rostered Queue</p>
                  <p className="text-3xl font-black text-gray-900 mt-2 font-mono">{vendors.length}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold">Registration database records</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2E4053]">Audited & Certified</p>
                  <p className="text-3xl font-black text-green-600 mt-2 font-mono">{vendors.filter(v => v.isVerified).length}</p>
                  <p className="text-[10px] text-green-600 mt-1 font-bold">✓ Credentials signed & live</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Pending Review</p>
                  <p className="text-3xl font-black text-orange-600 mt-2 font-mono">{vendors.filter(v => !v.isVerified).length}</p>
                  <p className="text-[10px] text-orange-600 mt-1 font-bold">⚠ Awaiting physical verification</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/20 border-blue-100/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Digital Accuracy Index</p>
                  <p className="text-3xl font-black text-blue-800 mt-2 font-mono">98.4%</p>
                  <p className="text-[10px] text-blue-700 mt-1 font-bold">Standardized state threshold</p>
                </div>
              </div>

              {/* Main Auditing Workspace */}
              <div className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
                      ADMINISTRATIVE APP REGISTRY
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-3 leading-snug">
                      Verification Queue Management
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      Authorize pending street vendor licenses, inspect bio-data matches, and verify digital credentials state-wide.
                    </p>
                  </div>
                  
                  {/* Toggle button to show unverified only or all */}
                  <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-black uppercase tracking-wider text-gray-500">
                    <button 
                      onClick={() => setAuditFilter('all')}
                      className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${auditFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'}`}
                    >
                      All ({vendors.length})
                    </button>
                    <button 
                      onClick={() => setAuditFilter('pending')}
                      className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${auditFilter === 'pending' ? 'bg-orange-500 text-white shadow-xs' : 'hover:text-orange-650'}`}
                    >
                      Pending ({vendors.filter(v => !v.isVerified).length})
                    </button>
                  </div>
                </div>

                {/* Audit Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vendors
                    .filter(v => auditFilter === 'all' || !v.isVerified)
                    .map((vendor) => (
                      <div 
                        key={vendor.id} 
                        className={`p-6 rounded-[32px] border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                          vendor.isVerified 
                            ? 'bg-green-50/25 border-green-100 hover:border-green-300' 
                            : 'bg-white border-gray-150 shadow-sm hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-orange-50 shrink-0 flex items-center justify-center">
                              {vendor.selfie ? (
                                <img src={vendor.selfie} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Audit Selfie" />
                              ) : (
                                <span className="text-lg font-black text-orange-600 uppercase">
                                  {vendor.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-extrabold text-base text-gray-900 leading-none">{vendor.name}</h4>
                                {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                              </div>
                              <p className="text-[10px] font-mono font-black text-gray-400 mt-1 tracking-wider uppercase">
                                ID: {vendor.id}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-[9px] font-bold text-gray-655 bg-gray-100 px-2 py-0.5 rounded uppercase">
                                  {vendor.businessType.split('(')[0].trim()}
                                </span>
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                                  {vendor.profession || 'General Trade'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            vendor.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {vendor.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1.5 text-gray-600 border border-gray-100">
                          <p><strong>Aadhaar:</strong> XXXX-XXXX-{vendor.aadharNumber?.slice(-4) || '3214'}</p>
                          <p className="truncate"><strong>Vending address:</strong> {vendor.location.address}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveInspectorVendor(vendor)}
                            className="flex-grow py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition border border-gray-200 cursor-pointer"
                          >
                            Inspect documents
                          </button>
                          
                          <button
                            onClick={() => handleToggleVerification(vendor.id!)}
                            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                              vendor.isVerified 
                                ? 'bg-red-50 hover:bg-red-655 text-red-600 hover:text-white border border-red-200' 
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/10'
                            }`}
                          >
                            {vendor.isVerified ? 'Revoke Cert' : 'Verify & Approve'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COMPLIANCE & IDENTITY SECURITY */}
          {activeTab === 'compliance' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* COMPLIANCE CORE DECK */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ID SECURITY ENGINE CONTROLLER */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-widest leading-none">
                      Aadhar OCR & Facial Biometrics Protocol
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-3">
                      Assam Electronic Public Trust & Fraud Intelligence Desk
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      Scans municipal street records for Aadhaar collisions, duplications, or low trust ratings. Includes dynamic compliance indices synchronized over the State Digital Gateway.
                    </p>
                  </div>

                  {/* STAT TELEMETRY BAR */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                    <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-3xl shrink-0">
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">Identity Theft Scanned</p>
                      <p className="text-2xl font-black text-gray-900 mt-1 font-mono">100 / 100 Checked</p>
                      <p className="text-[9px] text-green-600 font-extrabold mt-1">🛡️ NO COLLISIONS FOUND</p>
                    </div>

                    <div className="p-5.5 bg-gray-50 border border-gray-100 rounded-3xl shrink-0">
                      <p className="text-[9px] uppercase font-black tracking-widest text-gray-400">Duplicate Aadhar Attempts</p>
                      <p className="text-2xl font-black text-gray-900 mt-1 font-mono">0 Flags</p>
                      <p className="text-[9px] text-gray-400 font-extrabold mt-1">Active biometric loop</p>
                    </div>

                    <div className="p-5.5 bg-purple-50/50 border border-purple-100 rounded-3xl shrink-0">
                      <p className="text-[9px] uppercase font-black tracking-widest text-purple-700">Facial Match Accuracy</p>
                      <p className="text-2xl font-black text-purple-900 mt-1 font-mono">99.84% Rating</p>
                      <p className="text-[9px] text-purple-700 font-extrabold mt-1">Public trust safety: High</p>
                    </div>
                  </div>

                  {/* COMPLIANCE SCANTRIGGER SIMULATION button */}
                  <div className="p-5.5 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-gray-950 uppercase tracking-wide">Standardize State Trust Biometrics</h4>
                      <p className="text-[11px] text-gray-400 leading-tight">
                        Trigger state-wide electronic review of all 100 street vendors. Matches digital signatures with Aadhaar gateway OCR.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setComplianceScanLoading(true);
                        setTimeout(() => {
                          setComplianceScanLoading(false);
                          showToast('Compliance audit finished. 100 profiles secure. Zero biometric duplicates.', 'success');
                        }, 2000);
                      }}
                      disabled={complianceScanLoading}
                      className="px-6 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition shadow-md shadow-purple-600/10 cursor-pointer flex items-center space-x-2 shrink-0"
                    >
                      {complianceScanLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ANALYZING LEDGER...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4 animate-ping" />
                          <span>TRIGGER SECURE AUDIT SCAN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* TRUST SCORE COMPLIANCE METRIC GAUGES */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                      Vendor Trust Rating Matrix
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Assam Digital Public Trust Scores. Based on municipal rating indices and on-time credit repayment behaviors.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Gauge 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase text-gray-600">
                        <span>Excellent Score (&gt;90/100)</span>
                        <span className="font-mono text-gray-900 font-black">82% of Vendors</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>

                    {/* Gauge 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase text-gray-600">
                        <span>Standard Score (70-90/100)</span>
                        <span className="font-mono text-gray-900 font-black">15% of Vendors</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    {/* Gauge 3 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase text-gray-600">
                        <span>Critical/Low Score (&lt;70/100)</span>
                        <span className="font-mono text-gray-900 font-black">3% of Vendors</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '3%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4.5 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-normal">
                      <strong>Automatic hold alerts:</strong> 3 profiles with low compliance rating indexes are quarantined from active PM SVANidhi subsidy matching rosters until physical location biometric authentication completes.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: CITIZEN PUBLIC SERVICE DISCOVERY */}
          {activeTab === 'citizen' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* VENDOR QR BADGING GENERATOR DECK */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest leading-none">
                      Dignified Assam Business QR Badge Ecosystem
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-3">
                      Citizen Validation Certificate Generator
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      Search, generate, and review designated public physical verification QR Badges. Citizens scan Badges placed on carts/stalls to confirm state validity.
                    </p>
                  </div>

                  {/* DROP DOWN SELECTOR FOR BADGE PREVIEW */}
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-black tracking-wider text-gray-400">Select Registered Vendor Profile</label>
                    <select
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-extrabold text-sm text-gray-800 outline-none focus:bg-white focus:border-emerald-500"
                      onChange={(e) => setActiveQRVendorId(e.target.value)}
                      defaultValue={vendors[0]?.id || ''}
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id}) - {v.profession || 'General Trade'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Badge certificate generated successfully. Saved in cloud server print-queue.', 'success')}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4 animate-bounce" />
                      <span>DOWNLOAD HIGH-RES STICKER PDF</span>
                    </button>
                  </div>
                </div>

                {/* THE PHYSICALLY RENDERED GOVT ACCREDITED DIGITAL BADGE PREVIEW */}
                <div className="bg-gradient-to-tr from-emerald-50 via-teal-50/40 to-white p-8 rounded-[40px] border-4 border-emerald-600 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
                  {/* Decorative stamp backdrop */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Outer border lines */}
                  <div className="space-y-1.5 w-full">
                    <span className="text-[9px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      GOVERNMENT OF ASSAM • OFFICIAL VERIFICATION
                    </span>
                    <h4 className="text-xs font-black text-gray-900 tracking-tight mt-3">
                      SMALL BUSINESS CERTIFIED BADGE
                    </h4>
                    <p className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      Under Assam Street Vendor Livelihood Act, 2026
                    </p>
                  </div>

                  {/* Dynamic Certificate Holder fields */}
                  <div className="py-6 space-y-4 w-full">
                    
                    {/* Stylized QR Code Draw with state motifs */}
                    <div className="w-36 h-36 bg-white border-2 border-emerald-600 rounded-2xl p-2.5 mx-auto flex items-center justify-center relative shadow-sm">
                      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none rounded-xl"></div>
                      {/* Stylized custom SVG QR representation */}
                      <svg className="w-full h-full text-emerald-950" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M5,5 h30 v30 h-30 z M13,13 h14 v14 h-14 z M65,5 h30 v30 h-30 z M73,13 h14 v14 h-14 z M5,65 h30 v30 h-30 z M13,73 h14 v14 h-14 z" />
                        <path d="M45,5 h10 v10 h-10 z M45,25 h10 v15 h-10 z M35,45 h25 v10 h-25 z M5,45 h20 v10 h-20 z M65,45 h30 v10 h-30 z" />
                        <path d="M85,65 h10 v10 h-10 z M65,75 h15 v10 h-15 z M45,65 h15 v30 h-15 z M85,85 h10 v10 h-10 z" />
                        <rect x="42" y="42" width="16" height="16" rx="4" fill="#059669" />
                        <circle cx="50" cy="50" r="4" fill="#ffffff" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-none">
                        {vendors.find(v => v.id === (activeQRVendorId || vendors[0]?.id))?.name || 'Assamese Operator'}
                      </h3>
                      <p className="text-[10px] font-mono font-black text-emerald-700 tracking-widest mt-1.5 uppercase">
                        UID: {vendors.find(v => v.id === (activeQRVendorId || vendors[0]?.id))?.id || 'ASM-PENDING'}
                      </p>
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        Registered District: <span className="text-gray-900 font-extrabold">{vendors.find(v => v.id === (activeQRVendorId || vendors[0]?.id))?.location.address.split(',').slice(-1)[0] || 'Kamrup Metro'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 w-full flex items-center justify-between text-[8px] font-black text-emerald-800 uppercase tracking-widest">
                    <span>CM OFFICE DESK SECURITY POOL</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 rounded font-mono">VERIFIED LIVE</span>
                  </div>
                </div>

                {/* SERVICE DISCOVERY DIRECTORY PREVIEW */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none flex items-center space-x-2">
                      <Compass className="w-5 h-5 text-emerald-600" />
                      <span>Trending Local Services</span>
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Accredited local craftsmen, hand weavers, organic farming supplying clusters discovered close-by.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                    {/* Item 1 */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-gray-950">Muga Silk Handloom Weaving</h4>
                        <p className="text-[10px] text-gray-400 font-bold">Jorhat Craft District • Lakhimi handlooms</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-[10px] font-sans font-black">
                        ★ 4.9 Rating
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-gray-950">Handcrafted Bamboo Products</h4>
                        <p className="text-[10px] text-gray-400 font-bold">Majuli Craft District • Barman EcoCrafts</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-[10px] font-sans font-black">
                        ★ 4.8 Rating
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-gray-950">Assam CTC Organic Tea Stall</h4>
                        <p className="text-[10px] text-gray-400 font-bold">Sonitpur District • Borgah Tea Suppliers</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-[10px] font-sans font-black">
                        ★ 4.7 Rating
                      </span>
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-gray-400 italic font-medium leading-none">
                    *Accreditions dynamically updated state-wide.
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* DETAILED INSPECTION DIALOG MODAL PANEL (Active credentials audit) */}
      <AnimatePresence>
        {activeInspectorVendor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-[44px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white"
            >
              {/* Floating cancel button */}
              <button 
                onClick={() => setActiveInspectorVendor(null)}
                className="absolute top-6 right-6 p-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                
                {/* Left side: Vector card or physical card display & status details */}
                <div className="md:col-span-4 space-y-6 flex flex-col justify-between">
                  <div className="text-center md:text-left space-y-4">
                    {/* Interactive Profile preview */}
                    <div className="w-32 h-32 rounded-[28px] overflow-hidden border-4 border-orange-50 shadow-md mx-auto md:mx-0 relative group bg-orange-50">
                      {activeInspectorVendor.selfie ? (
                        <img src={activeInspectorVendor.selfie} className="w-full h-full object-cover" alt="Inspected Selfie" />
                      ) : (
                        <span className="text-3xl font-black text-orange-600 block pt-10 text-center uppercase">
                          {activeInspectorVendor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                        {activeInspectorVendor.name}
                      </h3>
                      <p className="text-[11px] font-mono font-black py-1 px-2 text-gray-500 bg-gray-100 inline-block rounded-md uppercase tracking-wider">
                        ID: {activeInspectorVendor.id}
                      </p>
                    </div>
                  </div>

                  {/* Operational status details */}
                  <div className="space-y-3 bg-gray-50/70 p-5 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      Verification Records:
                    </p>
                    
                    <div className="flex justify-between text-xs font-bold py-1.5 border-b border-gray-200/40">
                      <span className="text-gray-400">Identity Checks</span>
                      <span className="text-green-600 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        DPI Verified
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-bold py-1.5 border-b border-gray-200/40">
                      <span className="text-gray-400">Aadhaar OCR match</span>
                      <span className="text-green-600 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        100% Ok
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-bold py-1.5">
                      <span className="text-gray-400">Licensing status</span>
                      <span className={activeInspectorVendor.isVerified ? "text-green-600" : "text-orange-500"}>
                        {activeInspectorVendor.isVerified ? "Approved Cert" : "On Hold / Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Manual Approval Action */}
                  <button 
                    onClick={() => handleToggleVerification(activeInspectorVendor.id!)}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      activeInspectorVendor.isVerified 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white' 
                        : 'bg-green-600 text-white shadow-lg shadow-green-600/25 hover:bg-green-700'
                    }`}
                  >
                    {activeInspectorVendor.isVerified ? t('ডিক্ৰী বাতিল কৰক', 'Revoke Vendor Approval') : t('অনুমোদন কৰক', 'Verify & Issue Certificate')}
                  </button>
                </div>

                {/* Right side: Complete profile fields inspect */}
                <div className="md:col-span-8 space-y-8 divide-y divide-gray-100">
                  
                  {/* Grid details section */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-6">
                      {t('পঞ্জীয়ন প্ৰোফাইল', 'Operator Registration Profile')}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('আধাৰ নম্বৰ', 'Aadhaar ID')}</p>
                        <p className="font-extrabold text-gray-900 tracking-wider">
                          {activeInspectorVendor.aadharNumber ? `XXXX - XXXX - ${activeInspectorVendor.aadharNumber.slice(-4)}` : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('ম’বাইল নম্বৰ', 'Mobile Number')}</p>
                        <p className="font-extrabold text-gray-900 flex items-center space-x-1.5">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>+91 {activeInspectorVendor.mobile}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('উপজীৱিকা শ্ৰেণী', 'Profession & Category')}</p>
                        <p className="font-extrabold text-gray-900">
                          {activeInspectorVendor.profession || 'Street Vendor'} ({activeInspectorVendor.businessType.split('(')[0].trim()})
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('জন্ম তাৰিখ', 'Date of Birth')}</p>
                        <p className="font-extrabold text-gray-900">
                          {activeInspectorVendor.dob || '15/08/1987'}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('পঞ্জীভূত স্থান', 'Business Vending Address')}</p>
                        <p className="font-extrabold text-gray-900 flex items-start space-x-1.5 text-xs">
                          <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                          <span>{activeInspectorVendor.location.address}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Applied Loan scheme reviews */}
                  <div className="pt-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-6">
                      {t('বিত্তীয় সাহায্য আঁচনি', 'Govt Schemes & Loan Applications')}
                    </h4>
                    
                    <div className="bg-orange-50/40 border border-orange-100 p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-orange-700 bg-orange-100 px-2 rounded">
                          PRIMARY INTEREST
                        </span>
                        <h5 className="text-base font-extrabold text-gray-900 mt-1">
                          PM SVANidhi Micro Credit Scheme
                        </h5>
                        <p className="text-xs text-gray-500 mt-1">
                          Under audit for capital deployment ₹10,000 up to ₹50,000 for small businesses.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {activeInspectorVendor.loanStatus === 'approved' ? (
                          <span className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Approved
                          </span>
                        ) : activeInspectorVendor.loanStatus === 'under_review' ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-xl font-black text-[9px] uppercase tracking-wider">
                              In Review
                            </span>
                            <button 
                              onClick={() => handleApproveScheme(activeInspectorVendor.id!, "PM SVANidhi")}
                              className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                          </div>
                        ) : activeInspectorVendor.isVerified ? (
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => handleApproveScheme(activeInspectorVendor.id!, "PM SVANidhi")}
                              className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition"
                            >
                              Approve Loan
                            </button>
                            <button 
                              onClick={() => handleHoldScheme(activeInspectorVendor.id!, "PM SVANidhi")}
                              className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition"
                            >
                              Review
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide flex items-center">
                            <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Approve profile first
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Historic Audit logs trail */}
                  <div className="pt-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-4">
                      {t('ভিতৰুৱা নথি', 'Administrative Audit Trail Logs')}
                    </h4>
                    
                    <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
                      {(activeInspectorVendor.activityHistory || []).map((history, idx) => (
                        <div key={idx} className="flex space-x-3 text-xs leading-relaxed">
                          <span className="font-mono text-[10px] font-black text-gray-400 tracking-wider py-0.5 shrink-0">
                            {history.date}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-2 shrink-0"></span>
                          <p className="text-gray-600 font-medium">
                            {history.action}
                          </p>
                        </div>
                      ))}
                      
                      {/* Base log fallback */}
                      <div className="flex space-x-3 text-xs leading-relaxed">
                        <span className="font-mono text-[10px] font-black text-gray-400 tracking-wider py-0.5 shrink-0">
                          System
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-2 shrink-0"></span>
                        <p className="text-gray-500 italic font-medium">
                          Initial digital application captured over State Public Infrastructure Gateway.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
