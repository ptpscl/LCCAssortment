import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../dataService';
import { 
  AbGenerationDraft, CategoryRecord, SkuRecord, StoreRecord, SkuStoreStatus, Decision
} from '../../types';
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface Props {
  onViewChange?: (view: string) => void;
}

type BucketType = 'AUTO_KEEP' | 'AUTO_DELIST' | 'FOR_REVIEW';

interface GroupedSku {
  sku: SkuRecord;
  bucket: BucketType;
  items: SkuStoreStatus[];
}

export default function AbSandboxScreen({ onViewChange }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<AbGenerationDraft | null>(null);
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [skus, setSkus] = useState<Map<string, SkuRecord>>(new Map());
  const [stores, setStores] = useState<Map<string, StoreRecord>>(new Map());
  
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<BucketType, boolean>>({
    AUTO_KEEP: true,
    AUTO_DELIST: true,
    FOR_REVIEW: true
  });

  // Action State
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [disagreeModal, setDisagreeModal] = useState<{
    isOpen: boolean;
    skuId?: string;
    storeId?: string;
    bucket?: BucketType;
  } | null>(null);
  const [disagreeNote, setDisagreeNote] = useState('');
  const [overrideCategory, setOverrideCategory] = useState<'MODEL_ERROR' | 'BUSINESS_RULE' | 'BUYER_OVERRIDE' | ''>('');

  const [activeReview, setActiveReview] = useState<{
    skuId: string;
    storeId: string;
    action: 'KEEP' | 'DELIST';
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const cats = await dataService.getCategoryForCm('Pat Cruz');
      if (cats.length > 0) {
        const cat = cats[0];
        setCategory(cat);
        const d = await dataService.startGeneration(cat.id);
        setDraft(d);

        const skuList = await dataService.getSkus();
        const skuMap = new Map();
        skuList.forEach(s => skuMap.set(s.id, s));
        setSkus(skuMap);

        const storeList = await dataService.getStores();
        const storeMap = new Map();
        storeList.forEach(s => storeMap.set(s.id, s));
        setStores(storeMap);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const groupedItems = useMemo(() => {
    if (!draft) return { AUTO_KEEP: [], AUTO_DELIST: [], FOR_REVIEW: [] };
    
    const bySku = new Map<string, SkuStoreStatus[]>();
    draft.items.forEach(item => {
      const arr = bySku.get(item.skuId) || [];
      arr.push(item);
      bySku.set(item.skuId, arr);
    });

    const result: Record<BucketType, GroupedSku[]> = {
      AUTO_KEEP: [],
      AUTO_DELIST: [],
      FOR_REVIEW: []
    };

    bySku.forEach((items, skuId) => {
      const sku = skus.get(skuId);
      if (!sku) return;

      const hasKeep = items.some(i => i.recommendation === 'KEEP');
      const hasDelist = items.some(i => i.recommendation === 'DELIST');
      const hasWatch = items.some(i => i.recommendation === 'WATCH');
      const hasHold = items.some(i => i.recommendation === 'HOLD');

      let bucket: BucketType = 'FOR_REVIEW';
      
      if (!hasDelist && !hasWatch && !hasHold && hasKeep) {
        bucket = 'AUTO_KEEP';
      } else if (!hasKeep && !hasWatch && !hasHold && hasDelist) {
        bucket = 'AUTO_DELIST';
      }

      result[bucket].push({ sku, items, bucket });
    });

    return result;
  }, [draft, skus]);

  // Helpers
  const toggleSection = (bucket: BucketType) => {
    setExpandedSections(prev => ({ ...prev, [bucket]: !prev[bucket] }));
  };

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

  const getDecision = (skuId: string, storeId?: string) => {
    if (storeId) {
      return decisions.find(d => d.skuId === skuId && d.storeId === storeId);
    }
    return decisions.filter(d => d.skuId === skuId);
  };

  const getBucketStats = (bucket: BucketType, groups: GroupedSku[]) => {
    let total = 0, agreed = 0, disagreed = 0;
    groups.forEach(g => {
      g.items.forEach(item => {
        total++;
        const d = getDecision(item.skuId, item.storeId) as Decision;
        if (d?.action === 'AGREE') agreed++;
        if (d?.action === 'DISAGREE') disagreed++;
      });
    });
    return { total, agreed, disagreed, pending: total - agreed - disagreed };
  };

  const getReviewStats = (groups: GroupedSku[]) => {
    let totalSkus = groups.length;
    let fullyDecided = 0;
    groups.forEach(g => {
      const isFullyDecided = g.items.every(item => getDecision(item.skuId, item.storeId) !== undefined);
      if (isFullyDecided) fullyDecided++;
    });
    return { totalSkus, fullyDecided, pending: totalSkus - fullyDecided };
  };

  // Actions
  const handleAgreeAll = (bucket: BucketType, groups: GroupedSku[]) => {
    const newDecisions: Decision[] = [];
    groups.forEach(g => {
      g.items.forEach(item => {
        if (!getDecision(item.skuId, item.storeId)) {
          newDecisions.push({
            skuId: item.skuId,
            storeId: item.storeId,
            generationId: draft!.generationId,
            bucket,
            action: 'AGREE',
            overrideCategory: null,
            note: '',
            decidedAt: new Date().toISOString()
          });
        }
      });
    });

    if (newDecisions.length === 0) return;

    setDecisions(prev => [...prev, ...newDecisions]);
    showToast(`${newDecisions.length} items agreed`);

    newDecisions.forEach(d => {
      dataService.saveGenerationDecision(d).catch(console.error);
    });
  };

  const submitDisagree = () => {
    if (!disagreeModal || disagreeNote.length < 10 || !overrideCategory) return;
    const { skuId, storeId, bucket } = disagreeModal;
    
    const newDecisions: Decision[] = [];
    if (storeId) {
      newDecisions.push({
        skuId: skuId!,
        storeId,
        generationId: draft!.generationId,
        bucket: bucket!,
        action: 'DISAGREE',
        overrideCategory: overrideCategory as any,
        note: disagreeNote,
        decidedAt: new Date().toISOString()
      });
    } else {
      const group = groupedItems[bucket!].find(g => g.sku.id === skuId);
      if (group) {
        group.items.forEach(item => {
          newDecisions.push({
            skuId: item.skuId,
            storeId: item.storeId,
            generationId: draft!.generationId,
            bucket: bucket!,
            action: 'DISAGREE',
            overrideCategory: overrideCategory as any,
            note: disagreeNote,
            decidedAt: new Date().toISOString()
          });
        });
      }
    }

    setDecisions(prev => {
      const filtered = prev.filter(p => !newDecisions.some(n => n.skuId === p.skuId && n.storeId === p.storeId));
      return [...filtered, ...newDecisions];
    });
    showToast(`${newDecisions.length} items disagreed`);

    newDecisions.forEach(d => {
      dataService.saveGenerationDecision(d).catch(console.error);
    });

    setDisagreeModal(null);
    setDisagreeNote('');
    setOverrideCategory('');
  };

  const handleReviewConfirm = (skuId: string, storeId: string, action: 'KEEP' | 'DELIST', bucket: BucketType) => {
    const newDecision: Decision = {
      skuId,
      storeId,
      generationId: draft!.generationId,
      bucket,
      action,
      overrideCategory: null,
      note: reviewNote,
      decidedAt: new Date().toISOString()
    };

    setDecisions(prev => {
      const filtered = prev.filter(p => !(p.skuId === skuId && p.storeId === storeId));
      return [...filtered, newDecision];
    });

    dataService.saveGenerationDecision(newDecision).catch(console.error);
    setActiveReview(null);
    setReviewNote('');
  };

  const handleReviewEdit = (skuId: string, storeId: string) => {
    setDecisions(prev => prev.filter(d => !(d.skuId === skuId && d.storeId === storeId)));
  };

  const handlePublishConfirm = async () => {
    if (!draft) return;
    setIsPublishing(true);
    try {
      await dataService.publishGeneration(draft.generationId);
      if (onViewChange) onViewChange('review-queue');
    } catch (e) {
      console.error(e);
      setIsPublishing(false);
    }
  };

  const handleDiscardConfirm = async () => {
    if (!draft) return;
    setIsDiscarding(true);
    try {
      await dataService.discardGeneration(draft.generationId);
      if (onViewChange) onViewChange('review-queue');
    } catch (e) {
      console.error(e);
      setIsDiscarding(false);
    }
  };

  // Rendering
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!draft || !category) {
    return <div>Draft not found.</div>;
  }

  const renderCoverage = (items: SkuStoreStatus[]) => {
    const total = items.length;
    const counts: Record<string, number> = { KEEP: 0, WATCH: 0, DELIST: 0, HOLD: 0 };
    items.forEach(i => counts[i.recommendation]++);

    if (counts.KEEP === total) return `${total}/${total} stores`;
    if (counts.DELIST === total) return `${total}/${total} stores`;

    const parts = [];
    if (counts.KEEP > 0) parts.push(`${counts.KEEP}/${total} Keep`);
    if (counts.WATCH > 0) parts.push(`${counts.WATCH}/${total} Watch`);
    if (counts.DELIST > 0) parts.push(`${counts.DELIST}/${total} Delist`);
    if (counts.HOLD > 0) parts.push(`${counts.HOLD}/${total} Hold`);

    return parts.join(', ');
  };

  const statsAutoKeep = getBucketStats('AUTO_KEEP', groupedItems.AUTO_KEEP);
  const statsAutoDelist = getBucketStats('AUTO_DELIST', groupedItems.AUTO_DELIST);
  const statsForReview = getReviewStats(groupedItems.FOR_REVIEW);

  const renderSection = (title: string, bucket: BucketType, groups: GroupedSku[]) => {
    const isExpanded = expandedSections[bucket];
    const stats = bucket === 'FOR_REVIEW' ? null : getBucketStats(bucket, groups);
    
    let actionButton = null;
    if (bucket !== 'FOR_REVIEW' && stats) {
      if (stats.pending === 0) {
        actionButton = (
          <button disabled className="h-8 px-3 bg-surface-base border border-border-subtle text-text-muted rounded-[4px] font-medium text-[12px] shadow-sm cursor-not-allowed">
            All agreed
          </button>
        );
      } else {
        actionButton = (
          <button 
            onClick={(e) => { e.stopPropagation(); handleAgreeAll(bucket, groups); }}
            className="h-8 px-3 bg-white border border-border-subtle text-text-main rounded-[4px] font-medium text-[12px] shadow-sm hover:bg-surface-hover/50 transition-colors"
          >
            Agree All
          </button>
        );
      }
    }

    return (
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden flex flex-col">
        <div 
          className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
          onClick={() => toggleSection(bucket)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
            <h3 className="text-[16px] font-semibold text-text-main flex items-center gap-2">
              {title}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-base border border-border-subtle text-[12px] font-medium text-text-muted">
                {groups.length}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
            {actionButton}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-border-subtle overflow-x-auto">
            {groups.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Coverage</th>
                    <th className="px-6 py-3 text-right">Revenue Impact</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-text-main divide-y divide-border-subtle">
                  {groups.map(group => {
                    const isSkuExpanded = expandedSkus.has(group.sku.id);
                    const skuDecisions = getDecision(group.sku.id) as Decision[];
                    const isFullyDecided = skuDecisions.length === group.items.length;
                    const hasDisagree = skuDecisions.some(d => d.action === 'DISAGREE');
                    const isAllAgreed = isFullyDecided && !hasDisagree;

                    return (
                      <React.Fragment key={group.sku.id}>
                        <tr 
                          className="hover:bg-surface-hover/30 transition-colors cursor-pointer"
                          onClick={() => toggleSku(group.sku.id)}
                        >
                          <td className="px-6 py-4">
                            {isSkuExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-text-main">{group.sku.name}</div>
                            <div className="text-[12px] text-text-muted">{group.sku.brand}</div>
                          </td>
                          <td className="px-6 py-4 text-text-muted text-[13px]">
                            {renderCoverage(group.items)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            ${group.sku.revenueImpact.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {bucket === 'FOR_REVIEW' ? (
                              <div className="text-[13px] font-medium text-text-muted">
                                {skuDecisions.length}/{group.items.length} decided
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                {isAllAgreed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                {hasDisagree && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                {!isFullyDecided && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); setDisagreeModal({ isOpen: true, skuId: group.sku.id, bucket }); }}
                                     className="h-7 px-3 rounded-[4px] border border-border-subtle text-[12px] font-medium text-text-main hover:bg-surface-hover transition-colors"
                                   >
                                     Disagree
                                   </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        {isSkuExpanded && (
                          <tr className="bg-surface-base">
                            <td colSpan={5} className="p-0 border-t border-border-subtle">
                              <div className="px-12 py-4">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                                      <th className="pb-2 w-[30%]">Store</th>
                                      <th className="pb-2">Rec</th>
                                      <th className="pb-2 text-right">Score</th>
                                      <th className="pb-2 text-right">Confidence</th>
                                      <th className="pb-2 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border-subtle">
                                    {group.items.map(item => {
                                      const storeDecision = getDecision(item.skuId, item.storeId) as Decision | undefined;
                                      const isReviewing = activeReview?.skuId === item.skuId && activeReview?.storeId === item.storeId;
                                      
                                      return (
                                        <tr key={item.storeId}>
                                          <td className="py-3 text-[13px]">{stores.get(item.storeId)?.name || item.storeId}</td>
                                          <td className="py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wide ${getRecommendationBadgeColor(item.recommendation)}`}>
                                              {item.recommendation}
                                            </span>
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
                                            {bucket === 'FOR_REVIEW' ? (
                                              <div className="flex items-center justify-end gap-2">
                                                {isReviewing ? (
                                                  <div className="flex items-center gap-2">
                                                    <input 
                                                      type="text" 
                                                      placeholder="Add a note (optional)"
                                                      value={reviewNote}
                                                      onChange={e => setReviewNote(e.target.value)}
                                                      className="h-7 px-2 text-[12px] border border-border-subtle rounded-[4px] focus:outline-none focus:border-brand-500 w-[140px]"
                                                    />
                                                    <button 
                                                      onClick={() => handleReviewConfirm(item.skuId, item.storeId, activeReview.action, bucket)}
                                                      className="h-7 px-3 bg-brand-500 text-white rounded-[4px] text-[12px] font-medium"
                                                    >
                                                      Confirm
                                                    </button>
                                                    <button 
                                                      onClick={() => { setActiveReview(null); setReviewNote(''); }}
                                                      className="h-7 px-2 text-text-muted hover:text-text-main"
                                                    >
                                                      <X className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                ) : storeDecision ? (
                                                  <div className="flex items-center justify-end gap-3">
                                                     <span className={`inline-flex px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wide ${getRecommendationBadgeColor(storeDecision.action)}`}>
                                                       {storeDecision.action}
                                                     </span>
                                                     <button onClick={() => handleReviewEdit(item.skuId, item.storeId)} className="text-[12px] text-brand-600 font-medium hover:underline">
                                                       Edit
                                                     </button>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                      onClick={() => { setActiveReview({skuId: item.skuId, storeId: item.storeId, action: 'KEEP'}); setReviewNote(''); }}
                                                      className="h-7 px-3 rounded-[4px] border border-green-500 text-green-700 hover:bg-green-50 text-[12px] font-medium transition-colors"
                                                    >
                                                      Keep
                                                    </button>
                                                    <button 
                                                      onClick={() => { setActiveReview({skuId: item.skuId, storeId: item.storeId, action: 'DELIST'}); setReviewNote(''); }}
                                                      className="h-7 px-3 rounded-[4px] border border-red-500 text-red-700 hover:bg-red-50 text-[12px] font-medium transition-colors"
                                                    >
                                                      Delist
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-end gap-3">
                                                {storeDecision?.action === 'AGREE' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                {storeDecision?.action === 'DISAGREE' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                                {!storeDecision && (
                                                   <button 
                                                     onClick={() => setDisagreeModal({ isOpen: true, skuId: item.skuId, storeId: item.storeId, bucket })}
                                                     className="h-6 px-2 rounded-[4px] border border-border-subtle text-[11px] font-medium text-text-main hover:bg-surface-hover transition-colors"
                                                   >
                                                     Disagree
                                                   </button>
                                                )}
                                              </div>
                                            )}
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
                No SKUs in this bucket.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col pb-12 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-[8px] shadow-lg text-[13px] font-medium z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Discard Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !isDiscarding && setShowDiscardModal(false)}></div>
          <div className="relative bg-white rounded-[12px] shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-text-main">Discard Draft</h3>
              <button onClick={() => !isDiscarding && setShowDiscardModal(false)} className="text-text-muted hover:text-text-main" disabled={isDiscarding}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-text-main">
                Discard this draft? All decisions made in this session will be lost.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-base flex justify-end gap-3">
              <button 
                onClick={() => setShowDiscardModal(false)}
                disabled={isDiscarding}
                className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDiscardConfirm}
                disabled={isDiscarding}
                className="h-9 px-4 bg-red-600 text-white rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDiscarding && <Loader2 className="w-4 h-4 animate-spin" />}
                Discard Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !isPublishing && setShowPublishModal(false)}></div>
          <div className="relative bg-white rounded-[12px] shadow-lg w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-text-main">Publish AB Generation</h3>
              <button onClick={() => !isPublishing && setShowPublishModal(false)} className="text-text-muted hover:text-text-main" disabled={isPublishing}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-[14px] text-text-main">
                Publishing will update the live Assortment Bible for <span className="font-semibold">{category.name}</span> to <span className="font-semibold">{draft.weekId}</span>.
              </p>
              <div className="bg-surface-base border border-border-subtle rounded-[8px] p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-text-main font-medium">Items resolved this generation:</span>
                  <span className="font-semibold">{decisions.length}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-text-main font-medium">Items carried forward unchanged:</span>
                  <span className="font-semibold">{draft.items.length - decisions.length}</span>
                </div>
              </div>
              <p className="text-[13px] text-text-muted mt-2">
                Unresolved items keep their current status — nothing is lost, you can generate again next week to revisit them.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-base flex justify-end gap-3">
              <button 
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublishConfirm}
                disabled={isPublishing}
                className="h-9 px-4 bg-brand-500 text-white rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disagree Modal */}
      {disagreeModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setDisagreeModal(null)}></div>
          <div className="relative bg-white rounded-[12px] shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-[16px] font-semibold text-text-main">Disagree with Recommendation</h3>
              <button onClick={() => setDisagreeModal(null)} className="text-text-muted hover:text-text-main">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-main">Override Category <span className="text-red-500">*</span></label>
                <select 
                  className="h-10 px-3 border border-border-subtle rounded-[6px] text-[14px] focus:outline-none focus:border-brand-500 bg-white"
                  value={overrideCategory}
                  onChange={e => setOverrideCategory(e.target.value as any)}
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="MODEL_ERROR">Model error</option>
                  <option value="BUSINESS_RULE">Business rule</option>
                  <option value="BUYER_OVERRIDE">Buyer override</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-main">Note <span className="text-red-500">*</span></label>
                <textarea 
                  className="p-3 border border-border-subtle rounded-[6px] text-[14px] focus:outline-none focus:border-brand-500 min-h-[100px] resize-none"
                  placeholder="Explain why you disagree with this recommendation"
                  value={disagreeNote}
                  onChange={e => setDisagreeNote(e.target.value)}
                />
                <div className="text-[11px] text-text-muted text-right">
                  {disagreeNote.length}/10 min characters
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-base flex justify-end gap-3">
              <button 
                onClick={() => setDisagreeModal(null)}
                className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitDisagree}
                disabled={!overrideCategory || disagreeNote.length < 10}
                className="h-9 px-4 bg-brand-500 text-white rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Disagree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-surface-bg/95 backdrop-blur-sm pb-6 pt-2 -mt-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-bold text-text-main">
            Generating AB for {category.name} — {draft.weekId}
          </h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDiscardModal(true)}
              className="h-9 px-4 bg-white border border-border-subtle text-text-main rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-surface-hover/50 transition-colors"
            >
              Discard draft
            </button>
            <button 
              onClick={() => setShowPublishModal(true)}
              className="h-9 px-4 bg-brand-500 text-white rounded-[6px] font-medium text-[13px] shadow-sm hover:bg-brand-600 transition-colors"
            >
              Publish AB
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-green-50 border border-green-200 text-green-800 text-[13px] font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
            {statsAutoKeep.total} Auto-Keep <span className="font-normal opacity-80 whitespace-nowrap">({statsAutoKeep.agreed} agreed, {statsAutoKeep.disagreed} disagreed, {statsAutoKeep.pending} pending)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-red-50 border border-red-200 text-red-800 text-[13px] font-medium">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
            {statsAutoDelist.total} Auto-Delist <span className="font-normal opacity-80 whitespace-nowrap">({statsAutoDelist.agreed} agreed, {statsAutoDelist.disagreed} disagreed, {statsAutoDelist.pending} pending)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-medium">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            For Review: {statsForReview.totalSkus} SKUs <span className="font-normal opacity-80 whitespace-nowrap">({statsForReview.fullyDecided} fully decided, {statsForReview.pending} partial/pending)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {renderSection('Auto-Keep', 'AUTO_KEEP', groupedItems.AUTO_KEEP)}
        {renderSection('Auto-Delist', 'AUTO_DELIST', groupedItems.AUTO_DELIST)}
        {renderSection('For Review', 'FOR_REVIEW', groupedItems.FOR_REVIEW)}
      </div>
    </div>
  );
}
