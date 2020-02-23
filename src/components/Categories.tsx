import React, { useContext, useReducer} from "react";
import { FeedConfigManager, FeedCategory, FeedConfig } from "../config/FeedConfigManager";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import { ApplicationContext } from "../App";
import Modal from "./Modal";

export interface CategoriesProps {
    feedConfigManager : FeedConfigManager
}

interface FeedDirectoryProps {
    feedCategory : FeedCategory,
    feedList : FeedConfig[],
    feedCategoryDispatch : React.Dispatch<any>
}

interface FeedCategoryTitleProps {
  feedCategory : FeedCategory,
  categoryDispatch : React.Dispatch<any>
}

interface FeedCategoryMemberProps {
    feedConfig : FeedConfig
}

interface CategoriesState {
  feeds : FeedConfig[],
  rootCategory : FeedCategory,
  modalTitle : string,
  modalContent : JSX.Element,
  modalVisible : boolean
}

const FeedDirectory : React.FC<FeedDirectoryProps> = props => {
    const childCategories = props.feedCategory.childCategories;

    if (childCategories.length !== 0) {
        return (<React.Fragment>
                <FeedCategoryTitle categoryDispatch={props.feedCategoryDispatch} feedCategory={props.feedCategory} />
                <ol>
                    {childCategories.map(cc => <FeedDirectory feedCategoryDispatch={props.feedCategoryDispatch} feedList={props.feedList} feedCategory={cc} />)}
                </ol>
                {props.feedList.filter(fc => fc.categoryId === props.feedCategory.categoryId).map(fc => <FeedCategoryMember feedConfig={fc} />)}
            </React.Fragment>);
    }
    else 
      return <FeedCategoryTitle feedCategory={props.feedCategory} categoryDispatch={props.feedCategoryDispatch} />  
    
};

const FeedCategoryTitle : React.FC<FeedCategoryTitleProps> = props => {
    const appContext = useContext(ApplicationContext);

    return  (
              <React.Fragment>
                <ContextMenuTrigger id={props.feedCategory.categoryId + '_contextMenu'}>
                  <li id={props.feedCategory.categoryId}>{props.feedCategory.name}</li>
                </ContextMenuTrigger>
                <ContextMenu id={props.feedCategory.categoryId + '_contextMenu'}>
                  <MenuItem data={{parentCategory : props.feedCategory}} onClick={(e, data) => {
                    props.categoryDispatch({type : 'setModalTitle', modalTitle : 
                    appContext.language.sidebar.feedCategoryTitle.addCategoryUnder.replace('$<categoryName>', props.feedCategory.name)
                  });

                    props.categoryDispatch({type : 'setModalContent', modalContent : <div>Hello World!</div>});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                  } }>
                    {appContext.language.sidebar.feedCategoryTitle.addCategoryUnder.replace('$<categoryName>', props.feedCategory.name)}
                  </MenuItem>
                  <MenuItem onClick={(e, data) => console.log(2)}>
                  {appContext.language.sidebar.feedCategoryTitle.addNewFeedUnder.replace('$<categoryName>', props.feedCategory.name)}
                  </MenuItem>
                  { props.feedCategory.categoryId !== 'root' ? <React.Fragment>
                    <MenuItem /*data={{foo: 'bar'}}*/ onClick={(e, data) => console.log(3)}>
                    {appContext.language.sidebar.feedCategoryTitle.updateCategoryTitle.replace('$<categoryName>', props.feedCategory.name)}
                    </MenuItem>
                    <MenuItem onClick={(e, data) => console.log(3)}>
                    {appContext.language.sidebar.feedCategoryTitle.deleteCategoryTitle.replace('$<categoryName>', props.feedCategory.name)}
                    </MenuItem>
                  </React.Fragment> : null}
              </ContextMenu>  
        </React.Fragment>
          );
};

const FeedCategoryMember : React.FC<FeedCategoryMemberProps> = props => {

  const appContext = useContext(ApplicationContext);

  return  (<React.Fragment>
                <ContextMenuTrigger id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <li id={props.feedConfig.feedConfigId}>{props.feedConfig.name}</li>
                  </ContextMenuTrigger>
                  <ContextMenu id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <MenuItem onClick={(e, data) => console.log(1)}>
                      {appContext.language.sidebar.feedCategoryMember.addNewFeed}
                    </MenuItem>
                    <MenuItem onClick={(e, data) => console.log(2)}>
                     {appContext.language.sidebar.feedCategoryMember.updateFeed.replace('$<feedName>', props.feedConfig.name)}
                    </MenuItem>
                    <MenuItem onClick={(e, data) => console.log(3)}>
                    {appContext.language.sidebar.feedCategoryMember.deleteFeed.replace('$<feedName>', props.feedConfig.name)}
                    </MenuItem>
                </ContextMenu>       
            </React.Fragment>) 
};

function categoryReducer(state : CategoriesState, action : any) : CategoriesState {
    
  switch(action.type) {
    case 'setFeeds':
      return { feeds : action.feeds, rootCategory : state.rootCategory, modalContent : state.modalContent, modalTitle : state.modalTitle, modalVisible : state.modalVisible }
    case 'setRootCategory':
      return {rootCategory : action.rootCategory, feeds : state.feeds, modalContent : state.modalContent, modalTitle : state.modalTitle, modalVisible : state.modalVisible }
    case 'setModalContent':
      return { feeds : state.feeds, rootCategory : state.rootCategory, modalContent : action.modalContent, modalTitle : state.modalTitle, modalVisible : state.modalVisible }
    case 'setModalTitle':
      return { feeds : state.feeds, rootCategory : state.rootCategory, modalContent : state.modalContent, modalTitle : action.modalTitle, modalVisible : state.modalVisible }
    case 'setModalVisible':
      return { feeds : state.feeds, rootCategory : state.rootCategory, modalContent : state.modalContent, modalTitle : state.modalTitle, modalVisible : action.modalVisible }
    default:
      throw new Error('Unable to find the dispatcher')
  }
}

const Categories : React.FC<CategoriesProps> = props => {
    
  const initialState : any = {
      rootCategory : props.feedConfigManager.getRootCategory(),
      feeds : props.feedConfigManager.getFeedConfigs(),
      modalContent : <div></div>,
      modalTitle : 'Modal',
      modalVisible : false
    };

    const [state, dispatch] = useReducer(categoryReducer, initialState);

    return <div className="categoryList">
                <ul>
                    <FeedDirectory feedList={state.feeds} feedCategory={state.rootCategory} feedCategoryDispatch={dispatch} />
                </ul>
                <Modal title={state.modalTitle} visible={state.modalVisible}>
                  {state.modalContent}
                </Modal>
            </div>;
};

export default Categories;