// Options: --strong-mode
// Error: :16:5: In strong mode, binding or assigning to undefined is deprecated
// Error: :17:7: In strong mode, binding or assigning to undefined is deprecated
// Error: :19:12: In strong mode, binding or assigning to undefined is deprecated
// Error: :20:10: In strong mode, binding or assigning to undefined is deprecated
// Error: :21:7: In strong mode, binding or assigning to undefined is deprecated
// Error: :22:11: In strong mode, binding or assigning to undefined is deprecated
// Error: :24:1: In strong mode, binding or assigning to undefined is deprecated
// Error: :25:2: In strong mode, binding or assigning to undefined is deprecated
// Error: :26:3: In strong mode, binding or assigning to undefined is deprecated
// Error: :27:6: In strong mode, binding or assigning to undefined is deprecated
// Error: :28:3: In strong mode, binding or assigning to undefined is deprecated

'use strong';

let undefined;
const undefined = 42;

function f(undefined) {}
function undefined() {}
class undefined {}
(function undefined() {});

undefined => 42;
(undefined) => 42;
([undefined]) => 42;
([...undefined]) => 42;
({undefined}) => 42;

let {undefined: x} = {undefined: 2};
const {undefined: x} = {undefined: 2};

