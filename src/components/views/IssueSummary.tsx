import React, { useMemo, useState } from 'react';

type IssuePage = 'Customer Database' | 'Loyalty Sales' | 'MMS Sales' | 'SKU Hierarchy';

const issuePages: IssuePage[] = ['Customer Database', 'Loyalty Sales', 'MMS Sales', 'SKU Hierarchy'];

const pageAnomalies: Record<IssuePage, string[]> = {
  'Customer Database': [
    'missing_customer_number',
    'duplicate_customer_number',
    'without_province',
    'birthday_invalid',
    'birthday_in_future',
    'birthday_age_over_120',
    'age_invalid',
    'birthday_age_mismatch',
  ],
  'Loyalty Sales': [
    'DUPLICATES',
    'NEGATIVE_QTY',
    'NEGATIVE_LOYALTY_SALES',
  ],
  'MMS Sales': [
    'MMS_NEGATIVE_QTY_OR_SALES',
    'MMS_NEGATIVE_SALES_IN_SALE_TRANSACTION_TYPE',
    'MMS_MISSING_CRITICAL_KEY',
    'MULTIPLE_MMS_6KEY_ROWS',
  ],
  'SKU Hierarchy': [
    'AUTO_DUPLICATE',
    'AUTO_VARIANT',
    'PROMO_FAMILY_MEMBER',
    'PROMO_ORPHAN',
    'CLEAN_UNIQUE',
  ],
};

const pageTitles: Record<IssuePage, string> = {
  'Customer Database': 'Customer Database',
  'Loyalty Sales': 'Loyalty Sales',
  'MMS Sales': 'MMS Sales',
  'SKU Hierarchy': 'SKU Hierarchy',
};

export default function IssueSummary() {
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [activePage, setActivePage] = useState<IssuePage>('Customer Database');

  const currentAnomalies = useMemo(() => pageAnomalies[activePage], [activePage]);

  const customerRows = [
    { relational: 'Clean', rows: '25.55 M', loyalty: '2.52 B', pct: '87.95%', kind: 'good' },
    { relational: 'missing_customer_number', rows: '2.55 M', loyalty: '276.65 M', pct: '9.66%', kind: 'warn' },
    { relational: 'duplicate_customer_number', rows: '394,967', loyalty: '53.79 M', pct: '1.88%', kind: 'warn' },
    { relational: 'without_province', rows: '58,195', loyalty: '6.30 M', pct: '0.22%', kind: 'warn' },
    { relational: 'birthday_invalid', rows: '44,716', loyalty: '5.90 M', pct: '0.21%', kind: 'warn' },
    { relational: 'birthday_in_future', rows: '12,748', loyalty: '1.34 M', pct: '0.05%', kind: 'warn' },
    { relational: 'birthday_age_over_120', rows: '2,555', loyalty: '195,654', pct: '0.01%', kind: 'warn' },
    { relational: 'age_invalid', rows: '2,375', loyalty: '188,693', pct: '0.01%', kind: 'warn' },
    { relational: 'birthday_age_mismatch', rows: '663', loyalty: '-366,747', pct: '0.01%', kind: 'bad' },
  ];

  const loyaltyRows = [
    { relational: 'Clean', dataset: 'CLEAN', rows: '1.98 B', loyalty: '1.77 B', pct: '89.40%', kind: 'good' },
    { relational: 'Duplicate transaction rows', dataset: 'DUPLICATES', rows: '18.4 M', loyalty: '-24.1 M', pct: '0.92%', kind: 'bad' },
    { relational: 'Negative quantity', dataset: 'NEGATIVE_QTY', rows: '12.7 M', loyalty: '8.3 M', pct: '0.63%', kind: 'warn' },
    { relational: 'Negative loyalty sales', dataset: 'NEGATIVE_LOYALTY_SALES', rows: '8.2 M', loyalty: '5.5 M', pct: '0.41%', kind: 'warn' },
  ];
  const mmsRows = [
    { relational: 'Clean', dataset: 'Clean', rows: '13.2 M', sales: '1.82 B', pct: '91.12%', kind: 'good' },
    { relational: 'MMS_NEGATIVE_QTY_OR_SALES', dataset: 'MMS_NEGATIVE_QTY_OR_SALES', rows: '482,194', sales: '-12.4 M', pct: '3.24%', kind: 'bad' },
    { relational: 'MMS_NEGATIVE_SALES_IN_SALE_TRANSACTION_TYPE', dataset: 'MMS_NEGATIVE_SALES_IN_SALE_TRANSACTION_TYPE', rows: '144,088', sales: '-6.8 M', pct: '1.11%', kind: 'bad' },
    { relational: 'MMS_MISSING_CRITICAL_KEY', dataset: 'MMS_MISSING_CRITICAL_KEY', rows: '98,774', sales: '4.2 M', pct: '0.74%', kind: 'warn' },
    { relational: 'MULTIPLE_MMS_6KEY_ROWS', dataset: 'MULTIPLE_MMS_6KEY_ROWS', rows: '66,901', sales: '3.1 M', pct: '0.49%', kind: 'warn' },
  ];
  const skuRows = [
    { relational: 'AUTO_DUPLICATE', dataset: 'AUTO_DUPLICATE', rows: '2.9 M', qty: '681,440', pct: '52.12%', kind: 'warn' },
    { relational: 'AUTO_VARIANT', dataset: 'AUTO_VARIANT', rows: '1.2 M', qty: '304,118', pct: '19.87%', kind: 'warn' },
    { relational: 'PROMO_FAMILY_MEMBER', dataset: 'PROMO_FAMILY_MEMBER', rows: '804,551', qty: '188,016', pct: '14.13%', kind: 'warn' },
    { relational: 'PROMO_ORPHAN', dataset: 'PROMO_ORPHAN', rows: '412,990', qty: '96,883', pct: '7.46%', kind: 'bad' },
    { relational: 'CLEAN_UNIQUE', dataset: 'CLEAN_UNIQUE', rows: '258,633', qty: '64,410', pct: '6.42%', kind: 'good' },
  ];

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

          <div className="mt-6">
            <h3 className="text-[18px] md:text-[20px] font-semibold text-text-main leading-snug">
              Transaction level Issues per Store/Store Categorization
            </h3>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {issuePages.map(page => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`h-10 px-4 rounded-[8px] border text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm'
                    : 'bg-white border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-bg'
                }`}
              >
                {pageTitles[page]}
              </button>
            );
          })}
        </div>

        {activePage === 'Customer Database' ? (
          <div className="mt-5 rounded-[10px] border border-border-subtle overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-border-subtle bg-surface-bg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-[6px] bg-[#A9A9A9] text-white text-[12px] font-bold tracking-wide">
                  CUSTOMER DB
                </div>
                <div className="text-[28px] font-bold text-text-muted leading-none">+</div>
                <div className="px-3 py-1.5 rounded-[6px] bg-[#FF3B3B] text-white text-[12px] font-bold tracking-wide">
                  LOYALTY
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-surface-bg text-[12px] font-semibold text-text-main uppercase tracking-wide">
                    <th className="px-5 py-3">Loyalty Sales + Cust. DB</th>
                    <th className="px-5 py-3 text-right">Rows</th>
                    <th className="px-5 py-3 text-right">Loyalty Sales</th>
                    <th className="px-5 py-3 text-right">% loyalty sales</th>
                  </tr>
                </thead>
                <tbody>
                  {customerRows.map(row => (
                    <tr key={row.relational} className="border-t border-border-subtle">
                      <td className="px-5 py-3 text-[14px] text-text-main">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${row.kind === 'good' ? 'bg-green-500' : row.kind === 'bad' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          {row.relational}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.rows}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.loyalty}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <span>{row.pct}</span>
                          <div className="w-20 h-3 bg-surface-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.kind === 'good' ? 'bg-green-200' : row.kind === 'bad' ? 'bg-red-300' : 'bg-amber-300'}`}
                              style={{ width: row.pct }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activePage === 'Loyalty Sales' ? (
          <div className="mt-5 rounded-[10px] border border-border-subtle overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-border-subtle bg-surface-bg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-[6px] bg-[#4F7CAC] text-white text-[12px] font-bold tracking-wide">
                  LOYALTY SALES
                </div>
                <div className="text-[14px] font-semibold text-text-muted">+</div>
                <div className="px-3 py-1.5 rounded-[6px] bg-[#A9A9A9] text-white text-[12px] font-bold tracking-wide">
                  DATASET FLAGS
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="bg-surface-bg text-[12px] font-semibold text-text-main uppercase tracking-wide">
                    <th className="px-5 py-3">Relational Flag</th>
                    <th className="px-5 py-3">Dataset Flag</th>
                    <th className="px-5 py-3 text-right">Rows</th>
                    <th className="px-5 py-3 text-right">Loyalty Sales</th>
                    <th className="px-5 py-3 text-right">% loyalty sales</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyRows.map(row => (
                    <tr key={row.relational} className="border-t border-border-subtle">
                      <td className="px-5 py-3 text-[14px] text-text-main">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${row.kind === 'good' ? 'bg-green-500' : row.kind === 'bad' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          {row.relational}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[14px] text-text-main font-medium">{row.dataset}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.rows}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.loyalty}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <span>{row.pct}</span>
                          <div className="w-20 h-3 bg-surface-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.kind === 'good' ? 'bg-green-200' : row.kind === 'bad' ? 'bg-red-300' : 'bg-amber-300'}`}
                              style={{ width: row.pct }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activePage === 'MMS Sales' ? (
          <div className="mt-5 rounded-[10px] border border-border-subtle overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-border-subtle bg-surface-bg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-[6px] bg-[#7A5CFA] text-white text-[12px] font-bold tracking-wide">
                  MMS
                </div>
                <div className="text-[14px] font-semibold text-text-muted">+</div>
                <div className="px-3 py-1.5 rounded-[6px] bg-[#A9A9A9] text-white text-[12px] font-bold tracking-wide">
                  DATASET FLAGS
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-surface-bg text-[12px] font-semibold text-text-main uppercase tracking-wide">
                    <th className="px-5 py-3">Relational Flag</th>
                    <th className="px-5 py-3">Dataset Flag</th>
                    <th className="px-5 py-3 text-right">Rows</th>
                    <th className="px-5 py-3 text-right">MMS Sales</th>
                    <th className="px-5 py-3 text-right">% mms sales</th>
                  </tr>
                </thead>
                <tbody>
                  {mmsRows.map(row => (
                    <tr key={row.relational} className="border-t border-border-subtle">
                      <td className="px-5 py-3 text-[14px] text-text-main">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${row.kind === 'good' ? 'bg-green-500' : row.kind === 'bad' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          {row.relational}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[14px] text-text-main font-medium">{row.dataset}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.rows}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.sales}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <span>{row.pct}</span>
                          <div className="w-20 h-3 bg-surface-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.kind === 'good' ? 'bg-green-200' : row.kind === 'bad' ? 'bg-red-300' : 'bg-amber-300'}`}
                              style={{ width: row.pct }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activePage === 'SKU Hierarchy' ? (
          <div className="mt-5 rounded-[10px] border border-border-subtle overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-border-subtle bg-surface-bg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-[6px] bg-[#2F7D32] text-white text-[12px] font-bold tracking-wide">
                  SKU HIERARCHY
                </div>
                <div className="text-[14px] font-semibold text-text-muted">+</div>
                <div className="px-3 py-1.5 rounded-[6px] bg-[#A9A9A9] text-white text-[12px] font-bold tracking-wide">
                  TAGS
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-surface-bg text-[12px] font-semibold text-text-main uppercase tracking-wide">
                    <th className="px-5 py-3">Relational Flag</th>
                    <th className="px-5 py-3">Dataset Flag</th>
                    <th className="px-5 py-3 text-right">Rows</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">% sku</th>
                  </tr>
                </thead>
                <tbody>
                  {skuRows.map(row => (
                    <tr key={row.relational} className="border-t border-border-subtle">
                      <td className="px-5 py-3 text-[14px] text-text-main">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${row.kind === 'good' ? 'bg-green-500' : row.kind === 'bad' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          {row.relational}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[14px] text-text-main font-medium">{row.dataset}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.rows}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">{row.qty}</td>
                      <td className="px-5 py-3 text-[14px] text-right text-text-main font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <span>{row.pct}</span>
                          <div className="w-20 h-3 bg-surface-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.kind === 'good' ? 'bg-green-200' : row.kind === 'bad' ? 'bg-red-300' : 'bg-amber-300'}`}
                              style={{ width: row.pct }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[8px] overflow-hidden border border-border-subtle">
            <div className="flex h-8">
              <div className="w-[38%] bg-[#D8D9DE]" />
              <div className="w-[26%] bg-[#F15A5A]" />
              <div className="w-[18%] bg-[#7EA7FF]" />
              <div className="w-[18%] bg-[#F4C542]" />
            </div>
            <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-surface-bg text-[12px] text-text-muted font-medium">
              <div>Unresolved</div>
              <div>Resolved</div>
              <div>Clean</div>
              <div>Missing</div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-[10px] border border-border-subtle bg-surface-bg p-5">
            <h4 className="text-[16px] font-semibold text-text-main mb-3">
              {activePage} Anomalies
            </h4>
            <div className="space-y-3 text-[18px] md:text-[20px] font-semibold text-text-main leading-snug">
              {currentAnomalies.map((anomaly, index) => (
                <div key={anomaly} className="text-[14px] md:text-[16px] font-medium text-text-muted pl-4">
                  {index + 1}. {anomaly}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-border-subtle bg-white p-5 shadow-subtle">
            <h4 className="text-[16px] font-semibold text-text-main mb-3">
              Summary
            </h4>
            <div className="space-y-3 text-[13px] text-text-muted">
              <p>Dummy exception dashboard page for {activePage}.</p>
              <p>Customer Database uses relational flags plus dataset tags.</p>
              <p>Loyalty Sales uses dataset-only anomaly tags with relational context.</p>
              <p>Each button shows the anomaly list for that layer.</p>
              <p>Replace these placeholders with silver-layer rule outputs when available.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
