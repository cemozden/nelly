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

            it('should create feed id from title, link and description info of the feed', () => {
                const rssParser = new RSS20Parser();

                const parsedRSS = rssParser.parseRSS(rssObject);

                expect(parsedRSS.feedId).not.toBeUndefined();
                expect(parsedRSS.feedId).not.toBeNull();
            });

            it('should initialize title, link and description values of the feed', () => {
                const rssParser = new RSS20Parser();

                const parsedRSS = rssParser.parseRSS(rssObject);

                expect(parsedRSS.feedMetadata.title).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.link).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.description).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.title).not.toBeNull();
                expect(parsedRSS.feedMetadata.link).not.toBeNull();
                expect(parsedRSS.feedMetadata.description).not.toBeNull();
            });

            it('should fetch feed categories correctly', () => {
                const rssParser = new RSS20Parser();

                // Check for more than 1 category case.
                rssObject.rss.channel.category = ['news', 'sport'];

                let parsedRSS = rssParser.parseRSS(rssObject);

                expect(parsedRSS.feedMetadata.category).toEqual(rssObject.rss.channel.category);
                
                // Check for only 1 category.
                rssObject.rss.channel.category = 'news';
                parsedRSS = rssParser.parseRSS(rssObject);
                expect(parsedRSS.feedMetadata.category).toEqual(['news']);
                
                rssObject.rss.channel.category = undefined;
            });

            it('should initialize optional elements of channel tag correctly', () => {
                const rssParser = new RSS20Parser();
                
                rssObject.rss.channel.language = 'en-gb';
                rssObject.rss.channel.copyright = 'Copyright: (C) British Broadcasting Corporation, see http://news.bbc.co.uk/2/hi/help/rss/4498287.stm for terms and conditions of reuse.';
                rssObject.rss.channel.managingEditor = 'geo@herald.com (George Matesky)';
                rssObject.rss.channel.webMaster = 'geo@herald.com (George Matesky)';
                rssObject.rss.channel.pubDate = 'Tue, 07 Jan 2020 00:00:01 GMT';
                rssObject.rss.channel.lastBuildDate = 'Tue, 07 Jan 2020 00:00:01 GMT';
                rssObject.rss.channel.generator = 'RSS for Node';
                rssObject.rss.channel.docs = 'http://blogs.law.harvard.edu/tech/rss';
                rssObject.rss.channel.cloud = {
                    $ : {
                        domain : 'rpc.sys.com',
                        port : 80,
                        path : '/RPC2',
                        registerProcedure : 'myCloud.rssPleaseNotify',
                        protocol : 'xml-rpc'
                    }
                };
                rssObject.rss.channel.ttl = '15';
                rssObject.rss.channel.rating = '1.1';
                rssObject.rss.channel.skipHours = '5';
                rssObject.rss.channel.skipDays = '5';
                rssObject.rss.channel.image = {
                    url: "https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif",
                    title: "BBC News - Home",
                    link: "https://www.bbc.co.uk/news/",
                    width : 100,
                    height : 50
                };
                rssObject.rss.channel.textInput = {
                    title: "TextInput title",
                    description : "Text Input description",
                    name : 'Text Input Name',
                    link : 'https://link.com'
                };

                const parsedRSS = rssParser.parseRSS(rssObject);

                expect(parsedRSS.feedMetadata.language).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.language).toBe(rssObject.rss.channel.language);
                expect(parsedRSS.feedMetadata.copyright).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.copyright).toBe(rssObject.rss.channel.copyright);
                expect(parsedRSS.feedMetadata.managingEditor).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.managingEditor).toBe(rssObject.rss.channel.managingEditor);
                expect(parsedRSS.feedMetadata.webMaster).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.webMaster).toBe(rssObject.rss.channel.webMaster);
                expect(parsedRSS.feedMetadata.pubDate).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.pubDate).toEqual(new Date(rssObject.rss.channel.pubDate));
                expect(parsedRSS.feedMetadata.lastBuildDate).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.lastBuildDate).toEqual(new Date(rssObject.rss.channel.lastBuildDate));
                expect(parsedRSS.feedMetadata.docs).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.docs).toBe(rssObject.rss.channel.docs);
                expect(parsedRSS.feedMetadata.cloud).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.cloud).toEqual(rssObject.rss.channel.cloud.$);
                expect(parsedRSS.feedMetadata.ttl).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.ttl).toBe(rssObject.rss.channel.ttl);
                expect(parsedRSS.feedMetadata.rating).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.rating).toBe(rssObject.rss.channel.rating);
                expect(parsedRSS.feedMetadata.skipDays).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.skipDays).toBe(rssObject.rss.channel.skipDays);
                expect(parsedRSS.feedMetadata.skipHours).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.skipHours).toBe(rssObject.rss.channel.skipHours);
                expect(parsedRSS.feedMetadata.image).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.image).toEqual(rssObject.rss.channel.image);
                expect(parsedRSS.feedMetadata.textInput).not.toBeUndefined();
                expect(parsedRSS.feedMetadata.textInput).toEqual(rssObject.rss.channel.textInput);

                rssObject.rss.channel.language = undefined;
                rssObject.rss.channel.copyright = undefined;
                rssObject.rss.channel.managingEditor = undefined;
                rssObject.rss.channel.webMaster = undefined;
                rssObject.rss.channel.pubDate = undefined;
                rssObject.rss.channel.lastBuildDate = undefined;
                rssObject.rss.channel.generator = undefined;
                rssObject.rss.channel.docs = undefined;
                rssObject.rss.channel.cloud = undefined;
                rssObject.rss.channel.ttl = undefined;
                rssObject.rss.channel.ttl = undefined;
                rssObject.rss.channel.rating = undefined;
                rssObject.rss.channel.skipHours = undefined;
                rssObject.rss.channel.skipDays = undefined;
                rssObject.rss.channel.image =  undefined;
                rssObject.rss.channel.textInput =  undefined;
            });
        });
    });
});