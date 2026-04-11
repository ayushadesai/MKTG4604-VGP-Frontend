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
        className="border-b border-border bg-card"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="mb-2">Surplus Connect</h1>
              <p className="text-muted-foreground max-w-3xl">
                AI-powered matching platform turning corporate excess inventory into nonprofit
                opportunity — connecting surplus to purpose.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === "business"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>I'm a Business</span>
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === "buyer"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>I'm a Buyer</span>
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
