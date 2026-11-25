'use strict';
el('room-view').addEventListener('click',()=>markView('room'));
el('cut-view').addEventListener('click',()=>markView('cut'));
el('sensor-view').addEventListener('click',()=>markView('sensor'));
el('lens').addEventListener('click',()=>{markView('sensor');el('sensor-view').focus();});
el('probe-angle').addEventListener('input',()=>{clearPlayback();probeAngle=Number(el('probe-angle').value);updateProbe();scheduleDraw();});
el('rays').addEventListener('change',()=>{showRays=el('rays').checked;if(chapter===5&&!showRays)clearPlayback();syncLegend();scheduleDraw();});
dialog.addEventListener('close',scheduleDraw);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleDraw();});
if(preference.addEventListener)preference.addEventListener('change',scheduleDraw);
el('show-info').addEventListener('click',openInfo);
el('close-dialog').addEventListener('click',()=>dialog.close());
dialog.querySelector('[data-intro-home]').addEventListener('click',()=>dialog.close());
for(const tab of infoTabs){
  tab.addEventListener('click',()=>pane(tab.dataset.pane));
  tab.addEventListener('keydown',event=>{
    const index=infoTabs.indexOf(tab),count=infoTabs.length;
    const targets={ArrowLeft:(index+count-1)%count,ArrowRight:(index+1)%count,Home:0,End:count-1};
    if(!Object.hasOwn(targets,event.key))return;
    event.preventDefault();
    const next=infoTabs[targets[event.key]];pane(next.dataset.pane);next.focus();
  });
}
// Use the same biography on the bookmarkable author page and in the overview.
for(const source of el('author-page').querySelectorAll('article > p, article > .author-study')){
  const paragraph=source.cloneNode(true);
  paragraph.removeAttribute('id');paragraph.removeAttribute('tabindex');
  el('info-biography').append(paragraph);
}
dialog.addEventListener('click',ev=>{if(ev.target!==dialog)return;const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();});
function saveSource(text,name){
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
let localSourcesRequest;
function getLocalSources(){
  if(!localSourcesRequest){
    const script=document.createElement('script');
    localSourcesRequest=new Promise((resolve,reject)=>{
      script.src='assets/model/local-downloads.js';
      script.onload=()=>resolve(globalThis.lightModelSources);
      script.onerror=()=>reject(new Error('Source download'));
      document.head.append(script);
    }).finally(()=>script.remove()).catch(error=>{localSourcesRequest=null;throw error;});
  }
  return localSourcesRequest;
}
function enableDownload(buttonId,sourceId,name){
  const embedded=el(sourceId),button=el(buttonId);
  if(!embedded&&location.protocol!=='file:')return;
  button.addEventListener('click',async event=>{
    if(!embedded&&(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return;
    event.preventDefault();
    try{
      const source=embedded?embedded.textContent:(await getLocalSources())[name];
      saveSource(source,name);
    }catch{if(button.href)location.assign(button.href);}
  });
}
enableDownload('download-r','model-source','modell.R');
enableDownload('download-check','validation-source','pfadpruefung.R');

const referenceInput=el('reference-lux');
referenceInput.value=String(referenceLux);
referenceInput.addEventListener('input',()=>{
  const next=referenceInput.valueAsNumber,valid=next>0&&Number.isFinite(next*100);
  referenceInput.setAttribute('aria-invalid',String(!valid));
  el('reference-error').hidden=valid;
  if(valid){referenceLux=next;refresh();}
});
referenceInput.addEventListener('blur',()=>{
  if(referenceInput.getAttribute('aria-invalid')==='true'){
    referenceInput.value=String(referenceLux);referenceInput.removeAttribute('aria-invalid');
    el('reference-error').hidden=true;announce(tr('Referenz {value} lx.',{value:formatValue(referenceLux,15)}));
  }
});
referenceInput.addEventListener('keydown',e=>{if(e.key==='Enter')referenceInput.blur();});
el('play').addEventListener('click',togglePlay);
el('prev').addEventListener('click',()=>go(chapter-1));
el('next').addEventListener('click',()=>go((chapter+1)%chapters.length));
el('reset').addEventListener('click',()=>{
  clearPlayback();Object.assign(current(),presets[chapter]);if(chapter===0)probeAngle=60;
  if(chapter===5)saved=null;
  refresh();announce(tr('Versuch zurückgesetzt.')+' '+spokenResult());
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playState.running)togglePlay();});
const experimentTour=createExperimentTour();
document.addEventListener('keydown',ev=>{
  if(el('main').hidden||dialog.open||experimentTour.isOpen()||ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.target.closest('input,select,textarea,summary,[role="slider"]'))return;
  if(ev.key==='ArrowRight'&&chapter<5){ev.preventDefault();go(chapter+1);}
  if(ev.key==='ArrowLeft'&&chapter>0){ev.preventDefault();go(chapter-1);}
});
function refreshLanguage(){
  clearTimeout(announceTimer);el('announcement').textContent='';
  buildNavigation();
  for(const key of materialKeys){
    const select=el('rho-'+key);
    select.parentElement.firstChild.textContent=tr(surfaceNames[key]);
    Array.from(select.options).forEach((o,i)=>o.textContent=percentText(data.materials[key][i]));
  }
  nameDaylight();chapterLabels();refresh();markView(view);updatePlayButton();syncFullscreen();
}
let authorVisible=false,demoStarted=false,demoLanguage=language;
function displayRoute(first=false){
  const route=readRoute(),changed=language!==route.language,wasAuthor=authorVisible;
  const wasGuide=!el('guide-page').hidden;
  if(changed)applyLocale(route.language);
  authorVisible=route.author;
  const hideExperiments=Boolean(route.author||route.guide);
  el('main').hidden=hideExperiments;
  document.querySelector('.nav-wrap').hidden=hideExperiments;
  el('author-page').hidden=!route.author;
  document.body.classList.toggle('show-author',route.author);
  if(hideExperiments){
    experimentTour.onRoute(false,language);
    if(playState.running)togglePlay();
    if(dialog.open)dialog.close();
    if(route.guide){
      introShell.show(route.guide,!first);syncFullscreen();return;
    }
    introShell.hide();
    if(!first&&!wasAuthor){pageScroller().scrollTo(0,0);el('author-bio').focus({preventScroll:true});}
  }else{
    introShell.hide();
    const entering=!demoStarted||wasAuthor||wasGuide;
    if(entering||chapter!==route.chapter)go(route.chapter,{initial:true});
    if(changed||demoLanguage!==language)refreshLanguage();
    else if(entering)markView(view);
    demoStarted=true;demoLanguage=language;
    if(!first&&(wasAuthor||wasGuide)){pageScroller().scrollTo(0,0);el('headline').focus({preventScroll:true});}
    experimentTour.onRoute(true,language,route.offerTour);
    if(route.offerTour)history.replaceState(history.state,'',hashFor(language));
  }
  syncFullscreen();updateLinks(route.chapter,route.author);
}
window.removeEventListener('hashchange',onGuideHashChange);
window.addEventListener('hashchange',()=>displayRoute());
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();const target=el(!el('guide-page').hidden?'guide-title':authorVisible?'author-bio':'headline');target.focus();
});
buildNavigation();installSettings();reflectionControls();drawLogo();installDragging();
el('retry-data').addEventListener('click',()=>refresh());
displayRoute(true);
installIntroPreload();

if(window.ResizeObserver){
  new ResizeObserver(scheduleDraw).observe(el('drawing'));
  new ResizeObserver(alignNavigation).observe(el('chapter-nav'));
}else window.addEventListener('resize',()=>{scheduleDraw();alignNavigation();});
if(document.fonts)document.fonts.ready.then(scheduleDraw);
