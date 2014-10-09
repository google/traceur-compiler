// Error: feature/Modules/Error_ExportStarDuplicateExport.module.js:4:8: Duplicate export. 'a' was previously exported at feature/Modules/Error_ExportStarDuplicateExport.module.js:3:8

export * from './resources/a';
export * from './resources/a2';

assert.equal(1, 2);
