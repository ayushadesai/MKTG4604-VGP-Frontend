import { useState, useEffect, useCallback } from "react";
import {
  Building2, Package, Plus, Bell, Loader2, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Tag, MapPin,
  Calendar, RefreshCw, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  getRetailerToken, clearRetailerToken,
  getOwnInventory, uploadInventoryItem, updateItemStatus,
  getRetailerAlerts, markAlertRead,
  InventoryItem, RetailerAlert, InventoryUploadPayload,
} from "../lib/api";

// ── Seeded demo retailers ──────────────────────────────────────────────────────

const DEMO_RETAILERS = [
  { email: "dunkin@demo.com",       name: "Dunkin" },
  { email: "wholefoods@demo.com",   name: "Whole Foods" },
  { email: "stopshop@demo.com",     name: "Stop & Shop" },
  { email: "marketbasket@demo.com", name: "Market Basket" },
  { email: "hm@demo.com",           name: "H&M" },
  { email: "newbalance@demo.com",   name: "New Balance" },
  { email: "tjx@demo.com",          name: "TJX Companies" },
  { email: "tatte@demo.com",        name: "Tatte Bakery" },
  { email: "mikespastry@demo.com",  name: "Mike's Pastry" },
  { email: "bostonbeer@demo.com",   name: "Boston Beer Company" },
  { email: "polar@demo.com",        name: "Polar Beverages" },
  { email: "cvs@demo.com",          name: "CVS Health" },
  { email: "staples@demo.com",      name: "Staples" },
  { email: "bose@demo.com",         name: "Bose" },
] as const;

const RETAILER_PASSWORD = "Test1234!";

const CONDITIONS = ["new", "like_new", "good", "fair", "poor"] as const;
const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800",
  sold:      "bg-gray-100 text-gray-600",
  expired:   "bg-red-100 text-red-700",
};

const SCORE_STYLE: Record<string, string> = {
  Strong:   "bg-emerald-100 text-emerald-800",
  Good:     "bg-blue-100 text-blue-800",
  Moderate: "bg-amber-100 text-amber-800",
};

// ── Empty upload form ──────────────────────────────────────────────────────────

function emptyForm(): InventoryUploadPayload {
  const thirtyDays = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  return {
    title: "",
    category: "",
    quantity: 0,
    price: 0,
    condition: "good",
    expiry_date: thirtyDays,
    description: "",
    location: "",
  };
}

// ── Upload form component ──────────────────────────────────────────────────────

interface UploadFormProps {
  onSubmit: (payload: InventoryUploadPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

function UploadForm({ onSubmit, onCancel, isSubmitting, error }: UploadFormProps) {
  const [form, setForm] = useState<InventoryUploadPayload>(emptyForm());

  const set = (field: keyof InventoryUploadPayload, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      expiry_date: new Date(form.expiry_date + "T23:59:59Z").toISOString(),
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onSubmit={handleSubmit}
      className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          Add Surplus Item
        </h3>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Item Title *</label>
            <input
              required
              type="text"
              placeholder="e.g., Surplus Assorted Pastries"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Category *</label>
            <input
              required
              type="text"
              placeholder="e.g., Food & Beverage"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Quantity + Price + Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity *</label>
            <input
              required
              type="number"
              min={1}
              placeholder="500"
              value={form.quantity || ""}
              onChange={(e) => set("quantity", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Price / unit ($) *</label>
            <input
              required
              type="number"
              min={0}
              step={0.01}
              placeholder="1.50"
              value={form.price || ""}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Condition *</label>
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiry + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
              Expiry Date *
            </label>
            <input
              required
              type="date"
              value={typeof form.expiry_date === "string" ? form.expiry_date.slice(0, 10) : ""}
              onChange={(e) => set("expiry_date", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., Boston, MA"
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
          <textarea
            rows={2}
            placeholder="Describe the item — this helps buyers find it via search"
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-semibold text-sm"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Plus className="w-4 h-4" />Add Item</>}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

// ── Inventory tab ──────────────────────────────────────────────────────────────

interface InventoryTabProps {
  retailerToken: string;
}

function InventoryTab({ retailerToken }: InventoryTabProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnInventory(retailerToken);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [retailerToken]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (payload: InventoryUploadPayload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await uploadInventoryItem(retailerToken, payload);
      setShowForm(false);
      await load();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSold = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      await updateItemStatus(retailerToken, itemId, "sold");
      setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: "sold" } : it));
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />Loading inventory…
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800">Could not load inventory</p>
        <p className="text-sm text-red-600 mt-0.5">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {items.length} item{items.length !== 1 ? "s" : ""} listed
        </p>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
          <button
            onClick={() => { setShowForm(true); setSubmitError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />Add Item
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <UploadForm
            onSubmit={handleUpload}
            onCancel={() => setShowForm(false)}
            isSubmitting={submitting}
            error={submitError}
          />
        )}
      </AnimatePresence>

      {items.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No items listed yet</p>
          <p className="text-xs mt-1">Click "Add Item" to post your first surplus listing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            const days = daysUntil(item.expiry_date);
            const expiryWarning = item.status === "available" && days <= 7;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {item.status}
                        </span>
                        {expiryWarning && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                            Expires in {days}d
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />{item.category}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{item.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />Expires {formatDate(item.expiry_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-emerald-700">
                        {item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`}
                      </div>
                      {item.price > 0 && <div className="text-xs text-gray-400">per unit</div>}
                      <div className="text-xs text-gray-500 mt-1 font-medium">
                        {item.quantity.toLocaleString()} units
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                      {CONDITION_LABELS[item.condition] ?? item.condition}
                    </span>
                    {item.status === "available" && (
                      <button
                        onClick={() => handleMarkSold(item.id)}
                        disabled={updatingId === item.id}
                        className="text-xs px-3 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 ml-auto"
                      >
                        {updatingId === item.id ? "Updating…" : "Mark as Sold"}
                      </button>
                    )}
                  </div>
                </div>

                {item.description && (
                  <>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full flex items-center justify-between gap-2 px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <span>Description</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Alerts tab ─────────────────────────────────────────────────────────────────

interface AlertsTabProps {
  retailerToken: string;
}

function AlertsTab({ retailerToken }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<RetailerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRetailerAlerts(retailerToken);
      setAlerts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [retailerToken]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (alertId: string) => {
    setMarkingId(alertId);
    try {
      await markAlertRead(retailerToken, alertId);
      setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, is_read: true } : a));
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />Loading alerts…
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800">Could not load alerts</p>
        <p className="text-sm text-red-600 mt-0.5">{error}</p>
      </div>
    </div>
  );

  const unread = alerts.filter((a) => !a.is_read);
  const read = alerts.filter((a) => a.is_read);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {unread.length} new alert{unread.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No buyer interest yet</p>
          <p className="text-xs mt-1">Alerts appear here when buyers search for your items</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Tip: run a buyer search first, then refresh</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...unread, ...read].map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                alert.is_read ? "border-gray-200 opacity-70" : "border-emerald-200 ring-1 ring-emerald-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.is_read ? "bg-gray-300" : "bg-emerald-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{alert.item_title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${SCORE_STYLE[alert.match_score_label] ?? "bg-gray-100 text-gray-600"}`}>
                        {alert.match_score_label} match
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.match_count} buyer{alert.match_count !== 1 ? "s" : ""} interested
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(alert.created_at)}</span>
                    </div>
                  </div>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => handleMarkRead(alert.id)}
                    disabled={markingId === alert.id}
                    className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium disabled:opacity-40 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {markingId === alert.id ? "Marking…" : "Mark read"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main RetailerView ──────────────────────────────────────────────────────────

export default function RetailerView() {
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [retailerToken, setRetailerToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inventory" | "alerts">("inventory");

  const selectedRetailer = DEMO_RETAILERS.find((r) => r.email === selectedEmail);

  const handleSelectRetailer = async (email: string) => {
    if (!email) { setSelectedEmail(""); setRetailerToken(null); return; }
    setSelectedEmail(email);
    setAuthLoading(true);
    setAuthError(null);
    setRetailerToken(null);
    try {
      const token = await getRetailerToken(email, RETAILER_PASSWORD);
      setRetailerToken(token);
    } catch {
      setAuthError("Could not authenticate — is the backend running with seeded data?");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSwitchRetailer = () => {
    if (selectedEmail) clearRetailerToken(selectedEmail);
    setSelectedEmail("");
    setRetailerToken(null);
    setAuthError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-gray-900 text-2xl font-bold">For Businesses</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            List your surplus, track your inventory, and see which buyers are interested
          </p>
        </div>

        {/* Retailer picker */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Select Your Organization</h3>
          {!retailerToken ? (
            <div className="space-y-3">
              <select
                value={selectedEmail}
                onChange={(e) => handleSelectRetailer(e.target.value)}
                disabled={authLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              >
                <option value="">— Choose a retailer to demo —</option>
                {DEMO_RETAILERS.map((r) => (
                  <option key={r.email} value={r.email}>{r.name}</option>
                ))}
              </select>
              {authLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  Signing in as {DEMO_RETAILERS.find((r) => r.email === selectedEmail)?.name}…
                </div>
              )}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {selectedRetailer?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedRetailer?.name}</p>
                  <p className="text-xs text-gray-400">{selectedEmail}</p>
                </div>
              </div>
              <button
                onClick={handleSwitchRetailer}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Switch retailer
              </button>
            </div>
          )}
        </div>

        {/* Tabs + Content */}
        {retailerToken && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit border border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 px-5 py-2 rounded-md transition-all font-medium text-sm ${
                  activeTab === "inventory"
                    ? "bg-[#16664E] text-white shadow-md"
                    : "text-[#64748B] hover:text-[#16664E] hover:bg-white"
                }`}
              >
                <Package className="w-4 h-4" />My Inventory
              </button>
              <button
                onClick={() => setActiveTab("alerts")}
                className={`flex items-center gap-2 px-5 py-2 rounded-md transition-all font-medium text-sm ${
                  activeTab === "alerts"
                    ? "bg-[#1F7A63] text-white shadow-md"
                    : "text-[#64748B] hover:text-[#1F7A63] hover:bg-white"
                }`}
              >
                <Bell className="w-4 h-4" />Buyer Interest
              </button>
            </div>

            {activeTab === "inventory"
              ? <InventoryTab retailerToken={retailerToken} />
              : <AlertsTab retailerToken={retailerToken} />
            }
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
