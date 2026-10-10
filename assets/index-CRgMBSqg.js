const __vite__fileDeps=["./index-BbyFAoPX.js","./vendor-DdpqEkN0.js","./vendor-DkZgsrSQ.css","./ProtocolParametersCard-B04X3NVh.js","./protocolSettings-BQHAsMUc.js","./gateway-qzLcfLr_.js","./useGatewayInfo-DHsogDn8.js","./TableSkeletonRow-y4Mibc1k.js","./AddressCell-DZGY0JR7.js","./ColumnSelector-DPX6L4KM.js","./useAllGateways-BpU71hnB.js","./caret_double_right-CM15Kgb-.js","./index-CeE2IHdJ.js","./TableView-Cho5Sbfj.js","./mobileMenu-Bs2GVe48.js","./three_dots_icon-0EpXms6J.js","./StakingModal-DOER35Rn.js","./useDelegateStakes-BmmigP_V.js","./observationCapture-C8ESm24L.js","./useObservations-DssON800.js","./useReport-D-uJddrE.js","./index-Bbji_mWL.js","./index-DTexrLZ_.js","./observers_connect_icon-CK5AEr0w.js","./usePrescribedNames-TDxispE5.js","./index-BfGRncHZ.js","./useVaults-uYTjeeTy.js","./BalancesForAddress-BFNMgzgX.js","./Extensions-BI3V1u0w.js","./index-C72jB3s1.js","./index-GTKgHhlV.js","./AssessmentDetailsPanel-CqrJ86Zo.js","./index-CBndBN9K.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
var va=Object.defineProperty;var ya=(e,n,a)=>n in e?va(e,n,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[n]=a;var q=(e,n,a)=>(ya(e,typeof n!="symbol"?n+"":n,a),a);import{l as ka,D as Oe,M as Le,a as ja,P as Aa,c as Lt,b as Na,g as Ca,w as wn,f as ut,d as Sa,B as fn,e as Ea,h as xn,s as Ra,p as Ia,A as bn,i as K,j as Ta,u as M,k as Oa,m as La,n as G,r as l,_ as _t,o as t,q as me,V as _a,t as Pa,v as pt,x as Ma,y as Da,z as Fa,C as $a,E as Ua,F as Va,G as vn,H as Ba,I as Ga,J as za,K as qa,S as Wa,L as Ka,O as Ha,N as Ya,Q as $,R as Za,$ as yn,T as kn,U as jn,W as An,X as Nn,Y as Cn,Z as Qa,a0 as Sn,a1 as En,a2 as Xa,a3 as Rn,a4 as Ja,a5 as es,a6 as ts,a7 as ns,a8 as as,a9 as ss,aa as rs,ab as os,ac as Ce,ad as is,ae as In,af as ls,ag as ds,ah as ge,ai as we,aj as cs,ak as hs,al as Se,am as us,an as Tn,ao as mt,ap as _e,aq as Pe,ar as Me,as as On,at as Ln,au as ie,av as H,aw as X,ax as ps,ay as ms,az as gs,aA as ws,aB as fs,aC as xs,aD as bs,aE as vs,aF as ys,aG as U,aH as Pt,aI as ks,aJ as js}from"./vendor-DdpqEkN0.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();var Y={VITE_SOLANA_MAINNET_RPC_URL:"https://wandering-side-water.solana-mainnet.quiknode.pro/c99adf4c955d2c0af0393fc2e0aff4c207d008c1/",VITE_SOLANA_RPC_URL:"https://frosty-hidden-bush.solana-devnet.quiknode.pro/d878601b7931461e8fd02c6a798cbda800da1762/",VITE_GITHUB_HASH:"4bcb2edf019a72d7cfd390c04210ee171d30b2bc",VITE_PORTAL_API_URL:"https://network.services.ar.io",VITE_AO_CU_URL:"https://cu.ardrive.io",VITE_NODE_ENV:"develop",VITE_ARIO_PROCESS_ID:"qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",BASE_URL:"./",MODE:"production",DEV:!1,PROD:!0,SSR:!1};const As="AR-IO-Network-Portal-App",_n="2.13.2",gt={tags:[{name:"App-Name",value:As},{name:"App-Version",value:_n}]},Ns="https://docs.ar.io",Cs="ARIO",Ne="https://frosty-hidden-bush.solana-devnet.quiknode.pro/d878601b7931461e8fd02c6a798cbda800da1762/",tt="https://wandering-side-water.solana-mainnet.quiknode.pro/c99adf4c955d2c0af0393fc2e0aff4c207d008c1/",Ss=Y.VITE_SOLANA_FALLBACK_RPC_URL??"",wt="https://explorer.solana.com",Es="https://raydium.io/swap/?inputMint=sol&outputMint=DcNnMuFxwhgV4WY1HVSaSEgr92bv2b1vUvEKiNxWqHdF",Pn="https://network.services.ar.io",Ke=Y.VITE_PORTAL_MAINNET_API_URL??"https://network.services.ar.io",He=Y.VITE_PORTAL_DEVNET_API_URL??"https://network.services.ar-io.dev",ft=Y.VITE_ARIO_CORE_PROGRAM_ID??String(Oe.core),xt=Y.VITE_ARIO_GAR_PROGRAM_ID??String(Oe.gar),bt=Y.VITE_ARIO_ARNS_PROGRAM_ID??String(Oe.arns),vt=Y.VITE_ARIO_ANT_PROGRAM_ID??String(Oe.ant),Mn=String(Le.core),Dn=String(Le.gar),Fn=String(Le.arns),$n=String(Le.ant),Rs=Y.VITE_GATEWAY_PROTOCOL??"https",Is=Y.VITE_GATEWAY_HOST??"turbo-gateway.com",Un=Y.VITE_ARWEAVE_GQL_ENDPOINT??"https://arweave-search.goldsky.com/graphql",Ts={LIGHT:"light",DARK:"dark"},Os=" ",Ls=new RegExp("^[a-zA-Z0-9\\-_s+]{43}$");ka.setLevel("info");const N=ja,Sl="EAY = Estimated yield ratio determined by projecting the current nominal reward conditions over the course of a year, weighted by the share of epochs this gateway has passed — a gateway that fails an epoch is paid nothing for it. Does NOT include potential observation rewards.",El="\\(EAY = \\frac{RewardsSharedPerEpoch}{TotalDelegatedStake} * EpochsPerYear\\)",Rl="\\(EAY = \\frac{OperatorRewardsPerEpoch}{OperatorStake} * EpochsPerYear\\)",Il=.8,_s=Y.VITE_REFERENCE_GATEWAY_FQDN??"turbo-gateway.com",Tl="Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.",ue="mFRKcHsO6Tlv2E2wZcrcbv3mmzxzD7vYPbyybI3KCVA",Vn=e=>{try{return new Aa(e),!0}catch{return!1}},J=e=>{if(!e)return;const n=e.trim();return Vn(n)?n:void 0},Mt=10,nt=1,Ps=.5,Ms=20,Ds=.9,Dt=1e3,Fs=3e4,$s=5,Ft=3e4;function Us(e){let n=Math.max(nt,e),a=Math.max(1,n),s=a,r=Date.now(),o=0;const i=[];let d=null;const c=m=>{d===null&&(d=setTimeout(()=>{d=null,u()},Math.max(m,1)))},h=()=>{const m=Date.now(),p=(m-r)/1e3;p>0&&(s=Math.min(a,s+p*n),r=m)},u=()=>{const m=Date.now();if(o>m){c(o-m);return}for(h();s>=1;){const p=i.shift();if(!p)break;s-=1,p()}i.length>0&&c(Math.ceil((1-s)/n*1e3))};return{acquire:()=>new Promise(m=>{i.push(m),u()}),setRate:m=>{n=Math.max(nt,m),a=Math.max(1,n),s=Math.min(s,a),r=Date.now(),u()},pauseFor:m=>{const p=Date.now()+Math.max(0,m);p>o&&(o=p),c(m)}}}function Vs(e){const n=e==null?void 0:e.context;return(n==null?void 0:n.statusCode)===429&&n.headers instanceof Headers?n.headers:null}function Bs(e){const n=e.get("retry-after");if(n===null||n==="")return null;const a=Number(n);if(Number.isFinite(a))return Math.max(0,a*1e3);const s=Date.parse(n);return Number.isNaN(s)?null:Math.max(0,s-Date.now())}function Gs(e){const n=Number(e.get("x-ratelimit-rps-limit"));return Number.isFinite(n)&&n>0?n:null}function zs(e,n){const a=new AbortController,s=setTimeout(()=>a.abort(new Error(`RPC request timed out after ${n}ms`)),n),r=()=>a.abort(e==null?void 0:e.reason);return e&&(e.aborted?r():e.addEventListener("abort",r,{once:!0})),{signal:a.signal,cleanup:()=>{clearTimeout(s),e==null||e.removeEventListener("abort",r)}}}function qs({primaryUrl:e,fallbackUrl:n,maxRequestsPerSecond:a=Mt}){const s=a>0?a:Mt,r=Lt({url:e}),o=n?Lt({url:n}):null,i=Us(s);let d=s,c=0,h=0,u=0;const m=j=>{c=0;const y=Gs(j),k=y!==null?y*Ds:Number.POSITIVE_INFINITY,v=Math.max(nt,Math.min(k,d*Ps));v!==d&&(d=v,i.setRate(d));const f=Bs(j);i.pauseFor(f??Dt),N.warn(`[solanaRpc] 429 — throttling to ${d.toFixed(1)} req/s, cooling down ${f??Dt}ms`)},p=()=>{h=0,!(d>=s)&&++c>=Ms&&(c=0,d=Math.min(s,d+1),i.setRate(d))},g=(j,y)=>{const k=Vs(j);k&&m(k),!(y||!o)&&++h>=$s&&(u=Date.now()+Ft,h=0,N.warn(`[solanaRpc] primary RPC unhealthy — using configured fallback for ${Ft}ms`))};return Na(async j=>{var b;await i.acquire();const y=o!==null&&Date.now()<u,k=y?o:r,{signal:v,cleanup:f}=zs(j.signal,Fs);try{const E=await k({...j,signal:v});return p(),E}catch(E){throw(b=j.signal)!=null&&b.aborted||g(E,y),E}finally{f()}})}const Ws="11111111111111111111111111111111",Ye=e=>e*1e3,at=4,Ze=e=>({totalEligibleGateways:0,totalEligibleRewards:e,totalEligibleObserverReward:0,totalEligibleGatewayReward:0}),Ks=({failureCounts:e,observationsSubmitted:n,perGatewayReward:a,rewardsDistributed:s,totalEligibleGatewayReward:r})=>{if(!e||e.length===0||!s||!n||n<=0||!(a>0))return;const o=Math.floor(n/2);let i=0;for(const d of e)d>o&&(i+=1);return Math.min(i*a,r)},Hs=({observerCount:e,observationsSubmitted:n,perObserverReward:a,rewardsDistributed:s})=>!s||typeof n!="number"||!(a>0)||!(e>0)?void 0:Math.max(0,e-n)*a,Bn=({prescribed:e,totalEligibleRewards:n,perGatewayReward:a,observerPool:s})=>{if(!e)return{distributions:Ze(n),splitKnown:!1};if(!(a>0))return{distributions:{...Ze(n),totalEligibleObserverReward:s},splitKnown:!0};if(!(s>0))return{distributions:Ze(n),splitKnown:!1};const r=Math.max(0,n-s);return{distributions:{totalEligibleGateways:Math.round(r/a),totalEligibleRewards:n,totalEligibleObserverReward:s,totalEligibleGatewayReward:r},splitKnown:!0}},Gn=(e,n)=>typeof e=="number"&&typeof n=="number"&&n!==0&&e===0,Ys=e=>{const n=Bn({prescribed:e.prescriptionsDone!==0,totalEligibleRewards:e.totalEligibleRewards,perGatewayReward:e.perGatewayReward,observerPool:e.perObserverReward*e.observerCount});return{...n,skipped:Gn(e.observationsSubmitted,e.rewardsDistributed),forfeitedGatewayReward:Ks({failureCounts:e.failureCounts,observationsSubmitted:e.observationsSubmitted,perGatewayReward:e.perGatewayReward,rewardsDistributed:e.rewardsDistributed,totalEligibleGatewayReward:n.distributions.totalEligibleGatewayReward}),forfeitedObserverReward:Hs({observerCount:e.observerCount,observationsSubmitted:e.observationsSubmitted,perObserverReward:e.perObserverReward,rewardsDistributed:e.rewardsDistributed})}},Zs=e=>{if(e.rewardTotalsVersion===at)return e;const n=e.distributions,a=e.perGatewayReward??(n.totalEligibleGateways>0?n.totalEligibleGatewayReward/n.totalEligibleGateways:0),s=Bn({prescribed:!0,totalEligibleRewards:n.totalEligibleRewards,perGatewayReward:a,observerPool:n.totalEligibleObserverReward}),r=Gn(e.observationsSubmitted,e.rewardsDistributed);return{...e,perGatewayReward:a,rewardsPrescribed:!0,rewardsSplitKnown:s.splitKnown,rewardsSkipped:r,rewardTotalsVersion:at,distributions:{...n,...s.distributions}}};async function Ee(e,n,a,s="confirmed"){const[r]=await Ca(a,n),o=await wn(()=>ut(e,r,{commitment:s}));if(!o.exists)throw new Error(`Epoch ${a} not found`);const i=Sa(fn.from(o.data)),d=Ys(i),c=[];for(let h=0;h<i.observerCount;h++){const u=i.prescribedObservers[h],m=i.prescribedObserverGateways[h];u!==Ws&&c.push({gatewayAddress:m,observerAddress:u,stake:0,startTimestamp:0,stakeWeight:0,tenureWeight:0,gatewayRewardRatioWeight:0,observerRewardRatioWeight:0,gatewayPerformanceRatio:0,observerPerformanceRatio:0,compositeWeight:0,normalizedCompositeWeight:0})}return{epochIndex:a,observationsSubmitted:i.observationsSubmitted,rewardsDistributed:i.rewardsDistributed,perGatewayReward:i.perGatewayReward,rewardsPrescribed:i.prescriptionsDone!==0,rewardsSplitKnown:d.splitKnown,rewardsSkipped:d.skipped,forfeitedGatewayReward:d.forfeitedGatewayReward,forfeitedObserverReward:d.forfeitedObserverReward,rewardTotalsVersion:at,startHeight:0,startTimestamp:Ye(i.startTimestamp),endTimestamp:Ye(i.endTimestamp),distributionTimestamp:Ye(i.endTimestamp),observations:{reports:{},failureSummaries:{}},prescribedObservers:c,prescribedNames:[],distributions:d.distributions,arnsStats:{totalReturnedNames:0,totalActiveNames:0,totalGracePeriodNames:0,totalReservedNames:0}}}const ce=e=>{if(e instanceof Error)return e.message;if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}},zn="current",Qs=e=>{const n=ce(e).toLowerCase();return["not found","not available","does not exist","missing","accountnotfound","404"].some(a=>n.includes(a))},qn=(e="solana-mainnet")=>{const n=new Ea(e);return n.version(1).stores({observations:"++id, timestamp, gatewayAddress"}),n.version(2).stores({observations:"++id, timestamp, gatewayAddress",epochs:"epochIndex"}),n.version(3).stores({observations:"++id, timestamp, gatewayAddress",epochs:"epochIndex"}).upgrade(a=>a.table("epochs").clear()),n.version(4).stores({observations:"++id, timestamp, gatewayAddress",epochs:"epochIndex",networkStats:"id"}),n.open().catch(function(a){console.error("Failed to open db: ",a)}),n},Xs=async(e,n,a,s)=>{const r=await e.epochs.where("epochIndex").equals(s).first();if(r){const i=Zs(r);if(i!==r)try{await e.epochs.put(i)}catch(d){N.warn(`[getEpoch] could not rewrite epoch ${s}`,d)}return i}let o;try{o=await Ee(n,a,s)}catch(i){if(Qs(i)){N.info(`[getEpoch] Epoch ${s} is not available on this backend yet.`);return}throw N.error(`[getEpoch] Failed to retrieve epoch ${s}: ${ce(i)}`,i),i}if(o&&o.epochIndex!==s&&N.warn(`[getEpoch] Epoch index mismatch: requested ${s}, received ${o.epochIndex}.`),o&&o.rewardsDistributed)try{await e.epochs.add(o)}catch(i){N.error(`Error with epoch data saving for epoch ${s}:`,i);return}return o||N.info(`[getEpoch] Empty epoch payload returned for epoch ${s}.`),o},Js=async(e,n)=>{await e.epochs.where("epochIndex").below(n-13).delete()},er=async(e,n,a,s)=>{try{const r=await e.networkStats.get(zn);if(!r||r.programFingerprint!==a)return;if(s){if(r.fetchedAt<s.notBefore)return;const i=new Set(r.liveDocuments??[]);if(!s.liveDocuments.every(d=>i.has(d)))return}const o=Date.now()-r.fetchedAt;return o<0||o>n?void 0:{totalAddresses:r.totalAddresses,uniqueDelegates:r.uniqueDelegates,totalVaults:r.totalVaults}}catch(r){N.warn("[db] could not read cached network stats",r);return}},tr=async(e,n,a,s=[])=>{try{await e.networkStats.put({...n,id:zn,fetchedAt:Date.now(),programFingerprint:a,liveDocuments:s})}catch(r){N.warn("[db] could not cache network stats",r)}},yt=["solanaCoreProgramId","solanaGarProgramId","solanaArnsProgramId","solanaAntProgramId","bridgeBalanceAddress"],kt=e=>{const n=a=>{const s=a.toLowerCase();return s.includes("localhost")||s.includes("127.0.0.1")?"localnet":s.includes("devnet")?"devnet":s.includes("testnet")?"testnet":"mainnet"};try{const a=new URL(e);return n(`${a.hostname}${a.pathname}`)}catch{return n(e)}},jt=e=>e==="mainnet"?{solanaCoreProgramId:Mn,solanaGarProgramId:Dn,solanaArnsProgramId:Fn,solanaAntProgramId:$n,bridgeBalanceAddress:ue}:{solanaCoreProgramId:ft??"",solanaGarProgramId:xt??"",solanaArnsProgramId:bt??"",solanaAntProgramId:vt??"",bridgeBalanceAddress:ue},Wn=e=>{const n=e.trim();try{const a=new URL(n);return`${a.protocol}//${a.host}${a.pathname}`.toLowerCase()}catch{return n.toLowerCase()}},Kn=(e,n,a,s=!1)=>{var i;const r=jt(kt(a)),o=((i=e.solanaAddressSettingsByNetwork)==null?void 0:i[n])??{};return yt.reduce((d,c)=>({...d,[c]:o[c]??(s&&Object.hasOwn(e,c)?e[c]:void 0)??r[c]}),r)},nr=e=>yt.reduce((n,a)=>Object.hasOwn(e,a)?{...n,[a]:e[a]}:n,{}),ar={solanaRpcUrl:tt,portalApiUrl:Pn,arweaveGqlUrl:Un,sidebarOpen:!0,solanaAddressSettingsByNetwork:{},...jt(kt(tt))},$t=e=>{if(!e)return!1;try{const n=new URL(e);return/^(localhost|127\.0\.0\.1)$/.test(n.hostname)}catch{return/(^|[:/?.#])(localhost|127\.0\.0\.1)(?=[:/?.#]|$)/.test(e)}},Hn=2,sr=(e,n)=>{const a=e??{};if(n>=Hn)return a;const s={...a};delete s.solanaRpcUrl,delete s.portalApiUrl,delete s.solanaAddressSettingsByNetwork;for(const r of yt)delete s[r];return s},I=xn()(Ra(Ia(()=>ar,{name:"settings",version:Hn,migrate:sr,merge:(e,n)=>{const a=e??{},s={...n,...a,solanaAddressSettingsByNetwork:{...n.solanaAddressSettingsByNetwork,...a.solanaAddressSettingsByNetwork}},r=s.solanaRpcUrl,o=$t(r)!==$t(Ne);o&&(s.solanaRpcUrl=Ne);const i=Wn(s.solanaRpcUrl),d=o?jt(kt(Ne)):Kn(a,i,s.solanaRpcUrl,!0);return{...s,solanaAddressSettingsByNetwork:{...s.solanaAddressSettingsByNetwork,[i]:d},...d}}}))),le=e=>{const n=nr(e),a=Object.keys(n).length>0;I.setState(s=>{const r=e.solanaRpcUrl??s.solanaRpcUrl,o=Wn(r),i=a?{...s.solanaAddressSettingsByNetwork[o],...n}:s.solanaAddressSettingsByNetwork[o];return{...e.solanaRpcUrl?Kn(s,o,r):{},...e,solanaAddressSettingsByNetwork:{...s.solanaAddressSettingsByNetwork,...i?{[o]:i}:{}}}})};let Qe=null,Ut=null;function rr(e){return(!Qe||Ut!==e)&&(Qe=qs({primaryUrl:e,fallbackUrl:Ss||void 0}),Ut=e),Qe}const Yn=e=>rr(e),or=e=>{const n=a=>{const s=a.toLowerCase();return s.includes("localhost")||s.includes("127.0.0.1")?"localnet":s.includes("devnet")?"devnet":s.includes("testnet")?"testnet":"mainnet"};try{const a=new URL(e);return n(`${a.hostname}${a.pathname}`)}catch{return n(e)}},Zn=e=>`solana-${or(e)}`,Qn=e=>{const n=I.getState(),a=J(n.solanaCoreProgramId),s=J(n.solanaGarProgramId),r=J(n.solanaArnsProgramId);return bn.init({rpc:e,...a?{coreProgramId:K(a)}:{},...s?{garProgramId:K(s)}:{},...r?{arnsProgramId:K(r)}:{}})},st=I.getState().solanaRpcUrl,Vt=Yn(st),ir={theme:Ts.DARK,rpc:Vt,solanaRpcUrl:st,arIOReadSDK:Qn(Vt),walletStateInitialized:!1,ticker:"",networkPortalDB:qn(Zn(st)),isMobile:window.innerWidth<1024};class lr{constructor(n,a){q(this,"setTheme",n=>{this.set({theme:n})});q(this,"setSolanaSlot",n=>{this.set({solanaSlot:n})});q(this,"setEpochLoadFailed",n=>{this.set({epochLoadFailed:n})});q(this,"setReferencePerGatewayReward",n=>{this.set({referencePerGatewayReward:n})});q(this,"setCurrentEpoch",n=>{this.set({currentEpoch:n})});q(this,"updateWallet",n=>{this.set({walletAddress:n})});q(this,"setWalletStateInitialized",n=>{this.set({walletStateInitialized:n})});q(this,"setTicker",n=>{this.set({ticker:n})});q(this,"setIsMobile",n=>{this.set({isMobile:n})});q(this,"setWriteSDK",n=>{this.set({arIOWriteableSDK:n})});this.set=n,I.subscribe(s=>({solanaRpcUrl:s.solanaRpcUrl,solanaCoreProgramId:s.solanaCoreProgramId,solanaGarProgramId:s.solanaGarProgramId,solanaArnsProgramId:s.solanaArnsProgramId}),({solanaRpcUrl:s})=>{const r=Yn(s),o=Qn(r),i=a().networkPortalDB,d=Zn(s),c=i.name===d?i:qn(d);c!==i&&i.close(),n({rpc:r,solanaRpcUrl:s,arIOReadSDK:o,arIOWriteableSDK:void 0,networkPortalDB:c})},{equalityFn:Ta})}}const x=xn()((e,n)=>({...ir,...new lr(e,n)})),Xn=(e,n)=>["epochSettings",e,n],Jn=async(e,n,a="confirmed")=>{const[s]=await Oa(n),r=await wn(()=>ut(e,s,{commitment:a}));if(!r.exists)throw new Error("Epoch settings account not found");return La(fn.from(r.data))},dr=e=>{const n=e.genesisTimestamp*1e3;return{epochZeroStartTimestamp:n,durationMs:e.epochDuration*1e3,prescribedNameCount:e.prescribedNameCount,maxObservers:e.prescribedObserverCount,hasEpochZeroStarted:G().isAfter(new Date(n)),maxConsecutiveFailures:e.maxConsecutiveFailures}},De=()=>{const e=x(i=>i.arIOReadSDK),n=x(i=>i.rpc),a=x(i=>i.solanaRpcUrl),s=e==null?void 0:e.garProgram,r=(e==null?void 0:e.commitment)??"confirmed";return M({queryKey:Xn(a,s),queryFn:()=>Jn(n,s,r),select:dr,enabled:!!n&&!!s,staleTime:1/0})};let ne=null;async function cr(){if(ne!==null)return ne;try{const e=await fetch("/ar-io/info",{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(3e3)});if(e.ok){const n=await e.json();ne=typeof(n==null?void 0:n.wallet)=="string"}else ne=!1}catch{ne=!1}return ne}function Ol(){return _s}function hr(e){return ne?`/${e}`:`${Rs}://${Is}/${e}`}const ur=e=>l.createElement("svg",{width:1296,height:381,viewBox:"0 0 1296 381",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("path",{d:"M1035.01 60.5C924.55 60.5 835.01 150.04 835.01 260.5V320.5H895.01V280.5C895.01 263.93 908.44 250.5 925.01 250.5C933.29 250.5 940.79 253.86 946.22 259.29C951.65 264.72 955.01 272.22 955.01 280.5V320.5H1015.01V300.5C1015.01 256.32 1050.83 220.5 1095.01 220.5C1139.19 220.5 1175.01 256.32 1175.01 300.5V320.5H1235.01V260.5C1235.01 150.04 1145.47 60.5 1035.01 60.5ZM925.01 220.5C908.44 220.5 895.01 207.07 895.01 190.5C895.01 173.93 908.44 160.5 925.01 160.5C941.58 160.5 955.01 173.93 955.01 190.5C955.01 207.07 941.58 220.5 925.01 220.5Z",fill:"#EEEEEE"}),l.createElement("path",{d:"M1035.01 60.5C924.55 60.5 835.01 150.04 835.01 260.5V320.5H895.01V280.5C895.01 263.93 908.44 250.5 925.01 250.5C933.29 250.5 940.79 253.86 946.22 259.29C951.65 264.72 955.01 272.22 955.01 280.5V320.5H1015.01V300.5C1015.01 256.32 1050.83 220.5 1095.01 220.5C1139.19 220.5 1175.01 256.32 1175.01 300.5V320.5H1235.01V260.5C1235.01 150.04 1145.47 60.5 1035.01 60.5ZM925.01 220.5C908.44 220.5 895.01 207.07 895.01 190.5C895.01 173.93 908.44 160.5 925.01 160.5C941.58 160.5 955.01 173.93 955.01 190.5C955.01 207.07 941.58 220.5 925.01 220.5Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M237.05 95.77C217.12 85.59 194.33 80.5 168.67 80.5C129.24 80.5 101.43 90.82 85.2298 111.47C75.0498 124.66 69.3198 141.5 68.0298 162.01H127.17C128.6 152.98 131.47 145.81 135.77 140.51C141.79 133.34 152.04 129.76 166.52 129.76C179.42 129.76 189.21 131.59 195.88 135.25C202.54 138.9 205.88 145.54 205.88 155.14C205.88 163.03 201.5 168.83 192.76 172.56C187.89 174.71 179.78 176.51 168.46 177.94L147.6 180.52C123.94 183.53 106.02 188.55 93.8398 195.57C71.6198 208.47 60.5098 229.33 60.5098 258.15C60.5098 280.37 67.4298 297.54 81.2598 309.65C95.0898 321.76 112.62 327.82 133.84 327.82C150.47 327.82 165.38 324.02 178.57 316.42C189.61 309.97 199.35 302.16 207.82 292.98V320.51H266.96V153.42C266.96 125.18 256.99 105.97 237.07 95.79L237.05 95.77ZM205.66 229.32C205.23 249.82 199.46 263.94 188.35 271.68C177.24 279.42 165.09 283.29 151.9 283.29C143.58 283.29 136.56 280.92 130.83 276.19C124.95 271.6 122.01 264.08 122.01 253.61C122.01 241.86 126.74 233.18 136.2 227.59C141.79 224.29 151.04 221.5 163.94 219.2L177.7 216.62C184.58 215.33 189.99 213.93 193.93 212.43C197.87 210.93 201.78 208.96 205.65 206.52V229.31L205.66 229.32Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M405.44 142.65C380.78 142.65 364.22 150.68 355.76 166.74C351.03 175.77 348.66 189.68 348.66 208.46V320.5H286.94V86.09H345.43V126.95C354.89 111.33 363.14 100.64 370.16 94.91C381.63 85.31 396.54 80.5 414.89 80.5C416.04 80.5 417 80.54 417.79 80.61C418.58 80.68 420.33 80.79 423.06 80.93V143.72C419.19 143.29 415.75 143 412.74 142.86C409.73 142.72 407.29 142.64 405.43 142.64L405.44 142.65Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M535.02 159.49H472.87V320.5H535.02V159.49Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M504.49 80.5H503.41C485.714 80.5 471.37 94.8448 471.37 112.54C471.37 130.235 485.714 144.58 503.41 144.58H504.49C522.185 144.58 536.53 130.235 536.53 112.54C536.53 94.8448 522.185 80.5 504.49 80.5Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M764.83 117.42C784.61 142.03 794.51 171.12 794.51 204.69C794.51 238.26 784.62 268.03 764.83 292.28C745.05 316.54 715.01 328.66 674.73 328.66C634.45 328.66 604.41 316.53 584.63 292.28C564.85 268.03 554.95 238.83 554.95 204.69C554.95 170.55 564.84 142.03 584.63 117.42C604.41 92.81 634.45 80.5 674.73 80.5C715.01 80.5 745.05 92.81 764.83 117.42ZM674.51 131.93C656.59 131.93 642.79 138.22 633.11 150.82C623.44 163.41 618.6 181.37 618.6 204.7C618.6 228.03 623.44 246.03 633.11 258.69C642.79 271.35 656.58 277.68 674.51 277.68C692.44 277.68 706.19 271.35 715.8 258.69C725.4 246.03 730.21 228.04 730.21 204.7C730.21 181.36 725.4 163.41 715.8 150.82C706.19 138.23 692.43 131.93 674.51 131.93Z",fill:"#F0F0F0"}),l.createElement("path",{d:"M423.07 320.51C439.638 320.51 453.07 307.079 453.07 290.51C453.07 273.941 439.638 260.51 423.07 260.51C406.501 260.51 393.07 273.941 393.07 290.51C393.07 307.079 406.501 320.51 423.07 320.51Z",fill:"#F0F0F0"})),ea=e=>l.createElement("svg",{width:1102,height:1080,viewBox:"0 0 1102 1080",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("path",{d:"M551 270C317.183 270 127.648 455.658 127.648 684.692V809.1H254.654V726.161C254.654 691.804 283.082 663.958 318.157 663.958C335.683 663.958 351.559 670.925 363.053 682.183C374.547 693.442 381.659 708.993 381.659 726.161V809.1H508.665V767.631C508.665 676.025 584.487 601.754 678.005 601.754C771.524 601.754 847.346 676.025 847.346 767.631V809.1H974.352V684.692C974.352 455.658 784.817 270 551 270ZM318.157 601.754C283.082 601.754 254.654 573.907 254.654 539.55C254.654 505.193 283.082 477.346 318.157 477.346C353.231 477.346 381.659 505.193 381.659 539.55C381.659 573.907 353.231 601.754 318.157 601.754Z",fill:"#F0F0F0"})),pr=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Binoculars"},l.createElement("path",{id:"Vector",d:"M14.825 9.49212C14.7833 9.3756 14.7342 9.26184 14.6781 9.15149L12.0787 3.23774C12.0542 3.18079 12.0189 3.12903 11.975 3.08524C11.7893 2.89948 11.5688 2.75212 11.3261 2.65158C11.0834 2.55104 10.8233 2.4993 10.5606 2.4993C10.2979 2.4993 10.0378 2.55104 9.79515 2.65158C9.55247 2.75212 9.33197 2.89948 9.14625 3.08524C9.05281 3.17879 9.00023 3.30553 9 3.43774V5.00024H7V3.43774C7.00005 3.37206 6.98716 3.30702 6.96207 3.24632C6.93697 3.18562 6.90017 3.13046 6.85375 3.08399C6.66803 2.89823 6.44753 2.75087 6.20485 2.65033C5.96217 2.54979 5.70206 2.49805 5.43938 2.49805C5.17669 2.49805 4.91658 2.54979 4.6739 2.65033C4.43122 2.75087 4.21072 2.89823 4.025 3.08399C3.98105 3.12778 3.94584 3.17954 3.92125 3.23649L1.32188 9.15024C1.2658 9.26059 1.21675 9.37435 1.175 9.49087C1.02781 9.90271 0.97245 10.3417 1.01279 10.7772C1.05313 11.2127 1.1882 11.6341 1.40853 12.0119C1.62886 12.3897 1.92913 12.7147 2.2883 12.9643C2.64747 13.2138 3.05686 13.3818 3.48778 13.4565C3.91871 13.5311 4.36075 13.5107 4.78294 13.3965C5.20513 13.2824 5.59726 13.0773 5.93186 12.7957C6.26646 12.5141 6.53543 12.1627 6.71994 11.7662C6.90446 11.3697 7.00004 10.9376 7 10.5002V6.00024H9V10.5002C8.99978 10.9376 9.09521 11.3698 9.2796 11.7664C9.46398 12.1631 9.73288 12.5146 10.0674 12.7964C10.402 13.0781 10.7941 13.2833 11.2163 13.3976C11.6385 13.5119 12.0806 13.5324 12.5116 13.4578C12.9426 13.3832 13.3521 13.2153 13.7113 12.9658C14.0706 12.7163 14.3709 12.3912 14.5913 12.0134C14.8117 11.6356 14.9468 11.2142 14.9872 10.7786C15.0276 10.3431 14.9722 9.904 14.825 9.49212ZM4.79438 3.73462C4.96108 3.59426 5.16906 3.51219 5.38669 3.50091C5.60432 3.48963 5.81968 3.54975 6 3.67212V8.26649C5.60963 7.91596 5.13399 7.67418 4.62074 7.56536C4.10749 7.45655 3.57466 7.48453 3.07563 7.64649L4.79438 3.73462ZM4 12.5002C3.60444 12.5002 3.21776 12.3829 2.88886 12.1632C2.55996 11.9434 2.30362 11.6311 2.15224 11.2656C2.00087 10.9002 1.96126 10.498 2.03843 10.1101C2.1156 9.7221 2.30608 9.36574 2.58579 9.08603C2.86549 8.80633 3.22186 8.61584 3.60982 8.53867C3.99778 8.4615 4.39991 8.50111 4.76537 8.65249C5.13082 8.80386 5.44318 9.06021 5.66294 9.3891C5.8827 9.718 6 10.1047 6 10.5002C6 11.0307 5.78929 11.5394 5.41421 11.9145C5.03914 12.2895 4.53043 12.5002 4 12.5002ZM10 3.67149C10.1803 3.54912 10.3957 3.48901 10.6133 3.50029C10.8309 3.51157 11.0389 3.59363 11.2056 3.73399L12.9244 7.64524C12.4253 7.48336 11.8924 7.45548 11.3792 7.56441C10.8659 7.67333 10.3903 7.91523 10 8.26587V3.67149ZM12 12.5002C11.6044 12.5002 11.2178 12.3829 10.8889 12.1632C10.56 11.9434 10.3036 11.6311 10.1522 11.2656C10.0009 10.9002 9.96126 10.498 10.0384 10.1101C10.1156 9.7221 10.3061 9.36574 10.5858 9.08603C10.8655 8.80633 11.2219 8.61584 11.6098 8.53867C11.9978 8.4615 12.3999 8.50111 12.7654 8.65249C13.1308 8.80386 13.4432 9.06021 13.6629 9.3891C13.8827 9.718 14 10.1047 14 10.5002C14 11.0307 13.7893 11.5394 13.4142 11.9145C13.0391 12.2895 12.5304 12.5002 12 12.5002Z",fill:"#7F7F87"}))),mr=e=>l.createElement("svg",{width:15,height:16,viewBox:"0 0 15 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M1.875 8C1.875 9.11252 2.2049 10.2001 2.82298 11.1251C3.44107 12.0501 4.31957 12.7711 5.34741 13.1968C6.37524 13.6226 7.50624 13.734 8.59738 13.5169C9.68853 13.2999 10.6908 12.7641 11.4775 11.9775C12.2641 11.1908 12.7999 10.1885 13.0169 9.09738C13.234 8.00624 13.1226 6.87524 12.6968 5.84741C12.2711 4.81957 11.5501 3.94107 10.6251 3.32298C9.70006 2.7049 8.61252 2.375 7.5 2.375C5.92747 2.38092 4.41811 2.99451 3.2875 4.0875L1.875 5.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M1.875 2.375V5.5H5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M7.5 4.875V8L10 9.25",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),gr=e=>l.createElement("svg",{width:20,height:20,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M14.5 4L4.5 14",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M4.5 4L14.5 14",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),wr=e=>l.createElement("svg",{width:20,height:20,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M12.5 2.5V17.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M8.33594 12.5L5.83594 10L8.33594 7.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),ta=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M11.332 9.33301H11.3387",stroke:"url(#paint0_linear_1833_11425)",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M4.66667 4.66667H12.6667C13.0203 4.66667 13.3594 4.80714 13.6095 5.05719C13.8595 5.30724 14 5.64638 14 6V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667",stroke:"url(#paint1_linear_1833_11425)",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("linearGradient",{id:"paint0_linear_1833_11425",x1:11.332,y1:10.333,x2:11.339,y2:10.333,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})),l.createElement("linearGradient",{id:"paint1_linear_1833_11425",x1:2,y1:14,x2:14.4807,y2:13.4772,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})))),fr=e=>l.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("path",{d:"M3 4C3 3.45228 3.45228 3 4 3H14C14.5477 3 15 3.45228 15 4C15 4.55228 15.4477 5 16 5C16.5523 5 17 4.55228 17 4C17 2.34772 15.6523 1 14 1H4C2.34772 1 1 2.34772 1 4V14C1 15.6523 2.34772 17 4 17C4.55228 17 5 16.5523 5 16C5 15.4477 4.55228 15 4 15C3.45228 15 3 14.5477 3 14V4Z",fill:"#7F7F87"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 7C8.34315 7 7 8.34315 7 10V20C7 21.6569 8.34315 23 10 23H20C21.6569 23 23 21.6569 23 20V10C23 8.34315 21.6569 7 20 7H10ZM9 10C9 9.44771 9.44771 9 10 9H20C20.5523 9 21 9.44771 21 10V20C21 20.5523 20.5523 21 20 21H10C9.44771 21 9 20.5523 9 20V10Z",fill:"#7F7F87"})),xr=e=>l.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("path",{d:"M3 4C3 3.45228 3.45228 3 4 3H14C14.5477 3 15 3.45228 15 4C15 4.55228 15.4477 5 16 5C16.5523 5 17 4.55228 17 4C17 2.34772 15.6523 1 14 1H4C2.34772 1 1 2.34772 1 4V14C1 15.6523 2.34772 17 4 17C4.55228 17 5 16.5523 5 16C5 15.4477 4.55228 15 4 15C3.45228 15 3 14.5477 3 14V4Z",fill:"#7F7F87"}),l.createElement("path",{d:"M18.7071 12.2929C19.0976 12.6834 19.0976 13.3166 18.7071 13.7071L14.7071 17.7071C14.3166 18.0976 13.6834 18.0976 13.2929 17.7071L11.2929 15.7071C10.9024 15.3166 10.9024 14.6834 11.2929 14.2929C11.6834 13.9024 12.3166 13.9024 12.7071 14.2929L14 15.5858L17.2929 12.2929C17.6834 11.9024 18.3166 11.9024 18.7071 12.2929Z",fill:"#7F7F87"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7 10C7 8.34315 8.34315 7 10 7H20C21.6569 7 23 8.34315 23 10V20C23 21.6569 21.6569 23 20 23H10C8.34315 23 7 21.6569 7 20V10ZM10 9C9.44771 9 9 9.44771 9 10V20C9 20.5523 9.44771 21 10 21H20C20.5523 21 21 20.5523 21 20V10C21 9.44771 20.5523 9 20 9H10Z",fill:"#7F7F87"})),br=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M8 9.33366L10.6667 6.66699",stroke:"#CACAD6",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M2.22927 12.6663C1.64408 11.6529 1.33598 10.5032 1.33594 9.33294C1.33589 8.16266 1.64391 7.013 2.22902 5.9995C2.81413 4.98599 3.65572 4.14437 4.6692 3.55922C5.68268 2.97407 6.83233 2.66602 8.0026 2.66602C9.17288 2.66602 10.3225 2.97407 11.336 3.55922C12.3495 4.14437 13.1911 4.98599 13.7762 5.9995C14.3613 7.013 14.6693 8.16266 14.6693 9.33294C14.6692 10.5032 14.3611 11.6529 13.7759 12.6663",stroke:"#CACAD6",strokeLinecap:"round",strokeLinejoin:"round"}))),vr=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M1.33594 2H5.33594C6.04318 2 6.72146 2.28095 7.22156 2.78105C7.72165 3.28115 8.0026 3.95942 8.0026 4.66667V14C8.0026 13.4696 7.79189 12.9609 7.41682 12.5858C7.04175 12.2107 6.53304 12 6.0026 12H1.33594V2Z",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M14.6667 2H10.6667C9.95942 2 9.28115 2.28095 8.78105 2.78105C8.28095 3.28115 8 3.95942 8 4.66667V14C8 13.4696 8.21071 12.9609 8.58579 12.5858C8.96086 12.2107 9.46957 12 10 12H14.6667V2Z",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),yr=e=>l.createElement("svg",{width:18,height:18,viewBox:"0 0 18 18",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:" ",clipPath:"url(#clip0_2062_980)"},l.createElement("path",{id:"Vector",d:"M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z",stroke:"#DB4354",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M9 12V9",stroke:"#DB4354",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M9 6H9.0075",stroke:"#DB4354",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("clipPath",{id:"clip0_2062_980"},l.createElement("rect",{width:18,height:18,fill:"white"})))),kr=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M14 4H2",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M6.66667 8H2",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M6.66667 12H2",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_4",d:"M11.3359 12C12.4405 12 13.3359 11.1046 13.3359 10C13.3359 8.89543 12.4405 8 11.3359 8C10.2314 8 9.33594 8.89543 9.33594 10C9.33594 11.1046 10.2314 12 11.3359 12Z",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_5",d:"M14.001 12.6671L12.7344 11.4004",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}))),jr=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame",clipPath:"url(#clip0_2391_9440)"},l.createElement("path",{id:"Vector",d:"M8.00016 14.6663C11.6821 14.6663 14.6668 11.6816 14.6668 7.99967C14.6668 4.31778 11.6821 1.33301 8.00016 1.33301C4.31826 1.33301 1.3335 4.31778 1.3335 7.99967C1.3335 11.6816 4.31826 14.6663 8.00016 14.6663Z",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M8 10.6667V8",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M8 5.33301H8.00667",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("clipPath",{id:"clip0_2391_9440"},l.createElement("rect",{width:16,height:16,fill:"white"})))),Fe=e=>l.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M3.5 3.5H8.5V8.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M3.5 8.5L8.5 3.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),Ar=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M10.668 11.3327L14.0013 7.99935L10.668 4.66602",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M14 8H6",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),Nr=e=>l.createElement("svg",{width:20,height:20,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M7.5 2.5V17.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M11.6641 12.5L14.1641 10L11.6641 7.5",stroke:"#A3A3AD",strokeLinecap:"round",strokeLinejoin:"round"}))),Bt=e=>l.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M2.5 6H9.5",stroke:"url(#paint0_linear_1969_6977)",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M6 2.5L9.5 6L6 9.5",stroke:"url(#paint1_linear_1969_6977)",strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("linearGradient",{id:"paint0_linear_1969_6977",x1:3.0538,y1:6.78947,x2:9.38851,y2:5.70792,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:.52,stopColor:"#EBAEC6"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})),l.createElement("linearGradient",{id:"paint1_linear_1969_6977",x1:6.2769,y1:8.02632,x2:9.5361,y2:7.98658,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:.52,stopColor:"#EBAEC6"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})))),Cr=e=>l.createElement("svg",{width:18,height:18,viewBox:"0 0 18 18",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M2.25 9C2.25 10.335 2.64588 11.6401 3.38758 12.7501C4.12928 13.8601 5.18349 14.7253 6.41689 15.2362C7.65029 15.7471 9.00749 15.8808 10.3169 15.6203C11.6262 15.3599 12.829 14.717 13.773 13.773C14.717 12.829 15.3599 11.6262 15.6203 10.3169C15.8808 9.00749 15.7471 7.65029 15.2362 6.41689C14.7253 5.18349 13.8601 4.12928 12.7501 3.38758C11.6401 2.64588 10.335 2.25 9 2.25C7.11296 2.2571 5.30173 2.99342 3.945 4.305L2.25 6",stroke:"#A3A3AD",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M2.25 2.25V6H6",stroke:"#A3A3AD",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}))),Sr=e=>l.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame",clipPath:"url(#clip0_1003_572)"},l.createElement("path",{id:"Vector",d:"M5.33594 9.33301C7.54508 9.33301 9.33594 7.54215 9.33594 5.33301C9.33594 3.12387 7.54508 1.33301 5.33594 1.33301C3.1268 1.33301 1.33594 3.12387 1.33594 5.33301C1.33594 7.54215 3.1268 9.33301 5.33594 9.33301Z",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M12.0573 6.91309C12.6875 7.14804 13.2483 7.53811 13.6878 8.04722C14.1273 8.55633 14.4313 9.16805 14.5718 9.8258C14.7122 10.4835 14.6846 11.1661 14.4913 11.8103C14.2981 12.4545 13.9455 13.0396 13.4662 13.5115C12.987 13.9834 12.3964 14.3267 11.7493 14.5099C11.1021 14.6931 10.4192 14.7101 9.76375 14.5594C9.10827 14.4087 8.50137 14.0951 7.99918 13.6478C7.49699 13.2004 7.11571 12.6335 6.89062 11.9998",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_3",d:"M4.66406 4H5.33073V6.66667",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_4",d:"M11.1399 9.25293L11.6066 9.72626L9.72656 11.6063",stroke:"#7F7F87",strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("clipPath",{id:"clip0_1003_572"},l.createElement("rect",{width:16,height:16,fill:"white"})))),Er=e=>l.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M2.5 6L6 9.5L9.5 6",stroke:"#DB4557",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M6 2.5V9.5",stroke:"#DB4557",strokeLinecap:"round",strokeLinejoin:"round"}))),Rr=e=>l.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M2.5 6L6 2.5L9.5 6",stroke:"#3DB7C2",strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M6 9.5V2.5",stroke:"#3DB7C2",strokeLinecap:"round",strokeLinejoin:"round"}))),Ir=e=>l.createElement("svg",{width:32,height:32,viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("path",{id:"Vector",d:"M5.13359 11.4941C4.93898 10.6175 4.96886 9.7059 5.22047 8.8439C5.47207 7.9819 5.93725 7.19737 6.57288 6.56308C7.20851 5.92878 7.994 5.46524 8.85653 5.21544C9.71906 4.96564 10.6307 4.93767 11.5069 5.13411C11.9892 4.37985 12.6536 3.75913 13.4389 3.32916C14.2241 2.8992 15.105 2.67383 16.0003 2.67383C16.8955 2.67383 17.7764 2.8992 18.5617 3.32916C19.3469 3.75913 20.0113 4.37985 20.4936 5.13411C21.3711 4.93681 22.2844 4.96466 23.1483 5.21507C24.0122 5.46547 24.7987 5.9303 25.4347 6.56632C26.0707 7.20234 26.5356 7.98888 26.786 8.85278C27.0364 9.71669 27.0642 10.6299 26.8669 11.5074C27.6212 11.9897 28.2419 12.6541 28.6719 13.4394C29.1018 14.2246 29.3272 15.1055 29.3272 16.0008C29.3272 16.8961 29.1018 17.7769 28.6719 18.5622C28.2419 19.3474 27.6212 20.0118 26.8669 20.4941C27.0634 21.3703 27.0354 22.282 26.7856 23.1445C26.5358 24.007 26.0723 24.7925 25.438 25.4282C24.8037 26.0638 24.0191 26.529 23.1571 26.7806C22.2951 27.0322 21.3836 27.0621 20.5069 26.8674C20.0253 27.6246 19.3604 28.248 18.5738 28.6799C17.7872 29.1118 16.9043 29.3382 16.0069 29.3382C15.1096 29.3382 14.2267 29.1118 13.4401 28.6799C12.6535 28.248 11.9886 27.6246 11.5069 26.8674C10.6307 27.0639 9.71906 27.0359 8.85653 26.7861C7.994 26.5363 7.20851 26.0728 6.57288 25.4385C5.93725 24.8042 5.47207 24.0197 5.22047 23.1577C4.96886 22.2957 4.93898 21.3841 5.13359 20.5074C4.37353 20.0264 3.74748 19.361 3.31366 18.5731C2.87983 17.7851 2.65234 16.9003 2.65234 16.0008C2.65234 15.1013 2.87983 14.2164 3.31366 13.4285C3.74748 12.6406 4.37353 11.9751 5.13359 11.4941Z",stroke:"url(#paint0_linear_1391_2499)",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"}),l.createElement("path",{id:"Vector_2",d:"M12 16.0007L14.6667 18.6673L20 13.334",stroke:"url(#paint1_linear_1391_2499)",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round"})),l.createElement("defs",null,l.createElement("linearGradient",{id:"paint0_linear_1391_2499",x1:4.7627,y1:23.7247,x2:29.5913,y2:23.1188,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:.52,stopColor:"#EBAEC6"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})),l.createElement("linearGradient",{id:"paint1_linear_1391_2499",x1:12.6329,y1:17.5445,x2:20.0737,y2:17.2723,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#F7C3A1"}),l.createElement("stop",{offset:.52,stopColor:"#EBAEC6"}),l.createElement("stop",{offset:1,stopColor:"#DF9BE8"})))),Tr=e=>l.createElement("svg",{width:20,height:20,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},l.createElement("g",{id:"Frame"},l.createElement("g",{id:"Subtract"},l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.03033 6.96967C7.73744 6.67678 7.26256 6.67678 6.96967 6.96967C6.67678 7.26256 6.67678 7.73744 6.96967 8.03033L8.93934 10L6.96967 11.9697C6.67678 12.2626 6.67678 12.7374 6.96967 13.0303C7.26256 13.3232 7.73744 13.3232 8.03033 13.0303L10 11.0607L11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303C13.3232 12.7374 13.3232 12.2626 13.0303 11.9697L11.0607 10L13.0303 8.03033C13.3232 7.73744 13.3232 7.26256 13.0303 6.96967C12.7374 6.67678 12.2626 6.67678 11.9697 6.96967L10 8.93934L8.03033 6.96967Z",fill:"#0E0E0F"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.03033 6.96967C7.73744 6.67678 7.26256 6.67678 6.96967 6.96967C6.67678 7.26256 6.67678 7.73744 6.96967 8.03033L8.93934 10L6.96967 11.9697C6.67678 12.2626 6.67678 12.7374 6.96967 13.0303C7.26256 13.3232 7.73744 13.3232 8.03033 13.0303L10 11.0607L11.9697 13.0303C12.2626 13.3232 12.7374 13.3232 13.0303 13.0303C13.3232 12.7374 13.3232 12.2626 13.0303 11.9697L11.0607 10L13.0303 8.03033C13.3232 7.73744 13.3232 7.26256 13.0303 6.96967C12.7374 6.67678 12.2626 6.67678 11.9697 6.96967L10 8.93934L8.03033 6.96967Z",fill:"url(#paint0_linear_1969_6911)",fillOpacity:.24}))),l.createElement("defs",null,l.createElement("linearGradient",{id:"paint0_linear_1969_6911",x1:8,y1:2,x2:13,y2:18,gradientUnits:"userSpaceOnUse"},l.createElement("stop",{stopColor:"#E2A1E0"}),l.createElement("stop",{offset:1})))),pe=e=>{N.error(e),_t.custom(n=>t.jsxs("div",{className:"flex max-w-[18.75rem] items-start rounded-xl bg-gradient-to-r from-gradient-red-start to-gradient-red-end px-3 py-2 text-sm text-neutrals-1100",children:[t.jsx("div",{children:e}),t.jsx("button",{className:"pl-2",onClick:()=>_t.dismiss(n.id),children:t.jsx(Tr,{className:"size-5"})})]}))};async function Or(e,n,a,s,r){const o=await e.fetchQuery({queryKey:Xn(a,s),queryFn:()=>Jn(n,s,r),staleTime:Number.POSITIVE_INFINITY}),i=Math.max(0,o.currentEpochIndex-1);return Ee(n,s,i,r)}const Gt=60*1e3,Lr=6*60,_r=e=>{const n=e.toLowerCase();return/epoch\s+\d+\s+not\s+found/.test(n)},Pr=({children:e})=>{const n=x(p=>p.setCurrentEpoch),a=x(p=>p.setEpochLoadFailed),s=x(p=>p.setReferencePerGatewayReward),r=x(p=>p.currentEpoch),o=x(p=>p.setTicker),i=x(p=>p.rpc),d=x(p=>p.solanaRpcUrl),c=x(p=>p.arIOReadSDK),h=x(p=>p.setIsMobile),u=x(p=>p.networkPortalDB),m=me();return l.useEffect(()=>{let p=!0,g;const w=async(k,v,f)=>{if(!(k<=0))try{const b=await Ee(i,v,k-1,f);p&&(b.perGatewayReward??0)>0&&s(b.perGatewayReward)}catch(b){N.warn("[GlobalDataProvider] could not read the previous epoch for a reference reward",b)}},j=(k,v,f)=>{let b=0;const E=async()=>{if(!(!p||b>=Lr)){b+=1;try{const A=await Ee(i,v,k,f);if(!p)return;if(A.rewardsPrescribed){n(A);return}}catch(A){N.warn("[GlobalDataProvider] prescription poll failed",A)}p&&(g=setTimeout(E,Gt))}};g=setTimeout(E,Gt)};return(async()=>{n(void 0),a(!1),s(void 0);const k=c==null?void 0:c.garProgram,v=(c==null?void 0:c.commitment)??"confirmed";o(Cs);try{let f;if(k&&i?f=await Or(m,i,d,k,v):f=await c.getCurrentEpoch(),!p)return;if(Array.isArray(f)){N.error("[GlobalDataProvider] Error fetching current epoch: unexpected array response"),a(!0),pe("Error fetching current epoch. Application may not function as expected.");return}N.info(`[GlobalDataProvider] Current epoch loaded: ${f.epochIndex} (RPC: ${d})`);const b=!!k&&!!i&&f.rewardsPrescribed===!1;if(b&&(await w(f.epochIndex,k,v),!p))return;n(f),b&&j(f.epochIndex,k,v)}catch(f){if(!p)return;const b=ce(f);if(_r(b)){N.warn("[GlobalDataProvider] Current epoch is not available yet on this staging deployment",{rpcUrl:d,errorMessage:b}),a(!0);return}N.error("[GlobalDataProvider] Error fetching current epoch",{rpcUrl:d,errorMessage:b,error:f}),a(!0),pe("Error fetching current epoch. Application may not function as expected.")}})(),()=>{p=!1,g&&clearTimeout(g)}},[c,i,m,n,a,s,o,d]),l.useEffect(()=>{r!=null&&r.epochIndex&&u&&Js(u,r.epochIndex)},[r,u]),l.useEffect(()=>{cr()},[]),l.useEffect(()=>{const p=()=>{h(window.innerWidth<1024)};return window.addEventListener("resize",p),()=>window.removeEventListener("resize",p)},[h]),t.jsx(t.Fragment,{children:e})},zt="walletType";var de=(e=>(e.PHANTOM="Phantom",e.SOLFLARE="Solflare",e.BACKPACK="Backpack",e))(de||{});function Mr(e){return e.connected===!0&&e.publicKey!==null&&typeof e.signTransaction=="function"}function Dr(e){const n=K(e.publicKey.toBase58()),a=e.signTransaction.bind(e);return{address:n,async modifyAndSignTransactions(s){return Promise.all(s.map(async r=>{const o=new Uint8Array(r.messageBytes),i=_a.deserialize(o),d=new Pa(i),c=i.staticAccountKeys,h=i.header.numRequiredSignatures;for(let b=0;b<h;b++){const E=c[b].toBase58(),A=r.signatures[E];A&&(d.signatures[b]=A)}const u=d.message.serialize();u.length===o.length&&u.every((b,E)=>b===o[E])||console.warn("[wallet-bridge] web3.js reserialize ≠ kit messageBytes — wallet sig will not verify on the wire.",{kitLen:o.length,web3Len:u.length});const p=await a(d),g=p.message.serialize();g.length===o.length&&g.every((b,E)=>b===o[E])||console.debug("[wallet-bridge] wallet rewrote the transaction; forwarding its rewritten message.",{originalLen:o.length,signedLen:g.length});const j=p.signatures[0];if(!j||j.every(b=>b===0))throw new Error("Wallet adapter returned an unsigned transaction (signature slot 0 is empty).");const y=p.message.staticAccountKeys,k=p.message.header.numRequiredSignatures,v={};for(let b=0;b<k;b++){const E=p.signatures[b];E&&!E.every(A=>A===0)&&(v[y[b].toBase58()]=E)}const f=r.lifetimeConstraint;return{messageBytes:p.message.serialize(),signatures:v,...f?{lifetimeConstraint:f}:{}}}))}}}const Fr=e=>e&&{Phantom:de.PHANTOM,Solflare:de.SOLFLARE,Backpack:de.BACKPACK}[e]||de.PHANTOM,$r=({children:e})=>{var g;const{publicKey:n,signTransaction:a,connected:s,wallet:r}=pt(),o=x(w=>w.updateWallet),i=x(w=>w.setWalletStateInitialized),d=x(w=>w.setWriteSDK),c=x(w=>w.rpc),h=x(w=>w.solanaRpcUrl),u=I(w=>w.solanaCoreProgramId),m=I(w=>w.solanaGarProgramId),p=I(w=>w.solanaArnsProgramId);return l.useEffect(()=>{var w;if(s&&n){const j=n.toBase58();if(o(j),localStorage.setItem(zt,Fr((w=r==null?void 0:r.adapter)==null?void 0:w.name)),a)try{const y=new URL(h);y.protocol=y.protocol==="https:"?"wss:":"ws:",y.port&&(y.port=String(Number(y.port)+1));const k=y.toString(),v=Ma(k),f={connected:s,publicKey:n,signTransaction:a};if(console.debug("Wallet adapter signer ready:",{connected:f.connected,hasPublicKey:f.publicKey!==null,hasSignTransaction:typeof f.signTransaction=="function"}),Mr(f)){const b=Dr(f),E=J(u),A=J(m),C=J(p),T=bn.init({rpc:c,rpcSubscriptions:v,signer:b,...E?{coreProgramId:K(E)}:{},...A?{garProgramId:K(A)}:{},...C?{arnsProgramId:K(C)}:{}});console.log("✅ Wallet connected with write capabilities:",j),d(T)}else console.warn("Wallet adapter not ready for write operations"),d(void 0)}catch(y){console.error("Failed to create wallet signer:",y),d(void 0)}else console.log("Wallet connected (read-only - no signing capability):",j),d(void 0)}else o(void 0),d(void 0),localStorage.removeItem(zt);i(!0)},[s,n,a,c,h,u,m,p,o,i,d,(g=r==null?void 0:r.adapter)==null?void 0:g.name]),t.jsx(t.Fragment,{children:e})};function Ur(){const[e,n]=l.useState(navigator.onLine),[a,s]=l.useState("");return l.useEffect(()=>(window.addEventListener("online",()=>n(!0)),window.addEventListener("offline",()=>n(!1)),()=>{window.removeEventListener("online",()=>n(!0)),window.removeEventListener("offline",()=>n(!1))}),[]),l.useEffect(()=>{s(e?"":`We can't connect to the Internet. Please check your connection
            and try again.`)},[e]),t.jsx(t.Fragment,{children:a&&t.jsx("div",{className:"flex flex-row items-center justify-center bg-warning p-2 text-sm font-bold text-containerL0",children:t.jsx("span",{children:a})})})}var ee=(e=>(e.PRIMARY="primary",e.SECONDARY="secondary",e.TERTIARY="tertiary",e))(ee||{});const Q=({forwardRef:e,className:n,buttonType:a="secondary",icon:s,rightIcon:r,title:o,text:i,active:d=!1,onClick:c})=>{if(a==="primary"){const h=["rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end p-px",n].join(" ");return t.jsx("div",{className:h,children:t.jsxs("button",{title:o,ref:e,className:"inline-flex size-full items-center gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.6875rem] py-[.3125rem] shadow-inner"+(s?" justify-start":" justify-center"),onClick:c,children:[s,i&&t.jsx("div",{className:"text-gradient text-sm leading-tight",children:i})]})})}else if(a==="secondary"){const p=["h-[2.125rem]  rounded-md flex items-center space-x-[.6875rem] px-[.6875rem] py-[.3125rem] text-sm",d?"bg-gradient-to-b shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] dark:bg-[#212124] text-high":"hover: rounded-md hover:bg-gradient-to-b hover:shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] hover:dark:bg-[#212124] text-mid",n].join(" ");return t.jsxs("button",{ref:e,title:o,className:p,onClick:c,children:[s,i&&t.jsxs("div",{className:`flex grow items-center space-x-1 whitespace-nowrap leading-none ${s?"justify-start":"justify-center"}`,children:[i," ",r]})]})}return t.jsx("div",{children:"Not yet implemented"})},ae=({onClose:e,children:n,showCloseButton:a=!0,useDefaultPadding:s=!0,closeOnClickOutside:r=!1})=>t.jsxs(Da,{open:!0,onClose:r?e:()=>{},className:"relative z-50",children:[t.jsx("div",{className:"fixed inset-0 w-screen bg-neutrals-1100/80","aria-hidden":"true"}),t.jsx("div",{className:"fixed inset-0 flex  w-screen items-center justify-center p-4",children:t.jsxs(Fa,{className:`relative flex max-h-full flex-col items-stretch rounded-xl bg-[#111112] ${s?"p-8":""} border border-stroke-low text-center text-grey-100`,children:[a&&t.jsx("button",{className:"absolute -top-7 right-0 lg:-right-7 lg:top-0",onClick:e,children:t.jsx(gr,{className:"size-5"})}),t.jsx("div",{className:"flex grow flex-col overflow-hidden overflow-y-auto rounded-xl scrollbar",children:n})]})})]}),Vr=({title:e,markdownText:n,onClose:a})=>t.jsx(ae,{onClose:a,useDefaultPadding:!1,children:t.jsx("div",{className:"h-[32rem] w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]",children:t.jsxs("div",{className:"flex  size-full flex-col px-8 pb-4 pt-6",children:[t.jsx("div",{className:"text-lg text-high",children:e}),t.jsx("div",{className:"prose my-2 grow overflow-y-auto text-sm text-mid scrollbar prose-headings:text-high prose-h2:text-base prose-h3:text-sm",children:t.jsx($a,{children:n})})]})})}),rt=`# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Smart Delegate: enter an amount and see where it would earn most.** There
  are 243 gateways accepting delegations and no way to tell which is a good
  home for a given amount. What decides it — how much is already delegated
  there, what share the operator passes on, how reliably the gateway gets paid
  — is spread across four columns of a long table.

  The mechanism is worth stating, because it is why this works at all. Each
  epoch the network pays every eligible gateway the same reward. A gateway
  passes a share of that to its delegates, and that share is split by stake.
  So the less stake a gateway already carries, the more each of your tokens
  earns there. That is not a theory: across the published payout history,
  gateways in the lowest quarter by delegated stake have returned roughly
  **twenty times** those in the highest.

  A card above the delegate table takes an amount and names the three gateways
  where it would earn most, each showing what you would actually receive over
  the next epoch, what share of that gateway's delegate pool you would own,
  what its delegates have really earned, and the four inputs behind the
  ranking. Picking one opens the usual staking dialog with the amount already
  filled in; nothing moves without your signature.

  **The figure is per epoch, roughly a day, and that is deliberate.**
  Annualising it compounds a year of assumptions onto a reward the protocol
  resets daily: for a small delegation to an empty gateway it produces numbers
  in the hundreds of percent, which are arithmetically correct and not a
  promise anyone could keep. One epoch out, the inputs are known rather than
  projected.

  Alongside the estimate, where anyone has been paid at a gateway, the card
  shows what its delegates have **actually** earned, annualised from the
  published history. That figure is available for 105 of the eligible gateways
  and is often well below the estimate, which is the honest thing for a
  prospective delegator to see. Where nobody has been paid there yet it says
  so, because that absence is itself information.

  It also says plainly what dilutes the figure: the share of the pool you would
  own, and that your share falls as others delegate. A gateway with no
  delegates gives you the whole delegate share and is therefore the most
  attractive and the least durable position on the list.

  Two limits on what can be ranked. A gateway needs 30 epochs of history:
  reward per token rises as delegated stake falls, so an empty gateway would
  otherwise take the top slot for the price of one settings change, and a
  history floor makes that position cost what an honest operator pays. And a
  gateway on a current failure streak is discounted sharply rather than judged
  on its lifetime average, because twelve consecutive failures still reads as
  87% after a few hundred good epochs.

### Fixed

- The minimum a delegation must clear is now derived in one place for both the
  staking form and Smart Delegate, so a gateway can no longer be recommended at
  an amount the form would then refuse.

- **A departing gateway's minimum stake offered an early withdrawal the
  network always refuses.** When a gateway leaves, its stake splits across two
  vaults: the minimum operator stake is held for the full leave period and
  cannot be released early at any price, and anything above it follows the
  ordinary withdrawal period and can be expedited. The portal offered Expedite
  on both. Taking it on the protected one spent a signature on a transaction
  the network rejects every time — for the whole 90 days.

  The portal could not previously tell the two apart, because the published
  record of a vault did not say which kind it was. It does now, so Expedite is
  offered only where it can succeed, and the protected vault says what it is
  and that it will be claimable in full once its date passes.

  The error, if it is reached another way, now explains itself rather than
  printing raw transaction data. It had been matched against the wrong code —
  the right one is 6082 — so the explanation never appeared.

- **A withdrawal that had finished waiting gave no sign it was there.** When a
  withdrawal period ends the tokens become claimable, not paid: returning them
  takes a transaction you sign. The only place that said so was a card on the
  Balances page which appears only when you already have something to claim —
  so the way to find out you had money waiting was to visit a page you had no
  reason to visit. An operator whose gateway had left the network reported
  20,000 ARIO as lost a month after it matured; it was sitting in the vault
  the whole time.

  Your profile now carries a mark when a withdrawal is ready, on every page,
  and the menu behind it says so and links to the claim. The Leave Network
  dialog now says plainly that nothing comes back on its own, that each vault
  must be claimed once its date passes, and that a departed gateway drops out
  of the gateway list — which is the other half of what looked like
  disappearing tokens.

  A gateway address that is no longer in the registry now says so, instead
  of drawing an empty page of dashes. That page is where the operator above
  went looking, having kept the link — and to its owner it also says where
  the exit stake went and links to the claim.

  The mark counts matured withdrawals, so it can under-report where an
  unlocked locked-transfer vault is also waiting. It reads "at least" for that
  reason, and the Balances page remains the full picture. Counting those too
  would mean every visitor fetching the whole network's vault list on every
  page to serve a rare case.


## [2.13.2] - 2026-10-08

### Security

- **The router was patched for a cross-site-scripting issue.** React Router
  below 1.23.2 of its internal router could be made to redirect somewhere it
  should not, and it sits behind every link and page change in the portal. The
  fix is a dependency update with no change in behaviour. Worth saying what it
  was not: nothing here was exploited, and no wallet, balance or signing path
  was involved.

### Changed

- **A release now uploads compressed, so the portal downloads about a quarter
  of what it used to.** The published build was going to Arweave uncompressed —
  3.9 MB where the same files gzip to 1.0 MB. Every visitor paid that on first
  load, and every release paid it again in storage, permanently. Fonts and
  images are left alone, since compressing them a second time only makes them
  bigger.

### Fixed

- **Adding to a stake you already hold is no longer refused for being under
  the gateway's minimum.** A gateway operator sets a minimum delegation, and
  that is meant to be a joining requirement — what it takes to become one of
  their delegators. The network was applying it to every deposit instead, so a
  wallet with 3,845 ARIO staked at a gateway whose minimum is 500 could not
  add 250. The portal enforced the same rule, because offering an amount the
  network would reject is worse than refusing it up front.

  The network has been fixed, so the minimum now applies only to a first
  delegation and an existing delegator can add any amount. The portal follows:
  once you hold stake at a gateway, the form accepts a top-up from 1 ARIO up.

  What made this worth chasing beyond the inconvenience is that an operator
  who *raised* their minimum was retroactively locking out delegators who were
  already in — including some holding hundreds of times the new figure.

## [2.13.1] - 2026-10-04

### Fixed

- **A withdrawn stake kept appearing, and every attempt to withdraw it again
  failed with an unreadable error.** Withdrawing your whole stake empties the
  delegation, and the network closes that record in a second transaction a
  few seconds later. My Stakes never refreshed after that, so the stake was
  still listed — and withdrawing it again could only fail, because there was
  nothing left to withdraw. The error shown was a wall of raw transaction
  data, so it read as though the withdrawal had never worked, when in fact it
  had worked the first time and the tokens were already withdrawing.

  My Stakes now refreshes on its own, so a stake that has been withdrawn
  stops being offered. If the situation is reached anyway, the message says
  that the network has no record of the delegation and that it may already
  have been withdrawn, and the withdrawal flows refresh the list on the spot.
  The failures reported here cost nothing: each was turned away by the check
  that runs before a transaction is broadcast, so none of them reached the
  network. A transaction that passes that check and then fails while
  executing does pay the usual fee.

## [2.13.0] - 2026-10-02

### Added

- **Rewards by Epoch now shows what each epoch did not pay out.** Rewards go
  unpaid two ways: a gateway that fails an epoch is paid nothing for it, and
  a prescribed observer that never submits forfeits its share. Either way the
  tokens stay in the treasury, so the pool an epoch set aside is larger than
  the amount that reached anyone.

  Each bar now caps with what went unpaid, in two dotted bands tinted to
  match their pot — pink for gateway rewards missed, teal for observer
  rewards missed — so a glance shows both how much was left and which half
  it came from. Bar heights are unchanged, because that money was always
  inside the bar; what is new is seeing where it went. Hovering breaks it
  down, in ARIO or USD.

  Only epochs that have finished distributing are marked, since a running
  epoch's result still moves as observers report, and an epoch whose record
  is no longer available is left unmarked rather than drawn as though nothing
  was lost.

### Fixed

- **The token supply shown on the dashboard no longer falls back to the
  genesis billion.** While the real figure was loading, the Token Supply
  panel displayed a hardcoded 1,000,000,000 ARIO — the same constant that
  was understating every holder's share on the Balances page until it was
  removed there. It happens to match the mint's current total, which is why
  it went unnoticed, but it was a number the panel asserted without having
  read it. It now waits for the real one.

## [2.12.2] - 2026-10-01

### Fixed

- **Every yield assumed the gateway never fails an epoch.** A gateway failed
  by most of the observers that assessed it is paid nothing for that epoch —
  not a reduced amount — and across eight recent epochs that was about one
  registry slot in sixteen. The portal showed those gateways the same yield
  as a healthy one, in the staking tables, on the gateway page and in the
  staking dialogs, for operators and delegates alike.

  Yields are now weighted by the share of epochs each gateway has actually
  been paid for, which is the figure the Gateways page already shows as
  Performance. An estimated annual yield now reflects how often a gateway
  earns, rather than what it would earn if it never missed. Most gateways
  move by a few percent; one that fails often moves a long way. A gateway too
  new to have a record is unchanged, since no history is not evidence of
  failure.

## [2.12.1] - 2026-09-30

### Fixed

- **Observation Chance and Observer Performance read 0.00% for every
  observer.** The Observers table took both figures from the epoch's list of
  prescribed observers, and that list carries only their addresses — the
  weights beside them are placeholder zeros. So both columns showed 0.00% in
  every epoch, and sorting by either did nothing. They now come from the
  gateway records the page had already loaded, which carry the real weights,
  so the figures match what a gateway's own page shows and the columns sort.
  An observer whose gateway is missing from the roster reads "—" rather than
  0.00%, which would have claimed it could never be selected.

- **The coin beside "$ARIO Balances" was the pre-rebrand mark**, and it was a
  photograph of one: a bitmap embedded in an SVG, 406 KB, drawn at 19 pixels
  across. It has been replaced with the official ARIO token logo from the
  ar.io brand kit, which is drawn as a vector and weighs 1 KB. The icon is
  sharp at any size, and the Balances page downloads roughly 400 KB less.

## [2.12.0] - 2026-09-30

### Added

- A gateway can now name an **operations address**: a second wallet allowed to
  update the gateway's routing and presentation settings and to spend its ArNS
  discount. It cannot move stake, change the reward share, or leave the network
  — those stay with the owner. The gateway's page shows it, and the owner can
  set, change, or revoke it by entering their own wallet again. A gateway that
  has never set one reads "Not delegated (owner wallet)".

- A gateway's **"Observations of this gateway"** panel can now say *why* an
  observer failed it, not only that one did. Past epochs are served from the
  published archive, which records how many gateways each observer passed but
  not which ones — so the panel could only report "Unknown". The reports those
  observers uploaded name each gateway and give the reason, and the panel now
  offers to read them: "Response code 503 (Service Unavailable) — ownership
  check and 10 ArNS names" is an outage during the assessment window, and
  reads very differently from a failing configuration.

  Reading them is a deliberate step rather than automatic, because it fetches
  each observer's report. What it could not read it says it could not read,
  rather than counting silence as a pass.

- **A past epoch can now name which observers failed a gateway.** The panel
  above could say how many reports an epoch received but not what they said
  about you, and showed **Unknown** instead of a verdict: the results are a
  bitmap indexed by the gateway registry's slot order for that epoch, and
  only a fingerprint of that order was published. The order itself is now
  published, so past epochs read like the current one — "Failed by 3/34
  observers", with those three named and linked.

  Reading their reports for the reason is still a deliberate step, but a much
  smaller one: it now fetches only the reports of the observers that failed
  you, typically three or four rather than every report submitted that epoch.
  The reasons appear beneath each observer.

  Where the published order cannot be trusted for an epoch the panel falls
  back to counts and **Unknown** rather than guessing — including when the
  order was captured after the epoch had closed, and when the decoded results
  disagree with the network's own tally of failures. Two epochs on mainnet
  fall into the first case and correctly stay unattributed.

### Fixed

- **Matured withdrawals could not be claimed from My Stakes.** Nothing returns
  a matured withdrawal to your wallet by itself — on this network it takes a
  transaction you sign — and the only place that offered one was a bulk button
  on the Balances page, hidden unless you had something to claim. My Stakes
  showed "Withdrawing" with a date in the past and offered Expedite, Cancel and
  Redelegate, none of which pays you. A matured withdrawal now reads "Unlocked"
  and offers **Claim Withdrawal**, in My Stakes and in a gateway's Pending
  Withdrawals.

- **Expedite under-quoted its own fee on a matured withdrawal**, and offered
  itself where it should not. The fee stops falling at 10% and never reaches
  zero, but the quote kept dropping past that — 7.3% two days after a
  withdrawal matured, and below zero from six weeks on, while the network still
  charged 10%. Once a withdrawal unlocks, claiming returns the full amount, so
  Expedite is withdrawn rather than left as a way to pay 10% for nothing.

- **The leave period was stated as 30 days when it is 90.** A departing
  gateway's stake splits across two vaults: the minimum operator stake is held
  for 90 days and cannot be released early, and anything above it follows the
  30-day withdrawal period. The Gateways page said 30 for both, and the Leave
  Network dialog said 90 for all three of its lines. Both now describe what
  actually happens. An operator who read the old figure and expected their
  stake back after 30 days is the reason this was found.

- **"No stake is slashed on removal" was wrong.** A gateway removed for failing
  30 consecutive epochs is slashed its entire minimum operator stake. The
  tooltip said the opposite, in the panel that explains what failing costs.

- **Yields were overstated and disagreed with each other.** Delegate EAY was
  computed from figures the app filled in itself rather than the epoch's own
  reward, and the staking table and the staking dialog differed by about 25%
  while both read high. Every yield now comes from the epoch on chain. A yield
  that cannot be known yet says so instead of showing a number, and the few
  minutes at the start of an epoch before its rewards are set show the previous
  epoch's rate, labelled.

- **The rewards chart overstated every epoch by roughly double**, and drew an
  epoch whose rewards had not been split yet as though they had all gone to
  gateways. Totals now come from the epoch account, an unsplit epoch draws an
  outline rather than a bar, and the chart has a legend and a unit.

- **An epoch nobody observed was charted as a completed payout.** Such an epoch
  pays nothing and the rewards stay in the treasury, but it still carries the
  split it was assigned, so the chart showed gateway and observer rewards that
  were never paid. It now reads "Not paid".

- **Observer Performance opened on the epoch in progress**, which minutes after
  a rollover legitimately reads 0 of 50 — shown as a large 0.00% beside a red
  fall, which looks like the network has stopped. It leads with the most recent
  finished epoch, and says "in progress" when you hover the live one.

- **Switching the rewards chart to USD made the current epoch's bar vanish.**
  Each epoch is valued at its own closing price and the epoch in progress has
  not closed, so there was no price to use and the bar simply disappeared,
  which reads as paying nothing. It is valued at the most recent close and the
  tooltip says which epoch that came from.

- **Redelegating could be rejected after passing every check on screen.** The
  fee is taken first and the remainder must still clear the destination
  gateway's minimum, which the form did not account for. It now checks the
  amount that actually arrives, and suggests one that works.

- Delegating to a gateway now applies that gateway's own minimum rather than
  the network's, so the amount the form accepts is the amount the network does.

- Tokens are named **ARIO** throughout, retiring the pre-rebrand IO, tIO and
  mIO. The fee-based early release is called an **expedited withdrawal**
  everywhere, matching the network's own wording.

- Values that fail to load now say so instead of shimmering indefinitely, wide
  tables hint that they scroll, and a table's edges fade without a colour
  mismatch on scrollbars.

- **None of the info bubbles could be read on a phone.** The tooltip library
  opens on hover and closes on press, so on a touchscreen the tap meant to
  open an explanation was the same gesture dismissing it — not one of them
  could be opened. They now open on tap and close on a tap elsewhere, and a
  long explanation no longer runs off the side of the screen. The breadcrumb
  above the page title is reachable on a phone too.

- **Every holder's share of supply was measured against the genesis billion.**
  Balance Distribution declared a fixed 1,000,000,000 ARIO total supply while
  the dashboard beside it read the live figure from the mint, so the two
  disagreed — and the same constant was the denominator for every percentage
  on the panel. ArNS purchases burn ARIO, so the real supply only moves
  further from that number, and each holder's share was understated by a
  little more each day. Both now read the mint's own supply. When it cannot be
  read the panel says so and omits the percentages rather than dividing by a
  guess; a slice still shows the amount it holds.

- **An epoch whose reports were never archived read as an epoch nobody
  observed.** Observation accounts are deleted once an epoch distributes, so
  for a past epoch the published archive is the only record. Where that record
  is incomplete the portal showed "0 reports submitted" — the same thing it
  shows for an epoch that genuinely had none, and no later read can correct it
  because the accounts are gone. Two epochs on mainnet are affected: ten and
  eight observers reported on them respectively, and the portal said nobody
  had. It now distinguishes the two, saying how many reports were submitted
  and how many survived, and a partially captured epoch no longer presents its
  count as a total.

- **The deploy carried a lot it never used.** The font package was pulling all
  six of its alphabets — Arabic, Hebrew, Cyrillic and the rest — in two file
  formats each, twelve files where four will do. A reader never downloaded the
  alphabets they had no use for, but every one of them was published to
  Arweave and paid for permanently. Only the weight the interface asks for
  least often was actually included, so bold and semibold text was being
  faked by the browser; the real weights now ship and cost less than the
  unused alphabets did. An example data file that nothing referenced is gone
  too, and dependencies are now published separately from the app's own code,
  so a release no longer republishes several megabytes that did not change.
  Text is slightly crisper and a release costs a fraction of what it did.

## [2.11.1] - 2026-09-21

### Fixed

- Observer reports failing to load, leaving an empty page where the assessments
  table belongs. Reports are stored compressed, and a gateway that has indexed one
  hands it to your browser already decompressed — the portal then tried to
  decompress it a second time and gave up. It now checks first, so a report loads
  whichever way the gateway serves it. Reports stored as their own transaction were
  affected on most gateways; reports stored inside a bundle generally were not.

- Switching between Mainnet and Devnet in Settings doing nothing. Both buttons in
  the published build pointed at the same mainnet endpoint, so "Switch to Devnet"
  reloaded mainnet and the label never changed. The deploy now refuses to publish
  a build whose two endpoints don't name the networks they serve.

- Download Report failing without saying so on a report's own page, and saving a
  gateway's error page as \`report-<id>.json\` when one came back in place of a
  report. Both now report the failure instead.

## [2.11.0] - 2026-08-27

### Added

- You can now send tokens locked. The send dialog has a "Lock in a vault" switch
  that asks who receives them, how much, and when it unlocks; the recipient holds
  the tokens from the moment it confirms but cannot move them until that date. A
  second switch decides whether you can take them back: leave it off and the
  transfer is final, turn it on and you can revoke the vault any time before it
  unlocks. Vaults you create show up in the recipient's Vaults table alongside
  every other one.

  A consequence worth knowing: the network stores a lock *length*, not a moment.
  It starts counting when the transaction confirms rather than when you press
  send, so a vault unlocks that long after confirmation — which is why the dates
  read "on or around" and why the picker works in whole days. On a two-week lock
  the difference is seconds; there is no way to pin an exact time, so the dialog
  does not pretend to offer one.

  Two limits come from the network rather than from us: a vault must hold at
  least 100 ARIO, and you cannot send a locked transfer to yourself. The dialog
  checks both before asking your wallet to sign, so neither costs you a
  signature. Locks run from 14 days to 12 years.

  Locking also costs meaningfully more SOL than a plain send — it creates
  accounts the network charges rent for, roughly a hundred times the fee of an
  ordinary transfer, and the review step quotes it before you commit.

- The Vaults table shows vaults an address controls, not only the ones it owns.
  Each row is tagged: "Owned" means the tokens are that address's and land when
  the vault unlocks, "Sent" means it locked them for someone else and can revoke
  until then. A Counterparty column names the other side.

  This closes a gap that mattered once locked transfers existed: a revocable
  vault was visible only to its recipient, never to the person who sent it — the
  only party who can revoke one — so the Revoke button existed with no way to
  reach it. Two vaults of the same size sent to different people were also
  identical on screen until the confirmation dialog named the recipient.

  A consequence worth knowing: "Owned" does not mean spendable. The tokens are
  locked until the end date, and nothing is credited automatically when it
  passes — the owner has to press Release. An owned vault can also still be
  revoked out from under them if it is revocable, which is what the Counterparty
  column tells you.

### Fixed

- An action you had just taken did not show up. Transfer tokens and the balances
  table kept the old figure; create a vault and it was missing from the table it
  belongs in.

  Two separate causes. The balances table was never told to refresh at all, so
  it sat on whatever it had until it aged out. And the tables read published
  snapshots that are rebuilt every ten minutes or so, which means refreshing
  them right after a write just fetches the same data again — the snapshot was
  generated before the transaction existed.

  After a write, the affected tables now read from the network directly until
  the published data catches up. A consequence worth knowing: those tables are
  a little slower for a while after you write to them, which is the cost of
  showing you your own action instead of a stale copy of it.

- "Total Vaults" was drawn across the bottom edge of the Network Statistics card
  on the dashboard. The card shares a fixed height with every other panel there,
  and once the yield figures appeared it held more than fitted. The figures are
  slightly smaller now and all of them sit inside the card.

- The gateway settings table ran off the right of the page, taking Cancel and
  Save with it, with no way to scroll or zoom to reach them. A wallet address
  cannot be broken across lines, so the column holding it refused to narrow and
  pushed everything past the edge of a page that only scrolls vertically.
  Addresses now wrap and the columns give way instead.

- The spinner shown while your wallet signs used an old ar.io logo, drawn small
  and off-centre. It now uses the current mark, with the brand gradient turning
  around it.

## [2.10.0] - 2026-08-25

### Added

- The staking page shows what your delegations have actually earned, per gateway
  and per epoch, alongside the yield that works out to.

  A consequence worth knowing: the earnings are measured, but the yield is not a
  rate to expect. It divides everything you have earned by the stake you hold
  today, so if you have added or withdrawn since, it is measured against a
  balance that did not earn those rewards. The network's own figure sits beside
  it for comparison — across the whole network the two differ by about six
  times, so the comparison is the point.

  Gateways pass on anywhere from 0% to 95% of their rewards, so the same stake
  earns very differently depending where it sits. One wallet's eleven positions
  currently range from 2.8% to 12.4%.

- The dashboard charts what flows into the protocol treasury each epoch, in ARIO
  or in dollars.

  A consequence worth knowing: it is called inflow rather than revenue because
  it measures everything that moved into the treasury and cannot separate
  registration fees from one-off transfers. One epoch in the current window
  contains a 60 million ARIO deposit that is not income; it is drawn in amber
  and clipped, because at true scale it would flatten every other epoch to a
  hairline. Dollar figures use the ARIO price at each epoch, so they are what
  that inflow was worth at the time.

- The dashboard shows how much of the network's auditing is independent work.
  Observers are meant to assess the network on their own, and each epoch some of
  them file a report another observer had already filed. The chart tracks that
  share over time.

  It is deliberately the one measure here that needs no interpretation: two
  observers submitting the same report transaction is the same report under two
  wallets, not an inference about who they are.

  A consequence worth knowing: an epoch that only a handful of observers reported
  is marked in amber. Two observers filing two reports is 100% and means nothing,
  and hiding those epochs would conceal that they were barely observed at all.

- The rules the protocol enforces now appear where they decide what you can do.
  Joining as a gateway operator shows the minimum stake, the withdrawal and leave
  periods, the failed-epoch limit and the reward-share cap alongside the setup
  steps. Staking shows the minimum delegation, the withdrawal period and the
  redelegation and early-withdrawal fees before you commit.

  These are read from the same settings the network checks your transaction
  against, so they cannot drift out of date the way a number copied into the docs
  can.

- Network Statistics shows what delegated stake has actually returned across the
  network — annualised from measured rewards, not projected. Operator returns get
  their own line once the data exists for them, rather than being averaged in:
  they are worked out by comparing stake between epochs, where delegate rewards
  are read from the network's own records.

- Network Statistics now includes the total number of ArNS names and the demand
  factor — the multiplier applied to ArNS registration prices, which rises as
  names are bought and settles when demand slows.

- The infrastructure panel lists the five largest hosting providers rather than
  only the largest. On the current network the top five account for 86% of the
  gateways analysed, which one figure could not convey.

- Every column on the staking table can be sorted.

### Changed

- The gateway and staking pages now open the same way: what you do on the left,
  what the protocol requires on the right. They are the network's two ways in —
  running a gateway or backing one — and presenting them differently made them
  look like unrelated features. The staking copy says what a delegator actually
  gets rather than describing the mechanism.

- Rewards by Epoch can be shown in dollars as well as ARIO, and takes up a third
  less room. Each epoch is valued at the ARIO price on that day, so the figures
  are what those rewards were worth at the time. The most recent epochs are
  usually not priced yet and are left blank rather than drawn as zero.

- The dashboard fits more on screen. The three action cards at the top are about
  half their previous height on a wide display, and the panels below them are
  arranged in even rows.

- The token supply chart gives each slice its own shade. Previously every slice
  was the same colour and only the one under your cursor changed, so the legend
  could not identify anything without hovering it first.

- The staking page opens with one card instead of three. The invitation to
  connect, the link explaining how delegated staking works, and the protocol
  limits were saying overlapping things in three places.

- The sidebar links to the ARIO market on Raydium in place of the bridge, which
  is being retired along with the token it bridged.

### Fixed

- Switching Rewards by Epoch to dollars converted the chart but not its hover
  labels, which still said ARIO — so it showed dollar amounts under a token
  label.

- The page scrollbar sat hard against the cards with no gap. It now sits at the
  edge of the window, where it belongs.

- The balance distribution chart drew every slice in the same near-invisible
  pink, brightening only the one under the cursor — so the colours said where
  your mouse was rather than which holder was which. Each slice now takes its
  own shade, darkening as the holdings get smaller.

- Every page showed a horizontal scrollbar it never needed. The scrolling area
  was set to scroll in both directions, so the bar was drawn whether or not
  anything was wider than the screen.

- Table headers no longer hid their own controls on a phone. The search box was
  wider than the screen, which pushed it and the page controls off the edge of
  the card where they could only be reached by scrolling a bar that gave no sign
  it scrolled.

- The link to swap for ARIO wrapped onto two lines in the sidebar.

- The page buttons under every table had no background and no hover response.

- Sorting the staking table by performance, yield or reward share put every row
  with no data first, which is the opposite of what sorting ascending is for.

- The staking rewards card is no longer disabled. It read a source that was never
  populated, so it reported zero for every wallet — it now reads the published
  rewards and has been rebuilt around them.

## [2.9.0] - 2026-08-25

### Added

- Network-wide lists — gateways, balances, vaults and delegations — are now read
  from a published snapshot instead of being rebuilt in every visitor's browser.
  Those four reads scanned the entire network on each load, so the cost grew with
  the site's popularity.

  A consequence worth knowing: those four lists can be up to about ten minutes
  old. Anything the snapshot cannot answer — or that is stale, or published for a
  different network — falls back to reading the network directly, so the app
  behaves exactly as before whenever the service is unavailable. Your own
  balances, delegations and withdrawals are always read live.

- Past epochs now show their observations again. The records live on-chain only
  until an epoch pays out, after which they are deleted, so older epochs had
  nothing to show.

  A consequence worth knowing: for a past epoch we can show how many gateways
  each observer passed, but not which ones. Those results are recorded against a
  list of gateways whose order is not published, and matching them against
  today's list would name the wrong gateways. The gateway page says "Unknown"
  for those epochs rather than showing a pass it cannot stand behind.

- The dashboard has three new panels: which release versions gateways are
  running, where they are hosted, and which countries they are in.

- A gateway's page now shows the network, hosting provider and location it
  resolves to, and how many other gateways share that infrastructure.

- The observers table now shows what share of gateways each observer passed, and
  how often it submitted the same report as another observer. Below it, the
  correlations the analyzer detected for that epoch are listed with the reason
  for each. These describe what the data shows; the analyzer reports its own
  scoring as uncalibrated, so treat them as leads rather than conclusions.

- Settings has a Network Services URL, with presets for the published endpoints,
  a field for your own, and an option to turn it off entirely — in which case
  everything is read directly from the network, as before.

### Changed

- The observers table no longer scrolls sideways on a normal screen. The gateway
  and observer address columns are hidden by default; both are still available
  from the column selector, and clicking a row opens the gateway, which shows
  them in full.

### Fixed

- The reports page listed nothing. It asked the chain for records that had
  already been deleted, and separately, its request for each report's size and
  version could never succeed against the configured index — which is why those
  columns were always empty. Reports with no size or version now show a dash
  rather than a zero and a 1969 date.

- Sorting the gateways table by streak ranked only passing runs, so sorting
  ascending — what you do to find the worst-performing gateways — grouped every
  failing gateway together with no relation to how badly it was failing.

- A gateway's epoch card announced a green "Passed" before its results had
  loaded, and again for past epochs where the result is not knowable.

- A gateway's ASN was shown with a doubled prefix, as ASAS214996, and repeated
  the provider name already displayed beside it.

## [2.8.0] - 2026-08-24

### Changed

- The dashboard downloads about half as much data when you come back to it. The
  Network Statistics panel — total addresses, unique delegates, total vaults —
  used to read every balance, every delegation and every vault on the network
  each time the page loaded, purely to count them. Those three counts are now
  remembered in your browser for an hour.

  A consequence worth knowing: those three numbers can be up to an hour old.
  Nothing else on the dashboard is cached this way, and no balance, stake or
  reward figure is affected.

- Releases now reach you within about five minutes of being published, instead
  of up to an hour. The record that points at the app carried a one-hour cache,
  so a release could be live and still unreachable for that long — which is what
  happened with the 2.6.0 connection fix.

## [2.7.0] - 2026-08-24

### Changed

- Sorting the gateway, staking and balances tables is now instant. Changing a
  column previously refetched the entire dataset from the network before
  reordering it; the data is already in the browser, so it is now reordered
  there. A consequence worth knowing: sorting no longer refreshes the numbers,
  so a sort shows the data as of the last load. Your own staking and withdrawal
  actions still refresh everything immediately.

### Fixed

- The gateway and staking tables could keep showing pre-transaction figures for
  up to an hour after staking, unstaking or redelegating. They now refresh along
  with everything else.

### Removed

- Background fetching of table data nobody had asked for. The Balances page
  speculatively downloaded the full dataset for sort orders the visitor had not
  selected.

## [2.6.1] - 2026-08-23

### Changed

- Release notes rewritten. Earlier entries described internal implementation detail;
  they now describe what actually changed for you. No functional changes in this
  release.

## [2.6.0] - 2026-08-23

### Fixed

- The portal could overwhelm the network when an endpoint became slow or unreachable.
  Instead of easing off it kept firing requests at full rate, and quietly diverted them
  to a shared public endpoint — which made a bad connection worse rather than better.
  Requests are now paced properly, and the portal no longer falls back to a public
  endpoint on its own.
- Moving between pages quickly could make a healthy endpoint look unhealthy and send
  traffic somewhere else unnecessarily.

### Changed

- Failed requests are retried far less aggressively. A single failing request could
  previously be attempted up to twelve times, which slowed recovery instead of helping.
- The dashboard loads with fewer network requests, so it comes up faster — most
  noticeably on a busy or rate-limited endpoint.
- You can now point the portal at a second, backup endpoint if you have one. Without
  one, a failure surfaces as an error and you can switch endpoints in Settings rather
  than being silently moved onto a shared public one.

## [2.5.0] - 2026-08-19

### Removed

- Third-party error reporting. The portal no longer loads an error-tracking SDK or
  sends any data about your session to an external service.

### Changed

- Much smaller download. The published build dropped from roughly 18 MB to under
  5 MB, so the portal loads faster — noticeably so over a gateway or a slow
  connection.

## [2.4.1] - 2026-08-18

### Fixed

- The portal failing to load network data, showing "401 Unauthorized", for anyone
  who had used it before. Saved settings kept a network endpoint that was no longer
  valid, and nothing replaced it when a new one shipped. Stored network settings now
  update automatically when the app ships a new default, so clearing browser storage
  is no longer necessary.

## [2.4.0] - 2026-08-17

### Fixed

- Claiming rewards no longer stops at the first failure. Each withdrawal and vault
  release is its own transaction, so one failing no longer strands the others.
  Declining a signature now ends the run instead of prompting again for every
  remaining item, and the summary reflects what actually processed rather than the
  full claimable amount.
- Custom RPC endpoints configured for local development were silently ignored.

### Changed

- Network endpoints are configured per deployment rather than built into the source.
  A production release now refuses to publish if they are missing, so it can no longer
  ship a build that quietly falls back to a public, rate-limited endpoint.

### Security

- Network provider credentials are no longer kept in the repository. Note that any
  endpoint the portal talks to is visible to anyone running the app — these
  endpoints are protected by access controls at the provider rather than by being
  secret. You can always point the portal at your own endpoint in Settings.

## [2.3.2] - 2026-08-10

### Fixed

- Observer Performance chart showing 0 observations for all past epochs. Observation PDAs are deleted once an epoch distributes (rent refund), so counting them always returned 0. Now reads the durable \`observationsSubmitted\` counter from the Epoch account instead.
- Epochs without an observation counter (SDK fallback path) are omitted from the chart rather than rendered as 0.

## [2.3.1] - 2026-07-29

### Fixed

- Vault release and withdrawal claim failing with \`SyntaxError: Cannot convert <address> to a BigInt\`. Bumped \`@ar.io/sdk\` to \`4.1.0-alpha.2\` so \`getVaults\`/\`getWithdrawals\` return the numeric per-owner vault id (ar-io/ar-io-sdk#692) instead of the base58 vault PDA that \`releaseVault\`/\`claimWithdrawal\` rejected when deriving the on-chain PDA via \`BigInt()\`.

### Added

- Per-vault Release action and modal on the Balances page for unlocked (expired) vaults.

## [2.2.1] - 2026-06-18

### Added

- Total Epoch Emissions bar chart on Dashboard (rewards budget per epoch)
- Gateways in Network panel on Dashboard with epoch trend chart

### Changed

- Simplify GatewaysInNetworkPanel (self-contained, hardcoded 7-epoch limit)
- Update reference gateway FQDN to turbo-gateway.com


## [2.2.0] - 2026-06-17

### Added

- Live epoch observation data on Observers page (report status, failed gateways)
- Prescribed ArNS names bar on Observers page
- Observer Performance panel on Dashboard with proper chart layout
- Gateway detection via /ar-io/info for relative Arweave data URLs

### Fixed

- Replace arweave.net with turbo-gateway.com for data fetching and goldsky for GraphQL
- Fix observer address keying in Banner (use observerAddress, not gatewayAddress)
- Fix failed gateways column showing "Pending" for 0 failures (nullish coalescing)
- Work around SDK base58 memcmp browser bug with direct base64 RPC calls
- Replace ~55 RPC call getCurrentEpoch with lightweight 2-call fetch
- Remove all auto-polling intervals (slot, balances, observations)
- Remove Solana slot display from header
- Pin @ar.io/sdk to 4.0.2-alpha.9

### Changed

- Reduce staleTime on epoch/gateway/observer hooks from 1h to 5m
- ObserversTable reads prescribedObservers from epoch data directly (eliminates ~55 redundant RPC calls)
- SnitchRow and Dashboard panel use live useObservations hook instead of stale epoch object

## [2.1.0] - 2026-06-16

### Added

- Solana gas price views

## [2.0.0-solana.0] - 2026-05-13

### Added

- Initial Solana migration with wallet adapter support and a new wallet bridge flow
- Dynamic wallet type detection for supported Solana wallets
- Devnet-first configuration for the migration branch

### Changed

- Reworked app initialization, global state, settings, and routing to support the Solana wallet stack
- Updated network, balance, gateway, and modal flows for Solana-specific behavior
- Bumped \`@ar.io/sdk\` to \`4.0.0-solana.14\`
- Updated versioning and test expectations for the migration branch

### Fixed

- Hardened modal validation and wallet write-state handling
- Corrected vault balance filtering and total balance tallying
- Fixed reward calculations used on gateway operator stake views

### Removed

- Legacy wallet provider and connectors that were replaced by the Solana wallet bridge
- Arweave-specific transaction and address utilities no longer used in the Solana migration

## [1.24.4] - 2026-05-06

### Changed

- Updated Solana migration snapshot date from May 15 to June 1, 2026

## [1.24.3] - 2026-04-27

### Added

- Site-wide Solana migration announcement banner with Learn More link
- Banner auto-hides after May 15, 2026 snapshot date

### Fixed

- Mobile hamburger menu positioning now adapts to banner height dynamically
- Content area overflow when multiple banners are displayed

## [1.24.2] - 2026-01-23

### Changed

- Updated app logo to ar.io wordmark in expanded sidebar
- Updated favicon to new circular ar.io icon
- Updated collapsed sidebar to display larger ar.io logo

## [1.24.1] - 2026-01-13

### Added

- Search functionality to Gateway Assessments table on Report page

### Fixed

- Consistent padding on Report page

## [1.24.0] - 2026-01-09

### Added

- Interactive staking rewards visualization with epoch-based chart and selector
- Percentage change badges for ArNS Stats and Observer Performance panels
- New \`useRewardsForAddress\` hook for efficient rewards data fetching with React Query caching
- Dynamic rewards display showing individual epoch rewards on hover vs. total earned by default
- Epoch range selector (1 week, 1 month, 3 months, 6 months) for rewards tracking

### Enhanced

- Staking page now displays larger, more prominent balance values in redesigned cards
- Enhanced \`Streak\` component to handle 0% changes with green styling and up arrow
- Rewards chart excludes current epoch data since rewards are only distributed when epochs complete
- Chart scaling improvements with minimum Y-axis value of 1 for better visualization
- Loading states with placeholder skeletons instead of misleading zero values

### Changed

- Staking rewards card now shows cumulative rewards by default with individual epoch details on hover
- Percentage change calculations now contextually switch between total vs. individual epoch comparisons
- Chart axes are hidden for cleaner appearance while maintaining proper data scaling
- Rewards data rounded to one decimal place for improved chart readability

## [1.23.3] - 2026-01-09

### Enhanced

- Added interactive hover functionality to dashboard charts with epoch information display
- Added pink circle highlights on chart hover for ArNS Stats and Observer Performance panels
- Unified chart styling across all dashboard panels with consistent pink color scheme and opacity
- Enhanced Observer Performance panel to display epoch-specific observations count on hover

### Changed

- Aligned chart fill colors and gradients across ArNS Stats, Observer Performance, and Gateways panels

## [1.23.2] - 2026-01-08

### Changed

- Use grid layout for dashboard panels for improved responsiveness and consistent spacing

## [1.23.1] - 2026-01-07

### Fixed

- Consistent padding on all pages

## [1.23.0] - 2026-01-07

### Changed

- Updated ArNS Stats Panel: renamed header to "ArNS Names", moved count to left, added demand factor display on right
- Fixed ArNS Stats chart Y-axis domain to properly show data variation
- Bumped \`@ar.io/sdk\` to \`3.23.0-alpha.3\`

## [1.22.4] - 2026-01-07

### Fixed

- Use client-side sorting on \`GatewaysTable\` when sorting by \`totalStake\`
- Fix \`My Gateway\` overlay on Gateways page

## [1.22.3] - 2025-12-28

### Changed

- Improved responsive padding and overflow handling across all pages
- Added consistent horizontal padding (px-4 on mobile, px-6 on desktop)
- Fixed overflow issues with proper scrollbar styling
- Added overflow-x-auto to table headers for better mobile experience
- Simplified layout structure by removing redundant wrapper divs

## [1.22.2] - 2025-12-19

### Fixed

- Fixed inconsistent padding on page headers
- Updated \`@ar.io/sdk\` to \`3.22.2\` to fix historical ArNS stats chart

## [1.22.1] - 2025-12-18

### Added

- Added Bridge link in sidebar navigation that links to swap.ar.io

### Fixed

- Fixed Explorer link in sidebar navigation to correctly link to scan.ar.io/#/entity/ instead of scan.ar.io/entity/
- Fixed height of Observer Performance panel chart to prevent layout shift on data load

## [1.22.0] - 2025-12-17

### Added

- Added new CTASection component with Join Network, Delegate to Gateways, and Transfer ARIO call-to-action cards
- Added EpochSelector component with time-based options (Last 1 Week, Last 2 Weeks, Last 1 Month, Last 3 Months, Last 6 Months)
- Added dynamic epoch fetching hooks (useEpochsWithCount, useGatewaysPerEpochWithCount) that fetch the requested number of historical epochs
- Added epoch selection controls to Gateways in Network and Rewards Distribution panels with synchronized state
- Added edge-to-edge background charts to Observer Performance and ArNS Stats panels
- Added historical data hooks (useObserversWithCount, useArNSStatsWithCount) for dashboard charts

### Changed

- Enhanced Dashboard layout with CTA section at the top and reorganized existing panels
- Updated Gateways in Network and Rewards Distribution panels to support dynamic epoch count selection
- Fixed ARIO Token Distribution chart sizing issues that occurred on hover
- Moved Network Statistics panel above IO Token Distribution panel in left column
- Changed default epoch display from 7 to 30 epochs (1 month)

### Fixed

- Resolved chart container width conflicts in IOTokenDistributionPanel that caused layout shifts on hover
- Fixed epoch data fetching to actually retrieve historical data instead of being limited to hardcoded 13 epochs

## [1.21.1] - 2025-12-17

### Added

- Added Explorer link in sidebar navigation that links to scan.ar.io

### Changed

- Updated "Join X gateways" text to show dynamic total gateway count instead of hardcoded value
- Changed Network Statistics header from gradient to gray text
- Removed "Key metrics for the network" subtitle from Network Statistics panel
- Added info icons with tooltips next to Network Statistics labels instead of tooltips on values
- Updated Tooltip component to support positioning (side prop)
- Updated Process link to dynamically use ARIO_PROCESS_ID

### Fixed

- Confirmed Start a Gateway card scrolls naturally without fixed positioning

## [1.21.0] - 2025-12-15

### Added

- Enhanced Balances page with comprehensive token distribution visualization
- Added pagination and search functionality to all tables
- Added subtle purple gradient hover effect to clickable table rows

### Changed

- Updated Network Stats panel metrics
- Made balances panels equal size and responsive
- Moved % of Supply column to last position in balances table
- Updated EAY calculation

### Fixed

- Fixed mobile sidebar not closing when navigating to new page
- Fixed table header alignment and naming
- Fixed total joined gateways count using contract value
- Fixed AR.IO Scan URLs to use /entity/ instead of /wallet/
- Fixed transaction history display for Ethereum users

## [1.20.0] - 2025-12-09

### Added

- Added styled scrollbars across all pages for consistent appearance

### Changed

- Replaced ao.link transaction explorer links with AR.IO Scan (scan.ar.io)
- Added cross-env for Windows development compatibility

### Fixed

- Fixed missing scrollbars on Balances, Dashboard, Gateways, Staking, and Observers pages
- Fixed BalancesForAddress page layout to match standard page structure

## [1.19.1] - 2025-11-13

### Fixed

- Gateway Assessments Table: Show separate row for each expected wallet when multiple wallets use the same observed host

## [1.19.0] - 2025-10-28

### Added

- X-402 pricing information display on individual gateway pages

## [1.18.0] - 2025-10-27

### Added

- Improved table loading states with skeleton rows for better user experience

### Changed

- Extended cache times from 5 minutes to 1 hour for better performance
- Optimized data processing in Gateways, Staking, and Observers tables

### Fixed

- Eliminated "no data found" flash when switching between tabs
- Fixed table loading states to maintain skeleton rows during data processing
- Improved consistent loading behavior across all tables

## [1.17.1] - 2025-10-17

### Fixed

- Fix epoch data retrieval

## [1.17.0] - 2025-10-08

### Added

- Reports: Added Offset Assessments column with pass/fail/skip status, and show offset assement results in observation details

## [1.16.1] - 2025-09-25

### Fixed

- Fix observer balance warning using incorrect value for Turbo credits

## [1.16.0] - 2025-09-03

### Added

- Added column selectors for tables

## [1.15.0] - 2025-08-27

### Changed

- Initial support for mobile view

## [1.14.1] - 2025-07-16

### Fixed

- Fix loading extension marketplace from ArNS URL

## [1.14.0] - 2025-07-11

### Added

- New Extension Marketplace page allowing users to browse, search, and filter gateway extensions with detailed information pages.

## [1.13.1] - 2025-06-25

### Fixed

- Optimize loading of primary names for wallets that do not have a primary name set

## [1.13.0] - 2025-06-18

### Added

- Added low balance check for observer wallet addresses
- Added "Observer" badge next to gateway name when selected as observer in current epoch
- Added Streak display to gateway page

### Changed

- Updated redelegation confirmation to require typing "CONFIRM"

### Fixed

- Fixed logout button styling to prevent visual bleed
- Fixed issue handling arweaveWalletLoaded event triggering continously after page load

## [1.12.1] - 2025-05-28

### Fixed

- Fix stakes dropdown to allow for access to redelegation workflow

## [1.12.0] - 2025-05-19

### Added

- Added Beacon Wallet Support (credit to Vela Ventures)

## [1.11.9] - 2025-05-15

### Changed

- Observations: Updated gateway reference host to ar-io.net

## [1.11.8] - 2025-04-24

## Added

- Balances: Added Revoke Vault button to revoke vaults when viewing balances for another address and user is the controller

## [1.11.7] - 2025-04-08

## Added

- Gateway: Shows passed/failed for epoch in Reported On By card
- Observers: Tooltip added to Observer Performance column to show observed and prescribed counts

## [1.11.6] - 2025-03-28

## Changed

- Improved error handling when loading historical epoch data

## [1.11.5] - 2025-03-25

### Fixed

- Disable delegate stake button for gateways operated by logged-in user and direct them to use operator staking.

## [1.11.4] - 2025-03-20

### Updated

- Gateway Details page: show actual number of observers per epoch in "Failed by x/y Observers" card

## [1.11.3] - 2025-03-20

### Added

- Added an error notification when app is unable to retrieve epoch data for an epoch index
- Added fallback retrieval method for epochs when Epoch-Distribution-Notice is not available

### Updated

- Set default graphql endpoint to arweave.net

## [1.11.2] - 2025-03-19

### Changed

- Always show transfer button in Profile menu

## [1.11.1] - 2025-03-12

### Fixed

- Fixed display of controller for vaults in Balances page

## [1.11.0] - 2025-03-06

### Added

- New Balances page for viewing breakdown of ARIO balances and vaulted funds

### Changed

- Update to read min operator stake and max reward share ratio values from process
- Update GQL endpoint to use Goldsky
- Dashboard: Modified from "Rewards Claimed" to "Rewards Distributed" to more accurately represent
  the system
- Dashboard: ArNS Stats panel: Replaced Active Names with Names Purchased in tooltip

### Fixed

- Read error that caused page crash in Dashboard when switching processes in settings
- Fixed handling account switching with Wander
- Fix display of total stake as ARIO instead of mARIO on gateway selector for redelegation

## [1.10.3] - 2025-02-25

### Changed

- Updated to ar.io SDK 3.8.2-alpha.1 for improved retry logic on AO interactions
- Made info icon red on redelegation modal to make it more noticeable for users

## [1.10.2] - 2025-02-20

### Changed

- Updated fee message on Redelegation modal

## [1.10.1] - 2025-02-20

### Changed

- Updated to ar.io SDK 3.8.0

### Fixed

- Allow editing ArNS names for observations when prescribed names are unavailable

## [1.10.0] - 2025-02-20

### Updated

- Application configured for mainnet process
- Modified to handle pre-epoch-zero state

## [1.9.5] - 2025-02-14

### Fixed

- Adjusted rewards calculation to work with new scheme where rewards were unavailable on current epoch

## [1.9.4] - 2025-02-13

### Fixed

- Fixed profile menu errant display of 0 when ARIO balance is 0

## [1.9.3] - 2025-02-13

### Changed

- Added support for account switching with Metamask

### Fixed

- Observer page banner performance field fixed to use updated field from process

## [1.9.2] - 2025-02-12

### Updated

- Revised observations to use ky library and use 5000ms timeout to better match with gateway observer scheme

### Fixed

- Added better error handling for observations

## [1.9.1] - 2025-02-10

### Fixed

- Updated to latest ar.io SDK and updated Dashboard to fix refresh issues when
  switching AR.IO Process in Settings

## [1.9.0] - 2025-02-07

### Added

- Added support for Metamask Wallet
- Added support for sending ARIO using "Transfer ARIO" modal, accessible from Profile menu
- Added Info icon to ArNS Stats panel with tooltip to view additional ArNS stats

### Changed

- Updated wallet name from ArConnect to Wander to reflect new branding
- Minor optimizations for queries

## [1.8.3] - 2025-02-03

### Changed

- Minor fix for property name change.

## [1.8.2] - 2025-02-03

### Changed

- Updated to latest ar.io SDK to support changes in property names for data returned by the network

## [1.8.1] - 2025-01-29

### Fixed

- Clear congestion banner when network returns to normal

## [1.8.0] - 2025-01-28

### Added

- Show ArNS ANT Logo in profile if user is using primary name
- Applications Settings: use new sidebar Settings option to open modal to
  configure ARIO Process ID and AO CU URL
- Added copy button for domain name columns in tables
- Show Delegate EAY for gateways in Active Stakes table

### Changed

- Signing with ArConnect now uses signDataItem API, providing a more informed signing experience.

### Fixed

- Fixed height sizing issue of view port when network congestion banner is shown

## [1.7.0] - 2024-12-20

### Added

- Redelegate Stake: Users can now redelegate stake and pending withdrawals between gateways. Includes moving to/from operator stake and delegated stake.
  Redelegation fees are assessed at 10% per redelegation performed since the last fee reset, up to 60%. Fees are reset when no redelegations are performed in the last 7 days.

### Changed

- Leave Network: text updated to 90-days for vaulted funds
- Staking: Staking and Withdrawal are now separate modals that are initiated from unique popup menu options

### Fixed

- Gateway Details: Restored "Leave" (when viewing own gateway) and "Stake" (when viewing other gateways) buttons

## [1.6.0] - 2024-12-10

### Added

- Gateway Details
  - Added Operator Stake card showing operator stake and EAY, as well as manage stake button for updating operator stake.
  - Added collapsible Pending Withdrawals card for viewing current withdrawals as well as managing
    them (canceling a withdrawal or initiating an expedited withdrawal). Visible only to the gateway operator.
  - Added collapsible Active Delegates card showing the list of active delegates for the gateway.

## [1.5.0] - 2024-12-04

### Added

- Profile button shows user's ArNS Primary Name (if available) or wallet address when logged in
- Download buttons added to Reports page and individual Report page
- Observers: Added epoch selector to view prescribed observers for previous epochs
- Gateway Details Page
  - Reported On By card: text links to gateway for observer, report button links to report
  - Reported On card: Report button shows in header that links to that report's page

### Updated

- Staking and Withdrawal modals updated to show Review page for user to confirm operation before processing
- Withdrawal Modal: Added option for Standard and Expedited Withdrawal
- Modal dialog styles refreshed
- Reward Share Ratio capped to 95% when joining network and updating gateway settings

## [1.4.3] - 2024-11-27

### Updated

- Settings updated for staking:
  - Staking withdrawals are now 90 days
  - Gateway Operator Stake minimum is now 10,000 IO
  - Minimum Delegated Staking amount for gateway configuration is now 10 IO

## [1.4.2] - 2024-11-20

### Updated

- Show error message toast if the application is unable to retrieve the current epoch

## [1.4.1] - 2024-11-18

### Updated

- Optimized loading of user stakes and pending withdrawals.

### Fixed

- Gateways count in site header should only count active gateways.

## [1.4.0] - 2024-11-14

### Added

- View Pending Withdrawals on Staking page and support cancelling pending withdrawals as well as performing expedited withdrawals
- View Changelog in app by clicking version number in sidebar

### Updated

- Staking page top cards now show balance, amount staking + pending withdrawals, and rewards earned last 14 epochs and last epoch

### Changed

- Updated header style of cards
- Observations: Updated to use arweave.net for reference domain when generating observation report
- Observe: Default to using prescribed names

## [1.3.0] - 2024-10-21

### Added

- New Dashboard home page that visualizes data for the state of the gateway network

## [1.2.0] - 2024-10-17

### Added

- “Reported On” and “Reported On By” cards on Gateway Details page for viewing observation status by epoch for a gateway
- “Software” card on gateway details page that shows gateway software version and available bundlers (if gateway has listed them)

### Changed

- Updated Gateway Details page for leaving gateways to hide non-relevant cards and show leave date

## [1.1.0] - 2024-10-08

### Added

- Gateways > Reports: Add “AR.IOEpoch #” Column
- Gateways>Reports>Individual Reports
  - Add Epoch #
  - Remove Epoch start height
- Implemented Leave Network Flow:
  - Adds button to Gateway Detail page to leave network when gateway shown is the user’s own gateway
  - Hitting Leave shows a modal with information. User has to type “LEAVE NETWORK” before Leave Network button is enabled.
  - Hitting Leave Network button initiates signature request and then a success message.
  - Site is refreshed after leaving.
- Release version shown on sidebar

### Changed

- Gateway Details: rename “Reward Ratios” to “Performance Ratios”
- Gateway Details: Fixes text bubble cut off when copying wallet address

### Fixed

- Gateway Details: Remove Edit and Stake Buttons from gateways that are leaving

## [1.0.0]

- Initial versions of application; version was bumped to 1.1.0 for first public versioned release.
`,Br=new Intl.NumberFormat("en-US",{maximumFractionDigits:1}),qt=e=>`${e.slice(0,4)}...${e.slice(e.length-4,e.length)}`,Xe=e=>Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2,compactDisplay:"short"}).format(e),O=e=>Br.format(e),Gr=new Intl.NumberFormat("en-US",{maximumFractionDigits:6}),be=e=>Gr.format(e),ve=e=>(e/1e9).toLocaleString("en-US",{minimumFractionDigits:5,maximumFractionDigits:5}),Ll=e=>`${(e*100).toFixed(2)}%`,Wt=e=>`${e.slice(0,7)}...${e.slice(e.length-7,e.length)}`,zr=(e,n=20)=>e.length<n?e:e.slice(0,n)+"...";function Kt(e){const n=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${n}-${a}-${s}`}function _l(e){const n=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");let r=e.getHours();const o=String(e.getMinutes()).padStart(2,"0"),i=String(e.getSeconds()).padStart(2,"0"),d=r>=12?"PM":"AM";return r=r%12,r=r||12,`${n}-${a}-${s}, ${r}:${o}:${i} ${d}`}const qr=e=>e.replace(/\+/g,"-").replace(/\//g,"_").replace(/=*$/g,""),Pl=e=>{const n=Ua(e);return qr(n)},Wr=e=>!(!e||!Ls.test(e)),$e=Vn,Ht=e=>`${wt}/address/${e}`,na=e=>`${wt}/tx/${e}`,ot=e=>{try{const n=new URL(e);return n.protocol==="http:"||n.protocol==="https:"}catch{return!1}},Kr=e=>{const n=e.trim();return n===""||ot(n)},Yt=e=>{const n=e.trim();return n===""||$e(n)},Zt=e=>$e(e.trim()),Qt=e=>e.trim().length>0,Je=[{key:"solanaCoreProgramId",label:"Solana Core Program ID",defaultValue:ft??"",validation:"solanaOptional"},{key:"solanaGarProgramId",label:"Solana GAR Program ID",defaultValue:xt??"",validation:"solanaOptional"},{key:"solanaArnsProgramId",label:"Solana ARNS Program ID",defaultValue:bt??"",validation:"solanaOptional"},{key:"solanaAntProgramId",label:"Solana ANT Program ID",defaultValue:vt??"",validation:"solanaOptional"},{key:"bridgeBalanceAddress",label:"Bridge Balance Address",defaultValue:ue,validation:"textRequired"}],Hr=()=>({solanaCoreProgramId:ft??"",solanaGarProgramId:xt??"",solanaArnsProgramId:bt??"",solanaAntProgramId:vt??"",bridgeBalanceAddress:ue}),Yr=()=>({solanaCoreProgramId:Mn,solanaGarProgramId:Dn,solanaArnsProgramId:Fn,solanaAntProgramId:$n,bridgeBalanceAddress:ue}),aa=e=>{const n=a=>{const s=a.toLowerCase();return s.includes("localhost")||s.includes("127.0.0.1")?"localnet":s.includes("devnet")?"devnet":s.includes("testnet")?"testnet":"mainnet"};try{const a=new URL(e);return n(`${a.hostname}${a.pathname}`)}catch{return n(e)}},Zr=e=>aa(e)==="mainnet"?Yr():Hr(),Qr=({onClose:e})=>{const n=me(),a=I(S=>S.solanaRpcUrl),s=I(S=>S.portalApiUrl),r=I(S=>S.arweaveGqlUrl),o=I(S=>S.solanaCoreProgramId),i=I(S=>S.solanaGarProgramId),d=I(S=>S.solanaArnsProgramId),c=I(S=>S.solanaAntProgramId),h=I(S=>S.bridgeBalanceAddress),[u,m]=l.useState(a),[p,g]=l.useState(s),[w,j]=l.useState(r),[y,k]=l.useState({solanaCoreProgramId:o,solanaGarProgramId:i,solanaArnsProgramId:d,solanaAntProgramId:c,bridgeBalanceAddress:h}),v={solanaCoreProgramId:o,solanaGarProgramId:i,solanaArnsProgramId:d,solanaAntProgramId:c,bridgeBalanceAddress:h},f=Je.some(({key:S})=>y[S]!==v[S]),b=Je.some(({key:S,validation:F})=>{const V=y[S];return F==="solanaRequired"?!Zt(V):F==="textRequired"?!Qt(V):!Yt(V)}),E=aa(a),A=s.trim(),C=A.length===0?"off":A===Ke?"mainnet":A===He?"devnet":"custom",T={off:"Off — reading from RPC",mainnet:"Mainnet",devnet:"Devnet",custom:"Custom"},D=S=>{const F=S==="mainnet"?tt:Ne,V=Zr(F),_=s.trim().length===0?s:S==="mainnet"?Ke:He;le({solanaRpcUrl:F,portalApiUrl:_,...V}),m(F),g(_),k(V)},L=S=>{le({portalApiUrl:S}),g(S),n.invalidateQueries()};return t.jsx(ae,{onClose:e,useDefaultPadding:!1,children:t.jsx("div",{className:"h-[42rem] w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]",children:t.jsxs("div",{className:"flex h-full w-full flex-col px-8 pb-4 pt-6",children:[t.jsx("div",{className:"text-lg text-high",children:"Settings"}),t.jsxs("div",{className:"mt-4 flex grow flex-col gap-6 overflow-y-auto pr-1 text-sm text-mid scrollbar",children:[t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsxs("div",{className:"flex items-center",children:[t.jsx("div",{className:"grow",children:"Network"}),t.jsxs("div",{className:"text-xs text-low",children:["Active:"," ",E==="mainnet"?"Mainnet":"Devnet"]})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{D("mainnet")},disabled:E==="mainnet",children:"Switch to Mainnet"}),t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{D("devnet")},disabled:E==="devnet",children:"Switch to Devnet"})]})]}),t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx("div",{className:"flex items-center",children:t.jsx("div",{className:"grow",children:"Solana RPC URL"})}),t.jsx("div",{className:"flex items-center",children:t.jsx("input",{className:"w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none",value:u,onChange:S=>{m(S.target.value)}})}),t.jsx("div",{className:"flex justify-end",children:t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{le({solanaRpcUrl:u})},disabled:u===a||!ot(u),children:"Save"})})]}),t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsxs("div",{className:"flex items-center",children:[t.jsx("div",{className:"grow",children:"Network Services URL"}),t.jsxs("div",{className:"text-xs text-low",children:["Active: ",T[C]]})]}),t.jsx("div",{className:"text-xs text-low",children:"Serves gateways, balances and other network-wide data as published snapshots. When off, or whenever it is unreachable or stale, these are read directly from RPC."}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{L(Ke)},disabled:C==="mainnet",children:"Mainnet"}),t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{L(He)},disabled:C==="devnet",children:"Devnet"}),t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{L("")},disabled:C==="off",children:"Turn Off"})]}),t.jsx("div",{className:"flex items-center",children:t.jsx("input",{className:"w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none",value:p,placeholder:"https://network.services.ar.io",onChange:S=>{g(S.target.value)}})}),t.jsx("div",{className:"flex justify-end",children:t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{L(p.trim())},disabled:p.trim()===A||!Kr(p),children:"Save"})})]}),t.jsxs("div",{className:"flex flex-col gap-3",children:[t.jsxs("div",{className:"flex items-center",children:[t.jsx("div",{className:"grow",children:"Solana Program/Token Addresses"}),t.jsx("button",{className:"rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0",onClick:()=>{D("mainnet")},children:"Reset to Defaults"})]}),Je.map(({key:S,label:F,defaultValue:V,validation:_})=>{const z=y[S],B=_==="solanaRequired"?Zt(z):_==="textRequired"?Qt(z):Yt(z);return t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("label",{className:"text-xs text-low",children:F}),t.jsx("input",{className:`w-full rounded border bg-containerL0 px-4 py-2 text-mid focus:outline-none ${B?"border-grey-500":"border-red-500"}`,placeholder:_==="solanaRequired"||_==="textRequired"?V:V||"Leave empty to use SDK default",value:z,onChange:re=>{k(R=>({...R,[S]:re.target.value}))}}),B?null:t.jsx("div",{className:"text-xs text-red-400",children:_==="textRequired"?"A value is required.":_==="solanaRequired"?"A valid Solana address is required.":"Must be a valid Solana address or left empty."})]},S)}),t.jsx("div",{className:"flex justify-end",children:t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{le(y)},disabled:!f||b,children:"Save"})})]}),t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsxs("div",{className:"flex items-center",children:[t.jsx("div",{className:"grow",children:"Arweave GQL URL"}),t.jsx("button",{className:"rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0",onClick:()=>{j(Un)},children:"Reset to Default"})]}),t.jsx("div",{className:"flex items-center",children:t.jsx("input",{className:"w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none",value:w,onChange:S=>{j(S.target.value)}})}),t.jsx("div",{className:"flex justify-end",children:t.jsx("button",{className:"rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low",onClick:()=>{le({arweaveGqlUrl:w})},disabled:w===r||!ot(w),children:"Save"})})]})]})]})})})},Xr=[{title:"Dashboard",icon:t.jsx(br,{className:"size-4"}),path:"/dashboard"},{title:"Gateways",icon:t.jsx(kr,{className:"size-4"}),path:"/gateways"},{title:"Staking",icon:t.jsx(Sr,{className:"size-4"}),path:"/staking"},{title:"Observers",icon:t.jsx(pr,{className:"size-4"}),path:"/observers"},{title:"Balances",icon:t.jsx(Ba,{className:"size-4"}),path:"/balances"},{title:"Extensions",icon:t.jsx(Ga,{className:"size-4"}),path:"/extensions"}],Jr=(()=>{const e=rt.indexOf("## [Unreleased]");if(e!==-1)return e+15;const n=rt.search(/^## \[/m);return n===-1?0:n})(),eo=rt.substring(Jr).trim().replace(/\[([\w.]+)\]/g,(e,n)=>`v${n}`),to=()=>{const e=Va(),n=vn(),a=I(k=>k.sidebarOpen),[s,r]=l.useState(!1),[o,i]=l.useState(!1),d=[{title:"Swap ARIO",icon:t.jsx(za,{className:"size-4"}),path:Es},{title:"Explorer",icon:t.jsx(qa,{className:"size-4"}),path:wt},{title:"Docs",icon:t.jsx(vr,{className:"size-4"}),path:Ns},{title:"Settings",icon:t.jsx(Wa,{className:"size-4"}),action:()=>{i(!0)}}],c=x(k=>k.isMobile),[h,u]=l.useState(!1),m=()=>{u(!h)},p=()=>{c&&u(!1)},g=!c,w=`fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col p-6
    dark:bg-grey-1000 dark:text-mid transition-transform duration-300 ease-in-out
    w-fit lg:max-w-48 border-r dark:border-transparent-100-8
    ${c&&!h?"-translate-x-full":"translate-x-0"}
    lg:translate-x-0`,j=c&&!h&&t.jsx("button",{onClick:m,onKeyDown:k=>k.key==="Enter"&&m(),className:"fixed left-4 top-4 z-50 rounded-md p-2 text-grey-100 focus:outline-none focus:ring-2 focus:ring-grey-100 lg:hidden","aria-label":h?"Close menu":"Open menu","aria-expanded":h,"aria-controls":"sidebar-navigation",children:!h&&t.jsx(Ka,{className:"size-6"})}),y=c&&h&&t.jsx("div",{className:"fixed inset-0 z-30 bg-grey-900/50 lg:hidden",onClick:p,onKeyDown:k=>k.key==="Escape"&&p(),role:"button",tabIndex:0,"aria-label":"Close menu"});return t.jsxs(t.Fragment,{children:[j,y,t.jsxs("aside",{className:w,id:"sidebar-navigation","aria-label":"Main navigation",children:[t.jsx("div",{className:"flex items-center pb-[3.25rem]",children:a||h?t.jsx(ur,{className:"h-9 w-auto"}):t.jsx(ea,{className:"h-12 w-auto"})}),t.jsx("div",{className:"dark:text-grey-100",children:Xr.map(({title:k,icon:v,path:f},b)=>t.jsx(Q,{className:"w-full",icon:v,title:k,text:a||h?k:void 0,active:e.pathname.startsWith(f),onClick:()=>{n(f),p()}},b))}),t.jsx("div",{className:"grow"}),t.jsx("hr",{className:"text-divider"}),t.jsx("div",{className:"py-3",children:d.map(({title:k,icon:v,path:f,action:b},E)=>{const A=()=>{b?b():window.open(f,"_blank"),p()};return t.jsx(Q,{className:"w-full",icon:v,rightIcon:b?t.jsx(t.Fragment,{}):t.jsx(Fe,{className:"size-3"}),title:f||k,text:a||h?k:void 0,onClick:A},E)})}),t.jsx("hr",{className:"text-divider"}),t.jsx("div",{className:"pt-6",children:t.jsxs("div",{className:a||h?"flex items-center justify-end":"flex items-center justify-center",children:[(a||h)&&t.jsxs("button",{className:"grow pl-3 text-left text-xs text-low/50",onClick:()=>{r(!0),p()},children:["v",_n,"-","4bcb2edf019a72d7cfd390c04210ee171d30b2bc".slice(0,6)]}),g&&t.jsx("button",{onClick:()=>le({sidebarOpen:!a}),className:"shrink-0","aria-label":a?"Collapse sidebar":"Expand sidebar",children:a?t.jsx(wr,{className:"size-5"}):t.jsx(Nr,{className:"size-5"})})]})}),s&&t.jsx(Vr,{onClose:()=>r(!1),title:"Changelog",markdownText:eo}),o&&t.jsx(Qr,{onClose:()=>i(!1)})]})]})};function no(){return t.jsxs("div",{className:"flex h-screen w-screen flex-col overflow-hidden dark:bg-grey-1000 dark:text-grey-100",children:[t.jsx(Ur,{}),t.jsxs("div",{className:"flex min-h-0 flex-1",children:[t.jsx(to,{}),t.jsx("main",{className:"min-h-0 flex-1 overflow-hidden lg:pl-0",children:t.jsx(Ha,{})})]}),t.jsx(Ya,{containerStyle:{position:"fixed",zIndex:99999},position:"bottom-right"})]})}const ao=()=>{const e=x(r=>r.currentEpoch),{data:n}=De(),[a,s]=l.useState();return l.useEffect(()=>{if(e||n){const r=()=>{const i=G(),c=G(new Date((e==null?void 0:e.endTimestamp)??(n==null?void 0:n.epochZeroStartTimestamp)??0)).diff(i,"seconds");if(c<=0)s("Awaiting...");else{const h=Math.floor(c/86400),u=Math.floor(c%86400/3600)%24,m=Math.floor(c%3600/60);s(`${h>0?`${h}d `:""}${u}h ${m}m`)}};r();const o=setInterval(r,1e3);return()=>clearInterval(o)}else s(void 0)},[e,n]),a},Ue=()=>{const e=I(r=>r.solanaCoreProgramId),n=I(r=>r.solanaGarProgramId),a=I(r=>r.solanaArnsProgramId),s=I(r=>r.solanaAntProgramId);return l.useMemo(()=>({core:e,gar:n,arns:a,ant:s}),[e,n,a,s])},so=45*60*1e3,sa="portal-document-writes",At=e=>{var a;let n="unknown";try{const s=(a=I.getState())==null?void 0:a.solanaRpcUrl;s&&(n=he(s))}catch{}return`${n}:${e}`},fe=new Map,ro=()=>{try{sessionStorage.setItem(sa,JSON.stringify(Object.fromEntries(fe)))}catch{}};try{const e=sessionStorage.getItem(sa);if(e)for(const[n,a]of Object.entries(JSON.parse(e)))Number.isFinite(a)&&fe.set(n,a)}catch{}const oo=(...e)=>{const n=Date.now();for(const a of e)fe.set(At(a),n);ro()},Re=e=>{const n=fe.get(At(e));if(n===void 0)return!1;const a=Date.now()-n;return Number.isFinite(a)&&a>=0&&a<=so},io=e=>Re(e)?fe.get(At(e)):void 0,Nt=(e,...n)=>{oo(...n);for(const s of n)e.invalidateQueries({queryKey:[s],refetchType:"active"});const a=new Set(n.flatMap(s=>lo[s]??[]));for(const s of a)e.invalidateQueries({queryKey:[s],refetchType:"active"})},lo={balances:["networkStats"],vaults:["networkStats"]},Ct=()=>{var n;const e=(n=I.getState())==null?void 0:n.portalApiUrl;return(typeof e=="string"?e:Pn).trim()},ra=30*60*1e3,oa=8e3;function ia(e,n){if(!e)return null;const a=["core","gar","arns","ant"];for(const s of a){const r=n[s],o=e[s];if(r&&o&&r!==o)return`${s} program is ${o} in the snapshot but ${r} here`}return null}const la=()=>Ct().length>0,he=e=>{const n=a=>{const s=a.toLowerCase();return s.includes("localhost")||s.includes("127.0.0.1")?"localnet":s.includes("devnet")?"devnet":s.includes("testnet")?"testnet":"mainnet"};try{const a=new URL(e);return n(`${a.hostname}${a.pathname}`)}catch{return n(e)}};async function da(e,n,a={}){const s=await ca(e,n,a);return(s==null?void 0:s.items)??null}async function ca(e,n,a={}){if(!la())return null;if(Re(e))return N.debug(`[portalApi] ${e}: recent write, reading live`),null;const s=`${Ct().replace(/\/+$/,"")}/api/v1/portal/${e}.json`;try{const r=await fetch(s,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(oa)});if(!r.ok)return N.debug(`[portalApi] ${e}: HTTP ${r.status}, falling back to RPC`),null;const o=await r.json();if(!Array.isArray(o.items))return N.warn(`[portalApi] ${e}: no items array, falling back to RPC`),null;if(o.network&&o.network!==n)return N.warn(`[portalApi] ${e}: snapshot is for ${o.network}, app is on ${n} — falling back to RPC`),null;const i=ia(o.programIds,a);if(i)return N.warn(`[portalApi] ${e}: ${i} — falling back to RPC`),null;const d=o.generatedAt?Date.now()-Date.parse(o.generatedAt):Number.NaN;return!Number.isFinite(d)||d>ra?(N.warn(`[portalApi] ${e}: snapshot is ${Math.round(d/6e4)}m old, falling back to RPC`),null):(N.debug(`[portalApi] ${e}: ${o.items.length} items from snapshot`),{items:o.items,generatedAt:o.generatedAt})}catch(r){return N.debug(`[portalApi] ${e}: unavailable (${r}), falling back to RPC`),null}}async function co(e,n,a,s={}){return await da(e,n,s)??await a()}async function it(e,n={}){if(!la())return null;const a=`${Ct().replace(/\/+$/,"")}/api/v1/portal/summary.json`;try{const s=await fetch(a,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(oa)});if(!s.ok)return N.debug(`[portalApi] summary: HTTP ${s.status}, falling back to RPC`),null;const r=await s.json();if(r.network&&r.network!==e)return N.warn(`[portalApi] summary: snapshot is for ${r.network}, app is on ${e} — falling back to RPC`),null;const o=ia(r.programIds,n);if(o)return N.warn(`[portalApi] summary: ${o} — falling back to RPC`),null;const i=r.generatedAt?Date.now()-Date.parse(r.generatedAt):Number.NaN;return!Number.isFinite(i)||i>ra?(N.warn(`[portalApi] summary: snapshot is ${Math.round(i/6e4)}m old, falling back to RPC`),null):r}catch(s){return N.debug(`[portalApi] summary: unavailable (${s}), falling back to RPC`),null}}const ho=e=>["gateways",e],uo=60*60*1e3,po=e=>{const n=x(r=>r.arIOReadSDK),a=x(r=>r.solanaRpcUrl),s=Ue();return M({queryKey:ho(a),queryFn:async()=>{if(!n)throw new Error("arIOReadSDK is not initialized");return co("gateways",he(a),async()=>[...(await n.getGateways({limit:Number.MAX_SAFE_INTEGER})).items],s)},...e?{select:e}:{},staleTime:uo,enabled:!!n,placeholderData:r=>r})},mo=()=>{const e=l.useCallback(n=>{const a={};for(const s of n)a[s.gatewayAddress]=s;return a},[]);return po(e)},go=e=>["tokenSupply",e],ha=e=>{const n=x(r=>r.arIOReadSDK),a=x(r=>r.solanaRpcUrl);return M({queryKey:go(a),queryFn:()=>{if(!n)throw new Error("arIOReadSDK not initialized");return n.getTokenSupply()},select:e,enabled:!!n,staleTime:60*60*1e3})},wo=()=>ha(e=>e.protocolBalance),P=({className:e})=>t.jsx("div",{className:`h-3.5 w-[6.25rem] animate-pulse space-y-3 rounded bg-transparent-100-16 ${e}`}),fo=1e9,Ve=e=>{const n=x(o=>o.arIOReadSDK),a=x(o=>o.rpc),s=x(o=>o.solanaRpcUrl);return M({queryKey:["balances",e,s],queryFn:async()=>{if(!e||!a||!n)throw new Error("Error: Wallet Address, rpc, or arIOReadSDK is not initialized");const[o,i]=await Promise.all([n.getBalance({address:e.toString()}),a.getBalance(K(e.toString())).send()]),d=Number(i.value)/fo,c=new $(o).toARIO().valueOf();return{sol:d,ario:c}},staleTime:5*60*1e3,enabled:!!e&&!!a&&!!n})},xo=e=>{const n=x(s=>s.arIOReadSDK),a=x(s=>s.solanaRpcUrl);return M({queryKey:["withdrawals",a,e],queryFn:async()=>{if(!e)throw new Error("Address is not set");return(await n.getWithdrawals({address:e,limit:Number.MAX_SAFE_INTEGER})).items},enabled:!!e&&!!n,staleTime:5*60*1e3})},bo=()=>{const e=x(s=>s.walletAddress),{data:n,isLoading:a}=xo(e==null?void 0:e.toString());return l.useMemo(()=>{const s=Date.now(),r=(n??[]).filter(i=>s>=i.endTimestamp),o=r.reduce((i,d)=>i+new $(d.balance).toARIO().valueOf(),0);return{count:r.length,total:o,isLoading:a}},[n,a])},vo=({primaryName:e})=>{const n=x(d=>d.arIOReadSDK),a=x(d=>d.rpc),s=x(d=>d.solanaRpcUrl),r=I(d=>d.solanaAntProgramId),o=J(r);return M({queryKey:["logo",e,s,o],queryFn:async()=>{if(!e||!n)throw new Error("Primary Name or ArIO Read SDK not available");const d=await n.getArNSRecord({name:e});if(!(d!=null&&d.processId))return;const h=await(await Za.init({processId:d.processId,rpc:a,...o?{antProgramId:K(o)}:{}})).getLogo(),u=hr(h);return new Promise((m,p)=>{const g=new Image;g.onload=()=>m(g),g.onerror=()=>p(new Error("Failed to load image")),g.src=u})},enabled:!!e&&!!n,staleTime:5*60*1e3})},yo=e=>{const n=x(o=>o.arIOReadSDK),a=x(o=>o.solanaRpcUrl),s=Ue();return M({queryKey:["primaryName",e,a],queryFn:async()=>{if(!e||!n)throw new Error("Wallet Address or SDK not available");const o=e.toString(),i=await da("primaryNames",he(a),s);if(i)return i.find(d=>d.owner===o)??null;try{return await n.getPrimaryName({address:o})}catch{return null}},enabled:!!e&&!!n,staleTime:5*60*1e3})},ko=({textToCopy:e})=>{const[n,a]=l.useState(!1),[s,r]=l.useState(),o=i=>{i.stopPropagation(),a(!0),navigator.clipboard.writeText(e),clearTimeout(s);const d=setTimeout(()=>{a(!1)},1e3);r(d)};return t.jsxs("div",{className:"relative",children:[t.jsxs("div",{className:`${n?"visible":"invisible"} absolute -left-7 -top-12 z-50 rounded-lg border border-grey-500 bg-containerL0 p-2`,children:["Copied!",t.jsx("div",{className:"absolute bottom-[-.3125rem] left-[1.875rem] size-2.5 rotate-45 border border-grey-500 bg-containerL0 [clip-path:polygon(0%_100%,100%_0,100%_100%)]"})]}),t.jsx("button",{onClick:o,children:n?t.jsx(xr,{className:"size-4 opacity-65"}):t.jsx(fr,{className:"size-4 opacity-65"})})]})},se=({message:e,children:n,useMaxWidth:a=!0,side:s="top"})=>{const[r,o]=l.useState(!1);return t.jsx(yn,{children:t.jsxs(kn,{delayDuration:0,open:r,onOpenChange:o,children:[t.jsx(jn,{asChild:!0,onPointerDown:i=>{i.pointerType!=="mouse"&&i.preventDefault()},onClick:()=>o(i=>!i),children:t.jsx("div",{children:n})}),t.jsx(An,{children:t.jsxs(Nn,{side:s,collisionPadding:16,onPointerDownOutside:()=>o(!1),className:`z-50 mb-1 w-fit ${a?"max-w-[min(25rem,var(--radix-tooltip-content-available-width,25rem))]":""} rounded-md border border-grey-500 bg-containerL0 px-6 py-3`,children:[t.jsx("div",{className:"text-sm text-low",children:e}),t.jsx(Cn,{className:"fill-grey-500"})]})})]})})},ua=({onClose:e})=>{const{setVisible:n,visible:a}=Qa(),{connected:s}=pt(),r=l.useRef(!1),o=l.useRef(!1),i=l.useRef(!1);return l.useEffect(()=>{r.current||(r.current=!0,n(!0))},[n]),l.useEffect(()=>{a&&(r.current=!0),!i.current&&r.current&&o.current&&!a&&(i.current=!0,e()),o.current=a},[a,e]),l.useEffect(()=>{!i.current&&s&&(i.current=!0,e())},[s,e]),null},jo=864e5,Ie=14,lt=4380,Xt=100,Jt=[{label:"30D",days:30},{label:"90D",days:90},{label:"6M",days:180},{label:"1Y",days:365}],Ao=e=>e*jo,Be=(e,n=new Date)=>G(n).add(e,"day").toDate(),No=(e,n=new Date)=>G(e).startOf("day").diff(G(n).startOf("day"),"day"),Co=(e=new Date)=>Be(Ie,e),So=(e=new Date)=>Be(lt,e),St=e=>{if(e<365)return`${e} ${e===1?"day":"days"}`;const n=e/365;return`${Number.isInteger(n)?`${n} ${n===1?"year":"years"}`:`${n.toFixed(1)} years`} (${e.toLocaleString()} days)`},Eo=e=>{if(!Number.isFinite(e)||!Number.isInteger(e))return"Select an unlock date.";if(e<Ie)return`Unlock date must be at least ${Ie} days from today.`;if(e>lt)return`Unlock date must be within ${St(lt)} of today.`},Ro=(e,n,a)=>{if(!Number.isFinite(e)||e<=0)return"Invalid amount";if(e<Xt)return`Locked transfers must be at least ${Xt} ${a}.`;if(e>n)return"Insufficient funds."},Io=["S","M","T","W","T","F","S"],To=42,ye="rounded-md p-1 text-mid hover:bg-containerL1 hover:text-high disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",Oo=({isSelected:e,isToday:n,isCurrentMonth:a,isDisabled:s})=>{const r="flex size-9 items-center justify-center rounded-md text-sm transition-colors";return s?`${r} cursor-not-allowed text-grey-500 opacity-40`:e?`${r} bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end font-medium text-neutrals-1100`:n?`${r} text-high ring-1 ring-inset ring-grey-500 hover:bg-containerL1`:`${r} ${a?"text-mid":"text-grey-400"} hover:bg-containerL1 hover:text-high`},Lo=({value:e,onChange:n,minDate:a,maxDate:s,hasError:r=!1,placeholder:o="Select a date",buttonTitle:i="Select a date"})=>{const d=l.useMemo(()=>G(a).startOf("day"),[a]),c=l.useMemo(()=>G(s).startOf("day"),[s]),[h,u]=l.useState(()=>(e?G(e):d).startOf("month")),m=e?G(e).startOf("day"):void 0,p=G().startOf("day"),g=m==null?void 0:m.format("YYYY-MM"),[w,j]=l.useState(g);g!==w&&(j(g),m&&u(m.startOf("month")));const y=l.useMemo(()=>{const A=h.startOf("month").startOf("week");return Array.from({length:To},(C,T)=>A.add(T,"day"))},[h]),k=d.startOf("month"),v=c.startOf("month"),f=A=>A.isBefore(k)?u(k):A.isAfter(v)?u(v):u(A),b=h.isAfter(k),E=h.isBefore(v);return t.jsxs(Sn,{className:"relative",children:[t.jsxs(En,{title:i,className:`flex h-[3.25rem] w-full items-center justify-between rounded-md border ${r?"border-red-600":"border-grey-700"} bg-grey-1000 px-4 text-sm outline-none data-[open]:border-grey-500`,children:[t.jsx("span",{className:m?"text-high":"text-grey-400",children:m?m.format("MMMM D, YYYY"):o}),t.jsx(Xa,{className:"size-4 text-low"})]}),t.jsx(Rn,{anchor:{to:"bottom start",gap:8},className:"z-[60] w-[var(--button-width)] min-w-[19.5rem] rounded-xl border border-grey-600 bg-containerL3 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)]",children:({close:A})=>t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"flex items-center justify-between pb-3",children:[t.jsxs("div",{className:"flex items-center",children:[t.jsx("button",{type:"button",title:"Previous year",disabled:!b,onClick:()=>f(h.subtract(1,"year")),className:ye,children:t.jsx(Ja,{className:"size-4"})}),t.jsx("button",{type:"button",title:"Previous month",disabled:!b,onClick:()=>f(h.subtract(1,"month")),className:ye,children:t.jsx(es,{className:"size-4"})})]}),t.jsx("div",{className:"text-sm text-high",children:h.format("MMMM YYYY")}),t.jsxs("div",{className:"flex items-center",children:[t.jsx("button",{type:"button",title:"Next month",disabled:!E,onClick:()=>f(h.add(1,"month")),className:ye,children:t.jsx(ts,{className:"size-4"})}),t.jsx("button",{type:"button",title:"Next year",disabled:!E,onClick:()=>f(h.add(1,"year")),className:ye,children:t.jsx(ns,{className:"size-4"})})]})]}),t.jsx("div",{className:"grid grid-cols-7 justify-items-center gap-y-1 pb-1",children:Io.map((C,T)=>t.jsx("div",{className:"flex size-9 items-center justify-center text-[0.6875rem] uppercase text-low",children:C},`${C}-${T}`))}),t.jsx("div",{className:"grid grid-cols-7 justify-items-center gap-y-1",children:y.map(C=>{const T=C.isBefore(d)||C.isAfter(c),D=!!m&&C.isSame(m,"day");return t.jsx("button",{type:"button",disabled:T,title:C.format("MMMM D, YYYY"),onClick:()=>{n(C.toDate()),A()},className:Oo({isSelected:D,isToday:C.isSame(p,"day"),isCurrentMonth:C.isSame(h,"month"),isDisabled:T}),children:C.date()},C.valueOf())})})]})})]})},dt=({checked:e,onChange:n,title:a})=>t.jsxs(as,{className:`${e?"bg-green-600":"bg-grey-800"} relative inline-flex h-[1.125rem] w-[1.875rem] items-center rounded-full border border-transparent-100-8`,checked:e,onChange:n,title:a,children:[t.jsx("span",{className:"sr-only"}),t.jsx("span",{className:`${e?"translate-x-3.5":"translate-x-0.5"} inline-block size-3 rounded-full ${e?"bg-neutrals-1100":"bg-neutrals-100"} transition`})]}),Et=({onClose:e,message:n})=>t.jsx(ae,{onClose:e,showCloseButton:!1,children:t.jsxs("div",{className:"flex max-w-[calc(100vw-2rem)] flex-col items-center justify-center lg:w-[24.5rem]",children:[t.jsxs("div",{className:"relative mb-4 flex size-[4.5rem] items-center justify-center",role:"status","aria-label":"Waiting for your wallet",children:[t.jsx("div",{className:"absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-gradient-primary-end border-t-gradient-primary-start"}),t.jsx(ea,{className:"size-9"})]}),t.jsx("div",{className:"text-sm text-mid",children:n})]})}),_o=110,Po=52,Mo=165,Do=({recipient:e})=>{const n=x(i=>i.rpc),a=x(i=>i.solanaRpcUrl),s=I(i=>i.solanaCoreProgramId),r=J(e),o=J(s);return M({queryKey:["vaultGasEstimate",r,a,s],queryFn:async()=>{if(!n||!r||!o)throw new Error("Missing rpc, recipient, or core program id");const i=[_o,Mo];try{const[c]=await ss(K(r),K(o));(await ut(n,c)).exists||i.push(Po)}catch{}const d=await rs(n,i);return os(n,{rentLamports:d})},staleTime:60*1e3,enabled:!!n&&!!r&&!!o})},Fo=[{code:6001,name:"InsufficientBalance",message:"Insufficient ARIO balance for this transfer."},{code:6003,name:"SelfTransfer",message:"You cannot send a locked transfer to your own address. Use a vault on your own tokens instead."},{code:6006,name:"LockDurationTooShort",message:"The network rejected this lock as too short. Choose a later unlock date."},{code:6007,name:"LockDurationTooLong",message:"The network rejected this lock as too long. Choose an earlier unlock date."},{code:6013,name:"MaxVaultsExceeded",message:"The recipient already holds the maximum number of vaults and cannot receive another."},{code:6014,name:"VaultBelowMinimum",message:"Locked transfers must be at least 100 ARIO."}],$o=["already in use","constraintseeds","constraint seeds","a seeds constraint was violated"],Uo=e=>{const a=ce(e).toLowerCase();for(const{code:s,name:r,message:o}of Fo)if(a.includes(`0x${s.toString(16)}`)||a.includes(r.toLowerCase()))return o;if($o.some(s=>a.includes(s)))return"Another vault was created for this recipient while you were signing. Please try again."},Vo=e=>Uo(e)??ce(e),Z=({label:e,value:n,className:a,isLink:s=!1,rightIcon:r})=>t.jsxs("div",{className:`flex items-center text-[0.8125rem] ${a}`,children:[t.jsx("div",{className:"text-left text-low",children:e}),t.jsx("div",{className:"grow"}),s&&n!=="-"?t.jsx("a",{className:"text-gradient",href:`https://${n}`,target:"_blank",rel:"noreferrer",children:n}):t.jsxs("div",{className:"flex items-center gap-1 text-left text-low",children:[n,r]})]}),pa=({gasEstimate:e,isLoading:n,insufficientSol:a=!1})=>{if(n)return t.jsx(Z,{label:"Network Fee (est.):",value:t.jsx("span",{className:"animate-pulse",children:"estimating..."})});if(!e)return null;const s=e.rentLamports>0;return t.jsxs(t.Fragment,{children:[t.jsx(Z,{label:"Network Fee (est.):",value:`~${ve(e.feeLamports)} SOL`}),s&&t.jsxs(t.Fragment,{children:[t.jsx(Z,{label:"Storage Rent (est.):",value:`~${ve(e.rentLamports)} SOL`}),t.jsx(Z,{label:"Total SOL (est.):",value:`~${ve(e.totalLamports)} SOL`})]}),e.rentReclaimedLamports>0&&t.jsx(Z,{label:"Rent Reclaimed:",value:`+${ve(e.rentReclaimedLamports)} SOL`}),a&&t.jsx("div",{className:"text-right text-[0.8125rem] text-text-red",children:"Insufficient SOL to cover the network cost"})]})},Rt=({onClose:e,title:n,bodyText:a})=>t.jsx(ae,{onClose:e,children:t.jsxs("div",{className:"max-w-[calc(100vw-2rem)] lg:w-[24.5rem]",children:[t.jsx("div",{className:"flex grow justify-center pb-3",children:t.jsx(Ir,{className:"size-8"})}),t.jsx("div",{className:"pb-3 text-2xl text-high",children:n}),typeof a=="string"?t.jsx("div",{className:"pb-8 text-center  text-low",children:a}):a,t.jsx("div",{className:"flex grow justify-center",children:t.jsx(Q,{onClick:e,buttonType:ee.PRIMARY,title:"Close",text:"Close"})})]})}),Bo=({recipient:e,amount:n,lockDays:a,revocable:s,onClose:r,onSuccess:o})=>{const i=me(),d=x(L=>L.ticker),c=x(L=>L.walletAddress),h=x(L=>L.arIOWriteableSDK),{data:u}=Ve(c),{data:m,isLoading:p}=Do({recipient:e}),g=m!==void 0&&u!==void 0&&u.sol*1e9<m.totalLamports,[w,j]=l.useState(!1),[y,k]=l.useState(!1),[v,f]=l.useState(),[b,E]=l.useState(""),A=Be(a),T=(s||b==="CONFIRM")&&!g,D=async()=>{if(!(h===void 0||!T)){j(!0);try{const{id:L}=await h.vaultedTransfer({recipient:e,quantity:new Ce(n).toMARIO(),lockLengthMs:Ao(a),revokable:s},gt);f(L),Nt(i,"balances","vaults"),k(!0)}catch(L){pe(Vo(L))}finally{j(!1)}}};return t.jsxs(t.Fragment,{children:[t.jsx(ae,{onClose:r,useDefaultPadding:!1,children:t.jsxs("div",{className:"w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]",children:[t.jsx("div",{className:"text-gradient rounded-t-xl border-b border-b-stroke-low bg-containerL3 p-4",children:"Review Locked Transfer"}),t.jsxs("div",{className:"flex flex-col gap-2 p-8",children:[t.jsx(Z,{label:"Recipient:",value:Wt(e)}),t.jsx(Z,{label:"Amount:",value:`${O(n)} ${d}`}),t.jsx(Z,{label:"Unlocks on or around:",value:Kt(A)}),t.jsx(Z,{label:"Lock duration:",value:St(a)}),t.jsx(Z,{label:"Revocable by you:",value:s?"Yes":"No"}),t.jsx(pa,{gasEstimate:m,isLoading:p,insufficientSol:g})]}),t.jsxs("div",{className:"border-y border-grey-800 px-8 py-6 text-sm text-mid",children:[s?t.jsx("div",{children:"The recipient cannot access these tokens until the vault unlocks. You may revoke it before then, which returns the balance to you."}):t.jsx("div",{children:"The recipient cannot access these tokens until the vault unlocks, and you will not be able to revoke or recover them. This cannot be undone."}),t.jsx("div",{className:"pt-3 text-xs text-low",children:"The vault unlocks this long after the transaction confirms, so the exact time may differ from the date above by a few moments. If you are signing with a hardware wallet, make sure blind signing is enabled."})]}),t.jsxs("div",{className:"bg-containerL0 px-8 pb-8 pt-6",children:[!s&&t.jsxs("div",{className:"mb-6 flex flex-col items-center gap-2 text-sm text-mid",children:[t.jsx("div",{children:'Please type "CONFIRM" in the text box to proceed.'}),t.jsx("input",{type:"text","aria-label":"Type CONFIRM to authorise this locked transfer",onChange:L=>E(L.target.value),className:"h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",value:b})]}),t.jsx(Q,{className:`h-[3.25rem] w-full ${T?"":"pointer-events-none opacity-30"}`,onClick:D,buttonType:ee.PRIMARY,title:g?"Insufficient SOL":`Send Locked ${d}`,text:g?"Insufficient SOL":`Send Locked ${d}`}),t.jsx("div",{className:"flex justify-center",children:t.jsx("button",{className:"h-[3.25rem] p-4 text-sm",onClick:r,children:"Back"})})]})]})}),w&&t.jsx(Et,{onClose:()=>j(!1),message:"Sign the following data with your wallet to proceed."}),y&&t.jsx(Rt,{onClose:()=>{k(!1),r(),o()},title:"Confirmed",bodyText:t.jsxs("div",{className:"mb-8 text-sm text-mid",children:[t.jsxs("div",{children:["You have locked ",O(n)," ",d," for"," ",Wt(e)," until ",Kt(A),"."]}),t.jsxs("div",{className:"my-2 flex flex-col justify-center gap-2",children:[t.jsx("div",{children:"Transaction ID:"}),t.jsxs("button",{className:"flex items-center justify-center break-all",title:"View transaction on Solana Explorer",onClick:async()=>{window.open(na(v),"_blank","noopener,noreferrer")},children:[v,t.jsx(Fe,{className:"ml-1 size-3"})]})]})]})})]})},ma=({onClose:e})=>{const n=me(),a=x(R=>R.ticker),s=x(R=>R.walletAddress),{data:r}=Ve(s),o=x(R=>R.arIOWriteableSDK),[i,d]=l.useState(""),[c,h]=l.useState(""),[u,m]=l.useState(),[p,g]=l.useState(),[w,j]=l.useState(!1),[y,k]=l.useState(!1),[v,f]=l.useState(),[b,E]=l.useState(!1),[A,C]=l.useState(),[T,D]=l.useState(!1),L=async(R,te)=>{if(o===void 0)return;const We=R.trim();F(!0);try{const oe=new Ce(+te).toMARIO(),{id:xe}=await o.transfer({target:We,qty:oe},gt);B(xe),Nt(n,"balances"),_(!0)}catch(oe){pe(`${oe}`)}finally{F(!1)}},[S,F]=l.useState(!1),[V,_]=l.useState(!1),[z,B]=l.useState();l.useEffect(()=>{const R=(r==null?void 0:r.ario)??0,te=i.trim(),We=te.length>0&&te===(s==null?void 0:s.toString()),oe=!$e(te)&&te.length>0?"Invalid address":y&&We?"You cannot send a locked transfer to your own address.":void 0,xe=c.trim().length===0?void 0:y?Ro(+c,R,a):isNaN(+c)?"Invalid amount":+c>R?"Insufficient funds.":void 0,Ot=y?v===void 0?"Select an unlock date.":Eo(v):void 0;m(oe),g(xe),C(Ot),j(!oe&&!xe&&!Ot&&te.length>0&&+c>0)},[c,r,i,y,v,a,s]);const re=v!==void 0?Be(v):void 0;return t.jsx(ae,{onClose:e,useDefaultPadding:!1,children:t.jsxs("div",{className:"w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]",children:[t.jsxs("div",{className:"flex w-full flex-col px-8 pb-4 pt-6",children:[t.jsxs("div",{className:"text-lg text-high",children:["Send ",a]}),t.jsxs("div",{className:"my-8 grow overflow-y-auto text-sm text-mid scrollbar",children:[t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx("div",{className:"grow",children:"Recipient"}),t.jsx("input",{type:"text",onChange:R=>d(R.target.value),className:`h-7 w-full rounded-md border ${u?"border-red-600":"border-grey-700"} bg-grey-1000 px-4 py-6 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high`,placeholder:"Enter Solana Wallet Address",value:i})]}),u&&t.jsx("div",{className:"p-2 text-xs text-red-600",children:u})]}),t.jsxs("div",{className:"my-2 grow overflow-y-auto text-sm text-mid scrollbar",children:[t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsxs("div",{className:"flex grow items-center",children:[t.jsx("div",{className:"grow",children:"Amount"}),t.jsxs("div",{className:"text-xs text-low",children:["Balance: ",(r==null?void 0:r.ario)??0]})]}),t.jsxs("div",{className:`flex rounded-md border ${p?" border-red-600":"border-grey-700"} py-2`,children:[t.jsx("input",{type:"text",onChange:R=>{h(R.target.value)},className:"h-7 w-full grow bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",value:c}),t.jsx(Q,{className:"mr-3 h-7",onClick:()=>h(String(r==null?void 0:r.ario)),buttonType:ee.SECONDARY,active:!0,title:"Max",text:"Max"})]})]}),p&&t.jsx("div",{className:"p-2 text-xs text-red-600",children:p})]}),t.jsxs("div",{className:"mt-6 flex flex-col gap-3 text-sm text-mid",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(dt,{checked:y,onChange:R=>{k(R),R&&v===void 0&&f(Jt[0].days)},title:"Lock these tokens in a vault"}),t.jsx("div",{className:"grow",children:"Lock in a vault"})]}),t.jsx("div",{className:"text-xs text-low",children:"Locked tokens sit in a vault the recipient cannot access until it unlocks."}),y&&t.jsxs("div",{className:"flex flex-col gap-4 rounded-md border border-grey-800 bg-containerL1 p-4",children:[t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx("div",{className:"text-xs text-low",children:"Lock for"}),t.jsx("div",{className:"flex overflow-hidden rounded-md border border-grey-600 text-xs",children:Jt.map(R=>t.jsx("button",{type:"button",title:`Lock for ${R.days} days`,onClick:()=>f(R.days),className:`grow px-3 py-2 transition-colors ${v===R.days?"bg-grey-700 text-high":"text-low hover:text-mid"}`,children:R.label},R.days))})]}),t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx("div",{className:"text-xs text-low",children:"Unlock date"}),t.jsx(Lo,{value:re,onChange:R=>f(No(R)),minDate:Co(),maxDate:So(),hasError:!!A,buttonTitle:"Choose an unlock date",placeholder:`At least ${Ie} days from today`}),v!==void 0&&!A&&t.jsxs("div",{className:"text-xs text-low",children:["Unlocks on or around"," ",t.jsx("span",{className:"text-mid",children:G(re).format("MMMM D, YYYY")})," ","· ",St(v)]})]}),t.jsxs("div",{className:"flex items-start gap-3 border-t border-grey-800 pt-4",children:[t.jsx(dt,{checked:b,onChange:E,title:"Allow revoking this vault"}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("div",{className:"grow",children:"Let me revoke this vault"}),t.jsx("div",{className:"text-xs text-low",children:b?"You can revoke it before it unlocks and take the tokens back.":"Once sent, you cannot recover these tokens."})]})]})]}),A&&t.jsx("div",{className:"px-2 text-xs text-red-600",children:A})]})]}),t.jsx("div",{className:"my-6 flex grow justify-center px-8",children:t.jsx(Q,{onClick:()=>{w&&(y?D(!0):L(i,c))},buttonType:ee.PRIMARY,title:y?"Review locked transfer":"Send",text:t.jsx("div",{className:"py-2",children:y?"Review":"Send"}),className:`w-full ${!w&&"pointer-events-none opacity-30"}`})}),S&&t.jsx(Et,{onClose:()=>F(!1),message:"Sign the following data with your wallet to proceed."}),T&&v!==void 0&&t.jsx(Bo,{recipient:i.trim(),amount:+c,lockDays:v,revocable:b,onClose:()=>D(!1),onSuccess:e}),V&&t.jsx(Rt,{onClose:()=>{_(!1),e()},title:"Confirmed",bodyText:t.jsxs("div",{className:"mb-8 text-sm text-mid",children:[t.jsxs("div",{children:["You have successfully sent ",c," ",a,"."]}),t.jsxs("div",{className:"my-2 flex flex-col justify-center gap-2",children:[t.jsx("div",{children:"Transaction ID:"}),t.jsxs("button",{className:"flex items-center justify-center break-all",title:"View transaction on Solana Explorer",onClick:async()=>{window.open(na(z),"_blank","noopener,noreferrer")},children:[z,t.jsx(Fe,{className:"ml-1 size-3"})]})]})]})})]})})},Go=3,zo=()=>t.jsxs("span",{"aria-hidden":!0,className:"pointer-events-none absolute -right-0.5 -top-0.5 flex size-2.5",children:[t.jsx("span",{className:"absolute inline-flex size-full rounded-full bg-gradient-primary-start opacity-75 motion-reduce:hidden",style:{animation:`ping 1s cubic-bezier(0, 0, 0.2, 1) ${Go}`}}),t.jsx("span",{className:"relative inline-flex size-2.5 rounded-full bg-gradient-primary-start ring-2 ring-grey-1000"})]}),qo=l.forwardRef(({hasClaimable:e,...n},a)=>t.jsxs("div",{className:"relative",children:[e&&t.jsx(zo,{}),t.jsx(Q,{forwardRef:a,buttonType:ee.PRIMARY,icon:n.logo?t.jsx("div",{className:"size-4 overflow-hidden",children:t.jsx("img",{src:n.logo.src,alt:"Profile",className:"size-4"})}):t.jsx(ta,{className:"size-4"}),title:e?"Profile — you have a withdrawal ready to claim":"Profile",text:n.children,...n})]})),Wo=()=>{const e=x(g=>g.walletStateInitialized),{disconnect:n}=pt(),a=x(g=>g.updateWallet),s=x(g=>g.walletAddress),{data:r}=Ve(s),o=bo(),i=x(g=>g.ticker),[d,c]=l.useState(!1),[h,u]=l.useState(!1),{data:m}=yo(s==null?void 0:s.toString()),{data:p}=vo({primaryName:m==null?void 0:m.name});return s?t.jsx(Sn,{className:"relative",children:({close:g})=>t.jsxs(t.Fragment,{children:[t.jsx(En,{as:qo,logo:p,hasClaimable:o.total>0,children:m?zr(m.name):qt(s.toString())}),t.jsxs(Rn,{className:"absolute right-0 z-50 mt-2.5 w-fit min-w-52 rounded-xl border border-grey-800 bg-grey-1000 text-sm shadow-xl",children:[t.jsxs("div",{className:"flex gap-2 px-4 py-5 ",children:[t.jsx(is,{className:"size-4"}),t.jsx("div",{className:"flex gap-2 align-middle text-mid",children:t.jsx("a",{href:Ht(s.toString()),target:"_blank",rel:"noreferrer",onClick:w=>{w.stopPropagation()},children:t.jsx(se,{message:t.jsx("div",{className:"text-high",children:s.toString()}),useMaxWidth:!1,children:qt(s.toString())})})}),t.jsx(ko,{textToCopy:s.toString()})]}),t.jsxs("div",{className:"mx-4  rounded-md border border-grey-800 py-3",children:[t.jsxs("div",{className:"relative border-b border-grey-800",children:[t.jsxs("div",{className:"px-4 text-xs text-low",children:[i," Balance"]}),t.jsx("div",{className:"px-4 pb-3 pt-1 text-high",children:r?Xe(r.ario):t.jsx(P,{})}),r&&t.jsx("button",{className:"absolute right-4 top-1/2 -translate-y-5 rounded border border-grey-800 p-2",title:`Send ${i}`,onClick:()=>{u(!0),g()},children:t.jsx(In,{className:"size-3"})})]}),t.jsx("div",{className:"px-4 pt-3 text-xs text-low",children:"SOL Balance"}),t.jsx("div",{className:"px-4 pt-1 text-high",children:r?Xe(r.sol):t.jsx(P,{})}),o.total>0&&t.jsxs("div",{className:"mt-3 border-t border-grey-800 px-4 pt-3",children:[t.jsx("div",{className:"text-xs text-low",children:"Ready to claim"}),t.jsxs("div",{className:"pt-1 text-high",children:["at least ",Xe(o.total)]}),t.jsx(ls,{to:"/balances",onClick:()=>g(),className:"mt-1 inline-flex items-center text-xs text-link",children:"Claim on Balances"})]})]}),t.jsx("div",{className:"flex flex-col gap-3 text-nowrap px-6 pt-3 text-mid",children:t.jsxs("button",{className:"flex items-center",title:"Transaction History",onClick:async()=>{window.open(Ht(s.toString()),"_blank")},children:[t.jsx(mr,{className:"mr-2 h-4 w-[.9375rem]"})," ","Transaction History",t.jsx(Fe,{className:"ml-1 size-3"})]})}),t.jsx("div",{className:"mt-3 flex flex-col gap-3 rounded-b-xl bg-btn-secondary-default px-6 py-3 text-mid",children:t.jsxs("button",{className:"flex items-center gap-2",title:"Logout",onClick:async()=>{await n(),a(void 0)},children:[t.jsx(Ar,{className:"size-4"})," Logout"]})})]}),h&&t.jsx(ma,{onClose:()=>u(!1)})]})}):e?t.jsxs("div",{children:[t.jsx(Q,{buttonType:ee.PRIMARY,icon:t.jsx(ta,{className:"size-4"}),title:"Connect",text:"Connect",onClick:()=>c(!0)}),d&&t.jsx(ua,{onClose:()=>c(!1)})]}):t.jsx("div",{})},ke=({value:e,label:n,loading:a=!1,unavailable:s=!1,leftPadding:r=!0})=>t.jsxs("div",{className:`inline-flex  h-[2.375rem] flex-col items-start justify-start gap-1 border-r lg:block ${r?"px-6":"pr-6"} dark:border-transparent-100-8`,children:[t.jsx("div",{className:"text-xs text-high",children:s?t.jsx("span",{className:"text-low",title:"Could not be read from the network",children:"Unavailable"}):a?t.jsx(P,{className:"h-[1.0625rem]"}):e!==void 0?typeof e=="number"?e.toLocaleString("en-US"):e:Os}),t.jsx("div",{className:"pt-1 text-xs leading-none text-low",children:n})]}),Ko=()=>{const e=x(u=>u.currentEpoch),n=x(u=>u.epochLoadFailed),a=ao(),s=x(u=>u.ticker),{isLoading:r,data:o}=mo(),{data:i,isError:d}=wo(),{data:c}=De(),h=l.useMemo(()=>e?e==null?void 0:e.epochIndex.toLocaleString("en-US"):c&&!c.hasEpochZeroStarted?"Awaiting first epoch":void 0,[e,c]);return t.jsxs("header",{className:"z-30 mt-5 flex pl-6 leading-[1.4] lg:mt-6 lg:h-[4.5rem] lg:rounded-xl lg:border lg:py-4 lg:pr-4 dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300",children:[t.jsxs("div",{className:"hidden lg:flex",children:[t.jsx(ke,{value:h,label:"AR.IO EPOCH",loading:h===void 0&&!n,unavailable:h===void 0&&n,leftPadding:!1}),t.jsx(ke,{value:a,label:"NEXT EPOCH",loading:a===void 0&&!n,unavailable:a===void 0&&n}),t.jsx(ke,{value:o?Object.entries(o).filter(([u,m])=>m.status==="joined").length:void 0,label:"GATEWAYS",loading:r}),t.jsx(ke,{value:i?t.jsxs("div",{children:[O(new $(i).toARIO().valueOf())," ",s]}):void 0,label:"PROTOCOL BALANCE",loading:!i&&!d,unavailable:!i&&d})]}),t.jsx("div",{className:"grow"}),t.jsx("div",{className:"content-center",children:t.jsx(Wo,{})})]})},Ho=()=>{const e=x(r=>r.arIOReadSDK),n=x(r=>r.solanaRpcUrl),a=Ue();return M({queryKey:["arNSStats",n],queryFn:async()=>{var h;const r=await it(he(n),a),o=(h=r==null?void 0:r.counts)==null?void 0:h.arnsRecords,i=r==null?void 0:r.demandFactor;if(typeof o=="number"&&typeof i=="number")return{demandFactor:i,namesPurchased:o};if(!e)throw new Error("arIOReadSDK not initialized");const d=await e.getDemandFactor(),c=await e.getArNSRecords({limit:1});return{demandFactor:d,namesPurchased:c.totalItems}},staleTime:1/0})},ga=e=>new Set(e.map(n=>n.address)).size,Yo=async(e,n,a)=>{var r,o,i,d;for(let c=0;c<2;c+=1){const[h,u]=await Promise.all([it(e,n),a?ca("delegates",e,n):Promise.resolve(null)]),m={totalAddresses:(r=h==null?void 0:h.counts)==null?void 0:r.balances,totalVaults:(o=h==null?void 0:h.counts)==null?void 0:o.vaults};if(!u)return m;if(!h||h.generatedAt===u.generatedAt)return{...m,uniqueDelegates:ga(u.items)}}const s=await it(e,n);return{totalAddresses:(i=s==null?void 0:s.counts)==null?void 0:i.balances,totalVaults:(d=s==null?void 0:s.counts)==null?void 0:d.vaults}},Zo={totalAddresses:async e=>(await e.getBalances({limit:Number.MAX_SAFE_INTEGER})).items.length,uniqueDelegates:async e=>ga((await e.getAllDelegates({limit:Number.MAX_SAFE_INTEGER})).items),totalVaults:async e=>(await e.getVaults({limit:Number.MAX_SAFE_INTEGER})).items.length},en={totalAddresses:"balances",uniqueDelegates:"delegates",totalVaults:"vaults"},Qo=async({sdk:e,expectedNetwork:n,expectedProgramIds:a,readLive:s})=>{const r=Object.keys(en),o=new Set(r.filter(c=>s(en[c]))),i=o.size===r.length?{}:await Yo(n,a,!o.has("uniqueDelegates")),d=await Promise.all(r.map(async c=>{const h=i[c];if(!o.has(c)&&typeof h=="number")return h;if(!e)throw new Error("arIOReadSDK is not initialized");return Zo[c](e)}));return Object.fromEntries(r.map((c,h)=>[c,d[h]]))},tn=60*60*1e3,Xo=["balances","delegates","vaults"],Jo=(e,n="")=>["networkStats",e,n],ei=()=>{const e=x(o=>o.arIOReadSDK),n=x(o=>o.solanaRpcUrl),a=x(o=>o.networkPortalDB),s=Ue(),r=JSON.stringify(s);return M({queryKey:Jo(n,r),queryFn:async()=>{const o=Xo.filter(u=>Re(u)),i=o.map(u=>io(u)).filter(u=>u!==void 0),d=o.length>0?{notBefore:Math.max(...i),liveDocuments:o}:void 0,c=await er(a,tn,r,d);if(c)return c;const h=await Qo({sdk:e,expectedNetwork:he(n),expectedProgramIds:s,readLive:Re});return await tr(a,h,r,o),h},staleTime:tn,enabled:!!a})},wa=8e3,ti={network:48*60*60*1e3,gateways:48*60*60*1e3,observers:48*60*60*1e3,findings:48*60*60*1e3,economics:48*60*60*1e3,rewards:48*60*60*1e3,epoch:null,registry:null},fa=()=>{var n;const e=(n=I.getState())==null?void 0:n.portalApiUrl;return(typeof e=="string"?e:"").trim()},ni=(e,n)=>e==="epoch"?`/api/v1/epochs/${n}.json`:e==="registry"?`/api/v1/registry/${n}.json`:`/api/v1/${e}.json`,ai=[400,1200],si=e=>new Promise(n=>setTimeout(n,e));async function Ge(e,n){const a=fa();if(a.length===0)return null;const s=`${a.replace(/\/+$/,"")}${ni(e,n)}`;for(let r=0;;r++){const o=await ri(e,s);if(o.kind==="ok")return o.body;if(o.kind==="refused")return null;const i=ai[r];if(i===void 0)return N.debug(`[analyzerApi] ${e}: unreachable after retries`),null;await si(i)}}async function ri(e,n){try{const a=await fetch(n,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(wa)});if(!a.ok)return N.debug(`[analyzerApi] ${e}: HTTP ${a.status}`),{kind:"refused"};const s=await a.json(),r=ti[e];if(r!==null){const o=s.generatedAt?Date.now()-Date.parse(s.generatedAt):Number.NaN;if(!Number.isFinite(o)||o>r)return N.warn(`[analyzerApi] ${e}: ${Math.round(o/36e5)}h old, ignoring`),{kind:"refused"}}return{kind:"ok",body:s}}catch(a){return N.debug(`[analyzerApi] ${e}: unreachable (${a})`),{kind:"unreachable"}}}const ct="gar-bitmap-v1-lsb",Ml=e=>{const{gatewayResultsBase64:n,gatewayCount:a,gatewayResultsEncoding:s}=e;if(!n||!a||a<=0)return null;if(s!==ct)return N.warn(`[analyzerApi] bitmap encoding ${s??"(absent)"} is not ${ct}, refusing to decode`),null;let r;try{const i=atob(n);r=Uint8Array.from(i,d=>d.charCodeAt(0))}catch{return null}if(r.length*8<a)return null;let o=0;for(let i=0;i<a;i++)o+=r[i>>3]>>(i&7)&1;return{passed:o,failed:a-o,total:a,passRate:o/a}},Dl=(e,n)=>{if(!n)return null;const a=e.failureCounts,s=n.gateways;if(!Array.isArray(a)||!Array.isArray(s))return null;if(!e.registryDigest||!n.digest||e.registryDigest!==n.digest)return N.warn("[analyzerApi] registry digest does not pair — counting only"),null;if(n.inEpoch!==!0)return null;const r=a.length;if(r===0||s.length<r)return N.warn(`[analyzerApi] registry holds ${s.length} slots for a ${r}-slot epoch — counting only`),null;const o=e.observations??[];if(o.length===0)return null;const i={},d=new Array(r).fill(0);for(const c of o){const{observer:h,gatewayResultsBase64:u,gatewayResultsEncoding:m}=c??{};if(!h||!u||m!==ct||c.gatewayCount!==r)return null;let p;try{const g=atob(u);p=Uint8Array.from(g,w=>w.charCodeAt(0))}catch{return null}if(p.length*8<r)return null;for(let g=0;g<r;g++){if((p[g>>3]>>(g&7)&1)===1)continue;d[g]+=1;const w=s[g];if(!w)return null;(i[w]??(i[w]=[])).push(h)}}for(let c=0;c<r;c++)if(d[c]!==a[c])return N.warn(`[analyzerApi] decoded ${d[c]} failures at slot ${c} but the chain counted ${a[c]} — counting only`),null;return i},nn=async e=>{try{const n=await fetch(e,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(wa)});return n.ok?await n.json():null}catch{return null}},oi=async e=>{const n=fa().replace(/\/+$/,""),a={networkMatches:!1,documents:[],archivedEpochs:[],registryEpochs:[]};if(n.length===0)return a;const[s,r]=await Promise.all([nn(`${n}/api/v1/index.json`),nn(`${n}/api/v1/portal/index.json`)]);if(!(r!=null&&r.network))return N.debug("[analyzerApi] endpoint publishes no network stamp — ignoring"),a;if(r.network!==e)return N.warn(`[analyzerApi] endpoint is for ${r.network}, app is on ${e} — ignoring its analysis`),{...a,network:r.network};const o=s==null?void 0:s.documents,i=o&&typeof o=="object"?Object.keys(o):[],d=c=>Array.isArray(c)?c.map(h=>h==null?void 0:h.epochIndex).filter(h=>typeof h=="number"):[];return{networkMatches:!0,documents:i,archivedEpochs:d(o==null?void 0:o.epochs),registryEpochs:d(o==null?void 0:o.registry),network:r.network}},Fl=(e,n)=>{if(!e||!n)return;const a=n.gatewayAddress?e.byWallet.get(n.gatewayAddress):void 0;if(a)return a;if(!n.fqdn)return;const s=n.fqdn.toLowerCase();if(!e.ambiguousFqdns.has(s))return e.byFqdn.get(s)},$l=e=>{if(e==null)return;if(typeof e=="number")return Number.isFinite(e)?`AS${e}`:void 0;const n=e.trim();if(n.length===0)return;const a=n.match(/^AS\s*(\d+)/i);return a?`AS${a[1]}`:n},ii={networkMatches:!1,documents:[],archivedEpochs:[],registryEpochs:[]},ze=()=>{const e=I(s=>s.portalApiUrl),n=x(s=>s.solanaRpcUrl),{data:a}=M({queryKey:["analyzerAvailability",e,n],queryFn:()=>oi(he(n)),staleTime:60*60*1e3,enabled:e.trim().length>0});return a??ii},qe=365,Te=1e6,et=(e,n)=>{const a=e==null?void 0:e.positions,s=e==null?void 0:e.totalEpochsRecorded;if(!(a!=null&&a.length)||!s)return;const r=n?a.filter(d=>d.kind===n):a;if(!r.length)return;let o=0,i=0;for(const d of r)o+=d.lifetimeRewards??0,i+=d.currentStake??0;if(!(i<=0))return o/i/s*qe},Ul=e=>{var r;const n=new Map,a=e==null?void 0:e.totalEpochsRecorded;if(!((r=e==null?void 0:e.positions)!=null&&r.length)||!a)return n;const s=new Map;for(const o of e.positions){if(o.kind!=="delegate")continue;const i=o.gatewayAddress;if(i===void 0)continue;const d=s.get(i)??{rewards:0,stake:0};d.rewards+=o.lifetimeRewards??0,d.stake+=o.currentStake??0,s.set(i,d)}for(const[o,{rewards:i,stake:d}]of s)d<=0||n.set(o,i/d/a*qe);return n},li=(e,n)=>{const a=e.lifetimeRewards??0,s=e.currentStake??0;return{gatewayAddress:e.gatewayAddress,kind:e.kind,basis:e.basis??"events",earned:a/Te,currentStake:s>0?s/Te:void 0,annualisedReturn:s>0&&n>0?a/s/n*qe:void 0,epochsRewarded:e.epochsRewarded??0}},di=(e,n)=>{var h,u;if(!((h=e==null?void 0:e.positions)!=null&&h.length)||!n)return;const a=e.positions.filter(m=>m.address===n);if(!a.length)return;const s=e.totalEpochsRecorded??((u=e.epochs)==null?void 0:u.length)??0,r=a.map(m=>li(m,s)),o=a.reduce((m,p)=>m+(p.lifetimeRewards??0),0),i=a.reduce((m,p)=>m+(p.currentStake??0),0),c=(e.epochs??[]).map((m,p)=>{var w;let g=null;for(const j of a){const y=(w=j.rewards)==null?void 0:w[p];typeof y=="number"&&(g=(g??0)+y)}return{epochIndex:m,ario:g===null?null:g/Te}});return{earned:o/Te,positions:r.sort((m,p)=>p.earned-m.earned),perEpoch:c,epochsRecorded:s,annualisedReturn:i>0&&s>0?o/i/s*qe:void 0,hasInferred:r.some(m=>m.basis==="inferred")}},ci=()=>{var u,m;const e=I(p=>p.portalApiUrl),n=x(p=>p.walletAddress),a=ze(),s=a.networkMatches&&a.documents.includes("rewards"),r=M({queryKey:["analyzerRewards",e,a.network??""],queryFn:()=>Ge("rewards"),staleTime:30*60*1e3,enabled:e.trim().length>0&&s}),o=n==null?void 0:n.toString(),i=l.useMemo(()=>di(r.data??void 0,o),[r.data,o]),d=l.useMemo(()=>et(r.data??void 0),[r.data]),c=l.useMemo(()=>et(r.data??void 0,"delegate"),[r.data]),h=l.useMemo(()=>et(r.data??void 0,"operator"),[r.data]);return{...r,summary:i,networkReturn:d,delegateReturn:c,operatorReturn:h,hasOperatorData:(((m=(u=r.data)==null?void 0:u.counts)==null?void 0:m.operator)??0)>0}},hi=()=>{const{data:e,isLoading:n}=ei(),{data:a,isLoading:s}=Ho(),{delegateReturn:r,operatorReturn:o}=ci(),i=x(c=>c.ticker),d=[{label:"Total Addresses",value:e?O(e.totalAddresses):"-",isLoading:n,tooltip:t.jsxs("div",{children:["Total number of unique addresses holding ",i," tokens on the network"]})},{label:"Unique Delegates",value:e?O(e.uniqueDelegates):"-",isLoading:n,tooltip:t.jsx("div",{children:"Number of unique addresses that are delegating stake. Many addresses delegate to multiple gateways."})},{label:"ArNS Names",value:a?O(a.namesPurchased):"-",isLoading:s,tooltip:t.jsx("div",{children:"Total names registered in the ArNS registry, whether leased or bought permanently."})},{label:"Demand Factor",value:a?a.demandFactor.toFixed(3):"-",isLoading:s,tooltip:t.jsx("div",{children:"The multiplier applied to ArNS registration prices. It rises as names are bought and decays when demand slows, so it is the closest thing on chain to a live read on ArNS demand."})},...r!==void 0?[{label:"Delegate yield",value:`${(r*100).toFixed(2)}%`,tooltip:t.jsxs("div",{children:["What delegated stake has actually returned across the network, annualised from measured rewards over the recorded history — not a projection.",t.jsx("br",{}),t.jsx("br",{}),"An individual position can differ sharply from this: gateways pass on anywhere from 0% to 95% of their rewards, and a stake that changed recently is measured against a balance that did not earn those rewards."]})}]:[],...o!==void 0?[{label:"Operator yield",value:`${(o*100).toFixed(2)}%`,tooltip:t.jsx("div",{children:"What operator stake has returned, annualised over the recorded history. Derived by comparing stake between epochs rather than from reward events, so it is an estimate where the delegate figure is a measurement."})}]:[],{label:"Total Vaults",value:e?O(e.totalVaults):"-",isLoading:n,tooltip:t.jsxs("div",{children:["Total number of active vaults containing locked ",i," tokens awaiting withdrawal"]})}];return t.jsxs("div",{className:"flex h-72 w-full flex-col rounded-xl border border-grey-500",children:[t.jsx("div",{className:"px-5 pb-2 pt-5",children:t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Network Statistics"})}),t.jsx("div",{className:"grid min-h-0 flex-1 grid-cols-2 content-start gap-x-4 gap-y-3 overflow-hidden px-5 pb-5",children:d.map(c=>t.jsxs("div",{className:"flex min-w-0 flex-col",children:[t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx("span",{className:"truncate text-xs text-low",children:c.label}),c.tooltip&&t.jsx(se,{message:c.tooltip,side:"right",children:t.jsx(jr,{className:"h-3 w-3 shrink-0 cursor-help text-low"})})]}),c.isLoading?t.jsx(P,{className:"mt-1 h-5 w-20"}):t.jsx("span",{className:"text-xl font-semibold text-high",children:c.value})]},c.label))})]})},ui=e=>{const n=x(s=>s.arIOReadSDK),a=x(s=>s.solanaRpcUrl);return M({queryKey:["garGasEstimate",e,a],queryFn:async()=>{if(!n||!e)throw new Error("arIOReadSDK is not initialized");return n.getGarGasEstimate(e)},staleTime:60*1e3,enabled:!!e&&!!n&&"getGarGasEstimate"in n})},pi=()=>{const e=x(s=>s.arIOReadSDK),n=x(s=>s.solanaRpcUrl);return M({queryKey:["gatewayRegistrySettings",n],queryFn:async()=>{if(!e)throw new Error("arIOReadSDK not available");return await e.getGatewayRegistrySettings()},enabled:!!e,staleTime:1/0})},mi=({errorMessage:e,tooltipPadding:n})=>{const a=n?`mb-${n}`:"";return t.jsx("div",{className:"relative flex px-3 text-red-600",children:t.jsx(yn,{children:t.jsxs(kn,{delayDuration:0,children:[t.jsx(jn,{children:t.jsx(yr,{className:"size-[1.125rem]"})}),t.jsx(An,{children:t.jsxs(Nn,{className:"z-50 w-fit max-w-[25rem] rounded-md bg-red-1000 px-6 py-3",children:[t.jsx(Cn,{className:`fill-red-1000 ${a}`}),t.jsx("div",{className:"text-sm text-red-600",children:e})]})})]})})})};var ht=(e=>(e[e.TOP=0]="TOP",e[e.MIDDLE=1]="MIDDLE",e[e.BOTTOM=2]="BOTTOM",e[e.SINGLE=3]="SINGLE",e[e.LAST=4]="LAST",e))(ht||{});const gi={0:"rounded-t-md",2:"rounded-b-md",3:"rounded-md",1:"",4:"rounded-bl-md rounded-br-xl"},an=({className:e})=>t.jsxs("div",{className:`size-[0.9375rem] ${e}`,children:[t.jsx("div",{className:"absolute size-[0.9375rem] rounded-[0.625rem] bg-green-600/20"}),t.jsx("div",{className:"absolute left-[.3125rem] top-[.3125rem] size-[.3125rem] rounded-[0.625rem]  bg-green-600"})]}),wi=({formPropertyName:e,initialState:n,formState:a,placeholder:s,enabled:r=!0,setFormState:o,errorMessages:i,setErrorMessages:d,label:c,rowType:h=1,leftComponent:u,rightComponent:m,validateProperty:p,readOnly:g,showModified:w=!0})=>{const j=gi[h],y=i[e],k=r&&(y==null?void 0:y.trim().length)>0,v=a[e],f=w&&n&&n[e]!==v,b=()=>{const A={...i};delete A[e],d(A)},E=()=>{n&&(o({...a,[e]:n[e]}),b())};return t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"bg-grey-900 pb-px",children:t.jsx("div",{className:"h-full text-nowrap bg-grey-1000 px-6 py-3 text-xs text-low",children:c})}),g?t.jsx("div",{className:"min-w-0 content-center break-all border-b border-grey-800 px-6 py-3 text-sm text-low",children:v}):typeof v=="boolean"?t.jsxs("div",{className:"relative flex content-center items-center border-b border-grey-800 px-6 ",children:[t.jsx("div",{className:"grow content-center text-sm",children:t.jsx("span",{className:v?"text-green-600":"text-low",children:v?"Enabled":"Disabled"})}),t.jsx(dt,{checked:v,onChange:A=>{o({...a,[e]:A})},title:`${v?"Disable":"Enable"} ${c}`}),f&&t.jsx(an,{className:"absolute right-[-0.46785rem] z-10"})]}):t.jsx("div",{className:["relative overflow-hidden from-gradient-primary-start to-gradient-primary-end p-px focus-within:bg-gradient-to-r",k?"bg-red-600":"bg-grey-800 focus-within:p-px",j].join(" "),children:t.jsxs("div",{className:`flex size-full items-center gap-[.1875rem] overflow-hidden bg-grey-1000 ${j}`,children:[u,t.jsx("input",{className:"size-full overflow-hidden border-none bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high",type:"text",disabled:!r,readOnly:!r,placeholder:s,value:r?v:"",onChange:A=>{k&&b(),o({...a,[e]:A.target.value})},onBlur:()=>{if(g||!r)return;if(!p)throw new Error("validateProperty is required");const A=p(v);A?d({...i,[e]:A}):b()}}),k&&t.jsx(mi,{errorMessage:y}),r&&n&&n[e]!==v&&t.jsx("button",{className:"pr-4",onClick:E,children:t.jsx(Cr,{className:"size-[1.125rem]"})}),m,r&&f&&t.jsx(an,{className:"absolute right-[-0.46785rem] z-10"})]})})]})},sn=({formRowDefs:e,formValues:n})=>e.every(a=>{const s=n[a.formPropertyName];if(a.enabled===!1||a.readOnly||typeof s=="boolean")return!0;if(a.validateProperty===void 0)throw new Error(`FormRowDef for ${a.formPropertyName} is missing a validateProperty function.`);return a.validateProperty(s)===void 0}),Vl=({initialState:e,formState:n})=>{let a=0;for(const s in n)n[s]!==e[s]&&a++;return a},rn=(e,n,a)=>s=>s.trim().length<n||s.trim().length>a?`${e} is required and must be ${n}-${a} characters in length.`:void 0,fi=e=>n=>n.trim()===""||!ds.test(n)?`${e} is required and must be a valid domain name.`:void 0,xi=e=>n=>n.trim()===""||!$e(n)?`${e} is required and must be a valid Solana wallet address.`:void 0,bi=e=>n=>n.trim()===""||!Wr(n)?`${e} is required and must be a valid Arweave transaction ID.`:void 0,on=(e,n,a,s)=>r=>{const o=+r;return s?isNaN(o)?`${e} must be a number.`:s<=a&&o<a?`${e} must be a number >= ${be(a)} ${n}.`:o<a||o>s?`${e} must be a number from ${be(a)} to ${be(s)} ${n}.`:void 0:o<a||isNaN(o)?`${e} must be a number >= ${be(a)} ${n}.`:void 0},vi=(e,n,a)=>s=>{const r=+s;return s.length===0||r<n||r>a||isNaN(r)?`${e} must be a number from ${n} to ${a}.`:void 0},Bl=(e,n,a)=>s=>{const r=+s;if(isNaN(r)||s.length===0)return`${e} must be a number.`;if(r<1)return`${e} must be at least 1 ${n}.`;if(r>a-1e4)return`${e} cannot be greater than your current stake of ${a} ${n} minus the base stake (10000 ${n}) required for gateways.`},Gl=(e,n,a,s)=>r=>{const o=+r;if(isNaN(o)||r.length===0)return`${e} must be a number.`;if(o<1)return`${e} must be at least 1 ${n}.`;if(o>a)return`${e} cannot be greater than your current stake of ${a} ${n}.`;if(a-o<s&&o!==s&&o!==a)return`Withdrawing this amount will put you below the gateway's minimum stake of ${s} ${n}. You can either: withdraw a smaller amount so your remaining stake is above the minimum - or - withdraw your full delegated stake.`},je={label:"",address:"",observerAddress:"",propertiesId:"FH1aVetOoulPGqgYukj0VE0wIhDy90WiQoV3U2PeY44",stake:"",allowDelegatedStaking:!1,delegatedStaking:"",delegatedStakingShareRatio:"",note:""},yi="https",ki=443,ji=0,Ai=500,Ni=({onClose:e})=>{const n=me(),a=x(C=>C.walletAddress),s=x(C=>C.arIOWriteableSDK),r=x(C=>C.ticker),{data:o}=pi(),[i,d]=l.useState(je),[c,h]=l.useState({}),[u,m]=l.useState(!1),[p,g]=l.useState(!1),{data:w,isLoading:j}=ui({workflow:"join-network",fromAddress:a==null?void 0:a.toString()}),{data:y}=Ve(a),k=!!w&&y!==void 0&&y.sol*1e9<w.totalLamports;l.useEffect(()=>{d(C=>({...C,observerAddress:(a==null?void 0:a.toString())??""}))},[a]);const v=i.allowDelegatedStaking,f=l.useMemo(()=>{const C=o?new $(o.operators.minStake).toARIO().valueOf():1e4;return[{formPropertyName:"label",label:"*Label:",rowType:ht.TOP,validateProperty:rn("Label",1,64)},{formPropertyName:"address",label:"*Address:",leftComponent:t.jsx("div",{className:"pl-6 text-xs text-low",children:"https://"}),rightComponent:t.jsx("div",{className:"hidden pr-6 text-xs text-low lg:block",children:":443"}),validateProperty:fi("Address")},{formPropertyName:"observerAddress",label:"*Observer Wallet:",validateProperty:xi("Observer Wallet")},{formPropertyName:"propertiesId",label:"*Properties ID:",placeholder:je.propertiesId,validateProperty:bi("Properties ID")},{formPropertyName:"stake",label:`*Stake (${r}):`,placeholder:`Minimum ${C} ${r}`,validateProperty:on("Stake",r,C)},{formPropertyName:"allowDelegatedStaking",label:"Delegated Staking:"},{formPropertyName:"minDelegatedStake",label:`Minimum Delegated Stake (${r}):`,enabled:v,placeholder:v?`Minimum 10 ${r}`:"Enable Delegated Staking to set this value.",validateProperty:on("Minimum Delegated Stake",r,o?new $(o.delegates.minStake).toARIO().valueOf():10)},{formPropertyName:"delegatedStakingShareRatio",label:"Reward Share Ratio:",enabled:v,placeholder:v?"Enter value 0-95":"Enable Delegated Staking to set this value.",validateProperty:vi("Reward Share Ratio",0,(o==null?void 0:o.operators.maxDelegateRewardSharePct)??95)},{formPropertyName:"note",label:"*Note:",rowType:ht.BOTTOM,validateProperty:rn("Note",1,256)}]},[v,o,r]),b=async()=>{if(sn({formRowDefs:f,formValues:i})&&s)try{const T=i.allowDelegatedStaking;m(!0);const D={protocol:yi,fqdn:String(i.address),port:ki,note:String(i.note),label:String(i.label),properties:String(i.propertiesId),observerAddress:String(i.observerAddress),allowDelegatedStaking:T,delegateRewardShareRatio:T?parseFloat(String(i.delegatedStakingShareRatio)):ji,minDelegatedStake:new Ce(T?parseFloat(String(i.minDelegatedStake)):Ai).toMARIO().valueOf(),autoStake:!0,operatorStake:new Ce(parseFloat(String(i.stake))).toMARIO().valueOf()},{id:L}=await s.joinNetwork(D,gt);N.info(`Join Network txID: ${L}`),Nt(n,"gateways","balances"),n.invalidateQueries({queryKey:["gateway",a==null?void 0:a.toString()],refetchType:"all"}),g(!0)}catch(T){pe(`${T}`)}finally{m(!1)}},E=()=>{d({...je,observerAddress:(a==null?void 0:a.toString())??""}),h({})},A=()=>{E(),e()};return t.jsx(ae,{onClose:A,children:t.jsxs("div",{className:"w-[calc(100vw-2rem)] text-left lg:w-[42.5rem]",children:[t.jsx("div",{className:"pb-3 text-2xl text-high",children:"Start Gateway"}),t.jsxs("div",{className:"flex flex-col gap-2 text-sm text-low lg:flex-row",children:["Owner ID: ",t.jsx("span",{className:"text-link",children:a==null?void 0:a.toString()})]}),t.jsx("div",{className:"mt-8 grid grid-cols-[14.375rem_minmax(0,1fr)] overflow-hidden rounded-md outline outline-grey-500",children:f.map((C,T)=>t.jsx(wi,{formState:i,setFormState:d,errorMessages:c,setErrorMessages:h,showModified:!1,initialState:C.formPropertyName==="propertiesId"||C.formPropertyName==="observerAddress"?{...je,observerAddress:(a==null?void 0:a.toString())??""}:void 0,...C},T))}),t.jsx("div",{className:"mt-6 flex flex-col gap-1",children:t.jsx(pa,{gasEstimate:w,isLoading:j,insufficientSol:k})}),t.jsxs("div",{className:"mt-8 flex w-full grow justify-end gap-[.6875rem]",children:[t.jsx(Q,{className:"w-[6.25rem]",onClick:A,active:!0,title:"Cancel",text:"Cancel"}),t.jsx("div",{className:sn({formRowDefs:f,formValues:i})&&!k?void 0:"pointer-events-none opacity-30",children:t.jsx(Q,{className:"w-[6.25rem]",onClick:()=>{b()},title:"Confirm",text:"Confirm",buttonType:ee.PRIMARY})})]}),u&&t.jsx(Et,{onClose:()=>m(!1),message:"Sign the following data with your wallet to proceed."}),p&&t.jsx(Rt,{onClose:()=>{E(),g(!1),e()},title:"Congratulations",bodyText:"You have successfully joined the network."})]})})},Ci=()=>{const e=vn(),n=x(p=>p.walletAddress),a=x(p=>p.ticker),[s,r]=l.useState(!1),[o,i]=l.useState(!1),[d,c]=l.useState(!1),h=()=>{n?i(!0):r(!0)},u=()=>{e("/staking")},m=()=>{n?c(!0):r(!0)};return t.jsxs("div",{className:"hidden lg:block w-full",children:[t.jsxs("div",{className:"grid gap-4 md:grid-cols-3",children:[t.jsx("div",{className:"group relative overflow-hidden rounded-lg bg-grey-800 px-5 py-3.5 hover:bg-grey-700 transition-colors cursor-pointer",onClick:h,children:t.jsxs("div",{className:"relative z-10 flex flex-wrap items-baseline gap-x-2 gap-y-0.5",children:[t.jsxs("div",{className:"inline-flex items-center gap-2",children:[t.jsx("span",{className:"text-gradient font-medium",children:"Join the Network"}),t.jsx(Bt,{className:"size-3"})]}),t.jsxs("p",{className:"text-xs text-mid",children:["Start your gateway and earn ",a," rewards"]})]})}),t.jsx("div",{className:"group relative overflow-hidden rounded-lg bg-grey-800 px-5 py-3.5 hover:bg-grey-700 transition-colors cursor-pointer",onClick:u,children:t.jsxs("div",{className:"relative z-10 flex flex-wrap items-baseline gap-x-2 gap-y-0.5",children:[t.jsxs("div",{className:"inline-flex items-center gap-2",children:[t.jsx("span",{className:"text-gradient font-medium",children:"Delegate to Gateways"}),t.jsx(Bt,{className:"size-3"})]}),t.jsxs("p",{className:"text-xs text-mid",children:["Stake your ",a," tokens and earn rewards"]})]})}),t.jsx("div",{className:"group relative overflow-hidden rounded-lg bg-grey-800 px-5 py-3.5 hover:bg-grey-700 transition-colors cursor-pointer",onClick:m,children:t.jsxs("div",{className:"relative z-10 flex flex-wrap items-baseline gap-x-2 gap-y-0.5",children:[t.jsxs("div",{className:"inline-flex items-center gap-2",children:[t.jsxs("span",{className:"text-gradient font-medium",children:["Transfer ",a]}),t.jsx(In,{className:"size-4"})]}),t.jsx("p",{className:"text-xs text-mid",children:"Send tokens to other addresses"})]})})]}),s&&t.jsx(ua,{onClose:()=>r(!1)}),o&&t.jsx(Ni,{onClose:()=>i(!1)}),d&&t.jsx(ma,{onClose:()=>c(!1)})]})},It=()=>{const e=I(s=>s.portalApiUrl),n=ze(),a=n.networkMatches&&n.documents.includes("network");return M({queryKey:["analyzerNetwork",e,n.network??""],queryFn:()=>Ge("network"),staleTime:60*60*1e3,enabled:e.trim().length>0&&a})},Si=5,Ei=()=>{const{data:e,isLoading:n}=It();if(n)return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsx("div",{className:"px-5 pb-3 pt-5",children:t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Infrastructure"})}),t.jsxs("div",{className:"flex flex-col gap-3 px-5 pb-5",children:[t.jsx(P,{className:"h-6 w-24"}),t.jsx(P,{className:"h-4 w-full"})]})]});const a=e==null?void 0:e.infrastructure,s=e==null?void 0:e.totals;if(!a)return null;const r=(a.uniqueAsns??0)===0,o=(a.topProviders??[]).slice(0,Si),i=s==null?void 0:s.gatewaysAnalyzed,d=s==null?void 0:s.gatewaysInNetwork;return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsxs("div",{className:"flex items-center gap-1 px-5 pb-3 pt-5",children:[t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Infrastructure"}),t.jsx(se,{message:t.jsxs("div",{className:"max-w-72",children:["Resolved from DNS for gateways that are joined and publish an FQDN",i!==void 0&&d!==void 0?` — ${O(i)} of ${O(d)} in the network.`:"."," ","Refreshed daily."]}),children:t.jsx(ge,{className:"size-3 cursor-help text-low"})})]}),r?t.jsx("div",{className:"px-5 pb-5 text-xs text-low",children:"The most recent analysis run did not resolve infrastructure, so hosting and network distribution are unavailable."}):t.jsxs("div",{className:"flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-5 pb-5 scrollbar scrollbar-thin",children:[t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-xs text-low",children:"Datacenter hosted"}),t.jsx("span",{className:"text-2xl font-semibold text-high",children:a.datacenterPercentage!==void 0?`${a.datacenterPercentage.toFixed(0)}%`:"—"})]}),t.jsxs("div",{className:"flex gap-6",children:[t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-xs text-low",children:"Networks (ASNs)"}),t.jsx("span",{className:"text-base text-high",children:O(a.uniqueAsns??0)})]}),t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-xs text-low",children:"Countries"}),t.jsx("span",{className:"text-base text-high",children:O(a.uniqueCountries??0)})]}),t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-xs text-low",children:"Providers"}),t.jsx("span",{className:"text-base text-high",children:O(a.uniqueIsps??0)})]})]}),o.length>0&&t.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-grey-500 pt-2.5",children:[t.jsx("span",{className:"text-xs text-low",children:o.length===1?"Largest provider":`Top ${o.length} providers`}),o.map(c=>t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex items-center justify-between text-xs",children:[t.jsx("span",{className:"truncate pr-2 text-mid",children:c.name}),t.jsxs("span",{className:"whitespace-nowrap text-low",children:[O(c.count)," (",c.percentage.toFixed(0),"%)"]})]}),t.jsx("div",{className:"h-1 w-full overflow-hidden rounded bg-grey-700",children:t.jsx("div",{className:`h-full rounded ${c.percentage>=25?"bg-warning":"bg-mid"}`,style:{width:`${Math.min(c.percentage,100)}%`}})})]},c.name))]})]})]})},ln=1,Ri=()=>{const{data:e,isLoading:n}=It();if(n)return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsx("div",{className:"px-5 pb-3 pt-5",children:t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Gateway Releases"})}),t.jsxs("div",{className:"flex flex-col gap-3 px-5 pb-5",children:[t.jsx(P,{className:"h-6 w-24"}),t.jsx(P,{className:"h-4 w-full"}),t.jsx(P,{className:"h-4 w-full"})]})]});const a=e==null?void 0:e.versions,s=a==null?void 0:a.distribution;if(!a||!(s!=null&&s.length))return null;const r=s.filter(h=>h.percentage>=ln),o=s.filter(h=>h.percentage<ln).reduce((h,u)=>h+u.count,0),i=a.totalReporting??0,d=a.totalGateways??0,c=Math.max(d-i,0);return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsxs("div",{className:"flex items-center gap-1 px-5 pb-3 pt-5",children:[t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Gateway Releases"}),t.jsx(se,{message:t.jsx("div",{className:"max-w-64",children:"Release versions reported by analysed gateways. Only gateways that are joined and publish an FQDN are probed, and not all of those report a version."}),children:t.jsx(ge,{className:"size-3 cursor-help text-low"})})]}),t.jsxs("div",{className:"flex items-baseline gap-2 px-5",children:[t.jsx("span",{className:"text-2xl font-semibold text-high",children:a.topVersionPercentage!==void 0?`${a.topVersionPercentage.toFixed(0)}%`:"—"}),t.jsxs("span",{className:"text-xs text-low",children:["on"," ",a.topVersion?`v${a.topVersion}`:"the top release"]})]}),t.jsxs("div",{className:"mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-5 pb-2 scrollbar scrollbar-thin",children:[r.map(h=>t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex items-center justify-between text-xs",children:[t.jsxs("span",{className:"text-mid",children:["v",h.version]}),t.jsxs("span",{className:"text-low",children:[O(h.count)," (",h.percentage.toFixed(1),"%)"]})]}),t.jsx("div",{className:"h-1.5 w-full overflow-hidden rounded bg-grey-700",children:t.jsx("div",{className:"h-full rounded bg-streak-up",style:{width:`${Math.min(h.percentage,100)}%`}})})]},h.version)),o>0&&t.jsxs("div",{className:"flex items-center justify-between text-xs text-low",children:[t.jsx("span",{children:"Other releases"}),t.jsx("span",{children:O(o)})]})]}),c>0&&t.jsxs("div",{className:"mx-5 flex shrink-0 items-center justify-between border-t border-grey-500 py-3 text-xs text-low",children:[t.jsx("span",{children:"No version reported"}),t.jsx("span",{children:O(c)})]})]})},dn=6,Ii=()=>{const{data:e,isLoading:n}=It();if(n)return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsx("div",{className:"px-5 pb-3 pt-5",children:t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Geography"})}),t.jsxs("div",{className:"flex flex-col gap-3 px-5 pb-5",children:[t.jsx(P,{className:"h-4 w-full"}),t.jsx(P,{className:"h-4 w-full"}),t.jsx(P,{className:"h-4 w-full"})]})]});const a=e==null?void 0:e.infrastructure,s=a==null?void 0:a.countryDistribution;if(!a||!(s!=null&&s.length))return null;const r=s.slice(0,dn),o=s.slice(dn),i=o.reduce((d,c)=>d+c.count,0);return t.jsxs("div",{className:"col-span-1 flex h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsxs("div",{className:"flex items-center gap-1 px-5 pb-3 pt-5",children:[t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Geography"}),t.jsx(se,{message:t.jsx("div",{className:"max-w-64",children:"Countries the analysed gateways resolve to, from the daily run. Covers gateways that are joined and publish an FQDN, not the whole registry."}),children:t.jsx(ge,{className:"size-3 cursor-help text-low"})}),t.jsx("div",{className:"grow"}),t.jsxs("span",{className:"text-xs text-low",children:[O(a.uniqueCountries??s.length)," ","countries"]})]}),t.jsx("div",{className:"flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-5 pb-2 scrollbar scrollbar-thin",children:r.map(d=>t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsxs("div",{className:"flex items-center justify-between text-xs",children:[t.jsxs("span",{className:"flex min-w-0 items-center gap-1.5",children:[d.countryCode&&t.jsx("span",{className:"rounded bg-grey-700 px-1 py-px font-mono text-[0.625rem] text-low",children:d.countryCode}),t.jsx("span",{className:"truncate text-mid",children:d.country})]}),t.jsxs("span",{className:"whitespace-nowrap pl-2 text-low",children:[O(d.count)," (",d.percentage.toFixed(1),"%)"]})]}),t.jsx("div",{className:"h-1.5 w-full overflow-hidden rounded bg-grey-700",children:t.jsx("div",{className:"h-full rounded bg-mid",style:{width:`${Math.min(d.percentage,100)}%`}})})]},d.countryCode||d.country))}),i>0&&t.jsxs("div",{className:"mx-5 flex shrink-0 items-center justify-between border-t border-grey-500 py-3 text-xs text-low",children:[t.jsxs("span",{children:[o.length," more ",o.length===1?"country":"countries"]}),t.jsx("span",{children:O(i)})]})]})},Tt=({children:e})=>t.jsx("div",{className:"flex size-full",children:t.jsx("div",{className:"m-auto px-6 text-center text-sm text-low",children:e})}),Ae=["#E4B1E7","#D68BDA","#C964CE","#BB3DC2","#96319B"],Ti=e=>[{name:"Protocol Balance",value:new $(e.protocolBalance).toARIO().valueOf()},{name:"Actively Staked",value:new $(e.staked+e.delegated).toARIO().valueOf()},{name:"Pending Withdrawal",value:new $(e.withdrawn).toARIO().valueOf()},{name:"Liquid",value:new $(e.circulating).toARIO().valueOf()},{name:"Locked",value:new $(e.locked).toARIO().valueOf()}].sort((a,s)=>s.value-a.value),Oi=()=>{const[e,n]=l.useState(),{data:a,isError:s}=ha(),r=x(p=>p.ticker),[o,i]=l.useState();l.useEffect(()=>{n(a?Ti(a):void 0)},[a]);const d=(p,g)=>{i(g)},c=()=>{i(void 0)},h=e&&o!==void 0?e[o].value:void 0,u=a!=null&&a.total?new $(a.total).toARIO().valueOf():void 0,m=h!==void 0?O(Math.floor(h)):u!==void 0?O(Math.floor(u)):void 0;return t.jsxs("div",{className:"flex h-72 w-full flex-col rounded-xl border border-grey-500",children:[t.jsx("div",{className:"text-gradient px-5 pt-5 text-sm",children:e&&o!==void 0?e[o].name:r?"Token Supply":""}),t.jsx("div",{className:"relative h-48 w-full grow",children:e?t.jsxs(t.Fragment,{children:[t.jsx(we,{width:"100%",height:"100%",children:t.jsxs(cs,{children:[t.jsx(hs,{data:e,dataKey:"value",nameKey:"name",cx:"50%",cy:"42%",innerRadius:46,outerRadius:62,stroke:"none",paddingAngle:2,onMouseEnter:d,onMouseLeave:c,children:e.map((p,g)=>t.jsx(Se,{fill:Ae[g%Ae.length],fillOpacity:o===void 0||o===g?1:.35},`cell-${g}`))}),t.jsx(us,{x:"50%",y:"50%",textAnchor:"middle",dominantBaseline:"middle",fill:"#E19EE5",fontSize:20,children:"Test"})]})}),t.jsx("div",{className:"pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center",children:t.jsxs("div",{className:"text-gradient flex items-baseline gap-1 text-center",children:[t.jsx("div",{className:"text-2xl font-semibold",children:m??t.jsx(P,{className:"h-7 w-40"})}),t.jsx("div",{className:"text-xs",children:r})]})})]}):s?t.jsx(Tt,{children:"Token supply is unavailable because it could not be read from the network."}):t.jsx("div",{className:"flex size-full",children:t.jsx(P,{className:"m-auto h-4"})})}),t.jsx("div",{className:"grid w-full grid-cols-5 gap-2 rounded-b-xl bg-containerL3 p-2",children:e==null?void 0:e.map((p,g)=>t.jsxs("div",{className:"flex cursor-pointer gap-1",onMouseEnter:()=>i(g),onMouseLeave:()=>i(void 0),children:[t.jsx("div",{className:"mt-1 size-2 min-w-2 rounded-full",style:{backgroundColor:Ae[g%Ae.length],opacity:o===void 0||o===g?1:.35}}),t.jsx("div",{className:"grow text-[.675rem] text-low",children:p.name})]},g))})]})},Li=()=>{const e=I(s=>s.portalApiUrl),n=ze(),a=n.networkMatches&&n.documents.includes("observers");return M({queryKey:["analyzerObservers",e,n.network??""],queryFn:async()=>{const s=await Ge("observers");if(!(s!=null&&s.observers))return null;const r=new Map;for(const o of s.observers)o!=null&&o.observer&&r.set(o.observer,o);return{rows:s.observers,byObserver:r,epochs:s.epochs??[]}},staleTime:60*60*1e3,enabled:e.trim().length>0&&a})},_i=5,Pi=({active:e,payload:n})=>{if(!e||!(n!=null&&n.length))return null;const a=n[0].payload;return t.jsxs("div",{className:"rounded-md border border-grey-500 bg-containerL0 px-3 py-2 text-xs",children:[t.jsxs("div",{className:"mb-1 text-mid",children:["Epoch ",a.epochIndex]}),t.jsxs("div",{className:"text-high",children:[a.independence.toFixed(0),"% independent"]}),t.jsxs("div",{className:"text-low",children:[a.distinctReportTxIds," distinct of ",a.observationCount," submitted"]}),a.lowSample&&t.jsx("div",{className:"mt-1 text-warning",children:"Few observations — noisy"})]})},Mi=()=>{const{data:e}=Li(),[n,a]=l.useState(),s=l.useMemo(()=>{const i=e==null?void 0:e.epochs;if(!(i!=null&&i.length))return;const d=i.filter(c=>typeof c.observationCount=="number"&&c.observationCount>0&&typeof c.distinctReportTxIds=="number").map(c=>({epochIndex:c.epochIndex,observationCount:c.observationCount,distinctReportTxIds:c.distinctReportTxIds,independence:c.distinctReportTxIds/c.observationCount*100,lowSample:c.observationCount<_i})).sort((c,h)=>c.epochIndex-h.epochIndex);return d.length?d:void 0},[e]);if(!s)return null;const r=[...s].reverse().find(i=>!i.lowSample)??s[s.length-1],o=n!==void 0?s[n]:r;return t.jsxs("div",{className:"col-span-1 flex h-full min-h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2",children:[t.jsxs("div",{className:"flex items-start justify-between px-5 pb-2 pt-5",children:[t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Report Independence"}),t.jsx(se,{message:t.jsx("div",{className:"max-w-80",children:"Observers are meant to assess the network independently. This is the share of them each epoch that filed a report transaction no other observer had already filed — so 100% means every observer did their own work, and a dip means some resubmitted a report someone else produced. Unlike the correlation detectors, this needs no calibration: a shared report transaction is the same report under two wallets, not an inference."}),children:t.jsx(ge,{className:"size-3 cursor-help text-low"})})]}),t.jsxs("span",{className:"text-xs text-low",children:[s.length," epoch",s.length===1?"":"s"]})]}),t.jsx("div",{className:"px-5",children:o?t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"text-2xl font-semibold text-high",children:[o.independence.toFixed(0),"%"]}),t.jsxs("div",{className:"text-xs text-low",children:[o.distinctReportTxIds," of ",o.observationCount," observers filed their own report",n!==void 0?` · epoch ${o.epochIndex}`:""]})]}):t.jsx(P,{className:"h-8 w-24"})}),t.jsx(we,{width:"100%",height:"100%",className:"mb-4 mt-1 min-h-0 flex-1 pr-5 text-xs",children:t.jsxs(Tn,{data:s,margin:{top:5,right:0,left:0,bottom:0},onMouseMove:i=>{i!=null&&i.isTooltipActive&&i.activeTooltipIndex!==void 0&&a(i.activeTooltipIndex)},onMouseLeave:()=>a(void 0),children:[t.jsx("defs",{children:t.jsxs("linearGradient",{id:"independenceGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[t.jsx("stop",{offset:"5%",stopColor:"#E19EE5",stopOpacity:.8}),t.jsx("stop",{offset:"95%",stopColor:"#E19EE5",stopOpacity:.1})]})}),t.jsx(mt,{strokeDasharray:"3 3",stroke:"#ffffff33",vertical:!1}),t.jsx(_e,{dataKey:"epochIndex",tickLine:!1}),t.jsx(Pe,{axisLine:!1,tickLine:!1,tickFormatter:i=>`${i}%`,domain:[0,100],width:38}),t.jsx(Me,{content:t.jsx(Pi,{}),cursor:!1}),t.jsx(On,{type:"monotone",dataKey:"independence",stroke:"#E19EE5",strokeWidth:2,strokeOpacity:.2,fillOpacity:.2,fill:"url(#independenceGradient)",dot:i=>{const{cx:d,cy:c,index:h}=i,u=s[h],m=h===n;return u!=null&&u.lowSample?t.jsx("circle",{cx:d,cy:c,r:3,stroke:"#ffb938",strokeWidth:2,fill:"#09090A"},`independence-dot-${h}`):t.jsx("circle",{cx:d,cy:c,r:m?4:0,stroke:m?"#ffffff":"transparent",strokeWidth:m?2:0,fill:m?"#E19EE5":"transparent"},`independence-dot-${h}`)}})]})})]})},Di=({streak:e,fixedDigits:n=0,rightLabel:a=""})=>{if(e===Number.NEGATIVE_INFINITY)return"N/A";const s=e>=0?"border-streak-up/[.56] bg-streak-up/[.1] text-streak-up":"border-text-red/[.56] bg-text-red/[.1] text-text-red",r=e>=0?t.jsx(Rr,{className:"size-3"}):t.jsx(Er,{className:"size-3"});return t.jsxs("div",{className:`flex w-fit items-center gap-1 rounded-xl border py-0.5 pl-[.4375rem] pr-[.5625rem] ${s}`,children:[r," ",Math.abs(e).toFixed(n),a]})},xa=e=>{const n=x(c=>c.arIOReadSDK),a=x(c=>c.rpc),s=n==null?void 0:n.garProgram,r=x(c=>c.currentEpoch),o=x(c=>c.networkPortalDB),i=x(c=>c.solanaRpcUrl);return M({queryKey:["epochs",i,r==null?void 0:r.epochIndex,r==null?void 0:r.rewardsPrescribed,e],queryFn:async()=>{if(!a||!s||r===void 0)throw new Error("rpc, garProgram, or startEpoch not available");const c=Math.max(0,e-1),h=Array.from({length:c},(p,g)=>r.epochIndex-g-1).filter(p=>p>=0);N.info(`[useEpochsWithCount] Fetching ${h.length} historical epochs for epochCount=${e} before current epoch ${r.epochIndex}.`);const u=await Promise.all(h.map(p=>Xs(o,a,s,p).then(g=>g).catch(g=>{const w=ce(g);N.error(`[useEpochsWithCount] Unexpected error while retrieving epoch ${p}: ${w}`,g)}))),m=u.filter(p=>p!==void 0);if(m.length!==u.length){const p=u.length-m.length;N.info(`[useEpochsWithCount] Missing ${p} historical epoch(s); this can happen when older epochs are not yet available on the current backend.`)}return[r,...m]},enabled:!!a&&!!s&&r!==void 0,staleTime:5*60*1e3})},Fi=e=>{var i;const n=x(d=>d.rpc),a=x(d=>d.arIOReadSDK),s=a==null?void 0:a.garProgram,{data:r}=xa(e);return M({queryKey:["observersWithCount",r==null?void 0:r.length,(i=r==null?void 0:r[0])==null?void 0:i.epochIndex,e,s],queryFn:async()=>{if(!n||!s||!r)throw new Error("rpc, garProgram, or epochs not available");const d=r.filter(u=>u!==void 0).sort((u,m)=>u.epochIndex-m.epochIndex),c=d.filter(u=>typeof u.observationsSubmitted=="number");c.length!==d.length&&N.warn(`[useObserversWithCount] omitting ${d.length-c.length} epoch(s) with no observationsSubmitted counter rather than rendering them as 0`);const h=c.map(u=>{const m=u.prescribedObservers.length,p=u.observationsSubmitted,g=m>0?p/m*100:0;return{epochIndex:u.epochIndex,reportsCount:p,performancePercentage:g,prescribedObservers:m}});return N.info(`[useObserversWithCount] ${h.length} epochs, reports: ${h.map(u=>`${u.epochIndex}:${u.reportsCount}`).join(", ")}`),h},enabled:!!n&&!!s&&!!r,staleTime:5*60*1e3})},$i=(e,n)=>{if(e.length!==0){if(n===void 0)return e.length-1;for(let a=e.length-1;a>=0;a--)if(e[a].epochIndex<n)return a;return e.length-1}},Ui=(e,n)=>e!==void 0&&n!==void 0&&e.epochIndex>=n,Vi=({active:e,payload:n,label:a})=>{if(e&&n&&n.length){const s=n[0].payload;return t.jsxs("div",{className:"rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid",children:[t.jsx("p",{children:`Epoch ${a}`}),t.jsx("p",{children:`Performance: ${Number(n[0].value).toFixed(2)}%`}),t.jsx("p",{children:`Submitted: ${s.reportsCount}/${s.prescribedObservers}`})]})}return null},Bi=7,Gi=()=>{const e=x(w=>w.epochLoadFailed),n=x(w=>{var j;return(j=w.currentEpoch)==null?void 0:j.epochIndex}),{data:a}=De(),{data:s}=Fi(Bi),r=s,[o,i]=l.useState(),[d,c]=l.useState(),h=l.useMemo(()=>$i(r??[],n),[r,n]);l.useEffect(()=>{i(h)},[h]),l.useEffect(()=>{var w;if(!o||!r||!r[o])c(void 0);else{const j=r[o].performancePercentage,y=(w=r[o-1])==null?void 0:w.performancePercentage;c(y!==void 0?j-y:void 0)}},[o,r]);const u=o!==void 0?r==null?void 0:r[o]:void 0,m=u?u.performancePercentage.toFixed(2)+"%":void 0,p=u?`${u.reportsCount}/${u.prescribedObservers}`:void 0,g=Ui(u,n);return t.jsxs("div",{className:"flex h-72 flex-col rounded-xl border border-grey-500 text-sm text-mid",children:[t.jsxs("div",{className:"flex items-center justify-between px-6 pt-5",children:[t.jsx("span",{className:"text-mid",children:"Observer Performance"}),t.jsx("span",{className:"text-xs text-low",children:"Last 7 Epochs"})]}),t.jsxs("div",{className:"flex items-end justify-between px-6",children:[t.jsxs("div",{className:"flex gap-2",children:[t.jsx("div",{className:"py-4 text-[2.625rem] font-bold leading-none text-high",children:m??t.jsx(P,{})}),g?t.jsx("div",{className:"flex h-full flex-col justify-end pb-5",children:t.jsx("span",{className:"text-xs text-low",children:"in progress"})}):d!==void 0&&t.jsx("div",{className:"flex h-full flex-col justify-end pb-5",children:t.jsx(Di,{streak:d,fixedDigits:2,rightLabel:"%"})})]}),t.jsx("div",{className:"pb-5 text-right text-xs",children:p?t.jsxs(t.Fragment,{children:[t.jsx("div",{children:p}),t.jsxs("div",{children:["observations submitted",g?" so far":""]})]}):t.jsx(P,{})})]}),r&&r.length>=2?t.jsx(we,{width:"100%",height:"100%",className:"mb-5 mt-2 min-h-0 flex-1 pr-6 text-xs",children:t.jsxs(Tn,{data:r,margin:{top:5,right:0,left:0,bottom:0},onMouseMove:w=>{w.isTooltipActive&&w.activeTooltipIndex!==void 0&&r&&r[w.activeTooltipIndex]&&i(w.activeTooltipIndex)},onMouseLeave:()=>{i(h)},children:[t.jsx("defs",{children:t.jsxs("linearGradient",{id:"observerPerformanceGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[t.jsx("stop",{offset:"5%",stopColor:"#E19EE5",stopOpacity:.8}),t.jsx("stop",{offset:"95%",stopColor:"#E19EE5",stopOpacity:.1})]})}),t.jsx(mt,{strokeDasharray:"3 3",stroke:"#ffffff33",vertical:!1}),t.jsx(_e,{dataKey:"epochIndex",tickLine:!1}),t.jsx(Pe,{axisLine:!1,tickLine:!1,tickFormatter:w=>`${w}%`,domain:[0,100]}),t.jsx(Me,{content:t.jsx(Vi,{}),cursor:!1}),t.jsx(On,{type:"monotone",dataKey:"performancePercentage",stroke:"#E19EE5",strokeWidth:2,strokeOpacity:.2,fillOpacity:.2,fill:"url(#observerPerformanceGradient)",dot:w=>{const{cx:j,cy:y,index:k}=w,v=k===o;return t.jsx("circle",{cx:j,cy:y,r:v?4:0,stroke:v?"#ffffff":"transparent",strokeWidth:v?2:0,fill:v?"#E19EE5":"transparent"},`observer-dot-${k}`)}})]})}):a&&!a.hasEpochZeroStarted?t.jsx("div",{className:"m-auto pb-12 text-sm italic text-low",children:"Awaiting first epoch..."}):r&&r.length<2?t.jsx("div",{className:"m-auto pb-12 text-sm italic text-low",children:"Historical trend available soon"}):e?t.jsx(Tt,{children:"Observer performance is unavailable because the current epoch could not be read."}):t.jsx(P,{className:"m-auto"})]})},ba=()=>{const e=I(s=>s.portalApiUrl),n=ze(),a=n.networkMatches&&n.documents.includes("economics");return M({queryKey:["analyzerEconomics",e,n.network??""],queryFn:()=>Ge("economics"),staleTime:60*60*1e3,enabled:e.trim().length>0&&a})},cn=1e6,zi=3,qi=(e,n)=>e.length?e[Math.min(e.length-1,Math.floor(e.length*n))]:0,Wi=e=>{if(!(e!=null&&e.length))return;const n=e.filter(o=>typeof o.protocolBalance=="number"&&typeof o.epochIndex=="number").sort((o,i)=>o.epochIndex-i.epochIndex),a=[];for(let o=1;o<n.length;o++){const i=n[o-1],d=n[o];if(d.epochIndex!==i.epochIndex+1)continue;const c=(d.protocolBalance-i.protocolBalance)/cn,h=(d.totalEligibleRewards??0)/cn,u=c+h,m=d.arioPriceUsd;a.push({epochIndex:d.epochIndex,endTimestamp:d.endTimestamp,ario:u,usd:typeof m=="number"?u*m:void 0,offScale:!1})}if(!a.length)return;const s=a.map(o=>o.ario).filter(o=>o>0).sort((o,i)=>o-i),r=qi(s,.9)*zi;for(const o of a)o.offScale=r>0&&o.ario>r;return{points:a,cap:r}},Ki="#E19EE5",Hi="#ffb938",Yi="#7F7F87",hn=e=>{const n=Math.abs(e);return n>=1e6?`${(e/1e6).toFixed(1)}M`:n>=1e3?`${Math.round(e/1e3)}K`:`${Math.round(e)}`},un=e=>Math.abs(e)>=1e3?`$${O(Math.round(e))}`:`$${e.toFixed(2)}`,Zi=()=>{const{data:e}=ba(),n=x(w=>w.ticker),[a,s]=l.useState("ario"),[r,o]=l.useState(),i=l.useMemo(()=>Wi(e==null?void 0:e.series),[e]),d=l.useMemo(()=>(i==null?void 0:i.points.some(w=>typeof w.usd=="number"))??!1,[i]),c=l.useMemo(()=>{if(!i)return;const w=a==="usd";return i.points.map(j=>{const y=w?j.usd??0:j.ario,k=w?i.cap*(j.ario!==0?(j.usd??0)/j.ario:0):i.cap;return{...j,value:y,plotted:j.offScale&&k>0?k:y}})},[i,a]);if(!i||!c)return null;const h=i.points[i.points.length-1],u=r!==void 0?i.points[r]:h,m=i.points.filter(w=>w.offScale).length,p=a==="usd"?typeof(u==null?void 0:u.usd)=="number"?un(u.usd):"—":`${O(Math.round((u==null?void 0:u.ario)??0))} ${n}`,g=({active:w,payload:j})=>{if(!w||!(j!=null&&j.length))return null;const y=j[0].payload;return t.jsxs("div",{className:"rounded-md border border-grey-500 bg-containerL0 px-3 py-2 text-xs",children:[t.jsxs("div",{className:"mb-1 text-mid",children:["Epoch ",y.epochIndex]}),t.jsxs("div",{className:"text-high",children:[O(Math.round(y.ario))," ",n]}),typeof y.usd=="number"&&t.jsxs("div",{className:"text-low",children:[un(y.usd)," at the time"]}),y.offScale&&t.jsx("div",{className:"mt-1 max-w-48 text-warning",children:"Bar clipped — a treasury movement this large is not ordinary income."})]})};return t.jsxs("div",{className:"col-span-1 flex h-full min-h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-4",children:[t.jsxs("div",{className:"flex flex-wrap items-start justify-between gap-2 px-5 pb-2 pt-5",children:[t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx("h3",{className:"text-sm font-semibold text-mid",children:"Protocol Inflow"}),t.jsx(se,{message:t.jsxs("div",{className:"max-w-80",children:["What flowed into the protocol treasury each epoch — the change in its balance plus the rewards it paid out over the same period.",t.jsx("br",{}),t.jsx("br",{}),"Called inflow rather than revenue on purpose: this measures everything that moved into the treasury, and cannot separate registration fees from one-off transfers. USD figures use the ARIO price at that epoch, so they are what the inflow was worth then."]}),children:t.jsx(ge,{className:"size-3 cursor-help text-low"})})]}),d&&t.jsx("div",{className:"flex overflow-hidden rounded-md border border-grey-600 text-xs",children:["ario","usd"].map(w=>t.jsx("button",{onClick:()=>s(w),className:`px-3 py-2 transition-colors sm:px-2.5 sm:py-1 ${a===w?"bg-grey-700 text-high":"text-low hover:text-mid"}`,children:w==="ario"?n||"ARIO":"USD"},w))})]}),t.jsxs("div",{className:"px-5",children:[t.jsx("div",{className:"text-2xl font-semibold text-high",children:p}),t.jsx("div",{className:"text-xs text-low",children:r!==void 0?`epoch ${u==null?void 0:u.epochIndex}`:`most recent epoch (${u==null?void 0:u.epochIndex})`})]}),t.jsx(we,{width:"100%",height:"100%",className:"mt-2 min-h-0 flex-1 pr-5 text-xs",children:t.jsxs(Ln,{data:c,margin:{top:5,right:0,left:0,bottom:0},onMouseMove:w=>{w!=null&&w.isTooltipActive&&w.activeTooltipIndex!==void 0&&o(w.activeTooltipIndex)},onMouseLeave:()=>o(void 0),children:[t.jsx(mt,{strokeDasharray:"3 3",stroke:"#ffffff33",vertical:!1}),t.jsx(_e,{dataKey:"epochIndex",tickLine:!1}),t.jsx(Pe,{axisLine:!1,tickLine:!1,width:48,tickFormatter:w=>a==="usd"?`$${hn(w)}`:hn(w)}),t.jsx(Me,{content:t.jsx(g,{}),cursor:{fill:"#ffffff0a"}}),t.jsx(ie,{dataKey:"plotted",radius:[2,2,0,0],children:c.map((w,j)=>t.jsx(Se,{fill:w.offScale?Hi:w.value<0?Yi:Ki,fillOpacity:r===void 0||r===j?1:.4},w.epochIndex))})]})}),m>0&&t.jsxs("div",{className:"px-5 pb-4 pt-1 text-xs text-low",children:[m===1?"One epoch is":`${m} epochs are`," ","clipped in amber: a treasury movement far larger than any epoch of income, which would otherwise flatten the rest."]})]})},Qi=({value:e,options:n,onChange:a})=>t.jsx("div",{className:"flex overflow-hidden rounded-md border border-grey-600 text-xs",children:n.map(s=>t.jsx("button",{onClick:()=>a(s.value),className:`px-3 py-2 transition-colors sm:px-2.5 sm:py-1 ${e===s.value?"bg-grey-700 text-high":"text-low hover:text-mid"}`,children:s.label},s.value))}),Xi=()=>{const{data:e}=ba();return l.useMemo(()=>{const n=new Map;for(const a of(e==null?void 0:e.series)??[])typeof a.arioPriceUsd=="number"&&a.arioPriceUsd>0&&n.set(a.epochIndex,a.arioPriceUsd);return n},[e])},Ji=2,el=({ownPrice:e,epochIndex:n,currentEpochIndex:a,latest:s})=>{if(e!==void 0)return{price:e,basis:"own"};if(!(a!==void 0&&n===a)||s===void 0)return{price:void 0,basis:"none"};const o=n-s.epochIndex;return o<1||o>Ji?{price:void 0,basis:"none"}:{price:s.price,basis:"latest",fromEpoch:s.epochIndex}},tl=e=>{let n;for(const[a,s]of e)(n===void 0||a>n.epochIndex)&&(n={epochIndex:a,price:s});return n},nl=(e,n,a)=>n==="usd"?`$${O(Math.round(e))}`:`${O(e)} ${a||"ARIO"}`,al=(e,n)=>n==="usd"?`$${O(Math.round(e))}`:O(e),sl=[{label:"Gateway rewards",swatch:"linear-gradient(135deg, #F7C3A1, #DF9BE8)"},{label:"Observer rewards",swatch:"#3DB7C2"},{label:"Gateway, not paid",swatch:"rgba(223, 155, 232, 0.12)",outline:"rgba(223, 155, 232, 0.6)"},{label:"Observer, not paid",swatch:"rgba(61, 183, 194, 0.12)",outline:"rgba(61, 183, 194, 0.6)"}],pn=7,rl=({active:e,payload:n,label:a,unit:s,ticker:r})=>{if(e&&n&&n.length){const o=n[0].payload;if(s==="usd"&&!o.priced)return t.jsxs("div",{className:"rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid",children:[t.jsx("p",{children:`Epoch ${a} (${o.status})`}),t.jsx("p",{className:"text-low",children:"Not priced yet"})]});const i=p=>nl(p,s??"ario",r);if(!o.split)return t.jsxs("div",{className:"max-w-60 rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid",children:[t.jsx("p",{children:`Epoch ${a} (${o.status})`}),o.total!==void 0&&t.jsx("p",{children:`Total eligible: ${i(o.total)}`}),o.pricedFromEpoch!==void 0&&t.jsx("p",{className:"text-low",children:`Valued at epoch ${o.pricedFromEpoch}'s close — this epoch has not closed yet.`}),t.jsx("p",{className:"text-low",children:o.splitReason==="skipped"?"No observations were submitted for this epoch, so it paid nothing and the rewards stayed in the treasury. The figure above is what it would have paid.":o.splitReason==="unavailable"?"This epoch had no observers selected, so its gateway share cannot be shown.":"How this splits between gateways and observers is set on chain after the epoch starts."})]});const d=o.gatewayRewards??0,c=o.observerRewards??0,h=o.rewardsForfeited??0,u=o.forfeitedGateway??0,m=o.forfeitedObserver??0;return t.jsxs("div",{className:"rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid",children:[t.jsx("p",{children:`Epoch ${a} (${o.status})`}),t.jsx("p",{children:`Gateway Rewards: ${i(d)}`}),t.jsx("p",{children:`Observer Rewards: ${i(c)}`}),h>0&&t.jsx("p",{className:"text-low",children:`Not paid out: ${i(h)}`}),t.jsx("p",{children:`Total eligible: ${i(d+c+h)}`}),h>0&&t.jsxs("p",{className:"max-w-60 text-low",children:[[u>0?`${i(u)} to gateways that failed the epoch`:void 0,m>0?`${i(m)} to observers that did not submit`:void 0].filter(Boolean).join(", "),". Neither is paid; it stays in the treasury."]}),o.pricedFromEpoch!==void 0&&t.jsx("p",{className:"max-w-60 text-low",children:`Valued at epoch ${o.pricedFromEpoch}'s close — this epoch has not closed yet.`})]})}return null},mn=e=>({x:a,y:s,width:r,height:o})=>o?t.jsx("rect",{x:Number(a)+.5,y:Number(s)+.5,width:Math.max(0,Number(r)-1),height:Math.max(0,Number(o)-1),fill:`rgba(${e}, 0.12)`,stroke:`rgba(${e}, 0.6)`,strokeDasharray:"2 2"}):t.jsx(t.Fragment,{}),ol="223, 155, 232",il="61, 183, 194",ll=({x:e,y:n,width:a,height:s})=>s?t.jsx("rect",{x:Number(e)+.5,y:Number(n)+.5,width:Math.max(0,Number(a)-1),height:Math.max(0,Number(s)-1),fill:"rgba(202, 202, 214, 0.04)",stroke:"rgba(202, 202, 214, 0.45)",strokeDasharray:"4 3"}):t.jsx(t.Fragment,{}),gn=(e,n)=>({fill:s,x:r,y:o,width:i,height:d})=>{const c="rgba(202, 202, 214, 0.32)";return d?t.jsxs("g",{children:[t.jsx("rect",{x:r,y:o,width:i,height:d,stroke:"none",fill:s}),t.jsx("rect",{x:r,y:o,width:i,height:e,stroke:"none",fill:n}),t.jsx("rect",{x:r,y:o,width:1,height:d,fill:c}),t.jsx("rect",{x:Number(r)+Number(i)-1,y:o,width:1,height:d,fill:c})]}):t.jsx(t.Fragment,{})},dl=()=>{const e=x(f=>f.ticker),[n,a]=l.useState("ario"),s=Xi(),r=l.useMemo(()=>tl(s),[s]),[o,i]=l.useState(),[d,c]=l.useState(!0),{data:h}=xa(pn),u=x(f=>f.epochLoadFailed),{data:m}=De(),p=x(f=>{var b;return(b=f.currentEpoch)==null?void 0:b.epochIndex}),g=l.useMemo(()=>h==null?void 0:h.filter(f=>f!==void 0).sort((f,b)=>f.epochIndex-b.epochIndex).map(f=>{const b=new $(f.distributions.totalEligibleGatewayReward).toARIO().valueOf(),E=new $(f.distributions.totalEligibleObserverReward).toARIO().valueOf(),A=new $(f.distributions.totalEligibleRewards).toARIO().valueOf(),C=R=>R===void 0?void 0:new $(R).toARIO().valueOf(),T=C(f.forfeitedGatewayReward),D=C(f.forfeitedObserverReward),L=T===void 0&&D===void 0?void 0:(T??0)+(D??0),S=el({ownPrice:s.get(f.epochIndex),epochIndex:f.epochIndex,currentEpochIndex:p,latest:r}),F=S.price,V=n==="usd",_=R=>V?F===void 0?void 0:R*F:R,z=f.rewardsSkipped===!0,B=!z&&f.rewardsSplitKnown!==!1,re=z?"skipped":B?void 0:f.rewardsPrescribed===!1?"pending":"unavailable";return{epoch:f.epochIndex,gatewayRewards:B?_(Math.max(0,b-(T??0))):void 0,observerRewards:B?_(Math.max(0,E-(D??0))):void 0,rewardsForfeited:B&&L!==void 0&&L>0?_(L):void 0,forfeitedGateway:B&&T?_(T):void 0,forfeitedObserver:B&&D?_(D):void 0,split:B,splitReason:re,total:_(A),pendingTotal:B?void 0:_(A),priced:F!==void 0,...S.basis==="latest"?{pricedFromEpoch:S.fromEpoch}:{},status:z?"Not paid":f.epochIndex===p?"Pending":"Distributed"}}),[h,p,s,r,n]),w=(g==null?void 0:g.some(f=>f.splitReason==="pending"))??!1,j=(g==null?void 0:g.some(f=>f.splitReason==="unavailable"))??!1,y=(g==null?void 0:g.some(f=>f.splitReason==="skipped"))??!1,k=(g==null?void 0:g.filter(f=>f.priced).length)??0,v=((g==null?void 0:g.length)??0)-k;return t.jsxs("div",{className:"rounded-xl border border-grey-500",children:[t.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 px-5 pb-3 pt-5",children:[t.jsx("span",{className:"text-sm text-mid",children:"Rewards by Epoch"}),t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsxs("span",{className:"text-xs text-low",children:["Last ",pn," Epochs"]}),k>0&&t.jsx(Qi,{value:n,onChange:a,options:[{value:"ario",label:e||"ARIO"},{value:"usd",label:"USD"}]})]})]}),t.jsx("div",{className:"relative h-56",children:g&&g.length>0?t.jsx("div",{className:"size-full text-xs text-low",children:t.jsx(we,{width:"100%",height:"100%",children:t.jsxs(Ln,{data:g,margin:{top:20,right:16,left:8,bottom:10},onMouseMove:f=>{f.isTooltipActive&&f.activeTooltipIndex!==void 0?(i(f.activeTooltipIndex),c(!1)):(i(void 0),c(!0))},onMouseLeave:()=>{c(!0)},barCategoryGap:"20%",children:[t.jsxs("defs",{children:[t.jsxs("linearGradient",{id:"gatewayRewardGradient",x1:"0",y1:"0",x2:"1",y2:"1",children:[t.jsx("stop",{offset:"0%",stopColor:"#F7C3A1",stopOpacity:.25}),t.jsx("stop",{offset:"100%",stopColor:"#DF9BE8",stopOpacity:.125})]}),t.jsxs("linearGradient",{id:"gatewayRewardHover",x1:"0",y1:"0",x2:"1",y2:"1",children:[t.jsx("stop",{offset:"0%",stopColor:"#F7C3A1",stopOpacity:.75}),t.jsx("stop",{offset:"100%",stopColor:"#DF9BE8",stopOpacity:.5})]}),t.jsxs("linearGradient",{id:"observerRewardGradient",x1:"0",y1:"0",x2:"1",y2:"1",children:[t.jsx("stop",{offset:"0%",stopColor:"#3DB7C2",stopOpacity:.3}),t.jsx("stop",{offset:"100%",stopColor:"#3DB7C2",stopOpacity:.15})]}),t.jsxs("linearGradient",{id:"observerRewardHover",x1:"0",y1:"0",x2:"1",y2:"1",children:[t.jsx("stop",{offset:"0%",stopColor:"#3DB7C2",stopOpacity:.75}),t.jsx("stop",{offset:"100%",stopColor:"#3DB7C2",stopOpacity:.5})]})]}),t.jsx(_e,{dataKey:"epoch"}),t.jsx(Pe,{width:n==="usd"?56:48,tickFormatter:f=>al(f,n)}),t.jsx(Me,{content:t.jsx(rl,{unit:n,ticker:e}),cursor:!1}),t.jsx(ie,{dataKey:"gatewayRewards",name:"Gateway Rewards",stackId:"rewards",fill:"url(#gatewayRewardGradient)",stroke:"rgba(202, 202, 214, 0.32)",shape:gn(0,"transparent"),children:g.map((f,b)=>t.jsx(Se,{fill:b!==o||d?"url(#gatewayRewardGradient)":"url(#gatewayRewardHover)"},`gw-${b}`))}),t.jsx(ie,{dataKey:"observerRewards",name:"Observer Rewards",stackId:"rewards",fill:"url(#observerRewardGradient)",stroke:"rgba(202, 202, 214, 0.32)",shape:gn(1,"white"),children:g.map((f,b)=>t.jsx(Se,{fill:b!==o||d?"url(#observerRewardGradient)":"url(#observerRewardHover)"},`obs-${b}`))}),t.jsx(ie,{dataKey:"forfeitedGateway",name:"Gateway, not paid",stackId:"rewards",shape:mn(ol),isAnimationActive:!1}),t.jsx(ie,{dataKey:"forfeitedObserver",name:"Observer, not paid",stackId:"rewards",shape:mn(il),isAnimationActive:!1}),t.jsx(ie,{dataKey:"pendingTotal",name:"Split pending",stackId:"rewards",shape:ll,isAnimationActive:!1})]})})}):m&&!m.hasEpochZeroStarted?t.jsx("div",{className:"flex size-full",children:t.jsx("div",{className:"m-auto h-4 text-sm italic text-low",children:"Awaiting first epoch..."})}):u?t.jsx(Tt,{children:"Rewards history is unavailable because the current epoch could not be read."}):t.jsx("div",{className:"flex size-full",children:t.jsx(P,{className:"m-auto h-4"})})}),g&&g.length>0&&t.jsxs("div",{className:"flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-4 text-xs text-low",children:[sl.map(f=>t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx("span",{"aria-hidden":"true",className:"size-2 min-w-2 rounded-full",style:{background:f.swatch,border:"outline"in f?`1px solid ${f.outline}`:void 0}}),t.jsx("span",{children:f.label})]},f.label)),w&&t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx("span",{"aria-hidden":"true",className:"size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"}),t.jsx("span",{children:"Split pending"})]}),j&&t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx("span",{"aria-hidden":"true",className:"size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"}),t.jsx("span",{children:"Split not available"})]}),y&&t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx("span",{"aria-hidden":"true",className:"size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"}),t.jsx("span",{children:"Not paid"})]}),t.jsx("span",{className:"ml-auto",children:n==="usd"?"USD":e||"ARIO"})]}),n==="usd"&&v>0&&t.jsxs("div",{className:"px-5 pb-4 text-xs text-low",children:[v," epoch",v===1?"":"s"," not priced yet — each epoch is valued at its own closing price."]})]})},cl=()=>t.jsxs("div",{className:"pl-4 pb-4 lg:pl-6 flex h-full max-w-full flex-col",children:[t.jsx("div",{className:"mb-4 shrink-0 pr-4 lg:pr-6",children:t.jsx(Ko,{})}),t.jsx("div",{className:"flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar scrollbar-thin lg:pr-3",children:t.jsxs("div",{className:"h-full w-full space-y-6",children:[t.jsx(Ci,{}),t.jsxs("div",{className:"w-full grid grid-cols-1 md:grid-cols-6 gap-6",children:[t.jsx("div",{className:"col-span-1 md:col-span-2",children:t.jsx(Oi,{})}),t.jsx("div",{className:"col-span-1 md:col-span-2",children:t.jsx(hi,{})}),t.jsx("div",{className:"col-span-1 md:col-span-2",children:t.jsx(Gi,{})}),t.jsx(Ri,{}),t.jsx(Ei,{}),t.jsx(Ii,{}),t.jsx(Zi,{}),t.jsx(Mi,{}),t.jsx("div",{className:"col-span-1 md:col-span-6",children:t.jsx(dl,{})})]})]})})]}),W=()=>t.jsx("div",{className:"flex size-full items-center justify-center dark:text-grey-500",children:"Loading"}),hl=()=>t.jsx("div",{className:"flex size-full items-center justify-center",children:t.jsx("p",{children:"Page Not Found"})}),ul=H.lazy(()=>X(()=>import("./index-BbyFAoPX.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url)),pl=H.lazy(()=>X(()=>import("./index-CeE2IHdJ.js"),__vite__mapDeps([12,1,2,7,8,13,5,14,15,16,17,4,18,19,20]),import.meta.url)),ml=H.lazy(()=>X(()=>import("./index-Bbji_mWL.js"),__vite__mapDeps([21,1,2,3,4,17,8,9,7,10,16,13,11,15]),import.meta.url)),gl=H.lazy(()=>X(()=>import("./index-DTexrLZ_.js"),__vite__mapDeps([22,1,2,5,6,7,23,19,8,9,18,13,24]),import.meta.url)),wl=H.lazy(()=>X(()=>import("./index-BfGRncHZ.js"),__vite__mapDeps([25,1,2,17,7,26,8,9,10,11]),import.meta.url)),fl=H.lazy(()=>X(()=>import("./BalancesForAddress-BFNMgzgX.js"),__vite__mapDeps([27,1,2,23,15,17,7,26,8,9,13]),import.meta.url)),xl=H.lazy(()=>X(()=>import("./Extensions-BI3V1u0w.js"),__vite__mapDeps([28,1,2]),import.meta.url)),bl=H.lazy(()=>X(()=>import("./index-C72jB3s1.js"),__vite__mapDeps([29,1,2,7,14,9,13,20,19]),import.meta.url)),vl=H.lazy(()=>X(()=>import("./index-GTKgHhlV.js"),__vite__mapDeps([30,1,2,7,20,8,31,11,9,13,14]),import.meta.url)),yl=H.lazy(()=>X(()=>import("./index-CBndBN9K.js"),__vite__mapDeps([32,1,2,31,11,7,9,13,24,14]),import.meta.url));function kl(e){return JSON.stringify(e,(()=>{const n=new WeakSet;return(a,s)=>{if(typeof s=="object"&&s!==null){if("rpcEndpoint"in s&&typeof s.rpcEndpoint=="string")return s.rpcEndpoint;if(n.has(s))return"[circular]";n.add(s)}return s}})())}const jl=new ps({defaultOptions:{queries:{queryKeyHashFn:kl,staleTime:5*60*1e3,refetchOnWindowFocus:!1,refetchOnReconnect:!1,retry:0}}});function Al(){const e=I(s=>s.solanaRpcUrl),n=l.useMemo(()=>[],[]),a=ms(gs(t.jsxs(U,{element:t.jsx(no,{}),errorElement:t.jsx(hl,{}),children:[t.jsx(U,{index:!0,path:"/",element:t.jsx(Pt,{to:"/dashboard"})}),t.jsx(U,{path:"dashboard",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(cl,{})})}),",",t.jsx(U,{path:"gateways/:ownerId/reports/:reportId",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(vl,{})})}),",",t.jsx(U,{path:"gateways/:ownerId/reports",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(bl,{})})}),",",t.jsx(U,{path:"gateways/:ownerId/observe",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(yl,{})})}),",",t.jsx(U,{path:"gateways/:ownerId",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(pl,{})})}),t.jsx(U,{path:"gateways",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(ul,{})})}),",",t.jsx(U,{path:"staking",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(ml,{})})}),",",t.jsx(U,{path:"observers",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(gl,{})})}),",",t.jsx(U,{path:"balances/:walletAddress",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(fl,{})})}),",",t.jsx(U,{path:"balances",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(wl,{})})}),",",t.jsx(U,{path:"extensions",element:t.jsx(l.Suspense,{fallback:t.jsx(W,{}),children:t.jsx(xl,{})})}),",",t.jsx(U,{path:"*",element:t.jsx(Pt,{to:"/"})})]})));return t.jsx(ws,{endpoint:e,children:t.jsx(fs,{wallets:n,autoConnect:!0,children:t.jsx(xs,{children:t.jsx(bs,{client:jl,children:t.jsx(Pr,{children:t.jsx($r,{children:t.jsx(vs,{children:t.jsx(ys,{router:a})})})})})})})})}ks.default.setLogLevel("none");js.createRoot(document.getElementById("root")).render(t.jsx(H.StrictMode,{children:t.jsx(Al,{})}));export{vi as $,pi as A,ae as B,ua as C,_l as D,mi as E,ui as F,pa as G,Ko as H,Et as I,Rt as J,na as K,Z as L,Nt as M,pe as N,Rl as O,P,Ht as Q,mo as R,Bt as S,se as T,De as U,ht as V,gt as W,rn as X,fi as Y,xi as Z,bi as _,Fe as a,Vl as a0,sn as a1,wi as a2,N as a3,ci as a4,Gl as a5,ce as a6,Ul as a7,be as a8,Tl as a9,Li as aa,qt as ab,Ue as ac,co as ad,he as ae,ha as af,xo as ag,hi as ah,po as ai,$e as aj,hr as ak,Xs as al,Ml as am,Dl as an,Il as ao,Pl as ap,Ol as aq,jr as b,Ni as c,ko as d,O as e,Kt as f,Di as g,Ll as h,Vn as i,bo as j,Wo as k,pr as l,I as m,ze as n,Ge as o,Fl as p,$l as q,Ve as r,Wt as s,Q as t,x as u,on as v,ee as w,Sl as x,El as y,Bl as z};
