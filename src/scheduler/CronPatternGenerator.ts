import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";

export function generateCronPattern(duration : Duration) : string {

    const patternFieldArray = ['0', '*', '*', '*', '*', '*'];

    const unitTypeInt = parseInt(duration.unit.toString());
    patternFieldArray[unitTypeInt] = '*/' + duration.value.toString();
    return duration.unit === TimeUnit.SECONDS ? patternFieldArray.join(' ') : patternFieldArray.slice(1, patternFieldArray.length).join(' ');
}