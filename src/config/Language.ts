export interface Language {
    windowTitle : string,
    categories : string,
    error : string,
    info : string,
    warning : string,
    yes : string,
    no : string,
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
        },
        addCategoryUnder : {
            addCategory : string,
            categoryName : string,
            visible : string
        },
        updateCategory : {
            updateCategory : string,
            categoryName : string,
            visible : string
        }
    }
    validations : {
        addNewCategoryValidation : {
            categoryNameCannotBeEmpty : string
        },
        updateCategoryValidation : {
            categoryNameCannotBeEmpty : string
        }
    }
}

export const DEFAULT_ENGLISH_LANGUAGE : Language = {
    windowTitle : "Nelly RSS Feeder",
    categories : "Categories",
    error : 'Error',
    info : 'Information',
    warning : 'Warning',
    yes : 'Yes',
    no : 'No',
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
        },
        addCategoryUnder : {
            addCategory : 'Add Category',
            categoryName : 'Category Name',
            visible : 'Visible'
        },
        updateCategory : {
            updateCategory : 'Update Category',
            categoryName : 'Category Name',
            visible : 'Visible'
        }
        
    },
    validations : {
        addNewCategoryValidation : {
            categoryNameCannotBeEmpty : 'A category name cannot be empty! Please provide a valid category name.'
        },
        updateCategoryValidation : {
            categoryNameCannotBeEmpty : 'A category name cannot be empty! Please provide a valid category name.'
        }
    }
};