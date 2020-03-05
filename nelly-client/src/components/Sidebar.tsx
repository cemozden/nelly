import React from "react";
import CategoryHeader from "./CategoryHeader";
import Categories from "./Categories";

export interface SideBarProps {
   
}

const Sidebar : React.FC<SideBarProps> = (props) => {
    
    return (<div className="sidebar">
                <CategoryHeader title="Categories" />
                <Categories />
            </div>)
};

export default Sidebar;