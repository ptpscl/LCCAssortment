const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

if (!file.includes('HelpCircle')) {
  file = file.replace("import { Loader2, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';", "import { Loader2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';");
}

if (!file.includes('LoyaltyProfile')) {
  file = file.replace("BrandRollup } from '../../types';", "BrandRollup, LoyaltyProfile, ScopeLevel } from '../../types';");
}

const loyaltyRowJSX = `
const LoyaltyRow = ({ scopeLevel, scopeId, title, isExpanded, onToggleExpand, hasChildren }: { scopeLevel: ScopeLevel, scopeId: string, title: string, isExpanded?: boolean, onToggleExpand?: () => void, hasChildren?: boolean }) => {
  const [profile, setProfile] = React.useState<LoyaltyProfile | null>(null);
  const [showDemo, setShowDemo] = React.useState(false);

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
    <React.Fragment>
      <tr className="hover:bg-surface-bg transition-colors border-b border-border-subtle last:border-b-0">
        {scopeLevel !== 'CATEGORY' && (
          <td className="px-6 py-4 w-10 cursor-pointer" onClick={onToggleExpand}>
            {hasChildren && (isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />)}
          </td>
        )}
        <td 
          className={\`px-6 py-4 \${scopeLevel === 'CATEGORY' ? 'text-[14px] font-semibold text-text-main' : scopeLevel === 'CLASS' ? 'text-[14px] font-medium text-text-main cursor-pointer' : 'text-[13px] text-text-muted pl-12'}\`} 
          colSpan={scopeLevel === 'CATEGORY' ? 2 : 1} 
          onClick={scopeLevel === 'CATEGORY' ? undefined : onToggleExpand}
        >
          {scopeLevel === 'SKU' ? (
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-border-subtle shrink-0"></div>
              <span className="truncate max-w-[250px] block" title={title}>{title}</span>
            </div>
          ) : title}
        </td>
        <td className="px-6 py-4 w-[400px]">
          <div className="flex flex-col gap-1">
            <div className="relative h-4 w-full flex rounded-full overflow-hidden bg-surface-bg">
              <div className="absolute left-0 top-0 h-full bg-brand-50 transition-all duration-500" style={{ width: \`\${Math.min(100, visualBaseline)}%\` }} />
              <div className="absolute left-0 top-0 h-full bg-brand-600 transition-all duration-500" style={{ width: \`\${capture}%\` }} />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDemo(!showDemo); }}
            className="text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {showDemo ? 'Hide Demographics' : 'View Demographics'}
          </button>
        </td>
      </tr>

      {showDemo && (
        <tr className="bg-surface-base border-b border-border-subtle">
          <td colSpan={scopeLevel === 'CATEGORY' ? 4 : 4} className="px-6 py-6 pl-16">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 max-w-[300px]">
                <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Age Groups</h4>
                <div className="space-y-3">
                  {profile.ageGroups.map(ag => (
                    <div key={ag.label} className="flex items-center gap-3">
                      <span className="text-[12px] text-text-muted w-12 shrink-0">{ag.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: \`\${ag.percent * 100}%\` }}></div>
                      </div>
                      <span className="text-[12px] font-medium text-text-main w-10 text-right">{(ag.percent * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">Gender Split</h4>
                <div className="flex items-center gap-2 text-[13px] text-text-main font-medium">
                  Male {(profile.genderSplit.male * 100).toFixed(0)}% <span className="text-border-subtle font-normal">·</span> Female {(profile.genderSplit.female * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
`;

if (!file.includes('const LoyaltyRow')) {
  file = file.replace('export default function CategoryDashboard() {', `${loyaltyRowJSX}\nexport default function CategoryDashboard() {`);
}

const loyaltyStateCode = `  const [expandedLoyaltyClasses, setExpandedLoyaltyClasses] = useState<Set<string>>(new Set());

  const toggleLoyaltyClass = (classId: string) => {
    setExpandedLoyaltyClasses(prev => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };`;

if (!file.includes('const [expandedLoyaltyClasses, setExpandedLoyaltyClasses]')) {
  file = file.replace('const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());', `const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());\n${loyaltyStateCode}`);
}

const loyaltyJSX = `
      {/* Loyalty & Demographics */}
      <div className="bg-white rounded-[10px] border border-border-subtle shadow-subtle flex flex-col overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-text-main">Loyalty & Demographics</h3>
            <div className="relative group flex items-center">
              <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-main cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white border border-border-subtle text-text-main text-[12px] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                Baseline is the % of sales that are loyalty-linked. Capture is the % successfully matched after data-quality issues in stitching. Capture is always a subset of baseline.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[12px] mt-4 pt-4 border-t border-border-subtle shrink-0">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-600 mr-2" /><span className="text-text-muted">Capture</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-50 mr-2" /><span className="text-text-muted">Baseline</span></div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <tbody className="divide-y divide-border-subtle">
              {category && (
                <LoyaltyRow scopeLevel="CATEGORY" scopeId={category.id} title={category.name} />
              )}
              {classes.map(cls => {
                const isExpanded = expandedLoyaltyClasses.has(cls.id);
                const classSkus = skus.filter(s => s.classId === cls.id);
                return (
                  <React.Fragment key={cls.id}>
                    <LoyaltyRow 
                      scopeLevel="CLASS" 
                      scopeId={cls.id} 
                      title={cls.name} 
                      isExpanded={isExpanded} 
                      onToggleExpand={() => toggleLoyaltyClass(cls.id)} 
                      hasChildren={classSkus.length > 0} 
                    />
                    {isExpanded && classSkus.map(sku => (
                      <LoyaltyRow 
                        key={sku.id} 
                        scopeLevel="SKU" 
                        scopeId={sku.id} 
                        title={sku.name} 
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>`;

if (!file.includes('Loyalty & Demographics')) {
  file = file.replace('    </div>\n  );\n}', `${loyaltyJSX}\n    </div>\n  );\n}`);
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
console.log("Added Loyalty JSX");
