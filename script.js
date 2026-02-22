const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//
var canvasWidth = 480;
var canvasHeight = 480;
ctx.fillStyle = "green";
ctx.strokeStyle = "green";

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

//izorezystancje - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var izorezystancje = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0]


for (let i=0; i<izorezystancje.length; i++) {
    var r = izorezystancje[i]
    //rzeczywiste wartości współrzędnych na płaszczyźnie zespolonej
    var x = r/(r+1)
    var y = 0
    var radius = 1/(r+1)
    //wartości do wyświetlenia
    var relativeX = (x+1)*canvasHeight/2
    var relativeY = (y+1)*canvasHeight/2
    var relativeRadius = radius*canvasHeight/2

    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,0,Math.PI*2)
    ctx.stroke();
    ctx.closePath();
}
