const fs = require('fs');
let code = fs.readFileSync('src/dataService.ts', 'utf8');

const getPortfolioRollupCode = `
  getPortfolioRollup: async (): Promise<any[]> => {
    // delay to simulate api
    await new Promise(r => setTimeout(r, 600));
    
    // Create mock data
    const divisions = await dataService.getDivisions();
    const departments = await dataService.getDepartments();
    
    return divisions.map(div => {
      const divDeps = departments.filter(d => d.divisionId === div.id);
      
      const childrenDeps = divDeps.map(dep => {
        const catCount = 3;
        const categories = Array.from({length: catCount}).map((_, i) => ({
          type: 'CATEGORY',
          id: \`\${dep.id}-cat-\${i}\`,
          name: i === 0 && dep.name === 'Dairy' ? 'Milk & Cream' : \`Category \${i+1} (\${dep.name})\`,
          qty: Math.floor(Math.random() * 50000) + 10000,
          margin: Math.floor(Math.random() * 20000) + 5000,
          sales: Math.floor(Math.random() * 100000) + 20000,
        }));
        
        return {
          type: 'DEPARTMENT',
          id: dep.id,
          name: dep.name,
          qty: categories.reduce((sum, c) => sum + c.qty, 0),
          margin: categories.reduce((sum, c) => sum + c.margin, 0),
          sales: categories.reduce((sum, c) => sum + c.sales, 0),
          children: categories
        };
      });
      
      return {
        type: 'DIVISION',
        id: div.id,
        name: div.name,
        qty: childrenDeps.reduce((sum, d) => sum + d.qty, 0),
        margin: childrenDeps.reduce((sum, d) => sum + d.margin, 0),
        sales: childrenDeps.reduce((sum, d) => sum + d.sales, 0),
        children: childrenDeps
      };
    });
  },`;

code = code.replace(
  "getLoyaltyProfile: async",
  getPortfolioRollupCode + "\n\n  getLoyaltyProfile: async"
);

fs.writeFileSync('src/dataService.ts', code);
