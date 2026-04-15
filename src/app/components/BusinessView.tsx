import { useState, useEffect } from "react";
import {
  Building2, Package, DollarSign, Search,
  AlertCircle, MapPin, Loader2, Heart, Users, Briefcase, Tag,
  Plus, Upload, Database, RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { searchInterestedBuyers, getAllBuyers, BuyerInterestCard } from "../lib/api";
import AddItemModal from "./AddItemModal";
import BulkUploadModal from "./BulkUploadModal";
import RegisterBusinessModal from "./RegisterBusinessModal";

type Tab = "search" | "data";

export default function BusinessView() {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // ── Search tab state ──────────────────────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [inventory, setInventory] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyers, setBuyers] = useState<BuyerInterestCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Data tab state ────────────────────────────────────────────────────────
  const [allBuyers, setAllBuyers] = useState<BuyerInterestCard[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showAddItem, setShowAddItem] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showRegisterBusiness, setShowRegisterBusiness] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("businessFormData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompanyName(data.companyName || "");
        setInventory(data.inventory || "");
        setLocation(data.location || "");
        setEstimatedValue(data.estimatedValue || "");
        setQuantity(data.quantity || "");
      } catch {}
    }
  }, []);

  useEffect(() => {
    const formData = { companyName, inventory, location, estimatedValue, quantity };
    localStorage.setItem("businessFormData", JSON.stringify(formData));
  }, [companyName, inventory, location, estimatedValue, quantity]);

  // Load all buyers when the data tab is first opened
  useEffect(() => {
    if (activeTab === "data" && !dataLoaded) {
      loadAllBuyers();
    }
  }, [activeTab]);

  const loadAllBuyers = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const result = await getAllBuyers();
      setAllBuyers(result);
      setDataLoaded(true);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load buyers");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!inventory.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const result = await searchInterestedBuyers(inventory);
      setBuyers(result.buyers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBuyers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setBuyers([]);
    setHasSearched(false);
    setError(null);
  };

  const filteredBuyers = segmentFilter === "all"
    ? allBuyers
    : allBuyers.filter((b) => b.segment === segmentFilter);

  const segmentCounts = allBuyers.reduce<Record<string, number>>((acc, b) => {
    acc[b.segment] = (acc[b.segment] || 0) + 1;
    return acc;
  }, {});


  return (
    <>
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-gray-900 text-2xl font-bold">For Businesses</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Tell us what excess you have available — we'll connect you with the best buyers
          </p>
        </div>

        {/* Register + Tabs row */}
        <div className="flex items-center justify-between mb-4">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "search"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Find Matches
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "data"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              All Buyers
              {allBuyers.length > 0 && (
                <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-medium">
                  {allBuyers.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowRegisterBusiness(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-300 transition-all text-sm text-gray-600 font-medium"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Register as a Business
          </button>
        </div>

        {/* ── FIND MATCHES TAB ─────────────────────────────────────────────── */}
        {activeTab === "search" && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Your Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ABC Corp, Local Bakery"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <Package className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                      Item Available
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., doughnuts, laptops, clothing"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFindMatches()}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Quantity <span className="font-normal text-gray-400 normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500 daily, 1000 units"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Boston, MA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <DollarSign className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                      Estimated Value <span className="font-normal text-gray-400 normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., $5,000"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      onClick={handleFindMatches}
                      disabled={!inventory.trim() || isLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 active:bg-emerald-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-semibold text-sm"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Searching…</>
                      ) : (
                        <><Search className="w-4 h-4" />Find Matches</>
                      )}
                    </button>
                    {hasSearched && (
                      <button
                        onClick={handleClearResults}
                        className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-300 transition-all text-sm text-gray-600 font-medium"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowBulkUpload(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-300 transition-all text-sm text-gray-600 font-medium"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      Bulk Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Could not fetch matches</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {hasSearched && !error && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {buyers.length > 0
                        ? `${buyers.length} organization${buyers.length !== 1 ? "s" : ""} want this`
                        : "No matches found"}
                    </h3>
                    {buyers.length > 0 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Buyers & nonprofits looking for <span className="font-medium text-gray-700">"{inventory}"</span>
                      </p>
                    )}
                  </div>
                  {buyers.length === 0 && (
                    <p className="text-sm text-gray-500 max-w-xs text-right">
                      Try a different item type or keyword
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {buyers.map((buyer, index) => <BuyerCard key={`${buyer.org_name}-${index}`} buyer={buyer} index={index} />)}
                </div>

                {buyers.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Have different inventory?{" "}
                      <button
                        onClick={() => { handleClearResults(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Search again
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* ── ALL BUYERS DATA TAB ───────────────────────────────────────────── */}
        {activeTab === "data" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Buyer Demand Database</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    All registered buyers and what they're looking for
                  </p>
                </div>
                <button
                  onClick={() => { setDataLoaded(false); loadAllBuyers(); }}
                  disabled={dataLoading}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Segment summary stats */}
              {allBuyers.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { seg: "nonprofit", label: "Nonprofits",  icon: Heart,    color: "bg-rose-50 border-rose-200 text-rose-700" },
                    { seg: "reseller",  label: "Resellers",   icon: Tag,      color: "bg-blue-50 border-blue-200 text-blue-700" },
                    { seg: "smb",       label: "Businesses",  icon: Briefcase, color: "bg-purple-50 border-purple-200 text-purple-700" },
                  ].map(({ seg, label, icon: Icon, color }) => (
                    <button
                      key={seg}
                      onClick={() => setSegmentFilter(segmentFilter === seg ? "all" : seg)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                        segmentFilter === seg
                          ? color + " shadow-sm"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="text-lg font-bold leading-tight">{segmentCounts[seg] || 0}</div>
                        <div className="text-xs font-medium">{label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Filter pills */}
              {allBuyers.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    onClick={() => setSegmentFilter("all")}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                      segmentFilter === "all"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                    }`}
                  >
                    All ({allBuyers.length})
                  </button>
                  {Object.entries(segmentCounts).map(([seg, count]) => {
                    const cfg = getSegCfg(seg);
                    return (
                      <button
                        key={seg}
                        onClick={() => setSegmentFilter(segmentFilter === seg ? "all" : seg)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                          segmentFilter === seg
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                        }`}
                      >
                        {cfg.label} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {dataLoading && (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm">Loading buyer database…</span>
              </div>
            )}

            {dataError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Could not load buyers</p>
                  <p className="text-sm text-red-600 mt-0.5">{dataError}</p>
                </div>
              </div>
            )}

            {!dataLoading && !dataError && allBuyers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-500">No buyers registered yet</p>
                <p className="text-xs text-gray-400 mt-1">Buyers appear here after they create a profile</p>
              </div>
            )}

            {!dataLoading && filteredBuyers.length > 0 && (
              <div className="space-y-3">
                {filteredBuyers.map((buyer, index) => (
                  <BuyerDataCard key={`data-${buyer.org_name}-${index}`} buyer={buyer} index={index} />
                ))}
              </div>
            )}

            {!dataLoading && allBuyers.length > 0 && filteredBuyers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No buyers in this segment
              </div>
            )}
          </motion.div>
        )}

      </motion.div>
    </div>

    {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
    {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} />}
    {showRegisterBusiness && <RegisterBusinessModal onClose={() => setShowRegisterBusiness(false)} />}
    </>
  );
}

// ── Shared segment config ─────────────────────────────────────────────────────

function getSegCfg(segment: string) {
  return ({
    nonprofit: { label: "Nonprofit", icon: Heart,    bg: "bg-rose-50 text-rose-700 border-rose-200" },
    reseller:  { label: "Reseller",  icon: Tag,      bg: "bg-blue-50 text-blue-700 border-blue-200" },
    smb:       { label: "Business",  icon: Briefcase, bg: "bg-purple-50 text-purple-700 border-purple-200" },
  } as Record<string, { label: string; icon: typeof Heart; bg: string }>)[segment]
    ?? { label: segment, icon: Users, bg: "bg-gray-100 text-gray-600 border-gray-200" };
}

// ── Shared buyer card (search results) ────────────────────────────────────────

function BuyerCard({ buyer, index }: { buyer: BuyerInterestCard; index: number }) {
  const segCfg = getSegCfg(buyer.segment);

  const strengthBg =
    buyer.match_strength === "Strong"   ? "bg-emerald-100 text-emerald-800" :
    buyer.match_strength === "Good"     ? "bg-blue-100 text-blue-800" :
                                          "bg-amber-100 text-amber-800";
  const Icon = segCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm leading-snug">{buyer.org_name}</h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${segCfg.bg}`}>
                <Icon className="w-3 h-3" />
                {segCfg.label}
              </span>
              {buyer.location && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {buyer.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${strengthBg}`}>
          {buyer.match_strength} match
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{buyer.wants}</p>

      {buyer.preferences.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {buyer.preferences.map((pref) => (
            <span key={pref} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              {pref}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Data tab buyer card ────────────────────────────────────────────────────────

function BuyerDataCard({ buyer, index }: { buyer: BuyerInterestCard; index: number }) {
  const segCfg = getSegCfg(buyer.segment);

  const Icon = segCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${segCfg.bg}`}>
                <Icon className="w-3 h-3" />
                {segCfg.label}
              </span>
              {buyer.location && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {buyer.location}
                </span>
              )}
            </div>
          </div>

          {buyer.wants && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{buyer.wants}</p>
          )}

          {buyer.preferences.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {buyer.preferences.map((pref) => (
                <span key={pref} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  {pref}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
