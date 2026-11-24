(function () {
  'use strict';

  const words = {
    en: {
      steps: ['The receiving surface', 'Move the light'],
      titles: ['How does the angle change the sensor reading?', 'When does the light reach the eye?'],
      paragraphs: [
        ['Take a closer look at the white sensor. At 0° the lamp shines straight onto it. Move the lamp with the slider. The beam stays the same width, but its light spreads over a larger area as it tilts.', 'Use the head-on reading as 100%. As the angle increases, the illuminance from this beam falls with the cosine of the angle. At 60° the reading is half as high. At 90° the rays skim the surface and contribute 0 lx. In a real room, a lamp also sends light in other directions, and surfaces reflect it. Some light can still reach the sensor. The cosine rule applies to each direction.'],
        ['Would the same light reach your eye? Follow the lamp as it moves from above eye level to below it, or choose an angle with the slider. The two drawings show the same lamp position.', 'In the green sector the ray reaches the pupil, the dark opening in the eye. Higher up, the brow blocks it. Farther down, the cheek does. At some angles the open sensor still registers light that the face has already blocked.']
      ],
      figures: ['A lamp swings through a right angle in front of a fixed white sensor. Its parallel beam keeps its width. A bracket on the white sensing surface marks where it receives the beam. At 90 degrees the light travels parallel to the measuring surface.',
        'Matching lamps send rays towards a sensor and an eye. A translucent field centred on the pupil shows an admitted ray reaching it or a blocked ray stopping at the brow or cheek.'],
      captions: ['The amber bracket marks the sensing part of the lux meter. Light that falls on the metal rim does not contribute to the reading.', 'Straight ahead is 0°. In this model the eye admits light from 50° above to 70° below the line of sight. At either 90° endpoint the beam skims the open sensor and contributes 0 lx.'],
      relative:'Relative illuminance', relativeToNormal:'of the head-on illuminance',
      patch:'Measuring patch', footprint:'Illuminated sensing surface', incidenceAngle:'Angle of incidence', admittedRay:'Admitted ray', blockedRay:'Blocked by the face',
      lampAngle:'Lamp angle', lower:'Below', higher:'Above', open:'Open sensor', shield:'At the eye', reaches:'Light reaches the sensor', pupil:'Light reaches the pupil',
      browLabel:'Brow', cheekLabel:'Cheek', brow:'Stopped by the brow', cheek:'Stopped by the cheek', grazing:'Grazing incidence · 0 lx',
      play:'Play', pause:'Pause', replay:'Replay', resume:'Resume', showAngle:'Show {angle}'
    },
    de: {
      steps: ['Die Sensorfläche', 'Die Leuchte bewegen'],
      titles: ['Wie verändert der Winkel den Messwert des Sensors?', 'Wann erreicht das Licht das Auge?'],
      paragraphs: [
        ['Schau dir die weiße Sensorfläche genauer an. Bei 0° trifft das Licht der Leuchte senkrecht auf. Bewege die Leuchte mit dem Regler. Das Lichtbündel bleibt gleich breit. Je schräger es auftrifft, desto größer wird der Lichtfleck.', 'Der Messwert bei senkrechtem Einfall entspricht 100 %. Mit zunehmendem Winkel sinkt die Beleuchtungsstärke nach dem Kosinusgesetz. Bei 60° ist der Messwert halb so groß. Bei 90° laufen die Strahlen parallel zur Sensorfläche und tragen 0 lx bei. In einem echten Raum strahlt eine Leuchte in mehrere Richtungen. Auch reflektiertes Licht kann den Sensor erreichen. Für jede Einfallsrichtung gilt das Kosinusgesetz.'],
        ['Würde dasselbe Licht auch dein Auge erreichen? Folge der Leuchte von oben nach unten oder wähle mit dem Regler einen Winkel. Beide Bilder zeigen dieselbe Leuchtenposition.', 'Im grünen Bereich erreicht der Strahl die Pupille, die dunkle Öffnung im Auge. Weiter oben fängt ihn die Braue ab, weiter unten die Wange. Bei manchen Winkeln erfasst der offene Sensor also noch Licht, das dein Gesicht bereits abschattet.']
      ],
      figures: ['Die Leuchte schwenkt um 90 Grad vor der festen weißen Messfläche. Das parallele Bündel bleibt gleich breit. Eine Klammer zeigt, wo das Licht auf die weiße Messfläche trifft. Bei 90 Grad läuft das Licht parallel zur Messfläche.',
        'Gleiche Leuchten schicken einen Strahl zum Sensor und zum Auge. Das halbtransparente Gesichtsfeld liegt über der Pupille. Ein erfasster Strahl erreicht sie, ein abgeschatteter endet an Braue oder Wange.'],
      captions: ['Die ockerfarbene Klammer markiert die lichtempfindliche Fläche des Luxmeters. Licht auf der Metallfassung trägt nicht zum Messwert bei.', 'Geradeaus entspricht 0°. Im Modell erreicht Licht das Auge aus Richtungen zwischen 50° oberhalb und 70° unterhalb der Blickachse. Bei +90° und −90° streift der Strahl den offenen Sensor und trägt 0 lx bei.'],
      relative:'Relative Beleuchtungsstärke', relativeToNormal:'der Beleuchtungsstärke bei senkrechtem Einfall',
      patch:'Messfläche', footprint:'Beleuchtete Messfläche', incidenceAngle:'Einfallswinkel', admittedRay:'Erfasster Strahl', blockedRay:'Vom Gesicht abgeschattet',
      lampAngle:'Leuchtenwinkel', lower:'Unten', higher:'Oben', open:'Offener Sensor', shield:'Am Auge', reaches:'Licht erreicht den Sensor', pupil:'Licht erreicht die Pupille',
      browLabel:'Braue', cheekLabel:'Wange', brow:'Am Brauenwulst gestoppt', cheek:'An der Wange gestoppt', grazing:'Streifender Einfall · 0 lx',
      play:'Abspielen', pause:'Pause', replay:'Wiederholen', resume:'Fortsetzen', showAngle:'{angle} zeigen'
    }
  };
  const palette={green:'#18705a', blocked:'#a14b36', slate:'#4d6871'};

  // Coordinates below describe drawings, in SVG user units.
  function point(cx, cy, r, degrees) {
    const a = degrees * Math.PI / 180;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  }

  function coord(p) { return p.map(n => n.toFixed(2)).join(' '); }

  function section(cx, cy, r, lo, hi) {
    const low = point(cx, cy, r, lo);
    const high = point(cx, cy, r, hi);
    return 'M' + cx + ' ' + cy + ' L' + coord(low) + ' A' + r + ' ' + r + ' 0 0 0 ' + coord(high) + ' Z';
  }

  function diagram(content, description, viewBox = '0 0 560 320', cssClass = '') {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="mb-svg ' + cssClass + '" viewBox="' + viewBox + '" role="img" aria-label="' + description + '">' + content + '</svg>';
  }

  let artSequence = 0;

  function finishes() {
    const id = 'mb-material-' + (++artSequence) + '-';
    const gradient = (name, colors, vertical = true) =>
      '<linearGradient id="' + id + name + '" x1="0" y1="0" x2="' + (vertical ? '0' : '1') + '" y2="1">' +
      colors.map(([offset,color]) => '<stop offset="' + offset + '%" stop-color="' + color + '"/>').join('') + '</linearGradient>';
    const defs = '<defs>' +
      gradient('case',[[0,'#628673'],[13,'#4c7867'],[70,'#356250'],[100,'#284e40']]) +
      gradient('rubber',[[0,'#3e594d'],[55,'#294a3e'],[100,'#1b362e']]) +
      gradient('lcd',[[0,'#bbc8a5'],[35,'#ecedd4'],[100,'#b8c8a1']],false) +
      gradient('metal',[[0,'#637569'],[20,'#d7e1d0'],[41,'#f0f3e6'],[60,'#a2b7a6'],[100,'#697e70']],false) +
      gradient('opal',[[0,'#e2e5d3'],[27,'#fffef6'],[64,'#fcfcf1'],[100,'#d6dfcd']],false) +
      gradient('temple',[[0,'#f3e3cb'],[62,'#f0d9bf'],[100,'#eac9ab']],false)+
      gradient('sclera',[[0,'#cedace'],[51,'#f1f4e8'],[100,'#f9fbef']],false)+
      gradient('lidshade',[[0,'#db9f78'],[50,'#ae7759'],[100,'#ce946e']],false)+
      gradient('lid',[[0,'#c48c68'],[57,'#e8b38d'],[100,'#daa27a']],false)+
      gradient('iris',[[0,'#4b7864'],[48,'#78a28d'],[100,'#4d7b65']],false)+
      gradient('table',[[0,'#dce3d1'],[74,'#f2edd7'],[100,'#d0dac5']]) +
      gradient('shade',[[0,'#789786'],[48,'#456953'],[100,'#385544']]) +
      '<pattern id="' + id + 'hatch" patternUnits="userSpaceOnUse" width="5" height="5"><path d="m-1 1 2-2m-1 6 5-5m-1 6 2-2" stroke="#833c35" stroke-width="1.1"/></pattern>' +
      '</defs>';
    return {id, defs, fill:name=>'url(#'+id+name+')'};
  }

  // Local origin is the middle of the white diffuser. Every diagram uses this same head.
  function sensorHead(m) {
    return `<g stroke-linecap="round" stroke-linejoin="round">
      <path d="M-17-18C-26-18-29-11-29-1s3 18 12 19h13C5 18 7 8 7 0S4-18-4-18Z" fill="${m.fill('case')}" stroke="#324f42" stroke-width="1.25"/>
      <path d="M-18-16q-9 15 0 32m3-32q-7 15 0 32" fill="none" stroke="#86a18d" stroke-width=".85"/>
      <path d="M-25-8q2-7 8-8h7" fill="none" stroke="#b3c8b1" stroke-width="1.2"/>
      <path d="M-13 8h5" stroke="#9bb49d" stroke-width="1.1"/>
      <path d="M-6-18h4c5 0 9 8 9 18S4 18-2 18h-4c5-4 6-12 6-18s-1-14-6-18Z" fill="${m.fill('metal')}" stroke="#637a6b" stroke-width=".8"/>
      <ellipse cx="0" cy="0" rx="6.15" ry="16.4" fill="#456354" stroke="#354f42" stroke-width=".7"/>
      <ellipse data-open-diffuser cx=".1" cy="0" rx="4.45" ry="13.8" fill="${m.fill('opal')}" stroke="#c5d3c0" stroke-width=".65"/>
      <path d="M-1.2-10.7q-2.6 9-.9 17.2" fill="none" stroke="#fffef8" stroke-width="1.05"/>
      <path d="m-25 4-5-1-5 2v4l5 1 5-2Z" fill="#3d5448" stroke="#304537" stroke-width=".8"/>
      <path d="m-32 4 .3 5m1.8-5 .3 5" stroke="#a3b39f" stroke-width=".85"/>
    </g>`;
  }

  // The centre of the diffuser is (0,0). In this optical section its face is the plane x = 0.
  // At normal incidence the uniform beam covers the full 42-unit measuring patch.
  const beamHalfWidth=21;
  function collectorScene(w) {
    const m=finishes(), x=133,y=146;
    const receiver='<g transform="translate('+x+' '+y+')" stroke-linejoin="round" stroke-linecap="round">'+
      '<path d="M-1-29C-12-31-42-31-54-26c-12 8-14 44 .1 51 13 5 45 5 53 3Z" fill="'+m.fill('case')+'" stroke="#3f5c48" stroke-width="1.35"/>'+
      '<path d="M-46-27c-8 10-9 41-.5 52m6-53c-8 13-7.5 42 .5 54" fill="none" stroke="#86a28c" stroke-width="1.35"/>'+
      '<path d="M-54-18q4.4-7.6 12.5-8.6h16.1" fill="none" stroke="#bbceb3" stroke-width="1.35"/>'+
      '<path d="M-53.4 8-62 6l-8.5 3v7l8.6 2.5 9.3-4.1Z" fill="#47614f" stroke="#36523f" stroke-width="1.05"/>'+
      '<path d="m-68.6 9.5 .2 6.2m4.2-7 .3 8.7" stroke="#9fb29c" stroke-width="1.1"/>'+
      '<path d="M-18.8-29.2h14.5c2.5 0 3.8 1.2 4.3 3.2v51.7c-.5 2.3-1.9 3.9-4.6 4h-14.2c-4.7-9.5-4.7-49 0-58.9Z" fill="'+m.fill('metal')+'" stroke="#667e67" stroke-width="1"/>'+
      '<path data-mb-measuring-patch d="M-10-21H0v42h-10q-5.4-.6-5.4-6.1v-29.8q0-5.6 5.4-6.1Z" fill="'+m.fill('opal')+'" stroke="#8ca48c" stroke-width="1.1"/>'+
      '<path d="M-.55-20.6v41.2" fill="none" stroke="#fffef4" stroke-width="1.8"/>'+
      '<path d="m-34 29 3.3 4.5h10l1-4.5" fill="#688572" stroke="#4e6b56" stroke-width="1"/>'+
      '<path d="M-30 34h7v21h-7Z" fill="'+m.fill('metal')+'" stroke="#728977" stroke-width=".85"/>'+
      '<path d="m-42.4 55 4.5-3.5h22.2l7.2 3.5v3.1l-5.6 2.5h-22.5l-5.8-2.2Z" fill="#98ad95" stroke="#6c8270" stroke-width="1"/>'+
      '<path d="m-39.2 55.4 3.8-2.1h19.4l4.6 2.1-4 1.7h-19.8Z" fill="#dce4cf"/></g>';
    const source='<g data-mb-beam-source stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M0-24h17l8 5.3v37.4L17 24H0Z" fill="'+m.fill('case')+'" stroke="#4d6954" stroke-width="1.2"/>'+
      '<path d="M16-22.9l7.8 4.9v36l-7.8 4.9Z" fill="#5f7a64"/>'+
      '<path d="M4.3-23.5h12v3.2H4.3Z" fill="#8aa18a"/>'+
      '<path data-mb-lamp-opening d="M-1.6 -'+beamHalfWidth+'h3v'+(2*beamHalfWidth)+'h-3Z" fill="#ffe5a2" stroke="#a47a35" stroke-width=".8"/>'+
      '<path d="M8-8.3v16.6m3.5-16.6v16.6" fill="none" stroke="#91a78c" stroke-width="1.2"/></g>';
    const shadow=m.id+'shadow';
    // The beam stops at the housing or the tabletop, 60.3 units below the diffuser.
    const optical='<g transform="translate('+x+' '+y+')" stroke-linejoin="round">'+
      '<defs><mask id="'+shadow+'" maskUnits="userSpaceOnUse" x="-240" y="-190" width="480" height="400" style="mask-type:luminance">'+
      '<rect x="-240" y="-190" width="480" height="250.3" fill="white"/><path data-mb-cast-shadow fill="black"/></mask></defs>'+
      '<g mask="url(#'+shadow+')"><g data-mb-beam-strip>'+
      '<path data-mb-beam-fill d="M-210 -'+beamHalfWidth+'H109v'+(2*beamHalfWidth)+'H-210Z" fill="#eaca7b" fill-opacity=".41"/>'+
      '<path data-mb-beam-rays d="M109 -'+beamHalfWidth+'H-210M109 0H-210M109 '+beamHalfWidth+'H-210" fill="none" stroke="#ae7d36" stroke-width="1.1"/>'+
      '<path d="M58 -3.2 53 0l5 3.2" fill="none" stroke="#94672b" stroke-width="1.6" stroke-linecap="round"/></g></g>'+
      '<path data-mb-footprint fill="none" stroke="#865518" stroke-width="2" stroke-linecap="butt"/>'+
      source+'</g>';
    const sweep='M'+coord(point(x,y,84,0))+'A84 84 0 0 0 '+coord(point(x,y,84,90));
    const ticks=[0,15,30,45,60,75,90].map(angle=>'M'+coord(point(x,y,81,angle))+'L'+coord(point(x,y,87,angle))).join(' ');
    const benchArt='<path d="M22 206.3h277v10H22Z" fill="'+m.fill('table')+'"/><path d="M22 206.3h277" stroke="#a4b59f" stroke-width=".9"/>'+
      '<path d="M'+x+' '+(y+46)+'a46 46 0 0 0 0-92" fill="#dce7d8" fill-opacity=".6" stroke="#a6b9a3" stroke-dasharray="2.3 4" stroke-width=".85"/>'+
      '<path d="M'+(x+53)+' '+y+'h83" fill="none" stroke="#a3b3a1" stroke-dasharray="2.3 4.3" stroke-width="1"/>'+
      '<path d="'+sweep+'" stroke="#b8c5b4" fill="none" stroke-width=".85"/><path data-incidence-ticks d="'+ticks+'" stroke="#8a9d87" fill="none" stroke-width=".95"/>'+
      '<path d="M64 158c-11.5 2-17.7 12.8-18.3 25.4-.7 13.5-2.9 20.1-14.2 21.5" fill="none" stroke="#4a6652" stroke-width="2.45" stroke-linecap="round"/>'+
      receiver+optical;
    const art=diagram(m.defs+benchArt,w.figures[0],'24 3 274 212','mb-incidence-art');
    return '<div class="mb-incidence"><div class="mb-incidence-viewport">'+art+'</div>'+
      '<div class="mb-keys"><span><i class="mb-aperture-key"></i>'+w.patch+'</span><span><i class="mb-footprint-key"></i>'+w.footprint+'</span></div>'+
      '<div class="mb-incidence-controls"><div><label class="mb-angle-control"><span>'+w.incidenceAngle+'</span><strong data-mb-incidence-value aria-hidden="true">0°</strong>'+
      '<input type="range" data-mb-incidence-range min="0" max="90" step="1" value="0" aria-label="'+w.incidenceAngle+'"></label>'+
      '<div class="mb-relative"><span>'+w.relative+'</span><strong data-mb-relative></strong></div></div>'+playbackButton(w,'incidence')+'</div></div>';
  }

  function attachIncidence(host,w,saved,arriving) {
    const range=host.querySelector('[data-mb-incidence-range]'),button=host.querySelector('[data-mb-play="incidence"]');
    const strip=host.querySelector('[data-mb-beam-strip]'),shadow=host.querySelector('[data-mb-cast-shadow]');
    const bracket=host.querySelector('[data-mb-footprint]'),source=host.querySelector('[data-mb-beam-source]'),label=host.querySelector('[data-mb-incidence-value]');
    const relative=host.querySelector('[data-mb-relative]');
    const percent=new Intl.NumberFormat(document.documentElement.lang,{style:'percent',maximumFractionDigits:1});
    function paint(value) {
      const angle=Math.round(value), radians=angle*Math.PI/180, grazing=angle===90;
      const c=grazing?0:Math.cos(radians), s=Math.sin(radians);
      const rotate='rotate('+(-angle)+')';
      strip.setAttribute('transform',rotate);
      source.setAttribute('transform',rotate+' translate(109 0)');
      shadow.setAttribute('d','M0 30V-30H-57L'+coord([-57-260*c,-30+260*s])+'L'+coord([-260*c,30+260*s])+'Z');
      // The beam already fills the white patch at 0°. Keep the whole bracket
      // inside its edge, including the stroke, until the beam becomes parallel.
      bracket.setAttribute('d',grazing?'':'M-8 -19.5H-1.6V19.5H-8');
      const reading=angle+'°'+(grazing?' · 0 lx':'');
      if(label.textContent!==reading)label.textContent=reading;
      const fraction=percent.format(c);
      relative.textContent=fraction;
      range.setAttribute('aria-valuetext',reading+', '+fraction+' '+w.relativeToNormal);
    }
    attachPlayback(host,w,{range,button,paint,saved,arriving,from:0,to:90,duration:5600,lead:600,stops:[0,60,90]});
  }

  // Magnify the portrait around the pupil. The lamps keep their shared orbit.
  const portraitScale=2.35;
  function orbitalSection(m,w) {
    const browTip=coord(point(0,0,36,50)), cheekTip=coord(point(0,0,26,-70));
    // Each curve is both the edge of the painted relief and the first surface hit
    // by the test ray. The rounded ends are tangent to the two field limits.
    const brow='M-39.3-33.6C-29.4-35.7-18-40.7-9.6-40.1C1.8-39.9 10.8-36.2 17.1-32.8C21-30.7 24.32-28.99 '+browTip;
    const cheek='M-38 49C-26 49-13.5 45.7-7.5 42.4C1 38.8 6.1 33.9 8.5 30.4C9.8 28.7 9.99 27.46 '+cheekTip;
    // The nose is on the far side of the near eye. Its outline remains visible
    // beneath the angular diagram, while the nearer brow and cheek stop the ray.
    const profile='M-164-157C-86-169-21-154 5-119C20-108 30-83 33-62C34-51 35-43 33.5-38'+
      'C32.1-33.3 29.3-29.8 26.9-25.2C23.8-19.3 21.9-11.5 22.2-4.8'+
      'C22.8 8.6 31.1 26.7 39.6 42.2'+
      'C45.4 53 52.5 62 55.6 68.2C57.3 72 56.6 75.2 53.7 77.3C48.9 80.8 43.4 80 38.4 79.9'+
      'C34.2 80.2 32.1 82.9 32.4 87.5C32.7 92.4 34.2 97.2 37.5 101.2C39.8 104.2 42.4 106.2 42.2 108.6'+
      'C42 110.7 39.3 111.9 36.8 112.3C39.5 113.7 41.4 116 40.6 118.2C39.4 122.2 35.3 124.5 32.6 125.9'+
      'C30.2 130.4 32.8 136.8 32.4 141.3C31.8 153.6 24 161.1 13.6 164.3C-1.6 169.4-13 171.2-15 183L-21 350H-550V-157Z';
    const opening='M-62.5 4.3C-49.4 3.6-39.4-5.9-27.7-12.2C-16.3-18.4-5.3-20.1 2.1-17.3C6.9-15.6 10.1-9.3 10.3-.4C10.6 7.8 7.6 13.4 1.6 16.7C-4.6 19.8-16.7 18-28.4 14.6C-42.4 10.7-53.6 5.7-62.5 4.3Z';
    const openingClip='mb-lids-'+(++artSequence);
    const faceId='mb-portrait-'+(++artSequence);
    return `<g stroke-linecap="round" stroke-linejoin="round">
      <g transform="scale(${portraitScale})">
      <defs>
        <clipPath id="${openingClip}"><path d="${opening}"/></clipPath>
        <clipPath id="${faceId}-edge"><path d="${profile}"/></clipPath>
        <linearGradient id="${faceId}-skin" gradientUnits="userSpaceOnUse" x1="-87" y1="-24" x2="56" y2="24">
          <stop stop-color="var(--reader-skin-shadow)"/><stop offset=".53" stop-color="var(--reader-skin-mid)"/><stop offset="1" stop-color="var(--reader-skin-light)"/>
        </linearGradient>
        <linearGradient id="${faceId}-bridge" gradientUnits="userSpaceOnUse" x1="9" y1="5" x2="41" y2="-1">
          <stop stop-color="#a36f50" stop-opacity=".5"/><stop offset=".45" stop-color="#cd946e" stop-opacity=".58"/><stop offset="1" stop-color="#e9b38b" stop-opacity=".66"/>
        </linearGradient>
        <linearGradient id="${faceId}-brow-fold" gradientUnits="userSpaceOnUse" x1="1" y1="-42" x2="1" y2="-26">
          <stop stop-color="#ad7e60" stop-opacity=".03"/><stop offset=".65" stop-color="#ba8c69" stop-opacity=".40"/>
          <stop offset="1" stop-color="#b48262" stop-opacity=".66"/>
        </linearGradient>
        <linearGradient id="${faceId}-cheek-edge" gradientUnits="userSpaceOnUse" x1="-23" y1="47" x2="10" y2="25">
          <stop stop-color="#bc967a" stop-opacity="0"/><stop offset=".52" stop-color="#c09a7d" stop-opacity=".42"/><stop offset="1" stop-color="#a57f64" stop-opacity=".88"/>
        </linearGradient>
        <linearGradient id="${faceId}-cheek" gradientUnits="userSpaceOnUse" x1="-49" y1="67" x2="16" y2="43">
          <stop stop-color="var(--reader-skin-mid)" stop-opacity="0"/><stop offset=".56" stop-color="var(--reader-skin-light)" stop-opacity=".32"/><stop offset="1" stop-color="#edbb94"/>
        </linearGradient>
      </defs>
      <path d="${profile}" fill="url(#${faceId}-skin)" stroke="#907d65" stroke-width="1.15"/>
      <g clip-path="url(#${faceId}-edge)">
        <path d="M-12-133C4-116 17-89 23-70c2.7 8.4 4.1 16.8 4.9 24.7 3.5-4.4 4.8-10.5 4-16.5C29-83 20.2-106.6 4-122Z" fill="#f8dfbf" opacity=".42"/>
        <path d="M${browTip}C19.1-21 14.9-16.5 14.8-10.6c-.1 8.4 4.6 17.2 3.4 26.5-1.2 8.8-3.9 15.4-2.9 23.4 1.9 13.3 12.8 26.8 26.2 32.6 5.6 2.4 11.6 2.1 15.1-1.1L72 41 45-39Z" fill="url(#${faceId}-bridge)"/>
        <path d="M24-8.8c2.7 14.2 7.7 25.9 14 38.4 6.7 13.2 14.4 23.3 18.9 36.5-5.6-4.8-12.1-13.7-17.6-23.4C31.9 29.3 24.5 12.5 22.9-3.9Z" fill="#f6dabc" opacity=".72"/>
        <path d="M-49.4 47.5c13.9-3.6 23.3-9.8 32.6-16.8C-7.5 23.6-.8 21.1 6.6 23.9c4.5 7.4 4.3 17.6-.6 27C.7 62-8.4 70.7-22.2 74.2c-13.5 3.5-28.1-.4-37.6-7.5Z" fill="url(#${faceId}-cheek)"/>
        <path d="M4.4 75.3c4.1-7.2 8.1-10.4 14-10.8 5.6-.4 8.7 3.1 14.3 5.9 7.3 3.8 16.8 4.9 23.7.8-1.7 6-7.7 9.4-16.3 9.1-6.7-.2-10.7.4-16.5 1.2-8.5 1.3-14.4-.9-19.2-6.2Z" fill="#d9ad8b"/>
        <path d="M12.7 73.1c1.5-4.4 4.2-6.4 7.6-6.3 4.3.2 8.3 4.4 11.2 6.1" fill="none" stroke="#bd9073" stroke-width="1.15"/>
        <path d="M20 78.9c2.3-3.5 5.9-4.3 9.4-2.9 2.6 1.1 5.6 2.2 9 2.1-2.7 1.8-6.6 2.1-9.9 1-2.8-.9-5.7-.9-8.5-.2Z" fill="#936d57"/>
        <path d="M25.7 84c1.7 6.1 2.3 10.7 6.4 16.8-5.6-.5-7.5-4.5-8.7-10.2Z" fill="#d7b197" opacity=".66"/>
        <path d="M-3.8 103.1c9.2.4 17.6-2.4 24.1-3.8 5.5-1.1 9.4.1 13.7 2.5l8.2 5.7c-2.1 2.6-5.5 3.3-11.7 3.1-12.5-.3-23.7-3.9-34.3-7.5Z" fill="#cc9f8b"/>
        <path d="M-3.4 103.5c12.8 3 22.1 7 34.8 7.3l7.2-.2" fill="none" stroke="#9e7c68" stroke-width="1"/>
        <path d="M9.1 112.4c8.7 2.6 21.6 6.5 30.4 3.3-1.4 4.7-6.6 6.7-13 6-7.5-1-14.1-4-17.4-9.3Z" fill="#e5b9a3"/>
      </g>
      <g data-mb-eye-detail transform="rotate(5) scale(.52)">
      <path d="M-66 4c13.4-7 22.1-22.3 36.5-30.7C-17.3-34-2.8-34.9 10-26.2l4.2 4.6c-13.8-6.6-27.4-5-39.4.6C-42.3-13-49.5.5-63.9 6Z" fill="${m.fill('lidshade')}"/>
      <path d="M-65.6 5.2C-50.7 9.4-36.3 23-20 26.3c9.1 1.8 18.3.6 24.8-3.6-5.4 7.2-16.8 10.1-27.6 7.5-16.3-4-30.6-17.4-42.3-21.7Z" fill="#e0b99b"/>
      <path d="${opening}" fill="${m.fill('sclera')}" stroke="#7e8270" stroke-width="1"/>
      <g clip-path="url(#${openingClip})">
        <path d="M-62 3C-50-3-36-16-20-19c9-2 17-2.1 24.6 1.4l1.2 3.3c-10-3.3-19.7-3.2-29.6.4-13.3 4.5-22.4 12.6-37.7 17.4Z" fill="#ccd8c9"/>
        <ellipse cx="0" cy="0" rx="7.5" ry="20.2" fill="#355f4f" stroke="#365e4f" stroke-width=".8"/>
        <ellipse cx=".15" cy="-.1" rx="6.4" ry="18.6" fill="${m.fill('iris')}"/>
        <path d="m-1.9-15.7.6 4.1m3.2-3.1-.6 4.1m-5.4 16.6 1 3.4m4.1 3.5-.3 2.8m2-7.2-.5 3.3" fill="none" stroke="#88aa95" stroke-width=".77"/>
        <ellipse data-orbit-pupil cx="0" cy="0" rx="3.18" ry="8.65" fill="#203d33"/>
        <ellipse cx="-1.4" cy="-4.4" rx="1.28" ry="2.05" fill="#fffdf0"/>
        <path d="M5.8-12.8c2.8 2.1 4.4 7 4.3 12.5.2 5.1-1.1 9.2-3.6 12.3 1.8-7.8 1.9-16.3-.7-24.8Z" fill="#e0eee6" opacity=".85"/>
        <path d="M-21.6-18.9c10.4-3.3 24.9-3.6 32.4 3.4L10-12.8c-8.3-5.8-22.4-6.5-31.6-4.3Z" fill="#78917e" opacity=".26"/>
      </g>
      <path d="M-65.3 5.1C-49.4-1.7-42.5-16.3-26-24.2c12.3-5.9 24.6-4.7 32.2 2.8 2.2 2.2 3.2 5.1 3.3 8.6-3.2-4.4-7.1-6.3-13.1-6.2-8.4-.1-16.7 2.9-24.1 6.9C-39.8-5.5-50 3.6-62.5 4.3Z" fill="${m.fill('lid')}"/>
      <path d="M-57.7.3C-46-5.3-39.5-15.5-27.3-21.7c10.6-5.4 20.5-6.3 29.2-2.4" fill="none" stroke="#ad866a" stroke-width="1.05"/>
      <path d="M-37.5-10.4c10.8-8.8 25.5-14.8 37.1-10.3" fill="none" stroke="#f8d9ba" stroke-width="1.35"/>
      <path d="M-62.5 4.3C-49.4 3.6-39.4-5.9-27.7-12.2C-16.3-18.4-5.3-20.1 2.1-17.3c2.1.7 4 2.4 5.2 4.1" fill="none" stroke="#665547" stroke-width="2.05"/>
      <path d="M-62.5 4.3c9 .9 20.7 5.5 34.1 10.3 11.7 3.4 23.8 5.2 30 2.1q3.3-1.7 5.3-4.4l.5 3.1c-3.3 7-15.1 9.7-27.4 6.6C-37.1 18.1-52.6 8.2-63.6 5.5Z" fill="#e8bb97"/>
      <path d="M-61.5 4.6c9.6 1.7 19.6 6.2 33.1 10 11.7 3.4 23.8 5.2 30 2.1q3.3-1.7 5.1-4.1" fill="none" stroke="#947460" stroke-width="1.15"/>
      <path d="M-31.5 16.2c10.5 4 22.9 7.3 31.6 3.8" fill="none" stroke="#f7d6b3" stroke-width="1.15"/>
      </g>
      <path d="${brow}C18.3-28.7 9.6-34.8-.8-36.8-11.8-39.3-27.3-35.3-39.3-33.6Z" fill="url(#${faceId}-brow-fold)"/>
      <path data-mb-eyebrow d="${brow}C23.4-30.7 21.5-34.3 17.7-37.1 10.1-42.7-.7-46.5-11.6-45.1-23-43.9-33.8-36.3-39.3-33.6Z" fill="#604d3e"/>
      <path d="M-31.5-36.5q2.9-1.6 5.2-3.4m2.8 1 4.7-3.9m3.8 2.3 3.7-3.5m4.4 2.9 2.4-3.4m4 4.3 1.2-3.5m4.5 4.8-.4-3.3m5.1 5.9-1.3-3.6m5.8 6.5-2.2-3.7m5.5 6.8-2.3-3.7" fill="none" stroke="#937b60" stroke-width=".67"/>
      <path data-mb-occluder="upper" d="${brow}" fill="none" stroke="#87664c" stroke-width=".65"/>
      <g data-mb-hair>
        <path d="M-174-159C-112-174-42-170-5-141c22 17 35 41 40 64 2 9 2.2 19.3.7 28.6-3.9-18.1-9.8-34.1-20.8-47.3-3-3.7-6.1-7-9.1-9.9C-.4-81.9-15-60.7-34.4-42.4-54-24-80-9.4-104.8 3.2c-15.9 8.2-32.9 12.6-50.1 14.1C-203 29-262 30-356 29l-12-187Z" fill="#3c433a" stroke="#3e4339" stroke-width="1.2"/>
        <path d="M-159 12.6c39.9-7.1 72.9-26.7 102.4-53.5 25-22.4 42.6-49.3 54.2-80.3-2 34.5-21.8 64.4-45.5 87.4C-77.3-6.2-115.3 8.6-154.4 16.5Z" fill="#55584a"/>
        <g fill="none" stroke-linecap="round">
          <path d="M-141-6c53-21 99-55 122-108m-123 91c38.7-14.2 71.5-38 99.3-69.3m-89.7 93.9c46.5-16.1 87-51.9 110.8-93.3M1.6-138.4c15.1 13.2 27.2 35.6 31.9 55.3" stroke="#787669" stroke-opacity=".62" stroke-width="1.1"/>
          <path d="M5.8-107c-4.2 23.3-17.2 46.4-35.6 63.8-11.5 10.9-24.2 19.3-38.5 27.8M-1.2-110c-9.5 40.1-34.7 70.2-69.2 91M25-92.5c7.5 14.4 10 28.7 9.4 40.3" stroke="#625d4d" stroke-width="1.1"/>
        </g>
      </g>
      <path d="${cheek}C14.3 31.2 15.4 40 12.5 46.2 5.7 52.5-14.2 54.1-38 49Z" fill="url(#${faceId}-cheek)" opacity=".74"/>
      <path data-mb-occluder="lower" d="${cheek}" fill="none" stroke="url(#${faceId}-cheek-edge)" stroke-width=".85"/>
      </g>
      ${w?`<g data-orbit-leaders fill="none" stroke="#5e7162" stroke-width="1.05">
        <path d="M-66-107h22l21.4 12.8" stroke="#b0b49f"/>
        <circle cx="-22.6" cy="-94.2" r="1.65" fill="#586855" stroke="#f3eedc" stroke-width=".7"/>
        <path d="M-33 109l15.4-9.4"/><circle cx="-17.6" cy="99.6" r="1.5" fill="#667d68"/>
      </g>
      <g class="mb-face-labels" fill="#375649" font-family="var(--sans,system-ui,sans-serif)" font-size="13" font-weight="620" paint-order="stroke" stroke="#f5f0df" stroke-width="2.3" stroke-linejoin="round">
        <text x="-68" y="-111">${w.browLabel}</text><text x="-36" y="114" text-anchor="end">${w.cheekLabel}</text>
      </g>`:''}
    </g>`;
  }

  function trialStand(m) {
    return `<g stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="-47" cy="82" rx="29" ry="2.8" fill="#b3c5af" opacity=".5"/>
      <path d="m-65 78 7-4h25l9 4v3h-41Z" fill="${m.fill('metal')}" stroke="#718775" stroke-width="1"/>
      <path d="M-49 23h5v52q-2.5 1.5-5 0Z" fill="${m.fill('metal')}" stroke="#778c77" stroke-width=".85"/>
      <path d="M-48 9h3v30h-3Z" fill="${m.fill('metal')}" stroke="#82927d" stroke-width=".7"/>
      <path d="M-47 12h22q3 0 3-4v-2" stroke="#657e6d" stroke-width="4" fill="none"/>
      <circle cx="-46.5" cy="12" r="3.3" fill="#839b84" stroke="#526f5a" stroke-width=".8"/>
      <rect x="-50.8" y="35" width="8.6" height="4.7" rx="1" fill="#667e69"/>
      <path d="M-28 5c-11 3-12 9-12 24v19" fill="none" stroke="#415d4c" stroke-width="2"/>
      <g transform="scale(.82)">${sensorHead(m)}</g>
    </g>`;
  }

  function orbitalLocator() {
    return `<svg viewBox="0 0 38 43" aria-hidden="true" focusable="false">
      <path d="M5 42c.5-4.2 3.2-7.4 8-9.4l1.6-4.3c-5.2-4.5-6.7-9.2-5.5-15.6C10.3 6.4 15.7 3 21.2 3.4c7.1.4 11 4.9 11 11.1l-.3 4.5 3.3 4.6-3 .8-.8 3.9q-1.4 3.2-5.9 2l-.8 3.4c3.5 2 6.1 4.4 7.3 8.3" fill="#e9e9d7" stroke="#647a69" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12.1 25.3c-4-3.6-5.4-8.2-3.1-14 1.9-5.1 6.4-8.5 12.5-8 5.4.4 9.4 3.5 10.4 8-5.6-.5-8.3 1.9-10 3.6l-1.6 5.4q-1.7-3.2-3.6-2.1c-2.2 1.2-1.2 5.4.6 6.8l-2.2 2.8Z" fill="#98ae99"/>
      <path d="M25.7 16.3q2.1-1.2 4.6.1m-4.5 3.3q2.1-1.3 4 .1m-4.9 10.4-3.1-1.3" fill="none" stroke="#6e806d" stroke-width=".85"/>
      <rect x="22.5" y="12.5" width="11.3" height="13" rx="1.4" fill="#e9be7d" fill-opacity=".23" stroke="#24765c" stroke-width="1.45"/>
    </svg>`;
  }

  const trialLampOffset=29;
  function trialPanel(w,anatomical) {
    const m=finishes(),x=82,y=116,r=anatomical?99:62,arm=anatomical?'mb':'mb-open';
    const ticks=Array.from({length:13},(_,i)=>{
      const angle=(i-6)*15;
      return 'M'+coord(point(0,0,r+2,angle))+'L'+coord(point(0,0,r+(i%2?4.5:7),angle));
    }).join(' ');
    const openChart='<path d="'+section(0,0,r,-90,90)+'" fill="#e1ebdb" stroke="#829e85" stroke-width="1"/>';
    const omitted=section(0,0,r,50,90)+' '+section(0,0,r,-90,-70);
    const eyeChart='<g class="mb-angle-overlay">'+
      '<path d="'+section(0,0,r,-70,50)+'" fill="#378b70" fill-opacity=".31"/>'+
      '<path d="'+omitted+'" fill="#a74444" fill-opacity=".32"/>'+
      '<path d="'+omitted+'" fill="'+m.fill('hatch')+'" fill-opacity=".86"/>'+
      '<path d="M0 -'+r+'A'+r+' '+r+' 0 0 1 0 '+r+'" fill="none" stroke="#5f8b77" stroke-width="1.1"/>'+
      '<path d="M0 -'+r+'v'+(r-6)+'m0 12v'+(r-6)+'" fill="none" data-mb-blocked-axis stroke="#963a32" stroke-width="1.4" stroke-dasharray="2.6 2.6"/>'+
      '<path d="M'+coord(point(0,0,r,50))+'L0 0L'+coord(point(0,0,r,-70))+'" fill="none" stroke="#94433a" stroke-width="1.05" stroke-opacity=".9"/></g>';
    const glowId='mb-torch-'+(++artSequence);
    const portraitMask=glowId+'-portrait';
    const contactHalo=anatomical?'<path data-mb-contact-halo fill="none" stroke="#fff8e7" stroke-width="3.9" stroke-linecap="round"/>':'';
    const portrait=anatomical?`<defs>
      <radialGradient id="${portraitMask}-edge">
        <stop offset=".56" stop-color="black"/><stop offset="1" stop-color="black" stop-opacity="0"/>
      </radialGradient>
      <mask id="${portraitMask}" maskUnits="userSpaceOnUse" x="-500" y="-240" width="850" height="480" style="mask-type:luminance">
        <rect x="-500" y="-240" width="850" height="480" fill="white"/>
        <g data-mb-source-clearance><ellipse cx="${105+trialLampOffset}" cy="0" rx="35" ry="37" fill="url(#${portraitMask}-edge)"/></g>
      </mask></defs><g mask="url(#${portraitMask})">${orbitalSection(m,w)}</g>`:'';
    const cone=`<defs><linearGradient id="${glowId}" gradientUnits="userSpaceOnUse" x1="88" x2="63" y1="0" y2="0">
      <stop stop-color="#ffe4a3" stop-opacity=".82"/><stop offset=".4" stop-color="#efc778" stop-opacity=".43"/>
      <stop offset="1" stop-color="#edc16c" stop-opacity="0"/></linearGradient></defs>
      <path class="mb-torch-glow" d="M89-7.3 63-13.2v26.4L89 7.3Z" fill="url(#${glowId})"/>`;
    const sourceSymbol=`<g class="mb-source-lamp"><path d="M90-8.6l10.5 2.4 4.4 3.1v6.1l-4.4 3.1L90 8.6Z" fill="#bfa36a" stroke="#816f4d" stroke-width="1.1"/>
      <path d="M90-8.6v17.2q-3.8-1.7-3.8-8.6T90-8.6Z" fill="#f8df97" stroke="#a68b49" stroke-width="1"/>
      <path d="M103.6-3.3h4.7v6.6h-4.7Z" fill="#738574" stroke="#5c7162" stroke-width=".9"/>
      <path d="m95-5.8 5 1.4m-5 .5 5 1.3" stroke="#dfce99" stroke-width=".85"/></g>`;
    const light=`<g data-${arm}-beam><g transform="translate(${trialLampOffset} 0)">${cone}</g>
      <path data-${arm}-ray fill="none" stroke-linecap="butt" stroke-width="2"/>
      ${contactHalo}<path data-${arm}-ray-tip fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.7"/>
      <g transform="translate(${trialLampOffset} 0)">${sourceSymbol}</g>
    </g>`;
    return '<div class="mb-projection'+(anatomical?' mb-orbit-panel':'')+'"><span class="mb-trial-heading">'+(anatomical?orbitalLocator()+w.shield:w.open)+'</span>'+
      '<svg'+(anatomical?' class="mb-profile-art"':'')+' viewBox="-18 -26 241 286" aria-hidden="true">'+m.defs+
      '<g transform="translate('+x+' '+y+')">'+(anatomical?portrait+eyeChart:openChart)+
      '<path d="'+ticks+'" fill="none" stroke="#93a691" stroke-width=".8"/>'+
      '<path d="M5 0h100" stroke="#668474" stroke-width=".9" stroke-dasharray="2.5 4" fill="none"/>'+
      (anatomical?'':trialStand(m))+light+
      (anatomical?'':'<circle cx="0" cy="0" r="2.1" fill="#245240" stroke="#fffcf2" stroke-width=".8"/>')+'</g></svg></div>';
  }

  function trialScene(w) {
    return '<div class="mb-trial" role="img" aria-label="'+w.figures[1]+'"><div class="mb-pair">'+trialPanel(w,false)+trialPanel(w,true)+'</div>'+
      '<div class="mb-keys"><span><i class="mb-pass-ray"></i>'+w.admittedRay+'</span><span><i class="mb-stop-ray"></i>'+w.blockedRay+'</span></div></div>';
  }

  function signedAngle(angle) {
    return (angle > 0 ? '+' : angle < 0 ? '−' : '') + Math.abs(angle) + '°';
  }

  const runningInHost=new WeakMap();

  function playbackButton(w,kind) {
    return '<button type="button" class="mb-playback" data-mb-play="'+kind+'"><span aria-hidden="true"></span><span>'+w.play+'</span></button>';
  }

  function attachPlayback(host,w,options) {
    const {range,button,paint,from,to,stops,saved}=options;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const stepOnly=()=>motion.matches;
    const forward=to>from?1:-1;
    let value=saved?saved.value:Number(range.value), played=saved?saved.played:false;
    let frame=0, playing=false, disposed=false;
    function set(valueNow) {
      value=valueNow;
      range.value=String(Math.round(valueNow));
      paint(valueNow);
    }
    function nextStop() {
      return stops.find(angle=>(angle-value)*forward>.01)??from;
    }
    function updateButton() {
      const ended=(to-value)*forward<.01;
      const title=stepOnly()?w.showAngle.replace('{angle}',Math.round(nextStop())+'°'):playing?w.pause:ended?w.replay:played?w.resume:w.play;
      const glyph=stepOnly()?'↔':playing?'Ⅱ':ended?'↻':'▶';
      button.firstElementChild.textContent=glyph;
      button.lastElementChild.textContent=title;
      button.setAttribute('aria-label',title);
    }
    function stop() {
      playing=false;
      if(frame) window.cancelAnimationFrame(frame);
      frame=0;
      updateButton();
    }
    function play(lead=0,restore=false) {
      if(stepOnly()||disposed) return;
      if(!restore&&(to-value)*forward<.01) set(from);
      const start=value, distance=(to-start)*forward;
      if(distance<=0){stop();return;}
      const duration=Math.max(260,options.duration*distance/Math.abs(to-from));
      const at=performance.now()+lead;
      played=true;playing=true;updateButton();
      function tick(now) {
        frame=0;
        if(!playing||disposed) return;
        if(!host.isConnected||!host.contains(range)){dispose();return;}
        if(document.hidden){stop();return;}
        const elapsed=Math.max(0,now-at);
        const t=Math.min(1,elapsed/duration), ease=t*t*(3-2*t);
        set(t===1?to:start+(to-start)*ease);
        if(t===1){stop();return;}
        frame=window.requestAnimationFrame(tick);
      }
      frame=window.requestAnimationFrame(tick);
    }
    function activate() {
      if(stepOnly()) {played=true;set(nextStop());updateButton();}
      else if(playing) stop();
      else play();
    }
    function takeOver() {
      if(playing) stop();
      played=true;
    }
    function handleValue() {takeOver();set(Number(range.value));updateButton();}
    function onRangeKey(event) {
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) takeOver();
    }
    let waiting=Boolean(options.arriving);
    function autoPlay(){
      if(!waiting&&!played&&!disposed&&!motion.matches&&!document.hidden&&host.contains(range)&&host.isConnected)
        play(options.lead);
    }
    function visibility() {
      if(document.hidden) {
        if(playing) stop();
      } else autoPlay();
    }
    function preference() {stop();}
    const observer=new MutationObserver(()=>{
      if(!host.isConnected||!host.contains(range)) dispose();
    });
    // Stop playback when navigation removes this lesson.
    if(host.parentNode) observer.observe(host.parentNode,{childList:true});
    function dispose() {
      if(disposed) return;
      disposed=true;
      if(frame) window.cancelAnimationFrame(frame);
      frame=0;playing=false;observer.disconnect();
      motion.removeEventListener('change',preference);
      document.removeEventListener('visibilitychange',visibility);
      button.removeEventListener('click',activate);
      range.removeEventListener('input',handleValue);
      range.removeEventListener('pointerdown',takeOver);
      range.removeEventListener('keydown',onRangeKey);
      runningInHost.delete(host);
    }
    motion.addEventListener('change',preference);
    document.addEventListener('visibilitychange',visibility);
    button.addEventListener('click',activate);
    range.addEventListener('input',handleValue);
    range.addEventListener('pointerdown',takeOver);
    range.addEventListener('keydown',onRangeKey);
    runningInHost.set(host,{dispose,snapshot:()=>({value,played,playing})});
    set(value);updateButton();
    if(saved?.playing) play(0,true);
    else if(waiting)options.arriving.then(()=>{waiting=false;autoPlay();});
    else if(!saved)autoPlay();
  }



  function angleVerifier(w) {
    return '<div class="mb-exercise">' +
      '<label class="mb-angle-control"><span>'+w.lampAngle+'</span><strong data-mb-angle>+90°</strong>'+
      '<input data-mb-slider dir="rtl" type="range" min="-90" max="90" step="1" value="90" aria-label="'+w.lampAngle+'"></label>'+
      '<div class="mb-ends" aria-hidden="true"><span>+90° · '+w.higher+'</span><span>−90° · '+w.lower+'</span></div>'+
      playbackButton(w,'trial')+
      '<dl class="mb-readings" aria-live="polite" aria-atomic="true"><div data-mb-open><dt>'+w.open+'</dt><dd>'+w.reaches+'</dd></div>'+
      '<div data-mb-shield><dt>'+w.shield+'</dt><dd>'+w.brow+'</dd></div></dl></div>';
  }

  function attachTrial(host,w,saved,arriving) {
    const slider=host.querySelector('[data-mb-slider]');
    const angleLabel=host.querySelector('[data-mb-angle]');
    const rows=[host.querySelector('[data-mb-open]'), host.querySelector('[data-mb-shield]')];
    const readings=rows.map(row=>row.querySelector('dd'));
    function rayParts(prefix) {
      return {group:host.querySelector('[data-'+prefix+'-beam]'),line:host.querySelector('[data-'+prefix+'-ray]'),tip:host.querySelector('[data-'+prefix+'-ray-tip]')};
    }
    const open=rayParts('mb-open'),eye=rayParts('mb');
    const sourceClearance=host.querySelector('[data-mb-source-clearance]');
    const contactHalo=host.querySelector('[data-mb-contact-halo]');
    const upper=host.querySelector('[data-mb-occluder="upper"]'),lower=host.querySelector('[data-mb-occluder="lower"]');
    // Locate the first contact on the brow or cheek silhouette as drawn.
    function skinContact(path,angle) {
      let start=0,end=path.getTotalLength();
      for(let i=0;i<18;i++){
        const mid=(start+end)/2, p=path.getPointAtLength(mid);
        const elevation=Math.abs(Math.atan2(p.y,p.x)*180/Math.PI);
        if(elevation>Math.abs(angle)) start=mid;
        else end=mid;
      }
      const p=path.getPointAtLength((start+end)/2);
      return portraitScale*Math.hypot(p.x,p.y);
    }
    function draw(ray,angle,to,kind) {
      ray.group.setAttribute('transform','rotate('+(-angle)+')');
      const color=kind==='blocked'?palette.blocked:kind==='grazing'?palette.slate:palette.green;
      ray.line.setAttribute('d','M'+(86.5+trialLampOffset)+' 0H'+to);
      ray.line.setAttribute('stroke',color);
      if(kind==='admitted') ray.line.removeAttribute('stroke-dasharray');
      else ray.line.setAttribute('stroke-dasharray',kind==='blocked'?'3.5 2.6':'1.2 3');
      ray.tip.setAttribute('stroke',color);
      const mark=kind==='blocked'
        ? 'M'+(to-3)+' -3l6 6m-6 0 6-6'
        : kind==='grazing'?'M'+to+' -2.2a2.2 2.2 0 1 0 .01 0Z':'M48-3l-5 3 5 3';
      ray.tip.setAttribute('d',mark);
      if(ray===eye) contactHalo.setAttribute('d',kind==='blocked'?mark:'');
    }
    function move(angle) {
      const grazing=Math.abs(angle)===90;
      const contact=angle>50?upper:angle< -70?lower:null;
      const title=signedAngle(angle);
      angleLabel.textContent=title;
      slider.setAttribute('aria-valuetext',title);
      sourceClearance.setAttribute('transform','rotate('+(-angle)+')');
      draw(open,angle,grazing?15:0,grazing?'grazing':'admitted');
      draw(eye,angle,contact?skinContact(contact,angle):0,contact?'blocked':'admitted');
      const states=[grazing?w.grazing:w.reaches,contact?(angle>0?w.brow:w.cheek):w.pupil];
      states.forEach((t,i)=>{if(readings[i].textContent!==t) readings[i].textContent=t;});
      rows[0].classList.toggle('mb-grazing',grazing);
      rows[1].classList.toggle('mb-blocked',Boolean(contact));
    }
    attachPlayback(host,w,{range:slider,button:host.querySelector('[data-mb-play="trial"]'),paint:angle=>move(Math.round(angle)),saved,arriving,from:90,to:-90,duration:7900,lead:280,stops:[90,65,50,0,-70,-80,-90]});
  }

  function render(host, lang, step, arriving) {
    const w = words[lang] || words.en;
    const previous = Number(host.dataset.meterStep);
    const active = runningInHost.get(host);
    const saved = step === previous && active ? active.snapshot() : null;
    if(active) active.dispose();
    host.dataset.meterStep = String(step);
    const drawings = [collectorScene, trialScene];
    const figure = '<figure class="mb-figure"><div class="mb-drawing" data-guide-art>' + drawings[step](w) + '</div>' +
        '<figcaption>' + w.captions[step] + '</figcaption></figure>';
    host.innerHTML = '<article class="mb-page ' + (step===0?'mb-incidence-page':'mb-trial-page') + '">' +
      '<div class="mb-copy"><h1 id="guide-title" tabindex="-1">' + w.titles[step] + '</h1>' +
      w.paragraphs[step].map(text => '<p>' + text + '</p>').join('') +
      (step === 1 ? angleVerifier(w) : '') + '</div>' + figure + '</article>';
    if(step===0) attachIncidence(host,w,saved,arriving);
    else attachTrial(host,w,saved,arriving);
  }

  // Reuse the two illustrations from the side-by-side comparison.
  function fieldPictogram(mask,upper,lower) {
    const m=finishes(),r=33,hi=mask?upper:90,lo=mask===2?lower:-90;
    const admitted=section(0,0,r,lo,hi);
    const blocked=(hi<90?section(0,0,r,hi,90):'')+(lo>-90?section(0,0,r,-90,lo):'');
    const portrait=mask?'<g opacity=".66" transform="scale(.52)">'+orbitalSection(m)+'</g>':'';
    const sensor=mask?'':'<path d="M-27 5q-8 1-8 12v8" fill="none" stroke="#415d4c" stroke-width="1.8"/><g transform="scale(.9)">'+sensorHead(m)+'</g>';
    return m.defs+'<g transform="translate(44 41)">'+portrait+
      '<path d="'+admitted+'" fill="#8fbfa4" fill-opacity="'+(mask?'.76':'.43')+'" stroke="#497863" stroke-width="1.35"/>'+
      (blocked?'<path d="'+blocked+'" fill="#e8b4a7" fill-opacity=".83" stroke="#933e36" stroke-width="1.2"/><path d="'+blocked+'" fill="'+m.fill('hatch')+'"/>':'')+
      '<path d="M0 0h39" fill="none" stroke="#547568" stroke-width="1.1" stroke-dasharray="2.5 3"/>'+
      sensor+'</g>';
  }

  window.fieldGuides = window.fieldGuides || {};
  window.fieldGuides.meter = {
    steps: words.en.steps.map((en, i) => ({ en, de: words.de.steps[i] })),
    render, fieldPictogram
  };
})();
