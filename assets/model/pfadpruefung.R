# Unabhängiger rückwärts gerichteter Monte-Carlo-Pathtracer. Keine Sichtfaktoren
# oder Radiosity-Flächeneinteilung aus dem Demonstrator werden übernommen.
library(jsonlite)
library(base64enc)
args<-commandArgs(trailingOnly=TRUE)
cfg <- fromJSON(if(length(args))args[1] else 'modelldaten.json',simplifyVector=FALSE)
# Wandpanel und Tageslichtfenster belegen dieselbe Öffnung über der Tischplatte.
sill <- cfg$config$wallLo
stopifnot(sill == .72, cfg$config$deskH == sill, cfg$config$wallHi == 2.55, cfg$config$wallY == 2.60)
lux_scale <- cfg$config$defaultLux/cfg$config$referenceLevel
opening_area <- 2.60*(2.55-sill)
stopifnot(cfg$config$defaultLux==250,abs(cfg$config$glassReflectance-.08)<1e-12)
# Prüfung der Anschläge und Beispielstrahlen unabhängig von der Modellfunktion.
local({
  C <- cfg$config
  for (room in cfg$room) {
    seat <- unlist(room$seatX)
    panel <- unlist(room$lampX)
    stopifnot(all(diff(seat)>0), all(diff(panel)>0),
      max(abs(c(seat[1]-.466, tail(seat,1)+.86-room$depth,
                panel[1]-.60, tail(panel,1)+.60-room$depth))) < 1e-8)
  }
  # Die Scheibe wird explizit von jedem Strahl mit ihrer Ebene geschnitten.
  # Für die volle Blende wird der Winkelabstand in das Winkelbild eingetragen.
  ray_code <- function(x,y,z,pitch) {
    a <- pitch*pi/180
    forward <- x*cos(a)+z*sin(a)
    up <- z*cos(a)-x*sin(a)
    dist <- sqrt(x^2+y^2+z^2)
    y_chart <- acos(pmin(1,pmax(-1,forward/dist)))*180/pi*sin(atan2(up,y))
    disc_r <- sqrt(forward^2+y^2)*C$discHeight/pmax(up,1e-20)
    ifelse(forward<=1e-10,0L,ifelse(up>0 & disc_r < C$upperRadius-1e-9,
                                      2L,ifelse(y_chart < -70-1e-9 | y_chart > 50+1e-9,3L,1L)))
  }
  through_table <- function(A,B,seat) {
    t <- (.72-A[,3])/(B[,3]-A[,3])
    cut <- A+(B-A)*t
    is.finite(t) & t>1e-7 & t<1-1e-7 &
      cut[,1]>=seat+.11 & cut[,1]<=seat+.86 & abs(cut[,2])<=.60
  }
  samples <- do.call(rbind,lapply(cfg$illustration$recipe,unlist))
  u <- samples[,1]; v <- samples[,2]; face <- samples[,3]+1L
  bu <- samples[,4]; bv <- samples[,5]; n <- nrow(samples)
  normals <- rbind(c(0,0,1),c(0,0,1),c(0,0,-1),c(-1,0,0),c(0,-1,0),c(0,1,0),c(1,0,0),c(-1,0,0))[face,]
  cases <- 0L
  for(s in c(1L,7L,13L)) for(e in c(1L,13L,25L)) for(t in c(1L,10L,16L)) {
    room <- cfg$room[[s]]; w <- room$width; d <- room$depth; seat <- room$seatX[[e]]
    pose <- cfg$pitches[[t]]
    eye <- matrix(c(seat+pose$eyeOffset,0,pose$eyeZ),nrow=n,ncol=3,byrow=TRUE)
    for(section in 0:1){
      raw <- as.integer(memDecompress(base64decode(cfg$illustration$rooms[[s]][[section+1L]][[t]]),'gzip'))
      B <- cbind(ifelse(face==1,seat+.11+.75*bu,ifelse(face==4,d,ifelse(face==7,0,d*bu))),
                 ifelse(face==1,1.2*(bv-.5),ifelse(face<=3,w*(bv-.5),ifelse(face==5,w/2,ifelse(face==6,-w/2,w*(bu-.5))))),
                 ifelse(face==1,.72,ifelse(face==2,0,ifelse(face==3,2.8,.055+2.69*bv))))
      if(section)B[,2] <- 0
      for(src in c(1L,15L,29L,30L,31L)){
        A <- if(src==31L)cbind(d*u,w*(v-.5),2.8) else if(src==30L)cbind(d,2.6*(v-.5),sill+(2.55-sill)*u) else
          cbind(room$lampX[[src]]+1.2*(u-.5),.9*(v-.5),2.72)
        if(section)A[,2] <- 0
        glassSample <- face==8L
        # Rückwärts vom virtuellen Auge auf die senkrechte Glasebene.
        f <- (d-eye[,1])/(2*d-eye[,1]-A[,1])
        B[glassSample,] <- cbind(d,A[,2]*f,eye[,3]+f*(A[,3]-eye[,3]))[glassSample,]
        evaluate <- function(M) {delta <- M-eye;ray_code(delta[,1],delta[,2],delta[,3],pose$deg)}
        direct <- evaluate(A)
        direct[through_table(A,eye,seat)] <- 0L
        valid <- rowSums((A-B)*normals)>1e-8 & rowSums((eye-B)*normals)>1e-8 &
          (if(src==30L) B[,1]<d-1e-8 else B[,3]<A[,3]-1e-8) &
          (face!=4L | abs(B[,2])>1.3 | B[,3]<sill | B[,3]>2.55) &
          (face!=8L | (src!=30L & abs(B[,2])<=1.3 & B[,3]>=sill & B[,3]<=2.55)) &
          !(section==1L & face %in% 5:6) & !through_table(A,B,seat) & !through_table(B,eye,seat)
        bounced <- ifelse(valid,evaluate(B),0L)
        block <- raw[((e-1L)*31L+src-1L)*n+seq_len(n)]
        stopifnot(all(direct==block%%4L),all(bounced==block%/%4L))
        cases <- cases+n
      }
    }
  }
  cat('Wandanschläge für',length(cfg$room),'Grundrisse und',cases,'direkte bzw. reflektierte Beispielpaare geprüft.\n')
})

idx <- function(room,e,lp,m,a,roof,rho){
 t <- match(a,seq(-45,30,5));z <- cfg$room[[room+1L]];j<-1+sum(rho*cumprod(c(1L,head(lengths(cfg$materials),-1))))
 if(roof>0){
   arr<-if(roof==2)z$reflection$roofWall else z$reflection$roof
   return(unlist(arr[[j]][[t]])[1:3])
 }
 co <- function(s){
    b<-as.numeric(memDecompress(base64decode(s),'gzip'));n<-length(b)/2;code<-b[seq_len(n)]+256*b[n+seq_len(n)]
    v<-ifelse(code%%2==1,-(code+1)/2,code/2);dims<-c(3L,30L,16L,lengths(cfg$materials))
    for(k in 5:1){step<-if(k==1)1 else prod(dims[1:(k-1)]);stride<-step*dims[k]
      for(i in 1:(dims[k]-1)){ids<-which(rep(rep(0:(dims[k]-1),each=step)==i,length.out=n));v[ids]<-(v[ids]+v[ids-step])%%65536}
    };v%%65536
 }
 s<-z$reflection$seats[[e+1L]];b<-co(s$delta);start<-((j-1)*16+t-1)*30*3
 (b[start+3*lp+1:3]*(10-m)+b[start+3*29+1:3]*m)/1000
}
# Unabhängige Normalisierung mit einer fein unterteilten Panel- und Wandfläche.
uv <- seq(.5,859.5)/860;g<-expand.grid(u=uv-.5,v=uv-.5)
x<-4.5*(31-18)/50+1.2*g$u;z<-1.52;y<-.90*g$v
p<-mean(x*z/(x*x+y*y+z*z)^2)
x<-4.5*(1-18/50);z<-sill+(2.55-sill)*(g$v+.5)-1.20;y<-2.6*g$u
ref<-.7*p+.3*mean(x*x/(x*x+y*y+z*z)^2)
trace_batch <- function(n,s,e,l,m,deg,roof,rr,seed){
 set.seed(seed);w<-s+4;d<-.75*w;H<-2.8;seat<-if(roof)d/2 else approx(c(0,10,17,24),c(.466,.36*d,.5*d,d-.86),xout=e)$y
 lamp<-approx(c(0,13,19,28),c(.60,.50*d,.62*d,d-.60),xout=l)$y
 tilt<-deg*pi/180;lb<-tilt*(.4+.15*abs(deg)/45);ex<-seat-.145+.03*cos(lb)-.14*sin(lb)+.115*cos(tilt)-.055*sin(tilt)
 ez<-1.005+.03*sin(lb)+.14*cos(lb)+.115*sin(tilt)+.055*cos(tilt)
 rho<-mapply(function(v,i)v[[i+1]],cfg$materials,rr)/100
 # Erste Richtung mit Kosinusverteilung um die Blickachse.
 rr0<-sqrt(runif(n));phi<-2*pi*runif(n);localup<-rr0*sin(phi);fw<-sqrt(1-rr0^2)
 vx<-fw*cos(tilt)-localup*sin(tilt);vy<-rr0*cos(phi);vz<-fw*sin(tilt)+localup*cos(tilt)
 mask1<-localup<=sin(50*pi/180)
 image_y<-acos(fw)*sin(phi)*180/pi
 mask2<-image_y<=50 & image_y>= -70
 x<-rep(ex,n);y<-numeric(n);z<-rep(ez,n);id<-seq_len(n);score<-numeric(n)
 for(bounce in 0:80){
   tx<-ifelse(vx>0,(d-x)/vx,-x/vx);ty<-ifelse(vy>0,(w/2-y)/vy,(-w/2-y)/vy);tz<-ifelse(vz>0,(H-z)/vz,-z/vz)
   t0<-pmin(tx,ty,tz);tt<-(.72-z)/vz
   desk<-tt>1e-6&tt<t0&x+tt*vx>=seat+.11&x+tt*vx<=seat+.86&abs(y+tt*vy)<=.60
   dist<-ifelse(desk,tt,t0);hx<-x+dist*vx;hy<-y+dist*vy;hz<-z+dist*vz
   isZ<-tz==t0&!desk;isX<-tx==t0&!desk;isY<-ty==t0&!desk
   cap<-isZ&vz>0;floor<-isZ&vz<0;frontwall<-isX&vx>0
   glass<-frontwall & abs(hy)<=1.30 & hz>=sill & hz<=2.55
   if(bounce>0){
     if(roof>0){
       L <- .12*cap + (if(roof==2) .30 else 0)*glass/opening_area
     }else{
       tp<-(2.72-z)/vz;panel<-vz>0&tp>1e-6&tp<dist&abs(x+tp*vx-lamp)<=.60&abs(y+tp*vy)<=.45
       L<-(1-m/10)*panel/(1.2*.9)+(m/10)*glass/opening_area
     }
     score[id]<-score[id]+L
   }
   reflect<-ifelse(desk,rho[4],ifelse(cap,rho[1],ifelse(floor,rho[3],rho[2])))
   reflect[glass]<-.08
   keep<-which(runif(length(id))<reflect);if(!length(keep))break
   h<-length(keep);id<-id[keep];r0<-sqrt(runif(h));ph<-2*pi*runif(h);aa<-r0*cos(ph);bb<-r0*sin(ph);nn<-sqrt(1-r0^2)
   # An der ebenen Glasfläche kehrt nur die senkrechte Komponente um.
   spec<-which(glass[keep]);mx<- -vx[keep][spec];my<-vy[keep][spec];mz<-vz[keep][spec]
   sx<-sign(vx[keep]);sy<-sign(vy[keep]);sz<-sign(vz[keep]);ix<-isX[keep];iy<-isY[keep]
   vx<-ifelse(ix,-sx*nn,aa);vy<-ifelse(iy,-sy*nn,ifelse(ix,aa,bb));vz<-ifelse(ix|iy,bb,-sz*nn)
   vx[spec]<-mx;vy[spec]<-my;vz[spec]<-mz
   x<-hx[keep]+1e-8*vx;y<-hy[keep]+1e-8*vy;z<-hz[keep]+1e-8*vz
 }
 pi*100/ref*c(mean(score),sum(score[mask1])/n,sum(score[mask2])/n)
}
tests<-list(c(0,17,19,3,-45,1,2,1,1,1),c(0,17,19,3,-35,1,2,1,1,1),c(0,17,19,3,-45,1,0,0,0,2),c(4,17,19,3,0,1,2,2,2,2),c(2,10,19,3,0,0,2,1,1,1),c(5,20,2,10,-25,0,1,1,2,1),c(10,20,0,0,20,0,2,2,1,0),c(0,17,19,3,-45,1,0,0,0,0),c(2,0,19,3,0,0,2,1,1,1),c(2,24,19,3,0,0,2,1,1,1),c(0,24,14,10,-35,0,1,1,1,2))
# Die vier Materialkategorien benutzen eigene Auswahllisten.
# Voreinstellung als physikalischer Wert: Decke/Wand/Boden/Tisch 80/50/20/50 %.
for(i in c(1L,2L,5L,9L,10L))tests[[i]][7:10] <- c(2,2,1,2)
tests <- c(tests,list(c(2,2,19,0,0,0,2,2,1,2),c(2,10,16,0,0,0,2,2,1,2),
  c(0,17,19,3,-45,2,2,2,1,2),c(2,10,19,0,0,0,0,0,0,0)))
report<-do.call(rbind,lapply(seq_along(tests),function(i){
 v<-tests[[i]];batch<-vapply(1:8,function(b)trace_batch(250000L,v[1],v[2],v[3],v[4],v[5],v[6],v[7:10],12169+i*100+b),numeric(3))
 est<-rowMeans(batch);se<-apply(batch,1,sd)/sqrt(ncol(batch));calc<-idx(v[1],v[2],v[3],v[4],v[5],v[6],v[7:10])
 cat(i,':',round(calc[1],3),round(est[1],3),'\n');flush.console()
 data.frame(case=i,sensor=0:2,radiosity=calc*lux_scale,pathtrace=est*lux_scale,se=se*lux_scale,delta=(calc-est)*lux_scale,relative=ifelse(est>0,(calc/est-1)*100,NA))
}))
write.csv(report,'validierung.csv',row.names=FALSE);print(report,digits=4,row.names=FALSE)


cat(R.version.string,'| jsonlite',as.character(packageVersion('jsonlite')),'| base64enc',as.character(packageVersion('base64enc')),'| 8 mal 250000 Pfade pro Szene\n')

# Direktlichtprüfung auf der projizierten Sensorhemisphäre
local({
decode <- function(s,n) matrix(as.integer(memDecompress(base64decode(s),"gzip")),ncol=n)
angles <- vapply(cfg$pitches,`[[`,numeric(1),"deg")
ne <- length(cfg$room[[1]]$seatX); nl <- length(cfg$room[[1]]$lampX); nm <- length(cfg$wallShare)
# Homogene Transformationen vom Halsansatz über den Schädel bis zum Auge.
shift <- function(x,z) matrix(c(1,0,x,0,1,z,0,0,1),3,byrow=TRUE)
turn <- function(a){r <- a*pi/180;matrix(c(cos(r),-sin(r),0,sin(r),cos(r),0,0,0,1),3,byrow=TRUE)}
eye_position <- function(a) {
  lower <- a*(.40+.15*abs(a)/45)
  neck <- shift(-.145,1.005) %*% turn(lower) %*% shift(.03,.14)
  eye <- neck %*% turn(a-lower) %*% c(.115,.055,1)
  pose <- cfg$pitches[[match(a,angles)]]
  stopifnot(max(abs(c(neck[1,3],neck[2,3],eye[1],eye[2])-unlist(pose[c('skullX','skullZ','eyeOffset','eyeZ')])))<1e-8)
  eye[1:2]
}
cache <- new.env(parent=emptyenv())
packed <- function(angle,type,fields) {
  key <- paste(angle,type)
  if(!exists(key,cache,inherits=FALSE))assign(key,decode(cfg$pitches[[match(angle,angles)]][[type]],fields),cache)
  get(key,cache)
}
lookup <- function(s,e,p,m,angle,roof) {
  v <- if(roof)unlist(cfg$room[[s+1L]]$views[[match(angle,angles)]]$roofValues) else
    packed(angle,"records",8L)[((s*ne+e)*nl+p)*nm+m+1L,]
  room <- cfg$room[[s+1L]];t <- match(angle,angles)
  if(roof){
    idx<-unlist(room$views[[t]]$roofDirect)
  }else{
    bytes<-as.integer(memDecompress(base64decode(room$reflection$seats[[e+1L]]$direct),"gzip"))
    count<-length(bytes)/2L;i<-seq_len(count)
    endpoints<-cumsum(as.double(bytes[i])+256*bytes[count+i])%%65536
    base<-(t-1L)*30L*3L+1:3
    idx<-((10-m)*endpoints[base+3*p]+m*endpoints[base+3*29])/1000
  }
  pct <- if(v[7]==255)rep(NA_real_,3) else c(100,v[7:8])
  list(idx=idx,pct=pct)
}
n <- 1180L
axis <- ((seq_len(n)-.5)/n)*2-1
grid <- expand.grid(y=axis,up=axis)
grid <- grid[grid$y^2+grid$up^2<1,]
side <- grid$y; up <- grid$up; front <- sqrt(1-side^2-up^2)
valid_top <- up<=sin(50*pi/180)
image_y <- acos(front)*sin(atan2(up,side))*180/pi
valid_both <- image_y>= -70 & image_y<=50
pixel_area <- (2/n)^2
light <- function(s,e,p,m,angle,roof,table=TRUE) {
  room <- cfg$room[[s+1L]]
  d <- room$depth; w <- room$width
  seat <- if(roof)d/2 else room$seatX[[e+1L]]; lx <- room$lampX[[p+1L]]
  pos <- eye_position(angle);ex <- seat+pos[1];ez <- pos[2]
  # Konstruktion von Strahlen aus Sensorrichtungen zurück in den Raum.
  pitch <- angle*pi/180
  x <- front*cos(pitch)-up*sin(pitch)
  z <- front*sin(pitch)+up*cos(pitch)
  if(roof){
    tt <- (2.80-ez)/z; hitx <- ex+tt*x
    in_roof <- tt>0 & hitx>=0 & hitx<=d & abs(tt*side)<=w/2
    lum <- .12*in_roof
  }else{
    tp <- (2.72-ez)/z
    panel <- tp>0 & abs(ex+tp*x-lx)<=.60 & abs(tp*side)<=.45
    tw <- (d-ex)/x; wallz <- ez+tw*z
    wall <- tw>0 & abs(tw*side)<=1.30 & wallz>=sill & wallz<=2.55
    td <- (.72-ez)/z
    hits_desk <- td>0 & td<tw & pos[1]+td*x>=.11 & pos[1]+td*x<=.86 & abs(td*side)<=.60
    if(table)wall <- wall & !hits_desk
    mix <- m/10
    lum <- (1-mix)*panel/(1.2*.90) + mix*wall/opening_area
  }
  pixel_area*c(sum(lum),sum(lum[valid_top]),sum(lum[valid_both]))
}
reference <- light(2,10,19,3,0,0)[1]
# Auch Rückseite der ursprünglich vertikalen Messebene, wandnaher Tisch,
# drei Masken, Raumgrößenextreme und mathematisch undefinierter Quotient.
scenarios <- rbind(
  c(2,10,19,3,0,0),c(2,2,19,3,0,0),c(2,24,19,3,0,0),c(2,24,19,3,-45,0),
  c(2,24,19,3,30,0),c(2,10,19,3,-30,0),c(2,10,19,3,15,0),c(2,10,19,3,30,0),
  c(2,10,19,0,0,0),c(2,10,19,10,0,0),c(2,10,0,0,30,0),c(2,10,28,3,-35,0),
  c(0,24,1,10,-45,0),c(0,24,1,10,0,0),c(0,24,1,10,30,0),
  c(5,6,8,4,-25,0),c(8,23,6,6,25,0),c(12,0,28,0,20,0),c(12,0,0,10,-40,0),
  c(0,10,19,3,-45,1),c(0,10,19,3,-35,1),c(0,10,19,3,0,1),c(0,10,19,3,30,1),
  c(5,10,19,3,-30,1),c(12,10,19,3,-45,1),c(12,10,19,3,0,1),c(12,10,19,3,30,1))
cases <- lapply(seq_len(nrow(scenarios)),function(i){
  a <- as.list(scenarios[i,])
  v <- do.call(light,a);out <- do.call(lookup,a)
  rawindex <- 100*v/reference
  rawpercent <- if(v[1]==0)rep(NA_real_,3)else 100*v/v[1]
  stopifnot(identical(is.na(rawpercent),is.na(out$pct)))
  error <- max(c(abs(rawindex-out$idx),abs(rawpercent-out$pct)),na.rm=TRUE)
  if(error>=.85) stop("Gegenprobe über Toleranz bei ",paste(unlist(a),collapse=","),": ",error)
  data.frame(case=i,sensor=0:2,model=out$idx*lux_scale,ray_grid=rawindex*lux_scale,
             model_percent=out$pct,grid_percent=rawpercent)
})
with_desk <- light(0,24,1,10,-35,0)[1]
without_desk <- light(0,24,1,10,-35,0,table=FALSE)[1]
stopifnot(abs(with_desk-without_desk)<1e-12,
          all(light(0,10,19,3,-45,1)==0),length(cases)==nrow(scenarios))
# Unabhängige Prüfung der diskreten Strahlklassen gegen Winkel im Mittelschnitt.
pg <- expand.grid(p=seq_len(nl),e=seq_len(ne))
nchecked <- 0
for (s in seq_along(cfg$room)){
  room <- cfg$room[[s]];seat <- unlist(room$seatX)[pg$e];lx <- unlist(room$lampX)[pg$p];d <- room$depth
  for(a in angles){
    pos <- eye_position(a);x <- seat+pos[1]
    dx <- cbind(lx-x-.52,lx-x,lx-x+.52,d-x,d-x,.15-pos[1]);dz <- c(2.72,2.72,2.72,1,2.30,.72)-pos[2]
    elevation <- sapply(1:6,function(k)(atan2(dz[k],dx[,k])*180/pi-a+180)%%360-180)
    codes <- ifelse(abs(elevation)>=90-1e-9,0L,ifelse(elevation>50+1e-9,2L,ifelse(elevation< -70-1e-9,3L,1L)))
    stored <- packed(a,"rays",7L)[(s-1L)*nrow(pg)+seq_len(nrow(pg)),-1,drop=FALSE]
    stopifnot(all(stored==codes))
    nchecked <- nchecked+length(codes)
  }
}
direct_report<-do.call(rbind,cases)
write.csv(direct_report,"direktpruefung.csv",row.names=FALSE)
cat("Geprüfte Direktlichtszenen",length(cases)," | Richtungen pro Szene",nrow(grid)," | Strahlklassen",nchecked," | größte absolute Differenz in lx",max(abs(direct_report$model-direct_report$ray_grid)),"\n")
})
