import React, { useReducer} from "react";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import Modal from "./Modal";
import AddNewCategory from "./AddNewCategory";
import UpdateFeedCategory from "./UpdateFeedCategory";
import { FeedConfig, FeedCategory, DEFAULT_ROOT_CATEGORY } from "../models/FeedModels";
import { useEffect } from "react";

export interface CategoriesProps {
  
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
                    {childCategories.map(cc => <FeedDirectory key={cc.categoryId} feedCategoryDispatch={props.feedCategoryDispatch} feedList={props.feedList} feedCategory={cc} />)}
                </ol>
                {props.feedList.filter(fc => fc.categoryId === props.feedCategory.categoryId).map(fc => <FeedCategoryMember feedConfig={fc} />)}
            </React.Fragment>);
    }
    else 
      return <FeedCategoryTitle feedCategory={props.feedCategory} categoryDispatch={props.feedCategoryDispatch} />  
    
};

const FeedCategoryTitle : React.FC<FeedCategoryTitleProps> = props => {

    /*async function deleteCategory(feedCategory : FeedCategory) {

      const options = {
        type: 'question',
        buttons: [language.yes, language.no],
        title: language.sidebar.deleteCategory.deleteCategoryMessageTitle.replace('$<categoryName>', feedCategory.name),
        message : language.sidebar.deleteCategory.deleteConfirmMessage.replace('$<categoryName>', feedCategory.name),
        detail  : language.sidebar.deleteCategory.deleteConfirmMessageDetails
      };
      
      const messageBoxReturnValuePromise : Promise<Electron.MessageBoxReturnValue> = (window as any).electron.dialog.showMessageBox(null, options);
      const messageBoxReturnValue = await messageBoxReturnValuePromise;

      if (messageBoxReturnValue.response === 0) {
        const feedConfigManager = appContext.configManager.getFeedConfigManager();
        
        try {
          const categoryDeleted = await feedConfigManager.deleteFeedCategory(feedCategory);

          if (categoryDeleted) {
            const rootCategory = feedConfigManager.getRootCategory();
            
            //TODO: Remove feeds that belongs to the deleted categories. (CATEGORIES that is, all of them)

            props.categoryDispatch({type : 'setRootCategory', rootCategory : rootCategory});
            props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
          }
          else {
            const options = {
              type: 'error',
              buttons: ['Ok'],
              title: 'Nelly | ' + language.error,
              message: language.sidebar.deleteCategory.deleteCategoryError
          };
          (window as any).electron.dialog.showMessageBox(null, options);
          }
        }
        catch (err) {
          const options = {
            type: 'error',
            buttons: ['Ok'],
            title: 'Nelly | ' + language.error,
            message: err.message
        };
        (window as any).electron.dialog.showMessageBox(null, options);
        }

      }
      
    }*/

    return  (
              <React.Fragment>
                <ContextMenuTrigger id={props.feedCategory.categoryId + '_contextMenu'}>
                  <li id={props.feedCategory.categoryId}>{props.feedCategory.name}</li>
                </ContextMenuTrigger>
                <ContextMenu id={props.feedCategory.categoryId + '_contextMenu'}>
                  <MenuItem onClick={(e, data) => console.log(2)}>
                    {"Add new feed under " + props.feedCategory.name}
                  </MenuItem>
                  <MenuItem data={{parentCategory : props.feedCategory}} onClick={(e, data) => {
                    props.categoryDispatch({type : 'setModalTitle', modalTitle : 'Add new category under ' + props.feedCategory.name});

                    props.categoryDispatch({type : 'setModalContent', modalContent : <AddNewCategory categoryDispatch={props.categoryDispatch} parentCategory={props.feedCategory} />});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                  } }>
                    {'Add new category under ' + props.feedCategory.name}
                  </MenuItem>
                  { props.feedCategory.categoryId !== 'root' ? <React.Fragment>
                    <MenuItem onClick={(e, data) => {
                      props.categoryDispatch({type : 'setModalTitle', modalTitle : 'Update category ' + props.feedCategory.name});
                      props.categoryDispatch({type : 'setModalContent', modalContent : <UpdateFeedCategory categoryDispatch={props.categoryDispatch} feedCategory={props.feedCategory} />});
                      props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                    }}>
                    {'Update category "' + props.feedCategory.name + '"'}
                    </MenuItem>
                    <MenuItem onClick={async (e, data) => {}}>
                    {'Delete category ' + props.feedCategory.name}
                    </MenuItem>
                  </React.Fragment> : null}
              </ContextMenu>  
        </React.Fragment>
          );
};

const FeedCategoryMember : React.FC<FeedCategoryMemberProps> = props => {

  return  (<React.Fragment>
                <ContextMenuTrigger id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <li id={props.feedConfig.feedConfigId}>{props.feedConfig.name}</li>
                  </ContextMenuTrigger>
                  <ContextMenu id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <MenuItem onClick={(e, data) => console.log(1)}>
                      Add new Feed
                    </MenuItem>
                    <MenuItem onClick={(e, data) => console.log(2)}>
                     {'Update ' + props.feedConfig.name}
                    </MenuItem>
                    <MenuItem onClick={(e, data) => console.log(3)}>
                    {'Delete ' + props.feedConfig.name}
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
  useEffect(() => {
    
    fetch('http://localhost:6150/getrootcategory')
      .then(res => res.json())
      .then(result => {
        const rootCategory : FeedCategory = result;
     
        dispatch({type : 'setRootCategory', rootCategory : rootCategory});

      });
  }, []);

  const initialState : any = {
      rootCategory : DEFAULT_ROOT_CATEGORY,
      feeds : [],
      modalContent : <div></div>,
      modalTitle : 'Modal',
      modalVisible : false
    };

    const [state, dispatch] = useReducer(categoryReducer, initialState);

    return <div className="categoryList">
                <ul>
                    <FeedDirectory key={state.rootCategory.categoryId} feedList={state.feeds} feedCategory={state.rootCategory} feedCategoryDispatch={dispatch} />
                </ul>
                <Modal title={state.modalTitle} visible={state.modalVisible}>
                  {state.modalContent}
                </Modal>
            </div>;
};

export default Categories;