import { useState } from "react";
import { X, Loader2, CheckCircle, Plus } from "lucide-react";
import { registerBuyer } from "../lib/api";

interface Props {
  onClose: () => void;
}

const SEGMENT_OPTIONS = [
  { value: "nonprofit", label: "Nonprofit / Charity", description: "Food banks, shelters, community orgs" },
  { value: "reseller",  label: "Reseller",            description: "Thrift stores, online sellers, distributors" },
  { value: "smb",       label: "Small Business",      description: "Restaurants, gyms, boutiques" },
] as const;

const COMMON_PREFERENCES = [
  "Food & Beverage", "Baked Goods", "Produce", "Canned Goods", "Beverages",
  "Men's Clothing", "Women's Clothing", "Men's Athletic Apparel", "Women's Athletic Apparel",
  "Men's Outerwear", "Men's Footwear", "Women's Footwear",
  "Makeup & Cosmetics", "Beauty & Skincare", "Men's Grooming",
  "Home Goods", "Electronics", "Office Supplies",
];

export default function RegisterBuyerModal({ onClose }: Props) {
  const [step, setStep] = useState<"account" | "profile" | "done">("account");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [segment, setSegment] = useState<"nonprofit" | "reseller" | "smb">("nonprofit");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState("");
  const [budgetType, setBudgetType] = useState<"free" | "paying">("free");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const togglePref = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const addCustomPref = () => {
    const p = customPref.trim();
    if (p && !preferences.includes(p)) {
      setPreferences((prev) => [...prev, p]);
      setCustomPref("");
    }
  };

  const handleAccountNext = () => {
    if (!email || !password) { setError("Email and password are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setStep("profile");
  };

  const handleSubmit = async () => {
    if (preferences.length === 0) { setError("Select at least one item category you need."); return; }
    const budMin = budgetType === "free" ? 0 : parseFloat(budgetMin) || 0;
    const budMax = budgetType === "free" ? 0 : parseFloat(budgetMax) || 0;
    if (budgetType === "paying" && budMax <= budMin) {
      setError("Max budget must be greater than min budget.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await registerBuyer({
        email,
        password,
        segment,
        preferences,
        budget_min: budMin,
        budget_max: budMax,
        location: location || undefined,
        notes: notes || undefined,
      });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Register as a Buyer</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === "account" ? "Step 1 of 2 — Create your account" : step === "profile" ? "Step 2 of 2 — Your buying profile" : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === "account" && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAccountNext()}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleAccountNext}
              disabled={!email || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {step === "profile" && (
          <div className="p-5 space-y-5">
            {/* Segment */}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">Organization Type *</label>
              <div className="space-y-2">
                {SEGMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSegment(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      segment === opt.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">What Do You Need? *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => togglePref(pref)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      preferences.includes(pref)
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPref}
                  onChange={(e) => setCustomPref(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomPref()}
                  placeholder="Add custom category…"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
                <button onClick={addCustomPref} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget Type *</label>
              <div className="flex gap-2 mb-3">
                {(["free", "paying"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBudgetType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      budgetType === t ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t === "free" ? "Seeking Free / Donated" : "Willing to Pay"}
                  </button>
                ))}
              </div>
              {budgetType === "paying" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500">Min ($)</label>
                    <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="0" min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500">Max ($)</label>
                    <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="5000" min="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Boston, MA"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all" />
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">About Your Organization</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Describe your organization and what you're looking for…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all resize-none" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setStep("account"); setError(""); }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={preferences.length === 0 || isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</> : "Create Account"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">You're registered!</h3>
            <p className="text-sm text-gray-500 mb-1">Account created for <span className="font-medium">{email}</span>.</p>
            <p className="text-sm text-gray-500 mb-5">You can now search for available surplus using your buyer profile.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all">
              Start Searching
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
