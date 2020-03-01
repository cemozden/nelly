import { isFeedConfig, categoryIdExist, deleteFeedCategoryFromCategoryTree } from "./ConfigUtil";

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
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory().categoryId);
            expect(feedConfig1Added).toBe(true);
    
            const rootFeedCategoryExist = categoryIdExist('root', feedConfigManager.getRootCategory());
            expect(rootFeedCategoryExist).toBe(true);
            
            const exampleFeedCategoryExist = categoryIdExist(exampleId1, feedConfigManager.getRootCategory());
            expect(exampleFeedCategoryExist).toBe(true);
    
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1.categoryId);
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
    
            const feedConfig1Added = await feedConfigManager.addFeedCategory(exampleFeedCategory1, feedConfigManager.getRootCategory().categoryId);
            expect(feedConfig1Added).toBe(true);
            
            const feedConfig2Added = await feedConfigManager.addFeedCategory(exampleFeedCategory2, exampleFeedCategory1.categoryId);
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