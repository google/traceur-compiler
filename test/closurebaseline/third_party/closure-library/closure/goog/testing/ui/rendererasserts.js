
goog.provide('goog.testing.ui.rendererasserts'); 
goog.require('goog.testing.asserts'); 
goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor = function(rendererClassUnderTest) { 
  var getCssClassCalls = 0; 
  function TestControlRenderer() { 
    rendererClassUnderTest.call(this); 
  } 
  goog.inherits(TestControlRenderer, rendererClassUnderTest); 
  TestControlRenderer.prototype.getCssClass = function() { 
    getCssClassCalls ++; 
    return TestControlRenderer.superClass_.getCssClass.call(this); 
  }; 
  var testControlRenderer = new TestControlRenderer(); 
  assertEquals('Constructors should not call getCssClass, ' + 'getCustomRenderer must be able to override it post construction.', 0, getCssClassCalls); 
}; 
