// Options: --types

var a: any;
var b: boolean;
var s: string;
var v: void;
var n: number;

var named: namespace.type;

class Test {}

function abc(x: Test): Test {
  var a: Test = new Test();
}

function xyz({x, y}: Test) {}

var x = function (a: Test): Test {}

var arr: Array<number>;
var map: Map<number, boolean>;

var f: <T, V extends T>(x: T, y: string = 'str', ...rest: Array<V>) => void;
var C: new <T, V extends T>(x: T, y: string = 'str', ...rest: Array<V>) => void;

var arr2 : number[]
[0, 1];

var o : {};
var o2 : {x; y?; z: number; w?: string};
var o3 : {x(); y?(); z(): number; w?(): string; m<T>(x: T): T};
var o4 : {new ();};
var o5 : {new <T>(x: T) : T;};
var o6 : {arr: T[]};

var i1 : {[x: number] : T; y};
var i2 : {[x: string] : V; y()};

var u1 : number | string;
var u2 : number | string | boolean;
var u3 : number | {x: string | boolean};
