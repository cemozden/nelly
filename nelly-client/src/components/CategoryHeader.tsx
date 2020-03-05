import React from "react";

export interface CategoryHeaderProps {
    title : string
}

const CategoryHeader : React.FC<CategoryHeaderProps> = (props) => {
    return <div className="categoriesHeader">
                <h3>{props.title}</h3>
           </div>;
};

export default CategoryHeader;