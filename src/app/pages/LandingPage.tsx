import { Sparkles, Building2, ShoppingCart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onSelectRole: (role: "business" | "buyer") => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 max-w-2xl"
      >
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-700 to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Sparkles className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl md:text-5xl font-bold text-emerald-900">Surplus Connect</h1>

        {/* Tagline - Single line */}
        <p className="text-lg md:text-xl text-gray-600 font-medium">
          Tell us what excess you have available, we will connect you with the best buyers based on your needs and Smart marketplace connecting business surplus with organizations in need. Simple, direct matching that creates real impact.
        </p>
      </motion.div>

      {/* Selection Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-6 w-full max-w-3xl"
      >
        {/* Business Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("business")}
          className="flex-1 bg-white border-2 border-emerald-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:border-emerald-600"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-3">I'm a Business</h2>
          <p className="text-gray-600 mb-6">
            Have excess inventory? Connect with organizations that need what you have.
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold group">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        {/* Buyer Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("buyer")}
          className="flex-1 bg-white border-2 border-teal-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:border-teal-600"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-teal-900 mb-3">I'm a Buyer</h2>
          <p className="text-gray-600 mb-6">
            Looking for goods at great prices? Find surplus inventory from businesses.
          </p>
          <div className="flex items-center justify-center gap-2 text-teal-700 font-semibold group">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
