(function(){

  /**
   * uses work by
   * https://github.com/remy/polyfills/blob/master/classList.js
   * https://github.com/eligrey/classList.js/blob/master/classList.js
   */

  // if we don't even support Element.prototype, quit now
  if(!('Element' in this || !Element.prototype)){
    return;
  }
  var tester = document.createElement('span');

  if(!('classList' in tester)){ // no support at all, polyfill entire API

    // IE8 doesn't have Array.indexOf
    var indexOf = function(list, element){
      for(var i = list.length - 1; i >= 0; i--){
        if(list[i] == element){
          break;
        }
      }
      return i;
    };

    var DOMTokenList = function(element){
      this.element = element;
    };
    DOMTokenList.prototype.contains = function(name){
      var classes = this.element.className.split(/\s+/);
      return indexOf(classes, name) != -1;
    };
    DOMTokenList.prototype.add = function(){
      var classes = this.element.className.split(/\s+/);
      for(var i = arguments.length - 1; i >= 0; i--) {
        var name = arguments[i];
        if(indexOf(classes, name) == -1){
          classes.push(name);
        }
      }
      this.element.className = classes.join(' ');
    };
    DOMTokenList.prototype.remove = function(name){
      var classes = this.element.className.split(/\s+/);
      for(var i = arguments.length - 1; i >= 0; i--) {
        var index = indexOf(classes, name);
        if(index != -1){
          classes.splice(index, 1);
        }
      }
      this.element.className = classes.join(' ');
    };
    DOMTokenList.prototype.toggle = function(name, force){
      var exists = this.contains(name);
      var added = false;
      if(exists){
        if(!force){
          this.remove(name);
        }
      } else {
        if(force !== false){
          this.add(name);
          added = true;
        }
      }
      return (!!force === force) ? force : added;
    };

    if(Object.defineProperty) {
      Object.defineProperty(Element.prototype, 'classList',{
        get : function(){
          return new DOMTokenList(this);
        }
      });
    } else if(Element.prototype.__defineGetter__){
      Element.prototype.__defineGetter__('classList', function(){
        return new DOMTokenList(this);
      });
    }

  } else {  // we have support, just patch methods as needed

    // test and patch multiple argument support
    tester.classList.add('a', 'b');
    if(!tester.classList.contains('b')){
      var methods = ['add', 'remove'];
      var patch = function(definition, method){
        var historic = definition[method];
        definition[method] = function(){
          for(var i = arguments.length - 1; i >= 0; i--){
            var token = arguments[i];
            historic.call(this, token);
          }
        };
      };
      for(var i = methods.length - 1; i >= 0; i--){
        var method = methods[i];
        patch(DOMTokenList.prototype, method);
      }
    }

    // test and patch toggle with force
    tester.classList.toggle('c', false);
    if(tester.classList.contains('c')){
      var historic = DOMTokenList.prototype.toggle;
      DOMTokenList.prototype.toggle = function(token, force){
        if (arguments.length > 0 && this.contains(token) === force) {
          return force;
        }
        return historic.call(this, token);
      };

    }

  }

})();
