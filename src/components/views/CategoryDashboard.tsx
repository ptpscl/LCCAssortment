import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../dataService';
import { CategoryRecord, DepartmentRecord, DivisionRecord, ClassRecord, SkuRecord, StoreRecord, CategoryPerformancePeriod, Cadence, BrandRollup, LoyaltyProfile, ScopeLevel } from '../../types';
import { Loader2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, HelpCircle, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => val.toLocaleString();

const CATEGORIZATIONS = [
  'Supermarket Premium', 'Supermarket Large', 'Supermarket Small',
  'Express Large', 'Express Small'
];


const LoyaltyRow = ({ scopeLevel, scopeId, title, isExpanded, onToggleExpand, hasChildren }: { scopeLevel: ScopeLevel, scopeId: string, title: string, isExpanded?: boolean, onToggleExpand?: () => void, hasChildren?: boolean }) => {
  const [profile, setProfile] = React.useState<LoyaltyProfile | null>(null);
  const [showDemo, setShowDemo] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const data = await dataService.getLoyaltyProfile(scopeLevel, scopeId);
      setProfile(data);
    }
    load();
  }, [scopeLevel, scopeId]);

  if (!profile) return null;

  const actualBaseline = profile.baseline * 100;
  const capture = profile.capture * 100;
  const visualBaseline = (actualBaseline - capture > 0 && actualBaseline - capture < 3) ? capture + 3 : actualBaseline;

  return (
    <React.Fragment>
      <tr className="hover:bg-surface-bg transition-colors border-b border-border-subtle last:border-b-0">
        {scopeLevel !== 'CATEGORY' && (
          <td className="px-6 py-4 w-10 cursor-pointer" onClick={onToggleExpand}>
            {hasChildren && (isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />)}
          </td>
        )}
        <td 
          className={`px-6 py-4 ${scopeLevel === 'CATEGORY' ? 'text-[14px] font-semibold text-text-main' : scopeLevel === 'CLASS' ? 'text-[14px] font-medium text-text-main cursor-pointer' : 'text-[13px] text-text-muted pl-12'}`} 
          colSpan={scopeLevel === 'CATEGORY' ? 2 : 1} 
          onClick={scopeLevel === 'CATEGORY' ? undefined : onToggleExpand}
        >
          {scopeLevel === 'SKU' ? (
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-border-subtle shrink-0"></div>
              <span className="truncate max-w-[250px] block" title={title}>{title}</span>
            </div>
          ) : title}
        </td>
        <td className="px-6 py-4 w-[400px]">
          <div className="flex flex-col gap-1">
            <div className="relative h-4 w-full flex rounded-full overflow-hidden bg-surface-bg">
              <div className="absolute left-0 top-0 h-full bg-brand-50 transition-all duration-500" style={{ width: `${Math.min(100, visualBaseline)}%` }} />
              <div className="absolute left-0 top-0 h-full bg-brand-600 transition-all duration-500" style={{ width: `${capture}%` }} />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDemo(!showDemo); }}
            className="text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {showDemo ? 'Hide Demographics' : 'View Demographics'}
          </button>
        </td>
      </tr>

      {showDemo && (
        <tr className="bg-surface-base border-b border-border-subtle">
          <td colSpan={scopeLevel === 'CATEGORY' ? 4 : 4} className="px-6 py-6 pl-16">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 max-w-[300px]">
                <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Age Groups</h4>
                <div className="space-y-3">
                  {profile.ageGroups.map(ag => (
                    <div key={ag.label} className="flex items-center gap-3">
                      <span className="text-[12px] text-text-muted w-12 shrink-0">{ag.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600 rounded-full" style={{ width: `${ag.percent * 100}%` }}></div>
                      </div>
                      <span className="text-[12px] font-medium text-text-main w-10 text-right">{(ag.percent * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Gender Split</h4>
                <div className="flex items-center gap-2 text-[13px] text-text-main font-medium">
                  Male {(profile.genderSplit.male * 100).toFixed(0)}% <span className="text-border-subtle font-normal">·</span> Female {(profile.genderSplit.female * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};


const PortfolioRow = ({ node, isExpanded, onToggleExpand, level = 0 }: { node: any, isExpanded: boolean, onToggleExpand: () => void, level?: number }) => {
  const isCategory = node.type === 'CATEGORY';
  const hasChildren = !isCategory && node.children && node.children.length > 0;
  
  return (
    <React.Fragment>
      <tr 
        className={`hover:bg-surface-bg transition-colors cursor-pointer border-b border-border-subtle last:border-b-0 ${level === 0 ? 'bg-white' : level === 1 ? 'bg-surface-base/50' : 'bg-surface-base'}`}
        onClick={hasChildren ? onToggleExpand : undefined}
      >
        <td className="px-6 py-4 w-10">
          {hasChildren && (isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />)}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {isCategory && <div className="w-1 h-1 rounded-full bg-border-subtle shrink-0"></div>}
            <span className={`truncate ${level === 0 ? 'font-semibold text-text-main text-[14px]' : level === 1 ? 'font-medium text-text-main text-[14px]' : 'text-text-muted text-[13px]'}`}>
              {node.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatNumber(node.qty)}
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatCurrency(node.margin)}
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatCurrency(node.sales)}
        </td>
      </tr>
      {isCategory && (
        <tr className="border-b border-border-subtle last:border-b-0">
           <td className="px-6 py-3 w-10 bg-surface-base"></td>
           <td colSpan={4} className="px-6 py-3 bg-surface-base">
             <div className="pl-6 w-[400px]">
               <LoyaltyBar scopeLevel="CATEGORY" scopeId={node.id} />
             </div>
           </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const LoyaltyBar = ({ scopeLevel, scopeId }: { scopeLevel: ScopeLevel, scopeId: string }) => {
  const [profile, setProfile] = React.useState<LoyaltyProfile | null>(null);

  React.useEffect(() => {
    async function load() {
      const data = await dataService.getLoyaltyProfile(scopeLevel, scopeId);
      setProfile(data);
    }
    load();
  }, [scopeLevel, scopeId]);

  if (!profile) return null;

  const actualBaseline = profile.baseline * 100;
  const capture = profile.capture * 100;
  const visualBaseline = (actualBaseline - capture > 0 && actualBaseline - capture < 3) ? capture + 3 : actualBaseline;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="font-medium text-text-muted">Loyalty Linkage</span>
        <span className="text-text-muted">
          {capture.toFixed(1)}% / {actualBaseline.toFixed(1)}%
        </span>
      </div>
      <div className="relative h-2 w-full flex rounded-full overflow-hidden bg-surface-bg">
        <div className="absolute left-0 top-0 h-full bg-brand-50 transition-all duration-500" style={{ width: `${Math.min(100, visualBaseline)}%` }} />
        <div className="absolute left-0 top-0 h-full bg-brand-600 transition-all duration-500" style={{ width: `${capture}%` }} />
      </div>
    </div>
  );
};

const PortfolioView = ({ data, expandedNodes, onToggle }: { data: any[], expandedNodes: Set<string>, onToggle: (id: string) => void }) => {
  return (
    <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-border-subtle">
        <h3 className="text-[16px] font-semibold text-text-main">Portfolio Rollup</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
              <th className="px-6 py-3 w-10"></th>
              <th className="px-6 py-3">Hierarchy</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-right">Margin</th>
              <th className="px-6 py-3 text-right">Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map(div => {
              const divExpanded = expandedNodes.has(div.id);
              return (
                <React.Fragment key={div.id}>
                  <PortfolioRow node={div} isExpanded={divExpanded} onToggleExpand={() => onToggle(div.id)} level={0} />
                  
                  {divExpanded && div.children.map((dep: any) => {
                    const depExpanded = expandedNodes.has(dep.id);
                    return (
                      <React.Fragment key={dep.id}>
                        <PortfolioRow node={dep} isExpanded={depExpanded} onToggleExpand={() => onToggle(dep.id)} level={1} />
                        
                        {depExpanded && dep.children.map((cat: any) => (
                          <PortfolioRow key={cat.id} node={cat} isExpanded={false} onToggleExpand={() => {}} level={2} />
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function CategoryDashboard({ activePersona = 'Pat Cruz' }: { activePersona?: string }) {
  const [viewMode, setViewMode] = useState<'CATEGORY' | 'PORTFOLIO'>('CATEGORY');
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activePersona === 'Pat Cruz' && viewMode === 'PORTFOLIO') {
      setViewMode('CATEGORY');
    }
  }, [activePersona, viewMode]);

  useEffect(() => {
    if (viewMode === 'PORTFOLIO') {
      dataService.getPortfolioRollup().then(setPortfolioData);
    }
  }, [viewMode]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [department, setDepartment] = useState<DepartmentRecord | null>(null);
  const [division, setDivision] = useState<DivisionRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [skus, setSkus] = useState<SkuRecord[]>([]);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-07-23');
  const [groupBy, setGroupBy] = useState<'categorization' | 'store'>('categorization');
  const [storeCategorization, setStoreCategorization] = useState('All');
  const [performanceScope, setPerformanceScope] = useState<'DIVISION' | 'DEPARTMENT' | 'CATEGORY'>('CATEGORY');
  
  const [cardBreakdownView, setCardBreakdownView] = useState<'categorization' | 'individual_store'>('categorization');
  
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const [trendCadence, setTrendCadence] = useState<Cadence>('WEEKLY');
  const [trendScope, setTrendScope] = useState<'CATEGORY' | 'CLASS'>('CATEGORY');
  const [trendClassId, setTrendClassId] = useState<string>('');
  const [trendMetric, setTrendMetric] = useState<'sales' | 'margin' | 'qty'>('sales');
  const [trendData, setTrendData] = useState<CategoryPerformancePeriod[]>([]);
  const [exceptionCounts, setExceptionCounts] = useState<{ clean: number; forResolution: number; resolved: number } | null>(null);
  const [brandRollups, setBrandRollups] = useState<BrandRollup[]>([]);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [expandedLoyaltyClasses, setExpandedLoyaltyClasses] = useState<Set<string>>(new Set());

  const toggleLoyaltyClass = (classId: string) => {
    setExpandedLoyaltyClasses(prev => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  
  
  
  useEffect(() => {
    async function loadBrandRollups() {
      if (!category) return;
      const data = await dataService.getBrandRollups(category.id);
      // Default sort by sales descending
      const sorted = [...data].sort((a, b) => b.totalSales - a.totalSales);
      setBrandRollups(sorted);
    }
    loadBrandRollups();
  }, [category]);

  useEffect(() => {
    async function loadExceptions() {
      if (!category) return;
      const counts = await dataService.getExceptionCounts(category.id);
      setExceptionCounts(counts);
    }
    loadExceptions();
  }, [category]);

  useEffect(() => {
    async function loadTrend() {
      if (!category) return;
      
      let targetClassId = null;
      if (trendScope === 'CLASS') {
        if (trendClassId) {
          targetClassId = trendClassId;
        } else if (classes.length > 0) {
          targetClassId = classes[0].id;
          setTrendClassId(classes[0].id);
        }
      }

      const data = await dataService.getCategoryPerformance(category.id, trendCadence, targetClassId);
      // Sort ascending by date
      const sorted = [...data].sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime());
      setTrendData(sorted);
    }
    loadTrend();
  }, [category, trendCadence, trendScope, trendClassId, classes]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
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
        const allSkus = await dataService.getSkus();
        const classIds = new Set(cls.map(c => c.id));
        setSkus(allSkus.filter(s => classIds.has(s.classId)));
        const allStores = await dataService.getStores();
        setStores(allStores);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  
  const toggleBrand = (brandId: string) => {
    setExpandedBrands(prev => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  };

  const toggleClass = (classId: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const filterScale = useMemo(() => {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    const selectedDays = Number.isFinite(from) && Number.isFinite(to) && to >= from
      ? Math.max(1, Math.round((to - from) / 86400000) + 1)
      : 53;
    const dateFactor = Math.min(2, Math.max(0.1, selectedDays / 53));
    const categorizationFactor = storeCategorization === 'All'
      ? 1
      : [0.24, 0.23, 0.21, 0.17, 0.15][CATEGORIZATIONS.indexOf(storeCategorization)] ?? 0.2;
    const scopeFactor = performanceScope === 'DIVISION' ? 3.4 : performanceScope === 'DEPARTMENT' ? 1.8 : 1;
    return dateFactor * categorizationFactor * scopeFactor;
  }, [dateFrom, dateTo, performanceScope, storeCategorization]);

  const categoryTotals = useMemo(() => {
    let qty = 0, margin = 0, sales = 0;
    skus.forEach(s => {
      qty += s.qty;
      margin += s.margin;
      sales += s.revenueImpact;
    });
    return {
      qty: Math.round(qty * filterScale),
      margin: Math.round(margin * filterScale),
      sales: Math.round(sales * filterScale),
    };
  }, [filterScale, skus]);

  const classBreakdown = useMemo(() => {
    const map = new Map<string, { qty: number; margin: number; sales: number }>();
    classes.forEach(c => map.set(c.id, { qty: 0, margin: 0, sales: 0 }));
    skus.forEach(s => {
      const stats = map.get(s.classId);
      if (stats) {
        stats.qty += s.qty;
        stats.margin += s.margin;
        stats.sales += s.revenueImpact;
      }
    });
    return Array.from(map.entries()).map(([classId, stats]) => ({
      classId,
      qty: Math.round(stats.qty * filterScale),
      margin: Math.round(stats.margin * filterScale),
      sales: Math.round(stats.sales * filterScale),
    }));
  }, [classes, filterScale, skus]);

  const displayTrendData = useMemo(() => {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    const filtered = trendData.filter(period => {
      const timestamp = new Date(period.periodStart).getTime();
      return (!Number.isFinite(from) || timestamp >= from) && (!Number.isFinite(to) || timestamp <= to);
    });
    // Sparse monthly/yearly selections still need enough points to draw a meaningful trend.
    const source = filtered.length >= 2 ? filtered : trendData;
    const scopeFactor = performanceScope === 'DIVISION' ? 3.4 : performanceScope === 'DEPARTMENT' ? 1.8 : 1;
    const categoryFactor = storeCategorization === 'All'
      ? 1
      : [0.24, 0.23, 0.21, 0.17, 0.15][CATEGORIZATIONS.indexOf(storeCategorization)] ?? 0.2;
    return source.map(period => ({
      ...period,
      qty: Math.round(period.qty * scopeFactor * categoryFactor),
      margin: Math.round(period.margin * scopeFactor * categoryFactor),
      sales: Math.round(period.sales * scopeFactor * categoryFactor),
      splyQty: Math.round(period.splyQty * scopeFactor * categoryFactor),
      splyMargin: Math.round(period.splyMargin * scopeFactor * categoryFactor),
      splySales: Math.round(period.splySales * scopeFactor * categoryFactor),
    }));
  }, [dateFrom, dateTo, performanceScope, storeCategorization, trendData]);

  const classQuality = useMemo(() => classes.map(cls => {
    const classSkus = skus.filter(sku => sku.classId === cls.id);
    const forResolution = classSkus.filter(sku => sku.flags.length > 0).length;
    const resolved = classSkus.filter(sku => sku.duplicateGroupId !== null).length;
    return { id: cls.id, label: cls.name, clean: Math.max(0, classSkus.length - forResolution - resolved), forResolution, resolved };
  }), [classes, skus]);

  const familyOverlaps = useMemo(() => {
    const groups = new Map<string, SkuRecord[]>();
    skus.forEach(sku => {
      const familyId = `FAM-${sku.brand.toUpperCase().replace(/\s+/g, '-')}-${sku.classId.toUpperCase()}`;
      groups.set(familyId, [...(groups.get(familyId) ?? []), sku]);
    });
    return Array.from(groups.entries())
      .filter(([, members]) => members.length > 1)
      .map(([familyId, members]) => ({
        familyId,
        brand: members[0].brand,
        members: members.length,
        sales: Math.round(members.reduce((sum, sku) => sum + sku.revenueImpact, 0) * filterScale),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 8);
  }, [filterScale, skus]);

  const formatCurrency = (val: number) => `₱${val.toLocaleString()}`;

  
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const formatPct = (val: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  };

  const generateMockBreakdown = (stats: { qty: number, margin: number, sales: number }) => {
    const isStoreView = groupBy === 'store' && cardBreakdownView === 'individual_store';
    if (isStoreView) {
      const matchingStores = stores.filter((_, i) => storeCategorization === 'All' || CATEGORIZATIONS[i % CATEGORIZATIONS.length] === storeCategorization);
      return matchingStores.map(store => {
        const factor = matchingStores.length > 0 ? 1 / matchingStores.length : 0;
        return {
          id: store.id,
          label: store.name,
          qty: Math.floor(stats.qty * factor),
          margin: Math.floor(stats.margin * factor),
          sales: Math.floor(stats.sales * factor)
        };
      });
    } else {
      return CATEGORIZATIONS.filter(cat => storeCategorization === 'All' || cat === storeCategorization).map((cat, i) => {
        const factor = storeCategorization === 'All' ? [0.3, 0.25, 0.2, 0.15, 0.1][i] : 1;
        return {
          id: cat,
          label: cat,
          qty: Math.floor(stats.qty * factor),
          margin: Math.floor(stats.margin * factor),
          sales: Math.floor(stats.sales * factor)
        };
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* View Toggle */}
      <div className="flex">
        <div className="flex bg-surface-bg p-1 rounded-lg border border-border-subtle inline-flex">
          <button
            onClick={() => setViewMode('CATEGORY')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
              viewMode === 'CATEGORY' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Category
          </button>
          <div className="relative group flex">
            <button
              onClick={() => {
                if (activePersona !== 'Pat Cruz') setViewMode('PORTFOLIO');
              }}
              disabled={activePersona === 'Pat Cruz'}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'PORTFOLIO' 
                  ? 'bg-white shadow-sm text-text-main' 
                  : activePersona === 'Pat Cruz'
                    ? 'text-text-muted opacity-50 cursor-not-allowed'
                    : 'text-text-muted hover:text-text-main'
              }`}
            >
              {activePersona === 'Pat Cruz' && <Lock className="w-3.5 h-3.5" />}
              Portfolio
            </button>
            {activePersona === 'Pat Cruz' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 border border-border-subtle text-white text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center">
                Portfolio view is available to Division Managers and above
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'CATEGORY' ? (
        <>
      {/* Category Header */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6">
        <div className="text-[13px] text-text-muted mb-2 font-medium">
          <>{division?.name} {'>'} {department?.name} {'>'} {category?.name}</>
        </div>
        <h1 className="text-[24px] font-bold text-text-main mb-4">
          {category?.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {classes.map(c => (
            <span key={c.id} className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-surface-base text-text-main text-[13px] border border-border-subtle font-medium">
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
        <div className="flex flex-row justify-between items-center p-4">
          <div className="flex flex-row flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all" />
                <span className="text-[13px] text-text-muted font-medium">to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Performance Scope</label>
              <select value={performanceScope} onChange={e => setPerformanceScope(e.target.value as 'DIVISION' | 'DEPARTMENT' | 'CATEGORY')} className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px]">
                <option value="DIVISION">Division - {division?.name}</option>
                <option value="DEPARTMENT">Department - {department?.name}</option>
                <option value="CATEGORY">Category - {category?.name}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Store Categorization</label>
              <select value={storeCategorization} onChange={e => setStoreCategorization(e.target.value)} className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[190px]">
                <option value="All">All Store Categorizations</option>
                {CATEGORIZATIONS.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="border-b border-border-subtle w-full"></div>
        <div className="p-4 pt-5 flex items-center gap-4">
          <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Group By</label>
          <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
            <button 
              onClick={() => setGroupBy('categorization')} 
              className={`h-8 px-4 text-[12px] font-medium transition-all rounded-[4px] ${groupBy === 'categorization' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
              Categorization
            </button>
            <button 
              onClick={() => setGroupBy('store')} 
              className={`h-8 px-4 text-[12px] font-medium transition-all rounded-[4px] ${groupBy === 'store' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
              Store
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Contributions */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-white">
          <h3 className="text-[16px] font-semibold text-text-main">Breakdown & Contributions</h3>
          {groupBy === 'store' && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-text-muted font-medium">View detailed breakdown by:</span>
              <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
                <button 
                  onClick={() => setCardBreakdownView('categorization')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${cardBreakdownView === 'categorization' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Store Categorization
                </button>
                <button 
                  onClick={() => setCardBreakdownView('individual_store')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${cardBreakdownView === 'individual_store' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Individual Store
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-3 w-10"></th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Margin</th>
                <th className="px-6 py-3 text-right">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {classBreakdown.map(row => {
                const cls = classes.find(c => c.id === row.classId);
                const isExpanded = expandedClasses.has(row.classId);
                const breakdowns = generateMockBreakdown(row);
                
                return (
                  <React.Fragment key={row.classId}>
                    <tr 
                      className="hover:bg-surface-bg transition-colors cursor-pointer"
                      onClick={() => toggleClass(row.classId)}
                    >
                      <td className="px-6 py-4">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium text-text-main">
                        {cls?.name}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-right">
                        <span className="font-medium text-text-main">{formatNumber(row.qty)}</span>
                        <span className="text-text-muted ml-1.5">({formatPct(row.qty, categoryTotals.qty)})</span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-right">
                        <span className="font-medium text-text-main">{formatCurrency(row.margin)}</span>
                        <span className="text-text-muted ml-1.5">({formatPct(row.margin, categoryTotals.margin)})</span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-right">
                        <span className="font-medium text-text-main">{formatCurrency(row.sales)}</span>
                        <span className="text-text-muted ml-1.5">({formatPct(row.sales, categoryTotals.sales)})</span>
                      </td>
                    </tr>
                    
                    {isExpanded && breakdowns.map(bd => (
                      <tr key={bd.id} className="bg-surface-base">
                        <td className="px-6 py-3"></td>
                        <td className="px-6 py-3 pl-8 text-[13px] text-text-muted flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-border-subtle"></div>
                          {bd.label}
                        </td>
                        <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                          {formatNumber(bd.qty)} <span className="opacity-60 ml-1">({formatPct(bd.qty, row.qty)})</span>
                        </td>
                        <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                          {formatCurrency(bd.margin)} <span className="opacity-60 ml-1">({formatPct(bd.margin, row.margin)})</span>
                        </td>
                        <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                          {formatCurrency(bd.sales)} <span className="opacity-60 ml-1">({formatPct(bd.sales, row.sales)})</span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              
              <tr className="bg-surface-bg font-semibold">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-[14px] text-text-main">Category Total</td>
                <td className="px-6 py-4 text-[13px] text-right text-text-main">{formatNumber(categoryTotals.qty)}</td>
                <td className="px-6 py-4 text-[13px] text-right text-text-main">{formatCurrency(categoryTotals.margin)}</td>
                <td className="px-6 py-4 text-[13px] text-right text-text-main">{formatCurrency(categoryTotals.sales)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Card */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border-subtle bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-[16px] font-semibold text-text-main">Performance Trend</h3>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
                <button 
                  onClick={() => setTrendCadence('WEEKLY')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${trendCadence === 'WEEKLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Weekly
                </button>
                <button 
                  onClick={() => setTrendCadence('MONTHLY')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${trendCadence === 'MONTHLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Monthly
                </button>
                <button 
                  onClick={() => setTrendCadence('YEARLY')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${trendCadence === 'YEARLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Yearly
                </button>
              </div>

              <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
                <button 
                  onClick={() => setTrendScope('CATEGORY')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${trendScope === 'CATEGORY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Category-wide
                </button>
                <button 
                  onClick={() => setTrendScope('CLASS')} 
                  className={`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] ${trendScope === 'CLASS' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}`}>
                  Per Class
                </button>
              </div>

              {trendScope === 'CLASS' && (
                <select 
                  value={trendClassId} 
                  onChange={e => setTrendClassId(e.target.value)}
                  className="h-8 px-2 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[12px] text-text-main shadow-sm transition-all min-w-[120px]"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTrendMetric('sales')}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${trendMetric === 'sales' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}`}
              >
                Sales
              </button>
              <button 
                onClick={() => setTrendMetric('margin')}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${trendMetric === 'margin' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}`}
              >
                Margin
              </button>
              <button 
                onClick={() => setTrendMetric('qty')}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${trendMetric === 'qty' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}`}
              >
                Qty
              </button>
            </div>

            {(() => {
              if (displayTrendData.length === 0) return null;
              const latest = displayTrendData[displayTrendData.length - 1];
              const curVal = latest[trendMetric];
              // SPLY property names
              const splyProp = trendMetric === 'sales' ? 'splySales' : trendMetric === 'margin' ? 'splyMargin' : 'splyQty';
              const splyVal = latest[splyProp];
              
              const pctChange = splyVal > 0 ? ((curVal - splyVal) / splyVal) * 100 : 0;
              const isUp = pctChange > 0;
              const Icon = isUp ? TrendingUp : TrendingDown;
              const colorClass = isUp ? 'text-success' : 'text-error';
              const bgClass = isUp ? 'bg-success/10' : 'bg-error/10';
              
              const formatCur = (v) => trendMetric === 'qty' ? formatNumber(v) : formatCurrency(v);
              
              return (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-[14px] font-bold text-text-main">{formatCur(curVal)}</span>
                    <span className="text-[12px] text-text-muted">vs {formatCur(splyVal)} SPLY</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] ${bgClass} ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-[13px] font-bold">{Math.abs(pctChange).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        
        <div className="p-6">
          <div className="h-[300px] w-full">
            {displayTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="periodLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  tickFormatter={formatYAxis} 
                  width={60} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value, name) => {
                    const formatted = trendMetric === 'qty' ? formatNumber(value) : formatCurrency(value);
                    const label = name === trendMetric ? 'Current' : 'SPLY';
                    return [formatted, label];
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle" 
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={trendMetric} 
                  name="Current"
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={{ r: 3, strokeWidth: 2 }} 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={trendMetric === 'sales' ? 'splySales' : trendMetric === 'margin' ? 'splyMargin' : 'splyQty'} 
                  name="SPLY"
                  stroke="#9CA3AF" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px] text-text-muted">
                No transaction trend data is available for this selection.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Family Overlap */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle">
          <h3 className="text-[16px] font-semibold text-text-main">Family Overlap</h3>
          <p className="text-[12px] text-text-muted mt-1">SKU members grouped by derived family overlap ID</p>
        </div>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="sticky top-0 bg-surface-bg z-10">
              <tr className="border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-3">Family Overlap ID</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3 text-right">SKU Members</th>
                <th className="px-6 py-3 text-right">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {familyOverlaps.map(row => (
                <tr key={row.familyId} className="hover:bg-surface-bg transition-colors">
                  <td className="px-6 py-3 text-[13px] font-medium text-brand-600">{row.familyId}</td>
                  <td className="px-6 py-3 text-[13px] text-text-main">{row.brand}</td>
                  <td className="px-6 py-3 text-[13px] text-text-main text-right">{row.members}</td>
                  <td className="px-6 py-3 text-[13px] font-medium text-text-main text-right">{formatCurrency(row.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality Summary */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col gap-4">
        <h3 className="text-[16px] font-semibold text-text-main">Data Quality</h3>
        
        {exceptionCounts ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-green-50 border border-green-200 text-green-800 text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                Clean: {formatNumber(Math.round(exceptionCounts.clean * filterScale))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                For Resolution: {formatNumber(Math.round(exceptionCounts.forResolution * filterScale))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface-bg border border-border-subtle text-text-main text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-border-subtle shrink-0"></div>
                Resolved: {formatNumber(Math.round(exceptionCounts.resolved * filterScale))}
              </div>
            </div>
            <div className="overflow-x-auto border border-border-subtle rounded-[8px]">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-surface-bg text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="px-4 py-2.5">Class</th>
                    <th className="px-4 py-2.5 text-right">Clean</th>
                    <th className="px-4 py-2.5 text-right">For Resolution</th>
                    <th className="px-4 py-2.5 text-right">Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {classQuality.map(row => (
                    <tr key={row.id}>
                      <td className="px-4 py-2.5 text-[12px] font-medium text-text-main">{row.label}</td>
                      <td className="px-4 py-2.5 text-[12px] text-right text-text-main">{Math.round(row.clean * filterScale)}</td>
                      <td className="px-4 py-2.5 text-[12px] text-right text-warning">{Math.round(row.forResolution * filterScale)}</td>
                      <td className="px-4 py-2.5 text-[12px] text-right text-text-muted">{Math.round(row.resolved * filterScale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-text-muted mt-1">Full exception detail available in Exception Dashboard.</p>
          </div>
        ) : (
          <div className="text-[13px] text-text-muted">Loading data quality metrics...</div>
        )}
      </div>

      {/* Brand & Variant Performance */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle">
          <h3 className="text-[16px] font-semibold text-text-main">Brand & Variant Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-3 w-10"></th>
                <th className="px-6 py-3">Brand / Variant</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Margin</th>
                <th className="px-6 py-3 text-right">Sales</th>
                <th className="px-6 py-3 text-right">Share of Brand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {brandRollups.length > 0 ? (
                brandRollups.map(brand => {
                  const isExpanded = expandedBrands.has(brand.brand);
                  
                  return (
                    <React.Fragment key={brand.brand}>
                      <tr 
                        className="hover:bg-surface-bg transition-colors cursor-pointer"
                        onClick={() => toggleBrand(brand.brand)}
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-semibold text-text-main">
                          {brand.brand}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatNumber(Math.round(brand.totalQty * filterScale))}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatCurrency(Math.round(brand.totalMargin * filterScale))}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatCurrency(Math.round(brand.totalSales * filterScale))}
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                      
                      {isExpanded && brand.skuIds.map(skuId => {
                        const variant = skus.find(s => s.id === skuId);
                        if (!variant) return null;
                        
                        // Just reuse sku metrics for this mock
                        const qtyShare = brand.totalQty > 0 ? (variant.qty / brand.totalQty) * 100 : 0;
                        const marginShare = brand.totalMargin > 0 ? (variant.margin / brand.totalMargin) * 100 : 0;
                        const salesShare = brand.totalSales > 0 ? (variant.revenueImpact / brand.totalSales) * 100 : 0;
                        
                        return (
                          <tr key={skuId} className="bg-surface-base">
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3 pl-8 text-[13px] text-text-muted">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-border-subtle shrink-0"></div>
                                <span className="truncate max-w-[250px] block" title={variant.name}>{variant.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              {formatNumber(Math.round(variant.qty * filterScale))}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              {formatCurrency(Math.round(variant.margin * filterScale))}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              {formatCurrency(Math.round(variant.revenueImpact * filterScale))}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              <div className="flex justify-end gap-2 items-center">
                                <span>{salesShare.toFixed(1)}%</span>
                                <div className="w-12 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-600" style={{ width: `${salesShare}%` }}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-text-muted">
                    No brand performance data available for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loyalty & Demographics */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-text-main">Loyalty & Demographics</h3>
            <div className="relative group flex items-center">
              <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-main cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white border border-border-subtle text-text-main text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                Baseline is the % of sales that are loyalty-linked. Capture is the % successfully matched after data-quality issues in stitching. Capture is always a subset of baseline.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[12px] mt-4 pt-4 border-t border-border-subtle shrink-0">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-600 mr-2" /><span className="text-text-muted">Capture</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-50 mr-2" /><span className="text-text-muted">Baseline</span></div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <tbody className="divide-y divide-border-subtle">
              {category && (
                <LoyaltyRow scopeLevel="CATEGORY" scopeId={category.id} title={category.name} />
              )}
              {classes.map(cls => {
                const isExpanded = expandedLoyaltyClasses.has(cls.id);
                const classSkus = skus.filter(s => s.classId === cls.id);
                return (
                  <React.Fragment key={cls.id}>
                    <LoyaltyRow 
                      scopeLevel="CLASS" 
                      scopeId={cls.id} 
                      title={cls.name} 
                      isExpanded={isExpanded} 
                      onToggleExpand={() => toggleLoyaltyClass(cls.id)} 
                      hasChildren={classSkus.length > 0} 
                    />
                    {isExpanded && classSkus.map(sku => (
                      <LoyaltyRow 
                        key={sku.id} 
                        scopeLevel="SKU" 
                        scopeId={sku.id} 
                        title={sku.name} 
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <PortfolioView data={portfolioData} expandedNodes={expandedNodes} onToggle={toggleNode} />
      )}
    </div>
  );
}
