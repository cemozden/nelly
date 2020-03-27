import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";

export function generateCronPattern(duration : Duration) : string {

    const patternFieldArray = ['*', '*', '*', '*', '*', '*'];

    const now = new Date();

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();
    const days = now.getDate();
    const months = now.getMonth();

    const timeArray = [seconds, minutes, hours, days, months];
    const unitTypeInt = parseInt(duration.unit.toString());

    for (let i = 0 ; i < unitTypeInt ; i++)
        patternFieldArray[i] = timeArray[i].toString();

    
    patternFieldArray[unitTypeInt] = '*/' + duration.value.toString();

    return patternFieldArray.join(' ');
}