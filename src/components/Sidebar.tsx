import React, { useContext } from "react";
import CategoryHeader from "./CategoryHeader";
import Categories from "./Categories";
import { ApplicationContext } from "../App";

export interface SideBarProps {
   
}

const Sidebar : React.FC<SideBarProps> = (props) => {
    const appContext = useContext(ApplicationContext);
    
    return (<div className="sidebar">
                <CategoryHeader title={appContext.language.categories} />
                <Categories />    
            </div>)
};

export default Sidebar;