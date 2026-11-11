
//tej funkcji teraz nie muszę zmieniać
function drawCurrentMouseArc(mu,mv) {
    //rysuje właśnie edytowaną krzywą na podstawie dostępnych danych
    //TODO: błąd - możliwe jest narysowanie końca łuku w nieprecyzyjnym miejscu
    ctx.strokeStyle = "red";
    if (narzedzie_edycji==ODCZYT || narzedzie_edycji==DODAWANIE_PUNKTU) {
        return;
    }
    let okrag = {}
    if (narzedzie_edycji==ODBICIE) {
        draw_dot(mu,mv)
        draw_dot(-mu,-mv)
        return
    } else if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI ) {
        okrag = okragIzorezystancji(r)
    } else if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
        okrag = okragIzoreaktancji(reactance)
    } else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
        okrag = okragIzokonduktancji(g)
    } else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {
        okrag = okragIzosusceptancji(b)
    } else if (narzedzie_edycji==EDYCJA_WYDLUZANIA) {
        okrag = {u:0, v:0, radius:radius}
    }
    mouseArc = new Arc(okrag.u, okrag.v, okrag.radius,beginning,ending,clockwise)
    DrawGuideArc(mouseArc)
    mouseArcDot(mu,mv)
    if (drawing_state != CHOOSING_BEGINNING) {
        drawArc(mouseArc)
    }
}
function handleArcDrawingUI(mu, mv) {
    //funkcja odpowiadające za kolejne etapy rysowania łuku
    if (narzedzie_edycji==ODCZYT) {
        drawing_state = ""
        return 0;
    }
    if (narzedzie_edycji==DODAWANIE_PUNKTU) {
        drawing_state = ""
        if (mouseDown) {
            arrayOfArcs.push(new Dot(mu,mv))
            drawing_state = CHOOSING_TOOL;
            narzedzie_edycji = NIE_WYBRANO_NARZEDZIA;
            selectDot(mu,mv)
            setAllImpedanceVariables(chosen_point_u,chosen_point_v)
            mouseDown = false
        }
    }
    if (drawing_state==CHOOSING_TOOL) {
        if (narzedzie_edycji != NIE_WYBRANO_NARZEDZIA) {
            beginning = get_angle(chosen_point_u,chosen_point_v,narzedzie_edycji)
            if (narzedzie_edycji == ODBICIE) {
                arrayOfArcs.push(new Dot(-chosen_point_u, -chosen_point_v))
                return
            }
            if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI || narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
                drawing_state = CHOOSING_DIRECTION
            } else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI || narzedzie_edycji==EDYCJA_IZOREAKTANCJI){
                drawing_state = CHOOSING_END
            }
        }
    }

    if (drawing_state == CHOOSING_DIRECTION) {
        ending = get_angle(mu,mv,narzedzie_edycji)
        //fixme: każdy ma słaby punkt zawijania...
        //na pewno działa beginning=0, ending=0, getAngleDirection(beginning,ending)
        if (narzedzie_edycji == EDYCJA_IZOREZYSTANCJI ) {
            clockwise = getAngleDirection(beginning, ending)
        } else if (narzedzie_edycji == EDYCJA_IZOKONDUKTANCJI || narzedzie_edycji == EDYCJA_WYDLUZANIA) {
            clockwise = getAngleDirection(beginning+Math.PI, ending+Math.PI)
        }
        if (mouseDown) {
            drawing_state = CHOOSING_END;
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_END) {
        //UWAGA, dla izoREAktancji nie ma etapu wybierania kierunku
        ending = get_angle(mu,mv, narzedzie_edycji);
        if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
            clockwise = getAngleDirection(beginning,ending)
        } else if (narzedzie_edycji == EDYCJA_IZOSUSCEPTANCJI) {
            clockwise = getAngleDirection(beginning+Math.PI,ending+Math.PI)
        }
        if (mouseDown) {
            arrayOfArcs.push(mouseArc);
            arrayOfArcs.push(mouseArcDot(mu,mv))
            r = 0;
            reactance = 0;
            g = 0;
            b = 0;
            beginning = Math.PI*2;
            ending = 0;
            chosen_point_u = null
            chosen_point_v = null
            if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI) {
                drawing_state = CHOOSING_R
            } else if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
                drawing_state = CHOOSING_X
            }else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
                drawing_state = CHOOSING_G
            }else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {
                drawing_state = CHOOSING_B
            } else if (narzedzie_edycji==EDYCJA_WYDLUZANIA) {
                drawing_state = CHOOSING_RADIUS
            }
            mouseDown = false;
        }
    }
}
