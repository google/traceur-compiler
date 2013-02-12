// Should not compile.

var iter = (for (notDefined of [0]) notDefined);
notDefined;
