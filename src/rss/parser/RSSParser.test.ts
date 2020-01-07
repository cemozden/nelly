import RSS20Parser from "./RSS20Parser";

describe('RSSParser', () => {
    describe('RSS20Parser', () => {
        let rssObject : any = null;

        beforeAll(() => {
            rssObject = {
                rss : { 
                    $ : {
                        version : '2.0'
                    },
                    channel : { 
                        title : 'BBC News - Home',
                        link : 'https://www.bbc.co.uk/news/',
                        description : 'BBC News - Home'
                    },
                    item : [{
                        title : 'Example title 1'
                    },
                    {
                        title : 'Example title 2',
                        description : 'Example Description 2'
                    }]
                }
            };
        });

        describe('#parseRSS(rssString: string)', () => {
            it('should initialize title, link and description values of the feed', async () => {
                const rssParser = new RSS20Parser();

                const parsedRSS =  await rssParser.parseRSS(rssObject);

                expect(parsedRSS.feedMetadata.title).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.link).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.description).not.toBeUndefined();
            });
        });
    });
});