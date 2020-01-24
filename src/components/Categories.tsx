import React from "react";
import { FeedConfigManager, FeedCategory, FeedConfig } from "../config/FeedConfigManager";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";

export interface CategoriesProps {
    feedConfigManager : FeedConfigManager
}

interface FeedDirectoryProps {
    feedCategory : FeedCategory,
    feedList : FeedConfig[]
}

interface FeedCategoryTitleProps {
  feedCategory : FeedCategory
}

interface FeedCategoryMemberProps {
    feedConfig : FeedConfig
}

const FeedDirectory : React.FC<FeedDirectoryProps> = props => {
    const childCategories = props.feedCategory.childCategories;

    if (childCategories.length !== 0) {
        return (<React.Fragment>
                <FeedCategoryTitle feedCategory={props.feedCategory} />
                <ol>
                    {childCategories.map(cc => <FeedDirectory feedList={props.feedList} feedCategory={cc} />)}
                </ol>
                {props.feedList.filter(fc => fc.categoryId === props.feedCategory.categoryId).map(fc => <FeedCategoryMember feedConfig={fc} />)}
            </React.Fragment>);
    }
    else 
      return <FeedCategoryTitle feedCategory={props.feedCategory} />  
    
};

const FeedCategoryTitle : React.FC<FeedCategoryTitleProps> = props => {

    return  (<React.Fragment>
              <ContextMenuTrigger id={props.feedCategory.categoryId + '_contextMenu'}>
                <li id={props.feedCategory.categoryId}>{props.feedCategory.name}</li>
              </ContextMenuTrigger>
              <ContextMenu id={props.feedCategory.categoryId + '_contextMenu'}>
                <MenuItem  onClick={(e, data) => console.log(1)}>
                  {`Add Category under ${props.feedCategory.name}`}
                </MenuItem>
                <MenuItem onClick={(e, data) => console.log(2)}>
                {`Add new RSS Feed under ${props.feedCategory.name}`}
                </MenuItem>
                { props.feedCategory.categoryId !== 'root' ? <React.Fragment>
                  <MenuItem /*data={{foo: 'bar'}}*/ onClick={(e, data) => console.log(3)}>
                    {`Update ${props.feedCategory.name}`}
                  </MenuItem>
                  <MenuItem onClick={(e, data) => console.log(3)}>
                    {`Delete ${props.feedCategory.name}`}
                  </MenuItem>
                </React.Fragment> : null}
            </ContextMenu>       
        </React.Fragment>);
};

const FeedCategoryMember : React.FC<FeedCategoryMemberProps> = props => {
  return <React.Fragment>
            <ContextMenuTrigger id={props.feedConfig.feedConfigId + '_contextMenu'}>
                <li id={props.feedConfig.feedConfigId}>{props.feedConfig.name}</li>
              </ContextMenuTrigger>
              <ContextMenu id={props.feedConfig.feedConfigId + '_contextMenu'}>
                <MenuItem onClick={(e, data) => console.log(1)}>
                  Add new Feed
                </MenuItem>
                <MenuItem onClick={(e, data) => console.log(2)}>
                {`Update ${props.feedConfig.name}`}
                </MenuItem>
                <MenuItem onClick={(e, data) => console.log(3)}>
                  {`Delete ${props.feedConfig.name}`}
                </MenuItem>
            </ContextMenu>       
        </React.Fragment>
};

const Categories : React.FC<CategoriesProps> = props => {
    //const [rootCategory, setRootCategory] = useState(props.feedConfigManager.getRootCategory());
    //const [feeds, setFeeds] = useState(props.feedConfigManager.getFeedConfigs());
    return <div className="categoryList">
                <ul>
                    <FeedDirectory feedList={props.feedConfigManager.getFeedConfigs()} feedCategory={props.feedConfigManager.getRootCategory()} />
                </ul>
            </div>;
};

export default Categories;