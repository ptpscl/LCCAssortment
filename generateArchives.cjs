const fs = require('fs');
const content = fs.readFileSync('src/mockData.ts', 'utf8');

const replacement = `
const generateMockArchives = () => {
  const archives = [];
  const weeks = ['2026-W24', '2026-W25', '2026-W26', '2026-W27', '2026-W28', '2026-W29'];
  const dates = [
    new Date('2026-06-12T18:00:00Z'),
    new Date('2026-06-19T18:00:00Z'),
    new Date('2026-06-26T18:00:00Z'),
    new Date('2026-07-03T18:00:00Z'),
    new Date('2026-07-10T18:00:00Z'),
    new Date('2026-07-17T18:00:00Z'),
  ];
  
  // Base states for each category
  const catStates = mockCategories.map(c => {
    const dept = mockDepartments.find(d => d.id === c.departmentId);
    const div = mockDivisions.find(d => d.id === dept?.divisionId);
    
    // Healthy vs stale
    const isStale = (c.id === 'cat-3' || c.id === 'cat-6');
    let basePercent = isStale ? 100 : 98 + Math.random() * 2;
    
    return {
      categoryId: c.id,
      categoryName: c.name,
      divisionName: div?.name || 'Unknown',
      departmentName: dept?.name || 'Unknown',
      assignedCm: c.assignedCm,
      isStale,
      currentPercent: basePercent,
      publishedWeekId: weeks[0]
    };
  });

  weeks.forEach((weekId, index) => {
    const snapshots = catStates.map(state => {
      // Fluctuate agreement
      const percentAgreement = 75 + Math.random() * 23;
      
      let lastUpdatedBy = state.assignedCm;
      
      // For stale, they stop updating after a while
      if (state.isStale) {
        if (index > 0) {
          state.currentPercent -= (15 + Math.random() * 10);
        }
      } else {
        // Healthy: Update each week
        state.publishedWeekId = weekId;
        state.currentPercent = 98 + Math.random() * 2;
        if (state.categoryId === 'cat-1' && index % 2 === 0) {
           lastUpdatedBy = 'Backup Admin (Alex Rivers)';
        }
      }

      return {
        categoryId: state.categoryId,
        categoryName: state.categoryName,
        divisionName: state.divisionName,
        departmentName: state.departmentName,
        publishedWeekId: state.publishedWeekId,
        percentUpdated: Math.max(0, state.currentPercent),
        percentAgreement,
        lastUpdatedBy
      };
    });

    archives.unshift({
      archiveId: \`arch-\${index + 1}\`,
      weekId,
      archivedAt: dates[index].toISOString(),
      categorySnapshots: snapshots
    });
  });
  return archives;
};

export const mockAbArchives: AbArchiveSnapshot[] = generateMockArchives();
`;

// Replace from export const mockAbArchives to the end of the array definition
const startStr = "export const mockAbArchives: AbArchiveSnapshot[] = [";
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf("];", startIdx) + 2;

if (startIdx > -1) {
  const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/mockData.ts', newContent);
  console.log('mockData.ts updated');
} else {
  console.log('Could not find mockAbArchives definition');
}
