import React from "react";
import CategoryHeader from "./CategoryHeader";
import Categories from "./Categories";
import { FeedConfigManager } from "../config/FeedConfigManager";

export interface SideBarProps {
    feedConfigManager : FeedConfigManager
}

const Sidebar : React.FC<SideBarProps> = (props) => {

    return (
        <div className="sidebar">
            <CategoryHeader title="Categories" />
            <Categories feedConfigManager={props.feedConfigManager} />    
        </div>
    );

};

export default Sidebar;