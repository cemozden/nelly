import { TimeUnit } from "./TimeUnit";

export default interface Duration {
    unit : TimeUnit,
    value : number
}