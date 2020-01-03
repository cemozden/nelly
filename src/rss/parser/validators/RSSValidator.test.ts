import { RSSValidationError } from "./Validator";
import RSS20Validator from "./RSS20Validator";
import { RSSVersion } from "../../specifications/RSSVersion";

describe('RSSValidator', () => {
    describe('RSS20Validator', () => {

        describe('#validate(obj : any)', () => {
            
            it('should throw an error if rss tag is not existing', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    root : 'test'
                };

                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('The RSS tag (<rss>) is not existing in the XML document!'));
            });

            it('should throw an error if channel tag does not exist in rss tag', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    rss : {
                        $ : {
                            version : '2.0'
                        },
                        param1 : 'value1'}
                };

                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('Channel tag <channel> does not exist between <rss> tags!'));
            });

            it('should throw an error if title tag does not exist in the channel tag', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            param1 : 'value1'
                        } 
                    }
                };

                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('Title tag <title> does not exist between <channel> tags!'));
            });

            it('should throw an error if link tag does not exist in the channel tag', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            description : 'Example Description'
                        } 
                    }
                };

                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('Link tag <link> does not exist between <channel> tags!'));
            });

            it('should throw an error if description tag does not exist in the channel tag', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link'
                        } 
                    }
                };

                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('Description tag <description> does not exist between <channel> tags!'));
            });

            it('should throw an error if item tags don\'t have either title or description tag', () => {
                const rssValidator = new RSS20Validator();
                const rssObject1 = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link',
                            description : 'Example description'
                        },
                        item : [{
                            title : 'Example title 1'
                        },
                        {
                            description : 'Example title 2'
                        },
                        {
                            invalidTag : 'Invalid Value'
                        }]
                    }
                };

                const rssObject2 = {
                    rss : {
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link',
                            description : 'Example description'
                        },
                        item : {
                            invalidTag : 'Invalid Value'
                        }
                    }
                };

                expect(() => rssValidator.validate(rssObject1)).toThrowError(new RSSValidationError('Neither title nor description tags exist in one of the item list. Item Index: 2'));
                expect(() => rssValidator.validate(rssObject2)).toThrowError(new RSSValidationError('The item tag must have either title or description tag!'));
            });

            it('should thrown an error if the version attribute of rss tag is missing', () => {
                const rssValidator = new RSS20Validator();
                const rssObject = {
                    rss : {
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link',
                            description : 'Example description'
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
                expect(() => rssValidator.validate(rssObject)).toThrowError(new RSSValidationError('The version attribute of rss tag is missing!'));
            });

            it('should return "RSS_20" version if validation succeeds', () => {
                const rssValidator = new RSS20Validator();
                const rssObject1 = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link',
                            description : 'Example description'
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

                const rssObject2 = {
                    rss : { 
                        $ : {
                            version : '2.0'
                        },
                        channel : { 
                            title : 'Example Title',
                            link : 'Example link',
                            description : 'Example description'
                        },
                        item : {
                            title : 'Example title'
                        }
                    }
                };

                expect(rssValidator.validate(rssObject1)).toBe(RSSVersion.RSS_20);
                expect(rssValidator.validate(rssObject2)).toBe(RSSVersion.RSS_20);
            });

        });

    });
});