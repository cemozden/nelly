import Express from "express";
import { ConfigManager } from "../config/ConfigManager";
import { FeedCategory } from "../config/FeedConfigManager";
import { crc32 } from "crc";
import logger from "../utils/Logger";

export default function ConfigAPI(express : Express.Application, configManager : ConfigManager) {
        
    express.get('/addfeedcategory', (req : Express.Request, res : Express.Response) => {
        const params = req.query;
        
        const categoryName : string = params.categoryName;
        const visible = params.visible !== undefined && params.visible === 'true';

        if (categoryName === undefined || categoryName.length === 0) {
            const errorMessage =  'Category name is not a valid name! Please provide a valid name to add a new feed category.';
            
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
        
        //feedConfigManager.addFeedCategory()

        res.json({});
    });
}