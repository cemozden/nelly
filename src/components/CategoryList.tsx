import React from "react";
import { FeedConfigManager } from "../config/FeedConfigManager";

export interface CategoryListProps {
    feedConfigManager : FeedConfigManager
}

const CategoryList : React.FC<CategoryListProps> = (props) => {
    return <div className="categoryList">
    <ul>
        <li id="blogs">- Blogs</li>
        <ol id="blogs_list">
            <li id="ubuntuIncident">Ubuntu Incident</li>
            <li id="cemOzden">Cem Ozden</li>
        </ol>
        <li>- News</li>
        <ol>
            <li>- BBC</li>
            <ol>
                <li>BBC News World</li>
                <li>BBC News Sport</li>
                <li>BBC News Technology</li>
            </ol>
            <li>NTV</li>
        </ol>
    </ul>
</div>;
};

export default CategoryList;