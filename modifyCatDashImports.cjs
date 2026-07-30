const fs = require('fs');
let code = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

if (!code.includes('Lock')) {
  code = code.replace("HelpCircle } from 'lucide-react';", "HelpCircle, Lock } from 'lucide-react';");
}

code = code.replace(
  "export default function CategoryDashboard() {",
  "export default function CategoryDashboard({ activePersona = 'Pat Cruz' }: { activePersona?: string }) {\n  const [viewMode, setViewMode] = useState<'CATEGORY' | 'PORTFOLIO'>('CATEGORY');\n  const [portfolioData, setPortfolioData] = useState<any[]>([]);\n  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());\n\n  useEffect(() => {\n    if (activePersona === 'Pat Cruz' && viewMode === 'PORTFOLIO') {\n      setViewMode('CATEGORY');\n    }\n  }, [activePersona, viewMode]);\n\n  useEffect(() => {\n    if (viewMode === 'PORTFOLIO') {\n      dataService.getPortfolioRollup().then(setPortfolioData);\n    }\n  }, [viewMode]);\n\n  const toggleNode = (id: string) => {\n    setExpandedNodes(prev => {\n      const next = new Set(prev);\n      if (next.has(id)) next.delete(id);\n      else next.add(id);\n      return next;\n    });\n  };"
);

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', code);
