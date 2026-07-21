const fs = require('fs');

const fileContent = `import { 
  DivisionRecord, DepartmentRecord, CategoryRecord, ClassRecord, StoreRecord, SkuRecord, 
  SkuStoreStatus, AbGenerationDraft, Decision, AbArchiveSnapshot, StoreFormat, 
  AssortmentSnapshot, AssortmentWeeklySnapshot, ExecutiveSummary 
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
      generationId: \`gen-\${Date.now()}\`,
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
            archiveId: \`arch-\${Date.now()}\`,
            weekId: draft.weekId,
            archivedAt: new Date().toISOString(),
            categorySnapshots: []
         };
         mockAbArchives.push(archive);
      }
      const catSnap = archive.categorySnapshots.find(c => c.categoryId === draft.categoryId);
      if (catSnap) {
         catSnap.publishedWeekId = draft.weekId;
      } else {
         archive.categorySnapshots.push({ categoryId: draft.categoryId, publishedWeekId: draft.weekId });
      }
    }
  },

  getAbArchives: async (): Promise<AbArchiveSnapshot[]> => {
    await delay(300);
    return mockAbArchives;
  },

  simulateFridayArchive: async (): Promise<AbArchiveSnapshot> => {
    await delay(800);
    const newWeekId = '2026-W30';
    const snapshot: AbArchiveSnapshot = {
      archiveId: \`arch-\${Date.now()}\`,
      weekId: newWeekId,
      archivedAt: new Date().toISOString(),
      categorySnapshots: mockCategories.map(c => {
         // find the last published week for this category (simplified)
         return { categoryId: c.id, publishedWeekId: '2026-W28' }; 
      })
    };
    mockAbArchives.push(snapshot);
    return snapshot;
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
    
    const categorizations = [
      'Supermarket Premium', 'Supermarket Large', 'Supermarket Small',
      'Express Large', 'Express Small'
    ];
    
    return {
      assortmentComposition: mockExecutiveSummary.assortmentComposition.map(c => ({
        ...c,
        skuMix: {
          core: Math.min(100, Math.max(0, c.skuMix.core * factor)),
          wing: Math.min(100, Math.max(0, c.skuMix.wing * factor)),
          specialty: Math.min(100, Math.max(0, c.skuMix.specialty * factor))
        }
      })),
      dataReliability: categorizations.map(cat => ({
        label: groupBy === 'store' ? (cat.includes('Express') ? \`LCC Express Store \${Math.floor(Math.random()*10)}\` : \`LCC Supermarket Store \${Math.floor(Math.random()*10)}\`) : cat,
        customerDb: Math.min(1, Math.random() * 0.15 + 0.85 * factor),
        loyaltySales: Math.min(1, Math.random() * 0.2 + 0.8 * factor),
        mmsSales: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
        skuHierarchy: Math.min(1, Math.random() * 0.1 + 0.9 * factor),
      }))
    };
  }
};
`;

fs.writeFileSync('src/dataService.ts', fileContent);
