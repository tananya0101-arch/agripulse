import type {
  MarketPrice,
  MarketInsight,
  BusinessRecommendation,
  ApprovedSource,
  LocalSignal,
  PriceHistory,
} from '@/types/market'

const TODAY = '2026-05-01'

// ── Helper to generate 7-day price history ─────────────────────────────────
function makeHistory(basePrice: number, volatility: number, days = 7): PriceHistory[] {
  const history: PriceHistory[] = []
  const base = new Date('2026-04-25')
  let price = basePrice * (1 - volatility * 0.5)
  for (let i = 0; i < days; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    price = price + (Math.random() - 0.48) * basePrice * volatility
    price = Math.max(price, basePrice * 0.85)
    history.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    })
  }
  // Last entry = today's price
  history[history.length - 1] = { date: TODAY, price: basePrice }
  return history
}

// ── Rubber prices ──────────────────────────────────────────────────────────
export function getRubberPrices(): MarketPrice[] {
  return [
    {
      id: 'rubber-fresh-latex',
      commodity: 'rubber',
      commodityTh: 'ยางพารา',
      productType: 'fresh_latex',
      productTypeTh: 'น้ำยางสด DRC 60%',
      price: 58.50,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคารับซื้อ',
      marketLocation: 'ภาคใต้',
      sourceName: 'การยางแห่งประเทศไทย (กยท.)',
      sourceType: 'official',
      sourceUrl: 'https://www.raot.co.th',
      reportedAt: TODAY,
      previousPrice: 57.20,
      changeValue: 1.30,
      changePercent: 2.27,
      trend: 'up',
      confidence: 'high',
      notes: 'ราคาเฉลี่ยระดับประเทศ ณ วันที่รายงาน',
    },
    {
      id: 'rubber-cup-lump',
      commodity: 'rubber',
      commodityTh: 'ยางพารา',
      productType: 'cup_lump',
      productTypeTh: 'ยางก้อนถ้วย',
      price: 41.00,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคารับซื้อ',
      marketLocation: 'ภาคใต้',
      sourceName: 'การยางแห่งประเทศไทย (กยท.)',
      sourceType: 'official',
      sourceUrl: 'https://www.raot.co.th',
      reportedAt: TODAY,
      previousPrice: 41.50,
      changeValue: -0.50,
      changePercent: -1.20,
      trend: 'down',
      confidence: 'high',
    },
    {
      id: 'rubber-rss3',
      commodity: 'rubber',
      commodityTh: 'ยางพารา',
      productType: 'rss3',
      productTypeTh: 'ยางแผ่นดิบ RSS3',
      price: 65.20,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคาตลาด',
      marketLocation: 'หาดใหญ่',
      sourceName: 'ตลาดยางหาดใหญ่',
      sourceType: 'industry',
      reportedAt: TODAY,
      previousPrice: 64.80,
      changeValue: 0.40,
      changePercent: 0.62,
      trend: 'up',
      confidence: 'medium',
      notes: 'ราคาจากตลาดกลางหาดใหญ่ อาจมีความแตกต่างตามคุณภาพ',
    },
  ]
}

// ── Palm prices ────────────────────────────────────────────────────────────
export function getPalmPrices(): MarketPrice[] {
  return [
    {
      id: 'palm-ffb',
      commodity: 'palm',
      commodityTh: 'ปาล์มน้ำมัน',
      productType: 'ffb',
      productTypeTh: 'ผลปาล์มสด (FFB)',
      price: 6.80,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคารับซื้อ',
      marketLocation: 'ภาคใต้',
      sourceName: 'กรมการค้าภายใน',
      sourceType: 'official',
      sourceUrl: 'https://www.dit.go.th',
      reportedAt: TODAY,
      previousPrice: 6.50,
      changeValue: 0.30,
      changePercent: 4.62,
      trend: 'up',
      confidence: 'high',
    },
    {
      id: 'palm-cpo-thai',
      commodity: 'palm',
      commodityTh: 'ปาล์มน้ำมัน',
      productType: 'cpo_thai',
      productTypeTh: 'CPO ไทย',
      price: 31.50,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคาตลาด',
      marketLocation: 'กรุงเทพฯ',
      sourceName: 'กรมการค้าภายใน',
      sourceType: 'official',
      sourceUrl: 'https://www.dit.go.th',
      reportedAt: TODAY,
      previousPrice: 30.80,
      changeValue: 0.70,
      changePercent: 2.27,
      trend: 'up',
      confidence: 'high',
    },
    {
      id: 'palm-cpo-malaysia',
      commodity: 'palm',
      commodityTh: 'ปาล์มน้ำมัน',
      productType: 'cpo_malaysia',
      productTypeTh: 'CPO มาเลเซีย (FCPO)',
      price: 3850,
      currency: 'MYR',
      unit: 'tonne',
      priceType: 'ราคา Futures',
      marketLocation: 'Bursa Malaysia',
      sourceName: 'Bursa Malaysia Derivatives',
      sourceType: 'industry',
      sourceUrl: 'https://www.bursamalaysia.com',
      reportedAt: TODAY,
      previousPrice: 3720,
      changeValue: 130,
      changePercent: 3.49,
      trend: 'up',
      confidence: 'high',
      notes: 'ราคา FCPO Contract 3 เดือนข้างหน้า ใช้เป็น benchmark โลก',
    },
  ]
}

// ── Durian prices ──────────────────────────────────────────────────────────
export function getDurianPrices(): MarketPrice[] {
  return [
    {
      id: 'durian-monthong-chanthaburi',
      commodity: 'durian',
      commodityTh: 'ทุเรียน',
      productType: 'monthong_chanthaburi',
      productTypeTh: 'หมอนทองจันทบุรี',
      price: 105,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคาสวน',
      marketLocation: 'จันทบุรี',
      sourceName: 'สำนักงานเกษตรจังหวัด',
      sourceType: 'local_signal',
      reportedAt: TODAY,
      previousPrice: 120,
      changeValue: -15,
      changePercent: -12.50,
      trend: 'down',
      confidence: 'medium',
      notes: 'ราคาปากสวน อาจแตกต่างตามเกรดและล้ง ยังไม่ใช่ราคากลางทางการ',
    },
    {
      id: 'durian-monthong-yala',
      commodity: 'durian',
      commodityTh: 'ทุเรียน',
      productType: 'monthong_yala',
      productTypeTh: 'หมอนทองยะลา',
      price: 140,
      currency: 'THB',
      unit: 'กก',
      priceType: 'ราคาสวน',
      marketLocation: 'ยะลา',
      sourceName: 'รายงานภาคสนาม',
      sourceType: 'local_signal',
      reportedAt: TODAY,
      previousPrice: 135,
      changeValue: 5,
      changePercent: 3.70,
      trend: 'up',
      confidence: 'low',
      notes: 'ข้อมูลจากภาคสนาม ยังไม่ผ่านการตรวจสอบ ใช้เป็นสัญญาณเบื้องต้นเท่านั้น',
    },
  ]
}

// ── Fertilizer prices ──────────────────────────────────────────────────────
export function getFertilizerPrices(): MarketPrice[] {
  return [
    {
      id: 'fert-urea-me',
      commodity: 'fertilizer',
      commodityTh: 'ปุ๋ยเคมี',
      productType: 'urea_fob_me',
      productTypeTh: 'ยูเรีย FOB Middle East',
      price: 298,
      currency: 'USD',
      unit: 'tonne',
      priceType: 'FOB',
      marketLocation: 'Middle East',
      sourceName: 'Argus Media',
      sourceType: 'industry',
      sourceUrl: 'https://www.argusmedia.com',
      reportedAt: TODAY,
      previousPrice: 285,
      changeValue: 13,
      changePercent: 4.56,
      trend: 'up',
      confidence: 'high',
      notes: 'ราคา FOB ยังไม่รวมค่าขนส่งและภาษีนำเข้า ราคาไทยจะสูงกว่าประมาณ 30-50 USD/tonne',
    },
    {
      id: 'fert-dap-usgulf',
      commodity: 'fertilizer',
      commodityTh: 'ปุ๋ยเคมี',
      productType: 'dap_fob_usgulf',
      productTypeTh: 'DAP FOB US Gulf',
      price: 548,
      currency: 'USD',
      unit: 'tonne',
      priceType: 'FOB',
      marketLocation: 'US Gulf',
      sourceName: 'CRU Group',
      sourceType: 'industry',
      sourceUrl: 'https://www.crugroup.com',
      reportedAt: TODAY,
      previousPrice: 555,
      changeValue: -7,
      changePercent: -1.26,
      trend: 'down',
      confidence: 'high',
      notes: 'ราคา DAP อ้างอิงตลาดโลก ราคานำเข้าไทยขึ้นอยู่กับ exchange rate และ logistics',
    },
    {
      id: 'fert-mop-vancouver',
      commodity: 'fertilizer',
      commodityTh: 'ปุ๋ยเคมี',
      productType: 'mop_fob_vancouver',
      productTypeTh: 'MOP FOB Vancouver',
      price: 295,
      currency: 'USD',
      unit: 'tonne',
      priceType: 'FOB',
      marketLocation: 'Vancouver',
      sourceName: 'Fertilizer Week',
      sourceType: 'industry',
      reportedAt: TODAY,
      previousPrice: 290,
      changeValue: 5,
      changePercent: 1.72,
      trend: 'up',
      confidence: 'medium',
      notes: 'MOP (โพแทสเซียมคลอไรด์) ราคาปรับขึ้นเล็กน้อยจากความต้องการในเอเชีย',
    },
  ]
}

// ── All prices ─────────────────────────────────────────────────────────────
export function getAllPrices(): MarketPrice[] {
  return [
    ...getRubberPrices(),
    ...getPalmPrices(),
    ...getDurianPrices(),
    ...getFertilizerPrices(),
  ]
}

// ── Price history per product ──────────────────────────────────────────────
const HISTORY_MAP: Record<string, PriceHistory[]> = {
  'rubber-fresh-latex': makeHistory(58.50, 0.015),
  'rubber-cup-lump': makeHistory(41.00, 0.012),
  'rubber-rss3': makeHistory(65.20, 0.013),
  'palm-ffb': makeHistory(6.80, 0.02),
  'palm-cpo-thai': makeHistory(31.50, 0.018),
  'palm-cpo-malaysia': makeHistory(3850, 0.016),
  'durian-monthong-chanthaburi': makeHistory(105, 0.04),
  'durian-monthong-yala': makeHistory(140, 0.035),
  'fert-urea-me': makeHistory(298, 0.022),
  'fert-dap-usgulf': makeHistory(548, 0.018),
  'fert-mop-vancouver': makeHistory(295, 0.015),
}

export function getPriceHistory(priceId: string): PriceHistory[] {
  return HISTORY_MAP[priceId] ?? []
}

// ── Business recommendations ───────────────────────────────────────────────
const RECOMMENDATIONS: Record<string, BusinessRecommendation> = {
  rubber: {
    signal: 'ราคายางขยับขึ้น + ฝนกลับมาบางพื้นที่',
    cropContext: 'ยางพาราภาคใต้เริ่มกรีดได้สม่ำเสมอมากขึ้น หลังฝนเริ่มกลับมา',
    suggestedAction: 'เตรียมสต็อกปุ๋ยยางรับฤดูกรีด อย่ารอให้หมด',
    productCategory: 'ปุ๋ย NPK สูตรยาง, แมกนีเซียม, สารปรับปรุงดิน',
    contentIdea: 'น้ำยางเริ่มขยับ — ชาวสวนควรวางแผนบำรุงต้นอย่างไรก่อนฝนมาจริง',
    riskWarning: 'อย่ารับประกันว่าราคาจะขึ้นต่อ ตลาดยังมีความผันผวน',
    farmerCashFlowSignal: 'improving',
    fertilizerDemandSignal: 'increasing',
  },
  palm: {
    signal: 'CPO โลกขึ้น + FFB ไทยตาม',
    cropContext: 'ราคา CPO มาเลเซียปรับสูงขึ้น ส่งผลบวกต่อราคา FFB ในประเทศ',
    suggestedAction: 'แนะนำเกษตรกรใส่ปุ๋ยบำรุงช่วงติดผล เพื่อให้ได้ FFB คุณภาพดีในรอบหน้า',
    productCategory: 'ปุ๋ย 13-13-21, โพแทสเซียม, โบรอน, ปุ๋ยคีเลต',
    contentIdea: 'ปาล์มราคาดี — บำรุงถูกช่วง ผลผลิตรอบหน้าโดนใจล้ง',
    riskWarning: 'ราคาน้ำมันดิบมีผลต่อ CPO โดยตรง ควรติดตามอย่างต่อเนื่อง',
    farmerCashFlowSignal: 'improving',
    fertilizerDemandSignal: 'increasing',
  },
  durian: {
    signal: 'ทุเรียนจันทบุรีราคาลด + ยะลาราคาดีกว่า',
    cropContext: 'ภาคตะวันออกเข้าช่วงพีค ผลผลิตออกมาก ราคากดดัน ภาคใต้ยังรอ',
    suggestedAction: 'เน้นขายปุ๋ยระยะขยายผลและ Ca-B ให้สวนทุเรียนใต้ที่ยังติดผลอยู่',
    productCategory: 'Ca-B, โพแทสเซียมซัลเฟต, ปุ๋ยน้ำทางใบ, สารป้องกันเชื้อรา',
    contentIdea: 'ทุเรียนใต้ยังดี — ช่วงนี้ใส่อะไรให้ได้ลูกใหญ่และรอดโรค',
    riskWarning: 'ราคาขึ้นอยู่กับการส่งออกจีนเป็นหลัก ความต้องการอาจผันผวน',
    farmerCashFlowSignal: 'stable',
    fertilizerDemandSignal: 'stable',
  },
  fertilizer: {
    signal: 'ยูเรียโลกขึ้น + DAP ลงเล็กน้อย',
    cropContext: 'ราคาปุ๋ยโลกส่งสัญญาณผสม ยูเรียขึ้นจากอินเดียประมูล DAP ลงจากสต็อกสหรัฐ',
    suggestedAction: 'พิจารณาล็อคราคายูเรียล่วงหน้าก่อนราคาปรับขึ้นอีก ส่วน DAP รอดูสักสัปดาห์',
    productCategory: 'ยูเรีย 46-0-0, DAP 18-46-0, MOP 0-0-60',
    contentIdea: 'ราคาปุ๋ยโลกขยับ — ร้านปุ๋ยควรวางแผนสต็อกอย่างไรในช่วงนี้',
    riskWarning: 'ค่าเงินบาทและค่าขนส่งมีผลต่อราคานำเข้าอย่างมาก ต้องคำนวณต้นทุนจริงก่อนตัดสินใจ',
    farmerCashFlowSignal: 'stable',
    fertilizerDemandSignal: 'increasing',
  },
}

export function getBusinessRecommendations(commodity: string): BusinessRecommendation[] {
  const rec = RECOMMENDATIONS[commodity] ?? RECOMMENDATIONS['fertilizer']
  return [rec]
}

// ── Market insights ────────────────────────────────────────────────────────
const INSIGHTS: Record<string, MarketInsight> = {
  rubber: {
    id: 'insight-rubber-2026-05-01',
    commodity: 'rubber',
    title: 'ยางพาราปรับขึ้น — ปัจจัยจีนและฝนเหนือตลาด',
    confirmedFacts: [
      'ราคาน้ำยางสดปรับตัวขึ้น 1.30 บาท/กก จากสัปดาห์ก่อน',
      'ปริมาณฝนเริ่มกลับมาในบางพื้นที่ภาคใต้',
    ],
    possibleDrivers: [
      'ความต้องการยางจากจีนในอุตสาหกรรมยานยนต์',
      'ค่าเงินบาทอ่อนตัวเล็กน้อย',
      'สต็อกยางโลกยังอยู่ในระดับต่ำ',
    ],
    farmerImpact:
      'รายได้เกษตรกรมีแนวโน้มดีขึ้น แต่ควรรอดูว่าฝนจะให้กรีดได้สม่ำเสมอหรือไม่',
    fertilizerShopImpact:
      'กำลังซื้อปุ๋ยของชาวสวนยางน่าจะปรับตัวขึ้น เป็นโอกาสในการนำเสนอโปรแกรมบำรุงต้น',
    contentIdea:
      'โพสต์: เมื่อยางขึ้น อย่าลืมบำรุงต้น — แผนใส่ปุ๋ยก่อนฝนจริง',
    uncertainty:
      'ยังไม่แน่ใจว่าการขึ้นของราคาจะต่อเนื่องหรือไม่ ขึ้นอยู่กับความต้องการจีนและปริมาณฝนจริง',
    sources: ['กยท.', 'ตลาดยางหาดใหญ่', 'Bloomberg Commodity'],
    generatedAt: TODAY,
  },
  palm: {
    id: 'insight-palm-2026-05-01',
    commodity: 'palm',
    title: 'ปาล์มน้ำมันขึ้นตาม CPO มาเลเซีย — โอกาสช่วงสั้น',
    confirmedFacts: [
      'FCPO มาเลเซียปรับขึ้น 130 MYR/tonne จากสัปดาห์ก่อน',
      'ราคา FFB ไทยขึ้นตาม 0.30 บาท/กก',
      'สต็อก CPO มาเลเซียลดลงจากความต้องการส่งออก',
    ],
    possibleDrivers: [
      'ราคาน้ำมันดิบโลกปรับตัวขึ้นเล็กน้อย',
      'นโยบาย B20 ไบโอดีเซลไทยหนุนความต้องการ CPO',
      'ผลผลิตปาล์มมาเลเซียยังต่ำกว่าปกติ',
      'ความต้องการจากอินเดียและจีนยังแข็งแกร่ง',
    ],
    farmerImpact:
      'เกษตรกรได้รับราคาดีขึ้น เป็นโอกาสเพิ่มการลงทุนบำรุงสวนเพื่อรอบการผลิตถัดไป',
    fertilizerShopImpact:
      'สัญญาณบวกต่อความต้องการปุ๋ยปาล์ม โดยเฉพาะปุ๋ยโพแทสเซียมและโบรอนที่ช่วยเพิ่มน้ำมัน',
    contentIdea:
      'โพสต์: ปาล์มราคาดีขึ้น — ถึงเวลาลงทุนบำรุงสวนให้ถูกสูตร',
    uncertainty:
      'ราคา CPO อ่อนไหวต่อราคาน้ำมันดิบและนโยบายไบโอดีเซลของแต่ละประเทศ ซึ่งเปลี่ยนแปลงได้เร็ว',
    sources: ['กรมการค้าภายใน', 'Bursa Malaysia', 'Palm Oil Analytics'],
    generatedAt: TODAY,
  },
  durian: {
    id: 'insight-durian-2026-05-01',
    commodity: 'durian',
    title: 'ทุเรียนจันทบุรีกดดัน ยะลายังดี — แยกภูมิภาค',
    confirmedFacts: [
      'ทุเรียนจันทบุรีราคาลด 15 บาท/กก เพราะผลผลิตออกพร้อมกันมาก',
      'ภาคตะวันออกเข้าช่วงพีคเต็มรูปแบบ เม.ย.-มิ.ย.',
      'ยะลา-ปัตตานีราคายังดีกว่า เพราะผลผลิตยังไม่ถึงพีค',
    ],
    possibleDrivers: [
      'จีนยังคงนำเข้าทุเรียนไทยอย่างต่อเนื่อง',
      'ทุเรียนแช่แข็งส่งออกได้ตลอดปี ลดแรงกดดันราคา',
      'คู่แข่งจากเวียดนามยังไม่มากนัก',
    ],
    farmerImpact:
      'เกษตรกรภาคตะวันออกต้องยอมรับราคาที่ลดลง แต่ภาคใต้ยังมีโอกาส ควรรีบเก็บเกี่ยวและหาล้งล่วงหน้า',
    fertilizerShopImpact:
      'ช่วงนี้เหมาะนำเสนอปุ๋ยระยะหลังเก็บเกี่ยว (บำรุงต้น) สำหรับสวนภาคตะวันออก และปุ๋ยระยะติดผลสำหรับภาคใต้',
    contentIdea:
      'โพสต์: ทุเรียนปีนี้ราคาต่างกันมากระหว่างภาค — เกษตรกรภาคใต้อย่าเพิ่งวาง',
    uncertainty:
      'ปริมาณการนำเข้าของจีนในแต่ละช่วงยังไม่แน่นอน และอาจมีการตรวจเข้มจากด่านจีน',
    sources: ['สำนักงานเกษตรจังหวัด', 'รายงานภาคสนาม', 'กรมส่งเสริมการเกษตร'],
    generatedAt: TODAY,
  },
  fertilizer: {
    id: 'insight-fert-2026-05-01',
    commodity: 'fertilizer',
    title: 'ยูเรียขึ้น 4.5% — อินเดียประมูลใหญ่ กดดันตลาดโลก',
    confirmedFacts: [
      'ยูเรีย FOB Middle East ปรับขึ้น 13 USD/tonne ในสัปดาห์ที่ผ่านมา',
      'อินเดียประกาศประมูลนำเข้ายูเรียล็อตใหม่ 1.5 ล้านตัน',
      'DAP ปรับลงเล็กน้อย 7 USD/tonne จากสต็อกที่สูงในสหรัฐ',
    ],
    possibleDrivers: [
      'อินเดียเป็น swing buyer ที่ใหญ่ที่สุดในตลาดยูเรีย',
      'จีนยังคงจำกัดการส่งออกปุ๋ยในช่วงนี้',
      'ก๊าซธรรมชาติราคาปรับขึ้น ต้นทุนผลิตยูเรียสูงขึ้น',
    ],
    farmerImpact:
      'ราคาปุ๋ยในประเทศอาจปรับขึ้นตามในช่วง 1-2 เดือนข้างหน้า เกษตรกรควรซื้อก่อนหากมีแผนใส่',
    fertilizerShopImpact:
      'โอกาสสต็อกปุ๋ยยูเรียก่อนราคาขึ้น แต่ต้องระวังเรื่อง cash flow และที่เก็บ',
    contentIdea:
      'โพสต์: ยูเรียโลกขึ้นแล้ว — ร้านปุ๋ยและเกษตรกรต้องเตรียมตัวอย่างไร',
    uncertainty:
      'ค่าเงินบาทและค่าระวางเรือมีผลต่อราคานำเข้าไทยอย่างมาก ราคาโลกอาจไม่แปลงตรงเป็นราคาในประเทศ',
    sources: ['Argus Media', 'CRU Group', 'Fertilizer Week', 'กรมการค้าต่างประเทศ'],
    generatedAt: TODAY,
  },
}

export function getMarketInsight(commodity: string): MarketInsight {
  return INSIGHTS[commodity] ?? INSIGHTS['fertilizer']
}

// ── Approved sources ───────────────────────────────────────────────────────
export function getApprovedSources(): ApprovedSource[] {
  return [
    {
      id: 'src-raot',
      sourceName: 'การยางแห่งประเทศไทย (กยท.)',
      cropOrProduct: 'ยางพารา',
      sourceUrl: 'https://www.raot.co.th',
      dataType: 'ราคารับซื้อยาง',
      updateFrequency: 'รายวัน',
      trustLevel: 'high',
      sourceType: 'official',
      licenseNote: 'ข้อมูลสาธารณะจากหน่วยงานรัฐ',
      isActive: true,
    },
    {
      id: 'src-dit',
      sourceName: 'กรมการค้าภายใน (พณ.)',
      cropOrProduct: 'ปาล์มน้ำมัน, สินค้าควบคุม',
      sourceUrl: 'https://www.dit.go.th',
      dataType: 'ราคาสินค้าควบคุมและ CPO',
      updateFrequency: 'รายวัน',
      trustLevel: 'high',
      sourceType: 'official',
      licenseNote: 'ข้อมูลสาธารณะจากหน่วยงานรัฐ',
      isActive: true,
    },
    {
      id: 'src-doae',
      sourceName: 'กรมส่งเสริมการเกษตร',
      cropOrProduct: 'ทุเรียน, ผลไม้ส่งออก',
      sourceUrl: 'https://www.doae.go.th',
      dataType: 'ราคาผลผลิตและสถิติการเกษตร',
      updateFrequency: 'รายสัปดาห์',
      trustLevel: 'high',
      sourceType: 'official',
      licenseNote: 'ข้อมูลสาธารณะจากหน่วยงานรัฐ',
      isActive: true,
    },
    {
      id: 'src-hatyai',
      sourceName: 'ตลาดยางหาดใหญ่',
      cropOrProduct: 'ยางแผ่น RSS',
      sourceUrl: 'https://www.hatyairubber.com',
      dataType: 'ราคาตลาดกลาง',
      updateFrequency: 'รายวัน (วันทำการ)',
      trustLevel: 'high',
      sourceType: 'industry',
      licenseNote: 'ใช้เพื่อวิเคราะห์ตลาด ไม่ใช่เชิงพาณิชย์',
      isActive: true,
    },
    {
      id: 'src-bursa',
      sourceName: 'Bursa Malaysia Derivatives',
      cropOrProduct: 'CPO มาเลเซีย (FCPO)',
      sourceUrl: 'https://www.bursamalaysia.com',
      dataType: 'ราคา Futures',
      updateFrequency: 'Real-time (วันทำการ)',
      trustLevel: 'high',
      sourceType: 'industry',
      licenseNote: 'ข้อมูล delayed 15 นาที สำหรับการอ้างอิงเท่านั้น',
      isActive: true,
    },
    {
      id: 'src-argus',
      sourceName: 'Argus Media',
      cropOrProduct: 'ยูเรีย, ปุ๋ยเคมีโลก',
      sourceUrl: 'https://www.argusmedia.com',
      dataType: 'ราคาตลาดโลก (Benchmark)',
      updateFrequency: 'รายสัปดาห์',
      trustLevel: 'high',
      sourceType: 'industry',
      licenseNote: 'ต้องสมัครสมาชิก ใช้ราคาอ้างอิงที่เผยแพร่สาธารณะ',
      isActive: true,
    },
    {
      id: 'src-cru',
      sourceName: 'CRU Group',
      cropOrProduct: 'DAP, MAP, ปุ๋ยฟอสเฟต',
      sourceUrl: 'https://www.crugroup.com',
      dataType: 'ราคาตลาดโลก',
      updateFrequency: 'รายสัปดาห์',
      trustLevel: 'high',
      sourceType: 'industry',
      licenseNote: 'ใช้ราคาเปิดเผยสาธารณะเท่านั้น',
      isActive: true,
    },
    {
      id: 'src-fertweek',
      sourceName: 'Fertilizer Week',
      cropOrProduct: 'MOP, SOP, ปุ๋ยโพแทช',
      sourceUrl: 'https://www.theicis.com/fertilizer-week',
      dataType: 'ราคาตลาดโลก',
      updateFrequency: 'รายสัปดาห์',
      trustLevel: 'medium',
      sourceType: 'industry',
      licenseNote: 'ใช้ราคาอ้างอิงที่เผยแพร่สาธารณะ',
      isActive: true,
    },
    {
      id: 'src-field',
      sourceName: 'รายงานภาคสนาม (Field Report)',
      cropOrProduct: 'ทุเรียน, ผลไม้',
      sourceUrl: '',
      dataType: 'ราคาปากสวน (Signal)',
      updateFrequency: 'ไม่สม่ำเสมอ',
      trustLevel: 'low',
      sourceType: 'local_signal',
      licenseNote: 'ข้อมูลจากตัวแทนภาคสนาม ต้องผ่านการตรวจสอบก่อนใช้',
      isActive: true,
    },
    {
      id: 'src-provagri',
      sourceName: 'สำนักงานเกษตรจังหวัด',
      cropOrProduct: 'ผลไม้ท้องถิ่น',
      sourceUrl: 'https://www.doae.go.th',
      dataType: 'สัญญาณราคาท้องถิ่น',
      updateFrequency: 'รายสัปดาห์',
      trustLevel: 'medium',
      sourceType: 'local_signal',
      licenseNote: 'ข้อมูลสาธารณะ ใช้เป็นสัญญาณเบื้องต้นเท่านั้น',
      isActive: false,
    },
  ]
}

// ── Local signals ──────────────────────────────────────────────────────────
export function getLocalSignals(): LocalSignal[] {
  return [
    {
      id: 'sig-001',
      submittedBy: 'ตัวแทนภาคสนาม สงขลา',
      location: 'อ.นาหม่อม สงขลา',
      productType: 'น้ำยางสด DRC 60%',
      price: 57.00,
      unit: 'กก',
      evidence: 'ใบซื้อขาย',
      timeReported: '2026-04-30T08:30:00',
      verificationStatus: 'verified',
      confidence: 'medium',
      notes: 'ราคาต่ำกว่ากยท. เล็กน้อย อาจขึ้นกับแหล่งรับซื้อ',
    },
    {
      id: 'sig-002',
      submittedBy: 'เจ้าของสวน ยะลา',
      location: 'อ.เมือง ยะลา',
      productType: 'หมอนทองยะลา',
      price: 138,
      unit: 'กก',
      timeReported: '2026-04-30T14:00:00',
      verificationStatus: 'unverified',
      confidence: 'low',
      notes: 'ราคาจากล้งที่เข้ามารับ อาจต่างกันตามเกรด',
    },
    {
      id: 'sig-003',
      submittedBy: 'ตัวแทน กระบี่',
      location: 'อ.คลองท่อม กระบี่',
      productType: 'ผลปาล์มสด (FFB)',
      price: 6.60,
      unit: 'กก',
      evidence: 'ภาพถ่ายสลิปรับซื้อ',
      timeReported: '2026-04-29T10:00:00',
      verificationStatus: 'verified',
      confidence: 'high',
      notes: 'ราคารับซื้อจากโรงงานในพื้นที่ ต่ำกว่าราคากรมการค้า 0.20 บาท',
    },
    {
      id: 'sig-004',
      submittedBy: 'เกษตรกร จันทบุรี',
      location: 'อ.ท่าใหม่ จันทบุรี',
      productType: 'หมอนทองจันทบุรี',
      price: 98,
      unit: 'กก',
      timeReported: '2026-04-30T16:30:00',
      verificationStatus: 'unverified',
      confidence: 'low',
      notes: 'ราคาสวนปากสวนเท่านั้น ไม่ใช่ราคาส่งออก',
    },
    {
      id: 'sig-005',
      submittedBy: 'ร้านค้าปุ๋ย สุราษฎร์ธานี',
      location: 'อ.เมือง สุราษฎร์ธานี',
      productType: 'ผลปาล์มสด (FFB)',
      price: 6.75,
      unit: 'กก',
      evidence: 'บันทึกราคาโรงงาน',
      timeReported: '2026-05-01T07:00:00',
      verificationStatus: 'verified',
      confidence: 'medium',
    },
  ]
}
