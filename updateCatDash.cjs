const fs = require('fs');
let code = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const portfolioViewCode = `
const PortfolioRow = ({ node, isExpanded, onToggleExpand, level = 0 }: { node: any, isExpanded: boolean, onToggleExpand: () => void, level?: number }) => {
  const isCategory = node.type === 'CATEGORY';
  const hasChildren = !isCategory && node.children && node.children.length > 0;
  
  return (
    <React.Fragment>
      <tr 
        className={\`hover:bg-surface-bg transition-colors cursor-pointer border-b border-border-subtle last:border-b-0 \${level === 0 ? 'bg-white' : level === 1 ? 'bg-surface-base/50' : 'bg-surface-base'}\`}
        onClick={hasChildren ? onToggleExpand : undefined}
      >
        <td className="px-6 py-4 w-10">
          {hasChildren && (isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />)}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: \`\${level * 24}px\` }}>
            {isCategory && <div className="w-1 h-1 rounded-full bg-border-subtle shrink-0"></div>}
            <span className={\`truncate \${level === 0 ? 'font-semibold text-text-main text-[14px]' : level === 1 ? 'font-medium text-text-main text-[14px]' : 'text-text-muted text-[13px]'}\`}>
              {node.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatNumber(node.qty)}
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatCurrency(node.margin)}
        </td>
        <td className="px-6 py-4 text-right text-[13px] font-medium text-text-main">
          {formatCurrency(node.sales)}
        </td>
      </tr>
      {isCategory && (
        <tr className="border-b border-border-subtle last:border-b-0">
           <td className="px-6 py-3 w-10 bg-surface-base"></td>
           <td colSpan={4} className="px-6 py-3 bg-surface-base">
             <div className="pl-6 w-[400px]">
               <LoyaltyBar scopeLevel="CATEGORY" scopeId={node.id} />
             </div>
           </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const LoyaltyBar = ({ scopeLevel, scopeId }: { scopeLevel: ScopeLevel, scopeId: string }) => {
  const [profile, setProfile] = React.useState<LoyaltyProfile | null>(null);

  React.useEffect(() => {
    async function load() {
      const data = await dataService.getLoyaltyProfile(scopeLevel, scopeId);
      setProfile(data);
    }
    load();
  }, [scopeLevel, scopeId]);

  if (!profile) return null;

  const actualBaseline = profile.baseline * 100;
  const capture = profile.capture * 100;
  const visualBaseline = (actualBaseline - capture > 0 && actualBaseline - capture < 3) ? capture + 3 : actualBaseline;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="font-medium text-text-muted">Loyalty Linkage</span>
        <span className="text-text-muted">
          {capture.toFixed(1)}% / {actualBaseline.toFixed(1)}%
        </span>
      </div>
      <div className="relative h-2 w-full flex rounded-full overflow-hidden bg-surface-bg">
        <div className="absolute left-0 top-0 h-full bg-brand-50 transition-all duration-500" style={{ width: \`\${Math.min(100, visualBaseline)}%\` }} />
        <div className="absolute left-0 top-0 h-full bg-brand-600 transition-all duration-500" style={{ width: \`\${capture}%\` }} />
      </div>
    </div>
  );
};

const PortfolioView = ({ data, expandedNodes, onToggle }: { data: any[], expandedNodes: Set<string>, onToggle: (id: string) => void }) => {
  return (
    <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-border-subtle">
        <h3 className="text-[16px] font-semibold text-text-main">Portfolio Rollup</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-bg border-b border-border-subtle text-[12px] font-semibold text-text-muted uppercase tracking-wider">
              <th className="px-6 py-3 w-10"></th>
              <th className="px-6 py-3">Hierarchy</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-right">Margin</th>
              <th className="px-6 py-3 text-right">Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map(div => {
              const divExpanded = expandedNodes.has(div.id);
              return (
                <React.Fragment key={div.id}>
                  <PortfolioRow node={div} isExpanded={divExpanded} onToggleExpand={() => onToggle(div.id)} level={0} />
                  
                  {divExpanded && div.children.map((dep: any) => {
                    const depExpanded = expandedNodes.has(dep.id);
                    return (
                      <React.Fragment key={dep.id}>
                        <PortfolioRow node={dep} isExpanded={depExpanded} onToggleExpand={() => onToggle(dep.id)} level={1} />
                        
                        {depExpanded && dep.children.map((cat: any) => (
                          <PortfolioRow key={cat.id} node={cat} isExpanded={false} onToggleExpand={() => {}} level={2} />
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`;

code = code.replace("export default function CategoryDashboard({ activePersona = 'Pat Cruz' }: { activePersona?: string }) {", portfolioViewCode + "\nexport default function CategoryDashboard({ activePersona = 'Pat Cruz' }: { activePersona?: string }) {");

const toggleJSX = `
      {/* View Toggle */}
      <div className="flex">
        <div className="flex bg-surface-bg p-1 rounded-lg border border-border-subtle inline-flex">
          <button
            onClick={() => setViewMode('CATEGORY')}
            className={\`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors \${
              viewMode === 'CATEGORY' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'
            }\`}
          >
            Category
          </button>
          <div className="relative group flex">
            <button
              onClick={() => {
                if (activePersona !== 'Pat Cruz') setViewMode('PORTFOLIO');
              }}
              disabled={activePersona === 'Pat Cruz'}
              className={\`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-1.5 \${
                viewMode === 'PORTFOLIO' 
                  ? 'bg-white shadow-sm text-text-main' 
                  : activePersona === 'Pat Cruz'
                    ? 'text-text-muted opacity-50 cursor-not-allowed'
                    : 'text-text-muted hover:text-text-main'
              }\`}
            >
              {activePersona === 'Pat Cruz' && <Lock className="w-3.5 h-3.5" />}
              Portfolio
            </button>
            {activePersona === 'Pat Cruz' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 border border-border-subtle text-white text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 text-center">
                Portfolio view is available to Division Managers and above
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>
`;

code = code.replace(
  '<div className="flex flex-col gap-6 pb-12">',
  `<div className="flex flex-col gap-6 pb-12">\n${toggleJSX}\n      {viewMode === 'CATEGORY' ? (\n        <>`
);

code = code.replace(
  '    </div>\n  );\n}',
  `        </>\n      ) : (\n        <PortfolioView data={portfolioData} expandedNodes={expandedNodes} onToggle={toggleNode} />\n      )}\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', code);
