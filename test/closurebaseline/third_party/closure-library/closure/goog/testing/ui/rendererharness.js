
goog.provide('goog.testing.ui.RendererHarness'); 
goog.require('goog.Disposable'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.testing.asserts'); 
goog.testing.ui.RendererHarness = function(renderer, renderParent, decorateParent) { 
  goog.Disposable.call(this); 
  this.renderer_ = renderer; 
  this.renderParent_ = renderParent; 
  this.renderHtml_ = renderParent.innerHTML; 
  this.decorateParent_ = decorateParent; 
  this.decorateHtml_ = decorateParent.innerHTML; 
}; 
goog.inherits(goog.testing.ui.RendererHarness, goog.Disposable); 
goog.testing.ui.RendererHarness.prototype.decorateControl_; 
goog.testing.ui.RendererHarness.prototype.renderControl_; 
goog.testing.ui.RendererHarness.prototype.verified_ = false; 
goog.testing.ui.RendererHarness.prototype.attachControlAndRender = function(control) { 
  this.renderControl_ = control; 
  control.setRenderer(this.renderer_); 
  control.render(this.renderParent_); 
  return control.getElement(); 
}; 
goog.testing.ui.RendererHarness.prototype.attachControlAndDecorate = function(control) { 
  this.decorateControl_ = control; 
  control.setRenderer(this.renderer_); 
  var child = this.decorateParent_.firstChild; 
  assertEquals('The decorated node must be an element', goog.dom.NodeType.ELEMENT, child.nodeType); 
  control.decorate((child)); 
  return control.getElement(); 
}; 
goog.testing.ui.RendererHarness.prototype.assertDomMatches = function() { 
  assert('Both elements were not generated', ! !(this.renderControl_ && this.decorateControl_)); 
  assertHTMLEquals('Rendered control and decorated control produced different HTML', this.renderControl_.getElement().innerHTML, this.decorateControl_.getElement().innerHTML); 
  this.verified_ = true; 
}; 
goog.testing.ui.RendererHarness.prototype.disposeInternal = function() { 
  assert('Expected assertDomMatches to be called', this.verified_ || ! this.renderControl_ || ! this.decorateControl_); 
  if(this.decorateControl_) { 
    this.decorateControl_.dispose(); 
  } 
  if(this.renderControl_) { 
    this.renderControl_.dispose(); 
  } 
  this.renderParent_.innerHTML = this.renderHtml_; 
  this.decorateParent_.innerHTML = this.decorateHtml_; 
  goog.testing.ui.RendererHarness.superClass_.disposeInternal.call(this); 
}; 
