export interface FeedCategory {
    categoryId : string,
    name : string,
    childCategories : FeedCategory[],
    visible? : boolean
}

export const DEFAULT_ROOT_CATEGORY : FeedCategory = {
    categoryId : 'root',
    childCategories : [],
    name : 'Root',
    visible : true
};