import{a as r,j as e,N as d,b as x,m}from"./index-DX2rs9iz.js";import{u as h,a as f}from"./SuccessModal-CGON7V6e.js";import{P as o,a as g}from"./useGateway-B8_TYSi2.js";(function(){try{var s=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},t=new Error().stack;t&&(s._sentryDebugIds=s._sentryDebugIds||{},s._sentryDebugIds[t]="0aab927e-6c73-49dd-01b2-396d462dbbef",s._sentryDebugIdIdentifier="sentry-dbid-0aab927e-6c73-49dd-01b2-396d462dbbef")}catch{}})();const u=()=>{const s=r(a=>a.blockHeight),t=r(a=>a.currentEpoch),n=r(a=>a.ticker),{isLoading:c,data:i}=h(),{data:l}=f();return e.jsxs("header",{className:"mt-6 flex h-[4.5rem] rounded-xl border py-4 pl-6 pr-4 leading-[1.4] dark:border-transparent-100-8 dark:bg-grey-1000 dark:text-grey-300",children:[e.jsxs("div",{className:"inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r pr-6 dark:border-transparent-100-8",children:[e.jsx("div",{className:"text-xs text-high",children:(t==null?void 0:t.epochIndex)!==void 0?t.epochIndex.toLocaleString("en-US"):d}),e.jsx("div",{className:"pt-1 text-xs leading-none text-low",children:"AR.IO EPOCH"})]}),e.jsxs("div",{className:"inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8",children:[e.jsx("div",{className:"text-xs text-high",children:s?s.toLocaleString("en-US"):d}),e.jsx("div",{className:"pt-1 text-xs leading-none text-low",children:"ARWEAVE BLOCK"})]}),e.jsxs("div",{className:"inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8",children:[e.jsx("div",{className:"text-xs text-high",children:c?e.jsx(o,{className:"h-[1.0625rem]"}):i?Object.values(i).filter(a=>a.status==="joined").length:d}),e.jsx("div",{className:"pt-1 text-xs leading-none text-low",children:"GATEWAYS"})]}),e.jsxs("div",{className:"inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-6 dark:border-transparent-100-8",children:[e.jsx("div",{className:"text-xs text-high",children:l==null?e.jsx(o,{className:"h-[1.0625rem]"}):e.jsxs("div",{children:[x(new m(l).toIO().valueOf())," ",n]})}),e.jsx("div",{className:"pt-1 text-xs leading-none text-low",children:"PROTOCOL BALANCE"})]}),e.jsx("div",{className:"grow"}),e.jsx("div",{className:"content-center",children:e.jsx(g,{})})]})};export{u as H};
//# sourceMappingURL=Header-RHOCmjXs.js.map