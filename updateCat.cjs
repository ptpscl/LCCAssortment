const fs = require('fs');

let file = fs.readFileSync('src/components/views/CategoryDashboard.tsx', 'utf8');

if (!file.includes('LineChart')) {
  file = file.replace("import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';", "import { Loader2, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';");
}

if (!file.includes('CategoryPerformancePeriod')) {
  file = file.replace("ClassRecord, SkuRecord, StoreRecord } from '../../types';", "ClassRecord, SkuRecord, StoreRecord, CategoryPerformancePeriod, Cadence } from '../../types';");
}

fs.writeFileSync('src/components/views/CategoryDashboard.tsx', file);
console.log("Updated imports");
