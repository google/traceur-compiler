// Options: --strong-mode
// Error: :13:1: In strong mode, binding or assigning to undefined is deprecated
// Error: :14:1: In strong mode, binding or assigning to undefined is deprecated
// Error: :15:2: In strong mode, binding or assigning to undefined is deprecated
// Error: :16:5: In strong mode, binding or assigning to undefined is deprecated
// Error: :17:6: In strong mode, binding or assigning to undefined is deprecated
// Error: :18:3: In strong mode, binding or assigning to undefined is deprecated
// Error: :19:3: In strong mode, binding or assigning to undefined is deprecated
// Error: :20:1: In strong mode, binding or assigning to undefined is deprecated

'use strong';

undefined = 1;
undefined += 2;
[undefined] = [3];
[...undefined] = [3];
({x: undefined} = {x: 4});
({undefined} = {undefined: 5});
--undefined;
undefined++;
