import { join, sep } from "path";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { sync } from "rimraf";
import JSONFeedConfigManager from "./JSONFeedConfigManager";
import { FeedCategory, FeedConfig, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError, DEFAULT_ROOT_CATEGORY, NotExistFeedCategoryError, InvalidFeedCategoryIdError, InvalidFeedCategoryError} from "./FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";
import { feedCategoryExist } from "./ConfigUtil";

describe('FeedManager', () => {
    const tmpFeedsFolder = join(process.env.CONFIG_DIR as string, 'feeds/');

    beforeAll(() => {
        sync(tmpFeedsFolder);
    });

    describe('JSONFeedManager', () => {

        const categoryJSONFilePath = `${tmpFeedsFolder}${sep}category.json`;

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
            sync(categoryJSONFilePath);

            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            expect(existsSync(categoryJSONFilePath)).toBe(true);

            const rootCategoryFromFile : FeedCategory = JSON.parse(readFileSync(categoryJSONFilePath).toString());            
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
            expect(existsSync(categoryJSONFilePath)).toBe(true);
            
            const categoriesFromFile : FeedCategory = JSON.parse(readFileSync(categoryJSONFilePath).toString());
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

    describe('#updateFeedCategory(newFeedCategory : FeedCategory, oldFeedCategory : FeedCategory)', () => {
        it('should not allow to update, if oldFeedCategory does not exist in the category tree', () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

            const notExistCategory : FeedCategory = {
                categoryId : '1234467895',
                childCategories : [],
                name : 'Blogs_1',
                visible : true
            };

            const newUpdatedFeedCategory : FeedCategory = {
                categoryId : '1234467895',
                childCategories : [],
                name : 'Blogs_2',
                visible : true
            };
 
            return expect(feedConfigManager.updateFeedCategory(newUpdatedFeedCategory, notExistCategory)).rejects.toThrowError(new NotExistFeedCategoryError(`The feed category to be updated is not existing in the category tree!`));
        });

        it('should not allow to update, if newFeedCategory contains category id that is already defined in the category tree', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '1235567895',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const updatedFeedCategory : FeedCategory = {
                categoryId : 'root',
                childCategories : [],
                name : 'Blogs_123',
                visible : true
            }; 

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);

            return expect(feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory)).rejects.toThrowError(new InvalidFeedCategoryIdError(`The updated feed category has a category id which is already existing in the category tree!`));
        });

        it('should write the category tree into the category.json file after update is successful', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '6235567895',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const updatedFeedCategory : FeedCategory = {
                categoryId : '12345678__',
                childCategories : [],
                name : 'Blogs_12345',
                visible : false
            }; 

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);

            const feedCategoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory);
            expect(feedCategoryUpdated).toBe(true);

            const categoriesFromFile : FeedCategory = JSON.parse(readFileSync(categoryJSONFilePath).toString());

            expect(categoriesFromFile).toEqual(feedConfigManager.getRootCategory());
        });

        it('should update succesfully if all validations succeed', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '5235567895',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const updatedFeedCategory : FeedCategory = {
                categoryId : '__123456789',
                childCategories : [],
                name : 'Blogs_123',
                visible : true
            };

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);

            const feedCategoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory);
            expect(feedCategoryUpdated).toBe(true);
            expect(feedCategoryExist(updatedFeedCategory, feedConfigManager.getRootCategory())).not.toBeNull();
        });

    });

    describe('#deleteFeedCategory(feedCategory : FeedCategory)', () => {
        
        it('should not delete the root category', () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            return expect(feedConfigManager.deleteFeedCategory(feedConfigManager.getRootCategory())).rejects.toThrowError(new InvalidFeedCategoryError(`The root category cannot be deleted!`));
        });

        it('should not delete a feed category which is not existing', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const notExistFeedCategory : FeedCategory = {
                categoryId : 'xx123',
                childCategories : [],
                name : 'xx123456',
                visible : true
            }; 
            const feedDeleted = await feedConfigManager.deleteFeedCategory(notExistFeedCategory);

            expect(feedDeleted).toBe(false);
        });

        it('should write to the category.json file after deletion succeeds', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '5a35567895',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);

            const feedDeleted = await feedConfigManager.deleteFeedCategory(newFeedCategory);
            expect(feedDeleted).toBe(true);

            const categoriesFromFile : FeedCategory = JSON.parse(readFileSync(categoryJSONFilePath).toString());
            expect(categoriesFromFile).toEqual(feedConfigManager.getRootCategory());

        });

        it('should delete the feed category successfully if the category exist', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '5a35az7895',
                childCategories : [],
                name : 'Blogs_123',
                visible : true
            };

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory()); 
            expect(feedCategoryAdded).toBe(true);

            const feedDeleted = await feedConfigManager.deleteFeedCategory(newFeedCategory);
            expect(feedDeleted).toBe(true);

            expect(feedCategoryExist(newFeedCategory, feedConfigManager.getRootCategory())).toBeNull();
        });

    });

  });

});