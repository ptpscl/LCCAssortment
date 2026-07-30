export type Recommendation = 'KEEP' | 'WATCH' | 'DELIST' | 'HOLD';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Flag =
  | 'STOCKOUT'
  | 'DUPLICATE'
  | 'INSUFFICIENT_HISTORY'
  | 'NO_SUBSTITUTE'
  | 'BASKET_ANCHOR'
  | 'COVERAGE_RISK';
export type StoreFormat = 'HYPER' | 'SUPER' | 'EXPRESS';

export interface DivisionRecord { id: string; name: string; }
export interface DepartmentRecord { id: string; name: string; divisionId: string; }
export interface CategoryRecord { id: string; name: string; departmentId: string; assignedCm: string; }
export interface ClassRecord { id: string; name: string; categoryId: string; }
export interface StoreRecord { id: string; name: string; storeFormat: StoreFormat; }

export interface SkuRecord {
  id: string;
  name: string;
  brand: string;
  classId: string;
  flags: Flag[];
  duplicateGroupId: string | null;
  revenueImpact: number;
  weeksOfHistory: number;
  margin: number;
  qty: number;
}

export type Cadence = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CategoryPerformancePeriod {
  categoryId: string;
  classId: string | null;
  cadence: Cadence;
  periodLabel: string;
  periodStart: string;
  qty: number;
  margin: number;
  sales: number;
  splyQty: number;
  splyMargin: number;
  splySales: number;
}

export type ExceptionStatus = 'CLEAN' | 'FOR_RESOLUTION' | 'RESOLVED';

export interface ExceptionRecord {
  id: string;
  categoryId: string;
  skuId: string | null;
  status: ExceptionStatus;
  type: string;
  detectedAt: string;
  resolvedAt: string | null;
  resolvedNote: string | null;
}

export type ScopeLevel = 'CATEGORY' | 'CLASS' | 'SKU';

export interface LoyaltyProfile {
  scopeLevel: ScopeLevel;
  scopeId: string;
  baseline: number;
  capture: number;
  ageGroups: { label: string; percent: number }[];
  genderSplit: { male: number; female: number };
  linkedCustomers: number;
  loyaltySales: number;
  averageBasket: number;
  visitsPerCustomer: number;
}

export interface BrandRollup {
  brand: string;
  classId: string;
  totalQty: number;
  totalMargin: number;
  totalSales: number;
  skuIds: string[];
}

export interface SkuStoreStatus {
  skuId: string;
  storeId: string;
  recommendation: Recommendation;
  score: number | null;
  confidence: Confidence;
  subSignals: { label: string; weight: number; value: number }[];
  salesWindows: {
    short8w: number[];
    medium26w: number[];
    yoyDelta: number;
  };
  pipelineOverrideReason: string | null;
  lastPublishedWeekId: string;
  dataReliability: number;
  reliabilityNote: string | null;
  confidenceReason: string;
}

export interface AbGenerationDraft {
  generationId: string;
  categoryId: string;
  weekId: string;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  items: SkuStoreStatus[];
}

export interface Decision {
  skuId: string;
  storeId: string;
  generationId: string;
  bucket: 'AUTO_KEEP' | 'AUTO_DELIST' | 'FOR_REVIEW';
  action: 'AGREE' | 'DISAGREE' | 'KEEP' | 'DELIST';
  overrideCategory: 'MODEL_ERROR' | 'BUSINESS_RULE' | 'BUYER_OVERRIDE' | null;
  note: string;
  decidedAt: string;
}

export interface CategorySnapshotMetrics {
  categoryId: string;
  categoryName: string;
  divisionName: string;
  departmentName: string;
  publishedWeekId: string;
  percentUpdated: number;
  percentAgreement: number;
  lastUpdatedBy: string;
}

export interface AbArchiveSnapshot {
  archiveId: string;
  weekId: string;
  archivedAt: string;
  categorySnapshots: CategorySnapshotMetrics[];
}

export interface AssortmentTrackerRow extends CategorySnapshotMetrics {
  updatedAsOf: string; // for backward compatibility/alias to publishedWeekId
}

export interface AssortmentSnapshot {
  cycleId: string;
  cycleLabel: string;
  classId: string;
  storeFormat: StoreFormat;
  totalSkus: number;
  newSkus: number;
  keptSkus: number;
  delistedSkus: number;
  netChange: number;
}

export interface AssortmentWeeklySnapshot {
  weekId: string;
  weekLabel: string;
  classId: string;
  storeFormat: StoreFormat;
  totalSkus: number;
  newSkus: number;
  keptSkus: number;
  delistedSkus: number;
  forReviewSkus: number;
  netChange: number;
}

export interface ExecutiveSummary {
  assortmentComposition: {
    label: string;
    skuMix: { core: number; wing: number; specialty: number };
    loyaltyBaseline: number;
    loyaltyCapture: number;
  }[];
  dataReliability: {
    label: string;
    customerDb: number;
    loyaltySales: number;
    mmsSales: number;
    skuHierarchy: number;
  }[];
}

export interface PortfolioCategoryNode {
  type: 'CATEGORY';
  id: string;
  name: string;
  qty: number;
  margin: number;
  sales: number;
}

export interface PortfolioDepartmentNode {
  type: 'DEPARTMENT';
  id: string;
  name: string;
  qty: number;
  margin: number;
  sales: number;
  children: PortfolioCategoryNode[];
}

export interface PortfolioDivisionNode {
  type: 'DIVISION';
  id: string;
  name: string;
  qty: number;
  margin: number;
  sales: number;
  children: PortfolioDepartmentNode[];
}
