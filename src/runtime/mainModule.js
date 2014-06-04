
var hitOrMiss [
	function() { return 1; },
	fucntion() { throw new Error("2")}
];

Promise.all(hitOrMiss.map((fnc) => {
		return fnc();
})).then((val) => {
	console.log('value ', val);
}).catch((ex) => console.error(ex.stack || ex));