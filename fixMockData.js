const fs = require('fs');
const content = fs.readFileSync('src/mockData.ts', 'utf8');

const replaceStart = content.indexOf("mockSkuStoreStatuses.push({");
const replaceEnd = content.indexOf("});", replaceStart) + 3;

const replaceStartFull = content.lastIndexOf("const conf = ", replaceStart); // Does not exist
// Let's replace from `mockSkuStoreStatuses.push({` to the end of the block.

// Wait, we also need to change how `confidence` is assigned so we can reuse it.
// Currently it says:
//        confidence: score && score > 0.6 ? 'HIGH' : (score ? 'MEDIUM' : 'LOW'),
