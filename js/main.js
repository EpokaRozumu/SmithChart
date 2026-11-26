
//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const cursorImg = document.getElementById("cursorimg")
var przyciski = {}
przyciski["Izorezystancja"] = document.getElementById("Izorezystancja");
przyciski["Izoreaktancja"] = document.getElementById("Izoreaktancja");
przyciski["Transformacja"] = document.getElementById("Wydłużenie");

przyciski["Izokonduktancja"] = document.getElementById("Izokonduktancja");
przyciski["Izosusceptancja"] = document.getElementById("Izosusceptancja");
przyciski["Odbicie"] = document.getElementById("Odbicie");
przyciski["Punkt"] = document.getElementById("Punkt");



przyciski["Odczyt"] = document.getElementById("Odczyt");


var wybranoImpedancyjny = true;
var wybranoAdmitancyjny 
var wybranoSnapping
var wybranoOkrag

window.addEventListener('pageshow', () => {//reset checkboxes on page refresh by chatgpt
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = checkbox.defaultChecked;
    });
});

document.querySelector("#Impedancyjny input").addEventListener("change", function() {
    wybranoImpedancyjny = this.checked;
});

document.querySelector("#Admitancyjny input").addEventListener("change", function() {
    wybranoAdmitancyjny = this.checked;
});

document.querySelector("#Snap input").addEventListener("change", function() {
    wybranoSnapping = this.checked;
});
document.querySelector("#Okrag input").addEventListener("change", function() {
    wybranoOkrag = this.checked;
});
const okienkoFazaOdbicia = document.getElementById("faza")
const okienkoModulOdbicia = document.getElementById("modul")
const okienkoImpedancja = document.getElementById("z")
const okienkoAdmitancja = document.getElementById("y")
const okienkoWFS = document.getElementById("WFS")
const okienkoTekstuWyjsciowego = document.getElementById("outputtext")


const ctx = canvas.getContext("2d");
document.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);//TODO: BUG, klikanie poza
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        shapes.pop()
        if (shapes[shapes.length-1] instanceof Arc) {
            shapes.pop()
        }

        if (shapes.length == 0) {
            narzedzie_edycji = DODAWANIE_PUNKTU
        } else {
            narzedzie_edycji = NIE_WYBRANO_NARZEDZIA
            drawing_state = CHOOSING_TOOL
        }

        chosen_point_u = shapes[shapes.length-1].centerU
        chosen_point_v = shapes[shapes.length-1].centerV
        setAllImpedanceVariables(chosen_point_u,chosen_point_v)


    }
});
var canvasWidth = canvas.getAttribute("width");
var canvasHeight = canvas.getAttribute("height");
ctx.fillStyle = "white";
ctx.strokeStyle = "green";
ctx.font = "16px sans-serif"
const SELECTION_DISTANCE = 0.06 //odległość od której można zaznaczyć punkt
var mx = 0;
var my = 0;
var x, y, u, v = 0;
var mouseDown = false;

var chosen_point_u = null
var chosen_point_v = null

//możliwe stany narzędzia edycji
const DODAWANIE_PUNKTU = "Dodawanie punktu"
const EDYCJA_IZOREZYSTANCJI = "edycja izorezystancji";
const EDYCJA_IZOREAKTANCJI = "edycja izoreaktancji";
const EDYCJA_IZOKONDUKTANCJI = "edycja izokonduktancji";
const EDYCJA_IZOSUSCEPTANCJI = "edycja izosusceptancji";
const EDYCJA_WYDLUZANIA = "transformacja linii";//z jakiegoś powodu zmiana wartości tej stałej powoduje problemy
const ODCZYT = "odczyt";
const ODBICIE = "odbicie"
const NIE_WYBRANO_NARZEDZIA = "nie wybrano narzędzia";
var narzedzie_edycji = DODAWANIE_PUNKTU;

//możliwe stany drawing state
const CHOOSING_TOOL = "Wybierz, po jakiej linii przesunąć punkt"
const CHOOSING_DIRECTION = "Kliknij, by wybrać kierunek krzywej";
const CHOOSING_END = "Kliknij, by zaznaczyć koniec krzywej";
var drawing_state = CHOOSING_TOOL ;


var r = 0.5;
var reactance = 0.5;
var g = 0.5;
var b = 0.5;
var radius = 0.5;

//wartości charakteryzujące właśnie rysowany łuk
var ending = 0.5;
var beginning = 0;
var clockwise = false;

var mouseArc = new Arc(0,0,0.5,Math.PI*2,0,true);
//when only the first point is chosen, start angle will be equal to end angle;
var shapes = [];


//wartości izorezystancji i izoreaktancji - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var wartosciSiatki = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0];
drawSmithChart();
// rysujOsie();

function highlightButtons() {

    for (var [name, przycisk] of Object.entries(przyciski)) {
        name_cropped = name.substring(0, name.length - 1).toLowerCase()//np izoreaktancja -> izoreaktancj
        
        if (narzedzie_edycji.includes(name_cropped)) {
            przycisk.classList.add("btn-success")
        } else {
            przycisk.classList.remove("btn-success")
        }

        //fixme: przyciski mają być nieklikalne a nie tylko szare
        if (name == "Punkt") {
            przycisk.classList.disabled = Boolean(shapes.length == 0)
            if (shapes.length == 0) {
                przycisk.classList.remove("disabled")
                przycisk.disabled = false
            } else {
                przycisk.classList.add("disabled")
                przycisk.disabled = true
            }
        } else {
            if (shapes.length == 0) {
                przycisk.classList.add("disabled")
                przycisk.disabled = true
            } else {
                przycisk.classList.remove("disabled")
                przycisk.disabled = false
            }
        }

        
    }

}
function faza_stopnie(u,v) {
    return -1*angle(0,0,u,v)*180/Math.PI //sus -1
}
function updateInfoBoxes(u,v) {
    //TODO: jeśli za szybko wyjdę z wykresu, program nie ogarnie że mysz jest poza wykresem
    let isMouseNearSMithChart = (dist(UfromX(mx),VfromY(my),0,0) < 1.1)
    console.log(isMouseNearSMithChart)
    if (isMouseNearSMithChart || (!isMouseOutsideCanvas)) {
        let precision = 3;
        okienkoFazaOdbicia.innerText = "∠Γ = " + roundTo( faza_stopnie(u,v), precision) + "°" 
        let modulOdbicia = roundTo(Math.sqrt(u**2 + v**2),precision)
        okienkoModulOdbicia.innerText = "|Γ| = " + modulOdbicia 
        //fixme: może się tu pojawić + -
        let r = roundTo(znajdzIzorezystancje(u,v),precision)
        let x = roundTo(znajdzIzoreaktancje(u,v),precision)
        let g = roundTo(znajdzIzokonduktancje(u,v),precision)
        let b = roundTo(znajdzIzosusceptancje(u,v),precision)
        okienkoImpedancja.innerText = "Z = " + r + " "+ znak(x)+ " " + Math.abs(x) +"i"
        okienkoAdmitancja.innerText = "Y = "+ g + " "+ znak(x)+ " " + Math.abs(b) + "i"
        okienkoWFS.innerText = "WFS:  " + roundTo((1+modulOdbicia)/(1-modulOdbicia),precision)
    } else {
        okienkoFazaOdbicia.innerText = ""
        okienkoModulOdbicia.innerText = ""
        okienkoImpedancja.innerText = ""
        okienkoAdmitancja.innerText = ""
        okienkoWFS.innerText = ""
    }


}
function nazwaPrzesuniecia(narzedzie_edycji) {
    if (narzedzie_edycji in [DODAWANIE_PUNKTU, EDYCJA_WYDLUZANIA, ODCZYT]) {
        return narzedzie_edycji
    } else if (narzedzie_edycji==ODBICIE){
        return "Z → Y"
    } else if (narzedzie_edycji==EDYCJA_WYDLUZANIA) {
        return "transformacja"
    } {
        return "(po " + narzedzie_edycji.substring(7) + ")"
    }
}
function updateOutputTextbox() {
    let txt = ``
    let precision = 2

    for (i=0; i<shapes.length; i++) {
        let shape = shapes[i]
        if (shape instanceof Dot) {
            txt += "(" + shape.name + ") "
            let u = shape.centerU
            let v = shape.centerV
            txt += ("Z = " +roundTo(znajdzIzorezystancje(u,v),precision) + " + " + roundTo(znajdzIzoreaktancje(u,v),precision) +"i")
            txt += "\n"
            if ((i+1)<shapes.length) {
                //linia między punktami
                let nextshape = shapes[i+1]

                if (nextshape instanceof Arc && ((i+1)<shapes.length)) {
                    let nextdot = shapes[i+2]
                    //todo: zmień podpis na inny. np. krzywa izorezystancji
                    txt += " | \n"
                    txt +=" | " + nazwaPrzesuniecia(nextshape.izolinia) +" "+ howMuchChanges(shape,nextdot, nextshape.izolinia, nextshape.clockwise) + "\n"
                    txt += " V \n"
                } else if ((shape.centerU = -nextshape.centerU)&&(shape.centerV = -nextshape.centerV)){//kropka za kropką jest tylko w przypadku odbicia
                    txt += " | \n"
                    txt +=" | " + "odbicie" + "\n"
                    txt += " V \n"
                }
            }
        }
    }
    //fixme: wartość ostatniego zapisanego łuku zawsze wynosi 0 
    if ((shapes.length > 0) & (shapes[shapes.length-1] instanceof Dot) & (narzedzie_edycji != NIE_WYBRANO_NARZEDZIA)) {
        txt += " | \n"
        nowDot = arcDot(mouseArc.centerU,mouseArc.centerV, mouseArc.radius,mouseArc.end_angle)
        lastDot = shapes[shapes.length - 1]
        txt +=" | " + nazwaPrzesuniecia(narzedzie_edycji) +" "+ howMuchChanges(lastDot,nowDot, narzedzie_edycji) + "\n"
        txt += " V \n"
        okienkoTekstuWyjsciowego.value = txt
    }


}
function znak(liczba) {
    if (liczba > 0) {
        return "+"
    } else {
        return "-"
    }
}
function howMuchChanges(dot, nextdot, narzedzie_edycji, clockwise=true) {

    dr =   znajdzIzorezystancje(nextdot.centerU,nextdot.centerV) -znajdzIzorezystancje(dot.centerU, dot.centerV)
    dx = znajdzIzoreaktancje(nextdot.centerU,nextdot.centerV) -znajdzIzoreaktancje(dot.centerU, dot.centerV)
    dg = znajdzIzokonduktancje(nextdot.centerU, nextdot.centerV) - znajdzIzokonduktancje(dot.centerU, dot.centerV) 
    db =  znajdzIzosusceptancje(nextdot.centerU, nextdot.centerV)-znajdzIzosusceptancje(dot.centerU, dot.centerV) //z tym może być problem
    dfaza = faza_stopnie(nextdot.centerU, nextdot.centerV) - faza_stopnie(dot.centerU, dot.centerV)

    ilosc_lambda = dfaza * (0.5/360)
    //todo: napraw zawijanie fazy... ech....
    if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
        return "ΔR = " + roundTo(dr,2)
    } else if (narzedzie_edycji == EDYCJA_IZOREZYSTANCJI) {
        return "ΔX = "+roundTo(dx,2)
    } else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {
        return "ΔG = "+  roundTo(dg,2)
    } else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
        
        return "ΔB = "+ roundTo(db,2)
    } else {
        //todo: dodaj informację o zmianie współczynnika odbicia dla transformacji linii
        //TODO: NAPRAW
        return " Δ(∠Γ) = " + roundTo(ilosc_lambda,2) + " λ" //+ roundTo(dfaza,2) + "°"
    } 
}
function ustawNarzedzieEdycji(narzedzie) {
    narzedzie_edycji = narzedzie;

}

function drawArc(a, lineWidth=3, arrow=true) {
    //draws and arc given in u and v coordinates
    let relativeX = (a.centerU+1)*canvasHeight/2
    let relativeY = (-1*a.centerV+1)*canvasHeight/2
    let relativeRadius = a.radius*canvasHeight/2
    ctx.lineWidth = lineWidth;
    drawArcWithArrow(relativeX, relativeY, relativeRadius,
        a.start_angle,a.end_angle, !a.isClockwise, arrow);
    ctx.lineWidth = 1;
}
function drawArcWithArrow(cx, cy, radius, startAngle, endAngle,clockwise, arrow=true) {
            //napisane razem z chatgpt
            // Rysowanie łuku
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle, clockwise);
            ctx.stroke();
            if (!arrow) {
                return
            }
            previous_fillstyle = ctx.fillStyle
            ctx.fillStyle = ctx.strokeStyle
            // Pozycja środka łuku!!!
            if (clockwise) {
                [startAngle, endAngle] = [endAngle,startAngle]
            }
            const direction = clockwise ? -1 : 1;
            let distance = ((endAngle-startAngle)+2*Math.PI)%(2*Math.PI)
            let korekta_strzalki = 10*direction/radius;
            const middleAngle = startAngle + 0.5*distance +korekta_strzalki

            const x = cx + radius * Math.cos(middleAngle);
            const y = cy + radius * Math.sin(middleAngle);

            // Kierunek styczny do łuku
            var tangentAngle = middleAngle + direction * Math.PI / 2;

            // Rysowanie strzałki
            const arrowLength = 12;
            const arrowWidth = 6;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(tangentAngle);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowLength, -arrowWidth);
            ctx.lineTo(-arrowLength, arrowWidth);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
            ctx.fillStyle = previous_fillstyle
}
function draw_circular_frame() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(canvasWidth/2, canvasWidth/2, canvasWidth/2, 0, 2 * Math.PI);
    ctx.rect(canvasWidth, 0, -canvasWidth, canvasWidth);//ten minus jest ważny
    ctx.fill();
}
function angle_from_0_to_360(angle) {//powinno zamieniać za duży lub ujemny kąt na kąt z zakresu od 0 do 360 stopni.
    return (angle+2*Math.PI)%(2*Math.PI)
}



function drawLittleSquare(x, y, color) {
    ctx.strokeStyle =color;
    ctx.beginPath();
    ctx.rect(x,y,10,10);
    ctx.closePath();
    ctx.stroke();
}
// function drawCoords(u,v) {
//     //draws a little rectangle labeling specific coords on screem
//     let x = XfromU(u);
//     let y = YfromV(v);
//     let dx = 100;
//     let dy = 20;
//     ctx.clearRect(x-dx,y-dy,dx,dy);
//     ctx.fillStyle = "black";
//     ctx.fillText("u: " + u.toFixed(3) + " v: " + v.toFixed(3) ,x-dx+5,y-dy+10);
//     ctx.fillStyle = "white";
// }

function get_angle(mu,mv,narzedzie_edycji){
    if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
        return angle(1, 1/reactance,mu,mv)
    } else if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI) {
        return angle(r/(r+1),0,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_IZOKONDUKTANCJI) {
        let ok = okragIzokonduktancji(g)
        return angle(ok.u, ok.v,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_IZOSUSCEPTANCJI) {
        let okrag = okragIzosusceptancji(b)
        return angle(okrag.u, okrag.v,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_WYDLUZANIA) {
        return angle(0,0,mu,mv)
    } else {
        console.log("ZŁA NAZWA STANU!!!!")
    }
}
function dotIsSelected() {
    return (chosen_point_u!==null && chosen_point_v!==null)
}
function setAllImpedanceVariables(u,v) {
    radius = Math.sqrt(u**2 + v**2)
    r = znajdzIzorezystancje(u,v)
    reactance = znajdzIzoreaktancje(u,v);
    g = znajdzIzokonduktancje(u,v)
    b = znajdzIzosusceptancje(u,v)
}

function angleIndicator(x,y) {
    //an angle indicator to help with debugging:

    drawLittleSquare(x,y, "red")
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(mx,my);
    ctx.closePath();
    ctx.stroke();
}
function DrawGuideArc(arc) {
    guideArc = new Arc(mouseArc.centerU,mouseArc.centerV,mouseArc.radius,0, 2 * Math.PI,false);//rózni się tylko początkiem i końcem
    drawArc(guideArc, 0.5, false)
}

function isMouseOutsideCanvas() {
    let isX = (mx < 0 || mx > canvasWidth);
    let isY = (my < 0 || my > canvasHeight);
    return isX || isY;
}

function handleSnapping() {
    // nie pozwól kursorowi wyjśść poza okrąg
    if (wybranoSnapping) {
        let snapped_ad = snapUVToGrid(-u,v)
        snapped_ad.u = -1*snapped_ad.u
        let snapped_im = snapUVToGrid(u,v)
        
        if (wybranoImpedancyjny && !wybranoAdmitancyjny) {
            u = snapped_im.u
            v = snapped_im.v
        } else if (wybranoAdmitancyjny && !wybranoImpedancyjny)  {
            u = snapped_ad.u
            v = snapped_ad.v
        } else if (wybranoAdmitancyjny && wybranoImpedancyjny) {
            if (dist(u,v,snapped_im.u,snapped_im.v) < dist(u,v,snapped_ad.u,snapped_ad.v)) {
                u = snapped_im.u
                v = snapped_im.v
            } else {
                u = snapped_ad.u
                v = snapped_ad.v
            }
        }
    }
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
}
requestAnimationFrame(update)
function update() {
    //user input
    //coordinates scaling and rescaling test
    u = UfromX(mx)
    v = VfromY(my)
    //dlaczego wychodzi nan?
    if (dist(u,v, 0, 0) > 1) { //nie ufaj globalnym zmiennym u oraz v
        console.log("JESTEŚMY POZA KOŁEM")
        console.log("new_u " + u + "new v " + v )

        let alpha = Math.atan2(u,v)
        let d = Math.sqrt(u**2 + v**2)
        u = Math.sin(alpha)
        v = Math.cos(alpha)

        console.log("new_u " + u + "new v " + v + "alpha " + alpha)
    }

    handleSnapping()
    x = XfromU(u);
    y = YfromV(v);

    //#####DRAWING######
    // uiText2.innerText = narzedzie_edycji;
    //clear canvas
    ctx.beginPath()
    ctx.rect(0,0,canvasWidth,canvasHeight);
    ctx.closePath();
    ctx.fill();
    // rysujOsie();
    drawSmithChart();
    draw_circular_frame();
    //todo: uporządkuj kod
    //TODO: skalowanie wskaźnika myszy dla większego canvas - ale jak?
    // drawLittleSquare(x,y,"blue")    //show rescaled mouse position
    // drawLittleSquare(mx,my,"red")      //show original mouse position
    // drawCoords(u,v);
    if (narzedzie_edycji==DODAWANIE_PUNKTU) {
        uiText.innerText = "Kliknij, aby wybrać punkt początkowy"
    } else {
         uiText.innerText = drawing_state;

    }
    handleArcDrawingUI(u,v);    // editing
    updateInfoBoxes(u,v)
    highlightButtons()
    updateOutputTextbox()
    drawCurrentMouseArc(u,v);   //drawing
    for (let i=0; i<shapes.length; i++) {
        shapes[i].draw();
    }
    for (let i=0; i<shapes.length; i++) {
        if (shapes[i] instanceof Dot) {
             shapes[i].draw_name();

        }
    }
    ctx.drawImage(cursorImg,x-8,y-8)

    // debugInfo.innerText = "clockwise: " + mouseArc.isClockwise + "beginning: " +Math.floor(mouseArc.start_angle*180/Math.PI) + "end: " + Math.floor(mouseArc.end_angle*180/Math.PI);
    requestAnimationFrame(update)
}
function selectDot(mu,mv) {
    let smallest_distance = 99
    let u = null
    let v = null
    for (let shape of shapes) {
        let distance = dist(shape.centerU, shape.centerV, mu, mv)
        if (shape instanceof Dot &&  distance<= SELECTION_DISTANCE && distance < smallest_distance) {
            u = shape.centerU //HINT: - może być to równe null!
            v = shape.centerV
        }
    }
    if (u !== null && v!==null) {//sus
        chosen_point_u = u
        chosen_point_v = v
        return true
    } else {
        return false
    }
}
function mouseDownHandler(e) {
    if (canvas.matches(':hover')) {
        mouseDown = true;
    }
}

function rysujOsie() {
    //osie pomocnicze, do sprawdzenia czy wykres jest wycentrowany
    //oś pozioma
    ctx.strokeStyle = "limegreen";
    ctx.lineWidth = 1;
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

function drawCircle(u,v,radius) {//rysuje podany okrąg z płaszczyzny zespolonej na elemencie canvas
    let relativeX = (u+1)*canvasHeight/2
    let relativeY = (v+1)*canvasHeight/2
    let relativeRadius = radius*canvasHeight/2
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,0,Math.PI*2)
    ctx.stroke();
    ctx.closePath();
}
function draw_dot(u,v,r=4) {
    let previous_fillstyle = ctx.fillStyle
    ctx.beginPath();
    ctx.arc(XfromU(u),YfromV(v),r,0,2*Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = previous_fillstyle
}
function mouseArcDot(mu,mv) {
    alpha = get_angle(mu,mv,narzedzie_edycji)
    let dot = arcDot(mouseArc.centerU,mouseArc.centerV,mouseArc.radius,alpha)
    dot.draw()
    return dot
}
