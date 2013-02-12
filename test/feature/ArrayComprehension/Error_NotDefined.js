// Should not compile.

var array = [for (notDefined of [0]) notDefined];
notDefined;
