const fs = require('fs');
const content = fs.readFileSync('src/dataService.ts', 'utf8');

// Replace simulateFridayArchive completely, up to getAssortmentTrackerRows
const replaceStart1 = content.indexOf("simulateFridayArchive: async ()");
const replaceEnd1 = content.indexOf("getAssortmentSnapshots: async", replaceStart1);

const newBlock = `
  getArchiveSnapshots: async (): Promise<AbArchiveSnapshot[]> => {
    await delay(300);
    // return sorted desc
    return [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId));
  },

  getSnapshotDetail: async (archiveId: string) => {
    await delay(300);
    const archive = mockAbArchives.find(a => a.archiveId === archiveId);
    if (!archive) throw new Error('Archive not found');
    const grouped = {};
    archive.categorySnapshots.forEach(snap => {
      if (!grouped[snap.divisionName]) grouped[snap.divisionName] = [];
      grouped[snap.divisionName].push(snap);
    });
    return grouped;
  },

  simulateFridayArchive: async (): Promise<AbArchiveSnapshot> => {
    await delay(800);
    const newWeekId = '2026-W30';
    // Deep copy the latest archive
    const latestArchive = [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId))[0];
    const snapshot = {
      archiveId: \`arch-\${Date.now()}\`,
      weekId: newWeekId,
      archivedAt: new Date().toISOString(),
      categorySnapshots: latestArchive.categorySnapshots.map(c => ({...c}))
    };
    mockAbArchives.push(snapshot);
    return snapshot;
  },

  getAssortmentTrackerRows: async (): Promise<AssortmentTrackerRow[]> => {
    await delay(400);
    const latestArchive = [...mockAbArchives].sort((a, b) => b.weekId.localeCompare(a.weekId))[0];
    if (!latestArchive) return [];
    
    return latestArchive.categorySnapshots.map(snap => ({
      ...snap,
      updatedAsOf: snap.publishedWeekId
    }));
  },

  // Kept for backward compatibility with existing ExecutiveDashboard
  `;

if (replaceStart1 > -1 && replaceEnd1 > -1) {
  const newContent = content.substring(0, replaceStart1) + newBlock.trim() + "\\n\\n  " + content.substring(replaceEnd1);
  fs.writeFileSync('src/dataService.ts', newContent);
  console.log('Fixed dataService.ts');
} else {
  console.log('Could not find replace bounds');
}
