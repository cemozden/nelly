export interface Language {
    windowTitle : string,
    categories : string,
    sidebar : {
        feedCategoryTitle : {
            addCategoryUnder : string,
            addNewFeedUnder : string,
            updateCategoryTitle : string,
            deleteCategoryTitle : string
        },
        feedCategoryMember : {
            addNewFeed : string,
            updateFeed : string,
            deleteFeed : string
        }
    }
}

export const DEFAULT_ENGLISH_LANGUAGE : Language = {
    windowTitle : "Nelly RSS Feeder",
    categories : "Categories",
    sidebar : {
        feedCategoryMember : {
            addNewFeed : 'Add new Feed',
            updateFeed : 'Update $<feedName>',
            deleteFeed : 'Delete $<feedName>'
        },
        feedCategoryTitle : {
            addCategoryUnder : 'Add category under $<categoryName>',
            addNewFeedUnder : 'Add new feed under $<categoryName>',
            deleteCategoryTitle : 'Delete $<categoryName>',
            updateCategoryTitle : 'Update $<categoryName>'
        }
    }
};