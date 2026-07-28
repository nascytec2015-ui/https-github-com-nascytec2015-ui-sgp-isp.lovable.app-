export function signalColor(power: number) {

    if (power > -22)
        return "ok";

    if (power > -27)
        return "warning";

    return "critical";

}