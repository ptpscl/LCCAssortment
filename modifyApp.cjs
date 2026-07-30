const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [currentView, setCurrentView] = useState<string>('home');",
  "const [currentView, setCurrentView] = useState<string>('home');\n  const [activePersona, setActivePersona] = useState('Pat Cruz');"
);

code = code.replace(
  "<CategoryDashboard />",
  "<CategoryDashboard activePersona={activePersona} />"
);

code = code.replace(
  "<Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={() => setIsAuthenticated(false)} />",
  "<Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={() => setIsAuthenticated(false)} activePersona={activePersona} setActivePersona={setActivePersona} />"
);

fs.writeFileSync('src/App.tsx', code);
