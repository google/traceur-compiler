export function X() {}
X.toJSON = function () { return 'function X'; }

export function Anno(value) {
  this.annotation = true;
  this.value = value;
}

export function Anno2(value) {
  this.annotation2 = true;
  this.value = value;
}
