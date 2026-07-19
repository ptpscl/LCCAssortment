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

export interface ClassRecord {
  id: string;
  name: string;
  department: string;
}

export interface SkuRecord {
  id: string;
  name: string;
  brand: string;
  classId: string;
  storeFormat: StoreFormat;
  recommendation: Recommendation;
  score: number | null;
  confidence: Confidence;
  subSignals: { label: string; weight: number; value: number }[];
  salesWindows: {
    short8w: number[];
    medium26w: number[];
    yoyDelta: number;
  };
  flags: Flag[];
  pipelineOverrideReason: string | null;
  revenueImpact: number;
  weeksOfHistory: number;
  duplicateGroupId: string | null;
}

export interface Decision {
  skuId: string;
  actor: string;
  action: 'AGREE' | 'OVERRIDE' | 'SKIP';
  overrideCategory: 'MODEL_ERROR' | 'BUSINESS_RULE' | 'BUYER_OVERRIDE' | null;
  note: string;
  decidedAt: string;
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
