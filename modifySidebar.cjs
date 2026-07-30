const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  "interface SidebarProps {\n  currentView: string;\n  onViewChange: (view: string) => void;\n  onLogout: () => void;\n}",
  "interface SidebarProps {\n  currentView: string;\n  onViewChange: (view: string) => void;\n  onLogout: () => void;\n  activePersona?: string;\n  setActivePersona?: (persona: string) => void;\n}"
);

code = code.replace(
  "export default function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {",
  "export default function Sidebar({ currentView, onViewChange, onLogout, activePersona = 'Pat Cruz', setActivePersona }: SidebarProps) {"
);

const footer = `      <div className="p-4 border-t border-border-subtle shrink-0">
        <div 
          className="flex items-center mb-4 cursor-pointer hover:bg-surface-bg p-2 -mx-2 rounded-[8px] transition-colors"
          onClick={() => {
            if (setActivePersona) {
              setActivePersona(activePersona === 'Pat Cruz' ? 'Alex Rivers' : 'Pat Cruz');
            }
          }}
          title="Click to switch persona"
        >
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold text-[13px] mr-3 shrink-0">
            {activePersona === 'Pat Cruz' ? 'PC' : 'AR'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-main truncate">{activePersona}</p>
            <p className="text-[12px] text-text-muted truncate">{activePersona === 'Pat Cruz' ? 'Category Manager' : 'Division Manager'}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center h-10 px-3 rounded-[8px] text-[13px] font-medium text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-3 shrink-0" />
          Logout
        </button>
      </div>`;

code = code.replace(
  /<div className="p-4 border-t border-border-subtle shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*}/m,
  footer + "\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
