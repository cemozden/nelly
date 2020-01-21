import React from "react";
import CategoryHeader from "./CategoryHeader";
import CategoryList from "./CategoryList";
import { FeedConfigManager } from "../config/FeedConfigManager";

export interface SideBarProps {
    feedConfigManager : FeedConfigManager
}

const SideBar : React.FC<SideBarProps> = (props) => {


    return (
        <div className="sidebar">
            <CategoryHeader title="Categories" />
            <CategoryList feedConfigManager={props.feedConfigManager} />    
        </div>
    );

};

export default SideBar;