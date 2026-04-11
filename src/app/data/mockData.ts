export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  signals: Signal[];
  inventoryType: string[];
  estimatedValue: string;
}

export interface Signal {
  type: "earnings" | "news" | "filing" | "job_posting";
  source: string;
  date: string;
  excerpt: string;
  confidence: number;
}

export interface Nonprofit {
  id: string;
  name: string;
  mission: string;
  location: string;
  goodsNeeded: string[];
  beneficiaries: string;
  ein: string;
}

export interface Match {
  id: string;
  company: Company;
  nonprofit: Nonprofit;
  matchScore: number;
  matchReasons: string[];
  generatedMessage: string;
}

export const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "TechFlow Electronics",
    industry: "Consumer Electronics",
    location: "Austin, TX",
    inventoryType: ["Laptops", "Tablets", "Monitors", "Computers"],
    estimatedValue: "$450K",
    signals: [
      {
        type: "earnings",
        source: "Q4 2025 Earnings Call",
        date: "2026-02-15",
        excerpt: "Excess inventory in consumer electronics division due to lower-than-expected holiday demand. Working to optimize channel inventory levels.",
        confidence: 0.92,
      },
      {
        type: "news",
        source: "Tech Industry News",
        date: "2026-03-01",
        excerpt: "TechFlow announces restructuring of retail operations, mentions clearing warehouse space in Austin facility.",
        confidence: 0.78,
      },
    ],
  },
  {
    id: "c2",
    name: "AppareLink Fashion",
    industry: "Apparel & Retail",
    location: "Los Angeles, CA",
    inventoryType: ["Winter clothing", "Professional attire", "Shoes", "Clothing"],
    estimatedValue: "$280K",
    signals: [
      {
        type: "filing",
        source: "SEC 10-K Filing",
        date: "2026-03-20",
        excerpt: "Inventory write-down of $2.1M related to seasonal apparel not sold during winter 2025-2026.",
        confidence: 0.95,
      },
      {
        type: "news",
        source: "Retail Weekly",
        date: "2026-04-05",
        excerpt: "AppareLink pivoting to online-only model, closing physical warehouses in California.",
        confidence: 0.85,
      },
    ],
  },
  {
    id: "c3",
    name: "FreshHarvest Foods",
    industry: "Food & Beverage",
    location: "Portland, OR",
    inventoryType: ["Non-perishable foods", "Canned goods", "Packaged snacks", "Food"],
    estimatedValue: "$125K",
    signals: [
      {
        type: "news",
        source: "Food Industry Report",
        date: "2026-03-28",
        excerpt: "FreshHarvest facing oversupply issues as major retail contract falls through. CEO mentions exploring donation options.",
        confidence: 0.88,
      },
      {
        type: "job_posting",
        source: "LinkedIn",
        date: "2026-04-02",
        excerpt: "Hiring warehouse coordinator for 'inventory optimization and partnership management' - mentions experience with nonprofit partnerships preferred.",
        confidence: 0.72,
      },
    ],
  },
  {
    id: "c4",
    name: "Dunkin' Boston",
    industry: "Food & Beverage",
    location: "Boston, MA",
    inventoryType: ["Doughnuts", "Baked goods", "Pastries", "Food"],
    estimatedValue: "$15K",
    signals: [
      {
        type: "news",
        source: "Local Business News",
        date: "2026-04-08",
        excerpt: "Dunkin' franchises exploring donation programs for unsold daily inventory to reduce waste.",
        confidence: 0.82,
      },
      {
        type: "job_posting",
        source: "Indeed",
        date: "2026-04-01",
        excerpt: "Seeking operations coordinator to manage daily surplus and establish partnerships with local food rescue organizations.",
        confidence: 0.75,
      },
    ],
  },
  {
    id: "c5",
    name: "MobileTech Wholesale",
    industry: "Consumer Electronics",
    location: "San Francisco, CA",
    inventoryType: ["Smartphones", "Phone accessories", "Tablets", "Electronics"],
    estimatedValue: "$380K",
    signals: [
      {
        type: "filing",
        source: "Quarterly Report",
        date: "2026-03-15",
        excerpt: "Inventory carrying costs increased due to slower-than-expected device upgrade cycle. Evaluating liquidation strategies.",
        confidence: 0.89,
      },
      {
        type: "news",
        source: "Tech Retail Journal",
        date: "2026-03-25",
        excerpt: "MobileTech citing oversupply of previous generation devices as newer models arrive.",
        confidence: 0.84,
      },
    ],
  },
  {
    id: "c6",
    name: "OfficeMax Surplus",
    industry: "Office Supplies",
    location: "Chicago, IL",
    inventoryType: ["Office furniture", "Desks", "Chairs", "Office supplies"],
    estimatedValue: "$220K",
    signals: [
      {
        type: "news",
        source: "Business Insider",
        date: "2026-04-02",
        excerpt: "Remote work trend leaves OfficeMax with excess office furniture inventory. Company exploring bulk donation options.",
        confidence: 0.91,
      },
      {
        type: "earnings",
        source: "Q1 2026 Earnings Call",
        date: "2026-04-10",
        excerpt: "Warehouse consolidation resulting in need to clear legacy office furniture inventory.",
        confidence: 0.87,
      },
    ],
  },
  {
    id: "c7",
    name: "Urban Threads",
    industry: "Apparel & Retail",
    location: "New York, NY",
    inventoryType: ["Casual clothing", "T-shirts", "Jeans", "Clothing"],
    estimatedValue: "$195K",
    signals: [
      {
        type: "filing",
        source: "SEC Filing",
        date: "2026-03-18",
        excerpt: "Seasonal inventory excess from unseasonably warm winter affecting outerwear and heavy clothing sales.",
        confidence: 0.86,
      },
      {
        type: "news",
        source: "Fashion Trade Weekly",
        date: "2026-04-05",
        excerpt: "Urban Threads announces shift to sustainable model, including donation partnerships to avoid textile waste.",
        confidence: 0.79,
      },
    ],
  },
  {
    id: "c8",
    name: "Grocery Surplus Co",
    industry: "Food & Beverage",
    location: "Seattle, WA",
    inventoryType: ["Packaged foods", "Canned goods", "Dry goods", "Food"],
    estimatedValue: "$95K",
    signals: [
      {
        type: "news",
        source: "Food Distribution News",
        date: "2026-04-07",
        excerpt: "Grocery Surplus looking to partner with food banks to redistribute excess inventory from store closures.",
        confidence: 0.93,
      },
      {
        type: "job_posting",
        source: "LinkedIn",
        date: "2026-04-03",
        excerpt: "Hiring logistics coordinator to manage food donation partnerships and distribution.",
        confidence: 0.71,
      },
    ],
  },
  {
    id: "c9",
    name: "TechRefurb Solutions",
    industry: "Consumer Electronics",
    location: "Denver, CO",
    inventoryType: ["Refurbished computers", "Laptops", "Monitors", "Electronics"],
    estimatedValue: "$310K",
    signals: [
      {
        type: "news",
        source: "Tech Industry Daily",
        date: "2026-03-30",
        excerpt: "TechRefurb has surplus of refurbished enterprise laptops after major corporate client shifted to different vendor.",
        confidence: 0.88,
      },
      {
        type: "earnings",
        source: "Internal Memo",
        date: "2026-04-05",
        excerpt: "Need to clear 2,000+ refurbished laptops to make warehouse space for new inventory.",
        confidence: 0.82,
      },
    ],
  },
  {
    id: "c10",
    name: "Medical Supply Direct",
    industry: "Healthcare",
    location: "Houston, TX",
    inventoryType: ["Medical supplies", "First aid kits", "PPE", "Medical equipment"],
    estimatedValue: "$175K",
    signals: [
      {
        type: "news",
        source: "Healthcare Supply Chain",
        date: "2026-04-01",
        excerpt: "Medical Supply Direct has excess PPE inventory as pandemic-era demand normalizes.",
        confidence: 0.90,
      },
      {
        type: "filing",
        source: "Quarterly Report",
        date: "2026-03-20",
        excerpt: "Inventory optimization initiative includes partnering with healthcare nonprofits for surplus redistribution.",
        confidence: 0.85,
      },
    ],
  },
];

export const mockNonprofits: Nonprofit[] = [
  {
    id: "n1",
    name: "Digital Bridge Foundation",
    mission: "Providing technology access to underserved students and community centers",
    location: "Austin, TX",
    goodsNeeded: ["Computers", "Laptops", "Tablets", "Monitors", "Educational software", "Electronics"],
    beneficiaries: "15,000 students annually",
    ein: "45-2837561",
  },
  {
    id: "n2",
    name: "Tech for Schools Alliance",
    mission: "Equipping K-12 schools in rural areas with modern technology",
    location: "Dallas, TX",
    goodsNeeded: ["Laptops", "Tablets", "Projectors", "Educational technology", "Computers", "Electronics"],
    beneficiaries: "85 schools across Texas",
    ein: "74-3928471",
  },
  {
    id: "n3",
    name: "Career Readiness Network",
    mission: "Supporting job seekers with professional clothing and interview preparation",
    location: "Los Angeles, CA",
    goodsNeeded: ["Professional clothing", "Shoes", "Interview attire", "Business accessories", "Clothing"],
    beneficiaries: "3,200 job seekers yearly",
    ein: "95-4821736",
  },
  {
    id: "n4",
    name: "Wardrobe for Success",
    mission: "Providing professional attire to individuals re-entering the workforce",
    location: "San Diego, CA",
    goodsNeeded: ["Business clothing", "Professional attire", "Shoes", "Accessories", "Clothing"],
    beneficiaries: "5,000+ individuals annually",
    ein: "33-0857294",
  },
  {
    id: "n5",
    name: "Portland Community Food Bank",
    mission: "Fighting hunger by providing nutritious food to families in need",
    location: "Portland, OR",
    goodsNeeded: ["Non-perishable foods", "Canned goods", "Packaged foods", "Snacks", "Food"],
    beneficiaries: "28,000 families monthly",
    ein: "93-0582947",
  },
  {
    id: "n6",
    name: "Oregon Hunger Relief",
    mission: "Distributing food to pantries and shelters across Oregon",
    location: "Eugene, OR",
    goodsNeeded: ["Canned goods", "Dry goods", "Non-perishable items", "Bulk food", "Food"],
    beneficiaries: "120+ partner organizations",
    ein: "93-1847362",
  },
  {
    id: "n7",
    name: "Boston Homeless Coalition",
    mission: "Providing meals and essential services to homeless individuals",
    location: "Boston, MA",
    goodsNeeded: ["Food", "Baked goods", "Prepared meals", "Doughnuts", "Pastries"],
    beneficiaries: "2,500 individuals weekly",
    ein: "04-3856291",
  },
  {
    id: "n8",
    name: "Hope Kitchen Network",
    mission: "Operating soup kitchens and food distribution centers",
    location: "Boston, MA",
    goodsNeeded: ["Food", "Baked goods", "Canned goods", "Fresh food", "Packaged meals"],
    beneficiaries: "8,000 meals served weekly",
    ein: "04-2947583",
  },
  {
    id: "n9",
    name: "TechBridge Nonprofit",
    mission: "Connecting nonprofits with technology resources",
    location: "San Francisco, CA",
    goodsNeeded: ["Computers", "Smartphones", "Tablets", "Electronics", "Office supplies"],
    beneficiaries: "200+ nonprofit organizations",
    ein: "94-3847562",
  },
  {
    id: "n10",
    name: "RefurbishedTech Resale",
    mission: "Reselling refurbished electronics to fund community programs",
    location: "Denver, CO",
    goodsNeeded: ["Computers", "Laptops", "Smartphones", "Electronics", "Tablets"],
    beneficiaries: "Funds 15 community programs",
    ein: "84-2938475",
  },
  {
    id: "n11",
    name: "Dress for Success Chicago",
    mission: "Empowering women with professional attire for career success",
    location: "Chicago, IL",
    goodsNeeded: ["Professional clothing", "Business attire", "Shoes", "Accessories", "Clothing"],
    beneficiaries: "4,500 women annually",
    ein: "36-4890562",
  },
  {
    id: "n12",
    name: "Community Closet NYC",
    mission: "Providing clothing to families in need",
    location: "New York, NY",
    goodsNeeded: ["Clothing", "Shoes", "Winter clothing", "Casual clothing", "Children's clothing"],
    beneficiaries: "12,000 individuals yearly",
    ein: "13-5847293",
  },
  {
    id: "n13",
    name: "Seattle Food Rescue",
    mission: "Rescuing surplus food and distributing to those in need",
    location: "Seattle, WA",
    goodsNeeded: ["Food", "Packaged foods", "Canned goods", "Fresh food", "Dry goods"],
    beneficiaries: "50+ community partners",
    ein: "91-2847563",
  },
  {
    id: "n14",
    name: "Nonprofit Workspace Alliance",
    mission: "Furnishing nonprofit office spaces with donated equipment",
    location: "Chicago, IL",
    goodsNeeded: ["Office furniture", "Desks", "Chairs", "Office supplies", "Filing cabinets"],
    beneficiaries: "75 nonprofit offices",
    ein: "36-3948572",
  },
  {
    id: "n15",
    name: "Health Access Initiative",
    mission: "Providing medical supplies to underserved clinics",
    location: "Houston, TX",
    goodsNeeded: ["Medical supplies", "First aid kits", "PPE", "Medical equipment", "Health supplies"],
    beneficiaries: "30 community clinics",
    ein: "74-4958372",
  },
];

export const mockMatches: Match[] = [
  {
    id: "m1",
    company: mockCompanies[0],
    nonprofit: mockNonprofits[0],
    matchScore: 94,
    matchReasons: [
      "Geographic proximity: Both in Austin, TX",
      "Perfect goods alignment: Electronics inventory matches technology needs",
      "High confidence inventory signal (92%)",
      "Nonprofit serves 15,000 students - significant impact potential",
    ],
    generatedMessage: `Subject: Partnership Opportunity: TechFlow Electronics + Digital Bridge Foundation

Dear Digital Bridge Foundation team,

I hope this message finds you well. I'm reaching out on behalf of TechFlow Electronics regarding a potential partnership opportunity that could benefit the students you serve.

Based on recent public filings and market reports, TechFlow has indicated excess inventory in their consumer electronics division, including laptops, tablets, and monitors. Given Digital Bridge Foundation's mission to provide technology access to underserved students in the Austin area, this presents a valuable alignment.

Key partnership benefits:
• Geographic proximity: Both organizations are Austin-based, minimizing logistics
• Inventory alignment: Electronics match your technology access programs
• Impact: Could serve a significant portion of your 15,000 annual beneficiaries
• ESG value: Provides TechFlow with meaningful corporate social responsibility impact

Would you be open to a brief conversation to explore whether this could be mutually beneficial? I'm happy to facilitate an introduction and help coordinate initial discussions.

Best regards`,
  },
  {
    id: "m2",
    company: mockCompanies[0],
    nonprofit: mockNonprofits[1],
    matchScore: 87,
    matchReasons: [
      "Same state: Both in Texas",
      "Strong goods match: Electronics inventory aligns with educational technology needs",
      "High reach: Serves 85 schools across Texas",
      "Rural focus complements urban inventory source",
    ],
    generatedMessage: `Subject: Technology Donation Opportunity for Texas Schools

Dear Tech for Schools Alliance,

I'm writing to introduce a potential partnership between TechFlow Electronics and your organization that could help equip rural schools with needed technology.

TechFlow Electronics has recently indicated excess inventory of laptops, tablets, and monitors in their Austin facility. Given your mission to bring modern technology to K-12 schools across rural Texas, this could be an ideal match.

Partnership highlights:
• In-state logistics: Austin-based inventory serving Texas schools
• Product fit: Electronics directly support your educational technology programs
• Scale: Potential to impact multiple schools from your 85-school network
• Corporate benefits: Meaningful ESG story for TechFlow's stakeholders

I'd be glad to facilitate an introduction to discuss how this inventory could support your mission. Would you be available for a brief call next week?

Warm regards`,
  },
  {
    id: "m3",
    company: mockCompanies[0],
    nonprofit: mockNonprofits[1],
    matchScore: 82,
    matchReasons: [
      "Same region: West Coast proximity",
      "Goods alignment: Professional clothing matches career services",
      "High-quality signal: SEC filing confirms inventory write-down",
      "Significant beneficiary base: 3,200 job seekers yearly",
    ],
    generatedMessage: `Subject: Potential In-Kind Partnership: AppareLink + Career Readiness Network

Dear Career Readiness Network,

I hope this email finds you well. I'm reaching out about a partnership opportunity between AppareLink Fashion and your organization that could help dress job seekers for success.

Recent SEC filings indicate AppareLink has excess seasonal and professional apparel inventory at their Los Angeles facility. Given Career Readiness Network's focus on providing professional clothing and interview preparation, this represents a strong alignment.

Why this matters:
• Location match: Both Los Angeles-based for easy coordination
• Perfect inventory fit: Professional attire directly serves your 3,200 annual beneficiaries
• Quality: AppareLink specializes in professional clothing and business attire
• Timing: Current inventory situation presents immediate opportunity

Would you be interested in exploring this further? I'm happy to help coordinate an introduction and facilitate next steps.

Best`,
  },
  {
    id: "m4",
    company: mockCompanies[1],
    nonprofit: mockNonprofits[3],
    matchScore: 91,
    matchReasons: [
      "California proximity: LA to San Diego logistics manageable",
      "Excellent goods match: Professional attire aligns with workforce re-entry programs",
      "Strong inventory signal: SEC filing + news coverage",
      "Large impact: Serves 5,000+ individuals annually",
    ],
    generatedMessage: `Subject: Partnership Inquiry: AppareLink Fashion + Wardrobe for Success

Dear Wardrobe for Success team,

I'm reaching out to explore a potential partnership between AppareLink Fashion and your organization that could provide professional attire to thousands of individuals re-entering the workforce.

AppareLink Fashion recently disclosed excess inventory of professional clothing, business attire, and shoes at their California facilities. Given your mission to support workforce re-entry with professional wardrobe resources, this presents an excellent opportunity for collaboration.

Partnership potential:
• In-state logistics: California-based inventory to California nonprofit
• Inventory alignment: Professional clothing perfectly matches your program needs
• Scale: Could support a significant portion of your 5,000+ annual beneficiaries
• Quality assurance: AppareLink's reputation for professional attire ensures appropriate donations

I believe this could be mutually beneficial and would love to facilitate an introduction. Are you available for a brief conversation this week?

Sincerely`,
  },
  {
    id: "m5",
    company: mockCompanies[2],
    nonprofit: mockNonprofits[4],
    matchScore: 96,
    matchReasons: [
      "Same city: Both Portland-based for optimal logistics",
      "Perfect mission fit: Food inventory directly serves food bank needs",
      "CEO mentioned donation interest in news coverage",
      "Massive reach: 28,000 families served monthly",
    ],
    generatedMessage: `Subject: Time-Sensitive Partnership Opportunity: FreshHarvest Foods + Portland Community Food Bank

Dear Portland Community Food Bank,

I hope this message finds you well. I'm writing regarding an immediate partnership opportunity between FreshHarvest Foods and your organization that could help feed thousands of families.

Recent industry reports indicate FreshHarvest Foods has significant excess inventory of non-perishable foods, canned goods, and packaged snacks at their Portland facility. Notably, their CEO recently mentioned exploring donation options. Given your mission to fight hunger in Portland, this is an ideal match.

Why act now:
• Geographic alignment: Both Portland-based for immediate logistics
• Perfect inventory match: Food products directly serve your 28,000 monthly families
• Company readiness: CEO publicly mentioned interest in donation partnerships
• Food quality: Non-perishable items ideal for food bank distribution

This appears to be a time-sensitive opportunity. Would you be available for a call in the next few days to discuss next steps?

Best regards`,
  },
  {
    id: "m6",
    company: mockCompanies[2],
    nonprofit: mockNonprofits[5],
    matchScore: 89,
    matchReasons: [
      "Oregon proximity: Portland to Eugene is manageable",
      "Strong goods alignment: Food inventory matches pantry distribution network",
      "Distribution scale: 120+ partner organizations",
      "Recent signal: Job posting mentions nonprofit partnerships",
    ],
    generatedMessage: `Subject: Food Donation Partnership: FreshHarvest Foods + Oregon Hunger Relief

Dear Oregon Hunger Relief team,

I'm reaching out about a potential partnership between FreshHarvest Foods and your statewide distribution network that could benefit pantries and shelters across Oregon.

FreshHarvest Foods has excess inventory of non-perishable foods and canned goods at their Portland facility. Recent job postings suggest they're actively seeking nonprofit partnerships. With your 120+ partner organizations, you're uniquely positioned to maximize the impact of this donation.

Partnership benefits:
• Oregon-based logistics: Portland inventory serving Oregon distribution network
• Product alignment: Non-perishables ideal for pantry distribution
• Scale multiplier: Your network can distribute to communities statewide
• Company interest: Recent hiring signals openness to nonprofit collaboration

Could we schedule a brief call to explore how this inventory could support your partner organizations?

Warm regards`,
  },
];
