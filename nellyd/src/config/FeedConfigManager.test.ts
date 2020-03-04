import { join, sep } from "path";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { sync } from "rimraf";
import JSONFeedConfigManager from "./JSONFeedConfigManager";
import { FeedCategory, FeedConfig, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError, DEFAULT_ROOT_CATEGORY, NotExistFeedCategoryError, InvalidFeedCategoryIdError, InvalidFeedCategoryError, feedCategoryExist, InvalidFeedConfigError} from "./FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";

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
            sync(tmpFeedsFolder);
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

        it('should throw an error if all feed configurations do not have unique ids', () => {
            if (!existsSync(tmpFeedsFolder)) 
                mkdirSync(tmpFeedsFolder);
            const feedId = 'aabbccdd';

                const feedConfig1 : FeedConfig = {
                    categoryId : '',
                    enabled : true,
                    feedConfigId : feedId,
                    fetchPeriod : {value : 5, unit : TimeUnit.MINUTES},
                    name : 'Test Feed',
                    url : 'https://examplea.com'
                };

                const feedConfig2 : FeedConfig = {
                    categoryId : '',
                    enabled : true,
                    feedConfigId : feedId,
                    fetchPeriod : {value : 5, unit : TimeUnit.MINUTES},
                    name : 'Test Feed',
                    url : 'https://exampleb.com'
                };

                writeFileSync(`${tmpFeedsFolder}${sep}${feedId}.json`, JSON.stringify(feedConfig1));
                writeFileSync(`${tmpFeedsFolder}${sep}aabbccee.json`, JSON.stringify(feedConfig2));

                expect(() => { new JSONFeedConfigManager(tmpFeedsFolder); }).toThrowError(new NotUniqueFeedConfigIdError('Unable to load feed configurations. All feed configurations must have unique ids!'));

                sync(`${tmpFeedsFolder}${sep}${feedId}.json`);
                sync(`${tmpFeedsFolder}${sep}aabbccee.json`);

        });

        it('should load the feed configurations into the feed configuration list if any exist', () => {
            const feedId = 'eb4d45b1';

            const feedConfig : FeedConfig = {
                categoryId : '',
                enabled : true,
                feedConfigId : feedId,
                fetchPeriod : {value : 5, unit : TimeUnit.MINUTES},
                name : 'Test Feed',
                url : 'https://examplec.com'
            };

            if (!existsSync(tmpFeedsFolder)) 
                mkdirSync(tmpFeedsFolder);
            const filePath = `${tmpFeedsFolder}${sep}${feedId}.json`;
            writeFileSync(filePath, JSON.stringify(feedConfig));
            
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            expect(feedConfigManager.getFeedConfigCount()).toBeGreaterThan(0);
            sync(filePath);
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

            afterAll(() => {
                sync(`${tmpFeedsFolder}${sep}p23h69rt.json`);
                sync(`${tmpFeedsFolder}${sep}p23h69ra.json`);
            });
            
            it('should create the feed config file in the specific category folder', () => {
                const feedId = 'eb4d45b5';
                const configFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;  
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedConfig : FeedConfig = {
                    feedConfigId : feedId,
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example3.com',
                    enabled : true
                };

                const addFeedPromise = feedConfigManager.addFeedConfig(feedConfig);
                
                return addFeedPromise.then(feedConfigAdded => {
                    expect(existsSync(configFilePath)).toBe(true);
                    expect(feedConfigAdded).toEqual(true);
                    sync(configFilePath);
                });

            });

            it('should not allow to add a feed config if feed config id is already existing', async () => {
                const feedConfigId = '12345678';
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
                
                const feedConfig : FeedConfig = {
                    feedConfigId : feedConfigId,
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example1.com',
                    enabled : true
                };

                const firstFeedAdded = await feedConfigManager.addFeedConfig(feedConfig);
                expect(firstFeedAdded).toBe(true);

                return expect(feedConfigManager.addFeedConfig(feedConfig)).rejects.toThrowError(new NotUniqueFeedConfigIdError(`The feed config id is not unique. There is already a feed config which has the same feed config id ${feedConfigId}`));
            });

            it('should not allow to add a feed config if the given category id of the feed config does not exist', async () => {
                const feedConfigId = 'p23h69rt';
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedConfig : FeedConfig = {
                    categoryId : 'notexist',
                    enabled : true,
                    feedConfigId : feedConfigId,
                    fetchPeriod : {unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test',
                    url : 'https://example2.com'
                };

                return expect(feedConfigManager.addFeedConfig(feedConfig)).rejects.toThrowError(new InvalidFeedCategoryIdError(`The given category id "${feedConfig.categoryId}" does not exist!`));
            });

            it('should not allow to add a feed config if the given url is already existing', async () => {

                const feedConfigId = 'p23h69ra';
                const feedConfigId2 = 'p23h69rb';

                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedConfig : FeedConfig = {
                    categoryId : 'root',
                    enabled : true,
                    feedConfigId : feedConfigId,
                    fetchPeriod : {unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test',
                    url : 'https://axample.com'
                };

                const feedConfigAdded = await feedConfigManager.addFeedConfig(feedConfig);
                expect(feedConfigAdded).toBe(true);

                const feedConfig2 : FeedConfig = {
                    categoryId : 'root',
                    enabled : true,
                    feedConfigId : feedConfigId2,
                    fetchPeriod : {unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test',
                    url : 'https://axample.com'
                };


                return expect(feedConfigManager.addFeedConfig(feedConfig2)).rejects.toThrowError(new InvalidFeedConfigError(`The given URL "${feedConfig2.url}" is already existing in the system!`));

            });

            it('should add the feed into the feeds config list', () => {
                const feedId = 'ab4d45b1';
                const configFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;  
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feed : FeedConfig = {
                    feedConfigId : feedId,
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example4.com',
                    enabled : true
                };

                const feedConfigCount = feedConfigManager.getFeedConfigCount();
                const addFeedPromise = feedConfigManager.addFeedConfig(feed);
                
                return addFeedPromise.then(feedAdded => {
                    expect(feedAdded).toBe(true);
                    expect(feedConfigManager.getFeedConfigCount()).toEqual(feedConfigCount + 1);
                    sync(configFilePath);
                });
            });
        });

        describe('#updateFeedConfig(feedId : string, feed: FeedConfig)', () => {

            afterAll(() => {
                const feedConfigPath = `${tmpFeedsFolder}${sep}`;
                sync(`${feedConfigPath}${sep}notexist.json`);
                sync(`${feedConfigPath}${sep}4444444444.json`);
                sync(`${feedConfigPath}${sep}xxxxxabx.json`);
                sync(`${feedConfigPath}${sep}xaxxxxxx.json`);
            });

            it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
                const feedToBeAdded : FeedConfig = {
                    feedConfigId : 'notexist',
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example5.com',
                    enabled : true
                };

                const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAdded);
                expect(feedConfigAdded).toBe(true);

                const invalidFeedId = '11111111';
                return expect(feedConfigManager.updateFeedConfig(invalidFeedId, feedToBeAdded)).rejects.toThrowError(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${invalidFeedId}".`));
        });

            it('should not allow to update if newFeedCategory changed the category id.', async () => {
                const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedToBeAdded : FeedConfig = {
                    feedConfigId : '4444444444',
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example6.com',
                    enabled : true
                };

                const feedToBeAddedUpdated : FeedConfig = {
                    feedConfigId : '4444444445',
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example7.com',
                    enabled : true
                };

                const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAdded);
                expect(feedConfigAdded).toBe(true);

                return expect(feedConfigManager.updateFeedConfig('4444444444', feedToBeAddedUpdated)).rejects.toThrowError(new InvalidFeedConfigIdError(`The feed configuration id of a specific feed configuration cannot be updated`));

            });

        it('should update the updated feed config in the feed config list', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedConfigId = 'xxxxxabx';
            const feedToBeAddedUpdated : FeedConfig = {
                feedConfigId : feedConfigId,
                categoryId : 'root',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example8.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedToBeAddedUpdated);

            expect(feedConfigAdded).toBe(true);
            feedToBeAddedUpdated.name = 'Updated RSS Config';

            const feedConfigUpdated = await feedConfigManager.updateFeedConfig(feedConfigId, feedToBeAddedUpdated);
            expect(feedConfigUpdated).toBe(true);

            const updatedFeed = feedConfigManager.getFeedConfig(feedToBeAddedUpdated.feedConfigId);
            expect(updatedFeed === feedToBeAddedUpdated);
        });

        it('should update the feed config file with the new values', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xaxxxxxx';

            const feedToBeAddedUpdated : FeedConfig = {
                feedConfigId : feedId,
                categoryId : 'root',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example9.com',
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

        afterAll(() => {
            const feedConfigPath = `${tmpFeedsFolder}${sep}`;
            sync(`${feedConfigPath}${sep}xbxxxxxx.json`);
        });

        it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedToBeAdded : FeedConfig = {
                    feedConfigId : 'xbxxxxxx',
                    categoryId : 'root',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example10.com',
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
                feedConfigId : feedId,
                categoryId : 'root',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example11.com',
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
                feedConfigId : feedId,
                categoryId : 'root',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example12.com',
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

    describe('#feedCategoryExist(feedCategory: FeedCategory)', () => {
        it('should return true if the given parameter exist in the category tree', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
    
            const exampleFeedCategory1 : FeedCategory = {
                categoryId : 'exampleFeedCategory1_2',
                childCategories : [],
                name : 'Example Feed Category 1',
                visible : true
            };
    
            const exampleFeedCategory2 : FeedCategory = {
                categoryId : 'exampleFeedCategory2_3',
                childCategories : [],
                name : 'Example Feed Category 2',
                visible : true
            };
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory().categoryId);
            expect(feedConfig1Added).not.toBeNull();
    
            const rootFeedCategoryExist = feedCategoryExist(feedConfigManager.getRootCategory().categoryId, feedConfigManager.getRootCategory());
            expect(rootFeedCategoryExist).not.toBeNull();
            
            const exampleFeedCategoryExist = feedCategoryExist(exampleFeedCategory1.categoryId, feedConfigManager.getRootCategory());
            expect(exampleFeedCategoryExist).not.toBeNull();
    
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1.categoryId);
            expect(feedConfig2Added).not.toBeNull();
    
            const feedConfig2Exist = feedCategoryExist(exampleFeedCategory2.categoryId, feedConfigManager.getRootCategory());
            const feedConfig3Exist = feedCategoryExist(exampleFeedCategory2.categoryId, exampleFeedCategory1);
            
            expect(feedConfig2Exist).not.toBeNull();
            expect(feedConfig3Exist).not.toBeNull();
        });
    
        it('should return false if the given parameter does not exist in the category tree', () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
    
            const exampleFeedCategory3 : FeedCategory = {
                categoryId : 'exampleFeedCategory3',
                childCategories : [],
                name : 'Example Feed Category 3',
                visible : true
            };
    
            const exampleFeedCategory4 : FeedCategory = {
                categoryId : 'exampleFeedCategory4',
                childCategories : [],
                name : 'Example Feed Category 4',
                visible : true
            };
    
            const exampleFeedCategory3Exist = feedCategoryExist(exampleFeedCategory3.categoryId, feedConfigManager.getRootCategory());
            const exampleFeedCategory4Exist = feedCategoryExist(exampleFeedCategory4.categoryId, feedConfigManager.getRootCategory());
    
            expect(exampleFeedCategory3Exist).toBeNull();
            expect(exampleFeedCategory4Exist).toBeNull();
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

            return expect(feedConfigManager.addFeedCategory(categoryToAdd, dummyParentCategory.categoryId)).rejects.toThrowError(new NotExistFeedCategoryError(`The feed category provided is not existing the category tree!`));
        });

        it('should add the feed into the child category list of its parent', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : '1234567890',
                childCategories : [],
                name : 'Blogs',
                visible : true
            };

            const categoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId);
            
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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
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

            return expect(feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId)).rejects.toThrowError(new InvalidFeedCategoryIdError(`The feed category id "${newFeedCategory.categoryId}" is already existing in the category tree!`));
        });

        it('should not allow to add a feed category if the category name is empty', () => {
            
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            const newFeedCategory : FeedCategory = {
                categoryId : 'qawe1789',
                childCategories : [],
                name : '',
                visible : true
            };

            return expect(feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId)).rejects.toThrowError(new InvalidFeedCategoryError(`The category name cannot be empty!`));

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
 
            return expect(feedConfigManager.updateFeedCategory(newUpdatedFeedCategory, notExistCategory.categoryId)).rejects.toThrowError(new NotExistFeedCategoryError(`The feed category to be updated is not existing in the category tree!`));
        });

        it.skip('should not allow to update, if newFeedCategory contains category id that is already defined in the category tree', async () => {
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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
            expect(feedCategoryAdded).toBe(true);

            return expect(feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory.categoryId)).rejects.toThrowError(new InvalidFeedCategoryIdError(`The updated feed category has a category id which is already existing in the category tree!`));
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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
            expect(feedCategoryAdded).toBe(true);

            const feedCategoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory.categoryId);
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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
            expect(feedCategoryAdded).toBe(true);

            const feedCategoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, newFeedCategory.categoryId);
            expect(feedCategoryUpdated).toBe(true);
            expect(feedCategoryExist(updatedFeedCategory.categoryId, feedConfigManager.getRootCategory())).not.toBeNull();
        });

    });

    describe('#deleteFeedCategory(feedCategory : FeedCategory)', () => {
        
        it('should not delete the root category', () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            return expect(feedConfigManager.deleteFeedCategory(feedConfigManager.getRootCategory().categoryId)).rejects.toThrowError(new InvalidFeedCategoryError(`The root category cannot be deleted!`));
        });

        it('should not delete a feed category which is not existing', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const notExistFeedCategory : FeedCategory = {
                categoryId : 'xx123',
                childCategories : [],
                name : 'xx123456',
                visible : true
            }; 
            const feedDeleted = await feedConfigManager.deleteFeedCategory(notExistFeedCategory.categoryId);

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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
            expect(feedCategoryAdded).toBe(true);

            const feedDeleted = await feedConfigManager.deleteFeedCategory(newFeedCategory.categoryId);
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

            const feedCategoryAdded = await feedConfigManager.addFeedCategory(newFeedCategory, feedConfigManager.getRootCategory().categoryId); 
            expect(feedCategoryAdded).toBe(true);

            const feedDeleted = await feedConfigManager.deleteFeedCategory(newFeedCategory.categoryId);
            expect(feedDeleted).toBe(true);

            expect(feedCategoryExist(newFeedCategory.categoryId, feedConfigManager.getRootCategory())).toBeNull();
        });

    });

  });

});