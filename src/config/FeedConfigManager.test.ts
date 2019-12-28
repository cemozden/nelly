import { join, sep } from "path";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { sync } from "rimraf";
import JSONFeedConfigManager from "./JSONFeedConfigManager";
import { FeedCategory, FeedConfig, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError, DEFAULT_ROOT_CATEGORY, NotExistFeedCategoryError, InvalidFeedCategoryIdError} from "./FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";
import { isFeedConfig, feedCategoryExist, categoryIdExist } from "./ConfigUtil";

describe('FeedManager', () => {
    const tmpFeedsFolder = join(process.env.CONFIG_DIR as string, 'feeds/');

    beforeAll(() => {
        sync(tmpFeedsFolder);
    });

    describe('JSONFeedManager', () => {

        it('should create "feeds" folder if feeds folder does not exist', () => {
            sync(tmpFeedsFolder);
            expect(existsSync(tmpFeedsFolder)).toBe(false);

            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            expect(existsSync(tmpFeedsFolder)).toBe(true);
        });

        it('should initialize the feed config list empty if there is no configuration file', () => {
            // Delete feed config files before creating the JSONFeedConfigManager object.
            if (existsSync(tmpFeedsFolder)) 
                readdirSync(tmpFeedsFolder)
                    .filter(fileName => fileName.match('[a-zA-Z0-9]{8}\.json'))
                    .forEach(f => sync(`${tmpFeedsFolder}${sep}${f}`));
            

            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

            expect(feedConfigManager.getFeedConfigCount()).toBe(0);
        });

        it('should load the feed configurations into the feed configuration list if any exist', () => {
            const feedId = 'eb4d45b1';

            const feedConfig : FeedConfig = {
                categoryId : '',
                enabled : true,
                feedId : feedId,
                fetchPeriod : {value : 5, unit : TimeUnit.MINUTES},
                name : 'Test Feed',
                url : 'https://example.com'
            };

            if (!existsSync(tmpFeedsFolder)) 
                mkdirSync(tmpFeedsFolder);
            
            writeFileSync(`${tmpFeedsFolder}${sep}${feedId}.json`, JSON.stringify(feedConfig));
            
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            expect(feedConfigManager.getFeedConfigCount()).toBeGreaterThan(0);
        });

        it('should initialize the feed category list if categories.json is not existing', () => {
            const categoryJsonFilePath = `${tmpFeedsFolder}${sep}category.json`;
            sync(categoryJsonFilePath);

            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            expect(existsSync(categoryJsonFilePath)).toBe(true);

            const rootCategoryFromFile : FeedCategory = JSON.parse(readFileSync(categoryJsonFilePath).toString());            
            expect(feedConfigManager.getRootCategory()).toEqual(rootCategoryFromFile);
            expect(feedConfigManager.getRootCategory()).toEqual(DEFAULT_ROOT_CATEGORY);
        });
       
        describe('#addFeedConfig(feed : FeedConfig)', () => {
            
            it('should create the feed config file in the specific category folder', () => {
                const feedId = 'eb4d45b5';
                const configFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;  
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedConfig : FeedConfig = {
                    feedId : feedId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const addFeedPromise = feedConfigManager.addFeedConfig(feedConfig);
                
                return addFeedPromise.then(feedConfigAdded => {
                    expect(existsSync(configFilePath)).toBe(true);
                    expect(feedConfigAdded).toEqual(true);
                });

            });

            it('should not allow to add a feed config if feed config id is already existing', async () => {
                const feedConfigId = '12345678';
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
                
                const feedConfig : FeedConfig = {
                    feedId : feedConfigId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const firstFeedAdded = await feedConfigManager.addFeedConfig(feedConfig);
                expect(firstFeedAdded).toBe(true);

                return expect(feedConfigManager.addFeedConfig(feedConfig)).rejects.toThrowError(new NotUniqueFeedConfigIdError(`The feed config id is not unique. There is already a feed config which has the same feed config id ${feedConfigId}`));
            });

            it('should add the feed into the feeds config list', () => {
                
                const feedId = 'ab4d45b1';
                
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feed : FeedConfig = {
                    feedId : feedId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const feedConfigCount = feedConfigManager.getFeedConfigCount();
                const addFeedPromise = feedConfigManager.addFeedConfig(feed);
                
                return addFeedPromise.then(feedAdded => {
                    expect(feedAdded).toBe(true);
                    expect(feedConfigManager.getFeedConfigCount()).toEqual(feedConfigCount + 1);
                });
            });
        });

        describe('#updateFeedConfig(feedId : string, feed: FeedConfig)', () => {
            it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
                const feedToBeAdded : FeedConfig = {
                    feedId : 'notexist',
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAdded);
                expect(feedConfigAdded).toBe(true);

                const invalidFeedId = '11111111';
                return expect(feedConfigManager.updateFeedConfig(invalidFeedId, feedToBeAdded)).rejects.toThrowError(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${invalidFeedId}".`));
        });

        it('should update the updated feed config in the feed config list', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedToBeAddedUpdated : FeedConfig = {
                feedId : 'xxxxxxxx',
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAddedUpdated);

            expect(feedConfigAdded).toBe(true);
            feedToBeAddedUpdated.name = 'Updated RSS Config';

            const feedConfigUpdated = await feedConfigManager.updateFeedConfig('xxxxxxxx', feedToBeAddedUpdated);
            expect(feedConfigUpdated).toBe(true);

            const updatedFeed = feedConfigManager.getFeedConfig(feedToBeAddedUpdated.feedId);
            expect(updatedFeed === feedToBeAddedUpdated);
        });

        it('should update the feed config file with the new values', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xaxxxxxx';

            const feedToBeAddedUpdated : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAddedUpdated);
            
            expect(feedConfigAdded).toBe(true);
            feedToBeAddedUpdated.name = 'Updated RSS Config';

            const feedConfigUpdated = await feedConfigManager.updateFeedConfig(feedId, feedToBeAddedUpdated);
            expect(feedConfigUpdated).toBe(true);
            
            const updatedFeedConfigFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;
            const updatedFeedConfigFromFile = JSON.parse(readFileSync(updatedFeedConfigFilePath).toString());
            
            expect(updatedFeedConfigFromFile).toEqual(feedToBeAddedUpdated);
        });
    });

    describe('#deleteFeedConfig(feedId : string)', () => {
        it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedToBeAdded : FeedConfig = {
                    feedId : 'xbxxxxxx',
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAdded);
            
            expect(feedConfigAdded).toBe(true);

            const invalidFeedId = '11111111';
            return expect(feedConfigManager.deleteFeedConfig(invalidFeedId)).rejects.toThrowError(new InvalidFeedConfigIdError(`Deletion failed. There is no feed config with the id "${invalidFeedId}".`));
        });

        it('should remove the feed config from the feed config list', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xcxxxxxx';

            const feedToBeAddedDeleted : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAddedDeleted);
            expect(feedConfigAdded).toBe(true);

            const feedConfigDeleted = await feedConfigManager.deleteFeedConfig(feedId);
            
            expect(feedConfigDeleted).toBe(true);
            expect(feedConfigManager.getFeedConfig(feedId)).toBeNull();
        });

        it('should delete the feed config file', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xdxxxxxx';
 
            const feedToBeAddedDeleted : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAddedDeleted);
            expect(feedConfigAdded).toBe(true);

            const feedConfigDeleted = await feedConfigManager.deleteFeedConfig(feedId);
            const deletedFileConfigFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;
            
            expect(feedConfigDeleted).toBe(true);
            expect(existsSync(deletedFileConfigFilePath)).toBe(false);
        });

    });

    describe('#addFeedCategory(feedCategory : FeedCategory)', () => {
        const categoryJsonFilePath = `${tmpFeedsFolder}${sep}category.json`;

        it('should allow adding categories only if parent category exist in the category tree', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

            const dummyParentCategory : FeedCategory = {
                categoryId : 'not_exist_parent_category_1',
                childCategories : [],
                name : 'Dummy Parent Category',
                visible : true
            };

            const categoryToAdd : FeedCategory = {
                categoryId : 'newCategoryId_1',
                childCategories : [],
                name : 'New Category',
                visible : true
            }

            return expect(feedConfigManager.addFeedCategory(categoryToAdd, dummyParentCategory)).rejects.toThrowError(new NotExistFeedCategoryError(`The feed category provided is not existing the category tree!`));
        });

        it('should add the feed into the child category list of its parent', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '1234567890',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const categoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory());
            
            expect(categoryAdded).toBe(true);
            expect(feedConfigManager.getRootCategory().childCategories).toContain(newFeedCategory);
        });

        it('should write the added category into the "category.json" file', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '1234567895',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);
            expect(existsSync(categoryJsonFilePath)).toBe(true);
            
            const categoriesFromFile : FeedCategory = JSON.parse(readFileSync(categoryJsonFilePath).toString());
            expect(categoriesFromFile).toEqual(feedConfigManager.getRootCategory());
        });

        it('should not allow to add a feed category if category id is already existing', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '1234567890',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            return expect(feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory())).rejects.toThrowError(new InvalidFeedCategoryIdError(`The feed category id "${newFeedCategory.categoryId}" is already existing in the category tree!`));
        });

    });

    describe.skip('#updateFeedCategory(feedCategory : FeedCategory)', () => {

    });

    describe.skip('#deleteFeedCategory(feedCategory : FeedCategory)', () => {

    });

  });

});