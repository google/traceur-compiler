// Should not compile.
// Error: :10:15: 'feature/Modules/m' is not a module

module
'm'
{
  var x = 42;
}

module m from 'm';
