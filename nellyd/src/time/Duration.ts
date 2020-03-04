import { TimeUnit, LAST_TIME_UNIT_ELEMENT_INDEX } from "./TimeUnit";

export default interface Duration {
    value : number,
    unit : TimeUnit
}

export function isDuration(obj : any) : obj is Duration {
    if (obj.value === undefined || isNaN(obj.value)) return false;
    if (obj.unit === undefined || isNaN(obj.unit) || obj.unit > LAST_TIME_UNIT_ELEMENT_INDEX) return false;

    return true;
}