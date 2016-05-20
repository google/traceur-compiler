const g = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : undefined;
g.sideEffect = 1;
