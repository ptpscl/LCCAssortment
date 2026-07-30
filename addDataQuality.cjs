const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const stateCode = `  const [exceptionCounts, setExceptionCounts] = useState<{ clean: number; forResolution: number; resolved: number } | null>(null);`;

if (!file.includes('const [exceptionCounts, setExceptionCounts]')) {
  file = file.replace('const [trendData, setTrendData] = useState<CategoryPerformancePeriod[]>([]);', `const [trendData, setTrendData] = useState<CategoryPerformancePeriod[]>([]);\n${stateCode}`);
}

const effectCode = `
  useEffect(() => {
    async function loadExceptions() {
      if (!category) return;
      const counts = await dataService.getExceptionCounts(category.id);
      setExceptionCounts(counts);
    }
    loadExceptions();
  }, [category]);`;

if (!file.includes('async function loadExceptions()')) {
  file = file.replace('useEffect(() => {\n    async function loadTrend()', `${effectCode}\n\n  useEffect(() => {\n    async function loadTrend()`);
}

const dataQualityJSX = `
      {/* Data Quality Summary */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle p-6 flex flex-col gap-4">
        <h3 className="text-[16px] font-semibold text-text-main">Data Quality</h3>
        
        {exceptionCounts ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-green-50 border border-green-200 text-green-800 text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                Clean: {formatNumber(exceptionCounts.clean)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                For Resolution: {formatNumber(exceptionCounts.forResolution)}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface-bg border border-border-subtle text-text-main text-[13px] font-medium">
                <div className="w-2 h-2 rounded-full bg-border-subtle shrink-0"></div>
                Resolved: {formatNumber(exceptionCounts.resolved)}
              </div>
            </div>
            <p className="text-[13px] text-text-muted mt-1">Full exception detail available in Exception Dashboard.</p>
          </div>
        ) : (
          <div className="text-[13px] text-text-muted">Loading data quality metrics...</div>
        )}
      </div>`;

if (!file.includes('Data Quality Summary')) {
  file = file.replace('    </div>\n  );\n}', `${dataQualityJSX}\n    </div>\n  );\n}`);
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
console.log("Added Data Quality");
