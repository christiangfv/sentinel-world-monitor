(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,1641,e=>{"use strict";var t=e.i(43476),i=e.i(71645),s=e.i(70703),r=e.i(32322),o=e.i(37772),l=e.i(26718);let n=(0,s.default)(()=>e.A(52169).then(e=>e.Marker),{loadableGenerated:{modules:[94970]},ssr:!1}),d=(0,s.default)(()=>e.A(52169).then(e=>e.Popup),{loadableGenerated:{modules:[94970]},ssr:!1}),a={earthquake:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M12 28 L18 20 L24 32 L30 16 L36 36 L44 28" stroke="${e}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,tsunami:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M8 30 Q14 22 20 30 Q26 38 32 30 Q38 22 44 30 Q50 38 56 30" stroke="${e}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M10 38 Q16 30 22 38 Q28 46 34 38 Q40 30 46 38" stroke="${e}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>
  `,volcano:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M14 44 L24 24 L28 28 L32 24 L42 44 Z" fill="${o.BRAND_COLORS.abyss}" stroke="${e}" stroke-width="2"/>
      <ellipse cx="28" cy="24" rx="4" ry="2" fill="${o.BRAND_COLORS.plasma}"/>
      <circle cx="28" cy="16" r="3" fill="${o.BRAND_COLORS.plasma}" opacity="0.7"/>
    </svg>
  `,wildfire:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M28 44 C20 44 16 36 16 30 C16 24 20 20 24 18 C22 22 24 26 28 26 C26 22 28 16 32 12 C32 20 36 22 38 26 C40 30 40 36 36 40 C34 42 32 44 28 44 Z" fill="${e}"/>
      <path d="M28 44 C24 44 22 40 22 36 C22 32 24 30 26 28 C25 31 26 33 28 33 C27 31 28 28 30 26 C30 30 32 32 33 34 C34 36 34 40 32 42 C31 43 30 44 28 44 Z" fill="${o.BRAND_COLORS.muted}" opacity="0.8"/>
    </svg>
  `,flood:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M8 24 Q14 18 20 24 Q26 30 32 24 Q38 18 44 24" stroke="${e}" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 32 Q14 26 20 32 Q26 38 32 32 Q38 26 44 32" stroke="${e}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 40 Q14 34 20 40 Q26 46 32 40 Q38 34 44 40" stroke="${e}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `,storm:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <circle cx="28" cy="28" r="8" fill="none" stroke="${e}" stroke-width="2"/>
      <line x1="28" y1="8" x2="28" y2="16" stroke="${e}" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="40" x2="28" y2="48" stroke="${e}" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="28" x2="16" y2="28" stroke="${e}" stroke-width="2" stroke-linecap="round"/>
      <line x1="40" y1="28" x2="48" y2="28" stroke="${e}" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,landslide:e=>`
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${o.BRAND_COLORS.shadow}" stroke="${e}" stroke-width="2"/>
      <path d="M16 16 L40 16 L28 44 Z" fill="none" stroke="${e}" stroke-width="2"/>
      <circle cx="28" cy="24" r="3" fill="${e}"/>
      <circle cx="24" cy="32" r="2.5" fill="${e}" opacity="0.8"/>
      <circle cx="32" cy="32" r="2.5" fill="${e}" opacity="0.8"/>
    </svg>
  `};function c({event:e,onClick:s}){let c;if(!e.location||"number"!=typeof e.location.lat||"number"!=typeof e.location.lng||isNaN(e.location.lat)||isNaN(e.location.lng))return console.warn("EventMarker: Invalid coordinates for event:",e.id,e.location),null;let h=(0,i.useMemo)(()=>{o.DISASTER_CONFIGS[e.disasterType];let t=(0,l.getSeverityColor)(e.severity),i=a[e.disasterType](t),s=`
      <div style="
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transition: transform 0.2s ease;
      " class="disaster-marker">
        ${i}
      </div>
    `;return new r.DivIcon({html:s,className:"custom-event-marker",iconSize:[36,36],iconAnchor:[18,18]})},[e.disasterType,e.severity]);return(0,t.jsx)(n,{position:[e.location.lat,e.location.lng],icon:h,eventHandlers:{click:()=>s?.(e)},children:(0,t.jsx)(d,{children:(0,t.jsx)("div",{className:"p-3 max-w-sm",children:(0,t.jsxs)("div",{className:"flex items-start gap-3",children:[(0,t.jsx)("div",{className:"w-10 h-10 flex-shrink-0",dangerouslySetInnerHTML:{__html:a[e.disasterType](o.DISASTER_CONFIGS[e.disasterType].color).replace('width="32"','width="40"').replace('height="32"','height="40"')}}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("h3",{className:"font-semibold text-sm mb-1 leading-tight",children:e.title}),(0,t.jsx)("p",{className:"text-xs text-muted-foreground mb-2",children:e.locationName}),(0,t.jsxs)("div",{className:"flex items-center gap-2 mb-2",children:[(0,t.jsx)("span",{className:"px-2 py-1 rounded text-white text-xs font-medium",style:{backgroundColor:(0,l.getSeverityColor)(e.severity)},children:o.DISASTER_CONFIGS[e.disasterType].severityLabels[e.severity]}),(0,t.jsx)("span",{className:"text-xs text-muted-foreground capitalize",children:o.DISASTER_CONFIGS[e.disasterType].nameEs})]}),(0,t.jsxs)("div",{className:"text-xs text-muted-foreground space-y-1",children:[(0,t.jsxs)("div",{children:["📅 ",(c=e.eventTime,new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"}).format(c))]}),e.magnitude&&(0,t.jsxs)("div",{children:["📊 Magnitud: ",e.magnitude.toFixed(1)]}),e.depth&&(0,t.jsxs)("div",{children:["📏 Profundidad: ",e.depth,"km"]})]}),e.description&&(0,t.jsx)("p",{className:"text-xs text-muted-foreground mt-2 pt-2 border-t",children:e.description})]})]})})})})}e.s(["EventMarker",()=>c])},94735,e=>{e.n(e.i(1641))}]);