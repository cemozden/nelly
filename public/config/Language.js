"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ENGLISH_LANGUAGE = {
    windowTitle: "Nelly RSS Feeder",
    categories: "Categories",
    error: 'Error',
    info: 'Information',
    warning: 'Warning',
    yes: 'Yes',
    no: 'No',
    sidebar: {
        feedCategoryMember: {
            addNewFeed: 'Add new Feed',
            updateFeed: 'Update $<feedName>',
            deleteFeed: 'Delete $<feedName>'
        },
        feedCategoryTitle: {
            addCategoryUnder: 'Add category under $<categoryName>',
            addNewFeedUnder: 'Add new feed under $<categoryName>',
            deleteCategoryTitle: 'Delete $<categoryName>',
            updateCategoryTitle: 'Update $<categoryName>'
        },
        addCategoryUnder: {
            addCategory: 'Add Category',
            categoryName: 'Category Name',
            visible: 'Visible'
        },
        updateCategory: {
            updateCategory: 'Update Category',
            categoryName: 'Category Name',
            visible: 'Visible'
        },
        deleteCategory: {
            deleteCategoryMessageTitle: 'Delete category $<categoryName>',
            deleteConfirmMessage: 'Are you sure you want to delete the category "$<categoryName>"?',
            deleteConfirmMessageDetails: 'Feeds under this category will also be deleted!',
            deleteCategoryError: 'Unable to delete the feed category! An error occured!'
        }
    },
    validations: {
        addNewCategoryValidation: {
            categoryNameCannotBeEmpty: 'A category name cannot be empty! Please provide a valid category name.'
        },
        updateCategoryValidation: {
            categoryNameCannotBeEmpty: 'A category name cannot be empty! Please provide a valid category name.'
        }
    }
};
//# sourceMappingURL=Language.js.map