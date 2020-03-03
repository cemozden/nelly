import { generateCronPattern } from "./CronPatternGenerator";
import { TimeUnit } from "../time/TimeUnit";
import Duration from "../time/Duration";
import { validate } from "node-cron";

describe('CronPatternGenerator', () => {
    describe('#generateCronPattern(feedConfig : FeedConfig)', () => {

        it('should generate seconds pattern correctly', () => {
            const duration : Duration = { unit : TimeUnit.SECONDS, value : 10 };
            const pattern = generateCronPattern(duration);

            expect(pattern).toEqual('*/10 * * * * *');
            expect(validate(pattern)).toBe(true);
        });

        it('should generate minutes pattern correctly', () => {
            const duration : Duration = { unit : TimeUnit.MINUTES, value : 2 };
            const pattern = generateCronPattern(duration);

            expect(pattern).toEqual('*/2 * * * *');
            expect(validate(pattern)).toBe(true);
        });

        it('should generate hours pattern correctly', () => {
            const duration : Duration = { unit : TimeUnit.HOURS, value : 1 };
            const pattern = generateCronPattern(duration);

            expect(pattern).toEqual('* */1 * * *');
            expect(validate(pattern)).toBe(true);
        });

        it('should generate days pattern correctly', () => {
            const duration : Duration = { unit : TimeUnit.DAYS, value : 1 };
            const pattern = generateCronPattern(duration);

            expect(pattern).toEqual('* * */1 * *');
            expect(validate(pattern)).toBe(true);
        });

        it('should generate months pattern correctly', () => {
            const duration : Duration = { unit : TimeUnit.MONTHS, value : 1 };
            const pattern = generateCronPattern(duration);

            expect(pattern).toEqual('* * * */1 *');
            expect(validate(pattern)).toBe(true);
        });

    });
});