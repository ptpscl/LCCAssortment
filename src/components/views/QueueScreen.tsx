import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../dataService';
import { CategoryRecord, DepartmentRecord, DivisionRecord, ClassRecord, SkuStoreStatus, AbArchiveSnapshot } from '../../types';
import { Loader2 } from 'lucide-react';

interface Props {
  onViewChange: (view: string) => void;
}

export default function QueueScreen({ onViewChange }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [department, setDepartment] = useState<DepartmentRecord | null>(null);
  const [division, setDivision] = useState<DivisionRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [liveStatuses, setLiveStatuses] = useState<SkuStoreStatus[]>([]);
  const [archives, setArchives] = useState<AbArchiveSnapshot[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      // Fixed persona: Pat Cruz
      const cats = await dataService.getCategoryForCm('Pat Cruz');
      if (cats.length > 0) {
        const cat = cats[0];
        setCategory(cat);
        
        const deps = await dataService.getDepartments();
        const dep = deps.find(d => d.id === cat.departmentId);
        if (dep) {
          setDepartment(dep);
          const divs = await dataService.getDivisions();
          setDivision(divs.find(d => d.id === dep.divisionId) || null);
        }

        const cls = await dataService.getClasses(cat.id);
        setClasses(cls);

        const statuses = await dataService.getSkuStoreStatuses(cat.id);
        setLiveStatuses(statuses);

        const arch = await dataService.getAbArchives();
        setArchives(arch);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleGenerate = async () => {
    if (!category) return;
    setIsGenerating(true);
    await dataService.startGeneration(category.id);
    setIsGenerating(false);
    onViewChange('ab-sandbox');
  };

  const latestPublishedWeek = useMemo(() => {
    if (liveStatuses.length === 0) return null;
    return liveStatuses[0].lastPublishedWeekId;
  }, [liveStatuses]);

  // Mock checking if new week is available. Latest available week in mock data is Week 29.
  const newScoresAvailableWeek = "2026-W29";
  const hasNewerScores = latestPublishedWeek !== newScoresAvailableWeek;
  
  const formatWeek = (weekId: string) => {
    if (weekId === '2026-W28') return 'Week 28 (Jul 10, 2026)';
    if (weekId === '2026-W29') return 'Week 29 (Jul 17, 2026)';
    return weekId;
  };

  const statusSplit = useMemo(() => {
    const split = { KEEP: 0, WATCH: 0, DELIST: 0, HOLD: 0 };
    liveStatuses.forEach(s => {
      split[s.recommendation]++;
    });
    return split;
  }, [liveStatuses]);

  const uniqueSkus = useMemo(() => {
    const ids = new Set(liveStatuses.map(s => s.skuId));
    return ids.size;
  }, [liveStatuses]);

  const categoryHistory = category ? archives
    .filter(a => a.categorySnapshots.some(cs => cs.categoryId === category.id))
    .sort((a, b) => b.archivedAt.localeCompare(a.archivedAt)) : [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Category Header Card */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6">
        <div className="text-[13px] text-text-muted mb-2 font-medium">
          {isLoading ? (
            <span className="opacity-50">Loading hierarchy...</span>
          ) : (
            <>{division?.name} {'>'} {department?.name} {'>'} {category?.name}</>
          )}
        </div>
        <h1 className="text-[24px] font-bold text-text-main mb-4">
          {isLoading ? 'Loading Category...' : category?.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <div className="h-6 w-24 bg-surface-base border border-border-subtle rounded-[6px] animate-pulse"></div>
          ) : classes.map(c => (
            <span key={c.id} className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-surface-base text-text-main text-[13px] border border-border-subtle font-medium">
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* AB Status Banner */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-semibold text-text-main flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-green-500'}`}></span>
              Live AB as of {isLoading ? '...' : (latestPublishedWeek ? formatWeek(latestPublishedWeek) : 'Unknown')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <button
                disabled
                className="h-10 px-4 bg-brand-500 text-white rounded-[6px] font-medium text-[14px] shadow-sm opacity-50 cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Generate AB
              </button>
            ) : hasNewerScores ? (
              <>
                <span className="text-[14px] font-medium text-brand-600">
                  New scores available: {formatWeek(newScoresAvailableWeek)}
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !category}
                  className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[6px] font-medium text-[14px] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate AB
                </button>
              </>
            ) : (
              <>
                <span className="text-[14px] text-text-muted">You're up to date</span>
                <button
                  disabled
                  className="h-10 px-4 bg-brand-500 text-white rounded-[6px] font-medium text-[14px] shadow-sm opacity-50 cursor-not-allowed"
                >
                  Generate AB
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 text-[12px] text-text-muted">
          If you don't generate this week, last week's AB stays live — nothing changes automatically.
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-5">
          <div className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total SKUs</div>
          <div className="text-[28px] font-bold text-text-main">{uniqueSkus}</div>
        </div>
        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-5">
          <div className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1">Total SKU × Store Rows</div>
          <div className="text-[28px] font-bold text-text-main">{liveStatuses.length}</div>
        </div>
        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-5">
          <div className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-3">Live Status Split</div>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-50 rounded-[4px] p-2 border border-green-100 flex flex-col items-center">
              <span className="text-[11px] font-medium text-green-700">KEEP</span>
              <span className="text-[14px] font-bold text-green-800">{statusSplit.KEEP}</span>
            </div>
            <div className="flex-1 bg-amber-50 rounded-[4px] p-2 border border-amber-100 flex flex-col items-center">
              <span className="text-[11px] font-medium text-amber-700">WATCH</span>
              <span className="text-[14px] font-bold text-amber-800">{statusSplit.WATCH}</span>
            </div>
            <div className="flex-1 bg-red-50 rounded-[4px] p-2 border border-red-100 flex flex-col items-center">
              <span className="text-[11px] font-medium text-red-700">DELIST</span>
              <span className="text-[14px] font-bold text-red-800">{statusSplit.DELIST}</span>
            </div>
            <div className="flex-1 bg-surface-base rounded-[4px] p-2 border border-border-subtle flex flex-col items-center">
              <span className="text-[11px] font-medium text-text-muted">HOLD</span>
              <span className="text-[14px] font-bold text-text-main">{statusSplit.HOLD}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generation History */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle">
          <h3 className="text-[16px] font-semibold text-text-main">Generation History</h3>
        </div>
        <div className="p-0">
          {categoryHistory.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-base border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Archive Date</th>
                  <th className="px-6 py-3 font-medium">Published Week</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-text-main">
                {categoryHistory.map(arch => (
                  <tr key={arch.archiveId} className="border-b border-border-subtle last:border-0 hover:bg-surface-hover/30 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(arch.archivedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatWeek(arch.weekId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-[14px] text-text-muted">
              No history found for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
