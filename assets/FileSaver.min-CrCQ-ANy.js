import{r as j,o as me,aD as ge,aB as be,ay as O}from"./index-x5qP-qt5.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},r=new Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="93210a0b-ace8-4067-5b80-b469834c838b",e._sentryDebugIdIdentifier="sentry-dbid-93210a0b-ace8-4067-5b80-b469834c838b")}catch{}})();const ze=e=>j.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",className:"lucide lucide-download",...e},j.createElement("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),j.createElement("polyline",{points:"7 10 12 15 17 10"}),j.createElement("line",{x1:12,x2:12,y1:15,y2:3}));var p=Uint8Array,U=Uint16Array,Ee=Int32Array,oe=new p([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),ie=new p([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Ae=new p([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),fe=function(e,r){for(var n=new U(31),a=0;a<31;++a)n[a]=r+=1<<e[a-1];for(var i=new Ee(n[30]),a=1;a<30;++a)for(var w=n[a];w<n[a+1];++w)i[w]=w-n[a]<<5|a;return{b:n,r:i}},le=fe(oe,2),ve=le.b,xe=le.r;ve[28]=258,xe[258]=28;var Fe=fe(ie,0),ke=Fe.b,N=new U(32768);for(var v=0;v<32768;++v){var x=(v&43690)>>1|(v&21845)<<1;x=(x&52428)>>2|(x&13107)<<2,x=(x&61680)>>4|(x&3855)<<4,N[v]=((x&65280)>>8|(x&255)<<8)>>1}var D=function(e,r,n){for(var a=e.length,i=0,w=new U(r);i<a;++i)e[i]&&++w[e[i]-1];var u=new U(r);for(i=1;i<r;++i)u[i]=u[i-1]+w[i-1]<<1;var d;if(n){d=new U(1<<r);var m=15-r;for(i=0;i<a;++i)if(e[i])for(var l=i<<4|e[i],f=r-e[i],t=u[e[i]-1]++<<f,o=t|(1<<f)-1;t<=o;++t)d[N[t]>>m]=l}else for(d=new U(a),i=0;i<a;++i)e[i]&&(d[i]=N[u[e[i]-1]++]>>15-e[i]);return d},_=new p(288);for(var v=0;v<144;++v)_[v]=8;for(var v=144;v<256;++v)_[v]=9;for(var v=256;v<280;++v)_[v]=7;for(var v=280;v<288;++v)_[v]=8;var se=new p(32);for(var v=0;v<32;++v)se[v]=5;var Re=D(_,9,1),Se=D(se,5,1),G=function(e){for(var r=e[0],n=1;n<e.length;++n)e[n]>r&&(r=e[n]);return r},g=function(e,r,n){var a=r/8|0;return(e[a]|e[a+1]<<8)>>(r&7)&n},K=function(e,r){var n=r/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(r&7)},Te=function(e){return(e+7)/8|0},ue=function(e,r,n){return(r==null||r<0)&&(r=0),(n==null||n>e.length)&&(n=e.length),new p(e.subarray(r,n))},Ue=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],y=function(e,r,n){var a=new Error(r||Ue[e]);if(a.code=e,Error.captureStackTrace&&Error.captureStackTrace(a,y),!n)throw a;return a},Le=function(e,r,n,a){var i=e.length,w=0;if(!i||r.f&&!r.l)return n||new p(0);var u=!n,d=u||r.i!=2,m=r.i;u&&(n=new p(i*3));var l=function(ne){var ae=n.length;if(ne>ae){var te=new p(Math.max(ae*2,ne));te.set(n),n=te}},f=r.f||0,t=r.p||0,o=r.b||0,s=r.l,k=r.d,E=r.m,b=r.n,R=i*8;do{if(!s){f=g(e,t,1);var F=g(e,t+1,3);if(t+=3,F)if(F==1)s=Re,k=Se,E=9,b=5;else if(F==2){var q=g(e,t,31)+257,X=g(e,t+10,15)+4,J=q+g(e,t+5,31)+1;t+=14;for(var L=new p(J),z=new p(19),h=0;h<X;++h)z[Ae[h]]=g(e,t+h*3,7);t+=X*3;for(var P=G(z),we=(1<<P)-1,pe=D(z,P,1),h=0;h<J;){var Q=pe[g(e,t,we)];t+=Q&15;var c=Q>>4;if(c<16)L[h++]=c;else{var S=0,M=0;for(c==16?(M=3+g(e,t,3),t+=2,S=L[h-1]):c==17?(M=3+g(e,t,7),t+=3):c==18&&(M=11+g(e,t,127),t+=7);M--;)L[h++]=S}}var Y=L.subarray(0,q),A=L.subarray(q);E=G(Y),b=G(A),s=D(Y,E,1),k=D(A,b,1)}else y(1);else{var c=Te(t)+4,B=e[c-4]|e[c-3]<<8,H=c+B;if(H>i){m&&y(0);break}d&&l(o+B),n.set(e.subarray(c,H),o),r.b=o+=B,r.p=t=H*8,r.f=f;continue}if(t>R){m&&y(0);break}}d&&l(o+131072);for(var de=(1<<E)-1,he=(1<<b)-1,I=t;;I=t){var S=s[K(e,t)&de],T=S>>4;if(t+=S&15,t>R){m&&y(0);break}if(S||y(2),T<256)n[o++]=T;else if(T==256){I=t,s=null;break}else{var Z=T-254;if(T>264){var h=T-257,C=oe[h];Z=g(e,t,(1<<C)-1)+ve[h],t+=C}var W=k[K(e,t)&he],$=W>>4;W||y(3),t+=W&15;var A=ke[$];if($>3){var C=ie[$];A+=K(e,t)&(1<<C)-1,t+=C}if(t>R){m&&y(0);break}d&&l(o+131072);var ee=o+Z;if(o<A){var re=w-A,ye=Math.min(A,ee);for(re+o<0&&y(3);o<ye;++o)n[o]=a[re+o]}for(;o<ee;++o)n[o]=n[o-A]}}r.l=s,r.p=I,r.b=o,r.f=f,s&&(f=1,r.m=E,r.d=k,r.n=b)}while(!f);return o!=n.length&&u?ue(n,0,o):n.subarray(0,o)},Ce=new p(0),Oe=function(e){(e[0]!=31||e[1]!=139||e[2]!=8)&&y(6,"invalid gzip data");var r=e[3],n=10;r&4&&(n+=(e[10]|e[11]<<8)+2);for(var a=(r>>3&1)+(r>>4&1);a>0;a-=!e[n++]);return n+(r&2)},De=function(e){var r=e.length;return(e[r-4]|e[r-3]<<8|e[r-2]<<16|e[r-1]<<24)>>>0};function _e(e,r){var n=Oe(e);return n+8>e.length&&y(6,"invalid gzip data"),Le(e.subarray(n,-8),{i:2},new p(De(e)),r)}var V=typeof TextDecoder<"u"&&new TextDecoder,Me=0;try{V.decode(Ce,{stream:!0}),Me=1}catch{}var je=function(e){for(var r="",n=0;;){var a=e[n++],i=(a>127)+(a>223)+(a>239);if(n+i>e.length)return{s:r,r:ue(e,n-1)};i?i==3?(a=((a&15)<<18|(e[n++]&63)<<12|(e[n++]&63)<<6|e[n++]&63)-65536,r+=String.fromCharCode(55296|a>>10,56320|a&1023)):i&1?r+=String.fromCharCode((a&31)<<6|e[n++]&63):r+=String.fromCharCode((a&15)<<12|(e[n++]&63)<<6|e[n++]&63):r+=String.fromCharCode(a)}};function Be(e,r){var n;if(V)return V.decode(e);var a=je(e),i=a.s,n=a.r;return n.length&&y(8),i}const He=async e=>{const r=`${ge}://${be}/${e}`,n=await fetch(r);if(!n.ok)throw new Error(`Failed to fetch report: ${n.statusText}`);const a=await n.arrayBuffer();return _e(new Uint8Array(a))},Ie=e=>me({queryKey:["report",e],queryFn:async()=>{if(!e)throw new Error("reportId not available");const n=await He(e);return JSON.parse(Be(n))}});var ce={exports:{}};(function(e,r){(function(n,a){a()})(O,function(){function n(l,f){return typeof f>"u"?f={autoBom:!1}:typeof f!="object"&&(console.warn("Deprecated: Expected third argument to be a object"),f={autoBom:!f}),f.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(l.type)?new Blob(["\uFEFF",l],{type:l.type}):l}function a(l,f,t){var o=new XMLHttpRequest;o.open("GET",l),o.responseType="blob",o.onload=function(){m(o.response,f,t)},o.onerror=function(){console.error("could not download file")},o.send()}function i(l){var f=new XMLHttpRequest;f.open("HEAD",l,!1);try{f.send()}catch{}return 200<=f.status&&299>=f.status}function w(l){try{l.dispatchEvent(new MouseEvent("click"))}catch{var f=document.createEvent("MouseEvents");f.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),l.dispatchEvent(f)}}var u=typeof window=="object"&&window.window===window?window:typeof self=="object"&&self.self===self?self:typeof O=="object"&&O.global===O?O:void 0,d=u.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),m=u.saveAs||(typeof window!="object"||window!==u?function(){}:"download"in HTMLAnchorElement.prototype&&!d?function(l,f,t){var o=u.URL||u.webkitURL,s=document.createElement("a");f=f||l.name||"download",s.download=f,s.rel="noopener",typeof l=="string"?(s.href=l,s.origin===location.origin?w(s):i(s.href)?a(l,f,t):w(s,s.target="_blank")):(s.href=o.createObjectURL(l),setTimeout(function(){o.revokeObjectURL(s.href)},4e4),setTimeout(function(){w(s)},0))}:"msSaveOrOpenBlob"in navigator?function(l,f,t){if(f=f||l.name||"download",typeof l!="string")navigator.msSaveOrOpenBlob(n(l,t),f);else if(i(l))a(l,f,t);else{var o=document.createElement("a");o.href=l,o.target="_blank",setTimeout(function(){w(o)})}}:function(l,f,t,o){if(o=o||open("","_blank"),o&&(o.document.title=o.document.body.innerText="downloading..."),typeof l=="string")return a(l,f,t);var s=l.type==="application/octet-stream",k=/constructor/i.test(u.HTMLElement)||u.safari,E=/CriOS\/[\d]+/.test(navigator.userAgent);if((E||s&&k||d)&&typeof FileReader<"u"){var b=new FileReader;b.onloadend=function(){var c=b.result;c=E?c:c.replace(/^data:[^;]*;/,"data:attachment/file;"),o?o.location.href=c:location=c,o=null},b.readAsDataURL(l)}else{var R=u.URL||u.webkitURL,F=R.createObjectURL(l);o?o.location=F:location.href=F,o=null,setTimeout(function(){R.revokeObjectURL(F)},4e4)}});u.saveAs=m.saveAs=m,e.exports=m})})(ce);var We=ce.exports;export{We as F,ze as S,He as d,Ie as u};
//# sourceMappingURL=FileSaver.min-CrCQ-ANy.js.map