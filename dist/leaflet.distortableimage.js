// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

!function(){var a={},b={};!function(a,b){function c(a){if("number"==typeof a)return a;var b={};for(var c in a)b[c]=a[c];return b}function d(){this._delay=0,this._endDelay=0,this._fill="none",this._iterationStart=0,this._iterations=1,this._duration=0,this._playbackRate=1,this._direction="normal",this._easing="linear",this._easingFunction=x}function e(){return a.isDeprecated("Invalid timing inputs","2016-03-02","TypeError exceptions will be thrown instead.",!0)}function f(b,c,e){var f=new d;return c&&(f.fill="both",f.duration="auto"),"number"!=typeof b||isNaN(b)?void 0!==b&&Object.getOwnPropertyNames(b).forEach(function(c){if("auto"!=b[c]){if(("number"==typeof f[c]||"duration"==c)&&("number"!=typeof b[c]||isNaN(b[c])))return;if("fill"==c&&-1==v.indexOf(b[c]))return;if("direction"==c&&-1==w.indexOf(b[c]))return;if("playbackRate"==c&&1!==b[c]&&a.isDeprecated("AnimationEffectTiming.playbackRate","2014-11-28","Use Animation.playbackRate instead."))return;f[c]=b[c]}}):f.duration=b,f}function g(a){return"number"==typeof a&&(a=isNaN(a)?{duration:0}:{duration:a}),a}function h(b,c){return b=a.numericTimingToObject(b),f(b,c)}function i(a,b,c,d){return a<0||a>1||c<0||c>1?x:function(e){function f(a,b,c){return 3*a*(1-c)*(1-c)*c+3*b*(1-c)*c*c+c*c*c}if(e<=0){var g=0;return a>0?g=b/a:!b&&c>0&&(g=d/c),g*e}if(e>=1){var h=0;return c<1?h=(d-1)/(c-1):1==c&&a<1&&(h=(b-1)/(a-1)),1+h*(e-1)}for(var i=0,j=1;i<j;){var k=(i+j)/2,l=f(a,c,k);if(Math.abs(e-l)<1e-5)return f(b,d,k);l<e?i=k:j=k}return f(b,d,k)}}function j(a,b){return function(c){if(c>=1)return 1;var d=1/a;return(c+=b*d)-c%d}}function k(a){C||(C=document.createElement("div").style),C.animationTimingFunction="",C.animationTimingFunction=a;var b=C.animationTimingFunction;if(""==b&&e())throw new TypeError(a+" is not a valid value for easing");return b}function l(a){if("linear"==a)return x;var b=E.exec(a);if(b)return i.apply(this,b.slice(1).map(Number));var c=F.exec(a);if(c)return j(Number(c[1]),A);var d=G.exec(a);return d?j(Number(d[1]),{start:y,middle:z,end:A}[d[2]]):B[a]||x}function m(a){return Math.abs(n(a)/a.playbackRate)}function n(a){return 0===a.duration||0===a.iterations?0:a.duration*a.iterations}function o(a,b,c){if(null==b)return H;var d=c.delay+a+c.endDelay;return b<Math.min(c.delay,d)?I:b>=Math.min(c.delay+a,d)?J:K}function p(a,b,c,d,e){switch(d){case I:return"backwards"==b||"both"==b?0:null;case K:return c-e;case J:return"forwards"==b||"both"==b?a:null;case H:return null}}function q(a,b,c,d,e){var f=e;return 0===a?b!==I&&(f+=c):f+=d/a,f}function r(a,b,c,d,e,f){var g=a===1/0?b%1:a%1;return 0!==g||c!==J||0===d||0===e&&0!==f||(g=1),g}function s(a,b,c,d){return a===J&&b===1/0?1/0:1===c?Math.floor(d)-1:Math.floor(d)}function t(a,b,c){var d=a;if("normal"!==a&&"reverse"!==a){var e=b;"alternate-reverse"===a&&(e+=1),d="normal",e!==1/0&&e%2!=0&&(d="reverse")}return"normal"===d?c:1-c}function u(a,b,c){var d=o(a,b,c),e=p(a,c.fill,b,d,c.delay);if(null===e)return null;var f=q(c.duration,d,c.iterations,e,c.iterationStart),g=r(f,c.iterationStart,d,c.iterations,e,c.duration),h=s(d,c.iterations,g,f),i=t(c.direction,h,g);return c._easingFunction(i)}var v="backwards|forwards|both|none".split("|"),w="reverse|alternate|alternate-reverse".split("|"),x=function(a){return a};d.prototype={_setMember:function(b,c){this["_"+b]=c,this._effect&&(this._effect._timingInput[b]=c,this._effect._timing=a.normalizeTimingInput(this._effect._timingInput),this._effect.activeDuration=a.calculateActiveDuration(this._effect._timing),this._effect._animation&&this._effect._animation._rebuildUnderlyingAnimation())},get playbackRate(){return this._playbackRate},set delay(a){this._setMember("delay",a)},get delay(){return this._delay},set endDelay(a){this._setMember("endDelay",a)},get endDelay(){return this._endDelay},set fill(a){this._setMember("fill",a)},get fill(){return this._fill},set iterationStart(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterationStart must be a non-negative number, received: "+a);this._setMember("iterationStart",a)},get iterationStart(){return this._iterationStart},set duration(a){if("auto"!=a&&(isNaN(a)||a<0)&&e())throw new TypeError("duration must be non-negative or auto, received: "+a);this._setMember("duration",a)},get duration(){return this._duration},set direction(a){this._setMember("direction",a)},get direction(){return this._direction},set easing(a){this._easingFunction=l(k(a)),this._setMember("easing",a)},get easing(){return this._easing},set iterations(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterations must be non-negative, received: "+a);this._setMember("iterations",a)},get iterations(){return this._iterations}};var y=1,z=.5,A=0,B={ease:i(.25,.1,.25,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1),"step-start":j(1,y),"step-middle":j(1,z),"step-end":j(1,A)},C=null,D="\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",E=new RegExp("cubic-bezier\\("+D+","+D+","+D+","+D+"\\)"),F=/steps\(\s*(\d+)\s*\)/,G=/steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,H=0,I=1,J=2,K=3;a.cloneTimingInput=c,a.makeTiming=f,a.numericTimingToObject=g,a.normalizeTimingInput=h,a.calculateActiveDuration=m,a.calculateIterationProgress=u,a.calculatePhase=o,a.normalizeEasing=k,a.parseEasingFunction=l}(a),function(a,b){function c(a,b){return a in k?k[a][b]||b:b}function d(a){return"display"===a||0===a.lastIndexOf("animation",0)||0===a.lastIndexOf("transition",0)}function e(a,b,e){if(!d(a)){var f=h[a];if(f){i.style[a]=b;for(var g in f){var j=f[g],k=i.style[j];e[j]=c(j,k)}}else e[a]=c(a,b)}}function f(a){var b=[];for(var c in a)if(!(c in["easing","offset","composite"])){var d=a[c];Array.isArray(d)||(d=[d]);for(var e,f=d.length,g=0;g<f;g++)e={},e.offset="offset"in a?a.offset:1==f?1:g/(f-1),"easing"in a&&(e.easing=a.easing),"composite"in a&&(e.composite=a.composite),e[c]=d[g],b.push(e)}return b.sort(function(a,b){return a.offset-b.offset}),b}function g(b){function c(){var a=d.length;null==d[a-1].offset&&(d[a-1].offset=1),a>1&&null==d[0].offset&&(d[0].offset=0);for(var b=0,c=d[0].offset,e=1;e<a;e++){var f=d[e].offset;if(null!=f){for(var g=1;g<e-b;g++)d[b+g].offset=c+(f-c)*g/(e-b);b=e,c=f}}}if(null==b)return[];window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||(b=f(b));for(var d=b.map(function(b){var c={};for(var d in b){var f=b[d];if("offset"==d){if(null!=f){if(f=Number(f),!isFinite(f))throw new TypeError("Keyframe offsets must be numbers.");if(f<0||f>1)throw new TypeError("Keyframe offsets must be between 0 and 1.")}}else if("composite"==d){if("add"==f||"accumulate"==f)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"add compositing is not supported"};if("replace"!=f)throw new TypeError("Invalid composite mode "+f+".")}else f="easing"==d?a.normalizeEasing(f):""+f;e(d,f,c)}return void 0==c.offset&&(c.offset=null),void 0==c.easing&&(c.easing="linear"),c}),g=!0,h=-1/0,i=0;i<d.length;i++){var j=d[i].offset;if(null!=j){if(j<h)throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");h=j}else g=!1}return d=d.filter(function(a){return a.offset>=0&&a.offset<=1}),g||c(),d}var h={background:["backgroundImage","backgroundPosition","backgroundSize","backgroundRepeat","backgroundAttachment","backgroundOrigin","backgroundClip","backgroundColor"],border:["borderTopColor","borderTopStyle","borderTopWidth","borderRightColor","borderRightStyle","borderRightWidth","borderBottomColor","borderBottomStyle","borderBottomWidth","borderLeftColor","borderLeftStyle","borderLeftWidth"],borderBottom:["borderBottomWidth","borderBottomStyle","borderBottomColor"],borderColor:["borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"],borderLeft:["borderLeftWidth","borderLeftStyle","borderLeftColor"],borderRadius:["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],borderRight:["borderRightWidth","borderRightStyle","borderRightColor"],borderTop:["borderTopWidth","borderTopStyle","borderTopColor"],borderWidth:["borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"],flex:["flexGrow","flexShrink","flexBasis"],font:["fontFamily","fontSize","fontStyle","fontVariant","fontWeight","lineHeight"],margin:["marginTop","marginRight","marginBottom","marginLeft"],outline:["outlineColor","outlineStyle","outlineWidth"],padding:["paddingTop","paddingRight","paddingBottom","paddingLeft"]},i=document.createElementNS("http://www.w3.org/1999/xhtml","div"),j={thin:"1px",medium:"3px",thick:"5px"},k={borderBottomWidth:j,borderLeftWidth:j,borderRightWidth:j,borderTopWidth:j,fontSize:{"xx-small":"60%","x-small":"75%",small:"89%",medium:"100%",large:"120%","x-large":"150%","xx-large":"200%"},fontWeight:{normal:"400",bold:"700"},outlineWidth:j,textShadow:{none:"0px 0px 0px transparent"},boxShadow:{none:"0px 0px 0px 0px transparent"}};a.convertToArrayForm=f,a.normalizeKeyframes=g}(a),function(a){var b={};a.isDeprecated=function(a,c,d,e){var f=e?"are":"is",g=new Date,h=new Date(c);return h.setMonth(h.getMonth()+3),!(g<h&&(a in b||console.warn("Web Animations: "+a+" "+f+" deprecated and will stop working on "+h.toDateString()+". "+d),b[a]=!0,1))},a.deprecated=function(b,c,d,e){var f=e?"are":"is";if(a.isDeprecated(b,c,d,e))throw new Error(b+" "+f+" no longer supported. "+d)}}(a),function(){if(document.documentElement.animate){var c=document.documentElement.animate([],0),d=!0;if(c&&(d=!1,"play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(a){void 0===c[a]&&(d=!0)})),!d)return}!function(a,b,c){function d(a){for(var b={},c=0;c<a.length;c++)for(var d in a[c])if("offset"!=d&&"easing"!=d&&"composite"!=d){var e={offset:a[c].offset,easing:a[c].easing,value:a[c][d]};b[d]=b[d]||[],b[d].push(e)}for(var f in b){var g=b[f];if(0!=g[0].offset||1!=g[g.length-1].offset)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"Partial keyframes are not supported"}}return b}function e(c){var d=[];for(var e in c)for(var f=c[e],g=0;g<f.length-1;g++){var h=g,i=g+1,j=f[h].offset,k=f[i].offset,l=j,m=k;0==g&&(l=-1/0,0==k&&(i=h)),g==f.length-2&&(m=1/0,1==j&&(h=i)),d.push({applyFrom:l,applyTo:m,startOffset:f[h].offset,endOffset:f[i].offset,easingFunction:a.parseEasingFunction(f[h].easing),property:e,interpolation:b.propertyInterpolation(e,f[h].value,f[i].value)})}return d.sort(function(a,b){return a.startOffset-b.startOffset}),d}b.convertEffectInput=function(c){var f=a.normalizeKeyframes(c),g=d(f),h=e(g);return function(a,c){if(null!=c)h.filter(function(a){return c>=a.applyFrom&&c<a.applyTo}).forEach(function(d){var e=c-d.startOffset,f=d.endOffset-d.startOffset,g=0==f?0:d.easingFunction(e/f);b.apply(a,d.property,d.interpolation(g))});else for(var d in g)"offset"!=d&&"easing"!=d&&"composite"!=d&&b.clear(a,d)}}}(a,b),function(a,b,c){function d(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function e(a,b,c){h[c]=h[c]||[],h[c].push([a,b])}function f(a,b,c){for(var f=0;f<c.length;f++){e(a,b,d(c[f]))}}function g(c,e,f){var g=c;/-/.test(c)&&!a.isDeprecated("Hyphenated property names","2016-03-22","Use camelCase instead.",!0)&&(g=d(c)),"initial"!=e&&"initial"!=f||("initial"==e&&(e=i[g]),"initial"==f&&(f=i[g]));for(var j=e==f?[]:h[g],k=0;j&&k<j.length;k++){var l=j[k][0](e),m=j[k][0](f);if(void 0!==l&&void 0!==m){var n=j[k][1](l,m);if(n){var o=b.Interpolation.apply(null,n);return function(a){return 0==a?e:1==a?f:o(a)}}}}return b.Interpolation(!1,!0,function(a){return a?f:e})}var h={};b.addPropertiesHandler=f;var i={backgroundColor:"transparent",backgroundPosition:"0% 0%",borderBottomColor:"currentColor",borderBottomLeftRadius:"0px",borderBottomRightRadius:"0px",borderBottomWidth:"3px",borderLeftColor:"currentColor",borderLeftWidth:"3px",borderRightColor:"currentColor",borderRightWidth:"3px",borderSpacing:"2px",borderTopColor:"currentColor",borderTopLeftRadius:"0px",borderTopRightRadius:"0px",borderTopWidth:"3px",bottom:"auto",clip:"rect(0px, 0px, 0px, 0px)",color:"black",fontSize:"100%",fontWeight:"400",height:"auto",left:"auto",letterSpacing:"normal",lineHeight:"120%",marginBottom:"0px",marginLeft:"0px",marginRight:"0px",marginTop:"0px",maxHeight:"none",maxWidth:"none",minHeight:"0px",minWidth:"0px",opacity:"1.0",outlineColor:"invert",outlineOffset:"0px",outlineWidth:"3px",paddingBottom:"0px",paddingLeft:"0px",paddingRight:"0px",paddingTop:"0px",right:"auto",strokeDasharray:"none",strokeDashoffset:"0px",textIndent:"0px",textShadow:"0px 0px 0px transparent",top:"auto",transform:"",verticalAlign:"0px",visibility:"visible",width:"auto",wordSpacing:"normal",zIndex:"auto"};b.propertyInterpolation=g}(a,b),function(a,b,c){function d(b){var c=a.calculateActiveDuration(b),d=function(d){return a.calculateIterationProgress(c,d,b)};return d._totalDuration=b.delay+c+b.endDelay,d}b.KeyframeEffect=function(c,e,f,g){var h,i=d(a.normalizeTimingInput(f)),j=b.convertEffectInput(e),k=function(){j(c,h)};return k._update=function(a){return null!==(h=i(a))},k._clear=function(){j(c,null)},k._hasSameTarget=function(a){return c===a},k._target=c,k._totalDuration=i._totalDuration,k._id=g,k}}(a,b),function(a,b){function c(a,b){return!(!b.namespaceURI||-1==b.namespaceURI.indexOf("/svg"))&&(g in a||(a[g]=/Trident|MSIE|IEMobile|Edge|Android 4/i.test(a.navigator.userAgent)),a[g])}function d(a,b,c){c.enumerable=!0,c.configurable=!0,Object.defineProperty(a,b,c)}function e(a){this._element=a,this._surrogateStyle=document.createElementNS("http://www.w3.org/1999/xhtml","div").style,this._style=a.style,this._length=0,this._isAnimatedProperty={},this._updateSvgTransformAttr=c(window,a),this._savedTransformAttr=null;for(var b=0;b<this._style.length;b++){var d=this._style[b];this._surrogateStyle[d]=this._style[d]}this._updateIndices()}function f(a){if(!a._webAnimationsPatchedStyle){var b=new e(a);try{d(a,"style",{get:function(){return b}})}catch(b){a.style._set=function(b,c){a.style[b]=c},a.style._clear=function(b){a.style[b]=""}}a._webAnimationsPatchedStyle=a.style}}var g="_webAnimationsUpdateSvgTransformAttr",h={cssText:1,length:1,parentRule:1},i={getPropertyCSSValue:1,getPropertyPriority:1,getPropertyValue:1,item:1,removeProperty:1,setProperty:1},j={removeProperty:1,setProperty:1};e.prototype={get cssText(){return this._surrogateStyle.cssText},set cssText(a){for(var b={},c=0;c<this._surrogateStyle.length;c++)b[this._surrogateStyle[c]]=!0;this._surrogateStyle.cssText=a,this._updateIndices();for(var c=0;c<this._surrogateStyle.length;c++)b[this._surrogateStyle[c]]=!0;for(var d in b)this._isAnimatedProperty[d]||this._style.setProperty(d,this._surrogateStyle.getPropertyValue(d))},get length(){return this._surrogateStyle.length},get parentRule(){return this._style.parentRule},_updateIndices:function(){for(;this._length<this._surrogateStyle.length;)Object.defineProperty(this,this._length,{configurable:!0,enumerable:!1,get:function(a){return function(){return this._surrogateStyle[a]}}(this._length)}),this._length++;for(;this._length>this._surrogateStyle.length;)this._length--,Object.defineProperty(this,this._length,{configurable:!0,enumerable:!1,value:void 0})},_set:function(b,c){this._style[b]=c,this._isAnimatedProperty[b]=!0,this._updateSvgTransformAttr&&"transform"==a.unprefixedPropertyName(b)&&(null==this._savedTransformAttr&&(this._savedTransformAttr=this._element.getAttribute("transform")),this._element.setAttribute("transform",a.transformToSvgMatrix(c)))},_clear:function(b){this._style[b]=this._surrogateStyle[b],this._updateSvgTransformAttr&&"transform"==a.unprefixedPropertyName(b)&&(this._savedTransformAttr?this._element.setAttribute("transform",this._savedTransformAttr):this._element.removeAttribute("transform"),this._savedTransformAttr=null),delete this._isAnimatedProperty[b]}};for(var k in i)e.prototype[k]=function(a,b){return function(){var c=this._surrogateStyle[a].apply(this._surrogateStyle,arguments);return b&&(this._isAnimatedProperty[arguments[0]]||this._style[a].apply(this._style,arguments),this._updateIndices()),c}}(k,k in j);for(var l in document.documentElement.style)l in h||l in i||function(a){d(e.prototype,a,{get:function(){return this._surrogateStyle[a]},set:function(b){this._surrogateStyle[a]=b,this._updateIndices(),this._isAnimatedProperty[a]||(this._style[a]=b)}})}(l);a.apply=function(b,c,d){f(b),b.style._set(a.propertyName(c),d)},a.clear=function(b,c){b._webAnimationsPatchedStyle&&b.style._clear(a.propertyName(c))}}(b),function(a){window.Element.prototype.animate=function(b,c){var d="";return c&&c.id&&(d=c.id),a.timeline._play(a.KeyframeEffect(this,b,c,d))}}(b),function(a,b){function c(a,b,d){if("number"==typeof a&&"number"==typeof b)return a*(1-d)+b*d;if("boolean"==typeof a&&"boolean"==typeof b)return d<.5?a:b;if(a.length==b.length){for(var e=[],f=0;f<a.length;f++)e.push(c(a[f],b[f],d));return e}throw"Mismatched interpolation arguments "+a+":"+b}a.Interpolation=function(a,b,d){return function(e){return d(c(a,b,e))}}}(b),function(a,b){function c(a,b,c){return Math.max(Math.min(a,c),b)}function d(b,d,e){var f=a.dot(b,d);f=c(f,-1,1);var g=[];if(1===f)g=b;else for(var h=Math.acos(f),i=1*Math.sin(e*h)/Math.sqrt(1-f*f),j=0;j<4;j++)g.push(b[j]*(Math.cos(e*h)-f*i)+d[j]*i);return g}var e=function(){function a(a,b){for(var c=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],d=0;d<4;d++)for(var e=0;e<4;e++)for(var f=0;f<4;f++)c[d][e]+=b[d][f]*a[f][e];return c}function b(a){return 0==a[0][2]&&0==a[0][3]&&0==a[1][2]&&0==a[1][3]&&0==a[2][0]&&0==a[2][1]&&1==a[2][2]&&0==a[2][3]&&0==a[3][2]&&1==a[3][3]}function c(c,d,e,f,g){for(var h=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],i=0;i<4;i++)h[i][3]=g[i];for(var i=0;i<3;i++)for(var j=0;j<3;j++)h[3][i]+=c[j]*h[j][i];var k=f[0],l=f[1],m=f[2],n=f[3],o=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];o[0][0]=1-2*(l*l+m*m),o[0][1]=2*(k*l-m*n),o[0][2]=2*(k*m+l*n),o[1][0]=2*(k*l+m*n),o[1][1]=1-2*(k*k+m*m),o[1][2]=2*(l*m-k*n),o[2][0]=2*(k*m-l*n),o[2][1]=2*(l*m+k*n),o[2][2]=1-2*(k*k+l*l),h=a(h,o);var p=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];e[2]&&(p[2][1]=e[2],h=a(h,p)),e[1]&&(p[2][1]=0,p[2][0]=e[0],h=a(h,p)),e[0]&&(p[2][0]=0,p[1][0]=e[0],h=a(h,p));for(var i=0;i<3;i++)for(var j=0;j<3;j++)h[i][j]*=d[i];return b(h)?[h[0][0],h[0][1],h[1][0],h[1][1],h[3][0],h[3][1]]:h[0].concat(h[1],h[2],h[3])}return c}();a.composeMatrix=e,a.quat=d}(b),function(a,b,c){a.sequenceNumber=0;var d=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="finish",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()};b.Animation=function(b){this.id="",b&&b._id&&(this.id=b._id),this._sequenceNumber=a.sequenceNumber++,this._currentTime=0,this._startTime=null,this._paused=!1,this._playbackRate=1,this._inTimeline=!0,this._finishedFlag=!0,this.onfinish=null,this._finishHandlers=[],this._effect=b,this._inEffect=this._effect._update(0),this._idle=!0,this._currentTimePending=!1},b.Animation.prototype={_ensureAlive:function(){this.playbackRate<0&&0===this.currentTime?this._inEffect=this._effect._update(-1):this._inEffect=this._effect._update(this.currentTime),this._inTimeline||!this._inEffect&&this._finishedFlag||(this._inTimeline=!0,b.timeline._animations.push(this))},_tickCurrentTime:function(a,b){a!=this._currentTime&&(this._currentTime=a,this._isFinished&&!b&&(this._currentTime=this._playbackRate>0?this._totalDuration:0),this._ensureAlive())},get currentTime(){return this._idle||this._currentTimePending?null:this._currentTime},set currentTime(a){a=+a,isNaN(a)||(b.restart(),this._paused||null==this._startTime||(this._startTime=this._timeline.currentTime-a/this._playbackRate),this._currentTimePending=!1,this._currentTime!=a&&(this._idle&&(this._idle=!1,this._paused=!0),this._tickCurrentTime(a,!0),b.applyDirtiedAnimation(this)))},get startTime(){return this._startTime},set startTime(a){a=+a,isNaN(a)||this._paused||this._idle||(this._startTime=a,this._tickCurrentTime((this._timeline.currentTime-this._startTime)*this.playbackRate),b.applyDirtiedAnimation(this))},get playbackRate(){return this._playbackRate},set playbackRate(a){if(a!=this._playbackRate){var c=this.currentTime;this._playbackRate=a,this._startTime=null,"paused"!=this.playState&&"idle"!=this.playState&&(this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)),null!=c&&(this.currentTime=c)}},get _isFinished(){return!this._idle&&(this._playbackRate>0&&this._currentTime>=this._totalDuration||this._playbackRate<0&&this._currentTime<=0)},get _totalDuration(){return this._effect._totalDuration},get playState(){return this._idle?"idle":null==this._startTime&&!this._paused&&0!=this.playbackRate||this._currentTimePending?"pending":this._paused?"paused":this._isFinished?"finished":"running"},_rewind:function(){if(this._playbackRate>=0)this._currentTime=0;else{if(!(this._totalDuration<1/0))throw new DOMException("Unable to rewind negative playback rate animation with infinite duration","InvalidStateError");this._currentTime=this._totalDuration}},play:function(){this._paused=!1,(this._isFinished||this._idle)&&(this._rewind(),this._startTime=null),this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)},pause:function(){this._isFinished||this._paused||this._idle?this._idle&&(this._rewind(),this._idle=!1):this._currentTimePending=!0,this._startTime=null,this._paused=!0},finish:function(){this._idle||(this.currentTime=this._playbackRate>0?this._totalDuration:0,this._startTime=this._totalDuration-this.currentTime,this._currentTimePending=!1,b.applyDirtiedAnimation(this))},cancel:function(){this._inEffect&&(this._inEffect=!1,this._idle=!0,this._paused=!1,this._finishedFlag=!0,this._currentTime=0,this._startTime=null,this._effect._update(null),b.applyDirtiedAnimation(this))},reverse:function(){this.playbackRate*=-1,this.play()},addEventListener:function(a,b){"function"==typeof b&&"finish"==a&&this._finishHandlers.push(b)},removeEventListener:function(a,b){if("finish"==a){var c=this._finishHandlers.indexOf(b);c>=0&&this._finishHandlers.splice(c,1)}},_fireEvents:function(a){if(this._isFinished){if(!this._finishedFlag){var b=new d(this,this._currentTime,a),c=this._finishHandlers.concat(this.onfinish?[this.onfinish]:[]);setTimeout(function(){c.forEach(function(a){a.call(b.target,b)})},0),this._finishedFlag=!0}}else this._finishedFlag=!1},_tick:function(a,b){this._idle||this._paused||(null==this._startTime?b&&(this.startTime=a-this._currentTime/this.playbackRate):this._isFinished||this._tickCurrentTime((a-this._startTime)*this.playbackRate)),b&&(this._currentTimePending=!1,this._fireEvents(a))},get _needsTick(){return this.playState in{pending:1,running:1}||!this._finishedFlag},_targetAnimations:function(){var a=this._effect._target;return a._activeAnimations||(a._activeAnimations=[]),a._activeAnimations},_markTarget:function(){var a=this._targetAnimations();-1===a.indexOf(this)&&a.push(this)},_unmarkTarget:function(){var a=this._targetAnimations(),b=a.indexOf(this);-1!==b&&a.splice(b,1)}}}(a,b),function(a,b,c){function d(a){var b=j;j=[],a<q.currentTime&&(a=q.currentTime),q._animations.sort(e),q._animations=h(a,!0,q._animations)[0],b.forEach(function(b){b[1](a)}),g(),l=void 0}function e(a,b){return a._sequenceNumber-b._sequenceNumber}function f(){this._animations=[],this.currentTime=window.performance&&performance.now?performance.now():0}function g(){o.forEach(function(a){a()}),o.length=0}function h(a,c,d){p=!0,n=!1,b.timeline.currentTime=a,m=!1;var e=[],f=[],g=[],h=[];return d.forEach(function(b){b._tick(a,c),b._inEffect?(f.push(b._effect),b._markTarget()):(e.push(b._effect),b._unmarkTarget()),b._needsTick&&(m=!0);var d=b._inEffect||b._needsTick;b._inTimeline=d,d?g.push(b):h.push(b)}),o.push.apply(o,e),o.push.apply(o,f),m&&requestAnimationFrame(function(){}),p=!1,[g,h]}var i=window.requestAnimationFrame,j=[],k=0;window.requestAnimationFrame=function(a){var b=k++;return 0==j.length&&i(d),j.push([b,a]),b},window.cancelAnimationFrame=function(a){j.forEach(function(b){b[0]==a&&(b[1]=function(){})})},f.prototype={_play:function(c){c._timing=a.normalizeTimingInput(c.timing);var d=new b.Animation(c);return d._idle=!1,d._timeline=this,this._animations.push(d),b.restart(),b.applyDirtiedAnimation(d),d}};var l=void 0,m=!1,n=!1;b.restart=function(){return m||(m=!0,requestAnimationFrame(function(){}),n=!0),n},b.applyDirtiedAnimation=function(a){if(!p){a._markTarget();var c=a._targetAnimations();c.sort(e),h(b.timeline.currentTime,!1,c.slice())[1].forEach(function(a){var b=q._animations.indexOf(a);-1!==b&&q._animations.splice(b,1)}),g()}};var o=[],p=!1,q=new f;b.timeline=q}(a,b),function(a,b){function c(a,b){for(var c=0,d=0;d<a.length;d++)c+=a[d]*b[d];return c}function d(a,b){return[a[0]*b[0]+a[4]*b[1]+a[8]*b[2]+a[12]*b[3],a[1]*b[0]+a[5]*b[1]+a[9]*b[2]+a[13]*b[3],a[2]*b[0]+a[6]*b[1]+a[10]*b[2]+a[14]*b[3],a[3]*b[0]+a[7]*b[1]+a[11]*b[2]+a[15]*b[3],a[0]*b[4]+a[4]*b[5]+a[8]*b[6]+a[12]*b[7],a[1]*b[4]+a[5]*b[5]+a[9]*b[6]+a[13]*b[7],a[2]*b[4]+a[6]*b[5]+a[10]*b[6]+a[14]*b[7],a[3]*b[4]+a[7]*b[5]+a[11]*b[6]+a[15]*b[7],a[0]*b[8]+a[4]*b[9]+a[8]*b[10]+a[12]*b[11],a[1]*b[8]+a[5]*b[9]+a[9]*b[10]+a[13]*b[11],a[2]*b[8]+a[6]*b[9]+a[10]*b[10]+a[14]*b[11],a[3]*b[8]+a[7]*b[9]+a[11]*b[10]+a[15]*b[11],a[0]*b[12]+a[4]*b[13]+a[8]*b[14]+a[12]*b[15],a[1]*b[12]+a[5]*b[13]+a[9]*b[14]+a[13]*b[15],a[2]*b[12]+a[6]*b[13]+a[10]*b[14]+a[14]*b[15],a[3]*b[12]+a[7]*b[13]+a[11]*b[14]+a[15]*b[15]]}function e(a){var b=a.rad||0;return((a.deg||0)/360+(a.grad||0)/400+(a.turn||0))*(2*Math.PI)+b}function f(a){switch(a.t){case"rotatex":var b=e(a.d[0]);return[1,0,0,0,0,Math.cos(b),Math.sin(b),0,0,-Math.sin(b),Math.cos(b),0,0,0,0,1];case"rotatey":var b=e(a.d[0]);return[Math.cos(b),0,-Math.sin(b),0,0,1,0,0,Math.sin(b),0,Math.cos(b),0,0,0,0,1];case"rotate":case"rotatez":var b=e(a.d[0]);return[Math.cos(b),Math.sin(b),0,0,-Math.sin(b),Math.cos(b),0,0,0,0,1,0,0,0,0,1];case"rotate3d":var c=a.d[0],d=a.d[1],f=a.d[2],b=e(a.d[3]),g=c*c+d*d+f*f;if(0===g)c=1,d=0,f=0;else if(1!==g){var h=Math.sqrt(g);c/=h,d/=h,f/=h}var i=Math.sin(b/2),j=i*Math.cos(b/2),k=i*i;return[1-2*(d*d+f*f)*k,2*(c*d*k+f*j),2*(c*f*k-d*j),0,2*(c*d*k-f*j),1-2*(c*c+f*f)*k,2*(d*f*k+c*j),0,2*(c*f*k+d*j),2*(d*f*k-c*j),1-2*(c*c+d*d)*k,0,0,0,0,1];case"scale":return[a.d[0],0,0,0,0,a.d[1],0,0,0,0,1,0,0,0,0,1];case"scalex":return[a.d[0],0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];case"scaley":return[1,0,0,0,0,a.d[0],0,0,0,0,1,0,0,0,0,1];case"scalez":return[1,0,0,0,0,1,0,0,0,0,a.d[0],0,0,0,0,1];case"scale3d":return[a.d[0],0,0,0,0,a.d[1],0,0,0,0,a.d[2],0,0,0,0,1];case"skew":var l=e(a.d[0]),m=e(a.d[1]);return[1,Math.tan(m),0,0,Math.tan(l),1,0,0,0,0,1,0,0,0,0,1];case"skewx":var b=e(a.d[0]);return[1,0,0,0,Math.tan(b),1,0,0,0,0,1,0,0,0,0,1];case"skewy":var b=e(a.d[0]);return[1,Math.tan(b),0,0,0,1,0,0,0,0,1,0,0,0,0,1];case"translate":var c=a.d[0].px||0,d=a.d[1].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,d,0,1];case"translatex":var c=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,0,0,1];case"translatey":var d=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,0,d,0,1];case"translatez":var f=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,f,1];case"translate3d":var c=a.d[0].px||0,d=a.d[1].px||0,f=a.d[2].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,d,f,1];case"perspective":return[1,0,0,0,0,1,0,0,0,0,1,a.d[0].px?-1/a.d[0].px:0,0,0,0,1];case"matrix":return[a.d[0],a.d[1],0,0,a.d[2],a.d[3],0,0,0,0,1,0,a.d[4],a.d[5],0,1];case"matrix3d":return a.d}}function g(a){return 0===a.length?[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]:a.map(f).reduce(d)}function h(a){return[i(g(a))]}var i=function(){function a(a){return a[0][0]*a[1][1]*a[2][2]+a[1][0]*a[2][1]*a[0][2]+a[2][0]*a[0][1]*a[1][2]-a[0][2]*a[1][1]*a[2][0]-a[1][2]*a[2][1]*a[0][0]-a[2][2]*a[0][1]*a[1][0]}function b(b){for(var c=1/a(b),d=b[0][0],e=b[0][1],f=b[0][2],g=b[1][0],h=b[1][1],i=b[1][2],j=b[2][0],k=b[2][1],l=b[2][2],m=[[(h*l-i*k)*c,(f*k-e*l)*c,(e*i-f*h)*c,0],[(i*j-g*l)*c,(d*l-f*j)*c,(f*g-d*i)*c,0],[(g*k-h*j)*c,(j*e-d*k)*c,(d*h-e*g)*c,0]],n=[],o=0;o<3;o++){for(var p=0,q=0;q<3;q++)p+=b[3][q]*m[q][o];n.push(p)}return n.push(1),m.push(n),m}function d(a){return[[a[0][0],a[1][0],a[2][0],a[3][0]],[a[0][1],a[1][1],a[2][1],a[3][1]],[a[0][2],a[1][2],a[2][2],a[3][2]],[a[0][3],a[1][3],a[2][3],a[3][3]]]}function e(a,b){for(var c=[],d=0;d<4;d++){for(var e=0,f=0;f<4;f++)e+=a[f]*b[f][d];c.push(e)}return c}function f(a){var b=g(a);return[a[0]/b,a[1]/b,a[2]/b]}function g(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])}function h(a,b,c,d){return[c*a[0]+d*b[0],c*a[1]+d*b[1],c*a[2]+d*b[2]]}function i(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function j(j){var k=[j.slice(0,4),j.slice(4,8),j.slice(8,12),j.slice(12,16)];if(1!==k[3][3])return null;for(var l=[],m=0;m<4;m++)l.push(k[m].slice());for(var m=0;m<3;m++)l[m][3]=0;if(0===a(l))return null;var n,o=[];k[0][3]||k[1][3]||k[2][3]?(o.push(k[0][3]),o.push(k[1][3]),o.push(k[2][3]),o.push(k[3][3]),n=e(o,d(b(l)))):n=[0,0,0,1];var p=k[3].slice(0,3),q=[];q.push(k[0].slice(0,3));var r=[];r.push(g(q[0])),q[0]=f(q[0]);var s=[];q.push(k[1].slice(0,3)),s.push(c(q[0],q[1])),q[1]=h(q[1],q[0],1,-s[0]),r.push(g(q[1])),q[1]=f(q[1]),s[0]/=r[1],q.push(k[2].slice(0,3)),s.push(c(q[0],q[2])),q[2]=h(q[2],q[0],1,-s[1]),s.push(c(q[1],q[2])),q[2]=h(q[2],q[1],1,-s[2]),r.push(g(q[2])),q[2]=f(q[2]),s[1]/=r[2],s[2]/=r[2];var t=i(q[1],q[2]);if(c(q[0],t)<0)for(var m=0;m<3;m++)r[m]*=-1,q[m][0]*=-1,q[m][1]*=-1,q[m][2]*=-1;var u,v,w=q[0][0]+q[1][1]+q[2][2]+1;return w>1e-4?(u=.5/Math.sqrt(w),v=[(q[2][1]-q[1][2])*u,(q[0][2]-q[2][0])*u,(q[1][0]-q[0][1])*u,.25/u]):q[0][0]>q[1][1]&&q[0][0]>q[2][2]?(u=2*Math.sqrt(1+q[0][0]-q[1][1]-q[2][2]),v=[.25*u,(q[0][1]+q[1][0])/u,(q[0][2]+q[2][0])/u,(q[2][1]-q[1][2])/u]):q[1][1]>q[2][2]?(u=2*Math.sqrt(1+q[1][1]-q[0][0]-q[2][2]),v=[(q[0][1]+q[1][0])/u,.25*u,(q[1][2]+q[2][1])/u,(q[0][2]-q[2][0])/u]):(u=2*Math.sqrt(1+q[2][2]-q[0][0]-q[1][1]),v=[(q[0][2]+q[2][0])/u,(q[1][2]+q[2][1])/u,.25*u,(q[1][0]-q[0][1])/u]),[p,r,s,v,n]}return j}();a.dot=c,a.makeMatrixDecomposition=h,a.transformListToMatrix=g}(b),function(a){function b(a,b){var c=a.exec(b);if(c)return c=a.ignoreCase?c[0].toLowerCase():c[0],[c,b.substr(c.length)]}function c(a,b){b=b.replace(/^\s*/,"");var c=a(b);if(c)return[c[0],c[1].replace(/^\s*/,"")]}function d(a,d,e){a=c.bind(null,a);for(var f=[];;){var g=a(e);if(!g)return[f,e];if(f.push(g[0]),e=g[1],!(g=b(d,e))||""==g[1])return[f,e];e=g[1]}}function e(a,b){for(var c=0,d=0;d<b.length&&(!/\s|,/.test(b[d])||0!=c);d++)if("("==b[d])c++;else if(")"==b[d]&&(c--,0==c&&d++,c<=0))break;var e=a(b.substr(0,d));return void 0==e?void 0:[e,b.substr(d)]}function f(a,b){for(var c=a,d=b;c&&d;)c>d?c%=d:d%=c;return c=a*b/(c+d)}function g(a){return function(b){var c=a(b);return c&&(c[0]=void 0),c}}function h(a,b){return function(c){return a(c)||[b,c]}}function i(b,c){for(var d=[],e=0;e<b.length;e++){var f=a.consumeTrimmed(b[e],c);if(!f||""==f[0])return;void 0!==f[0]&&d.push(f[0]),c=f[1]}if(""==c)return d}function j(a,b,c,d,e){for(var g=[],h=[],i=[],j=f(d.length,e.length),k=0;k<j;k++){var l=b(d[k%d.length],e[k%e.length]);if(!l)return;g.push(l[0]),h.push(l[1]),i.push(l[2])}return[g,h,function(b){var d=b.map(function(a,b){return i[b](a)}).join(c);return a?a(d):d}]}function k(a,b,c){for(var d=[],e=[],f=[],g=0,h=0;h<c.length;h++)if("function"==typeof c[h]){var i=c[h](a[g],b[g++]);d.push(i[0]),e.push(i[1]),f.push(i[2])}else!function(a){d.push(!1),e.push(!1),f.push(function(){return c[a]})}(h);return[d,e,function(a){for(var b="",c=0;c<a.length;c++)b+=f[c](a[c]);return b}]}a.consumeToken=b,a.consumeTrimmed=c,a.consumeRepeated=d,a.consumeParenthesised=e,a.ignore=g,a.optional=h,a.consumeList=i,a.mergeNestedRepeated=j.bind(null,null),a.mergeWrappedNestedRepeated=j,a.mergeList=k}(b),function(a){function b(b){function c(b){var c=a.consumeToken(/^inset/i,b);return c?(d.inset=!0,c):(c=a.consumeLengthOrPercent(b))?(d.lengths.push(c[0]),c):(c=a.consumeColor(b),c?(d.color=c[0],c):void 0)}var d={inset:!1,lengths:[],color:null},e=a.consumeRepeated(c,/^/,b);if(e&&e[0].length)return[d,e[1]]}function c(c){var d=a.consumeRepeated(b,/^,/,c);if(d&&""==d[1])return d[0]}function d(b,c){for(;b.lengths.length<Math.max(b.lengths.length,c.lengths.length);)b.lengths.push({px:0});for(;c.lengths.length<Math.max(b.lengths.length,c.lengths.length);)c.lengths.push({px:0});if(b.inset==c.inset&&!!b.color==!!c.color){for(var d,e=[],f=[[],0],g=[[],0],h=0;h<b.lengths.length;h++){var i=a.mergeDimensions(b.lengths[h],c.lengths[h],2==h);f[0].push(i[0]),g[0].push(i[1]),e.push(i[2])}if(b.color&&c.color){var j=a.mergeColors(b.color,c.color);f[1]=j[0],g[1]=j[1],d=j[2]}return[f,g,function(a){for(var c=b.inset?"inset ":" ",f=0;f<e.length;f++)c+=e[f](a[0][f])+" ";return d&&(c+=d(a[1])),c}]}}function e(b,c,d,e){function f(a){return{inset:a,color:[0,0,0,0],lengths:[{px:0},{px:0},{px:0},{px:0}]}}for(var g=[],h=[],i=0;i<d.length||i<e.length;i++){var j=d[i]||f(e[i].inset),k=e[i]||f(d[i].inset);g.push(j),h.push(k)}return a.mergeNestedRepeated(b,c,g,h)}var f=e.bind(null,d,", ");a.addPropertiesHandler(c,f,["box-shadow","text-shadow"])}(b),function(a,b){function c(a){return a.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")}function d(a,b,c){return Math.min(b,Math.max(a,c))}function e(a){if(/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a))return Number(a)}function f(a,b){return[a,b,c]}function g(a,b){if(0!=a)return i(0,1/0)(a,b)}function h(a,b){return[a,b,function(a){return Math.round(d(1,1/0,a))}]}function i(a,b){return function(e,f){return[e,f,function(e){return c(d(a,b,e))}]}}function j(a){var b=a.trim().split(/\s*[\s,]\s*/);if(0!==b.length){for(var c=[],d=0;d<b.length;d++){var f=e(b[d]);if(void 0===f)return;c.push(f)}return c}}function k(a,b){if(a.length==b.length)return[a,b,function(a){return a.map(c).join(" ")}]}function l(a,b){return[a,b,Math.round]}a.clamp=d,a.addPropertiesHandler(j,k,["stroke-dasharray"]),a.addPropertiesHandler(e,i(0,1/0),["border-image-width","line-height"]),a.addPropertiesHandler(e,i(0,1),["opacity","shape-image-threshold"]),a.addPropertiesHandler(e,g,["flex-grow","flex-shrink"]),a.addPropertiesHandler(e,h,["orphans","widows"]),a.addPropertiesHandler(e,l,["z-index"]),a.parseNumber=e,a.parseNumberList=j,a.mergeNumbers=f,a.numberToString=c}(b),function(a,b){function c(a,b){if("visible"==a||"visible"==b)return[0,1,function(c){return c<=0?a:c>=1?b:"visible"}]}a.addPropertiesHandler(String,c,["visibility"])}(b),function(a,b){function c(a){a=a.trim(),f.fillStyle="#000",f.fillStyle=a;var b=f.fillStyle;if(f.fillStyle="#fff",f.fillStyle=a,b==f.fillStyle){f.fillRect(0,0,1,1);var c=f.getImageData(0,0,1,1).data;f.clearRect(0,0,1,1);var d=c[3]/255;return[c[0]*d,c[1]*d,c[2]*d,d]}}function d(b,c){return[b,c,function(b){function c(a){return Math.max(0,Math.min(255,a))}if(b[3])for(var d=0;d<3;d++)b[d]=Math.round(c(b[d]/b[3]));return b[3]=a.numberToString(a.clamp(0,1,b[3])),"rgba("+b.join(",")+")"}]}var e=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");e.width=e.height=1;var f=e.getContext("2d");a.addPropertiesHandler(c,d,["background-color","border-bottom-color","border-left-color","border-right-color","border-top-color","color","fill","flood-color","lighting-color","outline-color","stop-color","stroke","text-decoration-color"]),a.consumeColor=a.consumeParenthesised.bind(null,c),a.mergeColors=d}(b),function(a,b){function c(a){function b(){var b=h.exec(a);g=b?b[0]:void 0}function c(){var a=Number(g);return b(),a}function d(){if("("!==g)return c();b();var a=f();return")"!==g?NaN:(b(),a)}function e(){for(var a=d();"*"===g||"/"===g;){var c=g;b();var e=d();"*"===c?a*=e:a/=e}return a}function f(){for(var a=e();"+"===g||"-"===g;){var c=g;b();var d=e();"+"===c?a+=d:a-=d}return a}var g,h=/([\+\-\w\.]+|[\(\)\*\/])/g;return b(),f()}function d(a,b){if("0"==(b=b.trim().toLowerCase())&&"px".search(a)>=0)return{px:0};if(/^[^(]*$|^calc/.test(b)){b=b.replace(/calc\(/g,"(");var d={};b=b.replace(a,function(a){return d[a]=null,"U"+a});for(var e="U("+a.source+")",f=b.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g,"N").replace(new RegExp("N"+e,"g"),"D").replace(/\s[+-]\s/g,"O").replace(/\s/g,""),g=[/N\*(D)/g,/(N|D)[*\/]N/g,/(N|D)O\1/g,/\((N|D)\)/g],h=0;h<g.length;)g[h].test(f)?(f=f.replace(g[h],"$1"),h=0):h++;if("D"==f){for(var i in d){var j=c(b.replace(new RegExp("U"+i,"g"),"").replace(new RegExp(e,"g"),"*0"));if(!isFinite(j))return;d[i]=j}return d}}}function e(a,b){return f(a,b,!0)}function f(b,c,d){var e,f=[];for(e in b)f.push(e);for(e in c)f.indexOf(e)<0&&f.push(e);return b=f.map(function(a){return b[a]||0}),c=f.map(function(a){return c[a]||0}),[b,c,function(b){var c=b.map(function(c,e){return 1==b.length&&d&&(c=Math.max(c,0)),a.numberToString(c)+f[e]}).join(" + ");return b.length>1?"calc("+c+")":c}]}var g="px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",h=d.bind(null,new RegExp(g,"g")),i=d.bind(null,new RegExp(g+"|%","g")),j=d.bind(null,/deg|rad|grad|turn/g);a.parseLength=h,a.parseLengthOrPercent=i,a.consumeLengthOrPercent=a.consumeParenthesised.bind(null,i),a.parseAngle=j,a.mergeDimensions=f;var k=a.consumeParenthesised.bind(null,h),l=a.consumeRepeated.bind(void 0,k,/^/),m=a.consumeRepeated.bind(void 0,l,/^,/);a.consumeSizePairList=m;var n=function(a){var b=m(a);if(b&&""==b[1])return b[0]},o=a.mergeNestedRepeated.bind(void 0,e," "),p=a.mergeNestedRepeated.bind(void 0,o,",");a.mergeNonNegativeSizePair=o,a.addPropertiesHandler(n,p,["background-size"]),a.addPropertiesHandler(i,e,["border-bottom-width","border-image-width","border-left-width","border-right-width","border-top-width","flex-basis","font-size","height","line-height","max-height","max-width","outline-width","width"]),a.addPropertiesHandler(i,f,["border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius","bottom","left","letter-spacing","margin-bottom","margin-left","margin-right","margin-top","min-height","min-width","outline-offset","padding-bottom","padding-left","padding-right","padding-top","perspective","right","shape-margin","stroke-dashoffset","text-indent","top","vertical-align","word-spacing"])}(b),function(a,b){function c(b){return a.consumeLengthOrPercent(b)||a.consumeToken(/^auto/,b)}function d(b){var d=a.consumeList([a.ignore(a.consumeToken.bind(null,/^rect/)),a.ignore(a.consumeToken.bind(null,/^\(/)),a.consumeRepeated.bind(null,c,/^,/),a.ignore(a.consumeToken.bind(null,/^\)/))],b);if(d&&4==d[0].length)return d[0]}function e(b,c){return"auto"==b||"auto"==c?[!0,!1,function(d){var e=d?b:c;if("auto"==e)return"auto";var f=a.mergeDimensions(e,e);return f[2](f[0])}]:a.mergeDimensions(b,c)}function f(a){return"rect("+a+")"}var g=a.mergeWrappedNestedRepeated.bind(null,f,e,", ");a.parseBox=d,a.mergeBoxes=g,a.addPropertiesHandler(d,g,["clip"])}(b),function(a,b){function c(a){return function(b){var c=0;return a.map(function(a){return a===k?b[c++]:a})}}function d(a){return a}function e(b){if("none"==(b=b.toLowerCase().trim()))return[];for(var c,d=/\s*(\w+)\(([^)]*)\)/g,e=[],f=0;c=d.exec(b);){if(c.index!=f)return;f=c.index+c[0].length;var g=c[1],h=n[g];if(!h)return;var i=c[2].split(","),j=h[0];if(j.length<i.length)return;for(var k=[],o=0;o<j.length;o++){var p,q=i[o],r=j[o];if(void 0===(p=q?{A:function(b){return"0"==b.trim()?m:a.parseAngle(b)},N:a.parseNumber,T:a.parseLengthOrPercent,L:a.parseLength}[r.toUpperCase()](q):{a:m,n:k[0],t:l}[r]))return;k.push(p)}if(e.push({t:g,d:k}),d.lastIndex==b.length)return e}}function f(a){return a.toFixed(6).replace(".000000","")}function g(b,c){if(b.decompositionPair!==c){b.decompositionPair=c;var d=a.makeMatrixDecomposition(b)}if(c.decompositionPair!==b){c.decompositionPair=b;var e=a.makeMatrixDecomposition(c)}return null==d[0]||null==e[0]?[[!1],[!0],function(a){return a?c[0].d:b[0].d}]:(d[0].push(0),e[0].push(1),[d,e,function(b){var c=a.quat(d[0][3],e[0][3],b[5]);return a.composeMatrix(b[0],b[1],b[2],c,b[4]).map(f).join(",")}])}function h(a){return a.replace(/[xy]/,"")}function i(a){return a.replace(/(x|y|z|3d)?$/,"3d")}function j(b,c){var d=a.makeMatrixDecomposition&&!0,e=!1;if(!b.length||!c.length){b.length||(e=!0,b=c,c=[]);for(var f=0;f<b.length;f++){var j=b[f].t,k=b[f].d,l="scale"==j.substr(0,5)?1:0;c.push({t:j,d:k.map(function(a){if("number"==typeof a)return l;var b={};for(var c in a)b[c]=l;return b})})}}var m=function(a,b){return"perspective"==a&&"perspective"==b||("matrix"==a||"matrix3d"==a)&&("matrix"==b||"matrix3d"==b)},o=[],p=[],q=[];if(b.length!=c.length){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]]}else for(var f=0;f<b.length;f++){var j,s=b[f].t,t=c[f].t,u=b[f].d,v=c[f].d,w=n[s],x=n[t];if(m(s,t)){if(!d)return;var r=g([b[f]],[c[f]]);o.push(r[0]),p.push(r[1]),q.push(["matrix",[r[2]]])}else{if(s==t)j=s;else if(w[2]&&x[2]&&h(s)==h(t))j=h(s),u=w[2](u),v=x[2](v);else{if(!w[1]||!x[1]||i(s)!=i(t)){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]];break}j=i(s),u=w[1](u),v=x[1](v)}for(var y=[],z=[],A=[],B=0;B<u.length;B++){var C="number"==typeof u[B]?a.mergeNumbers:a.mergeDimensions,r=C(u[B],v[B]);y[B]=r[0],z[B]=r[1],A.push(r[2])}o.push(y),p.push(z),q.push([j,A])}}if(e){var D=o;o=p,p=D}return[o,p,function(a){return a.map(function(a,b){var c=a.map(function(a,c){return q[b][1][c](a)}).join(",");return"matrix"==q[b][0]&&16==c.split(",").length&&(q[b][0]="matrix3d"),q[b][0]+"("+c+")"}).join(" ")}]}var k=null,l={px:0},m={deg:0},n={matrix:["NNNNNN",[k,k,0,0,k,k,0,0,0,0,1,0,k,k,0,1],d],matrix3d:["NNNNNNNNNNNNNNNN",d],rotate:["A"],rotatex:["A"],rotatey:["A"],rotatez:["A"],rotate3d:["NNNA"],perspective:["L"],scale:["Nn",c([k,k,1]),d],scalex:["N",c([k,1,1]),c([k,1])],scaley:["N",c([1,k,1]),c([1,k])],scalez:["N",c([1,1,k])],scale3d:["NNN",d],skew:["Aa",null,d],skewx:["A",null,c([k,m])],skewy:["A",null,c([m,k])],translate:["Tt",c([k,k,l]),d],translatex:["T",c([k,l,l]),c([k,l])],translatey:["T",c([l,k,l]),c([l,k])],translatez:["L",c([l,l,k])],translate3d:["TTL",d]};a.addPropertiesHandler(e,j,["transform"]),a.transformToSvgMatrix=function(b){var c=a.transformListToMatrix(e(b));return"matrix("+f(c[0])+" "+f(c[1])+" "+f(c[4])+" "+f(c[5])+" "+f(c[12])+" "+f(c[13])+")"}}(b),function(a){function b(a){var b=Number(a);if(!(isNaN(b)||b<100||b>900||b%100!=0))return b}function c(b){return b=100*Math.round(b/100),b=a.clamp(100,900,b),400===b?"normal":700===b?"bold":String(b)}function d(a,b){return[a,b,c]}a.addPropertiesHandler(b,d,["font-weight"])}(b),function(a){function b(a){var b={};for(var c in a)b[c]=-a[c];return b}function c(b){return a.consumeToken(/^(left|center|right|top|bottom)\b/i,b)||a.consumeLengthOrPercent(b)}function d(b,d){var e=a.consumeRepeated(c,/^/,d);if(e&&""==e[1]){var f=e[0];if(f[0]=f[0]||"center",f[1]=f[1]||"center",3==b&&(f[2]=f[2]||{px:0}),f.length==b){if(/top|bottom/.test(f[0])||/left|right/.test(f[1])){var h=f[0];f[0]=f[1],f[1]=h}if(/left|right|center|Object/.test(f[0])&&/top|bottom|center|Object/.test(f[1]))return f.map(function(a){return"object"==typeof a?a:g[a]})}}}function e(d){var e=a.consumeRepeated(c,/^/,d);if(e){for(var f=e[0],h=[{"%":50},{"%":50}],i=0,j=!1,k=0;k<f.length;k++){var l=f[k];"string"==typeof l?(j=/bottom|right/.test(l),i={left:0,right:0,center:i,top:1,bottom:1}[l],h[i]=g[l],"center"==l&&i++):(j&&(l=b(l),l["%"]=(l["%"]||0)+100),h[i]=l,i++,j=!1)}return[h,e[1]]}}function f(b){var c=a.consumeRepeated(e,/^,/,b);if(c&&""==c[1])return c[0]}var g={left:{"%":0},center:{"%":50},right:{"%":100},top:{"%":0},bottom:{"%":100}},h=a.mergeNestedRepeated.bind(null,a.mergeDimensions," ");a.addPropertiesHandler(d.bind(null,3),h,["transform-origin"]),a.addPropertiesHandler(d.bind(null,2),h,["perspective-origin"]),a.consumePosition=e,a.mergeOffsetList=h;var i=a.mergeNestedRepeated.bind(null,h,", ");a.addPropertiesHandler(f,i,["background-position","object-position"])}(b),function(a){function b(b){var c=a.consumeToken(/^circle/,b);if(c&&c[0])return["circle"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),d,a.ignore(a.consumeToken.bind(void 0,/^at/)),a.consumePosition,a.ignore(a.consumeToken.bind(void 0,/^\)/))],c[1]));var f=a.consumeToken(/^ellipse/,b);if(f&&f[0])return["ellipse"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),e,a.ignore(a.consumeToken.bind(void 0,/^at/)),a.consumePosition,a.ignore(a.consumeToken.bind(void 0,/^\)/))],f[1]));var g=a.consumeToken(/^polygon/,b);return g&&g[0]?["polygon"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),a.optional(a.consumeToken.bind(void 0,/^nonzero\s*,|^evenodd\s*,/),"nonzero,"),a.consumeSizePairList,a.ignore(a.consumeToken.bind(void 0,/^\)/))],g[1])):void 0}function c(b,c){if(b[0]===c[0])return"circle"==b[0]?a.mergeList(b.slice(1),c.slice(1),["circle(",a.mergeDimensions," at ",a.mergeOffsetList,")"]):"ellipse"==b[0]?a.mergeList(b.slice(1),c.slice(1),["ellipse(",a.mergeNonNegativeSizePair," at ",a.mergeOffsetList,")"]):"polygon"==b[0]&&b[1]==c[1]?a.mergeList(b.slice(2),c.slice(2),["polygon(",b[1],g,")"]):void 0}var d=a.consumeParenthesised.bind(null,a.parseLengthOrPercent),e=a.consumeRepeated.bind(void 0,d,/^/),f=a.mergeNestedRepeated.bind(void 0,a.mergeDimensions," "),g=a.mergeNestedRepeated.bind(void 0,f,",");a.addPropertiesHandler(b,c,["shape-outside"])}(b),function(a,b){function c(a,b){b.concat([a]).forEach(function(b){b in document.documentElement.style&&(d[a]=b),e[b]=a})}var d={},e={};c("transform",["webkitTransform","msTransform"]),c("transformOrigin",["webkitTransformOrigin"]),c("perspective",["webkitPerspective"]),c("perspectiveOrigin",["webkitPerspectiveOrigin"]),a.propertyName=function(a){return d[a]||a},a.unprefixedPropertyName=function(a){return e[a]||a}}(b)}(),function(){if(void 0===document.createElement("div").animate([]).oncancel){var a;if(window.performance&&performance.now)var a=function(){return performance.now()};else var a=function(){return Date.now()};var b=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="cancel",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()},c=window.Element.prototype.animate;window.Element.prototype.animate=function(d,e){var f=c.call(this,d,e);f._cancelHandlers=[],f.oncancel=null;var g=f.cancel;f.cancel=function(){g.call(this);var c=new b(this,null,a()),d=this._cancelHandlers.concat(this.oncancel?[this.oncancel]:[]);setTimeout(function(){d.forEach(function(a){a.call(c.target,c)})},0)};var h=f.addEventListener;f.addEventListener=function(a,b){"function"==typeof b&&"cancel"==a?this._cancelHandlers.push(b):h.call(this,a,b)};var i=f.removeEventListener;return f.removeEventListener=function(a,b){if("cancel"==a){var c=this._cancelHandlers.indexOf(b);c>=0&&this._cancelHandlers.splice(c,1)}else i.call(this,a,b)},f}}}(),function(a){var b=document.documentElement,c=null,d=!1;try{var e=getComputedStyle(b).getPropertyValue("opacity"),f="0"==e?"1":"0";c=b.animate({opacity:[f,f]},{duration:1}),c.currentTime=0,d=getComputedStyle(b).getPropertyValue("opacity")==f}catch(a){}finally{c&&c.cancel()}if(!d){var g=window.Element.prototype.animate;window.Element.prototype.animate=function(b,c){return window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||null===b||(b=a.convertToArrayForm(b)),g.call(this,b,c)}}}(a)}();
//# sourceMappingURL=web-animations.min.js.map

L.DomUtil = L.extend(L.DomUtil, {
  getMatrixString: function(m) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d;

    /*
     * Since matrix3d takes a 4*4 matrix, we add in an empty row and column,
     * which act as the identity on the z-axis.
     * See:
     *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
     *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
     */
    var matrix = [
      m[0], m[3], 0, m[6],
      m[1], m[4], 0, m[7],
      0, 0, 1, 0,
      m[2], m[5], 0, m[8],
    ];

    var str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

    if (!is3d) {
      console
          .log('Your browser must support 3D CSS transforms' +
          'in order to use DistortableImageOverlay.');
    }

    return str;
  },

  getRotateString: function(angle, units) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d;
    var open = 'rotate' + (is3d ? '3d' : '') + '(';
    var rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;

    return open + rotateString + ')';
  },

  toggleClass: function(el, className) {
    var c = className;
    return this.hasClass(el, c) ?
      this.removeClass(el, c) : this.addClass(el, c);
  },

  confirmDelete: function() {
    return window.confirm('Are you sure?' +
      ' This image will be permanently deleted from the map.');
  },

  confirmDeletes: function(n) {
    var humanized = n === 1 ? 'image' : 'images';

    return window.confirm('Are you sure? ' + n +
    ' ' + humanized + ' will be permanently deleted from the map.');
  },
});

L.IconUtil = {
  /* creates an svg elemenet with built in accessibility properties
   * and standardized classes for styling, takes in the fragment
   * identifier (id) of the symbol to reference. note for symplicity
   * we allow providing the icon target with or without the '#' prefix
   */
  create: function(ref) {
    if (/^#/.test(ref)) {
      ref = ref.replace(/^#/, '');
    }

    return (
      '<svg class="ldi-icon ldi-' + ref + '"role="img" focusable="false">' +
      '<use xlink:href="#' + ref + '"></use>' +
      '</svg>'
    );
  },

  addClassToSvg: function(container, loader) {
    var svg = container.querySelector('svg');

    if (svg) {
      L.DomUtil.addClass(svg, loader);
    }
  },

  // finds the use element and toggles its icon reference
  toggleXlink: function(container, ref1, ref2) {
    if (!/^#/.test(ref1)) {
      ref1 = '#' + ref1;
    }
    if (!/^#/.test(ref2)) {
      ref2 = '#' + ref2;
    }

    var use = container.querySelector('use');
    if (use) {
      var toggled = use.getAttribute('xlink:href') === ref1 ? ref2 : ref1;
      use.setAttribute('xlink:href', toggled);
      return toggled;
    }
    return false;
  },

  toggleTitle: function(container, title1, title2) {
    var toggled = container.getAttribute('title') === title1 ? title2 : title1;

    container.setAttribute('title', toggled);
    if (container.hasAttribute('aria-label')) {
      container.setAttribute('aria-label', toggled);
    }
    return toggled;
  },
};

L.ImageUtil = {

  getCmPerPixel: function(overlay) {
    var map = overlay._map;

    var dist = map
        .latLngToLayerPoint(overlay.getCorner(0))
        .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  },
};

L.MatrixUtil = {

  // Compute the adjugate of m
  adj: function(m) {
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
    ];
  },

  // multiply two 3*3 matrices
  multmm: function(a, b) {
    var c = [];
    var i;

    for (i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var cij = 0;

        for (var k = 0; k < 3; k++) {
          cij += a[3*i + k]*b[3*k + j];
        }

        c[3*i + j] = cij;
      }
    }

    return c;
  },

  // multiply a 3*3 matrix and a 3-vector
  multmv: function(m, v) {
    return [
      m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
      m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2],
    ];
  },

  // multiply a scalar and a 3*3 matrix
  multsm: function(s, m) {
    var matrix = [];

    for (var i = 0, l = m.length; i < l; i++) {
      matrix.push(s*m[i]);
    }

    return matrix;
  },

  basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [
      x1, x2, x3,
      y1, y2, y3,
      1, 1, 1,
    ];
    var v = L.MatrixUtil.multmv(L.MatrixUtil.adj(m), [x4, y4, 1]);

    return L.MatrixUtil.multmm(m, [
      v[0], 0, 0,
      0, v[1], 0,
      0, 0, v[2],
    ]);
  },


  project: function(m, x, y) {
    var v = L.MatrixUtil.multmv(m, [x, y, 1]);

    return [v[0]/v[2], v[1]/v[2]];
  },

  general2DProjection: function(
      x1s, y1s, x1d, y1d,
      x2s, y2s, x2d, y2d,
      x3s, y3s, x3d, y3d,
      x4s, y4s, x4d, y4d
  ) {
    var s = L.MatrixUtil
        .basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = L.MatrixUtil
        .basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    var m = L.MatrixUtil.multmm(d, L.MatrixUtil.adj(s));

    /*
 *Normalize to the unique matrix with m[8] == 1.
 * See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
 */
    return L.MatrixUtil.multsm(1/m[8], m);
  },
};

L.TrigUtil = {

  calcAngleDegrees: function(x, y) {
    var pointAngle = Math.atan2(y, x);
    return this.radiansToDegrees(pointAngle);
  },

  radiansToDegrees: function(angle) {
    return angle * 180 / Math.PI;
  },

  degreesToRadians: function(angle) {
    return angle * Math.PI / 180;
  },

};

L.DistortableImageOverlay = L.ImageOverlay.extend({

  options: {
    height: 200,
    crossOrigin: true,
    // todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
    edgeMinWidth: 50,
    editable: true,
    mode: 'distort',
    selected: false,
  },

  initialize: function(url, options) {
    L.setOptions(this, options);

    this.edgeMinWidth = this.options.edgeMinWidth;
    this.editable = this.options.editable;
    this._selected = this.options.selected;
    this._url = url;
    this.rotation = 0;
  },

  onAdd: function(map) {
    this._map = map;
    if (!this._image) { this._initImage(); }
    if (!this._events) { this._initEvents(); }

    map.on('viewreset', this._reset, this);

    if (this.options.corners) {
      this._corners = this.options.corners;
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
    }

    // Have to wait for the image to load because need to access its w/h
    L.DomEvent.on(this._image, 'load', function() {
      // containing each img in a div element will give us better control
      // over styling, touch events, etc.
      var wrapper = L.DomUtil.create('div', 'wrapper', this.getPane());
      wrapper.appendChild(this._image);
      this._initImageDimensions();
      this._reset();
      /* Initialize default corners if not already set */
      if (!this._corners) {
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on('zoomanim', this._animateZoom, this);
        }
      }
      /** if there is a featureGroup, only its editable option matters */
      var eventParents = this._eventParents;
      if (eventParents) {
        this.eP = eventParents[Object.keys(eventParents)[0]];
        if (this.eP.editable) { this.editing.enable(); }
      } else {
        if (this.editable) { this.editing.enable(); }
        this.eP = false;
      }
    }, this);

    L.DomEvent.on(this._image, 'click', this.select, this);

    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
    }, this);

    /**
     * custom events fired from DoubleClickLabels.js. Used to differentiate
     * single / dblclick to not deselect images on map dblclick.
     */
    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this.deselect, this);
    }

    this.fire('add');
  },

  onRemove: function(map) {
    L.DomEvent.off(this._image, 'click', this.select, this);
    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
    }, this);
    L.DomEvent.off(map, 'click', this.deselect, this);

    if (this.editing) { this.editing.disable(); }
    this.fire('remove');

    L.ImageOverlay.prototype.onRemove.call(this, map);
  },

  _initImageDimensions: function() {
    var map = this._map;
    var originalImageWidth = L.DomUtil.getStyle(this._image, 'width');
    var originalImageHeight = L.DomUtil.getStyle(this._image, 'height');
    var aspectRatio =
        parseInt(originalImageWidth) / parseInt(originalImageHeight);
    var imageHeight = this.options.height;
    var imageWidth = parseInt(aspectRatio * imageHeight);
    var center = map.latLngToContainerPoint(map.getCenter());
    var offset = L.point(imageWidth, imageHeight).divideBy(2);

    if (this.options.corners) {
      this._corners = this.options.corners;
    } else {
      this._corners = [
        map.containerPointToLatLng(center.subtract(offset)),
        map.containerPointToLatLng(
            center.add(L.point(offset.x, -offset.y))
        ),
        map.containerPointToLatLng(
            center.add(L.point(-offset.x, offset.y))
        ),
        map.containerPointToLatLng(center.add(offset)),
      ];
    }

    this.setBounds(L.latLngBounds(this._corners));

    this._initialDimensions = {
      'height': imageHeight,
      'width': imageWidth,
      'offset': offset,
    };
  },

  _singleClick: function(e) {
    if (e.type === 'singleclick') { this.deselect(); }
    else { return; }
  },

  _singleClickListeners: function() {
    var map = this._map;
    L.DomEvent.off(map, 'click', this.deselect, this);
    L.DomEvent.on(map, 'singleclick', this.deselect, this);
  },

  _resetClickListeners: function() {
    var map = this._map;
    L.DomEvent.on(map, 'click', this.deselect, this);
    L.DomEvent.off(map, 'singleclick', this.deselect, this);
  },

  isSelected: function() {
    return this._selected;
  },

  deselect: function() {
    var edit = this.editing;

    if (!edit.enabled()) { return false; }

    edit._removeToolbar();
    edit._hideMarkers();
    this._selected = false;

    return this;
  },

  select: function(e) {
    var map = this._map;
    var edit = this.editing;
    var img = this.getElement();

    if (!edit.enabled()) { return false; }

    if (e) { L.DomEvent.stopPropagation(e); }

    // this ensures deselection of all other images, allowing us to keep collection group optional
    this._programmaticGrouping();

    this._selected = true;
    edit._addToolbar();
    edit._showMarkers();

    // we run the selection logic 1st anyway because the collection group's _addToolbar method depends on it
    if (L.DomUtil.hasClass(img, 'collected')) {
      this.deselect();
      return false;
    }

    if (e && !e.shiftKey) {
      var src = e.sourceCapabilities;
      if (L.Browser.touch && (src && src.firesTouchEvents)) {
        map._clicked += 1;
        this._map._clickTimeout = setTimeout(L.bind(function() {
          if (map._clicked === 1) {
            map._clicked = 0;
          } else {
            map._stamp = L.Util.stamp(this); // allows us to access later exactly which overlay fire the event
            map._fireDOMEvent(e, 'dblclick');
          }
        }, this), 350);
      }
    }

    return this;
  },

  _programmaticGrouping: function() {
    this._map.eachLayer(function(layer) {
      if (layer instanceof L.DistortableImageOverlay) {
        layer.deselect();
      }
    });
  },

  setCorner: function(corner, latlng) {
    var edit = this.editing;

    this._corners[corner] = latlng;

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  _cornerExceedsMapLats: function(zoom, corner) {
    var map = this._map;
    var cornerY = map.project(corner, zoom).y;
    var lowerLimit = map.project(map.getBounds()._southWest, zoom);
    var upperLimit = map.project(map.getBounds()._northEast, zoom);

    return cornerY <= upperLimit.y || cornerY >= lowerLimit.y;
  },

  setCorners: function(latlngObj) {
    var map = this._map;
    var zoom = map.getZoom();
    var edit = this.editing;
    var i = 0;
    // this is to fix https://github.com/publiclab/Leaflet.DistortableImage/issues/402
    for (var k in latlngObj) {
      if (this._cornerExceedsMapLats(zoom, latlngObj[k])) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (k in latlngObj) {
      this._corners[i] = latlngObj[k];
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  setCornersFromPoints: function(pointsObj) {
    var map = this._map;
    var zoom = map.getZoom();
    var edit = this.editing;
    var i = 0;

    for (var k in pointsObj) {
      var corner = map.layerPointToLatLng(pointsObj[k]);

      if (this._cornerExceedsMapLats(zoom, corner)) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (k in pointsObj) {
      this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  scaleBy: function(scale) {
    var map = this._map;
    var center = map.project(this.getCenter());
    var i;
    var p;
    var scaledCorners = {};

    if (scale === 0) { return; }

    for (i = 0; i < 4; i++) {
      p = map
          .project(this.getCorner(i))
          .subtract(center)
          .multiplyBy(scale)
          .add(center);
      scaledCorners[i] = map.unproject(p);
    }

    this.setCorners(scaledCorners);

    return this;
  },

  rotateBy: function(angle) {
    var map = this._map;
    var center = map.project(this.getCenter());
    var corners = {};
    var i;
    var p;
    var q;

    for (i = 0; i < 4; i++) {
      p = map.project(this.getCorner(i)).subtract(center);
      q = L.point(
          Math.cos(angle) * p.x - Math.sin(angle) * p.y,
          Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      corners[i] = map.unproject(q.add(center));
    }

    this.setCorners(corners);

    // window.angle = L.TrigUtil.radiansToDegrees(angle);

    this.rotation -= L.TrigUtil.radiansToDegrees(angle);

    return this;
  },

  _revert: function() {
    var a = this.rotation;
    var map = this._map;
    var edit = this.editing;
    var center = map.project(this.getCenter());
    var offset = this._initialDimensions.offset;
    var corners = {
      0: map.unproject(center.subtract(offset)),
      1: map.unproject(center.add(L.point(offset.x, -offset.y))),
      2: map.unproject(center.add(L.point(-offset.x, offset.y))),
      3: map.unproject(center.add(offset)),
    };

    edit._hideMarkers();

    this.setCorners(corners);

    if (a !== 0) { this.rotateBy(L.TrigUtil.degreesToRadians(360 - a)); }

    edit._showMarkers();

    this.rotation = a;
  },

  /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
  /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
  _getTranslateString: function(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android)
    // using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used.
    // Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    var is3d = L.Browser.webkit3d;
    var open = 'translate' + (is3d ? '3d' : '') + '(';
    var close = (is3d ? ',0' : '') + ')';

    return open + point.x + 'px,' + point.y + 'px' + close;
  },

  _reset: function() {
    var map = this._map;
    var image = this._image;
    var latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map);
    var transformMatrix = this
        ._calculateProjectiveTransform(latLngToLayerPoint);
    var topLeft = latLngToLayerPoint(this.getCorner(0));
    var warp = L.DomUtil.getMatrixString(transformMatrix);
    var translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

    /* Set origin to the upper-left corner rather than
     * the center of the image, which is the default.
     */
    image.style[L.DomUtil.TRANSFORM + '-origin'] = '0 0 0';
  },

  /*
   * Calculates the transform string that will be
   * correct *at the end* of zooming.
   * Leaflet then generates a CSS3 animation between the current transform and
   * future transform which makes the transition appear smooth.
   */
  _animateZoom: function(event) {
    var map = this._map;
    var image = this._image;
    var latLngToNewLayerPoint = function(latlng) {
      return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
    };
    var transformMatrix = this._calculateProjectiveTransform(
        latLngToNewLayerPoint
    );
    var topLeft = latLngToNewLayerPoint(this.getCorner(0));
    var warp = L.DomUtil.getMatrixString(transformMatrix);
    var translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
  },

  getCorners: function() {
    return this._corners;
  },

  getCorner: function(i) {
    return this._corners[i];
  },

  // image (vertex) centroid calculation
  getCenter: function() {
    var map = this._map;
    var reduce = this.getCorners().reduce(function(agg, corner) {
      return agg.add(map.project(corner));
    }, L.point(0, 0));
    return map.unproject(reduce.divideBy(4));
  },

  _calcCenterTwoCornerPoints: function(topLeft, topRight) {
    var toolPoint = {x: '', y: ''};

    toolPoint.x = topRight.x + (topLeft.x - topRight.x) / 2;
    toolPoint.y = topRight.y + (topLeft.y - topRight.y) / 2;

    return toolPoint;
  },

  _calculateProjectiveTransform: function(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    var offset = latLngToCartesian(this._corners[0]);
    var w = this._image.offsetWidth || 500;
    var h = this._image.offsetHeight || 375;
    var c = [];
    var j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < this._corners.length; j++) {
      c.push(latLngToCartesian(this._corners[j])._subtract(offset));
    }

    /*
     * This matrix describes the action of
     * the CSS transform on each corner of the image.
     * It maps from the coordinate system centered
     * at the upper left corner of the image
     * to the region bounded by the latlngs in this._corners.
     * For example:
     * 0, 0, c[0].x, c[0].y
     * says that the upper-left corner of the image
     * maps to the first latlng in this._corners.
     */
    return L.MatrixUtil.general2DProjection(
        0, 0, c[0].x, c[0].y,
        w, 0, c[1].x, c[1].y,
        0, h, c[2].x, c[2].y,
        w, h, c[3].x, c[3].y
    );
  },
});

L.distortableImageOverlay = function(id, options) {
  return new L.DistortableImageOverlay(id, options);
};

L.Map.addInitHook(function() {
  if (!L.DomUtil.hasClass(this.getContainer(), 'ldi')) {
    L.DomUtil.addClass(this.getContainer(), 'ldi');
  }
});

L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true,
  },

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);

    this.editable = this.options.editable;
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    if (this.editable) { this.editing.enable(); }

    this._animHandles = L.layerGroup();
    // this._layerCount = 0;

    /**
     * although we have a DistortableCollection.Edit class that handles collection events to keep our code managable,
     * events that need to be added on individual images are kept here to do so through `layeradd`.
     */
    this.on('layeradd', this._addEvents, this);
    this.on('layerremove', this._removeEvents, this);
  },

  onRemove: function() {
    if (this.editing) { this.editing.disable(); }

    this.off('layeradd', this._addEvents, this);
    this.off('layerremove', this._removeEvents, this);
  },

  _addEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      /* Enable longpress for multi select for touch devices. */
      contextmenu: this._longPressMultiSelect,
    }, this);

    this._animHandles.addLayer(new L.MutationAnim(layer._image, this));
    // this._layerCount++;
  },

  _removeEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _collect: function(layer) {
    var groupEdit = this.editing;
    var edit = layer.editing;
    var div = layer.getElement().parentNode;

    layer.deselect();
    if (edit.isMode('lock')) { edit._showMarkers(); }

    if (this.getCollected().length === 1) {
      groupEdit._mode = edit.isMode('lock') ? 'lock' : 'unlock';
      groupEdit._addToolbar();
      if (groupEdit.toolbar) {
        groupEdit.toolbar.clickTool(groupEdit._mode);
      }
      groupEdit._collectionOn(layer);
    } else {
      if (this._hasGroupMode()) {
        groupEdit._mode = this._allLayersLocked() ? 'lock' : 'unlock';
        if (groupEdit.toolbar) {
          groupEdit.toolbar.clickTool(groupEdit._mode);
        }
      } else { groupEdit._mode = ''; }
      L.DomUtil.removeClass(div, 'wrapcollect');
    }
    groupEdit._refresh();
  },

  _uncollect: function(layer) {
    var groupEdit = this.editing;
    var div = layer.getElement().parentNode;

    if (!this.anyCollected()) {
      groupEdit._mode = '';
      groupEdit._refresh();
      groupEdit._removeToolbar();
      groupEdit._collectionOff(layer);
    } else {
      layer.deselect();
      L.DomUtil.addClass(div, 'wrapcollect');
      if (this._hasGroupMode()) {
        groupEdit._mode = this._allLayersLocked() ? 'lock' : 'unlock';
        if (groupEdit.toolbar) {
          groupEdit.toolbar.clickTool(groupEdit._mode);
        }
      } else { groupEdit._mode = ''; }
      groupEdit._refresh();
    }
  },

  _longPressMultiSelect: function(e) {
    if (!this.editable) { return; }

    e.preventDefault();

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'collected');
        if (L.DomUtil.hasClass(layer.getElement(), 'collected')) {
          this._collect(layer);
        } else {
          this._uncollect(layer);
        }
      }
    }, this);
  },

  isCollected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'collected');
  },

  anyCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.some(this.isCollected.bind(this));
  },

  getCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.filter(this.isCollected.bind(this));
  },

  getNotCollectedLayers: function() {
    var layerArr = this.getLayers();
    return layerArr.filter(!this.isCollected.bind(this));
  },

  _toggleCollected: function(e) {
    if (!this.editable) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (e.target === layer.getElement() && edit.enabled()) {
        L.DomUtil.toggleClass(e.target, 'collected');
        if (L.DomUtil.hasClass(e.target, 'collected')) {
          this._collect(layer);
        } else {
          this._uncollect(layer);
        }
      }
    }, this);
  },

  _deselectOthers: function(e) {
    this.eachLayer(function(layer) {
      if (layer.getElement() !== e.target) { layer.deselect(); }
    });

    if (e.shiftKey) { this._toggleCollected(e); }
  },

  _otherSelected: function() {
    this.eachLayer(function(layer) {
      if (layer._collectedAnim) {
        return layer._collectedAnim.currentTime;
      }
    });
    return false;
  },

  _dragStartMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;
    var i;

    if (!this.isCollected(overlay)) { return; }

    this.eachLayer(function(layer) {
      layer._dragStartPoints = {};
      layer.deselect();
      for (i = 0; i < 4; i++) {
        var c = layer.getCorner(i);
        layer._dragStartPoints[i] = map.latLngToLayerPoint(c);
      }
    });
  },

  _dragMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;

    if (!this.isCollected(overlay)) { return; }

    var topLeft = map.latLngToLayerPoint(overlay.getCorner(0));
    var delta = overlay._dragStartPoints[0].subtract(topLeft);

    this._updateCollectionFromPoints(delta, overlay);
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing.getMode();
      return (this.isCollected(layer) && mode !== 'lock');
    }, this);
  },

  _toMove: function(overlay) {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing.getMode();
      return layer !== overlay && this.isCollected(layer) && mode !== 'lock';
    }, this);
  },

  _hasGroupMode: function() {
    return this._allLayersLocked() || this._allLayersNotLocked();
  },

  _allLayersLocked: function() {
    var layerArr = this.getCollected();

    return layerArr.every(function(layer) {
      return layer.editing.isMode('lock');
    });
  },

  _allLayersNotLocked: function() {
    var layerArr = this.getCollected();

    return layerArr.every(function(layer) {
      return !layer.editing.isMode('lock');
    });
  },

  _updateCollectionFromPoints: function(delta, overlay) {
    var layersToMove = this._toMove(overlay);
    var p = new L.Transformation(1, -delta.x, 1, -delta.y);
    var i;

    layersToMove.forEach(function(layer) {
      var movedPoints = {};
      for (i = 0; i < 4; i++) {
        movedPoints[i] = p.transform(layer._dragStartPoints[i]);
      }
      layer.setCornersFromPoints(movedPoints);
    });
  },

  _getAvgCmPerPixel: function(imgs) {
    var reduce = imgs.reduce(function(sum, img) {
      return sum + img.cm_per_pixel;
    }, 0);
    return reduce / imgs.length;
  },

  generateExportJson: function() {
    var json = {};
    json.images = [];

    this.eachLayer(function(layer) {
      if (this.isCollected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        var zc = layer.getCorners();
        var corners = [
          {lat: zc[0].lat, lon: zc[0].lng},
          {lat: zc[1].lat, lon: zc[1].lng},
          {lat: zc[3].lat, lon: zc[3].lng},
          {lat: zc[2].lat, lon: zc[2].lng},
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer),
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};

/* eslint-disable no-unused-vars */
L.EXIF = function getEXIFdata(img) {
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    var GPS = EXIF.getAllTags(img);
    var altitude;

    /* If the lat/lng is available. */
    if (
      typeof GPS.GPSLatitude !== 'undefined' &&
      typeof GPS.GPSLongitude !== 'undefined'
    ) {
      // sadly, encoded in [degrees,minutes,seconds]
      // primitive value = GPS.GPSLatitude[x].numerator
      var lat =
        GPS.GPSLatitude[0] +
        GPS.GPSLatitude[1] / 60 +
        GPS.GPSLatitude[2] / 3600;
      var lng =
        GPS.GPSLongitude[0] +
        GPS.GPSLongitude[1] / 60 +
        GPS.GPSLongitude[2] / 3600;

      if (GPS.GPSLatitudeRef !== 'N') {
        lat = lat * -1;
      }
      if (GPS.GPSLongitudeRef === 'W') {
        lng = lng * -1;
      }
    }

    // Attempt to use GPS compass heading; will require
    // some trig to calc corner points, which you can find below:

    var angle = 0;
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === 'T') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
      // "M" refers to "Magnetic north"
    } else if (GPS.GPSImgDirectionRef === 'M') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
      console.log('No compass data found');
    }

    console.log('Orientation:', GPS.Orientation);

    /* If there is orientation data -- i.e. landscape/portrait etc */
    if (GPS.Orientation === 6) {
      // CCW
      angle += (Math.PI / 180) * -90;
    } else if (GPS.Orientation === 8) {
      // CW
      angle += (Math.PI / 180) * 90;
    } else if (GPS.Orientation === 3) {
      // 180
      angle += (Math.PI / 180) * 180;
    }

    /* If there is altitude data */
    if (
      typeof GPS.GPSAltitude !== 'undefined' &&
      typeof GPS.GPSAltitudeRef !== 'undefined'
    ) {
      // Attempt to use GPS altitude:
      // (may eventually need to find EXIF field of view for correction)
      if (
        typeof GPS.GPSAltitude !== 'undefined' &&
        typeof GPS.GPSAltitudeRef !== 'undefined'
      ) {
        altitude =
          GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
          GPS.GPSAltitudeRef;
      } else {
        altitude = 0; // none
      }
    }
  } else {
    alert('EXIF initialized. Press again to view data in console.');
  }
};

L.EditHandle = L.Marker.extend({
  initialize: function(overlay, corner, options) {
    var latlng = overlay.getCorner(corner);

    L.setOptions(this, options);

    this._handled = overlay;
    this._corner = corner;

    var markerOptions = {
      draggable: true,
      zIndexOffset: 10,
    };

    if (options && options.hasOwnProperty('draggable')) {
      markerOptions.draggable = options.draggable;
    }

    L.Marker.prototype.initialize.call(this, latlng, markerOptions);
  },

  onAdd: function(map) {
    L.Marker.prototype.onAdd.call(this, map);
    this._bindListeners();

    this.updateHandle();
  },

  onRemove: function(map) {
    this._unbindListeners();
    L.Marker.prototype.onRemove.call(this, map);
  },

  _onHandleDragStart: function() {
    this._handled.fire('editstart');
  },

  _onHandleDragEnd: function() {
    this._fireEdit();
  },

  _fireEdit: function() {
    this._handled.edited = true;
    this._handled.fire('edit');
  },

  _bindListeners: function() {
    this.on({
      contextmenu: L.DomEvent.stop,
      dragstart: this._onHandleDragStart,
      drag: this._onHandleDrag,
      dragend: this._onHandleDragEnd,
    }, this);

    this._handled._map.on('zoomend', this.updateHandle, this);
    this._handled.on('update', this.updateHandle, this);
  },

  _unbindListeners: function() {
    this.off({
      contextmenu: L.DomEvent.stop,
      dragstart: this._onHandleDragStart,
      drag: this._onHandleDrag,
      dragend: this._onHandleDragEnd,
    }, this);

    this._handled._map.off('zoomend', this.updateHandle, this);
    this._handled.off('update', this.updateHandle, this);
  },

  /* Takes two latlngs and calculates the scaling difference. */
  _calculateScalingFactor: function(latlngA, latlngB) {
    var overlay = this._handled;
    var map = overlay._map;

    var centerPoint = map.latLngToLayerPoint(overlay.getCenter());
    var formerPoint = map.latLngToLayerPoint(latlngA);
    var newPoint = map.latLngToLayerPoint(latlngB);
    var formerRadiusSquared = this._d2(centerPoint, formerPoint);
    var newRadiusSquared = this._d2(centerPoint, newPoint);

    return Math.sqrt(newRadiusSquared / formerRadiusSquared);
  },

  /* Distance between two points in cartesian space, squared (distance formula). */
  _d2: function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;

    return Math.pow(dx, 2) + Math.pow(dy, 2);
  },

  /* Takes two latlngs and calculates the angle between them. */
  calculateAngleDelta: function(latlngA, latlngB) {
    var overlay = this._handled;
    var map = overlay._map;

    var centerPoint = map.latLngToLayerPoint(overlay.getCenter());
    var formerPoint = map.latLngToLayerPoint(latlngA);
    var newPoint = map.latLngToLayerPoint(latlngB);

    var initialAngle = (
      Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x)
    );
    var newAngle = (
      Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x)
    );

    return newAngle - initialAngle;
  },
});

L.DistortableImage = L.DistortableImage || {};

L.MutationAnim = L.Class.extend({
  options: {
    duration: 2500,
    fill: 'none',
    easing: 'linear',
    iterations: Infinity,
  },

  initialize: function(element, group, options) {
    this._element = element;
    this._group = group;
    L.setOptions(this, options);
    this.config = {attributes: true};
  },

  onAdd: function(element, group, options) {
    this._element = element;
    this._group = group;
    this.config = options.config;
  },

  //   _startObservering: function(el) {
  //     this._observer.observe(el, this.config);
  //   },

//   onRemove: function(group, element, options) {
//     this._observer.disconnect();
//   },
});

L.MutationAnim.addInitHook(function() {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var group = this._group;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.group = group;
      var className = mutation.target.getAttribute('class');
      if (className.indexOf('collected') !== -1) {
        if (className.indexOf('lock') === -1) {
          mutation.target._animation.play();
          mutation.target._animation.startTime = mutation.group._otherSelected() || mutation.target._animation.currentTime / 3000;
        } else {
          mutation.target._animation.currentTime = 1500;
          mutation.target._animation.pause();
        }
      } else {
        mutation.target._animation.currentTime = 0;
        mutation.target._animation.pause();
      }
    }, this);
  }, this);

  // polyfill covers prefix handling: https://github.com/web-animations/web-animations-js
  this._element._animation = this._element.animate({
    filter: ['none', 'drop-shadow(0 0 1rem #ffea00)', 'drop-shadow(0 0 2.5rem #ffea00)', 'none']}, {
    duration: 2500,
    fill: 'none',
    easing: 'linear',
    iterations: Infinity,
  });

  this._element._animation.pause();

  observer.observe(this._element, {attributes: true});
});

L.DistortHandle = L.EditHandle.extend({
  options: {
    TYPE: 'distort',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0NTkiIGhlaWdodD0iNDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iIj48cmVjdCBpZD0iYmFja2dyb3VuZHJlY3QiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHg9IjAiIHk9IjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgY2xhc3M9IiIgc3R5bGU9IiIvPjxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjx0aXRsZT5MYXllciAxPC90aXRsZT48cGF0aCBkPSJNNDU5LjA0OTE1OTUzMDQ3MTM0LDg2LjkyNjIzNDUxMjU1MDAyIFYwIGgtODUuNzE0NTczMzU2MzEyMDkgdjI3LjA0MzcxNzQwMzkwNDQ1MiBIODUuNzE0NTczMzU2MzEyMDMgVjAgSDAgdjg2LjkyNjIzNDUxMjU1MDAyIGgyNS43MTQzNzIwMDY4OTM2MjYgdjI4OS43NTQxMTUwNDE4MzM0IEgwIHY4Ni45MjYyMzQ1MTI1NTAwMiBoODUuNzE0NTczMzU2MzEyMDkgdi0yNy4wNDM3MTc0MDM5MDQ0NTIgaDI4NS43MTUyNDQ1MjEwNDAzIHYyNy4wNDM3MTc0MDM5MDQ0NTIgaDg1LjcxNDU3MzM1NjMxMjA5IHYtODYuOTI2MjM0NTEyNTUwMDIgaC0yMy44MDk2MDM3MTAwODY2OSBWODYuOTI2MjM0NTEyNTUwMDIgSDQ1OS4wNDkxNTk1MzA0NzEzNCB6TTM4NC43NjMxOTU5NTUwMDA5LDEyLjU1NjAxMTY1MTgxMjc4MSBoNjEuOTA0OTY5NjQ2MjI1Mzk2IHY2Mi43ODAwNTgyNTkwNjM5MSBoLTYxLjkwNDk2OTY0NjIyNTM5NiBWMTIuNTU2MDExNjUxODEyNzgxIHpNMTIuMzgwOTkzOTI5MjQ1MDUsMTIuNTU2MDExNjUxODEyNzgxIGg2MS45MDQ5Njk2NDYyMjUzOTYgdjYyLjc4MDA1ODI1OTA2MzkxIEgxMi4zODA5OTM5MjkyNDUwNSBWMTIuNTU2MDExNjUxODEyNzgxIHpNNzQuMjg1OTYzNTc1NDcwNTMsNDUxLjA1MDU3MjQxNTEyMDY2IEgxMi4zODA5OTM5MjkyNDUwNSB2LTYyLjc4MDA1ODI1OTA2MzkxIGg2MS45MDQ5Njk2NDYyMjUzOTYgVjQ1MS4wNTA1NzI0MTUxMjA2NiB6TTQ0NS43MTU3ODE0NTI4MjI3NCw0NTEuMDUwNTcyNDE1MTIwNjYgaC02Mi44NTczNTM3OTQ2Mjg4NjQgdi02Mi43ODAwNTgyNTkwNjM5MSBoNjIuODU3MzUzNzk0NjI4ODY0IFY0NTEuMDUwNTcyNDE1MTIwNjYgek00MDcuNjIwNDE1NTE2Njg0MjYsMzc2LjY4MDM0OTU1NDM4MzQ0IGgtMzYuMTkwNTk3NjM5MzMxNzcgdjMyLjgzODc5OTcwNDc0MTEyIEg4NS43MTQ1NzMzNTYzMTIwMyB2LTMyLjgzODc5OTcwNDc0MTEyIEg0OS41MjM5NzU3MTY5ODAzMiBWODYuOTI2MjM0NTEyNTUwMDIgaDM2LjE5MDU5NzYzOTMzMTc3IFY1MC4yMjQwNDY2MDcyNTExMjUgaDI4Ny42MjAwMTI4MTc4NDcyIHYzNi43MDIxODc5MDUyOTg5IGgzNC4yODU4MjkzNDI1MjQ4MzUgVjM3Ni42ODAzNDk1NTQzODM0NCB6IiBpZD0ic3ZnXzIiIGNsYXNzPSIiIGZpbGw9IiMxYTFhZWIiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    overlay.setCorner(this._corner, this.getLatLng());
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.distortHandle = function(overlay, idx, options) {
  return new L.DistortHandle(overlay, idx, options);
};

L.RotateScaleHandle = L.EditHandle.extend({
  options: {
    TYPE: 'freeRotate',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var angle = this.calculateAngleDelta(formerLatLng, newLatLng);
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    if (angle !== 0) { overlay.rotateBy(angle); }

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToContainerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToContainerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);
    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.LockHandle = L.EditHandle.extend({
  options: {
    TYPE: 'lock',
    interactive: false,
    icon: L.icon({
      // eslint-disable-next-line max-len
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  /* cannot be dragged */
  _onHandleDrag: function() {
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.lockHandle = function(overlay, idx, options) {
  return new L.LockHandle(overlay, idx, options);
};

L.RotateHandle = L.EditHandle.extend({
  options: {
    TYPE: 'rotate',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var angle = this.calculateAngleDelta(formerLatLng, newLatLng);

    /*
     * running rotation logic even for an angle delta of 0
     * prevents a small, occasional marker flicker
     */
    overlay.rotateBy(angle);
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.rotateHandle = function(overlay, idx, options) {
  return new L.RotateHandle(overlay, idx, options);
};

L.ScaleHandle = L.EditHandle.extend({
  options: {
    TYPE: 'scale',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    /*
     * checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
     * this enables preventing scaling to zero, but we might also add an overall scale limit
     */

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToLayerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToLayerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);

    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
      /*
       * running scale logic even for a scale ratio of 1
       * prevents a small, occasional marker flicker
       */
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.scaleHandle = function(overlay, idx, options) {
  return new L.ScaleHandle(overlay, idx, options);
};

/* this is the baseclass other IconSets inherit from,
* we don't use it directly */
L.IconSet = L.Class.extend({

  _svg: '<svg xmlns="http://www.w3.org/2000/svg">',

  _symbols: '',

  render: function() {
    this.addSymbols(this._symbols);
    return this._svg;
  },

  addSymbols: function(symbols) {
    this._svg += symbols;
  },
});

L.KeymapperIconSet = L.IconSet.extend({

  _symbols:
      // eslint-disable-next-line max-len
      '<symbol viewBox="0 0 25 25" id="keyboard_open"><path d="M12 23l4-4H8l4 4zm7-15h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></symbol>',

});

/* eslint-disable max-len */
L.ToolbarIconSet = L.IconSet.extend({
  _symbols:
    '<symbol viewBox="0 0 18 18" id="border_clear"><path d="M5.25 3.75h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm3-3h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm6 6h1.5v-1.5h-1.5v1.5zm6 3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0-9h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm6-4.5v1.5h1.5v-1.5h-1.5zm-6 1.5h1.5v-1.5h-1.5v1.5zm3 12h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="border_outer"><path d="M9.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5zm-10.5-6v13.5h13.5V2.25H2.25zm12 12H3.75V3.75h10.5v10.5zm-4.5-3h-1.5v1.5h1.5v-1.5zm-3-3h-1.5v1.5h1.5v-1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="crop_rotate"><path d="M5.603 16.117C3.15 14.947 1.394 12.57 1.125 9.75H0C.383 14.37 4.245 18 8.963 18c.172 0 .33-.015.495-.023L6.6 15.113l-.997 1.005zM9.037 0c-.172 0-.33.015-.495.03L11.4 2.888l.998-.998a7.876 7.876 0 0 1 4.477 6.36H18C17.617 3.63 13.755 0 9.037 0zM12 10.5h1.5V6A1.5 1.5 0 0 0 12 4.5H7.5V6H12v4.5zM6 12V3H4.5v1.5H3V6h1.5v6A1.5 1.5 0 0 0 6 13.5h6V15h1.5v-1.5H15V12H6z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="delete_forever"><path d="M4.5 14.25c0 .825.675 1.5 1.5 1.5h6c.825 0 1.5-.675 1.5-1.5v-9h-9v9zm1.845-5.34l1.058-1.058L9 9.443l1.59-1.59 1.058 1.058-1.59 1.59 1.59 1.59-1.058 1.058L9 11.558l-1.59 1.59-1.058-1.058 1.59-1.59-1.597-1.59zM11.625 3l-.75-.75h-3.75l-.75.75H3.75v1.5h10.5V3h-2.625z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="distort"><path d="M1.7 1.4H6v1.4h5.8V1.4h4.3v4.3h-1.4v5.8h1.4v4.4h-4.3v-1.5H6v1.5H1.7v-4.4h1.4V5.7H1.7V1.4zm10.1 4.3V4.3H6v1.4H4.6v5.8H6V13h5.8v-1.5h1.4V5.7h-1.4zM3.1 2.8v1.5h1.5V2.8H3.1zm10.1 0v1.5h1.5V2.8h-1.5zM3.1 13v1.4h1.5V13H3.1zm10.1 0v1.4h1.5V13h-1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="explore"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5zM9 15c-3.308 0-6-2.693-6-6 0-3.308 2.692-6 6-6 3.307 0 6 2.692 6 6 0 3.307-2.693 6-6 6zm-4.125-1.875l5.633-2.617 2.617-5.633-5.633 2.617-2.617 5.633zM9 8.175c.457 0 .825.367.825.825A.823.823 0 0 1 9 9.825.823.823 0 0 1 8.175 9c0-.457.367-.825.825-.825z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="flip_to_back"><path d="M6.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm0-6a1.5 1.5 0 0 0-1.5 1.5h1.5v-1.5zm3 9h-1.5v1.5h1.5v-1.5zm4.5-9v1.5h1.5c0-.825-.675-1.5-1.5-1.5zm-4.5 0h-1.5v1.5h1.5v-1.5zm-3 10.5v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm7.5-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6c.825 0 1.5-.675 1.5-1.5h-1.5v1.5zm-10.5-7.5h-1.5v9a1.5 1.5 0 0 0 1.5 1.5h9v-1.5h-9v-9zm7.5-1.5h1.5v-1.5h-1.5v1.5zm0 9h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="flip_to_front"><path d="M2.25 9.75h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm1.5 3v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm-1.5-9h1.5v-1.5h-1.5v1.5zm9 9h1.5v-1.5h-1.5v1.5zm3-13.5h-7.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h7.5c.825 0 1.5-.675 1.5-1.5v-7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-7.5v-7.5h7.5v7.5zm-6 4.5h1.5v-1.5h-1.5v1.5zm-3 0h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="get_app"><path d="M14.662 6.95h-3.15v-4.5H6.787v4.5h-3.15L9.15 12.2l5.512-5.25zM3.637 13.7v1.5h11.025v-1.5H3.637z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="lock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zM6.75 4.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6h-4.5V4.5zM13.5 15h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="opacity"><path d="M13.245 6L9 1.763 4.755 6A6.015 6.015 0 0 0 3 10.23c0 1.5.585 3.082 1.755 4.252a5.993 5.993 0 0 0 8.49 0A6.066 6.066 0 0 0 15 10.23c0-1.5-.585-3.06-1.755-4.23zM4.5 10.5c.008-1.5.465-2.453 1.32-3.3L9 3.952l3.18 3.285c.855.84 1.313 1.763 1.32 3.263h-9z"/></symbol>' +
    '<symbol viewBox="0 0 14 18" id="opacity_empty"><path stroke="#0078A8" stroke-width="1.7" d="M10.708 6.25A5.113 5.113 0 0 1 12.2 9.846c0 1.275-.497 2.62-1.492 3.614a5.094 5.094 0 0 1-7.216 0A5.156 5.156 0 0 1 2 9.846c0-1.275.497-2.601 1.492-3.596L7.1 2.648l3.608 3.602zm0 0L7.1 2.648 3.492 6.25A5.113 5.113 0 0 0 2 9.846c0 1.275.497 2.62 1.492 3.614a5.094 5.094 0 0 0 7.216 0A5.156 5.156 0 0 0 12.2 9.846a5.113 5.113 0 0 0-1.492-3.596z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="restore"><path d="M15.67 3.839a.295.295 0 0 0-.22.103l-5.116 3.249V4.179a.342.342 0 0 0-.193-.315.29.29 0 0 0-.338.078L3.806 7.751v-4.63h-.002l.002-.022c0-.277-.204-.502-.456-.502h-.873V2.6c-.253 0-.457.225-.457.503l.002.026v10.883h.005c.021.257.217.454.452.455l.016-.002h.822c.013.001.025.004.038.004.252 0 .457-.225.457-.502a.505.505 0 0 0-.006-.068V9.318l6.001 3.811a.288.288 0 0 0 .332.074.34.34 0 0 0 .194-.306V9.878l5.12 3.252a.288.288 0 0 0 .332.073.34.34 0 0 0 .194-.306V4.18a.358.358 0 0 0-.09-.24.296.296 0 0 0-.218-.1z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="rotate"><path d="M5.505 4.808L.645 9.675l4.867 4.86 4.868-4.86-4.875-4.868zM2.768 9.675L5.513 6.93 8.25 9.675 5.505 12.42 2.768 9.675zM14.52 4.98A6.713 6.713 0 009.75 3V.57L6.57 3.75l3.18 3.18V4.5a5.23 5.23 0 013.713 1.537 5.255 5.255 0 010 7.426 5.23 5.23 0 01-5.843 1.08L6.503 15.66a6.76 6.76 0 003.247.84c1.725 0 3.457-.66 4.77-1.98a6.735 6.735 0 000-9.54z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="scale" > <path d="M8.25 9h-6a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h6a.75.75 0 00.75-.75v-6A.75.75 0 008.25 9zm-.75 6H3v-4.5h4.5V15zm8.94-13.035a.75.75 0 00-.405-.405.75.75 0 00-.285-.06h-4.5a.75.75 0 000 1.5h2.692L9.967 6.968a.75.75 0 000 1.064.75.75 0 001.065 0L15 4.057V6.75a.75.75 0 101.5 0v-4.5a.75.75 0 00-.06-.285z" /></symbol>' +
    '<symbol viewBox="0 0 18 18" id="spinner"><path d="M9 6.48c-.216 0-.36-.144-.36-.36V3.24c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36z"/><path d="M9 15.12c-.216 0-.36-.144-.36-.36v-2.88c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36zm1.44-8.28c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144zm-4.32 7.488c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144z" opacity=".3"/><path d="M7.56 6.84c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108L7.848 6.3c.108.144.036.36-.108.468-.072.072-.108.072-.18.072z" opacity=".93"/><path d="M11.88 14.328c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108l1.44 2.484c.108.144.036.36-.108.468-.072.036-.108.072-.18.072z" opacity=".3"/><path d="M6.12 9.36H3.24c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".65"/><path d="M14.76 9.36h-2.88c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".3"/><path d="M6.516 7.884c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".86"/><path d="M14.004 12.204c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".3"/><path d="M3.996 12.204c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.036.072-.108.072-.18.072z" opacity=".44"/><path d="M11.484 7.884c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.072.072-.108.072-.18.072z" opacity=".3"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="transform"><path d="M16.5 13.5V12H6V3h1.5L5.25.75 3 3h1.5v1.5h-3V6h3v6c0 .825.675 1.5 1.5 1.5h6V15h-1.5l2.25 2.25L15 15h-1.5v-1.5h3zM7.5 6H12v4.5h1.5V6c0-.825-.675-1.5-1.5-1.5H7.5V6z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="unlock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5h1.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>',
});

L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.EditAction = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      svg: false,
      html: '',
      className: '',
      tooltip: '',
    },
  },

  initialize: function(map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.setOptions(this, options);
    L.Toolbar2.Action.prototype.initialize.call(this, options);

    this._injectIconSet();
  },

  _createIcon: function(toolbar, container, args) {
    var iconOptions = this.options.toolbarIcon;
    var className = iconOptions.className;
    var edit = this._overlay.editing;

    this._icon = L.DomUtil.create('li', '', container);
    this._link = L.DomUtil.create('a', '', this._icon);

    if (iconOptions.svg) {
      this._link.innerHTML = L.IconUtil.create(iconOptions.html);
    } else {
      this._link.innerHTML = iconOptions.html;
    }

    this._link.setAttribute('href', '#');
    this._link.setAttribute('title', iconOptions.tooltip);
    this._link.setAttribute('role', 'button');

    L.DomUtil.addClass(this._link, this.constructor.baseClass);

    if (className) {
      L.DomUtil.addClass(this._link, className);
      if (className === 'disabled') {
        L.DomUtil.addClass(this._icon, className);
      }
      if (className === edit._mode) {
        L.DomUtil.addClass(this._link, 'selected-mode');
      } else {
        L.DomUtil.removeClass(this._link, 'selected-mode');
      }
    }

    L.DomEvent.on(this._link, 'click', this.enable, this);

    /* Add secondary toolbar */
    this._addSubToolbar(toolbar, this._icon, args);
  },

  _injectIconSet: function() {
    if (document.querySelector('#iconset')) {
      return;
    }

    var el = document.createElement('div');
    el.id = 'iconset';
    el.setAttribute('hidden', 'hidden');
    el.innerHTML = new L.ToolbarIconSet().render();

    document.querySelector('.leaflet-marker-pane').appendChild(el);
  },
});

L.editAction = function(map, overlay, options) {
  return new L.EditAction(map, overlay, options);
};

L.BorderAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var mode = edit._mode;
    var use;
    var tooltip;

    if (edit._outlined) {
      use = 'border_outer';
      tooltip = 'Remove Border';
    } else {
      use = 'border_clear';
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: mode === 'lock' ? 'disabled' : '',
    };

    // conditional for disabling keybindings for this action when the image is locked.
    L.DistortableImage.action_map.b = mode === 'lock' ? '' : '_toggleBorder';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTitle(this._link, 'Remove Border', 'Add Border');
    edit._toggleBorder();
  },
});

L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use = 'delete_forever';
    var tooltip;
    /**
      * we can tell whether the overlay is an instance of `L.DistortableImageOverlay` or `L.DistortableCollection` bc only
      * the former should have `parentGroup` defined on it. From there we call the apporpriate keybindings and methods.
      */
    if (edit instanceof L.DistortableImage.Edit) {
      tooltip = 'Delete Image';
      // backspace windows / delete mac
      L.DistortableImage.action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeOverlay'
      );
    } else {
      tooltip = 'Delete Images';
      L.DistortableImage.group_action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeGroup'
      );
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._removeOverlay(); }
    else { edit._removeGroup(); }
  },
});

L.DistortAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'distort',
      tooltip: 'Distort Image',
      className: 'distort',
    };

    L.DistortableImage.action_map.d = '_distortMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit.setMode('distort');
  },
});

L.ExportAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var tooltip;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.e = '_getExport';
      tooltip = 'Export Image';
    } else {
      L.DistortableImage.group_action_map.e = 'startExport';
      tooltip = 'Export Images';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: tooltip,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._getExport(); }
    else {
      L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
      L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
      L.IconUtil.addClassToSvg(this._link, 'loader');
      edit.startExport();
    }
  },
});

L.FreeRotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'crop_rotate',
      tooltip: 'Free rotate Image',
      className: 'freeRotate',
    };

    L.DistortableImage.action_map.f = '_freeRotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit.setMode('freeRotate');
  },
});

L.GeolocateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'explore',
      tooltip: 'Geolocate Image',
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    // eslint-disable-next-line new-cap
    EXIF.getData(image, L.EXIF(image));
  },
});

L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.u = '_unlock';
      L.DistortableImage.action_map.l = '_lock';
      tooltip = 'Lock Mode';

      if (edit._mode === 'lock') { use = 'lock'; }
      else { use = 'unlock'; }
    } else {
      L.DistortableImage.group_action_map.l = 'lockGroup';
      tooltip = 'Lock Images';
      use = 'lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'lock',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._toggleLockMode(); }
    else { edit.lockGroup(); }
  },
});

L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var mode = edit._mode;
    var use;
    var tooltip;

    if (edit._transparent) {
      use = 'opacity_empty';
      tooltip = 'Make Image Opaque';
    } else {
      use = 'opacity';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity', 'opacity_empty');
    L.IconUtil.toggleTitle(this._link, 'Make Image Transparent', 'Make Image Opaque');
    edit._toggleOpacity();
  },
});

L.RevertAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: 'Restore Original Image Dimensions',
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    this._overlay._revert();
  },
});

L.RotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'rotate',
      tooltip: 'Rotate Image',
      className: 'rotate',
    };

    L.DistortableImage.action_map.r = '_rotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit.setMode('rotate');
  },
});

L.ScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'scale',
      tooltip: 'Scale Image',
      className: 'scale',
    };

    L.DistortableImage.action_map.s = '_scaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit.setMode('scale');
  },
});

L.StackAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit._toggledImage) {
      use = 'flip_to_back';
      tooltip = 'Stack to Front';
    } else {
      use = 'flip_to_front';
      tooltip = 'Stack to Back';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.q = edit._mode === 'lock' ? '' : '_stackUp';
    L.DistortableImage.action_map.a = edit._mode === 'lock' ? '' : '_stackDown';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTitle(this._link, 'Stack to Front', 'Stack to Back');
    edit._toggleOrder();
  },
});

L.UnlockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'unlock',
      tooltip: 'Unlock Images',
      className: 'unlock',
    };

    L.DistortableImage.group_action_map.u = 'unlockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit.unlockGroup();
  },
});

L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  },

  initialize: function(latlng, options) {
    L.setOptions(this, options);
    L.Toolbar2.Popup.prototype.initialize.call(this, latlng, options);
  },

  addHooks: function(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools: function() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool: function(name) {
    var tools = this.tools();
    for (var i = 0; i < tools.length; i++) {
      var tool = tools.item(i).children[0];
      if (L.DomUtil.hasClass(tool, name)) {
        tool.click();
        return tool;
      }
    }
    return false;
  },
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.ScaleAction,
    L.DistortAction,
    L.RotateAction,
    L.FreeRotateAction,
    L.LockAction,
    L.OpacityAction,
    L.BorderAction,
    L.StackAction,
    L.ExportAction,
    L.DeleteAction,
  ];

  // all possible modes
  L.DistortableImage.Edit.MODES = {
    'scale': L.ScaleAction,
    'distort': L.DistortAction,
    'rotate': L.RotateAction,
    'freeRotate': L.FreeRotateAction,
    'lock': L.LockAction,
  };

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableImage.edit(this, {actions: a});
});


L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
  },

  addHooks: function(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools: function() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool: function(name) {
    var tools = this.tools();
    for (var i = 0; i < tools.length; i++) {
      var tool = tools.item(i).children[0];
      if (L.DomUtil.hasClass(tool, name)) {
        tool.click();
        return tool;
      }
    }
    return false;
  },
});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  this.ACTIONS = [
    L.ExportAction,
    L.DeleteAction,
    L.LockAction,
    L.UnlockAction,
  ];

  L.DistortableCollection.Edit.MODES = {
    'lock': L.LockAction,
    'unlock': L.UnlockAction,
  };

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableCollection.edit(this, {actions: a});
});

L.DistortableImage = L.DistortableImage || {};

// holds the keybindings & toolbar API for an individual image instance
L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: '1px solid red',
    keymap: L.distortableImage.action_map,
  },

  initialize: function(overlay, options) {
    this._overlay = overlay;
    this._toggledImage = false;
    this._mode = overlay.options.mode;
    this._transparent = false;
    this._outlined = false;

    L.setOptions(this, options);

    L.distortableImage.action_map.Escape = '_deselect';
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var img = overlay.getElement();

    this.editActions = this.options.actions;

    this._initModes();
    this._initHandles();
    this._appendHandlesandDragable();

    if (overlay.isSelected() && !overlay.options.suppressToolbar) {
      this._addToolbar();
    }

    this.parentGroup = overlay.eP ? overlay.eP : false;

    L.DomEvent.on(window, 'keydown', this._onKeyDown, this);
    L.DomEvent.on(map, 'dblclick', this._catchAndFire, this);
    L.DomEvent.on(img, 'dblclick', this.nextMode, this);
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var img = overlay.getElement();
    var eP = this.parentGroup;

    this._disableDragging();
    if (this.toolbar) { this._removeToolbar(); }

    for (var handle in this._handles) {
      L.DomUtil.remove(handle);
    }
    /**
     * ensures if you disable an image while it is multi-selected
     * additional deselection logic is run
     */
    if (L.DomUtil.hasClass(overlay.getElement(), 'collected')) {
      L.DomUtil.removeClass(overlay.getElement(), 'collected');
    }

    if (eP && (!eP.anyCollected() && eP.editing.toolbar)) {
      eP.editing._removeToolbar();
    }

    L.DomEvent.off(window, 'keydown', this._onKeyDown, this);
    L.DomEvent.off(map, 'dblclick', this._catchAndFire, this);
    L.DomEvent.off(img, 'dblclick', this.nextMode, this);
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._overlay.deselect();
    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _initModes: function() {
    this._modes = {};
    // passed from L.DistortablImage.PopupBar. If the mode is one
    // of the current toolbar actions, adds it to this._modes
    for (var mode in L.DistortableImage.Edit.MODES) {
      var action = L.DistortableImage.Edit.MODES[mode];
      if (this.editActions.indexOf(action) !== -1) {
        this._modes[mode] = action;
      }
    }

    // sets the current mode to the 1st available one if the one selected
    // during initialization is not available
    if (!this._modes[this._mode]) {
      this._mode = Object.keys(this._modes)[0];
    }
  },

  _initHandles: function() {
    var overlay = this._overlay;
    var i;

    this._scaleHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(L.scaleHandle(overlay, i));
    }

    this._distortHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._distortHandles.addLayer(L.distortHandle(overlay, i));
    }

    this._rotateHandles = L.layerGroup(); // individual rotate
    for (i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(L.rotateHandle(overlay, i));
    }

    // handle includes rotate AND scale
    this._freeRotateHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._freeRotateHandles.addLayer(new L.RotateScaleHandle(overlay, i));
    }

    this._lockHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(L.lockHandle(overlay, i, {draggable: false})
      );
    }

    this._handles = {
      scale: this._scaleHandles,
      distort: this._distortHandles,
      rotate: this._rotateHandles,
      freeRotate: this._freeRotateHandles,
      lock: this._lockHandles,
    };
  },

  _appendHandlesandDragable: function() {
    var ov = this._overlay;
    var wrap = ov.getElement().parentNode;

    if (!this._mode) { // won't throw error if user adds 0 mode actions to toolbar
      this._enableDragging();
      return;
    }

    this._updateHandle();

    if (!ov.isSelected() && this.currentHandle) {
      this.currentHandle.eachLayer(function(handle) {
        handle.setOpacity(0);
        if (handle.dragging) { handle.dragging.disable(); }
      });

      if (!this.isMode('lock')) { this._enableDragging(); }
      else { L.DomUtil.addClass(wrap, 'lock'); }
    }
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (eP && eP.anyCollected()) { return; }

    if (this[handlerName] !== undefined && !ov.options.suppressToolbar) {
      if (ov.isSelected() && this.toolbar) {
        this[handlerName].call(this);
      }
    }
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
      for (var mode in L.DistortableImage.Edit.MODES) {
        if (L.DistortableImage.Edit.MODES[mode] === value) {
          this._modes[mode] = value;
        }
      }
      if (!this._overlay.isSelected()) { this._removeToolbar(); }
      return this;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  removeTool: function(value) {
    var matched = this.editActions.some(function(item, idx) {
      if (item === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        for (var mode in L.DistortableImage.Edit.MODES) {
          if (L.DistortableImage.Edit.MODES[mode] === value) {
            delete this._modes[mode];
            this._nextOrNada(mode);
            return true;
          }
        }
      }
    }, this);
    if (!this._overlay.isSelected()) { this._removeToolbar(); }
    if (matched) { return this; }
    else { return false; }
  },

  // set the mode to the next mode or if that was the last one set mode to ''
  _nextOrNada: function(mode) {
    if (this.isMode(mode)) {
      if (Object.keys(this.getModes()).length >= 1) {
        this.nextMode();
      } else {
        if (mode === 'lock') { this._enableDragging(); }
        this._mode = '';
        this._updateHandle();
      }
    }
  },

  _removeToolbar: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _enableDragging: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    this.dragging = new L.Draggable(overlay.getElement());
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on('dragstart', function() {
      overlay.fire('dragstart');
      this._removeToolbar();
    }, this);

    /*
     * Adjust default behavior of L.Draggable.
     * By default, L.Draggable overwrites the CSS3 distort transform
     * that we want when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var topLeft = overlay.getCorner(0);
      var delta = this._newPos.subtract(map.latLngToLayerPoint(topLeft));
      var currentPoint;
      var corners = {};
      var i;

      this.fire('predrag');

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay.getCorner(i));
        corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
      }

      overlay.setCorners(corners);
      overlay.fire('drag');

      this.fire('drag');
    };
  },

  _disableDragging: function() {
    if (this.dragging) {
      this.dragging.disable();
      delete this.dragging;
    }
  },

  _scaleMode: function() {
    this.setMode('scale');
  },

  _distortMode: function() {
    this.setMode('distort');
  },

  _rotateMode: function() {
    this.setMode('rotate');
  },

  _freeRotateMode: function() {
    this.setMode('freeRotate');
  },

  _toggleLockMode: function() {
    if (!this.hasTool(L.LockAction)) { return; }
    if (this.isMode('lock')) { this._unlock(); }
    else { this._lock(); }
  },

  _toggleOpacity: function() {
    var image = this._overlay.getElement();
    var opacity;

    if (!this.hasTool(L.OpacityAction)) { return; }

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);

    this._refresh();
  },

  _toggleBorder: function() {
    var image = this._overlay.getElement();
    var opacity;
    var outline;

    if (!this.hasTool(L.BorderAction)) { return; }

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    L.DomUtil.setOpacity(image, opacity);

    image.style.outline = outline;

    this._refresh();
  },

  // compare this to using overlay zIndex
  _toggleOrder: function() {
    if (!this.hasTool(L.StackAction)) { return; }
    if (this._toggledImage) { this._stackUp(); }
    else { this._stackDown(); }
  },

  _removeOverlay: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (this.isMode('lock') || !this.hasTool(L.DeleteAction)) { return; }

    var choice = L.DomUtil.confirmDelete();
    if (!choice) { return; }

    this._removeToolbar();

    if (eP) { eP.removeLayer(ov); }
    else { ov._map.removeLayer(ov); }
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _getExport: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (!this.hasTool(L.ExportAction)) { return; }

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || 'tempId12345';
    document.body.appendChild(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height;
      var width = downloadable.width;
      var nw = map.latLngToLayerPoint(overlay.getCorner(0));
      var ne = map.latLngToLayerPoint(overlay.getCorner(1));
      var sw = map.latLngToLayerPoint(overlay.getCorner(2));
      var se = map.latLngToLayerPoint(overlay.getCorner(3));

      // I think this is to move the image to the upper left corner,
      // eslint-disable-next-line max-len
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      // nw.x -= nw.x;
      // ne.x -= nw.x;
      // se.x -= nw.x;
      // sw.x -= nw.x;

      // nw.y -= nw.y;
      // ne.y -= nw.y;
      // se.y -= nw.y;
      // sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        L.DomUtil.remove(downloadable);
      };

      if (window && window.hasOwnProperty('warpWebGl')) {
        warpWebGl(
            downloadable.id,
            [0, 0, width, 0, width, height, 0, height],
            [nw.x, nw.y, ne.x, ne.y, se.x, se.y, sw.x, sw.y],
            true // trigger download
        );
      }
    };

    downloadable.src = overlay.options.fullResolutionSrc || overlay._image.src;
  },

  _stackUp: function() {
    var t = this._toggledImage;

    if (!t || !this.hasTool(L.StackAction)) { return; }

    this._toggledImage = false;
    this._overlay.bringToFront();
    this._refresh();
  },

  _stackDown: function() {
    var t = this._toggledImage;

    if (t || !this.hasTool(L.StackAction)) { return; }
    this._toggledImage = true;
    this._overlay.bringToBack();
    this._refresh();
  },

  _unlock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var wrap = ov.getElement().parentNode;
    var eP = this.parentGroup;

    if (!this.isMode('lock')) { return; }
    if (!this.hasTool(L.LockAction) && (eP && !eP.editing.hasTool(L.UnlockAction))) { return; }
    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    if (ov.options.mode === 'lock' || !this.hasMode(ov.options.mode)) {
      this._mode = '';
      this.currentHandle = '';
    } else {
      this._mode = ov.options.mode;
    }

    L.DomUtil.removeClass(wrap, 'lock');
    this._updateHandle();
    this._enableDragging();
    this._refresh();
  },

  _lock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var wrap = ov.getElement().parentNode;
    var eP = this.parentGroup;

    if (this.isMode('lock')) { return; }
    if (!this.hasTool(L.LockAction) && (eP && !eP.editing.hasTool(L.LockAction))) { return; }

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this._mode = 'lock';

    L.DomUtil.addClass(wrap, 'lock');
    this._updateHandle();
    this._disableDragging();
    this._refresh();
  },

  _deselect: function() {
    this._overlay.deselect();
  },

  _showMarkers: function() {
    var eP = this.parentGroup;

    if (!this.currentHandle) { return; }
    // only markers we want in collect interface for now is lock
    if (!this.isMode('lock') && (eP && eP.anyCollected())) { return; }

    this.currentHandle.eachLayer(function(handle) {
      handle.setOpacity(1);
      if (handle.dragging) { handle.dragging.enable(); }
    });
  },

  _hideMarkers: function() {
    var eP = this.parentGroup;
    // workaround for race condition w/ feature group
    if (!this._handles) { this._initHandles(); }
    if (!this.currentHandle) { return; }
    if (this.isMode('lock') && (eP && eP.isCollected(this._overlay))) { return; }

    this.currentHandle.eachLayer(function(handle) {
      handle.setOpacity(0);
      if (handle.dragging) { handle.dragging.disable(); }
    });
  },

  _addToolbar: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;
    var map = ov._map;
    // Find the topmost point on the image.
    var corners = ov.getCorners();
    var maxLat = -Infinity;

    if (eP && eP.anyCollected()) {
      eP.editing._addToolbar();
      return;
    }

    if (ov.options.suppressToolbar || this.toolbar) { return; }

    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }

    // Longitude is based on the centroid of the image.
    var raisedPoint = ov.getCenter();
    raisedPoint.lat = maxLat;

    try {
      this.toolbar = L.distortableImage.popupBar(raisedPoint, {
        actions: this.editActions,
      }).addTo(map, ov);
      ov.fire('toolbar:created');
    } catch (e) { }
  },

  _refresh: function() {
    if (this.toolbar) { this._removeToolbar(); }
    this._addToolbar();
  },

  _updateToolbarPos: function() {
    var overlay = this._overlay;
    // Find the topmost point on the image.
    var corners = overlay.getCorners();
    var toolbar = this.toolbar;
    var maxLat = -Infinity;

    if (toolbar && toolbar instanceof L.DistortableImage.PopupBar) {
      for (var i = 0; i < corners.length; i++) {
        if (corners[i].lat > maxLat) {
          maxLat = corners[i].lat;
        }
      }

      // Longitude is based on the centroid of the image.
      var raisedPoint = overlay.getCenter();
      raisedPoint.lat = maxLat;

      if (!overlay.options.suppressToolbar) {
        this.toolbar.setLatLng(raisedPoint);
      }
    }
  },

  // this event catches fakely generated map doubleclicks on touchscreens and calls
  // nextMode on the original overlay that fired it, accessed via a stamp given to it
  // right before the doubleclick is fired. (see L.DistortableImageOverlay 'select')
  _catchAndFire: function(e) {
    var map = this._overlay._map;
    var ov = map._layers[map._stamp];
    var oe = e.originalEvent;
    var eP = this.parentGroup;

    L.DomEvent.stopPropagation(e);

    // _catchAndFire is just for synthetic events
    if (e.isTrusted || (eP && eP.anyCollected())) { return false; }

    if (oe && oe.target instanceof HTMLImageElement) {
      setTimeout(function() {
        map._clicked = 0;
        clearTimeout(map._clickTimeout);
      }, 0);

      ov.editing.nextMode(e);
    }
  },

  _updateHandle: function() {
    var ov = this._overlay;
    var map = ov._map;
    var mode = this.getMode();

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this.currentHandle = mode === '' ? '' : this._handles[this.getMode()];
    if (this.currentHandle !== '') {
      map.addLayer(this.currentHandle);
    }
  },

  isMode: function(mode) {
    if (!this.enabled()) { return false; }
    return this._mode === mode;
  },

  getMode: function() {
    if (!this.enabled()) { return false; }
    return this._mode;
  },

  hasMode: function(mode) {
    return !!this._modes[mode];
  },

  getModes: function() {
    return this._modes;
  },

  setMode: function(newMode) {
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (this.isMode(newMode)) { return false; }
    if (!this.enabled()) { return false; }

    if (this.hasMode(newMode) || (eP && eP.hasTool(L.DistortableCollection.Edit.MODES[newMode]))) {
      if (this.toolbar) { this.toolbar.clickTool(newMode); }
      if (this.isMode('lock') && !this.dragging) {
        this._enableDragging();
      }
      this._mode = newMode;
      if (this.isMode('lock') && this.dragging) {
        this._disableDragging();
      }
      this._updateHandle();
      this._refresh();
      if (eP && eP.isCollected(ov)) { ov.deselect(); }
      return this;
    }
    return false;
  },

  /**
    * need to attach a stop to img dblclick or it will propagate to
    * the map and fire the handler that shows map location labels on map dblclick.
    */
  nextMode: function(e) {
    var m = this.getMode();
    var eP = this.parentGroup;
    var modesArray = Object.keys(this.getModes());
    var idx = modesArray.indexOf(m);
    var nextIdx = (idx + 1) % modesArray.length;
    var newMode = modesArray[nextIdx];

    if (e) {
      if (eP && eP.anyCollected()) { return false; }
      L.DomEvent.stop(e);
    }

    return this.setMode(newMode);
  },
});

L.distortableImage.edit = function(overlay, options) {
  return new L.DistortableImage.Edit(overlay, options);
};

L.DistortableImage = L.DistortableImage || {};

// this class holds the keybindings and toolbar API for an image collection instance
L.DistortableCollection.Edit = L.Handler.extend({
  options: {
    keymap: L.distortableImage.group_action_map,
  },

  initialize: function(group, options) {
    this._group = group;
    this._mode = '';
    L.setOptions(this, options);

    L.distortableImage.group_action_map.Escape = '_decollectAll';
  },

  addHooks: function() {
    var group = this._group;
    var map = group._map;

    this.editActions = this.options.actions;

    this._initModes();

    L.DomEvent.on(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxzoomend: this._addCollections,
    }, this);

    this._group.editable = true;
    this._group.eachLayer(function(layer) {
      layer.editing.enable();
    });
  },


  removeHooks: function() {
    var group = this._group;
    var map = group._map;

    L.DomEvent.off(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.off(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxzoomend: this._addCollections,
    }, this);

    this._decollectAll();
    this._group.editable = false;
    this._group.eachLayer(function(layer) {
      layer.editing.disable();
    });
  },

  enable: function() {
    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _initModes: function() {
    this._modes = {};
    // passed from L.DistortablImage.ControlBar. If the mode is one
    // of the current toolbar actions, adds it to this._modes
    for (var mode in L.DistortableCollection.Edit.MODES) {
      var action = L.DistortableCollection.Edit.MODES[mode];
      if (this.editActions.indexOf(action) !== -1) {
        this._modes[mode] = action;
      }
    }
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];

    if (!this[handlerName]) { return; }

    if (this._group.anyCollected()) {
      this[handlerName].call(this);
    }
  },

  _singleClick: function(e) {
    if (e.type === 'singleclick') { this._decollectAll(e); }
    else { return; }
  },

  _singleClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.off(map, 'click', this._decollectAll, this);
    L.DomEvent.on(map, 'singleclick', this._decollectAll, this);
  },

  _resetClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.on(map, 'click', this._decollectAll, this);
    L.DomEvent.off(map, 'singleclick', this._decollectAll, this);
  },

  _decollectAll: function(e) {
    var oe;

    if (e) { oe = e.originalEvent; }
    /**
     * prevents image deselection following the 'boxzoomend' event - note 'shift' must not be released until dragging is complete
     * also prevents deselection following a click on a disabled img by differentiating it from the map
     */
    if (oe && (oe.shiftKey || oe.target instanceof HTMLImageElement)) {
      return;
    }

    this._group.eachLayer(function(layer) {
      L.DomUtil.removeClass(layer.getElement(), 'collected');
      this._group._uncollect(layer);
    }, this);

    this._collectionOff();
    this._removeToolbar();

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  unlockGroup: function() {
    if (!this.hasTool(L.UnlockAction)) { return false; }
    this._mode = 'unlock';
    this._group.eachLayer(function(layer) {
      var edit = layer.editing;
      if (this._group.isCollected(layer) && edit.isMode('lock')) {
        edit._unlock();
        layer.deselect();
      }
    }, this);
    if (this.toolbar) {
      this.toolbar.clickTool('unlock');
      this._refresh();
    }
    return this;
  },

  lockGroup: function() {
    if (!this.hasTool(L.LockAction)) { return false; }
    this._mode = 'lock';
    this._group.eachLayer(function(layer) {
      var edit = layer.editing;
      if (this._group.isCollected(layer) && !edit.isMode('lock')) {
        edit._lock();
      }
    }, this);
    if (this.toolbar) {
      this.toolbar.clickTool('lock');
      this._refresh();
    }
    return this;
  },

  _addCollections: function(e) {
    var box = e.boxZoomBounds;
    var map = this._group._map;

    this._group.eachLayer(function(layer) {
      var edit = layer.editing;
      var zoom = map.getZoom();
      var center = map.getCenter();

      var imgBounds = L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      imgBounds = map._latLngBoundsToNewLayerBounds(imgBounds, zoom, center);
      if (box.intersects(imgBounds) && edit.enabled()) {
        L.DomUtil.addClass(layer.getElement(), 'collected');
        this._group._collect(layer);
      }
    }, this);
  },

  _removeGroup: function(e) {
    var layersToRemove = this._group._toRemove();
    var n = layersToRemove.length;

    if (n === 0) { return; }

    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this._group.removeLayer(layer);
      }, this);
      if (!this._group.anyCollected()) {
        this._removeToolbar();
        this._collectionOff();
      }
    }

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _collectionOn: function(layer) {
    layer = layer || '';
    this._group.eachLayer(function(lay) {
      if (lay !== layer) {
        var div = lay.getElement().parentNode;
        L.DomUtil.addClass(div, 'wrapcollect');
      }
    });
    if (layer) { layer.deselect(); }
  },

  _collectionOff: function(layer) {
    layer = layer || '';
    this._group.eachLayer(function(lay) {
      if (lay !== layer) {
        var div = lay.getElement().parentNode;
        L.DomUtil.removeClass(div, 'wrapcollect');
      }
    });
    if (layer) { layer.select(); }
  },

  _refresh: function() {
    var group = this._group;
    if (group.options.suppressToolbar && !this.toolbar) { return; }
    if (this.toolbar) { this._removeToolbar(); }
    this._addToolbar();
  },

  getModes: function() {
    return this._modes;
  },

  startExport: function(opts) {
    opts = opts || {};
    opts.collection = opts.collection || this._group.generateExportJson();
    opts.frequency = opts.frequency || 3000;
    opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
    var statusUrl;
    var updateInterval;

    // this may be overridden to update the UI to show export progress or completion
    // eslint-disable-next-line require-jsdoc
    function _defaultUpdater(data) {
      data = JSON.parse(data);
      // optimization: fetch status directly from google storage:
      if (statusUrl !== data.status_url && data.status_url.match('.json')) {
        statusUrl = data.status_url;
      }
      if (data.status === 'complete') {
        clearInterval(updateInterval);
      }
      if (data.status === 'complete' && data.jpg !== null) {
        alert('Export succeeded. http://export.mapknitter.org/' + data.jpg);
      }
      // TODO: update to clearInterval when status == "failed" if we update that in this file:
      // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
      console.log(data);
    }

    // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json;
    // this may be overridden to integrate with any UI
    // eslint-disable-next-line require-jsdoc
    function _defaultHandleStatusUrl(data) {
      console.log(data);
      statusUrl = '//export.mapknitter.org' + data;
      opts.updater = opts.updater || _defaultUpdater;

      // repeatedly fetch the status.json
      updateInterval = setInterval(function intervalUpdater() {
        $.ajax(statusUrl + '?' + Date.now(), {// bust cache with timestamp
          type: 'GET',
          crossDomain: true,
        }).done(function(data) {
          opts.updater(data);
        });
      }, opts.frequency);
    }

    // eslint-disable-next-line require-jsdoc
    function _fetchStatusUrl(collection, scale) {
      opts.handleStatusUrl = opts.handleStatusUrl || _defaultHandleStatusUrl;

      $.ajax({
        url: '//export.mapknitter.org/export',
        crossDomain: true,
        type: 'POST',
        data: {
          collection: JSON.stringify(collection.images),
          scale: scale,
        },
        success: opts.handleStatusUrl, // this handles the initial response
      });
    }

    _fetchStatusUrl(opts.collection, opts.scale);
  },

  _addToolbar: function() {
    var group = this._group;
    var map = group._map;

    if (group.options.suppressToolbar || this.toolbar) { return; }

    this.toolbar = L.distortableImage.controlBar({
      actions: this.editActions,
      position: 'topleft',
    }).addTo(map, group);
  },

  _removeToolbar: function() {
    var map = this._group._map;
    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
      return this;
    } else {
      return false;
    }
  },

  removeTool: function(value) {
    var matched = this.editActions.some(function(item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
    if (matched) { return this; }
    else { return false; }
  },
});

L.distortableCollection.edit = function(group, options) {
  return new L.DistortableCollection.Edit(group, options);
};

L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.Keymapper = L.Handler.extend({

  options: {
    position: 'topright',
  },

  initialize: function(map, options) {
    this._map = map;
    L.setOptions(this, options);
  },

  addHooks: function() {
    if (!this._keymapper) {
      this._container = this._buildContainer();
      this._scrollWrapper = this._wrap();
      this._toggler = this._createButton();
      this._setMapper(this._container, this._scrollWrapper, this._toggler);

      L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.disableScrollPropagation(this._container);
    }
  },

  removeHooks: function() {
    if (this._keymapper) {
      L.DomEvent.off(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomUtil.remove(this._toggler);
      L.DomUtil.remove(this._scrollWrapper);
      L.DomUtil.remove(this._container);
      this._keymapper = false;
    }
  },

  _buildContainer: function() {
    var container = L.DomUtil.create('div', 'ldi-keymapper-hide');
    container.setAttribute('id', 'ldi-keymapper');

    var divider = L.DomUtil.create('br', 'divider');
    container.appendChild(divider);

    return container;
  },

  _createButton: function() {
    var toggler = L.DomUtil.create('a', '');
    toggler.innerHTML = L.IconUtil.create('keyboard_open');

    toggler.setAttribute('id', 'toggle-keymapper');
    toggler.setAttribute('href', '#');
    toggler.setAttribute('title', 'Show keymap');
    // Will force screen readers like VoiceOver to read this as "Show keymap - button"
    toggler.setAttribute('role', 'button');
    toggler.setAttribute('aria-label', 'Show keymap');

    return toggler;
  },

  _wrap: function() {
    var wrap = L.DomUtil.create('div', '');
    wrap.setAttribute('id', 'keymapper-wrapper');
    wrap.style.display = 'none';

    return wrap;
  },

  _setMapper: function(container, wrap, button) {
    this._keymapper = L.control({position: this.options.position});

    this._keymapper.onAdd = function() {
      container.appendChild(wrap);
      wrap.insertAdjacentHTML(
          'beforeend',
          '<table><tbody>' +
          '<hr id="keymapper-hr">' +
          /* eslint-disable */
          '<tr><td><div class="left"><span>Rotate Mode</span></div><div class="right"><kbd>R</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>RotateScale Mode</span></div><div class="right"><kbd>r</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Scale Mode</span></div><div class="right"><kbd>s</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Distort Mode</span></div><div class="right"><kbd>d</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Lock (Mode) / Unlock Image</span></div><div class="right"><kbd>l</kbd>\xa0<kbd>u</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Stack up / down</span></div><div class="right"><kbd>q</kbd>\xa0<kbd>a</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Add / Remove Image Border</span></div><div class="right"><kbd>b</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Toggle Opacity</span></div><div class="right"><kbd>o</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Deselect All</span></div><div class="right"><kbd>esc</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Delete Image(s)</span></div><div class="right"><kbd>delete</kbd>\xa0<kbd>backspace</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Export Image(s)</span></div><div class="right"><kbd>e</kbd></div></td></tr>' +
          '</tbody></table>'
      );
      /* eslint-enable */
      container.appendChild(button);
      return container;
    };

    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function(e) {
    e.preventDefault();

    this._container.className = (
      this._container.className === 'ldi-keymapper leaflet-control' ?
        'ldi-keymapper-hide leaflet-control' :
        'ldi-keymapper leaflet-control'
    );

    this._scrollWrapper.style.display = (
      this._scrollWrapper.style.display === 'none' ? 'block' : 'none'
    );

    this._toggler.innerHTML = (
      this._toggler.innerHTML === 'close' ?
        L.IconUtil.create('keyboard_open') :
        'close'
    );

    L.IconUtil.toggleTitle(this._toggler, 'Show keymap', 'Hide keymap');
    L.DomUtil.toggleClass(this._toggler, 'close-icon');
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) { return; }

    var el = L.DomUtil.create('div', '');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  },
});

L.DistortableImage.Keymapper.addInitHook(function() {
  L.DistortableImage.Keymapper.prototype._n = (
    L.DistortableImage.Keymapper.prototype._n ?
    L.DistortableImage.Keymapper.prototype._n + 1 :
    1
  );
  // dont enable keymapper for mobile
  if (L.DistortableImage.Keymapper.prototype._n === 1 && !L.Browser.mobile) {
    this.enable();
    this._injectIconSet();
  }
});

L.distortableImage.keymapper = function(map, options) {
  return new L.DistortableImage.Keymapper(map, options);
};

/**
 * `L.Map.DoubleClickZoom` from leaflet 1.5.1, overrwritten so that it
 * 1) Fires a `singleclick` event to avoid deselecting images on `dblclick`.
 * 2) Maintains a mutually exclusive relationship with the map's `DoubleClickLabels` handler
 */
L.Map.DoubleClickZoom.include({
  addHooks: function() {
    this._map.on({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  removeHooks: function() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  enable: function() {
    if (this._enabled) { return this; }

    // don't enable 'doubleClickZoom' unless 'doubleClickLabels' is disabled first
    if (this._map.doubleClickLabels) {
      if (this._map.doubleClickLabels.enabled()) {
        return this;
      }
    }

    // signify to collection/instance classes to turn on 'singleclick' listeners
    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    if (!this._enabled) { return this; }

    // signify to collection/instance safe to swap 'singleclick' listeners with 'click' listeners.
    this._map.fire('singleclickoff');

    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var oe = e.originalEvent;

    // prevents deselection in case of box selector
    if (oe && oe.shiftKey) { return; }

    map._clicked += 1;
    this._map._clickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', {type: 'singleclick'});
      } else {
        // manually fire doubleclick event only for touch screens that don't natively fire it
        if (L.Browser.touch && (oe && oe.sourceCapabilities.firesTouchEvents)) {
          // in `DoubleClickLabels.js`, we just do map.fire('dblclick') bc `_onDoublClick` doesn't use the
          // passed "e" (for now). To generate a 'real' DOM event that will have all of its corresponding core
          // properties (originalEvent, latlng, etc.), use Leaflet's `#map._fireDOMEvent` (Leaflet 1.5.1 source)
          map._fireDOMEvent(oe, 'dblclick', [map]);
        }
      }
    }, 250);
  },

  _onDoubleClick: function(e) {
    var map = this._map;
    var oe;

    if (e) { oe = e.originalEvent; }
    /**
     * we have a 'dblclick' handler on the image to iterate through its modes, but bc doubleTap is broken
     * in Leaflet and we have to custom fire the event, I don't know how stop its propagation. So this
     * line informs this method that this dblclick actually happened for the image.
     */
    if (oe && oe.target instanceof HTMLImageElement) {
      return;
    }

    setTimeout(function() {
      map._clicked = 0;
      clearTimeout(map._clickTimeout);
    }, 0);

    if (!oe) { return false; }

    var oldZoom = map.getZoom();
    var delta = map.options.zoomDelta;
    var zoom = oe.shiftKey ? oldZoom - delta : oldZoom + delta;

    if (map.options.doubleClickZoom === 'center') {
      map.setZoom(zoom);
    } else {
      map.setZoomAround(e.containerPoint, zoom);
    }
  },
});

L.Map.mergeOptions({
  boxCollector: true,
  boxZoom: false,
});

/**
 * primarily Leaflet 1.5.1 source code. Overriden so that it's a collection box used with
 * our `L.DistortableCollection` class instead of a zoom box.
 * */
L.Map.BoxCollector = L.Map.BoxZoom.extend({
  initialize: function(map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
    this._resetStateTimeout = 0;
    map.on('unload', this._destroy, this);
  },

  addHooks: function() {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function() {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  moved: function() {
    return this._moved;
  },

  _destroy: function() {
    L.DomUtil.remove(this._pane);
    delete this._pane;
  },

  _resetState: function() {
    this._resetStateTimeout = 0;
    this._moved = false;
  },

  _clearDeferredResetState: function() {
    if (this._resetStateTimeout !== 0) {
      clearTimeout(this._resetStateTimeout);
      this._resetStateTimeout = 0;
    }
  },

  _onMouseDown: function(e) {
    if (!e.shiftKey || (e.which !== 1 && e.button !== 1)) {
      return false;
    }

    // Clear the deferred resetState if it hasn't executed yet, otherwise it
    // will interrupt the interaction and orphan a box element in the container.
    this._clearDeferredResetState();
    this._resetState();

    L.DomUtil.disableTextSelection();
    L.DomUtil.disableImageDrag();

    this._startPoint = this._map.mouseEventToContainerPoint(e);

    L.DomEvent.on(document, {
      contextmenu: L.DomEvent.stop,
      mousemove: this._onMouseMove,
      mouseup: this._onMouseUp,
    }, this);
  },

  _onMouseMove: function(e) {
    if (!this._moved) {
      this._moved = true;

      this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._container);
      L.DomUtil.addClass(this._container, 'leaflet-crosshair');

      this._map.fire('boxzoomstart');
    }

    this._point = this._map.mouseEventToContainerPoint(e);

    this._bounds = L.bounds(this._startPoint, this._point);
    var size = this._bounds.getSize();

    L.DomUtil.setPosition(this._box, this._bounds.min);

    this._box.style.width = size.x + 'px';
    this._box.style.height = size.y + 'px';
  },

  _finish: function() {
    if (this._moved) {
      L.DomUtil.remove(this._box);
      L.DomUtil.removeClass(this._container, 'leaflet-crosshair');
    }

    L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

    L.DomEvent.off(document, {
      contextmenu: L.DomEvent.stop,
      mousemove: this._onMouseMove,
      mouseup: this._onMouseUp,
    }, this);
  },

  _onMouseUp: function(e) {
    if (e.which !== 1 && e.button !== 1) { return; }

    this._finish();

    if (!this._moved) { return; }

    // Postpone to next JS tick so internal click event handling
    // still see it as "moved".
    this._clearDeferredResetState();
    this._resetStateTimeout = setTimeout(
        L.Util.bind(this._resetState, this), 0);

    var bounds = L.latLngBounds(
        this._map.containerPointToLatLng(this._bounds.getBottomLeft()),
        this._map.containerPointToLatLng(this._bounds.getTopRight())
    );

    // calls the `project` method but 1st updates the pixel origin - see https://github.com/publiclab/Leaflet.DistortableImage/pull/344
    bounds = this._map._latLngBoundsToNewLayerBounds(bounds, this._map.getZoom(), this._map.getCenter());

    this._map.fire('boxzoomend', {boxZoomBounds: bounds});
  },
});

L.Map.addInitHook('addHandler', 'boxCollector', L.Map.BoxCollector);

L.Map.mergeOptions({
  doubleClickLabels: true,
});

/**
 * The `doubleClickLabels` handler replaces `doubleClickZoom` by default if `#addGoogleMutant`
 * is used unless the options 'labels: false' or 'doubleClickZoom: false` were passed to it.
 */
L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  enable: function() {
    var map = this._map;

    if (this._enabled) { return this; }

    // disable 'doubleClickZoom' if 'doubleClickLabels' is enabled.
    if (map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.disable();
    }

    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var oe = e.originalEvent;

    // prevents deselection in case of box selector
    if (oe && oe.shiftKey) { return; }

    map._clicked += 1;
    this._map._clickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', {type: 'singleclick'});
      } else {
        // manually fire doubleclick event only for touch screens that don't natively fire it
        if (L.Browser.touch && (oe && oe.sourceCapabilities.firesTouchEvents)) {
          map.fire('dblclick');
        }
      }
    }, 250);
  },

  _onDoubleClick: function(e) {
    var map = this._map;
    var labels = map._labels;
    var oe;

    if (e) { oe = e.originalEvent; }
    /**
     * we have a 'dblclick' handler on the image to iterate through its modes, but bc doubleTap is broken
     * in Leaflet and we have to custom fire the event, I don't know how stop its propagation. So this
     * line informs this method that this dblclick actually happened for the image.
     */
    if (oe && oe.target instanceof HTMLImageElement) {
      return;
    }

    setTimeout(function() {
      map._clicked = 0;
      clearTimeout(map._clickTimeout);
    }, 0);

    if (!labels) { return; }

    if (labels.options.opacity === 1) {
      labels.options.opacity = 0;
      labels.setOpacity(0);
    } else {
      labels.options.opacity = 1;
      labels.setOpacity(1);
    }
  },
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);

/* eslint-disable max-len */
L.Map.include({

  _clicked: 0,

  addGoogleMutant: function(opts) {
    var url = 'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

    opts = this.mutantOptions = L.extend({
      mutantOpacity: 0.8,
      maxZoom: 18,
      minZoom: 0,
      labels: true,
      labelOpacity: 1,
      doubleClickLabels: true,
    }, opts);

    if (opts.maxZoom > 21) { opts.maxZoom = 18; }

    if (!opts.labels) {
      this.mutantOptions = L.extend(this.mutantOptions, {
        labelOpacity: opts.labels ? 1 : undefined,
        doubleClickLabels: opts.labels ? true : undefined,
      });
    }

    this._googleMutant = L.tileLayer(url, {
      maxZoom: opts.maxZoom,
      minZoom: opts.minZoom,
      opacity: opts.mutantOpacity,
    }).addTo(this);

    if (opts.labels) { this._addLabels(opts); }
    // shouldn't have this handler at all if there are no labels to toggle
    else {
      this.doubleClickLabels = undefined;
    }

    return this;
  },

  _addLabels: function(opts) {
    var url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}';

    if (opts.labelOpacity !== 0 && opts.labelOpacity !== 1) {
      opts.labelOpacity = 1;
    }

    this._labels = L.tileLayer(url, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      interactive: false,
      opacity: opts.labelOpacity,
      maxZoom: opts.maxZoom,
      minZoom: opts.minZoom,
      ext: 'png',
    }).addTo(this);

    if (this.mutantOptions.doubleClickLabels) {
      this.doubleClickLabels.enable();
    }

    return this;
  },
});
// start off with doubleClickZoom enabled, doubleClickLabels can later be enabled instead
// during initialization
L.Map.addInitHook(function() {
  this.doubleClickLabels.disable();
  this.doubleClickZoom.enable();
});
