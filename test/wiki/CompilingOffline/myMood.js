// Example of a module with one export
export function myMood() {
  var timeMod3 = (new Date()).getTime() % 3;
  switch (timeMod3) {
    case 0: return "Zydeco";
    case 1: return "Cajun";
    case 2: return "Reggie";
  }
}
