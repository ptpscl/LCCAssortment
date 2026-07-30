const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const trendJSX = `
      {/* Trend Card */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border-subtle bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-[16px] font-semibold text-text-main">Performance Trend</h3>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
                <button 
                  onClick={() => setTrendCadence('WEEKLY')} 
                  className={\`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] \${trendCadence === 'WEEKLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}\`}>
                  Weekly
                </button>
                <button 
                  onClick={() => setTrendCadence('MONTHLY')} 
                  className={\`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] \${trendCadence === 'MONTHLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}\`}>
                  Monthly
                </button>
                <button 
                  onClick={() => setTrendCadence('YEARLY')} 
                  className={\`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] \${trendCadence === 'YEARLY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}\`}>
                  Yearly
                </button>
              </div>

              <div className="flex bg-surface-bg border border-border-subtle rounded-[6px] overflow-hidden shadow-sm p-0.5">
                <button 
                  onClick={() => setTrendScope('CATEGORY')} 
                  className={\`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] \${trendScope === 'CATEGORY' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}\`}>
                  Category-wide
                </button>
                <button 
                  onClick={() => setTrendScope('CLASS')} 
                  className={\`h-7 px-3 text-[12px] font-medium transition-all rounded-[4px] \${trendScope === 'CLASS' ? 'bg-white text-text-main shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-main'}\`}>
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
                className={\`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors \${trendMetric === 'sales' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}\`}
              >
                Sales
              </button>
              <button 
                onClick={() => setTrendMetric('margin')}
                className={\`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors \${trendMetric === 'margin' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}\`}
              >
                Margin
              </button>
              <button 
                onClick={() => setTrendMetric('qty')}
                className={\`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors \${trendMetric === 'qty' ? 'bg-brand-50 text-brand-600' : 'text-text-muted hover:bg-surface-bg'}\`}
              >
                Qty
              </button>
            </div>

            {(() => {
              if (trendData.length === 0) return null;
              const latest = trendData[trendData.length - 1];
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
                  <div className={\`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] \${bgClass} \${colorClass}\`}>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}`;

if (!file.includes('Performance Trend')) {
  file = file.replace('    </div>\n  );\n}', `${trendJSX}\n}\n`);
  fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
  console.log("Added JSX");
} else {
  console.log("Already added");
}
