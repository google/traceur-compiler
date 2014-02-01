this.sideEffect = 6;
export var currentSideEffect = function() {
	return this.sideEffect;
}.bind(this);