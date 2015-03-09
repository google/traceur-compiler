// Options: --strong-mode
// Error: :17:3: Fall through is not allowed in strong mode
// Error: :24:3: Fall through is not allowed in strong mode
// Error: :35:3: Fall through is not allowed in strong mode
// Error: :46:3: Fall through is not allowed in strong mode
// Error: :55:3: Fall through is not allowed in strong mode
// Error: :67:5: Fall through is not allowed in strong mode
// Error: :84:5: Fall through is not allowed in strong mode
// Error: :95:5: Fall through is not allowed in strong mode
// Error: :112:5: Fall through is not allowed in strong mode

'use strong';

switch (42) {
  case 1:
    2;
  case 3:
    4;
}

switch (42) {
  case 1: {
  }
  case 3:
    4;
}

switch (42) {
  case 1:
    if (true) {
      break;
    } else {

    }
  case 3:
    4;
}

switch (42) {
  case 1:
    if (true) {

    } else {
      break;
    }
  case 3:
    4;
}

switch (42) {
  case 1:
    switch (55) {

    }
  case 3:
    4;
}

(function() {
  switch (42) {
    case 1:
      switch (55) {
        case 2:
          return;
        // no default.
      }
    case 3:
      4;
  }
});

(function() {
  switch (42) {
    case 1:
      switch (55) {
        case 2:
          return;
        case 3:
          break;  // does not break out of outer switch.
        default:
          return;

      }
    case 4:
      5;
  }
});

(function() {
  switch (42) {
    case 1:
      return;
    case 2:
      switch (55) {}
    case 3:
      return;
  }
});

(function() {
  switch (42) {
    case 1:
      return;
    case 2:
      switch (55) {
        case 3:
          return;
        default:
          return;
        case 4:
      }
    case 5:
      return;
  }
});
