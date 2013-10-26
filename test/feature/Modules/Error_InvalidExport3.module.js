// Should not compile.
// Error: 4:9: 'c' is not exported by 'feature/Modules/resources/b.js'

export {c as d} from './resources/b.js';
