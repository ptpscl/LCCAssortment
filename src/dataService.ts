import { 
  DivisionRecord, DepartmentRecord, CategoryRecord, ClassRecord, StoreRecord, SkuRecord, 
  SkuStoreStatus, AbGenerationDraft, Decision, AbArchiveSnapshot, StoreFormat, 
  AssortmentSnapshot, AssortmentWeeklySnapshot, ExecutiveSummary, AssortmentTrackerRow
} from './types';
import { 
  mockDivisions, mockDepartments, mockCategories, mockClasses, mockStores, mockSkus, 
  mockSkuStoreStatuses, mockAbGenerationDrafts, mockDecisions, mockAbArchives, 
  mockSnapshots, mockWeeklySnapshots, mockExecutiveSummary 
} from './mockData';

// Delay helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dataService = {
  getDivisions: async (): Promise<DivisionRecord[]> => {
    await delay(200);
    return mockDivisions;
  },

  getDepartments: async (divisionId?: string): Promise<DepartmentRecord[]> => {
    await delay(200);
    return divisionId ? mockDepartments.filter(d => d.divisionId === divisionId) : mockDepartments;
  },

  getCategories: async (departmentId?: string): Promise<CategoryRecord[]> => {
    await delay(200);
    return departmentId ? mockCategories.filter(c => c.departmentId === departmentId) : mockCategories;
  },

  getCategoryForCm: async (cmName: string): Promise<CategoryRecord[]> => {
    await delay(200);
    return mockCategories.filter(c => c.assignedCm === cmName);
  },

  getClasses: async (categoryId?: string): Promise<ClassRecord[]> => {
    await delay(200);
    return categoryId ? mockClasses.filter(c => c.categoryId === categoryId) : mockClasses;
  },

  getStores: async (storeFormat?: StoreFormat): Promise<StoreRecord[]> => {
    await delay(200);
    return storeFormat ? mockStores.filter(s => s.storeFormat === storeFormat) : mockStores;
  },

  getSkus: async (classId?: string): Promise<SkuRecord[]> => {
    await delay(300);
    return classId ? mockSkus.filter(s => s.classId === classId) : mockSkus;
  },

  getSkuStoreStatuses: async (categoryId?: string): Promise<SkuStoreStatus[]> => {
    await delay(400);
    // filter SkuStoreStatus by category
    if (!categoryId) return mockSkuStoreStatuses;
    const classes = mockClasses.filter(c => c.categoryId === categoryId).map(c => c.id);
    const skus = mockSkus.filter(s => classes.includes(s.classId)).map(s => s.id);
    return mockSkuStoreStatuses.filter(st => skus.includes(st.skuId));
  },

  startGeneration: async (categoryId: string): Promise<AbGenerationDraft> => {
    await delay(800);
    const existing = mockAbGenerationDrafts.find(d => d.categoryId === categoryId && d.status === 'DRAFT');
    if (existing) return existing;

    const items = await dataService.getSkuStoreStatuses(categoryId);
    // clone items as proposed draft values
    const draftItems = items.map(item => ({ ...item })); 

    const draft: AbGenerationDraft = {
      generationId: `gen-${Date.now()}`,
      categoryId,
      weekId: '2026-W29', // Hardcode next week
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      items: draftItems
    };
    mockAbGenerationDrafts.push(draft);
    return draft;
  },

  getDraft: async (generationId: string): Promise<AbGenerationDraft | undefined> => {
    await delay(300);
    return mockAbGenerationDrafts.find(d => d.generationId === generationId);
  },

  saveGenerationDecision: async (decision: Decision): Promise<void> => {
    await delay(300);
    mockDecisions.push(decision);
    
    // In a real app we'd update the draft items based on the decision
    const draft = mockAbGenerationDrafts.find(d => d.generationId === decision.generationId);
    if (draft) {
      const item = draft.items.find(i => i.skuId === decision.skuId && i.storeId === decision.storeId);
      if (item) {
        if (decision.action === 'KEEP' || (decision.action === 'AGREE' && item.recommendation === 'KEEP')) {
          item.recommendation = 'KEEP';
        } else if (decision.action === 'DELIST' || (decision.action === 'AGREE' && item.recommendation === 'DELIST')) {
          item.recommendation = 'DELIST';
        } else if (decision.action === 'DISAGREE') {
           item.recommendation = item.recommendation === 'KEEP' ? 'DELIST' : 'KEEP';
        }
      }
    }
  },

  discardGeneration: async (generationId: string): Promise<void> => {
    await delay(300);
    const draftIndex = mockAbGenerationDrafts.findIndex(d => d.generationId === generationId);
    if (draftIndex >= 0) {
      // Just remove the draft completely so we can start over
      mockAbGenerationDrafts.splice(draftIndex, 1);
    }
  },

  publishGeneration: async (generationId: string): Promise<void> => {
    await delay(1000);
    const draftIndex = mockAbGenerationDrafts.findIndex(d => d.generationId === generationId);
    if (draftIndex >= 0) {
      const draft = mockAbGenerationDrafts[draftIndex];
      draft.status = 'PUBLISHED';
      
      // commit to live status
      draft.items.forEach(draftItem => {
        const liveIndex = mockSkuStoreStatuses.findIndex(s => s.skuId === draftItem.skuId && s.storeId === draftItem.storeId);
        if (liveIndex >= 0) {
          mockSkuStoreStatuses[liveIndex] = {
            ...draftItem,
            lastPublishedWeekId: draft.weekId
          };
        } else {
          mockSkuStoreStatuses.push({
            ...draftItem,
            lastPublishedWeekId: draft.weekId
          });
        }
      });
      
      // Update the archive
      let archive = mockAbArchives.find(a => a.weekId === draft.weekId);
      if (!archive) {
         archive = {
            archiveId: `arch-${Date.now()}`,
            weekId: draft.weekId,
            archivedAt: new Date().toISOString(),
            categorySnapshots: []
         };
         mockAbArchives.push(archive);
      }
      const catSnap = archive.categorySnapshots.find(c => c.categoryId === draft.categoryId);
      const catRec = mockCategories.find(c => c.id === draft.categoryId);
      const dept = mockDepartments.find(d => d.id === catRec?.departmentId);
      const div = mockDivisions.find(d => d.id === dept?.divisionId);
      
      if (catSnap) {
         catSnap.publishedWeekId = draft.weekId;
         catSnap.lastUpdatedBy = catRec?.assignedCm || 'Unknown';
      } else {
         archive.categorySnapshots.push({ 
           categoryId: draft.categoryId,
           categoryName: catRec?.name || 'Unknown',
           divisionName: div?.name || 'Unknown',
           departmentName: dept?.name || 'Unknown',
           publishedWeekId: draft.weekId,
           percentUpdated: 100,
           percentAgreement: 100,
           lastUpdatedBy: catRec?.assignedCm || 'Unknown' 
         });
      }
    }
  },

  saveLiveEdit: async (skuId: string, storeId: string, action: 'KEEP' | 'DELIST', note: string): Promise<void> => {
    await delay(300);
    const liveIndex = mockSkuStoreStatuses.findIndex(s => s.skuId === skuId && s.storeId === storeId);
    if (liveIndex >= 0) {
      mockSkuStoreStatuses[liveIndex].recommendation = action;
      mockDecisions.push({
        skuId,
        storeId,
        generationId: `live-edit-${Date.now()}`,
        bucket: 'FOR_REVIEW',
        action,
        overrideCategory: 'BUSINESS_RULE',
        note,
        decidedAt: new Date().toISOString()
      });
    }
  },

  getAbArchives: async (): Promise<AbArchiveSnapshot[]> => {
    await delay(300);
    return mockAbArchives;
  },

  getArchiveSnapshots: async (): Promise<AbArchiveSnapshot[]> => {
    await delay(300);
    // return sorted desc
    return [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId));
  },

  getSnapshotDetail: async (archiveId: string) => {
    await delay(300);
    const archive = mockAbArchives.find(a => a.archiveId === archiveId);
    if (!archive) throw new Error('Archive not found');
    const grouped = {};
    archive.categorySnapshots.forEach(snap => {
      if (!grouped[snap.divisionName]) grouped[snap.divisionName] = [];
      grouped[snap.divisionName].push(snap);
    });
    return grouped;
  },

  simulateFridayArchive: async (): Promise<AbArchiveSnapshot> => {
    await delay(800);
    const newWeekId = '2026-W30';
    // Deep copy the latest archive
    const latestArchive = [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId))[0];
    const snapshot = {
      archiveId: `arch-${Date.now()}`,
      weekId: newWeekId,
      archivedAt: new Date().toISOString(),
      categorySnapshots: latestArchive.categorySnapshots.map(c => ({...c}))
    };
    mockAbArchives.push(snapshot);
    return snapshot;
  },

  getAssortmentTrackerRows: async (): Promise<AssortmentTrackerRow[]> => {
    await delay(400);
    const latestArchive = [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId))[0];
    if (!latestArchive) return [];
    
    return latestArchive.categorySnapshots.map(snap => ({
      ...snap,
      updatedAsOf: snap.publishedWeekId
    }));
  },

  // Kept for backward compatibility with existing ExecutiveDashboard
  getAssortmentSnapshots: async (classId?: string, storeFormat?: StoreFormat): Promise<AssortmentSnapshot[]> => {
    await delay(400);
    let snaps = [...mockSnapshots];
    if (classId) {
      snaps = snaps.filter(s => s.classId === classId);
    }
    if (storeFormat) {
      snaps = snaps.filter(s => s.storeFormat === storeFormat);
    }
    return snaps;
  },

  getAssortmentWeeklySnapshots: async (classId?: string, storeFormat?: StoreFormat): Promise<AssortmentWeeklySnapshot[]> => {
    await delay(400);
    let snaps = [...mockWeeklySnapshots];
    if (classId) {
      snaps = snaps.filter(s => s.classId === classId);
    }
    if (storeFormat) {
      snaps = snaps.filter(s => s.storeFormat === storeFormat);
    }
    return snaps;
  },

  getExecutiveSummary: async (storeCategorization?: string, dateFrom?: string, dateTo?: string, groupBy: 'categorization' | 'store' = 'categorization'): Promise<ExecutiveSummary> => {
    await delay(500);
    let factor = !storeCategorization || storeCategorization === 'All' ? 1 : 0.7 + (Math.random() * 0.3);
    
    let baseCategorizations = [
      'Supermarket Premium', 'Supermarket Large', 'Supermarket Small',
      'Express Large', 'Express Small'
    ];
    
    if (storeCategorization && storeCategorization !== 'All') {
      if (baseCategorizations.includes(storeCategorization)) {
        baseCategorizations = [storeCategorization];
      } else {
        baseCategorizations = [storeCategorization];
      }
    }
    
    let compositionBase = mockExecutiveSummary.assortmentComposition;
    let reliabilityBase = mockExecutiveSummary.dataReliability;

    if (storeCategorization && storeCategorization !== 'All') {
      const match = compositionBase.find(c => c.label === storeCategorization);
      if (match) {
        compositionBase = [match];
      } else {
        compositionBase = [{ label: storeCategorization, skuMix: { core: 60, wing: 30, specialty: 10 }, loyaltyBaseline: 0.4, loyaltyCapture: 0.3 }];
      }

      const rMatch = reliabilityBase.find(r => r.label === storeCategorization);
      if (rMatch) {
        reliabilityBase = [rMatch];
      } else {
        reliabilityBase = [{ label: storeCategorization, customerDb: 0.9, loyaltySales: 0.9, mmsSales: 0.9, skuHierarchy: 0.9 }];
      }
    }

    const assortmentComposition: any[] = [];
    const dataReliability: any[] = [];

    compositionBase.forEach(c => {
      const r = reliabilityBase.find(rel => rel.label === c.label) || { label: c.label, customerDb: 0.9, loyaltySales: 0.9, mmsSales: 0.9, skuHierarchy: 0.9 };

      if (groupBy === 'store') {
        const numStores = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numStores; i++) {
          const storeLabel = c.label.includes('Express') ? `LCC Express Store ${Math.floor(Math.random()*100)}` : `LCC Supermarket Store ${Math.floor(Math.random()*100)}`;
          
          assortmentComposition.push({
            ...c,
            label: storeLabel,
            skuMix: {
              core: Math.min(100, Math.max(0, c.skuMix.core * factor * (0.9 + Math.random()*0.2))),
              wing: Math.min(100, Math.max(0, c.skuMix.wing * factor * (0.9 + Math.random()*0.2))),
              specialty: Math.min(100, Math.max(0, c.skuMix.specialty * factor * (0.9 + Math.random()*0.2)))
            }
          });

          dataReliability.push({
            label: storeLabel,
            customerDb: Math.min(1, Math.random() * 0.15 + 0.85 * factor),
            loyaltySales: Math.min(1, Math.random() * 0.2 + 0.8 * factor),
            mmsSales: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
            skuHierarchy: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
          });
        }
      } else {
        assortmentComposition.push({
          ...c,
          skuMix: {
            core: Math.min(100, Math.max(0, c.skuMix.core * factor)),
            wing: Math.min(100, Math.max(0, c.skuMix.wing * factor)),
            specialty: Math.min(100, Math.max(0, c.skuMix.specialty * factor))
          }
        });

        dataReliability.push({
          label: c.label,
          customerDb: Math.min(1, Math.random() * 0.15 + 0.85 * factor),
          loyaltySales: Math.min(1, Math.random() * 0.2 + 0.8 * factor),
          mmsSales: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
          skuHierarchy: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
        });
      }
    });
    
    return {
      assortmentComposition,
      dataReliability
    };
  }
};
