import Express from "express";
import { ConfigManager } from "../config/ConfigManager";
import { FeedCategory, FeedConfigManager, getCategoryById } from "../config/FeedConfigManager";
import { crc32 } from "crc";
import logger from "../utils/Logger";

export default function FeedCategoryAPI(express : Express.Application, configManager : ConfigManager) {

    express.get('/getrootcategory', (req, res) => {
        res.json(configManager.getFeedConfigManager().getRootCategory());
    });

    /**
     * 
     * Required Parameters
     * categoryName : string
     * parentCategoryId : string
     * visible : boolean
     *  */    
    express.get('/addfeedcategory', async (req, res) => {
        const params = req.query;
        
        const categoryName : string = params.categoryName;
        const visible = params.visible !== undefined && params.visible === 'true';
        const parentCategoryId = params.parentCategoryId;

        if (categoryName === undefined || categoryName.length === 0) {
            const errorMessage =  'Category name is not a valid name! Please provide a valid name to add a new feed category.';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[AddFeedCategory] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if(parentCategoryId === undefined || parentCategoryId.length === 0) {
            const errorMessage =  'Parent category id is not a valid id!';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[AddFeedCategory] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager = configManager.getFeedConfigManager();

        const feedCategory : FeedCategory = {
            categoryId : crc32(Math.random().toString(36).substring(2, 9)).toString(16),
            childCategories : [],
            name : categoryName,
            visible : visible
        };

        try {
            const categoryAdded = await feedConfigManager.addFeedCategory(feedCategory, parentCategoryId);

            if (categoryAdded) {
                logger.info(`[AddFeedCategory] A new feed category added! New Category : ${JSON.stringify(feedCategory)}`);
                res.json({added : true, categoryObject : feedCategory, rootCategory : feedConfigManager.getRootCategory()});
            }
            else {
                logger.error(`[AddFeedCategory] An error occured while adding the category! Request Params: ${JSON.stringify(params)}`);
                res.json({added : false, errorMessage : 'An error occured while adding the category!'});
            }
        }
        catch(err) {
            logger.error(`[AddFeedCategory] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }
        
        
    });

    /**
     * 
     * Required Parameters
     * categoryId : string
     * categoryName : string
     * visible : boolean
     * 
     */
    express.get('/updatefeedcategory', async (req, res) => {
        const params = req.query;
        
        const categoryId = params.categoryId;
        const categoryName = params.categoryName;
        const visible = params.visible !== undefined && params.visible === 'true';

        if (categoryName === undefined || categoryName.length === 0) {
            const errorMessage =  'Category name is not a valid name! Please provide a valid name to add a new feed category.';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[UpdateFeedCategory] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if(categoryId === undefined || categoryId.length === 0) {
            const errorMessage =  'Parent category id is not a valid id!';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[UpdateFeedCategory] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager : FeedConfigManager = configManager.getFeedConfigManager();
        
        const oldFeedCategory = getCategoryById(categoryId, feedConfigManager.getRootCategory());

        const updatedFeedCategory : FeedCategory = {
            categoryId : categoryId,
            name : categoryName,
            visible : visible,
            childCategories : oldFeedCategory.childCategories
        };

        try {
            const categoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, categoryId);

            if (categoryUpdated) {
                logger.info(`[UpdateFeedCategory] A category is updated successful. Old version: ${JSON.stringify(oldFeedCategory)} New Version: ${JSON.stringify(updatedFeedCategory)}`);
                res.json({updated : true, categoryObject : updatedFeedCategory, rootCategory : feedConfigManager.getRootCategory()});
            }
            else {
                logger.error(`[UpdateFeedCategory] An error occured while updating the category!, Request Params: ${JSON.stringify(params)}`);
                res.json({updated : false, errorMessage : 'An error occured while updating the category!'});
            }
                
        }
        catch(err) {
            logger.error(`[UpdateFeedCategory] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }

    });

    /**
     * Required parameters
     * categoryId : string
     */
    express.get('/deletefeedcategory', async (req, res) => {
        const params = req.query;
        
        const categoryId = params.categoryId;

        if(categoryId === undefined || categoryId.length === 0) {
            const errorMessage =  'Parent category id is not a valid id!';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[DeleteFeedCategory] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager : FeedConfigManager = configManager.getFeedConfigManager();
        const feedCategoryToDelete = getCategoryById(categoryId, feedConfigManager.getRootCategory());

        try {
            const categoryDeleted = await feedConfigManager.deleteFeedCategory(categoryId);

            if (categoryDeleted) {
                logger.info(`[DeleteFeedCategory] A feed category with the id "${categoryId}" deleted!, Data: ${JSON.stringify(categoryDeleted)}`);
                res.json({deleted : true, rootCategory : feedConfigManager.getRootCategory()});
            }
            else {
                logger.error(`[DeleteFeedCategory] An error occured while deleting the category with the id "${categoryId}"! `);
                res.json({deleted : false, errorMessage : 'An error occured while deleting the category!'});
            }

        }
        catch (err) {
            logger.error(`[DeleteFeedCategory] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }
        

    });
}