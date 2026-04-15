import { useState } from "react";
import { X, Loader2, CheckCircle, Building2 } from "lucide-react";
import { registerBusiness } from "../lib/api";

interface Props {
  onClose: () => void;
}

export default function RegisterBusinessModal({ onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (!businessName) { setError("Business name is required."); return; }
    if (!email) { setError("Email is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setIsLoading(true);
    try {
      await registerBusiness(email, password);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Register as a Business</h2>
            {!isDone && (
              <p className="text-xs text-gray-400 mt-0.5">Create a retailer account to list surplus inventory</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!isDone ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Dunkin' Donuts Copley"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-xs text-emerald-700">
                <span className="font-semibold">After registering</span>, use your email and password to sign in when adding items or doing a bulk upload.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!businessName || !email || !password || !confirmPassword || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</>
                : <><Building2 className="w-4 h-4" />Create Business Account</>}
            </button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Business registered!</h3>
            <p className="text-sm text-gray-500 mb-1">
              Account created for <span className="font-medium">{email}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Use your email and password to add items or bulk upload inventory.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
