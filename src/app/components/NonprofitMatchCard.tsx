import { useState } from "react";
import { Nonprofit } from "../data/mockData";
import { Heart, MapPin, Users, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NonprofitMatchCardProps {
  nonprofit: Nonprofit;
  businessInventory: string;
  businessName: string;
  businessLocation: string;
  rank: number;
}

export default function NonprofitMatchCard({
  nonprofit,
  businessInventory,
  businessName,
  businessLocation,
  rank,
}: NonprofitMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateOutreachMessage = () => {
    const companyNameText = businessName || "our company";
    const locationText = businessLocation ? ` in ${businessLocation}` : "";

    return `Subject: Partnership Opportunity: Donation of ${businessInventory}

Dear ${nonprofit.name} team,

I hope this message finds you well. I'm reaching out from ${companyNameText}${locationText} regarding a donation partnership opportunity.

We currently have excess inventory of ${businessInventory} that we would like to donate to an organization where it can make a meaningful impact. Given your mission — ${nonprofit.mission.toLowerCase()} — we believe this partnership could benefit both organizations.

Partnership details:
• Available: ${businessInventory}
${businessLocation && nonprofit.location ? `• Location: ${businessLocation} → ${nonprofit.location}` : ""}
• Your impact: ${nonprofit.beneficiaries}
• Match: You accept ${nonprofit.goodsNeeded.slice(0, 3).join(", ")}

We can provide documentation for tax purposes and work with you on logistics. Would you be available for a brief call this week to discuss next steps?

Looking forward to hearing from you.

Best regards,
${companyNameText}
EIN: ${nonprofit.ein}`;
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
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <h3 className="truncate">{nonprofit.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{nonprofit.mission}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{nonprofit.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{nonprofit.beneficiaries}</span>
          </div>
        </div>

        {/* Goods Needed */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Accepts:</p>
          <div className="flex flex-wrap gap-2">
            {nonprofit.goodsNeeded.map((good, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-sm rounded-md"
              >
                {good}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-2"
        >
          {isExpanded ? (
            <>
              <span>Hide contact details</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View outreach message & details</span>
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
            <div className="p-6 space-y-4">
              {/* Organization Details */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">EIN (Tax ID)</p>
                <p className="text-sm font-mono">{nonprofit.ein}</p>
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
