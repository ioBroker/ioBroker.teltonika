import{Fragment as e,createRoot as t,Fragment as n,jsx as r,jsxs as i}from"../../../lib/esm/react-19.js";var a=`iob-dialog-close`;function o(e){return!!e.form}var s=[`header`,`staticText`,`divider`];function c(e,t){return e==null?``:typeof e==`object`?e[t]||e.en||Object.values(e).find(e=>!!e)||``:String(e)}function l(e){let t={};for(let[n,r]of Object.entries(e.items||{}))r&&!s.includes(r.type)&&(t[n]=r.type);return t}function u(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?e.toString():JSON.stringify(e)}function d(e,t){if(t!=null)switch(e){case`number`:case`slider`:{if(typeof t==`number`)return Number.isFinite(t)?t:void 0;let e=u(t).trim().replace(`,`,`.`);if(!e)return;let n=Number(e);return Number.isFinite(n)?n:void 0}case`checkbox`:return t===!0||t===`true`||t===1||t===`1`;default:return u(t)}}function f(e,t){let n={};for(let[r,i]of Object.entries(e)){let e=d(i,t[r]);e!==void 0&&(n[r]=e)}return n}var p=`"Roboto", "Helvetica", "Arial", sans-serif`,m=Object.freeze({type:`light`,primary:`#3399CC`,primaryContrast:`#FFFFFF`,secondary:`#164477`,secondaryContrast:`#FFFFFF`,background:`#FFFFFF`,paper:`#FFFFFF`,text:`rgba(0, 0, 0, 0.87)`,textSecondary:`rgba(0, 0, 0, 0.6)`,divider:`rgba(0, 0, 0, 0.12)`,error:`#D32F2F`,warning:`#ED6C02`,info:`#0288D1`,success:`#2E7D32`,fontFamily:p,fontSize:14,borderRadius:4}),h=Object.freeze({type:`dark`,primary:`#4DABF5`,primaryContrast:`rgba(0, 0, 0, 0.87)`,secondary:`#436A93`,secondaryContrast:`#FFFFFF`,background:`#121212`,paper:`#121212`,text:`#FFFFFF`,textSecondary:`rgba(255, 255, 255, 0.7)`,divider:`rgba(255, 255, 255, 0.12)`,error:`#F44336`,warning:`#FFA726`,info:`#29B6F6`,success:`#66BB6A`,fontFamily:p,fontSize:14,borderRadius:4}),g=[`primary`,`primaryContrast`,`secondary`,`secondaryContrast`,`background`,`paper`,`text`,`textSecondary`,`divider`,`error`,`warning`,`info`,`success`,`fontFamily`],_=[`fontSize`,`borderRadius`];function v(e){return{...e===`dark`?h:m}}function y(e){if(!e||typeof e!=`object`)return v(typeof e==`string`?e:`light`);let t=e,n=v(typeof t.type==`string`?t.type:`light`);for(let e of g){let r=t[e];typeof r==`string`&&r.trim()&&(n[e]=r.trim())}for(let e of _){let r=t[e],i=typeof r==`string`?parseFloat(r):r;typeof i==`number`&&Number.isFinite(i)&&i>=0&&(n[e]=i)}return n}function b(e,t){return e.type===t.type&&g.every(n=>e[n]===t[n])&&_.every(n=>e[n]===t[n])}function x(e){return`--iob-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`}function S(e){let t={};for(let n of g)t[x(n)]=e[n];for(let n of _)t[x(n)]=`${e[n]}px`;return t[`color-scheme`]=e.type,t}var C={ok:{en:`OK`,"zh-cn":`确定`},cancel:{en:`Cancel`,de:`Abbrechen`,ru:`Отмена`,pt:`Cancelar`,nl:`Annuleren`,fr:`Annuler`,it:`Annulla`,es:`Cancelar`,pl:`Anuluj`,uk:`Скасувати`,"zh-cn":`取消`},close:{en:`Close`,de:`Schließen`,ru:`Закрыть`,pt:`Fechar`,nl:`Sluiten`,fr:`Fermer`,it:`Chiudi`,es:`Cerrar`,pl:`Zamknij`,uk:`Закрити`,"zh-cn":`关闭`}},ee=`
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
`;function w(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function T(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function E(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function D(e,t,n,r,i){let a={name:t,setting:n,box:e.createElement(`div`),hidden:w(n.hidden),disabled:w(n.disabled)},o=c(n.label,i);switch(n.type){case`header`:return a.box=e.createElement(`h3`),a.box.textContent=c(n.text,i)||o,a;case`staticText`:return a.box=e.createElement(`p`),a.box.textContent=c(n.text,i)||o,a;case`divider`:return a.box=e.createElement(`hr`),a}let s=e.createElement(`label`);a.box=s;let l=e.createElement(`span`);if(l.textContent=o||t,n.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=r===!0||r===`true`,s.className=`check`,s.append(t,l),a.input=t}else if(n.type===`select`){let t=e.createElement(`select`);for(let r of n.options||[]){let n=e.createElement(`option`);n.textContent=c(r.label,i),t.append(n)}let o=(n.options||[]).findIndex(e=>String(e.value)===T(r));t.selectedIndex=o===-1?0:o,s.append(l,t),a.input=t}else if(n.type===`text`&&(n.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=n.minRows||2,t.value=T(r),s.append(l,t),a.input=t}else{let t=e.createElement(`input`),i=T(r);switch(n.type){case`number`:case`slider`:t.type=n.type===`slider`?`range`:`number`,n.min!==void 0&&(t.min=String(n.min)),n.max!==void 0&&(t.max=String(n.max)),t.step=n.step===void 0?`any`:String(n.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!i||/^#[0-9a-f]{6}$/i.test(i)?`color`:`text`;break;default:t.type=`text`}if(t.value=i,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}s.append(l,t),a.input=t}if(n.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=c(n.help,i),s.append(t)}return a}function te(e,t={}){let n=t.lang||`en`,r=document,i=e=>C[e][n]||C[e].en||e,s=r.createElement(`div`);s.setAttribute(`data-iob-dialog`,``);let u=s.attachShadow({mode:`open`}),d=r.createElement(`style`);d.textContent=ee;let p=r.createElement(`dialog`),m=y(t.theme);p.className=m.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(S(m)))p.style.setProperty(e,t);e.width&&(p.style.width=`${e.width}px`),e.height&&(p.style.height=`${e.height}px`);let h=r.createElement(`form`),g=r.createElement(`header`),_=r.createElement(`span`);_.textContent=c(e.title,n);let v=r.createElement(`button`);v.type=`button`,v.className=`close`,v.title=i(`close`),v.setAttribute(`aria-label`,i(`close`)),v.textContent=`×`,g.append(_,v);let b=r.createElement(`div`);return b.className=`body`,h.append(g,b),p.append(h),u.append(d,p),new Promise(t=>{let d=!1,m=e=>{d||(d=!0,p.open&&p.close(),s.remove(),t(e))};if(v.addEventListener(`click`,()=>m(null)),p.addEventListener(`close`,()=>m(null)),h.addEventListener(`submit`,e=>e.preventDefault()),o(e)){let t={},a=[];for(let[t,i]of Object.entries(e.form.items||{})){let o=e.data?.[t]??i.default,s=D(r,t,i,o,n);a.push(s),b.append(s.box)}let o=()=>{for(let e of a)e.input&&(t[e.name]=E(e));return t},s=()=>{let e=o();for(let t of a)t.box.hidden=t.hidden?t.hidden(e):!1,t.input&&(t.input.disabled=t.disabled?t.disabled(e):!1)};h.addEventListener(`input`,s),h.addEventListener(`change`,s),s();let u=a.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);u?.input&&(u.input.autofocus=!0);let d=r.createElement(`footer`),p=r.createElement(`button`);p.type=`button`,p.textContent=c(e.cancel,n)||i(`cancel`),p.addEventListener(`click`,()=>m(null));let g=r.createElement(`button`);g.type=`submit`,g.className=`primary`,g.textContent=c(e.ok,n)||i(`ok`),d.append(p,g),h.append(d),h.addEventListener(`submit`,()=>m(f(l(e.form),o())))}else b.append(e.element),p.addEventListener(a,e=>m(e.detail??null));r.body.append(s),p.showModal(),u.activeElement&&u.activeElement!==v||(p.tabIndex=-1,p.focus())})}function O(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var ne=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],re=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=y(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=y(e);b(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of ne)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return c(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(e){if(this.#r)return null;let t=this.#i?await this.#i.open(e):await te(e,{lang:this.systemLang,theme:this.#n});return o(e)?t&&typeof t==`object`?f(l(e.form),t):null:t??null}#u(){for(let[e,t]of Object.entries(S(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?O(this.getStateIds(this.#t)):[],n=e?O(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function ie(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}var ae=`iob-teltonika-person`,k=`M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z`,A=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`;function j({text:e,icon:t,editMode:n}){return/* @__PURE__ */ i(`div`,{className:`hint${n?` edit`:``}`,children:[/* @__PURE__ */ r(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ r(`path`,{d:t===`person`?A:k})}),/* @__PURE__ */ r(`span`,{children:e})]})}function oe(e){let t={en:{telt_present:`Present`,telt_absent:`Away`,telt_lastArrival:`Came`,telt_lastDeparture:`Left`,telt_came:`Came`,telt_left:`Left`,telt_presentToday:`Present today`,telt_absentToday:`Away today`,telt_historyTitle:`Comings and goings`,telt_historyFrom:`From %s`,telt_historyFromAdapter:`Recorded by the adapter`,telt_noHistory:`No comings and goings recorded yet`,telt_sinceDuration:`for %s`,telt_stayed:`Present for %s`,telt_wasAway:`Away for %s`,telt_lastSeen:`Last seen`,telt_router:`Router`,telt_devicesSeen:`Devices seen`,telt_refresh:`Refresh`,telt_showHistoryOf:`Show the comings and goings`,telt_personNotFoundIn:`Person "%s" not found in %s`,macs:`MAC addresses`,select_person:`Select a person in the settings of the widget`,wc_not_person:`Not a person of the presence detection`},de:{telt_present:`Anwesend`,telt_absent:`Abwesend`,telt_lastArrival:`Gekommen`,telt_lastDeparture:`Gegangen`,telt_came:`Gekommen`,telt_left:`Gegangen`,telt_presentToday:`Heute anwesend`,telt_absentToday:`Heute abwesend`,telt_historyTitle:`Kommen und Gehen`,telt_historyFrom:`Aus %s`,telt_historyFromAdapter:`Vom Adapter aufgezeichnet`,telt_noHistory:`Noch kein Kommen und Gehen aufgezeichnet`,telt_sinceDuration:`seit %s`,telt_stayed:`%s anwesend`,telt_wasAway:`%s abwesend`,telt_lastSeen:`Zuletzt gesehen`,telt_router:`Router`,telt_devicesSeen:`Gesehene Geräte`,telt_refresh:`Aktualisieren`,telt_showHistoryOf:`Kommen und Gehen anzeigen`,telt_personNotFoundIn:`Person "%s" in %s nicht gefunden`,macs:`MAC-Adressen`,select_person:`Person in den Einstellungen des Widgets auswählen`,wc_not_person:`Keine Person der Anwesenheitserkennung`},ru:{telt_present:`Дома`,telt_absent:`Нет дома`,telt_lastArrival:`Пришёл`,telt_lastDeparture:`Ушёл`,telt_came:`Пришёл`,telt_left:`Ушёл`,telt_presentToday:`Сегодня дома`,telt_absentToday:`Сегодня не дома`,telt_historyTitle:`Приходы и уходы`,telt_historyFrom:`Из %s`,telt_historyFromAdapter:`Записано адаптером`,telt_noHistory:`Приходы и уходы ещё не записаны`,telt_sinceDuration:`уже %s`,telt_stayed:`Был дома %s`,telt_wasAway:`Не было дома %s`,telt_lastSeen:`Последний раз замечен`,telt_router:`Роутер`,telt_devicesSeen:`Замеченные устройства`,telt_refresh:`Обновить`,telt_showHistoryOf:`Показать приходы и уходы`,telt_personNotFoundIn:`Человек «%s» не найден в %s`,macs:`MAC-адреса`,select_person:`Выберите персону в настройках виджета`,wc_not_person:`Это не человек из определения присутствия`},pt:{telt_present:`Presente`,telt_absent:`Ausente`,telt_lastArrival:`Chegou`,telt_lastDeparture:`Saiu`,telt_came:`Chegou`,telt_left:`Saiu`,telt_presentToday:`Presente hoje`,telt_absentToday:`Ausente hoje`,telt_historyTitle:`Chegadas e saídas`,telt_historyFrom:`De %s`,telt_historyFromAdapter:`Registado pelo adaptador`,telt_noHistory:`Ainda não há chegadas e saídas registadas`,telt_sinceDuration:`há %s`,telt_stayed:`Presente durante %s`,telt_wasAway:`Ausente durante %s`,telt_lastSeen:`Visto pela última vez`,telt_router:`Router`,telt_devicesSeen:`Dispositivos vistos`,telt_refresh:`Atualizar`,telt_showHistoryOf:`Mostrar chegadas e saídas`,telt_personNotFoundIn:`Pessoa "%s" não encontrada em %s`,macs:`Endereços MAC`,select_person:`Selecione uma pessoa nas configurações do widget`,wc_not_person:`Não é uma pessoa da deteção de presença`},nl:{telt_present:`Aanwezig`,telt_absent:`Afwezig`,telt_lastArrival:`Gekomen`,telt_lastDeparture:`Vertrokken`,telt_came:`Gekomen`,telt_left:`Vertrokken`,telt_presentToday:`Vandaag aanwezig`,telt_absentToday:`Vandaag afwezig`,telt_historyTitle:`Komen en gaan`,telt_historyFrom:`Uit %s`,telt_historyFromAdapter:`Vastgelegd door de adapter`,telt_noHistory:`Nog geen komen en gaan vastgelegd`,telt_sinceDuration:`sinds %s`,telt_stayed:`%s aanwezig`,telt_wasAway:`%s afwezig`,telt_lastSeen:`Laatst gezien`,telt_router:`Router`,telt_devicesSeen:`Geziene apparaten`,telt_refresh:`Vernieuwen`,telt_showHistoryOf:`Komen en gaan tonen`,telt_personNotFoundIn:`Persoon "%s" niet gevonden in %s`,macs:`MAC-adressen`,select_person:`Selecteer een persoon in de instellingen van de widget`,wc_not_person:`Geen persoon van de aanwezigheidsdetectie`},fr:{telt_present:`Présent`,telt_absent:`Absent`,telt_lastArrival:`Arrivée`,telt_lastDeparture:`Départ`,telt_came:`Arrivée`,telt_left:`Départ`,telt_presentToday:`Présent aujourd'hui`,telt_absentToday:`Absent aujourd'hui`,telt_historyTitle:`Arrivées et départs`,telt_historyFrom:`Depuis %s`,telt_historyFromAdapter:`Enregistré par l'adaptateur`,telt_noHistory:`Aucune arrivée ni aucun départ enregistré`,telt_sinceDuration:`depuis %s`,telt_stayed:`Présent pendant %s`,telt_wasAway:`Absent pendant %s`,telt_lastSeen:`Vu pour la dernière fois`,telt_router:`Routeur`,telt_devicesSeen:`Appareils vus`,telt_refresh:`Actualiser`,telt_showHistoryOf:`Afficher les arrivées et départs`,telt_personNotFoundIn:`Personne « %s » introuvable dans %s`,macs:`Adresses MAC`,select_person:`Sélectionnez une personne dans les réglages du widget`,wc_not_person:`Pas une personne de la détection de présence`},it:{telt_present:`Presente`,telt_absent:`Assente`,telt_lastArrival:`Arrivato`,telt_lastDeparture:`Uscito`,telt_came:`Arrivato`,telt_left:`Uscito`,telt_presentToday:`Presente oggi`,telt_absentToday:`Assente oggi`,telt_historyTitle:`Arrivi e uscite`,telt_historyFrom:`Da %s`,telt_historyFromAdapter:`Registrato dall'adattatore`,telt_noHistory:`Nessun arrivo o uscita ancora registrati`,telt_sinceDuration:`da %s`,telt_stayed:`Presente per %s`,telt_wasAway:`Assente per %s`,telt_lastSeen:`Visto l'ultima volta`,telt_router:`Router`,telt_devicesSeen:`Dispositivi visti`,telt_refresh:`Aggiorna`,telt_showHistoryOf:`Mostra arrivi e uscite`,telt_personNotFoundIn:`Persona "%s" non trovata in %s`,macs:`Indirizzi MAC`,select_person:`Seleziona una persona nelle impostazioni del widget`,wc_not_person:`Non è una persona del rilevamento di presenza`},es:{telt_present:`Presente`,telt_absent:`Ausente`,telt_lastArrival:`Llegó`,telt_lastDeparture:`Se fue`,telt_came:`Llegó`,telt_left:`Se fue`,telt_presentToday:`Presente hoy`,telt_absentToday:`Ausente hoy`,telt_historyTitle:`Llegadas y salidas`,telt_historyFrom:`De %s`,telt_historyFromAdapter:`Registrado por el adaptador`,telt_noHistory:`Aún no se han registrado llegadas ni salidas`,telt_sinceDuration:`desde hace %s`,telt_stayed:`Presente durante %s`,telt_wasAway:`Ausente durante %s`,telt_lastSeen:`Visto por última vez`,telt_router:`Router`,telt_devicesSeen:`Dispositivos vistos`,telt_refresh:`Actualizar`,telt_showHistoryOf:`Mostrar llegadas y salidas`,telt_personNotFoundIn:`Persona "%s" no encontrada en %s`,macs:`Direcciones MAC`,select_person:`Seleccione una persona en la configuración del widget`,wc_not_person:`No es una persona de la detección de presencia`},pl:{telt_present:`Obecny`,telt_absent:`Nieobecny`,telt_lastArrival:`Przyszedł`,telt_lastDeparture:`Wyszedł`,telt_came:`Przyszedł`,telt_left:`Wyszedł`,telt_presentToday:`Obecny dzisiaj`,telt_absentToday:`Nieobecny dzisiaj`,telt_historyTitle:`Przyjścia i wyjścia`,telt_historyFrom:`Z %s`,telt_historyFromAdapter:`Zarejestrowane przez adapter`,telt_noHistory:`Nie zarejestrowano jeszcze przyjść i wyjść`,telt_sinceDuration:`od %s`,telt_stayed:`Obecny przez %s`,telt_wasAway:`Nieobecny przez %s`,telt_lastSeen:`Ostatnio widziany`,telt_router:`Router`,telt_devicesSeen:`Widziane urządzenia`,telt_refresh:`Odśwież`,telt_showHistoryOf:`Pokaż przyjścia i wyjścia`,telt_personNotFoundIn:`Nie znaleziono osoby „%s” w %s`,macs:`Adresy MAC`,select_person:`Wybierz osobę w ustawieniach widżetu`,wc_not_person:`To nie jest osoba z wykrywania obecności`},uk:{telt_present:`Вдома`,telt_absent:`Немає вдома`,telt_lastArrival:`Прийшов`,telt_lastDeparture:`Пішов`,telt_came:`Прийшов`,telt_left:`Пішов`,telt_presentToday:`Сьогодні вдома`,telt_absentToday:`Сьогодні не вдома`,telt_historyTitle:`Приходи та відходи`,telt_historyFrom:`З %s`,telt_historyFromAdapter:`Записано адаптером`,telt_noHistory:`Приходи та відходи ще не записані`,telt_sinceDuration:`уже %s`,telt_stayed:`Був вдома %s`,telt_wasAway:`Не було вдома %s`,telt_lastSeen:`Востаннє помічено`,telt_router:`Маршрутизатор`,telt_devicesSeen:`Помічені пристрої`,telt_refresh:`Оновити`,telt_showHistoryOf:`Показати приходи та відходи`,telt_personNotFoundIn:`Особу «%s» не знайдено в %s`,macs:`MAC-адреси`,select_person:`Виберіть особу в налаштуваннях віджета`,wc_not_person:`Це не особа з визначення присутності`},"zh-cn":{telt_present:`在家`,telt_absent:`离开`,telt_lastArrival:`到达`,telt_lastDeparture:`离开`,telt_came:`到达`,telt_left:`离开`,telt_presentToday:`今天在家`,telt_absentToday:`今天离开`,telt_historyTitle:`到达与离开`,telt_historyFrom:`来自 %s`,telt_historyFromAdapter:`由适配器记录`,telt_noHistory:`尚无到达与离开记录`,telt_sinceDuration:`已 %s`,telt_stayed:`在家 %s`,telt_wasAway:`离开 %s`,telt_lastSeen:`最后发现`,telt_router:`路由器`,telt_devicesSeen:`已发现的设备`,telt_refresh:`刷新`,telt_showHistoryOf:`显示到达与离开`,telt_personNotFoundIn:`未找到人员“%s”（%s）`,macs:`MAC 地址`,select_person:`请在小部件设置中选择一个人`,wc_not_person:`不是在家检测中的人员`}}[e]||{},n={en:{telt_present:`Present`,telt_absent:`Away`,telt_lastArrival:`Came`,telt_lastDeparture:`Left`,telt_came:`Came`,telt_left:`Left`,telt_presentToday:`Present today`,telt_absentToday:`Away today`,telt_historyTitle:`Comings and goings`,telt_historyFrom:`From %s`,telt_historyFromAdapter:`Recorded by the adapter`,telt_noHistory:`No comings and goings recorded yet`,telt_sinceDuration:`for %s`,telt_stayed:`Present for %s`,telt_wasAway:`Away for %s`,telt_lastSeen:`Last seen`,telt_router:`Router`,telt_devicesSeen:`Devices seen`,telt_refresh:`Refresh`,telt_showHistoryOf:`Show the comings and goings`,telt_personNotFoundIn:`Person "%s" not found in %s`,macs:`MAC addresses`,select_person:`Select a person in the settings of the widget`,wc_not_person:`Not a person of the presence detection`},de:{telt_present:`Anwesend`,telt_absent:`Abwesend`,telt_lastArrival:`Gekommen`,telt_lastDeparture:`Gegangen`,telt_came:`Gekommen`,telt_left:`Gegangen`,telt_presentToday:`Heute anwesend`,telt_absentToday:`Heute abwesend`,telt_historyTitle:`Kommen und Gehen`,telt_historyFrom:`Aus %s`,telt_historyFromAdapter:`Vom Adapter aufgezeichnet`,telt_noHistory:`Noch kein Kommen und Gehen aufgezeichnet`,telt_sinceDuration:`seit %s`,telt_stayed:`%s anwesend`,telt_wasAway:`%s abwesend`,telt_lastSeen:`Zuletzt gesehen`,telt_router:`Router`,telt_devicesSeen:`Gesehene Geräte`,telt_refresh:`Aktualisieren`,telt_showHistoryOf:`Kommen und Gehen anzeigen`,telt_personNotFoundIn:`Person "%s" in %s nicht gefunden`,macs:`MAC-Adressen`,select_person:`Person in den Einstellungen des Widgets auswählen`,wc_not_person:`Keine Person der Anwesenheitserkennung`},ru:{telt_present:`Дома`,telt_absent:`Нет дома`,telt_lastArrival:`Пришёл`,telt_lastDeparture:`Ушёл`,telt_came:`Пришёл`,telt_left:`Ушёл`,telt_presentToday:`Сегодня дома`,telt_absentToday:`Сегодня не дома`,telt_historyTitle:`Приходы и уходы`,telt_historyFrom:`Из %s`,telt_historyFromAdapter:`Записано адаптером`,telt_noHistory:`Приходы и уходы ещё не записаны`,telt_sinceDuration:`уже %s`,telt_stayed:`Был дома %s`,telt_wasAway:`Не было дома %s`,telt_lastSeen:`Последний раз замечен`,telt_router:`Роутер`,telt_devicesSeen:`Замеченные устройства`,telt_refresh:`Обновить`,telt_showHistoryOf:`Показать приходы и уходы`,telt_personNotFoundIn:`Человек «%s» не найден в %s`,macs:`MAC-адреса`,select_person:`Выберите персону в настройках виджета`,wc_not_person:`Это не человек из определения присутствия`},pt:{telt_present:`Presente`,telt_absent:`Ausente`,telt_lastArrival:`Chegou`,telt_lastDeparture:`Saiu`,telt_came:`Chegou`,telt_left:`Saiu`,telt_presentToday:`Presente hoje`,telt_absentToday:`Ausente hoje`,telt_historyTitle:`Chegadas e saídas`,telt_historyFrom:`De %s`,telt_historyFromAdapter:`Registado pelo adaptador`,telt_noHistory:`Ainda não há chegadas e saídas registadas`,telt_sinceDuration:`há %s`,telt_stayed:`Presente durante %s`,telt_wasAway:`Ausente durante %s`,telt_lastSeen:`Visto pela última vez`,telt_router:`Router`,telt_devicesSeen:`Dispositivos vistos`,telt_refresh:`Atualizar`,telt_showHistoryOf:`Mostrar chegadas e saídas`,telt_personNotFoundIn:`Pessoa "%s" não encontrada em %s`,macs:`Endereços MAC`,select_person:`Selecione uma pessoa nas configurações do widget`,wc_not_person:`Não é uma pessoa da deteção de presença`},nl:{telt_present:`Aanwezig`,telt_absent:`Afwezig`,telt_lastArrival:`Gekomen`,telt_lastDeparture:`Vertrokken`,telt_came:`Gekomen`,telt_left:`Vertrokken`,telt_presentToday:`Vandaag aanwezig`,telt_absentToday:`Vandaag afwezig`,telt_historyTitle:`Komen en gaan`,telt_historyFrom:`Uit %s`,telt_historyFromAdapter:`Vastgelegd door de adapter`,telt_noHistory:`Nog geen komen en gaan vastgelegd`,telt_sinceDuration:`sinds %s`,telt_stayed:`%s aanwezig`,telt_wasAway:`%s afwezig`,telt_lastSeen:`Laatst gezien`,telt_router:`Router`,telt_devicesSeen:`Geziene apparaten`,telt_refresh:`Vernieuwen`,telt_showHistoryOf:`Komen en gaan tonen`,telt_personNotFoundIn:`Persoon "%s" niet gevonden in %s`,macs:`MAC-adressen`,select_person:`Selecteer een persoon in de instellingen van de widget`,wc_not_person:`Geen persoon van de aanwezigheidsdetectie`},fr:{telt_present:`Présent`,telt_absent:`Absent`,telt_lastArrival:`Arrivée`,telt_lastDeparture:`Départ`,telt_came:`Arrivée`,telt_left:`Départ`,telt_presentToday:`Présent aujourd'hui`,telt_absentToday:`Absent aujourd'hui`,telt_historyTitle:`Arrivées et départs`,telt_historyFrom:`Depuis %s`,telt_historyFromAdapter:`Enregistré par l'adaptateur`,telt_noHistory:`Aucune arrivée ni aucun départ enregistré`,telt_sinceDuration:`depuis %s`,telt_stayed:`Présent pendant %s`,telt_wasAway:`Absent pendant %s`,telt_lastSeen:`Vu pour la dernière fois`,telt_router:`Routeur`,telt_devicesSeen:`Appareils vus`,telt_refresh:`Actualiser`,telt_showHistoryOf:`Afficher les arrivées et départs`,telt_personNotFoundIn:`Personne « %s » introuvable dans %s`,macs:`Adresses MAC`,select_person:`Sélectionnez une personne dans les réglages du widget`,wc_not_person:`Pas une personne de la détection de présence`},it:{telt_present:`Presente`,telt_absent:`Assente`,telt_lastArrival:`Arrivato`,telt_lastDeparture:`Uscito`,telt_came:`Arrivato`,telt_left:`Uscito`,telt_presentToday:`Presente oggi`,telt_absentToday:`Assente oggi`,telt_historyTitle:`Arrivi e uscite`,telt_historyFrom:`Da %s`,telt_historyFromAdapter:`Registrato dall'adattatore`,telt_noHistory:`Nessun arrivo o uscita ancora registrati`,telt_sinceDuration:`da %s`,telt_stayed:`Presente per %s`,telt_wasAway:`Assente per %s`,telt_lastSeen:`Visto l'ultima volta`,telt_router:`Router`,telt_devicesSeen:`Dispositivi visti`,telt_refresh:`Aggiorna`,telt_showHistoryOf:`Mostra arrivi e uscite`,telt_personNotFoundIn:`Persona "%s" non trovata in %s`,macs:`Indirizzi MAC`,select_person:`Seleziona una persona nelle impostazioni del widget`,wc_not_person:`Non è una persona del rilevamento di presenza`},es:{telt_present:`Presente`,telt_absent:`Ausente`,telt_lastArrival:`Llegó`,telt_lastDeparture:`Se fue`,telt_came:`Llegó`,telt_left:`Se fue`,telt_presentToday:`Presente hoy`,telt_absentToday:`Ausente hoy`,telt_historyTitle:`Llegadas y salidas`,telt_historyFrom:`De %s`,telt_historyFromAdapter:`Registrado por el adaptador`,telt_noHistory:`Aún no se han registrado llegadas ni salidas`,telt_sinceDuration:`desde hace %s`,telt_stayed:`Presente durante %s`,telt_wasAway:`Ausente durante %s`,telt_lastSeen:`Visto por última vez`,telt_router:`Router`,telt_devicesSeen:`Dispositivos vistos`,telt_refresh:`Actualizar`,telt_showHistoryOf:`Mostrar llegadas y salidas`,telt_personNotFoundIn:`Persona "%s" no encontrada en %s`,macs:`Direcciones MAC`,select_person:`Seleccione una persona en la configuración del widget`,wc_not_person:`No es una persona de la detección de presencia`},pl:{telt_present:`Obecny`,telt_absent:`Nieobecny`,telt_lastArrival:`Przyszedł`,telt_lastDeparture:`Wyszedł`,telt_came:`Przyszedł`,telt_left:`Wyszedł`,telt_presentToday:`Obecny dzisiaj`,telt_absentToday:`Nieobecny dzisiaj`,telt_historyTitle:`Przyjścia i wyjścia`,telt_historyFrom:`Z %s`,telt_historyFromAdapter:`Zarejestrowane przez adapter`,telt_noHistory:`Nie zarejestrowano jeszcze przyjść i wyjść`,telt_sinceDuration:`od %s`,telt_stayed:`Obecny przez %s`,telt_wasAway:`Nieobecny przez %s`,telt_lastSeen:`Ostatnio widziany`,telt_router:`Router`,telt_devicesSeen:`Widziane urządzenia`,telt_refresh:`Odśwież`,telt_showHistoryOf:`Pokaż przyjścia i wyjścia`,telt_personNotFoundIn:`Nie znaleziono osoby „%s” w %s`,macs:`Adresy MAC`,select_person:`Wybierz osobę w ustawieniach widżetu`,wc_not_person:`To nie jest osoba z wykrywania obecności`},uk:{telt_present:`Вдома`,telt_absent:`Немає вдома`,telt_lastArrival:`Прийшов`,telt_lastDeparture:`Пішов`,telt_came:`Прийшов`,telt_left:`Пішов`,telt_presentToday:`Сьогодні вдома`,telt_absentToday:`Сьогодні не вдома`,telt_historyTitle:`Приходи та відходи`,telt_historyFrom:`З %s`,telt_historyFromAdapter:`Записано адаптером`,telt_noHistory:`Приходи та відходи ще не записані`,telt_sinceDuration:`уже %s`,telt_stayed:`Був вдома %s`,telt_wasAway:`Не було вдома %s`,telt_lastSeen:`Востаннє помічено`,telt_router:`Маршрутизатор`,telt_devicesSeen:`Помічені пристрої`,telt_refresh:`Оновити`,telt_showHistoryOf:`Показати приходи та відходи`,telt_personNotFoundIn:`Особу «%s» не знайдено в %s`,macs:`MAC-адреси`,select_person:`Виберіть особу в налаштуваннях віджета`,wc_not_person:`Це не особа з визначення присутності`},"zh-cn":{telt_present:`在家`,telt_absent:`离开`,telt_lastArrival:`到达`,telt_lastDeparture:`离开`,telt_came:`到达`,telt_left:`离开`,telt_presentToday:`今天在家`,telt_absentToday:`今天离开`,telt_historyTitle:`到达与离开`,telt_historyFrom:`来自 %s`,telt_historyFromAdapter:`由适配器记录`,telt_noHistory:`尚无到达与离开记录`,telt_sinceDuration:`已 %s`,telt_stayed:`在家 %s`,telt_wasAway:`离开 %s`,telt_lastSeen:`最后发现`,telt_router:`路由器`,telt_devicesSeen:`已发现的设备`,telt_refresh:`刷新`,telt_showHistoryOf:`显示到达与离开`,telt_personNotFoundIn:`未找到人员“%s”（%s）`,macs:`MAC 地址`,select_person:`请在小部件设置中选择一个人`,wc_not_person:`不是在家检测中的人员`}}.en||{};return(e,...r)=>{let i=t[e]||n[e]||e;for(let e of r)i=i.replace(`%s`,String(e));return i}}function M(e){return e===`zh-cn`?`zh-CN`:e||`en`}var N={present:`present`,lastArrival:`lastArrival`,lastDeparture:`lastDeparture`,presentSince:`presentSince`,absentSince:`absentSince`,presentToday:`presentToday`,absentToday:`absentToday`,devices:`devices`,history:`history`},se=/^(history|sql|influxdb)\.\d+$/;function P(e){if(typeof e!=`string`||!e)return[];try{let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>e&&typeof e.ts==`number`).map(e=>({ts:e.ts,present:!!e.present})).sort((e,t)=>t.ts-e.ts):[]}catch{return[]}}function ce(e){let t=e?.common?.custom;if(t)return Object.keys(t).find(e=>se.test(e)&&t[e]?.enabled)}async function le(e,t,n={}){let r=Math.max(1,n.count||20),i=Math.max(1,n.days||7),a=`${t}.${N.present}`;try{let t=e.getHistory?ce(await e.getObject(a)):void 0;if(t&&e.getHistory){let n=Date.now(),o=await e.getHistory(a,{instance:t,start:n-i*24*36e5,end:n,aggregate:`none`,ack:!0,from:!1,q:!1,addId:!1,returnNewestEntries:!0,count:r*4}),s=Array.isArray(o)?o:[],c=[];if(s.filter(e=>e&&typeof e.ts==`number`&&e.val!==null&&e.val!==void 0).sort((e,t)=>e.ts-t.ts).forEach(e=>{let t=e.val===!0||e.val===`true`||e.val===1||e.val===`1`;c.length&&c[c.length-1].present===t||c.push({ts:e.ts,present:t})}),c.length)return{events:c.reverse().slice(0,r),source:`history`,instance:t}}}catch(e){console.warn(`Cannot read the history of ${a}: ${String(e)}`)}try{let n=P((await e.getState(`${t}.${N.history}`))?.val).slice(0,r);return{events:n,source:n.length?`adapter`:`none`}}catch{return{events:[],source:`none`}}}function F(e){return e===`zh-cn`?`zh-CN`:e||`en`}function I(e,t){let n=Math.max(0,Math.floor(e/6e4)),r=[[Math.floor(n/1440),`day`],[Math.floor(n%1440/60),`hour`],[n%60,`minute`]],i=r.findIndex(([e])=>e>0);return(i===-1?[r[2]]:r.slice(i,i+2).filter(([e])=>e>0)).map(([e,n])=>{try{return new Intl.NumberFormat(F(t),{style:`unit`,unit:n,unitDisplay:n===`day`?`long`:`short`}).format(e)}catch{return`${e} ${n===`day`?`d`:n===`hour`?`h`:`min`}`}}).join(` `)}function L(e,t){if(!e)return`—`;let n=new Date(e),r=/* @__PURE__ */ new Date,i=F(t),a=n.toLocaleTimeString(i,{hour:`2-digit`,minute:`2-digit`}),o=new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime();if(e>=o)return a;if(e>=o-864e5)try{return`${new Intl.RelativeTimeFormat(i,{numeric:`auto`}).format(-1,`day`)} ${a}`}catch{}let s=n.getFullYear()===r.getFullYear();return`${n.toLocaleDateString(i,{day:`2-digit`,month:`2-digit`,...s?{}:{year:`numeric`}})} ${a}`}function R(e){let t=String(e??``).trim().match(/^(teltonika\.\d+\.presence\.persons\.[^.]+)(\.|$)/);return t?t[1]:null}function z(e){if(e!=null)return typeof e==`string`?e===`true`||e===`1`||e===`on`:!!e}function B(e){if(e==null||e===``)return;let t=Number(e);return Number.isFinite(t)?t:void 0}function V(e){return e==null?``:String(e).trim()}function H(e){return e==null?null:typeof e==`string`?e.split(`,`).some(e=>e.trim()!==``):!!e}function U(e){let t=e.replace(/[^\p{L}\p{N}\s-]/gu,``).split(/[\s-]+/).filter(Boolean);return t.length?((Array.from(t[0])[0]||``)+(t.length>1&&Array.from(t[t.length-1])[0]||``)).toUpperCase():``}function W(e,t){let n=M(t),r=new Date(e),i=(/* @__PURE__ */ new Date()).setHours(0,0,0,0),a=new Date(e).setHours(0,0,0,0),o=Math.round((i-a)/864e5);if(o===0||o===1)try{let e=new Intl.RelativeTimeFormat(n,{numeric:`auto`}).format(-o,`day`);return e.charAt(0).toLocaleUpperCase(n)+e.slice(1)}catch{}return r.toLocaleDateString(n,{weekday:`long`,day:`2-digit`,month:`2-digit`,...r.getFullYear()===(/* @__PURE__ */ new Date()).getFullYear()?{}:{year:`numeric`}})}function G(e,t){return typeof e==`string`?e:e&&typeof e==`object`&&(e[t]||e.en||Object.values(e)[0])||``}var K=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`,ue=`M8.65 5.82C9.36 4.72 10.6 4 12 4c2.21 0 4 1.79 4 4 0 1.4-.72 2.64-1.82 3.35zM20 17.17c-.02-1.1-.63-2.11-1.61-2.62-.54-.28-1.13-.54-1.77-.76zm1.19 4.02L2.81 2.81 1.39 4.22l8.89 8.89c-1.81.23-3.39.79-4.67 1.45-1 .51-1.61 1.54-1.61 2.66V20h13.17l2.61 2.61z`,de=`M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z`,fe=`m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z`,pe=`M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z`,me=`M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z`,he=`M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z`,ge=`M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9m8 8 3 3 3-3c-1.65-1.66-4.34-1.66-6 0m-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13`,_e=`M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99M17 19H7V5h10z`,q=`
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
`,ve=`
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
`,ye=`
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
`,J=`
.person,
.presence,
.dialog {
    --state: var(--faint);
    --present: var(--present-color, var(--iob-success));
    --absent: var(--absent-color, var(--muted));
}
.present {
    --state: var(--present);
}
.absent {
    --state: var(--absent);
}
.avatar {
    position: relative;
    flex: none;
    display: inline-flex;
    width: var(--avatar);
    height: var(--avatar);
}
.disc {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--state);
    background: color-mix(in srgb, var(--state) 16%, transparent);
    border: max(2px, calc(var(--avatar) * 0.04)) solid color-mix(in srgb, var(--state) 70%, transparent);
    transition: all 0.3s ease;
}
.disc img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition:
        filter 0.3s ease,
        opacity 0.3s ease;
}
.disc img.gray {
    filter: grayscale(1);
    opacity: 0.6;
}
.disc svg {
    width: 60%;
    height: 60%;
    fill: currentColor;
}
.initials {
    font-size: calc(var(--avatar) * 0.38);
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1;
}
.avatar-dot {
    position: absolute;
    right: 1%;
    bottom: 1%;
    width: 26%;
    height: 26%;
    min-width: 8px;
    min-height: 8px;
    border-radius: 50%;
    background: var(--state);
    border: 2px solid var(--iob-paper, #fff);
}
.status {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-weight: 600;
    color: var(--state);
}
.status .dot {
    background: var(--state);
}
.present .status .dot {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--state) 18%, transparent);
}
.event-dot.present {
    background: var(--present);
}
.event-dot.absent {
    background: var(--absent);
}
`,be=`${q}${ve}${J}
.person {
    --avatar: clamp(40px, 24cqmin, 72px);
    height: 100%;
    padding: clamp(6px, 4cqmin, 14px);
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 3cqmin, 12px);
}
.person.clickable:hover {
    background: var(--tint);
}
.head {
    flex: none;
    display: flex;
    align-items: center;
    gap: clamp(8px, 4cqmin, 14px);
    min-width: 0;
}
.texts {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.name {
    max-width: 100%;
    font-weight: 600;
    font-size: clamp(13px, 7cqmin, 20px);
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.person .status {
    font-size: clamp(11px, 5.5cqmin, 15px);
    line-height: 1.3;
}
.status-text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.duration {
    font-size: clamp(10px, 5cqmin, 13px);
    line-height: 1.35;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.stale .texts,
.stale .times,
.stale .details,
.stale .history {
    opacity: 0.55;
}
.times {
    display: none;
    flex: none;
    grid-template-columns: auto auto;
    column-gap: 8px;
    row-gap: 2px;
    font-size: 12px;
    line-height: 1.35;
    color: var(--muted);
}
.times .value {
    color: var(--iob-text, currentColor);
    font-weight: 600;
    text-align: right;
}
.details {
    flex: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    grid-auto-rows: 40px;
    gap: 8px;
    overflow: hidden;
}
.box {
    min-width: 0;
    height: 40px;
    padding: 4px 10px;
    border-radius: calc(var(--iob-border-radius, 4px) * 2.5);
    background: var(--tint);
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}
.box.wide {
    grid-column: 1 / -1;
}
.box-label {
    font-size: 11px;
    line-height: 1.3;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.box-value {
    font-size: 14px;
    line-height: 1.3;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.history {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.history-head {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 3px;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    border-bottom: 1px solid var(--frame);
}
.history-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}
.history-empty {
    padding: 6px 0;
    font-size: 12px;
    color: var(--muted);
}
.event {
    height: 28px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
}
.event-label {
    flex: 0 1 auto;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.event-duration {
    flex: 0 1 auto;
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.event-time {
    flex: none;
    margin-left: auto;
    font-size: 12px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
}
/* the detail boxes the height has room for, the history below them only in a tall box */
@container (max-height: 179px) {
    .details {
        max-height: 40px;
    }
}
@container (min-height: 180px) and (max-height: 229px) {
    .details {
        max-height: 88px;
    }
}
@container (max-height: 229px) {
    .history {
        display: none;
    }
}
/* wide and flat: picture left, name and status right of it, the times right of them */
@container (min-width: 200px) and (max-height: 109px) {
    .person {
        --avatar: clamp(28px, calc(100cqh - 16px), 72px);
        justify-content: center;
        padding: 6px 10px;
    }
    .details {
        display: none;
    }
}
@container (min-width: 300px) and (max-height: 109px) {
    .times {
        display: grid;
    }
}
/* narrow: picture, name and status below each other, centered */
@container (max-width: 199px) {
    .person {
        --avatar: clamp(28px, min(55cqw, calc(100cqh - 76px)), 120px);
        justify-content: center;
        padding: 6px;
    }
    .head {
        flex-direction: column;
        gap: 4px;
        text-align: center;
    }
    .texts {
        width: 100%;
        align-items: center;
    }
    .status,
    .duration {
        max-width: 100%;
    }
    .details,
    .history,
    .times {
        display: none;
    }
}
@container (max-width: 199px) and (max-height: 119px) {
    .person {
        --avatar: clamp(24px, calc(100cqh - 56px), 120px);
    }
    .duration {
        display: none;
    }
}
`,xe=`${q}${ye}${J}
.dialog {
    min-width: min(360px, 80vw);
}
.dlg-status {
    --avatar: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}
.dlg-status .texts {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.dlg-status .duration {
    font-size: 0.85em;
    color: var(--muted);
}
.today {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85em;
}
.today-text {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--muted);
}
.value {
    font-weight: 600;
    color: var(--iob-text, currentColor);
}
.bar {
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    background: var(--frame);
}
.bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--present);
}
.info-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 0.85em;
    color: var(--muted);
}
.info-line .text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.info-line svg,
.dlg-title svg {
    flex: none;
    width: 1.25em;
    height: 1.25em;
    fill: currentColor;
}
.dlg-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-weight: 700;
}
.refresh {
    margin-left: auto;
    width: 32px;
    height: 32px;
    padding: 6px;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--muted);
    cursor: pointer;
}
.refresh:hover:not(:disabled) {
    background: var(--hover);
}
.refresh:disabled {
    opacity: 0.4;
    cursor: default;
}
.dlg-title .refresh svg {
    width: 20px;
    height: 20px;
}
.days.loading {
    opacity: 0.6;
}
.day {
    margin-bottom: 10px;
}
.day-label {
    padding: 4px 0;
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--frame);
}
.dlg-event {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    min-width: 0;
}
.dlg-event .icon {
    flex: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ev);
    background: color-mix(in srgb, var(--ev) 14%, transparent);
}
.dlg-event.present {
    --ev: var(--present);
}
.dlg-event.absent {
    --ev: var(--muted);
}
.dlg-event .icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
}
.ev-main {
    flex: 1;
    min-width: 0;
}
.ev-label {
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.ev-sub {
    font-size: 0.8em;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.ev-sub.ongoing {
    font-style: italic;
}
.ev-time {
    flex: none;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
.empty {
    padding: 16px 0;
    text-align: center;
    color: var(--muted);
}
.source {
    text-align: right;
    font-size: 0.75em;
    color: var(--faint);
}
`,Se=[`present`,`lastArrival`,`lastDeparture`,`presentSince`,`absentSince`,`presentToday`,`absentToday`,`devices`,`lastSeen`,`router`,`ssid`],Ce=3e4,we=1e3,Y=50,Te=440;function X(e){return e.split(`.`).slice(0,2).join(`.`)}function Z(e,t,n,r){let i=Number(e);return Number.isFinite(i)&&i>0?Math.min(n,Math.max(t,Math.round(i))):r}function Q({path:e}){return/* @__PURE__ */ r(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ r(`path`,{d:e})})}function $({name:e,image:t,present:n,gray:a,dot:o}){let s=U(e),c;return c=t?/* @__PURE__ */ r(`img`,{className:a?`gray`:void 0,src:t,alt:``}):s?/* @__PURE__ */ r(`span`,{className:`initials`,children:s}):/* @__PURE__ */ r(Q,{path:n===!1?ue:K}),/* @__PURE__ */ i(`span`,{className:`avatar`,children:[/* @__PURE__ */ r(`span`,{className:`disc`,children:c}),o&&n!==void 0?/* @__PURE__ */ r(`span`,{className:`avatar-dot`}):null]})}ie(ae,class extends re{#e;#t=null;#n=null;#r=null;#i=``;#a=/* @__PURE__ */ new Map;#o=null;#s=null;constructor(){super();let e=this.attachShadow({mode:`open`}),n=document.createElement(`style`);n.textContent=be;let r=document.createElement(`div`);r.className=`mount`,e.append(n,r),this.#e=t(r)}connectedCallback(){super.connectedCallback(),this.#t??=setInterval(()=>this.render(),Ce)}disconnectedCallback(){super.disconnectedCallback(),this.#t&&=(clearInterval(this.#t),null),this.#n&&=(clearTimeout(this.#n),null)}getObjectIds(e){let t=R(e.person);return t?[t]:[]}getStateIds(e){let t=R(e.person);if(!t)return[];let n=Se.map(e=>`${t}.${e}`);return e.showHistory!==!1&&n.push(`${t}.history`),n.push(`${X(t)}.info.connection`),n}get#c(){return oe(this.systemLang)}get#l(){return R(this.settings.person)}#u(e){let t=this.#l;return t?this.states[`${t}.${e}`]?.val:void 0}get#d(){return z(this.#u(`present`))}get#f(){return Z(this.settings.historyCount,1,100,10)}get#p(){return Z(this.settings.historyDays,1,365,7)}get#m(){let e=(this.settings.nameText||``).trim();if(e)return e;let t=this.#l,n=t?this.objects[t]:null;return n?.native?.person||G(n?.common?.name,this.systemLang)||t?.split(`.`).pop()||``}get#h(){let e=(this.settings.presentColor||``).trim(),t=(this.settings.absentColor||``).trim();return{...e?{"--present-color":e}:{},...t?{"--absent-color":t}:{}}}get#g(){let e=this.#d;return e===void 0?`unknown`:e?`present`:`absent`}get#_(){let e=this.#d;return e===void 0?`…`:((e?this.settings.presentText:this.settings.absentText)||``).trim()||this.#c(e?`telt_present`:`telt_absent`)}get#v(){let e=this.#d;if(e===void 0)return``;let t=Date.now(),n=0,r=B(this.#u(e?`lastArrival`:`lastDeparture`));if(r&&r<=t)n=t-r;else{let t=B(this.#u(e?`presentSince`:`absentSince`));n=t?t*6e4:0}return n?this.#c(`telt_sinceDuration`,I(n,this.systemLang)):``}get#y(){let e=this.#l;return!!e&&H(this.states[`${X(e)}.info.connection`]?.val)===!1}get#b(){return(this.settings.image||``).trim()}get#x(){return this.#d===!1&&this.settings.grayAbsent!==!1}#S(e){let t=this.#l,n=this.socket;if(!e||!t||!n)return e;this.#o!==n&&(this.#o=n,this.#a.clear());let r=`${X(t)}.${e}`,i=this.#a.get(r);return i===void 0&&(this.#a.set(r,``),n.getObject(r).then(e=>{this.#o===n&&(this.#a.set(r,G(e?.common?.name,this.systemLang)),this.render())}).catch(()=>void 0)),i||e}get#C(){let e=B(this.#u(`lastSeen`));return[this.#S(V(this.#u(`router`))),V(this.#u(`ssid`)),e?L(e,this.systemLang):``].filter(Boolean).join(` · `)}#w(){let e=this.settings,t=this.#c,n=this.systemLang,r=e=>L(B(this.#u(e))||0,n),i=e=>{let t=B(this.#u(e));return t===void 0?`—`:I(t*6e4,n)},a=[];return e.showArrival!==!1&&a.push({key:`arrival`,label:t(`telt_lastArrival`),value:r(`lastArrival`)}),e.showDeparture!==!1&&a.push({key:`departure`,label:t(`telt_lastDeparture`),value:r(`lastDeparture`)}),e.showToday&&(a.push({key:`presentToday`,label:t(`telt_presentToday`),value:i(`presentToday`)}),a.push({key:`absentToday`,label:t(`telt_absentToday`),value:i(`absentToday`)})),e.showDevices&&a.push({key:`devices`,label:t(`macs`),value:V(this.#u(`devices`))||`—`,wide:!0}),e.showSeen&&a.push({key:`seen`,label:t(`telt_lastSeen`),value:this.#C||`—`,wide:!0}),a}get#T(){return this.#r?.history?.events??P(this.#u(`history`))}#E(e){let t=this.socket,n=this.#l;if(!t||!n)return;let r=Math.max(this.#f,Y),i=this.#p,a=`${n}|${r}|${i}`,o=this.#r,s=o?.key===a&&o.socket===t;if(s&&!e)return;let c={key:a,socket:t,loading:!0,history:s?o.history:null};this.#r=c,le(t,n,{count:r,days:i}).then(e=>{this.#r===c&&(c.history=e,c.loading=!1,this.render())}).catch(()=>void 0)}#D(){let e=this.#l;if(!this.socket||!e||this.settings.showHistory===!1)return;let t=this.states[`${e}.present`],n=this.states[`${e}.history`];if(t===void 0||n===void 0)return;let r=`${String(t?.val)}|${String(n?.val??``)}`,i=`${e}|${Math.max(this.#f,Y)}|${this.#p}`;this.#r?.key!==i||this.#r.socket!==this.socket?(this.#i=r,this.#E(!1)):r!==this.#i&&(this.#i=r,this.#n&&clearTimeout(this.#n),this.#n=setTimeout(()=>{this.#n=null,this.#E(!0)},we))}get#O(){let e=this.#l;return!this.editMode&&!!e&&!!this.objects[e]&&this.settings.showHistory!==!1}#k=()=>{let e=this.#l;!this.#O||this.#s||!this.emit(`teltonika-person-click`,{person:e})||this.#j()};#A=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.#k())};async#j(){let e=document.createElement(`div`),n=e.attachShadow({mode:`open`}),r=document.createElement(`style`);r.textContent=xe;let i=document.createElement(`div`);n.append(r,i);let a=t(i);this.#s=()=>{for(let[t,n]of Object.entries(S(this.theme)))e.style.setProperty(t,n);a.render(this.#I())},this.#s(),this.#E(!0);try{await this.openDialog({title:this.#m,element:e,width:Te})}finally{this.#s=null,a.unmount()}}#M(e,t,n){let a=this.#c,o=this.systemLang,s=I(Math.max(0,t-e.ts),o);return/* @__PURE__ */ i(`div`,{className:`dlg-event ${e.present?`present`:`absent`}`,children:[/* @__PURE__ */ r(`span`,{className:`icon`,children:/* @__PURE__ */ r(Q,{path:e.present?de:fe})}),/* @__PURE__ */ i(`div`,{className:`ev-main`,children:[/* @__PURE__ */ r(`div`,{className:`ev-label`,children:a(e.present?`telt_came`:`telt_left`)}),/* @__PURE__ */ r(`div`,{className:`ev-sub${n?` ongoing`:``}`,children:a(n?`telt_sinceDuration`:e.present?`telt_stayed`:`telt_wasAway`,s)})]}),/* @__PURE__ */ r(`span`,{className:`ev-time`,title:new Date(e.ts).toLocaleString(M(o)),children:new Date(e.ts).toLocaleTimeString(M(o),{hour:`2-digit`,minute:`2-digit`})})]},`${e.ts}_${String(e.present)}`)}#N(){let e=this.#c,t=this.#r,n=t?.history?.events??[];if(!n.length)return/* @__PURE__ */ r(`div`,{className:`empty`,children:t&&!t.history?`…`:e(`telt_noHistory`)});let a=Date.now(),o=this.#d,s=[];return n.forEach((e,t)=>{let r=W(e.ts,this.systemLang),i=this.#M(e,t===0?a:n[t-1].ts,t===0&&o===e.present),c=s[s.length-1];c?.day===r?c.rows.push(i):s.push({day:r,rows:[i]})}),/* @__PURE__ */ r(`div`,{className:`days${t?.loading?` loading`:``}`,children:s.map(e=>/* @__PURE__ */ i(`div`,{className:`day`,children:[/* @__PURE__ */ r(`div`,{className:`day-label`,children:e.day}),e.rows]},e.day))})}#P(){let e=this.#c,t=B(this.#u(`presentToday`))||0,n=B(this.#u(`absentToday`))||0;if(t+n<=0)return null;let a=I(t*6e4,this.systemLang),o=I(n*6e4,this.systemLang),s=t/(t+n)*100;return/* @__PURE__ */ i(`div`,{className:`today`,title:`${e(`telt_presentToday`)}: ${a} · ${e(`telt_absentToday`)}: ${o}`,children:[/* @__PURE__ */ i(`div`,{className:`today-text`,children:[/* @__PURE__ */ i(`span`,{className:`text`,children:[`${e(`telt_presentToday`)}: `,/* @__PURE__ */ r(`span`,{className:`value`,children:a})]}),/* @__PURE__ */ r(`span`,{children:o})]}),/* @__PURE__ */ r(`div`,{className:`bar`,children:/* @__PURE__ */ r(`span`,{style:{width:`${s}%`}})})]})}#F(){let e=this.#c,t=B(this.#u(`lastSeen`));if(!t)return null;let a=this.#S(V(this.#u(`router`))),o=V(this.#u(`ssid`)),s=[`${e(`telt_lastSeen`)}: ${new Date(t).toLocaleString(M(this.systemLang))}`,a?`${e(`telt_router`)}: ${a}`:``,o?`SSID: ${o}`:``].filter(Boolean).join(`
`);return/* @__PURE__ */ i(`div`,{className:`info-line`,title:s,children:[/* @__PURE__ */ r(Q,{path:he}),/* @__PURE__ */ r(`span`,{children:`${e(`telt_lastSeen`)}:`}),/* @__PURE__ */ r(`span`,{className:`value`,children:L(t,this.systemLang)}),a?/* @__PURE__ */ r(`span`,{className:`text`,children:`· ${a}`}):null,o?/* @__PURE__ */ i(n,{children:[/* @__PURE__ */ r(Q,{path:ge}),/* @__PURE__ */ r(`span`,{className:`text`,children:o})]}):null]})}#I(){let e=this.#c,t=this.#r,n=this.#d,a=V(this.#u(`devices`)),o=this.settings.showDuration===!1?``:this.#v,s=t?.history,c=s?.source===`history`?e(`telt_historyFrom`,s.instance||`history`):s?.source===`adapter`?e(`telt_historyFromAdapter`):``;return/* @__PURE__ */ i(`div`,{className:`dialog ${this.#g}`,style:this.#h,children:[/* @__PURE__ */ i(`div`,{className:`dlg-status`,children:[/* @__PURE__ */ r($,{name:this.#m,image:this.#b,present:n,gray:this.#x,dot:!1}),/* @__PURE__ */ i(`div`,{className:`texts`,children:[/* @__PURE__ */ i(`div`,{className:`status`,children:[/* @__PURE__ */ r(`span`,{className:`dot`}),/* @__PURE__ */ r(`span`,{className:`status-text`,children:this.#_})]}),o?/* @__PURE__ */ r(`div`,{className:`duration`,children:o}):null]})]}),this.#P(),a&&n?/* @__PURE__ */ i(`div`,{className:`info-line`,title:`${e(`telt_devicesSeen`)}: ${a}`,children:[/* @__PURE__ */ r(Q,{path:_e}),/* @__PURE__ */ r(`span`,{className:`text mono`,children:a})]}):null,this.#F(),/* @__PURE__ */ i(`div`,{className:`dlg-title`,children:[/* @__PURE__ */ r(Q,{path:pe}),/* @__PURE__ */ r(`span`,{children:e(`telt_historyTitle`)}),/* @__PURE__ */ r(`button`,{type:`button`,className:`refresh`,title:e(`telt_refresh`),"aria-label":e(`telt_refresh`),disabled:!!t?.loading,onClick:()=>this.#E(!0),children:/* @__PURE__ */ r(Q,{path:me})})]}),this.#N(),c&&s?.events.length?/* @__PURE__ */ r(`div`,{className:`source`,children:c}):null]})}#L(){let e=this.#c,t=this.#T.slice(0,this.#f),n=Date.now(),a=this.#d,o=this.systemLang;return/* @__PURE__ */ i(`div`,{className:`history`,children:[/* @__PURE__ */ r(`div`,{className:`history-head`,children:/* @__PURE__ */ r(`span`,{children:e(`telt_historyTitle`)})}),t.length?/* @__PURE__ */ r(`div`,{className:`history-list`,children:t.map((s,c)=>{let l=I(Math.max(0,(c===0?n:t[c-1].ts)-s.ts),o),u=c===0&&a===s.present;return/* @__PURE__ */ i(`div`,{className:`event`,children:[/* @__PURE__ */ r(`span`,{className:`dot event-dot ${s.present?`present`:`absent`}`}),/* @__PURE__ */ r(`span`,{className:`event-label`,children:e(s.present?`telt_came`:`telt_left`)}),/* @__PURE__ */ r(`span`,{className:`event-duration`,children:e(u?`telt_sinceDuration`:s.present?`telt_stayed`:`telt_wasAway`,l)}),/* @__PURE__ */ r(`span`,{className:`event-time`,children:L(s.ts,o)})]},`${s.ts}_${String(s.present)}`)})}):/* @__PURE__ */ r(`div`,{className:`history-empty`,children:e(`telt_noHistory`)})]})}render(){this.#D(),this.#R(),this.#s?.()}#R(){let t=this.settings,n=this.#c,a=this.editMode,o=(t.person||``).trim(),s=this.#l;if(!o||!s){this.#e.render(/* @__PURE__ */ r(j,{text:n(o?`wc_not_person`:`select_person`),icon:`person`,editMode:a}));return}if(this.objects[s]===null){this.#e.render(/* @__PURE__ */ r(j,{text:n(`telt_personNotFoundIn`,s.split(`.`).pop()||s,X(s)),icon:`person`,editMode:a}));return}let c=this.#d,l=this.#m,u=t.showDuration===!1?``:this.#v,d=this.#w(),f=d.filter(e=>e.key===`arrival`||e.key===`departure`),p=this.#O,m=[`person`,this.#g,this.#y?`stale`:``,p?`clickable`:``].filter(Boolean);this.#e.render(/* @__PURE__ */ r(`div`,{className:`root${a?` edit`:``}`,children:/* @__PURE__ */ i(`div`,{className:m.join(` `),style:this.#h,role:p?`button`:void 0,tabIndex:p?0:void 0,title:p?`${l} - ${n(`telt_showHistoryOf`)}`:void 0,onClick:p?this.#k:void 0,onKeyDown:p?this.#A:void 0,children:[/* @__PURE__ */ i(`div`,{className:`head`,children:[/* @__PURE__ */ r($,{name:l,image:this.#b,present:c,gray:this.#x,dot:!0}),/* @__PURE__ */ i(`div`,{className:`texts`,children:[t.showName===!1?null:/* @__PURE__ */ r(`div`,{className:`name`,children:l}),/* @__PURE__ */ i(`div`,{className:`status`,children:[/* @__PURE__ */ r(`span`,{className:`dot`}),/* @__PURE__ */ r(`span`,{className:`status-text`,children:this.#_})]}),u?/* @__PURE__ */ r(`div`,{className:`duration`,children:u}):null]}),f.length?/* @__PURE__ */ r(`div`,{className:`times`,children:f.map(t=>/* @__PURE__ */ i(e,{children:[/* @__PURE__ */ r(`span`,{children:t.label}),/* @__PURE__ */ r(`span`,{className:`value`,children:t.value})]},t.key))}):null]}),d.length?/* @__PURE__ */ r(`div`,{className:`details`,children:d.map(e=>/* @__PURE__ */ i(`div`,{className:`box${e.wide?` wide`:``}`,title:`${e.label}: ${e.value}`,children:[/* @__PURE__ */ r(`div`,{className:`box-label`,children:e.label}),/* @__PURE__ */ r(`div`,{className:`box-value`,children:e.value})]},e.key))}):null,t.showHistory===!1?null:this.#L()]})}))}});