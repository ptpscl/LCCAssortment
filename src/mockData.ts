import { ClassRecord, SkuRecord, Decision, Recommendation, Confidence, Flag, StoreFormat, AssortmentSnapshot } from './types';

export const mockClasses: ClassRecord[] = [
  { id: 'c1', name: 'Shampoo & Conditioner', department: 'Personal Care' },
  { id: 'c2', name: 'Skincare', department: 'Personal Care' },
  { id: 'c3', name: 'Oral Care', department: 'Personal Care' },
  { id: 'c4', name: 'Apples & Pears', department: 'Fresh' },
  { id: 'c5', name: 'Citrus', department: 'Fresh' },
  { id: 'c6', name: 'Leafy Greens', department: 'Fresh' },
  { id: 'c7', name: 'Root Vegetables', department: 'Fresh' },
  { id: 'c8', name: 'Outdoor Furniture', department: 'Direct Import' },
  { id: 'c9', name: 'Holiday Decor', department: 'Direct Import' },
  { id: 'c10', name: 'Kitchen Gadgets', department: 'Direct Import' },
];

export const mockSkus: SkuRecord[] = [];

// Helper to generate SKUs
const generateSkus = () => {
  let skuIdCounter = 1;
  const addSku = (overrides: Partial<SkuRecord>) => {
    mockSkus.push({
      id: `sku-${skuIdCounter++}`,
      name: `Generic Product ${skuIdCounter}`,
      brand: `Brand ${Math.floor(Math.random() * 10) + 1}`,
      classId: mockClasses[Math.floor(Math.random() * mockClasses.length)].id,
      storeFormat: ['HYPER', 'SUPER', 'EXPRESS'][Math.floor(Math.random() * 3)] as StoreFormat,
      recommendation: 'KEEP',
      score: Math.random() * 0.4 + 0.6,
      confidence: 'HIGH',
      subSignals: [
        { label: 'Sales Velocity', weight: 0.5, value: Math.random() },
        { label: 'Margin', weight: 0.3, value: Math.random() },
        { label: 'Market Share', weight: 0.2, value: Math.random() },
      ],
      salesWindows: {
        short8w: Array(8).fill(0).map(() => Math.floor(Math.random() * 100)),
        medium26w: Array(26).fill(0).map(() => Math.floor(Math.random() * 100)),
        yoyDelta: (Math.random() - 0.3) * 0.5,
      },
      flags: [],
      pipelineOverrideReason: null,
      revenueImpact: Math.floor(Math.random() * 50000) + 5000,
      weeksOfHistory: Math.floor(Math.random() * 100) + 20,
      duplicateGroupId: null,
      ...overrides,
    });
  };

  // 60 SKUs total
  // 30 KEEP (~50%)
  for (let i = 0; i < 30; i++) addSku({ recommendation: 'KEEP', confidence: 'HIGH' });
  // 15 WATCH (~25%)
  for (let i = 0; i < 15; i++) addSku({ recommendation: 'WATCH', confidence: 'MEDIUM', score: Math.random() * 0.3 + 0.3 });
  // 9 DELIST (~15%)
  for (let i = 0; i < 9; i++) addSku({ recommendation: 'DELIST', confidence: 'HIGH', score: Math.random() * 0.2 });
  // 6 HOLD (~10%)
  for (let i = 0; i < 6; i++) addSku({ recommendation: 'HOLD', confidence: 'LOW', score: null });

  // 4 STOCKOUT
  for (let i = 0; i < 4; i++) mockSkus[i].flags.push('STOCKOUT');

  // 6 SKUs in 3 duplicate groups
  mockSkus[10].duplicateGroupId = 'dup-1'; mockSkus[10].flags.push('DUPLICATE');
  mockSkus[11].duplicateGroupId = 'dup-1'; mockSkus[11].flags.push('DUPLICATE');
  
  mockSkus[20].duplicateGroupId = 'dup-2'; mockSkus[20].flags.push('DUPLICATE');
  mockSkus[21].duplicateGroupId = 'dup-2'; mockSkus[21].flags.push('DUPLICATE');
  
  mockSkus[30].duplicateGroupId = 'dup-3'; mockSkus[30].flags.push('DUPLICATE');
  mockSkus[31].duplicateGroupId = 'dup-3'; mockSkus[31].flags.push('DUPLICATE');

  // 5 INSUFFICIENT_HISTORY (weeksOfHistory < 10, score null, recommendation HOLD)
  for (let i = 55; i < 60; i++) {
    mockSkus[i].weeksOfHistory = Math.floor(Math.random() * 9) + 1;
    mockSkus[i].score = null;
    mockSkus[i].recommendation = 'HOLD';
    mockSkus[i].flags.push('INSUFFICIENT_HISTORY');
  }

  // 3 NO_SUBSTITUTE / BASKET_ANCHOR with pipelineOverrideReason
  mockSkus[40].flags.push('NO_SUBSTITUTE');
  mockSkus[40].pipelineOverrideReason = 'High loyalty, no direct brand replacement.';
  mockSkus[41].flags.push('BASKET_ANCHOR');
  mockSkus[41].pipelineOverrideReason = 'Drives significant cross-category sales.';
  mockSkus[42].flags.push('BASKET_ANCHOR');
  mockSkus[42].pipelineOverrideReason = 'Top decile basket penetation.';
};

generateSkus();

export const mockDecisions: Decision[] = [];

export const mockSnapshots: AssortmentSnapshot[] = [];
const formats: StoreFormat[] = ['HYPER', 'SUPER', 'EXPRESS'];
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
