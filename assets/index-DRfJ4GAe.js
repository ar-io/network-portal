import{r as l,d as ie,e as de,j as e,L as M,P as D,g as ke,h as we,i as ce,a as N,B as Oe,c as se,k as T,l as L,n as De,W as P,s as xe,m as S,C as Re,b as me,o as ue,p as Ee,q as Ie,t as te,T as Te,E as Ae,O as Me,I as B,v as _}from"./index-OGVmtqYj.js";import{S as Le,R as b,c as ye,i as re,F as Ce}from"./formData-C91Y25XC.js";import{B as pe,S as he,v as ae,a as $e,b as Pe,c as Fe,d as oe,e as Ge}from"./SuccessModal-CCCp9NXu.js";import{S as We,D as ve,c as qe,M as Be,a as _e}from"./Dropdown-CUNmurN0.js";import{u as Ke}from"./useGateway-By0UhANZ.js";import{S as Ve}from"./header_separator-BsC36gZ1.js";import{S as Ye}from"./reports-B7SuG4_w.js";(function(){try{var r=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},s=new Error().stack;s&&(r._sentryDebugIds=r._sentryDebugIds||{},r._sentryDebugIds[s]="97930487-9b92-45c9-b950-ee142bdafbfc",r._sentryDebugIdIdentifier="sentry-dbid-97930487-9b92-45c9-b950-ee142bdafbfc")}catch{}})();const ze=r=>l.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none",xmlns:"http://www.w3.org/2000/svg",...r},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M6 10H10.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M8.25 1.75011C8.44891 1.5512 8.7187 1.43945 9 1.43945C9.13929 1.43945 9.27721 1.46689 9.4059 1.52019C9.53458 1.57349 9.65151 1.65162 9.75 1.75011C9.84849 1.8486 9.92662 1.96553 9.97992 2.09422C10.0332 2.2229 10.0607 2.36083 10.0607 2.50011C10.0607 2.6394 10.0332 2.77733 9.97992 2.90601C9.92662 3.0347 9.84849 3.15162 9.75 3.25011L3.5 9.50011L1.5 10.0001L2 8.00011L8.25 1.75011Z",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M7.5 2.5L9 4",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),K=r=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...r},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M10 6.66797L13.3333 10.0013L10 13.3346",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M2.66797 2.66797V7.33464C2.66797 8.04188 2.94892 8.72016 3.44902 9.22025C3.94911 9.72035 4.62739 10.0013 5.33464 10.0013H13.3346",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}))),Qe=({url:r})=>ie({queryKey:["healthcheck",r],queryFn:async()=>{if(r===void 0)throw new Error("Error: no URL provided.");const a=`${r}/ar-io/healthcheck`,i=await(await fetch(a)).json();return{uptime:i.uptime,message:i.message,date:new Date(i.date)}}}),Ue=({gateway:r})=>{const s=de(),a=s==null?void 0:s.ownerId;return e.jsxs("header",{className:"mt-6 flex-col text-clip rounded-xl border leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300",children:[e.jsxs("div",{className:"flex items-center gap-3 py-5 pl-6 pr-4 text-sm",children:[e.jsx("div",{className:"text-mid",children:e.jsx(M,{to:"/gateways",children:"Gateways"})}),e.jsx(Ve,{className:"size-4"}),r?e.jsx("div",{className:"text-low",children:r.settings.label}):e.jsx(D,{}),e.jsx("div",{className:"grow"}),e.jsx("div",{className:"items-center",children:e.jsx(ke,{})})]}),e.jsxs("div",{className:"flex items-center gap-3 rounded-b-xl bg-grey-900 py-5 pl-6",children:[e.jsx(Le,{className:"h-3 w-4"}),r?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"text-high",children:r.settings.label}),e.jsx("div",{className:"grow"}),e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"pr-6 text-sm text-mid",children:e.jsxs(M,{className:"flex gap-2 ",to:`/gateways/${a}/reports`,children:[e.jsx(Ye,{className:"size-4"}),"Reports"]})}),e.jsx("div",{className:"border-l border-grey-400 px-6 text-sm text-mid",children:e.jsxs(M,{className:"flex gap-2 ",to:`/gateways/${a}/observe`,children:[e.jsx(we,{className:"size-4"}),"Observe"]})})]})]}):e.jsx(D,{})]})]})},le=5e4,He=({onClose:r})=>{const s=ce(),a=N(u=>u.walletAddress),d=N(u=>u.arIOWriteableSDK),i=N(u=>u.ticker),[x,m]=l.useState(!1),[c,n]=l.useState(!1),[p,t]=l.useState(),[k,h]=l.useState(""),R=k==="LEAVE NETWORK",E=async()=>{if(a&&d){m(!0);try{const{id:u}=await d.leaveNetwork(P);t(u),s.invalidateQueries({queryKey:["gateway",a.toString()],refetchType:"all"}),s.invalidateQueries({queryKey:["gateways"],refetchType:"all"}),n(!0)}catch(u){xe(`${u}`)}finally{m(!1)}}};return e.jsxs(e.Fragment,{children:[e.jsx(Oe,{onClose:r,useDefaultPadding:!1,children:e.jsxs("div",{className:"w-[28.4375rem] text-left",children:[e.jsx("div",{className:"px-8  pb-4 pt-6",children:e.jsx("div",{className:"text-lg text-high",children:"Leave Network"})}),e.jsxs("div",{className:"border-y border-grey-800 p-8 text-sm text-mid",children:[e.jsx("div",{children:"This action will begin the process of removing your gateway from the network. Once confirmed, the following actions will be initiated in the next epoch:"}),e.jsxs("ul",{className:"mt-6 list-disc space-y-2 pl-8",children:[e.jsxs("li",{children:["Your gateway's primary stake (",se(le)," ",i,") will be vaulted and subject to a 90-day withdrawal period."]}),e.jsxs("li",{children:["Any additional operator stake above the minimum (",se(le)," ",i,") will be vaulted and subject to a 30-day withdrawal period."]}),e.jsxs("li",{children:["Any existing delegated stakes will be vaulted and subject to 30-day withdrawal period."," "]}),e.jsx("li",{children:"Your gateway status will change to leaving and will no longer be eligible for protocol rewards or observation duties."})]})]}),e.jsxs("div",{className:"bg-containerL0 px-8 pb-8 pt-6",children:[e.jsxs("div",{className:"mb-6 flex flex-col items-center gap-2 text-sm text-mid",children:[e.jsx("div",{children:'Please type "LEAVE NETWORK" in the text box to proceed.'}),e.jsx("input",{type:"text",onChange:u=>h(u.target.value),className:"h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",value:k})]}),e.jsx("div",{className:"flex grow justify-center",children:e.jsx(T,{onClick:E,buttonType:L.PRIMARY,title:"Leave Network",text:e.jsx("div",{className:"py-2",children:"Leave Network"}),className:`w-full ${!R&&"pointer-events-none opacity-30"}`})})]})]})}),x&&e.jsx(pe,{onClose:()=>m(!1),message:"Sign the following data with your wallet to proceed."}),c&&e.jsx(he,{onClose:()=>{n(!1),r()},title:"Confirmed",bodyText:e.jsxs("div",{className:"mb-8 text-sm text-mid",children:[e.jsx("div",{children:"You have successfully left the network."}),e.jsxs("div",{className:"my-2 flex flex-col justify-center gap-2",children:[e.jsx("div",{children:"Transaction ID:"}),e.jsxs("button",{className:"flex items-center justify-center",title:"View transaction on ao.link",onClick:async()=>{window.open(`https://ao.link/#/message/${p}`,"_blank")},children:[p,e.jsx(De,{className:"ml-1 size-3"})]})]})]})})]})},Je=({label:r,value:s,type:a,rightComponent:d})=>e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"border-t border-grey-900",children:e.jsx("div",{className:" bg-grey-1000 px-6 py-3 text-xs text-low",children:r})}),e.jsx("div",{className:"flex flex-col content-center justify-center border-t border-grey-900 pl-6 text-sm text-low",children:s===void 0?e.jsx(D,{}):typeof s=="boolean"?e.jsxs("div",{className:"flex items-center",children:[e.jsx("span",{className:`grow ${s?"text-green-600":void 0}`,children:s?"Enabled":"Disabled"}),d]}):a=="address"||a=="tx"?e.jsx("a",{className:"text-high",href:`https://viewblock.io/arweave/${a}/${s}`,target:"_blank",rel:"noreferrer",children:s}):a=="link"?e.jsx("a",{className:"text-gradient",href:s+"",target:"_blank",rel:"noreferrer",children:s}):e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"grow",children:s}),d]})})]}),Xe=({ownerId:r,gateway:s})=>{const a=N(u=>u.walletAddress),d=N(u=>u.ticker),i=r&&r===(a==null?void 0:a.toString()),[x,m]=l.useState(),[c,n]=l.useState(!1),[p,t]=l.useState(!1),k=s?`${s.settings.protocol}://${s.settings.fqdn}:${s.settings.port}`:void 0,h=(s==null?void 0:s.status)=="leaving",R=s!=null&&s.settings.allowDelegatedStaking?[{label:"Reward Share Ratio:",value:h?"N/A":`${s==null?void 0:s.settings.delegateRewardShareRatio}%`},{label:`Minimum Delegated Stake (${d}):`,value:h?"N/A":new S((s==null?void 0:s.settings.minDelegatedStake)||0).toIO().valueOf()}]:[],E=[{label:"Label:",value:s==null?void 0:s.settings.label},{label:"Address:",value:k,type:"link"},{label:"Owner Wallet:",value:r,type:"address"},{label:"Observer Wallet:",value:s==null?void 0:s.observerAddress,type:"address"},{label:"Properties ID:",value:s==null?void 0:s.settings.properties,type:"tx"},{label:`Gateway Stake (${d}):`,value:(s==null?void 0:s.operatorStake)!=null?new S(s==null?void 0:s.operatorStake).toIO().valueOf():void 0},{label:"Status:",value:(s==null?void 0:s.status)=="leaving"?e.jsx("div",{className:"text-[#f00]",children:"leaving"}):s==null?void 0:s.status,rightComponent:i&&(s==null?void 0:s.status)=="joined"?e.jsx(T,{className:"*:*:text-gradient-red mr-2",buttonType:L.PRIMARY,active:!0,title:"Leave Network",text:"Leave",onClick:()=>{t(!0)}}):void 0},{label:"Note:",value:s==null?void 0:s.settings.note},{label:`Total Delegated Stake (${d}):`,value:h?"N/A":(s==null?void 0:s.totalDelegatedStake)==null?void 0:new S(s.totalDelegatedStake).toIO().valueOf()},{label:"Reward Auto Stake:",value:h?"N/A":s==null?void 0:s.settings.autoStake},{label:"Delegated Staking:",value:h?"N/A":s==null?void 0:s.settings.allowDelegatedStaking,rightComponent:s!=null&&s.settings.allowDelegatedStaking&&(s==null?void 0:s.status)=="joined"?e.jsx(T,{className:"mr-2",buttonType:L.PRIMARY,active:!0,title:"Manage Stake",text:"Stake",onClick:()=>{a?m(r):n(!0)}}):void 0},...R];return e.jsxs("div",{className:"grid grid-cols-[14.375rem_auto]",children:[E.map(({label:u,value:A,type:g,rightComponent:y},v)=>e.jsx(Je,{label:u,value:A,type:g,rightComponent:y},v)),x&&e.jsx(We,{open:!!x,onClose:()=>m(void 0),ownerWallet:x}),c&&e.jsx(Re,{onClose:()=>n(!1)}),p&&e.jsx(He,{onClose:()=>t(!1)})]})},Ze=()=>{const{data:r}=me(),[s,a]=l.useState();return l.useEffect(()=>{if(r){const d={};Object.entries(r).forEach(([i,x])=>{d[x.observerAddress]=i}),a(d)}},[r]),s},es=({gateway:r})=>{const{data:s}=ue(),[a,d]=l.useState(0),[i,x]=l.useState([]),m=Ze();return l.useEffect(()=>{if(s){const c=s[a];if(r){const n=(c==null?void 0:c.observations.failureSummaries[r.gatewayAddress])||[];x(n)}else x([])}else x([])},[s,r,a]),e.jsxs("div",{className:"w-full rounded-xl border border-transparent-100-16 text-sm",children:[e.jsx("div",{className:"flex border-b border-grey-500 bg-containerL3",children:s?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grow whitespace-nowrap px-6 py-4",children:i.length==0?e.jsx("div",{className:"text-mid",children:"No Failures Reported"}):e.jsxs("div",{className:"text-mid",children:["Failed by"," ",e.jsxs("span",{className:"text-red-500",children:[i.length,"/50"]})," ","observers"]})}),e.jsx(ve,{options:(s==null?void 0:s.map((c,n)=>({label:n==0?"Current Epoch":`Epoch ${c==null?void 0:c.epochIndex}`,value:n.toString()})))||[],onChange:c=>{d(Number(c.target.value))},value:a.toString()})]}):e.jsx(D,{className:"m-4 h-4"})}),e.jsx("div",{className:"h-80 overflow-hidden overflow-y-auto scrollbar",children:i==null?void 0:i.map(c=>{var n;return e.jsxs("div",{className:"flex gap-1 border-t border-grey-500 px-6 py-4 text-xs text-low",children:[e.jsx(K,{className:"size-4"}),e.jsx("div",{children:m&&s?e.jsx(M,{to:`/gateways/${m[c]}/reports/${(n=s==null?void 0:s[a])==null?void 0:n.observations.reports[c]}`,children:c}):e.jsx(D,{className:"h-4"})})]},c)})})]})},ss=({gateway:r})=>{const{data:s}=ue(),[a,d]=l.useState(0),[i,x]=l.useState([]),[m,c]=l.useState();return l.useEffect(()=>{var n;if(s){const p=s[a];if(r&&p){const t=r.observerAddress;c(((n=p.prescribedObservers)==null?void 0:n.find(h=>h.observerAddress==t))!==void 0);const k=Object.entries(p.observations.failureSummaries).reduce((h,[R,E])=>(E.includes(t)&&h.push(R),h),[]);x(k)}else c(void 0),x([])}else c(void 0),x([])},[s,r,a]),e.jsxs("div",{className:"w-full rounded-xl border border-transparent-100-16 text-sm",children:[e.jsx("div",{className:"flex border-b border-grey-500 bg-containerL3 ",children:s?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grow whitespace-nowrap px-6 py-4",children:m?e.jsxs("div",{className:"text-mid",children:["Reported on"," ",e.jsx("span",{className:"text-red-500",children:i.length})," ","gateways"]}):e.jsx("div",{className:"text-low",children:"Not Selected for Observation"})}),e.jsx(ve,{options:(s==null?void 0:s.map((n,p)=>({label:p==0?"Current Epoch":`Epoch ${n==null?void 0:n.epochIndex}`,value:p.toString()})))||[],onChange:n=>d(Number(n.target.value)),value:a.toString()})]}):e.jsx(D,{className:"m-4 h-4"})}),e.jsx("div",{className:"h-80 overflow-hidden overflow-y-auto scrollbar",children:i==null?void 0:i.map(n=>e.jsxs("div",{className:"flex gap-1 border-t border-grey-500 px-6 py-4 text-xs text-low",children:[e.jsx(K,{className:"size-4"}),e.jsxs("div",{children:[e.jsx(M,{to:`/gateways/${n}`,children:n})," "]})]},n))})]})},ts=({gateway:r})=>e.jsxs("div",{className:"grid min-w-[50rem] grid-cols-2 gap-6",children:[e.jsx(es,{gateway:r}),e.jsx(ss,{gateway:r})]}),rs=({url:r})=>ie({queryKey:["ario-info",r],queryFn:async()=>{if(r===void 0)throw new Error("Error: no URL provided.");const a=`${r}/ar-io/info`;return await(await fetch(a)).json()}}),ne=({value:r})=>e.jsxs("div",{className:"flex gap-1",children:[e.jsx(K,{className:"size-4"}),r!==void 0?e.jsx("div",{className:"break-all text-sm text-mid",children:r}):e.jsx(D,{})]}),I=({title:r,value:s})=>e.jsxs("div",{className:"flex flex-col gap-1 border-t border-transparent-100-16 px-6 py-4",children:[e.jsx("div",{className:"text-xs text-low",children:r}),s instanceof Array?s.map((a,d)=>e.jsx(ne,{value:a},d)):e.jsx(ne,{value:s})]}),as=({gateway:r})=>{var x;const[s,a]=l.useState(),d=r?`${r.settings.protocol}://${r.settings.fqdn}:${r.settings.port}`:void 0,i=rs({url:d});return l.useEffect(()=>{var m;if((m=r==null?void 0:r.services)!=null&&m.bundlers){const c=r.services.bundlers.map(n=>`${n.protocol}://${n.fqdn}${n.port===443?"":`:${n.port}`}${n.path}`);a(c)}},[r]),e.jsxs("div",{className:"w-full rounded-xl border border-transparent-100-16 text-sm",children:[e.jsx("div",{className:"bg-containerL3 px-6 py-4",children:e.jsx("div",{className:"text-high",children:"Software"})}),e.jsx(I,{title:"Release Version",value:(x=i.data)==null?void 0:x.release}),s&&e.jsx(I,{title:"Bundlers",value:s.map(m=>e.jsx("a",{href:m,target:"_blank",rel:"noreferrer",children:m},m))})]})},os=r=>{const s=Math.floor(r/86400),a=Math.floor(r%86400/3600),d=Math.floor(r%3600/60),i=Math.floor(r%60);return`${s}d, ${a}h, ${d}m, ${i}s`},us=()=>{var Q,U,H,J,X,Z,ee;const r=ce(),s=N(o=>o.walletAddress),a=N(o=>o.arIOReadSDK),d=N(o=>o.arIOWriteableSDK),i=N(o=>o.ticker),{data:x}=Ee(),{data:m}=me(),{data:c}=Ie(s),n=de(),p=n==null?void 0:n.ownerId,{data:t}=Ke({ownerWalletAddress:p||void 0}),k=t?`${t.settings.protocol}://${t.settings.fqdn}:${t.settings.port}`:void 0,h=Qe({url:k}),[R,E]=l.useState(),[u,A]=l.useState(!1),[g,y]=l.useState({}),[v,C]=l.useState({}),[F,V]=l.useState({}),[fe,G]=l.useState(!1),[be,Y]=l.useState(!1),$=v.allowDelegatedStaking==!0,je=t!=null&&t.operatorStake?new S(t.operatorStake).toIO().valueOf()+((c==null?void 0:c.io)||0):void 0,z=(t==null?void 0:t.operatorStake)!=null&&x&&m?qe(new S(x).toIO(),Object.values(m).filter(o=>o.status=="joined").length,t):void 0,ge=[["Stake",(Q=t==null?void 0:t.weights)==null?void 0:Q.stakeWeight],["Tenure",(U=t==null?void 0:t.weights)==null?void 0:U.tenureWeight],["Gateway Performance Ratio",(H=t==null?void 0:t.weights)==null?void 0:H.gatewayRewardRatioWeight],["Observer Performance Ratio",(J=t==null?void 0:t.weights)==null?void 0:J.observerRewardRatioWeight],["Composite",(X=t==null?void 0:t.weights)==null?void 0:X.compositeWeight],["Normalized",(Z=t==null?void 0:t.weights)==null?void 0:Z.normalizedCompositeWeight]];l.useEffect(()=>{y(o=>({...o,observerAddress:(s==null?void 0:s.toString())??""})),C(o=>({...o,observerAddress:(s==null?void 0:s.toString())??""}))},[s]),l.useEffect(()=>{if(!a||!t)return;(async()=>{const j=await a.getGatewayDelegates({address:t.gatewayAddress,limit:1});E(j.totalItems)})()},[t,a]),l.useEffect(()=>{if(v.allowDelegatedStaking==!1){const o={};if(v.delegateRewardShareRatio!==g.delegateRewardShareRatio&&(o.delegateRewardShareRatio=g.delegateRewardShareRatio),v.minDelegatedStake!==g.minDelegatedStake&&(o.minDelegatedStake=g.minDelegatedStake),Object.keys(o).length>0){const j={...F};Object.keys(o).forEach(w=>{delete j[w]}),V(j),C(w=>({...w,...o}))}}},[g,v,F]);const W=[{formPropertyName:"label",label:"Label:",rowType:b.TOP,validateProperty:ae("Label",1,64)},{formPropertyName:"fqdn",label:"Address:",rowType:b.BOTTOM,leftComponent:e.jsx("div",{className:"pl-6 text-xs text-low",children:"https://"}),rightComponent:e.jsx("div",{className:"pr-6 text-xs text-low",children:":443"}),validateProperty:$e("Address")},{formPropertyName:"ownerId",label:"Owner Wallet:",rowType:b.SINGLE,readOnly:!0},{formPropertyName:"observerAddress",label:"Observer Wallet:",rowType:b.TOP,validateProperty:Pe("Observer Wallet")},{formPropertyName:"properties",label:"Properties ID:",rowType:b.MIDDLE,validateProperty:Fe("Properties ID")},{formPropertyName:"stake",label:`Gateway Stake (${i}):`,rowType:b.BOTTOM,placeholder:`Minimum 50000 ${i}`,validateProperty:oe("Stake",i,5e4,je)},{formPropertyName:"status",label:"Status:",rowType:b.SINGLE,readOnly:!0},{formPropertyName:"note",label:"Note:",rowType:b.SINGLE,validateProperty:ae("Note",1,256)},{formPropertyName:"delegatedStake",label:`Total Delegated Stake (${i}):`,rowType:b.SINGLE,readOnly:!0},{formPropertyName:"autoStake",label:"Reward Auto Stake:",rowType:b.SINGLE},{formPropertyName:"allowDelegatedStaking",label:"Delegated Staking:",rowType:b.SINGLE},{formPropertyName:"delegateRewardShareRatio",label:"Reward Share Ratio:",rowType:b.TOP,enabled:$,placeholder:$?"Enter value 0-100":"Enable Delegated Staking to set this value.",validateProperty:Ge("Reward Share Ratio",0,100)},{formPropertyName:"minDelegatedStake",label:`Minimum Delegated Stake (${i}):`,rowType:b.LAST,enabled:$,placeholder:$?`Minimum 500 ${i}`:"Enable Delegated Staking to set this value.",validateProperty:oe("Minumum Delegated Stake",i,500)}],Se=()=>{if(!t)return;const o={label:t.settings.label||"",fqdn:t.settings.fqdn||"",ownerId:p||"",observerAddress:t.observerAddress||"",properties:t.settings.properties||"",stake:new S(t.operatorStake||0).toIO().valueOf()+"",status:t.status||"",note:t.settings.note||"",delegatedStake:new S(t.totalDelegatedStake||0).toIO().valueOf()+"",autoStake:t.settings.autoStake||!1,allowDelegatedStaking:(t==null?void 0:t.settings.allowDelegatedStaking)||!1,delegateRewardShareRatio:(t.settings.delegateRewardShareRatio||0)+"",minDelegatedStake:new S(t.settings.minDelegatedStake||0).toIO().valueOf()+""};y(o),C(o),A(!0)},q=ye({initialState:g,formState:v}),Ne=async()=>{if(s&&d&&re({formRowDefs:W,formValues:v})){const o=Object.keys(v).reduce((f,O)=>v[O]!==g[O]?{...f,[O]:v[O]}:f,{}),j=o.stake?parseFloat(o.stake):void 0,w={allowDelegatedStaking:o.allowDelegatedStaking,delegateRewardShareRatio:v.allowDelegatedStaking&&o.delegateRewardShareRatio?parseFloat(o.delegateRewardShareRatio):void 0,fqdn:o.fqdn,label:o.label,minDelegatedStake:v.allowDelegatedStaking&&o.minDelegatedStake?new B(parseFloat(o.minDelegatedStake)).toMIO().valueOf():void 0,note:o.note,properties:o.properties,autoStake:o.autoStake,observerAddress:o.observerAddress};G(!0);try{if(Object.values(w).some(f=>f!==void 0)){const{id:f}=await d.updateGatewaySettings(w,P);_.info(`Update Gateway Settings txID: ${f}`)}if(j!==void 0&&t){const f=j-new S(t.operatorStake||0).toIO().valueOf();if(f>0){const{id:O}=await d.increaseOperatorStake({increaseQty:new B(f).toMIO()},P);_.info(`Increase Operator Stake txID: ${O}`)}else if(f<0){const{id:O}=await d.decreaseOperatorStake({decreaseQty:new B(Math.abs(f)).toMIO()},P);_.info(`Decrease Operator Stake txID: ${O}`)}}r.invalidateQueries({queryKey:["gateway",s.toString()],refetchType:"all"}),r.invalidateQueries({queryKey:["gateways"],refetchType:"all"}),Y(!0)}catch(f){xe(`${f}`)}finally{G(!1)}}};return e.jsxs("div",{className:"flex h-screen flex-col overflow-y-auto pr-6 scrollbar",children:[e.jsx("div",{className:"min-w-[68rem]",children:e.jsx(Ue,{gateway:t})}),e.jsxs("div",{className:"my-6 flex gap-6",children:[e.jsxs("div",{className:"flex min-w-72 flex-col gap-6",children:[e.jsxs("div",{className:"size-fit w-full rounded-xl border border-transparent-100-16 text-sm",children:[e.jsx("div",{className:"bg-containerL3 px-6 py-4",children:e.jsx("div",{className:"text-high",children:"Stats"})}),e.jsx(I,{title:"Join Date",value:t!=null&&t.startTimestamp?te(new Date(t==null?void 0:t.startTimestamp)):void 0}),(t==null?void 0:t.status)==="joined"?e.jsxs(e.Fragment,{children:[e.jsx(I,{title:"Uptime",value:h.isError?"N/A":h.isLoading?void 0:os((ee=h.data)==null?void 0:ee.uptime)}),e.jsx(I,{title:"Delegates",value:R}),e.jsx(I,{title:e.jsxs("div",{className:"flex gap-2",children:["Operator EAY"," ",e.jsx(Te,{message:e.jsxs("div",{children:[e.jsx("p",{children:Ae}),e.jsx(Be,{className:"mt-4",children:Me})]}),children:e.jsx(_e,{className:"size-4"})})]}),value:z!=null?`${(z.EAY*100).toFixed(2)}%`:void 0})]}):t&&e.jsx(I,{title:"Leave Date",value:t!=null&&t.endTimestamp?te(new Date(t==null?void 0:t.endTimestamp)):void 0})]}),(t==null?void 0:t.weights)&&(t==null?void 0:t.status)==="joined"&&e.jsxs("div",{className:"w-full rounded-xl border border-transparent-100-16 text-sm",children:[e.jsx("div",{className:"bg-containerL3 px-6 py-4",children:e.jsx("div",{className:"text-high",children:"Weights"})}),ge.map(([o,j],w)=>e.jsxs("div",{className:"flex items-center gap-4 border-t border-transparent-100-16 px-6 py-4",children:[e.jsxs("div",{className:"grow text-nowrap text-xs text-low",children:[o,":"]}),e.jsx("div",{className:"text-right text-sm",children:j!==void 0?j.toFixed(3):e.jsx(D,{})})]},`weights${w}`))]}),(t==null?void 0:t.status)==="joined"&&e.jsx(as,{gateway:t})]}),e.jsxs("div",{className:"flex w-full grow flex-col gap-6",children:[e.jsxs("div",{className:"h-fit w-full overflow-hidden rounded-xl border border-transparent-100-16",children:[e.jsxs("div",{className:"flex items-center bg-containerL3 py-4 pl-6 pr-3",children:[e.jsx("div",{className:"text-sm text-high",children:"General Information"}),e.jsx("div",{className:"flex grow gap-6"}),p===(s==null?void 0:s.toString())&&(u?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"flex",children:e.jsx(T,{className:"h-[1.875rem]",title:"Cancel",text:"Cancel",buttonType:L.SECONDARY,onClick:()=>A(!1)})}),re({formRowDefs:W,formValues:v})?q>0?e.jsx(T,{className:"last:text-gradient h-[1.875rem]",title:`Save ${q} changes`,text:`Save ${q} changes`,buttonType:L.SECONDARY,onClick:Ne}):e.jsx(e.Fragment,{}):e.jsx("div",{className:"pl-6 text-sm text-red-600",children:"Invalid Entry"})]}):(t==null?void 0:t.status)=="joined"&&e.jsx(T,{className:"h-[1.875rem]",title:"Edit",text:"Edit",icon:e.jsx(ze,{className:"size-3"}),active:!0,onClick:Se}))]}),u?e.jsx("div",{className:" grid grid-cols-[14.375rem_auto] overflow-hidden border-t border-grey-500",children:W.map((o,j)=>e.jsx(Ce,{initialState:g,formState:v,setFormState:C,errorMessages:F,setErrorMessages:V,...o},j))}):e.jsx(Xe,{ownerId:p,gateway:t})]}),e.jsx(ts,{gateway:t})]})]}),fe&&e.jsx(pe,{onClose:()=>G(!1),message:"Sign the following data with your wallet to proceed."}),be&&e.jsx(he,{onClose:()=>{Y(!1),A(!1)},title:"Congratulations",bodyText:"You have successfully updated your gateway."})]})};export{us as default};
//# sourceMappingURL=index-DRfJ4GAe.js.map