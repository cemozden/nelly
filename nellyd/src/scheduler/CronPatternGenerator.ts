import Duration from "../time/Duration";

export function generateCronPattern(duration : Duration) : string {

    const patternFieldArray = ['*', '*', '*', '*', '*', '*'];

    const unitTypeInt = parseInt(duration.unit.toString());
    patternFieldArray[unitTypeInt] = '*/' + duration.value.toString();

    return patternFieldArray.join(' ');
}