// Options: --strong-mode
// Error: :15:7: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :16:15: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :17:10: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :18:3: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :19:11: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :20:14: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :21:14: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :22:16: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :23:18: Empty sub statements are not allowed in strong mode. Please use {} instead.
// Error: :24:18: Empty sub statements are not allowed in strong mode. Please use {} instead.

'use strong'

if (1);
if (1) {} else;
while (0);
do; while (0);
for (; 0;);
for (x in {});
for (x of []);
for (let x; 0;);
for (let x in {});
for (let x of []);
