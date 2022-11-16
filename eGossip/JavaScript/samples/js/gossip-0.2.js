(function(global) {
    var XD = function(selector, container) {
        return new XD.mth.init(selector, container);
    };
    
    var utils = {
        trim: function(text) {
		    return (text || '').replace( /^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
	    },
        isArray: function(obj) {
		    return Object.prototype.toString.call(obj) === '[object Array]';
	    },
        isFunction: function(obj) {
		    return Object.prototype.toString.call(obj) === '[object Function]';
	    },
        each: function(obj, callback) {
            var length = obj.length,
                isObj = (length === undefined) || this.isFunction(obj);
            if (isObj) {
				for(var name in obj) {
					if(callback.call(obj[name], obj[name], name) === false ) {
						break;
					}
				}
			}
            else {
				for(var i = 0, value = obj[0];
					i < length && callback.call(obj[i], value, i) !== false; value = obj[++i] ) {}
			}
            return obj;
        },
        makeArray: function(arrayLike) {
			if(arrayLike.length != null) {
                return Array.prototype.slice.call(arrayLike, 0)
                             .filter(function(ele) { return ele !== undefined; });
			}
            return [];
		}
    };
    
   function extend(target, source) {
        utils.each(source, function(value, key) {
            target[key] = value;
        });
   }
   
   extend(XD, utils);
   XD.extend = extend;
   XD.props = {
        'for': 'htmlFor',
        'class': 'className',
        readonly: 'readOnly',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        tabindex: 'tabIndex',
        usemap: 'useMap',
        frameborder: 'frameBorder'
    };
   
   XD.mth = XD.prototype = {
       init: function(selector, container) {
           // selector is a node.
           if(selector.nodeType) {
               this[0] = selector;
               this.length = 1;
               return this;
           }
       
           if(container && container[0]) {
               container = container[0];
           }
           else {
               container = document;
           }
           
           var elements = [];
           XD.each(selector.split(','), function(text) {
               text = XD.trim(text);
               if(text.charAt(0) === '#') {
                   elements.push(container.getElementById(text.substring(1)));
               }
               else if(text.charAt(0) === '<') {
                   elements.push(document.createElement(text.substring(1, text.length - 1)));
               }
               else {
                   XD.each(container.getElementsByTagName(text), function(element) {
                       elements.push(element);
                   });
                   
               }
           });
           XD.extend(this, elements);
           this.length = elements.length;
       },
       size: function() {
           return this.length;
       },
       isEmpty: function() {
           return this.length === 0;
       },
       each: function(callback) {
           return XD.each(this, callback);
       },
       html: function(value) {
           if(value === undefined) {
               return this[0] && this[0].nodeType === 1 ?
				        this[0].innerHTML : null;
           }
           else {
               return XD.each(this, function(element) {
                   if(element.nodeType === 1) {
                       element.innerHTML = value;
                   }
               });
           }
       },
       attr: function(name, value) {
           name = XD.props[name] || name;
           if(value === undefined) {
               return this[0] && this[0].nodeType !== 3 && this[0].nodeType !== 8 ?
                        this[0][name] : undefined;
           }
           else {
               return XD.each(this, function(element) {
                   if(element.nodeType !== 3 && element.nodeType !== 8) {
                       element[name] = value;
                   }
               });
           }       
       },
       val: function(value) {
           // currently, this function only deals with input elements
           if(value === undefined) {
               return this[0] && this[0].nodeName === 'INPUT' ? 
                       this[0].value : null;
           }
           else {
               return XD.each(this, function(element) {
                   if(element.nodeName === 'INPUT') {
                       element.value = value;
                   }
               });
           }
       },
       append: function(childs) {
           if(typeof childs === 'string' || childs.nodeType) {
               childs = XD(childs);
           }
           
           if(this.length === 1) { // only one parent node
               var parent = this[0];
               XD.each(childs, function(child) {
                   parent.appendChild(child);
               });
           }
           else if(this.length > 1){ // multiple parent nodes
               XD.each(this, function(parent) {
                   childs.each(function(child) {
                       // copy the node
                       var container = document.createElement('div');
                       container.appendChild(child);
                       container.innerHTML = container.innerHTML;
                       parent.appendChild(container.firstChild);
                   });
               });
           }
           return this;
       },
       remove: function() {
           return XD.each(this, function(element) {
               element.parentNode.removeChild(element);
           });
       }
   };
   
   XD.mth.init.prototype = XD.mth;

   global.XD = XD;
})(this);