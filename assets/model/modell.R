# Licht im Gesichtsfeld. Geometrisches Lehrmodell, alle Eingaben stehen hier.
# Rscript --vanilla modell.R modelldaten.json
library(jsonlite)
library(base64enc)
args <- commandArgs(trailingOnly=TRUE)

H <- 2.80
eye_h <- 1.20
lamp_h <- 2.72
panel_x <- 1.20
panel_y <- 0.90
wall_y <- 2.60
wall_top <- 2.55
desk_h <- 0.72
wall_bottom <- desk_h   # Gemeinsame Unterkante von Wandpanel und Fenster.
desk_near <- 0.11
desk_far <- 0.86
chair_back <- 0.466
desk_width <- 1.20
desk_sample <- 0.15
panel_offsets <- c(-0.52, 0, 0.52)
wall_samples <- c(1.00, 2.30)
roof_samples <- c(-0.22, 0.12, 0.48, 0.94)
angles <- seq(-45, 30, by = 5)
rad <- pi/180
co <- cos(angles*rad)
si <- sin(angles*rad)
upper <- 50*rad
lower <- -70*rad
widths <- 4:16
depths <- widths * 0.75
eyes <- 8:32    # Stützstellen. seat_positions() ordnet ihnen Abstände in Metern zu.
lamps <- 12:40
wall_share <- (0:10)/10
flat <- match(0, angles)
desk_mid <- match(25, eyes)

# Gezeichnete Nickerbewegung im Profil. Koordinaten in Metern relativ zum Sitzplatz.
# Der Hals bewegt den Schädelansatz, der Kopf nickt dort weiter. Die Aufteilung
# ist eine Annahme der Illustration. Das Auge folgt als fester Punkt am Kopf.
neck_base <- c(x=-0.145, z=1.005)
skull_neutral <- c(x=-0.115, z=1.145)
posture <- function(a) {
  rotate <- function(v,theta) c(v[1]*cos(theta)-v[2]*sin(theta),v[1]*sin(theta)+v[2]*cos(theta))
  # Beim tieferen Nicken arbeitet die untere Halsregion stärker mit.
  neck_angle <- a*(0.40+0.15*min(abs(a)/45,1))*rad
  skull <- neck_base+rotate(skull_neutral-neck_base,neck_angle)
  eye <- skull+rotate(c(0,eye_h)-skull_neutral,a*rad)
  unname(c(skull,eye))
}
poses <- vapply(angles,posture,numeric(4))
eye_offset <- poses[3,]; eye_z <- poses[4,]
stopifnot(abs(eye_offset[flat]) < 1e-12, abs(eye_z[flat]-eye_h) < 1e-12,
          all(diff(eye_z)>0))

seat_positions <- function(d) {
  # Stuhllehne an der Rückwand, Ausgangsplatz, Raummitte, Tisch an der Stirnwand.
  approx(c(8,18,25,32),c(chair_back,.36*d,d/2,d-desk_far),xout=eyes)$y
}
lamp_positions <- function(d) {
  # Die Kanten des 1,20 m langen Panels erreichen beide Raumenden.
  approx(c(12,25,31,40),c(panel_x/2,d/2,.62*d,d-panel_x/2),xout=lamps)$y
}
midpoints <- function(lo, hi, n) lo + (seq_len(n)-0.5)*(hi-lo)/n
# Zauner et al. 2023, Abb. 1b: harte Grenzen der vertikalen Koordinate
# im äquidistanten Winkelbild. Die separate Kreisscheibe begrenzt die
# sphärische Elevation. Beide Größen stimmen im vertikalen Mittelschnitt überein.
chart_height <- function(front,side,up) {
  transverse <- sqrt(side^2+up^2)
  up*atan2(transverse,front)/pmax(transverse,1e-25)
}
in_field <- function(front,side,up) {
  h <- chart_height(front,side,up)
  h>=lower & h<=upper
}
# Für eine horizontale Grenzlinie gilt theta*cot(theta) = Grenze*front/abs(up).
# Die für die Halbraummaske benötigte Umkehrfunktion ist monoton. Das dichte
# Raster wird einmal aufgebaut und bei allen Flächenintegralen wiederverwendet.
angle_nodes <- seq(pi/2,0.001,length.out=32769)
eta_step <- 1/16384
theta_table <- approx(angle_nodes/tan(angle_nodes),angle_nodes,
                      xout=(0:16384)*eta_step,rule=2)$y
accepted_y_min <- function(front,up,half,mask) {
  if(mask==0)return(rep(0,length(front)))
  if(mask==1)return(pmin(half,sqrt(pmax(0,(pmax(up,0)/sin(upper))^2-front^2-up^2))))
  limit<-ifelse(up>=0,upper,-lower)
  a<-atan2(abs(up),front)
  eta<-pmin(1,pmax(0,limit*front/pmax(abs(up),1e-30)))/eta_step
  i<-pmin(floor(eta),length(theta_table)-2L)
  theta<-theta_table[i+1]+(eta-i)*(theta_table[i+2]-theta_table[i+1])
  ifelse(a<=limit,0,pmin(half,abs(up)*sqrt(pmax(0,(theta/limit)^2-1))))
}
# Die Blickachse dreht mit dem Kopf. Sensor und Blenden folgen dem Auge.
# Die lokale Vorwärtskoordinate ist dx*cos(b) + dz*sin(b), nach oben zeigt
# -dx*sin(b) + dz*cos(b). Die Ausgangsblickrichtung ist die positive Raum-x-Achse.
integrate_field <- function(dx, dy, dz, normal_distance, weight, t) {
  r2 <- dx^2 + dy^2 + dz^2
  r <- sqrt(r2)
  factor <- weight * normal_distance / r2^2
  front <- dx*co[t] + dz*si[t]
  up <- dz*co[t] - dx*si[t]
  ee <- pmax(front,0) * factor
  top_ok <- up <= r*sin(upper)
  c(open = sum(ee), top = sum(ee[top_ok]),
    both = sum(ee[in_field(front,dy,up)]))
}
panel_field <- function(delta,n=168L,pitches=seq_along(angles)){
  x<-delta+midpoints(-panel_x/2,panel_x/2,n)
  vapply(pitches,function(t){
    dx<-x-eye_offset[t];dz<-lamp_h-eye_z[t];b<-dx^2+dz^2
    up<-dz*co[t]-dx*si[t];front<-dx*co[t]+dz*si[t]
    primitive<-function(y)y/(b*(b+y*y))+atan(y/sqrt(b))/(b*sqrt(b))
    all<-primitive(panel_y/2)
    vapply(0:2,function(k){
      y<-accepted_y_min(front,up,panel_y/2,k)
      mean(pmax(front,0)*dz*(all-primitive(y)))/panel_y
    },numeric(1))
  },numeric(3))
}
# Zusammengesetzte Gauß-Legendre-Quadratur für die an Tischkanten unterteilte Wand.
nodes<-seq_len(23)/sqrt(4*seq_len(23)^2-1)
jacobi<-matrix(0,24,24);jacobi[col(jacobi)-row(jacobi)==1]<-nodes
rule<-eigen(jacobi+t(jacobi),symmetric=TRUE)
integrate_wall_slice<-function(fun,a,b,k){
  edges<-seq(a,b,length.out=max(2,ceiling((b-a)/.06)+1))
  rad<-diff(edges)/2;mid<-head(edges,-1)+rad
  x<-sweep(outer(rule$values,rad),2,mid,'+')
  sum(fun(as.vector(x),k)*as.vector(outer(2*rule$vectors[1,]^2,rad)))
}
desk_blocks <- function(dx, dy, dz, t=flat) {
  # Schnitt des Sichtstrahls mit der opaken Arbeitsfläche vor dem Auge.
  fraction <- ifelse(dz < 0, (desk_h-eye_z[t])/pmin(dz,-1e-15), 2)
  intersection_x <- eye_offset[t]+dx*fraction
  fraction > 0 & fraction < 1 & intersection_x >= desk_near &
    intersection_x <= desk_far & abs(dy*fraction) <= desk_width/2
}
wall_field <- function(dx,n=84L,pitches=seq_along(angles)){
  # Quer analytisch, vertikal mit Gauß-Legendre-Quadratur.
  vapply(pitches,function(t){
    ex<-dx-eye_offset[t];ez<-eye_z[t];zs<-c(wall_bottom,wall_top)-ez
    one<-function(dz,mask){
      b<-ex*ex+dz*dz;up<-dz*co[t]-ex*si[t];front<-pmax(ex*co[t]+dz*si[t],0)
      y0<-accepted_y_min(front,up,wall_y/2,mask)
      primitive<-function(y)y/(b*(b+y*y))+atan(y/sqrt(b))/(b^1.5)
      ex*front*(primitive(wall_y/2)-primitive(y0))/(wall_y*(wall_top-wall_bottom))
    }
    vapply(0:2,function(k)integrate_wall_slice(one,zs[1],zs[2],k),numeric(1))
  },numeric(3))
}


ceiling_field <- function(w, d, step = 0.018, pitches = seq_along(angles)) {
  # Bei Aufwärtsneigung kann auch Decke hinter der ursprünglich senkrechten Ebene beitragen.
  nx <- 2L*ceiling(d/(2*step))
  ny <- ceiling(w/step)
  xy <- expand.grid(x = midpoints(-d/2,d/2,nx), y = midpoints(-w/2,w/2,ny))
  vapply(pitches,function(t){
    dz <- H-eye_z[t]
    integrate_field(xy$x-eye_offset[t],xy$y,dz,dz,0.12*d*w/nrow(xy),t)
  },numeric(3))
}
# Interne Skalierung für die verlustarm gespeicherten Tabellen. Die Luxreferenz
# enthält zusätzlich die reflektierten Beiträge am Ausgangsplatz.
ref_open <- (0.7*panel_field((31-18)*4.5/50,pitches=flat)[,1] + 0.3*wall_field(4.5*(1-18/50),pitches=flat)[,1])[1]

# Die Decke kann den vorderen Halbraum nur in einem millimeterschmalen Streifen
# schneiden. Integration in Querrichtung analytisch, in Längsrichtung adaptiv.
roof_exact <- function(w,d) vapply(seq_along(angles),function(t){
  h <- H-eye_z[t];lo <- max(-d/2-eye_offset[t],-h*si[t]/co[t]);hi <- d/2-eye_offset[t]
  if(hi<=lo)return(c(0,0,0))
  field <- function(x,mask){
    b <- x*x+h*h;up <- h*co[t]-x*si[t]
    y0 <- accepted_y_min(x*co[t]+h*si[t],up,w/2,mask)
    primitive <- function(y)y/(b*(b+y*y))+atan(y/sqrt(b))/(b*sqrt(b))
    .12*h*(x*co[t]+h*si[t])*(primitive(w/2)-primitive(y0))
  }
  vapply(0:2,function(k)integrate(field,lo,hi,mask=k,rel.tol=1e-8,abs.tol=1e-14,subdivisions=400)$value,numeric(1))
},numeric(3))

# Ein Datensatz enthält drei 16-Bit-Indexwerte und zwei Prozentwerte.
# Index 65535 bezeichnet einen positiven Wert unter 0,5 Indexpunkten.
# Bei offenem Signal null ist der Quotient undefiniert (Byte 255).
encode_values <- function(values) {
  values <- matrix(values,nrow=3)
  stopifnot(all(is.finite(values)), all(values[1,]>=values[2,]-1e-12),
            all(values[2,]>=values[3,]-1e-12), all(values>=0))
  idx <- round(100*values/ref_open)
  stopifnot(max(idx)<65535L)
  idx[idx==0 & values>0] <- 65535L
  positive <- values[1,]>0
  pct <- matrix(255L,2,ncol(values))
  if (any(positive)) pct[,positive] <- round(100*sweep(values[2:3,positive,drop=FALSE],
                                                        2,values[1,positive],"/"))
  as.raw(rbind(idx[1,]%%256L,idx[1,]%/%256L,idx[2,]%%256L,idx[2,]%/%256L,
               idx[3,]%%256L,idx[3,]%/%256L,pct))
}
classify <- function(dx,dz,t) {
  front <- dx*co[t]+dz*si[t]
  up <- dz*co[t]-dx*si[t]
  r <- sqrt(dx^2+dz^2)
  ifelse(front <= 1e-12, 0L, ifelse(up>r*sin(upper)+1e-12,2L,
                                      ifelse(up<r*sin(lower)-1e-12,3L,1L)))
}
axis_hit <- function(seat,d,t) {
  # Erster Treffer im Mittelschnitt. Die Leuchtenposition ist separat verstellbar.
  ex <- seat+eye_offset[t]; ez <- eye_z[t]
  forward <- c((d-ex)/co[t],Inf,Inf,Inf)
  if(si[t]>0) forward[2] <- (H-ez)/si[t]
  if(si[t]<0) {
    forward[3] <- -ez/si[t]
    td <- (desk_h-ez)/si[t]
    at_desk <- eye_offset[t]+td*co[t]
    if(at_desk>=desk_near && at_desk<=desk_far) forward[4] <- td
  }
  hit <- which.min(forward)
  height <- ez+forward[hit]*si[t]
  surface <- hit-1L
  if(hit==1L && height>=wall_bottom && height<=wall_top) surface <- 4L
  panel_x_hit <- -1; first <- -1L; last <- -1L
  if(si[t]>0) {
    distance <- (lamp_h-ez)/si[t]
    if(distance < forward[hit]) {
      panel_x_hit <- ex+distance*co[t]
      possible <- which(abs(lamp_positions(d)-panel_x_hit)<=panel_x/2)
      if(length(possible)) {first <- min(possible)-1L; last <- max(possible)-1L}
    }
  }
  c(ex+forward[hit]*co[t], height, surface, panel_x_hit, first, last)
}
pack_planes <- function(bytes, fields) {
  # Byte-Ebenen separat anordnen, dann verlustfrei im Zlib-Format komprimieren.
  base64encode(memCompress(as.raw(t(matrix(bytes,nrow=fields))),"gzip"))
}
# Diffuser Lichtaustausch zwischen rechteckigen Flächenstücken (Radiosity).
# Vier getrennte Materialgruppen: Decke, Wände, Boden und beide Tischseiten.
rho_levels <- list(ceiling=c(0,.50,.80),wall=c(0,.40,.50,.70),floor=c(0,.20,.50),desk=c(0,.35,.50,.65))
default_rho <- c(ceiling=.80,wall=.50,floor=.20,desk=.50)
glass_rho <- .08
glass_patch <- 17L
patch_count <- 39L
roof_wall_power <- .30
materials <- as.matrix(expand.grid(rho_levels))
radical_inverse <- function(n,base) {
  i <- seq_len(n); u <- numeric(n); digit <- 1/base
  while(any(i>0)){u <- u+(i%%base)*digit;i <- i%/%base;digit <- digit/base}
  u
}
samples <- function(n) {
  uv <- lapply(c(2,3,5,7),function(b)radical_inverse(n,b))
  rr <- sqrt(uv[[3]]); phi <- 2*pi*uv[[4]]
  list(u=uv[[1]],v=uv[[2]],a=rr*cos(phi),b=rr*sin(phi),normal=sqrt(1-rr^2))
}
patches <- function(w,d,seat) {
  atlas <- list()
  add <- function(face,nx,ny,u0,u1,v0,v1,group) {
    du <- (u1-u0)/nx;dv <- (v1-v0)/ny
    ij <- expand.grid(i=0:(nx-1),j=0:(ny-1))
    atlas[[length(atlas)+1L]] <<- data.frame(face,nx,ny,u=u0+ij$i*du,v=v0+ij$j*dv,du,dv,area=du*dv,group)
  }
  add(1,3,2,0,d,-w/2,w/2,1);add(2,3,2,0,d,-w/2,w/2,3)
  ys<-c(-w/2,-wall_y/2,wall_y/2,w/2);zs<-c(0,wall_bottom,wall_top,H)
  for(j in 1:3)for(i in 1:3)add(3,1,1,ys[i],ys[i+1],zs[j],zs[j+1],2)
  add(4,2,2,-w/2,w/2,0,H,2)
  add(5,3,2,0,d,0,H,2);add(6,3,2,0,d,0,H,2)
  for(k in 7:8)add(k,1,1,seat+desk_near,seat+desk_far,-desk_width/2,desk_width/2,4)
  do.call(rbind,atlas)
}
raytrace <- function(x,y,z,vx,vy,vz,w,d,seat,fine=FALSE) {
  tx <- ifelse(vx>0,(d-x)/vx,-x/vx);ty <- ifelse(vy>0,(w/2-y)/vy,(-w/2-y)/vy)
  tz <- ifelse(vz>0,(H-z)/vz,-z/vz)
  tx[vx==0] <- Inf;ty[vy==0] <- Inf;tz[vz==0] <- Inf
  dist <- pmin(tx,ty,tz);hx <- x+dist*vx;hy <- y+dist*vy;hz <- z+dist*vz
  idx <- function(a,n) pmin(n-1L,pmax(0L,floor(n*a)))
  horizontal <- 1L+idx(hx/d,3L)+3L*idx(hy/w+.5,2L)
  frontwall <- 13L+(hy>= -wall_y/2)+(hy>wall_y/2)+3L*((hz>=wall_bottom)+(hz>wall_top))
  rearwall <- 22L+idx(hy/w+.5,2L)+2L*idx(hz/H,2L)
  sidewall <- 26L+idx(hx/d,3L)+3L*idx(hz/H,2L)
  face <- ifelse(dist==tz,horizontal+ifelse(vz>0,0L,6L),
                 ifelse(dist==tx,ifelse(vx>0,frontwall,rearwall),sidewall+ifelse(vy>0,0L,6L)))
  td <- (desk_h-z)/vz;dx <- x+td*vx-seat;dy <- y+td*vy
  table <- is.finite(td)&td>1e-7&td<dist&dx>=desk_near&dx<=desk_far&abs(dy)<=desk_width/2
  face[table] <- ifelse(vz[table]<0,38L,39L)
  if(fine){
    type <- findInterval(face-1L,c(0L,6L,12L,21L,25L,31L,37L,38L))
    return(list(face=type,patch=as.integer(face),x=ifelse(table,x+td*vx,hx),y=ifelse(table,y+td*vy,hy),z=ifelse(table,desk_h,hz)))
  }
  as.integer(face)
}
# Eine unbeschichtete Glasscheibe bildet die mittlere Fläche der Stirnwand.
# Der gerichtete Anteil wird in Spiegelrichtung weiterverfolgt.
trace_glass <- function(x,y,z,vx,vy,vz,w,d,seat) {
  hit <- raytrace(x,y,z,vx,vy,vz,w,d,seat,TRUE)
  ids <- which(hit$patch==glass_patch)
  secondary <- integer(length(hit$patch))
  if(length(ids)) {
    vel <- function(v)rep_len(v,length(secondary))[ids]
    secondary[ids] <- raytrace(d-1e-9,hit$y[ids],hit$z[ids],
                               -vel(vx),vel(vy),vel(vz),w,d,seat)
    stopifnot(all(secondary[ids]!=glass_patch))
  }
  list(first=hit$patch,second=secondary)
}
counts <- function(h,n) cbind(direct=tabulate(h$first,n),mirror=tabulate(h$second,n))
patch_hits <- function(p,q,w,d,seat,n) {
  u <- p$u+p$du*q$u;v <- p$v+p$dv*q$v;k <- p$face
  if(k %in% c(1,2,7,8)){
    z <- if(k==1)H else if(k==2)0 else desk_h
    h <- trace_glass(u,v,z,q$a,q$b,if(k %in% c(1,8))-q$normal else q$normal,w,d,seat)
  }else if(k==3||k==4){
    h <- trace_glass(if(k==3)d else 0,u,v,if(k==3)-q$normal else q$normal,q$a,q$b,w,d,seat)
  }else{
    h <- trace_glass(u,if(k==5)w/2 else -w/2,v,q$a,if(k==5)-q$normal else q$normal,q$b,w,d,seat)
  }
  counts(h,n)/length(q$u)
}
balance_exchange <- function(raw,area,target) {
  ex <- (raw*area+t(raw*area))/2
  active <- which(target>1e-15)
  part <- ex[active,active,drop=FALSE]
  # Kleine Diagonalstütze für ausschließlich über Glas verbundene Flächen.
  diag(part) <- diag(part)+target[active]*1e-9
  for(i in 1:100){
    ratio <- sqrt(target[active]/rowSums(part))
    part <- part*outer(ratio,ratio)
  }
  ex[] <- 0;ex[active,active] <- part
  ex/area
}
lighting_transfer <- function(w,d,seat,q,qe) {
  patch <- patches(w,d,seat); n <- nrow(patch)
  rays <- vapply(seq_len(n),function(i)patch_hits(patch[i,],q,w,d,seat,n),matrix(0,n,2))
  straight <- balance_exchange(t(rays[,1,]),patch$area,patch$area)
  via <- balance_exchange(t(rays[,2,]),patch$area,patch$area*straight[,glass_patch])
  straight[,glass_patch] <- 0
  F <- straight+glass_rho*via
  stopifnot(max(rowSums(F))<1.001,max(abs(F*patch$area-t(F*patch$area))[-glass_patch,-glass_patch])<1e-5)
  emit <- function(x,y,z,vx,vy,vz) {
    h <- trace_glass(x,y,z,vx,vy,vz,w,d,seat)
    values <- counts(h,n)/(length(qe$u)*patch$area)
    values[glass_patch,1] <- 0
    cbind(straight=values[,1],all=values[,1]+glass_rho*values[,2])
  }
  panel <- lapply(lamp_positions(d),function(x)emit(x+panel_x*(qe$u-.5),panel_y*(qe$v-.5),lamp_h,qe$a,qe$b,-qe$normal))
  window <- emit(d,wall_y*(qe$u-.5),wall_bottom+(wall_top-wall_bottom)*qe$v,-qe$normal,qe$a,qe$b)
  roof <- .12*cbind(rowSums(straight[,patch$group==1,drop=FALSE]),rowSums(F[,patch$group==1,drop=FALSE]))
  src <- c(panel,list(window,roof))
  list(F=F,straight=vapply(src,function(v)v[,1],numeric(n)),source=vapply(src,function(v)v[,2],numeric(n)),patch=patch)
}
eye_transfer <- function(w,d,seat,q) {
  mats <- lapply(seq_along(angles),function(t){
    vx <- q$normal*co[t]-q$b*si[t];vz <- q$normal*si[t]+q$b*co[t]
    h <- trace_glass(seat+eye_offset[t],0,eye_z[t],vx,q$a,vz,w,d,seat)
    top <- q$b<=sin(upper);both <- in_field(q$normal,q$a,q$b)
    atEye <- function(id){
      ans <- pi*rbind(tabulate(id,patch_count),tabulate(id[top],patch_count),tabulate(id[both],patch_count))/length(id)
      ans[,glass_patch] <- 0
      ans
    }
    straight <- atEye(h$first)
    list(straight=straight,all=straight+glass_rho*atEye(h$second))
  })
  lapply(c(straight="straight",all="all"),function(key)do.call(rbind,lapply(mats,`[[`,key)))
}
# Spiegelbild der Quelle hinter der endlichen Scheibe. An beiden Enden des
# Wegs liegt die Quelle oberhalb der Tischplatte. Die Glaskanten begrenzen
# das Integral quer und längs. Erfassung am Auge wie bei Direktlicht.
mirror_to_eye <- function(w,d,seat) {
  lamps_x<-lamp_positions(d)
  sources<-data.frame(lo=c(2*d-lamps_x-panel_x/2,d),hi=c(2*d-lamps_x+panel_x/2,2*d),
    half=c(rep(panel_y/2,nl),w/2),z=c(rep(lamp_h,nl),H),L=c(rep(1/(panel_x*panel_y),nl),.12))
  out<-matrix(0,3*nt,nl+2)
  for(t in seq_along(angles)){
    ex<-seat+eye_offset[t];ez<-eye_z[t];dz<-sources$z-ez
    lo<-pmax(sources$lo-ex,(d-ex)*dz/(wall_top-ez),-dz*si[t]/co[t]);hi<-sources$hi-ex
    active<-which(hi>lo);if(!length(active))next
    # Acht Teilintervalle mit je 24 Gauss-Legendre-Knoten.
    breaks<-seq(0,1,length.out=9L)
    nodes<-as.vector(outer((rule$values+1)/16,head(breaks,-1),'+'))
    weights<-rep(2*rule$vectors[1,]^2/16,8L)
    x<-sweep(outer(nodes,hi[active]-lo[active]),2,lo[active],'+')
    a<-rep(dz[active],each=length(nodes));xx<-as.vector(x)
    limit<-pmin(rep(sources$half[active],each=length(nodes)),wall_y/2*xx/(d-ex))
    front<-xx*co[t]+a*si[t];up<-a*co[t]-xx*si[t];b<-xx^2+a^2
    primitive<-function(y)y/(b*(b+y^2))+atan(y/sqrt(b))/(b*sqrt(b))
    for(k in 0:2){
      y0<-accepted_y_min(front,up,limit,k)
      density<-a*front*(primitive(limit)-primitive(y0))
      integral<-colSums(matrix(density,length(nodes))*weights)*(hi[active]-lo[active])
      cols<-ifelse(active<=nl,active,nl+2L)
      out[3*(t-1L)+k+1L,cols]<-glass_rho*sources$L[active]*integral
    }
  }
  out
}

# Die Auswahl der Lichtstromverteilung erzeugt arithmetische Folgen. R speichert
# die Endpunkte der relativen Intensitäten mit 0,01 Indexpunkten Auflösung.
# Die Prozentwerte aller elf Stufen werden von R einzeln aus den ungerundeten
# Modellwerten gebildet. Der Browser liest sie unverändert aus der Tabelle.
pack_int <- function(x) {
  # Differenzen entlang der Speicherfolge und anschließend byteweises Packen.
  v <- as.integer(round(x));stopifnot(all(is.finite(v)),all(v>=0),max(v)<65535L)
  delta <- c(v[1],diff(v))%%65536L
  base64encode(memCompress(as.raw(c(delta%%256,delta%/%256)),'gzip'))
}
pack_pct <- function(x) {
  v <- as.integer(x)
  base64encode(memCompress(as.raw(c(v[1],diff(v))%%256L),'gzip'))
}
# Feinere Abtastung der ersten Reflexion am tatsächlich getroffenen Flächenstück.
# Die grobe Radiosity-Lösung liefert nur die zweite und alle weiteren Reflexionen.
fine_atlas <- function(w,d,seat){
  nx <- max(7L,ceiling(d/.45));ny <- max(7L,ceiling(w/.45));nz <- 8L
  vertices <- function(n,m,u,v,du,dv,face){
    g<-expand.grid(i=seq_len(n)-.5,j=seq_len(m)-.5)
    data.frame(u=u+g$i*du/n,v=v+g$j*dv/m,face=face)
  }
  ls<-list(vertices(nx,ny,0,-w/2,d,w,1),vertices(nx,ny,0,-w/2,d,w,2),
           vertices(ny,nz,-w/2,0,w,H,3),vertices(ny,nz,-w/2,0,w,H,4),
           vertices(nx,nz,0,0,d,H,5),vertices(nx,nz,0,0,d,H,6),
           vertices(5,6,seat+desk_near,-desk_width/2,desk_far-desk_near,desk_width,7),
           vertices(5,6,seat+desk_near,-desk_width/2,desk_far-desk_near,desk_width,8))
  p<-do.call(rbind,ls);f<-p$face
  p$x<-ifelse(f==3,d,ifelse(f==4,0,p$u));p$y<-ifelse(f==5,w/2,ifelse(f==6,-w/2,ifelse(f %in% 3:4,p$u,p$v)))
  p$z<-ifelse(f==1,H,ifelse(f==2,0,ifelse(f>=7,desk_h,p$v)))
  p$nx<-as.integer(f==4)-as.integer(f==3);p$ny<-as.integer(f==6)-as.integer(f==5)
  p$nz<-as.integer(f %in% c(2,7))-as.integer(f %in% c(1,8))
  p$grp<-c(1,3,2,2,2,2,4,4)[f]
  list(p=p,start=c(0,cumsum(lengths(lapply(ls,function(l)l$u))))[1:8],nx=nx,ny=ny,nz=nz)
}
fine_ids <- function(hit,a,w,d,seat){
  k<-hit$face;ix<-function(x,n)pmin(n-1,pmax(0,floor(x*n)))
  u<-ifelse(k %in% 3:4,ix(hit$y/w+.5,a$ny),ix(hit$x/d,a$nx))
  v<-ifelse(k<=2,ix(hit$y/w+.5,a$ny),ix(hit$z/H,a$nz))
  cols<-ifelse(k %in% 3:4,a$ny,a$nx)
  table<-k>=7;u[table]<-ix((hit$x[table]-seat-desk_near)/(desk_far-desk_near),5)
  v[table]<-ix(hit$y[table]/desk_width+.5,6);cols[table]<-5
  as.integer(a$start[k]+1L+u+cols*v)
}
first_reflection <- function(w,d,seat,a,q){
  p<-a$p;n<-nrow(p)
  W<-do.call(rbind,lapply(seq_along(angles),function(t){
    vx<-q$normal*co[t]-q$b*si[t];vz<-q$normal*si[t]+q$b*co[t]
    hit<-raytrace(seat+eye_offset[t],0,eye_z[t],vx,q$a,vz,w,d,seat,TRUE)
    id<-fine_ids(hit,a,w,d,seat);top<-q$b<=sin(upper);both<-in_field(q$normal,q$a,q$b)
    opaque<-!(hit$face==3&abs(hit$y)<=wall_y/2&hit$z>=wall_bottom&hit$z<=wall_top)
    rbind(tabulate(id[opaque],n),tabulate(id[top&opaque],n),tabulate(id[both&opaque],n))/length(id)
  }))
  field <- function(kind,lx=0){
    # Endliche Panel-/Wandfläche. Größere Deckenfläche über Kosinusrichtungen.
    if(kind=='roof'){
      out<-numeric(n)
      for(i in seq_len(n)){
        k<-p$face[i];if(k %in% c(1,8))next
        vx<-if(k %in% 3:4)p$nx[i]*roofq$normal else roofq$a
        vy<-if(k %in% 5:6)p$ny[i]*roofq$normal else if(k %in% 3:4)roofq$a else roofq$b
        vz<-if(k %in% 3:6)roofq$b else roofq$normal
        tt<-(H-p$z[i])/vz;xx<-p$x[i]+tt*vx;yy<-p$y[i]+tt*vy
        td<-(desk_h-p$z[i])/vz
        shadow<-td>1e-8&td<tt&p$x[i]+td*vx>=seat+desk_near&p$x[i]+td*vx<=seat+desk_far&abs(p$y[i]+td*vy)<=desk_width/2
        out[i]<-.12*pi*mean(tt>0&xx>0&xx<d&abs(yy)<w/2&!shadow)
      }
      return(out)
    }
    q0<-if(kind=='wall')emitwall else emitpanel
    val<-numeric(n)
    for(k in seq_len(nrow(q0))){
      if(kind=='wall'){x<-d;y<-q0[k,1]*wall_y;z<-(wall_top+wall_bottom)/2+q0[k,2]*(wall_top-wall_bottom)}
      else{x<-lx+q0[k,1]*panel_x;y<-q0[k,2]*panel_y;z<-lamp_h}
      dx<-x-p$x;dy<-y-p$y;dz<-z-p$z;r2<-dx*dx+dy*dy+dz*dz
      td<-(desk_h-p$z)/ifelse(abs(dz)>1e-12,dz,Inf)
      sh<-td>1e-8&td<1&p$x+td*dx>=seat+desk_near&p$x+td*dx<=seat+desk_far&abs(p$y+td*dy)<=desk_width/2
      val<-val+pmax(p$nx*dx+p$ny*dy+p$nz*dz,0)*pmax(if(kind=='wall')dx else dz,0)/pmax(r2^2,1e-20)*(!sh)
    }
    val<-val/nrow(q0)
    if(kind=='wall'){
      # Die Tischplatte kann die senkrechte Lichtöffnung berühren. Dort ändert
      # sich der Raumwinkel innerhalb einer Zelle der Quelle besonders stark.
      # Flächenintegral über den vom jeweiligen Tischblatt sichtbaren Teil
      # des Rechtecks, exakt in Höhe und Breite. Jede Tischseite ist eben.
      ids<-which(p$face %in% 7:8)
      dx<-d-p$x[ids];ylo<--wall_y/2-p$y[ids];yhi<-wall_y/2-p$y[ids]
      zfar<-ifelse(p$face[ids]==7,wall_top-desk_h,desk_h-wall_bottom)
      edge<-function(z){h<-sqrt(dx^2+z^2);(atan(yhi/h)-atan(ylo/h))/h}
      val[ids]<-dx*(edge(0)-edge(zfar))/(2*wall_y*(wall_top-wall_bottom))
    }
    val
  }
  g<-cbind(vapply(lamp_positions(d),function(l)field('panel',l),numeric(n)),field('wall'),field('roof'))
  lapply(1:4,function(i){keep<-p$grp==i;W[,keep,drop=FALSE]%*%g[keep,,drop=FALSE]})
}


reflection_room <- function(s,w,d,panel,wall,roof,q,qe,eyeq) {
  scale <- 100/ref_open
  ends <- array(0,c(3,nl+1,nt,nrow(materials),ne)); directEnds <- array(0,c(3,nl+1,nt,ne))
  ratios <- array(0L,c(2,nm,nl,nt,nrow(materials),ne))
  roofData <- roofWall <- array(0,c(8,nt,nrow(materials)))
  bare <- list();anchor <- NULL
  roof_row <- function(direct,indirect){
    sum<-direct+indirect
    pct<-round(100*sweep(sum[-1,,drop=FALSE],2,pmax(sum[1,],1e-250),'/'))
    pct[,sum[1,]<=0]<-255
    rbind(indirect*scale,sum*scale,pct)
  }
  for(e in seq_len(ne)){
    seat <- seat_positions(d)[e]
    tr <- lighting_transfer(w,d,seat,q,qe)
    fine <- first_reflection(w,d,seat,fine_atlas(w,d,seat),eyeq)
    eye <- eye_transfer(w,d,seat,eyeq)
    mirror <- mirror_to_eye(w,d,seat)
    direct <- array(0,c(3,nt,nl+1))
    direct[,,seq_len(nl)] <- panel[,,,e,drop=FALSE];direct[,,nl+1] <- wall[,,e]
    directEnds[,,,e] <- aperm(direct,c(1,3,2))*scale
    if(e==desk_mid){
      roofExtra <- roof_wall_power*wall[,,e]
      bare <- lapply(list(roof,roof+roofExtra),function(x)t(roof_row(x,x*0)))
    }
    for(j in seq_len(nrow(materials))){
      rho <- materials[j,tr$patch$group];rho[glass_patch] <- 0
      emit <- rho*tr$source
      B <- solve(diag(length(rho))-rho*tr$F,emit)
      stopifnot(min(B)>-1e-10,max(abs(B-rho*(tr$source+tr$F%*%B)))<1e-8)
      first <- Reduce(`+`,Map(`*`,fine,materials[j,]))
      # S → Glas → Auge; alle Wege mit matten Flächen aus der Radiosity-
      # Lösung. Den rein diffusen ersten Reflex ersetzt die feinere Rechnung.
      received <- mirror+first+eye$all%*%B-eye$straight%*%(rho*tr$straight)
      stopifnot(min(received)>-1e-9)
      received <- array(pmax(0,received),c(3,nt,nl+2))
      indirect <- received[,,seq_len(nl+1),drop=FALSE]
      ends[,,,j,e] <- aperm(indirect,c(1,3,2))*scale
      total <- direct+indirect
      a <- matrix(total[,,seq_len(nl)],3,nt*nl);b <- matrix(total[,,nl+1],3,nt*nl)
      for(k in seq_len(nm)){
        value <- a*(1-wall_share[k])+b*wall_share[k]
        pct <- round(100*sweep(value[-1,,drop=FALSE],2,pmax(value[1,],1e-250),'/'))
        pct[,value[1,]<=0] <- 255
        ratios[,k,,,j,e] <- aperm(array(as.integer(pct),c(2,nt,nl)),c(1,3,2))
      }
      if(s==3L && e==11L && all(materials[j,]==default_rho))
        anchor <- scale*(.7*total[1,flat,20L]+.3*total[1,flat,nl+1L])
      if(e==desk_mid){
        ir<-received[,,nl+2L]
        roofData[,,j] <- roof_row(roof,ir)
        roofWall[,,j] <- roof_row(roof+roofExtra,ir+roof_wall_power*received[,,nl+1L])
      }
    }
  }
  bySeat <- lapply(seq_len(ne),function(e)list(delta=pack_int(ends[,,,,e]*100),
                      pct=pack_pct(ratios[,,,,,e]),direct=pack_int(directEnds[,,,e]*100)))
  rows <- function(x)lapply(seq_len(nrow(materials)),function(j)t(x[,,j]))
  list(seats=bySeat,roof=rows(roofData),roofWall=rows(roofWall),roofBare=bare,reference=anchor)
}

nr <- length(widths); ne <- length(eyes); nl <- length(lamps); nm <- length(wall_share)
nt <- length(angles)
records <- replicate(nt,raw(8L*nr*ne*nl*nm),simplify=FALSE)
rays <- replicate(nt,raw(7L*nr*ne*nl),simplify=FALSE)
rooms <- vector("list",nr)
grid <- expand.grid(m=seq_len(nm),p=lamps,e=eyes)
geo <- expand.grid(p=lamps,e=eyes)
emitpanel<-as.matrix(expand.grid(u=midpoints(-.5,.5,4),v=midpoints(-.5,.5,4)))
emitwall<-as.matrix(expand.grid(u=midpoints(-.5,.5,8),v=midpoints(-.5,.5,8)))
roofq<-samples(512)
q <- samples(3072);qe <- samples(8192);eyeq <- samples(8192)
for (s in seq_len(nr)) {
  w <- widths[s]; d <- depths[s]
  eye_x<-seat_positions(d);lamp_x<-lamp_positions(d)
  dd<-round(outer(lamp_x,eye_x,`-`),12);unique_delta<-unique(as.vector(dd))
  tab<-vapply(unique_delta,panel_field,matrix(0,3,nt))
  panel<-array(tab[,,match(as.vector(dd),unique_delta),drop=FALSE],c(3,nt,nl,ne))
  wall<-vapply(d-eye_x,wall_field,matrix(0,3,nt))
  roof <- roof_exact(w,d)
  refl <- reflection_room(s,w,d,panel,wall,roof,q,qe,eyeq)
  cat("Raum",s,"von",nr,"fertig\n");flush.console()
  views <- vector("list",nt)
  for (t in seq_len(nt)) {
    direct <- matrix(panel[,t,,],3,nl*ne)[,(match(grid$e,eyes)-1)*nl+match(grid$p,lamps)]
    across <- wall[,t,match(grid$e,eyes)]
    mix <- wall_share[grid$m]
    values <- sweep(direct,2,1-mix,"*") + sweep(across,2,mix,"*")
    encoded <- encode_values(values)
    records[[t]][(s-1L)*length(encoded)+seq_along(encoded)] <- encoded
    delta <- lamp_x[match(geo$p,lamps)]-eye_x[match(geo$e,eyes)]-eye_offset[t]
    wall_dx <- d-eye_x[match(geo$e,eyes)]-eye_offset[t]; ez <- eye_z[t]
    sign_forward <- delta*co[t]+(lamp_h-ez)*si[t]
    centre <- ifelse(sign_forward < -1e-12,255L,90L+round(atan2(lamp_h-ez,delta)/rad-angles[t]))
    pc <- vapply(panel_offsets,function(x) classify(delta+x,lamp_h-ez,t),numeric(nrow(geo)))
    wc <- vapply(wall_samples,function(z) classify(wall_dx,z-ez,t),numeric(nrow(geo)))
    g <- as.raw(rbind(centre,t(pc),t(wc),rep(classify(desk_sample-eye_offset[t],desk_h-ez,t),nrow(geo))))
    rays[[t]][(s-1L)*length(g)+seq_along(g)] <- g
    views[[t]] <- list(roofValues=as.integer(encode_values(roof[,t])),roofDirect=unname(100*roof[,t]/ref_open),
                       roofClass=classify(d/2*roof_samples-eye_offset[t],H-ez,t),
                       roofAngle=round(atan2(H-ez,d/2-eye_offset[t])/rad-angles[t]),
                       axis=t(vapply(eye_x,axis_hit,numeric(6),d=d,t=t)))
  }
  rooms[[s]] <- list(width=w,depth=d,seatX=eye_x,lampX=lamp_positions(d),views=views,reflection=refl)
}
pitches <- lapply(seq_len(nt),function(t) {
  list(deg=angles[t],cos=co[t],sin=si[t],skullX=poses[1,t],skullZ=poses[2,t],
       eyeOffset=eye_offset[t],eyeZ=eye_z[t],records=pack_planes(records[[t]],8L),
       rays=pack_planes(rays[[t]],7L))
})
# Auflösungskontrolle gegen feinere Flächengitter und analytische Randfälle.
subset_t <- match(c(-45,0,30),angles)
errors <- vapply(seq(-.60,3,.18),function(dx) max(abs(
  panel_field(dx,pitches=subset_t)-panel_field(dx,336L,subset_t)))/ref_open,numeric(1))
stopifnot(max(errors)<0.003, round(200*.10/tan(upper),1)==16.8,
          rooms[[1]]$views[[flat]]$roofAngle==47, rooms[[nr]]$views[[flat]]$roofAngle==15,
          all(ceiling_field(4,3,pitches=1)==0), panel_field(-.8,pitches=nt)[1]>0,
          identical(desk_blocks(c(1.08,2.88),0,.30-eye_h),c(TRUE,FALSE)),
          wall_bottom == desk_h, all(eye_z > wall_bottom),
          !any(desk_blocks(c(1.08,2.88),0,wall_bottom-eye_h)),
          axis_hit(1.62,4.5,flat)[3]==4L, axis_hit(1.62,4.5,1)[3]==3L,
          axis_hit(.9,4.5,nt)[6]>=0L)
for(s in c(1,7,nr)){
  coarse <- ceiling_field(widths[s],depths[s],pitches=subset_t)
  fine <- ceiling_field(widths[s],depths[s],step=.009,pitches=subset_t)
  stopifnot(max(abs(coarse-fine))/ref_open < .003)
}
config <- list(glassReflectance=glass_rho,roofWallPower=roof_wall_power,defaultLux=250,
               referenceLevel=rooms[[3]]$reflection$reference,defaultMaterial=as.integer(default_rho*100),eyeH=eye_h,skullX=unname(skull_neutral[1]),skullZ=unname(skull_neutral[2]),
               roomH=H,lampH=lamp_h,panelX=panel_x,panelY=panel_y,
               wallY=wall_y,wallLo=wall_bottom,wallHi=wall_top,deskH=desk_h,deskNear=desk_near,
               deskFar=desk_far,chairBack=chair_back,deskWidth=desk_width,deskSample=desk_sample,midEye=desk_mid-1L,
               discHeight=.10,upperRadius=.10/tan(upper),lowerRadius=.10/tan(-lower),
               upperAngle=50,lowerAngle=-70,panelOffsets=panel_offsets,wallSamples=wall_samples,
               roofSamples=roof_samples,probeClass=ifelse((-90:90)>50,2L,ifelse((-90:90)< -70,3L,1L)))
result <- list(materials=lapply(rho_levels,function(x)as.integer(100*x)),config=config,room=rooms,wallShare=100*wall_share,pitches=pitches)
# Verlustfreie Übertragung der von R ermittelten Prozenttabellen: Der Prädiktor
# benutzt die bereits quantisierten Intensitäten. Nur seine Abweichung vom
# ungerundeten R-Ergebnis wird gespeichert, auch der Code 255 für 0/0.
unpack16 <- function(txt){
  b<-as.integer(memDecompress(base64decode(txt),'gzip'));n<-length(b)/2
  as.integer(cumsum(b[seq_len(n)]+256*b[n+seq_len(n)])%%65536)
}
pack_transport <- function(v){
  dims<-c(3L,nl+1L,nt,lengths(rho_levels))
  for(k in c(1L,2L,3L,4L,5L)){
    step<-if(k==1L)1L else prod(dims[seq_len(k-1L)])
    ids<-which(rep(rep(0:(dims[k]-1L),each=step)>0,length.out=length(v)))
    v[ids]<-v[ids]-v[ids-step]
  }
  v<-(v+32768)%%65536-32768
  code<-ifelse(v<0,-2*v-1,2*v)
  base64encode(memCompress(as.raw(c(code%%256,code%/%256)),'gzip'))
}
compact_seat <- function(seat){
  v<-unpack16(seat$delta);direct<-unpack16(seat$direct)
  pct<-cumsum(as.numeric(memDecompress(base64decode(seat$pct),'gzip')))%%256
  total<-array(v+rep(direct,nrow(materials)),c(3,nl+1L,nt,nrow(materials)))
  panel<-matrix(total[,1:29,,,drop=FALSE],3);wall<-matrix(total[,rep(30,29),,,drop=FALSE],3)
  res<-array(0L,c(2,nm,nl,nt,nrow(materials)))
  for(k in 0:10){
    a<-panel*(10-k)+wall*k
    pred<-floor(100*sweep(a[-1,,drop=FALSE],2,pmax(a[1,],1),'/')+.5);pred[,a[1,]==0]<-255
    res[,k+1,,,]<-array(pred,c(2,nl,nt,nrow(materials)))
  }
  err<-as.raw((pct-as.integer(res))%%256)
  list(delta=pack_transport(v),pct=base64encode(memCompress(err,'gzip')),direct=seat$direct)
}
roof_geometry <- function(room,frame){
  d<-room$depth;w<-room$width;e<-d/2+frame$eyeOffset;dz<-2.8-frame$eyeZ
  first<-max(0,min(d,e-dz*frame$sin/frame$cos));strip<-d-first
  edge<-atan2(dz,d-e)*180/pi-frame$deg
  extra<-list()
  if(strip>0){
    x<-first+strip*.995
    for(y in w*c(.28,.39,.46,.485,.498,.4999)){
      up<-(dz*frame$cos-(x-e)*frame$sin)/sqrt((x-e)^2+y^2+dz^2)
      if(up<=sin(50*pi/180)){extra<-c(x,y,2.8,1);break}
    }
    central<-c(x,0,2.8,if(atan2(dz,x-e)*180/pi-frame$deg>50)2 else 1)
    extra<-if(length(extra))rbind(central,extra)else matrix(central,nrow=1)
  }
  list(edge=edge,strip=strip,rays=extra)
}
compact_model <- function(model){
  for(s in seq_along(model$room)){
    room<-model$room[[s]]
    room$reflection$seats<-lapply(room$reflection$seats,compact_seat)
    for(i in seq_along(model$pitches))room$views[[i]]$roofGeometry<-roof_geometry(room,model$pitches[[i]])
    model$room[[s]]<-room
  }
  model
}


# Anschauliche Lichtwege. Dieselben Richtungsfilter wie für die Messwerte.
# u und v verteilen die Startpunkte über die ganze Quelle. Ein Schwung von
# Punkten nahe den Ecken erreicht auch schmale sichtbare Deckenstreifen.
make_path_samples <- function(){
  n<-64L
  p<-data.frame(u=radical_inverse(n,2),v=radical_inverse(n,3),
    face=rep(c(0,1,3,7,4,2,0,5,1,7,6,3,0,7,2),length.out=n),
    bu=radical_inverse(n,5),bv=radical_inverse(n,7))
  p$u[57:64]<-rep(c(.0001,.9999),4)
  p$v[57:64]<-rep(c(.001,.17,.825,.999),each=2)
  p
}
path_faces <- function(w,d,seat,source,recipe,section){
  # Quellen 1 bis 29 = Deckenpanel, 30 = Fenster/Wandpanel, 31 = Leuchtdecke.
  panel<-source<=nl;wall<-source==nl+1;roof<-source==nl+2
  q<-recipe;f<-q$face;table<-f==0;horizontal<-f<=2
  sx<-ifelse(panel,lamp_positions(d)[pmin(source,nl)]+panel_x*(q$u-.5),ifelse(wall,d,d*q$u))
  sy<-(q$v-.5)*ifelse(panel,panel_y,ifelse(wall,wall_y,w))
  sz<-ifelse(panel,lamp_h,ifelse(wall,wall_bottom+q$u*(wall_top-wall_bottom),H))
  x<-ifelse(table,seat+desk_near+q$bu*(desk_far-desk_near),ifelse(f==3,d,ifelse(f==6,0,d*q$bu)))
  y<-ifelse(table,(q$bv-.5)*desk_width,ifelse(horizontal,(q$bv-.5)*w,
     ifelse(f==4,w/2,ifelse(f==5,-w/2,(q$bu-.5)*w))))
  z<-ifelse(table,desk_h,ifelse(f==1,0,ifelse(f==2,H,.055+q$bv*(H-.11))))
  if(section){sy[]<-0;y[]<-0}
  nx<-as.integer(f==6)-as.integer(f==3);ny<-as.integer(f==5)-as.integer(f==4)
  nz<-as.integer(f<=1)-as.integer(f==2)
  through_desk<-function(x1,y1,z1,x2,y2,z2){
    dz<-z2-z1;t<-(desk_h-z1)/ifelse(dz==0,Inf,dz)
    xx<-x1+t*(x2-x1)
    t>1e-7 & t<1-1e-7 & xx>=seat+desk_near & xx<=seat+desk_far & abs(y1+t*(y2-y1))<=desk_width/2
  }
  # Die Lichtöffnung kann bei eingeschaltetem Panel auch kein Licht zurückwerfen.
  opaque<-f!=3 | abs(y)>wall_y/2 | z<wall_bottom | z>wall_top
  possible<-opaque & !(section & (f==4 | f==5)) &
    (nx*(sx-x)+ny*(sy-y)+nz*(sz-z)>1e-8) & ifelse(wall,sx-x>1e-8,sz-z>1e-8) &
    !through_desk(sx,sy,sz,x,y,z)
  vapply(seq_along(angles),function(t){
    ex<-seat+eye_offset[t];ez<-eye_z[t]
    glass<-f==7L
    fraction<-(d-ex)/(2*d-sx-ex)
    x[glass]<-d;y[glass]<-(sy*fraction)[glass];z[glass]<-(ez+(sz-ez)*fraction)[glass]
    canBounce<-possible
    canBounce[glass]<-(!wall & abs(y)<=wall_y/2 & z>=wall_bottom & z<=wall_top)[glass]
    code<-function(ax,ay,az){
      dx<-ax-ex;dz<-az-ez;front<-dx*co[t]+dz*si[t];up<-dz*co[t]-dx*si[t]
      top<-up<=sin(upper)*sqrt(dx^2+ay^2+dz^2)+1e-12
      ifelse(front<=1e-10,0L,ifelse(!top,2L,ifelse(!in_field(front,ay,up),3L,1L)))
    }
    direct<-code(sx,sy,sz)
    direct[through_desk(sx,sy,sz,ex,0,ez) | ifelse(wall,sx<=ex,sz<=ez)]<-0L
    reflected<-code(x,y,z)
    reflected[!canBounce | (!glass & nx*(ex-x)-ny*y+nz*(ez-z)<=1e-8) | through_desk(x,y,z,ex,0,ez)]<-0L
    as.raw(direct+4L*reflected)
  },raw(length(source)))
}
illustration_data <- function(){
  recipe<-make_path_samples();n<-nrow(recipe)
  ix<-expand.grid(k=1:n,src=seq_len(nl+2L),seat=seq_len(ne))
  rooms<-lapply(seq_along(widths),function(i){
    w<-widths[i];d<-depths[i];seat<-seat_positions(d)[ix$seat]
    lapply(c(FALSE,TRUE),function(section){
      b<-path_faces(w,d,seat,ix$src,recipe[ix$k,],section)
      lapply(seq_along(angles),function(t)base64encode(memCompress(b[,t],"gzip")))
    })
  })
  list(recipe=unname(as.matrix(recipe)),rooms=rooms)
}

result <- compact_model(result)
result$illustration<-illustration_data()
writeLines(toJSON(result,auto_unbox=TRUE,digits=9),if(length(args))args[1] else "modelldaten.json")
cat(R.version.string,"| jsonlite",as.character(packageVersion("jsonlite")),
    "| base64enc",as.character(packageVersion("base64enc")),"\n")
cat("Lichtkonfigurationen:",nt*nr*ne*nl*nm,"| Neigungen:",nt,
    "| Abweichung Panelquadratur/Referenz:",max(errors),"\n")
