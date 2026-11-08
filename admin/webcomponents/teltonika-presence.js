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
`;function C(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function w(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function T(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function E(e,t,n,r,i){let a={name:t,setting:n,box:e.createElement(`div`),hidden:C(n.hidden),disabled:C(n.disabled)},s=o(n.label,i);switch(n.type){case`header`:return a.box=e.createElement(`h3`),a.box.textContent=o(n.text,i)||s,a;case`staticText`:return a.box=e.createElement(`p`),a.box.textContent=o(n.text,i)||s,a;case`divider`:return a.box=e.createElement(`hr`),a}let c=e.createElement(`label`);a.box=c;let l=e.createElement(`span`);if(l.textContent=s||t,n.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=r===!0||r===`true`,c.className=`check`,c.append(t,l),a.input=t}else if(n.type===`select`){let t=e.createElement(`select`);for(let r of n.options||[]){let n=e.createElement(`option`);n.textContent=o(r.label,i),t.append(n)}let s=(n.options||[]).findIndex(e=>String(e.value)===w(r));t.selectedIndex=s===-1?0:s,c.append(l,t),a.input=t}else if(n.type===`text`&&(n.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=n.minRows||2,t.value=w(r),c.append(l,t),a.input=t}else{let t=e.createElement(`input`),i=w(r);switch(n.type){case`number`:case`slider`:t.type=n.type===`slider`?`range`:`number`,n.min!==void 0&&(t.min=String(n.min)),n.max!==void 0&&(t.max=String(n.max)),t.step=n.step===void 0?`any`:String(n.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!i||/^#[0-9a-f]{6}$/i.test(i)?`color`:`text`;break;default:t.type=`text`}if(t.value=i,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}c.append(l,t),a.input=t}if(n.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=o(n.help,i),c.append(t)}return a}function D(e,t={}){let n=t.lang||`en`,a=document,c=e=>x[e][n]||x[e].en||e,l=a.createElement(`div`);l.setAttribute(`data-iob-dialog`,``);let d=l.attachShadow({mode:`open`}),f=a.createElement(`style`);f.textContent=S;let p=a.createElement(`dialog`),m=_(t.theme);p.className=m.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(b(m)))p.style.setProperty(e,t);e.width&&(p.style.width=`${e.width}px`),e.height&&(p.style.height=`${e.height}px`);let h=a.createElement(`form`),g=a.createElement(`header`),v=a.createElement(`span`);v.textContent=o(e.title,n);let y=a.createElement(`button`);y.type=`button`,y.className=`close`,y.title=c(`close`),y.setAttribute(`aria-label`,c(`close`)),y.textContent=`×`,g.append(v,y);let C=a.createElement(`div`);return C.className=`body`,h.append(g,C),p.append(h),d.append(f,p),new Promise(t=>{let f=!1,m=e=>{f||(f=!0,p.open&&p.close(),l.remove(),t(e))};if(y.addEventListener(`click`,()=>m(null)),p.addEventListener(`close`,()=>m(null)),h.addEventListener(`submit`,e=>e.preventDefault()),i(e)){let t={},r=[];for(let[t,i]of Object.entries(e.form.items||{})){let o=e.data?.[t]??i.default,s=E(a,t,i,o,n);r.push(s),C.append(s.box)}let i=()=>{for(let e of r)e.input&&(t[e.name]=T(e));return t},l=()=>{let e=i();for(let t of r)t.box.hidden=t.hidden?t.hidden(e):!1,t.input&&(t.input.disabled=t.disabled?t.disabled(e):!1)};h.addEventListener(`input`,l),h.addEventListener(`change`,l),l();let d=r.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);d?.input&&(d.input.autofocus=!0);let f=a.createElement(`footer`),p=a.createElement(`button`);p.type=`button`,p.textContent=o(e.cancel,n)||c(`cancel`),p.addEventListener(`click`,()=>m(null));let g=a.createElement(`button`);g.type=`submit`,g.className=`primary`,g.textContent=o(e.ok,n)||c(`ok`),f.append(p,g),h.append(f),h.addEventListener(`submit`,()=>m(u(s(e.form),i())))}else C.append(e.element),p.addEventListener(r,e=>m(e.detail??null));a.body.append(l),p.showModal(),d.activeElement&&d.activeElement!==y||(p.tabIndex=-1,p.focus())})}function O(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var k=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],A=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=_(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=_(e);v(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of k)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return o(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(e){if(this.#r)return null;let t=this.#i?await this.#i.open(e):await D(e,{lang:this.systemLang,theme:this.#n});return i(e)?t&&typeof t==`object`?u(s(e.form),t):null:t??null}#u(){for(let[e,t]of Object.entries(b(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?O(this.getStateIds(this.#t)):[],n=e?O(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function j(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}var M=`iob-teltonika-presence`,N=`M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z`,P=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`;function F({text:e,icon:r,editMode:i}){return/* @__PURE__ */ n(`div`,{className:`hint${i?` edit`:``}`,children:[/* @__PURE__ */ t(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ t(`path`,{d:r===`person`?P:N})}),/* @__PURE__ */ t(`span`,{children:e})]})}function I(e){let t=String(e??``).trim().match(/^(?:system\.adapter\.)?(?:teltonika\.)?(\d+)$/);return t?`teltonika.${t[1]}`:null}function L(e){let t={en:{is_present:`present`,is_away:`away`,present_count:`%s of %s present`,guests_count:`Guests: %s`,nobody_present:`Nobody is present`,no_persons:`No persons. Add them in the tab "Presence" of the instance.`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`},de:{is_present:`anwesend`,is_away:`abwesend`,present_count:`%s von %s anwesend`,guests_count:`Gäste: %s`,nobody_present:`Niemand ist anwesend`,no_persons:`Keine Personen. Sie werden im Reiter "Anwesenheit" der Instanz angelegt.`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`},ru:{is_present:`дома`,is_away:`нет дома`,present_count:`Присутствуют %s из %s`,guests_count:`Гости: %s`,nobody_present:`Никого нет`,no_persons:`Нет персон. Добавьте их на вкладке «Присутствие» экземпляра.`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`},pt:{is_present:`presente`,is_away:`ausente`,present_count:`%s de %s presentes`,guests_count:`Convidados: %s`,nobody_present:`Ninguém está presente`,no_persons:`Sem pessoas. Adicione-as na aba "Presença" da instância.`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`},nl:{is_present:`aanwezig`,is_away:`afwezig`,present_count:`%s van %s aanwezig`,guests_count:`Gasten: %s`,nobody_present:`Niemand is aanwezig`,no_persons:`Geen personen. Voeg ze toe in het tabblad "Aanwezigheid" van de instantie.`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`},fr:{is_present:`présent`,is_away:`absent`,present_count:`%s sur %s présents`,guests_count:`Invités : %s`,nobody_present:`Personne n'est présent`,no_persons:`Aucune personne. Ajoutez-les dans l'onglet « Présence » de l'instance.`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`},it:{is_present:`presente`,is_away:`assente`,present_count:`%s di %s presenti`,guests_count:`Ospiti: %s`,nobody_present:`Nessuno è presente`,no_persons:`Nessuna persona. Aggiungile nella scheda "Presenza" dell'istanza.`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`},es:{is_present:`presente`,is_away:`ausente`,present_count:`%s de %s presentes`,guests_count:`Invitados: %s`,nobody_present:`No hay nadie`,no_persons:`No hay personas. Añádalas en la pestaña "Presencia" de la instancia.`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`},pl:{is_present:`obecny`,is_away:`nieobecny`,present_count:`Obecnych: %s z %s`,guests_count:`Goście: %s`,nobody_present:`Nikogo nie ma`,no_persons:`Brak osób. Dodaj je w zakładce „Obecność” instancji.`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`},uk:{is_present:`вдома`,is_away:`немає вдома`,present_count:`Присутні %s з %s`,guests_count:`Гості: %s`,nobody_present:`Нікого немає`,no_persons:`Немає осіб. Додайте їх на вкладці «Присутність» екземпляра.`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`},"zh-cn":{is_present:`在家`,is_away:`离开`,present_count:`%s / %s 在家`,guests_count:`访客：%s`,nobody_present:`没有人在家`,no_persons:`没有人员。请在实例的“在家状态”选项卡中添加。`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`}}[e]||{},n={en:{is_present:`present`,is_away:`away`,present_count:`%s of %s present`,guests_count:`Guests: %s`,nobody_present:`Nobody is present`,no_persons:`No persons. Add them in the tab "Presence" of the instance.`,wc_choose_instance:`Choose an instance of the Teltonika adapter in the settings`},de:{is_present:`anwesend`,is_away:`abwesend`,present_count:`%s von %s anwesend`,guests_count:`Gäste: %s`,nobody_present:`Niemand ist anwesend`,no_persons:`Keine Personen. Sie werden im Reiter "Anwesenheit" der Instanz angelegt.`,wc_choose_instance:`Instanz des Teltonika-Adapters in den Einstellungen wählen`},ru:{is_present:`дома`,is_away:`нет дома`,present_count:`Присутствуют %s из %s`,guests_count:`Гости: %s`,nobody_present:`Никого нет`,no_persons:`Нет персон. Добавьте их на вкладке «Присутствие» экземпляра.`,wc_choose_instance:`Выберите экземпляр адаптера Teltonika в настройках`},pt:{is_present:`presente`,is_away:`ausente`,present_count:`%s de %s presentes`,guests_count:`Convidados: %s`,nobody_present:`Ninguém está presente`,no_persons:`Sem pessoas. Adicione-as na aba "Presença" da instância.`,wc_choose_instance:`Escolha uma instância do adaptador Teltonika nas configurações`},nl:{is_present:`aanwezig`,is_away:`afwezig`,present_count:`%s van %s aanwezig`,guests_count:`Gasten: %s`,nobody_present:`Niemand is aanwezig`,no_persons:`Geen personen. Voeg ze toe in het tabblad "Aanwezigheid" van de instantie.`,wc_choose_instance:`Kies een instantie van de Teltonika-adapter in de instellingen`},fr:{is_present:`présent`,is_away:`absent`,present_count:`%s sur %s présents`,guests_count:`Invités : %s`,nobody_present:`Personne n'est présent`,no_persons:`Aucune personne. Ajoutez-les dans l'onglet « Présence » de l'instance.`,wc_choose_instance:`Choisissez une instance de l'adaptateur Teltonika dans les paramètres`},it:{is_present:`presente`,is_away:`assente`,present_count:`%s di %s presenti`,guests_count:`Ospiti: %s`,nobody_present:`Nessuno è presente`,no_persons:`Nessuna persona. Aggiungile nella scheda "Presenza" dell'istanza.`,wc_choose_instance:`Scegli un'istanza dell'adattatore Teltonika nelle impostazioni`},es:{is_present:`presente`,is_away:`ausente`,present_count:`%s de %s presentes`,guests_count:`Invitados: %s`,nobody_present:`No hay nadie`,no_persons:`No hay personas. Añádalas en la pestaña "Presencia" de la instancia.`,wc_choose_instance:`Elija una instancia del adaptador Teltonika en la configuración`},pl:{is_present:`obecny`,is_away:`nieobecny`,present_count:`Obecnych: %s z %s`,guests_count:`Goście: %s`,nobody_present:`Nikogo nie ma`,no_persons:`Brak osób. Dodaj je w zakładce „Obecność” instancji.`,wc_choose_instance:`Wybierz instancję adaptera Teltonika w ustawieniach`},uk:{is_present:`вдома`,is_away:`немає вдома`,present_count:`Присутні %s з %s`,guests_count:`Гості: %s`,nobody_present:`Нікого немає`,no_persons:`Немає осіб. Додайте їх на вкладці «Присутність» екземпляра.`,wc_choose_instance:`Виберіть екземпляр адаптера Teltonika в налаштуваннях`},"zh-cn":{is_present:`在家`,is_away:`离开`,present_count:`%s / %s 在家`,guests_count:`访客：%s`,nobody_present:`没有人在家`,no_persons:`没有人员。请在实例的“在家状态”选项卡中添加。`,wc_choose_instance:`请在设置中选择 Teltonika 适配器实例`}}.en||{};return(e,...r)=>{let i=t[e]||n[e]||e;for(let e of r)i=i.replace(`%s`,String(e));return i}}var R={present:`present`,lastArrival:`lastArrival`,lastDeparture:`lastDeparture`,presentSince:`presentSince`,absentSince:`absentSince`,presentToday:`presentToday`,absentToday:`absentToday`,devices:`devices`,history:`history`};function z(e){if(typeof e==`string`)return e;if(e&&typeof e==`object`){let t=e;return t.en||Object.values(t)[0]||``}return``}async function B(e,t){let n=`${t}.presence.persons.`;try{let t=await e.getObjectViewSystem(`channel`,n,`${n}香`)||{};return Object.keys(t).filter(e=>e.length>n.length&&!e.substring(n.length).includes(`.`)).map(e=>{let r=t[e],i=r?.native||{};return{id:e,name:i.person||z(r?.common?.name)||e.substring(n.length),group:i.group||``}}).sort((e,t)=>e.name.localeCompare(t.name))}catch(e){return console.warn(`Cannot read the persons of ${t}: ${String(e)}`),[]}}function V(e){return e===`zh-cn`?`zh-CN`:e||`en`}function H(e,t){let n=Math.max(0,Math.floor(e/6e4)),r=[[Math.floor(n/1440),`day`],[Math.floor(n%1440/60),`hour`],[n%60,`minute`]],i=r.findIndex(([e])=>e>0);return(i===-1?[r[2]]:r.slice(i,i+2).filter(([e])=>e>0)).map(([e,n])=>{try{return new Intl.NumberFormat(V(t),{style:`unit`,unit:n,unitDisplay:n===`day`?`long`:`short`}).format(e)}catch{return`${e} ${n===`day`?`d`:n===`hour`?`h`:`min`}`}}).join(` `)}function U(e,t){if(!e)return`—`;let n=new Date(e),r=/* @__PURE__ */ new Date,i=V(t),a=n.toLocaleTimeString(i,{hour:`2-digit`,minute:`2-digit`}),o=new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime();if(e>=o)return a;if(e>=o-864e5)try{return`${new Intl.RelativeTimeFormat(i,{numeric:`auto`}).format(-1,`day`)} ${a}`}catch{}let s=n.getFullYear()===r.getFullYear();return`${n.toLocaleDateString(i,{day:`2-digit`,month:`2-digit`,...s?{}:{year:`numeric`}})} ${a}`}function W(e){if(e!=null)return typeof e==`string`?e===`true`||e===`1`||e===`on`:!!e}function G(e){if(e==null||e===``)return;let t=Number(e);return Number.isFinite(t)?t:void 0}var K=`M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4`,q=`M8.65 5.82C9.36 4.72 10.6 4 12 4c2.21 0 4 1.79 4 4 0 1.4-.72 2.64-1.82 3.35zM20 17.17c-.02-1.1-.63-2.11-1.61-2.62-.54-.28-1.13-.54-1.77-.76zm1.19 4.02L2.81 2.81 1.39 4.22l8.89 8.89c-1.81.23-3.39.79-4.67 1.45-1 .51-1.61 1.54-1.61 2.66V20h13.17l2.61 2.61z`,J=`
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

.presence {
    height: 100%;
    padding: clamp(6px, 3cqmin, 12px);
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.summary-line {
    flex: none;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.rows {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}
.empty {
    padding: 8px 0;
    font-size: 13px;
    color: var(--muted);
}
.row {
    --avatar: 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    min-width: 0;
}
.row .disc {
    border: none;
}
.row-texts {
    flex: 1 1 auto;
    min-width: 0;
}
.row-name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.row-info {
    font-size: 12px;
    line-height: 1.35;
    color: var(--muted);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.row-time {
    flex: none;
    font-size: 12px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
}
@container (max-width: 220px) {
    .row-time {
        display: none;
    }
}
@container (max-width: 160px) {
    .row {
        --avatar: 24px;
        gap: 6px;
    }
}
`,Y=[R.present,R.lastArrival,R.lastDeparture,R.presentSince,R.absentSince],X=6e4;j(M,class extends A{#e;#t=null;#n=null;#r=null;constructor(){super();let t=this.attachShadow({mode:`open`}),n=document.createElement(`style`);n.textContent=J;let r=document.createElement(`div`);r.className=`mount`,t.append(n,r),this.#e=e(r)}connectedCallback(){super.connectedCallback(),this.#t??=setInterval(()=>this.render(),X)}disconnectedCallback(){super.disconnectedCallback(),this.#t&&=(clearInterval(this.#t),null)}getStateIds(e){let t=I(e.instance),n=this.#a(e);if(!t||!n)return[];let r=n.flatMap(e=>Y.map(t=>`${e.id}.${t}`));return e.showGuests!==!1&&r.push(`${t}.presence.guests.count`),r}get#i(){return L(this.systemLang)}#a(e){let t=I(e.instance);if(!t||!this.#n||this.#r?.instance!==t||this.#r.socket!==this.socket)return null;let n=(e.group||``).trim().toLowerCase();return n?this.#n.filter(e=>e.group.toLowerCase()===n):this.#n}#o(){let e=this.socket,t=e?I(this.settings.instance):null;if(!e||!t||this.#r?.instance===t&&this.#r.socket===e)return;let n={instance:t,socket:e};this.#r=n,this.#n=null,B(e,t).then(e=>{this.#r===n&&(this.#n=e,this.settings=this.settings)}).catch(()=>void 0)}#s(e){return this.states[e]?.val}#c(e){let t=this.#i,n=this.systemLang,r=Date.now();return e.map(e=>{let i=W(this.#s(`${e.id}.${R.present}`));if(i===void 0)return{id:e.id,name:e.name,present:i,info:`…`,time:``};let a=G(this.#s(`${e.id}.${i?R.lastArrival:R.lastDeparture}`)),o=G(this.#s(`${e.id}.${i?R.presentSince:R.absentSince}`)),s=0;a&&a<=r?s=r-a:o&&(s=o*6e4);let c=t(i?`is_present`:`is_away`);return{id:e.id,name:e.name,present:i,info:s?`${c} · ${H(s,n)}`:c,time:a?U(a,n):``}})}render(){this.#o(),this.#l()}#l(){let e=this.settings,r=this.#i,i=this.editMode,a=I(e.instance);if(!a){this.#e.render(/* @__PURE__ */ t(F,{text:r(`wc_choose_instance`),icon:`person`,editMode:i}));return}let o=this.#a(e);if(!o){this.#e.render(/* @__PURE__ */ t(`div`,{className:`root`}));return}let s=this.#c(o),c=s.filter(e=>e.present).length,l=e.showGuests===!1?void 0:G(this.#s(`${a}.presence.guests.count`)),u=r(`present_count`,c,o.length);e.onlyActive&&(s=s.filter(e=>e.present)),e.activeFirst!==!1&&s.sort((e,t)=>Number(!!t.present)-Number(!!e.present)||e.name.localeCompare(t.name));let d=null;s.length||(d=/* @__PURE__ */ t(`div`,{className:`empty`,children:r(o.length?`nobody_present`:`no_persons`)})),this.#e.render(/* @__PURE__ */ t(`div`,{className:`root${i?` edit`:``}`,children:/* @__PURE__ */ n(`div`,{className:`presence`,children:[/* @__PURE__ */ t(`div`,{className:`summary-line`,children:l===void 0?u:`${u} · ${r(`guests_count`,l)}`}),d,/* @__PURE__ */ t(`div`,{className:`rows`,children:s.map(e=>/* @__PURE__ */ n(`div`,{className:`row ${e.present===void 0?`unknown`:e.present?`present`:`absent`}`,children:[/* @__PURE__ */ t(`span`,{className:`avatar`,children:/* @__PURE__ */ t(`span`,{className:`disc`,children:/* @__PURE__ */ t(`svg`,{viewBox:`0 0 24 24`,"aria-hidden":`true`,children:/* @__PURE__ */ t(`path`,{d:e.present===!1?q:K})})})}),/* @__PURE__ */ n(`div`,{className:`row-texts`,children:[/* @__PURE__ */ t(`div`,{className:`row-name`,children:e.name}),/* @__PURE__ */ t(`div`,{className:`row-info`,children:e.info})]}),e.time?/* @__PURE__ */ t(`span`,{className:`row-time`,children:e.time}):null]},e.id))})]})}))}});