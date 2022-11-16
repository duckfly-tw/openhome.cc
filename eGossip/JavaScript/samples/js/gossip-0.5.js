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
		},
        screen: function() {
            return {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            };
        },
        window: function() {
            var xywh = {};
            if(window.screenX) {
                 xywh.x = window.screenX;
                 xywh.y = window.screenY;
            }
            else if(window.screenLeft) {
                xywh.x = window.screenLeft;
                xywh.y = window.screenTop;
            }
            
            if(window.outerWidth) {
                xywh.width = window.outerWidth;
                xywh.height = window.outerHeight;
            }
            else if(document.documentElement.offsetWidth) {
                xywh.width = document.documentElement.offsetWidth;
                xywh.height = document.documentElement.offsetHeight;
            }
            else if(document.body.offsetWidth) {
                xywh.width = document.body.offsetWidth;
                xywh.height = document.body.offsetHeight;
            }
            return xywh;
        },
        viewport: function() {
            var wh = {};
            if(window.innerWidth) {
                wh.width = window.innerWidth;
                        wh.height = window.innerHeight;
            }
            else if(document.documentElement.clientWidth) {
                wh.width = document.documentElement.clientWidth;
                wh.height = document.documentElement.clientHeight;
            }
            else if(document.body.clientWidth) {
                wh.width = document.body.clientWidth;
                wh.height = document.body.clientHeight;
            }
            return wh;            
        },
        scroll: function() {
            var xy = {};
            if(window.pageXOffset) {
                xy.x = window.pageXOffset;
                xy.y = window.pageYOffset;
            }
            else if(document.documentElement.srollLeft) {
                xy.x = document.documentElement.srollLeft;
                xy.y = document.documentElement.srollTop;
            }
            else if(document.body.srollLeft) {
                xy.x = document.body.srollLeft;
                xy.y = document.body.srollTop;
            }
            return xy;        
        },
        param: function(data) {
            var pairs = [];
            for(var name in data) {
                var pair = encodeURIComponent(name) + '=' + 
                           encodeURIComponent(data[name]);
                pairs.push(pair.replace('/%20/g', '+'));
            }
            return pairs.join('&');
        },
        xhr: window.XMLHttpRequest && 
                      (window.location.protocol !== 'file:' 
                          || !window.ActiveXObject) ?
                       function() {
                           return new XMLHttpRequest();
                       } :
                       function() {
                          try {
                             return new ActiveXObject('Microsoft.XMLHTTP');
                          } catch(e) {
                             throw new Error('XMLHttpRequest not supported');
                          }
                       },
        ajax: function(option) {
            option.header = option.header || {
              'Content-Type':'application/x-www-form-urlencoded'};
            option.callback = option.callback || function() {};
            
            if(!option.url || !option.method) {
                return;
            }
                    
            var request = utils.xhr();
            request.onreadystatechange = function() {
                option.callback.call(request, request);
            };
                    
            var body = null;
            var url = option.url;
            if(option.data) {
                if(option.method === 'POST') {
                    body = utils.param(option.data);
                }
                else {
                    url = option.url + '?' + utils.param(option.data) 
                             + '&time=' + new Date().getTime();
                }
            }
                    
            request.open(option.method, url);
            for(var name in option.header) {
                request.setRequestHeader(name, option.header[name]);
            }
            request.send(body);        
        },
        request: function(method, url, parameters, callback, type) {
            utils.ajax({
                method   : method,
                url      : url,
                data     : parameters,
                callback : function(request) {
                    if(request.readyState === 4) {
                        var result;
                        if(type === 'xml') {
                            result = request.responseXML;
                        }
                        else if(type === 'json') {
                            result = eval(request.responseText);
                        }
                        else {
                            result = request.responseText;
                        }
                        if(callback) {
                            callback(result, request.status, request);
                        }
                    }
                }
            });
        },
        get: function(url, parameters, callback, type) {
            utils.request('GET', url, parameters, callback, type);
        },
        post: function(url, parameters, callback, type) {
            utils.request('POST', url, parameters, callback, type);
        },
        getScript: function(url, callback) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onload = script.onreadystatechange = function() {
                if (!this.readyState ||
                    this.readyState === "loaded" || 
                    this.readyState === "complete") {
                    this.onload = this.onreadystatechange = null;
                    document.getElementsByTagName('head')[0].removeChild(this);
                    if(callback) { 
                        callback();
                    }
                }
            };
                    
            document.getElementsByTagName('head')[0].appendChild(script);
        },
        jsonp: function(option, callbackName) {
            if(!option.url || !callbackName) {
                return;
            }
            var data = option.data || {};
                    
            data[callbackName] = 'XD' + arguments.callee.jsc++;
            window[data[callbackName]] = function(json) {
                option.callback(json);
            };
            var url = option.url + '?' + utils.param(data);
                    
            utils.getScript(url, function() {
                 window[data[callbackName]] = undefined;
                 try {
                     delete window[data[callbackName]];
                 }
                 catch(e) {}
            });        
        }
    };
    
    utils.jsonp.jsc = new Date().getTime();
    
    XD.Event = function(original) {
        if(!this.stopPropagation) {
            return new XD.Event(original);
        }
        this.original = original;
        this.type = original.type;
        this.target = original.target || original.srcElement;
    };
    
    XD.Event.prototype = {
        stopPropagation: function() {
            if(this.original.stopPropagation) {
                this.original.stopPropagation();
            }
            else {
                this.original.cancelBubble = true;
            }
        }
    };
    
    if(document.addEventListener) {
        utils.bind = function(element, eventType, handler) {
            element.addEventListener(eventType, function(event) {
                var result = handler.call(event.currentTarget, XD.Event(event));
                if(result === false) {
                    event.preventDefault();
                }
                return result;
            }, false);
        };
        utils.unbind = function(element, eventType, handler) {
            element.removeEventListener(eventType, handler, false);
        };
    }
    else if(document.attachEvent) {
        utils.bind = function(element, eventType, handler) {
            element.attachEvent('on' + eventType, function() {
                var result = handler.call(element, XD.Event(window.event));
                if(result === false) {
                    window.event.returnValue = false;
                }
                return result;
            });
        };
        utils.unbind = function(element, eventType, handler) {
            element.detachEvent(eventType, handler);
        };
    }
    
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
               if(typeof name === 'string') {
                   return this[0] && this[0].nodeType !== 3 && this[0].nodeType !== 8 ?
                        this[0][name] : undefined;
               }
               else {
                  XD.each(this, function(element) {
                      if(element.nodeType !== 3 && element.nodeType !== 8) {
                          XD.each(name, function(optValue, optName) {
                              optName = XD.props[optName] || optName;
                              element[optName] = optValue;
                          });
                      }
                  });
                  return this; 
               }               
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
           
           if(this.length === 1) {
               var parent = this[0];
               XD.each(childs, function(child) {
                   parent.appendChild(child);
               });
           }
           else if(this.length > 1){
               XD.each(this, function(parent) {
                   childs.each(function(child) {
                       var container = document.createElement('div');
                       container.appendChild(child);
                       container.innerHTML = container.innerHTML;
                       parent.appendChild(container.firstChild);
                   });
               });
           }
           return this;
       },
       appendTo: function(parents) {
           if(typeof parents === 'string' || parents.nodeType) {
               parents = XD(parents);
           }
           return parents.append(this);
       },
       remove: function() {
           return XD.each(this, function(element) {
               element.parentNode.removeChild(element);
           });
       },
       removeChilds: function() {
           return XD.each(this, function(element) {
               var length = element.childNodes.length;
               for(var i = 0; i < length; i++) {
                   element.removeChild(element.firstChild);
               }
           });
       },
       bind: function(eventType, handler) {
           return XD.each(this, function(element) {
               XD.bind(element, eventType, handler);
           });
       },
       unbind: function(eventType, handler) {
           return XD.each(this, function(element) {
               XD.unbind(element, eventType, handler);
           });
       },
       click: function(handler) {
           return this.bind('click', handler);
       },
       blur: function(handler) {
           return this.bind('blur', handler);
       },
       change: function(handler) {
           return this.bind('change', handler);
       },
       keyup: function(handler) {
           return this.bind('keyup', handler);
       },
       css: function(name, value) {
           name = XD.props[name] || name;
           if(value === undefined) {
               if(typeof name === 'string') {
                   if(this[0] && this[0].nodeType !== 3 && this[0].nodeType !== 8) {
                       if(window.getComputedStyle) {
                            return window.getComputedStyle(this[0], null)[name];
                       }
                       else if(this[0].currentStyle) {
                            return this[0].currentStyle[name];
                       }
                       else {
                           return undefined;
                       }                   
                   }
               }
               else {
                  XD.each(this, function(element) {
                      if(element.nodeType !== 3 && element.nodeType !== 8) {
                          XD.each(name, function(optValue, optName) {
                              optName = XD.props[optName] || optName;
                              element.style[optName] = optValue;
                          });
                      }
                  });
                  return this; 
               }               
           }
           else {
               return XD.each(this, function(element) {
                   if(element.nodeType !== 3 && element.nodeType !== 8) {
                       element.style[name] = value;
                   }
               });
           }       
       },
       width: function(value) {
           return this.css('width', value);
       },
       height: function(value) {
           return this.css('height', value);
       },
       offset: function() {
           if(this[0]) {
               var left = 0;
               var top = 0;
               for(var e = this[0]; e; e = e.offsetParent) {
                   left += e.offsetLeft;
                   top += e.offsetTop;
               }

               for(var e = this[0].parentNode; e && e != document.body; e = e.parentNode) {
                   if(e.scrollLeft) {
                       left -= e.scrollLeft;
                   }
                   if(e.scrollTop) {
                       top -= e.scrollTop;
                   }
               }      

               return {
                   left: left,
                   top: top,
                   offsetWidth : this[0].offsetWidth,
                   offsetHeight : this[0].offsetHeight
               };
           }
       },
       hide: function() {
           return XD.each(this, function(element) {
               var elementXD = XD(element);
               element.previousDisplay = elementXD.css('display');
               element.style.display = 'none';
           });
       },
       show: function() {
           return XD.each(this, function(element) {
               var elementXD = XD(element);
               element.style.display = element.previousDisplay || '';
               if(elementXD.css('display') === 'none') {
                   var node = document.createElement(element.nodeName);
                   document.body.appendChild(node);
                   element.style.display = XD(node).css('display');
                   document.body.removeChild(node);
               }
           });
       },
       opacity: function(value) {
            if(value === undefined) {
                var opt = this.css('opacity') || this.css('filter');
                if(opt === '') {
                    return 1;
                }
                if(opt.indexOf('alpha') !== -1)  {
                    return opt.substring(14, opt.length - 1) / 100;
                }
                return parseFloat(opt);
            }
            else {
                return XD.each(this, function(element) {
                    if(XD(element).css('opacity') !== undefined) {
                        element.style.opacity = value;
                    }
                    else {
                        element.style.filter = 
                           'alpha(opacity=' + parseInt(value * 100) + ')';
                    }                           
                });
            }
       },
              fadeIn: function(speed, steps) {
            speed = speed || 5000;
            steps = steps || 10;
            return XD.each(this, function(element) {
                var target = element.previousOpacity || 1;
                delete element.previousOpacity;
                var timeInterval = speed / steps;
                var valueStep = target / steps;
                var opt = 0;
                setTimeout(function next() {
                    opt += valueStep;
                    if(opt < target) {
                        XD(element).opacity(opt);
                        setTimeout(next, timeInterval);
                    }
                    else {
                        XD(element).opacity(target);
                    }
                }, timeInterval);       
            });
       },
       fadeOut: function(speed, steps) {
           speed = speed || 5000;
           steps = steps || 10;
           return XD.each(this, function(element) {
               var elementXD = XD(element);
               element.previousOpacity = elementXD.opacity();
               
               var timeInterval = speed / steps;
               var valueStep = element.previousOpacity / steps;
               
               var opt = element.previousOpacity;
               setTimeout(function next() {
                   opt -= valueStep;
                   if(opt > 0) {
                       elementXD.opacity(opt);
                       setTimeout(next, timeInterval);
                   }
                   else {
                       elementXD.opacity(0);
                   }
               }, timeInterval);       
           });
       },
       hasClass: function(clz) {
           if(this[0]) {
               var clzs = this[0].className;
               if(!clzs) {
                    return false;
               }
               if(clzs === clz) {
                    return true;
               }
               return clzs.search('\\b' + clz + '\\b') !== -1;
           }
           return false;
       },
       addClass: function(clz) {
           return XD.each(this, function(element) {
               if(!XD(element).hasClass(clz)) {
                   if(element.className) {
                       clz = ' ' + clz;
                   }
                   element.className += clz;
               }           
           });
       },
       removeClass: function(clz) {
           return XD.each(this, function(element) {
               element.className = element.className.replace(
                        new RegExp('\\b' + clz + '\\b\\s*', 'g'), '');
           });
       },
       toggleClass: function(clz1, clz2) {
           return XD.each(this, function(element) {
               var elementXD = XD(element);
               if(elementXD.hasClass(clz1)) {
                   elementXD.removeClass(clz1);
                   elementXD.addClass(clz2);
               }
               else if(elementXD.hasClass(clz2)) {
                   elementXD.removeClass(clz2);
                   elementXD.addClass(clz1);
               }
           });
       }
   };  

   XD.mth.init.prototype = XD.mth;

   global.XD = XD;
})(this);
