import React from "react";
import { FeedConfigManager, FeedCategory } from "../config/FeedConfigManager";

export interface CategoryListProps {
    feedConfigManager : FeedConfigManager
}

interface CategoryProps {
    feedCategory : FeedCategory
}

const FeedDirectory : React.FC<CategoryProps> = props => {
    const childCategories = props.feedCategory.childCategories;

    if (childCategories.length != 0) {
        return (<React.Fragment>
                <Feed feedCategory={props.feedCategory} />
                <ol>
                    {childCategories.map(cc => <FeedDirectory feedCategory={cc} />)}
                </ol>
            </React.Fragment>);
    }
    else 
      return <Feed feedCategory={props.feedCategory} />  
    
};

const Feed : React.FC<CategoryProps> = props => {
    return (<li id={props.feedCategory.categoryId}>{props.feedCategory.name}</li>);
};

const CategoryList : React.FC<CategoryListProps> = props => {
    return <div className="categoryList">
                <ul>
                    <FeedDirectory feedCategory={props.feedConfigManager.getRootCategory()} />      
                </ul>
            </div>;
};

export default CategoryList;