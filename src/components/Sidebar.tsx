import React from "react";
import CategoryHeader from "./CategoryHeader";
import Categories from "./Categories";
import { FeedConfigManager } from "../config/FeedConfigManager";
import { ApplicationContext } from "../App";

export interface SideBarProps {
    feedConfigManager : FeedConfigManager
}

const Sidebar : React.FC<SideBarProps> = (props) => {

    return <ApplicationContext.Consumer>
                {
                    ({language}) => (
                        <div className="sidebar">
                            <CategoryHeader title={language.categories} />
                            <Categories feedConfigManager={props.feedConfigManager} />    
                        </div>
                    )
                }
            </ApplicationContext.Consumer> 

};

export default Sidebar;