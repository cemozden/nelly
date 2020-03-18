import { isDuration } from "./Duration";
import { TimeUnit } from "./TimeUnit";

describe('Duration', () => {
    describe('#isDuration(obj : any)', () => {

        it('should return false if value is not an integer', () => {
            expect(isDuration({})).toBe(false);
            expect(isDuration({value : 'string'})).toBe(false);
            expect(isDuration({value : undefined})).toBe(false);

            expect(isDuration({unit : TimeUnit.DAYS})).toBe(false);
            expect(isDuration({value : 'string', unit : TimeUnit.DAYS})).toBe(false);
            expect(isDuration({value : undefined, unit : TimeUnit.DAYS})).toBe(false);
        });

        it('should return false if unit is not TimeUnit', () => {
            expect(isDuration({})).toBe(false);
            expect(isDuration({unit : 'string'})).toBe(false);
            expect(isDuration({unit : undefined})).toBe(false);
            expect(isDuration({unit : 4})).toBe(false);

            expect(isDuration({value : 1})).toBe(false);
            expect(isDuration({unit : 'string', value : 1})).toBe(false);
            expect(isDuration({unit : undefined, value : 1})).toBe(false);
            expect(isDuration({unit : 5, value : 1})).toBe(false);
        });

        it('should return true if the object is a valid Duration object', () => {
            expect(isDuration({unit : TimeUnit.DAYS, value : 5})).toBe(true);
            expect(isDuration({unit : TimeUnit.HOURS, value : 5})).toBe(true);
            expect(isDuration({unit : TimeUnit.MINUTES, value : 5})).toBe(true);
            expect(isDuration({unit : TimeUnit.MONTHS, value : 5})).toBe(true);
            expect(isDuration({unit : TimeUnit.SECONDS, value : 5})).toBe(true);
        });

    });
});