import React, { useContext } from "react";
import CategoryHeader from "./CategoryHeader";
import Categories from "./Categories";
import { FeedConfigManager } from "../config/FeedConfigManager";
import { ApplicationContext } from "../App";

export interface SideBarProps {
    feedConfigManager : FeedConfigManager
}

const Sidebar : React.FC<SideBarProps> = (props) => {
    const appContext = useContext(ApplicationContext);
    
    return (<div className="sidebar">
                <CategoryHeader title={appContext.language.categories} />
                <Categories feedConfigManager={props.feedConfigManager} />    
            </div>)
};

export default Sidebar;