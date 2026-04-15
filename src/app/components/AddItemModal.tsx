import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { getRetailerToken, uploadInventoryItem } from "../lib/api";

interface Props {
  onClose: () => void;
}

const CONDITIONS = ["new", "like_new", "good", "fair"];
const CATEGORIES = [
  "Food & Beverage", "Baked Goods", "Produce", "Dairy", "Beverages",
  "Canned Goods", "Prepared Foods", "Packaged Groceries", "Bulk Dry Goods",
  "Makeup & Cosmetics", "Beauty & Skincare", "Beauty & Hair Care",
  "Men's Clothing", "Women's Clothing", "Men's Athletic Apparel",
  "Women's Athletic Apparel", "Men's Outerwear", "Men's Footwear",
  "Women's Footwear", "Men's Grooming", "Men's Underwear & Basics",
  "Apparel", "Home Goods", "Electronics", "Office Supplies",
  "Outdoor & Sporting Goods", "Health & Wellness", "Other",
];

export default function AddItemModal({ onClose }: Props) {
  const [step, setStep] = useState<"auth" | "item" | "done">("auth");
  const [retailerToken, setRetailerToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food & Beverage");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("good");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleAuth = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setAuthError("");
    try {
      const token = await getRetailerToken(email, password);
      setRetailerToken(token);
      setStep("item");
    } catch {
      setAuthError("Invalid retailer credentials. Make sure your account is registered as a business.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !quantity || !expiryDate) return;
    setIsLoading(true);
    setSubmitError("");
    try {
      await uploadInventoryItem(retailerToken, {
        title,
        category,
        quantity: parseInt(quantity),
        price: parseFloat(price) || 0,
        condition,
        expiry_date: new Date(expiryDate).toISOString(),
        description: description || undefined,
        location: location || undefined,
      });
      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Inventory Item</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === "auth" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-500">Sign in with your business account to add inventory.</p>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="e.g., dunkin@demo.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              onClick={handleAuth}
              disabled={!email || !password || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Continue"}
            </button>
          </div>
        )}

        {step === "item" && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Item Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Surplus Dunkin Donuts — Assorted"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                >
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 500"
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Price / unit ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00 = free"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Expiry / Available Until *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Boston, MA"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item, ideal buyer, condition details…"
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all resize-none"
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <button
              onClick={handleSubmit}
              disabled={!title || !quantity || !expiryDate || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : "Add Item"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Item Added!</h3>
            <p className="text-sm text-gray-500 mb-5">Your inventory item is now live and visible to buyers.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
