// Options: --strong-mode
// Error: :12:12: In strong mode, binding or assigning to undefined is deprecated
// Error: :13:13: In strong mode, binding or assigning to undefined is deprecated
// Error: :14:16: In strong mode, binding or assigning to undefined is deprecated
// Error: :15:13: In strong mode, binding or assigning to undefined is deprecated
// Error: :17:1: In strong mode, binding or assigning to undefined is deprecated
// Error: :18:2: In strong mode, binding or assigning to undefined is deprecated
// Error: :19:3: In strong mode, binding or assigning to undefined is deprecated
// Error: :20:6: In strong mode, binding or assigning to undefined is deprecated
// Error: :21:3: In strong mode, binding or assigning to undefined is deprecated

function f(undefined) { 'use strong'; }
function f([undefined]) { 'use strong'; }
function f([...undefined]) { 'use strong'; }
function f({undefined}) { 'use strong'; }

undefined => { 'use strong'; };
(undefined) => { 'use strong'; };
([undefined]) => { 'use strong'; };
([...undefined]) => { 'use strong'; };
({undefined}) => { 'use strong'; };
