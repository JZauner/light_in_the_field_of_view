'use strict';
const el = id => document.getElementById(id);
const data = globalThis.lightModel || JSON.parse(el('model-data').textContent);
const config = data.config;
const pendingRooms=new Map();
let refreshNumber=0;
function hasRoom(size){
  return Boolean(el('room-'+size)||globalThis.lightRoomData?.[size]);
}
function requestRoom(size){
  if(hasRoom(size))return Promise.resolve();
  if(pendingRooms.has(size))return pendingRooms.get(size);
  const script=document.createElement('script');
  const request=new Promise((resolve,reject)=>{
    script.src='assets/data/room-'+size+'.js';
    script.onload=()=>hasRoom(size)?resolve():reject(new Error('Room '+size));
    script.onerror=()=>reject(new Error('Room '+size));
    document.head.append(script);
  }).finally(()=>{pendingRooms.delete(size);script.remove();});
  pendingRooms.set(size,request);
  return request;
}
function roomStatus(status){
  const node=el('data-status'),pending=Boolean(status);
  node.hidden=!pending;el('main').classList.toggle('model-pending',pending);
  el('main').setAttribute('aria-busy',String(status==='loading'));
  el('retry-data').hidden=status!=='error';
  node.firstElementChild.textContent=status==='error'?tr('Raumdaten konnten nicht geladen werden.'):pending?tr('Raummodell wird geladen …'):'';
}

const sceneRooms = new Map();
function roomFor(state) {
  const id = 'room-'+state.size;
  if (!sceneRooms.has(id)) {
    const stored = globalThis.lightRoomData?.[state.size] || JSON.parse(el(id).textContent);
    const reflection = JSON.parse(new TextDecoder().decode(inflateBlock(stored.roof)));
    reflection.seats = stored.seats;
    if(sceneRooms.size>=4)sceneRooms.delete(sceneRooms.keys().next().value);
    sceneRooms.set(id,{...data.room[state.size],views:stored.views,reflection,paths:stored.paths});
  }
  return sceneRooms.get(id);
}
// R liefert die Tabellen in komprimierten Byte-Ebenen. Beim ersten Aufruf
// einer Neigung werden nur deren fertige Werte entpackt.
const pitchTables=new Map();
function tablesAt(index) {
  if(!pitchTables.has(index)){
    const compressed=data.pitches[index];
    pitchTables.set(index,{records:inflateBlock(compressed.records),rays:inflateBlock(compressed.rays)});
  }
  return pitchTables.get(index);
}
function recordAt(planes,fields,index){
  const count=planes.length/fields;
  return Array.from({length:fields},(_,field)=>planes[field*count+index]);
}
const surfaceNames={ceiling:'Decke',wall:'Wände',floor:'Boden',desk:'Tisch'};
const materialKeys=Object.keys(surfaceNames);
function inflateBlock(str){return pako.inflate(Uint8Array.from(atob(str),c=>c.charCodeAt(0)));}
function unpackSeries(text,material){
  const b=inflateBlock(text),n=b.length/2,values=new Uint16Array(n);let previous=0;
  for(let i=0;i<n;i++){
    const k=b[i]+256*b[i+n];
    if(material)values[i]=k%2?-(k+1)/2:k/2;
    else{previous=(previous+k)&65535;values[i]=previous;}
  }
  if(material){
    const dims=[3,30,data.pitches.length,...materialKeys.map(key=>data.materials[key].length)];
    for(const k of [4,3,2,1,0]){
      const step=dims.slice(0,k).reduce((a,v)=>a*v,1),block=step*dims[k];
      for(let start=0;start<n;start+=block)for(let i=start+step;i<start+block;i++)values[i]+=values[i-step];
    }
  }
  return values;
}
let latestSeat={};
function panelMeasurements(room,eye,state,t,j,geoValues){
  const raw=room.reflection.seats[eye];
  if(latestSeat.raw!==raw)latestSeat={raw,direct:unpackSeries(raw.direct,false)};
  if(state.reflect&&!latestSeat.delta){latestSeat.delta=unpackSeries(raw.delta,true);latestSeat.err=inflateBlock(raw.pct);}
  // R hat alle elf Stufen berechnet. Eine arithmetische Folge ist mit ihren
  // Endpunkten kodiert, die Restbytes stellen die exakten R-Prozentwerte wieder her.
  const mix=sourceMix(state);
  const lift=(arr,row,sensor)=>{
    const a=arr[(row*30+state.lamp)*3+sensor],b=arr[(row*30+29)*3+sensor];
    return a*(10-mix)+b*mix;
  };
  const base=[0,1,2].map(k=>lift(latestSeat.direct,t,k));
  const delta=state.reflect?[0,1,2].map(k=>lift(latestSeat.delta,j*16+t,k)):[0,0,0];
  const sum=base.map((v,k)=>v+delta[k]);
  let percent=geoValues[6]===255?[null,null,null]:[100,geoValues[6],geoValues[7]];
  if(state.reflect){
    const addr=((((j*16+t)*29+state.lamp)*11+mix)*2);
    const actual=[1,2].map(k=>((sum[0]?Math.floor((sum[k]/sum[0])*100+.5):255)+latestSeat.err[addr+k-1])&255);
    percent=actual[0]===255?[null,null,null]:[100,...actual];
  }
  const decode=v=>v/1000;
  return {direct:base.map(decode),indirect:delta.map(decode),total:sum.map(decode),ratios:percent};
}
function measurement(room,state,t,values,fullCeiling){
  const j=materialKeys.reduceRight((index,key)=>index*data.materials[key].length+state[key],0);
  if(!fullCeiling)return panelMeasurements(room,state.eye,state,t,j,values);
  const lit=state.source!=='off',r=room.reflection;
  const bare=r.roofBare[lit?1:0][t],row=state.reflect?(lit?r.roofWall:r.roof)[j][t]:bare;
  return {direct:bare.slice(3,6),indirect:row.slice(0,3),total:row.slice(3,6),ratios:row[6]===255?[null,null,null]:[100,row[6],row[7]]};
}
let referenceLux=config.defaultLux;
const formatValue=(v,digits=v<1?2:3)=>v.toLocaleString(locale,{maximumSignificantDigits:digits,notation:v>=1e6||(v>0&&v<1e-5)?'scientific':'standard'});
function luxText(value,positive=false){
  const factor=referenceLux/config.referenceLevel;
  if(value===0&&positive)return '< '+formatValue(.01*factor);
  return formatValue(value*factor);
}
function sourceMix(state){return state.source==='off'?0:state.mix;}
function mixControlValue(state){return ranges.mix-sourceMix(state);}

const masks = [
  {title:'Offene Messung', short:'Offen', text:'Vorderer Halbraum (Hemisphäre)'},
  {title:'Obere Schattenscheibe', short:'Mit Scheibe', text:'Kreisrunde Scheibe über dem Auge'},
  {title:'Gesichtsfeldblende', short:'Mit Blende', text:'−70° bis +50° im Winkeldiagramm'}
];
const chapters = [
  {id:'messprinzip',nav:'Messprinzip',title:'Was erfasst ein Sensor am Auge?',intro:'Vergleiche die offene Messung mit zwei Blenden. Beide Blenden begrenzen das Licht relativ zur Blickachse.',next:'Zur Sitzposition'},
  {id:'sitzposition',nav:'Sitzposition',title:'Was ändern Sitzplatz und Blickrichtung?',intro:'Schiebe den Tisch unter das Deckenpanel. Ziehe die Pfeilspitze nach oben oder unten.',next:'Zur Lichtverteilung',key:'eye'},
  {id:'lichtverteilung',nav:'Lichtverteilung',title:'Was ändert Licht von der Wand?',intro:'Verteile denselben Lichtstrom zwischen dem Deckenpanel und dem leuchtenden Wandpanel. Der Sitzplatz bleibt am selben Ort.',next:'Zur Leuchtenposition',key:'mix'},
  {id:'leuchtenposition',nav:'Leuchtenposition',title:'Wann liegt die Leuchte im Gesichtsfeld?',intro:'Verschiebe das Deckenpanel bei festem Sitzplatz bis an eine Wand. Beobachte, wann seine Kanten die obere Winkelgrenze passieren.',next:'Zur Raumgröße',key:'lamp'},
  {id:'raumgroesse',nav:'Raumgröße',title:'Wie viel Deckenlicht erreicht das Auge?',intro:'Die ganze Decke leuchtet gleichmäßig. Vergrößere den Raum, neige den Blick und vergleiche das direkte mit dem reflektierten Licht.',next:'Zum freien Versuch',key:'size'},
  {id:'freier-versuch',nav:'Freier Versuch',title:'Wie spielen die Einflüsse zusammen?',intro:'Kombiniere Sitzplatz, Blickneigung, Lichtverteilung, Leuchtenposition und Raumgröße. Merke dir eine Einstellung zum Vergleichen.',next:'Zum Anfang'}
];
const defaultMaterials=Object.fromEntries(materialKeys.map((key,i)=>[key,data.materials[key].indexOf(config.defaultMaterial[i])]));
const defaultState = {size:2,eye:10,lamp:19,mix:3,mask:2,tilt:0,reflect:true,...defaultMaterials,comparison:2,source:'panel'};
const presets = [
  {...defaultState,source:'window'}, {...defaultState,eye:2,source:'off'}, {...defaultState,mix:0},
  {...defaultState,lamp:16,source:'off'}, {...defaultState,size:0,source:'off'}, {...defaultState,source:'window'}
];
const states = presets.map(p => ({...p}));
const standardMasks=[0,2],prototypeMasks=[0,1,2];
let availableMasks=standardMasks;
const fixed = {ne:data.room[0].seatX.length,nl:data.room[0].lampX.length,nm:data.wallShare.length};
const ranges = {eye:fixed.ne-1,lamp:fixed.nl-1,mix:fixed.nm-1,size:data.room.length-1,tilt:data.pitches[data.pitches.length-1].deg};
let probeAngle = 60;
let chapter = 0, view = 'room', showRays = true, saved = null, sceneModel, frameHandle = 0, announceTimer = 0;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const playState = {running:false,elapsed:0,start:0,finished:false};
const meters = v => numberFormat.format(v) + ' m';
function current() { return states[chapter]; }
function readScene(state = current(), onlyRoof = chapter === 4) {
  const daylight=state.source==='window';
  const room=roomFor(state),pitchIndex=data.pitches.findIndex(p=>p.deg===state.tilt);
  const frame=data.pitches[pitchIndex],roomView=room.views[pitchIndex];
  const eyeIndex=onlyRoof?config.midEye:state.eye;
  const idx=(state.size*fixed.ne+eyeIndex)*fixed.nl+state.lamp;
  const tables=tablesAt(pitchIndex);
  const values=onlyRoof?roomView.roofValues:recordAt(tables.records,8,idx*fixed.nm+sourceMix(state));
  const geo=recordAt(tables.rays,7,idx);
  const optical=measurement(room,state,pitchIndex,values,onlyRoof);
  const percent=optical.ratios[state.mask];
  const directPositive=[0,1,2].map(k=>onlyRoof?optical.direct[k]>0:values[2*k]!==0||values[2*k+1]!==0);
  const totalText=optical.total.map((v,k)=>luxText(v,directPositive[k]||(optical.ratios[k]??0)>0));
  const atReference=!onlyRoof&&state.reflect&&state.source!=='off'&&
    ['size','eye','lamp','mix','tilt',...materialKeys].every(key=>state[key]===presets[0][key]);
  if(atReference)totalText[0]=formatValue(referenceLux,15);
  const [hitX,hitZ,surface,panelX,firstLamp,lastLamp]=roomView.axis[eyeIndex];
  const hitsPanel=!onlyRoof&&firstLamp>=0&&state.lamp>=firstLamp&&state.lamp<=lastLamp;
  const axis=hitsPanel?[panelX,config.lampH,5]:[hitX,hitZ,surface];
  const seat=room.seatX[eyeIndex];
  const wallPower=onlyRoof&&state.source!=='off'?100*config.roofWallPower:data.wallShare[sourceMix(state)];
  return {room,frame,onlyRoof,mask:state.mask,mix:wallPower,ceilingPower:onlyRoof?100:100-wallPower,source:state.source,
    seat,eye:seat+frame.eyeOffset,eyeZ:frame.eyeZ,lamp:room.lampX[state.lamp],axis,
    open:optical.total[0],chosen:optical.total[state.mask],percent,optical,totalText,directPositive,reflect:state.reflect,window:daylight,
    wallLo:config.wallLo,
    finishes:Object.fromEntries(Object.keys(surfaceNames).map(k=>[k,data.materials[k][state[k]]])),roofGeometry:roomView.roofGeometry,
    roofAngle:roomView.roofAngle,
    centre:geo[0]===255?null:geo[0]-90};
}
const axisTargets=['die Stirnwand','die Decke','den Boden','die Tischplatte','das Wandpanel','das Deckenpanel'];
function aimAt(m){
  const surface=m.axis[2]===4?(m.window?'das Fenster':m.source==='off'?'die Glasfront':'das Wandpanel'):axisTargets[m.axis[2]];
  return tr(surface);
}
function angleText(m){
  return m.centre===null?tr('Die Mitte des Deckenpanels liegt hinter der Messebene.'):
    tr('Die Mitte des Deckenpanels liegt bei {angle} relativ zur Blickachse.',{angle:angleLabel(m.centre)});
}
function caption(m){
  const aim=tr('Die Blickachse trifft {surface}.',{surface:aimAt(m)});
  const wall=tr(m.window?'das Fenster':'das Wandpanel');
  const bold=text=>'<strong>'+text+'</strong> ';
  if(chapter===0)return [
    tr('Der offene Sensor erfasst den <strong>Halbraum vor der Messebene</strong>. Die Blickachse steht senkrecht auf dieser Ebene.'),
    tr('<strong>Die kreisrunde Schattenscheibe sperrt Licht oberhalb von +50° Elevation.</strong> Im Sensorblick ist ihre Kante gekrümmt.'),
    tr('<strong>Die volle Gesichtsfeldblende reicht im Mittelschnitt von −70° bis +50°.</strong> Im Sensorblick siehst du den idealisierten Winkelbereich nach Zauner et al., Abb. 1b.')
  ][m.mask];
  if(chapter===1){
    if(current().eye===0)return bold(tr('Die Stuhllehne steht an der Rückwand.'))+angleText(m);
    if(current().eye===ranges.eye)return bold(tr('Der Tisch steht an der Stirnwand.'))+aim+' '+angleText(m);
    return bold(aim)+angleText(m);
  }
  if(chapter===2){
    if(m.source==='off')return tr('<strong>100 % des Lichtstroms kommen vom Deckenpanel.</strong> Das Glas an der Stirnwand kann weiterhin Licht reflektieren.');
    if(m.mix===0)return tr('<strong>Das Licht kommt allein vom Deckenpanel.</strong> Verschiebe den Regler, damit auch {source} den Raum von vorn beleuchtet.',{source:wall});
    if(m.mix===100)return tr('<strong>Der gesamte Lichtstrom kommt von vorn.</strong> Seine Quelle ist {source} an der Stirnwand.',{source:wall});
    return tr('<strong>Der gesamte Lichtstrom bleibt gleich.</strong> Das Deckenpanel beleuchtet den Raum von oben, {source} von vorn.',{source:wall});
  }
  if(chapter===3){
    if(current().lamp===0||current().lamp===ranges.lamp)
      return bold(tr(current().lamp===0?'Die Panelkante liegt an der Rückwand.':'Die Panelkante liegt an der Stirnwand.'))+angleText(m);
    return tr('<strong>Ein Panel hat eine Fläche.</strong> Seine Kanten überqueren die obere Winkelgrenze nacheinander.')+' '+angleText(m);
  }
  if(chapter===4)return roofCaption(m);
  const contact=current().eye===0?tr('Die Stuhllehne berührt die Rückwand.'):current().eye===ranges.eye?tr('Die Tischkante berührt die Stirnwand.'):'';
  const lampContact=current().lamp===0?tr('Die linke Panelkante liegt an der Rückwand.'):current().lamp===ranges.lamp?tr('Die rechte Panelkante liegt an der Stirnwand.'):'';
  const source=m.mix===100?tr(m.window?'Das Fenster liefert den gesamten einstellbaren Lichtstrom.':'Das Wandpanel liefert den gesamten einstellbaren Lichtstrom.'):angleText(m);
  return bold(aim)+[lampContact||source,contact].filter(Boolean).join(' ');
}

function announce(message) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { el('announcement').textContent=message; },220);
}
function buildNavigation() {
  el('chapter-nav').replaceChildren();
  chapters.forEach((item,i) => {
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML='<span aria-hidden="true" class="chapter-num">'+(i<5 ? '0'+(i+1) : '✳')+'</span><span>'+tr(item.nav)+'</span>';
    button.setAttribute('aria-label', i<5 ? tr('Versuch {n}, {name}',{n:i+1,name:tr(item.nav)}) : tr(item.nav));
    button.addEventListener('click',()=>go(i));
    el('chapter-nav').append(button);
  });
}
const sliderKeys = ['eye','tilt','size','lamp','mix'];

function adjustable(key) {
  if(key==='mix'&&current().source==='off')return false;
  return chapter === 5 || key === 'tilt' || key === chapters[chapter].key;
}

function sliderValue(key,state) {
  const room=data.room[state.size],roof=chapter===4;
  if(key==='tilt')return state.tilt===0?tr('0° · waagerecht'):angleLabel(state.tilt);
  if(key==='size')return numberFormat.format(room.width)+' × '+meters(room.depth);
  if(key==='eye'){
    if(roof)return tr('{value} · Mitte',{value:meters(room.seatX[config.midEye])});
    return meters(room.seatX[state.eye]);
  }
  if(key==='lamp')return roof?tr('Gesamte Decke'):meters(room.lampX[state.lamp]);
  if(roof&&state.source!=='off')return tr('Decke und Stirnwand');
  return tr('{value} Lichtstrom von der Decke',{value:percentText(data.wallShare[mixControlValue(state)])});
}

const parameterCards = Object.fromEntries(
  [...el('settings').querySelectorAll('[data-setting]')].map(card=>[card.dataset.setting,card])
);

let activeSettingHint=null;
function closeSettingHint(){
  if(activeSettingHint)activeSettingHint.hidden=true;
  activeSettingHint=null;
}
function placeSettingHint(){
  if(!activeSettingHint)return;
  const card=activeSettingHint.closest('.parameter');
  activeSettingHint.classList.toggle('below',card.getBoundingClientRect().top<activeSettingHint.offsetHeight+6);
}
function installSettingHints(){
  const source=el('wall-source');
  for(const trigger of el('settings').querySelectorAll('.lock-help, #wall-source')){
    const card=trigger.closest('.parameter'),hint=card.querySelector('[role="tooltip"]');
    const retainedFocus=trigger===source?':focus':':focus-visible';
    function show(){
      if(trigger.hidden||(trigger===source&&source.value!=='off'))return;
      if(activeSettingHint!==hint)closeSettingHint();
      activeSettingHint=hint;hint.hidden=false;placeSettingHint();
    }
    function hide(){if(activeSettingHint===hint)closeSettingHint();}
    trigger.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')show();});
    card.addEventListener('pointerleave',event=>{
      if(event.pointerType!=='touch'&&!trigger.matches(retainedFocus))hide();
    });
    trigger.addEventListener('focus',()=>{if(trigger.matches(':focus-visible'))show();});
    trigger.addEventListener('blur',hide);
    if(trigger===source){
      source.addEventListener('change',()=>{if(source.value==='off')show();else hide();});
    }else{
      trigger.addEventListener('click',event=>{
        if(event.pointerType==='touch'&&activeSettingHint===hint)hide();
        else show();
      });
    }
  }
  document.addEventListener('pointerdown',event=>{
    if(activeSettingHint&&!activeSettingHint.closest('.parameter').contains(event.target))closeSettingHint();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&activeSettingHint){event.preventDefault();closeSettingHint();}
  });
  document.addEventListener('scroll',placeSettingHint,{capture:true,passive:true});
  window.addEventListener('resize',placeSettingHint);
}

function installSettings(){
  installSettingHints();
  el('enable-disc').addEventListener('change',event=>{
    const enabled=event.currentTarget.checked;
    availableMasks=enabled?prototypeMasks:standardMasks;
    if(!enabled){
      for(const state of saved?[...states,saved]:states){
        if(state.mask===1)state.mask=2;
        if(state.comparison===1)state.comparison=2;
      }
    }
    if(chapter===0)clearPlayback();
    refresh();
  });
  for(const key of sliderKeys){
    const input=el('range-'+key);
    input.max=ranges[key];
    if(key==='tilt'){
      input.min=data.pitches[0].deg;
      input.step=data.pitches[1].deg-data.pitches[0].deg;
    }
    input.addEventListener('input',()=>{
      if(!adjustable(key))return;
      clearPlayback();
      const value=Number(input.value);
      current()[key]=key==='mix'?ranges.mix-value:value;
      refresh(true);
    });
  }
  for(const radio of el('settings').querySelectorAll('input[name=mask]')){
    radio.addEventListener('change',()=>{
      if(radio.disabled||!radio.checked)return;
      clearPlayback();current().mask=Number(radio.value);
      if(current().mask)current().comparison=current().mask;
      refresh(true);
    });
  }
  el('pin').addEventListener('click',()=>{
    clearPlayback();saved={...current()};refresh();announce(tr('Aktuelle Einstellung für den Vergleich gemerkt.'));
  });
  el('restore').addEventListener('click',()=>{
    if(!saved)return;
    clearPlayback();Object.assign(current(),saved);refresh(true);
  });
}

function syncSettings(state){
  const roof=chapter===4,off=state.source==='off',primary=chapter===0?'mask':chapters[chapter].key;
  el('lab-tools').hidden=chapter!==5;
  el('fixed-key').hidden=chapter===5&&!off;
  el('play').disabled=chapter===2&&off;
  for(const [key,card] of Object.entries(parameterCards)){
    card.classList.toggle('primary-parameter',key===primary&&(key!=='mix'||!off));
  }
  for(const key of sliderKeys){
    const card=parameterCards[key],input=el('range-'+key),locked=!adjustable(key);
    const hasHint=locked||key==='mix';
    card.classList.toggle('fixed-parameter',locked);
    card.querySelector('.fixed-mark').hidden=!hasHint;
    if(!hasHint&&activeSettingHint&&card.contains(activeSettingHint))closeSettingHint();
    if(key==='mix'){
      el('fixed-mix').textContent=tr(locked?'Im Versuch fest':'Hinweis zum Lichtstrom');
      el('mix-availability').hidden=!locked;
    }
    input.disabled=locked;
    input.value=key==='eye'&&roof?config.midEye:key==='mix'?mixControlValue(state):state[key];
    const value=sliderValue(key,state);
    el('value-'+key).textContent=value;
    const position=(key==='eye'&&!roof)||(key==='lamp'&&!roof);
    input.setAttribute('aria-valuetext',position?tr('{distance} ab Rückwand',{distance:value}):value);
    if(key==='lamp'||key==='mix'){
      card.querySelector('.slider-line').hidden=roof;
      card.querySelector('.fixed-explanation').hidden=!roof;
    }
  }
  for(const radio of el('settings').querySelectorAll('input[name=mask]')){
    const i=Number(radio.value),description=tr(masks[i].text);
    radio.disabled=!availableMasks.includes(i);
    radio.parentElement.hidden=radio.disabled;
    radio.checked=i===state.mask;
    radio.setAttribute('aria-description',description);
    radio.parentElement.title=tr(masks[i].title)+' · '+description;
  }
  el('enable-disc').checked=availableMasks.includes(1);
  el('value-mask').textContent=tr(masks[state.mask].title);
  const heightText=height=>height.toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2});
  const pitch=data.pitches.find(frame=>frame.deg===state.tilt);
  el('eye-height').textContent=tr('Augenhöhe {height} m',{height:heightText(pitch.eyeZ)});
  el('ceiling-height').textContent=tr('Raumhöhe {height} m',{height:heightText(config.roomH)});
  el('wall-source').value=state.source;
  el('wall-source').setAttribute('aria-describedby',off?'window-note hint-source':'window-note help-mix');
  if(!off&&activeSettingHint===el('hint-source'))closeSettingHint();
  el('window-note').textContent=tr(off?'Glasfläche':state.source==='window'?'Brüstung auf Tischhöhe':'Unterkante auf Tischhöhe');
  const ends=parameterCards.mix.querySelector('.slider-ends');
  ends.firstElementChild.textContent=tr(state.source==='window'?'Tageslicht':'Stirnwand');
  ends.lastElementChild.textContent=tr('Decke');
  el('reflection-toggle').checked=state.reflect;
  el('reflection-state').textContent=tr(state.reflect?'Ein':'Aus');
  el('value-reflect').textContent=tr(state.reflect?'Direkt und reflektiert':'Nur direkt');
  el('materials-off').hidden=state.reflect;
  for(const key of materialKeys){
    const input=el('rho-'+key);
    input.disabled=!state.reflect;input.value=state[key];
  }
}
const longWindowLabel=matchMedia('(min-width:1250px)');
function nameDaylight(){
  const option=el('wall-source').querySelector('option[value=window]');
  option.textContent=tr(longWindowLabel.matches?'Fenster (diffuses Tageslicht)':'Diffuses Tageslicht');
}
function reflectionControls(){
  nameDaylight();
  if(longWindowLabel.addEventListener)longWindowLabel.addEventListener('change',nameDaylight);else longWindowLabel.addListener(nameDaylight);
  const container=el('material-grid');
  for(const [key,title] of Object.entries(surfaceNames)){
    const label=document.createElement('label');label.textContent=tr(title);
    const select=document.createElement('select');select.id='rho-'+key;
    for(const [i,value] of data.materials[key].entries())select.add(new Option(percentText(value),i));
    select.addEventListener('change',()=>{clearPlayback();current()[key]=Number(select.value);refresh(true);});
    label.append(select);container.append(label);
  }
  el('wall-source').addEventListener('change',e=>{clearPlayback();current().source=e.target.value;refresh(true);});
  el('reflection-toggle').addEventListener('change',e=>{
    clearPlayback();current().reflect=e.target.checked;refresh(true);
  });
}
function roofCaption(m){
  const g=m.roofGeometry;
  if(m.source!=='off')return tr('<strong>Die Stirnwand liefert zusätzliches Licht.</strong>')+' '+tr(g.strip===0?'Bei dieser Blickneigung liegt die Leuchtdecke vollständig hinter der Empfangsebene.':'Die Leuchtdichte der Decke bleibt beim Zuschalten gleich.');
  if(g.strip===0){
    if(m.reflect&&m.optical.indirect[0]>0)return tr('<strong>Das Licht erreicht das Auge auf Umwegen.</strong> Die Decke liegt hinter der geneigten Empfangsebene. Beleuchtete Oberflächen vor dem Auge werfen Licht auf den Sensor.');
    return tr('<strong>Die gesamte Leuchtdecke liegt hinter der Empfangsebene.</strong> Schon der offene Sensor erhält kein direktes Deckenlicht. Eine Blende kann hier nichts zusätzlich abschirmen.');
  }
  if(m.mask&&m.optical.direct[m.mask]===0)return tr('<strong>Ein Teil der Decke liegt vor dem offenen Sensor.</strong> Die gewählte Blende schirmt das gesamte direkte Deckenlicht ab.')+(m.reflect&&m.optical.indirect[m.mask]>0?' '+tr('Über Reflexionen erreicht Licht das Auge.'):'');
  if(g.strip<.15*m.room.depth){
    const width=formatValue(100*g.strip);
    return m.mask?tr('<strong>Erst ein schmaler Deckenstreifen liegt vor dem Sensor.</strong> Er reicht von der Stirnwand {width} cm in den Raum. Die gewählte Blende lässt direktes Licht von den seitlichen Enden dieses Streifens durch.',{width}):
      tr('<strong>Der offene Sensor streift die Decke.</strong> Ein {width} cm tiefer Streifen an der Stirnwand trägt direkt bei. Das Licht fällt dort fast parallel zur Sensorfläche ein.',{width});
  }
  const angle=numberFormat.format(Math.round(g.edge*10)/10)+'°';
  if(m.mask&&g.edge>50)return tr('<strong>Die seitlichen Deckenbereiche zählen mit.</strong> Im Mittelschnitt liegt selbst die ferne Deckenkante bei {angle} zur Blickachse und damit über der oberen Grenze. Seitlich kann Licht unterhalb dieser Grenze eintreffen.',{angle});
  return tr('<strong>Die ferne Deckenkante liegt im Mittelschnitt bei {angle} zur Blickachse.</strong>',{angle})+' '+tr(m.reflect?'Zum direkten Deckenlicht kommen Lichtwege über die Raumoberflächen hinzu.':'Jedes Stück der Decke trägt entsprechend seiner scheinbaren Größe und seinem Einfallswinkel zum Messwert bei.');
}

function chapterIntro(){
  if(chapter===0&&!availableMasks.includes(1))
    return tr('Vergleiche die offene Messung mit der Gesichtsfeldblende. Neige den Blick und beobachte, aus welchen Richtungen Licht zum Auge gelangt.');
  if(chapter===2&&current().source==='off')
    return tr('Wähle Wandpanel oder diffuses Tageslicht, um den Lichtstrom zwischen Decke und Stirnwand zu verteilen.');
  if(chapter===2&&current().source==='window')
    return tr('Verteile denselben Lichtstrom zwischen dem Deckenpanel und dem Fenster mit diffusem Tageslicht. Der Sitzplatz bleibt am selben Ort.');
  return tr(chapters[chapter].intro);
}
function paintResult(m,state){
  const v=m.optical,mask=state.mask,compare=mask||state.comparison,defined=m.percent!==null;
  const term=tr(compare===1?'Mit Scheibe':'Mit Blende');
  el('result-title').textContent=tr(mask?(mask===1?'Messwert mit Scheibe':'Messwert mit Blende'):'Offene Beleuchtungsstärke');
  const noRatio=mask&&!defined;
  el('percent').textContent=mask?(defined?m.percent:tr('Kein Bezugswert')):m.totalText[0];
  el('percent').classList.toggle('verbal',Boolean(noRatio));
  el('percent-unit').hidden=Boolean(noRatio);el('percent-unit').textContent=mask?'%':'lx';
  el('percent-unit').classList.toggle('index-unit',!mask);
  el('ratio-meter').hidden=!mask||!defined;
  el('meter-fill').style.width=(m.percent??0)+'%';
  el('open-index').textContent=m.totalText[0]+' lx';el('chosen-index').textContent=m.totalText[compare]+' lx';
  el('selected-label').textContent=term;
  el('ratio-note').textContent=tr(mask?(defined?'Prozent der offenen Beleuchtungsstärke am selben Auge.':compare===1?'Offen 0 lx, mit Scheibe 0 lx. Für 0 ÷ 0 lässt sich kein Prozentwert bilden.':'Offen 0 lx, mit Blende 0 lx. Für 0 ÷ 0 lässt sich kein Prozentwert bilden.'):(defined?'Dieser Modellwert ist der Bezugswert für die Messung mit Blende.':'Der offene Sensor und die Messung mit Blende ergeben hier 0 lx.'));
  el('transport-split').hidden=!state.reflect;
  el('value-direct').textContent=luxText(v.direct[mask],m.directPositive[mask])+' lx';
  el('value-indirect').textContent=luxText(v.indirect[mask])+' lx';
  syncLegend();
}


function refresh(shouldAnnounce=false) {
  const state=current(),revision=++refreshNumber;
  syncSettings(state);
  el('intro-text').textContent=chapterIntro();
  const needed=[state.size];
  if(chapter===5&&saved&&saved.size!==state.size)needed.push(saved.size);
  const missing=needed.filter(size=>!hasRoom(size));
  if(missing.length){
    roomStatus('loading');
    Promise.all(missing.map(requestRoom)).then(()=>{
      if(revision===refreshNumber)refresh(shouldAnnounce);
    }).catch(()=>{if(revision===refreshNumber)roomStatus('error');});
    return;
  }
  if(!el('data-status').hidden)roomStatus('');
  const m=readScene();sceneModel=m;
  drawParameterPictures(m,state);
  const defined=m.percent!==null;
  paintResult(m,state);
  el('board-caption').innerHTML=caption(m);
  const angle=angleLabel(state.tilt);
  const roomText=tr('Raum {width} mal {depth}.',{width:numberFormat.format(m.room.width),depth:meters(m.room.depth)});
  const positionText=tr('Der Messpunkt liegt {distance} vor der Rückwand in {height} Höhe. Die Blickneigung beträgt {angle}.',{distance:meters(m.eye),height:meters(m.eyeZ),angle});
  const ceilingText=m.onlyRoof?tr('Die ganze Decke leuchtet.'):tr('Das Deckenpanel liegt {distance} vor der Rückwand und hat {power} Prozent Leistung.',{distance:meters(m.lamp),power:m.ceilingPower});
  const emitterText=tr(m.source==='off'?'Die Wandquelle ist ausgeschaltet.':m.window?'Diffuses Tageslicht fällt ins Zimmer.':'Die zweite Lichtquelle ist ein Wandpanel.');
  const summary=[tr(masks[state.mask].title)+'.',m.mask?(defined?tr('{value} Prozent des offenen Werts.',{value:m.percent}):tr('Kein offenes Signal.')):'',
    tr('Offen {open} lx, gewählt {chosen} lx.',{open:m.totalText[0],chosen:m.totalText[m.mask]}),tr(m.reflect?'Reflexionen eingeschaltet.':'Nur Direktlicht.')].filter(Boolean).join(' ');
  el('scene-description').textContent=[roomText,positionText,ceilingText,emitterText,summary].join(' ');
  if(chapter===5){
    el('restore').hidden=!saved;
    if(saved){
      const ref=readScene(saved,false);
      el('saved-note').textContent=tr('Gemerkt bei {angle} Blickneigung, {status} Reflexionen.',{angle:angleLabel(saved.tilt),status:tr(saved.reflect?'mit':'ohne')})+' '+tr(masks[saved.mask].title)+'. '+tr('Offen {open} lx, gewählt {chosen} lx.',{open:ref.totalText[0],chosen:ref.totalText[ref.mask]});
    }else el('saved-note').textContent='';
  }
  updateProbe();
  if(shouldAnnounce) announce(summary);
  scheduleDraw();
}
function spokenResult(){
  if(!sceneModel||!el('data-status').hidden)return el('data-status').firstElementChild.textContent;
  return current().mask===0?tr('Offene Beleuchtungsstärke {value} lx.',{value:sceneModel.totalText[0]}):sceneModel.percent===null?tr('Beide Messwerte sind null.'):tr('Mit Blende {value} Prozent des offenen Messwerts.',{value:sceneModel.percent});
}
function angleLabel(n){return (n>0?'+':n<0?'−':'')+Math.abs(n)+'°';}
function probeIsBlocked(mask){return blocked(config.probeClass[probeAngle+90],mask);}
function updateProbe(){
  const active=chapter===0&&view==='cut';el('probe-control').hidden=!active;
  el('scene').classList.toggle('touch-probe',active);
  if(!active)return;
  const cut=probeIsBlocked(current().mask);
  el('probe-control').dataset.state=cut?'blocked':'accepted';
  const description=cut?'abgeblendet':Math.abs(probeAngle)===90?'streifender Einfall, Gewicht null':'erfasst';
  const label=angleLabel(probeAngle)+' · '+tr(description);
  el('probe-angle').value=String(probeAngle);el('probe-angle').setAttribute('aria-valuetext',label);el('probe-result').textContent=label;
}
function syncLegend(){
  const sensor=view==='sensor',active=!sensor&&showRays,probe=chapter===0&&view==='cut';
  el('ray-control').hidden=sensor;
  el('pass-legend').hidden=!active&&!probe;
  el('stop-key-label').parentElement.hidden=!current().mask||(!sensor&&!showRays&&!probe);
  el('bounce-legend').hidden=!active||!current().reflect;
}
function markView(nextView) {
  view=nextView;updateProbe();syncLegend();
  el('gaze-layer').toggleAttribute('hidden',view==='sensor');
  el('gaze-key-label').textContent=tr(view==='sensor'?'Blickachse':'Pfeilspitze ziehen');
  el('legend').classList.toggle('sensor-legend',view==='sensor');
  el('stop-key-label').textContent=tr(view==='sensor'?'abgeblendeter Bereich':'abgeblendet');
  el('ray-control').hidden=view==='sensor';
  for(const id of ['room','cut','sensor'])el(id+'-view').setAttribute('aria-pressed',String(view===id));
  el('scene').setAttribute('aria-label',tr(view==='room' ? 'Räumlicher Schnitt mit Lichtwegen und Messpunkt am Auge' : view==='cut' ? 'Schnittansicht' : 'Sensorblick in den vorderen Halbraum mit dem gewählten Winkelbereich'));
  scheduleDraw();
}
function chapterLabels(){
  const story=chapters[chapter];
  el('headline').textContent=tr(story.title);
  el('next-label').textContent=tr(story.next);
  const destination=tr('Weiter zu {name}',{name:tr(chapters[(chapter+1)%chapters.length].nav)});
  el('next').setAttribute('aria-label',destination);
  el('next').title=destination;
  el('prev').disabled=chapter===0;
  Array.from(el('chapter-nav').children).forEach((button,i)=>{
    if(i===chapter)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
  });
  chapters.forEach((item,i)=>{
    if(!item.key)return;
    const available=tr('Einstellbar in Versuch {n} ({name}) und im freien Versuch.',{n:String(i+1).padStart(2,'0'),name:tr(item.nav)});
    if(item.key==='mix'){
      el('mix-availability').textContent=available+' '+tr('Dazu muss das Licht an der Stirnwand eingeschaltet sein.');
    }else{
      el('hint-'+item.key).textContent=available;
    }
  });
  el('help-mix').textContent=tr(chapter===4
    ? 'Hier bleibt die Leuchtdichte der gesamten Decke konstant. Das Fenster oder Wandpanel liefert zusätzlichen Lichtstrom. Schaltest du die Lichtquelle an der Stirnwand aus, entfällt dieser Beitrag.'
    : 'Die Summe der Lichtströme von Deckenpanel und Stirnwand (Fenster oder Wandpanel) bleibt gleich. Schaltest du die Lichtquelle an der Stirnwand aus, übernimmt das Deckenpanel ihren Anteil. Die Beleuchtungsstärke am Auge kann sich dabei ändern.');
  el('hint-source').textContent=tr(chapter===4
    ? 'Der Lichtstrom des Fensters oder Wandpanels fällt jetzt weg. Die Leuchtdichte der Decke bleibt gleich, deshalb sinkt hier der Gesamtlichtstrom.'
    : 'Das Deckenpanel übernimmt jetzt den Anteil des Fensters oder Wandpanels. Der Gesamtlichtstrom im Raum bleibt gleich. Die Beleuchtungsstärke am Auge kann sich dabei ändern.');
}
function go(index,{initial=false}={}) {
  if(index<0||index>=chapters.length)return;
  closeSettingHint();
  clearPlayback();chapter=index;
  const story=chapters[chapter];
  chapterLabels();
  el('indices').open=false;
  refresh();updatePlayButton();
  if(!initial){
    const hash=hashFor(language,index);
    if(location.hash!==hash){try{history.pushState(null,'',hash);}catch{location.hash=hash;}}
    const scroller=pageScroller();
    if(scroller.scrollTop>el('main').offsetTop)scroller.scrollTo(0,0);
    announce(chapter<5?tr('Versuch {n}. {name}',{n:chapter+1,name:tr(story.title)}):tr(story.title));
  }
  updateLinks(chapter,authorVisible);alignNavigation();
}
function alignNavigation(){
  const nav=el('chapter-nav'),active=nav.children[chapter];
  if(active&&nav.scrollWidth>nav.clientWidth){
    nav.scrollLeft+=active.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-active.offsetWidth)/2;
  }
}
function clearPlayback() {
  playState.running=false;playState.finished=false;playState.elapsed=0;
  updatePlayButton();
}
function updatePlayButton() {
  el('play').classList.toggle('playing',playState.running);
  el('play-label').textContent=tr(playState.running ? 'Anhalten' : playState.elapsed&&!playState.finished ? 'Fortsetzen' : playState.finished ? 'Erneut abspielen' : chapter===5 ? 'Lichtweg verfolgen' : 'Versuch abspielen');
  el('play-status').textContent=playState.finished?tr('Animation beendet.'):!playState.running&&playState.elapsed?tr('Animation angehalten.') : '';
}
function playDuration(){return chapter===0?7800:chapter===1?11800:chapter===5?6000:8500;}
function playbackTime(t){
  // A queued frame can be timestamped just before Play or Resume was pressed.
  return Math.min(playDuration(),Math.max(playState.elapsed,t-playState.start));
}
function tickExperiment(t) {
  if(!playState.running)return;
  const elapsed=playbackTime(t);
  playState.elapsed=elapsed;
  const fraction=elapsed/playDuration();
  let changed=false;
  if(chapter===0){
    const step=Math.min(availableMasks.length-1,Math.floor(fraction*availableMasks.length));
    const next=availableMasks[step];
    if(current().mask!==next){current().mask=next;if(next)current().comparison=next;changed=true;}
  }else if(chapter===1){
    // Erst den Sitzplatz verlagern, dann am selben Platz nach unten und oben schauen.
    const progress=within((fraction-.03)/.43,0,1);
    const seat=Math.round(ranges.eye*(preference.matches?Math.round(progress*4)/4:progress));
    const ease=n=>(1-Math.cos(Math.PI*within(n,0,1)))/2;
    const nod=fraction<.73?-35*ease((fraction-.49)/.19): -35+60*ease((fraction-.74)/.23);
    const tilt=preference.matches?(fraction<.58?0:fraction<.83?-35:25):5*Math.round(nod/5);
    if(current().eye!==seat||current().tilt!==tilt){current().eye=seat;current().tilt=tilt;changed=true;}
  }else if(chapter<5){
    const key=chapters[chapter].key,max=ranges[key];
    const sequence=preference.matches ? Math.round(fraction*4)/4 : Math.max(0,Math.min(1,(fraction-.08)/.84));
    const next=Math.round(sequence*max);
    if(current()[key]!==next){current()[key]=next;changed=true;}
  }
  if(changed)refresh();
  if(fraction>=1){playState.running=false;playState.finished=true;updatePlayButton();announce(tr('Animation beendet.')+' '+spokenResult());}
}
function togglePlay(){
  if(playState.running){playState.elapsed=playbackTime(performance.now());playState.running=false;}
  else {
    if(playState.finished)playState.elapsed=0;
    if(chapter===5){
      if(view==='sensor')markView('room');
      showRays=true;el('rays').checked=true;syncLegend();
    }
    playState.finished=false;playState.start=performance.now()-playState.elapsed;playState.running=true;
    const board=el('scene').getBoundingClientRect();
    const inset=matchMedia('(max-width:740px)').matches?el('result-section').offsetHeight+15:12;
    const scroller=pageScroller();
    if(board.bottom<inset+110||board.top>scroller.clientHeight-100)scroller.scrollBy(0,board.top-inset-45);
  }
  updatePlayButton();scheduleDraw();
}
const dialog=el('info-dialog');
const infoTabs=[...dialog.querySelectorAll('[data-pane]')];
let infoTopic='model';
function pane(which){
  infoTopic=which;
  for(const tab of infoTabs){
    const selected=tab.dataset.pane===which;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
  }
  dialog.querySelectorAll('[data-content]').forEach(panel=>{panel.hidden=panel.dataset.content!==which;});
  dialog.scrollTop=0;
}
function openInfo(){
  if(playState.running)togglePlay();
  pane(infoTopic);
  if(!dialog.open)dialog.showModal();
  el('tab-'+infoTopic).focus({preventScroll:true});
}
