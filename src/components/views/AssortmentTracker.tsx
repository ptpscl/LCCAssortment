import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { dataService } from '../../dataService';
import { AssortmentTrackerRow, AbArchiveSnapshot, CategorySnapshotMetrics } from '../../types';

export default function AssortmentTracker() {
  const [rows, setRows] = useState<AssortmentTrackerRow[]>([]);
  const [archives, setArchives] = useState<AbArchiveSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Consolidated' | 'Per Division'>('Consolidated');
  const [sortField, setSortField] = useState<'percentUpdated' | 'percentAgreement'>('percentUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>('');
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<Record<string, CategorySnapshotMetrics[]>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // By default all divisions are expanded, this stores collapsed state instead to keep it simple, or expanded state.
  const [collapsedDivisions, setCollapsedDivisions] = useState<Record<string, boolean>>({});
  const [expandedArchives, setExpandedArchives] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await dataService.getAssortmentTrackerRows();
      setRows(data);
      const archivesData = await dataService.getArchiveSnapshots();
      setArchives(archivesData);
      if (archivesData.length > 0) {
        setSelectedArchiveId(archivesData[0].archiveId);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedArchiveId) {
      const fetchDetail = async () => {
        setLoadingDetail(true);
        const groupedData = await dataService.getSnapshotDetail(selectedArchiveId);
        setSelectedArchiveDetail(groupedData);
        setLoadingDetail(false);
      };
      fetchDetail();
    }
  }, [selectedArchiveId]);

  const handleExport = () => {
    // Generate CSV
    const headers = ['Category', 'Division', 'Department', 'Updated As Of', '% Updated', '% Model Agreement', 'Last Updated By'];
    const csvRows = rows.map(r => [
      `"${r.categoryName}"`,
      `"${r.divisionName}"`,
      `"${r.departmentName}"`,
      `"${r.updatedAsOf}"`,
      r.percentUpdated,
      r.percentAgreement,
      `"${r.lastUpdatedBy}"`
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assortment_tracker_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSnapshot = (archive: AbArchiveSnapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    const headers = ['Category', 'Division', 'Department', 'Updated As Of', '% Updated', '% Model Agreement', 'Last Updated By'];
    const csvRows = archive.categorySnapshots.map(r => [
      `"${r.categoryName}"`,
      `"${r.divisionName}"`,
      `"${r.departmentName}"`,
      `"${r.publishedWeekId}"`,
      r.percentUpdated,
      r.percentAgreement,
      `"${r.lastUpdatedBy}"`
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assortment_tracker_${archive.weekId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredArchives = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return archives;
    return archives.filter(archive => {
      return archive.categorySnapshots.some(r => 
        r.categoryName.toLowerCase().includes(term) || r.divisionName.toLowerCase().includes(term)
      );
    });
  }, [archives, searchTerm]);

  const toggleArchive = (archiveId: string) => {
    setExpandedArchives(prev => ({
      ...prev,
      [archiveId]: !prev[archiveId]
    }));
  };

  const toggleSort = (field: 'percentUpdated' | 'percentAgreement') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); // default ascending when switching
    }
  };

  const filteredAndSortedRows = useMemo(() => {
    let result = rows.filter(r => r.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [rows, searchTerm, sortField, sortDirection]);

  const groupedRows = useMemo(() => {
    const flattened = Object.values(selectedArchiveDetail).flat();
    const filtered = flattened.filter(r => 
      r.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      let valA = a[sortField as keyof CategorySnapshotMetrics];
      let valB = b[sortField as keyof CategorySnapshotMetrics];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const groups: Record<string, CategorySnapshotMetrics[]> = {};
    filtered.forEach(r => {
      if (!groups[r.divisionName]) groups[r.divisionName] = [];
      groups[r.divisionName].push(r);
    });
    return groups;
  }, [selectedArchiveDetail, searchTerm, sortField, sortDirection]);

  const toggleDivision = (div: string) => {
    setCollapsedDivisions(prev => ({
      ...prev,
      [div]: !prev[div]
    }));
  };

  const renderSortIndicator = (field: 'percentUpdated' | 'percentAgreement') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline" /> : <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const getUpdatedColor = (val: number) => {
    if (val >= 90) return 'bg-success';
    if (val >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const getAgreementColor = (val: number) => {
    if (val >= 90) return 'bg-success';
    if (val >= 75) return 'bg-warning';
    return 'bg-error';
  };

  const renderRow = (r: CategorySnapshotMetrics | AssortmentTrackerRow) => {
    const updatedAsOf = 'updatedAsOf' in r ? r.updatedAsOf : r.publishedWeekId;
    return (
    <tr key={r.categoryId} className="hover:bg-surface-bg transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-text-main">{r.categoryName}</span>
          <span className="text-[11px] text-text-muted mt-0.5">{r.departmentName}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[13px] text-text-main">{updatedAsOf}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-10 text-right font-semibold text-text-main">{r.percentUpdated.toFixed(1)}%</span>
          <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]">
            <div style={{ width: `${Math.min(100, r.percentUpdated)}%` }} className={`h-full ${getUpdatedColor(r.percentUpdated)}`} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-10 text-right font-semibold text-text-main">{r.percentAgreement.toFixed(1)}%</span>
          <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[50px]">
            <div style={{ width: `${Math.min(100, r.percentAgreement)}%` }} className={`h-full ${getAgreementColor(r.percentAgreement)}`} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[13px] text-text-main">{r.lastUpdatedBy}</td>
    </tr>
    );
  };

  const renderTableHeader = () => (
    <thead className="sticky top-0 bg-white z-10 shadow-sm">
      <tr>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[25%]">Category</th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[15%]">Updated As Of</th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[20%] cursor-pointer hover:text-text-main transition-colors" onClick={() => toggleSort('percentUpdated')}>
          <div className="flex items-center">
            % Updated {renderSortIndicator('percentUpdated')}
          </div>
        </th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[20%] cursor-pointer hover:text-text-main transition-colors" onClick={() => toggleSort('percentAgreement')}>
          <div className="flex items-center">
            % Model Agreement {renderSortIndicator('percentAgreement')}
          </div>
        </th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[20%]">Last Updated By</th>
      </tr>
    </thead>
  );

  const renderDivisionTableHeader = () => (
    <thead className="sticky top-0 bg-white z-10 shadow-sm">
      <tr>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[35%]">Division</th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[15%]">Categories</th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[25%]">% Updated</th>
        <th className="px-6 py-3 text-[12px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle w-[25%]">% Model Agreement</th>
      </tr>
    </thead>
  );

  const renderDivisionRow = (divName: string, categoryCount: number, percentUpdated: number, percentAgreement: number) => (
    <tr key={divName} className="hover:bg-surface-bg transition-colors">
      <td className="px-6 py-4">
        <span className="text-[13px] font-medium text-text-main">{divName}</span>
      </td>
      <td className="px-6 py-4 text-[13px] text-text-main">{categoryCount}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-10 text-right font-semibold text-text-main">{percentUpdated.toFixed(1)}%</span>
          <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[100px]">
            <div style={{ width: `${Math.min(100, percentUpdated)}%` }} className={`h-full ${getUpdatedColor(percentUpdated)}`} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-10 text-right font-semibold text-text-main">{percentAgreement.toFixed(1)}%</span>
          <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden max-w-[100px]">
            <div style={{ width: `${Math.min(100, percentAgreement)}%` }} className={`h-full ${getAgreementColor(percentAgreement)}`} />
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-text-main tracking-tight">Assortment Tracker</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-border-subtle rounded-md text-[13px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-[13px] font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Full Assortment File
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5 w-max">
        <button 
          onClick={() => setActiveTab('Consolidated')} 
          className={`h-8 px-6 text-[12px] font-medium transition-all rounded-[4px] ${activeTab === 'Consolidated' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
          Consolidated
        </button>
        <button 
          onClick={() => setActiveTab('Per Division')} 
          className={`h-8 px-6 text-[12px] font-medium transition-all rounded-[4px] ${activeTab === 'Per Division' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
          Per Division
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'Consolidated' ? (
        <div className="flex flex-col gap-4">
          {loading ? (
             <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-8 text-center text-[13px] text-text-muted">Loading data...</div>
          ) : filteredArchives.length === 0 ? (
             <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-8 text-center text-[13px] text-text-muted">No archives match your search.</div>
          ) : (
             filteredArchives.map(archive => {
                const isExpanded = expandedArchives[archive.archiveId] || searchTerm !== '';
                const archiveDate = new Date(archive.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                // Group by division
                const groupedByDiv: Record<string, CategorySnapshotMetrics[]> = {};
                archive.categorySnapshots.forEach(r => {
                  if (!groupedByDiv[r.divisionName]) groupedByDiv[r.divisionName] = [];
                  groupedByDiv[r.divisionName].push(r);
                });

                const term = searchTerm.toLowerCase();
                const filteredDivisions = Object.entries(groupedByDiv).filter(([divName, divRows]) => {
                  if (!term) return true;
                  if (divName.toLowerCase().includes(term)) return true;
                  return divRows.some(r => r.categoryName.toLowerCase().includes(term));
                });

                const overallUpdated = archive.categorySnapshots.reduce((acc, r) => acc + r.percentUpdated, 0) / archive.categorySnapshots.length || 0;
                const overallAgreement = archive.categorySnapshots.reduce((acc, r) => acc + r.percentAgreement, 0) / archive.categorySnapshots.length || 0;

                return (
                  <div key={archive.archiveId} className="bg-white border border-border-subtle rounded-[10px] shadow-subtle overflow-hidden">
                    <div 
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-surface-bg transition-colors"
                      onClick={() => toggleArchive(archive.archiveId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-text-main">AB as of {archiveDate}</span>
                          <span className="text-[12px] text-text-muted mt-0.5">{archive.weekId}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-surface-bg border border-border-subtle rounded-full text-[11px] font-medium text-text-muted">
                          {archive.categorySnapshots.length} categories
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">% Updated</span>
                            <span className="text-[13px] font-semibold text-text-main">{overallUpdated.toFixed(1)}%</span>
                          </div>
                          <div className="w-16 h-1.5 bg-surface-bg rounded-full overflow-hidden">
                            <div style={{ width: `${Math.min(100, overallUpdated)}%` }} className={`h-full ${getUpdatedColor(overallUpdated)}`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 border-r border-border-subtle pr-6">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">% Agreement</span>
                            <span className="text-[13px] font-semibold text-text-main">{overallAgreement.toFixed(1)}%</span>
                          </div>
                          <div className="w-16 h-1.5 bg-surface-bg rounded-full overflow-hidden">
                            <div style={{ width: `${Math.min(100, overallAgreement)}%` }} className={`h-full ${getAgreementColor(overallAgreement)}`} />
                          </div>
                        </div>
                        <button 
                          onClick={(e) => handleExportSnapshot(archive, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-subtle hover:bg-gray-50 text-text-main rounded-md text-[12px] font-medium transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export
                        </button>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-text-muted" /> : <ChevronUp className="w-5 h-5 text-text-muted" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-border-subtle">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[900px]">
                            {renderDivisionTableHeader()}
                            <tbody className="divide-y divide-border-subtle">
                              {filteredDivisions.map(([divName, divRows]) => {
                                const divUpdated = divRows.reduce((acc, r) => acc + r.percentUpdated, 0) / divRows.length || 0;
                                const divAgreement = divRows.reduce((acc, r) => acc + r.percentAgreement, 0) / divRows.length || 0;
                                return renderDivisionRow(divName, divRows.length, divUpdated, divAgreement);
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
             })
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 w-max">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Select Week</label>
            <select 
              value={selectedArchiveId} 
              onChange={e => setSelectedArchiveId(e.target.value)} 
              className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px] w-max"
            >
              {archives.map(a => {
                const d = new Date(a.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return <option key={a.archiveId} value={a.archiveId}>{`${d} (${a.weekId})`}</option>
              })}
            </select>
          </div>
          
          <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
            {loadingDetail ? (
              <div className="p-8 text-center text-[13px] text-text-muted">Loading data...</div>
            ) : Object.keys(groupedRows).length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">No categories match your search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  {renderTableHeader()}
                  {Object.entries(groupedRows).map(([divName, divRows]) => (
                  <React.Fragment key={divName}>
                    <tbody>
                      <tr 
                        className="bg-surface-bg border-y border-border-subtle cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleDivision(divName)}
                      >
                        <td colSpan={5} className="px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[13px] text-text-main">{divName}</span>
                              <span className="px-2 py-0.5 bg-white border border-border-subtle rounded-full text-[11px] font-medium text-text-muted">
                                {divRows.length} {divRows.length === 1 ? 'category' : 'categories'}
                              </span>
                            </div>
                            {collapsedDivisions[divName] ? (
                              <ChevronDown className="w-4 h-4 text-text-muted" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-text-muted" />
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                    {!collapsedDivisions[divName] && (
                      <tbody className="divide-y divide-border-subtle">
                        {divRows.map(renderRow)}
                      </tbody>
                    )}
                  </React.Fragment>
                ))}
              </table>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
