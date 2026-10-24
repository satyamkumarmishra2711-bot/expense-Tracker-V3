// server.ts
import express2 from "express";
import path from "path";
import dotenv2 from "dotenv";
import { fileURLToPath } from "url";

// src/server/api.ts
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// src/utils/idGenerator.ts
function generateTransactionId(params) {
  const cleanCard = (params.card || "card").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanDate = (params.date || "").replace(/[^0-9]/g, "");
  const cleanAmount = Number(params.amount || 0).toFixed(2);
  const cleanType = (params.type || "debit").substring(0, 2).toLowerCase();
  const cleanRef = (params.reference_id || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanDesc = (params.description || "").toLowerCase().replace(/ref\s*no[:.\s]*\w+/gi, "").replace(/auth\s*code[:.\s]*\w+/gi, "").replace(/[\s\-_/\\.:,]+/g, " ").trim();
  const inputString = `${cleanCard}_${cleanDate}_${cleanAmount}_${cleanType}_${cleanRef || cleanDesc}`;
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0");
  return `tx_${cleanDate || "nodate"}_${hexHash}_${cleanAmount.replace(".", "")}`;
}
function getStatementMonth(dateStr) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  if (dateStr) {
    const clean = dateStr.trim();
    const isoMatch = clean.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthNum = parseInt(isoMatch[2], 10);
      if (monthNum >= 1 && monthNum <= 12) {
        return {
          key: `${year}-${isoMatch[2]}`,
          label: `${monthNames[monthNum - 1]} ${year}`
        };
      }
    }
  }
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return {
        key: `${year}-${month}`,
        label: `${monthNames[date.getMonth()]} ${year}`
      };
    }
  } catch {
  }
  return {
    key: "2026-10",
    label: "October 2026"
  };
}

// src/utils/categorizer.ts
var DEFAULT_RULES = [
  // User Priority Tags & Explicit Rules
  { id: "rule_rent", pattern: "house rent|monthly rent|flat rent|office rent|rent payment|rent upi|rent online|rent txn|rent limited|rent pvt ltd", category: "Rent", merchant_name: "House Rent" },
  { id: "rule_satyam", pattern: "satyamkumarmishra|satyam kumar mishra|satyamk umarmishra|satya mkumarmishra", category: "Refund & Cashback", merchant_name: "Satyam Kumar Mishra" },
  { id: "rule_iitk", pattern: "iitk|iit kanpur|iitkanpur|tadkaiit|tadka iit|mstendulkar|msten dulkar|mstendu lkar|visitors|visitorshostel1in|visitors hostel|cafecoffeedayin|urbanvadapavsinghpin|urbancompanylimitedin|iitkanpurgirlshallin|iitkanpurmainhallin|coffeedaygloballimin|vikasmaheshwariin", category: "IITK", merchant_name: "IIT Kanpur" },
  { id: "rule_gulmohar", pattern: "gulmohar|gulmohar restaurant|gulmohur|gulmoharrestaurant", category: "Gulmohar", merchant_name: "Gulmohar" },
  { id: "rule_anujasharma", pattern: "anujasharma|anuja sharma|anujash arma", category: "Grocery & Essentials", merchant_name: "Anuja Sharma" },
  { id: "rule_anupam", pattern: "anupam store|anupam restaurant|anupam sweet|anupam dhaba|anupam", category: "Food & Dining", merchant_name: "Anupam" },
  { id: "rule_tatacapital", pattern: "tatacapital|tata capital|tatac apital|tatacap ital", category: "EMI & Financial", merchant_name: "Tata Capital Limited" },
  { id: "rule_swiggy_instamart", pattern: "swiggy|instamart|swiggyinstamart|swiggyinstamartprivat|swiggyi nstamartprivat|insta mart|swigg yinstamart", category: "Swiggy/Instamart", merchant_name: "Swiggy / Instamart" },
  { id: "rule_blinkit", pattern: "blinkit|blinkmerce|grofers|blinkcommercepvtltd|blink|blink merce|blinkme rce|blink commerce", category: "Blinkit", merchant_name: "Blinkit" },
  { id: "rule_zomato", pattern: "zomato|dominospizzain|dominos pizzain", category: "Zomato", merchant_name: "Zomato" },
  { id: "rule_amazon", pattern: "amazon|amzn", category: "Amazon", merchant_name: "Amazon" },
  { id: "rule_flipkart", pattern: "flipkart|flipkartminutes|minutes|flipk artminutes|flipkar tminutes", category: "Flipkart", merchant_name: "Flipkart" },
  { id: "rule_uber", pattern: "uber|ubertrip|uber trip", category: "Uber", merchant_name: "Uber" },
  // Precise School & Education Fee rule (MUST NOT contain generic "fees")
  { id: "rule_school", pattern: "school fees|tuition fees|college fees|exam fees|admission fees|school fee|tuition fee|vidyalaya|dps school|dps |drvirendra|virendraswarup|drvir endra|vidya laya|viren draswarup", category: "School", merchant_name: "School Fee" },
  // Office & Co-Working
  { id: "rule_office", pattern: "coworking|wework|reimbursement|awfis|91springboard|smartworks|regus|workspace|officesupplies|stationery|printing|xerox|photocopy|businessexpense|zoom|slack|googleworkspace|microsoftteams|zohocorporationprivin|printer ink|office cab|office lunch|software subscription|courier charge", category: "Office", merchant_name: "Office Expense" },
  // Wifi & Broadband
  { id: "rule_wifi", pattern: "act broadband|actbroadband|spectranet|airtel broadband|airtelbroadband|jiofiber|internet bill|internetbill", category: "Wifi", merchant_name: "Wifi / Broadband" },
  // Insurance
  { id: "rule_insurance", pattern: "lic|star health|starhealth|niva bupa|nivabupa|hdfc ergo|hdfcergo|icici lombard|icicilombard|bajaj allianz|bajajallianz|life insurance|lifeinsurance|health insurance|healthinsurance|care health|carehealth|policy premium|policypremium|insurance premium|insurancepremium", category: "Insurance", merchant_name: "Insurance" },
  // Investments
  { id: "rule_investments", pattern: "zerodha|groww|upstox|angel one|angelone|mutual fund|mutualfund|mutual funds|mutualfunds|sip|nps|small case|smallcase|paytm money|paytmmoney|icici direct|icicidirect|hdfc securities|hdfcsecurities|kotak securities|kotaksecurities|motilal oswal|motilaloswal|stocks|equity investment|equityinvestment|fixed deposit|fixeddeposit|fd|rd|recurring deposit|recurringdeposit", category: "Investments", merchant_name: "Investments & Stocks" },
  // Banking & Transfers
  { id: "rule_banking", pattern: "neft|rtgs|imps|bank transfer|banktransfer|cash withdrawal|cashwithdrawal|atm withdrawal|atmwithdrawal|cash deposit|cashdeposit|cheque|upi transfer|upitransfer", category: "Banking & Transfers", merchant_name: "Bank Transfer" },
  // Donations & Charity
  { id: "rule_charity", pattern: "donation|charity|ngo", category: "Donations & Charity", merchant_name: "Donation / Charity" },
  // Government & Taxes
  { id: "rule_govt_tax", pattern: "income tax|incometax|itr|property tax|propertytax|challan|passport|gst payment|gstpayment|municipal tax|municipaltax|road tax|roadtax|traffic challan|trafficchallan|aadhaar|pan card|pancard|government fee|governmentfee|registration fee|registrationfee|stamp duty|stampduty|court fee|courtfee", category: "Government & Taxes", merchant_name: "Govt Fee / Tax" },
  // Kids & Family
  { id: "rule_kids", pattern: "first cry|firstcry|babyhug|diapers|toys|mothercare|baby food|babyfood|wipes|kids clothing|kidsclothing|kidswear|school supplies|schoolsupplies|baby care|babycare|child care|childcare", category: "Kids & Family", merchant_name: "Kids & Family" },
  // Pet Care
  { id: "rule_pet", pattern: "pet clinic|petclinic|veterinary|dog food|dogfood|cat food|catfood|pet grooming|petgrooming|pet care|petcare|vet|pet shop|petshop|petsy|super tails|supertails|heads up for tails|headsupfortails|huft|pet pharmacy|petpharmacy", category: "Pet Care", merchant_name: "Pet Care" },
  // Home & Maintenance
  { id: "rule_home_maint", pattern: "housejoy|home cleaning|homecleaning|deep cleaning|deepcleaning|pest control|pestcontrol|plumber|electrician|carpenter|appliance repair|appliancerepair|ac repair|acrepair|washing machine repair|washingmachinerepair|refrigerator repair|refrigeratorrepair|ro service|roservice|water purifier|waterpurifier|home maintenance|homemaintenance|housekeeping|maid|laundry|dry clean|dryclean", category: "Home & Maintenance", merchant_name: "Home & Maintenance" },
  // Books & Education
  { id: "rule_books_edu", pattern: "crossword|sapnaonline|bookstore|books|ebook|udemy|coursera|skillshare|upgrad|unacademy|byju|physicswallah|pw|onlinecourse|coaching", category: "Books & Education", merchant_name: "Books & Education" },
  // Food & Dining / Restaurants / Cafes / QSR
  { id: "rule_food_dining", pattern: "bharatpe|bharat pe|mcdonald|mcd|starbucks|tata starbucks|tatastarbucks|domino|jubilant|kfc|yum restaurants|yumrestaurants|burger king|burgerking|eatsure|rebel foods|rebelfoods|faasos|behrouz|haldiram|bikanervala|momostation|momo station|dityafood|ditya food|vookiz|pizzahut|pizza hut|subway|taco bell|tacobell|chaayos|chai point|chaipoint|third wave coffee|thirdwavecoffee|blue tokai|bluetokai|tim hortons|timhortons|dunkin|wow momo|wowmomo|biryani blues|biryaniblues|paradise biryani|paradisebiryani|social|hard rock cafe|hardrockcafe|mainland china|mainlandchina|barbeque nation|barbequenation|absolute barbecue|absolutebarbecue|biryani by kilo|biryanibykilo|rolls king|rollsking|mojo pizza|mojopizza|la pinoz|lapinoz|burger singh|burgersingh|baskin robbins|baskinrobbins|naturals ice cream|naturalsicecream|amul parlour|amulparlour|juice bar|juicebar|bakery|sweet shop|sweetshop|mithai|dhaba|restaurant|cafe|canteen|cafeteria|food court|foodcourt|mess|breakfast|lunch|dinner|coffee|tea|snacks|restaurant bill|restaurantbill|food order|foodorder|takeaway|dining", category: "Food & Dining", merchant_name: "Food & Dining" },
  // Grocery & Essentials
  { id: "rule_grocery_essentials", pattern: "zepto|kiranakart|bigbasket|big basket|bbdaily|bb daily|dmart|d mart|avenue supermarts|avenuesupermarts|nature's basket|naturesbasket|jiomart|jio mart|reliance retail|relianceretail|bbnow|reliance smart|reliancesmart|reliance fresh|reliancefresh|spencers|spar|more supermarket|moresupermarket|easyday|smart bazaar|smartbazaar|metro cash carry|metrocashcarry|vishal mega mart|vishalmegamart|star bazaar|starbazaar|ratnadeep|heritage fresh|heritagefresh|country delight|countrydelight|milk delivery|milkdelivery|vegetable shop|vegetableshop|fruit shop|fruitshop|sabzi|provision store|provisionstore|daily needs|dailyneeds|household supplies|householdsupplies|kirana store|kiranastore|milk|bread|eggs|vegetables|fruits|atta|rice|dal|oil|masala|biscuits|household items", category: "Grocery & Essentials", merchant_name: "Grocery & Essentials" },
  // Shopping & Retail
  { id: "rule_shopping", pattern: "digitalworld|digital world|myntra|nykaa|ajio|zara|h&m|hm|handm|uniqlo|croma|infiniti retail|infinitiretail|apple store|applestore|westside|pantaloons|max fashion|maxfashion|lifestyle|shoppers stop|shoppersstop|reliance trends|reliancetrends|trends|decathlon|ikea|vijay sales|vijaysales|reliance digital|reliancedigital|samsung store|samsungstore|oneplus|mi store|mistore|boat lifestyle|boatlifestyle|noise|titan|fastrack|lenskart|meesho|snapdeal|tatacliq|pepperfry|urban ladder|urbanladder|wakefit|home centre|homecentre|royal oak|royaloak|clothes|shoes|electronics|mobile accessories|home decor|kitchen items|online shopping", category: "Shopping", merchant_name: "Shopping" },
  // Travel & Commute
  { id: "rule_travel_commute", pattern: "ola|ani technologies|anitechnologies|rapido|irctc|makemytrip|mmt|goibibo|ibibo|indigo|interglobe|air india|airindia|fastag|toll|nhai|namma yatri|nammayatri|yulu|bounce|ixigo|redbus|abhibus|akasa air|akasaair|spicejet|vistara|air india express|airindiaexpress|metro|dmrc|delhi metro|delhimetro|upmrc|kanpur metro|kanpurmetro|namma metro|nammametro|upsrtc|roadways|railway|train|flight|airport|oyo|booking.com|bookingcom|agoda|airbnb|trivago|treebo|fabhotels|cab|taxi|auto|rickshaw|paytm fastag|paytmfastag|cab fare|metro recharge|train ticket|flight ticket|hotel booking|toll payment|parking fee", category: "Travel & Commute", merchant_name: "Travel & Commute" },
  // Fuel & Auto
  { id: "rule_fuel_auto", pattern: "indian oil|indianoil|iocl petrol|ioclpetrol|iocl pump|ioclpump|bharat petroleum|bharatpetroleum|bpcl petrol|bpclpetrol|bpcl pump|bpclpump|hindustan petroleum|hindustanpetroleum|hpcl petrol|hpclpetrol|shell petrol|shellpetrol|shell pump|shellpump|jio-bp|jiobp|nayara energy|nayaraenergy|essar|petrol pump|petrolpump|diesel|cng|car service|carservice|bike service|bikeservice|car wash|carwash|tyre|mrf|ceat|apollo tyres|apollotyres|goodyear|parking|maruti service|marutiservice|hyundai service|hyundaiservice|tata motors service|tatamotorsservice|honda service|hondaservice|royal enfield service|royalenfieldservice|bike repair|bikerepair", category: "Fuel & Auto", merchant_name: "Fuel / Vehicle" },
  // Entertainment & Subscriptions
  { id: "rule_entertainment", pattern: "netflix|spotify|youtube|youtube premium|youtubepremium|hotstar|disney|bookmyshow|pvr|inox|playstation|jiohotstar|sony liv|sonyliv|zee5|amazon prime|amazonprime|prime video|primevideo|cinepolis|miraj cinemas|mirajcinemas|xbox|steam|epic games|epicgames|nintendo|gaana|wynk|jiosaavn|audible|kindle unlimited|kindleunlimited|storytel|canva|grammarly|notion|adobe|microsoft 365|microsoft365|google one|googleone|icloud|dropbox|gaming|movie ticket|music subscription|video subscription|streaming", category: "Entertainment & Subscriptions", merchant_name: "Entertainment & Subscriptions" },
  // Bills & Utilities
  { id: "rule_bills_utilities", pattern: "airtel|bharti airtel|bhartiairtel|jio|reliance jio|reliancejio|vodafone|idea|vi bill|vibill|tata power|tatapower|bescom|adani electricity|adanielectricity|bses|torrent power|torrentpower|uppcl|kesc|kanpur electricity|kanpurelectricity|electricity bill|electricitybill|electricity|water bill|waterbill|water supply|watersupply|jal board|jalboard|gas bill|gasbill|indraprastha gas|indraprasthagas|igl|mahanagar gas|mahanagargas|mgl|adani gas|adanigas|png bill|pngbill|tata play|tataplay|dish tv|dishtv|d2h|videocon d2h|videocond2h|sun direct|sundirect|cable|mobile recharge|mobilerecharge|recharge|utility|mobile bill|gas bill|dth recharge", category: "Bills & Utilities", merchant_name: "Bills & Utilities" },
  // Health & Wellness
  { id: "rule_health_wellness", pattern: "apollo pharmacy|apollopharmacy|apollo hospitals|apollohospitals|1mg|tata 1mg|tata1mg|pharmeasy|cult.fit|cultfit|curefit|netmeds|practo|mfine|healthians|thyrocare|lal pathlabs|lalpathlabs|dr lal pathlabs|drlalpathlabs|metropolis|fortis|max hospital|maxhospital|max healthcare|maxhealthcare|medanta|manipal hospital|manipalhospital|aiims|hospital|clinic|doctor|medical|medicine|pharmacy|chemist|diagnostic|pathlab|lab test|labtest|dental|dentist|eyecare|optical|gym|fitness|yoga|physio|wellness|medicine purchase|doctor consultation|health checkup|dental treatment|gym membership", category: "Health & Wellness", merchant_name: "Health & Wellness" },
  // Fees & Charges
  { id: "rule_fees_charges", pattern: "finance charge|financecharge|interest charge|interestcharge|late payment|latepayment|annual fee|annualfee|joining fee|joiningfee|igst|cgst|sgst", category: "Fees & Charges", merchant_name: "Bank Fee / Interest" },
  // Refund & Cashback
  { id: "rule_cashback_generic", pattern: "cashback|reward point|rewardpoint|reversal|refund", category: "Refund & Cashback", merchant_name: "Cashback / Refund" },
  // Personal Care & Grooming
  { id: "rule_personal_care", pattern: "urban company|urbancompany|urban clap|urbanclap|salon|barber|haircut|spa|massage|beauty parlour|beautyparlour|parlour|grooming|body care|bodycare|skincare|lakme salon|lakmesalon|jawed habib|jawedhabib|toni guy|toniguy|looks salon|lookssalon|nail salon|nailsalon|hair salon|hairsalon|salon bill|beauty products", category: "Personal Care", merchant_name: "Personal Care" },
  // EMI & Financial
  { id: "rule_emi_loans", pattern: "bajaj finance|bajajfinance|bajaj finserv|bajajfinserv|hdfc loan|hdfcloan|icici loan|iciciloan|axis loan|axisloan|sbi loan|sbiloan|home loan|homeloan|car loan|carloan|personal loan|personalloan|education loan|educationloan|emi|loan repayment|loanrepayment|loan emi|loanemi|capital float|capitalfloat|kissht|money view|moneyview|lending kart|lendingkart|credit line|creditline|paylater|simpl|lazypay|slice|navi|rupeek", category: "EMI & Financial", merchant_name: "EMI / Loan Repayment" }
];
var RULES_STORAGE_KEY = "statementflow_custom_rules";
function loadUserRules() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return DEFAULT_RULES;
  }
  try {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleanedSaved = parsed.filter((p) => p.pattern !== "fees" && p.pattern !== "upi" && !p.pattern.includes("|fees|"));
        return [...cleanedSaved, ...DEFAULT_RULES.filter((dr) => !cleanedSaved.some((pr) => pr.id === dr.id))];
      }
    }
  } catch (e) {
  }
  return DEFAULT_RULES;
}
function stripCardBrandNoise(text) {
  return text.replace(/\[sbi\]\s*transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card\s*-\s*/gi, " ").replace(/transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card/gi, " ").replace(/bpcl\s*sbi\s*card/gi, " ").replace(/pulse\s*sbi\s*card/gi, " ").replace(/sbi\s*credit\s*card\s*ending\s*with\s*\d+/gi, " ").replace(/icici\s*bank\s*credit\s*card\s*\w+/gi, " ").replace(/debited\s*from\s*your\s*account\s*ending\s*\d+/gi, " ").replace(/❗?\s*you\s*have\s*done\s*a\s*upi\s*txn\.?\s*check\s*details!?/gi, " ").replace(/transaction\s*alert\s*for\s*your/gi, " ").replace(/no\s*(?:further\s*)?charges\s*(?:and|&)?\s*fees|no\s*fees|zero\s*fees|convenience\s*fees/gi, " ").replace(/in\s*case\s*you\s*have\s*not\s*done\s*this\s*transaction[\s\S]*/gi, " ").replace(/school\s*\/?\s*education\s*fee/gi, " ").replace(/school\s*fee/gi, " ").trim();
}
function categorizeTransaction(rawText, rules = loadUserRules()) {
  const cleanDesc = (rawText || "").trim();
  const filteredText = stripCardBrandNoise(cleanDesc);
  const lowerDesc = filteredText.toLowerCase();
  const alphanumericOnly = lowerDesc.replace(/[^a-z0-9]/g, "");
  if (!alphanumericOnly || alphanumericOnly.length < 2) {
    return {
      category: "Other",
      merchant: cleanMerchantName(filteredText || rawText)
    };
  }
  for (const rule of rules) {
    if (!rule || !rule.pattern) continue;
    const keywords = rule.pattern.split(/[|,]/).map((k) => k.trim().toLowerCase()).filter((k) => k.length >= 3 && k !== "fees" && k !== "upi");
    const isMatch = keywords.some((kw) => {
      if (lowerDesc.includes(kw)) return true;
      const kwAlpha = kw.replace(/[^a-z0-9]/g, "");
      if (kwAlpha.length >= 3 && alphanumericOnly.includes(kwAlpha)) return true;
      return false;
    });
    if (isMatch) {
      return {
        category: rule.category || rule.pattern,
        merchant: rule.merchant_name || cleanMerchantName(filteredText)
      };
    }
  }
  return {
    category: "Other",
    merchant: cleanMerchantName(filteredText || rawText)
  };
}
function cleanMerchantName(raw) {
  if (!raw) return "UPI Transaction";
  let cleaned = raw.replace(/\[sbi\]\s*transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card\s*-\s*/gi, "").replace(/❗?\s*you\s*have\s*done\s*a\s*upi\s*txn\.?\s*check\s*details!?/gi, "").replace(/transaction\s*alert\s*for\s*your/gi, "").replace(/school\s*\/?\s*education\s*fee/gi, "").replace(/school\s*fee/gi, "").replace(/^POS\s*\d*\s*/i, "").replace(/^E-COMMERCE\s*/i, "").replace(/^UPI-[A-Z0-9]+-/i, "").replace(/ref\s*no[:.\s]*\w+/gi, "").replace(/auth\s*code[:.\s]*\w+/gi, "").replace(/pvt\s*ltd|private\s*limited|ltd|limited/gi, "").replace(/in\s*mumbai|in\s*delhi|in\s*bangalore|in\s*gurgaon|in\s*noida|in\s*chennai|in\s*hyderabad/gi, "").replace(/[\d]{6,}/g, "").replace(/[\s\-_/\\.:,]+/g, " ").trim();
  if (!cleaned || /^(school|dear|cardholder|customer|inform|transaction|check\s*details|bank|credit\s*card)$/i.test(cleaned)) {
    return "UPI Transaction";
  }
  cleaned = cleaned.split(" ").filter(Boolean).slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return cleaned || "UPI Transaction";
}

// src/server/api.ts
dotenv.config();
var apiRouter = express.Router();
apiRouter.use(express.json({ limit: "50mb" }));
apiRouter.use(express.urlencoded({ extended: true, limit: "50mb" }));
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
apiRouter.post("/extract-statement", async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, cardOverride } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: "Missing fileBase64 in request body" });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is not configured on the server. Please check the Secrets panel."
      });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const cleanBase64 = fileBase64.includes("base64,") ? fileBase64.split("base64,")[1] : fileBase64;
    const effectiveMimeType = mimeType || (fileName?.endsWith(".pdf") ? "application/pdf" : "image/png");
    const prompt = `You are a precision financial OCR and credit card statement parser.
Extract ALL individual transactions, fees, payments, refunds, and metadata from this credit card statement.
File name: "${fileName || "statement.pdf"}".

Guidelines:
1. Extract every single line-item transaction accurately. Do not skip any transaction.
2. For each transaction, identify:
   - Date in strict "YYYY-MM-DD" format.
   - Raw description as printed on the statement.
   - Clean merchant name (e.g. "Zomato", "Swiggy", "Amazon", "Uber", "Blinkit", "Netflix", "Airtel").
   - Amount as a positive number.
   - Type: "debit" (expense, purchase, fee, charge) or "credit" (payment received, cashback, refund, reversal).
   - Category: Select best fit from [Food & Dining, Grocery & Essentials, Shopping, Travel & Commute, Bills & Utilities, Entertainment & Subscriptions, Health & Wellness, Fuel & Auto, EMI & Financial, Fees & Charges, Refund & Cashback, Personal Care, Education, Other].
   - Reference ID: if present (e.g., Ref No, Auth Code, URN).
3. Extract card details (Bank & Card name, last 4 digits if visible).
4. Extract statement billing cycle or month (e.g. "2026-10").
5. Return clean structured JSON conforming to the schema.`;
    const contentParts = [
      {
        inlineData: {
          mimeType: effectiveMimeType,
          data: cleanBase64
        }
      },
      {
        text: prompt
      }
    ];
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contentParts },
      config: {
        systemInstruction: "You are an expert financial document extractor. You output strictly structured JSON only.",
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            card_name: {
              type: Type.STRING,
              description: "Card issuer and product name, e.g. HDFC Regalia Gold, ICICI Sapphiro, Chase Sapphire, Amex"
            },
            card_last4: {
              type: Type.STRING,
              description: "Last 4 digits of the card number if visible, e.g. 4021"
            },
            statement_period: {
              type: Type.STRING,
              description: "Billing period, e.g. 01 Oct 2026 - 31 Oct 2026"
            },
            statement_month: {
              type: Type.STRING,
              description: "Primary statement month in YYYY-MM format, e.g. 2026-10"
            },
            currency: {
              type: Type.STRING,
              description: "Currency symbol or code, e.g. INR, USD, EUR"
            },
            total_debits: {
              type: Type.NUMBER,
              description: "Sum of all debit transactions"
            },
            total_credits: {
              type: Type.NUMBER,
              description: "Sum of all credit transactions"
            },
            transactions: {
              type: Type.ARRAY,
              description: "List of all extracted transactions",
              items: {
                type: Type.OBJECT,
                properties: {
                  date: {
                    type: Type.STRING,
                    description: "Date in YYYY-MM-DD format"
                  },
                  description: {
                    type: Type.STRING,
                    description: "Original raw description"
                  },
                  merchant: {
                    type: Type.STRING,
                    description: "Cleaned merchant name"
                  },
                  amount: {
                    type: Type.NUMBER,
                    description: "Transaction amount"
                  },
                  type: {
                    type: Type.STRING,
                    description: "debit or credit"
                  },
                  category: {
                    type: Type.STRING,
                    description: "Assigned category"
                  },
                  reference_id: {
                    type: Type.STRING,
                    description: "Reference / Auth code"
                  }
                },
                required: ["date", "description", "amount", "type"]
              }
            }
          },
          required: ["transactions"]
        }
      }
    });
    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty extraction response.");
    }
    const parsed = JSON.parse(text);
    const effectiveCard = cardOverride || (parsed.card_name ? `${parsed.card_name}${parsed.card_last4 ? ` - ${parsed.card_last4}` : ""}` : fileName ? fileName.replace(/\.[^/.]+$/, "") : "Credit Card");
    const statementMonthObj = parsed.statement_month ? { key: parsed.statement_month, label: parsed.statement_month } : parsed.transactions?.[0]?.date ? getStatementMonth(parsed.transactions[0].date) : { key: "2026-10", label: "October 2026" };
    const normalizedTransactions = (parsed.transactions || []).map((t, idx) => {
      const type = (t.type || "debit").toLowerCase() === "credit" ? "credit" : "debit";
      const catResult = categorizeTransaction(t.description || t.merchant || "");
      const finalCategory = t.category || catResult.category;
      const finalMerchant = t.merchant || catResult.merchant;
      const date = t.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const amount = Math.abs(Number(t.amount) || 0);
      const txId = generateTransactionId({
        card: effectiveCard,
        date,
        amount,
        type,
        description: t.description || finalMerchant,
        reference_id: t.reference_id || `item_${idx}`
      });
      return {
        transaction_id: txId,
        date,
        description: t.description || finalMerchant,
        merchant: finalMerchant,
        amount,
        type,
        category: finalCategory,
        card: effectiveCard,
        statement_id: `STMT_${effectiveCard.replace(/[^a-zA-Z0-9]/g, "")}_${statementMonthObj.key.replace("-", "")}`,
        statement_month: statementMonthObj.key,
        source_file: fileName || "statement.pdf",
        reference_id: t.reference_id || "",
        created_date: (/* @__PURE__ */ new Date()).toISOString(),
        updated_date: (/* @__PURE__ */ new Date()).toISOString()
      };
    });
    const filteredTransactions = normalizedTransactions.filter((t) => t.amount <= 25e3);
    return res.json({
      success: true,
      data: {
        card_name: effectiveCard,
        card_last4: parsed.card_last4 || "",
        statement_period: parsed.statement_period || statementMonthObj.label,
        statement_month: statementMonthObj.key,
        currency: parsed.currency || "INR",
        total_debits: filteredTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0),
        total_credits: filteredTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0),
        transactions: filteredTransactions
      }
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to extract statement data"
    });
  }
});
function extractEmailsLocallyOnServer(emails) {
  const result = [];
  for (const email of emails) {
    const subject = email.subject || "";
    const bodyText = email.bodyText || email.snippet || "";
    const fullText = `${subject}
${email.snippet || ""}
${bodyText}`;
    const forwardSplitter = /---------- Forwarded message ---------/gi;
    const trails = fullText.split(forwardSplitter).map((t) => t.trim()).filter((t) => t.length > 20);
    const effectiveTrails = trails.length > 0 ? trails : [fullText];
    effectiveTrails.forEach((trail, idx) => {
      const amtMatch = trail.match(/(?:inr|rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)/i);
      if (!amtMatch) return;
      const amount = parseFloat(amtMatch[1].replace(/,/g, ""));
      if (isNaN(amount) || amount <= 0 || amount > 25e3) return;
      let card = "Credit Card";
      const cardLast4Match = trail.match(/(?:ending\s*(?:with)?|card\s*(?:no\.?)?|xx|account\s*ending)\s*(\d{4})/i) || subject.match(/(?:ending\s*(?:with)?|card\s*(?:no\.?)?|xx|account\s*ending)\s*(\d{4})/i);
      const cardLast4 = cardLast4Match ? cardLast4Match[1] : "";
      if (/BPCL\s*SBI/i.test(trail) || /BPCL/i.test(subject)) {
        card = `BPCL SBI Card - ${cardLast4 || "1024"}`;
      } else if (/Pulse\s*SBI/i.test(trail) || /Pulse/i.test(subject)) {
        card = `Pulse SBI Card - ${cardLast4 || "3524"}`;
      } else if (/SBI\s*Credit\s*Card|SBI\s*Card/i.test(trail)) {
        card = `SBI Credit Card - ${cardLast4 || "1035"}`;
      } else if (/ICICI/i.test(trail)) {
        card = `ICICI Bank Credit Card - ${cardLast4 || "4104"}`;
      } else if (/HDFC/i.test(trail)) {
        card = `HDFC Bank - ${cardLast4 || "4192"}`;
      }
      let referenceId = "";
      const upiRefMatch = trail.match(/(?:UPI\s*transaction\s*reference\s*no\.?|UPI\s*Ref(?:\s*no\.?)?)\s*[:.\s]*(\d+)/i);
      const stdRefMatch = trail.match(/(?:\(?\s*Ref\s*No\.?\s*[:.\s]*|\(Ref No\.\s*)(\d+)/i);
      const authMatch = trail.match(/(?:auth\s*code|rrn|txn\s*id)\s*[:.\s]*([A-Za-z0-9]+)/i);
      if (upiRefMatch) referenceId = upiRefMatch[1];
      else if (stdRefMatch) referenceId = stdRefMatch[1];
      else if (authMatch) referenceId = authMatch[1];
      let merchant = "";
      const sbiAtMerchantMatch = trail.match(/(?:spent\s+on\s+your\s+[^.]+?|spent)\s+at\s+([A-Za-z0-9\s._\-&]{2,40}?)\s+on\s+\d{1,2}[-/]/i);
      if (sbiAtMerchantMatch) {
        const raw = sbiAtMerchantMatch[1].trim();
        if (!/dear|cardholder|this\s+is|you\s+have|inform|credit\s+card/i.test(raw)) {
          merchant = cleanMerchantName(raw);
        }
      }
      if (!merchant) {
        const hdfcVpaParenMatch = trail.match(/towards\s+VPA\s+[^\s(]+\s*\(([^)]+)\)/i);
        if (hdfcVpaParenMatch) merchant = cleanMerchantName(hdfcVpaParenMatch[1]);
      }
      if (!merchant) {
        const iciciInfoMatch = trail.match(/Info:\s*([A-Za-z0-9\s._\-&]+?)(?:\.|\n|\r|$)/i);
        if (iciciInfoMatch) merchant = cleanMerchantName(iciciInfoMatch[1]);
      }
      if (!merchant && subject.includes(" - ")) {
        const parts = subject.split(" - ");
        merchant = cleanMerchantName(parts[parts.length - 1]);
      }
      const catRes = categorizeTransaction(`${merchant} ${trail}`);
      const finalCategory = catRes.category || "Other";
      const finalMerchant = catRes.merchant && catRes.merchant !== "Unknown Merchant" && catRes.merchant !== "School / Education Fee" && catRes.merchant !== "School Fee" ? catRes.merchant : merchant || "UPI Transaction";
      let dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const dmyMatch = trail.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
      if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, "0");
        const month = dmyMatch[2].padStart(2, "0");
        let year = dmyMatch[3];
        if (year.length === 2) year = `20${year}`;
        dateStr = `${year}-${month}-${day}`;
      }
      const type = /(?:credited|deposit|refund|cashback|payment\s*received)/i.test(trail) ? "credit" : "debit";
      const cleanRefId = referenceId || `${email.messageId || "msg"}_${idx}`;
      const monthObj = getStatementMonth(dateStr);
      const txId = generateTransactionId({
        card,
        date: dateStr,
        amount,
        type,
        description: finalMerchant,
        reference_id: cleanRefId
      });
      result.push({
        transaction_id: txId,
        date: dateStr,
        description: `${subject} - ${finalMerchant}`,
        merchant: finalMerchant,
        amount,
        type,
        category: finalCategory,
        card,
        statement_id: `EMAIL_ALERT_${dateStr.substring(0, 7).replace("-", "")}`,
        statement_month: dateStr.substring(0, 7),
        source_file: `Gmail: ${subject}`,
        reference_id: cleanRefId,
        created_date: (/* @__PURE__ */ new Date()).toISOString(),
        updated_date: (/* @__PURE__ */ new Date()).toISOString(),
        notes: `Ref: ${cleanRefId} \u2022 ${finalMerchant}`,
        email_body: trail
      });
    });
  }
  return result;
}
apiRouter.post("/extract-emails", async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.json({ success: true, transactions: [] });
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const localResult = extractEmailsLocallyOnServer(emails);
      return res.json({ success: true, transactions: localResult });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const prompt = `You are an expert Indian bank transaction alert email extractor.
Extract ALL distinct financial transactions from the emails below with amount <= 25000.
Emails payload:
${JSON.stringify(emails, null, 2)}

Return structured JSON array:
- date: YYYY-MM-DD
- description: Clean summary
- merchant: Exact clean merchant name
- amount: Positive number (<= 25000)
- type: "debit" or "credit"
- category: Category name
- card: Card name
- reference_id: Ref No / UPI reference number
- email_subject: Original email subject`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING },
              category: { type: Type.STRING },
              card: { type: Type.STRING },
              reference_id: { type: Type.STRING },
              email_subject: { type: Type.STRING }
            },
            required: ["date", "merchant", "amount", "type", "card"]
          }
        }
      }
    });
    const text = response.text;
    const parsed = text ? JSON.parse(text) : [];
    const normalized = parsed.filter((item) => {
      const amt = Math.abs(Number(item.amount) || 0);
      return amt > 0 && amt <= 25e3;
    }).map((item) => {
      const type = (item.type || "debit").toLowerCase() === "credit" ? "credit" : "debit";
      const monthObj = getStatementMonth(item.date || (/* @__PURE__ */ new Date()).toISOString());
      const txId = generateTransactionId({
        card: item.card,
        date: item.date,
        amount: item.amount,
        type,
        description: item.description || item.merchant,
        reference_id: item.reference_id
      });
      return {
        transaction_id: txId,
        date: item.date,
        description: item.description || item.email_subject,
        merchant: item.merchant,
        amount: Math.abs(Number(item.amount) || 0),
        type,
        category: item.category || "Other",
        card: item.card,
        statement_id: `EMAIL_ALERT_${(item.date ? item.date.substring(0, 7) : monthObj.key).replace("-", "")}`,
        statement_month: item.date && /^\d{4}-\d{2}/.test(item.date) ? item.date.substring(0, 7) : monthObj.key,
        source_file: `Gmail: ${item.email_subject || "Transaction Alert"}`,
        reference_id: item.reference_id || "",
        created_date: (/* @__PURE__ */ new Date()).toISOString(),
        updated_date: (/* @__PURE__ */ new Date()).toISOString(),
        notes: item.reference_id ? `Ref: ${item.reference_id} \u2022 ${item.merchant}` : `Synced from Gmail alert`,
        email_body: item.email_body || item.description || ""
      };
    });
    return res.json({ success: true, transactions: normalized });
  } catch (_quotaError) {
    const fallbackResult = extractEmailsLocallyOnServer(emails);
    return res.json({ success: true, transactions: fallbackResult });
  }
});

// server.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express2();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", apiRouter);
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express2.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
