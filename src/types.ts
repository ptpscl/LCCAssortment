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

export interface AbArchiveSnapshot {
  archiveId: string;
  weekId: string;
  archivedAt: string;
  categorySnapshots: { categoryId: string; publishedWeekId: string }[];
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
