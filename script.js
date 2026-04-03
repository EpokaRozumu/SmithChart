//git commit -am "commit test 2"

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const debugInfo = document.getElementById("debugInfo");
const uiText = document.getElementById("uiText");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
var mx = 0;
var my = 0;


class Arc {//complex arc class
    constructor(centerU,centerV,radius,start_angle,end_angle) {
        this.centerU = centerU;
        this.centerV = centerV;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
    }
}
function drawArc(a) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(XfromU(a.centerU), YfromV(a.centerV),
        a.radius*canvasWidth/2,a.start_angle,a.end_angle);

    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = "green";
}

var beginningIsChosen = false;
var angleOfBeginning = 0;
var radiusOfBeginning = 0;//in uv coords
var drawMode = "Izorezystancja"


var myArc = new Arc(0,0,0.5,0,Math.PI)
//an arc that shows what you are about to draw
var mouseArc = new Arc(0,0,0.5,Math.PI*2,Math.PI);
var arrayOfArcs = [myArc];
var canvasWidth = canvas.getAttribute("width");
var canvasHeight = canvas.getAttribute("height");
ctx.fillStyle = "white";
ctx.strokeStyle = "green";
var point1 = [0,0];
var point2 = [0,0];
function distance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}
function angle(x1,y1,x2,y2) {
    //kąt lini z punktu 1 do punktu 2 względem 90 stopni
    let angle = Math.atan((y2-y1)/(x2-x1));
    if ((x2-y1)<0) {
        angle += Math.PI
    }
    return angle;

}
//Functions for scaling coordinates
function UfromX(x) {
    return 2*(x-canvasHeight/2)/canvasHeight;
}
function VfromY(y) {
    return  2*(canvasHeight/2-y)/canvasHeight;
}
function XfromU(u) {
    return (u+1)*canvasHeight/2;
}
function YfromV(v) {
    return ((1-v)*canvasHeight/2);
}
function drawMousePosition(x, y, color) {
    ctx.strokeStyle =color;
    ctx.beginPath();
    ctx.rect(x,y,10,10);
    ctx.closePath();
    ctx.stroke();
}
function drawCoords(u,v) {
    let x = XfromU(u);
    let y = YfromV(v);
    let dx = 100;
    let dy = 20;
    ctx.clearRect(x-dx,y-dy,dx,dy);
    ctx.fillStyle = "black";
    ctx.fillText("u: " + u + " v: " + v ,x-dx+5,y-dy+10);
    ctx.fillStyle = "white";
}
function mouseMoveHandler(e) {
    //clear canvas
    ctx.beginPath()
    ctx.rect(0,0,canvasWidth,canvasHeight);
    ctx.closePath();
    ctx.fill();
    rysujOsie();
    drawSmithChart();
    //user input
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    //coordinates scaling and rescaling test
    var u = UfromX(mx)
    var v = VfromY(my)
    var x = XfromU(u);
    var y = YfromV(v);
    drawMousePosition(x,y,"blue")    //show rescaled mouse position
    drawMousePosition(mx,my,"red")      //show original mouse position
    drawCoords(u,v);

    for (let i=0; i<arrayOfArcs.length; i++) {
        drawArc(arrayOfArcs[i]);
    }

    let radius = distance(x,y,canvasHeight/2,canvasHeight/2);
    let mouseAngle =angle(canvasHeight/2,canvasHeight/2,x,my);
    ctx.strokeStyle = "blue";
    //FIX:
    rysujIzorezystancje(znajdzIzorezystancje(u,v));
    debugInfo.innnerHTML = znajdzIzorezystancje(u,v);
    ctx.strokeStyle = "blue";

    mouseArc = new Arc(0,0,2*radius/canvasHeight,Math.PI*2,mouseAngle);
    drawArc(mouseArc);



}
function mouseDownHandler(e) {
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    let u = UfromX(mx)
    let v = VfromY(mx)
    let x = XfromU(u);
    let y = YfromV(v);
    arrayOfArcs.push(mouseArc);
    //debugInfo.innerHTML = ` u:${u} v:${v} \n x:${x} y:${y}`;
}

//wartości izorezystancji i izoreaktancji - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var wartosciSiatki = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0]

function drawSmithChart() {
    for (let i=0; i<wartosciSiatki.length; i++) {
        var r = wartosciSiatki[i];
        rysujIzorezystancje(r);
    }
    for (let i=0; i<wartosciSiatki.length; i++) {
        var x = wartosciSiatki[i];
        rysujIzoreaktancje(x)
    }
}
drawSmithChart();
rysujOsie()

function rysujOsie() {//osie pomocnicze, do sprawdzenia czy wykres jest wycentrowany
    //oś pozioma
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight/2);
    ctx.lineTo(canvasWidth,canvasHeight/2);
    ctx.closePath();
    ctx.stroke();

    //oś pionowa
    ctx.beginPath();
    ctx.moveTo(canvasWidth/2, 0);
    ctx.lineTo(canvasWidth/2,canvasHeight);
    ctx.closePath();
    ctx.stroke();
}
function znajdzIzorezystancje(u,v) {
    let ans = (1-(u**2-v**2))/((1-u)**2 + v**2);
    console.log(ans);
    return ans;
}
function rysujIzorezystancje(r) {//rysuje jedną izorezystancję
    var u = r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    drawCircle(u,v,radius)
}
function rysujIzoreaktancje(x) {
    var u = 1;
    var v = 1/x;
    var radius = 1/x;
    drawCircle(u,v,radius);
    v = -1/x;
    drawCircle(u,v,radius);
}
function drawCircle(u,v,radius) {//rysuje podany okrąg z płaszczyzny zespolonej na elemencie canvas
    let relativeX = (u+1)*canvasHeight/2
    let relativeY = (v+1)*canvasHeight/2
    let relativeRadius = radius*canvasHeight/2
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,0,Math.PI*2)
    ctx.stroke();
    ctx.closePath();
}