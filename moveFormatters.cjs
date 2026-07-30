const fs = require('fs');
let code = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

const formatters = `
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => val.toLocaleString();
`;

code = code.replace("const CATEGORIZATIONS =", formatters + "\nconst CATEGORIZATIONS =");
code = code.replace("  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);", "");
code = code.replace("  const formatNumber = (val: number) => val.toLocaleString();", "");

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', code);
