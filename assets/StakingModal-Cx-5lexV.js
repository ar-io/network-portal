import{r as l,M as ne,R as re,m as D,I as $,a as _,h as oe,j as t,e as le,b as M,B as J,d as K,E as ie,g as ce,W as Q,l as z,s as de}from"./index-B_7SVAab.js";import{u as ue,b as me,B as pe,T as fe}from"./useGateway-CQI4nAu2.js";import{u as he,b as ge,d as xe,f as ye,E as Z,B as we,S as ve}from"./SuccessModal-DxVLXKXo.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},s=new Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="bc95057d-8bd1-46fa-6424-b0e53283e62b",e._sentryDebugIdIdentifier="sentry-dbid-bc95057d-8bd1-46fa-6424-b0e53283e62b")}catch{}})();var C=function(){return(C=Object.assign||function(e){for(var s,o=1,r=arguments.length;o<r;o++)for(var a in s=arguments[o])Object.prototype.hasOwnProperty.call(s,a)&&(e[a]=s[a]);return e}).apply(this,arguments)},be=function(e,s){var o={};for(a in e)Object.prototype.hasOwnProperty.call(e,a)&&s.indexOf(a)<0&&(o[a]=e[a]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,a=Object.getOwnPropertySymbols(e);r<a.length;r++)s.indexOf(a[r])<0&&Object.prototype.propertyIsEnumerable.call(e,a[r])&&(o[a[r]]=e[a[r]]);return o},T=function(e){return"Typesetting failed: ".concat(e.message!==void 0?e.message:e.toString())},ke=function(e){function s(){var x;O==="every"&&j&&v==="post"&&c.current!==null&&(c.current.style.visibility=(x=(x=p.style)==null?void 0:x.visibility)!=null?x:"visible"),k.current||(O==="first"&&c.current!==null&&(c.current.style.visibility="visible"),a&&a(),k.current=!0),g&&g(),d.current=!1}var r=e.inline,o=r!==void 0&&r,r=e.hideUntilTypeset,a=e.onInitTypeset,g=e.onTypeset,i=e.text,n=e.dynamic,h=e.typesettingOptions,S=e.renderMode,P=e.children,p=be(e,["inline","hideUntilTypeset","onInitTypeset","onTypeset","text","dynamic","typesettingOptions","renderMode","children"]),N=l.useRef(""),c=l.useRef(null),f=l.useContext(ne),O=r??(f==null?void 0:f.hideUntilTypeset),v=S??(f==null?void 0:f.renderMode),b=h??(f==null?void 0:f.typesettingOptions),j=n!==!1&&(n||!1),k=l.useRef(!1),d=l.useRef(!1);return!d.current&&c.current!==null&&j&&O==="every"&&v==="post"&&(c.current.style.visibility="hidden"),(typeof window<"u"?l.useLayoutEffect:l.useEffect)(function(){if((j||!k.current)&&c.current!==null){if(!f)throw Error("MathJax was not loaded, did you use the MathJax component outside of a MathJaxContext?");if(v==="pre"){if(!(typeof(x=i)=="string"&&0<x.length))throw Error(`Render mode 'pre' requires text prop to be set and non-empty, which was currently "`.concat(i,'"'));if(!h||!h.fn)throw Error("Render mode 'pre' requires 'typesettingOptions' prop with 'fn' property to be set on MathJax element or in the MathJaxContext");if(f.version===2)throw Error("Render mode 'pre' only available with MathJax 3, and version 2 is currently in use")}v!=="post"&&i===N.current||d.current||(d.current=!0,f.version===3?f.promise.then(function(u){var y;v==="pre"?(y=function(w){N.current=i,u.startup.document.clear(),u.startup.document.updateDocument(),c.current!==null&&(c.current.innerHTML=w.outerHTML),s()},h.fn.endsWith("Promise")?u.startup.promise.then(function(){return u[b.fn](i,C(C({},(b==null?void 0:b.options)||{}),{display:!o}))}).then(y).catch(function(w){throw s(),Error(T(w))}):u.startup.promise.then(function(){var w=u[b.fn](i,C(C({},(b==null?void 0:b.options)||{}),{display:!o}));y(w)}).catch(function(w){throw s(),Error(T(w))})):u.startup.promise.then(function(){return u.typesetClear([c.current]),u.typesetPromise([c.current])}).then(s).catch(function(w){throw s(),Error(T(w))})}).catch(function(u){throw s(),Error(T(u))}):f.promise.then(function(u){u.Hub.Queue(["Typeset",u.Hub,c.current]),u.Hub.Queue(s)}).catch(function(u){throw s(),Error(T(u))}))}var x}),re.createElement("span",C({},p,{style:C(C({display:o?"inline":"block"},p.style),{visibility:O?"hidden":(e=p.style)==null?void 0:e.visibility}),ref:c}),P)};const Ce=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame",clipPath:"url(#clip0_2391_9440)"},l.createElement("path",{id:"Vector",d:"M8.00016 14.6663C11.6821 14.6663 14.6668 11.6816 14.6668 7.99967C14.6668 4.31778 11.6821 1.33301 8.00016 1.33301C4.31826 1.33301 1.3335 4.31778 1.3335 7.99967C1.3335 11.6816 4.31826 14.6663 8.00016 14.6663Z",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M8 10.6667V8",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M8 5.33301H8.00667",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("clipPath",{id:"clip0_2391_9440"},l.createElement("rect",{width:16,height:16,fill:"white"})))),Se=e=>l.createElement("svg",{width:20,height:20,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"icon-WarningCircle"},l.createElement("path",{id:"Vector",d:"M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM10 16.875C8.64026 16.875 7.31105 16.4718 6.18046 15.7164C5.04987 14.9609 4.16868 13.8872 3.64833 12.6309C3.12798 11.3747 2.99183 9.99237 3.2571 8.65875C3.52238 7.32513 4.17716 6.10013 5.13864 5.13864C6.10013 4.17716 7.32514 3.52237 8.65876 3.2571C9.99238 2.99183 11.3747 3.12798 12.631 3.64833C13.8872 4.16868 14.9609 5.04987 15.7164 6.18045C16.4718 7.31104 16.875 8.64025 16.875 10C16.8729 11.8227 16.1479 13.5702 14.8591 14.8591C13.5702 16.1479 11.8227 16.8729 10 16.875ZM9.375 10.625V6.25C9.375 6.08424 9.44085 5.92527 9.55806 5.80806C9.67527 5.69085 9.83424 5.625 10 5.625C10.1658 5.625 10.3247 5.69085 10.4419 5.80806C10.5592 5.92527 10.625 6.08424 10.625 6.25V10.625C10.625 10.7908 10.5592 10.9497 10.4419 11.0669C10.3247 11.1842 10.1658 11.25 10 11.25C9.83424 11.25 9.67527 11.1842 9.55806 11.0669C9.44085 10.9497 9.375 10.7908 9.375 10.625ZM10.9375 13.4375C10.9375 13.6229 10.8825 13.8042 10.7795 13.9583C10.6765 14.1125 10.5301 14.2327 10.3588 14.3036C10.1875 14.3746 9.99896 14.3932 9.81711 14.357C9.63525 14.3208 9.4682 14.2315 9.33709 14.1004C9.20598 13.9693 9.11669 13.8023 9.08052 13.6204C9.04434 13.4385 9.06291 13.25 9.13387 13.0787C9.20482 12.9074 9.32499 12.761 9.47916 12.658C9.63333 12.555 9.81458 12.5 10 12.5C10.2486 12.5 10.4871 12.5988 10.6629 12.7746C10.8387 12.9504 10.9375 13.1889 10.9375 13.4375Z",fill:"url(#paint0_linear_2526_3331)"})),l.createElement("defs",null,l.createElement("linearGradient",{id:"paint0_linear_2526_3331",x1:1.875,y1:18.125,x2:18.776,y2:17.4171,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#FFB4B4"}),l.createElement("stop",{offset:1,stopColor:"#FF6C6C"})))),X=365,Ee=5e-4,Oe=.9,je=(e,s,o)=>{const a=e.valueOf()*Ee*Oe/s,g=o.settings.delegateRewardShareRatio/100,i=new D(o.totalDelegatedStake).toIO(),n=new $(a*g),h=i.valueOf()>0?n.valueOf()/i.valueOf():-1,S=h*X;return{totalDelegatedStake:i,rewardsSharedPerEpoch:n,EEY:h,EAY:S}},Ie=(e,s,o=!1)=>{const r=o?-1:1,a=s.valueOf()*r,g=a/(e.totalDelegatedStake.valueOf()+a),n=e.rewardsSharedPerEpoch.valueOf()*g/a,h=n*X;return{EEY:n,EAY:h}},Ne=()=>{const e=_(o=>o.arIOReadSDK);return ue({queryKey:["protocolBalance"],queryFn:()=>{if(e)return e.getBalance({address:oe.toString()});throw new Error("Error: ArIO Read SDK is not initialized")}})},Re=(e,s)=>{const{data:o}=he(),{data:r}=Ne();let a;if(o&&e&&r&&r>0&&!isNaN(s)){const g=o?Object.keys(o).length:0,i=je(new D(r).toIO(),g,e);a=Ie(i,new $(Math.abs(s)),s<0)}return a},Ae=()=>t.jsx("div",{children:t.jsxs("div",{className:"flex gap-3 rounded bg-containerL3 p-4",children:[t.jsx(Se,{width:40,height:20}),t.jsx("div",{className:"grow text-[0.8125rem] text-high",children:"30 days is the standard unstaking period. During this withdrawal time your tokens will be locked and will not be accruing rewards."})]})}),E=({label:e,value:s,className:o,isLink:r=!1,rightIcon:a})=>t.jsxs("div",{className:`flex items-center text-[0.8125rem] ${o}`,children:[t.jsx("div",{className:"text-left text-low",children:e}),t.jsx("div",{className:"grow"}),r&&s!=="-"?t.jsx("a",{className:"text-gradient",href:`https://${s}`,target:"_blank",rel:"noreferrer",children:s}):t.jsxs("div",{className:"flex items-center gap-1 text-left text-low",children:[s,a]})]}),De=({onClose:e,ownerWallet:s})=>{const o=le(),r=_(m=>m.balances),a=_(m=>m.walletAddress),g=_(m=>m.arIOWriteableSDK),i=_(m=>m.ticker),[n,h]=l.useState(0),[S,P]=l.useState(""),[p,N]=l.useState(""),[c,f]=l.useState(""),[O,v]=l.useState(!1),[b,j]=l.useState(!1),k=(s==null?void 0:s.toString())??S,{data:d}=me({ownerWalletAddress:k}),x=(d==null?void 0:d.settings.allowDelegatedStaking)??!1,u=a?d==null?void 0:d.delegates[a==null?void 0:a.toString()]:void 0,y=new D((u==null?void 0:u.delegatedStake)??0).toIO().valueOf(),w=n==0?y+parseFloat(p):y-parseFloat(c),ee=n==0?parseFloat(p):-parseFloat(c),q=Re(d,ee),te=q&&w>0?(q.EAY*100).toLocaleString("en-us",{maximumFractionDigits:2})+"%":"-",B=new D((u==null?void 0:u.delegatedStake)??0).toIO().valueOf(),G=d?new D(d==null?void 0:d.settings.minDelegatedStake).toIO().valueOf():500,R=B>0?1:G,A={address:ge("Gateway Owner"),stakeAmount:xe("Stake Amount",i,R,r.io),unstakeAmount:ye("Unstake Amount",i,B,G)},F=()=>!d||n==0&&!x?!1:n==0?A.stakeAmount(p)==null:A.unstakeAmount(c)==null,L=F()?r.io-parseFloat(p):"-",W="text-center py-6",V=`${W} bg-grey-700 border-b border-red-400`,H=`${W} bg-grey-1000 text-low`,se=()=>{n==0?N(r.io+""):f(y+"")},U=!d||n==0&&(r.io<R||!x)||n==1&&y<=0,ae=async()=>{if(a&&g&&d&&F()){v(!0);try{if(n==0){const{id:m}=await g.delegateStake({target:k,stakeQty:new $(parseFloat(p)).toMIO()},Q);z.info(`Increase Delegate Stake txID: ${m}`)}else{const{id:m}=await g.decreaseDelegateStake({target:k,decreaseQty:new $(parseFloat(c)).toMIO()},Q);z.info(`Decrease Delegate Stake txID: ${m}`)}o.invalidateQueries({queryKey:["gateway",a.toString()],refetchType:"all"}),o.invalidateQueries({queryKey:["gateways"],refetchType:"all"}),j(!0)}catch(m){de(`${m}`)}finally{v(!1)}}},I={gatewayOwner:A.address(k),stakeAmount:A.stakeAmount(p),unstakeAmount:A.unstakeAmount(c),cannotStake:r.io<R?`Insufficient balance, at least ${R} IO required.`:x?void 0:"Gateway does not allow delegated staking."};return t.jsx(pe,{onClose:e,useDefaultPadding:!1,children:t.jsxs("div",{className:"w-[28.5rem]",children:[t.jsxs("div",{className:"grid grid-cols-2",children:[t.jsx("button",{className:`${n==0?V:H} rounded-tl-lg`,onClick:()=>h(0),children:t.jsx("span",{className:n==0?"text-gradient":"",children:"Staking"})}),t.jsx("button",{className:`${n==1?V:H} rounded-tr-lg`,onClick:()=>h(1),children:t.jsx("span",{className:n==1?"text-gradient":"",children:"Unstaking"})})]}),t.jsxs("div",{className:"flex flex-col p-8",children:[t.jsx("div",{className:"text-left text-sm text-mid",children:"Gateway Owner:"}),s?t.jsx("div",{className:"py-3 text-left text-sm text-mid",children:s}):t.jsx("input",{className:"mt-3 size-full rounded-md border border-grey-800 bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",type:"text",placeholder:"Enter wallet address for Gateway",value:S,onChange:m=>{P(m.target.value)},maxLength:43}),t.jsxs("div",{className:"mt-8 flex items-center",children:[t.jsx("div",{className:"text-left text-sm text-mid",children:"Amount:"}),t.jsx("div",{className:"grow"}),t.jsx("div",{className:"text-left text-xs text-low",children:n==0?r&&`Available: ${M(r.io)} ${i}`:`Available to Unstake: ${M(y)} ${i}`})]}),t.jsxs("div",{className:"mt-3 flex h-[3.25rem] items-center overflow-hidden rounded-md border border-grey-800",children:[t.jsx("input",{className:"size-full grow  bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",disabled:U,readOnly:U,type:"text",placeholder:`Enter amount of ${i} to ${n==0?"stake":"unstake"}`,value:n==0?p:c,onChange:m=>{const Y=m.target.value;Y&&isNaN(+m.target.value)||(n==0?N(Y):f(Y))}}),n==0&&d&&((p==null?void 0:p.length)>0||r.io<R||!x)&&(I.cannotStake||I.stakeAmount)&&t.jsx(Z,{errorMessage:I.cannotStake??I.stakeAmount,tooltipPadding:"3"}),n==1&&(c==null?void 0:c.length)>0&&I.unstakeAmount&&t.jsx(Z,{errorMessage:I.unstakeAmount,tooltipPadding:"3"}),t.jsx(J,{className:"mr-3 h-7",onClick:U?void 0:se,buttonType:K.SECONDARY,active:!0,title:"Max",text:"Max"})]}),t.jsxs("div",{className:"mt-8",children:[n==0&&t.jsx(E,{className:"border-b border-divider pb-4",label:"Existing Stake:",value:`${B} ${i}`}),t.jsx(E,{className:"pb-1 pt-4",label:"Label:",value:d?d.settings.label:"-"}),t.jsx(E,{className:"py-1",label:"Domain:",isLink:!0,value:d?d.settings.fqdn:"-"}),t.jsx(E,{className:"py-1",label:"Delegate EAY:",value:te,rightIcon:t.jsx(fe,{message:t.jsxs("div",{children:[t.jsx("p",{children:ie}),t.jsx(ke,{className:"mt-4",children:ce})]}),children:t.jsx(Ce,{className:"size-4"})})}),t.jsx("div",{className:"pt-4 text-left",children:t.jsx(Ae,{})})]})]}),t.jsxs("div",{className:"flex size-full flex-col p-8",children:[t.jsx(E,{className:"py-1 first:text-mid last:text-mid",label:"Fee:",value:"- AR"}),n==0&&t.jsx(E,{className:"py-1",label:"Remaining Balance:",value:`${L!=="-"?M(+L):L} ${i}`}),t.jsx(E,{className:"py-1",label:"New Total Stake:",value:`${F()?n==0?M(y+parseFloat(p)):M(y-parseFloat(c)):"-"} ${i}`}),t.jsx("div",{className:F()?void 0:"pointer-events-none opacity-30",children:t.jsx(J,{className:"mt-8 h-[3.25rem] w-full",onClick:ae,buttonType:K.PRIMARY,title:n==0?`Stake ${i}`:`Unstake ${i}`,text:n==0?`Stake ${i}`:`Unstake ${i}`})})]}),O&&t.jsx(we,{onClose:()=>v(!1),message:"Sign the following data with your wallet to proceed."}),b&&t.jsx(ve,{onClose:()=>{j(!1),e()},title:"Congratulations",bodyText:"You have successfully updated stake."})]})})};export{ke as M,De as S,Ae as U,Ce as a,je as c,Ne as u};
//# sourceMappingURL=StakingModal-Cx-5lexV.js.map