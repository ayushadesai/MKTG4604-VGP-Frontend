import { useState } from "react";
import { Company } from "../data/mockData";
import { Building2, MapPin, Package, TrendingUp, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CompanyMatchCardProps {
  company: Company;
  nonprofitNeeds: string;
  nonprofitName: string;
  nonprofitLocation: string;
  rank: number;
}

export default function CompanyMatchCard({
  company,
  nonprofitNeeds,
  nonprofitName,
  nonprofitLocation,
  rank,
}: CompanyMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateOutreachMessage = () => {
    const orgNameText = nonprofitName || "our organization";
    const locationText = nonprofitLocation ? ` in ${nonprofitLocation}` : "";
    const isPurchase = orgNameText.toLowerCase().includes('resale') || orgNameText.toLowerCase().includes('reseller');

    return `Subject: ${isPurchase ? 'Purchase' : 'Donation'} Request: ${nonprofitNeeds}

Dear ${company.name} team,

I hope this message finds you well. I'm reaching out from ${orgNameText}${locationText} regarding your ${company.inventoryType.join(", ")} inventory.

${isPurchase
  ? `We're interested in purchasing your excess ${nonprofitNeeds}. As a reseller, we can offer fair market pricing and quick turnaround.`
  : `We're seeking donations of ${nonprofitNeeds} to support our community programs. We understand you may have excess inventory available.`
}

${isPurchase ? 'Purchase' : 'Partnership'} details:
• ${isPurchase ? 'Interested in' : 'Seeking'}: ${nonprofitNeeds}
• Your inventory: ${company.inventoryType.join(", ")}
${nonprofitLocation && company.location ? `• Location: ${nonprofitLocation} → ${company.location}` : ""}
• Value: ${company.estimatedValue}

${isPurchase
  ? 'We can provide payment terms and handle all logistics. Our team can move quickly to help you clear inventory.'
  : 'We provide tax documentation, handle logistics, and offer ESG impact reporting for your corporate social responsibility goals.'
}

Would you be available for a brief call to discuss this opportunity?

Best regards,
${orgNameText}`;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateOutreachMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.1 }}
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 transition-colors"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              {rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <h3 className="truncate">{company.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-semibold text-primary">{company.estimatedValue}</div>
            <div className="text-xs text-muted-foreground">Est. Value</div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Available:</span>
            <span>{company.inventoryType.join(", ")}</span>
          </div>
        </div>

        {/* Signals Preview */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Latest signal:</p>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {company.signals[0].type.replace("_", " ")}
              </span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${company.signals[0].confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {Math.round(company.signals[0].confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm">{company.signals[0].excerpt}</p>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-2"
        >
          {isExpanded ? (
            <>
              <span>Hide details</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View all signals & outreach message</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* All Signals */}
              <div>
                <h4 className="mb-3">All Inventory Signals</h4>
                <div className="space-y-3">
                  {company.signals.map((signal, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            {signal.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{signal.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${signal.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">
                            {Math.round(signal.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{signal.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-1">Source: {signal.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Outreach */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4>Suggested Outreach</h4>
                  <button
                    onClick={handleCopyMessage}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Message
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {generateOutreachMessage()}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
