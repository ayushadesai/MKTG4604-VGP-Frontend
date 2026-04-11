import { useState } from "react";
import { Sparkles, Building2, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import BusinessView from "../components/BusinessView";
import NonprofitView from "../components/NonprofitView";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"business" | "buyer">("business");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-gradient-to-r from-blue-50 to-yellow-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">Surplus Connect</h1>
              <p className="text-muted-foreground max-w-3xl">
                Connect excess inventory with organizations in need. Simple, direct matching that creates real impact.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white p-1 rounded-lg w-fit border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === "business"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>I Have Surplus</span>
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === "buyer"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>I'm Looking</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "business" ? <BusinessView /> : <NonprofitView />}
      </main>
    </div>
  );
}
