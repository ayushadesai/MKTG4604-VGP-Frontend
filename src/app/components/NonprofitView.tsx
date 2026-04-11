import { useState } from "react";
import { ShoppingCart, MapPin, Package, Search, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";
import CompanyMatchCard from "./CompanyMatchCard";
import { mockCompanies, Company } from "../data/mockData";

export default function NonprofitView() {
  const [nonprofitName, setNonprofitName] = useState("");
  const [goodsNeeded, setGoodsNeeded] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [matches, setMatches] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const input = chatInput.toLowerCase();

    // Extract organization name
    const orgPatterns = [
      /i'?m\s+(?:a\s+)?([a-zA-Z\s&]+?)(?:\s+and|,|\.|\s+how|\s+looking|$)/i,
      /we'?re\s+(?:a\s+)?([a-zA-Z\s&]+?)(?:\s+and|,|\.|\s+how|\s+looking|$)/i,
      /from\s+([a-zA-Z\s&]+?)(?:\s+and|,|\.|\s+how|\s+looking|$)/i,
    ];

    for (const pattern of orgPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length > 2 && !['food bank', 'nonprofit', 'reseller', 'buyer'].includes(extracted)) {
          setNonprofitName(extracted.charAt(0).toUpperCase() + extracted.slice(1));
          break;
        }
      }
    }

    // Extract quantity and goods needed
    const quantityPatterns = [
      /(?:need|looking for|want)\s+(\d+[,\d]*)\s+([a-zA-Z\s]+?)(?:\s+per|daily|weekly|monthly|$)/i,
      /(\d+[,\d]*)\s+([a-zA-Z\s]+?)(?:\s+needed|required)/i,
    ];

    for (const pattern of quantityPatterns) {
      const match = input.match(pattern);
      if (match) {
        setQuantity(match[1]);
        if (match[2]) {
          setGoodsNeeded(match[2].trim());
        }
        break;
      }
    }

    // If no quantity pattern matched, try to extract just the goods
    if (!goodsNeeded) {
      const goodsPatterns = [
        /(?:need|looking for|want|get)\s+(?:some\s+)?(?:donated\s+)?([a-zA-Z\s,]+?)(?:\s+from|\?|$)/i,
        /(?:for|buy|purchase)\s+([a-zA-Z\s,]+?)(?:\s+from|\?|$)/i,
      ];

      for (const pattern of goodsPatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          const goods = match[1].trim();
          if (goods.length > 2 && !goods.includes('how can')) {
            setGoodsNeeded(goods);
            break;
          }
        }
      }
    }

    // Extract location
    const locationPatterns = [
      /(?:in|from|at|near)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/,
      /(?:in|from|at|near)\s+([A-Z][a-zA-Z\s]+)/,
    ];

    for (const pattern of locationPatterns) {
      const match = chatInput.match(pattern);
      if (match && match[1]) {
        setLocation(match[1].trim());
        break;
      }
    }

    // Extract budget
    const budgetPattern = /(?:budget|pay|spend|up to)\s+\$(\d+[,\d]*(?:\.\d+)?[kKmM]?)/i;
    const budgetMatch = chatInput.match(budgetPattern);
    if (budgetMatch) {
      setBudget('$' + budgetMatch[1]);
    }

    setChatInput("");
  };

  const handleFindMatches = () => {
    // Matching logic based on goods needed keywords
    const goodsLower = goodsNeeded.toLowerCase();
    const locationLower = location.toLowerCase();

    const filtered = mockCompanies.filter((company) => {
      // Check if company inventory matches what buyer needs
      const hasInventoryMatch = company.inventoryType.some((item) => {
        const itemLower = item.toLowerCase();
        return goodsLower.includes(itemLower) ||
               itemLower.includes(goodsLower) ||
               // Fuzzy matching for common terms
               (goodsLower.includes('food') && itemLower.includes('food')) ||
               (goodsLower.includes('computer') && (itemLower.includes('computer') || itemLower.includes('laptop') || itemLower.includes('electronics'))) ||
               (goodsLower.includes('laptop') && (itemLower.includes('laptop') || itemLower.includes('computer') || itemLower.includes('electronics'))) ||
               (goodsLower.includes('electronics') && itemLower.includes('electronics')) ||
               (goodsLower.includes('clothing') && itemLower.includes('clothing')) ||
               (goodsLower.includes('phone') && (itemLower.includes('phone') || itemLower.includes('smartphone'))) ||
               (goodsLower.includes('doughnut') && (itemLower.includes('doughnut') || itemLower.includes('baked goods'))) ||
               (goodsLower.includes('office') && (itemLower.includes('office') || itemLower.includes('desk') || itemLower.includes('chair')));
      });

      return hasInventoryMatch;
    });

    // Sort by location proximity and estimated value
    const sorted = filtered.sort((a, b) => {
      const aLocation = a.location.toLowerCase();
      const bLocation = b.location.toLowerCase();

      if (locationLower) {
        const aExactMatch = aLocation === locationLower;
        const bExactMatch = bLocation === locationLower;
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        const aSameState = locationLower.includes(',') && aLocation.split(',')[1]?.trim() === locationLower.split(',')[1]?.trim();
        const bSameState = locationLower.includes(',') && bLocation.split(',')[1]?.trim() === locationLower.split(',')[1]?.trim();
        if (aSameState && !bSameState) return -1;
        if (!aSameState && bSameState) return 1;
      }

      return 0;
    });

    setMatches(sorted);
    setHasSearched(true);
  };

  const handleReset = () => {
    setNonprofitName("");
    setGoodsNeeded("");
    setLocation("");
    setMatches([]);
    setHasSearched(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="mb-2">For Buyers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're a nonprofit, food bank, or reseller — find companies with excess inventory
            that matches what you need. Access surplus before it's disposed.
          </p>
        </div>

        {/* Example */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Example:</p>
          <p className="text-sm italic">
            "I'm Portland Food Bank. How can I get donated food from local businesses with excess
            inventory?"
          </p>
        </div>

        {/* Chat Box */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3>Quick Fill</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Describe what you need and we'll automatically fill in the details below
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., I'm a food bank in Portland looking for donated food..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleChatSubmit}
              disabled={!chatInput.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Organization Name
              </label>
              <input
                type="text"
                placeholder="e.g., Portland Food Bank, Tech Resale Co, Digital Bridge Foundation"
                value={nonprofitName}
                onChange={(e) => setNonprofitName(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  What do you need?
                </label>
                <input
                  type="text"
                  placeholder="e.g., food, computers, clothing"
                  value={goodsNeeded}
                  onChange={(e) => setGoodsNeeded(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block mb-2">
                  Quantity (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 200 daily, 500 units"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Portland, OR"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block mb-2">
                  Budget (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., $5,000 (for resellers)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleFindMatches}
                disabled={!goodsNeeded.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
                Find Available Inventory
              </button>
              {hasSearched && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <h3 className="mb-1">
                {matches.length > 0 ? "Matching Companies" : "No Matches Found"}
              </h3>
              {matches.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Found {matches.length} {matches.length === 1 ? "company" : "companies"} with{" "}
                  {goodsNeeded}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Try different keywords like "food", "electronics", "clothing", etc.
                </p>
              )}
            </div>

            <div className="space-y-4">
              {matches.map((company, index) => (
                <CompanyMatchCard
                  key={company.id}
                  company={company}
                  nonprofitNeeds={goodsNeeded}
                  nonprofitName={nonprofitName}
                  nonprofitLocation={location}
                  rank={index + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
