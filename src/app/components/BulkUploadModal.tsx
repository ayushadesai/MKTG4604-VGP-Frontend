import { useState, useRef } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { getRetailerToken, uploadInventoryItem } from "../lib/api";

interface Props {
  onClose: () => void;
}

interface RowResult {
  row: number;
  title: string;
  status: "ok" | "error";
  message?: string;
}

const TEMPLATE_CSV = `title,category,quantity,price,condition,expiry_date,description,location
Surplus Assorted Donuts,Food & Beverage,200,1.50,good,2025-12-31,Fresh donuts from morning run,Boston MA
Surplus Women's Tops,Women's Clothing,100,8.00,new,2026-06-30,Mixed sizes new with tags,Boston MA`;

export default function BulkUploadModal({ onClose }: Props) {
  const [step, setStep] = useState<"auth" | "upload" | "done">("auth");
  const [retailerToken, setRetailerToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [results, setResults] = useState<RowResult[]>([]);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAuth = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setAuthError("");
    try {
      const token = await getRetailerToken(email, password);
      setRetailerToken(token);
      setStep("upload");
    } catch {
      setAuthError("Invalid retailer credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText((ev.target?.result as string) ?? "");
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, "_"));
    return lines.slice(1).map((line, i) => {
      const values = line.split(",");
      const row: Record<string, string> = {};
      header.forEach((h, j) => { row[h] = (values[j] ?? "").trim().replace(/^"|"$/g, ""); });
      return { rowNum: i + 2, data: row };
    });
  };

  const handleUpload = async () => {
    if (!csvText.trim()) return;
    setIsLoading(true);
    setSubmitError("");
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      setSubmitError("No valid rows found. Check your CSV format.");
      setIsLoading(false);
      return;
    }

    const rowResults: RowResult[] = [];
    for (const { rowNum, data } of rows) {
      const title = data.title || data.item_title || "";
      if (!title) {
        rowResults.push({ row: rowNum, title: "(missing title)", status: "error", message: "Title is required" });
        continue;
      }
      try {
        const expiryRaw = data.expiry_date || data.expiry || "";
        const expiryIso = expiryRaw ? new Date(expiryRaw).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString();
        await uploadInventoryItem(retailerToken, {
          title,
          category: data.category || "Other",
          quantity: parseInt(data.quantity) || 1,
          price: parseFloat(data.price) || 0,
          condition: data.condition || "good",
          expiry_date: expiryIso,
          description: data.description || undefined,
          location: data.location || undefined,
        });
        rowResults.push({ row: rowNum, title, status: "ok" });
      } catch (err) {
        rowResults.push({ row: rowNum, title, status: "error", message: err instanceof Error ? err.message : "Upload failed" });
      }
    }

    setResults(rowResults);
    setStep("done");
    setIsLoading(false);
  };

  const successCount = results.filter((r) => r.status === "ok").length;
  const failCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Bulk Upload Inventory</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === "auth" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-500">Sign in with your business account to bulk upload inventory.</p>
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

        {step === "upload" && (
          <div className="p-5 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">CSV Format</p>
              <p className="text-xs text-gray-600 font-mono leading-relaxed">
                title, category, quantity, price, condition, expiry_date, description, location
              </p>
              <button
                onClick={() => setCsvText(TEMPLATE_CSV)}
                className="mt-2 text-xs text-emerald-700 font-semibold hover:underline"
              >
                Load example template
              </button>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Upload CSV File</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer text-sm text-gray-500"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                Click to upload .csv file
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Or Paste CSV</label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={"title,category,quantity,price,condition,expiry_date\nDonut Surplus,Food & Beverage,200,1.50,good,2025-12-31"}
                rows={6}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <button
              onClick={handleUpload}
              disabled={!csvText.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : "Upload All Items"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Upload Complete</h3>
                <p className="text-sm text-gray-500">{successCount} added · {failCount} failed</p>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((r) => (
                <div key={r.row} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${r.status === "ok" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {r.status === "ok"
                    ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  <span className={r.status === "ok" ? "text-emerald-800" : "text-red-700"}>
                    Row {r.row}: {r.title}{r.message ? ` — ${r.message}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
