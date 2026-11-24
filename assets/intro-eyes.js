/* Guided introduction: the room seen from the reader's seat. */
(() => {
  'use strict';

  const steps = [
    {en: 'At the desk', de: 'Am Schreibtisch'},
    {en: 'Two eyes', de: 'Zwei Augen'},
    {en: 'Measuring light', de: 'Licht messen'},
    {en: 'Field limits', de: 'Winkelgrenzen'},
    {en: 'Back at the window', de: 'Zurück am Fenster'},
    {en: 'A suspended lamp', de: 'Eine Pendelleuchte'}
  ];

  const story = {
    en: [
      {
        title: 'Look at the bird by the window.',
        lead: 'Imagine reading at this desk. Daylight from the window and light from the ceiling lamp fall on your book. You look up and spot a blackbird on a branch.',
        body: 'Light on the page helps you read. Light entering your eyes also helps set your body clock. Keep your gaze on the bird’s beak. What else can you see?',
        alt: 'A reader sits at a desk with an open book. A ceiling panel is high overhead. A dotted line connects the reader’s eye to a blackbird at the window.',
        caption: 'The dotted line follows the reader’s gaze.'
      },
      {
        title: 'How much can two eyes see?',
        lead: 'With your eyes fixed on the beak, you can still see the branch and the window frame around it. Everything you can see without shifting your gaze makes up your visual field.',
        body: 'Close one eye at a time, or try the buttons below the map. Both eyes see the bird. Each eye also sees farther on its own side. The map spans 180° from left to right. Your sight can extend beyond the sides of the map because the curved cornea bends light from the far periphery into the eye.',
        alt: 'A faint window and desk sit behind the two visual fields. The rings mark 30, 60 and 90 degrees from the bird’s beak. The darker centre belongs to both eyes and each outer wing to one eye.',
        caption: 'The beak marks 0°. Each ring adds 30° from there. Both eyes see the area where their fields overlap.'
      },
      {
        title: 'Put a meter at eye height.',
        lead: 'Keep looking at the window. Hold the white sensor beside your eye at pupil height, facing the window. In this example, the meter reads 250 lux (lx).',
        body: 'The meter measures illuminance in lux. Illuminance tells you how much visible light falls on each square metre of a surface, weighted for the colours we see best. The window and the ceiling lamp both contribute, even though their light reaches the sensor at different angles.',
        alt: 'The reader holds a small white sensor at pupil height and a cabled meter reading 250 lx in the other hand. Green arrows from the window and ceiling meet the same point on the sensing face.',
        caption: 'Both rays reach the white sensor at eye height. The semicircle shows the directions it accepts in this side view.'
      },
      {
        title: 'Where should the field end?',
        lead: 'The brow and cheek limit the light that can reach your eye. Those limits vary from person to person. To compare measurements, we need a field we can reproduce on a sensor.',
        body: 'For measurements in dim rooms, the International Commission on Illumination (CIE) describes an outline centred on the line of sight. Seen from the side, it extends 50° up and 70° down. Seen from above, it extends 90° to either side.',
        alt: 'In side view, the accepted field at the eye lies between 50 degrees above and 70 degrees below straight ahead. Seen from above, it covers 180 degrees from left to right.',
        caption: 'Use the slider to look up or down. The field turns with the line of sight.'
      },
      {
        title: 'What changes with a cover on the sensor?',
        lead: 'Back at the desk, imagine you have a sensor where your eye sits. Look towards the bird again. Fit a cover called a radiance hood to give the sensor the field you just saw. Light from the window still reaches the sensor. The hood blocks the direct ray from the ceiling lamp.',
        body: 'Trace the dotted path from the lamp to the desk. Some light reflects off the tabletop and reaches the sensor from below. Keep looking at the bird. What would happen if the lamp hung a little lower?',
        alt: 'Hatching marks both field limits at the eye, +50° above and −70° below the gaze. The ceiling ray stops at the upper edge of the hood. The window ray and the ray reflected from the desk reach the pupil inside the admitted field.',
        caption: 'At the eye, the direction of the last part of each path determines whether the hood admits the light.'
      },
      {
        title: 'What if the lamp hangs lower?',
        lead: 'Keep your eyes on the bird as the lamp descends. Watch the ray from the middle of the lamp. Once it slips below the hood’s upper edge, light can reach the eye directly. The tabletop still reflects light towards the eye, too.',
        body: 'When designing lighting for the body clock, start with what a person can see. Only light that reaches the retina can stimulate the cells that signal to the body clock. During the day, light surfaces within view or place luminaires with large emitting surfaces there, while avoiding glare. In the evening, dim bright surfaces and keep bright luminaires out of view to reduce that stimulus.',
        alt: 'The same desk and level gaze, with the ceiling lamp now hung on cables. As the lamp lowers, its direct ray crosses the upper field limit and reaches the eye. The reflected path via the desk remains visible.',
        caption: 'Next, try experiment 01. Keep the gaze fixed and switch between Open and Radiance hood to compare the readings in lux.'
      }
    ],
    de: [
      {
        title: 'Schau zur Amsel am Fenster.',
        lead: 'Stell dir vor, du liest an diesem Schreibtisch. Tageslicht fällt durchs Fenster auf dein Buch. Auch die Deckenleuchte beleuchtet die Seite. Als du aufschaust, entdeckst du eine Amsel auf einem Ast.',
        body: 'Das Licht auf der Seite hilft dir beim Lesen. Licht, das in deine Augen fällt, gibt auch deiner inneren Uhr ein Zeitsignal. Schau weiter auf den Schnabel der Amsel. Was siehst du um sie herum?',
        alt: 'Eine Person sitzt vor einem offenen Buch am Schreibtisch. Hoch über ihr hängt ein Deckenpanel. Eine gepunktete Linie verbindet ihr Auge mit einer Amsel am Fenster.',
        caption: 'Die gepunktete Linie zeigt die Blickrichtung.'
      },
      {
        title: 'Wie weit sehen zwei Augen?',
        lead: 'Während du den Schnabel anschaust, siehst du auch den Ast und den Fensterrahmen. Alles, was du sehen kannst, ohne den Blick zu bewegen, gehört zu deinem Gesichtsfeld.',
        body: 'Schließe abwechselnd ein Auge oder probiere die Schaltflächen unter der Karte aus. Beide Augen sehen die Amsel. Jedes Auge sieht auf seiner Seite weiter nach außen. Die Karte zeigt 180° von links nach rechts. Dein Gesichtsfeld kann seitlich darüber hinausreichen, weil die gewölbte Hornhaut auch Licht aus dem äußersten Blickfeld ins Auge bricht.',
        alt: 'Fenster und Tisch schimmern hinter beiden Gesichtsfeldern durch. Die Kreise liegen 30, 60 und 90 Grad vom Schnabel entfernt. Die dunklere Mitte sehen beide Augen, die seitlichen Bereiche jeweils nur eines.',
        caption: 'Der Schnabel markiert 0°. Von Ring zu Ring kommen 30° hinzu. Den Bereich, in dem sich die Gesichtsfelder überlappen, sehen beide Augen.'
      },
      {
        title: 'Miss das Licht auf Augenhöhe.',
        lead: 'Schau weiter zum Fenster. Halte den weißen Sensor auf Pupillenhöhe neben dein Auge und richte ihn ebenfalls zum Fenster. In diesem Beispiel zeigt das Luxmeter 250 Lux (lx) an.',
        body: 'Lux ist die Einheit der Beleuchtungsstärke. Sie gibt an, wie viel sichtbares Licht pro Quadratmeter auf eine Fläche fällt. Farben, die wir besonders gut sehen, zählen dabei stärker. Licht vom Fenster und von der Deckenleuchte trifft unter verschiedenen Winkeln auf den Sensor. Beides trägt zum Messwert bei.',
        alt: 'Die Person hält den weißen Messkopf auf Pupillenhöhe und das verkabelte Anzeigegerät mit dem Messwert 250 lx in der anderen Hand. Grüne Pfeile vom Fenster und vom Deckenpanel treffen denselben Punkt auf der Messfläche.',
        caption: 'Beide Strahlen erreichen den weißen Sensor auf Augenhöhe. Der Halbkreis zeigt in der Seitenansicht, aus welchen Richtungen er Licht erfasst.'
      },
      {
        title: 'Wo soll das Gesichtsfeld enden?',
        lead: 'Braue und Wange begrenzen, aus welchen Richtungen Licht dein Auge erreicht. Diese Grenzen sind bei jedem Menschen etwas anders. Damit Messungen vergleichbar sind, brauchen wir einen Umriss, den wir am Sensor nachbilden können.',
        body: 'Für Messungen in schwach beleuchteten Räumen beschreibt die Internationale Beleuchtungskommission (CIE) einen solchen Umriss um die Blickachse. In der Seitenansicht reicht er 50° nach oben und 70° nach unten. Von oben betrachtet reicht er 90° zu jeder Seite.',
        alt: 'Im Seitenschnitt reicht das erfasste Feld am Auge von 50 Grad oberhalb bis 70 Grad unterhalb der Blickachse. Von oben betrachtet umfasst es horizontal 180 Grad.',
        caption: 'Neige den Blick mit dem Regler nach oben oder unten. Das Gesichtsfeld dreht sich mit der Blickrichtung.'
      },
      {
        title: 'Was ändert ein Aufsatz vor dem Sensor?',
        lead: 'Stell dir vor, du sitzt wieder am Schreibtisch und an der Stelle deines Auges sitzt ein Sensor. Dein Blick geht wieder zur Amsel. Setze die Gesichtsfeldblende auf. Sie begrenzt den Lichteinfall auf den Umriss, den du gerade gesehen hast. Das Fensterlicht trifft weiterhin auf den Sensor. Den direkten Strahl von der Deckenleuchte hält die Blende ab.',
        body: 'Verfolge den gepunkteten Weg von der Leuchte zum Tisch. Die Tischplatte wirft einen Teil des Lichts zurück. Von unten erreicht es den Sensor auch mit Blende. Schau weiter zur Amsel. Was würde sich ändern, wenn die Leuchte etwas tiefer hinge?',
        alt: 'Schraffuren markieren beide Blendengrenzen am Auge, +50° oberhalb und −70° unterhalb der Blickrichtung. Der direkte Strahl von der Decke endet an der oberen Blende. Fensterlicht und am Tisch reflektiertes Licht erreichen die Pupille innerhalb der Grenzen.',
        caption: 'Ob die Blende das Licht durchlässt, hängt von der Richtung ab, aus der es zuletzt auf das Auge trifft.'
      },
      {
        title: 'Was ändert sich, wenn die Leuchte tiefer hängt?',
        lead: 'Schau weiter zur Amsel, während die Leuchte sinkt. Beobachte den Strahl aus der Mitte der Leuchte. Sobald er die obere Blendengrenze unterschreitet, erreicht das Licht das Auge auch direkt. Die Tischplatte reflektiert weiterhin Licht zum Auge.',
        body: 'Wenn du Licht für die innere Uhr planst, geh von dem aus, was eine Person von ihrem Platz aus sieht. Nur Licht, das die Netzhaut erreicht, kann die Zellen anregen, die der inneren Uhr ein Signal geben. Beleuchte tagsüber Flächen im Blickfeld oder setze dort Leuchten mit großen Lichtaustrittsflächen ein, ohne zu blenden. Abends lässt sich der Lichtreiz verringern, indem du helle Flächen dimmst und helle Leuchten außerhalb des Blickfelds anordnest.',
        alt: 'Am selben Schreibtisch bleibt der Blick zur Amsel gerichtet. Die Leuchte sinkt an Seilen von der Decke herab. Ihr direkter Strahl überquert die obere Blendengrenze und erreicht das Auge. Der reflektierte Weg über den Tisch bleibt sichtbar.',
        caption: 'Probiere das in Versuch 01 aus. Lass die Blickrichtung gleich und wechsle zwischen „Offen“ und „Blende“, um die Messwerte in Lux zu vergleichen.'
      }
    ]
  };

  const fieldOptions = {
    en: {
      group: 'Show the field of', both: 'Both eyes', left: 'Left eye', right: 'Right eye',
      outside: 'Darken outside the field', darkCaption: 'Faint outlines in black show what lies outside the selected field.',
      leftCaption: 'The left eye sees the bird and the far left. The nose limits its view to the right.',
      rightCaption: 'The right eye sees the bird and the far right. The nose limits its view to the left.'
    },
    de: {
      group: 'Gesichtsfeld anzeigen', both: 'Beide Augen', left: 'Linkes Auge', right: 'Rechtes Auge',
      outside: 'Außerhalb des Gesichtsfelds abdunkeln', darkCaption: 'Blasse Umrisse auf Schwarz zeigen, was außerhalb des gewählten Gesichtsfelds liegt.',
      leftCaption: 'Das linke Auge sieht die Amsel und den linken Rand. Zur rechten Seite begrenzt die Nase sein Gesichtsfeld.',
      rightCaption: 'Das rechte Auge sieht die Amsel und den rechten Rand. Zur linken Seite begrenzt die Nase sein Gesichtsfeld.'
    }
  };

  let drawingNumber = 0;

  function svg(viewBox,content) {
    return '<svg class="eg-art" xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox+'" aria-hidden="true" focusable="false">'+content+'</svg>';
  }

  // The blackbird and its warm beak also act as the fixation target.
  function bird() {
    return `<g stroke-linejoin="round" stroke-linecap="round">
      <path d="M-4 8-5 13-9 14m13-7 1 6 4 1" fill="none" stroke="#66543b" stroke-width="1.15"/>
      <path d="M-8 5-24 9-25 6-12 1 Q-8-7 0-6 Q2-15 9-14 Q16-14 15-5 Q14 1 7 6 Q1 10-8 5Z" fill="#35413a" stroke="#25352f" stroke-width="1"/>
      <path d="M15-9 23-7 15-5Z" fill="#d79830" stroke="#87652c" stroke-width=".65"/>
      <path d="M-11 2Q-3-4 5-4 2 1-9 5" fill="#586052"/>
      <circle cx="10.5" cy="-10" r="1.8" fill="#c9aa5e"/><circle cx="11" cy="-10" r="1.05" fill="#26352e"/>
    </g>`;
  }

  // One point inside the gold bill is the fixation target in all three camera positions.
  const beakMark = {x:18.6,y:-7};
  function birdOnTarget(x=0,y=0) {
    return '<g data-beak-sprite transform="translate('+(x-beakMark.x)+' '+(y-beakMark.y)+')">'+bird()+'</g>';
  }

  function blockedEnd(x, y, scale = 1) {
    return `<path transform="translate(${x} ${y}) scale(${scale})" d="M-3.5-3.5 3.5 3.5M-3.5 3.5 3.5-3.5" fill="none" stroke="#a34835" stroke-width="2.05" stroke-linecap="round"/>`;
  }

  function sideFieldPoint([x,y],radius,degrees) {
    const angle=degrees*Math.PI/180;
    return [x+radius*Math.cos(angle),y-radius*Math.sin(angle)];
  }

  function sideFieldOverlay(id,eye,radius) {
    const xy=point=>point.map(v=>Number(v.toFixed(3))).join(' ');
    const [top,upper,lower,bottom]=[90,50,-70,-90].map(angle=>xy(sideFieldPoint(eye,radius,angle)));
    const pupil=xy(eye), arc=`A${radius} ${radius} 0 0 1 `;
    const blocked=`M${pupil}L${top}${arc}${upper}Z M${pupil}L${lower}${arc}${bottom}Z`;
    const admitted=`M${pupil}L${upper}${arc}${lower}Z`;
    const patternScale=Math.max(.68,radius/91);
    return `<g data-field-overlay>
      <defs><pattern id="${id}cut" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="scale(${patternScale})">
        <path d="m-1 1 2-2M0 7 7 0m-1 8 2-2" fill="none" stroke="#b17559" stroke-width="1.1"/>
      </pattern></defs>
      <path d="${blocked}" fill="#cd875d" fill-opacity=".28"/>
      <path d="${blocked}" fill="url(#${id}cut)" opacity=".68"/>
      <path d="${admitted}" fill="#468763" fill-opacity=".39"/>
      <path d="M${top}${arc}${bottom}" fill="none" stroke="#748e7a" stroke-width="${Math.max(1,radius/91*1.25)}"/>
      <g fill="none" stroke="#a34835" stroke-width="${Math.max(1.2,radius/91*1.55)}" stroke-linejoin="round">
        <path data-field-vertical d="M${top}L${bottom}"/>
        <path data-shield-limit="50" d="M${pupil}L${upper}"/>
        <path data-shield-limit="-70" d="M${pupil}L${lower}"/>
      </g>
    </g>`;
  }

  // The room and its return view share the desk and open book.
  // x runs away from the reader, depth runs across the desk, height is above the floor.
  const readerPosition={x:225,depth:83,height:198};
  const readingRoom={wall:632,far:235,height:339};
  const readingWindow={near:29,far:208,bottom:115,top:287,mullion:63,beakDepth:98.4};
  const readingPanel={left:275,right:339,near:39,far:133,rim:3.2};
  const readingDesk={
    left:263,right:375,near:13,far:157,height:113,
    postInsetX:10,postInsetDepth:5.5,halfPost:2.8,thickness:4,
    pages:[
      [[282,86,115],[318,94,117],[312,121,114],[276,113,114]],
      [[288,59,114],[324,67,114],[318,94,117],[282,86,115]]
    ],
    print:[
      [[309,91,116.2],[312,76,114.9]],
      [[304,90,116.0],[307,75.5,114.7]]
    ]
  };

  function drawBook(polygon,segment,angular) {
    const border=angular ? .42 : 1;
    const fill=['#f3ead1','#faf2de'];
    const pages=readingDesk.pages.map((page,i)=>polygon(page,
      'data-book-page="'+i+'" fill="'+fill[i]+'" stroke="#998f71" stroke-width="'+border+'" stroke-linejoin="round"'));
    const lines=readingDesk.print.map(([a,b])=>segment(a,b,'stroke="#b3a585" stroke-width="'+(angular ? .24 : .92)+'"'));
    return pages.join('')+lines.join('');
  }

  // The field chart looks out from the seat in an equidistant projection. Its room
  // illustration moves during the camera turn; its separate field contours stay fixed.
  let angularFurniture='';
  function deskFromEye() {
    if(angularFurniture)return angularFurniture;
    // Framing of the illustrated first-person field map.
    const {height:h,thickness,halfPost,postInsetX,postInsetDepth}=readingDesk,u=h-thickness;
    const left=272,right=382,near=-8,far=164;
    const {x:xEye,depth:depthEye,height:zEye}=readerPosition;
    function project(point) {
      const across=depthEye-point[1],down=zEye-point[2],ahead=point[0]-xEye;
      const offAxis=Math.hypot(across,down);
      const scale=offAxis?Math.atan2(offAxis,ahead)*(180/Math.PI)/offAxis:0;
      return (across*scale).toFixed(2)+','+(down*scale).toFixed(2);
    }
    function outline(points,style,closed) {
      let d='M'+project(points[0]);
      const count=points.length-(closed?0:1);
      for(let i=0;i<count;i++) {
        const a=points[i],b=points[(i+1)%points.length];
        const length=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
        const segments=Math.max(1,Math.ceil(length/5.5));
        for(let j=1;j<=segments;j++) {
          const t=j/segments;
          d+=' '+project(a.map((v,k)=>v+(b[k]-v)*t));
        }
      }
      return '<path d="'+d+(closed?'Z':'')+'" '+style+'/>';
    }
    const polygon=(points,style)=>outline(points,style,true);
    const segment=(a,b,style)=>outline([a,b],'fill="none" '+style,false);
    const floorPlan=[[left,near],[right,near],[right,far],[left,far]];
    function face(a,b,bottom,top,color) {
      return polygon([[...a,bottom],[...b,bottom],[...b,top],[...a,top]],'fill="'+color+'"');
    }
    let art='';
    const posts=[right-postInsetX,left+postInsetX];
    const sides=[near+postInsetDepth,far-postInsetDepth],a=halfPost;
    // At eye height the inward face of each post and its face towards the chair are visible.
    for(const x of posts)for(const d of sides) {
      const sign=d<depthEye?1:-1;
      art+=face([x-a,d+sign*a],[x+a,d+sign*a],0,u,'#8b9d8d')+
        face([x-a,d-a],[x-a,d+a],0,u,'#60796b');
    }
    art+=face([posts[1],sides[0]],[posts[1],sides[1]],u-7.5,u,'#94806a')+
      face(floorPlan[0],floorPlan[3],u,h,'#be9c78');
    art+=polygon(floorPlan.map(p=>[...p,h]),'data-field-desk-top="" fill="#dfc69f" stroke="#907b60" stroke-width=".72" stroke-linejoin="round"');
    angularFurniture=art+drawBook(polygon,segment,true);
    return angularFurniture;
  }

  // World coordinates on the window wall keep the branch, hills and perch in register.
  function windowLandscape(polygon,segment) {
    const w=readingWindow,wall=readingRoom.wall,leaf='#739176';
    const point=([d,h])=>[wall,d,h];
    const patch=(pts,color)=>polygon(pts.map(point),'fill="'+color+'"');
    const ridge=(line,color)=>patch([...line,[w.near,w.bottom],[w.far,w.bottom]],color);
    const stroke=(a,b,size)=>segment(point(a),point(b),'stroke="#647c65" stroke-linecap="round" stroke-width="'+size+'"');
    let art=ridge([[w.far,181],[183,191],[162,194],[142,191],[119,196],[99,200],[76,204],[58,204],[41,211],[w.near,214]],'#b1c3a5')+
      ridge([[w.far,154],[182,164],[160,168],[134,175],[116,174],[93,181],[72,190],[53,193],[w.near,205]],'#88a38b');
    const branch=[[w.far,130],[181,146],[154,156],[129,166],[115,167],[102,168],[87,173],[74,185],[60,211],[46,230],[37,251]];
    branch.slice(1).forEach((v,i)=>{art+=stroke(branch[i],v,2.4);});
    for(const [a,b] of [[[154,156],[171,170]],[[87,173],[79,197]],[[60,211],[46,219]]])art+=stroke(a,b,1.9);
    for(const shape of [[[172,169],[180,170],[187,183],[179,179]],[[79,195],[83,203],[79,213],[76,204]],[[47,217],[41,224],[36,226],[39,220]],[[46,228],[50,238],[47,248],[44,240]]])art+=patch(shape,leaf);
    return art;
  }

  // All furniture and both light paths use this seated, eye-level perspective.
  // Coordinates are illustration units with height measured from the floor.
  function roomScene(id, final, pendant=false) {
    const horizon=148,eyeHeight=readerPosition.height,roomHeight=readingRoom.height,rightWall=readingRoom.wall,farWall=readingRoom.far;
    const scaleAt = depth => 280 / (280 + depth);
    function project(x, depth, height) {
      const scale = scaleAt(depth);
      return [43 + (x - 43) * scale, horizon + (eyeHeight - height) * scale];
    }
    const xy = point => point.map(v => Number(v.toFixed(2))).join(' ');
    const poly = (points, attributes) => '<path d="M' + points.map(p => xy(project(...p))).join('L') + 'Z" ' + attributes + '/>';
    const line = (a,b,attributes) => '<path d="M' + xy(project(...a)) + 'L' + xy(project(...b)) + '" fill="none" ' + attributes + '/>';
    const surface = (x0,x1,d0,d1,z,style) => poly([[x0,d0,z],[x1,d0,z],[x1,d1,z],[x0,d1,z]], style);
    const wallSurface = (d0,d1,z0,z1,style) => poly([[rightWall,d0,z0],[rightWall,d1,z0],[rightWall,d1,z1],[rightWall,d0,z1]],style);
    function slab(x0,x1,d0,d1,top,thickness,colors) {
      const [face,edge,end] = colors;
      return poly([[x0,d0,top-thickness],[x1,d0,top-thickness],[x1,d0,top],[x0,d0,top]],'fill="'+edge+'" stroke="#746f59" stroke-width=".9"') +
        poly([[x0,d0,top-thickness],[x0,d1,top-thickness],[x0,d1,top],[x0,d0,top]],'fill="'+end+'" stroke="#746f59" stroke-width=".9"') +
        surface(x0,x1,d0,d1,top,'fill="'+face+'" stroke="#857e65" stroke-width="1"');
    }
    const {x:xEye,depth:seatDepth}=readerPosition;
    const eye=project(xEye,seatDepth,eyeHeight);
    const pose = (depth,paths) => '<g transform="translate('+xy(project(xEye,depth,eyeHeight))+') scale('+scaleAt(depth).toFixed(5)+')" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g>';
    const back=project(rightWall,farWall,0), high=project(rightWall,farWall,roomHeight);
    const front=project(rightWall,-15,0), upper=project(rightWall,-15,roomHeight);
    const win=readingWindow;
    const glass=[[rightWall,win.near,win.bottom],[rightWall,win.far,win.bottom],[rightWall,win.far,win.top],[rightWall,win.near,win.top]];
    const birdK=.96, beak=project(rightWall,win.beakDepth,eyeHeight);
    const defs=`<defs>
      ${portraitPaint(id)}
      <linearGradient id="${id}back" x1="0" y1="0" x2="100%" y2="72%"><stop stop-color="#c8d8c9"/><stop offset="1" stop-color="#a9c2af"/></linearGradient>
      <linearGradient id="${id}side" x1="100%" y1="5%" x2="0" y2="100%"><stop stop-color="#f1e8ca"/><stop offset="1" stop-color="#ccbd98"/></linearGradient>
      <linearGradient id="${id}sky" x2=".08" y2="1"><stop stop-color="#92c5c7"/><stop offset=".58" stop-color="#d6e8d8"/><stop offset="1" stop-color="#f5e7bf"/></linearGradient>
      <linearGradient id="${id}floor" x2=".4" y2="1"><stop stop-color="#b9c8b4"/><stop offset="1" stop-color="#e6dfc2"/></linearGradient>
      <radialGradient id="${id}sun"><stop stop-color="#fff2bf" stop-opacity=".65"/><stop offset="1" stop-color="#ffedb2" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}contact"><stop stop-color="#536b58" stop-opacity=".94"/><stop offset=".55" stop-color="#536b58" stop-opacity=".65"/><stop offset="1" stop-color="#536b58" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}window">${poly(glass,'')}</clipPath>
    </defs>`;
    let room=`<rect width="600" height="374" fill="#e5e9da"/>
      <path d="M-2 ${high[1]}H${high[0]}V${back[1]}H-2Z" fill="url(#${id}back)"/>
      <path d="M${xy(high)}L${xy(upper)}L${xy(front)}L${xy(back)}Z" fill="url(#${id}side)"/>
      <path d="M-2 ${back[1]}H${back[0]}L${xy(front)}V375H-2Z" fill="url(#${id}floor)"/>
      <g fill="none" stroke="#778d7c" stroke-width="1">
        <path d="M0 ${high[1]}H${high[0]}L${xy(upper)}M${xy(high)}V${back[1]}L${xy(front)}M-2 ${back[1]}H${back[0]}"/>
      </g>`;
    for(const x of [-210,-94,22,138,254,370,486,602]){
      room+=line([x,farWall,0],[x,-43,0],'stroke="#899a86" stroke-width=".8" opacity=".42"');
      room+=line([x,farWall,8],[x,farWall,roomHeight],'stroke="#7a9482" stroke-width=".85" opacity=".43"');
    }
    for(const depth of [-29,5,51,108,175])
      room+=line([-220,depth,0],[rightWall,depth,0],'stroke="#92a28c" stroke-width=".8" opacity=".48"');
    room+=line([-220,farWall,8],[rightWall,farWall,8],'stroke="#92a58f" stroke-width="2"')+
      line([rightWall,farWall,8],[rightWall,-20,8],'stroke="#b2aa8b" stroke-width="2"');
    room+=surface(110,770,-75,200,.1,'fill="url(#'+id+'sun)"');
    // Window frame, one vertical mullion and the sill all lie in the front-wall plane.
    room+=wallSurface(win.near-5,win.far+6,win.bottom-7,win.top+7,'fill="#f5f0dc" stroke="#738778" stroke-width="1.6"')+
      '<g clip-path="url(#'+id+'window)">'+poly(glass,'fill="url(#'+id+'sky)"')+
      windowLandscape(poly,line)+
      '<g data-room-bird transform="translate('+xy(beak)+') scale('+birdK+')">'+birdOnTarget()+'</g></g>'+
      poly(glass,'fill="none" stroke="#647f74" stroke-width="1.8"')+
      wallSurface(win.mullion-2,win.mullion+2,win.bottom,win.top,'fill="#f2efde" stroke="#7c9184" stroke-width=".85"')+
      poly([[rightWall,win.near-7,110],[rightWall,win.far+7,110],[rightWall-7,win.far+7,110],[rightWall-7,win.near-7,110]],'fill="#bea982" stroke="#817e67" stroke-width="1"');
    // The lower, luminous face is the panel seen from the seat in the angular map.
    const panel=readingPanel, rim=panel.rim;
    const housing=[panel.left-rim,panel.right+rim,panel.near-rim,panel.far+rim];
    const ceilingFace=roomHeight-5;
    const panelX=(panel.left+panel.right)/2,panelDepth=(panel.near+panel.far)/2;
    function fixture(height) {
      let wires='';
      if(pendant && height<ceilingFace){
        for(const [x,depth] of [[panel.left+5,panel.far-7],[panel.right-5,panel.near+7]]){
          wires+=line([x,depth,roomHeight],[x,depth,height+4],'stroke="#576c60" stroke-width="1.15"');
        }
      }
      return '<g data-suspension>'+wires+'</g>'+slab(...housing,height+4,4,['#a3ae99','#728576','#607969'])+
        surface(...housing,height,'fill="#738778" stroke="#617667" stroke-width="1"')+
        surface(panel.left,panel.right,panel.near,panel.far,height,'data-panel-face fill="#fff0ac" stroke="#ac9b61" stroke-width="1"');
    }
    room+='<g data-ceiling-panel>'+fixture(ceilingFace)+'</g>';
    const glassLight=project(rightWall,162,eyeHeight);
    const desk=readingDesk,tableHeight=desk.height;
    const postX=[desk.left+desk.postInsetX,desk.right-desk.postInsetX];
    const nearPosts=postX.map(x=>[x,desk.near+desk.postInsetDepth]);
    const farPosts=postX.map(x=>[x,desk.far-desk.postInsetDepth]);
    room+='<g data-room-pupil transform="translate('+xy(eye)+')"></g>';
    const bounce=project(363,80,tableHeight+.1);
    // The seat, shoes and glides share the floor plane used by the desk.
    const chair = { back: 164, front: 237, near: 49, far: 117, top: 75 };
    function floorShadow(x,depth,across,along,opacity,soft=false,turn=0) {
      const a=turn*Math.PI/180, co=Math.cos(a), si=Math.sin(a);
      const c=project(x,depth,.05), s=project(x+across*co,depth+across*si,.05), t=project(x-along*si,depth+along*co,.05);
      return '<circle r="1" transform="matrix('+[s[0]-c[0],s[1]-c[1],t[0]-c[0],t[1]-c[1],...c].map(v=>v.toFixed(3)).join(' ')+')" fill="'+(soft?'url(#'+id+'contact)':'#536b58')+'" opacity="'+opacity+'"/>';
    }
    // Both side frames use the same bends. Only their depth and outward splay differ.
    const chairSides=[{depth:chair.far,splay:-1,far:true},{depth:chair.near,splay:1,far:false}];
    const rearFoot=chair.back-2,frontFoot=chair.front-4;
    const farShoe = {heel:264, depth:104, turn:13}, nearShoe = {heel:274, depth:65, turn:0};
    function footPoint(foot,x,d,z) {
      const a=foot.turn*Math.PI/180, co=Math.cos(a), si=Math.sin(a);
      return [foot.heel+x*co-d*si,foot.depth+x*si+d*co,z];
    }
    const shadows=floorShadow(200,84,57,40,.18,true)+floorShadow((desk.left+desk.right)/2,(desk.near+desk.far)/2,(desk.right-desk.left)*.45,(desk.far-desk.near)*.45,.11,true)+
      chairSides.map(({depth})=>floorShadow(rearFoot,depth,5.2,4,.27)+floorShadow(frontFoot,depth,5.2,4,.27)).join('')+
      [...farPosts,...nearPosts].map(([x,d])=>floorShadow(x,d,6.2,4,.22)).join('')+
      [farShoe,nearShoe].map(foot=>{
        const [x,d]=footPoint(foot,17,0,0);
        return floorShadow(x,d,20,6.8,.26,false,foot.turn);
      }).join('');
    function deskPost(x,d,far) {
      const a=desk.halfPost,top=tableHeight-desk.thickness;
      const face=far?'#788b7e':'#526c61', side=far?'#9ba897':'#7b9280';
      return '<g data-desk-post="'+(far?'far':'near')+'">'+
        poly([[x-a,d+a,0],[x-a,d-a,0],[x-a,d-a,top],[x-a,d+a,top]],'fill="'+side+'"')+
        poly([[x-a,d-a,0],[x+a,d-a,0],[x+a,d-a,top],[x-a,d-a,top]],'fill="'+face+'"')+
        line([x-a,d-a,top],[x-a,d-a,1],'stroke="'+(far?'#93a18f':'#7d9180')+'" stroke-width=".65"')+'</g>';
    }
    // Only the outside edges of a wooden slab have outlines. This lets a leg
    // pass between two depth slices without drawing a seam across the seat.
    function woodSlice(l,r,d0,d1,h,u,colors,near,far) {
      const end=(x,d)=>[x,d,h],low=(x,d)=>[x,d,u];
      const edge='stroke="#81765e" stroke-width="1" stroke-linecap="round"';
      let wood=poly([low(l,d1),low(l,d0),end(l,d0),end(l,d1)],'fill="'+colors[2]+'"')+
        line(low(l,d1),low(l,d0),'stroke="#8d7d65" stroke-width=".8"');
      if(near)wood+=poly([low(l,d0),low(r,d0),end(r,d0),end(l,d0)],'fill="'+colors[1]+'" stroke="#86765e" stroke-width=".85"');
      wood+=surface(l,r,d0,d1,h,'fill="'+colors[0]+'"')+
        line(end(l,d1),end(l,d0),edge)+line(end(r,d1),end(r,d0),edge);
      if(near)wood+=line(end(l,d0),end(r,d0),edge);
      if(far)wood+=line(end(l,d1),end(r,d1),edge);
      return wood;
    }
    function deskHalf(d0,d1,near) {
      const l=desk.left,r=desk.right,h=tableHeight,u=h-desk.thickness;
      // Split at the seated person's depth; the two pieces share an unpainted seam.
      const apronHeight=u-7.5, front=nearPosts[0][1], back=farPosts[0][1];
      let apron=poly([[postX[0],Math.max(d0,front),apronHeight],[postX[0],Math.min(d1,back),apronHeight],
        [postX[0],Math.min(d1,back),u],[postX[0],Math.max(d0,front),u]],'fill="#8b816b"');
      if(near)apron+=poly([[postX[0],front,apronHeight],[postX[1],front,apronHeight],
        [postX[1],front,u],[postX[0],front,u]],'fill="#917e66"');
      const wood=woodSlice(l,r,d0,d1,h,u,['#dfc59e','#b99370','#c7a885'],near,!near);
      return '<g data-desk-top="'+(near?'near':'far')+'">'+apron+wood+'</g>';
    }
    const deskFar=farPosts.map(([x,d])=>deskPost(x,d,true)).join('');
    const deskNear=nearPosts.map(([x,d])=>deskPost(x,d,false)).join('');
    const deskTopFar=deskHalf(seatDepth,desk.far,false);
    const deskTopNear=deskHalf(desk.near,seatDepth,true);
    function chairFrame({depth,splay,far}) {
      const d=depth+4*splay,under=chair.top-4.5,front=chair.front-7,back=chair.back-1;
      const steel=far?'#6b8173':'#526c60',light=far?'#90a18d':'#7c917e',a=2.1;
      // Project the two visible faces of each tube, including the bend behind the seat.
      function tube(spine) {
        const edge=(dx,dd)=>spine.map(([x,y,z])=>[x+dx,y+dd,z]);
        const corner=edge(-a,-a);
        return poly([...corner,...edge(-a,a).reverse()],'fill="'+light+'"')+
          poly([...corner,...edge(a,-a).reverse()],'fill="'+steel+'"');
      }
      const side=far?'far':'near',joint=[back,d,under];
      const rear=tube([[rearFoot,depth,0],joint]);
      const leg=tube([[frontFoot,depth,0],[front,d,under]]);
      const rail=slab(back,front,d-a,d+a,under,4.2,[light,steel,steel]);
      return {base:'<g data-chair-side="'+side+'">'+rail+leg+rear+'</g>',
        upright:'<g data-chair-upright="'+side+'">'+tube([joint,[161,d,121]])+'</g>'};
    }
    const [farFrame,nearFrame]=chairSides.map(chairFrame);
    const board=(x,d,z)=>xy(project(x,d,z));
    // A bent plywood back with two metal uprights and a clear lumbar opening.
    const backFront='M'+board(160,49,138)+'Q'+board(156,91,142)+' '+board(159,138,138)+
      'Q'+board(159,142,138)+' '+board(160,142,135)+'L'+board(164,142,109)+
      'Q'+board(163,142,106)+' '+board(162,138,106)+'Q'+board(159,93,110)+' '+board(166,52,105)+
      'Q'+board(167,48,105)+' '+board(167,48,109)+'L'+board(162,48,135)+'Q'+board(162,48,138)+' '+board(160,49,138)+'Z';
    const backThickness=poly([[159,49,138],[156.5,49,137],[162.5,49,106],[166.5,49,106]],'fill="#9e7654" stroke="#806c50" stroke-width=".75"');
    const chairBack=backThickness+
      '<path data-chair-back d="'+backFront+'" fill="#c59b73" stroke="#82755b" stroke-width="1.05" stroke-linejoin="round"/>'+
      '<path d="M'+board(161,54,134)+'Q'+board(157,91,137)+' '+board(160,136,134)+'" fill="none" stroke="#dbb78c" stroke-width="1"/>';
    const pan=(d0,d1)=>woodSlice(chair.back,chair.front,d0,d1,chair.top,chair.top-4.5,
      ['#cfaa80','#a8825e','#b49067'],d0===chair.near,d1===chair.far);
    // Soles have their own floor plan. Their near and far sides sit at different depths.
    function shoe(foot,far) {
      const S=(x,d,z)=>xy(project(...footPoint(foot,x,d,z)));
      const leather=far?'#826f53':'#aa805e', light=far?'#a08b6c':'#bc9875', edge=far?'#615d48':'#705f49';
      const side='M'+S(0,-4,2.4)+'Q'+S(-1,-4,8)+' '+S(1,-3,15)+'L'+S(4,-4,16)+
        'Q'+S(8,-4,13)+' '+S(13,-4,16)+'Q'+S(16,-4,11)+' '+S(19,-4,9)+
        'L'+S(32,-3,6)+'Q'+S(36,-3,5)+' '+S(35,-3,2.4)+'L'+S(0,-4,2.4)+'Z';
      const upper='M'+S(1,-3,15)+'Q'+S(4,-2,17)+' '+S(4,3,18)+'L'+S(14,4,17)+
        'Q'+S(17,4,11)+' '+S(21,4,9)+'L'+S(33,3,6)+'Q'+S(35,3,5)+' '+S(35,-3,2.4)+
        'L'+S(31,-3,6)+' '+S(19,-4,9)+'Q'+S(16,-4,11)+' '+S(13,-4,16)+
        'Q'+S(8,-4,13)+' '+S(4,-4,16)+'Z';
      const sole='M'+S(0,-4,2.7)+'Q'+S(13,-5,2.2)+' '+S(33,-3,2.7)+'Q'+S(35,-3,3)+' '+S(36,1,3.2)+
        'L'+S(36,1,1.1)+'Q'+S(34,-3,0)+' '+S(30,-3,0)+'L'+S(2,-4,0)+'Q'+S(0,-4,0)+' '+S(0,-4,2.7)+'Z';
      return '<g data-room-shoe="'+(far?'far':'near')+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+upper+'" fill="'+light+'" stroke="'+edge+'" stroke-width=".9"/>'+
        '<path d="'+side+'" fill="'+leather+'" stroke="'+edge+'" stroke-width="1.12"/>'+
        '<path d="'+sole+'" fill="'+edge+'"/>'+
        '<path d="M'+S(16,-4,9.8)+'Q'+S(17,-.5,12)+' '+S(19,1.5,11)+'" fill="none" stroke="'+edge+'" stroke-width=".84"/></g>';
    }
    // Each leg follows its own sagittal plane. The trousers end inside the shoes.
    const backLeg=shoe(farShoe,true)+pose(farShoe.depth,`<path d="M-6 105C9 104 24 107 36 110Q44 111 46 119Q47 126 48 137L53 182Q51 185 41 184L36 139Q35 132 31 130L-5 123Z" fill="#52685c" stroke="#40574b" stroke-width="1.55"/>
      <path d="m40.8 180.9q6.2 1.8 11.6-.9" fill="none" stroke="#718477" stroke-width="1.25"/>`);
    const nearLeg=shoe(nearShoe,false)+pose(nearShoe.depth,`<path d="M-47 99C-28 97-4 100 17 104L39 108Q52 109 55 118Q57 125 57 137L65 182Q63 185 51 185L41 138Q40 132 36 129C18 126 4 124-13 124C-30 124-42 123-47 118C-50 115-50 106-47 99Z" fill="#3c584e" stroke="#2d493d" stroke-width="1.75"/>
      <path d="M42 115q5 .5 8 4m.7 62.6q7.2 1.7 13.1-1" fill="none" stroke="#607769" stroke-width="1.12"/>`);
    const seatedShirt=pose(seatDepth,`<path d="M-32 29q8-6 18-6l12 8q10 9 10 26l2 28q1 12 3 18c-16 5-37 5-53 0-2-2-2-6-1-11-3-25 0-47 9-63Z" fill="#38786a" stroke="#2b584b" stroke-width="1.8"/>
      <path d="M-38 98q13 5 28 4" fill="none" stroke="#73a08a" stroke-width="1.5"/>`);
    const seatedPortrait = art => pose(seatDepth,'<g transform="scale(.5) translate(-193.7 -103.9)">'+art+'</g>');
    const seatedHead = seatedPortrait(readerFace(id));

    const book=drawBook(poly,line,false);
    const arm=pose(seatDepth,`<path d="M-16 42q7-9 15-1l18 26 24 8-1.2 8.1-32-6.1q-4-1-8-6l-15-20q-3-5 0-9Z" fill="#508a77" stroke="#315d4f" stroke-width="1.65"/>
      <path d="M41 84.4c8-.8 20-1.6 28-.3-4.2 1.9-17.2 2.5-28 .3Z" fill="#aa9370" opacity=".5"/>
      <path d="M39.4 75.1c3.8.9 6.7 1.4 10 1.2 5.3-.3 8.4.7 12.5 2.6l7 3.3c1 .6.7 1.8-.4 1.9l-6.8-.9c-1 1.1-3.1 1-5.8.4-3.3-.7-6.8-1.2-9.1-.9-3 .4-5.5.1-8.5-1Z" fill="#dea881" stroke="#81664e" stroke-width="1.15"/>
      <path d="m54.5 79.8 5.9 1.6 4.9 1.8m-13.7-1.9c2 .7 4.2 1.1 5.7 2.1" fill="none" stroke="#af7f5d" stroke-width=".85"/>
      <path d="m38.5 74-.9 8" fill="none" stroke="#315d4f" stroke-width="1.35"/>`);
    const seatedLegs=farFrame.base+farFrame.upright+pan(farShoe.depth,chair.far)+backLeg+
      pan(nearShoe.depth,farShoe.depth)+nearLeg+nearFrame.base+pan(chair.near,nearShoe.depth)+nearFrame.upright+chairBack;
    const furniture=shadows+deskFar+deskTopFar+seatedLegs+seatedShirt+deskNear+deskTopNear+book+arm;
    // Solid, dashed and dotted paths remain identifiable independently of colour.
    const hub=p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.05" fill="#fffaf0" stroke="#086854" stroke-width="1.6"/>';
    const lightLine=(a,b,color,width,dash='')=>{
      const path='M'+xy(a)+'L'+xy(b);
      return '<path d="'+path+'" fill="none" stroke="#fff9e5" stroke-opacity=".91" stroke-width="'+(width+2.3)+'"/><path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
    };
    const gazeEnd=[beak[0]-20*birdK,beak[1]];
    const axis='<g data-room-gaze><path d="M'+xy(eye)+'L'+xy(gazeEnd)+'" stroke="#f7f6e6" stroke-opacity=".68" stroke-width="2.6"/>'+
      '<path d="M'+xy(eye)+'L'+xy(gazeEnd)+'" fill="none" stroke="#2b6460" stroke-width="1.55" stroke-dasharray="2 5"/>'+
      '<g data-room-target transform="translate('+xy(beak)+')"><circle r="5.9" fill="none" stroke="#fff9de" stroke-width="2.2"/>'+
      '<circle r="5.9" fill="none" stroke="#365946" stroke-width=".82"/></g></g>';
    let overlay=axis+seatedHead,updateLamp;
    if(final){
      const r=45, at=(degrees,length)=>sideFieldPoint(eye,length,degrees);
      function limitLabel(hi,lo,cutoff) {
        const edge = at(cutoff,r+5), upper = cutoff>0;
        const label = upper?'+50°':'−70°', wallY = eye[1]+(upper?-51:25), wallX = eye[0]-(upper?26:40);
        const tip = at((hi+lo)/2,r*.86);
        const leader = 'M'+xy(tip)+'L'+xy([eye[0]-(upper?3:18),wallY])+'H'+wallX;
        const side=upper?' eg-upper':'';
        return '<text class="eg-shield-angle eg-limit-near'+side+'" x="'+(edge[0]+4)+'" y="'+(edge[1]+(upper?-1:2))+'">'+label+'</text>'+
          '<g class="eg-limit-callout'+side+'"><path d="'+leader+'" fill="none" stroke="#f6f2e2" stroke-width="3.7"/>'+
          '<path d="'+leader+'" fill="none" stroke="#86553e" stroke-width="1.35"/>'+
          '<circle cx="'+tip[0]+'" cy="'+tip[1]+'" r="2.4" fill="#916047" stroke="#f7f5e6" stroke-width=".9"/>'+
          '<text class="eg-shield-angle" x="'+(wallX-3)+'" y="'+(wallY+5)+'" text-anchor="end">'+label+'</text></g>';
      }
      // Switch to a fine tip near the pupil so the face and lid stay visible.
      const eyeRay = (source, name) => {
        const reflected=name==='desk';
        const dx=source[0]-eye[0], dy=source[1]-eye[1], length=Math.hypot(dx,dy);
        const join=[eye[0]+14*dx/length,eye[1]+14*dy/length];
        const color=reflected?'#14705a':'#006954';
        return '<g data-room-pupil-ray="'+name+'">'+
          lightLine(source,join,color,reflected?2.1:2.2,reflected?'1.2 3.6':'')+
          '<path d="M'+xy(join)+'L'+xy(eye)+'" fill="none" stroke="'+color+'" stroke-width="1.15" stroke-linecap="round"'+(reflected?' stroke-dasharray="1 2.4"':'')+'/></g>';
      };
      const arrowMark=(from,to,fraction)=>{
        const x=from[0]+(to[0]-from[0])*fraction,y=from[1]+(to[1]-from[1])*fraction;
        const angle=Math.atan2(to[1]-from[1],to[0]-from[0])*180/Math.PI;
        return '<path d="m-5-3 5 3-5 3" transform="translate('+xy([x,y])+') rotate('+angle+')" fill="none" stroke="#006751" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
      };
      function lampPaths(height){
        const lamp=project(panelX,panelDepth,height),bounceLamp=project(panelX+12,panelDepth+6,height);
        const dx=lamp[0]-eye[0],dy=lamp[1]-eye[1];
        const admitted=Math.atan2(-dy,dx)<=50*Math.PI/180;
        let direct;
        if(admitted){
          direct=eyeRay(lamp,'lamp')+arrowMark(lamp,eye,.48);
        }else{
          const length=Math.hypot(dx,dy),end=[eye[0]+dx*r/length,eye[1]+dy*r/length];
          direct=lightLine(lamp,end,'#aa4936',2.15,'5 4')+blockedEnd(end[0],end[1]);
        }
        return {admitted,art:lightLine(bounceLamp,bounce,'#267965',1.9,'1.2 4.4')+direct};
      }
      overlay=seatedHead+sideFieldOverlay(id,eye,r)+limitLabel(90,50,50)+limitLabel(-70,-90,-70)+
        '<g data-lamp-paths>'+lampPaths(ceilingFace).art+'</g>'+eyeRay(bounce,'desk')+arrowMark(bounce,eye,.51)+
        eyeRay(glassLight,'window')+arrowMark(glassLight,eye,.68)+hub(glassLight)+hub(bounce)+seatedPortrait(readerEye(id));
      if(pendant){
        const dx=project(panelX,panelDepth,eyeHeight)[0]-eye[0];
        const lowered=eyeHeight+dx*Math.tan(46*Math.PI/180)/scaleAt(panelDepth);
        updateLamp=(lampGroup,rayGroup,fraction)=>{
          const height=ceilingFace+(lowered-ceilingFace)*fraction;
          const paths=lampPaths(height);
          lampGroup.innerHTML=fixture(height);
          rayGroup.innerHTML=paths.art;
          return paths.admitted;
        };
      }
    }
    return {art:svg('0 0 600 372',defs+room+furniture+overlay),updateLamp};
  }

  function windowView(id,lang) {
    const de=lang==='de';
    // The shared polar diagram places its given sprite anchor at (0°, 0°).
    const chart=guideFieldMap.render({id, bird:birdOnTarget(23,-7), furniture:deskFromEye()});
    return `<div class="eg-mono-map">${chart}
      <div class="eg-map-key" aria-hidden="true">
        <span class="eg-both-key"><i class="eg-key-left"></i>${de?'Nur linkes Auge':'Left eye only'}</span>
        <span class="eg-both-key"><i class="eg-key-shared"></i>${de?'Überlappung':'Overlap'}</span>
        <span class="eg-both-key"><i class="eg-key-right"></i>${de?'Nur rechtes Auge':'Right eye only'}</span>
        <span class="eg-single-key eg-single-left"><i class="eg-key-left"></i>${de?'Gesichtsfeld des linken Auges':'Field of the left eye'}</span>
        <span class="eg-single-key eg-single-right"><i class="eg-key-right"></i>${de?'Gesichtsfeld des rechten Auges':'Field of the right eye'}</span>
      </div></div>`;
  }

  const upperLid='M183.8 104.5c3.9-3.7 8.4-5.3 13.6-.8';
  const lowerLidCurve='c-4.1 3.6-9 4.3-13.6.8';
  const readerEyeOpening=upperLid+lowerLidCurve+'Z';

  function portraitPaint(id) {
    return `<linearGradient id="${id}shirt" x1="0" y1="0" x2="1" y2=".42"><stop stop-color="#76a38c"/><stop offset=".6" stop-color="#538a79"/><stop offset="1" stop-color="#3c7162"/></linearGradient>
      <linearGradient id="${id}skin" x1="0" y1=".15" x2="1" y2=".55"><stop stop-color="var(--reader-skin-shadow)"/><stop offset=".53" stop-color="var(--reader-skin-mid)"/><stop offset="1" stop-color="var(--reader-skin-light)"/></linearGradient>
      <clipPath id="${id}eye-opening" clipPathUnits="userSpaceOnUse"><path d="${readerEyeOpening}"/></clipPath>`;
  }

  function readerShirt(id) {
    return `<path d="M59 340c1-27 9-66 19-101 6-24 15-49 26-63 7-9 23-14 33-20l22-7 20 11c16 10 27 36 27 61 0 27-8 49-10 68l4 51Z" fill="url(#${id}shirt)" stroke="#376352" stroke-width="2.2"/>
      <path d="M74 340c4-24 8-47 16-67m94 31c-2 12-1 27 0 36" fill="none" stroke="#4f7f6c" stroke-width="1.5"/>
      <g data-resting-arm>
        <path d="M104 211c1 18 6 37 12 55 5 17 9 34 14 51l6 22h20
          c-2-18-4-39-5-54-1-14-1-22-3-34l-7-40Z"
          fill="url(#${id}skin)" stroke="#795f4a" stroke-width="1.6"/>
        <path d="M105 176c7-7 18-9 27-4s15 16 15 28l1 14q0 3-3 3c-13 0-27 3-40 9-4-8-7-18-8-26 0-10 2-18 8-24Z"
          fill="url(#${id}shirt)" stroke="#416d5a" stroke-width="1.65"/>
        <path d="M103 221c12-6 26-9 40-8" fill="none" stroke="#96b198" stroke-width="1.15"/>
      </g>`;
  }

  function readerEye(id) {
    return `<path d="${readerEyeOpening}" fill="#fff3dc"/>
      <g clip-path="url(#${id}eye-opening)">
        <ellipse cx="193.7" cy="103.9" rx="1.94" ry="2.58" fill="#719087" stroke="#49695d" stroke-width=".30"/>
        <ellipse data-reader-pupil cx="193.7" cy="103.9" rx=".88" ry="1.25" fill="#283d34"/>
        <circle cx="193.38" cy="103.34" r=".26" fill="#fff9e6"/>
      </g>
      <path d="M197.4 103.7${lowerLidCurve}" fill="none" stroke="#897261" stroke-width=".66" stroke-linecap="round"/>
      <path d="${upperLid}" fill="none" stroke="#514e40" stroke-width="1.04" stroke-linecap="round"/>`;
  }

  function readerFace(id, movable=false) {
    const ink = '#344e43';
    const neck=movable?`<path data-guide-neck fill="url(#${id}skin)" stroke="${ink}" stroke-width="1.8"/>
      <g data-guide-head>`:'';
    const jaw=movable?'Q155 144 142 125L131 115Z':'c-2 5-2 13 2 19-2 4-7 7-14 8-13 2-25-4-31-13 5-8 8-20 7-31-.6-7-2.6-12-6-16l-5 1Z';
    return `${neck}<path d="M131 115c-4-13-4-29 3-41 8-17 27-23 43-19 14 4 21 14 23 26l-1 12c0 4 2 7 2 10 1 4 5 9 8 13 1 2 0 4-3 5l-5 1-1 6-3 2 2 3c-1 5-4 11-11 13l-10 1${jaw}" fill="url(#${id}skin)" stroke="${ink}" stroke-width="1.8"/>
      ${movable?'':'<path d="M149 126c9 13 20 19 29 21-3 6-2 11 0 17-13-5-23-19-29-38Z" fill="#c18560" opacity=".60"/>'}
      <path d="M152 132c7 8 15 13 23 14" fill="none" stroke="#a26b50" stroke-width="1.2"/>
      <path d="M111 84c-12-2-17-11-14-20 3-10 14-15 22-11 8 3 9 13 6 20-3 6-7 10-14 11Z" fill="#37473d" stroke="#2f4035" stroke-width="1.8"/>
      <path d="M101 72c-1-9 6-16 13-16m-13 19c4 4 9 5 14 3" fill="none" stroke="#667265" stroke-width="1.3"/>
      <path d="M117 63c7-15 21-22 40-23 15-1 32 4 40 15 4 6 6 15 5 21-4 2-11 4-17 2-3 5-9 9-17 12-2 5-8 9-14 13l-5 8-7 1-4 8c-6-3-14-11-18-19-5-10-7-27-3-38Z" fill="#36443a" stroke="#2f4035" stroke-width="1.9"/>
      <path d="M118 69c6-17 21-26 40-26m-33 42c10-15 17-20 26-26m4 31c9-5 18-12 23-22" fill="none" stroke="#687467" stroke-width="1.1" opacity=".82"/>
      <path d="M152 106c-3-8-11-9-14-3-3 6 1 15 7 18 4 2 8 0 9-3" fill="#d99e76" stroke="#745946" stroke-width="1.35"/>
      <path d="M141 108q2-7 7-2l1 4-4 1 3 4" stroke="#986d52" fill="none" stroke-width="1.2"/>
      <path d="M182 95c4-3 8-4 13-2l2 2c-6-1-9-1-14 2Z" fill="#465044"/>
      ${readerEye(id)}
      <path d="M201 117q2 1 4 0m-13 12q4 1 8-1m-5 6 2-.3" fill="none" stroke="#8d634c" stroke-width="1.05"/>
      ${movable?'</g>':''}
      <path d="M129 158c10 9 23 16 36 14 6 0 12-4 15-8l4 4c-5 8-12 12-21 12-15 0-29-8-38-18Z" fill="#326c59" stroke="#406f5b" stroke-width="1.15"/>
      <path d="M129 160c11 10 24 16 36 15 7-1 13-4 16-7" stroke="#97b29a" stroke-width="1.1" fill="none"/>`;
  }

  function sensor(id, lang) {
    const de = lang === 'de';
    const green = '#006a53';
    const room = `<rect width="600" height="340" fill="url(#${id}wash)"/>
      <path d="M0 0h551l-169 54H0Z" fill="#e3e8db"/>
      <path d="M382 54 551 0h49v340H448l-66-70Z" fill="#eae9d9"/>
      <path d="M0 270h382l66 70H0Z" fill="#dfe4d4"/>
      <g fill="none" stroke="#b5c1aa" stroke-width=".9">
        <path d="M0 54h382L551 0M382 54v216L448 340M0 270h382"/>
        <path d="m146 0 41.5 54m72-54-17.5 54" opacity=".48"/>
      </g>
      <g stroke-linecap="round" stroke-linejoin="round">
        <path d="m422 66 90-17.45v154.72L422 172Z" fill="#e3dfc8" stroke="#839587" stroke-width="1.65"/>
        <path d="m427 69.2 79-13.68v140.81L427 171.3Z" fill="url(#${id}sky)" stroke="#98aa9a" stroke-width="1.05"/>
        <path d="M460 63.5v118.25" stroke="#9daa92" stroke-width="3.9"/>
        <path d="M459 64v117.15" stroke="#eeefdf" stroke-width="2"/>
        <path d="M434 72v46m6-47v20" stroke="#f1f5e8" stroke-width="1.35" opacity=".72"/>
        <path d="m421.5 171.8 90.6 31.2 4.15 3.75-.2 2.2-96.55-33.2Z" fill="#c7b998" stroke="#8b967f" stroke-width=".95"/>
      </g>`;
    // The panel is recessed into the ceiling. Its long edges run across the room.
    const panel = `<g stroke-linejoin="round">
      <path d="M274 43 296.82 14h85.57L332 43Z" fill="#afb9aa" stroke="#758578" stroke-width="1.55"/>
      <path d="m278.35 41.05 20.67-24.85h71.2l-40.87 24.85Z" fill="#fff2b8" stroke="#c0ad77" stroke-width="1.05"/>
      <path d="m282 38.9 17.7-21.25h65.1" fill="none" stroke="#fff9d9" stroke-width="1"/>
    </g>`;
    const field = `<path d="M239 19a85 85 0 0 1 0 170Z" fill="url(#${id}field)"/>
      <path d="M239 19a85 85 0 0 1 0 170" fill="none" stroke="#759985" stroke-width="1.4"/>
      <path d="M239 19v170" fill="none" stroke="#92ab98" stroke-width="1" stroke-dasharray="3 4"/>`;
    // The back of the left hand faces us. Four fingers curl around the stem,
    // with the thumb opposing them on the hidden side of the grip.
    const farArm=`<path d="M185 190C187 205 191 217 202 229c10.8 11.7 22.7 21 34.4 25.9 6.1 2.6 12.4 1.5 16.2-2.8 4.1-4.8 5.4-11.8 5.2-19.8-.3-16.3-1.4-33.6-2.5-49.4-.7-10.7-1.3-22-1.9-31.9
        C253 144.4 253.3 137.8 251.6 132.1C250.7 128.9 248.8 125.7 246.3 122.9
        C244.4 120.9 243.4 118.1 240.5 117.1C237.4 115.9 233.6 115.5 229.7 115.9
        C226.6 116.1 224.2 117.5 223.3 119.2C222.5 120.8 222.8 122.3 224.6 123.2
        C222.5 123.8 221.4 125.3 221.9 127.1C222.2 128.5 223.1 129.5 224.8 130
        C223.1 130.7 222.7 132.1 223.2 133.7C223.6 135.1 224.7 136 226.3 136.4
        C225 137.3 225.1 139 225.8 140.2C226.9 142 228.7 142.7 231 143.1
        C233.8 143.6 235 146.2 237.3 148.7C239.6 150.9 240.8 152.3 240.4 154.5
        c-1.7 10-3.1 21.5-3.7 33.8-.6 13.3-.2 24.4 1.4 34.6-5.3-4.4-11.7-13.7-17.3-21.7-6.3-8.9-13.9-17.1-20.6-21.7Z"
        fill="#d39b74" stroke="#785e4a" stroke-width="1.52"/>
      <g fill="none" stroke-linecap="round">
        <path d="M224.6 123.2c2.2-1.4 5.5-1.9 8-1.6 2.3.2 4.8 1.8 6.6 2.7
                 M224.8 130c2-1.4 4.8-2.1 7.1-1.8 2.5.2 4.6 1.5 6.7 2.6
                 M226.3 136.4c1.6-1.2 4-1.8 6-1.5 1.9.2 3.7 1.1 5.2 2" stroke="#86664d" stroke-width="1.08"/>
        <path d="M227 118.1c1.6-.8 3.4-1 5.1-.8m-6.8 7.6c1.5-.9 3.2-1.3 5.1-1.2m-4.7 8c1.6-.9 2.8-1.2 4.4-1.1m-2.6 7.7c1.1-.7 2.1-.9 3.4-1"
          stroke="#e9ba93" stroke-width=".88"/>
        <path d="M239.7 120.2q1.4.1 2.1 1.3m-.6 7.6q1 .1 1.8 1.1m-1.4 13.8q1.9 2.6 4.1 3.8"
          stroke="#b98260" stroke-width=".78"/>
      </g>
      <path d="M237.8 222.6q2 2.4 3.4 5.2m-4.6 21.7c3.1 1.9 6.7 2.1 9.6.6" fill="none" stroke="#b27d5c" stroke-width="1.1"/>
      <path d="M168 163c11.2-1 20.5 4.8 29.1 12.3 7.8 6.8 15.4 15 22 23.1-6.3 7.9-14.1 15-22.8 21.2l-28.8-26.9Z" fill="#497d6a" stroke="#416b59" stroke-width="1.55"/>
      <path d="M194.5 216.4q11.9-8 20.8-18.2" fill="none" stroke="#8da78d" stroke-width="1.05"/>`;
    const torso=`<path d="M129 159c-11.6 3.9-22 10.3-29.5 19.9-10.9 14.4-15.3 36.9-15.6 61.8 0 16.1 3.9 30.3 7.7 43.6 4.6 15.1 7.2 32.5 7.5 55.7h115.4c.2-17.5-3.4-33.7-6.7-51.3-3.3-16.4-6-30.6-4-44.8 2.2-13.3 2.9-25.4-2-37.6-5.7-14.1-11.4-30.6-22.8-43.8l-15.5-11.3Z" fill="url(#${id}shirt)" stroke="#376352" stroke-width="1.9"/>
      <path d="M98.4 274.4c5 10.7 13.5 16.8 24 19.4m64.2-44.9c5.8 8.5 6.8 17.7 5 26.7m-4.8 53.5 9.1 2.5" stroke="#4f7f6c" fill="none" stroke-width="1.15"/>`;
    const probe=`<path d="M198 104h25" stroke="#577969" stroke-width="1.1" stroke-dasharray="1.5 2.4"/>
      <path d="M225.4 105h7.6v34.7c-.6 2.4-5.8 3.4-7.6.3Z" fill="#4e6959" stroke="#40594a" stroke-width="1.15"/>
      <path d="M224.5 94q1.3-1.3 4.4-1.3h5.5l2.9 3.8v15.1l-3 2.5h-6.2c-3.5-.4-4.6-2.4-4.6-5.4v-11q0-2.2 1-3.7Z" fill="#809884" stroke="#425b4e" stroke-width="1.35"/>
      <path data-held-sensor d="M233 93.6c3.9-.2 6.1 4.3 6.1 10.3 0 5.7-2 9.6-6 10.3-1.7-5.2-1.8-14.6-.1-20.6Z" fill="#fffef2" stroke="#5b7466" stroke-width="1.15"/>
      <path d="M226.9 140.9h4.8v3.4q-2.2 2-4.8.5Z" fill="#485d50"/>`;
    const arm=`<path d="M123 229l39.5-5.1c4.1 20.2 9.8 45.5 15.3 61.5l10.8-5.3c20.9-10.3 46.9-21.2 68.6-34.8
        C 262.07 240.44 266.47 236.77 269.57 232.21 C 272.83 227.21 277.06 223.39 281.95 219.42 L 289.61 213.1
        C 292.39 210.9 294.34 209.57 296.95 209.13 C 299.56 208.69 301.68 209.43 303.31 209.22 L 306.08 208.68
        C 307.38 208.46 308.36 209.18 308.44 210.31 C 308.52 212 306.81 213.69 304.86 214.78 C 301.43 216.6 298.01 216.92 295.3 219.13
        L 293.51 221.04 C 298.5 220.89 304.27 219.72 308.62 218.16 C312.9 216.8 316.5 214.3 318.1 212.1c-.8-.8-1.1-2-.5-2.8.8-1 2.5-.6 3.8.6 2 1.9 2.8 4.4 2.4 6.5
        C 323.36 218.76 321.81 220.42 319.49 222.01 C 316.07 224.38 311.47 226.33 307.77 228.02 C 311.69 226.87 316.35 224.52 320.31 221.91
        C 320.68 224.63 319.84 226.95 318.16 228.83 C 316.36 230.92 313.17 232.55 309.34 234.47 C 310.84 233.92 312.68 233 314.13 231.96
        C 313.51 234.18 312.13 236.05 310.2 237.52 C 308.18 239.09 305.8 240.34 303.36 241.32 C 301.76 243.88 299.56 245.88 296.43 247.19
        C 292.3 248.95 287.19 249.12 282.79 249.7 C 277.98 250.32 273.54 252.22 269.32 254.23
        C260 261.8 256.7 267.3 249.6 274.7c-14.8 15.3-29.2 27.5-45 37.3-12.5 7.8-24.5 13-33.7 11.1-9.4-1.5-15.5-9.3-23.2-23.8-12.6-22.9-21.2-48.7-24.7-70.3Z"
        fill="url(#${id}skin)" stroke="#795f4a" stroke-width="1.5"/>
      <path d="M174.5 296.2c-.1-3.6 1.2-7.7 3.2-10m-12.8 29.3c3.7 2.4 8.6 3.3 13.3 1.9" fill="none" stroke="#b8805d" stroke-width="1.05"/>
      <path d="M100 179.3c7-9.5 17-15.3 26-14.8 17.1 1.1 28.9 13.7 33.5 28.9l9.7 36.7c-13.5-.7-29.1 4.4-42.5 13.9-9.1-5.5-18.8-13.6-24.6-25.9-6.7-14.3-8.4-26.9-2.1-38.8Z" fill="url(#${id}shirt)"/>
      <path d="M125.5 165c16.9.3 29.4 13.1 34 28.4l9.7 36.7c-13.5-.7-29.1 4.4-42.5 13.9-6.4-4-11.5-8.2-16-13.9" fill="none" stroke="#416d5a" stroke-width="1.55"/>
      <path d="M126.8 240.1c13.8-9 27.2-12.8 39.7-13.5" fill="none" stroke="#96b198" stroke-width="1.15"/>`;
    // The near hand cradles the case. Its thumb rests on the front bezel;
    // the fingers on the other side wrap back towards the palm.
    const meter=`<path d="M310 219c1.5-4.3 2.9-9.8 5.3-12.3 1.1-1.2 2.6-1.2 3.7-.1 1.5 1.6 2.4 3.5 2.8 6.4l-4.2 7.1Z" fill="#ce966f" stroke="#896b50" stroke-width="1.15"/>
      <g transform="matrix(.56 -.135 -.39 .835 301.2 185)">
      <path d="M5.5 0h33q3.3 0 5.4 1.3l3.3 2.2q2.8 1.9 2.8 5.3v66q0 5.2-5.5 5.2h-33q-2.8 0-5.1-1.6L2.8 76Z" fill="#425d50" stroke="#334b3e" stroke-width="1.8"/>
      <path d="M44 6l4.8 3v64q0 3.6-4 5.3l-3.4-2.7q2.6-1.3 2.6-4Z" fill="#375146"/>
      <rect width="44" height="76" rx="5.5" fill="#678671" stroke="#354e42" stroke-width="1.9"/>
      <path d="M3 9q.2-5.9 5.2-5.9h28.6" fill="none" stroke="#a8b99d" stroke-width="1.15"/>
      <rect x="3.8" y="7" width="36.6" height="29.5" rx="2.6" fill="url(#${id}screen)" stroke="#354f40" stroke-width="1.5"/>
      <text x="6.5" y="24" fill="#263e32" font-family="var(--sans)" font-size="15.7" font-weight="680"><tspan textLength="22.1" lengthAdjust="spacingAndGlyphs">250</tspan><tspan x="30.3" font-size="8.2" textLength="7" lengthAdjust="spacingAndGlyphs"> lx</tspan></text>
      <path d="M8 42h11m-11 4h7" stroke="#b0c2a3" stroke-width="1.5"/>
      <rect x="24" y="77" width="7" height="4.3" rx="1.3" fill="#394e43"/>
    </g>`;
    const handDetail=`<g transform="translate(321.4 186.2) scale(.163 .147) translate(-1450 -432)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1334 592c8.3-.6 17.2-4.8 22.7-4.2 6.3.6 8 6.2 5.1 13-2.7 6.4-9.2 11.1-16.4 12.1-7.2.9-13.5-9.7-11.4-20.9Z" fill="#efc8ab" stroke="#c59477" stroke-width="3.2"/>
      <path d="M1175 776c28-26 51-33 76-42m39-76-13.7 12.8m60 133.8 26.8-13.1" fill="none" stroke="#bd8868" stroke-width="4.1"/>
    </g>`;
    const cablePath='M229.2 144.5c0 37.5 2.6 93.5 16.3 126.2 8.6 20.5 20.5 27.6 29.1 17.7 C281.5 280.5 284.4 262.7 285.2 248.8';
    const cable=`<path d="${cablePath}" fill="none" stroke="#eae4cf" stroke-width="3.6"/><path d="${cablePath}" fill="none" stroke="#4b6153" stroke-width="2.1"/>`;
    const ray = (path, arrow) => `<path d="${path}" fill="none" stroke="#fffced" stroke-width="5"/>
      <path d="${path}" fill="none" stroke="${green}" stroke-width="2.55"/>
      <path d="${arrow}" fill="${green}" stroke="#fffced" stroke-width="1.05" paint-order="stroke fill"/>`;
    const rays = `${ray('M478 104H239', 'm372 104 8.5-4v8Z')}
      ${ray('M318 31.3 239 104', 'm268.5 76.85 3.5-8.5 5.35 5.85Z')}
      <circle cx="478" cy="104" r="3" fill="#f6f8e8" stroke="${green}" stroke-width="1.45"/>
      <circle cx="318" cy="31.3" r="2.65" fill="#fff5cc" stroke="${green}" stroke-width="1.45"/>
      <circle cx="239" cy="104" r="3" fill="#fffcef" stroke="${green}" stroke-width="1.45"/>
      <circle cx="239" cy="104" r="1.05" fill="${green}"/>`;
    const labels = `<g class="eg-held-label" fill="#3a5d4e" font-family="var(--sans)" font-size="15" font-weight="580">
      <path d="M174 22h14l39 67" fill="none" stroke="#788b79" stroke-width="1.05"/>
      <text x="167" y="26" text-anchor="end">Sensor</text>
      <path d="M324.5 189.2 348 215h10" fill="none" stroke="#788b79" stroke-width="1.05"/>
      <text x="359" y="223">${de?'Luxmeter':'Lux meter'}</text>
    </g>`;
    return svg('0 0 600 340', `<defs>
      <linearGradient id="${id}wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ecf0e2"/><stop offset=".64" stop-color="#f8f4e5"/><stop offset="1" stop-color="#e0e5d4"/></linearGradient>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a4ced0"/><stop offset=".7" stop-color="#ddebdc"/><stop offset="1" stop-color="#f4efd4"/></linearGradient>
      <linearGradient id="${id}field" x1="0" y1="0" x2="1" y2=".35"><stop stop-color="#e0eddc" stop-opacity=".48"/><stop offset="1" stop-color="#b1cfb6" stop-opacity=".64"/></linearGradient>
      ${portraitPaint(id)}
      <linearGradient id="${id}screen" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#e9efd1"/><stop offset="1" stop-color="#c7d6ad"/></linearGradient>
    </defs>
      <g stroke-linecap="round" stroke-linejoin="round">
        ${room}${panel}${field}${probe}${farArm}${torso}${readerFace(id)}${cable}${meter}${arm}${handDetail}${rays}${labels}
      </g>`);
  }

  function fieldLimits(id,lang) {
    const de=lang==='de';
    // The rays bound a vertical section through the gaze. Their endpoints are
    // the +50° and −70° directions on the same radius about the pupil.
    const profilePose = 'translate(132 123) scale(.81) translate(-193.7 -103.9)';
    const side=svg('-4 -15 301 279',`<defs>
      ${portraitPaint(id)}
    </defs>
    <g transform="${profilePose}" stroke-linecap="round" stroke-linejoin="round">
      ${readerShirt(id)}
      ${readerFace(id,true)}
    </g>
    <g data-guide-field>${sideFieldOverlay(id,[132,123],91)}
    <g data-gaze-axis fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M136 123h98" stroke="#315a4d" stroke-dasharray="4 4" stroke-width="1.5"/>
      <path d="m230 119 6 4-6 4" stroke="#315a4d" stroke-width="1.55"/>
    </g>
    </g>
    <g transform="${profilePose}" stroke-linecap="round" stroke-linejoin="round"><g data-guide-eye>${readerEye(id)}</g></g>
    <g class="eg-limit-degrees" fill="#213f34" font-size="17">
      <text data-relative-angle="50">+50°</text><text data-relative-angle="0">0°</text><text data-relative-angle="-70">−70°</text>
    </g>`);
    const top=svg('0 0 230 205',`<path d="M45 125a70 70 0 0 1 140 0Z" fill="#a8c7b0" stroke="#698e78" stroke-width="1.2"/>
      <g fill="none" stroke="#38795c" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">
        <path d="M31 125a84 84 0 0 1 55.3-79 M143.7 46a84 84 0 0 1 55.3 79"/>
        <path d="m27.4 118.5 3.6 6.5 4.4-6m159.3 0 4.3 6 3.7-6.5"/>
      </g>
      <g stroke="#59715d" stroke-linecap="round" stroke-linejoin="round">
        <path d="M64 179q5-12 23-15l15-4h26l15 4q18 3 23 15l-6 10H70Z" fill="#739682" stroke-width="1.1"/>
        <path d="m87 168-3 9m60-9 3 9m-48-7q16 12 32 0" fill="none" stroke="#527f69" stroke-width="1"/>
        <path d="M100 143q-7-7-8 2 1 7 7 8m32-10q7-7 8 2-1 7-7 8" fill="#d9a381" stroke-width="1.1"/>
        <path d="M96 137q-1-14 10-17l6-6q3-6 6 0l6 6q13 2 12 17v14q-1 18-20 20-20 0-20-20Z" fill="#dbac85" stroke-width="1.2"/>
        <ellipse cx="116" cy="172" rx="10" ry="8" fill="#3b443a" stroke-width="1"/>
        <path d="M95 139q2-7 7-8l5 3q8 2 16 0l7-3q7 2 7 12 0 18-12 26-9 6-19 0-14-8-11-30Z" fill="#404b40"/>
        <path d="M102 138q-7 15 5 23m23-23q8 11-2 23m-16 11q4 3 9-1" fill="none" stroke="#75806e" stroke-width="1"/>
        <path d="M103 124q3-2 5 0m14 0q3-2 5 0" fill="none" stroke-width="1.5"/>
      </g>
      <path d="M31 125H199" fill="none" stroke="#517562" stroke-width="1.15"/>
      <g fill="none" stroke="#315a4d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M115 121V66" stroke-dasharray="3.5 4"/><path d="m111.5 70 3.5-6 3.5 6"/>
      </g>
      <circle cx="115" cy="125" r="3.7" fill="#fff9e8" stroke="#335d4a" stroke-width="1.25"/><circle cx="115" cy="125" r="1.4" fill="#253a31"/>
      <g class="eg-limit-degrees" fill="#213f34" font-size="16">
        <text x="115" y="46" text-anchor="middle" font-size="21">180°</text><text x="124" y="83">0°</text>
        <text x="30" y="147" text-anchor="middle">−90°</text><text x="199" y="147" text-anchor="middle">+90°</text>
      </g>`);
    return `<div class="eg-limits"><div class="eg-diagram-pair">
      <div class="eg-limit-panel"><span>${de?'Von der Seite':'From the side'}</span>${side}</div>
      <div class="eg-limit-panel"><span>${de?'Von oben':'From above'}</span>${top}</div></div>
      <div class="eg-limit-key" aria-hidden="true"><span><i class="eg-key-retained"></i>${de?'Erfasst':'Detected'}</span><span><i class="eg-key-blocked"></i>${de?'Abgeblendet':'Blocked'}</span></div>
    </div>`;
  }

  // Eye displacement and height in metres, from modell.R's exported poses.
  // The lightweight guide uses the same five-degree stops as the experiments.
  const guideEyePositions=[
    [0.061064811, 1.077153845], [0.05732387, 1.092705237], [0.05272336, 1.107864923], [0.047305363, 1.122596442],
    [0.041111503, 1.136863988], [0.034183514, 1.150632054], [0.026563807, 1.163865192], [0.018296021, 1.176527909],
    [0.009425548, 1.188584669], [0, 1.2], [-0.010340427, 1.210811671], [-0.021961757, 1.221000521],
    [-0.034816759, 1.230445817], [-0.04884852, 1.239027363], [-0.063990062, 1.246626236], [-0.08016397, 1.253125584]
  ];

  function gazeControl(lang) {
    const de=lang==='de';
    return `<div class="eg-gaze-control">
      <label for="guide-gaze">${de?'Blickneigung in der Seitenansicht':'Gaze angle in the side view'}</label>
      <output for="guide-gaze"></output>
      <input id="guide-gaze" type="range" min="-45" max="30" step="5" value="0">
      <div class="eg-gaze-ends" aria-hidden="true"><span>−45° · ${de?'nach unten':'down'}</span><span>+30° · ${de?'nach oben':'up'}</span></div>
    </div>`;
  }

  function installGaze(host,lang,initial) {
    const range=host.querySelector('#guide-gaze'), output=host.querySelector('.eg-gaze-control output');
    const side=host.querySelector('.eg-limit-panel svg'), eyeX=193.7,eyeY=103.9;
    const head=side.querySelector('[data-guide-head]'), eye=side.querySelector('[data-guide-eye]');
    const neck=side.querySelector('[data-guide-neck]'), field=side.querySelector('[data-guide-field]');
    const labels=side.querySelectorAll('[data-relative-angle]');
    const directions=lang==='de'?['nach unten','geradeaus','nach oben']:['down','level','up'];
    function draw(){
      const angle=Number(range.value),[forward,height]=guideEyePositions[(angle+45)/5];
      // The portrait is drawn at 300 units/m, then scaled by .81 in the chart.
      const dx=300*forward, dy=300*(1.2-height);
      const pose=new DOMMatrix().translate(eyeX+dx,eyeY+dy).rotate(-angle).translate(-eyeX,-eyeY);
      const onHead=(x,y)=>{const p=pose.transformPoint({x,y});return p.x+' '+p.y;};
      head.setAttribute('transform',pose.toString());
      eye.setAttribute('transform',pose.toString());
      neck.setAttribute('d',`M${onHead(138,111)} C${onHead(145,132)} 141 148 131 160 Q155 184 181 165 C175 156 ${onHead(174,149)} ${onHead(177,141)} Z`);
      const pupil=[132+.81*dx,123+.81*dy];
      field.setAttribute('transform',`translate(${pupil.join(' ')}) rotate(${-angle}) translate(-132 -123)`);
      for(const label of labels){
        const relative=Number(label.dataset.relativeAngle),direction=relative+angle;
        const [x,y]=sideFieldPoint(pupil,relative===0?109:100,direction);
        const horiz=Math.cos(direction*Math.PI/180);
        label.setAttribute('text-anchor',horiz>.35?'start':horiz<-.35?'end':'middle');
        label.setAttribute('x',x);label.setAttribute('y',y+(relative===0?5:direction>0?-1:10));
      }
      const value=(angle<0?'−':angle>0?'+':'')+Math.abs(angle)+'° · '+directions[Math.sign(angle)+1];
      output.value=value;range.setAttribute('aria-valuetext',value);
    }
    range.value=String(initial);range.addEventListener('input',draw);draw();
  }

  function readingKey(step,lang) {
    const de=lang==='de';
    const keys=step===2?[
      ['direct',de?'Vom offenen Sensor erfasst':'Admitted by the open sensor']
    ]:step===4||step===5?[
      ['direct',de?'Erfasst':'Admitted'],
      ['blocked',de?'Abgeblendet':'Blocked'],
      ['bounce',de?'Über den Tisch':'Via the desk'],
      ['cap',de?'Oben +50° · unten −70°':'Upper +50° · lower −70°']
    ]:[];
    if(!keys.length)return '';
    return '<div class="eg-reading-key">'+keys.map(([key,label])=>{
      const symbol = key === 'blocked'
        ? '<svg class="eg-blocked-marker" viewBox="0 0 24 10" aria-hidden="true"><path d="M1 5h19" stroke="#aa4936" stroke-width="1.75" stroke-dasharray="3 2"/>'+blockedEnd(20,5,.67)+'</svg>'
        : '<i aria-hidden="true" class="eg-key-'+key+'"></i>';
      return '<span>'+symbol+label+'</span>';
    }).join('')+'</div>';
  }

  function references(step,lang) {
    const de=lang==='de';
    if(step===1)return '<a class="eg-reference" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10530223/#clockssleep-05-00032-f001" target="_blank" rel="noopener noreferrer">'+(de?'Zauner, Broszio &amp; Bieske (2023), Abb. 1a':'Zauner, Broszio &amp; Bieske (2023), Fig. 1a')+'</a>';
    if(step===3)return '<a class="eg-reference" href="https://doi.org/10.25039/S026.2018" target="_blank" rel="noopener noreferrer">CIE S 026/E:2018, '+(de?'Anhang A.6, Tabelle A.4':'Annex A.6, Table A.4')+'</a>';
    if(step===5)return '<a class="eg-reference" href="https://doi.org/10.1371/journal.pbio.3001571" target="_blank" rel="noopener noreferrer">'+(de?'Licht am Tag und am Abend':'Daytime and evening light')+' · Brown et al. (2022)</a>';
    return '';
  }

  function pendantControls(lang) {
    const de=lang==='de';
    return '<div class="eg-lamp-controls"><div class="eg-eye-options" role="group" aria-label="'+(de?'Höhe der Leuchte':'Lamp height')+'">'+
      '<button type="button" data-lamp-position="0">'+(de?'An der Decke':'At the ceiling')+'</button>'+
      '<button type="button" data-lamp-position="1">'+(de?'Abgehängt':'Suspended')+'</button></div>'+
      '<output class="eg-lamp-status" aria-live="polite"></output></div>';
  }

  function installPendant(host,lang,updateLamp) {
    const fixture=host.querySelector('[data-ceiling-panel]'),rays=host.querySelector('[data-lamp-paths]');
    const controls=host.querySelector('.eg-lamp-controls'),status=controls.querySelector('output');
    const buttons=controls.querySelectorAll('button'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const states=lang==='de'?['Direkter Strahl abgeblendet','Direkter Strahl erfasst']:['Direct ray blocked','Direct ray admitted'];
    let fraction=0,request=0;
    function show(value) {
      fraction=value;
      const admitted=updateLamp(fixture,rays,value),state=admitted?'admitted':'blocked';
      if(status.dataset.state===state)return;
      status.dataset.state=state;
      status.textContent=states[Number(admitted)];
    }
    function moveTo(target,delay=0) {
      cancelAnimationFrame(request);
      for(const button of buttons)button.setAttribute('aria-pressed',String(Number(button.dataset.lampPosition)===target));
      if(reduce.matches||fraction===target){show(target);return;}
      const from=fraction,start=performance.now()+delay,duration=1800*Math.abs(target-from);
      function tick(now) {
        if(!fixture.isConnected)return;
        const t=reduce.matches?1:Math.min(1,Math.max(0,(now-start)/duration));
        if(t>0)show(from+(target-from)*t*t*(3-2*t));
        if(t<1)request=requestAnimationFrame(tick);
      }
      request=requestAnimationFrame(tick);
    }
    controls.addEventListener('click',event=>{
      const button=event.target.closest('[data-lamp-position]');
      if(button)moveTo(Number(button.dataset.lampPosition));
    });
    show(0);moveTo(1,420);
  }

  let darkenOutside=true;
  function installEyeSwitch(host,lang,selection) {
    const group=host.querySelector('.eg-eye-options');
    const frame=host.querySelector('.eg-frame'),caption=frame.querySelector('figcaption');
    const toggle=frame.querySelector('[data-dark-field]'),traces=frame.querySelector('[data-field-traces]');
    toggle.checked=darkenOutside;
    function show(selected) {
      frame.dataset.eye=selected;
      frame.dataset.outside=toggle.checked?'dark':'normal';
      if(toggle.checked&&!traces.childElementCount){
        for(const path of frame.querySelector('[data-field-room]').children){
          const line=document.createElementNS(traces.namespaceURI,'path');
          line.setAttribute('d',path.getAttribute('d'));
          traces.append(line);
        }
      }
      for(const option of group.querySelectorAll('button'))
        option.setAttribute('aria-pressed',String(option.dataset.eye===selected));
      const note=toggle.checked?' '+fieldOptions[lang].darkCaption:'';
      const detail=selected==='both'?story[lang][1].caption:fieldOptions[lang][selected+'Caption'];
      caption.textContent=detail+note;
      frame.querySelector('.eg-image').setAttribute('aria-label',(selected==='both'?story[lang][1].alt:detail)+note);
    }
    show(selection);
    toggle.addEventListener('change',()=>{darkenOutside=toggle.checked;show(frame.dataset.eye);});
    group.addEventListener('click',event=>{
      const button=event.target.closest('button[data-eye]');
      if(button)show(button.dataset.eye);
    });
  }

  const eyeCamera=new WeakMap();

  // Reproject only the coloured room illustration during the turn. The underlying
  // anatomical contours, angle labels and rings remain the ordinary step-two chart.
  function movingRoom(chart) {
    const illustration=chart.querySelector('[data-field-room]');
    if(!illustration)return null;
    const ns=chart.namespaceURI,radians=Math.PI/180;
    const drawing=document.createElementNS(ns,'svg');
    drawing.setAttribute('viewBox',chart.getAttribute('viewBox'));
    drawing.setAttribute('preserveAspectRatio','xMidYMid meet');
    drawing.classList.add('eg-camera-turn');
    const paths=[];
    function direction(x,y) {
      const length=Math.hypot(x,y);
      const scale=length ? Math.sin(length*radians)/length : radians;
      return [x*scale,y*scale,Math.cos(length*radians)];
    }
    for(const source of illustration.children) {
      const d=source.getAttribute('d');
      if(!d || /[ACHQSTV]/i.test(d))return null;
      const points=Array.from(d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g),p=>direction(Number(p[1]),Number(p[2])));
      if(!points.length)return null;
      const path=source.cloneNode(false);
      paths.push({path,points,closed:/z\s*$/i.test(d)});
      drawing.append(path);
    }
    const birdGroup=document.createElementNS(ns,'g');
    birdGroup.setAttribute('data-camera-beak','');
    birdGroup.innerHTML='<g transform="scale(.30)">'+birdOnTarget()+'</g>'+
      '<circle r="2.7" fill="none" stroke="#fffdf1" stroke-width="1.9"/>'+
      '<circle r="2.7" fill="none" stroke="#245342" stroke-width=".65"/>';
    drawing.append(birdGroup);
    function turn(yaw,zoom) {
      const co=Math.cos(yaw),si=Math.sin(yaw);
      function point([x,y,z]) {
        const across=x*co-z*si,forward=x*si+z*co,radius=Math.hypot(across,y);
        const scale=radius ? zoom*Math.atan2(radius,forward)/(radius*radians) : zoom/radians;
        return [across*scale,y*scale];
      }
      for(const {path,points,closed} of paths) {
        const xy=points.map(v=>{const [x,y]=point(v);return x.toFixed(2)+','+y.toFixed(2);});
        path.setAttribute('d','M'+xy.join(' ')+(closed?'Z':''));
      }
      const [x,y]=point([0,0,1]);
      birdGroup.setAttribute('transform','translate('+x+' '+y+') scale('+zoom+')');
    }
    return {drawing,turn};
  }

  function enterReadersView(host,room) {
    const image=host.querySelector('.eg-image'),chart=image.querySelector('.guide-polar');
    const pupil=room.querySelector('[data-reader-pupil]');
    if(!pupil || !chart)return false;
    const camera=movingRoom(chart);
    if(!camera)return false;
    const stage=document.createElement('div'),push=document.createElement('div');
    stage.className='eg-outgoing eg-gaze-camera';
    stage.setAttribute('aria-hidden','true');
    const chartBox=chart.getBoundingClientRect(),imageBox=image.getBoundingClientRect();
    stage.style.inset=(chartBox.top-imageBox.top)+'px auto auto '+(chartBox.left-imageBox.left)+'px';
    stage.style.width=chartBox.width+'px';
    stage.style.height=chartBox.height+'px';
    push.className='eg-camera-push';
    push.append(room);
    stage.append(camera.drawing,push);
    image.append(stage);
    const m=pupil.getScreenCTM(),roomMatrix=room.getScreenCTM(),area=stage.getBoundingClientRect();
    if(!m || !roomMatrix || !area.width || !area.height){stage.remove();return false;}
    const centre=room.createSVGPoint();
    centre.x=pupil.cx.baseVal.value;
    centre.y=pupil.cy.baseVal.value;
    const eye=centre.matrixTransform(m).matrixTransform(roomMatrix.inverse());
    const gaze=room.querySelector('[data-room-gaze]');
    const width=600,height=width*area.height/area.width,duration=1540;
    // Keep the close-up as real vector artwork; magnifying a composited SVG layer
    // would blur the pupil and hair before we reach the reader's point of view.
    room.style.height='100%';
    const ground=document.createElementNS(room.namespaceURI,'rect');
    for(const [name,value] of Object.entries({x:-800,y:245,width:2400,height:1100,fill:'#d6dcc8'}))ground.setAttribute(name,value);
    room.prepend(ground);
    const dolly=push.animate([
      {offset:0,opacity:1},{offset:.26,opacity:1},{offset:.52,opacity:0},{offset:1,opacity:0}
    ],{duration,fill:'both'});
    const key=image.querySelector('.eg-map-key');
    const reveal=key?.animate([{offset:0,opacity:0},{offset:.65,opacity:0},{offset:.95,opacity:1},{offset:1,opacity:1}],{duration,fill:'both'});
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let request=0,lastTurn=-1;
    const smooth=n=>{const t=Math.min(1,Math.max(0,n));return t*t*(3-2*t);};
    const finish=()=>{
      cancelAnimationFrame(request);
      dolly.onfinish=null;
      dolly.cancel();
      reveal?.cancel();
      if(reduce.removeEventListener)reduce.removeEventListener('change',onPreference);
      window.removeEventListener('resize',finish);
      stage.remove();
      eyeCamera.delete(host);
    };
    const onPreference=event=>{if(event.matches)finish();};
    const draw=()=>{
      if(!stage.isConnected){finish();return;}
      const progress=Math.min(1,(Number(dolly.currentTime)||0)/duration);
      if(progress<.56) {
        // The pupil travels along a straight screen path as the camera moves closer.
        const centred=smooth(progress/.35), zoom=17**smooth(progress/.54);
        const focusX=eye.x+(width/2-eye.x)*centred;
        const focusY=eye.y+(height/2-eye.y)*centred;
        const x=eye.x-focusX/zoom,y=eye.y-focusY/zoom;
        room.setAttribute('viewBox',[x,y,width/zoom,height/zoom].join(' '));
        if(gaze)gaze.style.opacity=String(1-smooth(progress/.26));
      }
      const turn=smooth((progress-.23)/.48);
      if(turn!==lastTurn) {
        // The bird enters from the right as the camera yaws towards the window.
        camera.turn(-.82*(1-turn),1+.58*(1-turn));
        const paper=smooth((turn-.15)/.85);
        const colour=[[181,233],[202,237],[186,223]].map(([a,b])=>Math.round(a+(b-a)*paper));
        camera.drawing.style.backgroundColor='rgb('+colour.join(',')+')';
        lastTurn=turn;
      }
      // At this point the bird has settled at the precise origin of the live chart.
      camera.drawing.style.opacity=String(1-smooth((progress-.66)/.31));
      if(progress<1)request=requestAnimationFrame(draw);
    };
    eyeCamera.set(host,finish);
    dolly.onfinish=finish;
    if(reduce.addEventListener)reduce.addEventListener('change',onPreference);
    window.addEventListener('resize',finish,{once:true});
    draw();
    return true;
  }

  function zoomBetween(host,oldImage,from,to,selected) {
    if(!oldImage||from===to||(from>=4&&to>=4)||!oldImage.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(from===0 && to===1 && enterReadersView(host,oldImage))return;
    const layer=document.createElement('div');
    layer.className='eg-outgoing';
    layer.dataset.eye=selected;
    layer.setAttribute('aria-hidden','true');
    layer.append(oldImage);
    host.querySelector('.eg-image').append(layer);
    const origins=['80% 49%','51% 47%','40% 49%','31% 50%','34% 49%'];
    layer.style.transformOrigin=origins[from];
    const forward=to>from&&to!==4;
    const motion=layer.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:forward?'scale(1.35)':'scale(.92)'}],
      {duration:440,easing:'cubic-bezier(.3,0,.3,1)',fill:'forwards'});
    motion.onfinish=()=>layer.remove();
  }

  function render(host,lang,step,arriving) {
    eyeCamera.get(host)?.();
    const previous=Number(host.querySelector('.eg-slide')?.dataset.step);
    const oldImage=host.querySelector('.eg-image')?.firstElementChild;
    const selected=host.querySelector('.eg-frame')?.dataset.eye||'both';
    const gaze=previous===step?Number(host.querySelector('#guide-gaze')?.value||0):0;
    const slide=story[lang][step],id='eg-fig-'+(++drawingNumber)+'-';
    let art,updateLamp;
    switch(step) {
      case 0: ({art}=roomScene(id,false));break;
      case 1: art=windowView(id,lang);break;
      case 2: art=sensor(id,lang);break;
      case 3: art=fieldLimits(id,lang);break;
      case 4:
      case 5: ({art,updateLamp}=roomScene(id,true,step===5));break;
    }
    const labels=fieldOptions[lang];
    const controls=step===1?'<div class="eg-map-controls"><div class="eg-eye-options" role="group" aria-label="'+labels.group+'">'+['both','left','right'].map(eye=>'<button type="button" data-eye="'+eye+'" aria-pressed="'+(eye==='both')+'">'+labels[eye]+'</button>').join('')+'</div>'+
      '<label class="eg-dark-option"><input type="checkbox" data-dark-field>'+labels.outside+'</label></div>':step===3?gazeControl(lang):step===5?pendantControls(lang):'';
    host.innerHTML=`<article class="eg-slide" data-step="${step}">
      <div class="eg-copy"><h1 id="guide-title" tabindex="-1">${slide.title}</h1>
        <p class="eg-lead">${slide.lead}</p><p class="eg-body">${slide.body}</p>${references(step,lang)}</div>
      <figure class="eg-frame" data-eye="both">
        <div class="eg-image" data-guide-art role="img" aria-label="${slide.alt}">${art}</div>
        ${controls}${readingKey(step,lang)}<figcaption${step===1?' aria-live="polite"':''}>${slide.caption}</figcaption>
      </figure></article>`;
    if(step===1)installEyeSwitch(host,lang,previous===step?selected:'both');
    if(step===3)installGaze(host,lang,gaze);
    if(step===5)installPendant(host,lang,updateLamp);
    if(!arriving)zoomBetween(host,oldImage,previous,step,selected);
  }

  window.fieldGuides=window.fieldGuides||{};
  window.fieldGuides.eyes={steps,render};
})();

