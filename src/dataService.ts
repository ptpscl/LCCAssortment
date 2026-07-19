import { mockClasses, mockSkus, mockDecisions, mockSnapshots } from './mockData';
import { ClassRecord, SkuRecord, Decision, AssortmentSnapshot, StoreFormat } from './types';

// In-memory data store for the session
let decisions = [...mockDecisions];

export const dataService = {
  getClasses: async (): Promise<ClassRecord[]> => {
    return [...mockClasses];
  },
  
  getQueue: async (classId: string): Promise<SkuRecord[]> => {
    return mockSkus.filter(sku => sku.classId === classId);
  },
  
  getSku: async (id: string): Promise<SkuRecord | undefined> => {
    return mockSkus.find(sku => sku.id === id);
  },
  
  saveDecision: async (decision: Decision): Promise<void> => {
    const existingIndex = decisions.findIndex(d => d.skuId === decision.skuId);
    if (existingIndex >= 0) {
      decisions[existingIndex] = decision;
    } else {
      decisions.push(decision);
    }
  },
  
  getDecisions: async (classId?: string): Promise<Decision[]> => {
    if (!classId) return [...decisions];
    const classSkuIds = new Set(mockSkus.filter(s => s.classId === classId).map(s => s.id));
    return decisions.filter(d => classSkuIds.has(d.skuId));
  },

  getAssortmentSnapshots: async (classId?: string, storeFormat?: StoreFormat): Promise<AssortmentSnapshot[]> => {
    let snaps = [...mockSnapshots];
    if (classId) {
      snaps = snaps.filter(s => s.classId === classId);
    }
    if (storeFormat) {
      snaps = snaps.filter(s => s.storeFormat === storeFormat);
    }
    return snaps;
  }
};
