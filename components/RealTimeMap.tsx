import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VendorProfile } from '../types';
import { 
  MapPin, ShieldAlert, ShieldCheck, Eye, Search, Filter, Ban, 
  RefreshCw, Compass, Zap, Activity, Info, AlertTriangle, Send, 
  Check, X, Truck, Store, Calendar, ShoppingBag, Globe, Locate
} from 'lucide-react';
import { useLanguage } from '../App';

interface RealTimeMapProps {
  vendors: VendorProfile[];
  setVendors: (updatedList: VendorProfile[]) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onInspectVendor: (vendor: VendorProfile) => void;
}

const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; places: string[]; desc: string }> = {
  'Kamrup Metro': { 
    lat: 26.1158, 
    lng: 91.7086, 
    places: ["Fancy Bazar", "Paltan Bazar", "Ganeshguri", "Maligaon", "Guwahati Port"],
    desc: "Capital Administrative Node • High Intensity Congestion Watch"
  },
  'Sonitpur': { 
    lat: 26.6338, 
    lng: 92.7926, 
    places: ["Chowk Bazaar", "Mission Chariali", "Tezpur Waterfront", "Historical Park Zone"],
    desc: "Barak-Valley Interface • High Craft Cultural Cluster"
  },
  'Jorhat': { 
    lat: 26.7509, 
    lng: 94.2037, 
    places: ["Jorhat Main Road", "Gar-Ali Market", "Barua Chariali Hub", "Tea Estate Lane"],
    desc: "Upper Assam Tea Hub • Active Self-Help Group Networks"
  },
  'Dibrugarh': { 
    lat: 27.4728, 
    lng: 94.9125, 
    places: ["HS Road Vending Block", "Marwari Patty Market", "Dibrugarh Chowk Line", "River embankment row"],
    desc: "Brahmaputra Embankment Sector • High Weather Sensitivity Vending"
  },
  'Nagaon': { 
    lat: 26.3478, 
    lng: 92.6838, 
    places: ["Haiborgaon Market", "Christianpatty Sector", "Nagaon Central Crossing"],
    desc: "Central Agri-Produce Trunk Corridor • Wholesale Supply Interface"
  },
  'Cachar': { 
    lat: 24.8333, 
    lng: 92.8055, 
    places: ["Central Road Markets", "Sadar Bazar Line", "Goldighi Mall Circular Enclave"],
    desc: "Barak Valley Core Hub • Dynamic Inter-State Border Sourcing"
  },
  'Tinsukia': { 
    lat: 27.5002, 
    lng: 95.3524, 
    places: ["GS Road Wholesale Lane", "Daily Bazaar Compound", "Makum Retail Sector"],
    desc: "Industrial Coal & Tea Junction • Dense Multi-Tiered Stalls"
  },
  'Sivsagar': { 
    lat: 26.9822, 
    lng: 94.6403, 
    places: ["Sivsagar Central Square", "Temple Embankment Buffer", "Asthapit Craft Lane"],
    desc: "Cultural Quarter Enclave • Handloom & Organic Souvenir Focus"
  }
};

export const RealTimeMap: React.FC<RealTimeMapProps> = ({ 
  vendors, 
  setVendors, 
  selectedDistrict, 
  setSelectedDistrict,
  onInspectVendor
}) => {
  const { t, lang } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Search & Filter conditions
  const [mapSearch, setMapSearch] = useState('');
  const [vendingCategoryFilter, setVendingCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, verified, pending

  // Selected item HUD details
  const [hoveredVendor, setHoveredVendor] = useState<VendorProfile | null>(null);
  const [selectedVendorHUD, setSelectedVendorHUD] = useState<VendorProfile | null>(null);

  // Tracking Simulation State
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [simulatedVendorsMap, setSimulatedVendorsMap] = useState<Record<string, { lat: number; lng: number; trail: {lat: number, lng: number}[] }>>({});

  // Active Dispatch Dispatch Simulation
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<VendorProfile | null>(null);
  const [dispatchProgress, setDispatchProgress] = useState(0); // 0 to 100 percentage
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Floating cursor coordinates simulation
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize simulated coordinates from vendors list
  useEffect(() => {
    const coordsMap: Record<string, { lat: number; lng: number; trail: {lat: number, lng: number}[] }> = {};
    vendors.forEach(v => {
      if (v.id) {
        coordsMap[v.id] = {
          lat: v.location.lat,
          lng: v.location.lng,
          trail: [{ lat: v.location.lat, lng: v.location.lng }]
        };
      }
    });
    setSimulatedVendorsMap(coordsMap);
  }, [vendors.length]);

  // Live coordinates simulation stepping loop (Simulated GPS updates)
  useEffect(() => {
    if (!isLiveTracking) return;

    const interval = setInterval(() => {
      setSimulatedVendorsMap(prev => {
        const next = { ...prev };
        let updatedAny = false;

        vendors.forEach(v => {
          if (v.id && prev[v.id]) {
            // Only mobile carts walk around
            const isMobile = v.vendingType === 'mobile' || v.businessType.includes('ঠেলা গাড়ী');
            if (isMobile && Math.random() < 0.6) {
              const current = prev[v.id];
              // Applied gentle walk coordinates
              const walkLat = current.lat + (Math.random() - 0.5) * 0.0006;
              const walkLng = current.lng + (Math.random() - 0.5) * 0.0006;
              
              // Cap walk to stay near initial district center bounds
              const center = DISTRICT_CENTERS[selectedDistrict] || DISTRICT_CENTERS['Kamrup Metro'];
              const dLat = walkLat - center.lat;
              const dLng = walkLng - center.lng;
              
              const maxOffset = 0.022;
              const clat = Math.abs(dLat) > maxOffset ? center.lat + Math.sign(dLat) * maxOffset : walkLat;
              const clng = Math.abs(dLng) > maxOffset ? center.lng + Math.sign(dLng) * maxOffset : walkLng;

              const trailHistory = [...current.trail];
              if (trailHistory.length >= 8) trailHistory.shift(); // Max 8 trail dots
              trailHistory.push({ lat: clat, lng: clng });

              next[v.id] = {
                lat: clat,
                lng: clng,
                trail: trailHistory
              };
              updatedAny = true;
            }
          }
        });

        return updatedAny ? next : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveTracking, vendors, selectedDistrict]);

  // Dispatch Ranger Simulation Timer
  useEffect(() => {
    if (!isDispatching || !dispatchTarget) return;

    const interval = setInterval(() => {
      setDispatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDispatchNotes(`Inspector team arrived at: ${dispatchTarget.name}'s GPS Node. Performing active license ID audit...`);
          setTimeout(() => {
            setIsDispatching(false);
            setDispatchTarget(null);
            setDispatchNotes('');
          }, 3500);
          return 100;
        }
        return prev + 6; // Arrive in about 2.5 seconds
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isDispatching, dispatchTarget]);

  // Handle map cursor hover coordinate decoding
  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const xCoord = (e.clientX - rect.left) / rect.width; // 0 to 1
    const yCoord = (e.clientY - rect.top) / rect.height; // 0 to 1

    const center = DISTRICT_CENTERS[selectedDistrict] || DISTRICT_CENTERS['Kamrup Metro'];
    const latMin = center.lat - 0.025;
    const latMax = center.lat + 0.025;
    const lngMin = center.lng - 0.025;
    const lngMax = center.lng + 0.025;

    const currentLat = latMax - yCoord * (latMax - latMin);
    const currentLng = lngMin + xCoord * (lngMax - lngMin);
    
    setCursorCoords({ lat: currentLat, lng: currentLng });
  };

  const handleMapMouseLeave = () => {
    setCursorCoords(null);
  };

  // Convert GPS coordinates coordinates directly onto 0-100% grid coordinates
  const getCoordinatesPercent = (latVal: number, lngVal: number) => {
    const center = DISTRICT_CENTERS[selectedDistrict] || DISTRICT_CENTERS['Kamrup Metro'];
    const latMin = center.lat - 0.025;
    const latMax = center.lat + 0.025;
    const lngMin = center.lng - 0.025;
    const lngMax = center.lng + 0.025;

    const x = ((lngVal - lngMin) / (lngMax - lngMin)) * 100;
    const y = (1 - (latVal - latMin) / (latMax - latMin)) * 100;

    // Clamp inside map frame bounds
    const clamp = (v: number) => Math.max(3, Math.min(97, v));
    return { x: clamp(x), y: clamp(y) };
  };

  // Action: toggle manual verification right on map
  const toggleMapVendorVerification = (vendorId: string) => {
    const nextList = vendors.map(v => {
      if (v.id === vendorId) {
        const nextState = !v.isVerified;
        return {
          ...v,
          isVerified: nextState,
          activityHistory: [
            {
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              action: nextState 
                ? 'Approved and geo-verified via Central Geospatial Live Map Portal' 
                : 'De-verified / Put on administrative hold from Live Map Terminal'
            },
            ...(v.activityHistory || [])
          ]
        };
      }
      return v;
    });

    setVendors(nextList);

    // Update floating HUD state
    if (selectedVendorHUD && selectedVendorHUD.id === vendorId) {
      setSelectedVendorHUD(prev => prev ? { ...prev, isVerified: !prev.isVerified } : null);
    }
  };

  // Action: Launch animated Dispatch inspection
  const handleTriggerDispatch = (vendor: VendorProfile) => {
    if (isDispatching) return;
    setDispatchTarget(vendor);
    setIsDispatching(true);
    setDispatchProgress(0);
    setDispatchNotes(`Dispatched municipal ranger team from Central Station to ${vendor.name || 'Vendor'} (${vendor.id}). Calculating GPS pathing routing...`);
    setSelectedVendorHUD(vendor);
  };

  // Filter vendors falling within selected district centered bounds
  const districtVendors = vendors.filter(v => {
    const addressMatch = (v.location?.address || '').toLowerCase().includes(selectedDistrict.toLowerCase());
    const fallbackMatch = selectedDistrict === 'Kamrup Metro' && (v.location?.address || '').toLowerCase().includes('guwahati');
    return addressMatch || fallbackMatch;
  });

  const filteredDistrictVendors = districtVendors.filter(v => {
    // Search input
    const matchSearch = v.name.toLowerCase().includes(mapSearch.toLowerCase()) || 
                       (v.id || '').toLowerCase().includes(mapSearch.toLowerCase()) ||
                       (v.profession || '').toLowerCase().includes(mapSearch.toLowerCase());
    
    // Category filter
    const codeMap = vendingCategoryFilter.toLowerCase();
    const matchCategory = vendingCategoryFilter === '' || v.businessType.toLowerCase().includes(codeMap);

    // Verified/Pending status filter
    const matchStatus = statusFilter === 'all' || 
                        (statusFilter === 'verified' && v.isVerified) || 
                        (statusFilter === 'pending' && !v.isVerified);

    return matchSearch && matchCategory && matchStatus;
  });

  // Calculate local aggregate status checks
  const localTotal = districtVendors.length;
  const localVerified = districtVendors.filter(v => v.isVerified).length;
  const localPending = localTotal - localVerified;
  const localMobileCarts = districtVendors.filter(v => v.vendingType === 'mobile' || v.businessType.includes('ঠেলা')).length;

  return (
    <div className="bg-[#FCFBFA] p-6 lg:p-8 rounded-[40px] border border-gray-150 shadow-md space-y-6">
      
      {/* GEOSPATIAL MONITOR CONTAINER HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-5 border-b border-gray-200/50">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 tracking-widest leading-none uppercase flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5 animate-ping"></span>
              LIVE GIS RADAR
            </span>
            <span className="text-[10px] text-gray-400 font-extrabold font-mono uppercase">Node Control Center</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-2 leading-none">
            {t('ৰিয়েল-টাইম পৌৰ ভৌগোলিক মেপিং কন্সোল', 'Assam Municipal Geospatial Vending Console', 'नगरपालिका भू-स्थानिक मैपिंग कंसोल')}
          </h2>
          <p className="text-gray-500 text-xs font-semibold mt-1">
            {t(
              'সক্ৰিয় জিপিএচ ড্ৰিফ্ট ট্ৰেকিং আৰু সুৰক্ষিত আধাৰ সংযুক্ত জিঅ’-টেগিং ডেচবৰ্ড। ম’বাইল ঠেলা পথসমূহ লাইভ মেপ কৰা হয়।',
              'Integrated live coordinate mapping telemetry with passive trail histories. Drag, hover, and tap on active points to audit vendor certificates directly.',
              'म्युनिसिपल लाइव कर्ट ट्रैकिंग, स्ट्रीट वेंडिंग रूट एनालिसिस और त्वरित सत्यापन पैनल।'
            )}
          </p>
        </div>

        {/* Dynamic District Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedVendorHUD(null);
                setHoveredVendor(null);
              }}
              className="pl-9 pr-8 py-3 bg-gray-50 hover:bg-white border-2 border-gray-150 rounded-2xl font-bold text-xs uppercase tracking-wider text-gray-700 outline-none cursor-pointer focus:border-amber-500 transition-all shadow-xs"
            >
              {Object.keys(DISTRICT_CENTERS).map(distName => (
                <option key={distName} value={distName}>{distName}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsLiveTracking(!isLiveTracking)}
            className={`px-4.5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer border flex items-center space-x-2 ${
              isLiveTracking 
                ? 'bg-amber-600 border-amber-650 text-white shadow-md shadow-amber-600/10' 
                : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-50'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isLiveTracking ? 'animate-pulse' : ''}`} />
            <span>{isLiveTracking ? 'Live Sync Active' : 'Pause Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* REGIONAL GEO METRICS HUB (DYNAMIC DENSITY HUD) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-150">
        <div className="space-y-1">
          <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Active Municipal Nodes</p>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-xl font-black text-gray-900">{localTotal}</p>
            <span className="text-[10px] font-bold text-gray-405">Registered</span>
          </div>
          <p className="text-[9px] text-gray-400 font-extrabold max-w-[130px] line-clamp-1">{DISTRICT_CENTERS[selectedDistrict]?.desc || 'Monitored Segment'}</p>
        </div>

        <div className="border-l border-gray-200 pl-4 space-y-1">
          <p className="text-[9px] uppercase font-black text-green-700 tracking-wider">Approved & Verified</p>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-xl font-black text-green-600">{localVerified}</p>
            <span className="text-[9px] font-mono font-black text-green-700 bg-green-50 px-1.5 rounded">{localTotal > 0 ? Math.round((localVerified / localTotal) * 100) : 0}% Ok</span>
          </div>
          <p className="text-[9px] text-green-750 font-semibold">Active certificate compliance</p>
        </div>

        <div className="border-l border-gray-200 pl-4 space-y-1">
          <p className="text-[9px] uppercase font-black text-orange-700 tracking-wider">Audit Alert Quota</p>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-xl font-black text-orange-600">{localPending}</p>
            <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 rounded">Pending Reviews</span>
          </div>
          <p className="text-[9px] text-orange-750 font-semibold">Verification requested queue</p>
        </div>

        <div className="border-l border-gray-200 pl-4 space-y-1">
          <p className="text-[9px] uppercase font-black text-blue-700 tracking-wider">Mobile Logistics GPS</p>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-xl font-black text-blue-600">{localMobileCarts}</p>
            <span className="text-[9px] font-extrabold text-blue-500 bg-blue-50 px-1.5 rounded">Carts Tracked</span>
          </div>
          <p className="text-[9px] text-blue-750 font-semibold">Active coordinate simulation</p>
        </div>
      </div>

      {/* FILTER DIALS & MAIN MAP LAYOUT BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFTSIDE BAR: DYNAMIC STREET VENDORS SEARCH & SELECTION list (5 COLS) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-150 flex flex-col justify-between space-y-4 max-h-[600px] overflow-hidden">
          
          <div className="space-y-3 flex-grow flex flex-col overflow-hidden">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Geotag Search & Filter</p>
            
            {/* Embedded Search bar */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search district nodes..."
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl text-xs font-bold font-sans outline-none transition-all shadow-inner"
              />
            </div>

            {/* Quick Dials Row */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={vendingCategoryFilter}
                onChange={(e) => setVendingCategoryFilter(e.target.value)}
                className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-[10px] font-black text-gray-600 outline-none w-full uppercase"
              >
                <option value="">All Trades</option>
                <option value="fixed">Fixed</option>
                <option value="mobile">Mobile</option>
                <option value="seasonal">Seasonal</option>
                <option value="MSME">MSME</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-[10px] font-black text-gray-600 outline-none w-full uppercase"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Inner scroll node list */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Live Directory Index ({filteredDistrictVendors.length})</p>
              
              {filteredDistrictVendors.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Globe className="w-8 h-8 text-gray-300 mx-auto animate-spin" />
                  <p className="text-[11px] text-gray-400 font-bold">No nodes match filters.</p>
                </div>
              ) : (
                filteredDistrictVendors.map(vendor => {
                  const simulatedCoords = simulatedVendorsMap[vendor.id!] || { lat: vendor.location.lat, lng: vendor.location.lng };
                  const isSelected = selectedVendorHUD?.id === vendor.id;
                  const isMobile = vendor.vendingType === 'mobile' || vendor.businessType.includes('ঠেলা');

                  return (
                    <button
                      key={vendor.id}
                      onClick={() => {
                        setSelectedVendorHUD(vendor);
                        setHoveredVendor(vendor);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected 
                          ? 'border-amber-600 bg-amber-50 mr-1 shadow-sm' 
                          : 'border-transparent hover:bg-gray-50 bg-white/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Selfie thumbnail avatar */}
                        <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-orange-100 flex items-center justify-center relative">
                          {vendor.selfie ? (
                            <img src={vendor.selfie} className="w-full h-full object-cover" alt="Selfie" />
                          ) : (
                            <span className="text-[10px] font-black text-orange-600 uppercase">{vendor.name.charAt(0)}</span>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${isMobile ? 'bg-blue-500' : 'bg-amber-500'}`} title={isMobile ? "Mobile Vendor Node" : "Fixed Vendor Node"}></span>
                        </div>
                        
                        <div className="min-w-0 leading-tight">
                          <h4 className="font-extrabold text-xs text-gray-900 truncate pr-2 group-hover:text-amber-700 transition-colors">{vendor.name.split('(')[0]}</h4>
                          <span className="text-[9px] font-mono text-gray-400 font-extrabold tracking-wide uppercase">{vendor.id || 'Pending UID'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 leading-none space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          vendor.isVerified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-750'
                        }`}>
                          {vendor.isVerified ? 'OK' : 'WAIT'}
                        </span>
                        <span className="text-[8px] font-mono text-gray-550 font-extrabold">
                          {simulatedCoords.lat.toFixed(4)}, {simulatedCoords.lng.toFixed(4)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-gray-150 pt-3">
            <p className="text-[9px] text-gray-400 font-bold leading-normal italic text-center">
              *Double click nodes to run detailed administrative credentials audit.
            </p>
          </div>
        </div>

        {/* RIGHTSIDE GRIDMAP: VISUALLY RICH STREETS & GEOTAGGING DISPLAY PANEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          <div 
            ref={mapContainerRef}
            onMouseMove={handleMapMouseMove}
            onMouseLeave={handleMapMouseLeave}
            className="w-full h-[480px] bg-slate-950 border-4 border-slate-900 rounded-[36px] relative overflow-hidden flex flex-col justify-between p-6 shadow-inner select-none select-none relative"
            id="integrated-gis-vending-canvas"
          >
            {/* GRIDLINE & MAP PATTERN BACKGROUNDS */}
            <div className="absolute inset-0 bg-slate-950 pattern-grid pointer-events-none opacity-40"></div>
            
            {/* SUBTLE RADAR SWEEPS OVERLAY */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[380px] h-[380px] bg-transparent border border-emerald-500/10 rounded-full animate-ping duration-4000 opacity-20"></div>
              <div className="w-[200px] h-[200px] bg-transparent border border-emerald-500/15 rounded-full animate-ping duration-2000 opacity-25"></div>
              {/* Center District Watchtower Beacon */}
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-md animate-pulse"></div>
            </div>

            {/* HIGH-ACCURACY SCHEMATIC STREETS VECTOR GRAPHICS */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none stroke-current text-slate-700/60" viewBox="0 0 100 100" preserveAspectRatio="none">
              
              {/* Majestic Brahmaputra Flow overlay */}
              <path d="M 0,10 Q 30,8 55,22 T 100,28 L 100,0 L 0,0 Z" fill="#1e293b" opacity="0.35" className="stroke-none" />
              <path d="M 0,10 Q 30,8 55,22 T 100,28" stroke="#334155" strokeWidth="2.5" fill="none" />
              <path d="M 0,14 Q 30,12 55,26 T 100,32" stroke="#2a354c" strokeWidth="1" strokeDasharray="4 2" fill="none" />
              
              {/* Secondary Barak/Side Canal Waterway */}
              <path d="M 15,100 Q 25,60 55,22" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 3" fill="none" />

              {/* Major Highway Infrastructure Paths */}
              <line x1="0" y1="45" x2="100" y2="62" stroke="#475569" strokeWidth="2" />
              <line x1="12" y1="0" x2="88" y2="100" stroke="#475569" strokeWidth="2.5" />
              
              {/* Schematic Inner Ring Cross-Streets grid */}
              <path d="M 12,32 H 90" stroke="#334155" strokeWidth="1" />
              <path d="M 5,68 H 95" stroke="#334155" strokeWidth="1" />
              <path d="M 28,5 H 28 V 95" stroke="#334155" strokeWidth="0.8" />
              <path d="M 72,5 H 72 V 95" stroke="#334155" strokeWidth="0.8" />

              {/* Diagonal Connector Paths */}
              <line x1="45" y1="5" x2="95" y2="55" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="5" y1="40" x2="60" y2="95" stroke="#334155" strokeWidth="0.8" strokeDasharray="4 4" />
            </svg>

            {/* MUNICIPAL LABELS OVER STREET LAYOUTS */}
            <div className="absolute inset-0 p-8 pointer-events-none z-10 text-[9px] font-mono leading-none font-bold uppercase select-none tracking-widest text-slate-600">
              <span className="absolute top-1/4 left-5">{DISTRICT_CENTERS[selectedDistrict]?.places[0] || 'Vending Zone A'}</span>
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 transform rotate-12">{DISTRICT_CENTERS[selectedDistrict]?.places[1] || 'Main Avenue'}</span>
              <span className="absolute bottom-1/4 left-12">{DISTRICT_CENTERS[selectedDistrict]?.places[2] || 'Local Buffer C'}</span>
              <span className="absolute bottom-1/3 right-8">{DISTRICT_CENTERS[selectedDistrict]?.places[3] || 'Commercial Core'}</span>
              <span className="absolute top-8 right-6 font-semibold italic text-slate-500 lowercase">Brahmaputra Waterfront sector</span>
            </div>

            {/* ACTIVE TRAIL HISTORY DISPLAY DOTS (RENDERS TRACK HISTORY OF LIVE CARTS) */}
            {isLiveTracking && filteredDistrictVendors.map(v => {
              const tracker = simulatedVendorsMap[v.id!];
              if (!tracker || tracker.trail.length <= 1) return null;
              
              return tracker.trail.map((pt, index) => {
                const { x, y } = getCoordinatesPercent(pt.lat, pt.lng);
                // Render trailing dots with decreasing size and opacity
                const opacity = (index + 1) / tracker.trail.length * 0.45;
                const size = 3 + (index / tracker.trail.length) * 3;
                
                return (
                  <div
                    key={`trail-${v.id}-${index}`}
                    className="absolute rounded-full pointer-events-none bg-blue-400 z-10 shadow-inner"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      opacity: opacity,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              });
            })}

            {/* VENDORS COORDINATES MARKERS RENDERING (GPS OVERLAYS) */}
            {filteredDistrictVendors.map(vendor => {
              const simulatedCoords = simulatedVendorsMap[vendor.id!] || { lat: vendor.location.lat, lng: vendor.location.lng };
              const { x, y } = getCoordinatesPercent(simulatedCoords.lat, simulatedCoords.lng);
              
              const isSelected = selectedVendorHUD?.id === vendor.id;
              const isVerified = vendor.isVerified;
              const isMobile = vendor.vendingType === 'mobile' || vendor.businessType.includes('ঠেলা');

              return (
                <div
                  key={vendor.id}
                  className="absolute z-20 cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredVendor(vendor)}
                  onClick={() => {
                    setSelectedVendorHUD(vendor);
                    setHoveredVendor(vendor);
                  }}
                  onDoubleClick={() => onInspectVendor(vendor)}
                >
                  {/* Glowing Animated Beacon rings */}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-amber-500 ring-4 ring-amber-500/30 ring-offset-2 ring-offset-slate-950 scale-110 z-40' 
                      : 'bg-slate-900 border-2 hover:border-white hover:scale-105 hover:bg-slate-800'
                  } ${
                    isVerified ? 'border-emerald-500' : 'border-orange-500'
                  }`}
                  title={`${vendor.name || 'Vendor Profile'} - Click to scan`}
                  >
                    {/* Tiny visual inner category glyph */}
                    {isMobile ? (
                      <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : isVerified ? 'text-green-400' : 'text-orange-400'}`} />
                    ) : vendor.vendingType === 'seasonal' ? (
                      <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : isVerified ? 'text-green-400' : 'text-orange-400'}`} />
                    ) : vendor.businessType.includes('Fixed') || vendor.vendingType === 'fixed' ? (
                      <Store className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : isVerified ? 'text-green-400' : 'text-orange-400'}`} />
                    ) : (
                      <ShoppingBag className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : isVerified ? 'text-green-400' : 'text-orange-400'}`} />
                    )}

                    {/* Radial ping trail loop */}
                    <span className={`absolute -inset-2 rounded-full pointer-events-none opacity-25 animate-ping duration-2000 ${
                      isVerified ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}></span>
                  </div>

                  {/* Tiny high-contrast label overlayed inside grid for immediate oversight */}
                  {isSelected && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 shrink-0 p-2.5 rounded-xl border border-gray-150 shadow-xl max-w-[200px] z-50 text-center font-sans space-y-1">
                      <p className="text-[10px] font-black line-clamp-1 leading-none text-slate-900">{vendor.name.split('(')[0]}</p>
                      <p className="text-[9px] font-mono leading-none text-amber-600 font-extrabold">{vendor.id}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* RADAR SWEEPS DISPATCH ROUTING VECTOR */}
            {isDispatching && dispatchTarget && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Find target coords */}
                {(() => {
                  const simulatedCoords = simulatedVendorsMap[dispatchTarget.id!] || { lat: dispatchTarget.location.lat, lng: dispatchTarget.location.lng };
                  const { x, y } = getCoordinatesPercent(simulatedCoords.lat, simulatedCoords.lng);
                  
                  // Coordinate of center watchtower
                  const startX = 50;
                  const startY = 48;

                  // Dynamic point along progress line
                  const currentX = startX + (x - startX) * (dispatchProgress / 100);
                  const currentY = startY + (y - startY) * (dispatchProgress / 100);

                  return (
                    <>
                      {/* Faint static flightline overlay */}
                      <line 
                        x1={startX} y1={startY} x2={x} y2={y} 
                        stroke="#059669" strokeWidth="1.5" strokeDasharray="4 3" 
                        opacity="0.5" 
                      />
                      
                      {/* Active dispatch tracking path */}
                      <line 
                        x1={startX} y1={startY} x2={currentX} y2={currentY} 
                        stroke="#10B981" strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />

                      {/* Moving Dispatch Vehicle Icon Circle */}
                      <circle cx={currentX} cy={currentY} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    </>
                  );
                })()}
              </svg>
            )}

            {/* HUD OVERLAY PANELS FOR ACTION CENTERS */}
            
            {/* TOP BAR: MUNICIPAL COMMAND DESK CREDENTIALS HUD */}
            <div className="w-full flex items-center justify-between z-10 shrink-0 font-mono text-[9px] font-black tracking-wider leading-none">
              <div className="bg-slate-900/90 border border-slate-800 text-slate-300 p-3 rounded-2xl flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-gray-400">STATE:</span>
                <span className="text-amber-400 uppercase font-black">{selectedDistrict} AREA</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 text-slate-300 p-3 rounded-2xl flex items-center space-x-2">
                <Locate className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>ZONE SCANNER FEED: {filteredDistrictVendors.length} NODE(S) ACTIVE</span>
              </div>
            </div>

            {/* RADAR SCREEN CENTER NOTIFIER POPUP */}
            {isLiveTracking && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none shrink-0 z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.9, 1.15, 0.9] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-44 h-44 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center"
                >
                  <span className="text-[7.5px] font-mono tracking-widest text-emerald-600/40 uppercase font-extrabold">Active Geo-Ping</span>
                </motion.div>
              </div>
            )}

            {/* BOTTOM BAR: LIVE MATHEMATICAL COORDINATE FEED AT CURSOR */}
            <div className="w-full flex items-end justify-between z-10 shrink-0 font-mono text-[9px] font-black text-slate-500">
              <div className="bg-slate-900/95 border border-slate-800 text-slate-400 p-2.5 rounded-xl">
                {cursorCoords ? (
                  <span className="text-amber-400">
                    CURSOR GPS: {cursorCoords.lat.toFixed(6)}° N, {cursorCoords.lng.toFixed(6)}° E
                  </span>
                ) : (
                  <span>HOVER MAP FOR GPS TELESCOPE</span>
                )}
              </div>

              {/* Graphical Scale indicators */}
              <div className="bg-slate-900/95 border border-slate-800 text-slate-400 p-2.5 rounded-xl flex items-center space-x-2">
                <span>0.0</span>
                <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-amber-500 rounded-full"></div>
                <span>1.5 KM SECTOR</span>
              </div>
            </div>

          </div>

          {/* SIMULATED DISPATCH NOTIFICATION HUD */}
          {dispatchNotes && (
            <div className="p-4 bg-yellow-50 border border-yellow-250 rounded-2xl flex items-start space-x-2.5 shadow-sm text-xs font-semibold uppercase tracking-wide text-amber-800 animate-pulse">
              <Send className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <p className="leading-normal">{dispatchNotes}</p>
            </div>
          )}

        </div>
      </div>

      {/* FLOATING VENDOR DETAIL VIEW HUD (DYNAMIC ACTION FORM INSIDE FIELD) */}
      <AnimatePresence>
        {selectedVendorHUD && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="p-6 bg-white border-2 border-slate-100 rounded-[30px] shadow-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            id="gis-selected-vendor-overlay-hud"
          >
            {/* Avatar block */}
            <div className="md:col-span-3 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-[22px] overflow-hidden border border-gray-150 shrink-0 bg-amber-50 relative">
                {selectedVendorHUD.selfie ? (
                  <img src={selectedVendorHUD.selfie} className="w-full h-full object-cover" alt="Inspected selfie" />
                ) : (
                  <span className="text-xl font-black text-amber-600 flex justify-center pt-3 align-middle">{selectedVendorHUD.name.charAt(0)}</span>
                )}
                {selectedVendorHUD.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white" title="Verified active node">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-base text-gray-900 leading-tight flex items-center">
                  <span>{selectedVendorHUD.name.split('(')[0]}</span>
                  {selectedVendorHUD.isVerified && <ShieldCheck className="w-4.5 h-4.5 text-green-600 ml-1 shrink-0" />}
                </h3>
                <p className="text-[10px] font-mono font-black text-amber-600 tracking-wider uppercase mt-1">UID: {selectedVendorHUD.id}</p>
                <div className="flex items-center space-x-1.5 text-gray-500 font-bold text-[10px] mt-1 uppercase">
                  <span>+91 {selectedVendorHUD.mobile}</span>
                </div>
              </div>
            </div>

            {/* Details spec HUD fields */}
            <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm border-t md:border-t-0 md:border-x border-gray-200/50 py-4 md:py-0 md:px-6">
              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1.5">Trade Category</p>
                <p className="font-extrabold text-xs text-gray-800">{selectedVendorHUD.businessType.split('(')[0].trim()}</p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1.5">Primary Vocation</p>
                <p className="font-extrabold text-xs text-gray-800 line-clamp-1" title={selectedVendorHUD.profession}>{selectedVendorHUD.profession || 'Retail Merchant'}</p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1.5">GPS Geotag status</p>
                <p className="font-extrabold text-xs text-blue-600 flex items-center space-x-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Telemetered</span>
                </p>
              </div>

              <div className="col-span-2 sm:col-span-3">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1.5">Registered Vending Area</p>
                <p className="font-bold text-xs text-gray-700 leading-tight">{selectedVendorHUD.location.address}</p>
              </div>
            </div>

            {/* Quick action controllers */}
            <div className="md:col-span-3 flex flex-row md:flex-col gap-2.5 items-stretch justify-center w-full">
              
              <button
                onClick={() => handleTriggerDispatch(selectedVendorHUD)}
                disabled={isDispatching}
                className="flex-grow py-3.5 px-4 bg-indigo-600 text-white hover:bg-indigo-750 transition rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shrink-0 cursor-pointer text-center"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Ranger</span>
              </button>

              <button
                onClick={() => toggleMapVendorVerification(selectedVendorHUD.id!)}
                className={`flex-grow py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-center transition cursor-pointer border ${
                  selectedVendorHUD.isVerified 
                    ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-650 hover:text-white hover:border-red-650' 
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600'
                }`}
              >
                {selectedVendorHUD.isVerified ? 'Hold License' : 'Verify Certificate'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
