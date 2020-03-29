import RSS20Parser from "./RSS20Parser";
import { crc32 } from "crc";

describe('RSSParser', () => {
    describe('RSS20Parser', () => {
        let rssObject : any = null;

        beforeAll(() => {
            rssObject = {
                rss : { 
                    $ : {
                        version : '2.0',
                        'xmlns:dc' : 'http://purl.org/dc/elements/1.1/'
                    },
                    channel : { 
                        title : 'BBC News - Home',
                        link : 'https://www.bbc.co.uk/news/',
                        description : 'BBC News - Home'
                    }
                }
            };
        });

        describe('#parseRSS(rssString: string)', () => {

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

            it('should initialize avaiable namespaces', () => {
                const rssParser = new RSS20Parser();

                const parsedRSS = rssParser.parseRSS(rssObject);

                expect(parsedRSS.namespaces).toEqual(['dc']);
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

            it('should generate feed item according to guid if exist', () => {
                const rssParser = new RSS20Parser();
                const guidUrl = 'https://example.com/';

                rssObject.rss.channel.item = {
                    title : 'Example title 1',
                    description : 'Example description 1',
                    link : 'https://link.com',
                    author : 'test@test.com',
                    comments : 'https://example.com',
                    pubDate : 'Wed, 01 Jan 2020 01:00:47 GMT',
                    enclosure : {
                        $ : {
                            url : 'https://example.com',
                            length : 12216320,
                            type : 'audio/mpeg'
                        }
                    },
                    guid : {
                        _: guidUrl,
                        $ : {
                          "isPermaLink": "true"
                        }
                    },
                    source : {
                        _: "Example Source",
                        $ : {
                          "url": "https://example.com/"
                        }
                    }
                };

                const feed = rssParser.parseRSS(rssObject);
                
                expect(feed.items[0].itemId).toEqual(crc32(guidUrl).toString(16));
            });

            it('should fetch feed items as an array of feed items', () => {
                const rssParser = new RSS20Parser();

                rssObject.rss.channel.item = {
                    title : 'Example title 1',
                    description : 'Example description 1'
                };

                let feed = rssParser.parseRSS(rssObject);

                expect(feed.items.length).toBe(1);
                expect(feed.items[0]).not.toBeUndefined();
                expect(feed.items[0].itemId).not.toBeUndefined();
                expect(feed.items[0].title).toEqual(rssObject.rss.channel.item.title);
                expect(feed.items[0].description).toEqual(rssObject.rss.channel.item.description);

                rssObject.rss.channel.item = [{
                        title : 'Example title 1',
                        description : 'Example description 1'
                    },
                    {
                        title : 'Example title 2',
                        description : 'Example description 2'
                    }
                ];

                feed = rssParser.parseRSS(rssObject);

                expect(feed.items.length).toBe(2);
                expect(feed.items[0]).not.toBeUndefined();
                expect(feed.items[0].itemId).not.toBeUndefined();
                expect(feed.items[0].title).toEqual(rssObject.rss.channel.item[0].title);
                expect(feed.items[0].description).toEqual(rssObject.rss.channel.item[0].description);
                expect(feed.items[1]).not.toBeUndefined();
                expect(feed.items[1].itemId).not.toBeUndefined();
                expect(feed.items[1].title).toEqual(rssObject.rss.channel.item[1].title);
                expect(feed.items[1].description).toEqual(rssObject.rss.channel.item[1].description);
            });

            it('should initialize feed item categories correctly', () => {
                const rssParser = new RSS20Parser();

                rssObject.rss.channel.item = {
                    title : 'Example title 1',
                    description : 'Example description 1',
                    category : ['news', 'sport']
                };

                let feed = rssParser.parseRSS(rssObject);

                expect(feed.items[0].category).not.toBeUndefined();
                expect(feed.items[0].category).toEqual(rssObject.rss.channel.item.category);

                rssObject.rss.channel.item.category = 'news';

                feed = rssParser.parseRSS(rssObject);

                expect(feed.items[0].category).not.toBeUndefined();
                expect(feed.items[0].category).toEqual([rssObject.rss.channel.item.category]);
            });

            it('should initialize optional elements of feed items', () => {
                const rssParser = new RSS20Parser();

                rssObject.rss.channel.item = {
                    title : 'Example title 1',
                    description : 'Example description 1',
                    link : 'https://link.com',
                    author : 'test@test.com',
                    comments : 'https://example.com',
                    pubDate : 'Wed, 01 Jan 2020 01:00:47 GMT',
                    enclosure : {
                        $ : {
                            url : 'https://example.com',
                            length : 12216320,
                            type : 'audio/mpeg'
                        }
                    },
                    guid : {
                        _: "https://example.com/",
                        $ : {
                          "isPermaLink": "true"
                        }
                    },
                    source : {
                        _: "Example Source",
                        $ : {
                          "url": "https://example.com/"
                        }
                    }
                };

                const feed = rssParser.parseRSS(rssObject);
                const feedItem = feed.items[0];

                expect(feedItem.link).not.toBeUndefined();
                expect(feedItem.link).toEqual(rssObject.rss.channel.item.link);
                expect(feedItem.author).not.toBeUndefined();
                expect(feedItem.author).toEqual(rssObject.rss.channel.item.author);
                expect(feedItem.comments).not.toBeUndefined();
                expect(feedItem.comments).toEqual(rssObject.rss.channel.item.comments);
                expect(feedItem.pubDate).not.toBeUndefined();
                expect(feedItem.pubDate).toEqual(new Date(rssObject.rss.channel.item.pubDate));
                expect(feedItem.enclosure).not.toBeUndefined();
                expect(feedItem.enclosure).toEqual(rssObject.rss.channel.item.enclosure.$);
                expect(feedItem.guid).not.toBeUndefined();
                expect(feedItem.guid).toEqual({ value : 'https://example.com/', permaLink : true });
                expect(feedItem.source).not.toBeUndefined();
                expect(feedItem.source).toEqual({ url : 'https://example.com/', value : 'Example Source' });
            });

            it('should generate dc namespace if available', () => {
                const rssParser = new RSS20Parser();

                rssObject.rss.channel.item = {
                    title : 'Example title 1',
                    description : 'Example description 1',
                    link : 'https://link.com',
                    author : 'test@test.com',
                    comments : 'https://example.com',
                    pubDate : 'Wed, 01 Jan 2020 01:00:47 GMT',
                    'dc:creator' : 'A creator',
                    enclosure : {
                        $ : {
                            url : 'https://example.com',
                            length : 12216320,
                            type : 'audio/mpeg'
                        }
                    },
                    guid : {
                        _: "https://example.com/",
                        $ : {
                          "isPermaLink": "true"
                        }
                    },
                    source : {
                        _: "Example Source",
                        $ : {
                          "url": "https://example.com/"
                        }
                    }
                };

                const feed = rssParser.parseRSS(rssObject);

                expect(feed.items[0]._NS_DC.creator).toBe(rssObject.rss.channel.item['dc:creator']);
                expect(feed.items[0]._NS_DC.description).toBeUndefined();
            });


        });
    });
});