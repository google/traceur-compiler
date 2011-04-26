
goog.provide('goog.ui.ContainerRenderer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Separator'); 
goog.require('goog.ui.registry'); 
goog.require('goog.userAgent'); 
goog.ui.ContainerRenderer = function() { }; 
goog.addSingletonGetter(goog.ui.ContainerRenderer); 
goog.ui.ContainerRenderer.getCustomRenderer = function(ctor, cssClassName) { 
  var renderer = new ctor(); 
  renderer.getCssClass = function() { 
    return cssClassName; 
  }; 
  return renderer; 
}; 
goog.ui.ContainerRenderer.CSS_CLASS = goog.getCssName('goog-container'); 
goog.ui.ContainerRenderer.prototype.getAriaRole = function() { 
  return undefined; 
}; 
goog.ui.ContainerRenderer.prototype.enableTabIndex = function(element, enable) { 
  if(element) { 
    element.tabIndex = enable ? 0: - 1; 
  } 
}; 
goog.ui.ContainerRenderer.prototype.createDom = function(container) { 
  return container.getDomHelper().createDom('div', this.getClassNames(container).join(' ')); 
}; 
goog.ui.ContainerRenderer.prototype.getContentElement = function(element) { 
  return element; 
}; 
goog.ui.ContainerRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == 'DIV'; 
}; 
goog.ui.ContainerRenderer.prototype.decorate = function(container, element) { 
  if(element.id) { 
    container.setId(element.id); 
  } 
  var baseClass = this.getCssClass(); 
  var hasBaseClass = false; 
  var classNames = goog.dom.classes.get(element); 
  if(classNames) { 
    goog.array.forEach(classNames, function(className) { 
      if(className == baseClass) { 
        hasBaseClass = true; 
      } else if(className) { 
        this.setStateFromClassName(container, className, baseClass); 
      } 
    }, this); 
  } 
  if(! hasBaseClass) { 
    goog.dom.classes.add(element, baseClass); 
  } 
  this.decorateChildren(container, this.getContentElement(element)); 
  return element; 
}; 
goog.ui.ContainerRenderer.prototype.setStateFromClassName = function(container, className, baseClass) { 
  if(className == goog.getCssName(baseClass, 'disabled')) { 
    container.setEnabled(false); 
  } else if(className == goog.getCssName(baseClass, 'horizontal')) { 
    container.setOrientation(goog.ui.Container.Orientation.HORIZONTAL); 
  } else if(className == goog.getCssName(baseClass, 'vertical')) { 
    container.setOrientation(goog.ui.Container.Orientation.VERTICAL); 
  } 
}; 
goog.ui.ContainerRenderer.prototype.decorateChildren = function(container, element, opt_firstChild) { 
  if(element) { 
    var node = opt_firstChild || element.firstChild, next; 
    while(node && node.parentNode == element) { 
      next = node.nextSibling; 
      if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
        var child = this.getDecoratorForChild((node)); 
        if(child) { 
          child.setElementInternal((node)); 
          if(! container.isEnabled()) { 
            child.setEnabled(false); 
          } 
          container.addChild(child); 
          child.decorate((node)); 
        } 
      } else if(! node.nodeValue || goog.string.trim(node.nodeValue) == '') { 
        element.removeChild(node); 
      } 
      node = next; 
    } 
  } 
}; 
goog.ui.ContainerRenderer.prototype.getDecoratorForChild = function(element) { 
  return(goog.ui.registry.getDecorator(element)); 
}; 
goog.ui.ContainerRenderer.prototype.initializeDom = function(container) { 
  var elem = container.getElement(); 
  goog.style.setUnselectable(elem, true, goog.userAgent.GECKO); 
  if(goog.userAgent.IE) { 
    elem.hideFocus = true; 
  } 
  var ariaRole = this.getAriaRole(); 
  if(ariaRole) { 
    goog.dom.a11y.setRole(elem, ariaRole); 
  } 
}; 
goog.ui.ContainerRenderer.prototype.getKeyEventTarget = function(container) { 
  return container.getElement(); 
}; 
goog.ui.ContainerRenderer.prototype.getCssClass = function() { 
  return goog.ui.ContainerRenderer.CSS_CLASS; 
}; 
goog.ui.ContainerRenderer.prototype.getClassNames = function(container) { 
  var baseClass = this.getCssClass(); 
  var isHorizontal = container.getOrientation() == goog.ui.Container.Orientation.HORIZONTAL; 
  var classNames =[baseClass,(isHorizontal ? goog.getCssName(baseClass, 'horizontal'): goog.getCssName(baseClass, 'vertical'))]; 
  if(! container.isEnabled()) { 
    classNames.push(goog.getCssName(baseClass, 'disabled')); 
  } 
  return classNames; 
}; 
goog.ui.ContainerRenderer.prototype.getDefaultOrientation = function() { 
  return goog.ui.Container.Orientation.VERTICAL; 
}; 
