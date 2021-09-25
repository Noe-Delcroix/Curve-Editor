let path

let roadTexture

//inspector parameters
var params={
  closePath:false,
  autoSetControlPoints:true,
  showControlPoints:false,
  drawMesh:true,
  
  roadWidth:60,
  roadWidthMin:10,
  roadWidthMax:100,
  roadWidthStep:0.1,
  
  roadDetail:20,
  roadDetailMin:5,
  roadDetailMax:100,
  roadDetailStep:0.1,
  
  roadTiling:2,
  roadTilingMin:0.1,
  roadTilingMax:5,
  roadTilingStep:0.01
  
}

var inspector


function preload(){
  roadTexture=loadImage('roadTexture.png')
}

function disableRightClickContextMenu(element) {
  element.addEventListener('contextmenu', function(e) {
    if (e.button == 2) {
      // Block right-click menu thru preventing default action.
      e.preventDefault();
    }
  });
}

function setup() {
  let canvas=createCanvas(windowWidth, windowHeight, WEBGL).elt
  disableRightClickContextMenu(canvas)

  path=new Path(createVector(width/2,height/2))
  
  inspector=createGui('Inspector')
  inspector.addObject(params)
}

function draw() {
  translate(-width/2,-height/2)
  background(51)
  path.render()
}

function mousePressed(){
  path.mousePressed()
}

function doubleClicked(){
  path.addSegment(createVector(mouseX,mouseY))
}


function evaluateCubic(a,b,c,d,t){
  let x=bezierPoint(a.x,b.x,c.x,d.x,t)
  let y=bezierPoint(a.y,b.y,c.y,d.y,t)
  return createVector(x,y)
  
  
}