//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const debugInfo = document.getElementById("debugInfo");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
var mx = 0;
var my = 0;
//
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
//todo: make a better way to scale coordinates
function toComplexCords(realX,realY) {
    return {u:2*(realX-canvasHeight/2)/canvasHeight,v:2*(canvasHeight/2-realY)/canvasHeight}
}
function toXyCords(realU,imaginaryV) {
    return {x:(realU+1)*canvasHeight/2, y:((1-imaginaryV)*canvasHeight/2)}
}
function mouseMoveHandler(e) {
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    //clear canvas
    ctx.beginPath()
    ctx.rect(0,0,canvasWidth,canvasHeight);
    ctx.closePath();
    ctx.fill();

    drawSmithChart();
    //show mouse position
    ctx.beginPath()
    ctx.rect(mx,my,10,10);
    ctx.closePath();
    ctx.stroke();
    let radius = distance(mx,my,canvasHeight/2,canvasHeight/2);
    let mouseAngle =angle(canvasHeight/2,canvasHeight/2,mx,my);
    ctx.beginPath()
    ctx.arc(canvasHeight/2,canvasHeight/2,radius,Math.PI*2,mouseAngle);
        ctx.stroke();
    ctx.closePath();



}
function mouseDownHandler(e) {
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    let u = toComplexCords(mx,my).u;
    let v = toComplexCords(mx,my).v;
    let x = toXyCords(u,v).x;
    let y = toXyCords(u,v).y;
    debugInfo.innerHTML = ` u:${u} v:${v} \n x:${x} y:${y}`;
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
    var v = -1/x;
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

