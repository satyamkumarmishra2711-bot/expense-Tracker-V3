import { Transaction } from '../types/expense';
import { generateTransactionId } from '../utils/idGenerator';
import { categorizeTransaction } from '../utils/categorizer';

export interface SampleStatementPreset {
  id: string;
  name: string;
  cardName: string;
  cardLast4: string;
  statementPeriod: string;
  statementMonth: string;
  fileName: string;
  items: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    reference_id?: string;
  }>;
}

export const SAMPLE_STATEMENTS: SampleStatementPreset[] = [
  {
    id: 'icici_satyam_sep2026',
    name: 'ICICI Credit Card - Satyam Mishra (Aug-Sep 2026)',
    cardName: 'ICICI Bank Credit Card',
    cardLast4: '4005',
    statementPeriod: '19 Aug 2026 - 18 Sep 2026',
    statementMonth: '2026-09',
    fileName: 'ICICI_Statement_Satyam_Mishra_Sep2026.pdf',
    items: [
      { date: '2026-08-19', description: 'UPI-312771007167-GULMOHAR RESIDENCY AP IN', amount: 2000.00, type: 'debit', reference_id: '14005745198' },
      { date: '2026-08-19', description: 'UPI-213564477567-COFFEE D AY GLOBAL LIM IN', amount: 185.00, type: 'debit', reference_id: '14005788319' },
      { date: '2026-08-19', description: 'UPI-612475022924-SIGMA ED GE TRADERS IN', amount: 30.00, type: 'debit', reference_id: '14006272825' },
      { date: '2026-08-20', description: 'UPI-312853491673-Arun Fru its Stall IN', amount: 100.00, type: 'debit', reference_id: '14011982769' },
      { date: '2026-08-20', description: 'UPI-312855217376-SIGMA ED GE TRADERS IN', amount: 30.00, type: 'debit', reference_id: '14012042191' },
      { date: '2026-08-20', description: 'UPI-312866708685-DITYA FO OD IN', amount: 80.00, type: 'debit', reference_id: '14013994271' },
      { date: '2026-08-20', description: 'UPI-312874620349-URBAN VA DA PAV SINGHP IN', amount: 213.00, type: 'debit', reference_id: '14014359702' },
      { date: '2026-08-21', description: 'UPI-659914510088-SWIGGY I NSTAMART IN', amount: 483.00, type: 'debit', reference_id: '14018725065' },
      { date: '2026-08-21', description: 'UPI-612595857999-Vikas Ma heshwari IN', amount: 75.00, type: 'debit', reference_id: '14019362512' },
      { date: '2026-08-21', description: 'UPI-312950980815-URBAN VA DA PAV SINGHP IN', amount: 387.00, type: 'debit', reference_id: '14020775642' },
      { date: '2026-08-21', description: 'UPI-312969354109-SWIGGY I NSTAMART IN', amount: 164.00, type: 'debit', reference_id: '14021365415' },
      { date: '2026-08-22', description: 'UPI-313027389346-Blinkit IN', amount: 400.00, type: 'debit', reference_id: '14025160725' },
      { date: '2026-08-22', description: 'UPI-213862911319-MAHARAJA PAN SHOP IN', amount: 240.00, type: 'debit', reference_id: '14025502495' },
      { date: '2026-08-22', description: 'HOTSTAR DI SI MUMBAI IN', amount: 299.00, type: 'debit', reference_id: '14033345419' },
      { date: '2026-08-24', description: 'UPI-213972553768-Bolte la ddu amrit mat IN', amount: 155.00, type: 'debit', reference_id: '14036711449' },
      { date: '2026-08-24', description: 'SwiggyInstamartPvtLtd', amount: 1105.00, type: 'debit', reference_id: '14047092743' },
      { date: '2026-08-25', description: 'UPI-313203276185-IIT KANP UR MAIN HALL IN', amount: 180.00, type: 'debit', reference_id: '14042278493' },
      { date: '2026-08-25', description: 'UPI-313245367415-SWIGGY I NSTAMART IN', amount: 394.00, type: 'debit', reference_id: '14045753294' },
      { date: '2026-08-25', description: 'SWIGGY PVT LTD GROCERY1', amount: 496.00, type: 'debit', reference_id: '14052084026' },
      { date: '2026-08-26', description: 'UPI-313259407088-GULMOHAR RESIDENCY AP IN', amount: 2000.00, type: 'debit', reference_id: '14047503600' },
      { date: '2026-08-26', description: 'UPI-313281959963-New Pink i Sweet House IN', amount: 50.00, type: 'debit', reference_id: '14048335599' },
      { date: '2026-08-26', description: 'AMAZONPAYINDIAPVTLTD', amount: 299.00, type: 'debit', reference_id: '14056542513' },
      { date: '2026-08-27', description: 'UPI-612961086853-IIT KANP UR GIRLS HALL IN', amount: 240.00, type: 'debit', reference_id: '14053098736' },
      { date: '2026-08-27', description: 'UPI-612976755184-Blinkit IN', amount: 1710.00, type: 'debit', reference_id: '14053800510' },
      { date: '2026-08-27', description: 'UPI-313386782205-New Pink i Sweet House IN', amount: 290.00, type: 'debit', reference_id: '14055418129' },
      { date: '2026-08-28', description: 'UPI-214260203671-Blinkit IN', amount: 421.00, type: 'debit', reference_id: '14056628585' },
      { date: '2026-08-28', description: 'UPI-613021343218-Vikas Ma heshwari IN', amount: 30.00, type: 'debit', reference_id: '14058867932' },
      { date: '2026-08-28', description: 'UPI-613021359932-Vikas Ma heshwari IN', amount: 30.00, type: 'debit', reference_id: '14058869659' },
      { date: '2026-08-28', description: 'UPI-214292390747-BLINKIT MONEY IN', amount: 200.00, type: 'debit', reference_id: '14059255479' },
      { date: '2026-08-28', description: 'BBPS Payment received', amount: 49684.69, type: 'credit', reference_id: '14059160697' },
      { date: '2026-08-28', description: 'SWIGGY', amount: 417.00, type: 'debit', reference_id: '14070909353' },
      { date: '2026-08-29', description: 'UPI-214346766646-Mr DEEP AK SINGH IN', amount: 130.00, type: 'debit', reference_id: '14064927554' },
      { date: '2026-08-29', description: 'UPI-313500131325-Dominosp izza IN', amount: 1073.10, type: 'debit', reference_id: '14067947939' },
      { date: '2026-08-29', description: 'UPI-214393579066-Cafe Cof fee Day IN', amount: 445.00, type: 'debit', reference_id: '14069229817' },
      { date: '2026-08-29', description: 'UPI-624174960144-Amazon B ill Pay IN', amount: 629.00, type: 'debit', reference_id: '14069327686' },
      { date: '2026-08-30', description: 'UPI-313532475135-Swiggy I nstamart IN', amount: 543.00, type: 'debit', reference_id: '14071043018' },
      { date: '2026-08-30', description: 'UPI-313590545069-FLIPKART PAYMENTS IN', amount: 657.00, type: 'debit', reference_id: '14075931502' },
      { date: '2026-08-30', description: 'SWIGGY PVT LTD GROCERY1', amount: 322.00, type: 'debit', reference_id: '14084364551' },
      { date: '2026-08-30', description: 'SwiggyInstamartPvtLtd', amount: 331.00, type: 'debit', reference_id: '14084407361' },
      { date: '2026-08-30', description: 'SWIGGY PVT LTD E COM1', amount: 1271.00, type: 'debit', reference_id: '14084448922' },
      { date: '2026-08-31', description: 'UPI-313611311232-Arun Fru its Stall IN', amount: 90.00, type: 'debit', reference_id: '14077970295' },
      { date: '2026-08-31', description: 'UPI-313621161387-VISITORS HOSTEL 1 IN', amount: 140.00, type: 'debit', reference_id: '14078415053' },
      { date: '2026-08-31', description: 'UPI-313624253050-VISITORS HOSTEL 1 IN', amount: 70.00, type: 'debit', reference_id: '14078531366' },
      { date: '2026-08-31', description: 'UPI-313643871163-SWIGGY IN', amount: 447.00, type: 'debit', reference_id: '14081325047' },
      { date: '2026-08-31', description: 'UPI-313652136870-SWIGGY IN', amount: 332.00, type: 'debit', reference_id: '14081793555' },
      { date: '2026-08-31', description: 'UPI-313657089716-Swiggy I nstamart IN', amount: 368.00, type: 'debit', reference_id: '14082146969' },
      { date: '2026-08-31', description: 'UPI-313664788722-SWIGGY I NSTAMART PRIV IN', amount: 211.00, type: 'debit', reference_id: '14082515275' },
      { date: '2026-08-31', description: 'Swiggy Instamart Reversal', amount: 199.00, type: 'credit', reference_id: '14100194789' },
      { date: '2026-08-31', description: 'Swiggy', amount: 239.00, type: 'debit', reference_id: '14088991857' },
      { date: '2026-08-31', description: 'SWIGGY', amount: 162.00, type: 'debit', reference_id: '14089031813' },
      { date: '2026-09-01', description: 'UPI-214589257169-IIT KANP UR MAIN HALL IN', amount: 212.00, type: 'debit', reference_id: '14083944915' },
      { date: '2026-09-01', description: 'UPI-313720921064-URBAN VA DA PAV SINGHP IN', amount: 252.00, type: 'debit', reference_id: '14087185485' },
      { date: '2026-09-01', description: 'SWIGGY', amount: 521.00, type: 'debit', reference_id: '14096032012' },
      { date: '2026-09-01', description: 'SWIGGYFOOD', amount: 339.00, type: 'debit', reference_id: '14101917922' },
      { date: '2026-09-02', description: 'UPI-313755211055-COFFEE D AY GLOBAL LIM IN', amount: 210.00, type: 'debit', reference_id: '14089843630' },
      { date: '2026-09-02', description: 'UPI-313763392639-IIT KANP UR GIRLS HALL IN', amount: 240.00, type: 'debit', reference_id: '14090206804' },
      { date: '2026-09-02', description: 'UPI-313803713445-FLIPKART PAYMENTS IN', amount: 339.00, type: 'debit', reference_id: '14093637641' },
      { date: '2026-09-02', description: 'SwiggyInstamartPvtLtd', amount: 173.00, type: 'debit', reference_id: '14101902444' },
      { date: '2026-09-03', description: 'UPI-214749315283-GULMOHAR RESIDENCY AP IN', amount: 2000.00, type: 'debit', reference_id: '14097290467' },
      { date: '2026-09-03', description: 'UPI-313860954045-GAURAV S AXENA IN', amount: 267.00, type: 'debit', reference_id: '14100060501' },
      { date: '2026-09-03', description: 'UPI-313877651005-Swiggy L td IN', amount: 332.00, type: 'debit', reference_id: '14100746742' },
      { date: '2026-09-03', description: 'SWIGGY', amount: 136.00, type: 'debit', reference_id: '14107740579' },
      { date: '2026-09-03', description: 'BLINKIT', amount: 325.00, type: 'debit', reference_id: '14107789758' },
      { date: '2026-09-04', description: 'UPI-613433972482-URBAN CO MPANY LIMITED IN', amount: 276.00, type: 'debit', reference_id: '14102692092' },
      { date: '2026-09-04', description: 'UPI-613467912076-Momo sta tion IN', amount: 180.00, type: 'debit', reference_id: '14106149771' },
      { date: '2026-09-04', description: 'FlipkartInternetPrivate', amount: 4538.00, type: 'debit', reference_id: '14114119620' },
      { date: '2026-09-04', description: 'URBAN COMPANY LIMITED REFUND', amount: 69.00, type: 'credit', reference_id: '14124747590' },
      { date: '2026-09-04', description: 'BLINK COMMERCE PVT LTD', amount: 377.00, type: 'debit', reference_id: '14114055885' },
      { date: '2026-09-04', description: 'SwiggyInstamartPvtLtd', amount: 341.00, type: 'debit', reference_id: '14114108791' },
      { date: '2026-09-04', description: 'SWIGGY', amount: 200.00, type: 'debit', reference_id: '14114120448' },
      { date: '2026-09-05', description: 'UPI-314006526998-SWIGGY I NSTAMART IN', amount: 910.00, type: 'debit', reference_id: '14111407356' },
      { date: '2026-09-06', description: 'UPI-613558757100-MOHIT SI NGH IN', amount: 60.00, type: 'debit', reference_id: '14114900773' },
      { date: '2026-09-06', description: 'UPI-314049397744-Kavita K umari IN', amount: 80.00, type: 'debit', reference_id: '14114907308' },
      { date: '2026-09-06', description: 'UPI-314062873955-SWIGGY IN', amount: 214.00, type: 'debit', reference_id: '14115389496' },
      { date: '2026-09-06', description: 'SWIGGY', amount: 201.00, type: 'debit', reference_id: '14126349537' },
      { date: '2026-09-07', description: 'UPI-215057403886-Airtel IN', amount: 647.82, type: 'debit', reference_id: '14120823030' },
      { date: '2026-09-07', description: 'UPI-314154962936-GAURAV S AXENA IN', amount: 297.00, type: 'debit', reference_id: '14124094746' },
      { date: '2026-09-08', description: 'Refund Amt Transfer to Bank Acc XX9000', amount: 69.00, type: 'debit', reference_id: '14130794208' },
      { date: '2026-09-08', description: 'UPI-314205190725-VISITORS HOSTEL 1 IN', amount: 225.00, type: 'debit', reference_id: '14127698605' },
      { date: '2026-09-08', description: 'UPI-215158503832-Roop Sag ar Foodworks IN', amount: 60.00, type: 'debit', reference_id: '14127754962' },
      { date: '2026-09-08', description: 'UPI-314228665807-DITYA FO OD IN', amount: 100.00, type: 'debit', reference_id: '14130468134' },
      { date: '2026-09-08', description: 'Interest Amount Amortization - <9/12>AMAZON', amount: 41.58, type: 'debit', reference_id: '14131808880' },
      { date: '2026-09-08', description: 'IGST-CI@18%', amount: 7.48, type: 'debit', reference_id: '14131808890' },
      { date: '2026-09-08', description: 'Principal Amount Amortization - <9/12>AMAZON', amount: 764.67, type: 'debit', reference_id: '14131808913' },
      { date: '2026-09-09', description: 'UPI-314278867120-SIGMA ED GE TRADERS IN', amount: 60.00, type: 'debit', reference_id: '14133631473' },
      { date: '2026-09-09', description: 'UPI-314306112369-URBAN VA DA PAV SINGHP IN', amount: 263.00, type: 'debit', reference_id: '14136300991' },
      { date: '2026-09-09', description: 'SwiggyInstamartPvtLtd', amount: 1023.00, type: 'debit', reference_id: '14143272896' },
      { date: '2026-09-10', description: 'UPI-613840268114-BLINKIT IN', amount: 711.00, type: 'debit', reference_id: '14141545431' },
      { date: '2026-09-10', description: 'AmazonSellerServices', amount: 1015.38, type: 'debit', reference_id: '14149598811' },
      { date: '2026-09-11', description: 'Reward redemption handling fee', amount: 99.00, type: 'debit', reference_id: '14144639261' },
      { date: '2026-09-11', description: 'IGST-CI@18%', amount: 17.82, type: 'debit', reference_id: '14144639266' },
      { date: '2026-09-11', description: 'UPI-314416461372-GULMOHAR RESIDENCY AP IN', amount: 2000.00, type: 'debit', reference_id: '14143786684' },
      { date: '2026-09-11', description: 'UPI-314430801131-SIGMA ED GE TRADERS IN', amount: 54.00, type: 'debit', reference_id: '14144201858' },
      { date: '2026-09-11', description: 'UPI-215424725193-DITYA FO OD IN', amount: 80.00, type: 'debit', reference_id: '14146461201' },
      { date: '2026-09-11', description: 'UPI-625491848029-Amazon B ill Pay IN', amount: 899.00, type: 'debit', reference_id: '14148151240' },
      { date: '2026-09-11', description: 'BLINK COMMERCE PVT LTD', amount: 1347.00, type: 'debit', reference_id: '14156828247' },
      { date: '2026-09-12', description: 'UPI-314482798637-Express food plaza IN', amount: 70.00, type: 'debit', reference_id: '14149664495' },
      { date: '2026-09-12', description: 'UPI-314555378503-UBER IND IA SYSTEMS PR IN', amount: 314.82, type: 'debit', reference_id: '14154253851' },
      { date: '2026-09-13', description: 'UPI-625693324936-Amazon I ndia IN', amount: 298.00, type: 'debit', reference_id: '14156956951' },
      { date: '2026-09-13', description: 'UPI-662212494853-Bookmysh ow IN', amount: 627.88, type: 'debit', reference_id: '14157321098' },
      { date: '2026-09-13', description: 'UPI-614010512001-Rave Cin ema 2 IN', amount: 890.00, type: 'debit', reference_id: '14157831351' },
      { date: '2026-09-13', description: 'UPI-614017345553-Parking 1 IN', amount: 30.00, type: 'debit', reference_id: '14158091583' },
      { date: '2026-09-13', description: 'UPI-314626218142-MAHARAJA PAN SHOP IN', amount: 630.00, type: 'debit', reference_id: '14161033538' },
      { date: '2026-09-13', description: 'SWIGGY PVT LTD E COM1', amount: 627.00, type: 'debit', reference_id: '14168360864' },
      { date: '2026-09-14', description: 'UPI-314693414078-Swiggy L td IN', amount: 560.00, type: 'debit', reference_id: '14166416511' },
      { date: '2026-09-14', description: 'UPI-625795624622-Amazon B ill Pay IN', amount: 899.00, type: 'debit', reference_id: '14167257789' },
      { date: '2026-09-14', description: 'SWIGGY', amount: 276.00, type: 'debit', reference_id: '14175799856' },
      { date: '2026-09-15', description: 'UPI-625895783937-Amazon I ndia IN', amount: 445.02, type: 'debit', reference_id: '14168537849' },
      { date: '2026-09-15', description: 'UPI-314726254294-SIGMA ED GE TRADERS IN', amount: 30.00, type: 'debit', reference_id: '14169593687' },
      { date: '2026-09-15', description: 'UPI-314757503820-DITYA FO OD IN', amount: 20.00, type: 'debit', reference_id: '14173093785' },
      { date: '2026-09-16', description: 'UPI-314801490877-GULMOHAR RESIDENCY AP IN', amount: 2000.00, type: 'debit', reference_id: '14176357630' },
      { date: '2026-09-16', description: 'UPI-314816791746-IIT KANP UR MAIN HALL IN', amount: 120.00, type: 'debit', reference_id: '14176817740' },
      { date: '2026-09-16', description: 'UPI-215837533592-Momo sta tion IN', amount: 170.00, type: 'debit', reference_id: '14179446740' },
      { date: '2026-09-16', description: 'SwiggyInstamartPvtLtd', amount: 1515.00, type: 'debit', reference_id: '14187582637' },
      { date: '2026-09-17', description: 'Annual Fee reversal for 3rd yr', amount: 500.00, type: 'credit', reference_id: '14188265996' },
      { date: '2026-09-17', description: 'UPI-314876856456-Cafe Cof fee Day IN', amount: 200.00, type: 'debit', reference_id: '14182498151' },
      { date: '2026-09-17', description: 'UPI-314879160873-Zoho Cor poration Priv IN', amount: 1370.57, type: 'debit', reference_id: '14182609075' },
      { date: '2026-09-17', description: 'UPI-215896714393-SIGMA ED GE TRADERS IN', amount: 30.00, type: 'debit', reference_id: '14183078484' },
      { date: '2026-09-17', description: 'UPI-314921661366-SAI CHEM IST IN', amount: 200.00, type: 'debit', reference_id: '14185641147' },
      { date: '2026-09-17', description: 'UPI-314928136598-Blinkit IN', amount: 220.00, type: 'debit', reference_id: '14185855000' },
      { date: '2026-09-18', description: 'IGST-Rev-BI@18%', amount: 90.00, type: 'credit', reference_id: '14188265998' },
      { date: '2026-09-18', description: 'UPI-614325138294-Arun Fru its Stall IN', amount: 260.00, type: 'debit', reference_id: '14188412799' },
      { date: '2026-09-18', description: 'UPI-215972610463-SIGMA ED GE TRADERS IN', amount: 30.00, type: 'debit', reference_id: '14188418931' },
      { date: '2026-09-18', description: 'UPI-215990401668-SARANSH KATIYAR IN', amount: 180.00, type: 'debit', reference_id: '14190696058' },
      { date: '2026-09-18', description: 'UPI-314989244528-URBAN VA DA PAV SINGHP IN', amount: 227.00, type: 'debit', reference_id: '14190851549' },
      { date: '2026-09-18', description: 'Annual Fee', amount: 500.00, type: 'debit', reference_id: '14192474863' },
      { date: '2026-09-18', description: 'IGST-CI@18%', amount: 90.00, type: 'debit', reference_id: '14192474866' }
    ]
  },
  {
    id: 'icici_oct_2026',
    name: 'ICICI Sapphiro - October 2026',
    cardName: 'ICICI Sapphiro',
    cardLast4: '9812',
    statementPeriod: '01 Oct 2026 - 31 Oct 2026',
    statementMonth: '2026-10',
    fileName: 'ICICI_Sapphiro_Oct2026.pdf',
    items: [
      { date: '2026-10-04', description: 'BOOKMYSHOW BIGTREE ENTERTAINMENT MUMBAI', amount: 940.00, type: 'debit', reference_id: 'REF7391028' },
      { date: '2026-10-08', description: 'SWIGGY RESTAURANT FOOD DELIVERY BLR', amount: 1120.00, type: 'debit', reference_id: 'REF4810293' },
      { date: '2026-10-11', description: 'APPLE SERVICES ITUNES STORE CUPERTINO', amount: 199.00, type: 'debit', reference_id: 'REF9501824' },
      { date: '2026-10-15', description: 'CULT FIT HEALTHCARE BANGALORE', amount: 2999.00, type: 'debit', reference_id: 'REF3819204' },
      { date: '2026-10-19', description: 'SHELL PETROL STATION WHITEFIELD BLR', amount: 2000.00, type: 'debit', reference_id: 'REF6819201' },
      { date: '2026-10-22', description: 'MYNTRA DESIGNS PVT LTD BANGALORE', amount: 3450.00, type: 'debit', reference_id: 'REF2910482' },
      { date: '2026-10-25', description: 'AMAZON REFUND RETURNED ITEM MUMBAI', amount: 1299.00, type: 'credit', reference_id: 'REF8491022' },
      { date: '2026-10-29', description: 'SPOTIFY AB STOCKHOLM SE SUBSCRIPTION', amount: 179.00, type: 'debit', reference_id: 'REF6391028' }
    ]
  },
  {
    id: 'axis_sep_2026',
    name: 'Axis Bank Magnus - September 2026',
    cardName: 'Axis Bank Magnus',
    cardLast4: '1104',
    statementPeriod: '01 Sep 2026 - 30 Sep 2026',
    statementMonth: '2026-09',
    fileName: 'Axis_Magnus_Sep2026_Statement.pdf',
    items: [
      { date: '2026-09-03', description: 'POS 382910 ZOMATO GOLD GURGAON', amount: 620.00, type: 'debit', reference_id: 'REF5819203' },
      { date: '2026-09-06', description: 'CROMA INFINITI RETAIL MUMBAI', amount: 12499.00, type: 'debit', reference_id: 'REF9401824' },
      { date: '2026-09-10', description: 'INDIGO AIRLINES INTERGLOBE GURGAON', amount: 8900.00, type: 'debit', reference_id: 'REF4719201' },
      { date: '2026-09-14', description: 'BLINKIT QUICK COMMERCE NOIDA', amount: 890.00, type: 'debit', reference_id: 'REF3819402' },
      { date: '2026-09-18', description: 'UBER RIDES INDIA PVT LTD BANGALORE', amount: 350.00, type: 'debit', reference_id: 'REF9401820' },
      { date: '2026-09-22', description: 'TATA POWER ELECTRICITY BILL MUMBAI', amount: 2450.00, type: 'debit', reference_id: 'REF2819401' },
      { date: '2026-09-28', description: 'AXIS EDGE REWARD CASH CREDIT', amount: 2000.00, type: 'credit', reference_id: 'REF8492011' }
    ]
  }
];

export function buildTransactionsFromPreset(preset: SampleStatementPreset): Transaction[] {
  const cardIdentifier = `${preset.cardName} - ${preset.cardLast4}`;
  const now = new Date().toISOString();

  return preset.items.map((item, idx) => {
    const { category, merchant } = categorizeTransaction(item.description);
    const txId = generateTransactionId({
      card: cardIdentifier,
      date: item.date,
      amount: item.amount,
      type: item.type,
      description: item.description,
      reference_id: item.reference_id || `sample_${idx}`
    });

    return {
      transaction_id: txId,
      date: item.date,
      description: item.description,
      merchant,
      amount: item.amount,
      type: item.type,
      category,
      card: cardIdentifier,
      statement_id: `STMT_${preset.cardName.replace(/[^a-zA-Z0-9]/g, '')}_${preset.statementMonth.replace('-', '')}`,
      statement_month: preset.statementMonth,
      source_file: preset.fileName,
      reference_id: item.reference_id || '',
      created_date: now,
      updated_date: now
    };
  });
}
