import React from "react";

export interface SideBarProps {

}

const SideBar : React.FC<SideBarProps> = (props : SideBarProps) => {

    return (
        <div className="sidebar">
                <div className="categoriesHeader">
                    <h3>Categories</h3>
                </div>
                <div className="categoryList">
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
                </div>
            </div>
    );

};

export default SideBar;