window.ripples={init:function(e){"use strict";var t=function(e,t,n){"string"==typeof e&&(e=[e]),e.forEach(function(e){document.addEventListener(e,function(e){var o="number"!=typeof e.detail?e.detail:e.target;(function(e,t){return(e.matches||e.matchesSelector||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector||e.oMatchesSelector).call(e,t)})(o,t)&&n(e,o)})})},n=function(e,t,n){var o=t,r=o.parentNode,a=document.createElement("div"),c=r.getBoundingClientRect(),l={x:e.clientX-c.left,y:(window.ontouchstart?e.clientY-window.scrollY:e.clientY)-c.top},p="scale("+Math.round(o.offsetWidth/5)+")",s=new CustomEvent("rippleEnd",{detail:a});e.touches&&(l={x:e.touches[0].clientX-c.left,y:e.touches[0].clientY-c.top}),console.log(l),i=a,a.className="ripple",a.setAttribute("style","left:"+l.x+"px; top:"+l.y+"px;");var u=window.getComputedStyle(r).color;u=u.replace("rgb","rgba").replace(")",", 0.1)"),o.appendChild(a),window.getComputedStyle(a).opacity,a.dataset.animating=1,a.className="ripple ripple-on";var m=[a.getAttribute("style"),"background-color: "+u,"-ms-transform: "+p,"-moz-transform"+p,"-webkit-transform"+p,"transform: "+p];a.setAttribute("style",m.join(";")),setTimeout(function(){a.dataset.animating=0,document.dispatchEvent(s),n&&n()},500)},o=function(e){e.className="ripple ripple-on ripple-out",setTimeout(function(){e.remove()},100)},r=!1;t(["mousedown","touchstart"],"*",function(){r=!0}),t(["mouseup","touchend"],"*",function(){r=!1});var i;t(["mouseover","touchstart"],e,function(e,t){if(0===t.getElementsByClassName("ripple-wrapper").length){t.className+=" withripple";var o=document.createElement("div");o.className="ripple-wrapper",t.appendChild(o),null===window.ontouchstart&&n(e,o,function(){o.getElementsByClassName("ripple")[0].remove()})}}),t(["mousedown","touchstart"],".ripple-wrapper",function(e,t){0!==e.which&&1!==e.which&&2!==e.which||n(e,t)}),t("rippleEnd",".ripple-wrapper .ripple",function(e,t){var n=t.parentNode.getElementsByClassName("ripple");(!r||n[0]==t&&n.length>1)&&o(t)}),t(["mouseup","touchend"],".ripple-wrapper",function(){var e=i;e&&1!=e.dataset.animating&&o(e)})}};