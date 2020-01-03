import RSSParserFactory from "./RSSParserFactory";
import { RSSParserError } from "./RSSParser";
import RSS20Parser from "./RSS20Parser";

describe('RSSParserFactory', () => {
    describe('static #generateRSSParser(rssObject : any)', () => {
        it('should throw an RSSParserError if the given source is not a valid RSS specification', () => {
            const rssObject = {
                invalidParam1 : false
            };

            expect(() => {
                RSSParserFactory.generateRSSParser(rssObject);
            }).toThrowError(new RSSParserError('Given RSS source is not a RSS specification defined in Nelly.'));

        });

        it('should give an RSS Parser for RSS 2.0 specification if rss object is valid for RSS 2.0 Specification', () => {
            const rssObject = {
                rss : { 
                    $ : {
                        version : '2.0'
                    },
                    channel : { 
                        title : 'Example Title',
                        link : 'Example link',
                        description : 'Example description'
                    }
                }
            };

            expect(RSSParserFactory.generateRSSParser(rssObject)).toBeInstanceOf(RSS20Parser);
        });
    });
});