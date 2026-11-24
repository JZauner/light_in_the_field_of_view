'use strict';
const chapterPaths={
  en:['measurement','seating-position','light-distribution','panel-position','room-size','open-lab'],
  de:['messprinzip','sitzposition','lichtverteilung','leuchtenposition','raumgroesse','freier-versuch']
};
const guidePaths={
  en:{home:'intro',eyes:'eyes',meter:'meter'},
  de:{home:'einstieg',eyes:'augen',meter:'messgeraet'}
};
const introSequence = [
  ['eyes',0], ['eyes',1], ['eyes',2], ['meter',0], ['meter',1], ['eyes',3], ['eyes',4], ['eyes',5]
];
// Old links to a retired slide lead to the surviving step about the same topic.
const legacySteps = {eyes:[1,2,3,6,7], meter:[4,4,2,6,5]};
function guideHash(lang,step=0){
  return '#'+lang+'/'+guidePaths[lang].home+(step>0?'/'+(step+1):'');
}
function readRoute(){
  const parts=location.hash.slice(1).toLowerCase().split('/').filter(Boolean);
  const query=new URLSearchParams(location.search).get('lang');
  const prefix=parts[0]==='en'||parts[0]==='de'?parts.shift():null;
  const oldGermanLink=parts[0]==='autor'||parts[0]===guidePaths.de.home||chapterPaths.de.includes(parts[0]);
  const language=prefix||(query==='de'||query==='en'?query:oldGermanLink?'de':'en');
  const edition=document.body.dataset.edition;
  const introURL=parts[0]===guidePaths.en.home||parts[0]===guidePaths.de.home;
  if(edition==='intro'||(edition!=='author'&&(introURL||!location.hash))){
    const oldGuide=introURL&&['eyes','meter'].find(key=>Object.values(guidePaths).some(paths=>paths[key]===parts[1]));
    const count=oldGuide?legacySteps[oldGuide].length:introSequence.length;
    const n=Number(parts[oldGuide?2:1]);
    const position=Number.isSafeInteger(n)?Math.max(1,Math.min(count,n)):1;
    const step=(oldGuide?legacySteps[oldGuide][position-1]:position)-1;
    return {language,chapter:0,author:false,guide:{step,legacy:Boolean(oldGuide)}};
  }
  const explicitAuthor=parts[0]==='author'||parts[0]==='autor';
  if(explicitAuthor)parts.shift();
  const section=parts[0]||'';
  const chapter=Math.max(0,chapterPaths.en.indexOf(section),chapterPaths.de.indexOf(section));
  const offerTour=!explicitAuthor&&section==='quick-tour'&&parts.length===1;
  return {language,chapter,author:explicitAuthor||document.body.dataset.edition==='author',offerTour};
}
let language=readRoute().language;
let locale,numberFormat;
function tr(german,parameters){
  const text=language==='de'?german:(uiCopy[german]??german);
  if(!parameters)return text;
  return text.replace(/\{(\w+)\}/g,(match,key)=>parameters[key]??match);
}
function percentText(value){return String(value)+(language==='de'?' %':'%');}
function hashFor(lang,index=0,author=false){
  const pieces=[lang];
  if(author)pieces.push(lang==='de'?'autor':'author');
  if(index>0)pieces.push(chapterPaths[lang][index]);
  return '#'+pieces.join('/');
}
function applyLocale(next){
  language=next;locale=next==='en'?'en-GB':'de-DE';
  numberFormat=new Intl.NumberFormat(locale,{maximumFractionDigits:2});
  document.documentElement.lang=next;
  for(const element of document.querySelectorAll('[data-copy]')){
    for(const part of element.dataset.copy.split(' ')){
      const [field,id]=part.split('='),key=staticKeys[id],value=tr(key);
      if(field==='t'||/^p\d+$/.test(field)){
        const node=field==='t'?element.firstChild:element.children[Number(field.slice(1))]?.nextSibling;
        if(node?.nodeType===Node.TEXT_NODE){
          const original=node.data,lead=original.match(/^\s*/)[0],tail=original.match(/\s*$/)[0];
          node.data=lead+value+tail;
        }
      }else element.setAttribute(field,value);
    }
  }
}
function updateLinks(index,author,guide=null){
  const edition=document.body.dataset.edition,authorFile=edition==='author';
  for(const anchor of document.querySelectorAll('[data-language]')){
    const lang=anchor.dataset.language;
    anchor.setAttribute('href',guide?guideHash(lang,guide.step):hashFor(lang,index,author&&!authorFile));
    if(lang===language)anchor.setAttribute('aria-current','true');else anchor.removeAttribute('aria-current');
  }
  for(const anchor of document.querySelectorAll('[data-author-link]'))
    anchor.setAttribute('href',edition==='single'?hashFor(language,index,true):'author.html'+hashFor(language,index));
  for(const anchor of document.querySelectorAll('[data-back-link]'))
    anchor.setAttribute('href',(authorFile?'index.html':'')+hashFor(language,index));
  for(const anchor of document.querySelectorAll('[data-intro-home]')){
    anchor.setAttribute('href',guideHash(language));
    anchor.title=language==='de'?'Geführte Einführung':'Guided introduction';
    if(anchor.hasAttribute('data-intro-label'))anchor.textContent=anchor.title;
    if(anchor.classList.contains('intro-menu-link')){
      anchor.textContent=language==='de'?'Einführung':'Introduction';
      anchor.hidden=Boolean(guide||author);
    }
  }
  const skip=document.querySelector('.skip');
  skip.href=guide?'#guide-title':author?'#author-bio':'#main';
  skip.textContent=guide?(language==='de'?'Zur Einführung springen':'Skip to introduction'):tr(author?'Zur Kurzbiografie springen':'Zum Versuch springen');
  if(guide){
    const name=language==='de'?'Einführung':'Introduction';
    document.title=name+' · '+tr('Licht im Gesichtsfeld');
  }else document.title=tr(author?'Autor · Licht im Gesichtsfeld':'Licht im Gesichtsfeld · Interaktives Raummodell');
}
function authorOnly(){
  function show(){const route=readRoute();applyLocale(route.language);updateLinks(route.chapter,true);}
  document.querySelector('.skip').addEventListener('click',event=>{
    event.preventDefault();document.getElementById('author-bio').focus();
  });
  show();window.addEventListener('hashchange',show);
}
if(document.body.dataset.edition==='author')authorOnly();
else{
  const first=readRoute();
  applyLocale(first.language);updateLinks(first.chapter,first.author,first.guide);
  if(document.body.dataset.edition!=='intro'){
    const hideExperiments=Boolean(first.author||first.guide);
    document.getElementById('main').hidden=hideExperiments;
    document.querySelector('.nav-wrap').hidden=hideExperiments;
    document.getElementById('author-page').hidden=!first.author;
    document.body.classList.toggle('show-author',first.author);
  }
}
