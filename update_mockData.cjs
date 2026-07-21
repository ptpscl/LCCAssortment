const fs = require('fs');

const fileContent = `import { DivisionRecord, DepartmentRecord, CategoryRecord, ClassRecord, StoreRecord, SkuRecord, SkuStoreStatus, AbGenerationDraft, Decision, AbArchiveSnapshot, StoreFormat, Recommendation, Confidence, Flag, AssortmentSnapshot, AssortmentWeeklySnapshot, ExecutiveSummary } from './types';

export const mockDivisions: DivisionRecord[] = [
  { id: 'div-1', name: 'Fresh' },
  { id: 'div-2', name: 'Food' },
  { id: 'div-3', name: 'Nonfood' },
  { id: 'div-4', name: 'GMD' },
  { id: 'div-5', name: 'Others' }
];

export const mockDepartments: DepartmentRecord[] = [
  { id: 'dep-1', name: 'Produce', divisionId: 'div-1' },
  { id: 'dep-2', name: 'Meat', divisionId: 'div-1' },
  { id: 'dep-3', name: 'Dairy', divisionId: 'div-1' },
  { id: 'dep-4', name: 'Snacks', divisionId: 'div-2' },
  { id: 'dep-5', name: 'Beverages', divisionId: 'div-2' },
  { id: 'dep-6', name: 'Personal Care', divisionId: 'div-3' },
  { id: 'dep-7', name: 'Home Care', divisionId: 'div-3' },
  { id: 'dep-8', name: 'Apparel', divisionId: 'div-4' },
  { id: 'dep-9', name: 'Electronics', divisionId: 'div-4' },
  { id: 'dep-10', name: 'Seasonal', divisionId: 'div-5' }
];

export const mockCategories: CategoryRecord[] = [
  { id: 'cat-1', name: 'Fruits', departmentId: 'dep-1', assignedCm: 'Pat Cruz' },
  { id: 'cat-2', name: 'Vegetables', departmentId: 'dep-1', assignedCm: 'Alex Rivers' },
  { id: 'cat-3', name: 'Chips', departmentId: 'dep-4', assignedCm: 'Jamie Chen' },
  { id: 'cat-4', name: 'Soda', departmentId: 'dep-5', assignedCm: 'Sam Taylor' },
  { id: 'cat-5', name: 'Hair Care', departmentId: 'dep-6', assignedCm: 'Morgan Lee' },
  { id: 'cat-6', name: 'Skin Care', departmentId: 'dep-6', assignedCm: 'Morgan Lee' },
  { id: 'cat-7', name: 'Cleaning Supplies', departmentId: 'dep-7', assignedCm: 'Taylor Swift' },
  { id: 'cat-8', name: 'Basic Tees', departmentId: 'dep-8', assignedCm: 'Jordan Smith' }
];

export const mockClasses: ClassRecord[] = [
  { id: 'cls-1', name: 'Apples & Pears', categoryId: 'cat-1' },
  { id: 'cls-2', name: 'Citrus', categoryId: 'cat-1' },
  { id: 'cls-3', name: 'Berries', categoryId: 'cat-1' },
  { id: 'cls-4', name: 'Root Vegetables', categoryId: 'cat-2' },
  { id: 'cls-5', name: 'Leafy Greens', categoryId: 'cat-2' },
  { id: 'cls-6', name: 'Potato Chips', categoryId: 'cat-3' },
  { id: 'cls-7', name: 'Cola', categoryId: 'cat-4' },
  { id: 'cls-8', name: 'Shampoo & Conditioner', categoryId: 'cat-5' },
  { id: 'cls-9', name: 'Body Wash', categoryId: 'cat-5' },
  { id: 'cls-10', name: 'Lotions', categoryId: 'cat-6' },
  { id: 'cls-11', name: 'Detergent', categoryId: 'cat-7' },
  { id: 'cls-12', name: 'V-Necks', categoryId: 'cat-8' }
];

export const mockStores: StoreRecord[] = [
  { id: 'str-1', name: 'LCC Supermarket Legazpi', storeFormat: 'HYPER' },
  { id: 'str-2', name: 'LCC Supermarket Tabaco', storeFormat: 'HYPER' },
  { id: 'str-3', name: 'LCC Supermarket Naga', storeFormat: 'HYPER' },
  { id: 'str-4', name: 'LCC Supermarket Sorsogon', storeFormat: 'SUPER' },
  { id: 'str-5', name: 'LCC Supermarket Polangui', storeFormat: 'SUPER' },
  { id: 'str-6', name: 'LCC Supermarket Ligao', storeFormat: 'SUPER' },
  { id: 'str-7', name: 'LCC Supermarket Daraga', storeFormat: 'SUPER' },
  { id: 'str-8', name: 'LCC Express Legazpi', storeFormat: 'EXPRESS' },
  { id: 'str-9', name: 'LCC Express Tabaco', storeFormat: 'EXPRESS' },
  { id: 'str-10', name: 'LCC Express Daraga', storeFormat: 'EXPRESS' },
  { id: 'str-11', name: 'LCC Express Polangui', storeFormat: 'EXPRESS' },
  { id: 'str-12', name: 'LCC Express Guinobatan', storeFormat: 'EXPRESS' }
];

export const mockSkus: SkuRecord[] = [];
export const mockSkuStoreStatuses: SkuStoreStatus[] = [];

// Generate ~50 SKUs for Pat Cruz's category (cat-1: Fruits)
const generateData = () => {
  const patClasses = mockClasses.filter(c => c.categoryId === 'cat-1');
  let skuCounter = 1;
  
  for (let i = 0; i < 50; i++) {
    const classRecord = patClasses[i % patClasses.length];
    const skuId = \`sku-\${skuCounter++}\`;
    
    const sku: SkuRecord = {
      id: skuId,
      name: \`\${classRecord.name} Product \${skuCounter}\`,
      brand: \`Brand \${(i % 5) + 1}\`,
      classId: classRecord.id,
      flags: (i % 7 === 0) ? ['STOCKOUT'] : [],
      duplicateGroupId: (i % 10 === 0) ? 'dup-1' : null,
      revenueImpact: Math.floor(Math.random() * 50000) + 5000,
      weeksOfHistory: Math.floor(Math.random() * 100) + 20
    };
    mockSkus.push(sku);
    
    // Generate SkuStoreStatus for all 12 stores
    mockStores.forEach((store, sIdx) => {
      let rec: Recommendation = 'KEEP';
      let score: number | null = Math.random() * 0.4 + 0.6;
      
      if (i < 30) {
        // Unanimous KEEP
        rec = 'KEEP';
      } else if (i < 35) {
        // Mixed
        if (sIdx < 10) { rec = 'KEEP'; } else { rec = 'WATCH'; score = Math.random() * 0.3 + 0.3; }
      } else if (i < 40) {
        // WATCH
        rec = 'WATCH';
        score = Math.random() * 0.3 + 0.3;
      } else if (i < 45) {
        // DELIST
        rec = 'DELIST';
        score = Math.random() * 0.2;
      } else {
        // HOLD
        rec = 'HOLD';
        score = null;
      }
      
      mockSkuStoreStatuses.push({
        skuId,
        storeId: store.id,
        recommendation: rec,
        score,
        confidence: score && score > 0.6 ? 'HIGH' : (score ? 'MEDIUM' : 'LOW'),
        subSignals: [
          { label: 'Sales Velocity', weight: 0.5, value: Math.random() },
          { label: 'Margin', weight: 0.3, value: Math.random() },
          { label: 'Market Share', weight: 0.2, value: Math.random() }
        ],
        salesWindows: {
          short8w: Array(8).fill(0).map(() => Math.floor(Math.random() * 100)),
          medium26w: Array(26).fill(0).map(() => Math.floor(Math.random() * 100)),
          yoyDelta: (Math.random() - 0.3) * 0.5
        },
        pipelineOverrideReason: null,
        lastPublishedWeekId: '2026-W28'
      });
    });
  }
};
generateData();

export const mockDecisions: Decision[] = [];
export const mockAbArchives: AbArchiveSnapshot[] = [
  {
    archiveId: 'arch-1',
    weekId: '2026-W28',
    archivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Last Friday
    categorySnapshots: [
      { categoryId: 'cat-1', publishedWeekId: '2026-W28' },
      { categoryId: 'cat-2', publishedWeekId: '2026-W28' }
    ]
  }
];
export const mockAbGenerationDrafts: AbGenerationDraft[] = [];

const formats: StoreFormat[] = ['HYPER', 'SUPER', 'EXPRESS'];
export const mockWeeklySnapshots: AssortmentWeeklySnapshot[] = [];

const weekLabels = [
  'Mar 31–Apr 6, 2026', 'Apr 7–13, 2026', 'Apr 14–20, 2026', 'Apr 21–27, 2026',
  'Apr 28–May 4, 2026', 'May 5–11, 2026', 'May 12–18, 2026', 'May 19–25, 2026',
  'May 26–Jun 1, 2026', 'Jun 2–8, 2026', 'Jun 9–15, 2026', 'Jun 16–22, 2026',
  'Jun 23–29, 2026', 'Jun 30–Jul 6, 2026', 'Jul 7–13, 2026', 'Jul 14–20, 2026'
];

mockClasses.forEach(cls => {
  formats.forEach(format => {
    // Determine the trend type for this class
    const trendType = Math.random();
    let driftBias = 0; // flat
    if (trendType > 0.8) driftBias = 1.5; // growing
    else if (trendType < 0.2) driftBias = -1.5; // shrinking

    let baseSkus = Math.floor(Math.random() * 200) + 450;
    
    weekLabels.forEach((weekLabel, index) => {
      // Base churn plus some random noise
      let newSkus = Math.max(0, Math.floor(Math.random() * 15) + driftBias * 4);
      let delistedSkus = Math.max(0, Math.floor(Math.random() * 15) - driftBias * 4);
      
      // Some weeks have higher activity (e.g. range resets)
      if (Math.random() > 0.85) {
        newSkus += Math.floor(Math.random() * 30);
        delistedSkus += Math.floor(Math.random() * 30);
      }

      const netChange = newSkus - delistedSkus;
      baseSkus = baseSkus + netChange;
      const keptSkus = baseSkus - newSkus;
      
      const forReviewSkus = Math.floor(Math.random() * 25) + 10;
      
      const weekId = \`2026-W\${14 + index}\`; // Approx week number

      mockWeeklySnapshots.push({
        weekId,
        weekLabel,
        classId: cls.id,
        storeFormat: format,
        totalSkus: baseSkus,
        newSkus,
        keptSkus,
        delistedSkus,
        forReviewSkus,
        netChange
      });
    });
  });
});

export const mockSnapshots: AssortmentSnapshot[] = [];

const cycles = [
  { id: '2025-Q4', label: 'Q4 2025' },
  { id: '2026-Q1', label: 'Q1 2026' },
  { id: '2026-Q2', label: 'Q2 2026' },
  { id: '2026-Q3', label: 'Q3 2026' },
];

mockClasses.slice(0, 3).forEach(cls => {
  formats.forEach(format => {
    let baseSkus = Math.floor(Math.random() * 100) + 150;
    cycles.forEach(cycle => {
      const newSkus = Math.floor(Math.random() * 10) + 2;
      const delistedSkus = Math.floor(Math.random() * 8) + 2;
      const netChange = newSkus - delistedSkus;
      baseSkus = baseSkus + netChange;
      const keptSkus = baseSkus - newSkus;
      
      mockSnapshots.push({
        cycleId: cycle.id,
        cycleLabel: cycle.label,
        classId: cls.id,
        storeFormat: format,
        totalSkus: baseSkus,
        newSkus,
        keptSkus,
        delistedSkus,
        netChange
      });
    });
  });
});

export const mockExecutiveSummary: ExecutiveSummary = {
  assortmentComposition: [
    { label: 'Supermarket Premium', skuMix: { core: 60, wing: 25, specialty: 15 }, loyaltyBaseline: 0.35, loyaltyCapture: 0.52 },
    { label: 'Supermarket Large', skuMix: { core: 65, wing: 25, specialty: 10 }, loyaltyBaseline: 0.32, loyaltyCapture: 0.48 },
    { label: 'Supermarket Small', skuMix: { core: 70, wing: 20, specialty: 10 }, loyaltyBaseline: 0.30, loyaltyCapture: 0.45 },
    { label: 'Express Large', skuMix: { core: 80, wing: 15, specialty: 5 }, loyaltyBaseline: 0.25, loyaltyCapture: 0.35 },
    { label: 'Express Small', skuMix: { core: 85, wing: 10, specialty: 5 }, loyaltyBaseline: 0.22, loyaltyCapture: 0.30 },
  ],
  dataReliability: [
    { label: 'Supermarket Premium', customerDb: 0.98, loyaltySales: 0.95, mmsSales: 0.99, skuHierarchy: 0.97 },
    { label: 'Supermarket Large', customerDb: 0.97, loyaltySales: 0.94, mmsSales: 0.98, skuHierarchy: 0.96 },
    { label: 'Supermarket Small', customerDb: 0.95, loyaltySales: 0.90, mmsSales: 0.97, skuHierarchy: 0.95 },
    { label: 'Express Large', customerDb: 0.92, loyaltySales: 0.85, mmsSales: 0.96, skuHierarchy: 0.92 },
    { label: 'Express Small', customerDb: 0.88, loyaltySales: 0.80, mmsSales: 0.95, skuHierarchy: 0.90 },
  ]
};
`;

fs.writeFileSync('src/mockData.ts', fileContent);
