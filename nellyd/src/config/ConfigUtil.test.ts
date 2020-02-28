import { isFeedConfig, feedCategoryExist, categoryIdExist, deleteFeedCategoryFromCategoryTree } from "./ConfigUtil";

import JSONFeedConfigManager from "./JSONFeedConfigManager";

import { FeedCategory } from "./FeedConfigManager";
import { join } from "path";
import { sync } from "rimraf";

const tmpFeedsFolder = join(process.env.CONFIG_DIR as string, 'feeds/');

describe('ConfigUtil', () => {

    beforeAll(() => {
        sync(tmpFeedsFolder);
    });

    describe('#isFeedConfig(obj : any)', () => {
        it('should return false if the object is not FeedConfig object', () => {
            const sample1 = {};
            const sample2 = {feedId : ""};
            const sample3 = {feedId : "", categoryId : ""};
            const sample4 = {feedId : "", categoryId : "", name : ""};
            const sample5 = {feedId : "", categoryId : "", name : "", url : ""};
            const sample6 = {feedId : "", categoryId : "", name : "", url : "", fetchPeriod : null};
            const sample7 = {feedId : "", categoryId : "", name : "", fetchPeriod : null};
    
            expect(isFeedConfig(sample1)).toBe(false);
            expect(isFeedConfig(sample2)).toBe(false);
            expect(isFeedConfig(sample3)).toBe(false);
            expect(isFeedConfig(sample4)).toBe(false);
            expect(isFeedConfig(sample5)).toBe(false);
            expect(isFeedConfig(sample6)).toBe(false);
            expect(isFeedConfig(sample7)).toBe(false);
        });
    
        it ('should return true if the object is FeedConfig object', () => {
            const sample = {feedConfigId : "", categoryId : "", name : "", url : "", fetchPeriod : null, enabled : false};
    
            expect(isFeedConfig(sample)).toBe(true);
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
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory());
            expect(feedConfig1Added).not.toBeNull();
    
            const rootFeedCategoryExist = feedCategoryExist(feedConfigManager.getRootCategory(), feedConfigManager.getRootCategory());
            expect(rootFeedCategoryExist).not.toBeNull();
            
            const exampleFeedCategoryExist = feedCategoryExist(exampleFeedCategory1, feedConfigManager.getRootCategory());
            expect(exampleFeedCategoryExist).not.toBeNull();
    
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1);
            expect(feedConfig2Added).not.toBeNull();
    
            const feedConfig2Exist = feedCategoryExist(exampleFeedCategory2, feedConfigManager.getRootCategory());
            const feedConfig3Exist = feedCategoryExist(exampleFeedCategory2, exampleFeedCategory1);
            
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
    
            const exampleFeedCategory3Exist = feedCategoryExist(exampleFeedCategory3, feedConfigManager.getRootCategory());
            const exampleFeedCategory4Exist = feedCategoryExist(exampleFeedCategory4, feedConfigManager.getRootCategory());
    
            expect(exampleFeedCategory3Exist).toBeNull();
            expect(exampleFeedCategory4Exist).toBeNull();
        });
    
    });
    
    describe('#categoryIdExist(categoryId : string, feedCategory : FeedCategory)', () => {
        it('should return true if the given category id exist in the feed category', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const exampleId1 = 'exampleFeedCategory1_1';
            const exampleId2 = 'exampleFeedCategory2_2';
    
            const exampleFeedCategory1 : FeedCategory = {
                categoryId : exampleId1,
                childCategories : [],
                name : 'Example Feed Category 1',
                visible : true
            };
    
            const exampleFeedCategory2 : FeedCategory = {
                categoryId : exampleId2,
                childCategories : [],
                name : 'Example Feed Category 2',
                visible : true
            };
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory());
            expect(feedConfig1Added).toBe(true);
    
            const rootFeedCategoryExist = categoryIdExist('root', feedConfigManager.getRootCategory());
            expect(rootFeedCategoryExist).toBe(true);
            
            const exampleFeedCategoryExist = categoryIdExist(exampleId1, feedConfigManager.getRootCategory());
            expect(exampleFeedCategoryExist).toBe(true);
    
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1);
            expect(feedConfig2Added).toBe(true);
    
            const feedConfig2Exist = categoryIdExist(exampleId2, feedConfigManager.getRootCategory());
            const feedConfig3Exist = categoryIdExist(exampleId2, exampleFeedCategory1);
            
            expect(feedConfig2Exist).toBe(true);
            expect(feedConfig3Exist).toBe(true);
        });
    
        it('should return false if the given category id does not exist in the feed category', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const exampleId3 = 'exampleFeedCategory3_3';
            const exampleId4 = 'exampleFeedCategory4_4';
            const exampleFeedCategory3Exist = categoryIdExist(exampleId3, feedConfigManager.getRootCategory());
            const exampleFeedCategory4Exist = categoryIdExist(exampleId4, feedConfigManager.getRootCategory());
    
            expect(exampleFeedCategory3Exist).toBe(false);
            expect(exampleFeedCategory4Exist).toBe(false);
        });
    
    });

    describe('#deleteFeedCategoryFromCategoryTree(feedCategoryToDelete : FeedCategory, categoryTree : FeedCategory)', () => {
        it('should return true if the given feed category is deleted', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const exampleId1 = 'exampleFeedCategory4_5';
            const exampleId2 = 'exampleFeedCategory2_6';
    
            const exampleFeedCategory1 : FeedCategory = {
                categoryId : exampleId1,
                childCategories : [],
                name : 'Example Feed Category 1',
                visible : true
            };
    
            const exampleFeedCategory2 : FeedCategory = {
                categoryId : exampleId2,
                childCategories : [],
                name : 'Example Feed Category 2',
                visible : true
            };
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory());
            expect(feedConfig1Added).toBe(true);
            
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1);
            expect(feedConfig2Added).toBe(true);

            const rootFeedCategoryExist = deleteFeedCategoryFromCategoryTree(exampleFeedCategory2, feedConfigManager.getRootCategory());
            expect(rootFeedCategoryExist).toBe(true);
            
            const exampleFeedCategoryExist = deleteFeedCategoryFromCategoryTree(exampleFeedCategory1, feedConfigManager.getRootCategory());
            expect(exampleFeedCategoryExist).toBe(true);

        });
    
        it('should return false if the given feed category is not existing, or not deleted', async () => {
            const feedConfigManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const exampleId3 = 'exampleFeedCategory3_9';
            const exampleId4 = 'exampleFeedCategory4_9';

            const exampleFeedCategory1 : FeedCategory = {
                categoryId : exampleId3,
                childCategories : [],
                name : 'Example Feed Category 1',
                visible : true
            };
    
            const exampleFeedCategory2 : FeedCategory = {
                categoryId : exampleId4,
                childCategories : [],
                name : 'Example Feed Category 2',
                visible : true
            };

            const exampleFeedCategory3Exist = deleteFeedCategoryFromCategoryTree(exampleFeedCategory1, feedConfigManager.getRootCategory());
            const exampleFeedCategory4Exist = deleteFeedCategoryFromCategoryTree(exampleFeedCategory2, feedConfigManager.getRootCategory());
    
            expect(exampleFeedCategory3Exist).toBe(false);
            expect(exampleFeedCategory4Exist).toBe(false);
        });
    
    });


});