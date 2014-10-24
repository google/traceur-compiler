// Options: --types

var a : any;
var b : boolean;
var s : string;
var v : void;
var n : number;

var named : namespace.type;

class Test {}

function abc(x : Test) : Test {
  var a : Test = new Test();
}

function xyz({x, y} : Test) {}

var x = function (a : Test) : Test {}

var arr : Array<number>;
var map : Map<number, boolean>;
