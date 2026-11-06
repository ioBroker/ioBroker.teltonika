import{createRoot as e,jsx as t,jsxs as n}from"../../../lib/esm/react-19.js";var r=`iob-dialog-close`;function i(e){return!!e.form}var a=[`header`,`staticText`,`divider`];function o(e,t){return e==null?``:typeof e==`object`?e[t]||e.en||Object.values(e).find(e=>!!e)||``:String(e)}function s(e){let t={};for(let[n,r]of Object.entries(e.items||{}))r&&!a.includes(r.type)&&(t[n]=r.type);return t}function c(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?e.toString():JSON.stringify(e)}function l(e,t){if(t!=null)switch(e){case`number`:case`slider`:{if(typeof t==`number`)return Number.isFinite(t)?t:void 0;let e=c(t).trim().replace(`,`,`.`);if(!e)return;let n=Number(e);return Number.isFinite(n)?n:void 0}case`checkbox`:return t===!0||t===`true`||t===1||t===`1`;default:return c(t)}}function u(e,t){let n={};for(let[r,i]of Object.entries(e)){let e=l(i,t[r]);e!==void 0&&(n[r]=e)}return n}var d=`"Roboto", "Helvetica", "Arial", sans-serif`,f=Object.freeze({type:`light`,primary:`#3399CC`,primaryContrast:`#FFFFFF`,secondary:`#164477`,secondaryContrast:`#FFFFFF`,background:`#FFFFFF`,paper:`#FFFFFF`,text:`rgba(0, 0, 0, 0.87)`,textSecondary:`rgba(0, 0, 0, 0.6)`,divider:`rgba(0, 0, 0, 0.12)`,error:`#D32F2F`,warning:`#ED6C02`,info:`#0288D1`,success:`#2E7D32`,fontFamily:d,fontSize:14,borderRadius:4}),p=Object.freeze({type:`dark`,primary:`#4DABF5`,primaryContrast:`rgba(0, 0, 0, 0.87)`,secondary:`#436A93`,secondaryContrast:`#FFFFFF`,background:`#121212`,paper:`#121212`,text:`#FFFFFF`,textSecondary:`rgba(255, 255, 255, 0.7)`,divider:`rgba(255, 255, 255, 0.12)`,error:`#F44336`,warning:`#FFA726`,info:`#29B6F6`,success:`#66BB6A`,fontFamily:d,fontSize:14,borderRadius:4}),m=[`primary`,`primaryContrast`,`secondary`,`secondaryContrast`,`background`,`paper`,`text`,`textSecondary`,`divider`,`error`,`warning`,`info`,`success`,`fontFamily`],h=[`fontSize`,`borderRadius`];function g(e){return{...e===`dark`?p:f}}function _(e){if(!e||typeof e!=`object`)return g(typeof e==`string`?e:`light`);let t=e,n=g(typeof t.type==`string`?t.type:`light`);for(let e of m){let r=t[e];typeof r==`string`&&r.trim()&&(n[e]=r.trim())}for(let e of h){let r=t[e],i=typeof r==`string`?parseFloat(r):r;typeof i==`number`&&Number.isFinite(i)&&i>=0&&(n[e]=i)}return n}function v(e,t){return e.type===t.type&&m.every(n=>e[n]===t[n])&&h.every(n=>e[n]===t[n])}function y(e){return`--iob-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`}function b(e){let t={};for(let n of m)t[y(n)]=e[n];for(let n of h)t[y(n)]=`${e[n]}px`;return t[`color-scheme`]=e.type,t}var x={ok:{en:`OK`,"zh-cn":`确定`},cancel:{en:`Cancel`,de:`Abbrechen`,ru:`Отмена`,pt:`Cancelar`,nl:`Annuleren`,fr:`Annuler`,it:`Annulla`,es:`Cancelar`,pl:`Anuluj`,uk:`Скасувати`,"zh-cn":`取消`},close:{en:`Close`,de:`Schließen`,ru:`Закрыть`,pt:`Fechar`,nl:`Sluiten`,fr:`Fermer`,it:`Chiudi`,es:`Cerrar`,pl:`Zamknij`,uk:`Закрити`,"zh-cn":`关闭`}},S=`
dialog {
    box-sizing: border-box;
    width: 480px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    padding: 0;
    border: 0;
    border-radius: calc(var(--iob-border-radius) * 2);
    background: var(--iob-paper);
    color: var(--iob-text);
    font-family: var(--iob-font-family);
    font-size: var(--iob-font-size);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
/* as the dialogs of MUI: a dark paper gets lighter the higher it lies */
dialog.dark { background-image: linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16)); }
dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
dialog:focus { outline: none; }
form { display: flex; flex-direction: column; height: 100%; max-height: inherit; margin: 0; }
header { display: flex; align-items: center; gap: 8px; padding: 12px 8px 12px 16px; font-size: 1.15em; font-weight: 500; }
header span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.body { flex: 1; min-height: 0; padding: 0 16px 16px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 16px 16px; }
button { font: inherit; padding: 6px 16px; border-radius: var(--iob-border-radius); border: 1px solid var(--iob-primary); background: transparent; color: var(--iob-primary); cursor: pointer; }
button.primary { background: var(--iob-primary); color: var(--iob-primary-contrast); }
button.close { border: 0; padding: 2px 8px; font-size: 1.4em; line-height: 1; color: var(--iob-text-secondary); }
label { display: flex; flex-direction: column; gap: 4px; }
label.check { flex-direction: row; align-items: center; gap: 8px; }
input, select, textarea { font: inherit; accent-color: var(--iob-primary); }
.help { color: var(--iob-text-secondary); font-size: 0.85em; }
h3 { margin: 4px 0 0; font-size: 1em; }
p { margin: 0; }
hr { width: 100%; border: 0; border-top: 1px solid var(--iob-divider); margin: 0; }
[hidden] { display: none !important; }
`;function C(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function w(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function ee(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function te(e,t,n,r,i){let a={name:t,setting:n,box:e.createElement(`div`),hidden:C(n.hidden),disabled:C(n.disabled)},s=o(n.label,i);switch(n.type){case`header`:return a.box=e.createElement(`h3`),a.box.textContent=o(n.text,i)||s,a;case`staticText`:return a.box=e.createElement(`p`),a.box.textContent=o(n.text,i)||s,a;case`divider`:return a.box=e.createElement(`hr`),a}let c=e.createElement(`label`);a.box=c;let l=e.createElement(`span`);if(l.textContent=s||t,n.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=r===!0||r===`true`,c.className=`check`,c.append(t,l),a.input=t}else if(n.type===`select`){let t=e.createElement(`select`);for(let r of n.options||[]){let n=e.createElement(`option`);n.textContent=o(r.label,i),t.append(n)}let s=(n.options||[]).findIndex(e=>String(e.value)===w(r));t.selectedIndex=s===-1?0:s,c.append(l,t),a.input=t}else if(n.type===`text`&&(n.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=n.minRows||2,t.value=w(r),c.append(l,t),a.input=t}else{let t=e.createElement(`input`),i=w(r);switch(n.type){case`number`:case`slider`:t.type=n.type===`slider`?`range`:`number`,n.min!==void 0&&(t.min=String(n.min)),n.max!==void 0&&(t.max=String(n.max)),t.step=n.step===void 0?`any`:String(n.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!i||/^#[0-9a-f]{6}$/i.test(i)?`color`:`text`;break;default:t.type=`text`}if(t.value=i,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}c.append(l,t),a.input=t}if(n.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=o(n.help,i),c.append(t)}return a}function ne(e,t={}){let n=t.lang||`en`,a=document,c=e=>x[e][n]||x[e].en||e,l=a.createElement(`div`);l.setAttribute(`data-iob-dialog`,``);let d=l.attachShadow({mode:`open`}),f=a.createElement(`style`);f.textContent=S;let p=a.createElement(`dialog`),m=_(t.theme);p.className=m.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(b(m)))p.style.setProperty(e,t);e.width&&(p.style.width=`${e.width}px`),e.height&&(p.style.height=`${e.height}px`);let h=a.createElement(`form`),g=a.createElement(`header`),v=a.createElement(`span`);v.textContent=o(e.title,n);let y=a.createElement(`button`);y.type=`button`,y.className=`close`,y.title=c(`close`),y.setAttribute(`aria-label`,c(`close`)),y.textContent=`×`,g.append(v,y);let C=a.createElement(`div`);return C.className=`body`,h.append(g,C),p.append(h),d.append(f,p),new Promise(t=>{let f=!1,m=e=>{f||(f=!0,p.open&&p.close(),l.remove(),t(e))};if(y.addEventListener(`click`,()=>m(null)),p.addEventListener(`close`,()=>m(null)),h.addEventListener(`submit`,e=>e.preventDefault()),i(e)){let t={},r=[];for(let[t,i]of Object.entries(e.form.items||{})){let o=e.data?.[t]??i.default,s=te(a,t,i,o,n);r.push(s),C.append(s.box)}let i=()=>{for(let e of r)e.input&&(t[e.name]=ee(e));return t},l=()=>{let e=i();for(let t of r)t.box.hidden=t.hidden?t.hidden(e):!1,t.input&&(t.input.disabled=t.disabled?t.disabled(e):!1)};h.addEventListener(`input`,l),h.addEventListener(`change`,l),l();let d=r.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);d?.input&&(d.input.autofocus=!0);let f=a.createElement(`footer`),p=a.createElement(`button`);p.type=`button`,p.textContent=o(e.cancel,n)||c(`cancel`),p.addEventListener(`click`,()=>m(null));let g=a.createElement(`button`);g.type=`submit`,g.className=`primary`,g.textContent=o(e.ok,n)||c(`ok`),f.append(p,g),h.append(f),h.addEventListener(`submit`,()=>m(u(s(e.form),i())))}else C.append(e.element),p.addEventListener(r,e=>m(e.detail??null));a.body.append(l),p.showModal(),d.activeElement&&d.activeElement!==y||(p.tabIndex=-1,p.focus())})}function T(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var re=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],E=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=_(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=_(e);v(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of re)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return o(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(e){if(this.#r)return null;let t=this.#i?await this.#i.open(e):await ne(e,{lang:this.systemLang,theme:this.#n});return i(e)?t&&typeof t==`object`?u(s(e.form),t):null:t??null}#u(){for(let[e,t]of Object.entries(b(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?T(this.getStateIds(this.#t)):[],n=e?T(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function D(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}var O=`iob-teltonika-ports`;function ie(e,t){return!e||e===t||e===t.replace(/_\d+$/,``)?null:e}var k=`香`;function A(e){return e.split(`.`).length}function ae(e,t){let n=/(\d+)\s*$/.exec(e),r=/(\d+)\s*$/.exec(t);return n&&r&&e.slice(0,e.length-n[1].length)===t.slice(0,t.length-r[1].length)?Number(n[1])-Number(r[1]):e.localeCompare(t)}function oe(e){let t=[],n=[];return e.forEach((e,r)=>(r%2==0?t:n).push(e)),{top:t,bottom:n}}function se(e,t){return!t||!e?null:e>=1e3?e>=1e4?`${Math.round(e/1e3)}G`:`GbE`:e>=100?`FE`:`${e}M`}function j(e){if(e===null||isNaN(e))return null;let t=Math.floor(e/86400),n=Math.floor(e%86400/3600),r=Math.floor(e%3600/60);return t?`${t}d ${n}h`:n?`${n}h ${r}m`:`${r}m`}function M(e){if(e===null||isNaN(e))return null;let t=[`B`,`kB`,`MB`,`GB`,`TB`],n=e,r=0;for(;n>=1024&&r<t.length-1;)n/=1024,r++;return`${n>=100||r===0?Math.round(n):n.toFixed(1)} ${t[r]}`}async function N(e,t){let n=`${t}.`,[r,i]=await Promise.all([e.getObjectViewSystem(`channel`,n,`${n}${k}`),e.getObjectViewSystem(`state`,n,`${n}${k}`)]),a=/* @__PURE__ */ new Map,o=A(n)-1,s=/* @__PURE__ */ new Map;for(let[e,t]of Object.entries(r))typeof t.common?.name==`string`&&t.common.name&&s.set(e,t.common.name);for(let[e,t]of Object.entries(r))A(e)!==o+1||e.endsWith(`.info`)||a.set(e,{id:e,name:typeof t.common?.name==`string`?t.common.name:e.split(`.`).pop()||e,alive:null,model:null,uptime:null,cpu:null,operator:null,signal:null,connection:null,network:null,temperature:null,wan:null,wanIPv6:null,lan:null,addresses:{},ports:[],wanInterfaces:[],io:[],isRouter:!1});let c=/* @__PURE__ */ new Map,l=/* @__PURE__ */ new Map,u=/* @__PURE__ */ new Map,d=/* @__PURE__ */ new Map;for(let[e,t]of Object.entries(i)){let n=e.split(`.`),r=n.slice(0,o+1).join(`.`),i=a.get(r);if(!i)continue;c.set(e,r);let f=n.slice(o+1);if(f[0]===`ports`&&f.length===3){let e=l.get(r)||/* @__PURE__ */ new Map;l.set(r,e);let n=e.get(f[1])||{id:f[1],label:f[1],link:null,speed:null,duplex:null,rxRate:null,txRate:null,rxBytes:null,txBytes:null,enabled:null,switchable:!1,description:ie(s.get(`${r}.ports.${f[1]}`),f[1]),poe:null,poeSwitchable:!1,poeActive:null,poePower:null,fibre:/^sfp/i.test(f[1])};f[2]===`enabled`?n.switchable=t.common?.write===!0:f[2]===`poe`&&(n.poeSwitchable=t.common?.write===!0),e.set(f[1],n)}else if(f[0]===`interfaces`&&f.length===3){let e=u.get(r)||/* @__PURE__ */ new Map;u.set(r,e),e.has(f[1])||e.set(f[1],{id:f[1],label:s.get(`${r}.interfaces.${f[1]}`)||f[1],status:null,enabled:null,uptime:null,trackingHosts:null}),i.isRouter=!0}else if(f[0]===`io`&&f.length===3){let e=d.get(r)||/* @__PURE__ */ new Map;d.set(r,e),e.has(f[1])||e.set(f[1],{id:f[1],label:f[1],state:null,type:null})}else f.length===1&&[`operator`,`signal`,`connection`,`temperature`].includes(f[0])&&(i.isRouter=!0)}for(let[e,t]of l){let n=a.get(e);n&&(n.ports=[...t.values()].sort((e,t)=>ae(e.id,t.id)))}for(let[e,t]of u){let n=a.get(e);n&&(n.wanInterfaces=[...t.values()].sort((e,t)=>e.id.localeCompare(t.id)))}for(let[e,t]of d){let n=a.get(e);n&&(n.io=[...t.values()].sort((e,t)=>e.id.localeCompare(t.id)))}return{devices:a,stateIds:c}}function P(e,t,n){let r=t.split(`.`);if(r.length===1)switch(r[0]){case`alive`:return e.alive=n===null?null:!!n,!0;case`name`:return e.model=n===null?null:String(n),!0;case`uptime`:return e.uptime=typeof n==`number`?n:null,!0;case`cpu`:return e.cpu=typeof n==`number`?n:null,!0;case`operator`:case`connection`:case`network`:case`wan`:case`wanIPv6`:case`lan`:return e[r[0]]=n===null?null:String(n),!0;case`signal`:case`temperature`:return e[r[0]]=typeof n==`number`?n:null,!0;default:return!1}if(r[0]===`ports`&&r.length===3){let t=e.ports.find(e=>e.id===r[1]);if(!t)return!1;switch(r[2]){case`state`:return t.link=n===null?null:!!n,!0;case`enabled`:return t.enabled=n===null?null:!!n,!0;case`poe`:return t.poe=n===null?null:!!n,!0;case`poeActive`:return t.poeActive=n===null?null:!!n,!0;case`poePower`:return t.poePower=typeof n==`number`?n:null,!0;case`duplex`:return t.duplex=n===null?null:!!n,!0;case`speed`:case`rxRate`:case`txRate`:case`rxBytes`:case`txBytes`:return t[r[2]]=typeof n==`number`?n:null,!0;default:return!1}}if(r[0]===`addresses`&&r.length===2)return n===null||n===``?delete e.addresses[r[1]]:e.addresses[r[1]]=String(n),!0;if(r[0]===`interfaces`&&r.length===3){let t=e.wanInterfaces.find(e=>e.id===r[1]);if(!t)return!1;switch(r[2]){case`status`:case`trackingHosts`:return t[r[2]]=n===null?null:String(n),!0;case`enabled`:return t.enabled=n===null?null:!!n,!0;case`uptime`:return t.uptime=typeof n==`number`?n:null,!0;default:return!1}}if(r[0]===`io`&&r.length===3){let t=e.io.find(e=>e.id===r[1]);if(!t)return!1;if(r[2]===`state`)return t.state=n===null?null:!!n,!0;if(r[2]===`type`)return t.type=n===null?null:String(n),!0}return!1}function F(e){let t=String(e??``).trim().match(/^(?:system\.adapter\.)?(?:teltonika\.)?(\d+)$/);return t?`teltonika.${t[1]}`:null}function I(e){let t=String(e??``).match(/^(teltonika\.\d+)(\.|$)/);return t?t[1]:null}function L(e){let t=String(e??``).trim().match(/^(teltonika\.\d+)\.([^.]+)(\.|$)/);return!t||t[2]===`info`||t[2]===`presence`?null:`${t[1]}.${t[2]}`}async function R(e,t){let{devices:n,stateIds:r}=await N(e,t);return n.delete(`${t}.presence`),{instance:t,devices:n,owners:new Map([...r].filter(([,e])=>n.has(e)))}}var z=[`alive`,`name`,`uptime`,`temperature`,`cpu`,`operator`,`connection`,`signal`,`lan`,`wan`];function B(e,t){let n=e.split(`.`);switch(t){case`summary`:return e===`alive`||n[0]===`ports`&&(n[2]===`state`||n[2]===`enabled`);case`tile`:return z.includes(e)||n[0]===`ports`&&(n[2]===`state`||n[2]===`enabled`)||n[0]===`interfaces`&&(n[2]===`status`||n[2]===`enabled`);case`panel`:return e===`alive`||n[0]===`ports`;default:return!0}}function V(e,t,n){let r=new Set(t),i=[];for(let[t,a]of e.owners)r.has(a)&&B(t.slice(a.length+1),n)&&i.push(t);return i}function H(e){return{...e,addresses:{...e.addresses},ports:e.ports.map(e=>({...e})),wanInterfaces:e.wanInterfaces.map(e=>({...e})),io:e.io.map(e=>({...e}))}}function U(e,t,n){let r=/* @__PURE__ */ new Map;for(let n of t){let t=e.devices.get(n);t&&r.set(n,H(t))}for(let[t,i]of Object.entries(n)){let n=e.owners.get(t),a=n?r.get(n):void 0;a&&i&&P(a,t.slice(a.id.length+1),i.val)}return[...r.values()]}var W=`
* {
    box-sizing: border-box;
}
.root, .dialog {
    --link: var(--iob-success);
    --idle: color-mix(in srgb, currentColor 38%, transparent);
    --off: color-mix(in srgb, var(--iob-error) 70%, currentColor);
    --tint: color-mix(in srgb, currentColor 6%, transparent);
    --hover: color-mix(in srgb, currentColor 10%, transparent);
    --frame: color-mix(in srgb, currentColor 18%, transparent);
    --muted: color-mix(in srgb, currentColor 66%, transparent);
    --faint: color-mix(in srgb, currentColor 45%, transparent);
    -webkit-tap-highlight-color: transparent;
}
.muted {
    color: var(--muted);
}
.faint {
    color: var(--faint);
}
.small {
    font-size: 0.8em;
}
.strong {
    font-weight: 700;
}
.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.nowrap {
    white-space: nowrap;
}
.ellipsis {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.clickable {
    cursor: pointer;
}
.clickable:focus-visible,
[role='switch']:focus-visible {
    outline: 2px solid var(--iob-primary);
    outline-offset: -2px;
}
.edit {
    pointer-events: none;
}
.dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--faint);
}
.dot.online {
    background: var(--iob-success);
}
.dot.standby {
    background: var(--iob-warning);
}
.dot.offline {
    background: var(--iob-error);
}
button {
    font: inherit;
    color: inherit;
}
`,G=`
:host {
    display: block;
    width: 100%;
    height: 100%;
}
.mount {
    width: 100%;
    height: 100%;
    /* the size of the box does not depend on what is in it - no loop between measuring and laying out */
    container-type: size;
}
.root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
}
.hint {
    width: 100%;
    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    color: var(--muted, inherit);
    opacity: 0.8;
    font-size: clamp(11px, 5cqmin, 15px);
}
.hint svg {
    width: clamp(18px, 12cqmin, 36px);
    height: clamp(18px, 12cqmin, 36px);
    fill: currentColor;
}
`,K=`
:host {
    display: block;
}
.dialog {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: inherit;
    font: inherit;
    min-width: min(320px, 80vw);
}
`,q=`
.strip {
    display: inline-flex;
    gap: 2px;
    align-items: flex-end;
}
.strip span {
    width: 6px;
    height: var(--strip, 14px);
    border-radius: 1px;
    background: var(--idle);
    opacity: 0.6;
}
.strip span.up {
    background: var(--link);
    opacity: 1;
}
.strip span.disabled {
    background: var(--off);
}
.panel {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: calc(var(--s, 28px) * 0.4);
    font-size: calc(var(--s, 28px) * 0.34);
    line-height: 1.4;
}
.group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--s, 28px) * 0.12);
    padding: calc(var(--s, 28px) * 0.2);
    border: 1px solid var(--frame);
    border-radius: calc(var(--iob-border-radius, 4px) * 1.5);
}
.group .row {
    display: flex;
}
.num {
    width: calc(var(--s, 28px) * 1.3 + 2px);
    text-align: center;
    font-weight: 600;
    opacity: 0.85;
}
.cell {
    width: calc(var(--s, 28px) * 1.3 + 2px);
    padding: calc(var(--s, 28px) * 0.1) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--frame);
    color: var(--idle);
}
.cell.up {
    color: var(--link);
}
.cell.disabled {
    color: var(--off);
}
.cell.switchable {
    cursor: pointer;
}
.cell.switchable:hover {
    background: var(--hover);
}
.cell svg {
    width: var(--s, 28px);
    height: calc(var(--s, 28px) * 0.82);
    display: block;
    fill: currentColor;
}
.cell.flipped svg {
    transform: rotate(180deg);
}
.badge {
    height: calc(var(--s, 28px) * 0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--iob-text, currentColor);
}
.speed {
    padding: 0 0.45em;
    border-radius: 999px;
    background: var(--hover);
    font-size: calc(var(--s, 28px) * 0.26);
    line-height: 1.6;
}
.bolt {
    color: var(--iob-warning);
    font-size: calc(var(--s, 28px) * 0.3);
    line-height: 1;
}
.bolt.idle {
    opacity: 0.3;
}
.caption {
    font-weight: 700;
    opacity: 0.85;
}
.card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 10px 12px;
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    border-left: 4px solid var(--faint);
    background: var(--tint);
    box-shadow: inset 0 0 0 1px var(--frame);
}
.card.online {
    border-left-color: var(--iob-success);
}
.card.offline {
    border-left-color: var(--iob-error);
}
.card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
}
.card-name {
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.card-head .muted {
    font-size: 0.8em;
}
.line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.line.wrap {
    flex-wrap: wrap;
}
.wan-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.wan-chip.off,
.item.off {
    opacity: 0.5;
}
.panel-box {
    --s: 28px;
    overflow-x: auto;
    padding-bottom: 2px;
}
.section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.section-title {
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
}
.item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 4px 8px;
    border-radius: var(--iob-border-radius, 4px);
    box-shadow: inset 0 0 0 1px var(--frame);
    font-size: 0.85em;
}
.poe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(230px, 100%), 1fr));
    gap: 4px;
}
.item.poe .bolt {
    font-size: 1em;
}
.poe-state {
    margin-left: auto;
    padding-left: 8px;
    color: var(--muted);
}
.poe-state.on {
    color: var(--iob-warning);
}
.wan-label {
    min-width: 6em;
}
.wan-status {
    min-width: 5.5em;
    color: var(--muted);
}
.wan-status.online {
    color: var(--iob-success);
}
.wan-status.standby {
    color: var(--iob-warning);
}
.wan-status.offline {
    color: var(--iob-error);
}
.facts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
}
.toggle {
    position: relative;
    flex: none;
    width: 30px;
    height: 16px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: var(--idle);
    cursor: pointer;
    transition: background 0.2s;
}
.toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--iob-paper, #fff);
    transition: transform 0.2s;
}
.toggle.checked {
    background: var(--iob-primary);
}
.toggle.checked::after {
    transform: translateX(14px);
}
`,ce=`${W}${G}${q}
.front {
    /* the socket: as big as the box allows for the number of columns, see panelColumns() */
    --s: clamp(10px, min(calc((100cqw - 20px) / (var(--cols, 4) * 1.35 + var(--groups, 1) * 0.7)), calc((100cqh - 56px) / 5.3)), 40px);
    height: 100%;
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    text-align: center;
}
.front.clickable:hover {
    background: var(--tint);
}
.front-name {
    max-width: 100%;
    font-weight: 700;
    font-size: clamp(11px, 6cqmin, 18px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.front-links {
    font-size: clamp(10px, 5cqmin, 14px);
    color: var(--muted);
}
.front.offline .panel {
    opacity: 0.55;
}
.list {
    height: 100%;
    overflow: auto;
    padding: 4px;
    user-select: text;
}
`,le=`${W}${K}${q}`;function ue(e){let t={en:{telt_uptime:`Uptime`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links up`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Connection`,telt_network:`Network`,telt_signal:`Signal`,telt_temperature:`Temperature`,telt_no_ports:`This device reports no ports`,telt_poe_off:`PoE off`,telt_poe_idle:`no consumer`,telt_poe_on:`PoE on`,telt_wan_interfaces:`WAN interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`up`,telt_nolink:`no link`,telt_disabled:`disabled`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Click to switch on or off`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`,wc_not_device:`Not a device of the Teltonika adapter`,no_device:`No device found`},de:{telt_uptime:`Laufzeit`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`Links aktiv`,telt_model:`Modell`,telt_operator:`Betreiber`,telt_connection:`Verbindung`,telt_network:`Netz`,telt_signal:`Signal`,telt_temperature:`Temperatur`,telt_no_ports:`Dieses Gerät meldet keine Ports`,telt_poe_off:`PoE aus`,telt_poe_idle:`kein Verbraucher`,telt_poe_on:`PoE an`,telt_wan_interfaces:`WAN-Schnittstellen`,telt_tracking:`Tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktiv`,telt_nolink:`kein Link`,telt_disabled:`deaktiviert`,wc_full_duplex:`Vollduplex`,wc_click_to_switch:`Klicken zum Ein- oder Ausschalten`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`,wc_not_device:`Kein Gerät des Teltonika-Adapters`,no_device:`Kein Gerät gefunden`},ru:{telt_uptime:`Время работы`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Роутер`,telt_switch:`Коммутатор`,telt_links:`линков активно`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Соединение`,telt_network:`Сеть`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Это устройство не сообщает о портах`,telt_poe_off:`PoE выкл.`,telt_poe_idle:`нет потребителя`,telt_poe_on:`PoE вкл.`,telt_wan_interfaces:`Интерфейсы WAN`,telt_tracking:`отслеживание`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активен`,telt_nolink:`нет линка`,telt_disabled:`отключён`,wc_full_duplex:`полный дуплекс`,wc_click_to_switch:`Нажмите, чтобы включить или выключить`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`,wc_not_device:`Это не устройство адаптера Teltonika`,no_device:`Устройство не найдено`},pt:{telt_uptime:`Tempo ativo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`ligações ativas`,telt_model:`Modelo`,telt_operator:`Operadora`,telt_connection:`Ligação`,telt_network:`Rede`,telt_signal:`Sinal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo não reporta portas`,telt_poe_off:`PoE desligado`,telt_poe_idle:`sem consumidor`,telt_poe_on:`PoE ligado`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`monitorização`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`ativa`,telt_nolink:`sem ligação`,telt_disabled:`desativada`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Clique para ligar ou desligar`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`,wc_not_device:`Não é um dispositivo do adaptador Teltonika`,no_device:`Nenhum dispositivo encontrado`},nl:{telt_uptime:`Bedrijfstijd`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links actief`,telt_model:`Model`,telt_operator:`Provider`,telt_connection:`Verbinding`,telt_network:`Netwerk`,telt_signal:`Signaal`,telt_temperature:`Temperatuur`,telt_no_ports:`Dit apparaat meldt geen poorten`,telt_poe_off:`PoE uit`,telt_poe_idle:`geen verbruiker`,telt_poe_on:`PoE aan`,telt_wan_interfaces:`WAN-interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actief`,telt_nolink:`geen link`,telt_disabled:`uitgeschakeld`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Klik om in of uit te schakelen`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`,wc_not_device:`Geen apparaat van de Teltonika-adapter`,no_device:`Geen apparaat gevonden`},fr:{telt_uptime:`Durée de fonctionnement`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Routeur`,telt_switch:`Commutateur`,telt_links:`liens actifs`,telt_model:`Modèle`,telt_operator:`Opérateur`,telt_connection:`Connexion`,telt_network:`Réseau`,telt_signal:`Signal`,telt_temperature:`Température`,telt_no_ports:`Cet appareil ne signale aucun port`,telt_poe_off:`PoE désactivé`,telt_poe_idle:`aucun consommateur`,telt_poe_on:`PoE activé`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`surveillance`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actif`,telt_nolink:`pas de lien`,telt_disabled:`désactivé`,wc_full_duplex:`duplex intégral`,wc_click_to_switch:`Cliquez pour activer ou désactiver`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`,wc_not_device:`Pas un appareil de l'adaptateur Teltonika`,no_device:`Aucun appareil trouvé`},it:{telt_uptime:`Tempo di attività`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`collegamenti attivi`,telt_model:`Modello`,telt_operator:`Operatore`,telt_connection:`Connessione`,telt_network:`Rete`,telt_signal:`Segnale`,telt_temperature:`Temperatura`,telt_no_ports:`Questo dispositivo non segnala porte`,telt_poe_off:`PoE spento`,telt_poe_idle:`nessun utilizzatore`,telt_poe_on:`PoE attivo`,telt_wan_interfaces:`Interfacce WAN`,telt_tracking:`monitoraggio`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`attiva`,telt_nolink:`nessun collegamento`,telt_disabled:`disattivata`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Clicca per accendere o spegnere`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`,wc_not_device:`Non è un dispositivo dell'adattatore Teltonika`,no_device:`Nessun dispositivo trovato`},es:{telt_uptime:`Tiempo activo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`enlaces activos`,telt_model:`Modelo`,telt_operator:`Operador`,telt_connection:`Conexión`,telt_network:`Red`,telt_signal:`Señal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo no informa de puertos`,telt_poe_off:`PoE apagado`,telt_poe_idle:`sin consumidor`,telt_poe_on:`PoE encendido`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`seguimiento`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`activo`,telt_nolink:`sin enlace`,telt_disabled:`desactivado`,wc_full_duplex:`dúplex completo`,wc_click_to_switch:`Haga clic para encender o apagar`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`,wc_not_device:`No es un dispositivo del adaptador Teltonika`,no_device:`No se encontró ningún dispositivo`},pl:{telt_uptime:`Czas pracy`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Przełącznik`,telt_links:`aktywnych łączy`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Połączenie`,telt_network:`Sieć`,telt_signal:`Sygnał`,telt_temperature:`Temperatura`,telt_no_ports:`To urządzenie nie zgłasza portów`,telt_poe_off:`PoE wył.`,telt_poe_idle:`brak odbiornika`,telt_poe_on:`PoE wł.`,telt_wan_interfaces:`Interfejsy WAN`,telt_tracking:`monitorowanie`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktywny`,telt_nolink:`brak łącza`,telt_disabled:`wyłączony`,wc_full_duplex:`pełny dupleks`,wc_click_to_switch:`Kliknij, aby włączyć lub wyłączyć`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`,wc_not_device:`To nie jest urządzenie adaptera Teltonika`,no_device:`Nie znaleziono urządzenia`},uk:{telt_uptime:`Час роботи`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Маршрутизатор`,telt_switch:`Комутатор`,telt_links:`активних лінків`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Зʼєднання`,telt_network:`Мережа`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Цей пристрій не повідомляє про порти`,telt_poe_off:`PoE вимк.`,telt_poe_idle:`немає споживача`,telt_poe_on:`PoE увімк.`,telt_wan_interfaces:`Інтерфейси WAN`,telt_tracking:`відстеження`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активний`,telt_nolink:`немає лінка`,telt_disabled:`вимкнено`,wc_full_duplex:`повний дуплекс`,wc_click_to_switch:`Натисніть, щоб увімкнути або вимкнути`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`,wc_not_device:`Це не пристрій адаптера Teltonika`,no_device:`Пристрій не знайдено`},"zh-cn":{telt_uptime:`运行时间`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`路由器`,telt_switch:`交换机`,telt_links:`条链路已连接`,telt_model:`型号`,telt_operator:`运营商`,telt_connection:`连接`,telt_network:`网络`,telt_signal:`信号`,telt_temperature:`温度`,telt_no_ports:`该设备未报告端口`,telt_poe_off:`PoE 关`,telt_poe_idle:`无用电设备`,telt_poe_on:`PoE 开`,telt_wan_interfaces:`WAN 接口`,telt_tracking:`探测`,telt_ethernet:`以太网`,telt_fibre:`SFP`,telt_up:`已连接`,telt_nolink:`无链路`,telt_disabled:`已禁用`,wc_full_duplex:`全双工`,wc_click_to_switch:`点击开启或关闭`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`,wc_not_device:`不是 Teltonika 适配器的设备`,no_device:`未找到设备`}}[e]||{},n={en:{telt_uptime:`Uptime`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links up`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Connection`,telt_network:`Network`,telt_signal:`Signal`,telt_temperature:`Temperature`,telt_no_ports:`This device reports no ports`,telt_poe_off:`PoE off`,telt_poe_idle:`no consumer`,telt_poe_on:`PoE on`,telt_wan_interfaces:`WAN interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`up`,telt_nolink:`no link`,telt_disabled:`disabled`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Click to switch on or off`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`,wc_not_device:`Not a device of the Teltonika adapter`,no_device:`No device found`},de:{telt_uptime:`Laufzeit`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`Links aktiv`,telt_model:`Modell`,telt_operator:`Betreiber`,telt_connection:`Verbindung`,telt_network:`Netz`,telt_signal:`Signal`,telt_temperature:`Temperatur`,telt_no_ports:`Dieses Gerät meldet keine Ports`,telt_poe_off:`PoE aus`,telt_poe_idle:`kein Verbraucher`,telt_poe_on:`PoE an`,telt_wan_interfaces:`WAN-Schnittstellen`,telt_tracking:`Tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktiv`,telt_nolink:`kein Link`,telt_disabled:`deaktiviert`,wc_full_duplex:`Vollduplex`,wc_click_to_switch:`Klicken zum Ein- oder Ausschalten`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`,wc_not_device:`Kein Gerät des Teltonika-Adapters`,no_device:`Kein Gerät gefunden`},ru:{telt_uptime:`Время работы`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Роутер`,telt_switch:`Коммутатор`,telt_links:`линков активно`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Соединение`,telt_network:`Сеть`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Это устройство не сообщает о портах`,telt_poe_off:`PoE выкл.`,telt_poe_idle:`нет потребителя`,telt_poe_on:`PoE вкл.`,telt_wan_interfaces:`Интерфейсы WAN`,telt_tracking:`отслеживание`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активен`,telt_nolink:`нет линка`,telt_disabled:`отключён`,wc_full_duplex:`полный дуплекс`,wc_click_to_switch:`Нажмите, чтобы включить или выключить`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`,wc_not_device:`Это не устройство адаптера Teltonika`,no_device:`Устройство не найдено`},pt:{telt_uptime:`Tempo ativo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`ligações ativas`,telt_model:`Modelo`,telt_operator:`Operadora`,telt_connection:`Ligação`,telt_network:`Rede`,telt_signal:`Sinal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo não reporta portas`,telt_poe_off:`PoE desligado`,telt_poe_idle:`sem consumidor`,telt_poe_on:`PoE ligado`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`monitorização`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`ativa`,telt_nolink:`sem ligação`,telt_disabled:`desativada`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Clique para ligar ou desligar`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`,wc_not_device:`Não é um dispositivo do adaptador Teltonika`,no_device:`Nenhum dispositivo encontrado`},nl:{telt_uptime:`Bedrijfstijd`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links actief`,telt_model:`Model`,telt_operator:`Provider`,telt_connection:`Verbinding`,telt_network:`Netwerk`,telt_signal:`Signaal`,telt_temperature:`Temperatuur`,telt_no_ports:`Dit apparaat meldt geen poorten`,telt_poe_off:`PoE uit`,telt_poe_idle:`geen verbruiker`,telt_poe_on:`PoE aan`,telt_wan_interfaces:`WAN-interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actief`,telt_nolink:`geen link`,telt_disabled:`uitgeschakeld`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Klik om in of uit te schakelen`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`,wc_not_device:`Geen apparaat van de Teltonika-adapter`,no_device:`Geen apparaat gevonden`},fr:{telt_uptime:`Durée de fonctionnement`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Routeur`,telt_switch:`Commutateur`,telt_links:`liens actifs`,telt_model:`Modèle`,telt_operator:`Opérateur`,telt_connection:`Connexion`,telt_network:`Réseau`,telt_signal:`Signal`,telt_temperature:`Température`,telt_no_ports:`Cet appareil ne signale aucun port`,telt_poe_off:`PoE désactivé`,telt_poe_idle:`aucun consommateur`,telt_poe_on:`PoE activé`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`surveillance`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actif`,telt_nolink:`pas de lien`,telt_disabled:`désactivé`,wc_full_duplex:`duplex intégral`,wc_click_to_switch:`Cliquez pour activer ou désactiver`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`,wc_not_device:`Pas un appareil de l'adaptateur Teltonika`,no_device:`Aucun appareil trouvé`},it:{telt_uptime:`Tempo di attività`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`collegamenti attivi`,telt_model:`Modello`,telt_operator:`Operatore`,telt_connection:`Connessione`,telt_network:`Rete`,telt_signal:`Segnale`,telt_temperature:`Temperatura`,telt_no_ports:`Questo dispositivo non segnala porte`,telt_poe_off:`PoE spento`,telt_poe_idle:`nessun utilizzatore`,telt_poe_on:`PoE attivo`,telt_wan_interfaces:`Interfacce WAN`,telt_tracking:`monitoraggio`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`attiva`,telt_nolink:`nessun collegamento`,telt_disabled:`disattivata`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Clicca per accendere o spegnere`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`,wc_not_device:`Non è un dispositivo dell'adattatore Teltonika`,no_device:`Nessun dispositivo trovato`},es:{telt_uptime:`Tiempo activo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`enlaces activos`,telt_model:`Modelo`,telt_operator:`Operador`,telt_connection:`Conexión`,telt_network:`Red`,telt_signal:`Señal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo no informa de puertos`,telt_poe_off:`PoE apagado`,telt_poe_idle:`sin consumidor`,telt_poe_on:`PoE encendido`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`seguimiento`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`activo`,telt_nolink:`sin enlace`,telt_disabled:`desactivado`,wc_full_duplex:`dúplex completo`,wc_click_to_switch:`Haga clic para encender o apagar`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`,wc_not_device:`No es un dispositivo del adaptador Teltonika`,no_device:`No se encontró ningún dispositivo`},pl:{telt_uptime:`Czas pracy`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Przełącznik`,telt_links:`aktywnych łączy`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Połączenie`,telt_network:`Sieć`,telt_signal:`Sygnał`,telt_temperature:`Temperatura`,telt_no_ports:`To urządzenie nie zgłasza portów`,telt_poe_off:`PoE wył.`,telt_poe_idle:`brak odbiornika`,telt_poe_on:`PoE wł.`,telt_wan_interfaces:`Interfejsy WAN`,telt_tracking:`monitorowanie`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktywny`,telt_nolink:`brak łącza`,telt_disabled:`wyłączony`,wc_full_duplex:`pełny dupleks`,wc_click_to_switch:`Kliknij, aby włączyć lub wyłączyć`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`,wc_not_device:`To nie jest urządzenie adaptera Teltonika`,no_device:`Nie znaleziono urządzenia`},uk:{telt_uptime:`Час роботи`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Маршрутизатор`,telt_switch:`Комутатор`,telt_links:`активних лінків`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Зʼєднання`,telt_network:`Мережа`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Цей пристрій не повідомляє про порти`,telt_poe_off:`PoE вимк.`,telt_poe_idle:`немає споживача`,telt_poe_on:`PoE увімк.`,telt_wan_interfaces:`Інтерфейси WAN`,telt_tracking:`відстеження`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активний`,telt_nolink:`немає лінка`,telt_disabled:`вимкнено`,wc_full_duplex:`повний дуплекс`,wc_click_to_switch:`Натисніть, щоб увімкнути або вимкнути`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`,wc_not_device:`Це не пристрій адаптера Teltonika`,no_device:`Пристрій не знайдено`},"zh-cn":{telt_uptime:`运行时间`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`路由器`,telt_switch:`交换机`,telt_links:`条链路已连接`,telt_model:`型号`,telt_operator:`运营商`,telt_connection:`连接`,telt_network:`网络`,telt_signal:`信号`,telt_temperature:`温度`,telt_no_ports:`该设备未报告端口`,telt_poe_off:`PoE 关`,telt_poe_idle:`无用电设备`,telt_poe_on:`PoE 开`,telt_wan_interfaces:`WAN 接口`,telt_tracking:`探测`,telt_ethernet:`以太网`,telt_fibre:`SFP`,telt_up:`已连接`,telt_nolink:`无链路`,telt_disabled:`已禁用`,wc_full_duplex:`全双工`,wc_click_to_switch:`点击开启或关闭`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`,wc_not_device:`不是 Teltonika 适配器的设备`,no_device:`未找到设备`}}.en||{};return(e,...r)=>{let i=t[e]||n[e]||e;for(let e of r)i=i.replace(`%s`,String(e));return i}}var de=900,fe=class extends E{root;#e=null;#t=null;#n=null;constructor(t){super();let n=this.attachShadow({mode:`open`}),r=document.createElement(`style`);r.textContent=t;let i=document.createElement(`div`);i.className=`mount`,n.append(r,i),this.root=e(i)}getStateIds(e){let t=this.getFound(e);if(!t)return[];let n=this.#n?`all`:this.getLevel(e);return V(t,this.getShownDevices(e,t),n)}render(){this.#r(),this.draw(),this.#n?.()}get word(){return ue(this.systemLang)}getFound(e){let t=this.getInstance(e),n=this.#e;return n&&t&&n.instance===t&&this.#t?.socket===this.socket?n:null}getDevices(e){let t=this.getFound(this.settings);return t?U(t,e,this.states):[]}resubscribe(){this.settings=this.settings}getActions(e){return!e||this.editMode?{}:{onToggle:(e,t)=>{t.switchable&&this.setState(`${e.id}.ports.${t.id}.enabled`,!t.enabled)},onTogglePoe:(e,t)=>{t.poeSwitchable&&this.setState(`${e.id}.ports.${t.id}.poe`,!t.poe)}}}#r(){let e=this.socket,t=e?this.getInstance(this.settings):null;if(!e||!t||this.#t?.instance===t&&this.#t.socket===e)return;let n={instance:t,socket:e};this.#t=n,this.#e=null,R(e,t).catch(e=>(console.warn(`<${this.localName}>: cannot read the devices of ${t}: ${String(e)}`),{instance:t,devices:/* @__PURE__ */ new Map,owners:/* @__PURE__ */ new Map})).then(e=>{this.#t===n&&(this.#e=e,this.resubscribe())}).catch(()=>void 0)}async openDetails(n,r){if(this.editMode||this.#n)return;let i=document.createElement(`div`),a=i.attachShadow({mode:`open`}),o=document.createElement(`style`);o.textContent=le;let s=document.createElement(`div`);a.append(o,s);let c=e(s);this.#n=()=>{for(let[e,t]of Object.entries(b(this.theme)))i.style.setProperty(e,t);c.render(/* @__PURE__ */ t(`div`,{className:`dialog`,children:r()}))},this.#n(),this.resubscribe();try{await this.openDialog({title:n,element:i,width:de})}finally{this.#n=null,c.unmount(),this.resubscribe()}}};function pe(e){return e===null?`unknown`:e?`online`:`offline`}function me(e){return e.enabled===!1?`disabled`:e.link?`up`:`idle`}function he(e){return t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),t.stopPropagation(),e())}}function J(e){let t=e.filter(e=>!e.fibre).length,n=e.length-t;return{cols:Math.ceil(t/2)+Math.ceil(n/2),groups:+!!t+ +!!n}}function ge(){return/* @__PURE__ */ t(`svg`,{viewBox:`0 0 24 20`,"aria-hidden":`true`,children:/* @__PURE__ */ t(`path`,{d:`M2 1 H22 V13 H15.5 V19 H8.5 V13 H2 Z`})})}function _e({device:e,port:r,flipped:i,word:a,onToggle:o}){let s=se(r.speed,r.link),c=!!o&&r.switchable,l=r.enabled===!1?a(`telt_disabled`):r.link?a(`telt_up`):a(`telt_nolink`),u=[`${r.label}${r.description?` · ${r.description}`:``} - ${l}`];s&&u.push(`${s}${r.duplex?` · ${a(`wc_full_duplex`)}`:``}`),r.link&&(r.rxBytes!==null||r.txBytes!==null)&&u.push(`↓ ${M(r.rxBytes)??`-`}   ↑ ${M(r.txBytes)??`-`}`),r.poe!==null&&u.push(`${r.poe?a(`telt_poe_on`):a(`telt_poe_off`)}${r.poe&&r.poePower?` · ${r.poePower} W`:``}`),c&&u.push(a(`wc_click_to_switch`));let d=()=>o?.(e,r),f=/* @__PURE__ */ n(`span`,{className:`badge`,children:[r.poe?/* @__PURE__ */ t(`span`,{className:`bolt${r.poeActive===!1?` idle`:``}`,children:`⚡`}):null,s?/* @__PURE__ */ t(`span`,{className:`speed`,children:s}):null]});return/* @__PURE__ */ n(`span`,{className:`cell ${me(r)}${i?` flipped`:``}${c?` switchable`:``}`,title:u.join(`
`),role:c?`switch`:void 0,"aria-checked":c?r.enabled!==!1:void 0,"aria-label":c?r.label:void 0,tabIndex:c?0:void 0,onClick:c?e=>{e.stopPropagation(),d()}:void 0,onKeyDown:c?he(d):void 0,children:[i?null:f,/* @__PURE__ */ t(ge,{}),i?f:null]})}function Y({device:e,ports:r,caption:i,word:a,onToggle:o}){if(!r.length)return null;let{top:s,bottom:c}=oe(r),l=e=>/* @__PURE__ */ t(`span`,{className:`row`,children:e.map(e=>/* @__PURE__ */ t(`span`,{className:`num`,children:e.label},e.id))}),u=(n,r)=>/* @__PURE__ */ t(`span`,{className:`row`,children:n.map(n=>/* @__PURE__ */ t(_e,{device:e,port:n,flipped:r,word:a,onToggle:o},n.id))});return/* @__PURE__ */ n(`span`,{className:`group`,children:[l(s),u(s,!1),c.length?u(c,!0):null,c.length?l(c):null,/* @__PURE__ */ t(`span`,{className:`caption`,children:i})]})}function X({device:e,word:r,onToggle:i}){return/* @__PURE__ */ n(`span`,{className:`panel`,children:[/* @__PURE__ */ t(Y,{device:e,ports:e.ports.filter(e=>!e.fibre),caption:r(`telt_ethernet`),word:r,onToggle:i}),/* @__PURE__ */ t(Y,{device:e,ports:e.ports.filter(e=>e.fibre),caption:r(`telt_fibre`),word:r,onToggle:i})]})}function ve(e,t){return`${e.filter(e=>e.link).length}/${e.length} ${t(`telt_links`)}`}function Z(e){return e===`online`||e===`standby`||e===`offline`?e:`unknown`}function ye({device:e,port:r,word:i,onTogglePoe:a}){let o=!!a&&r.poeSwitchable,s=!!r.poe&&r.poeActive!==!1,c=i(`telt_poe_on`);return r.poe?r.poeActive===!1?c=i(`telt_poe_idle`):r.poePower!==null&&(c=`${r.poePower} W`):c=i(`telt_poe_off`),/* @__PURE__ */ n(`div`,{className:`item poe`,children:[o?/* @__PURE__ */ t(`button`,{type:`button`,role:`switch`,className:`toggle${r.poe?` checked`:``}`,"aria-checked":!!r.poe,"aria-label":`PoE ${r.label}`,onClick:()=>a?.(e,r)}):/* @__PURE__ */ t(`span`,{className:`bolt${r.poe?``:` idle`}`,children:`⚡`}),/* @__PURE__ */ t(`span`,{className:`strong nowrap`,children:r.label}),/* @__PURE__ */ t(`span`,{className:`muted ellipsis`,children:r.description||``}),/* @__PURE__ */ t(`span`,{className:`poe-state nowrap${s?` on`:``}`,children:c})]})}function be({wan:e,address:r,word:i}){let a=[r||null,e.uptime?j(e.uptime):null,e.trackingHosts?`${i(`telt_tracking`)} ${e.trackingHosts}`:null].filter(Boolean).join(` · `);return/* @__PURE__ */ n(`div`,{className:`item wan${e.enabled===!1?` off`:``}`,children:[/* @__PURE__ */ t(`span`,{className:`dot ${Z(e.status)}`}),/* @__PURE__ */ t(`span`,{className:`strong wan-label`,children:e.label}),/* @__PURE__ */ t(`span`,{className:`wan-status ${Z(e.status)}`,children:e.status||`-`}),/* @__PURE__ */ t(`span`,{className:`muted ellipsis`,children:a})]})}function Q({device:e,word:r,actions:i}){let a=e.ports.filter(e=>e.poe!==null),o=[];e.model&&o.push([r(`telt_model`),e.model]),e.isRouter&&(e.operator&&o.push([r(`telt_operator`),e.operator]),e.connection&&o.push([r(`telt_connection`),e.connection]),e.network&&o.push([r(`telt_network`),e.network]),e.signal!==null&&o.push([r(`telt_signal`),`${e.signal} dBm`])),e.lan&&o.push([r(`telt_lan`),e.lan]),e.isRouter&&(e.wan&&o.push([r(`telt_wan`),e.wan]),e.wanIPv6&&o.push([`IPv6`,e.wanIPv6]),e.temperature!==null&&o.push([r(`telt_temperature`),`${e.temperature} °C`])),e.uptime!==null&&o.push([r(`telt_uptime`),j(e.uptime)||``]),e.cpu!==null&&o.push([`CPU`,`${Math.round(e.cpu)} %`]);let{cols:s,groups:c}=J(e.ports);return/* @__PURE__ */ n(`div`,{className:`card detail ${pe(e.alive)}`,children:[/* @__PURE__ */ n(`div`,{className:`card-head`,children:[/* @__PURE__ */ t(`span`,{className:`card-name`,children:e.name}),/* @__PURE__ */ t(`span`,{className:`muted nowrap`,children:e.isRouter?r(`telt_router`):r(`telt_switch`)})]}),e.ports.length?/* @__PURE__ */ t(`div`,{className:`panel-box`,style:{"--cols":s,"--groups":c},children:/* @__PURE__ */ t(X,{device:e,word:r,onToggle:i.onToggle})}):/* @__PURE__ */ t(`div`,{className:`small muted`,children:r(`telt_no_ports`)}),a.length?/* @__PURE__ */ n(`div`,{className:`section`,children:[/* @__PURE__ */ t(`div`,{className:`section-title`,children:`PoE`}),/* @__PURE__ */ t(`div`,{className:`poe-grid`,children:a.map(n=>/* @__PURE__ */ t(ye,{device:e,port:n,word:r,onTogglePoe:i.onTogglePoe},n.id))})]}):null,e.wanInterfaces.length?/* @__PURE__ */ n(`div`,{className:`section`,children:[/* @__PURE__ */ t(`div`,{className:`section-title`,children:r(`telt_wan_interfaces`)}),e.wanInterfaces.map(n=>/* @__PURE__ */ t(be,{wan:n,address:e.addresses[n.id],word:r},n.id))]}):null,e.io.length?/* @__PURE__ */ t(`div`,{className:`line wrap`,children:e.io.map(e=>/* @__PURE__ */ n(`span`,{className:`item small`,children:[/* @__PURE__ */ t(`span`,{className:`dot ${e.state?`online`:`unknown`}`}),`${e.label}${e.type?` · ${e.type}`:``}`]},e.id))}):null,o.length?/* @__PURE__ */ t(`div`,{className:`facts small`,children:o.map(([e,r])=>/* @__PURE__ */ n(`span`,{children:[/* @__PURE__ */ t(`span`,{className:`faint`,children:`${e}: `}),r]},e))}):null]})}var xe=`M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z`,Se=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`;function $({text:e,icon:r,editMode:i}){return/* @__PURE__ */ n(`div`,{className:`hint${i?` edit`:``}`,children:[/* @__PURE__ */ t(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ t(`path`,{d:r===`person`?Se:xe})}),/* @__PURE__ */ t(`span`,{children:e})]})}D(O,class extends fe{constructor(){super(ce)}getInstance(e){return e.device?.trim()?I(L(e.device)):F(e.instance)}getShownDevices(e,t){let n=L(e.device);if(e.device?.trim())return n&&t.devices.has(n)?[n]:[];let r=[...t.devices.values()].find(e=>e.ports.length);return r?[r.id]:[]}getLevel(e){return e.mode===`detail`?`all`:`panel`}#e(){let e=this.getFound(this.settings);return e&&this.getDevices(this.getShownDevices(this.settings,e))[0]||null}#t=()=>{let e=this.#e();!this.editMode&&e&&this.emit(`teltonika-ports-click`,{device:e.id})&&this.openDetails(e.name,()=>{let e=this.#e();return e?/* @__PURE__ */ t(Q,{device:e,word:this.word,actions:this.getActions(this.settings.allowSwitching)}):null})};#n=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.#t())};draw(){let e=this.settings,r=this.word,i=this.editMode;if(!this.getInstance(e)){this.root.render(/* @__PURE__ */ t($,{text:r(e.device?.trim()?`wc_not_device`:`wc_choose_instance`),icon:`router`,editMode:i}));return}if(!this.getFound(e)){this.root.render(/* @__PURE__ */ t(`div`,{className:`root`}));return}let a=this.#e();if(!a){this.root.render(/* @__PURE__ */ t($,{text:r(e.device?.trim()?`wc_not_device`:`no_device`),icon:`router`,editMode:i}));return}let o=this.getActions(e.allowSwitching);if(e.mode===`detail`){this.root.render(/* @__PURE__ */ t(`div`,{className:`root${i?` edit`:``}`,children:/* @__PURE__ */ t(`div`,{className:`list`,children:/* @__PURE__ */ t(Q,{device:a,word:r,actions:o})})}));return}let{cols:s,groups:c}=J(a.ports),l=!i;this.root.render(/* @__PURE__ */ t(`div`,{className:`root${i?` edit`:``}`,children:/* @__PURE__ */ n(`div`,{className:`front${a.alive===!1?` offline`:``}${l?` clickable`:``}`,style:{"--cols":Math.max(s,1),"--groups":Math.max(c,1)},role:l?`button`:void 0,tabIndex:l?0:void 0,onClick:l?this.#t:void 0,onKeyDown:l?this.#n:void 0,children:[/* @__PURE__ */ t(`div`,{className:`front-name`,children:a.name}),a.ports.length?/* @__PURE__ */ t(X,{device:a,word:r,onToggle:o.onToggle}):/* @__PURE__ */ t(`div`,{className:`front-links`,children:r(`telt_no_ports`)}),a.ports.length?/* @__PURE__ */ t(`div`,{className:`front-links`,children:ve(a.ports,r)}):null]})}))}});