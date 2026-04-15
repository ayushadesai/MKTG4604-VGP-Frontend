import { useState, useEffect } from "react";
import type { ElementType } from "react";
import {
  ShoppingCart, MapPin, Package, Search,
  DollarSign, Tag, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, UserPlus, Heart, Users, Briefcase, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchMatches, RecommendationCard, getAllBuyers, BuyerInterestCard } from "../lib/api";
import RegisterBuyerModal from "./RegisterBuyerModal";

type Tab = "search" | "buyers";

export default function NonprofitView() {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // ── Search tab ────────────────────────────────────────────────────────────
  const [nonprofitName, setNonprofitName] = useState("");
  const [goodsNeeded, setGoodsNeeded] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [matches, setMatches] = useState<RecommendationCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // ── All Buyers tab ────────────────────────────────────────────────────────
  const [allBuyers, setAllBuyers] = useState<BuyerInterestCard[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersError, setBuyersError] = useState<string | null>(null);
  const [buyersLoaded, setBuyersLoaded] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState("all");

  // ── Persist search form ───────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("nonprofitFormData");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setNonprofitName(d.nonprofitName || "");
        setGoodsNeeded(d.goodsNeeded || "");
        setLocation(d.location || "");
        setQuantity(d.quantity || "");
        setBudget(d.budget || "");
        setIsPurchasing(d.isPurchasing || false);
        setMinPrice(d.minPrice || "");
        setMaxPrice(d.maxPrice || "");
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nonprofitFormData", JSON.stringify({
      nonprofitName, goodsNeeded, location, quantity, budget, isPurchasing, minPrice, maxPrice,
    }));
  }, [nonprofitName, goodsNeeded, location, quantity, budget, isPurchasing, minPrice, maxPrice]);

  // Load buyers the first time the tab opens
  useEffect(() => {
    if (activeTab === "buyers" && !buyersLoaded) loadAllBuyers();
  }, [activeTab]);

  const loadAllBuyers = async () => {
    setBuyersLoading(true);
    setBuyersError(null);
    try {
      const data = await getAllBuyers();
      setAllBuyers(data);
      setBuyersLoaded(true);
    } catch (e) {
      setBuyersError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setBuyersLoading(false);
    }
  };

  // ── Search handlers ───────────────────────────────────────────────────────
  const handleFindMatches = async () => {
    if (!goodsNeeded.trim() || isLoading) return;
    setIsLoading(true);
    setApiError(null);
    setExpandedCards(new Set());
    try {
      const r = await fetchMatches({
        queryText: goodsNeeded, location, quantity, budget,
        isPurchasing, minPrice, maxPrice, organizationName: nonprofitName,
      });
      setMatches(r.recommendations);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Search failed");
      setMatches([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleClearResults = () => {
    setMatches([]);
    setHasSearched(false);
    setApiError(null);
    setExpandedCards(new Set());
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const segmentCounts = allBuyers.reduce<Record<string, number>>((a, b) => {
    a[b.segment] = (a[b.segment] || 0) + 1;
    return a;
  }, {});

  const filteredBuyers = segmentFilter === "all"
    ? allBuyers
    : allBuyers.filter(b => b.segment === segmentFilter);

  const segCfg = (seg: string) => ({
    nonprofit: { label: "Nonprofit", icon: Heart,    bg: "bg-rose-50 text-rose-700 border-rose-200" },
    reseller:  { label: "Reseller",  icon: Tag,      bg: "bg-blue-50 text-blue-700 border-blue-200" },
    smb:       { label: "Business",  icon: Briefcase, bg: "bg-purple-50 text-purple-700 border-purple-200" },
  }[seg] ?? { label: seg, icon: Users, bg: "bg-gray-100 text-gray-600 border-gray-200" });

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-gray-900 text-2xl font-bold">I'm a Buyer</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Tell us what you need and we'll connect you with businesses that have that surplus available
          </p>
        </div>

        {/* Tab bar + register */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "search" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search className="w-3.5 h-3.5" />Find Available
            </button>
            <button
              onClick={() => setActiveTab("buyers")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "buyers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />All Buyers
              {allBuyers.length > 0 && (
                <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-medium">
                  {allBuyers.length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-emerald-300 transition-all text-sm text-gray-600 font-medium"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />Register as a Buyer
          </button>
        </div>

        {/* ── FIND AVAILABLE TAB ────────────────────────────────────────── */}
        {activeTab === "search" && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Your Details</h3>
              <div className="space-y-4">

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Organization Name</label>
                  <input
                    type="text" placeholder="e.g., Local Food Bank, Tech Resale" value={nonprofitName}
                    onChange={e => setNonprofitName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <Package className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />What Do You Need?
                    </label>
                    <input
                      type="text" placeholder="e.g., food, computers, clothing" value={goodsNeeded}
                      onChange={e => setGoodsNeeded(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleFindMatches()}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Quantity <span className="font-normal text-gray-400 normal-case">(optional)</span>
                    </label>
                    <input
                      type="text" placeholder="e.g., 200 daily, 500 units" value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />Location
                    </label>
                    <input
                      type="text" placeholder="e.g., Boston, MA" value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <Tag className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />Type of Purchase
                    </label>
                    <div className="flex gap-2">
                      {([false, true] as const).map(val => (
                        <button key={String(val)} onClick={() => setIsPurchasing(val)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isPurchasing === val ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          {val ? "Paying" : "Free"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isPurchasing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-700 mb-3">Price range</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-xs text-gray-600"><DollarSign className="w-3 h-3 inline mr-0.5" />Min</label>
                            <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0"
                              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs text-gray-600"><DollarSign className="w-3 h-3 inline mr-0.5" />Max</label>
                            <input type="number" placeholder="5000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0"
                              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {!isPurchasing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div>
                        <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Budget <span className="font-normal text-gray-400 normal-case">(optional)</span>
                        </label>
                        <input type="text" placeholder="e.g., $5,000" value={budget} onChange={e => setBudget(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleFindMatches} disabled={!goodsNeeded.trim() || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-semibold text-sm transition-all"
                  >
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Searching…</> : <><Search className="w-4 h-4" />Find Available</>}
                  </button>
                  {hasSearched && (
                    <button onClick={handleClearResults}
                      className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Search failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {hasSearched && !apiError && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {matches.length > 0 ? `Found ${matches.length} source${matches.length !== 1 ? "s" : ""}` : "No matches found"}
                    </h3>
                    {matches.length > 0 && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Showing best matches for <span className="font-medium text-gray-700">"{goodsNeeded}"</span>
                      </p>
                    )}
                  </div>
                  {matches.length === 0 && (
                    <p className="text-sm text-gray-500 max-w-xs text-right">
                      Try "food", "electronics", "clothing", or "furniture"
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {matches.map((card, index) => {
                    const isExpanded = expandedCards.has(card.item_id);
                    const score = card.composite_score;
                    const scoreLabel = score >= 0.75 ? "Strong" : score >= 0.5 ? "Good" : "Moderate";
                    const scoreBg = score >= 0.75 ? "bg-emerald-100 text-emerald-800" : score >= 0.5 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800";
                    return (
                      <motion.div key={card.item_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.07 }}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all shadow-sm">
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">{index + 1}</div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm leading-snug">{card.title}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">{card.category}</span>
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{card.condition}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-emerald-700 leading-tight">{card.price === 0 ? "Free" : `$${card.price.toFixed(2)}`}</div>
                              {card.price > 0 && <div className="text-xs text-gray-400">per unit</div>}
                              <div className="text-xs text-gray-500 mt-1 font-medium">{card.quantity.toLocaleString()} avail.</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${scoreBg}`}>{scoreLabel} match</span>
                          </div>
                        </div>
                        <button onClick={() => toggleCard(card.item_id)}
                          className="w-full flex items-center justify-between gap-2 px-5 py-3 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors border-t border-gray-100 font-medium">
                          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />AI Recommendation</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-5 pb-5 pt-3 bg-emerald-50/60 border-t border-emerald-100">
                                <p className="text-sm text-gray-700 leading-relaxed">{card.recommendation_text}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {matches.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Need something different?{" "}
                      <button onClick={() => { handleClearResults(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-emerald-700 font-semibold hover:underline">
                        Search again
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* ── ALL BUYERS TAB ────────────────────────────────────────────────── */}
        {activeTab === "buyers" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Buyer Network</h3>
                  <p className="text-sm text-gray-500 mt-0.5">All registered buyers and what they're looking for</p>
                </div>
                <button onClick={() => { setBuyersLoaded(false); loadAllBuyers(); }} disabled={buyersLoading}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium disabled:opacity-50 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${buyersLoading ? "animate-spin" : ""}`} />Refresh
                </button>
              </div>

              {allBuyers.length > 0 && (
                <>
                  {/* Segment stat cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { seg: "nonprofit", label: "Nonprofits",  icon: Heart,     color: "bg-rose-50 border-rose-200 text-rose-700" },
                      { seg: "reseller",  label: "Resellers",   icon: Tag,       color: "bg-blue-50 border-blue-200 text-blue-700" },
                      { seg: "smb",       label: "Businesses",  icon: Briefcase, color: "bg-purple-50 border-purple-200 text-purple-700" },
                    ].map(({ seg, label, icon: Icon, color }) => (
                      <button key={seg}
                        onClick={() => setSegmentFilter(segmentFilter === seg ? "all" : seg)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                          segmentFilter === seg ? color + " shadow-sm" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="text-lg font-bold leading-tight">{segmentCounts[seg] || 0}</div>
                          <div className="text-xs font-medium">{label}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Filter pills */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSegmentFilter("all")}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        segmentFilter === "all" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                      }`}>
                      All ({allBuyers.length})
                    </button>
                    {Object.entries(segmentCounts).map(([seg, count]) => {
                      const cfg = segCfg(seg);
                      return (
                        <button key={seg} onClick={() => setSegmentFilter(segmentFilter === seg ? "all" : seg)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                            segmentFilter === seg ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                          }`}>
                          {cfg.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {buyersLoading && <LoadingState label="Loading buyer network…" />}
            {buyersError && <ErrorState message={buyersError} />}
            {!buyersLoading && !buyersError && allBuyers.length === 0 && (
              <EmptyState icon={Users} label="No buyers registered yet" sub="Buyers appear here after creating a profile" />
            )}

            {!buyersLoading && filteredBuyers.length > 0 && (
              <div className="space-y-3">
                {filteredBuyers.map((buyer, i) => {
                  const cfg = segCfg(buyer.segment);
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={`buyer-${i}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${cfg.bg}`}>
                              <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                            {buyer.location && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{buyer.location}
                              </span>
                            )}
                          </div>
                          {buyer.wants && (
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{buyer.wants}</p>
                          )}
                          {buyer.preferences.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {buyer.preferences.map(p => (
                                <span key={p} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {!buyersLoading && allBuyers.length > 0 && filteredBuyers.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400">No buyers in this segment</div>
            )}
          </motion.div>
        )}

      </motion.div>
    </div>
    {showRegister && <RegisterBuyerModal onClose={() => setShowRegister(false)} />}
    </>
  );
}

// ── Shared micro-components ────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800">Error</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label, sub }: { icon: ElementType; label: string; sub: string }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
