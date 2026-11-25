'use strict';
const art = {ink:'#244a41', teal:'#006d5c', terra:'#a5422b', axis:'#415b65', paper:'#faf9f0', line:'#839687', gold:'#fff0a0'};
const canvas=el('scene');
let ctx=canvas.getContext('2d');
let cw=1,ch=1,pickTargets=[],drag=null;
const between=(a,b,t)=>a+(b-a)*t;
const within=(x,min,max)=>Math.max(min,Math.min(max,x));
function path(points,fill,stroke,width=1,dash=[]) {
  if(points.length<2)return;
  ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));
  if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
  ctx.restore();
}
function line(a,b,color,width=1,dash=[]){path([a,b],null,color,width,dash);}
function circle(p,r,fill,stroke,width=1){
  ctx.beginPath();ctx.arc(p[0],p[1],r,0,2*Math.PI);
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function ellipse(p,rx,ry,fill,rotation=0){
  ctx.beginPath();ctx.ellipse(p[0],p[1],Math.max(.1,rx),Math.max(.1,ry),rotation,0,2*Math.PI);ctx.fillStyle=fill;ctx.fill();
}
function grad(a,b,c1,c2){const g=ctx.createLinearGradient(...a,...b);g.addColorStop(0,c1);g.addColorStop(1,c2);return g;}
function roundBox(x,y,w,h,r,fill,stroke){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function words(text,x,y,{size=12,color=art.ink,weight=550,align='left',halo=false}={}){
  ctx.save();ctx.font=(weight>=600?'bold ':'normal ')+size+'px "DM Sans",sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';
  if(halo){ctx.lineJoin='round';ctx.strokeStyle='rgba(247,248,237,.94)';ctx.lineWidth=3.8;ctx.strokeText(text,x,y);}
  ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();
}
function callout(text,anchor,x,y,align='left',color=art.ink){
  const size=cw<480?10.5:12.5;
  ctx.font='bold '+size+'px "DM Sans",sans-serif';const tw=ctx.measureText(text).width;
  const left=within(align==='right'?x-tw-14:x,3,Math.max(3,cw-tw-18)),top=within(y-10,2,ch-22);
  const tx=left+7,ty=top+10;
  const leftEdge=anchor[0]<left+tw/2, endX=leftEdge?left:left+tw+14;
  path([anchor,[endX+(leftEdge?-6:6),ty],[endX,ty]],null,color,.9);
  circle(anchor,2,color);
  roundBox(left,top,tw+14,20,4,'rgba(251,251,243,.94)','#a7b6a7');
  words(text,tx,ty,{size,weight:620,color});
  return {point:[left+(tw+14)/2,ty],rx:(tw+14)/2+3,ry:13};
}
function arrow(a,b,color,width=1,dash=[]) {
  line(a,b,color,width,dash);const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),l=6;
  path([[b[0]-l*Math.cos(angle-.48),b[1]-l*Math.sin(angle-.48)],b,[b[0]-l*Math.cos(angle+.48),b[1]-l*Math.sin(angle+.48)]],null,color,width);
}
function drawLogo(){
  const g=el('mark').getContext('2d');g.save();g.scale(2,2);
  g.beginPath();g.arc(22,22,21,0,Math.PI*2);g.fillStyle='#194e40';g.fill();
  g.save();g.beginPath();g.arc(22,22,17,0,Math.PI*2);g.clip();
  g.strokeStyle='#d8e6bb';g.lineWidth=1;
  for(let a=-58;a<=76;a+=15){const r=a*Math.PI/180;g.beginPath();g.moveTo(9,29);g.lineTo(9+43*Math.cos(r),29-43*Math.sin(r));g.stroke();}
  g.beginPath();g.arc(9,29,15,-1.3,.6);g.strokeStyle='#f8c286';g.lineWidth=2;g.stroke();g.restore();
  g.beginPath();g.arc(10,28,2.5,0,Math.PI*2);g.fillStyle='#faf2c5';g.fill();g.restore();
}
function dimension(a,b,text,offset=0){
  const co='#738475';line([a[0],a[1]+offset],[b[0],b[1]+offset],co,.8);
  for(const [x,y] of [a,b])line([x-2.5,y+offset+3],[x+2.5,y+offset-3],co,.9);
  words(text,(a[0]+b[0])/2,(a[1]+b[1])/2+offset+10,{size:cw<500?10:11,color:'#4c6356',align:'center',halo:true});
}
function furnitureFace(P,vertices,fill,stroke,width,faces){
  quad(P,vertices,fill,stroke,width);
  if(faces)faces.push(vertices);
}
// Geschlossene Stuhlteile aus einem im Uhrzeigersinn umlaufenden x/z-Profil.
// Die Orientierung nach der Projektion bestimmt die sichtbaren Mantelflächen.
function chairBoard(P,profile,near,far,colors,foreground){
  const end=profile.map(([x,z])=>[x,near,z]);
  if(far>near){
    for(let i=0;i<profile.length;i++){
      const j=(i+1)%profile.length,a=end[i],b=end[j],f=[a[0],far,a[2]],g=[b[0],far,b[2]];
      const pa=P(...a),pb=P(...b),pf=P(...f);
      const cross=(pb[0]-pa[0])*(pf[1]-pa[1])-(pb[1]-pa[1])*(pf[0]-pa[0]);
      if(cross<0){
        const top=Math.abs(b[0]-a[0])>Math.abs(b[2]-a[2]);
        furnitureFace(P,[a,b,g,f],top?colors.top:colors.face,colors.edge,.65,foreground);
      }
    }
  }
  furnitureFace(P,end,colors.end,colors.edge,.7,foreground);
}
function chair(P,m,spatial,foreground){
  const pos=m.seat,half=.215,foot=.018,back=pos-.374,front=pos-.084;
  const seatZ=.445,seatBase=.407,railBase=.380,rearEdge=pos-config.chairBack;
  const metal={top:'#839388',face:'#5c7166',end:'#53685e',edge:'#4b6055'};
  const wood={top:'#d3a47a',face:'#bd916b',end:'#af805d',edge:'#80634e'};
  const sides=spatial?[half-.028,-half+.028]:[0];
  for(const y of sides){
    const near=spatial?y-foot:0,far=spatial?y+foot:0;
    for(const x of [front,back]){
      const profile=[[x-foot,seatBase],[x+foot,seatBase],[x+foot,0],[x-foot,0]];
      chairBoard(P,profile,near,far,metal,foreground);
    }
    chairBoard(P,[[back-foot,seatBase],[front+foot,seatBase],[front+foot,railBase],[back-foot,railBase]],near,far,metal,foreground);
  }
  const near=spatial?-half:0,far=spatial?half:0;
  chairBoard(P,[[pos-.385,seatZ],[pos+.030,seatZ],[pos+.040,seatZ-.010],[pos+.032,seatBase],[pos-.381,seatBase]],
    near,far,wood,foreground);
  // Each upright emerges through the seat and ends inside the lower part of
  // the wooden backrest. Its tip stays within the wood in both projections.
  const socketZ=.70, socketRear=rearEdge+.033, socketFront=rearEdge+.060;
  const rise=(seatZ-seatBase)/(socketZ-seatBase);
  const upright=[[socketRear,socketZ],[socketFront,socketZ],
    [between(back+foot,socketFront,rise),seatZ],[between(back-foot,socketRear,rise),seatZ]];
  for(const y of sides){
    chairBoard(P,upright,spatial?y-foot:0,spatial?y+foot:0,metal,foreground);
  }
  chairBoard(P,[[rearEdge,.857],[rearEdge+.037,.861],[rearEdge+.073,.683],[rearEdge+.066,.665],[rearEdge+.031,.668]],
    near,far,wood,foreground);
}
function seatedBodyInRoom(P,s,m,faces){
  // Die Knie stehen nebeneinander. Für jedes Körperteil verdecken nur solche
  // Möbelstücke die Figur, die zwischen seiner Ebene und dem Betrachter liegen.
  for(const [part,side] of [['far',.10],['near',-.13],['body',0]]){
    const base=P(m.seat,side,0),left=base[0]-.44*s,top=base[1]-1.55*s,w=.91*s,h=1.58*s;
    ctx.save();
    for(const vertices of faces){
      if(!vertices.some(p=>p[1]<side))continue;
      const near=[];
      for(let i=0;i<vertices.length;i++){
        const a=vertices[i],b=vertices[(i+1)%vertices.length];
        if(a[1]<=side)near.push(P(...a));
        if((a[1]-side)*(b[1]-side)<0){
          const u=(side-a[1])/(b[1]-a[1]);
          near.push(P(between(a[0],b[0],u),side,between(a[2],b[2],u)));
        }
      }
      if(near.length<3||near.every(p=>p[0]<left)||near.every(p=>p[0]>left+w)||near.every(p=>p[1]<top)||near.every(p=>p[1]>top+h))continue;
      const visible=new Path2D();visible.rect(left,top,w,h);visible.moveTo(...near[0]);
      for(let i=1;i<near.length;i++)visible.lineTo(...near[i]);
      visible.closePath();ctx.clip(visible,'evenodd');
    }
    seatedPerson(base,s,m,part);ctx.restore();
  }
}
const faceProfile=new Path2D('M-.205 -1.219 Q-.214 -1.311 -.12 -1.326 Q-.027 -1.345 .006 -1.254 L.009 -1.21 L.041 -1.168 Q.044 -1.155 .015 -1.153 L.008 -1.109 Q-.01 -1.074 -.062 -1.075 Q-.124 -1.074 -.163 -1.13 Z');
const readerColors={dark:'#284642',skin:'#c8875f',skinLight:'#dfa77d',cloth:'#377967'};
function figureShape(outline,fill,stroke,width=.012){
  const p=typeof outline==='string'?new Path2D(outline):outline;
  if(fill){ctx.fillStyle=fill;ctx.fill(p);}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke(p);}
}
function seatedPerson(base,s,m,part='all'){
  ctx.save();ctx.translate(...base);ctx.scale(s,s);
  // Profil am festen Sitzplatz, lokaler Ursprung unter dem Auge in Neutralstellung.
  const {dark,skin,skinLight,cloth}=readerColors;
  if(part==='far'||part==='all'){
    // Ein Fuß ist etwas unter den Sitz zurückgestellt, beide Sohlen liegen auf z = 0.
    figureShape('M-.27 -.56 Q-.12 -.52 .066 -.53 Q.144 -.535 .148 -.458 Q.15 -.435 .132 -.400 L-.057 -.131 L-.145 -.139 L.034 -.445 L-.25 -.445 Z','#456059',dark);
    figureShape('M-.146 -.143 L-.056 -.139 Q-.041 -.099 .005 -.082 Q.046 -.073 .052 -.039 L.050 -.014 Q.046 0 .034 0 L-.152 0 Q-.165 -.008 -.158 -.058 Z','#806044',dark);
    figureShape('M-.159 -.025 Q-.063 -.015 .052 -.028 L.050 -.012 Q.047 0 .034 0 L-.152 0 Q-.162 -.002 -.159 -.025 Z','#69503d',dark,.006);
  }
  if(part==='near'||part==='all'){
    figureShape('M-.270 -.583 Q-.16 -.57 .13 -.54 Q.205 -.535 .218 -.48 L.255 -.115 L.158 -.10 L.105 -.445 L-.215 -.445 C-.295 -.444 -.330 -.474 -.331 -.513 Q-.332 -.570 -.270 -.583 Z','#37534d',dark);
    figureShape('M.153 -.126 L.249 -.136 Q.272 -.089 .333 -.074 Q.363 -.066 .371 -.02 L.362 0 L.162 0 Q.143 -.012 .153 -.126 Z','#a67550',dark);
    figureShape('M.15 -.025 Q.235 -.014 .371 -.026 L.37 -.014 Q.367 0 .359 0 L.162 0 Q.15 -.003 .15 -.025 Z','#805a3f',dark,.006);
  }
  if(part==='far'||part==='near'){ctx.restore();return;}
  // Der Schädelansatz wandert mit dem Hals. Die Nacken- und Kinnkonturen
  // sind über Bézierkurven mit den fest aufliegenden Schultern verbunden.
  function onHead(x,z){
    const dx=x-config.skullX,dz=z-config.skullZ;
    return [m.frame.skullX+dx*m.frame.cos-dz*m.frame.sin,-(m.frame.skullZ+dx*m.frame.sin+dz*m.frame.cos)];
  }
  // The neck follows the skull at its upper end and meets the resting shoulders at the collar.
  ctx.beginPath();
  ctx.moveTo(...onHead(-.177,1.155));
  ctx.bezierCurveTo(...onHead(-.171,1.107),-.167,-1.034,-.202,-.986);
  ctx.bezierCurveTo(-.176,-.95,-.106,-.936,-.063,-.973);
  ctx.bezierCurveTo(-.091,-1.010,...onHead(-.087,1.076),...onHead(-.071,1.119));
  ctx.closePath();ctx.fillStyle=skin;ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=.009;ctx.stroke();
  // The shoulder falls from the collar into a fuller shirt over the seated hip.
  figureShape(`M-.196 -.995 C-.213 -.984 -.236 -.976 -.253 -.956
    C-.278 -.927 -.287 -.873 -.296 -.816 C-.307 -.744 -.318 -.657 -.338 -.585
    Q-.344 -.566 -.332 -.561 C-.260 -.540 -.112 -.538 -.015 -.554
    Q.002 -.557 0 -.575 C-.004 -.642 -.023 -.706 -.023 -.764
    C-.024 -.818 -.009 -.856 -.014 -.900 Q-.018 -.949 -.070 -.978
    Q-.115 -.953 -.158 -.970 Q-.182 -.979 -.196 -.995 Z`,cloth,dark);
  figureShape('M-.196 -.991 Q-.146 -.932 -.069 -.973',null,'#73a392',.008);
  figureShape('M-.326 -.576 C-.243 -.555 -.110 -.552 -.022 -.568',null,'#529080',.006);
  // The cuff, wrist and back of the hand share a level contour over the desk.
  figureShape(`M.143 -.761 C.165 -.760 .185 -.760 .203 -.762
    C.225 -.764 .245 -.765 .261 -.760 C.285 -.752 .306 -.746 .321 -.745
    Q.333 -.744 .332 -.738 Q.331 -.733 .321 -.733 L.309 -.734
    Q.318 -.733 .316 -.728 Q.314 -.723 .304 -.723
    C.285 -.723 .271 -.729 .257 -.730 C.244 -.730 .232 -.724 .219 -.723
    C.193 -.722 .169 -.725 .143 -.727 Z`,skinLight,dark,.006);
  figureShape('M.253 -.749 C.272 -.746 .292 -.737 .309 -.734 M.210 -.744 C.225 -.744 .239 -.735 .255 -.731',
    null,'#9a6b4d',.0035);
  figureShape(`M-.178 -.945 C-.149 -.973 -.103 -.965 -.083 -.920 L-.033 -.807
    C-.020 -.781 -.008 -.772 .015 -.768 C.057 -.761 .114 -.761 .163 -.761
    L.159 -.724 C.107 -.724 .037 -.723 -.016 -.728 Q-.061 -.731 -.082 -.759
    L-.152 -.849 Q-.203 -.919 -.178 -.945 Z`,'#438775',dark,.0095);
  figureShape('M.147 -.758 L.143 -.727',null,'#73a392',.006);
  ctx.restore();
  if(part==='all')seatedHead(base,s,m);
}
function seatedHead(base,s,m){
  const {dark,skin,skinLight}=readerColors;
  ctx.save();ctx.translate(...base);ctx.scale(s,s);
  ctx.translate(m.frame.skullX,-m.frame.skullZ);ctx.rotate(-m.frame.deg*Math.PI/180);ctx.translate(-config.skullX,config.skullZ);
  figureShape(faceProfile,skinLight,dark);
  figureShape('M-.181 -1.147 C-.215 -1.176 -.233 -1.235 -.218 -1.292 Q-.204 -1.350 -.147 -1.365 Q-.071 -1.386 -.017 -1.348 Q.012 -1.325 .017 -1.288 Q-.010 -1.275 -.045 -1.286 Q-.065 -1.262 -.108 -1.25 L-.120 -1.195 Q-.131 -1.182 -.149 -1.183 Q-.170 -1.169 -.181 -1.147 Z','#3b3930',dark);
  figureShape('M-.169 -1.19 Q-.181 -1.225 -.153 -1.226 Q-.127 -1.222 -.136 -1.189 Q-.144 -1.171 -.159 -1.177',skin,dark,.009);
  figureShape('M-.259 -1.262 Q-.287 -1.28 -.276 -1.317 Q-.26 -1.355 -.225 -1.34 Q-.191 -1.316 -.211 -1.278 Q-.229 -1.254 -.259 -1.262 Z','#444135',dark);
  figureShape('M-.057 -1.238 Q-.035 -1.249 -.012 -1.239',null,'#604a37',.007);
  const lid='M-.048 -1.200 C-.032 -1.209 -.020 -1.217 -.009 -1.214 Q.002 -1.213 .007 -1.202';
  figureShape(lid+' Q.004 -1.190 -.008 -1.189 C-.021 -1.188 -.035 -1.196 -.048 -1.200 Z','#fcf4de','#98795e',.003);
  ctx.beginPath();ctx.ellipse(-.003,-1.201,.0073,.0092,0,0,Math.PI*2);ctx.fillStyle='#678375';ctx.fill();
  ctx.beginPath();ctx.ellipse(-.001,-1.201,.0035,.0063,0,0,Math.PI*2);ctx.fillStyle=dark;ctx.fill();
  figureShape(lid,null,'#534b3b',.004);
  figureShape('M-.029 -1.126 Q-.011 -1.121 .004 -1.127',null,'#8b5d46',.005);
  figureShape('M-.158 -1.212 Q-.143 -1.216 -.148 -1.20 L-.155 -1.194',null,'#9a6b4d',.004);
  ctx.restore();
}
let ceilingResize=null;
function displayRoomWidth(m,time){
  const width=m.room.width;
  if(!m.onlyRoof||preference.matches)return width;
  if(!ceilingResize)ceilingResize={from:width,to:width,start:time};
  const {from,to,start}=ceilingResize;
  const t=within((time-start)/240,0,1);
  const visible=t===1?to:between(from,to,t*t*(3-2*t));
  if(to!==width){
    const animate=Math.max(visible,width)>data.room[defaultState.size].width;
    ceilingResize={from:animate?visible:width,to:width,start:time};
    if(animate)scheduleDraw();
    return ceilingResize.from;
  }
  if(from!==to&&t<1)scheduleDraw();
  return visible;
}
function roomProjection(m,displayWidth=m.room.width) {
  const w=displayWidth,ratio=w/m.room.width,d=m.room.depth*ratio,h=config.roomH,kx=.61,ky=.245;
  const marginX=cw<520?18:32,top=ch<280?20:25,bottom=27;
  const standardWidth=data.room[defaultState.size].width;
  if(m.onlyRoof&&displayWidth>standardWidth){
    // Keep the original plan direction. In larger rooms the viewpoint gradually
    // lowers until the underside of the ceiling clears the other room elements.
    const largestWidth=data.room[ranges.size].width;
    const t=within((displayWidth-standardWidth)/(largestWidth-standardWidth),0,1);
    const blend=t*t*(3-2*t),distance=Math.hypot(w,d);
    const depthUnit=Math.hypot(1,kx),horizon=config.eyeH;
    const project=(x,y,z)=>{
      const dx=x-d/2,depth=(kx*dx+y)/depthUnit;
      const scale=distance/(distance+blend*depth);
      return [(dx-kx*y)*scale,(horizon-z-(1-blend)*ky*y)*scale];
    };
    const corners=[[0,-w/2],[0,w/2],[d,-w/2],[d,w/2]];
    const floor=corners.map(([x,y])=>project(x,y,0)),roof=corners.map(([x,y])=>project(x,y,h));
    const left=Math.min(...floor.map(p=>p[0])),right=Math.max(...floor.map(p=>p[0]));
    const upper=Math.min(...roof.map(p=>p[1])),lower=Math.max(...floor.map(p=>p[1]));
    const s=Math.min((cw-2*marginX)/(right-left+.25),(ch-top-bottom)/(lower-upper+.18));
    const ox=(cw-s*(left+right))/2,oy=(ch+top-bottom-s*(upper+lower))/2;
    return {s,perspective:true,P:(x,y,z)=>{const [px,py]=project(x*ratio,y*ratio,z);return [ox+s*px,oy+s*py];}};
  }
  const s=Math.min((cw-2*marginX)/(d+kx*w+.25),(ch-top-bottom)/(h+ky*w+.18));
  const modelW=(d+kx*w)*s, modelH=(h+ky*w)*s;
  const left=(cw-modelW)/2, y0=top+(ch-top-bottom-modelH)/2+(h+ky*w/2)*s;
  return {s,P:(x,y,z)=>[left+(x*ratio+kx*w/2-kx*y*ratio)*s,y0-(z+ky*y*ratio)*s]};
}
function quad(P,coords,fill,stroke='#879887',width=.85){path(coords.map(v=>P(...v)),fill,stroke,width);}
function box(P,x0,x1,y0,y1,z0,z1,colors,foreground){
  furnitureFace(P,[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],colors[1],'#879887',.85,foreground);
  furnitureFace(P,[[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],colors[2],'#879887',.85,foreground);
  furnitureFace(P,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],colors[0],'#879887',.85,foreground);
}
// Die obere Arbeitsfläche hat dieselben Abmessungen wie im R-Modell.
function desk(P,s,m,axono,foreground){
  const a=m.seat+config.deskNear,b=m.seat+config.deskFar,y=config.deskWidth/2,z=config.deskH;
  if(axono){
    const c=P((a+b)/2,0,.006);
    ellipse(c,(b-a)*s*.77,y*s*.28,'rgba(64,79,60,.12)',-.08);
    for(const side of [y-.085,-y+.085]){
      for(const x of [a+.08,b-.10]){
        box(P,x,x+.037,side-.025,side+.025,0,z-.035,['#78857a','#62756a','#52675d'],foreground);
      }
    }
    box(P,a,b,-y,y,z-.045,z,[surfaceColor(m,'desk','#e6c69c'),surfaceColor(m,'desk','#b89369'),surfaceColor(m,'desk','#a78664')],foreground);
    line(P(a,-y,z),P(b,-y,z),'#f4dbb4',1);
  }else{
    for(const x of [a+.08,b-.10]){
      const leg=[P(x,0,0),P(x+.038,0,0),P(x+.038,0,z-.045),P(x,0,z-.045)];
      path(leg,'#607267','#526359',.65);
    }
    path([P(a,0,z),P(b,0,z),P(b,0,z-.045),P(a,0,z-.045)],surfaceColor(m,'desk','#d7b286'),'#8a745a',1);
    line(P(a,0,z),P(b,0,z),'#f4dfb8',1);
  }
}
function surfaceColor(m,key,c){
  if(!m.reflect)return c;
  const levels={ceiling:[.50,.80],wall:[.50,.70],floor:[.20,.50],desk:[.50,.65]};
  const rho=m.finishes[key]/100,base=levels[key][0],end=levels[key][1];
  const rgb=[1,3,5].map(k=>parseInt(c.slice(k,k+2),16));
  const target=rho<base?[83,94,86]:[244,243,223];
  const amount=rho<base?.78*(1-rho/base):.32*(rho-base)/(end-base);
  return 'rgb('+rgb.map((v,i)=>Math.round(between(v,target[i],amount))).join(',')+')';
}
function wallPanelColor(mix){
  if(mix===0)return '#a4b6b0';
  const t=Math.sqrt(mix/100);
  return 'rgb('+Math.round(234+21*t)+','+Math.round(189+63*t)+','+Math.round(113+103*t)+')';
}
function daylightLabel(){return tr(cw>=900?'Fenster (diffuses Tageslicht)':'Diffuses Tageslicht');}
function wallPanelLabel(mix){return tr(mix===0?'Wandpanel · aus':cw<620?'Wandpanel · an':'Leuchtendes Wandpanel');}
function wallLabel(m){
  if(m.source==='off')return tr('Glas · Wandpanel aus');
  return m.window?(m.mix?daylightLabel():tr('Fenster · ohne Tageslicht')):wallPanelLabel(m.mix);
}
function wallDiffuser(P,d,y,lo,hi,mix){
  const edge=wallPanelColor(mix);
  if(!mix)return grad(P(d,y,hi),P(d,-y,lo),'#b5c5bf','#97ada7');
  const finish=grad(P(d,y,hi),P(d,-y,lo),edge,edge);
  const level=Math.sqrt(mix/100);
  finish.addColorStop(.48,'rgb(255,'+Math.round(227+26*level)+','+Math.round(166+67*level)+')');
  return finish;
}
function wallFace(d,half,lo,hi){
  return [[d,-half,lo],[d,half,lo],[d,half,hi],[d,-half,hi]];
}
const frameRim=.078, sillDepth=.08, sillThickness=.024;
function wallLight(P,m){
  const d=m.room.depth,y=config.wallY/2,lo=m.wallLo,hi=config.wallHi;
  const frame=wallFace(d,y+frameRim,lo,hi+frameRim);
  if(!m.window&&m.mix){
    ctx.save();ctx.shadowColor='rgba(255,230,140,.85)';ctx.shadowBlur=6+12*Math.sqrt(m.mix/100);
    quad(P,frame,'#ffedba',null);ctx.restore();
  }
  quad(P,frame,m.window?'#e0e6df':'#567068','#435e55',1.15);
  quad(P,wallFace(d,y+.025,lo,hi+.025),m.window?'#839f9f':'#d3d5b9','#768a7f',.75);
  const fill=m.window?grad(P(d,0,hi),P(d,0,lo),m.mix?'#a7d5df':'#798e9a',m.mix?'#edf5e9':'#a9b9b8'):wallDiffuser(P,d,y,lo,hi,m.mix);
  quad(P,wallFace(d,y,lo,hi),fill,m.window?'#577a7b':'#7f8c75',.8);
  const edge=y+frameRim,x=d-sillDepth;
  quad(P,[[x,-edge,lo],[d,-edge,lo],[d,edge,lo],[x,edge,lo]],m.window?'#e6e9dd':'#cfd3bd','#748477',.8);
  quad(P,[[x,-edge,lo],[x,edge,lo],[x,edge,lo-sillThickness],[x,-edge,lo-sillThickness]],m.window?'#c5cec0':'#a9b3a1','#748477',.65);
  line(P(d,y,hi),P(d,-y,hi),m.window?'#eff5ea':m.mix?'#fff8d7':'#cad0c5',1);
  if(m.window){
    const grip=P(d,-y-.044,(lo+hi)/2);line([grip[0]-1,grip[1]-4],[grip[0]-1,grip[1]+4],'#526e70',2.1);
    line([grip[0]-1,grip[1]],[grip[0]-5,grip[1]-1],'#edf4eb',1.6);
  }else if(m.source==='off'){
    line(P(d,.60,hi-.12),P(d,-.32,hi-.88),'rgba(239,248,240,.56)',1.25);
    line(P(d,.30,hi-.10),P(d,-.04,hi-.39),'rgba(239,248,240,.58)',1);
  }
}
function sightLine(P,m,eye,tip=P(m.axis[0],0,m.axis[1])){
  if(m.frame.deg!==0){
    const len=Math.min(m.room.depth-m.eye,.80);
    line(eye,P(m.eye+len,0,m.eyeZ),'rgba(71,92,84,.49)',.85,[1.4,3.6]);
  }
  line(eye,tip,art.axis,1.2,[5,3.4]);
  const previous=gazeLayout;
  if(!previous||previous.scene!==m||previous.cw!==cw||previous.ch!==ch||previous.view!==view||
     previous.tip[0]!==tip[0]||previous.tip[1]!==tip[1]||previous.eye[0]!==eye[0]||previous.eye[1]!==eye[1]){
    gazeLayout={eye,tip,scene:m,view,cw,ch};
    const rotation=Math.atan2(tip[1]-eye[1],tip[0]-eye[0])*180/Math.PI;
    el('gaze-tip').setAttribute('transform','translate('+tip[0]+' '+tip[1]+') rotate('+rotation+')');
    el('gaze-control').setAttribute('aria-valuenow',m.frame.deg);
    el('gaze-control').setAttribute('aria-valuetext',sliderValue('tilt',{tilt:m.frame.deg}));
  }
}
let gazeLayout=null;

function jointSpacing(scale){return scale*.9>=24?.9:1.8;}
function architecture(P,s,m){
  const w=m.room.width,d=m.room.depth,b=w/2,f=-b,h=config.roomH;
  const thickness=.115,outerDepth=d+thickness,outerSide=b+thickness;
  const floor=[[0,f,0],[d,f,0],[d,b,0],[0,b,0]];
  const footprint=[[0,f,0],[outerDepth,f,0],[outerDepth,outerSide,0],[0,outerSide,0]];
  const sh=footprint.map(v=>{const p=P(...v);return [p[0]+5,p[1]+7];});
  ctx.save();ctx.shadowColor='rgba(48,74,53,.23)';ctx.shadowBlur=12;path(sh,'rgba(69,91,66,.13)');ctx.restore();
  box(P,0,outerDepth,f,outerSide,-.12,0,['#dedccc','#bbb9a7','#c7c5b5']);
  const fl=grad(P(0,b,0),P(d,f,0),surfaceColor(m,'floor','#aab8a7'),surfaceColor(m,'floor','#eedec3'));quad(P,floor,fl);
  clipArea(floor.map(v=>P(...v)),()=>{
    if(!m.onlyRoof){
      softPool(P(m.lamp,0,0),s*2.25,s*.69,'rgba(255,240,166,'+(.55*(m.ceilingPower/100))+')','rgba(255,240,166,0)');
      softPool(P(d,-.18,0),s*1.9,s*.75,'rgba(255,237,163,'+(.65*m.mix/100)+')','rgba(255,237,163,0)');
    }
    softPool(P(d*.43,b,.02),s*d*.65,s*.24,'rgba(46,76,62,.23)','rgba(46,76,62,0)');
  });
  for(let x=.6;x<d;x+=.6)line(P(x,b,0),P(x,f,0),'#b9bdad',.6);
  for(let y=f+.6;y<b;y+=.6)line(P(0,y,0),P(d,y,0),'#c3c5b4',.65);
  const rear=[[0,b,0],[d,b,0],[d,b,h],[0,b,h]];
  quad(P,rear,grad(P(0,b,h),P(d,b,0),surfaceColor(m,'wall','#c6d9c9'),surfaceColor(m,'wall','#90ab99')));
  const spacing=jointSpacing(s);
  for(let x=spacing;x<d-.08;x+=spacing)line(P(x,b,.08),P(x,b,h),'rgba(70,99,85,.32)',.75);
  quad(P,[[0,b,0],[d,b,0],[d,b,.08],[0,b,.08]],'#9cac9a');
  const wall=[[d,b,0],[d,f,0],[d,f,h],[d,b,h]];
  quad(P,wall,grad(P(d,b,0),P(d,f,h),surfaceColor(m,'wall','#bbaa88'),surfaceColor(m,'wall','#f2e2bc')));
  for(let y=f+spacing;y<b-.08;y+=spacing)line(P(d,y,.08),P(d,y,h),'rgba(133,113,79,.29)',.75);
  quad(P,[[d,b,0],[d,f,0],[d,f,.08],[d,b,.08]],'#c6c2ab');
  // Boden bis unter die Außenkanten. Beide Wände haben eine geschlossene
  // L-förmige Krone in einer einzigen horizontalen Ebene.
  quad(P,[[0,b,0],[0,outerSide,0],[0,outerSide,h],[0,b,h]],'#bccabc');
  quad(P,[[d,f,0],[outerDepth,f,0],[outerDepth,f,h],[d,f,h]],'#c9c1a9');
  quad(P,[[0,b,h],[d,b,h],[d,f,h],[outerDepth,f,h],[outerDepth,outerSide,h],[0,outerSide,h]],'#e7e7d8','#8c9b89',.95);
  wallLight(P,m);
  if(m.onlyRoof){
    quad(P,[[0,f,h],[d,f,h],[d,b,h],[0,b,h]],'rgba(255,246,183,.64)','#adab80',1);
    for(let x=.70;x<d;x+=.70)line(P(x,f,h),P(x,b,h),'rgba(165,160,111,.36)',.7);
  } else {
    line(P(0,b,h),P(0,f,h),'rgba(122,143,124,.55)',.85,[4,5]);
    line(P(0,f,h),P(d,f,h),'rgba(122,143,124,.48)',.85,[4,5]);
  }
}
function panel(P,m){
  const x=m.lamp,ax=config.panelX/2,ay=config.panelY/2,z=config.lampH;
  const k=m.ceilingPower/100;
  if(k>0)softPool(P(x,0,z-.025),Math.max(15,(P(x+ax,-ay,z)[0]-P(x-ax,ay,z)[0])*.72),Math.max(10,(P(x,-ay,z)[1]-P(x,ay,z)[1])*.95),'rgba(255,239,132,'+(.38*k)+')','rgba(255,239,132,0)');
  box(P,x-ax,x+ax,-ay,ay,z,z+.045,['#607d70','#416558','#6a8273']);
  const face=grad(P(x-ax,ay,z),P(x+ax,-ay,z),k>0?'#fffbe2':'#c4cbbb',k>0?'rgb(255,'+Math.round(236+10*k)+','+Math.round(186-32*k)+')':'#cdd2c4');
  quad(P,[[x-ax+.045,-ay+.045,z+.047],[x+ax-.045,-ay+.045,z+.047],[x+ax-.045,ay-.045,z+.047],[x-ax+.045,ay-.045,z+.047]],face,'#9a9f82',.7);
  for(let y=-ay+.20;y<ay-.10;y+=.19)line(P(x-ax+.07,y,z+.05),P(x+ax-.07,y,z+.05),'rgba(170,163,108,.36)',.6);
}
function sector(e,r,hi,lo,fill,stroke){
  ctx.beginPath();ctx.moveTo(...e);ctx.arc(e[0],e[1],r,-hi*Math.PI/180,-lo*Math.PI/180);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=1;ctx.strokeStyle=stroke;ctx.stroke();}
}
function fan(e,r,m){
  const a=m.frame.deg;
  sector(e,r,a+90,a-90,'rgba(192,107,62,.17)','#ae8e71');
  sector(e,r,a+(m.mask?config.upperAngle:90),a+(m.mask===2?config.lowerAngle:-90),'rgba(118,175,144,.43)','#659881');
}
function blocked(which,mask){return (which===2&&mask>=1)||(which===3&&mask===2);}
// R hat beide Teilstrecken jedes Beispiels gegen Flächen, Tisch und Blenden
// geprüft. Der Browser wählt aus diesen Beispielen und zeichnet ihre Bewegung.
const pathLibrary=data.illustration;
let unpackedPaths={},exampleCache={},lightTimer=0,previewScene=null;
function exampleGeometry(m,source,sample,section){
  const [u,v,face,bu,bv]=sample,d=m.room.depth,w=m.room.width,H=config.roomH;
  let start;
  if(source<29)start=[m.lamp+(u-.5)*config.panelX,(v-.5)*config.panelY,config.lampH];
  else if(source===29)start=[d,(v-.5)*config.wallY,m.wallLo+u*(config.wallHi-m.wallLo)];
  else start=[d*u,(v-.5)*w,H];
  const z=.055+bv*(H-.11);
  let bounce;
  if(face===0)bounce=[m.seat+config.deskNear+bu*(config.deskFar-config.deskNear),(bv-.5)*config.deskWidth,config.deskH];
  else if(face<=2)bounce=[bu*d,(bv-.5)*w,face===1?0:H];
  else if(face===3||face===6)bounce=[face===3?d:0,(bu-.5)*w,z];
  else if(face===7){
    const u=(d-m.eye)/(2*d-start[0]-m.eye);
    bounce=[d,u*start[1],between(m.eyeZ,start[2],u)];
  }else bounce=[bu*d,face===4?w/2:-w/2,z];
  if(section){start[1]=0;bounce[1]=0;}
  return {start,bounce};
}
function preparedPaths(m,section){
  if(exampleCache.scene===m&&exampleCache.section===section)return exampleCache;
  const si=section?1:0,tilt=data.pitches.indexOf(m.frame);
  const block=m.room.paths[si][tilt];
  if(unpackedPaths.block!==block)unpackedPaths={block,bytes:inflateBlock(block)};
  const samples=pathLibrary.recipe,n=samples.length,eye=m.eyeIndex;
  const src=[...(m.ceilingPower>0?[m.onlyRoof?30:m.lampIndex]:[]),...(m.mix>0?[29]:[])];
  const direct=[],reflected=[],faces=['desk','floor','ceiling','wall','wall','wall','wall'];
  for(const source of src){
    const dpool=[],rpool=[],offset=(eye*31+source)*n;
    for(let i=0;i<n;i++){
      const value=unpackedPaths.bytes[offset+i],incident=value&3,via=value>>2;
      if(incident)dpool.push({source,i,code:incident,bounce:false});
      if(m.reflect&&via&&!blocked(via,m.mask)&&(samples[i][2]===7||m.finishes[faces[samples[i][2]]]>0))
        rpool.push({source,i,code:via,bounce:true});
    }
    const share=(source===29?m.mix:m.ceilingPower)/100;
    if(dpool.length)direct.push({pool:dpool,share});
    if(rpool.length&&m.optical.indirect[m.mask]>0)reflected.push({pool:rpool,share});
  }
  exampleCache={scene:m,section,direct,reflected};
  return exampleCache;
}
function sequenceFraction(n,factor){const x=(n+1)*factor;return x-Math.floor(x);}
function sampleExample(pools,index,offset=0){
  if(!pools.length)return null;
  const u=sequenceFraction(index+offset,.754877666);
  const selected=pools.length===1||u<pools[0].share/(pools[0].share+pools[1].share)?pools[0]:pools[1];
  const i=Math.floor(sequenceFraction(index+offset,.618033989)*selected.pool.length);
  return selected.pool[i];
}
function drawExample(P,m,ray,section,phase,alpha){
  const g=exampleGeometry(m,ray.source,pathLibrary.recipe[ray.i],section);
  const eye=[m.eye,0,m.eyeZ],cut=blocked(ray.code,m.mask),co=cut?art.terra:art.teal;
  const last=ray.bounce?g.bounce:g.start,dx=last[0]-eye[0],dy=last[1],dz=last[2]-eye[2];
  const gap=!cut?0:m.mask===1?config.discHeight/(dz*m.frame.cos-dx*m.frame.sin):.115/Math.hypot(dx,dy,dz);
  const endpoint=eye.map((v,i)=>between(v,last[i],within(gap,0,1)));
  const from=P(...g.start),to=P(...endpoint),via=ray.bounce?P(...g.bounce):null;
  const points=via?[from,via,to]:[from,to];
  ctx.save();ctx.globalAlpha=alpha;
  path(points,null,'rgba(255,254,239,.88)',3.15);
  if(via){line(from,via,co,1.45,[1.4,3.0]);line(via,to,co,1.95);circle(via,3.2,'#f4f5dc',co,1.25);}
  else line(from,to,co,cut?1.55:1.7,cut?[4.3,3.4]:[]);
  circle(from,2,'#fcfae7',co,.95);
  if(cut){const r=2.2;line([to[0]-r,to[1]-r],[to[0]+r,to[1]+r],co,1.4);line([to[0]+r,to[1]-r],[to[0]-r,to[1]+r],co,1.4);}
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  const distance=phase*lengths.reduce((sum,n)=>sum+n,0),seg=via&&distance>lengths[0]?1:0;
  const f=within((distance-(seg?lengths[0]:0))/Math.max(1e-7,lengths[seg]),0,1);
  const p=points[seg].map((v,i)=>between(v,points[seg+1][i],f));
  circle(p,2.9,'#fafce5');circle(p,1.75,co);
  ctx.restore();
}
function lightPaths(P,m,t){
  if(!showRays)return;
  const section=view==='cut',paths=preparedPaths(m,section);
  if(chapter===5&&!playState.finished&&(playState.running||playState.elapsed>0)){
    const halfway=playDuration()/2,second=playState.elapsed>=halfway;
    const pool=paths.reflected.length&&(second||!paths.direct.length)?paths.reflected:paths.direct;
    const ray=sampleExample(pool,second?11:4);
    if(ray){
      const phase=preference.matches ? .65 : within((playState.elapsed%halfway)/halfway,0,1);
      drawExample(P,m,ray,section,phase,1);
    }
    return;
  }
  const frozen=preference.matches||document.hidden;
  const time=frozen?2.55:t/1030+2.55,latest=Math.floor(time),life=2.55;
  for(let index=latest-2;index<=latest;index++){
    const age=(time-index)/life;
    if(age<0||age>=1)continue;
    const reflected=paths.reflected.length&&(!paths.direct.length||index%5===1);
    const ray=sampleExample(reflected?paths.reflected:paths.direct,index,reflected?7:0);
    if(!ray)continue;
    const strength=Math.min(1,age/.24,(1-age)/.32),alpha=strength*strength*(3-2*strength);
    drawExample(P,m,ray,section,age,alpha);
  }
}

function drawEyePaths(P,s,m,t,probeRadius=0){
  const eye=P(m.eye,0,m.eyeZ);
  // Keep the skin, lids and pupil visible when rays meet their physical origin.
  const outsideFace=new Path2D();outsideFace.rect(0,0,cw,ch);
  const pose=new DOMMatrix().translate(...eye).scale(s).rotate(-m.frame.deg).translate(0,config.eyeH);
  outsideFace.addPath(faceProfile,pose);
  ctx.save();ctx.clip(outsideFace,'evenodd');
  sightLine(P,m,eye);lightPaths(P,m,t);
  if(probeRadius)drawProbe(eye,s,m,probeRadius);
  ctx.restore();
  if(m.mask!==1)return;
  const project=(front,side,up)=>P(m.eye+front*m.frame.cos-up*m.frame.sin,side,m.eyeZ+front*m.frame.sin+up*m.frame.cos);
  if(view==='room'){
    const rim=[];
    for(let j=0;j<=36;j++){
      const a=2*Math.PI*j/36;
      rim.push(project(config.upperRadius*Math.cos(a),config.upperRadius*Math.sin(a),config.discHeight));
    }
    path(rim,'#303834','#18221e',1);
  }else{
    line(project(-config.upperRadius,0,config.discHeight),project(config.upperRadius,0,config.discHeight),'#202723',2);
  }
}
function dragEnabled(key) {return adjustable(key);}
function addDrag(key,anchor,s,rx,ry) {
  if(!dragEnabled(key))return;
  pickTargets.push({key,x:anchor[0],y:anchor[1],rx,ry,s});
}
function roomScene(m,t){
  const {P,s,perspective}=roomProjection(m,displayRoomWidth(m,t)),d=m.room.depth,w=m.room.width;
  architecture(P,s,m);
  const base=P(m.seat,0,0),eye=P(m.eye,0,m.eyeZ);
  ellipse([base[0]-.10*s,base[1]+.01*s],.55*s,.12*s,'rgba(64,79,60,.14)',-.10);
  if(!m.onlyRoof)panel(P,m);
  const foreground=[];
  desk(P,s,m,true,foreground);chair(P,m,true,foreground);seatedBodyInRoom(P,s,m,foreground);
  const radius=within(s*.58,19,44);
  if(perspective){
    // Project the two axes of the field diagram into the same side plane as the gaze ray.
    const ahead=P(m.eye+.01,0,m.eyeZ),down=P(m.eye,0,m.eyeZ-.01),unit=.01*s;
    ctx.save();
    ctx.transform((ahead[0]-eye[0])/unit,(ahead[1]-eye[1])/unit,(down[0]-eye[0])/unit,(down[1]-eye[1])/unit,...eye);
    fan([0,0],radius,m);ctx.restore();
  }else fan(eye,radius,m);
  seatedHead(base,s,m);
  drawEyePaths(P,s,m,t);
  const lamp=P(m.lamp,0,config.lampH),right=P(d,-config.wallY/2,config.wallHi);
  if(!m.onlyRoof){
    const label=tr(dragEnabled('lamp')?'↔ Panel ziehen':'Deckenpanel');
    const handle=callout(label,[lamp[0],lamp[1]-3],lamp[0]+s*.33,lamp[1]-Math.max(17,s*.48));
    addDrag('lamp',handle.point,s,handle.rx,handle.ry);
    addDrag('lamp',lamp,s,Math.max(27,s*.7),Math.max(23,s*.23));
  }else{
    const roof=P(d*.20,w*.21,config.roomH);
    callout(tr('Leuchtende Decke'),roof,roof[0]-s*.30,roof[1]-Math.max(16,s*.45),'right');
  }
  const wallPoint=P(d,-config.wallY/2,1.70);
  callout(wallLabel(m),wallPoint,right[0]+Math.min(s*.65,34),wallPoint[1]+12);
  if(dragEnabled('eye')){
    const deskCentre=P(m.seat+(config.deskNear+config.deskFar)/2,0,config.deskH);
    const seatHandle=callout(tr('↔ Sitzplatz ziehen'),deskCentre,base[0]-Math.max(22,s*.77),deskCentre[1]-Math.max(16,s*.32),'right');
    addDrag('eye',seatHandle.point,s,seatHandle.rx,seatHandle.ry);
    addDrag('eye',deskCentre,s,s*.63,Math.max(11,s*.16));
    addDrag('eye',[base[0]-.1*s,base[1]-.68*s],s,Math.max(28,s*.40),Math.max(34,s*.73));
  }
  dimension(P(0,-w/2,-.12),P(d,-w/2,-.12),tr('Tiefe {depth}',{depth:meters(d)}),5);

}
function cutScene(m,t){
  const {depth:d}=m.room,H=config.roomH,margin=cw<470?22:44;
  const s=Math.min((cw-2*margin)/d,(ch-67)/H);
  const ox=(cw-s*d)/2,floor=(ch+s*H)/2-2;
  const P=(x,y,z)=>[ox+x*s,floor-z*s];
  const eye=P(m.eye,0,m.eyeZ),tip=P(m.axis[0],0,m.axis[1]),top=P(0,0,H)[1];
  const room=[[ox,top],[ox+d*s,top],[ox+d*s,floor],[ox,floor]];
  path(room,grad([ox,top],[ox,floor],'#e4e9db','#f2f0df'),'#9aab98',1);
  for(let x=.5;x<d;x+=.5)line(P(x,0,0),P(x,0,H),'rgba(139,158,137,.22)',.6);
  for(let z=.5;z<H;z+=.5)line(P(0,0,z),P(d,0,z),'rgba(139,158,137,.22)',.6);
  ctx.save();ctx.beginPath();ctx.rect(ox,top,s*d,s*H);ctx.clip();
  const radius=Math.hypot(cw,ch);
  sector(eye,radius,m.frame.deg+90,m.frame.deg-90,'rgba(195,130,86,.085)');
  sector(eye,radius,m.frame.deg+(m.mask?50:90),m.frame.deg+(m.mask===2?-70:-90),'rgba(93,161,128,.135)');
  if(m.mask>0){
    const plane=(m.frame.deg+90)*Math.PI/180;
    line([eye[0]-radius*Math.cos(plane),eye[1]+radius*Math.sin(plane)],[eye[0]+radius*Math.cos(plane),eye[1]-radius*Math.sin(plane)],'#677b74',.9,[6,5]);
    const bounds=m.mask===2?[50,-70]:[50];
    bounds.forEach(angle=>{
      const r=(angle+m.frame.deg)*Math.PI/180;
      line(eye,[eye[0]+radius*Math.cos(r),eye[1]-radius*Math.sin(r)],'#9a6546',1.1,[3,4]);
    });
  }
  const probeRadius=chapter===0?drawProbeArc(eye,tip,s,m):0;
  ctx.restore();
  line(P(0,0,H),P(d,0,H),m.onlyRoof?'#c1af66':'#8a9e88',m.onlyRoof?6:2);
  if(m.onlyRoof)line(P(0,0,H-.035),P(d,0,H-.035),'#fff2a4',3);
  else{
    const l=m.lamp-config.panelX/2,r=m.lamp+config.panelX/2;
    line(P(l,0,config.lampH+.028),P(r,0,config.lampH+.028),'#547164',5);
    line(P(l+.02,0,config.lampH-.02),P(r-.02,0,config.lampH-.02),m.ceilingPower===0?'#acb8a8':'#f7d774',3.8);
  }
  line(P(d,0,m.wallLo),P(d,0,config.wallHi+frameRim),'#4b655b',6);
  line(P(d,0,m.wallLo),P(d,0,config.wallHi),m.window?(m.mix?'#bfe8ed':'#849aa2'):wallPanelColor(m.mix),3.5);
  line(P(d-sillDepth,0,m.wallLo),P(d,0,m.wallLo),'#667e70',1.8);
  const wallTop=P(d,0,config.wallHi);
  words(wallLabel(m),wallTop[0]-7,top+13,{align:'right',size:11,halo:true});
  const fr=within(.68*s,19,62);
  fan(eye,fr,m);desk(P,s,m,false);
  chair(P,m,false);seatedPerson(P(m.seat,0,0),s,m);
  path([[ox-3,floor],[ox+d*s+3,floor],[ox+d*s+3,floor+5],[ox-3,floor+5]],'#bbc2af','#8b9986');
  drawEyePaths(P,s,m,t,probeRadius);
  const right=ox+d*s;
  const labels=m.mask===0?[90,-90]:m.mask===1?[config.upperAngle]:[config.upperAngle,config.lowerAngle];
  labels.forEach(degrees=>{
    const a=(m.frame.deg+degrees)*Math.PI/180,rr=fr+8;
    const px=eye[0]+rr*Math.cos(a),py=eye[1]-rr*Math.sin(a);
    words(angleLabel(degrees),px+3,py+(degrees>0?-5:5),{align:Math.cos(a)<0?'right':'left',size:12,color:m.mask?'#84432c':art.axis,halo:true});
  });
  const hitsWall=m.axis[2]===0||m.axis[2]===4;
  words('0°',tip[0]+(hitsWall?-6:8),tip[1]+(m.frame.deg>0?9:-8),{align:hitsWall?'right':'left',size:11,color:art.axis,halo:true});
  if(!m.onlyRoof){
    const l=P(m.lamp,0,config.lampH);
    const label=tr(dragEnabled('lamp')?'↔ Panel ziehen':'Deckenpanel');
    const labelX=within(l[0],48,cw-48);
    words(label,labelX,top-13,{align:'center',size:12,halo:true});
    addDrag('lamp',l,s,Math.max(22,config.panelX*s/2),10);
    addDrag('lamp',[labelX,top-13],s,46,12);
  }else{
    const far=P(d,0,H);line(eye,far,'#6d7463',.85,[2,4]);
    circle(far,3,'#f5f3d6','#6d7463');
    words(tr('Deckenkante · {angle}',{angle:numberFormat.format(Math.round(m.roofGeometry.edge*10)/10)+'°'}),far[0],top-13,{align:'right',size:12,halo:true});
  }
  if(dragEnabled('eye')){
    const b=P(m.seat,0,0);
    const leftOfStool=b[0]-.49*s-34;
    const labelX=leftOfStool>=34?leftOfStool:Math.min(cw-34,b[0]+s*.9+35);
    words(tr('↔ Sitzplatz'),labelX,b[1]-8,{align:'center',size:11,halo:true});
    addDrag('eye',[labelX,b[1]-8],s,33,11);
    addDrag('eye',P(m.seat+(config.deskNear+config.deskFar)/2,0,config.deskH),s,s*.40,15);
    addDrag('eye',[b[0]-.1*s,b[1]-.65*s],s,Math.max(26,s*.39),Math.max(31,s*.69));
  }
  dimension([ox,floor],[right,floor],tr('Tiefe {depth}',{depth:meters(d)}),16);

}
function sensorScene(m,t,mini=false){
  const d=m.room.depth,w=m.room.width,H=config.roomH,e=m.eye,h=m.eyeZ;
  const small=cw<500;
  const r=mini?Math.min(cw,ch)*.48:Math.min((ch-37)/2,cw*(small?.30:.24));
  const centre=[cw/2,ch/2+(mini?0:1)],left=-w/2,right=w/2;
  const forward=([x,y,z])=>(x-e)*m.frame.cos+(z-h)*m.frame.sin;
  const lerp3=(a,b,f)=>a.map((n,i)=>between(n,b[i],f));
  // Äquidistantes 180°-Fischauge. Neunzig Grad Abstand von der Blickachse
  // entsprechen in jeder Richtung genau einem Bildradius.
  function polar(fwd,side,up){
    const transverse=Math.hypot(side,up);if(transverse<1e-12)return centre.slice();
    const factor=(2*r/Math.PI)*Math.atan2(transverse,fwd)/transverse;
    return [centre[0]-side*factor,centre[1]-up*factor];
  }
  function P(x,y,z){const dx=x-e,dz=z-h;return polar(dx*m.frame.cos+dz*m.frame.sin,y,dz*m.frame.cos-dx*m.frame.sin);}
  // Im Sensorkoordinatensystem wird jede Raumfläche vor dem Zeichnen an
  // der gekippten Messebene beschnitten, auch Fußboden und hintere Decke.
  function clipFront(poly){
    const out=[];let a=poly[poly.length-1],av=forward(a);
    for(const b of poly){
      const bv=forward(b);
      if((av>=0)!==(bv>=0))out.push(lerp3(a,b,av/(av-bv)));
      if(bv>=0)out.push(b);
      a=b;av=bv;
    }
    return out;
  }
  function edge(a,b,steps){
    const projected=[];
    for(let k=0;k<steps;k++)projected.push(P(...lerp3(a,b,k/steps)));
    return projected;
  }
  function face(points,fill,stroke=null,lineWidth=1){
    const poly=clipFront(points);
    if(poly.length<3)return;
    const projected=[];
    for(let i=0;i<poly.length;i++)projected.push(...edge(poly[i],poly[(i+1)%poly.length],mini?14:48));
    path(projected,fill,stroke,lineWidth);
  }
  function surfaceLine(a,b,stroke,width){
    const av=forward(a),bv=forward(b);if(av<0&&bv<0)return;
    if((av>=0)!==(bv>=0)){
      const clip=lerp3(a,b,av/(av-bv));if(av<0)a=clip;else b=clip;
    }
    path([...edge(a,b,30),P(...b)],null,stroke,width);
  }
  ctx.save();ctx.beginPath();ctx.arc(...centre,r,0,2*Math.PI);ctx.clip();
  circle(centre,r,'#c3cfbd');
  face([[0,right,0],[d,right,0],[d,right,H],[0,right,H]],surfaceColor(m,'wall','#c0d1be'),'#8fa68f');
  face([[0,left,H],[d,left,H],[d,left,0],[0,left,0]],surfaceColor(m,'wall','#ccdac8'),'#8fa68f');
  face([[0,right,H],[0,left,H],[0,left,0],[0,right,0]],surfaceColor(m,'wall','#b7c9b8'),'#8fa68f');
  face([[0,left,0],[d,left,0],[d,right,0],[0,right,0]],surfaceColor(m,'floor','#ddd7bf'),'#abae97');
  face([[0,right,H],[d,right,H],[d,left,H],[0,left,H]],m.onlyRoof?'#fff1b0':surfaceColor(m,'ceiling','#dbe3cf'),'#99a98e');
  face(wallFace(d,w/2,0,H),surfaceColor(m,'wall','#d6cfb4'),'#9ba389');
  if(!mini){
    const step=jointSpacing(r/3.5);
    for(let x=step;x<d-.08;x+=step)surfaceLine([x,right,.08],[x,right,H],'rgba(70,99,85,.23)',.72);
    for(let y=left+step;y<right-.08;y+=step)surfaceLine([d,y,.08],[d,y,H],'rgba(133,113,79,.24)',.72);
    for(let x=.75;x<d;x+=.75)surfaceLine([x,left,0],[x,right,0],'rgba(125,144,116,.40)',.73);
    for(let y=left+.8;y<right;y+=.8)surfaceLine([0,y,0],[d,y,0],'rgba(125,144,116,.36)',.7);
  }
  {
    const y=config.wallY/2,lo=m.wallLo,hi=config.wallHi;
    face(wallFace(d,y+frameRim,lo,hi+frameRim),'#53695e','#465e52',.8);
    face(wallFace(d,y,lo,hi),m.window?(m.mix?'#c5e7eb':'#98a9b3'):wallDiffuser(P,d,y,lo,hi,m.mix),m.window?'#dfe9e6':'#dbd9b6',1);
    face([[d-sillDepth,-y-frameRim,lo],[d,-y-frameRim,lo],[d,y+frameRim,lo],[d-sillDepth,y+frameRim,lo]],m.window?'#dce4d9':'#cfd3bd','#75877d',.8);
  }
  if(!m.onlyRoof){
    const l=m.lamp-config.panelX/2,rr=m.lamp+config.panelX/2,yw=config.panelY/2,z=config.lampH;
    face([[l,-yw,z],[rr,-yw,z],[rr,yw,z],[l,yw,z]],m.ceilingPower===0?'#aebcae':'#ffedac','#597269',mini?.8:1.6);
  }
  // Der Sensor sieht die Oberseite der Tischplatte. Sie verdeckt dahinterliegende Flächen.
  const near=m.seat+config.deskNear,far=m.seat+config.deskFar,half=config.deskWidth/2,top=config.deskH;
  face([[near,-half,top-.045],[near,half,top-.045],[near,half,top],[near,-half,top]],'#ad8d69','#8a765c',.8);
  face([[near,-half,top],[far,-half,top],[far,half,top],[near,half,top]],surfaceColor(m,'desk','#e4c6a0'),'#a08766',1);
  function drawBoundary(degrees){
    const beta=degrees*Math.PI/180,arc=[];
    if(m.mask===1){
      for(let j=0;j<=80;j++){
        const az=-Math.PI/2+Math.PI*j/80;
        arc.push(polar(Math.cos(beta)*Math.cos(az),Math.cos(beta)*Math.sin(az),Math.sin(beta)));
      }
    }else{
      const y=centre[1]-r*degrees/90,dx=r*Math.sqrt(1-(degrees/90)**2);
      arc.push([centre[0]+dx,y],[centre[0],y],[centre[0]-dx,y]);
    }
    const bound=new Path2D();bound.moveTo(...arc[0]);arc.slice(1).forEach(p=>bound.lineTo(...p));
    const end=arc[arc.length-1],start=arc[0];
    bound.arc(...centre,r,Math.atan2(end[1]-centre[1],end[0]-centre[0]),Math.atan2(start[1]-centre[1],start[0]-centre[0]),degrees>0?false:true);
    bound.closePath();ctx.save();ctx.clip(bound);ctx.fillStyle='rgba(94,65,52,.53)';ctx.fillRect(centre[0]-r,centre[1]-r,2*r,2*r);
    for(let x=centre[0]-2*r;x<centre[0]+3*r;x+=8)line([x,centre[1]-r],[x-2*r,centre[1]+r],'rgba(255,235,208,.55)',.85);
    ctx.restore();path(arc,null,'#91492f',1.4);return arc;
  }
  if(m.mask)drawBoundary(config.upperAngle);
  if(m.mask===2)drawBoundary(config.lowerAngle);
  if(!mini){
    for(const degrees of [30,60]){
      ctx.save();ctx.setLineDash([1.2,4]);ctx.strokeStyle='rgba(43,74,65,.47)';ctx.lineWidth=.85;
      ctx.beginPath();ctx.arc(...centre,r*degrees/90,0,2*Math.PI);ctx.stroke();ctx.restore();
    }
  }

  line([centre[0]-r,centre[1]],[centre[0]+r,centre[1]],'rgba(57,78,81,.46)',.75,[2,5]);
  line([centre[0]-6,centre[1]],[centre[0]+6,centre[1]],art.axis,.85);
  line([centre[0],centre[1]-6],[centre[0],centre[1]+6],art.axis,.85);
  circle(centre,3.5,'#faf8e8',art.axis,1.2);circle(centre,1.25,art.ink);
  ctx.restore();
  ctx.beginPath();ctx.arc(...centre,r,0,2*Math.PI);ctx.lineWidth=1.5;ctx.strokeStyle='#607b69';ctx.stroke();
  if(mini)return;
  words(tr('Blickachse 0° · Rand 90° · Durchmesser 180°'),centre[0],centre[1]+r+12,{size:11,align:'center',color:'#354f43',halo:true});
  for(const deg of [30,60]){const x=centre[0]+r*deg/90;line([x,centre[1]-3],[x,centre[1]+3],art.axis,.85);words(deg+'°',x,centre[1]+12,{align:'center',size:10,halo:true});}
  for(const deg of (m.mask===2?[50,-70]:m.mask===1?[50]:[])){
    const y=centre[1]-r*deg/90;
    line([centre[0]-4,y],[centre[0]+4,y],'#74442c',1.4);
    words(angleLabel(deg),centre[0]+7,y+(deg>0?-6:9),{size:12,color:'#753e2a',weight:650,halo:true});
  }
  words('0°',centre[0]+9,centre[1]-9,{size:11,color:art.ink,weight:650,halo:true});
  if(!small){
    if(!m.onlyRoof){
      const visible=clipFront([[m.lamp-config.panelX/2,0,config.lampH],[m.lamp+config.panelX/2,0,config.lampH],[m.lamp+config.panelX/2,config.panelY/2,config.lampH]]);
      if(visible.length>=3){const a=visible.reduce((p,v)=>p.map((x,j)=>x+v[j]/visible.length),[0,0,0]);callout(tr('Deckenpanel'),P(...a),centre[0]-r-14,centre[1]-r*.67,'right');}
    }else{
      const a=[d-m.roofGeometry.strip*.30,0,H];if(m.roofGeometry.strip>0)callout(tr('Leuchtende Decke'),P(...a),centre[0]-r-14,centre[1]-r*.62,'right');
    }
      const anchor=[d,config.wallY/2,1.65];
      if(forward(anchor)>0)callout(wallLabel(m),P(...anchor),centre[0]-r-14,centre[1]+r*.04,'right');
    if(m.frame.deg<0){const a=[near+.35,half*.7,top];callout(tr('Schreibtisch'),P(...a),centre[0]-r-14,centre[1]+r*.67,'right');}
  }
}

function scheduleDraw() {if(!frameHandle)frameHandle=requestAnimationFrame(draw);}
function previewMask(m){
  const picture=el('preview-mask');
  if(picture.dataset.mask===String(m.mask))return;
  picture.innerHTML=window.fieldGuides.meter.fieldPictogram(m.mask,config.upperAngle,config.lowerAngle);
  picture.dataset.mask=String(m.mask);
}
function previewSeat(m){
  const seats=m.room.seatX,position=(m.seat-seats[0])/(seats.at(-1)-seats[0]);
  const x=22+35*position,s=29,base=60;
  const P=(worldX,y,z)=>[x+(worldX-m.seat)*s,base-z*s];
  path([[5,14],[5,base],[85,base],[85,14]],null,'#a5b5a6',1.4);
  path([[5,base],[85,base],[85,base+3],[5,base+3]],'#d3dac9');
  chair(P,m,false);desk(P,s,m,false);seatedPerson([x,base],s,m);
  arrow([38,70],[13,70],art.teal,1.35);arrow([52,70],[77,70],art.teal,1.35);
}
function previewSize(state){
  const amount=state.size/ranges.size,half=17+12*amount,depth=12+7*amount,cy=40;
  const left=[45-half-depth,cy+1],top=[45+half-depth,cy-9],right=[45+half+depth,cy+5],front=[45-half+depth,cy+15];
  const up=p=>[p[0],p[1]-20];
  path([left,top,right,front],'#cbd3bb','#6e8775',1.2);
  path([left,up(left),up(top),top],'#acbfad','#698374',1.2);
  path([top,up(top),up(right),right],'#ded2ad','#948b70',1.2);
  for(const t of [.33,.67]){
    line([between(left[0],front[0],t),between(left[1],front[1],t)],[between(top[0],right[0],t),between(top[1],right[1],t)],'#a9b69f',.8);
  }
  const a=[front[0],front[1]+9],b=[right[0],right[1]+9];
  line(a,b,art.teal,1.3);
  for(const p of [a,b])line([p[0]-2,p[1]+3],[p[0]+2,p[1]-3],art.teal,1.3);
}
function previewLamp(m,state){
  const full=m.onlyRoof,x=full?45:22+46*state.lamp/ranges.lamp,half=full?34:13;
  path([[6,42],[6,12],[84,12],[84,42]],null,'#a5b5a6',1.3);
  line([6,16],[84,16],'#c2cdba',1);
  path([[x-half,26],[x+half,26],[Math.min(88,x+half+11),58],[Math.max(2,x-half-11),58]],grad([0,26],[0,58],'#f2de92','rgba(249,237,181,.12)'));
  for(const dx of [-half*.68,half*.68])line([x+dx,16],[x+dx,22],'#788b7a',1.3);
  path([[x-half,22],[x+half-2,22],[x+half+2,25],[x-half+3,25]],'#fff0ab','#6b8069',1.4);
  line([x-half+3,26],[x+half+2,26],'#aa9457',1.4);
  if(!full){arrow([40,65],[13,65],art.teal,1.35);arrow([50,65],[77,65],art.teal,1.35);}
}
function previewSource(m){
  const tone=m.window?'#acd5de':m.source==='off'?'#bfc9bf':'#f5dda0';
  path([[10,9],[79,15],[79,65],[10,59]],'#d6cfb5','#8b8975',1.2);
  path([[20,16],[68,20],[68,48],[20,44]],'#658075','#4c655f',1.3);
  path([[23,19],[65,23],[65,45],[23,41]],grad([35,19],[45,48],tone,m.window?'#def0e9':m.source==='off'?'#dfe3d6':'#fff3ca'));
  if(m.window){
    line([31,34],[43,24],'#eaf8f4',1.8);
    line([41,36],[53,26],'#eaf8f4',1.2);
  }
  path([[16,45],[70,50],[66,53],[12,48]],'#ede7cd','#738377',1);
}
function previewMix(m){
  const eye=[38,53];
  path([[10,58],[10,12],[78,12],[78,61]],null,'#9aaf9d',1.4);
  path([[9,62],[79,62],[79,68],[9,68]],'#d5dbc7');
  const ceiling=m.ceilingPower,wall=m.mix;
  roundBox(30,14,23,4,1,ceiling>0?'#ffe797':'#c8cfc0','#828c6f');
  roundBox(72,26,4,24,1,m.source==='off'?'#c8cfc0':m.window?'#a4d3db':'#ffe797','#828c6f');
  function beam(a,b,amount,fill){
    if(amount<=0)return;
    ctx.save();ctx.globalAlpha=.30+.70*Math.min(1,amount/100);
    path([a,b,eye],fill);
    const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    arrow(mid,eye,art.teal,1.3);
    ctx.restore();
  }
  beam([30,19],[53,19],ceiling,'#e8ce75');
  beam([71,26],[71,51],wall,m.window?'#92c7c7':'#e8ce75');
  circle(eye,3,'#fcf8df',art.ink,1.4);
}
function previewReflection(m){
  const lamp=[62,17],bounce=[43,57],eye=[19,38];
  path([[7,62],[74,62],[82,57],[15,57]],'#d1b38c','#8a7963',1.2);
  path([[7,62],[74,62],[74,66],[7,66]],'#bca386','#8a7963',1);
  roundBox(51,12,22,4,1,'#ffe6a0','#758468');
  line(lamp,bounce,m.reflect?art.teal:'#92a598',1.8,[3,2.5]);
  if(m.reflect)arrow(bounce,eye,art.teal,2);
  circle(bounce,3.2,'#fff6c5',m.reflect?art.teal:'#849989',1.4);
  circle(eye,3.2,'#fcf9e7',art.ink,1.3);
}
function drawParameterPictures(m,state){
  previewMask(m);
  const painters={eye:previewSeat,size:()=>previewSize(state),lamp:()=>previewLamp(m,state),source:previewSource,mix:previewMix,reflect:previewReflection};
  const sceneContext=ctx;
  try{
    for(const [key,paint] of Object.entries(painters)){
      const picture=el('preview-'+key);
      ctx=picture.getContext('2d');ctx.setTransform(picture.width/90,0,0,picture.height/80,0,0);
      ctx.fillStyle=grad([0,0],[90,80],'#f2f4e9','#dce7d8');ctx.fillRect(0,0,90,80);
      ctx.lineCap='round';ctx.lineJoin='round';paint(m);
    }
  }finally{ctx=sceneContext;}
  drawPosePreview(m);
}

function drawPosePreview(m){
  const preview=el('pose-preview');
  if(!preview||preview.dataset.pose===String(m.frame.deg))return;
  const previous=ctx;
  try{
    ctx=preview.getContext('2d');const w=90,h=80,s=134,origin=[57,1.44*s];
    ctx.setTransform(preview.width/w,0,0,preview.height/h,0,0);ctx.clearRect(0,0,w,h);
    ctx.fillStyle=grad([0,0],[w,h],'#eef2e7','#dae5d6');ctx.fillRect(0,0,w,h);
    seatedPerson(origin,s,m);
    const eye=[origin[0]+m.frame.eyeOffset*s,origin[1]-m.eyeZ*s];
    if(m.frame.deg!==0)line([eye[0]+2,eye[1]],[w-3,eye[1]],'rgba(61,86,74,.44)',.85,[1.3,3.2]);
    const length=Math.min((w-6-eye[0])/m.frame.cos,(m.frame.sin<0?(h-5-eye[1]):eye[1]-5)/(Math.abs(m.frame.sin)||.001));
    arrow(eye,[eye[0]+length*m.frame.cos,eye[1]-length*m.frame.sin],art.teal,1.1,[3,2.7]);
    circle(eye,1.55,'#f8f9e9',art.ink,.8);preview.dataset.pose=String(m.frame.deg);
  }finally{ctx=previous;}
}
function draw(t){
  frameHandle=0;
  if(!sceneModel||authorVisible)return;
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,3);
  cw=rect.width;ch=rect.height;
  if(cw<1||ch<1)return;
  tickExperiment(t);
  if(el('main').classList.contains('model-pending')){
    // Wait if there is no suitable scene. During a resize, keep drawing the displayed room.
    if(playState.running)scheduleDraw();
    return;
  }
  const px=Math.round(cw*dpr),py=Math.round(ch*dpr);
  if(canvas.width!==px||canvas.height!==py){canvas.width=px;canvas.height=py;}
  ctx.setTransform(px/cw,0,0,py/ch,0,0);ctx.clearRect(0,0,cw,ch);
  ctx.lineCap='round';ctx.lineJoin='round';pickTargets=[];
  if(!sceneModel.onlyRoof||view!=='room'||preference.matches)ceilingResize=null;
  if(view==='room')roomScene(sceneModel,t);else if(view==='cut')cutScene(sceneModel,t);else sensorScene(sceneModel,t);
  miniSensor(sceneModel,t);
  if(playState.running)scheduleDraw();
  else if(showRays&&view!=='sensor'&&!preference.matches&&!document.hidden&&!dialog.open&&!lightTimer&&!(chapter===5&&playState.elapsed>0&&!playState.finished)){
    lightTimer=setTimeout(()=>{lightTimer=0;scheduleDraw();},40);
  }
}
function hitTest(x,y){
  return pickTargets.find(h=>Math.abs(x-h.x)<=h.rx&&Math.abs(y-h.y)<=h.ry);
}
function pointerPitch(origin,x,y){
  return Math.atan2(origin[1]-y,Math.max(2,x-origin[0]))*180/Math.PI;
}
function setGazePitch(value){
  const slider=el('range-tilt'),min=Number(slider.min),max=Number(slider.max),step=Number(slider.step);
  const pitch=within(min+Math.round((value-min)/step)*step,min,max);
  if(current().tilt===pitch)return;
  current().tilt=pitch;refresh();
}
function beginGaze(ev,origin){
  return {id:ev.pointerId,key:'tilt',origin,start:current().tilt,pointerStart:pointerPitch(origin,ev.clientX,ev.clientY)};
}
function rotateGaze(d,x,y){
  if(Math.hypot(x-d.origin[0],y-d.origin[1])>4)setGazePitch(d.start+pointerPitch(d.origin,x,y)-d.pointerStart);
}
function finishGaze(){
  announce(tr('Blickneigung {value}.',{value:sliderValue('tilt',current())})+' '+spokenResult());
}
function installDragging(){
  const drawing=el('drawing'),control=el('gaze-control');
  function relative(ev){const r=canvas.getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top];}
  drawing.addEventListener('pointerdown',ev=>{
    if(!sceneModel||!el('data-status').hidden||ev.button!==0||!ev.isPrimary||drag||ev.target.closest('#lens'))return;
    const [x,y]=relative(ev),onGaze=ev.target.closest('#gaze-control');
    let h=hitTest(x,y);
    if(onGaze){
      const [tx,ty]=gazeLayout.tip;
      const nearerProbe=h?.key==='probe'&&Math.hypot(x-h.x,y-h.y)<Math.hypot(x-tx,y-ty);
      if(!nearerProbe)h={key:'tilt'};
    }
    if(!h)return;
    clearPlayback();
    if(h.key==='tilt'){
      const [ex,ey]=gazeLayout.eye;
      drag=beginGaze(ev,[ev.clientX-x+ex,ev.clientY-y+ey]);
    }
    else if(h.key==='probe')drag={id:ev.pointerId,key:'probe',origin:h.origin};
    else{
      const room=sceneModel.room,coords=h.key==='eye'?room.seatX:room.lampX;
      drag={id:ev.pointerId,x,start:coords[current()[h.key]],coords,key:h.key,s:h.s};
    }
    drawing.setPointerCapture(ev.pointerId);drawing.classList.add('dragging');ev.preventDefault();
  });
  drawing.addEventListener('pointermove',ev=>{
    const [x,y]=relative(ev);
    if(!drag){canvas.style.cursor=hitTest(x,y)?'grab':'';return;}
    if(drag.id!==ev.pointerId)return;
    if(drag.key==='tilt')rotateGaze(drag,ev.clientX,ev.clientY);
    else if(drag.key==='probe'){
      probeAngle=within(Math.round(Math.atan2(drag.origin[1]-y,x-drag.origin[0])*180/Math.PI-sceneModel.frame.deg),-90,90);
      updateProbe();scheduleDraw();
    }else{
      if(!dragEnabled(drag.key))return;
      const desired=drag.start+(x-drag.x)/drag.s;
      let best=0;drag.coords.forEach((v,i)=>{if(Math.abs(v-desired)<Math.abs(drag.coords[best]-desired))best=i;});
      if(current()[drag.key]!==best){current()[drag.key]=best;refresh();}
    }
    ev.preventDefault();
  });
  function release(ev){
    if(!drag||ev.pointerId!==drag.id)return;
    const key=drag.key;drag=null;canvas.style.cursor='';drawing.classList.remove('dragging');
    if(drawing.hasPointerCapture(ev.pointerId))drawing.releasePointerCapture(ev.pointerId);
    if(key==='tilt')finishGaze();else announce(key==='probe'?el('probe-result').textContent:spokenResult());
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])drawing.addEventListener(type,release);
  control.addEventListener('keydown',ev=>{
    const slider=el('range-tilt'),step=Number(slider.step),a=current().tilt;
    const keys={ArrowUp:a+step,ArrowRight:a+step,ArrowDown:a-step,ArrowLeft:a-step,Home:Number(slider.min),End:Number(slider.max)};
    if(!Object.hasOwn(keys,ev.key)||ev.altKey||ev.metaKey||ev.ctrlKey)return;
    ev.preventDefault();ev.stopPropagation();clearPlayback();setGazePitch(keys[ev.key]);finishGaze();
  });

  const settings=el('settings');
  let portraitDrag=null;
  settings.addEventListener('pointerdown',ev=>{
    if(!sceneModel||!el('data-status').hidden||ev.target.id!=='pose-preview'||ev.button!==0||!ev.isPrimary)return;
    const rect=ev.target.getBoundingClientRect(),m=sceneModel;
    const origin=[rect.left+(57+134*m.frame.eyeOffset)*rect.width/90,
      rect.top+(1.44-m.eyeZ)*134*rect.height/80];
    clearPlayback();portraitDrag=beginGaze(ev,origin);
    ev.target.setPointerCapture(ev.pointerId);ev.target.classList.add('dragging');ev.preventDefault();
  });
  settings.addEventListener('pointermove',ev=>{
    if(!portraitDrag||portraitDrag.id!==ev.pointerId)return;
    rotateGaze(portraitDrag,ev.clientX,ev.clientY);ev.preventDefault();
  });
  function endPortrait(ev){
    if(!portraitDrag||ev.pointerId!==portraitDrag.id)return;
    portraitDrag=null;ev.target.classList.remove('dragging');
    if(ev.target.hasPointerCapture(ev.pointerId))ev.target.releasePointerCapture(ev.pointerId);
    finishGaze();
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])settings.addEventListener(type,endPortrait);
}

function clipArea(points,paint){
  ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
  paint();ctx.restore();
}
function softPool(p,rx,ry,inner,outer){
  ctx.save();ctx.translate(...p);ctx.scale(Math.max(rx,1),Math.max(ry,1));
  const glow=ctx.createRadialGradient(0,0,0,0,0,1);glow.addColorStop(0,inner);glow.addColorStop(1,outer);
  ctx.fillStyle=glow;ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function drawProbeArc(eye,tip,s,m){
  const tipDistance=Math.hypot(tip[0]-eye[0],tip[1]-eye[1]);
  let r=within(.99*s,34,107);
  if(Math.abs(r-tipDistance)<34)r=tipDistance>=64?tipDistance-34:tipDistance+34;
  ctx.save();ctx.strokeStyle='rgba(118,89,49,.52)';ctx.lineWidth=1;
  ctx.setLineDash([1.5,4]);ctx.beginPath();ctx.arc(...eye,r,(-90-m.frame.deg)*Math.PI/180,(90-m.frame.deg)*Math.PI/180);ctx.stroke();ctx.restore();
  return r;
}
function drawProbe(eye,s,m,r){
  const angle=(probeAngle+m.frame.deg)*Math.PI/180;
  const src=[eye[0]+r*Math.cos(angle),eye[1]-r*Math.sin(angle)];
  const cut=probeIsBlocked(m.mask),ink=cut?art.terra:art.teal;
  const stop=m.mask===1?s*config.discHeight/Math.max(.001,Math.abs(Math.sin(probeAngle*Math.PI/180))):.115*s;
  const skip=cut?Math.min(1,stop/r):0;
  const dest=[between(eye[0],src[0],skip),between(eye[1],src[1],skip)];
  line(src,dest,'rgba(255,254,242,.97)',5);
  if(cut){
    line(src,dest,ink,2.35,[4.5,3.1]);
    for(const sign of [-1,1])line([dest[0]-2.6,dest[1]-2.6*sign],[dest[0]+2.6,dest[1]+2.6*sign],ink,1.75);
  }else arrow(src,dest,ink,2.35);
  circle(src,7.3,cut?'#f3dcce':'#d3ebd8',ink,1.6);circle(src,2.4,ink);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;line([src[0]+9*Math.cos(a),src[1]+9*Math.sin(a)],[src[0]+11.5*Math.cos(a),src[1]+11.5*Math.sin(a)],ink,1.05);}
  pickTargets.push({key:'probe',x:src[0],y:src[1],rx:17,ry:17,origin:eye});
}
function miniSensor(m,t){
  const button=el('lens');button.hidden=view!=='room'||cw<600;
  if(button.hidden||previewScene===m)return;previewScene=m;
  const c=el('lens-preview'),old=ctx,oldW=cw,oldH=ch;
  try{
    ctx=c.getContext('2d');cw=78;ch=78;
    ctx.setTransform(c.width/cw,0,0,c.height/ch,0,0);ctx.clearRect(0,0,cw,ch);sensorScene(m,t,true);
  }finally{ctx=old;cw=oldW;ch=oldH;}
}
