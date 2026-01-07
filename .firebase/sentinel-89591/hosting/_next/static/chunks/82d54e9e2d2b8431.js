(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,26718,e=>{"use strict";var t=e.i(37772);function i(e){return({1:"#22c55e",2:"#eab308",3:"#f97316",4:"#ef4444"})[e]}function s(e,i){return t.DISASTER_CONFIGS[e].severityLabels[i]}e.s(["getSeverityColor",()=>i,"getSeverityLabel",()=>s])},1641,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(70703),r=e.i(32322),n=e.i(37772),o=e.i(26718);let a=(0,s.default)(()=>e.A(52169).then(e=>e.Marker),{loadableGenerated:{modules:[94970]},ssr:!1}),l=(0,s.default)(()=>e.A(52169).then(e=>e.Popup),{loadableGenerated:{modules:[94970]},ssr:!1});function d({event:e,onClick:s}){let d;if(!e.location||"number"!=typeof e.location.lat||"number"!=typeof e.location.lng||isNaN(e.location.lat)||isNaN(e.location.lng))return console.warn("EventMarker: Invalid coordinates for event:",e.id,e.location),null;let c=(0,i.useMemo)(()=>{let t=n.DISASTER_CONFIGS[e.disasterType],i=(0,o.getSeverityColor)(e.severity),s=`
      <div style="
        background-color: ${i};
        border: 2px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${t.icon}
      </div>
    `;return new r.DivIcon({html:s,className:"custom-event-marker",iconSize:[24,24],iconAnchor:[12,12]})},[e.disasterType,e.severity]);return(0,t.jsx)(a,{position:[e.location.lat,e.location.lng],icon:c,eventHandlers:{click:()=>s?.(e)},children:(0,t.jsx)(l,{children:(0,t.jsx)("div",{className:"p-3 max-w-sm",children:(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("div",{className:"text-2xl",children:n.DISASTER_CONFIGS[e.disasterType].icon}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("h3",{className:"font-semibold text-sm mb-1 leading-tight",children:e.title}),(0,t.jsx)("p",{className:"text-xs text-muted-foreground mb-2",children:e.locationName}),(0,t.jsxs)("div",{className:"flex items-center gap-2 mb-2",children:[(0,t.jsx)("span",{className:"px-2 py-1 rounded text-white text-xs font-medium",style:{backgroundColor:(0,o.getSeverityColor)(e.severity)},children:n.DISASTER_CONFIGS[e.disasterType].severityLabels[e.severity]}),(0,t.jsx)("span",{className:"text-xs text-muted-foreground capitalize",children:n.DISASTER_CONFIGS[e.disasterType].nameEs})]}),(0,t.jsxs)("div",{className:"text-xs text-muted-foreground space-y-1",children:[(0,t.jsxs)("div",{children:["📅 ",(d=e.eventTime,new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"}).format(d))]}),e.magnitude&&(0,t.jsxs)("div",{children:["📊 Magnitud: ",e.magnitude.toFixed(1)]}),e.depth&&(0,t.jsxs)("div",{children:["📏 Profundidad: ",e.depth,"km"]})]}),e.description&&(0,t.jsx)("p",{className:"text-xs text-muted-foreground mt-2 pt-2 border-t",children:e.description})]})]})})})})}e.s(["EventMarker",()=>d])},94735,e=>{e.n(e.i(1641))}]);