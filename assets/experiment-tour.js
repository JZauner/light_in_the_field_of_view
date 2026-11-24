/* Optional walkthrough of the live experiment interface. */
function createExperimentTour() {
  const steps = [
    ['chapters', '#chapter-nav'],
    ['views', '.board'],
    ['hood', '[data-setting="mask"]'],
    ['reading', '#result-section'],
    ['settings', '[data-setting="tilt"]'],
    ['variables', '#settings > .parameter-set:nth-child(2)'],
    ['playback', '.scene-play']
  ];
  const words = {
    en: {
      invitation: 'Take a quick tour?', offer: 'Change the room and the reader’s gaze to see how much light reaches the eye compared with a standard open-sensor measurement. The tour shows you the views, settings and readings.',
      start: 'Start tour', skip: 'Skip tour', reopen: 'Quick tour', exit: 'End tour',
      back: 'Back', next: 'Next', done: 'Finish', count: (n, total) => `Step ${n} of ${total}`,
      chapters: ['Choose an experiment', 'Each tab explores one question about light at the eye. In Open lab you can combine the room settings yourself.'],
      views: ['Three views of the room', ''],
      viewNotes: {
        room:['Room view','Trace light from the lamp or window to the reader.'],
        cut:['Section view','See from the side how steeply each ray reaches the eye.'],
        sensor:['Sensor view','Look out from the eye. The centre is straight ahead.']
      },
      pauseViews:'Pause views', resumeViews:'Play views', nextView:'Next view',
      hood: ['Compare an open sensor with a covered one', 'Open collects light from every direction in front of the sensor. Choose Radiance hood to fit a cover that blocks light arriving from outside the modelled visual field.'],
      reading: ['Read the result', 'The two values in lux (lx) show how much light reaches the open sensor and how much gets through the cover at the same position and gaze. The percentage tells you the share that gets through. 50% means half.'],
      openReading: 'With Open selected, the large number gives the uncovered sensor’s reading in lux (lx). Compare the two smaller readings to see how much light gets through with a cover fitted at the same position and gaze.',
      zeroReading: 'Both readings are zero lux here. The open reading is the reference for the percentage. When it is zero, no percentage can be calculated.',
      settings: ['Change the direction of gaze', 'Move the Gaze angle slider and watch the result.'],
      variables: ['Explore the room settings', 'Different experiments unlock different settings, from seat position to room size. A lock shows which ones are fixed for this experiment. In Open lab you can combine them yourself.'],
      playback: ['Watch the experiment run', 'Play experiment moves a setting for you. Follow the light paths and the reading as it changes. The arrows take you to the neighbouring experiments.'],
      disabledPlayback: 'Turn on a light source at the front wall to enable playback in this experiment. The arrows take you to the neighbouring experiments.',
      lab: ['Follow one light path', 'In Open lab, the play button traces light through the room. Change a setting to compare what reaches the eye, or use the arrows to return to a guided experiment.']
    },
    de: {
      invitation: 'Lust auf einen kurzen Rundgang?', offer: 'Verändere den Raum und die Blickrichtung und vergleiche das Licht am Auge mit einer Standardmessung am offenen Sensor. Der Rundgang zeigt dir die Ansichten, Einstellungen und Messwerte.',
      start: 'Rundgang starten', skip: 'Überspringen', reopen: 'Rundgang', exit: 'Beenden',
      back: 'Zurück', next: 'Weiter', done: 'Fertig', count: (n, total) => `Schritt ${n} von ${total}`,
      chapters: ['Einen Versuch auswählen', 'Jeder Reiter geht einer Frage zum Licht am Auge nach. Im freien Versuch kannst du die Raumeinstellungen selbst kombinieren.'],
      views: ['Drei Ansichten des Raums', ''],
      viewNotes: {
        room:['Raumansicht','Verfolge das Licht von der Leuchte oder vom Fenster bis zur Person.'],
        cut:['Schnittansicht','Sieh von der Seite, wie steil die Strahlen am Auge eintreffen.'],
        sensor:['Sensorblick','Schau vom Auge aus in den Raum. Die Mitte liegt in Blickrichtung.']
      },
      pauseViews:'Wechsel anhalten', resumeViews:'Wechsel starten', nextView:'Nächste Ansicht',
      hood: ['Offen und mit Blende messen', 'Der offene Sensor erfasst Licht aus allen Richtungen vor seiner Messfläche. Mit „Blende“ setzt du eine Gesichtsfeldblende auf. Sie hält Licht von außerhalb des dargestellten Gesichtsfelds ab.'],
      reading: ['Den Messwert lesen', 'Vergleiche die beiden Luxwerte bei gleichem Sitzplatz und gleicher Blickrichtung. Mit Blende zeigt die große Prozentzahl, wie viel vom offenen Messwert übrig bleibt. 50 % bedeutet die Hälfte.'],
      openReading: 'Bei „Offen“ zeigt die große Zahl den Messwert des offenen Sensors in Lux (lx). An den beiden kleineren Messwerten siehst du, wie viel Licht bei gleichem Sitzplatz und gleicher Blickrichtung mit dem Aufsatz ankommt.',
      zeroReading: 'Beide Messwerte liegen hier bei null Lux. Für die Prozentangabe dient der offene Messwert als Bezugsgröße. Bei null Lux lässt sich kein Prozentwert berechnen.',
      settings: ['Die Blickrichtung ändern', 'Verschiebe den Regler für die Blickneigung und beobachte den Messwert.'],
      variables: ['Die Raumeinstellungen erkunden', 'Je nach Versuch kannst du andere Größen verändern, vom Sitzplatz bis zur Raumgröße. Ein Schloss zeigt, welche Einstellungen im jeweiligen Versuch feststehen. Im freien Versuch kannst du sie selbst kombinieren.'],
      playback: ['Einen Versuch abspielen', 'Mit „Versuch abspielen“ bewegt sich eine Einstellung von selbst. Verfolge dabei Lichtwege und Messwert. Die Pfeile führen zum vorherigen oder nächsten Versuch.'],
      disabledPlayback: 'Schalte eine Lichtquelle an der Stirnwand ein, um diesen Versuch abzuspielen. Die Pfeile führen zum vorherigen oder nächsten Versuch.',
      lab: ['Einen Lichtweg verfolgen', 'Im freien Versuch kannst du einen Lichtweg durch den Raum verfolgen. Ändere eine Einstellung und vergleiche den Messwert. Mit den Pfeilen wechselst du zu den geführten Versuchen.']
    }
  };
  const intro = document.querySelector('#main .intro');
  intro.insertAdjacentHTML('beforeend', `<button type="button" id="tour-reopen" class="tour-link" hidden aria-haspopup="dialog" aria-controls="experiment-tour"></button>`);
  document.body.insertAdjacentHTML('beforeend', `<dialog id="tour-invite" class="tour-invite" aria-labelledby="tour-invite-title" aria-describedby="tour-offer">
      <h2 id="tour-invite-title"></h2><p id="tour-offer"></p>
      <div class="tour-actions"><button type="button" id="tour-start" class="tour-primary" autofocus aria-haspopup="dialog" aria-controls="experiment-tour"></button>
      <button type="button" id="tour-skip" class="tour-link"></button></div>
    </dialog>`);
  document.body.insertAdjacentHTML('beforeend', `<dialog id="experiment-tour" class="tour-dialog" aria-labelledby="tour-step tour-title" aria-describedby="tour-description">
    <div class="tour-spot" aria-hidden="true"></div>
    <section class="tour-card">
      <div class="tour-card-top"><p id="tour-step"></p><button type="button" id="tour-exit" class="tour-link"></button></div>
      <h2 id="tour-title" tabindex="-1" aria-describedby="tour-step tour-description"></h2><p id="tour-description"></p>
      <div id="tour-views" hidden><dl id="tour-view-notes"></dl><div class="tour-view-actions">
        <button type="button" id="tour-cycle" class="tour-secondary"></button><button type="button" id="tour-change-view" class="tour-link"></button>
      </div></div>
      <div class="tour-actions"><button type="button" id="tour-back" class="tour-secondary"></button><button type="button" id="tour-next" class="tour-primary"></button></div>
    </section></dialog>`);
  const tour = el('experiment-tour'), card = tour.querySelector('.tour-card'), spot = tour.querySelector('.tour-spot');
  const invite = el('tour-invite'), reopen = el('tour-reopen'), title = el('tour-title');
  const key = 'light-field.experiment-tour.v1';
  let seen = false, index = 0, lang = language, originalScroll = 0, frame = 0;
  try { seen = localStorage.getItem(key) === 'seen'; } catch { /* Keep the choice for this visit. */ }

  const viewOrder=['room','cut','sensor'];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let previousView=null, viewTimer=0, cycling=false;

  function syncViewPreview() {
    clearTimeout(viewTimer);
    if(previousView===null)return;
    const copy=words[lang];
    for(const row of el('tour-view-notes').children)
      row.classList.toggle('current-view',row.dataset.view===view);
    el('tour-cycle').textContent=cycling?copy.pauseViews:copy.resumeViews;
    el('tour-change-view').textContent=copy.nextView;
    if(cycling&&!document.hidden) viewTimer=setTimeout(nextView,2000);
  }
  function nextView() {
    if(previousView===null)return;
    markView(viewOrder[(viewOrder.indexOf(view)+1)%viewOrder.length]);
    syncViewPreview();
  }
  function endViewPreview() {
    clearTimeout(viewTimer);cycling=false;
    if(previousView!==null){markView(previousView);previousView=null;}
    el('tour-views').hidden=true;
    document.documentElement.classList.remove('tour-show-views');
    el('drawing').style.removeProperty('--tour-drawing-space');
  }
  function startViewPreview() {
    previousView=view;
    cycling=!motion.matches;
    el('tour-view-notes').innerHTML=viewOrder.map(id=>{
      const [label,summary]=words[lang].viewNotes[id];
      return '<div data-view="'+id+'"><dt>'+label+'</dt><dd>'+summary+'</dd></div>';
    }).join('');
    el('tour-views').hidden=false;
    document.documentElement.classList.add('tour-show-views');
    markView('room');
    syncViewPreview();
  }

  function rememberChoice() {
    seen = true;
    try { localStorage.setItem(key,'seen'); } catch { /* File or private browsing can restrict storage. */ }
    if(invite.open)invite.close();
    reopen.hidden = false;
  }

  function bounds() {
    const [name, selector] = steps[index];
    const target = document.querySelector(selector);
    if(name==='views'){
      const top=target.querySelector('.board-top').getBoundingClientRect(), drawing=el('drawing').getBoundingClientRect();
      return {left:top.left,right:top.right,top:top.top,bottom:drawing.bottom,width:top.width,height:drawing.bottom-top.top};
    }
    if(name==='variables' && target.offsetHeight+card.offsetHeight+50>tour.clientHeight)
      return target.firstElementChild.getBoundingClientRect();
    if (name !== 'reading') return target.getBoundingClientRect();
    // Keep the two readings and the percentage together, even in the mobile layout.
    const rect = target.getBoundingClientRect();
    const end = target.querySelector('.index-pair').getBoundingClientRect().bottom;
    return {left: rect.left, right: rect.right, top: rect.top, bottom: end, width: rect.width, height: end - rect.top};
  }

  function position(revealTarget) {
    if (!tour.open) return;
    const vw = tour.clientWidth, vh = tour.clientHeight, pad = 12, gap = 14;
    const cardWidth = card.offsetWidth, cardHeight = card.offsetHeight;
    const head = document.documentElement.classList.contains('presentation') ? document.querySelector('.site-head') : null;
    const safeTop = head ? Math.max(pad, head.getBoundingClientRect().bottom + 5) : pad;
    const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
    let box = bounds();
    if(steps[index][0]==='views'){
      const beside=Math.max(box.left,vw-box.right)>cardWidth+pad+gap;
      const drawing=el('drawing'),toolbar=drawing.getBoundingClientRect().top-box.top;
      const available=Math.max(96,vh-safeTop-pad-gap-toolbar-cardHeight-14);
      if(beside)drawing.style.removeProperty('--tour-drawing-space');
      else drawing.style.setProperty('--tour-drawing-space',available+'px');
      box=bounds();
    }
    if (revealTarget) {
      const beside = Math.max(box.left, vw - box.right) > cardWidth + pad + gap;
      const verticalRoom = vh - safeTop - pad - box.height;
      const fits = box.top >= safeTop + 3 && box.bottom <= vh - pad &&
        (beside || box.top - safeTop > cardHeight + gap || vh - pad - box.bottom > cardHeight + gap);
      if (!fits) {
        const inset = Math.max(4, (verticalRoom - (beside ? 0 : cardHeight + gap)) / 2);
        const scroller = pageScroller();
        scroller.scrollTo({top: scroller.scrollTop + box.top - safeTop - inset, behavior:'instant'});
        box = bounds();
      }
    }
    const left = clamp(box.left - 4, 2, vw - 3), right = clamp(box.right + 4, left + 1, vw - 2);
    const top = clamp(box.top - 4, 2, vh - 3), bottom = clamp(box.bottom + 4, top + 1, vh - 2);
    Object.assign(spot.style,{left:left+'px', top:top+'px', width:(right-left)+'px', height:(bottom-top)+'px'});
    let x = (left + right - cardWidth)/2, y = (top + bottom - cardHeight)/2;
    if (right + gap + cardWidth <= vw - pad) x = right + gap;
    else if (left - gap - cardWidth >= pad) x = left - cardWidth - gap;
    else if (bottom + gap + cardHeight <= vh - pad) y = bottom + gap;
    else if (top - gap - cardHeight >= pad) y = top - gap - cardHeight;
    else y = vh - bottom >= top ? vh - pad - cardHeight : pad;
    card.style.left = clamp(x, pad, vw - cardWidth - pad)+'px';
    card.style.top = clamp(y, pad, vh - cardHeight - pad)+'px';
  }

  function requestPosition() {
    if (!tour.open || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; position(false); });
  }
  const observer = window.ResizeObserver && new ResizeObserver(requestPosition);

  function showStep(next) {
    endViewPreview();
    index = next;
    const copy = words[lang], [name, selector] = steps[index];
    const [heading, body] = copy[name === 'playback' && chapter === 5 ? 'lab' : name];
    el('tour-step').textContent = copy.count(index + 1, steps.length);
    title.textContent = heading;
    let description = body;
    if (name === 'reading') {
      if (el('percent').classList.contains('verbal')) description = copy.zeroReading;
      else if (current().mask === 0) description = copy.openReading;
    } else if (name === 'playback' && el('play').disabled) description = copy.disabledPlayback;
    el('tour-description').textContent = description;
    title.setAttribute('aria-describedby',name==='views'?'tour-step tour-view-notes':'tour-step tour-description');
    tour.setAttribute('aria-describedby',name==='views'?'tour-view-notes':'tour-description');
    el('tour-exit').textContent = copy.exit;
    el('tour-back').textContent = copy.back;
    el('tour-back').disabled = index === 0;
    el('tour-next').textContent = index === steps.length - 1 ? copy.done : copy.next;
    if(name==='views')startViewPreview();
    observer?.disconnect();
    observer?.observe(card);
    observer?.observe(document.querySelector(selector));
    position(true);
    title.focus({preventScroll:true});
  }

  function open() {
    if (tour.open || el('main').hidden) return;
    if (playState.running) togglePlay();
    originalScroll = pageScroller().scrollTop;
    rememberChoice();
    document.documentElement.classList.add('tour-active');
    tour.showModal();
    showStep(0);
  }

  function close(restore = true) {
    if (!tour.open) return;
    endViewPreview();
    observer?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    tour.close();
    document.documentElement.classList.remove('tour-active');
    if (restore) {
      pageScroller().scrollTo({top:originalScroll,behavior:'instant'});
      reopen.focus({preventScroll:true});
    }
  }

  function onRoute(visible, nextLang, offerTour=false) {
    lang = nextLang;
    if (!visible) { if(invite.open)invite.close(); close(false); return; }
    const copy = words[lang];
    el('tour-invite-title').textContent = copy.invitation;
    el('tour-offer').textContent = copy.offer;
    el('tour-start').textContent = copy.start;
    el('tour-skip').textContent = copy.skip;
    reopen.textContent = copy.reopen;
    reopen.hidden = !seen;
    if((offerTour||!seen)&&!invite.open&&!tour.open)invite.showModal();
    if (tour.open) showStep(index);
  }

  reopen.addEventListener('click', open);
  el('tour-start').addEventListener('click', open);
  function skipInvite(){rememberChoice();reopen.focus({preventScroll:true});}
  el('tour-skip').addEventListener('click',skipInvite);
  invite.addEventListener('cancel',event=>{event.preventDefault();skipInvite();});
  el('tour-cycle').addEventListener('click',()=>{cycling=!cycling;syncViewPreview();});
  el('tour-change-view').addEventListener('click',()=>{cycling=false;nextView();});
  document.addEventListener('visibilitychange',syncViewPreview);
  motion.addEventListener('change',()=>{if(motion.matches){cycling=false;syncViewPreview();}});
  el('tour-exit').addEventListener('click', () => close());
  el('tour-back').addEventListener('click', () => showStep(index - 1));
  const advance = () => index === steps.length - 1 ? close() : showStep(index + 1);
  el('tour-next').addEventListener('click', advance);
  tour.addEventListener('cancel', event => { event.preventDefault(); close(); });
  tour.addEventListener('keydown', event => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); event.stopPropagation();
      if (event.key === 'ArrowRight') advance();
      else if (index > 0) showStep(index - 1);
    } else if (event.key === 'Tab') {
      const first = el('tour-exit'), last = el('tour-next');
      if (event.shiftKey && (document.activeElement === first || document.activeElement === title)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  window.addEventListener('scroll',requestPosition,true);
  window.addEventListener('resize',() => { if (tour.open) position(true); });
  document.addEventListener('fullscreenchange', () => { if (tour.open) position(true); });
  return {onRoute, isOpen: () => invite.open || tour.open};
}
