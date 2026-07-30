const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const brandStateCode = `  const [brandRollups, setBrandRollups] = useState<BrandRollup[]>([]);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());`;

if (!file.includes('const [brandRollups, setBrandRollups]')) {
  file = file.replace('const [exceptionCounts, setExceptionCounts] = useState<{ clean: number; forResolution: number; resolved: number } | null>(null);', `const [exceptionCounts, setExceptionCounts] = useState<{ clean: number; forResolution: number; resolved: number } | null>(null);\n${brandStateCode}`);
}

const effectCode = `
  useEffect(() => {
    async function loadBrandRollups() {
      if (!category) return;
      const data = await dataService.getBrandRollups(category.id);
      // Default sort by sales descending
      const sorted = [...data].sort((a, b) => b.totalSales - a.totalSales);
      setBrandRollups(sorted);
    }
    loadBrandRollups();
  }, [category]);`;

if (!file.includes('async function loadBrandRollups()')) {
  file = file.replace('useEffect(() => {\n    async function loadExceptions()', `${effectCode}\n\n  useEffect(() => {\n    async function loadExceptions()`);
}

const toggleBrandFn = `
  const toggleBrand = (brandId: string) => {
    setExpandedBrands(prev => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  };`;

if (!file.includes('const toggleBrand')) {
  file = file.replace('const toggleClass = (classId: string) => {', `${toggleBrandFn}\n\n  const toggleClass = (classId: string) => {`);
}

const brandJSX = `
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
                  const isExpanded = expandedBrands.has(brand.id);
                  
                  return (
                    <React.Fragment key={brand.id}>
                      <tr 
                        className="hover:bg-surface-bg transition-colors cursor-pointer"
                        onClick={() => toggleBrand(brand.id)}
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-semibold text-text-main">
                          {brand.brandName}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatNumber(brand.totalQty)}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatCurrency(brand.totalMargin)}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-right font-medium text-text-main">
                          {formatCurrency(brand.totalSales)}
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
                              {formatNumber(variant.qty)}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              {formatCurrency(variant.margin)}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              {formatCurrency(variant.revenueImpact)}
                            </td>
                            <td className="px-6 py-3 text-[13px] text-right text-text-muted">
                              <div className="flex justify-end gap-2 items-center">
                                <span>{salesShare.toFixed(1)}%</span>
                                <div className="w-12 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-400" style={{ width: \`\${salesShare}%\` }}></div>
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
      </div>`;

if (!file.includes('Brand & Variant Performance')) {
  file = file.replace('    </div>\n  );\n}', `${brandJSX}\n    </div>\n  );\n}`);
}

if (!file.includes('BrandRollup')) {
  file = file.replace("StoreRecord, CategoryPerformancePeriod, Cadence } from '../../types';", "StoreRecord, CategoryPerformancePeriod, Cadence, BrandRollup } from '../../types';");
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
console.log("Added Brand JSX");
