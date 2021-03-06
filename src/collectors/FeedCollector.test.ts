import { collectFeed, FeedFetchError } from "./FeedCollector";
import { FeedConfig } from "../config/FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";

describe.skip('FeedCollector', () => {
    describe('#collectFeed(feedConfig : FeedConfig)', () => {
        const feedConfig : FeedConfig = {
            categoryId : '987654321',
            enabled : true,
            feedConfigId : '123456789',
            fetchPeriod : {unit : TimeUnit.SECONDS, value : 30},
            name : 'Gizmodo',
            url : 'https://gizmodo.com/rss',
            notifyUser : false
        };

        it('should reject with an error if no internet connection is available', () => {  
            feedConfig.url = 'http://unavaiable_address.com';
            
            return expect(collectFeed(feedConfig, [])).rejects
                .toThrowError(new FeedFetchError(`Unable to fetch the feed. (${feedConfig.url}) Please check that there is an stable internet connection available or the feed source URL "${feedConfig.url}" is valid.`));
        });

        it('should reject with an error if no internet connection is available', () => {  
            feedConfig.url = 'unavaiable_address.com';
            
            return expect(collectFeed(feedConfig, [])).rejects.toThrow();
        });

        it('should reject with an error if the response body is not an XML content', () => {
            feedConfig.url = 'https://github.com/cemozden/nelly/archive/master.zip';
            
            return expect(collectFeed(feedConfig, [])).rejects.toThrow();
        });

        it('should resolve with a valid value', () => {
            feedConfig.url = 'https://gizmodo.com/rss';
            
            return expect(collectFeed(feedConfig, [])).resolves.not.toBeUndefined();
        });

    });
});