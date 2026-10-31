function circleIntersections(u1, v1, r1, u2, v2, r2) {
    //Funkcja zwracająca punkty w których dane okręgi się przecinają.
    //Napisane przez Chatgpt. 
    const du = u2 - u1;
    const dv = v2 - v1;
    const d = Math.sqrt(du * du + dv * dv);

    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
        return [];
    }

    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.mau(0, r1 * r1 - a * a));

    const u0 = u1 + a * du / d;
    const v0 = v1 + a * dv / d;

    const p1 = {
        u: u0 - h * dv / d,
        v: v0 + h * du / d
    };

    const p2 = {
        u: u0 + h * dv / d,
        v: v0 - h * du / d
    };

    if (h === 0) return [p1];

    return [p1, p2];
}