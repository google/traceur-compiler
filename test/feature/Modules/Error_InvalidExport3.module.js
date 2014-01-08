// Should not compile.
// Error: feature/Modules/Error_InvalidExport3.module.js:4:9: 'c' is not exported by 'feature/Modules/resources/b'

export {c as d} from './resources/b';
