import { useState } from "react";
import { Building2, MapPin, Package, DollarSign, Search, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";
import NonprofitMatchCard from "./NonprofitMatchCard";
import { mockNonprofits, Nonprofit } from "../data/mockData";

export default function BusinessView() {
  const [companyName, setCompanyName] = useState("");
  const [inventory, setInventory] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [matches, setMatches] = useState<Nonprofit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const input = chatInput.toLowerCase();

    // Extract company name
    const companyPatterns = [
      /i'?m\s+([a-zA-Z\s&]+?)(?:\s+and|,|\.|$)/i,
      /from\s+([a-zA-Z\s&]+?)(?:\s+and|,|\.|$)/i,
      /we'?re\s+([a-zA-Z\s&]+?)(?:\s+and|,|\.|$)/i,
    ];

    for (const pattern of companyPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length > 2) {
          setCompanyName(extracted.charAt(0).toUpperCase() + extracted.slice(1));
          break;
        }
      }
    }

    // Extract quantity and inventory
    const quantityPatterns = [
      /(\d+[,\d]*)\s+(extra|excess)?\s*([a-zA-Z\s]+?)(?:\s+every\s+day|daily|per day|a day)/i,
      /(\d+[,\d]*)\s+([a-zA-Z\s]+?)(?:\s+in\s+stock|available)/i,
      /have\s+(\d+[,\d]*)\s+([a-zA-Z\s]+)/i,
    ];

    for (const pattern of quantityPatterns) {
      const match = input.match(pattern);
      if (match) {
        setQuantity(match[1]);
        const itemIndex = match[2] && (match[2] === 'extra' || match[2] === 'excess') ? 3 : 2;
        if (match[itemIndex]) {
          setInventory(match[itemIndex].trim());
        }
        break;
      }
    }

    // If no quantity pattern matched, try to extract just the inventory
    if (!inventory) {
      const inventoryPatterns = [
        /(?:extra|excess|surplus)\s+([a-zA-Z\s,]+?)(?:\s+who|$)/i,
        /have\s+(?:some\s+)?([a-zA-Z\s,]+?)(?:\s+who|that|to)/i,
      ];

      for (const pattern of inventoryPatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          setInventory(match[1].trim());
          break;
        }
      }
    }

    // Extract location
    const locationPatterns = [
      /(?:in|from|at)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/,
      /(?:in|from|at)\s+([A-Z][a-zA-Z\s]+)/,
    ];

    for (const pattern of locationPatterns) {
      const match = chatInput.match(pattern);
      if (match && match[1]) {
        setLocation(match[1].trim());
        break;
      }
    }

    // Extract value
    const valuePattern = /\$(\d+[,\d]*(?:\.\d+)?[kKmM]?)/;
    const valueMatch = chatInput.match(valuePattern);
    if (valueMatch) {
      setEstimatedValue('$' + valueMatch[1]);
    }

    setChatInput("");
  };

  const handleFindMatches = () => {
    // Matching logic based on inventory keywords
    const inventoryLower = inventory.toLowerCase();
    const locationLower = location.toLowerCase();

    const filtered = mockNonprofits.filter((nonprofit) => {
      // Check if inventory matches any goods needed
      const hasInventoryMatch = nonprofit.goodsNeeded.some((good) => {
        const goodLower = good.toLowerCase();
        return inventoryLower.includes(goodLower) ||
               goodLower.includes(inventoryLower) ||
               // Fuzzy matching for common terms
               (inventoryLower.includes('food') && goodLower.includes('food')) ||
               (inventoryLower.includes('computer') && (goodLower.includes('computer') || goodLower.includes('laptop') || goodLower.includes('electronics'))) ||
               (inventoryLower.includes('laptop') && (goodLower.includes('laptop') || goodLower.includes('computer') || goodLower.includes('electronics'))) ||
               (inventoryLower.includes('electronics') && goodLower.includes('electronics')) ||
               (inventoryLower.includes('clothing') && goodLower.includes('clothing')) ||
               (inventoryLower.includes('phone') && (goodLower.includes('phone') || goodLower.includes('smartphone')));
      });

      return hasInventoryMatch;
    });

    // Sort by location proximity (same city/state gets priority)
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
    setCompanyName("");
    setInventory("");
    setLocation("");
    setEstimatedValue("");
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
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="mb-2">For Businesses</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have excess inventory? Find nonprofits that need exactly what you have. Turn surplus
            into social impact.
          </p>
        </div>

        {/* Example */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Example:</p>
          <p className="text-sm italic">
            "I'm Dunkin' and I have 500 extra doughnuts every day. Who can I sell this to or donate
            this to for the best impact?"
          </p>
        </div>

        {/* Chat Box */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3>Quick Fill</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Describe your situation naturally and we'll automatically fill in the details below
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., I'm Dunkin' and have 500 extra doughnuts every day in Boston, MA..."
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
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g., Dunkin', TechFlow Electronics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  What do you have in excess?
                </label>
                <input
                  type="text"
                  placeholder="e.g., doughnuts, laptops, clothing"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block mb-2">
                  Quantity (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 500 daily, 1000 units"
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
                  placeholder="e.g., Boston, MA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Estimated Value (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., $5,000"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleFindMatches}
                disabled={!inventory.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
                Find Matching Nonprofits
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
                {matches.length > 0 ? "Matching Nonprofits" : "No Matches Found"}
              </h3>
              {matches.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Found {matches.length} {matches.length === 1 ? "nonprofit" : "nonprofits"} that
                  need {inventory}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Try different keywords like "food", "electronics", "clothing", etc.
                </p>
              )}
            </div>

            <div className="space-y-4">
              {matches.map((nonprofit, index) => (
                <NonprofitMatchCard
                  key={nonprofit.id}
                  nonprofit={nonprofit}
                  businessInventory={inventory}
                  businessName={companyName}
                  businessLocation={location}
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
