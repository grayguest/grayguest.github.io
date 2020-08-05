var DecorationsT,JobT,SourceSpansT,IN_GLOBAL_SCOPE=!1;!function(){"use strict";var e=window,t=document,n=t.documentElement,r=t.head||t.getElementsByTagName("head")[0]||n;for(var a="",s=t.getElementsByTagName("script"),o=s.length;--o>=0;){var l=s[o],i=l.src.match(/^[^?#]*\/run_prettify\.js(\?[^#]*)?(?:#.*)?$/);if(i){a=i[1]||"",l.parentNode.removeChild(l);break}}var u=!0,c=[],d=[],p=[];a.replace(/[?&]([^&=]+)=([^&]+)/g,function(e,t,n){n=decodeURIComponent(n),"autorun"==(t=decodeURIComponent(t))?u=!/^[0fn]/i.test(n):"lang"==t?c.push(n):"skin"==t?d.push(n):"callback"==t&&p.push(n)});for(var f="https://cdn.rawgit.com/google/code-prettify/master/loader",h=(o=0,c.length);o<h;++o)!function(e){var n=t.createElement("script");n.onload=n.onerror=n.onreadystatechange=function(){!n||n.readyState&&!/loaded|complete/.test(n.readyState)||(n.onerror=n.onload=n.onreadystatechange=null,--g,m(),n.parentNode&&n.parentNode.removeChild(n),n=null)},n.type="text/javascript",n.src=f+"/lang-"+encodeURIComponent(c[o])+".js",r.insertBefore(n,r.firstChild)}(c[o]);var g=c.length;function m(){g||e.setTimeout(b,0)}var v=[];for(o=0,h=d.length;o<h;++o)v.push(f+"/skins/"+encodeURIComponent(d[o])+".css");v.push(f+"/prettify.css"),function(e){var n=e.length;!function a(s){if(s!==n){var o=t.createElement("link");o.rel="stylesheet",o.type="text/css",s+1<n&&(o.error=o.onerror=function(){a(s+1)}),o.href=e[s],r.appendChild(o)}}(0)}(v);var y=function(){var e;return"undefined"!=typeof window&&(window.PR_SHOULD_USE_CONTINUATION=!0),function(){var t="undefined"!=typeof window?window:{},n=["break,continue,do,else,for,if,return,while"],r=[[n,"auto,case,char,const,default,double,enum,extern,float,goto,inline,int,long,register,restrict,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],"catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"],a=[r,"alignas,alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,delegate,dynamic_cast,explicit,export,friend,generic,late_check,mutable,namespace,noexcept,noreturn,nullptr,property,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"],s=[r,"abstract,assert,boolean,byte,extends,finally,final,implements,import,instanceof,interface,null,native,package,strictfp,super,synchronized,throws,transient"],o=[r,"abstract,add,alias,as,ascending,async,await,base,bool,by,byte,checked,decimal,delegate,descending,dynamic,event,finally,fixed,foreach,from,get,global,group,implicit,in,interface,internal,into,is,join,let,lock,null,object,out,override,orderby,params,partial,readonly,ref,remove,sbyte,sealed,select,set,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,value,var,virtual,where,yield"],l=[r,"abstract,async,await,constructor,debugger,enum,eval,export,from,function,get,import,implements,instanceof,interface,let,null,of,set,undefined,var,with,yield,Infinity,NaN"],i="caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",u=[n,"and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],c=[n,"alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"],d=[n,"case,done,elif,esac,eval,fi,function,in,local,set,then,until"],p=/^(DIR|FILE|array|vector|(de|priority_)?queue|(forward_)?list|stack|(const_)?(reverse_)?iterator|(unordered_)?(multi)?(set|map)|bitset|u?(int|float)\d*)\b/,f="str",h="kwd",g="com",m="typ",v="lit",y="pun",b="pln",x="src",w="(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*";function C(e,t,n,r,a){if(n){var s={sourceNode:e,pre:1,langExtension:null,numberLines:null,sourceCode:n,spans:null,basePos:t,decorations:null};r(s),a.push.apply(a,s.decorations)}}var S=/\S/;function N(e){for(var t=void 0,n=e.firstChild;n;n=n.nextSibling){var r=n.nodeType;t=1===r?t?e:n:3===r&&S.test(n.nodeValue)?e:t}return t===e?void 0:t}function E(e,t){var n,r={};!function(){for(var a=e.concat(t),s=[],o={},l=0,i=a.length;l<i;++l){var u=a[l],c=u[3];if(c)for(var d=c.length;--d>=0;)r[c.charAt(d)]=u;var p=u[1],f=""+p;o.hasOwnProperty(f)||(s.push(p),o[f]=null)}s.push(/[\0-\uffff]/),n=function(e){for(var t=0,n=!1,r=!1,a=0,s=e.length;a<s;++a)if((p=e[a]).ignoreCase)r=!0;else if(/[a-z]/i.test(p.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi,""))){n=!0,r=!1;break}var o={b:8,t:9,n:10,v:11,f:12,r:13};function l(e){var t=e.charCodeAt(0);if(92!==t)return t;var n=e.charAt(1);return(t=o[n])||("0"<=n&&n<="7"?parseInt(e.substring(1),8):"u"===n||"x"===n?parseInt(e.substring(2),16):e.charCodeAt(1))}function i(e){if(e<32)return(e<16?"\\x0":"\\x")+e.toString(16);var t=String.fromCharCode(e);return"\\"===t||"-"===t||"]"===t||"^"===t?"\\"+t:t}function u(e){var t=e.substring(1,e.length-1).match(new RegExp("\\\\u[0-9A-Fa-f]{4}|\\\\x[0-9A-Fa-f]{2}|\\\\[0-3][0-7]{0,2}|\\\\[0-7]{1,2}|\\\\[\\s\\S]|-|[^-\\\\]","g")),n=[],r="^"===t[0],a=["["];r&&a.push("^");for(var s=r?1:0,o=t.length;s<o;++s){var u=t[s];if(/\\[bdsw]/i.test(u))a.push(u);else{var c,d=l(u);s+2<o&&"-"===t[s+1]?(c=l(t[s+2]),s+=2):c=d,n.push([d,c]),c<65||d>122||(c<65||d>90||n.push([32|Math.max(65,d),32|Math.min(c,90)]),c<97||d>122||n.push([-33&Math.max(97,d),-33&Math.min(c,122)]))}}n.sort(function(e,t){return e[0]-t[0]||t[1]-e[1]});var p=[],f=[];for(s=0;s<n.length;++s)(h=n[s])[0]<=f[1]+1?f[1]=Math.max(f[1],h[1]):p.push(f=h);for(s=0;s<p.length;++s){var h=p[s];a.push(i(h[0])),h[1]>h[0]&&(h[1]+1>h[0]&&a.push("-"),a.push(i(h[1])))}return a.push("]"),a.join("")}function c(e){for(var r=e.source.match(new RegExp("(?:\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]|\\\\u[A-Fa-f0-9]{4}|\\\\x[A-Fa-f0-9]{2}|\\\\[0-9]+|\\\\[^ux0-9]|\\(\\?[:!=]|[\\(\\)\\^]|[^\\x5B\\x5C\\(\\)\\^]+)","g")),a=r.length,s=[],o=0,l=0;o<a;++o)"("===(d=r[o])?++l:"\\"===d.charAt(0)&&(c=+d.substring(1))&&(c<=l?s[c]=-1:r[o]=i(c));for(o=1;o<s.length;++o)-1===s[o]&&(s[o]=++t);for(o=0,l=0;o<a;++o)if("("===(d=r[o]))s[++l]||(r[o]="(?:");else if("\\"===d.charAt(0)){var c;(c=+d.substring(1))&&c<=l&&(r[o]="\\"+s[c])}for(o=0;o<a;++o)"^"===r[o]&&"^"!==r[o+1]&&(r[o]="");if(e.ignoreCase&&n)for(o=0;o<a;++o){var d,p=(d=r[o]).charAt(0);d.length>=2&&"["===p?r[o]=u(d):"\\"!==p&&(r[o]=d.replace(/[a-zA-Z]/g,function(e){var t=e.charCodeAt(0);return"["+String.fromCharCode(-33&t,32|t)+"]"}))}return r.join("")}var d=[];for(a=0,s=e.length;a<s;++a){var p;if((p=e[a]).global||p.multiline)throw new Error(""+p);d.push("(?:"+c(p)+")")}return new RegExp(d.join("|"),r?"gi":"g")}(s)}();var a=t.length,s=function(e){for(var o=e.sourceCode,l=e.basePos,i=e.sourceNode,u=[l,b],c=0,d=o.match(n)||[],p={},f=0,h=d.length;f<h;++f){var g,m=d[f],v=p[m],y=void 0;if("string"==typeof v)g=!1;else{var w=r[m.charAt(0)];if(w)y=m.match(w[1]),v=w[0];else{for(var S=0;S<a;++S)if(w=t[S],y=m.match(w[1])){v=w[0];break}y||(v=b)}!(g=v.length>=5&&"lang-"===v.substring(0,5))||y&&"string"==typeof y[1]||(g=!1,v=x),g||(p[m]=v)}var N=c;if(c+=m.length,g){var E=y[1],_=m.indexOf(E),L=_+E.length;y[2]&&(_=(L=m.length-y[2].length)-E.length);var T=v.substring(5);C(i,l+N,m.substring(0,_),s,u),C(i,l+N+_,E,P(T,E),u),C(i,l+N+L,m.substring(L),s,u)}else u.push(l+N,v)}e.decorations=u};return s}function _(e){var t=[],n=[];e.tripleQuotedStrings?t.push([f,/^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,null,"'\""]):e.multiLineStrings?t.push([f,/^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,null,"'\"`"]):t.push([f,/^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,null,"\"'"]),e.verbatimStrings&&n.push([f,/^@\"(?:[^\"]|\"\")*(?:\"|$)/,null]);var r=e.hashComments;r&&(e.cStyleComments?(r>1?t.push([g,/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,null,"#"]):t.push([g,/^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\r\n]*)/,null,"#"]),n.push([f,/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,null])):t.push([g,/^#[^\r\n]*/,null,"#"])),e.cStyleComments&&(n.push([g,/^\/\/[^\r\n]*/,null]),n.push([g,/^\/\*[\s\S]*?(?:\*\/|$)/,null]));var a=e.regexLiterals;if(a){var s=a>1?"":"\n\r",o=s?".":"[\\S\\s]",l="/(?=[^/*"+s+"])(?:[^/\\x5B\\x5C"+s+"]|\\x5C"+o+"|\\x5B(?:[^\\x5C\\x5D"+s+"]|\\x5C"+o+")*(?:\\x5D|$))+/";n.push(["lang-regex",RegExp("^"+w+"("+l+")")])}var i=e.types;i&&n.push([m,i]);var u=(""+e.keywords).replace(/^ | $/g,"");u.length&&n.push([h,new RegExp("^(?:"+u.replace(/[\s,]+/g,"|")+")\\b"),null]),t.push([b,/^\s+/,null," \r\n\t "]);var c="^.[^\\s\\w.$@'\"`/\\\\]*";return e.regexLiterals&&(c+="(?!s*/)"),n.push([v,/^@[a-z_$][a-z_$@0-9]*/i,null],[m,/^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/,null],[b,/^[a-z_$][a-z_$@0-9]*/i,null],[v,new RegExp("^(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)[a-z]*","i"),null,"0123456789"],[b,/^\\[\s\S]?/,null],[y,new RegExp(c),null]),E(t,n)}function L(e,t,n){for(var r=/(?:^|\s)nocode(?:\s|$)/,a=/\r\n?|\n/,s=e.ownerDocument,o=s.createElement("li");e.firstChild;)o.appendChild(e.firstChild);var l=[o];function i(e){var t=e.nodeType;if(1!=t||r.test(e.className)){if((3==t||4==t)&&n){var o=e.nodeValue,l=o.match(a);if(l){var c=o.substring(0,l.index);e.nodeValue=c;var d=o.substring(l.index+l[0].length);if(d)e.parentNode.insertBefore(s.createTextNode(d),e.nextSibling);u(e),c||e.parentNode.removeChild(e)}}}else if("br"===e.nodeName.toLowerCase())u(e),e.parentNode&&e.parentNode.removeChild(e);else for(var p=e.firstChild;p;p=p.nextSibling)i(p)}function u(e){for(;!e.nextSibling;)if(!(e=e.parentNode))return;for(var t,n=function e(t,n){var r=n?t.cloneNode(!1):t,a=t.parentNode;if(a){var s=e(a,1),o=t.nextSibling;s.appendChild(r);for(var l=o;l;l=o)o=l.nextSibling,s.appendChild(l)}return r}(e.nextSibling,0);(t=n.parentNode)&&1===t.nodeType;)n=t;l.push(n)}for(var c=0;c<l.length;++c)i(l[c]);t===(0|t)&&l[0].setAttribute("value",t);var d=s.createElement("ol");d.className="linenums";for(var p=Math.max(0,t-1|0)||0,f=(c=0,l.length);c<f;++c)(o=l[c]).className="L"+(c+p)%10,o.firstChild||o.appendChild(s.createTextNode(" ")),d.appendChild(o);e.appendChild(d)}var T={};function k(e,n){for(var r=n.length;--r>=0;){var a=n[r];T.hasOwnProperty(a)?t.console&&console.warn("cannot override language handler %s",a):T[a]=e}}function P(e,t){return e&&T.hasOwnProperty(e)||(e=/^\s*</.test(t)?"default-markup":"default-code"),T[e]}function R(e){var n,r,a,s,o,l,i,u=e.langExtension;try{var c=(n=e.sourceNode,r=e.pre,a=/(?:^|\s)nocode(?:\s|$)/,s=[],o=0,l=[],i=0,function e(t){var n=t.nodeType;if(1==n){if(a.test(t.className))return;for(var u=t.firstChild;u;u=u.nextSibling)e(u);var c=t.nodeName.toLowerCase();"br"!==c&&"li"!==c||(s[i]="\n",l[i<<1]=o++,l[i++<<1|1]=t)}else if(3==n||4==n){var d=t.nodeValue;d.length&&(d=r?d.replace(/\r\n?/g,"\n"):d.replace(/[ \t\r\n]+/g," "),s[i]=d,l[i<<1]=o,o+=d.length,l[i++<<1|1]=t)}}(n),{sourceCode:s.join("").replace(/\n$/,""),spans:l}),d=c.sourceCode;e.sourceCode=d,e.spans=c.spans,e.basePos=0,P(u,d)(e),function(e){var t=/\bMSIE\s(\d+)/.exec(navigator.userAgent);t=t&&+t[1]<=8;var n,r,a=/\n/g,s=e.sourceCode,o=s.length,l=0,i=e.spans,u=i.length,c=0,d=e.decorations,p=d.length,f=0;for(d[p]=o,r=n=0;r<p;)d[r]!==d[r+2]?(d[n++]=d[r++],d[n++]=d[r++]):r+=2;for(p=n,r=n=0;r<p;){for(var h=d[r],g=d[r+1],m=r+2;m+2<=p&&d[m+1]===g;)m+=2;d[n++]=h,d[n++]=g,r=m}p=d.length=n;var v=e.sourceNode,y="";v&&(y=v.style.display,v.style.display="none");try{for(;c<u;){i[c];var b,x=i[c+2]||o,w=d[f+2]||o,C=(m=Math.min(x,w),i[c+1]);if(1!==C.nodeType&&(b=s.substring(l,m))){t&&(b=b.replace(a,"\r")),C.nodeValue=b;var S=C.ownerDocument,N=S.createElement("span");N.className=d[f+1];var E=C.parentNode;E.replaceChild(N,C),N.appendChild(C),l<x&&(i[c+1]=C=S.createTextNode(s.substring(m,x)),E.insertBefore(C,N.nextSibling))}(l=m)>=x&&(c+=2),l>=w&&(f+=2)}}finally{v&&(v.style.display=y)}}(e)}catch(e){t.console&&console.log(e&&e.stack||e)}}function A(e,t,n){var r=n||!1,a=t||null,s=document.createElement("div");return s.innerHTML="<pre>"+e+"</pre>",s=s.firstChild,r&&L(s,r,!0),R({langExtension:a,numberLines:r,sourceNode:s,pre:1,sourceCode:null,basePos:null,spans:null,decorations:null}),s.innerHTML}function $(e,n){var r=n||document.body,a=r.ownerDocument||document;function s(e){return r.getElementsByTagName(e)}for(var o=[s("pre"),s("code"),s("xmp")],l=[],i=0;i<o.length;++i)for(var u=0,c=o[i].length;u<c;++u)l.push(o[i][u]);o=null;var d=Date;d.now||(d={now:function(){return+new Date}});var p=0,f=/\blang(?:uage)?-([\w.]+)(?!\S)/,h=/\bprettyprint\b/,g=/\bprettyprinted\b/,m=/pre|xmp/i,v=/^code$/i,y=/^(?:pre|code|xmp)$/i,b={};!function n(){for(var r=t.PR_SHOULD_USE_CONTINUATION?d.now()+250:1/0;p<l.length&&d.now()<r;p++){for(var s=l[p],o=b,i=s;i=i.previousSibling;){var u=i.nodeType,c=(7===u||8===u)&&i.nodeValue;if(c?!/^\??prettify\b/.test(c):3!==u||/\S/.test(i.nodeValue))break;if(c){o={},c.replace(/\b(\w+)=([\w:.%+-]+)/g,function(e,t,n){o[t]=n});break}}var x=s.className;if((o!==b||h.test(x))&&!g.test(x)){for(var w=!1,C=s.parentNode;C;C=C.parentNode){var S=C.tagName;if(y.test(S)&&C.className&&h.test(C.className)){w=!0;break}}if(!w){s.className+=" prettyprinted";var E,_,T=o.lang;if(T||(!(T=x.match(f))&&(E=N(s))&&v.test(E.tagName)&&(T=E.className.match(f)),T&&(T=T[1])),m.test(s.tagName))_=1;else{var k=s.currentStyle,P=a.defaultView,A=k?k.whiteSpace:P&&P.getComputedStyle?P.getComputedStyle(s,null).getPropertyValue("white-space"):0;_=A&&"pre"===A.substring(0,3)}var $=o.linenums;($="true"===$||+$)||($=!!($=x.match(/\blinenums\b(?::(\d+))?/))&&(!$[1]||!$[1].length||+$[1])),$&&L(s,$,_),R({langExtension:T,sourceNode:s,numberLines:$,pre:_,sourceCode:null,basePos:null,spans:null,decorations:null})}}}p<l.length?t.setTimeout(n,250):"function"==typeof e&&e()}()}k(_({keywords:[a,o,s,l,i,u,c,d],hashComments:!0,cStyleComments:!0,multiLineStrings:!0,regexLiterals:!0}),["default-code"]),k(E([],[[b,/^[^<?]+/],["dec",/^<!\w[^>]*(?:>|$)/],[g,/^<\!--[\s\S]*?(?:-\->|$)/],["lang-",/^<\?([\s\S]+?)(?:\?>|$)/],["lang-",/^<%([\s\S]+?)(?:%>|$)/],[y,/^(?:<[%?]|[%?]>)/],["lang-",/^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],["lang-js",/^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i]]),["default-markup","htm","html","mxml","xhtml","xml","xsl"]),k(E([[b,/^[\s]+/,null," \t\r\n"],["atv",/^(?:\"[^\"]*\"?|\'[^\']*\'?)/,null,"\"'"]],[["tag",/^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],["atn",/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],["lang-uq.val",/^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],[y,/^[=<>\/]+/],["lang-js",/^on\w+\s*=\s*\"([^\"]+)\"/i],["lang-js",/^on\w+\s*=\s*\'([^\']+)\'/i],["lang-js",/^on\w+\s*=\s*([^\"\'>\s]+)/i],["lang-css",/^style\s*=\s*\"([^\"]+)\"/i],["lang-css",/^style\s*=\s*\'([^\']+)\'/i],["lang-css",/^style\s*=\s*([^\"\'>\s]+)/i]]),["in.tag"]),k(E([],[["atv",/^[\s\S]+/]]),["uq.val"]),k(_({keywords:a,hashComments:!0,cStyleComments:!0,types:p}),["c","cc","cpp","cxx","cyc","m"]),k(_({keywords:"null,true,false"}),["json"]),k(_({keywords:o,hashComments:!0,cStyleComments:!0,verbatimStrings:!0,types:p}),["cs"]),k(_({keywords:s,cStyleComments:!0}),["java"]),k(_({keywords:d,hashComments:!0,multiLineStrings:!0}),["bash","bsh","csh","sh"]),k(_({keywords:u,hashComments:!0,multiLineStrings:!0,tripleQuotedStrings:!0}),["cv","py","python"]),k(_({keywords:i,hashComments:!0,multiLineStrings:!0,regexLiterals:2}),["perl","pl","pm"]),k(_({keywords:c,hashComments:!0,multiLineStrings:!0,regexLiterals:!0}),["rb","ruby"]),k(_({keywords:l,cStyleComments:!0,regexLiterals:!0}),["javascript","js","ts","typescript"]),k(_({keywords:"all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes",hashComments:3,cStyleComments:!0,multilineStrings:!0,tripleQuotedStrings:!0,regexLiterals:!0}),["coffee"]),k(E([],[[f,/^[\s\S]+/]]),["regex"]);var O=t.PR={createSimpleLexer:E,registerLangHandler:k,sourceDecorator:_,PR_ATTRIB_NAME:"atn",PR_ATTRIB_VALUE:"atv",PR_COMMENT:g,PR_DECLARATION:"dec",PR_KEYWORD:h,PR_LITERAL:v,PR_NOCODE:"nocode",PR_PLAIN:b,PR_PUNCTUATION:y,PR_SOURCE:x,PR_STRING:f,PR_TAG:"tag",PR_TYPE:m,prettyPrintOne:IN_GLOBAL_SCOPE?t.prettyPrintOne=A:A,prettyPrint:IN_GLOBAL_SCOPE?t.prettyPrint=$:e=$},I=t.define;"function"==typeof I&&I.amd&&I("google-code-prettify",[],function(){return O})}(),e}();function b(){u&&function(r){var a=t.addEventListener,s=!1,o=!0,l=a?"addEventListener":"attachEvent",i=a?"removeEventListener":"detachEvent",u=a?"":"on",c=function(n){"readystatechange"==n.type&&"complete"!=t.readyState||(("load"==n.type?e:t)[i](u+n.type,c,!1),!s&&(s=!0)&&r.call(e,n.type||n))},d=function(){try{n.doScroll("left")}catch(t){return void e.setTimeout(d,50)}c("poll")};if("complete"==t.readyState)r.call(e,"lazy");else{if(t.createEventObject&&n.doScroll){try{o=!e.frameElement}catch(e){}o&&d()}t[l](u+"DOMContentLoaded",c,!1),t[l](u+"readystatechange",c,!1),e[l](u+"load",c,!1)}}(function(){var t=p.length;y(t?function(){for(var n=0;n<t;++n)!function(t){e.setTimeout(function(){e.exports[p[t]].apply(e,arguments)},0)}(n)}:void 0)})}m()}();