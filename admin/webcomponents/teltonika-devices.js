import{createRoot as e,Fragment as t,jsx as n,jsxs as r}from"../../../lib/esm/react-19.js";var i=`iob-dialog-close`;function a(e){return!!e.form}var o=[`header`,`staticText`,`divider`];function s(e,t){return e==null?``:typeof e==`object`?e[t]||e.en||Object.values(e).find(e=>!!e)||``:String(e)}function c(e){let t={};for(let[n,r]of Object.entries(e.items||{}))r&&!o.includes(r.type)&&(t[n]=r.type);return t}function l(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?e.toString():JSON.stringify(e)}function u(e,t){if(t!=null)switch(e){case`number`:case`slider`:{if(typeof t==`number`)return Number.isFinite(t)?t:void 0;let e=l(t).trim().replace(`,`,`.`);if(!e)return;let n=Number(e);return Number.isFinite(n)?n:void 0}case`checkbox`:return t===!0||t===`true`||t===1||t===`1`;default:return l(t)}}function d(e,t){let n={};for(let[r,i]of Object.entries(e)){let e=u(i,t[r]);e!==void 0&&(n[r]=e)}return n}var f=`"Roboto", "Helvetica", "Arial", sans-serif`,p=Object.freeze({type:`light`,primary:`#3399CC`,primaryContrast:`#FFFFFF`,secondary:`#164477`,secondaryContrast:`#FFFFFF`,background:`#FFFFFF`,paper:`#FFFFFF`,text:`rgba(0, 0, 0, 0.87)`,textSecondary:`rgba(0, 0, 0, 0.6)`,divider:`rgba(0, 0, 0, 0.12)`,error:`#D32F2F`,warning:`#ED6C02`,info:`#0288D1`,success:`#2E7D32`,fontFamily:f,fontSize:14,borderRadius:4}),m=Object.freeze({type:`dark`,primary:`#4DABF5`,primaryContrast:`rgba(0, 0, 0, 0.87)`,secondary:`#436A93`,secondaryContrast:`#FFFFFF`,background:`#121212`,paper:`#121212`,text:`#FFFFFF`,textSecondary:`rgba(255, 255, 255, 0.7)`,divider:`rgba(255, 255, 255, 0.12)`,error:`#F44336`,warning:`#FFA726`,info:`#29B6F6`,success:`#66BB6A`,fontFamily:f,fontSize:14,borderRadius:4}),h=[`primary`,`primaryContrast`,`secondary`,`secondaryContrast`,`background`,`paper`,`text`,`textSecondary`,`divider`,`error`,`warning`,`info`,`success`,`fontFamily`],g=[`fontSize`,`borderRadius`];function _(e){return{...e===`dark`?m:p}}function v(e){if(!e||typeof e!=`object`)return _(typeof e==`string`?e:`light`);let t=e,n=_(typeof t.type==`string`?t.type:`light`);for(let e of h){let r=t[e];typeof r==`string`&&r.trim()&&(n[e]=r.trim())}for(let e of g){let r=t[e],i=typeof r==`string`?parseFloat(r):r;typeof i==`number`&&Number.isFinite(i)&&i>=0&&(n[e]=i)}return n}function y(e,t){return e.type===t.type&&h.every(n=>e[n]===t[n])&&g.every(n=>e[n]===t[n])}function b(e){return`--iob-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`}function x(e){let t={};for(let n of h)t[b(n)]=e[n];for(let n of g)t[b(n)]=`${e[n]}px`;return t[`color-scheme`]=e.type,t}var S={ok:{en:`OK`,"zh-cn":`确定`},cancel:{en:`Cancel`,de:`Abbrechen`,ru:`Отмена`,pt:`Cancelar`,nl:`Annuleren`,fr:`Annuler`,it:`Annulla`,es:`Cancelar`,pl:`Anuluj`,uk:`Скасувати`,"zh-cn":`取消`},close:{en:`Close`,de:`Schließen`,ru:`Закрыть`,pt:`Fechar`,nl:`Sluiten`,fr:`Fermer`,it:`Chiudi`,es:`Cerrar`,pl:`Zamknij`,uk:`Закрити`,"zh-cn":`关闭`}},C=`
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
`;function w(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function T(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function ee(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function te(e,t,n,r,i){let a={name:t,setting:n,box:e.createElement(`div`),hidden:w(n.hidden),disabled:w(n.disabled)},o=s(n.label,i);switch(n.type){case`header`:return a.box=e.createElement(`h3`),a.box.textContent=s(n.text,i)||o,a;case`staticText`:return a.box=e.createElement(`p`),a.box.textContent=s(n.text,i)||o,a;case`divider`:return a.box=e.createElement(`hr`),a}let c=e.createElement(`label`);a.box=c;let l=e.createElement(`span`);if(l.textContent=o||t,n.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=r===!0||r===`true`,c.className=`check`,c.append(t,l),a.input=t}else if(n.type===`select`){let t=e.createElement(`select`);for(let r of n.options||[]){let n=e.createElement(`option`);n.textContent=s(r.label,i),t.append(n)}let o=(n.options||[]).findIndex(e=>String(e.value)===T(r));t.selectedIndex=o===-1?0:o,c.append(l,t),a.input=t}else if(n.type===`text`&&(n.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=n.minRows||2,t.value=T(r),c.append(l,t),a.input=t}else{let t=e.createElement(`input`),i=T(r);switch(n.type){case`number`:case`slider`:t.type=n.type===`slider`?`range`:`number`,n.min!==void 0&&(t.min=String(n.min)),n.max!==void 0&&(t.max=String(n.max)),t.step=n.step===void 0?`any`:String(n.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!i||/^#[0-9a-f]{6}$/i.test(i)?`color`:`text`;break;default:t.type=`text`}if(t.value=i,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}c.append(l,t),a.input=t}if(n.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=s(n.help,i),c.append(t)}return a}function ne(e,t={}){let n=t.lang||`en`,r=document,o=e=>S[e][n]||S[e].en||e,l=r.createElement(`div`);l.setAttribute(`data-iob-dialog`,``);let u=l.attachShadow({mode:`open`}),f=r.createElement(`style`);f.textContent=C;let p=r.createElement(`dialog`),m=v(t.theme);p.className=m.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(x(m)))p.style.setProperty(e,t);e.width&&(p.style.width=`${e.width}px`),e.height&&(p.style.height=`${e.height}px`);let h=r.createElement(`form`),g=r.createElement(`header`),_=r.createElement(`span`);_.textContent=s(e.title,n);let y=r.createElement(`button`);y.type=`button`,y.className=`close`,y.title=o(`close`),y.setAttribute(`aria-label`,o(`close`)),y.textContent=`×`,g.append(_,y);let b=r.createElement(`div`);return b.className=`body`,h.append(g,b),p.append(h),u.append(f,p),new Promise(t=>{let f=!1,m=e=>{f||(f=!0,p.open&&p.close(),l.remove(),t(e))};if(y.addEventListener(`click`,()=>m(null)),p.addEventListener(`close`,()=>m(null)),h.addEventListener(`submit`,e=>e.preventDefault()),a(e)){let t={},i=[];for(let[t,a]of Object.entries(e.form.items||{})){let o=e.data?.[t]??a.default,s=te(r,t,a,o,n);i.push(s),b.append(s.box)}let a=()=>{for(let e of i)e.input&&(t[e.name]=ee(e));return t},l=()=>{let e=a();for(let t of i)t.box.hidden=t.hidden?t.hidden(e):!1,t.input&&(t.input.disabled=t.disabled?t.disabled(e):!1)};h.addEventListener(`input`,l),h.addEventListener(`change`,l),l();let u=i.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);u?.input&&(u.input.autofocus=!0);let f=r.createElement(`footer`),p=r.createElement(`button`);p.type=`button`,p.textContent=s(e.cancel,n)||o(`cancel`),p.addEventListener(`click`,()=>m(null));let g=r.createElement(`button`);g.type=`submit`,g.className=`primary`,g.textContent=s(e.ok,n)||o(`ok`),f.append(p,g),h.append(f),h.addEventListener(`submit`,()=>m(d(c(e.form),a())))}else b.append(e.element),p.addEventListener(i,e=>m(e.detail??null));r.body.append(l),p.showModal(),u.activeElement&&u.activeElement!==y||(p.tabIndex=-1,p.focus())})}function E(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var D=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],re=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=v(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=v(e);y(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of D)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return s(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(e){if(this.#r)return null;let t=this.#i?await this.#i.open(e):await ne(e,{lang:this.systemLang,theme:this.#n});return a(e)?t&&typeof t==`object`?d(c(e.form),t):null:t??null}#u(){for(let[e,t]of Object.entries(x(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?E(this.getStateIds(this.#t)):[],n=e?E(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function ie(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}var ae=`iob-teltonika-devices`;function oe(e,t){return!e||e===t||e===t.replace(/_\d+$/,``)?null:e}var O=`香`;function k(e){return e.split(`.`).length}function se(e,t){let n=/(\d+)\s*$/.exec(e),r=/(\d+)\s*$/.exec(t);return n&&r&&e.slice(0,e.length-n[1].length)===t.slice(0,t.length-r[1].length)?Number(n[1])-Number(r[1]):e.localeCompare(t)}function ce(e){let t=[],n=[];return e.forEach((e,r)=>(r%2==0?t:n).push(e)),{top:t,bottom:n}}function le(e,t){return!t||!e?null:e>=1e3?e>=1e4?`${Math.round(e/1e3)}G`:`GbE`:e>=100?`FE`:`${e}M`}function A(e){if(e===null||isNaN(e))return null;let t=Math.floor(e/86400),n=Math.floor(e%86400/3600),r=Math.floor(e%3600/60);return t?`${t}d ${n}h`:n?`${n}h ${r}m`:`${r}m`}function j(e){if(e===null||isNaN(e))return null;let t=[`B`,`kB`,`MB`,`GB`,`TB`],n=e,r=0;for(;n>=1024&&r<t.length-1;)n/=1024,r++;return`${n>=100||r===0?Math.round(n):n.toFixed(1)} ${t[r]}`}async function M(e,t){let n=`${t}.`,[r,i]=await Promise.all([e.getObjectViewSystem(`channel`,n,`${n}${O}`),e.getObjectViewSystem(`state`,n,`${n}${O}`)]),a=/* @__PURE__ */ new Map,o=k(n)-1,s=/* @__PURE__ */ new Map;for(let[e,t]of Object.entries(r))typeof t.common?.name==`string`&&t.common.name&&s.set(e,t.common.name);for(let[e,t]of Object.entries(r))k(e)!==o+1||e.endsWith(`.info`)||a.set(e,{id:e,name:typeof t.common?.name==`string`?t.common.name:e.split(`.`).pop()||e,alive:null,model:null,uptime:null,cpu:null,operator:null,signal:null,connection:null,network:null,temperature:null,wan:null,wanIPv6:null,lan:null,addresses:{},ports:[],wanInterfaces:[],io:[],isRouter:!1});let c=/* @__PURE__ */ new Map,l=/* @__PURE__ */ new Map,u=/* @__PURE__ */ new Map,d=/* @__PURE__ */ new Map;for(let[e,t]of Object.entries(i)){let n=e.split(`.`),r=n.slice(0,o+1).join(`.`),i=a.get(r);if(!i)continue;c.set(e,r);let f=n.slice(o+1);if(f[0]===`ports`&&f.length===3){let e=l.get(r)||/* @__PURE__ */ new Map;l.set(r,e);let n=e.get(f[1])||{id:f[1],label:f[1],link:null,speed:null,duplex:null,rxRate:null,txRate:null,rxBytes:null,txBytes:null,enabled:null,switchable:!1,description:oe(s.get(`${r}.ports.${f[1]}`),f[1]),poe:null,poeSwitchable:!1,poeActive:null,poePower:null,fibre:/^sfp/i.test(f[1])};f[2]===`enabled`?n.switchable=t.common?.write===!0:f[2]===`poe`&&(n.poeSwitchable=t.common?.write===!0),e.set(f[1],n)}else if(f[0]===`interfaces`&&f.length===3){let e=u.get(r)||/* @__PURE__ */ new Map;u.set(r,e),e.has(f[1])||e.set(f[1],{id:f[1],label:s.get(`${r}.interfaces.${f[1]}`)||f[1],status:null,enabled:null,uptime:null,trackingHosts:null}),i.isRouter=!0}else if(f[0]===`io`&&f.length===3){let e=d.get(r)||/* @__PURE__ */ new Map;d.set(r,e),e.has(f[1])||e.set(f[1],{id:f[1],label:f[1],state:null,type:null})}else f.length===1&&[`operator`,`signal`,`connection`,`temperature`].includes(f[0])&&(i.isRouter=!0)}for(let[e,t]of l){let n=a.get(e);n&&(n.ports=[...t.values()].sort((e,t)=>se(e.id,t.id)))}for(let[e,t]of u){let n=a.get(e);n&&(n.wanInterfaces=[...t.values()].sort((e,t)=>e.id.localeCompare(t.id)))}for(let[e,t]of d){let n=a.get(e);n&&(n.io=[...t.values()].sort((e,t)=>e.id.localeCompare(t.id)))}return{devices:a,stateIds:c}}function N(e,t,n){let r=t.split(`.`);if(r.length===1)switch(r[0]){case`alive`:return e.alive=n===null?null:!!n,!0;case`name`:return e.model=n===null?null:String(n),!0;case`uptime`:return e.uptime=typeof n==`number`?n:null,!0;case`cpu`:return e.cpu=typeof n==`number`?n:null,!0;case`operator`:case`connection`:case`network`:case`wan`:case`wanIPv6`:case`lan`:return e[r[0]]=n===null?null:String(n),!0;case`signal`:case`temperature`:return e[r[0]]=typeof n==`number`?n:null,!0;default:return!1}if(r[0]===`ports`&&r.length===3){let t=e.ports.find(e=>e.id===r[1]);if(!t)return!1;switch(r[2]){case`state`:return t.link=n===null?null:!!n,!0;case`enabled`:return t.enabled=n===null?null:!!n,!0;case`poe`:return t.poe=n===null?null:!!n,!0;case`poeActive`:return t.poeActive=n===null?null:!!n,!0;case`poePower`:return t.poePower=typeof n==`number`?n:null,!0;case`duplex`:return t.duplex=n===null?null:!!n,!0;case`speed`:case`rxRate`:case`txRate`:case`rxBytes`:case`txBytes`:return t[r[2]]=typeof n==`number`?n:null,!0;default:return!1}}if(r[0]===`addresses`&&r.length===2)return n===null||n===``?delete e.addresses[r[1]]:e.addresses[r[1]]=String(n),!0;if(r[0]===`interfaces`&&r.length===3){let t=e.wanInterfaces.find(e=>e.id===r[1]);if(!t)return!1;switch(r[2]){case`status`:case`trackingHosts`:return t[r[2]]=n===null?null:String(n),!0;case`enabled`:return t.enabled=n===null?null:!!n,!0;case`uptime`:return t.uptime=typeof n==`number`?n:null,!0;default:return!1}}if(r[0]===`io`&&r.length===3){let t=e.io.find(e=>e.id===r[1]);if(!t)return!1;if(r[2]===`state`)return t.state=n===null?null:!!n,!0;if(r[2]===`type`)return t.type=n===null?null:String(n),!0}return!1}function P(e){let t=String(e??``).trim().match(/^(?:system\.adapter\.)?(?:teltonika\.)?(\d+)$/);return t?`teltonika.${t[1]}`:null}async function F(e,t){let{devices:n,stateIds:r}=await M(e,t);return n.delete(`${t}.presence`),{instance:t,devices:n,owners:new Map([...r].filter(([,e])=>n.has(e)))}}var I=[`alive`,`name`,`uptime`,`temperature`,`cpu`,`operator`,`connection`,`signal`,`lan`,`wan`];function L(e,t){let n=e.split(`.`);switch(t){case`summary`:return e===`alive`||n[0]===`ports`&&(n[2]===`state`||n[2]===`enabled`);case`tile`:return I.includes(e)||n[0]===`ports`&&(n[2]===`state`||n[2]===`enabled`)||n[0]===`interfaces`&&(n[2]===`status`||n[2]===`enabled`);case`panel`:return e===`alive`||n[0]===`ports`;default:return!0}}function R(e,t,n){let r=new Set(t),i=[];for(let[t,a]of e.owners)r.has(a)&&L(t.slice(a.length+1),n)&&i.push(t);return i}function z(e){return{...e,addresses:{...e.addresses},ports:e.ports.map(e=>({...e})),wanInterfaces:e.wanInterfaces.map(e=>({...e})),io:e.io.map(e=>({...e}))}}function B(e,t,n){let r=/* @__PURE__ */ new Map;for(let n of t){let t=e.devices.get(n);t&&r.set(n,z(t))}for(let[t,i]of Object.entries(n)){let n=e.owners.get(t),a=n?r.get(n):void 0;a&&i&&N(a,t.slice(a.id.length+1),i.val)}return[...r.values()]}function V(e){let t=e=>e.alive===!1?0:e.alive===!0?1:2;return[...e].sort((e,n)=>t(e)-t(n)||e.name.localeCompare(n.name))}var H=`
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
`,U=`
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
`,W=`
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
`,G=`
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
`,ue=`${H}${U}${G}
.summary {
    height: 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 2.5cqmin, 10px);
    text-align: center;
}
.summary.clickable:hover {
    background: var(--tint);
}
.count {
    display: flex;
    align-items: baseline;
    gap: 0.2em;
    font-size: clamp(20px, 20cqmin, 72px);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}
.count .online {
    color: var(--iob-success);
}
.count .slash {
    font-size: 0.7em;
    font-weight: 400;
    opacity: 0.4;
}
.count-label {
    font-size: clamp(10px, 6cqmin, 16px);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
}
.count-links {
    font-size: clamp(10px, 5.5cqmin, 15px);
    color: var(--muted);
}
.strips {
    --strip: clamp(8px, 6cqmin, 18px);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 2px;
}
@container (max-height: 140px) {
    .strips {
        display: none;
    }
}
@container (max-height: 90px) {
    .count-label {
        display: none;
    }
}
.tiles {
    height: 100%;
    overflow: auto;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
}
.tiles .card {
    flex: 1 1 220px;
}
.tiles.clickable .card:hover {
    background: var(--hover);
}
.list {
    height: 100%;
    overflow: auto;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    user-select: text;
}
.empty {
    padding: 12px;
    color: var(--muted);
}
`,de=`${H}${W}${G}`;function fe(e){let t={en:{telt_uptime:`Uptime`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links up`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Connection`,telt_network:`Network`,telt_signal:`Signal`,telt_temperature:`Temperature`,telt_no_ports:`This device reports no ports`,telt_poe_off:`PoE off`,telt_poe_idle:`no consumer`,telt_poe_on:`PoE on`,telt_wan_interfaces:`WAN interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`up`,telt_nolink:`no link`,telt_disabled:`disabled`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Click to switch on or off`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`,wc_not_device:`Not a device of the Teltonika adapter`,telt_devices:`Devices`,telt_empty:`No devices found`,telt_dialog_title:`Teltonika devices`},de:{telt_uptime:`Laufzeit`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`Links aktiv`,telt_model:`Modell`,telt_operator:`Betreiber`,telt_connection:`Verbindung`,telt_network:`Netz`,telt_signal:`Signal`,telt_temperature:`Temperatur`,telt_no_ports:`Dieses Gerät meldet keine Ports`,telt_poe_off:`PoE aus`,telt_poe_idle:`kein Verbraucher`,telt_poe_on:`PoE an`,telt_wan_interfaces:`WAN-Schnittstellen`,telt_tracking:`Tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktiv`,telt_nolink:`kein Link`,telt_disabled:`deaktiviert`,wc_full_duplex:`Vollduplex`,wc_click_to_switch:`Klicken zum Ein- oder Ausschalten`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`,wc_not_device:`Kein Gerät des Teltonika-Adapters`,telt_devices:`Geräte`,telt_empty:`Keine Geräte gefunden`,telt_dialog_title:`Teltonika-Geräte`},ru:{telt_uptime:`Время работы`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Роутер`,telt_switch:`Коммутатор`,telt_links:`линков активно`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Соединение`,telt_network:`Сеть`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Это устройство не сообщает о портах`,telt_poe_off:`PoE выкл.`,telt_poe_idle:`нет потребителя`,telt_poe_on:`PoE вкл.`,telt_wan_interfaces:`Интерфейсы WAN`,telt_tracking:`отслеживание`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активен`,telt_nolink:`нет линка`,telt_disabled:`отключён`,wc_full_duplex:`полный дуплекс`,wc_click_to_switch:`Нажмите, чтобы включить или выключить`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`,wc_not_device:`Это не устройство адаптера Teltonika`,telt_devices:`Устройства`,telt_empty:`Устройства не найдены`,telt_dialog_title:`Устройства Teltonika`},pt:{telt_uptime:`Tempo ativo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`ligações ativas`,telt_model:`Modelo`,telt_operator:`Operadora`,telt_connection:`Ligação`,telt_network:`Rede`,telt_signal:`Sinal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo não reporta portas`,telt_poe_off:`PoE desligado`,telt_poe_idle:`sem consumidor`,telt_poe_on:`PoE ligado`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`monitorização`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`ativa`,telt_nolink:`sem ligação`,telt_disabled:`desativada`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Clique para ligar ou desligar`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`,wc_not_device:`Não é um dispositivo do adaptador Teltonika`,telt_devices:`Dispositivos`,telt_empty:`Nenhum dispositivo encontrado`,telt_dialog_title:`Dispositivos Teltonika`},nl:{telt_uptime:`Bedrijfstijd`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links actief`,telt_model:`Model`,telt_operator:`Provider`,telt_connection:`Verbinding`,telt_network:`Netwerk`,telt_signal:`Signaal`,telt_temperature:`Temperatuur`,telt_no_ports:`Dit apparaat meldt geen poorten`,telt_poe_off:`PoE uit`,telt_poe_idle:`geen verbruiker`,telt_poe_on:`PoE aan`,telt_wan_interfaces:`WAN-interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actief`,telt_nolink:`geen link`,telt_disabled:`uitgeschakeld`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Klik om in of uit te schakelen`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`,wc_not_device:`Geen apparaat van de Teltonika-adapter`,telt_devices:`Apparaten`,telt_empty:`Geen apparaten gevonden`,telt_dialog_title:`Teltonika-apparaten`},fr:{telt_uptime:`Durée de fonctionnement`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Routeur`,telt_switch:`Commutateur`,telt_links:`liens actifs`,telt_model:`Modèle`,telt_operator:`Opérateur`,telt_connection:`Connexion`,telt_network:`Réseau`,telt_signal:`Signal`,telt_temperature:`Température`,telt_no_ports:`Cet appareil ne signale aucun port`,telt_poe_off:`PoE désactivé`,telt_poe_idle:`aucun consommateur`,telt_poe_on:`PoE activé`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`surveillance`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actif`,telt_nolink:`pas de lien`,telt_disabled:`désactivé`,wc_full_duplex:`duplex intégral`,wc_click_to_switch:`Cliquez pour activer ou désactiver`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`,wc_not_device:`Pas un appareil de l'adaptateur Teltonika`,telt_devices:`Appareils`,telt_empty:`Aucun appareil trouvé`,telt_dialog_title:`Appareils Teltonika`},it:{telt_uptime:`Tempo di attività`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`collegamenti attivi`,telt_model:`Modello`,telt_operator:`Operatore`,telt_connection:`Connessione`,telt_network:`Rete`,telt_signal:`Segnale`,telt_temperature:`Temperatura`,telt_no_ports:`Questo dispositivo non segnala porte`,telt_poe_off:`PoE spento`,telt_poe_idle:`nessun utilizzatore`,telt_poe_on:`PoE attivo`,telt_wan_interfaces:`Interfacce WAN`,telt_tracking:`monitoraggio`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`attiva`,telt_nolink:`nessun collegamento`,telt_disabled:`disattivata`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Clicca per accendere o spegnere`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`,wc_not_device:`Non è un dispositivo dell'adattatore Teltonika`,telt_devices:`Dispositivi`,telt_empty:`Nessun dispositivo trovato`,telt_dialog_title:`Dispositivi Teltonika`},es:{telt_uptime:`Tiempo activo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`enlaces activos`,telt_model:`Modelo`,telt_operator:`Operador`,telt_connection:`Conexión`,telt_network:`Red`,telt_signal:`Señal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo no informa de puertos`,telt_poe_off:`PoE apagado`,telt_poe_idle:`sin consumidor`,telt_poe_on:`PoE encendido`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`seguimiento`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`activo`,telt_nolink:`sin enlace`,telt_disabled:`desactivado`,wc_full_duplex:`dúplex completo`,wc_click_to_switch:`Haga clic para encender o apagar`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`,wc_not_device:`No es un dispositivo del adaptador Teltonika`,telt_devices:`Dispositivos`,telt_empty:`No se encontraron dispositivos`,telt_dialog_title:`Dispositivos Teltonika`},pl:{telt_uptime:`Czas pracy`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Przełącznik`,telt_links:`aktywnych łączy`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Połączenie`,telt_network:`Sieć`,telt_signal:`Sygnał`,telt_temperature:`Temperatura`,telt_no_ports:`To urządzenie nie zgłasza portów`,telt_poe_off:`PoE wył.`,telt_poe_idle:`brak odbiornika`,telt_poe_on:`PoE wł.`,telt_wan_interfaces:`Interfejsy WAN`,telt_tracking:`monitorowanie`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktywny`,telt_nolink:`brak łącza`,telt_disabled:`wyłączony`,wc_full_duplex:`pełny dupleks`,wc_click_to_switch:`Kliknij, aby włączyć lub wyłączyć`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`,wc_not_device:`To nie jest urządzenie adaptera Teltonika`,telt_devices:`Urządzenia`,telt_empty:`Nie znaleziono urządzeń`,telt_dialog_title:`Urządzenia Teltonika`},uk:{telt_uptime:`Час роботи`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Маршрутизатор`,telt_switch:`Комутатор`,telt_links:`активних лінків`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Зʼєднання`,telt_network:`Мережа`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Цей пристрій не повідомляє про порти`,telt_poe_off:`PoE вимк.`,telt_poe_idle:`немає споживача`,telt_poe_on:`PoE увімк.`,telt_wan_interfaces:`Інтерфейси WAN`,telt_tracking:`відстеження`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активний`,telt_nolink:`немає лінка`,telt_disabled:`вимкнено`,wc_full_duplex:`повний дуплекс`,wc_click_to_switch:`Натисніть, щоб увімкнути або вимкнути`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`,wc_not_device:`Це не пристрій адаптера Teltonika`,telt_devices:`Пристрої`,telt_empty:`Пристроїв не знайдено`,telt_dialog_title:`Пристрої Teltonika`},"zh-cn":{telt_uptime:`运行时间`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`路由器`,telt_switch:`交换机`,telt_links:`条链路已连接`,telt_model:`型号`,telt_operator:`运营商`,telt_connection:`连接`,telt_network:`网络`,telt_signal:`信号`,telt_temperature:`温度`,telt_no_ports:`该设备未报告端口`,telt_poe_off:`PoE 关`,telt_poe_idle:`无用电设备`,telt_poe_on:`PoE 开`,telt_wan_interfaces:`WAN 接口`,telt_tracking:`探测`,telt_ethernet:`以太网`,telt_fibre:`SFP`,telt_up:`已连接`,telt_nolink:`无链路`,telt_disabled:`已禁用`,wc_full_duplex:`全双工`,wc_click_to_switch:`点击开启或关闭`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`,wc_not_device:`不是 Teltonika 适配器的设备`,telt_devices:`设备`,telt_empty:`未找到设备`,telt_dialog_title:`Teltonika 设备`}}[e]||{},n={en:{telt_uptime:`Uptime`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links up`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Connection`,telt_network:`Network`,telt_signal:`Signal`,telt_temperature:`Temperature`,telt_no_ports:`This device reports no ports`,telt_poe_off:`PoE off`,telt_poe_idle:`no consumer`,telt_poe_on:`PoE on`,telt_wan_interfaces:`WAN interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`up`,telt_nolink:`no link`,telt_disabled:`disabled`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Click to switch on or off`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`,wc_not_device:`Not a device of the Teltonika adapter`,telt_devices:`Devices`,telt_empty:`No devices found`,telt_dialog_title:`Teltonika devices`},de:{telt_uptime:`Laufzeit`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`Links aktiv`,telt_model:`Modell`,telt_operator:`Betreiber`,telt_connection:`Verbindung`,telt_network:`Netz`,telt_signal:`Signal`,telt_temperature:`Temperatur`,telt_no_ports:`Dieses Gerät meldet keine Ports`,telt_poe_off:`PoE aus`,telt_poe_idle:`kein Verbraucher`,telt_poe_on:`PoE an`,telt_wan_interfaces:`WAN-Schnittstellen`,telt_tracking:`Tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktiv`,telt_nolink:`kein Link`,telt_disabled:`deaktiviert`,wc_full_duplex:`Vollduplex`,wc_click_to_switch:`Klicken zum Ein- oder Ausschalten`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`,wc_not_device:`Kein Gerät des Teltonika-Adapters`,telt_devices:`Geräte`,telt_empty:`Keine Geräte gefunden`,telt_dialog_title:`Teltonika-Geräte`},ru:{telt_uptime:`Время работы`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Роутер`,telt_switch:`Коммутатор`,telt_links:`линков активно`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Соединение`,telt_network:`Сеть`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Это устройство не сообщает о портах`,telt_poe_off:`PoE выкл.`,telt_poe_idle:`нет потребителя`,telt_poe_on:`PoE вкл.`,telt_wan_interfaces:`Интерфейсы WAN`,telt_tracking:`отслеживание`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активен`,telt_nolink:`нет линка`,telt_disabled:`отключён`,wc_full_duplex:`полный дуплекс`,wc_click_to_switch:`Нажмите, чтобы включить или выключить`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`,wc_not_device:`Это не устройство адаптера Teltonika`,telt_devices:`Устройства`,telt_empty:`Устройства не найдены`,telt_dialog_title:`Устройства Teltonika`},pt:{telt_uptime:`Tempo ativo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`ligações ativas`,telt_model:`Modelo`,telt_operator:`Operadora`,telt_connection:`Ligação`,telt_network:`Rede`,telt_signal:`Sinal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo não reporta portas`,telt_poe_off:`PoE desligado`,telt_poe_idle:`sem consumidor`,telt_poe_on:`PoE ligado`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`monitorização`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`ativa`,telt_nolink:`sem ligação`,telt_disabled:`desativada`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Clique para ligar ou desligar`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`,wc_not_device:`Não é um dispositivo do adaptador Teltonika`,telt_devices:`Dispositivos`,telt_empty:`Nenhum dispositivo encontrado`,telt_dialog_title:`Dispositivos Teltonika`},nl:{telt_uptime:`Bedrijfstijd`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`links actief`,telt_model:`Model`,telt_operator:`Provider`,telt_connection:`Verbinding`,telt_network:`Netwerk`,telt_signal:`Signaal`,telt_temperature:`Temperatuur`,telt_no_ports:`Dit apparaat meldt geen poorten`,telt_poe_off:`PoE uit`,telt_poe_idle:`geen verbruiker`,telt_poe_on:`PoE aan`,telt_wan_interfaces:`WAN-interfaces`,telt_tracking:`tracking`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actief`,telt_nolink:`geen link`,telt_disabled:`uitgeschakeld`,wc_full_duplex:`full-duplex`,wc_click_to_switch:`Klik om in of uit te schakelen`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`,wc_not_device:`Geen apparaat van de Teltonika-adapter`,telt_devices:`Apparaten`,telt_empty:`Geen apparaten gevonden`,telt_dialog_title:`Teltonika-apparaten`},fr:{telt_uptime:`Durée de fonctionnement`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Routeur`,telt_switch:`Commutateur`,telt_links:`liens actifs`,telt_model:`Modèle`,telt_operator:`Opérateur`,telt_connection:`Connexion`,telt_network:`Réseau`,telt_signal:`Signal`,telt_temperature:`Température`,telt_no_ports:`Cet appareil ne signale aucun port`,telt_poe_off:`PoE désactivé`,telt_poe_idle:`aucun consommateur`,telt_poe_on:`PoE activé`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`surveillance`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`actif`,telt_nolink:`pas de lien`,telt_disabled:`désactivé`,wc_full_duplex:`duplex intégral`,wc_click_to_switch:`Cliquez pour activer ou désactiver`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`,wc_not_device:`Pas un appareil de l'adaptateur Teltonika`,telt_devices:`Appareils`,telt_empty:`Aucun appareil trouvé`,telt_dialog_title:`Appareils Teltonika`},it:{telt_uptime:`Tempo di attività`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`collegamenti attivi`,telt_model:`Modello`,telt_operator:`Operatore`,telt_connection:`Connessione`,telt_network:`Rete`,telt_signal:`Segnale`,telt_temperature:`Temperatura`,telt_no_ports:`Questo dispositivo non segnala porte`,telt_poe_off:`PoE spento`,telt_poe_idle:`nessun utilizzatore`,telt_poe_on:`PoE attivo`,telt_wan_interfaces:`Interfacce WAN`,telt_tracking:`monitoraggio`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`attiva`,telt_nolink:`nessun collegamento`,telt_disabled:`disattivata`,wc_full_duplex:`full duplex`,wc_click_to_switch:`Clicca per accendere o spegnere`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`,wc_not_device:`Non è un dispositivo dell'adattatore Teltonika`,telt_devices:`Dispositivi`,telt_empty:`Nessun dispositivo trovato`,telt_dialog_title:`Dispositivi Teltonika`},es:{telt_uptime:`Tiempo activo`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Switch`,telt_links:`enlaces activos`,telt_model:`Modelo`,telt_operator:`Operador`,telt_connection:`Conexión`,telt_network:`Red`,telt_signal:`Señal`,telt_temperature:`Temperatura`,telt_no_ports:`Este dispositivo no informa de puertos`,telt_poe_off:`PoE apagado`,telt_poe_idle:`sin consumidor`,telt_poe_on:`PoE encendido`,telt_wan_interfaces:`Interfaces WAN`,telt_tracking:`seguimiento`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`activo`,telt_nolink:`sin enlace`,telt_disabled:`desactivado`,wc_full_duplex:`dúplex completo`,wc_click_to_switch:`Haga clic para encender o apagar`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`,wc_not_device:`No es un dispositivo del adaptador Teltonika`,telt_devices:`Dispositivos`,telt_empty:`No se encontraron dispositivos`,telt_dialog_title:`Dispositivos Teltonika`},pl:{telt_uptime:`Czas pracy`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Router`,telt_switch:`Przełącznik`,telt_links:`aktywnych łączy`,telt_model:`Model`,telt_operator:`Operator`,telt_connection:`Połączenie`,telt_network:`Sieć`,telt_signal:`Sygnał`,telt_temperature:`Temperatura`,telt_no_ports:`To urządzenie nie zgłasza portów`,telt_poe_off:`PoE wył.`,telt_poe_idle:`brak odbiornika`,telt_poe_on:`PoE wł.`,telt_wan_interfaces:`Interfejsy WAN`,telt_tracking:`monitorowanie`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`aktywny`,telt_nolink:`brak łącza`,telt_disabled:`wyłączony`,wc_full_duplex:`pełny dupleks`,wc_click_to_switch:`Kliknij, aby włączyć lub wyłączyć`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`,wc_not_device:`To nie jest urządzenie adaptera Teltonika`,telt_devices:`Urządzenia`,telt_empty:`Nie znaleziono urządzeń`,telt_dialog_title:`Urządzenia Teltonika`},uk:{telt_uptime:`Час роботи`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`Маршрутизатор`,telt_switch:`Комутатор`,telt_links:`активних лінків`,telt_model:`Модель`,telt_operator:`Оператор`,telt_connection:`Зʼєднання`,telt_network:`Мережа`,telt_signal:`Сигнал`,telt_temperature:`Температура`,telt_no_ports:`Цей пристрій не повідомляє про порти`,telt_poe_off:`PoE вимк.`,telt_poe_idle:`немає споживача`,telt_poe_on:`PoE увімк.`,telt_wan_interfaces:`Інтерфейси WAN`,telt_tracking:`відстеження`,telt_ethernet:`Ethernet`,telt_fibre:`SFP`,telt_up:`активний`,telt_nolink:`немає лінка`,telt_disabled:`вимкнено`,wc_full_duplex:`повний дуплекс`,wc_click_to_switch:`Натисніть, щоб увімкнути або вимкнути`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`,wc_not_device:`Це не пристрій адаптера Teltonika`,telt_devices:`Пристрої`,telt_empty:`Пристроїв не знайдено`,telt_dialog_title:`Пристрої Teltonika`},"zh-cn":{telt_uptime:`运行时间`,telt_lan:`LAN`,telt_wan:`WAN`,telt_router:`路由器`,telt_switch:`交换机`,telt_links:`条链路已连接`,telt_model:`型号`,telt_operator:`运营商`,telt_connection:`连接`,telt_network:`网络`,telt_signal:`信号`,telt_temperature:`温度`,telt_no_ports:`该设备未报告端口`,telt_poe_off:`PoE 关`,telt_poe_idle:`无用电设备`,telt_poe_on:`PoE 开`,telt_wan_interfaces:`WAN 接口`,telt_tracking:`探测`,telt_ethernet:`以太网`,telt_fibre:`SFP`,telt_up:`已连接`,telt_nolink:`无链路`,telt_disabled:`已禁用`,wc_full_duplex:`全双工`,wc_click_to_switch:`点击开启或关闭`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`,wc_not_device:`不是 Teltonika 适配器的设备`,telt_devices:`设备`,telt_empty:`未找到设备`,telt_dialog_title:`Teltonika 设备`}}.en||{};return(e,...r)=>{let i=t[e]||n[e]||e;for(let e of r)i=i.replace(`%s`,String(e));return i}}var pe=900,me=class extends re{root;#e=null;#t=null;#n=null;constructor(t){super();let n=this.attachShadow({mode:`open`}),r=document.createElement(`style`);r.textContent=t;let i=document.createElement(`div`);i.className=`mount`,n.append(r,i),this.root=e(i)}getStateIds(e){let t=this.getFound(e);if(!t)return[];let n=this.#n?`all`:this.getLevel(e);return R(t,this.getShownDevices(e,t),n)}render(){this.#r(),this.draw(),this.#n?.()}get word(){return fe(this.systemLang)}getFound(e){let t=this.getInstance(e),n=this.#e;return n&&t&&n.instance===t&&this.#t?.socket===this.socket?n:null}getDevices(e){let t=this.getFound(this.settings);return t?B(t,e,this.states):[]}resubscribe(){this.settings=this.settings}getActions(e){return!e||this.editMode?{}:{onToggle:(e,t)=>{t.switchable&&this.setState(`${e.id}.ports.${t.id}.enabled`,!t.enabled)},onTogglePoe:(e,t)=>{t.poeSwitchable&&this.setState(`${e.id}.ports.${t.id}.poe`,!t.poe)}}}#r(){let e=this.socket,t=e?this.getInstance(this.settings):null;if(!e||!t||this.#t?.instance===t&&this.#t.socket===e)return;let n={instance:t,socket:e};this.#t=n,this.#e=null,F(e,t).catch(e=>(console.warn(`<${this.localName}>: cannot read the devices of ${t}: ${String(e)}`),{instance:t,devices:/* @__PURE__ */ new Map,owners:/* @__PURE__ */ new Map})).then(e=>{this.#t===n&&(this.#e=e,this.resubscribe())}).catch(()=>void 0)}async openDetails(t,r){if(this.editMode||this.#n)return;let i=document.createElement(`div`),a=i.attachShadow({mode:`open`}),o=document.createElement(`style`);o.textContent=de;let s=document.createElement(`div`);a.append(o,s);let c=e(s);this.#n=()=>{for(let[e,t]of Object.entries(x(this.theme)))i.style.setProperty(e,t);c.render(/* @__PURE__ */ n(`div`,{className:`dialog`,children:r()}))},this.#n(),this.resubscribe();try{await this.openDialog({title:t,element:i,width:pe})}finally{this.#n=null,c.unmount(),this.resubscribe()}}};function K(e){return e===null?`unknown`:e?`online`:`offline`}function q(e){return e.enabled===!1?`disabled`:e.link?`up`:`idle`}function he(e){return t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),t.stopPropagation(),e())}}function J({device:e}){return e.ports.length?/* @__PURE__ */ n(`span`,{className:`strip`,children:e.ports.map(e=>/* @__PURE__ */ n(`span`,{className:q(e),title:e.description?`${e.label} · ${e.description}`:e.label},e.id))}):null}function ge(e){let t=e.filter(e=>!e.fibre).length,n=e.length-t;return{cols:Math.ceil(t/2)+Math.ceil(n/2),groups:+!!t+ +!!n}}function _e(){return/* @__PURE__ */ n(`svg`,{viewBox:`0 0 24 20`,"aria-hidden":`true`,children:/* @__PURE__ */ n(`path`,{d:`M2 1 H22 V13 H15.5 V19 H8.5 V13 H2 Z`})})}function ve({device:e,port:t,flipped:i,word:a,onToggle:o}){let s=le(t.speed,t.link),c=!!o&&t.switchable,l=t.enabled===!1?a(`telt_disabled`):t.link?a(`telt_up`):a(`telt_nolink`),u=[`${t.label}${t.description?` · ${t.description}`:``} - ${l}`];s&&u.push(`${s}${t.duplex?` · ${a(`wc_full_duplex`)}`:``}`),t.link&&(t.rxBytes!==null||t.txBytes!==null)&&u.push(`↓ ${j(t.rxBytes)??`-`}   ↑ ${j(t.txBytes)??`-`}`),t.poe!==null&&u.push(`${t.poe?a(`telt_poe_on`):a(`telt_poe_off`)}${t.poe&&t.poePower?` · ${t.poePower} W`:``}`),c&&u.push(a(`wc_click_to_switch`));let d=()=>o?.(e,t),f=/* @__PURE__ */ r(`span`,{className:`badge`,children:[t.poe?/* @__PURE__ */ n(`span`,{className:`bolt${t.poeActive===!1?` idle`:``}`,children:`⚡`}):null,s?/* @__PURE__ */ n(`span`,{className:`speed`,children:s}):null]});return/* @__PURE__ */ r(`span`,{className:`cell ${q(t)}${i?` flipped`:``}${c?` switchable`:``}`,title:u.join(`
`),role:c?`switch`:void 0,"aria-checked":c?t.enabled!==!1:void 0,"aria-label":c?t.label:void 0,tabIndex:c?0:void 0,onClick:c?e=>{e.stopPropagation(),d()}:void 0,onKeyDown:c?he(d):void 0,children:[i?null:f,/* @__PURE__ */ n(_e,{}),i?f:null]})}function Y({device:e,ports:t,caption:i,word:a,onToggle:o}){if(!t.length)return null;let{top:s,bottom:c}=ce(t),l=e=>/* @__PURE__ */ n(`span`,{className:`row`,children:e.map(e=>/* @__PURE__ */ n(`span`,{className:`num`,children:e.label},e.id))}),u=(t,r)=>/* @__PURE__ */ n(`span`,{className:`row`,children:t.map(t=>/* @__PURE__ */ n(ve,{device:e,port:t,flipped:r,word:a,onToggle:o},t.id))});return/* @__PURE__ */ r(`span`,{className:`group`,children:[l(s),u(s,!1),c.length?u(c,!0):null,c.length?l(c):null,/* @__PURE__ */ n(`span`,{className:`caption`,children:i})]})}function ye({device:e,word:t,onToggle:i}){return/* @__PURE__ */ r(`span`,{className:`panel`,children:[/* @__PURE__ */ n(Y,{device:e,ports:e.ports.filter(e=>!e.fibre),caption:t(`telt_ethernet`),word:t,onToggle:i}),/* @__PURE__ */ n(Y,{device:e,ports:e.ports.filter(e=>e.fibre),caption:t(`telt_fibre`),word:t,onToggle:i})]})}function X(e,t){return`${e.filter(e=>e.link).length}/${e.length} ${t(`telt_links`)}`}function Z(e){return e===`online`||e===`standby`||e===`offline`?e:`unknown`}function be({device:e,word:t}){let i=[];e.uptime!==null&&i.push(`${t(`telt_uptime`)} ${A(e.uptime)}`),e.temperature!==null&&i.push(`${e.temperature} °C`),e.cpu!==null&&i.push(`CPU ${Math.round(e.cpu)} %`);let a=[e.lan?`${t(`telt_lan`)} ${e.lan}`:null,e.wan?`${t(`telt_wan`)} ${e.wan}`:null].filter(Boolean).join(` · `),o=e.isRouter?[e.operator,e.connection,e.signal===null?null:`${e.signal} dBm`].filter(Boolean).join(` · `):``;return/* @__PURE__ */ r(`div`,{className:`card ${K(e.alive)}`,children:[/* @__PURE__ */ r(`div`,{className:`card-head`,children:[/* @__PURE__ */ n(`span`,{className:`card-name`,children:e.name}),/* @__PURE__ */ n(`span`,{className:`muted nowrap`,children:e.model||(e.isRouter?t(`telt_router`):t(`telt_switch`))})]}),o?/* @__PURE__ */ n(`div`,{className:`small muted ellipsis`,children:o}):null,e.ports.length?/* @__PURE__ */ r(`div`,{className:`line`,children:[/* @__PURE__ */ n(J,{device:e}),/* @__PURE__ */ n(`span`,{className:`small muted nowrap`,children:X(e.ports,t)})]}):null,e.wanInterfaces.length?/* @__PURE__ */ n(`div`,{className:`line wrap`,children:e.wanInterfaces.map(e=>/* @__PURE__ */ r(`span`,{className:`wan-chip small${e.enabled===!1?` off`:``}`,title:`${e.label}: ${e.status||`-`}`,children:[/* @__PURE__ */ n(`span`,{className:`dot ${Z(e.status)}`}),/* @__PURE__ */ n(`span`,{className:`muted`,children:e.label})]},e.id))}):null,a?/* @__PURE__ */ n(`div`,{className:`small muted mono ellipsis`,children:a}):null,i.length?/* @__PURE__ */ n(`div`,{className:`small faint`,children:i.join(` · `)}):null]})}function xe({devices:e,word:i}){let a=e.filter(e=>e.alive===!0).length,o=e.flatMap(e=>e.ports);return/* @__PURE__ */ r(t,{children:[/* @__PURE__ */ r(`span`,{className:`count`,children:[/* @__PURE__ */ n(`span`,{className:`online`,children:a}),/* @__PURE__ */ n(`span`,{className:`slash`,children:`/`}),/* @__PURE__ */ n(`span`,{children:e.length})]}),/* @__PURE__ */ n(`span`,{className:`count-label`,children:i(`telt_devices`)}),o.length?/* @__PURE__ */ n(`span`,{className:`count-links`,children:X(o,i)}):null,e.length?/* @__PURE__ */ n(`span`,{className:`strips`,children:e.slice(0,4).map(e=>/* @__PURE__ */ n(J,{device:e},e.id))}):null]})}function Se({device:e,port:t,word:i,onTogglePoe:a}){let o=!!a&&t.poeSwitchable,s=!!t.poe&&t.poeActive!==!1,c=i(`telt_poe_on`);return t.poe?t.poeActive===!1?c=i(`telt_poe_idle`):t.poePower!==null&&(c=`${t.poePower} W`):c=i(`telt_poe_off`),/* @__PURE__ */ r(`div`,{className:`item poe`,children:[o?/* @__PURE__ */ n(`button`,{type:`button`,role:`switch`,className:`toggle${t.poe?` checked`:``}`,"aria-checked":!!t.poe,"aria-label":`PoE ${t.label}`,onClick:()=>a?.(e,t)}):/* @__PURE__ */ n(`span`,{className:`bolt${t.poe?``:` idle`}`,children:`⚡`}),/* @__PURE__ */ n(`span`,{className:`strong nowrap`,children:t.label}),/* @__PURE__ */ n(`span`,{className:`muted ellipsis`,children:t.description||``}),/* @__PURE__ */ n(`span`,{className:`poe-state nowrap${s?` on`:``}`,children:c})]})}function Ce({wan:e,address:t,word:i}){let a=[t||null,e.uptime?A(e.uptime):null,e.trackingHosts?`${i(`telt_tracking`)} ${e.trackingHosts}`:null].filter(Boolean).join(` · `);return/* @__PURE__ */ r(`div`,{className:`item wan${e.enabled===!1?` off`:``}`,children:[/* @__PURE__ */ n(`span`,{className:`dot ${Z(e.status)}`}),/* @__PURE__ */ n(`span`,{className:`strong wan-label`,children:e.label}),/* @__PURE__ */ n(`span`,{className:`wan-status ${Z(e.status)}`,children:e.status||`-`}),/* @__PURE__ */ n(`span`,{className:`muted ellipsis`,children:a})]})}function we({device:e,word:t,actions:i}){let a=e.ports.filter(e=>e.poe!==null),o=[];e.model&&o.push([t(`telt_model`),e.model]),e.isRouter&&(e.operator&&o.push([t(`telt_operator`),e.operator]),e.connection&&o.push([t(`telt_connection`),e.connection]),e.network&&o.push([t(`telt_network`),e.network]),e.signal!==null&&o.push([t(`telt_signal`),`${e.signal} dBm`])),e.lan&&o.push([t(`telt_lan`),e.lan]),e.isRouter&&(e.wan&&o.push([t(`telt_wan`),e.wan]),e.wanIPv6&&o.push([`IPv6`,e.wanIPv6]),e.temperature!==null&&o.push([t(`telt_temperature`),`${e.temperature} °C`])),e.uptime!==null&&o.push([t(`telt_uptime`),A(e.uptime)||``]),e.cpu!==null&&o.push([`CPU`,`${Math.round(e.cpu)} %`]);let{cols:s,groups:c}=ge(e.ports);return/* @__PURE__ */ r(`div`,{className:`card detail ${K(e.alive)}`,children:[/* @__PURE__ */ r(`div`,{className:`card-head`,children:[/* @__PURE__ */ n(`span`,{className:`card-name`,children:e.name}),/* @__PURE__ */ n(`span`,{className:`muted nowrap`,children:e.isRouter?t(`telt_router`):t(`telt_switch`)})]}),e.ports.length?/* @__PURE__ */ n(`div`,{className:`panel-box`,style:{"--cols":s,"--groups":c},children:/* @__PURE__ */ n(ye,{device:e,word:t,onToggle:i.onToggle})}):/* @__PURE__ */ n(`div`,{className:`small muted`,children:t(`telt_no_ports`)}),a.length?/* @__PURE__ */ r(`div`,{className:`section`,children:[/* @__PURE__ */ n(`div`,{className:`section-title`,children:`PoE`}),/* @__PURE__ */ n(`div`,{className:`poe-grid`,children:a.map(r=>/* @__PURE__ */ n(Se,{device:e,port:r,word:t,onTogglePoe:i.onTogglePoe},r.id))})]}):null,e.wanInterfaces.length?/* @__PURE__ */ r(`div`,{className:`section`,children:[/* @__PURE__ */ n(`div`,{className:`section-title`,children:t(`telt_wan_interfaces`)}),e.wanInterfaces.map(r=>/* @__PURE__ */ n(Ce,{wan:r,address:e.addresses[r.id],word:t},r.id))]}):null,e.io.length?/* @__PURE__ */ n(`div`,{className:`line wrap`,children:e.io.map(e=>/* @__PURE__ */ r(`span`,{className:`item small`,children:[/* @__PURE__ */ n(`span`,{className:`dot ${e.state?`online`:`unknown`}`}),`${e.label}${e.type?` · ${e.type}`:``}`]},e.id))}):null,o.length?/* @__PURE__ */ n(`div`,{className:`facts small`,children:o.map(([e,t])=>/* @__PURE__ */ r(`span`,{children:[/* @__PURE__ */ n(`span`,{className:`faint`,children:`${e}: `}),t]},e))}):null]})}var Q=`M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z`,Te=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`;function Ee({text:e,icon:t,editMode:i}){return/* @__PURE__ */ r(`div`,{className:`hint${i?` edit`:``}`,children:[/* @__PURE__ */ n(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ n(`path`,{d:t===`person`?Te:Q})}),/* @__PURE__ */ n(`span`,{children:e})]})}function $({devices:e,word:r,actions:i}){return e.length?/* @__PURE__ */ n(t,{children:e.map(e=>/* @__PURE__ */ n(we,{device:e,word:r,actions:i},e.id))}):/* @__PURE__ */ n(`div`,{className:`empty`,children:r(`telt_empty`)})}ie(ae,class extends me{constructor(){super(ue)}getInstance(e){return P(e.instance)}getShownDevices(e,t){return[...t.devices.keys()]}getLevel(e){switch(e.mode){case`tiles`:return`tile`;case`detail`:return`all`;default:return`summary`}}#e(){let e=this.getFound(this.settings);if(!e)return[];let t=V(this.getDevices(this.getShownDevices(this.settings,e)));return this.settings.onlyAlive?t.filter(e=>e.alive!==!1):t}#t=()=>{if(this.editMode||!this.emit(`teltonika-devices-click`,{instance:this.getInstance(this.settings)}))return;let e=this.word;this.openDetails(e(`telt_dialog_title`),()=>/* @__PURE__ */ n($,{devices:this.#e(),word:this.word,actions:this.getActions(this.settings.allowSwitching)}))};#n=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.#t())};draw(){let e=this.settings,t=this.word,r=this.editMode;if(!this.getInstance(e)){this.root.render(/* @__PURE__ */ n(Ee,{text:t(`wc_choose_instance`),icon:`router`,editMode:r}));return}if(!this.getFound(e)){this.root.render(/* @__PURE__ */ n(`div`,{className:`root`}));return}let i=this.#e(),a=!r,o=a?{role:`button`,tabIndex:0,onClick:this.#t,onKeyDown:this.#n}:{},s;switch(e.mode){case`tiles`:s=i.length?/* @__PURE__ */ n(`div`,{className:`tiles${a?` clickable`:``}`,...o,children:i.map(e=>/* @__PURE__ */ n(be,{device:e,word:t},e.id))}):/* @__PURE__ */ n(`div`,{className:`empty`,children:t(`telt_empty`)});break;case`detail`:s=/* @__PURE__ */ n(`div`,{className:`list`,children:/* @__PURE__ */ n($,{devices:i,word:t,actions:this.getActions(e.allowSwitching)})});break;default:s=/* @__PURE__ */ n(`div`,{className:`summary${a?` clickable`:``}`,...o,children:/* @__PURE__ */ n(xe,{devices:i,word:t})})}this.root.render(/* @__PURE__ */ n(`div`,{className:`root${r?` edit`:``}`,children:s}))}});