// Should not compile.
// Error: Failed to load 'feature/Modules/resources/no_such_file.js'
// Error: Specified as ./resources/no_such_file.
// Error: Imported by feature/Modules/Error_InvalidModuleDeclaration.
// Error: Normalizes to feature/Modules/resources/no_such_file
// Error: LoaderHooks.locate resolved against base './'


module b from './resources/no_such_file';
