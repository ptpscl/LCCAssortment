const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const stateCode = `  const [trendCadence, setTrendCadence] = useState<Cadence>('WEEKLY');
  const [trendScope, setTrendScope] = useState<'CATEGORY' | 'CLASS'>('CATEGORY');
  const [trendClassId, setTrendClassId] = useState<string>('');
  const [trendMetric, setTrendMetric] = useState<'sales' | 'margin' | 'qty'>('sales');
  const [trendData, setTrendData] = useState<CategoryPerformancePeriod[]>([]);`;

if (!file.includes('const [trendCadence, setTrendCadence]')) {
  file = file.replace('const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());', `const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());\n\n${stateCode}`);
}

const effectCode = `
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
  }, [category, trendCadence, trendScope, trendClassId, classes]);`;

if (!file.includes('async function loadTrend()')) {
  file = file.replace('useEffect(() => {', `${effectCode}\n\n  useEffect(() => {`);
}

const formatNumberHelper = `
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return \`\${(val / 1000000).toFixed(1)}M\`;
    if (val >= 1000) return \`\${(val / 1000).toFixed(0)}k\`;
    return val.toString();
  };
`;

if (!file.includes('const formatYAxis')) {
  file = file.replace('const formatPct = ', `${formatNumberHelper}\n  const formatPct = `);
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
console.log("Added state and effect");
