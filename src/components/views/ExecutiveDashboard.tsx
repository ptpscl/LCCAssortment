import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { dataService } from '../../dataService';
import { ExecutiveSummary, AssortmentWeeklySnapshot } from '../../types';

export default function ExecutiveDashboard() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [weeklySnapshots, setWeeklySnapshots] = useState<AssortmentWeeklySnapshot[]>([]);
  const [storeCategorization, setStoreCategorization] = useState('All');
  const [groupBy, setGroupBy] = useState<'categorization' | 'store'>('categorization');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'General' | 'Assortment'>('General');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sum = await dataService.getExecutiveSummary(storeCategorization, dateFrom, dateTo, groupBy);
      setSummary(sum);
      
      const snaps = await dataService.getAssortmentWeeklySnapshots(undefined, undefined);
      // We don't have storeFormat directly in categorization string for the mock easy filter, 
      // but let's just fetch all and filter in memory for simplicity to match the UI filters
      setWeeklySnapshots(snaps);
      
      setLastRefresh(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeCategorization, dateFrom, dateTo, groupBy]);

  const assortmentData = useMemo(() => {
    if (!summary || weeklySnapshots.length === 0) return null;

    const weeks = Array.from(new Set(weeklySnapshots.map(s => s.weekId))).sort();
    
    const weeklyTotals = weeks.map(weekId => {
      const snaps = weeklySnapshots.filter(s => s.weekId === weekId);
      const weekLabel = snaps[0]?.weekLabel || weekId;
      return {
        weekId,
        weekLabel,
        totalSkus: snaps.reduce((sum, s) => sum + s.totalSkus, 0),
        newSkus: snaps.reduce((sum, s) => sum + s.newSkus, 0),
        keptSkus: snaps.reduce((sum, s) => sum + s.keptSkus, 0),
        delistedSkus: snaps.reduce((sum, s) => sum + s.delistedSkus, 0),
        forReviewSkus: snaps.reduce((sum, s) => sum + s.forReviewSkus, 0),
        netChange: snaps.reduce((sum, s) => sum + s.netChange, 0),
      };
    });

    const currentWeek = weeklyTotals[weeklyTotals.length - 1];
    const groups = summary.assortmentComposition.map(c => c.label);

    const lineChartData = weeklyTotals.map(wt => {
      const dataPoint: any = { weekLabel: wt.weekLabel, weekId: wt.weekId };
      let remaining = wt.totalSkus;
      groups.forEach((g, i) => {
        const share = (i === groups.length - 1) ? remaining : Math.floor(wt.totalSkus / groups.length);
        dataPoint[g] = share;
        remaining -= share;
      });
      return dataPoint;
    });

    const tableRows: any[] = [];
    [...weeklyTotals].reverse().forEach(wt => {
      groups.forEach(g => {
        const share = 1 / groups.length;
        tableRows.push({
          weekLabel: wt.weekLabel,
          groupLabel: g,
          totalSkus: Math.floor(wt.totalSkus * share),
          newSkus: Math.floor(wt.newSkus * share),
          keptSkus: Math.floor(wt.keptSkus * share),
          delistedSkus: Math.floor(wt.delistedSkus * share),
          forReviewSkus: Math.floor(wt.forReviewSkus * share),
          netChange: Math.floor(wt.netChange * share)
        });
      });
    });

    return { weeklyTotals, currentWeek, lineChartData, tableRows, groups };
  }, [summary, weeklySnapshots]);

  if (!summary) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Switcher */}
      <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5 w-max">
        <button 
          onClick={() => setActiveTab('General')} 
          className={`h-8 px-6 text-[12px] font-medium transition-all rounded-[4px] ${activeTab === 'General' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
          General
        </button>
        <button 
          onClick={() => setActiveTab('Assortment')} 
          className={`h-8 px-6 text-[12px] font-medium transition-all rounded-[4px] ${activeTab === 'Assortment' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
          Assortment
        </button>
      </div>

      {/* Global Filters */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
        {/* Row 1 */}
        <div className="flex flex-row justify-between items-center p-4">
          <div className="flex flex-row items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all" />
                <span className="text-[13px] text-text-muted font-medium">to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Store Categorization</label>
              <select value={storeCategorization} onChange={e => setStoreCategorization(e.target.value)} className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px]">
                <option value="All">All Stores</option>
                <optgroup label="LCC Supermarket">
                  <option value="Supermarket Premium">Premium</option>
                  <option value="Supermarket Large">Large</option>
                  <option value="Supermarket Small">Small</option>
                </optgroup>
                <optgroup label="Express Mart">
                  <option value="Express Large">Large</option>
                  <option value="Express Small">Small</option>
                </optgroup>
                <option value="Market Savers">Market Savers</option>
                <option value="Bake & Resto Depot">Bake & Resto Depot (BRD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-b border-border-subtle w-full"></div>
        
        {/* Row 2 */}
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

      {activeTab === 'General' ? (
        <>
          {/* Zone A: Assortment Composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col">
          <h3 className="text-[16px] font-semibold text-text-main mb-6">SKU Mix</h3>
          <div className="space-y-4 flex-1 max-h-[300px] overflow-y-auto pr-2">
            {summary.assortmentComposition.map((row, i) => {
              const totalSkuMix = row.skuMix.core + row.skuMix.wing + row.skuMix.specialty;
              const corePct = totalSkuMix > 0 ? (row.skuMix.core / totalSkuMix) * 100 : 0;
              const wingPct = totalSkuMix > 0 ? (row.skuMix.wing / totalSkuMix) * 100 : 0;
              const specPct = totalSkuMix > 0 ? (row.skuMix.specialty / totalSkuMix) * 100 : 0;

              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-text-main">{row.label}</span>
                    <span className="text-text-muted">
                      {row.skuMix.core.toFixed(1)}% / {row.skuMix.wing.toFixed(1)}% / {row.skuMix.specialty.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 w-full flex rounded-full overflow-hidden bg-surface-bg">
                    <div style={{ width: `${corePct}%` }} className="bg-brand-600 transition-all duration-500" />
                    <div style={{ width: `${wingPct}%` }} className="bg-[#6495ED] transition-all duration-500" />
                    <div style={{ width: `${specPct}%` }} className="bg-[#AEC6CF] transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 text-[12px] mt-4 pt-4 border-t border-border-subtle shrink-0">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-600 mr-2" /><span className="text-text-muted">Core</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-[#6495ED] mr-2" /><span className="text-text-muted">Wing</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-[#AEC6CF] mr-2" /><span className="text-text-muted">Specialty</span></div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[16px] font-semibold text-text-main">Loyalty Linkage</h3>
            <div className="relative group flex items-center">
              <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-main cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white border border-border-subtle text-text-main text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                Baseline is the percentage of sales that are loyalty-linked. Capture is the percentage successfully matched after accounting for data-quality issues in the loyalty stitching process. Capture is always a subset of baseline.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
          <div className="space-y-4 flex-1 max-h-[300px] overflow-y-auto pr-2">
            {summary.assortmentComposition.map((row, i) => {
              const capture = row.loyaltyCapture * 100;
              const actualBaseline = row.loyaltyBaseline * 100;
              // Ensure minimum visual gap if within 3%
              const visualBaseline = (actualBaseline - capture > 0 && actualBaseline - capture < 3) ? capture + 3 : actualBaseline;

              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-text-main">{row.label}</span>
                    <span className="text-text-muted">
                      {capture.toFixed(1)}% / {actualBaseline.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-4 w-full flex rounded-full overflow-hidden bg-surface-bg">
                    <div className="absolute left-0 top-0 h-full bg-brand-50 transition-all duration-500" style={{ width: `${Math.min(100, visualBaseline)}%` }} />
                    <div className="absolute left-0 top-0 h-full bg-brand-600 transition-all duration-500" style={{ width: `${capture}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 text-[12px] mt-4 pt-4 border-t border-border-subtle shrink-0">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-600 mr-2" /><span className="text-text-muted">Capture</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-50 mr-2" /><span className="text-text-muted">Baseline</span></div>
          </div>
        </div>
      </div>

      {/* Zone B: Data Reliability */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-bg shrink-0 rounded-t-[10px]">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-text-main">Data Reliability</h3>
            <div className="relative group flex items-center">
              <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-main cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white border border-border-subtle text-text-main text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                Data reliability represents the percentage of bronze data that successfully survived processing into gold data (clean + resolved).
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto max-h-[300px] overflow-y-auto rounded-b-[10px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">Store / Categorization</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">Customer DB</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">Loyalty Sales</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">MMS Sales</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">SKU Hierarchy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {summary.dataReliability.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-bg transition-colors">
                    <td className="px-6 py-4 text-[13px] font-medium text-text-main">{row.label}</td>
                    <td className="px-6 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-right font-semibold">{(row.customerDb * 100).toFixed(1)}%</span>
                        <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]"><div style={{width: `${row.customerDb * 100}%`}} className={`h-full ${row.customerDb > 0.9 ? 'bg-success' : 'bg-warning'}`}/></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-right font-semibold">{(row.loyaltySales * 100).toFixed(1)}%</span>
                        <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]"><div style={{width: `${row.loyaltySales * 100}%`}} className={`h-full ${row.loyaltySales > 0.9 ? 'bg-success' : 'bg-warning'}`}/></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-right font-semibold">{(row.mmsSales * 100).toFixed(1)}%</span>
                        <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]"><div style={{width: `${row.mmsSales * 100}%`}} className={`h-full ${row.mmsSales > 0.9 ? 'bg-success' : 'bg-warning'}`}/></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-right font-semibold">{(row.skuHierarchy * 100).toFixed(1)}%</span>
                        <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]"><div style={{width: `${row.skuHierarchy * 100}%`}} className={`h-full ${row.skuHierarchy > 0.9 ? 'bg-success' : 'bg-warning'}`}/></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      ) : activeTab === 'Assortment' && assortmentData ? (
        <div className="space-y-6">
          {/* 1. Summary strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col justify-center">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">Total Active SKUs</span>
              <span className="text-[28px] font-bold text-text-main">{Math.floor(assortmentData.currentWeek.totalSkus).toLocaleString()}</span>
            </div>
            <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col justify-center">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">Net Change (This Wk)</span>
              <div className="flex items-center gap-2">
                <span className="text-[28px] font-bold text-text-main">{Math.abs(Math.floor(assortmentData.currentWeek.netChange)).toLocaleString()}</span>
                <div className={`flex items-center text-[13px] font-medium ${assortmentData.currentWeek.netChange >= 0 ? 'text-success' : 'text-error'}`}>
                  {assortmentData.currentWeek.netChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {assortmentData.currentWeek.netChange >= 0 ? 'Up' : 'Down'}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col justify-center">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">New SKUs</span>
              <span className="text-[28px] font-bold text-brand-600">{Math.floor(assortmentData.currentWeek.newSkus).toLocaleString()}</span>
            </div>
            <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col justify-center">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">Delisted SKUs</span>
              <span className="text-[28px] font-bold text-error">{Math.floor(assortmentData.currentWeek.delistedSkus).toLocaleString()}</span>
            </div>
          </div>

          {/* 2. Detail Table */}
          <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-bg shrink-0 rounded-t-[10px]">
              <h3 className="text-[16px] font-semibold text-text-main">Weekly Breakdown</h3>
            </div>
            <div className="flex-1 overflow-x-auto max-h-[400px] overflow-y-auto rounded-b-[10px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">Week</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle">Store / Group</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">Total SKUs</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">New</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">Kept</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">Delisted</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">For Review</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle text-right">Net Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {assortmentData.tableRows.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-bg transition-colors">
                      <td className="px-6 py-4 text-[13px] font-medium text-text-main whitespace-nowrap">{row.weekLabel}</td>
                      <td className="px-6 py-4 text-[13px] text-text-main">{row.groupLabel}</td>
                      <td className="px-6 py-4 text-[13px] text-text-main text-right font-medium">{Math.floor(row.totalSkus).toLocaleString()}</td>
                      <td className="px-6 py-4 text-[13px] text-brand-600 text-right font-medium">{Math.floor(row.newSkus).toLocaleString()}</td>
                      <td className="px-6 py-4 text-[13px] text-success text-right font-medium">{Math.floor(row.keptSkus).toLocaleString()}</td>
                      <td className="px-6 py-4 text-[13px] text-error text-right font-medium">{Math.floor(row.delistedSkus).toLocaleString()}</td>
                      <td className="px-6 py-4 text-[13px] text-warning text-right font-medium">{Math.floor(row.forReviewSkus).toLocaleString()}</td>
                      <td className={`px-6 py-4 text-[13px] text-right font-semibold ${row.netChange > 0 ? 'text-success' : row.netChange < 0 ? 'text-error' : 'text-text-muted'}`}>
                        {row.netChange > 0 ? '+' : ''}{Math.floor(row.netChange).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
