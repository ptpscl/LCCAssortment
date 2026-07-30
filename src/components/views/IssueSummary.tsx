import React, { useMemo, useState } from 'react';

type StageKey = 'Stage A' | 'Stage B' | 'Stage C';

const stages: StageKey[] = ['Stage A', 'Stage B', 'Stage C'];

const stageFlags: Record<StageKey, string[]> = {
  'Stage A': ['MATCHED', 'UNMATCHED_CUSTOMER', 'MISSING_CUSTOMER_NUMBER', 'DUPLICATE_CUSTOMER_MATCH'],
  'Stage B': [
    'BOTH_UNDERSTATED',
    'MMS_UNDERSTATED',
    'LOYALTY_ONLY',
    'LOYALTY_UNDERSTATED',
    'NON_LOYALTY',
    'JOINED - Exact/Near Match',
    'JOINED - Mismatch',
    'UNJOINABLE',
    'UNCERTAIN',
  ],
  'Stage C': ['SKU_SALES_MATCHED', 'SKU_SALES_UNMATCHED', 'DROPPED_SKU_TRANSACTION'],
};

const stageAnomalies: Record<StageKey, string[]> = {
  'Stage A': [
    'missing_customer_number',
    'duplicate_customer_number',
    'without_province',
    'birthday_invalid',
    'birthday_in_future',
    'birthday_age_over_120',
    'age_invalid',
    'birthday_age_mismatch',
  ],
  'Stage B': [
    'MMS_NEGATIVE_QTY_OR_SALES',
    'MMS_NEGATIVE_SALES_IN_SALE_TRANSACTION_TYPE',
    'MMS_MISSING_CRITICAL_KEY',
    'MULTIPLE_MMS_6KEY_ROWS',
    'CUSTOMER_BIRTHDAY_AGE_OVER_120',
    'HAS_NEGATIVE_QTY_OR_LOYALTY_SALES',
    'NONE',
  ],
  'Stage C': [
    'AUTO_DUPLICATE',
    'AUTO_VARIANT',
    'PROMO_FAMILY_MEMBER',
    'PROMO_ORPHAN',
    'CLEAN_UNIQUE',
  ],
};

const stageBadge: Record<StageKey, string> = {
  'Stage A': 'bg-[#A9A9A9]',
  'Stage B': 'bg-[#7A5CFA]',
  'Stage C': 'bg-[#2F7D32]',
};

const categorizationIssues = [
  { label: 'Supermarket Premium', unresolved: 18, resolved: 82 },
  { label: 'Supermarket Large', unresolved: 24, resolved: 76 },
  { label: 'Supermarket Small', unresolved: 31, resolved: 69 },
  { label: 'Express Large', unresolved: 27, resolved: 73 },
  { label: 'Express Small', unresolved: 36, resolved: 64 },
  { label: 'Market Savers', unresolved: 22, resolved: 78 },
  { label: 'Bake & Resto Depot', unresolved: 29, resolved: 71 },
];

const storeIssues = [
  { label: 'LCC Legazpi', category: 'Supermarket Premium', unresolved: 16, resolved: 84 },
  { label: 'LCC Daraga', category: 'Supermarket Large', unresolved: 23, resolved: 77 },
  { label: 'LCC Tabaco', category: 'Supermarket Large', unresolved: 28, resolved: 72 },
  { label: 'LCC Naga', category: 'Supermarket Premium', unresolved: 19, resolved: 81 },
  { label: 'LCC Polangui', category: 'Supermarket Small', unresolved: 34, resolved: 66 },
  { label: 'LCC Express Rawis', category: 'Express Large', unresolved: 27, resolved: 73 },
  { label: 'LCC Express Penaranda', category: 'Express Small', unresolved: 38, resolved: 62 },
];

export default function IssueSummary() {
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [activeStage, setActiveStage] = useState<StageKey>('Stage A');
  const [storeCategorization, setStoreCategorization] = useState('All');
  const [store, setStore] = useState('All');
  const [groupBy, setGroupBy] = useState<'categorization' | 'store'>('categorization');

  const activeFlags = useMemo(() => stageFlags[activeStage], [activeStage]);
  const activeAnomalies = useMemo(() => stageAnomalies[activeStage], [activeStage]);
  const issueBreakdown = useMemo(() => {
    if (groupBy === 'categorization') {
      return storeCategorization === 'All'
        ? categorizationIssues
        : categorizationIssues.filter(row => row.label === storeCategorization);
    }

    return storeIssues.filter(row =>
      (storeCategorization === 'All' || row.category === storeCategorization) &&
      (store === 'All' || row.label === store)
    );
  }, [groupBy, store, storeCategorization]);

  const availableStores = useMemo(
    () => storeIssues.filter(row => storeCategorization === 'All' || row.category === storeCategorization),
    [storeCategorization]
  );

  const renderTable = () => {
    if (activeStage === 'Stage A') {
      const rows = [
        ['MATCHED', '24.18 M', '2.10 B', '86.71%'],
        ['UNMATCHED_CUSTOMER', '2.11 M', '240.11 M', '9.91%'],
        ['MISSING_CUSTOMER_NUMBER', '351,992', '41.77 M', '1.72%'],
        ['DUPLICATE_CUSTOMER_MATCH', '58,195', '6.30 M', '0.22%'],
      ];
      return (
        <StageTable
          title="Customer Database + Loyalty"
          accent="bg-[#A9A9A9]"
          headers={['Relational Flag', 'Rows', 'Loyalty Sales', '% loyalty sales']}
          rows={rows.map(([flag, rows, loyaltySales, pct]) => ({
            key: flag,
            cells: [flag, rows, loyaltySales, pct],
            tone: flag === 'MATCHED' ? 'good' : 'warn',
          }))}
        />
      );
    }

    if (activeStage === 'Stage B') {
      const rows = [
        ['BOTH_UNDERSTATED', '514,202', '-9.2 M', '3.31%'],
        ['MMS_UNDERSTATED', '144,088', '-6.8 M', '1.11%'],
        ['LOYALTY_ONLY', '1.89 M', '1.24 B', '63.18%'],
        ['LOYALTY_UNDERSTATED', '821,441', '460.2 M', '15.28%'],
        ['NON_LOYALTY', '532,110', '0', '17.42%'],
        ['JOINED - Exact/Near Match', '2.22 M', '1.44 B', '91.15%'],
        ['JOINED - Mismatch', '98,774', '4.2 M', '0.74%'],
        ['UNJOINABLE', '66,901', '3.1 M', '0.49%'],
        ['UNCERTAIN', '44,716', '5.9 M', '0.21%'],
      ];
      return (
        <StageTable
          title="Customer DB + Loyalty + MMS Sales"
          accent="bg-[#7A5CFA]"
          headers={['MATCH_STATUS', 'Rows', 'Sales Impact', '%']}
          rows={rows.map(([flag, rows, salesImpact, pct]) => ({
            key: flag,
            cells: [flag, rows, salesImpact, pct],
            tone: flag.includes('Mismatch') || flag === 'UNJOINABLE' || flag === 'UNCERTAIN' || flag.includes('UNDERSTATED') ? 'bad' : flag === 'NON_LOYALTY' ? 'warn' : 'good',
          }))}
        />
      );
    }

    const rows = [
      ['SKU_SALES_MATCHED', '2.12 M', '1.75 B', '89.18%'],
      ['SKU_SALES_UNMATCHED', '258,633', '64.41 M', '6.42%'],
      ['DROPPED_SKU_TRANSACTION', '84,120', '18.02 M', '4.40%'],
    ];
    return (
      <StageTable
        title="Stage B + SKU Hierarchy"
        accent="bg-[#2F7D32]"
        headers={['Relational Flag', 'Rows', 'Sales Impact', '%']}
        rows={rows.map(([flag, rows, salesImpact, pct]) => ({
          key: flag,
          cells: [flag, rows, salesImpact, pct],
          tone: flag === 'SKU_SALES_MATCHED' ? 'good' : flag === 'DROPPED_SKU_TRANSACTION' ? 'bad' : 'warn',
        }))}
      />
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5 w-max">
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`h-8 px-6 text-[12px] font-medium transition-all rounded-[4px] ${
              activeStage === stage ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col">
        <div className="flex flex-row justify-between items-center p-4">
          <div className="flex flex-row items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={timeFrom}
                  onChange={e => setTimeFrom(e.target.value)}
                  className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all"
                />
                <span className="text-[13px] text-text-muted font-medium">to</span>
                <input
                  type="date"
                  value={timeTo}
                  onChange={e => setTimeTo(e.target.value)}
                  className="h-9 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Store Categorization</label>
              <select
                value={storeCategorization}
                onChange={e => {
                  setStoreCategorization(e.target.value);
                  setStore('All');
                }}
                className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px]"
              >
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Store</label>
              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px]"
              >
                <option value="All">All Stores</option>
                {availableStores.map(row => (
                  <option key={row.label} value={row.label}>{row.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Stage Scope</label>
              <select
                value={activeStage}
                onChange={e => setActiveStage(e.target.value as StageKey)}
                className="h-9 px-3 pr-8 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all min-w-[180px]"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-b border-border-subtle w-full" />

        <div className="p-4 pt-5 flex items-center gap-4">
          <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Group By</label>
          <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
            <button
              onClick={() => setGroupBy('categorization')}
              className={`h-8 px-4 text-[12px] font-medium transition-all rounded-[4px] ${groupBy === 'categorization' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              Categorization
            </button>
            <button
              onClick={() => setGroupBy('store')}
              className={`h-8 px-4 text-[12px] font-medium transition-all rounded-[4px] ${groupBy === 'store' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              Store
            </button>
          </div>
          <div className="text-[12px] text-text-muted">
            {groupBy === 'categorization' ? 'Grouped by store categorization' : 'Grouped by store'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-[16px] font-semibold text-text-main">Transaction Level Issues</h3>
            <p className="text-[12px] text-text-muted mt-1">
              Per {groupBy === 'categorization' ? 'Store Categorization' : 'Store'} · {activeStage}
            </p>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-text-muted">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#A9B7FF]" />Unresolved</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#FF3347]" />Resolved + Clean</span>
          </div>
        </div>
        <div className="space-y-4">
          {issueBreakdown.map(row => (
            <div key={row.label} className="grid grid-cols-1 md:grid-cols-[190px_1fr_88px] gap-2 md:gap-4 md:items-center">
              <span className="text-[12px] font-medium text-text-main truncate" title={row.label}>{row.label}</span>
              <div className="h-5 flex overflow-hidden rounded-[3px] bg-surface-bg">
                <div className="bg-[#A9B7FF] transition-all duration-500" style={{ width: `${row.unresolved}%` }} />
                <div className="bg-[#FF3347] transition-all duration-500" style={{ width: `${row.resolved}%` }} />
              </div>
              <span className="text-[12px] text-text-muted md:text-right">{row.unresolved}% open</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-bg">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-semibold text-text-main">{activeStage}</h3>
            <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold tracking-wider rounded border text-white ${stageBadge[activeStage]}`}>
              RELATIONAL FLAGS + DATASET ANOMALIES
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col">
          <h3 className="text-[16px] font-semibold text-text-main mb-4">{activeStage} Flags</h3>
          <div className="space-y-3">
            {activeFlags.map((flag, index) => (
              <div key={flag} className="flex items-center justify-between text-[13px]">
                <span className="text-text-main font-medium">{index + 1}. {flag}</span>
                <span className="text-text-muted">Relational</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col">
          <h3 className="text-[16px] font-semibold text-text-main mb-4">Dataset Anomalies</h3>
          <div className="space-y-3">
            {activeAnomalies.map(tag => (
              <div key={tag} className="rounded-[8px] border border-border-subtle bg-surface-bg px-4 py-3 text-[13px] text-text-main font-medium">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageTable({
  title,
  accent,
  headers,
  rows,
}: {
  title: string;
  accent: string;
  headers: string[];
  rows: Array<{ key: string; cells: string[]; tone: 'good' | 'warn' | 'bad' }>;
}) {
  return (
    <table className="w-full text-left border-collapse min-w-[760px]">
      <thead>
        <tr className="bg-surface-bg text-[12px] font-semibold text-text-main uppercase tracking-wide">
          <th className="px-5 py-3">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${accent}`} />
              {title}
            </div>
          </th>
          {headers.slice(1).map(header => (
            <th key={header} className="px-5 py-3 text-right">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.key} className="border-t border-border-subtle">
            <td className="px-5 py-3 text-[14px] text-text-main">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${row.tone === 'good' ? 'bg-green-500' : row.tone === 'bad' ? 'bg-red-500' : 'bg-amber-500'}`} />
                {row.cells[0]}
              </div>
            </td>
            {row.cells.slice(1).map(cell => (
              <td key={cell} className="px-5 py-3 text-[14px] text-right text-text-main font-medium">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
