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

export default function IssueSummary() {
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [activeStage, setActiveStage] = useState<StageKey>('Stage A');

  const activeFlags = useMemo(() => stageFlags[activeStage], [activeStage]);
  const activeAnomalies = useMemo(() => stageAnomalies[activeStage], [activeStage]);

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
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 md:p-8">
        <div className="max-w-4xl">
          <h2 className="text-[30px] md:text-[34px] font-bold leading-tight text-brand-700">
            Issue Dashboard
          </h2>

          <div className="mt-4">
            <label className="text-[16px] md:text-[18px] font-semibold text-text-main">
              Time From - Time To
            </label>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="date"
                value={timeFrom}
                onChange={e => setTimeFrom(e.target.value)}
                className="h-10 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all w-full sm:w-[180px]"
              />
              <span className="text-[14px] text-text-muted font-medium">to</span>
              <input
                type="date"
                value={timeTo}
                onChange={e => setTimeTo(e.target.value)}
                className="h-10 px-3 bg-white border border-border-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-[6px] text-[13px] text-text-main shadow-sm transition-all w-full sm:w-[180px]"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[18px] md:text-[20px] font-semibold text-text-main leading-snug">
              Category Breakdown and contributions? (qty/margin/sales)
            </h3>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {stages.map(stage => {
            const isActive = activeStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`h-10 px-4 rounded-[8px] border text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm'
                    : 'bg-white border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-bg'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-[10px] border border-border-subtle overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-border-subtle bg-surface-bg">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`px-3 py-1.5 rounded-[6px] ${stageBadge[activeStage]} text-white text-[12px] font-bold tracking-wide`}>
                {activeStage}
              </div>
              <div className="text-[13px] text-text-muted font-medium">
                relational flags + dataset anomalies
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-[10px] border border-border-subtle bg-surface-bg p-5">
            <h4 className="text-[16px] font-semibold text-text-main mb-3">
              {activeStage} Anomalies
            </h4>
            <div className="space-y-2 text-[14px] md:text-[16px] font-medium text-text-muted">
              {activeFlags.map((flag, index) => (
                <div key={flag} className="pl-4">
                  {index + 1}. {flag}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-border-subtle pt-4">
              <h5 className="text-[12px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                Dataset Only Anomalies
              </h5>
              <div className="space-y-2 text-[13px] text-text-muted">
                {activeAnomalies.map(tag => (
                  <div key={tag} className="rounded-[6px] bg-white border border-border-subtle px-3 py-2">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-border-subtle bg-white p-5 shadow-subtle">
            <h4 className="text-[16px] font-semibold text-text-main mb-3">
              Summary
            </h4>
            <div className="space-y-3 text-[13px] text-text-muted">
              <p>Stage-based dummy dashboard.</p>
              <p>Stage A = Customer DB + Loyalty.</p>
              <p>Stage B = Stage A + MMS Sales.</p>
              <p>Stage C = Stage B + SKU Hierarchy.</p>
              <p>Use these stage layers if you want the exception dashboard to stay compact.</p>
            </div>
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
