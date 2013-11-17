var ng = {

 directive: function(meta, selector) {
   console.log('directive: ' + selector, meta);
 },
 
 inject: function(meta) {
   console.log('inject: ', meta);
 },

 mapAttr: function(meta, attrName) {
   console.log('mapAttr: ' + attrName, meta);
   return {
     asExpr: function() {
       console.log('asExpr');
     }
   };

 }

};

@ng.directive('[ng-bind]')
class Foo {
 @ng.inject
 constructor(a, b) {
   this.foo = a;
   return
 }
 
 helloWorld() {
   console.log('Hello from ' + this.name);
 }

 @ng.mapAttr('test').asExpr()
 get name() {
   return this.foo;
 }

}

@ng.directive('[ng-bind]')
function abc() {
}

@ng.directive('[ng-bind]')
export class Foo2 {
 @ng.inject
 constructor(a, b) {
   this.foo = 'abc';
   return
 }
 
 @ng.mapAttr('test')
 static helloWorld() {
   console.log('Hello from Foo2');
 }

}

new Foo('abc').helloWorld();
Foo2.helloWorld();

