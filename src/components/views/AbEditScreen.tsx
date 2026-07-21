import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../dataService';
import { CategoryRecord, SkuRecord, StoreRecord, SkuStoreStatus, Decision } from '../../types';
import { Loader2, ChevronDown, ChevronUp, AlertCircle, X, Check } from 'lucide-react';

interface Props {
  onViewChange?: (view: string) => void;
}

interface GroupedSku {
  sku: SkuRecord;
  items: SkuStoreStatus[];
}

export default function AbEditScreen({ onViewChange }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [skus, setSkus] = useState<Map<string, SkuRecord>>(new Map());
  const [stores, setStores] = useState<Map<string, StoreRecord>>(new Map());
  const [liveStatuses, setLiveStatuses] = useState<SkuStoreStatus[]>([]);
  
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  
  // Track edits purely in state for the "edited" indicator since it applies immediately to the mock db
  const [editedItems, setEditedItems] = useState<Set<string>>(new Set());

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    skuId?: string;
    storeId?: string;
    currentAction?: string;
  } | null>(null);
  const [editNote, setEditNote] = useState('');
  const [newStatus, setNewStatus] = useState<'KEEP' | 'DELIST'>('KEEP');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const cats = await dataService.getCategoryForCm('Pat Cruz');
      if (cats.length > 0) {
        const cat = cats[0];
        setCategory(cat);

        const skuList = await dataService.getSkus();
        const skuMap = new Map();
        skuList.forEach(s => skuMap.set(s.id, s));
        setSkus(skuMap);

        const storeList = await dataService.getStores();
        const storeMap = new Map();
        storeList.forEach(s => storeMap.set(s.id, s));
        setStores(storeMap);

        const statuses = await dataService.getSkuStoreStatuses(cat.id);
        setLiveStatuses(statuses);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const groupedItems = useMemo(() => {
    const bySku = new Map<string, SkuStoreStatus[]>();
    liveStatuses.forEach(item => {
      const arr = bySku.get(item.skuId) || [];
      arr.push(item);
      bySku.set(item.skuId, arr);
    });

    const result: GroupedSku[] = [];
    bySku.forEach((items, skuId) => {
      const sku = skus.get(skuId);
      if (sku) {
        result.push({ sku, items });
      }
    });

    return result.sort((a, b) => a.sku.name.localeCompare(b.sku.name));
  }, [liveStatuses, skus]);

  const latestPublishedWeek = useMemo(() => {
    if (liveStatuses.length === 0) return 'Unknown';
    return liveStatuses[0].lastPublishedWeekId || 'Unknown';
  }, [liveStatuses]);

  const toggleSku = (skuId: string) => {
    setExpandedSkus(prev => {
      const next = new Set(prev);
      if (next.has(skuId)) next.delete(skuId);
      else next.add(skuId);
      return next;
    });
  };

  const getRecommendationBadgeColor = (rec: string) => {
    switch (rec) {
      case 'KEEP': return 'bg-green-100 text-green-800 border-green-200';
      case 'WATCH': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELIST': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openEditModal = (skuId: string, storeId: string, currentStatus: string) => {
    setEditModal({ isOpen: true, skuId, storeId, currentAction: currentStatus });
    setNewStatus(currentStatus === 'DELIST' ? 'DELIST' : 'KEEP');
    setEditNote('');
  };

  const handleSaveEdit = async () => {
    if (!editModal || editNote.length < 10 || !editModal.skuId || !editModal.storeId) return;
    setIsSaving(true);
    
    try {
      await dataService.saveLiveEdit(editModal.skuId, editModal.storeId, newStatus, editNote);
      
      // Update local state to reflect the change
      setLiveStatuses(prev => prev.map(s => {
        if (s.skuId === editModal.skuId && s.storeId === editModal.storeId) {
          return { ...s, recommendation: newStatus };
        }
        return s;
      }));
      
      setEditedItems(prev => new Set(prev).add(`${editModal.skuId}-${editModal.storeId}`));
      
      setEditModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return <div>Category not found.</div>;
  }

  return (
    <div className="flex flex-col pb-12 relative">
      {/* Edit Modal */}
      {editModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !isSaving && setEditModal(null)}></div>
          <div className="relative bg-white rounded-[12px] shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-text-main">Edit Live Status</h3>
              <button onClick={() => !isSaving && setEditModal(null)} className="text-text-muted hover:text-text-main" disabled={isSaving}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-main">Status <span className="text-red-500">*</span></label>
                <select 
                  className="h-10 px-3 border border-border-subtle rounded-[6px] text-[14px] focus:outline-none focus:border-brand-500 bg-white"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as 'KEEP' | 'DELIST')}
                >
                  <option value="KEEP">Keep</option>
                  <option value="DELIST">Delist</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-main">Note <span className="text-red-500">*</span></label>
                <textarea 
                  className="p-3 border border-border-subtle rounded-[6px] text-[14px] focus:outline-none focus:border-brand-500 min-h-[100px] resize-none"
                  placeholder="Explain this change"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                />
                <div className="text-[11px] text-text-muted text-right">
                  {editNote.length}/10 min characters
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-base flex justify-end gap-3">
              <button 
                onClick={() => setEditModal(null)}
                disabled={isSaving}
                className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving || editNote.length < 10 || newStatus === editModal.currentAction}
                className="h-9 px-4 bg-brand-600 hover:bg-brand-700 text-white hover:text-white rounded-[6px] font-medium text-[13px] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-surface-bg/95 backdrop-blur-sm pb-6 pt-2 -mt-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[24px] font-bold text-text-main">
            Editing live AB — Week {latestPublishedWeek}
          </h1>
          <button 
            onClick={() => onViewChange?.('review-queue')}
            className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover/50 transition-colors"
          >
            Done Editing
          </button>
        </div>
        <p className="text-[14px] text-text-muted">
          Changes here apply immediately to the live plan and are logged to History.
        </p>
      </div>

      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {groupedItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Brand</th>
                  <th className="px-6 py-3 text-right">Revenue Impact</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-text-main divide-y divide-border-subtle">
                {groupedItems.map(group => {
                  const isExpanded = expandedSkus.has(group.sku.id);

                  return (
                    <React.Fragment key={group.sku.id}>
                      <tr 
                        className="hover:bg-surface-hover/30 transition-colors cursor-pointer"
                        onClick={() => toggleSku(group.sku.id)}
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-main">{group.sku.name}</div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {group.sku.brand}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ${group.sku.revenueImpact.toLocaleString()}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-surface-base">
                          <td colSpan={4} className="p-0 border-t border-border-subtle">
                            <div className="px-12 py-4">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                                    <th className="pb-2 w-[30%]">Store</th>
                                    <th className="pb-2">Current Status</th>
                                    <th className="pb-2 text-right">Score</th>
                                    <th className="pb-2 text-right">Confidence</th>
                                    <th className="pb-2 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                  {group.items.map(item => {
                                    const isEdited = editedItems.has(`${item.skuId}-${item.storeId}`);
                                    
                                    return (
                                      <tr key={item.storeId}>
                                        <td className="py-3 text-[13px]">{stores.get(item.storeId)?.name || item.storeId}</td>
                                        <td className="py-3 flex items-center gap-2">
                                          <span className={`inline-flex px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wide ${getRecommendationBadgeColor(item.recommendation)}`}>
                                            {item.recommendation}
                                          </span>
                                          {isEdited && (
                                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-sm font-medium tracking-wide">
                                              EDITED
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 text-right text-[13px] font-medium">
                                          {item.score !== null ? item.score.toFixed(2) : '—'}
                                        </td>
                                        <td className="py-3 text-right">
                                          <span className={`text-[12px] font-medium ${item.confidence === 'HIGH' ? 'text-green-600' : item.confidence === 'LOW' ? 'text-red-600' : 'text-amber-600'}`}>
                                            {item.confidence}
                                          </span>
                                        </td>
                                        <td className="py-3 text-right">
                                          <button 
                                            onClick={() => openEditModal(item.skuId, item.storeId, item.recommendation)}
                                            className="text-[12px] text-brand-600 font-medium hover:underline"
                                          >
                                            Edit
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-[14px] text-text-muted">
              No SKUs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
