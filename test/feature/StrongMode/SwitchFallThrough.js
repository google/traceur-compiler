// Options: --strong-mode

'use strong';

switch (42) {
  case 1:
    2;
}

switch (42) {
  case 1:
    2;
    break;
  case 3:
    4;
}

(function() {
  switch (42) {
    case 1:
      2;
      return;
    case 3:
      4;
  }
});  // No need to invoke.

while (false) {
  switch (42) {
    case 1:
      2;
      continue;
    case 3:
      4;
  }
}

switch (42) {
  case 1:
    2;
    throw 42;
  case 3:
    4;
}

switch (42) {
  case 1:
  case 2:
    3;
    break;
  case 4:
    5;
}

switch (42) {
  case 1: {
    2;
    break;
  }
  case 3:
    4;
}

switch (42) {
  case 1:
    if (false) {
      break;
    } else {
      break;
    }
  case 3:
    4;
}

(function() {
  switch (42) {
    case 1:
      switch (37) {
        case 2:
          return;
        default:
          throw 55;
      }
    case 3:
      4;
  }
});  // No need to invoke.
