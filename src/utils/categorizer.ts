import { CategoryRule } from '../types/expense';

export const DEFAULT_CATEGORIES = [
  'Office',
  'Zomato',
  'Swiggy/Instamart',
  'Blinkit',
  'IITK',
  'Gulmohar',
  'Amazon',
  'Flipkart',
  'Uber',
  'School',
  'Rent',
  'Wifi',
  'Insurance',
  'Investments',
  'Kids & Family',
  'Pet Care',
  'Home & Maintenance',
  'Banking & Transfers',
  'Donations & Charity',
  'Government & Taxes',
  'Books & Education',
  'Food & Dining',
  'Grocery & Essentials',
  'Shopping',
  'Travel & Commute',
  'Bills & Utilities',
  'Entertainment & Subscriptions',
  'Health & Wellness',
  'Fuel & Auto',
  'EMI & Financial',
  'Fees & Charges',
  'Refund & Cashback',
  'Personal Care',
  'Others',
  'Other'
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Office': { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  'Zomato': { bg: 'bg-red-500/10', text: 'text-red-500 dark:text-red-400', border: 'border-red-500/20', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  'Swiggy/Instamart': { bg: 'bg-orange-500/10', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-500/20', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  'Blinkit': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
  'IITK': { bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  'Gulmohar': { bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/20', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  'Amazon': { bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  'Flipkart': { bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/20', badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  'Uber': { bg: 'bg-zinc-500/10', text: 'text-zinc-400 dark:text-zinc-300', border: 'border-zinc-500/20', badge: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-300' },
  'School': { bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  'Rent': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  'Wifi': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  'Insurance': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  'Investments': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  'Kids & Family': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' },
  'Pet Care': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  'Home & Maintenance': { bg: 'bg-stone-500/10', text: 'text-stone-600 dark:text-stone-400', border: 'border-stone-500/20', badge: 'bg-stone-100 text-stone-800 dark:bg-stone-950 dark:text-stone-300' },
  'Banking & Transfers': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300' },
  'Donations & Charity': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  'Government & Taxes': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  'Books & Education': { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  'Food & Dining': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  'Grocery & Essentials': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  'Shopping': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  'Travel & Commute': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  'Bills & Utilities': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  'Entertainment & Subscriptions': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  'Health & Wellness': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  'Fuel & Auto': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  'EMI & Financial': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  'Fees & Charges': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  'Refund & Cashback': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20', badge: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  'Personal Care': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' },
  'Others': { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-500/20', badge: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
  'Other': { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-500/20', badge: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' }
};

export const DEFAULT_RULES: CategoryRule[] = [
  // User Priority Tags & Explicit Rules
  { id: 'rule_rent', pattern: 'house rent|monthly rent|flat rent|office rent|rent payment|rent upi|rent online|rent txn|rent limited|rent pvt ltd', category: 'Rent', merchant_name: 'House Rent' },
  { id: 'rule_satyam', pattern: 'satyamkumarmishra|satyam kumar mishra|satyamk umarmishra|satya mkumarmishra', category: 'Refund & Cashback', merchant_name: 'Satyam Kumar Mishra' },
  { id: 'rule_iitk', pattern: 'iitk|iit kanpur|iitkanpur|tadkaiit|tadka iit|mstendulkar|msten dulkar|mstendu lkar|visitors|visitorshostel1in|visitors hostel|cafecoffeedayin|urbanvadapavsinghpin|urbancompanylimitedin|iitkanpurgirlshallin|iitkanpurmainhallin|coffeedaygloballimin|vikasmaheshwariin', category: 'IITK', merchant_name: 'IIT Kanpur' },
  { id: 'rule_gulmohar', pattern: 'gulmohar|gulmohar restaurant|gulmohur|gulmoharrestaurant', category: 'Gulmohar', merchant_name: 'Gulmohar' },
  { id: 'rule_anujasharma', pattern: 'anujasharma|anuja sharma|anujash arma', category: 'Grocery & Essentials', merchant_name: 'Anuja Sharma' },
  { id: 'rule_anupam', pattern: 'anupam store|anupam restaurant|anupam sweet|anupam dhaba|anupam', category: 'Food & Dining', merchant_name: 'Anupam' },
  { id: 'rule_tatacapital', pattern: 'tatacapital|tata capital|tatac apital|tatacap ital', category: 'EMI & Financial', merchant_name: 'Tata Capital Limited' },
  { id: 'rule_swiggy_instamart', pattern: 'swiggy|instamart|swiggyinstamart|swiggyinstamartprivat|swiggyi nstamartprivat|insta mart|swigg yinstamart', category: 'Swiggy/Instamart', merchant_name: 'Swiggy / Instamart' },
  { id: 'rule_blinkit', pattern: 'blinkit|blinkmerce|grofers|blinkcommercepvtltd|blink|blink merce|blinkme rce|blink commerce', category: 'Blinkit', merchant_name: 'Blinkit' },
  { id: 'rule_zomato', pattern: 'zomato|dominospizzain|dominos pizzain', category: 'Zomato', merchant_name: 'Zomato' },
  { id: 'rule_amazon', pattern: 'amazon|amzn', category: 'Amazon', merchant_name: 'Amazon' },
  { id: 'rule_flipkart', pattern: 'flipkart|flipkartminutes|minutes|flipk artminutes|flipkar tminutes', category: 'Flipkart', merchant_name: 'Flipkart' },
  { id: 'rule_uber', pattern: 'uber|ubertrip|uber trip', category: 'Uber', merchant_name: 'Uber' },

  // Precise School & Education Fee rule (MUST NOT contain generic "fees")
  { id: 'rule_school', pattern: 'school fees|tuition fees|college fees|exam fees|admission fees|school fee|tuition fee|vidyalaya|dps school|dps |drvirendra|virendraswarup|drvir endra|vidya laya|viren draswarup', category: 'School', merchant_name: 'School Fee' },

  // Office & Co-Working
  { id: 'rule_office', pattern: 'coworking|wework|reimbursement|awfis|91springboard|smartworks|regus|workspace|officesupplies|stationery|printing|xerox|photocopy|businessexpense|zoom|slack|googleworkspace|microsoftteams|zohocorporationprivin|printer ink|office cab|office lunch|software subscription|courier charge', category: 'Office', merchant_name: 'Office Expense' },

  // Wifi & Broadband
  { id: 'rule_wifi', pattern: 'act broadband|actbroadband|spectranet|airtel broadband|airtelbroadband|jiofiber|internet bill|internetbill', category: 'Wifi', merchant_name: 'Wifi / Broadband' },

  // Insurance (strict patterns - no bare 'lic' to avoid false positives with 'click' or 'applicable')
  { id: 'rule_insurance', pattern: 'lic of india|life insurance corporation|lic premium|lic india|star health|starhealth|niva bupa|nivabupa|hdfc ergo|hdfcergo|icici lombard|icicilombard|bajaj allianz|bajajallianz|life insurance|lifeinsurance|health insurance|healthinsurance|care health|carehealth|policy premium|policypremium|insurance premium|insurancepremium', category: 'Insurance' },

  // Investments
  { id: 'rule_investments', pattern: 'zerodha|groww|upstox|angel one|angelone|mutual fund|mutualfund|mutual funds|mutualfunds|sip|nps|small case|smallcase|paytm money|paytmmoney|icici direct|icicidirect|hdfc securities|hdfcsecurities|kotak securities|kotaksecurities|motilal oswal|motilaloswal|stocks|equity investment|equityinvestment|fixed deposit|fixeddeposit|fd|rd|recurring deposit|recurringdeposit', category: 'Investments', merchant_name: 'Investments & Stocks' },

  // Banking & Transfers
  { id: 'rule_banking', pattern: 'neft|rtgs|imps|bank transfer|banktransfer|cash withdrawal|cashwithdrawal|atm withdrawal|atmwithdrawal|cash deposit|cashdeposit|cheque|upi transfer|upitransfer', category: 'Banking & Transfers', merchant_name: 'Bank Transfer' },

  // Donations & Charity
  { id: 'rule_charity', pattern: 'donation|charity|ngo', category: 'Donations & Charity', merchant_name: 'Donation / Charity' },

  // Government & Taxes
  { id: 'rule_govt_tax', pattern: 'income tax|incometax|itr|property tax|propertytax|challan|passport|gst payment|gstpayment|municipal tax|municipaltax|road tax|roadtax|traffic challan|trafficchallan|aadhaar|pan card|pancard|government fee|governmentfee|registration fee|registrationfee|stamp duty|stampduty|court fee|courtfee', category: 'Government & Taxes', merchant_name: 'Govt Fee / Tax' },

  // Kids & Family
  { id: 'rule_kids', pattern: 'first cry|firstcry|babyhug|diapers|toys|mothercare|baby food|babyfood|wipes|kids clothing|kidsclothing|kidswear|school supplies|schoolsupplies|baby care|babycare|child care|childcare', category: 'Kids & Family', merchant_name: 'Kids & Family' },

  // Pet Care
  { id: 'rule_pet', pattern: 'pet clinic|petclinic|veterinary|dog food|dogfood|cat food|catfood|pet grooming|petgrooming|pet care|petcare|vet|pet shop|petshop|petsy|super tails|supertails|heads up for tails|headsupfortails|huft|pet pharmacy|petpharmacy', category: 'Pet Care', merchant_name: 'Pet Care' },

  // Home & Maintenance
  { id: 'rule_home_maint', pattern: 'housejoy|home cleaning|homecleaning|deep cleaning|deepcleaning|pest control|pestcontrol|plumber|electrician|carpenter|appliance repair|appliancerepair|ac repair|acrepair|washing machine repair|washingmachinerepair|refrigerator repair|refrigeratorrepair|ro service|roservice|water purifier|waterpurifier|home maintenance|homemaintenance|housekeeping|maid|laundry|dry clean|dryclean', category: 'Home & Maintenance', merchant_name: 'Home & Maintenance' },

  // Books & Education
  { id: 'rule_books_edu', pattern: 'crossword|sapnaonline|bookstore|books|ebook|udemy|coursera|skillshare|upgrad|unacademy|byju|physicswallah|pw|onlinecourse|coaching', category: 'Books & Education', merchant_name: 'Books & Education' },

  // Food & Dining / Restaurants / Cafes / QSR
  { id: 'rule_food_dining', pattern: 'bharatpe|bharat pe|mcdonald|mcd|starbucks|tata starbucks|tatastarbucks|domino|jubilant|kfc|yum restaurants|yumrestaurants|burger king|burgerking|eatsure|rebel foods|rebelfoods|faasos|behrouz|haldiram|bikanervala|momostation|momo station|dityafood|ditya food|vookiz|pizzahut|pizza hut|subway|taco bell|tacobell|chaayos|chai point|chaipoint|third wave coffee|thirdwavecoffee|blue tokai|bluetokai|tim hortons|timhortons|dunkin|wow momo|wowmomo|biryani blues|biryaniblues|paradise biryani|paradisebiryani|social|hard rock cafe|hardrockcafe|mainland china|mainlandchina|barbeque nation|barbequenation|absolute barbecue|absolutebarbecue|biryani by kilo|biryanibykilo|rolls king|rollsking|mojo pizza|mojopizza|la pinoz|lapinoz|burger singh|burgersingh|baskin robbins|baskinrobbins|naturals ice cream|naturalsicecream|amul parlour|amulparlour|juice bar|juicebar|bakery|sweet shop|sweetshop|mithai|dhaba|restaurant|cafe|canteen|cafeteria|food court|foodcourt|mess|breakfast|lunch|dinner|coffee|tea|snacks|restaurant bill|restaurantbill|food order|foodorder|takeaway|dining', category: 'Food & Dining', merchant_name: 'Food & Dining' },

  // Grocery & Essentials
  { id: 'rule_grocery_essentials', pattern: 'zepto|kiranakart|bigbasket|big basket|bbdaily|bb daily|dmart|d mart|avenue supermarts|avenuesupermarts|nature\'s basket|naturesbasket|jiomart|jio mart|reliance retail|relianceretail|bbnow|reliance smart|reliancesmart|reliance fresh|reliancefresh|spencers|spar|more supermarket|moresupermarket|easyday|smart bazaar|smartbazaar|metro cash carry|metrocashcarry|vishal mega mart|vishalmegamart|star bazaar|starbazaar|ratnadeep|heritage fresh|heritagefresh|country delight|countrydelight|milk delivery|milkdelivery|vegetable shop|vegetableshop|fruit shop|fruitshop|sabzi|provision store|provisionstore|daily needs|dailyneeds|household supplies|householdsupplies|kirana store|kiranastore|milk|bread|eggs|vegetables|fruits|atta|rice|dal|oil|masala|biscuits|household items', category: 'Grocery & Essentials', merchant_name: 'Grocery & Essentials' },

  // Shopping & Retail
  { id: 'rule_shopping', pattern: 'digitalworld|digital world|myntra|nykaa|ajio|zara|h&m|hm|handm|uniqlo|croma|infiniti retail|infinitiretail|apple store|applestore|westside|pantaloons|max fashion|maxfashion|lifestyle|shoppers stop|shoppersstop|reliance trends|reliancetrends|trends|decathlon|ikea|vijay sales|vijaysales|reliance digital|reliancedigital|samsung store|samsungstore|oneplus|mi store|mistore|boat lifestyle|boatlifestyle|noise|titan|fastrack|lenskart|meesho|snapdeal|tatacliq|pepperfry|urban ladder|urbanladder|wakefit|home centre|homecentre|royal oak|royaloak|clothes|shoes|electronics|mobile accessories|home decor|kitchen items|online shopping', category: 'Shopping', merchant_name: 'Shopping' },

  // Travel & Commute
  { id: 'rule_travel_commute', pattern: 'ola|ani technologies|anitechnologies|rapido|irctc|makemytrip|mmt|goibibo|ibibo|indigo|interglobe|air india|airindia|fastag|toll|nhai|namma yatri|nammayatri|yulu|bounce|ixigo|redbus|abhibus|akasa air|akasaair|spicejet|vistara|air india express|airindiaexpress|metro|dmrc|delhi metro|delhimetro|upmrc|kanpur metro|kanpurmetro|namma metro|nammametro|upsrtc|roadways|railway|train|flight|airport|oyo|booking.com|bookingcom|agoda|airbnb|trivago|treebo|fabhotels|cab|taxi|auto|rickshaw|paytm fastag|paytmfastag|cab fare|metro recharge|train ticket|flight ticket|hotel booking|toll payment|parking fee', category: 'Travel & Commute', merchant_name: 'Travel & Commute' },

  // Fuel & Auto
  { id: 'rule_fuel_auto', pattern: 'indian oil|indianoil|iocl petrol|ioclpetrol|iocl pump|ioclpump|bharat petroleum|bharatpetroleum|bpcl petrol|bpclpetrol|bpcl pump|bpclpump|hindustan petroleum|hindustanpetroleum|hpcl petrol|hpclpetrol|shell petrol|shellpetrol|shell pump|shellpump|jio-bp|jiobp|nayara energy|nayaraenergy|essar|petrol pump|petrolpump|diesel|cng|car service|carservice|bike service|bikeservice|car wash|carwash|tyre|mrf|ceat|apollo tyres|apollotyres|goodyear|parking|maruti service|marutiservice|hyundai service|hyundaiservice|tata motors service|tatamotorsservice|honda service|hondaservice|royal enfield service|royalenfieldservice|bike repair|bikerepair', category: 'Fuel & Auto', merchant_name: 'Fuel / Vehicle' },

  // Entertainment & Subscriptions
  { id: 'rule_entertainment', pattern: 'netflix|spotify|youtube|youtube premium|youtubepremium|hotstar|disney|bookmyshow|pvr|inox|playstation|jiohotstar|sony liv|sonyliv|zee5|amazon prime|amazonprime|prime video|primevideo|cinepolis|miraj cinemas|mirajcinemas|xbox|steam|epic games|epicgames|nintendo|gaana|wynk|jiosaavn|audible|kindle unlimited|kindleunlimited|storytel|canva|grammarly|notion|adobe|microsoft 365|microsoft365|google one|googleone|icloud|dropbox|gaming|movie ticket|music subscription|video subscription|streaming', category: 'Entertainment & Subscriptions', merchant_name: 'Entertainment & Subscriptions' },

  // Bills & Utilities
  { id: 'rule_bills_utilities', pattern: 'airtel|bharti airtel|bhartiairtel|jio|reliance jio|reliancejio|vodafone|idea|vi bill|vibill|tata power|tatapower|bescom|adani electricity|adanielectricity|bses|torrent power|torrentpower|uppcl|kesc|kanpur electricity|kanpurelectricity|electricity bill|electricitybill|electricity|water bill|waterbill|water supply|watersupply|jal board|jalboard|gas bill|gasbill|indraprastha gas|indraprasthagas|igl|mahanagar gas|mahanagargas|mgl|adani gas|adanigas|png bill|pngbill|tata play|tataplay|dish tv|dishtv|d2h|videocon d2h|videocond2h|sun direct|sundirect|cable|mobile recharge|mobilerecharge|recharge|utility|mobile bill|gas bill|dth recharge', category: 'Bills & Utilities', merchant_name: 'Bills & Utilities' },

  // Health & Wellness
  { id: 'rule_health_wellness', pattern: 'apollo pharmacy|apollopharmacy|apollo hospitals|apollohospitals|1mg|tata 1mg|tata1mg|pharmeasy|cult.fit|cultfit|curefit|netmeds|practo|mfine|healthians|thyrocare|lal pathlabs|lalpathlabs|dr lal pathlabs|drlalpathlabs|metropolis|fortis|max hospital|maxhospital|max healthcare|maxhealthcare|medanta|manipal hospital|manipalhospital|aiims|hospital|clinic|doctor|medical|medicine|pharmacy|chemist|diagnostic|pathlab|lab test|labtest|dental|dentist|eyecare|optical|gym|fitness|yoga|physio|wellness|medicine purchase|doctor consultation|health checkup|dental treatment|gym membership', category: 'Health & Wellness', merchant_name: 'Health & Wellness' },

  // Fees & Charges
  { id: 'rule_fees_charges', pattern: 'finance charge|financecharge|interest charge|interestcharge|late payment|latepayment|annual fee|annualfee|joining fee|joiningfee|igst|cgst|sgst', category: 'Fees & Charges', merchant_name: 'Bank Fee / Interest' },

  // Refund & Cashback
  { id: 'rule_cashback_generic', pattern: 'cashback|reward point|rewardpoint|reversal|refund', category: 'Refund & Cashback', merchant_name: 'Cashback / Refund' },

  // Personal Care & Grooming
  { id: 'rule_personal_care', pattern: 'urban company|urbancompany|urban clap|urbanclap|salon|barber|haircut|spa|massage|beauty parlour|beautyparlour|parlour|grooming|body care|bodycare|skincare|lakme salon|lakmesalon|jawed habib|jawedhabib|toni guy|toniguy|looks salon|lookssalon|nail salon|nailsalon|hair salon|hairsalon|salon bill|beauty products', category: 'Personal Care', merchant_name: 'Personal Care' },

  // EMI & Financial
  { id: 'rule_emi_loans', pattern: 'bajaj finance|bajajfinance|bajaj finserv|bajajfinserv|hdfc loan|hdfcloan|icici loan|iciciloan|axis loan|axisloan|sbi loan|sbiloan|home loan|homeloan|car loan|carloan|personal loan|personalloan|education loan|educationloan|emi|loan repayment|loanrepayment|loan emi|loanemi|capital float|capitalfloat|kissht|money view|moneyview|lending kart|lendingkart|credit line|creditline|paylater|simpl|lazypay|slice|navi|rupeek', category: 'EMI & Financial', merchant_name: 'EMI / Loan Repayment' }
];

const RULES_STORAGE_KEY = 'statementflow_custom_rules';

export function loadUserRules(): CategoryRule[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_RULES;
  }
  try {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any stale/broken rules that matched generic "fees", "upi", or bare "lic"
        const cleanedSaved = parsed.filter(p =>
          p.pattern !== 'fees' &&
          p.pattern !== 'upi' &&
          p.pattern !== 'lic' &&
          p.id !== 'rule_insurance' &&
          !p.pattern.includes('|fees|')
        );
        return [...cleanedSaved, ...DEFAULT_RULES.filter(dr => !cleanedSaved.some((pr: CategoryRule) => pr.id === dr.id))];
      }
    }
  } catch (e) {
    // Silent fail on server or restricted environments
  }
  return DEFAULT_RULES;
}

export function saveUserRule(newRule: Omit<CategoryRule, 'id'>): CategoryRule[] {
  const current = loadUserRules();
  const rule: CategoryRule = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...newRule
  };
  // Put custom rule at the beginning so it takes highest priority
  const updated = [rule, ...current.filter(r => r.pattern.toLowerCase() !== newRule.pattern.toLowerCase())];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(updated.filter(r => r.id.startsWith('custom_') || r.id.startsWith('sheet_rule_'))));
    } catch (e) {
      // Silent fail
    }
  }
  return updated;
}

/**
 * Escapes regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips card-branding noise and generic email boilerplate
 * so that pattern matching focuses only on real merchant/transaction text.
 */
function stripCardBrandNoise(text: string): string {
  return text
    .replace(/\[sbi\]\s*transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card\s*-\s*/gi, ' ')
    .replace(/transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card/gi, ' ')
    .replace(/bpcl\s*sbi\s*card/gi, ' ')
    .replace(/pulse\s*sbi\s*card/gi, ' ')
    .replace(/sbi\s*credit\s*card\s*ending\s*with\s*\d+/gi, ' ')
    .replace(/icici\s*bank\s*credit\s*card\s*\w+/gi, ' ')
    .replace(/debited\s*from\s*your\s*account\s*ending\s*\d+/gi, ' ')
    .replace(/❗?\s*you\s*have\s*done\s*a\s*upi\s*txn\.?\s*check\s*details!?/gi, ' ')
    .replace(/transaction\s*alert\s*for\s*your/gi, ' ')
    .replace(/no\s*(?:further\s*)?charges\s*(?:and|&)?\s*fees|no\s*fees|zero\s*fees|convenience\s*fees/gi, ' ')
    .replace(/in\s*case\s*you\s*have\s*not\s*done\s*this\s*transaction[\s\S]*/gi, ' ')
    .replace(/school\s*\/?\s*education\s*fee/gi, ' ')
    .replace(/school\s*fee/gi, ' ')
    .trim();
}

/**
 * Categorizes a transaction and extracts a clean merchant name.
 * If no specific rule matches, it assigns the category 'Others'.
 */
export function categorizeTransaction(
  rawText: string,
  rules: CategoryRule[] = loadUserRules()
): { category: string; merchant: string } {
  const cleanDesc = (rawText || '').trim();
  const filteredText = stripCardBrandNoise(cleanDesc);
  const lowerDesc = filteredText.toLowerCase();
  const alphanumericOnly = lowerDesc.replace(/[^a-z0-9]/g, '');

  if (!alphanumericOnly || alphanumericOnly.length < 2) {
    return {
      category: 'Others',
      merchant: cleanMerchantName(filteredText || rawText)
    };
  }

  for (const rule of rules) {
    if (!rule || !rule.pattern) continue;
    
    // Split patterns by | or comma
    const keywords = rule.pattern
      .split(/[|,]/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length >= 2 && k !== 'fees' && k !== 'upi');

    const isMatch = keywords.some(kw => {
      // Require word boundary for short keywords to prevent false positives (e.g. "lic" in "click"/"applicable")
      if (kw.length <= 4) {
        const boundaryRegex = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(kw)}(?:$|[^a-z0-9])`, 'i');
        return boundaryRegex.test(lowerDesc);
      }
      if (lowerDesc.includes(kw)) return true;
      const kwAlpha = kw.replace(/[^a-z0-9]/g, '');
      if (kwAlpha.length >= 4 && alphanumericOnly.includes(kwAlpha)) return true;
      return false;
    });

    if (isMatch) {
      return {
        category: rule.category || 'Others',
        merchant: rule.merchant_name || cleanMerchantName(filteredText)
      };
    }
  }

  // Fallback: If no matching category rule is found, assign the category Others
  return {
    category: 'Others',
    merchant: cleanMerchantName(filteredText || rawText)
  };
}

/**
 * Cleans ugly POS description into a clean readable merchant label
 */
export function cleanMerchantName(raw: string): string {
  if (!raw) return 'UPI Transaction';
  let cleaned = raw
    .replace(/\[sbi\]\s*transaction\s*alert\s*from\s*(?:bpcl|pulse)?\s*sbi\s*card\s*-\s*/gi, '')
    .replace(/❗?\s*you\s*have\s*done\s*a\s*upi\s*txn\.?\s*check\s*details!?/gi, '')
    .replace(/transaction\s*alert\s*for\s*your/gi, '')
    .replace(/school\s*\/?\s*education\s*fee/gi, '')
    .replace(/school\s*fee/gi, '')
    .replace(/^POS\s*\d*\s*/i, '')
    .replace(/^E-COMMERCE\s*/i, '')
    .replace(/^UPI-[A-Z0-9]+-/i, '')
    .replace(/ref\s*no[:.\s]*\w+/gi, '')
    .replace(/auth\s*code[:.\s]*\w+/gi, '')
    .replace(/pvt\s*ltd|private\s*limited|ltd|limited/gi, '')
    .replace(/in\s*mumbai|in\s*delhi|in\s*bangalore|in\s*gurgaon|in\s*noida|in\s*chennai|in\s*hyderabad/gi, '')
    .replace(/[\d]{6,}/g, '')
    .replace(/[\s\-_/\\.:,]+/g, ' ')
    .trim();

  // If cleaned string is empty or contains only noise words
  if (!cleaned || /^(school|dear|cardholder|customer|inform|transaction|check\s*details|bank|credit\s*card|insurance)$/i.test(cleaned)) {
    return 'UPI Transaction';
  }

  // Capitalize nicely
  cleaned = cleaned
    .split(' ')
    .filter(Boolean)
    .slice(0, 4)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return cleaned || 'UPI Transaction';
}

/**
 * Re-evaluates all transactions against the latest categorization rules
 * and auto-updates their Category & Merchant names based on extracted merchant names.
 */
export function applyRulesToTransactions(
  transactions: any[],
  rules: CategoryRule[] = loadUserRules()
): any[] {
  return transactions.map(t => {
    // 1. Recover merchant if it was previously corrupted into "Insurance" or empty
    let extractedMerchant = '';
    if (t.description && t.description.includes(' - ')) {
      const parts = t.description.split(' - ');
      if (parts.length > 1) {
        const candidate = parts[parts.length - 1].trim();
        if (!/^(?:school\s*\/?\s*education\s*fee|insurance|other|others|upi\s*transaction)$/i.test(candidate)) {
          extractedMerchant = candidate;
        }
      }
    }

    const rawMerchant = (t.merchant && !/^(?:school\s*\/?\s*education\s*fee|insurance|other|others|bpcl\s*fuel|primary\s*card)$/i.test(t.merchant.trim()))
      ? t.merchant.trim()
      : (extractedMerchant || '');

    // Extract merchant from email body / notes if missing or corrupted
    let merchantToTest = rawMerchant;
    if (!merchantToTest || /^(?:insurance|other|others|upi\s*transaction)$/i.test(merchantToTest)) {
      const source = `${t.email_body || ''} ${t.notes || ''} ${t.description || ''}`;
      // SBI & generic format: "spent on your ... at <Merchant> on/via" or "spent at <Merchant> on/via"
      const sbiMatch = source.match(/spent\s+(?:on\s+your\s+[^.]+?\s+)?at\s+([A-Za-z0-9\s._\-&]{2,50}?)(?:\s+on\s+\d{1,2}[-/.]|\s+on|\s+via|\s*\(Ref|\.|\n|\r|$)/i);
      if (sbiMatch) {
        const candidate = cleanMerchantName(sbiMatch[1]);
        if (candidate && candidate !== 'UPI Transaction') {
          merchantToTest = candidate;
        }
      }

      if (!merchantToTest || /^(?:insurance|other|others|upi\s*transaction)$/i.test(merchantToTest)) {
        const hdfcMatch = source.match(/towards\s+VPA\s+[^\s(]+\s*\(([^)]+)\)/i);
        if (hdfcMatch) {
          const candidate = cleanMerchantName(hdfcMatch[1]);
          if (candidate && candidate !== 'UPI Transaction') {
            merchantToTest = candidate;
          }
        }
      }

      if (!merchantToTest || /^(?:insurance|other|others|upi\s*transaction)$/i.test(merchantToTest)) {
        const iciciMatch = source.match(/Info:\s*([A-Za-z0-9\s._\-&]+?)(?:\.|\n|\r|$)/i);
        if (iciciMatch) {
          const candidate = cleanMerchantName(iciciMatch[1]);
          if (candidate && candidate !== 'UPI Transaction') {
            merchantToTest = candidate;
          }
        }
      }
    }

    if (!merchantToTest || /^(?:insurance|other|others)$/i.test(merchantToTest)) {
      merchantToTest = cleanMerchantName(t.description || '') || 'UPI Transaction';
    }

    // 2. If user explicitly changed category and marked user_overridden_category, preserve unless it was the corrupted 'Insurance'
    if (t.user_overridden_category && t.category && t.category !== 'Insurance') {
      return {
        ...t,
        merchant: merchantToTest,
        category: t.category
      };
    }

    // 3. Apply category rules to the extracted merchant name first (Requirement 3)
    let result = categorizeTransaction(merchantToTest, rules);

    // If merchant alone was not matched, also test the clean description title
    if (result.category === 'Others' || result.category === 'Other') {
      const cleanDescTitle = (t.description || '').split(' - ')[0] || '';
      const strippedDesc = stripCardBrandNoise(cleanDescTitle);
      if (strippedDesc && strippedDesc.length >= 3) {
        const descResult = categorizeTransaction(strippedDesc, rules);
        if (descResult.category !== 'Others' && descResult.category !== 'Other') {
          result = descResult;
        }
      }
    }

    // Final merchant: preserve extracted merchant name unless the rule specifically provides a branded merchant name
    let finalMerchant = merchantToTest;
    if (result.merchant && !/^(?:unknown\s*merchant|upi\s*transaction|others?|insurance)$/i.test(result.merchant)) {
      finalMerchant = result.merchant;
    }

    // Clean description to remove any trailing " - Insurance" artifact
    let cleanDescription = t.description || '';
    if (cleanDescription.endsWith(' - Insurance')) {
      cleanDescription = cleanDescription.replace(/\s*-\s*Insurance$/i, ` - ${finalMerchant}`);
    }

    return {
      ...t,
      description: cleanDescription,
      merchant: finalMerchant,
      category: result.category || 'Others'
    };
  });
}
