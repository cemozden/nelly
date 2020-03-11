import React, { useReducer} from "react";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import Modal from "./Modal";
import AddNewCategory from "./AddNewCategory";
import UpdateFeedCategory from "./UpdateFeedCategory";
import { FeedConfig } from "../models/FeedModels";
import { useEffect } from "react";
import {MessageBoxReturnValue} from "electron";
import { FeedCategory, DEFAULT_ROOT_CATEGORY } from "../models/FeedCategoryModels";
import AddFeed from "./AddFeed";
import { isFeedCategoryDeleteSucceedMessage, isFeedCategoryDeleteFailedMessage } from "../models/apimessages/FeedCategoryMessages";
import { isDeleteFeedSucceedMessage, isDeleteFeedFailedMessage, isUpdateFeedSucceedMessage, isUpdateFeedFailedMessage } from "../models/apimessages/FeedMessages";
import { useDrag, useDrop } from "react-dnd";
import FEED_DND_TYPES from "../models/dnd/FeedType";
import FeedDragItem from "../models/dnd/FeedDragItem";
import UpdateFeed from "./UpdateFeed";

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
    feedConfig : FeedConfig,
    feedCategory : FeedCategory
    categoryDispatch : React.Dispatch<any>
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
                <ol>
                  {props.feedList.filter(fc => fc.categoryId === props.feedCategory.categoryId).map(fc => <FeedCategoryMember key={fc.feedConfigId} feedCategory={props.feedCategory} feedConfig={fc} categoryDispatch={props.feedCategoryDispatch} />)}
                </ol>
            </React.Fragment>);
    }
    else 
      return (
        <React.Fragment>
            <FeedCategoryTitle feedCategory={props.feedCategory} categoryDispatch={props.feedCategoryDispatch} />
            <ol>
              {props.feedList.filter(fc => fc.categoryId === props.feedCategory.categoryId).map(fc => <FeedCategoryMember key={fc.feedConfigId} feedCategory={props.feedCategory} feedConfig={fc} categoryDispatch={props.feedCategoryDispatch} />)}
            </ol>
        </React.Fragment>
        );
    
};

const FeedCategoryTitle : React.FC<FeedCategoryTitleProps> = props => {

    const [{ droppedItem, isOver }, drop] = useDrop({
      accept : FEED_DND_TYPES.feed,
      drop : () => {
        const droppedFeedConfig = droppedItem.feedConfig;

        fetch(`http://localhost:6150/updatefeed?categoryId=${props.feedCategory.categoryId}&name=${droppedFeedConfig.name}&url=${droppedFeedConfig.url}&fetchPeriod=${JSON.stringify(droppedFeedConfig.fetchPeriod)}&enabled=${droppedFeedConfig.enabled}&feedId=${droppedFeedConfig.feedConfigId}`)
            .then(res => res.json())
            .then(returnedObject => {
                
                if (isUpdateFeedSucceedMessage(returnedObject)) {
                    props.categoryDispatch({type : 'setFeeds', feeds : returnedObject.feeds});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
                }
                else if (isUpdateFeedFailedMessage(returnedObject)) {
                    const options = {
                        type: 'error',
                        buttons: ['Ok'],
                        title: 'Nelly | Error',
                        message: returnedObject.message
                    };
                    
                    (window as any).electron.dialog.showMessageBox(null, options);
                }
                else {
                    const options = {
                        type: 'error',
                        buttons: ['Ok'],
                        title: 'Nelly | Error',
                        message : 'An unknown error occured!'
                      };
                      
                     (window as any).electron.dialog.showMessageBox(null, options);
                }

        });
        

      },
      collect : mon => ({
        isOver : mon.isOver(),
        droppedItem : mon.getItem() as FeedDragItem
      })
      
    });

    async function deleteCategory(feedCategory : FeedCategory) {

      const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: `Delete category "${feedCategory.name}"`,
        message : `Are you sure you want to delete the category "${feedCategory.name}"?`,
        detail  : 'Feeds under this category will also be deleted!'
      };
      
      const messageBoxReturnValuePromise : Promise<MessageBoxReturnValue> = (window as any).electron.dialog.showMessageBox(null, options);
      const messageBoxReturnValue = await messageBoxReturnValuePromise;

      if (messageBoxReturnValue.response === 0) {
        //TODO: Remove feeds that belongs to the deleted categories. (CATEGORIES that is, all of them)
        
        fetch(`http://localhost:6150/deletefeedcategory?categoryId=${feedCategory.categoryId}`)
          .then(res => res.json())
          .then(returnedObject => {

            if (isFeedCategoryDeleteSucceedMessage(returnedObject)) {
              
              props.categoryDispatch({type : 'setRootCategory', rootCategory : returnedObject.rootCategory});
              props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
              
              const options = {
                type: 'info',
                buttons: ['Ok'],
                title: 'Nelly | Information',
                message : `${returnedObject.deletedCategory.name} has been deleted successfully.`
              };

             (window as any).electron.dialog.showMessageBox(null, options);
              
            }
            else if(isFeedCategoryDeleteFailedMessage(returnedObject)){
              const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | Error',
                message : returnedObject.message
              };

             (window as any).electron.dialog.showMessageBox(null, options);
            }
            else {
              const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | Error',
                message : 'An unknown error occured!'
              };
              
             (window as any).electron.dialog.showMessageBox(null, options);
            }

          });
    }
  }

    return  (
              <React.Fragment>
                <ContextMenuTrigger id={props.feedCategory.categoryId + '_contextMenu'}>
                  <li ref={drop} style={isOver ? {border : '1px solid #FF0000'} : {}} id={props.feedCategory.categoryId}>{props.feedCategory.name}</li>
                </ContextMenuTrigger>
                <ContextMenu id={props.feedCategory.categoryId + '_contextMenu'}>
                  <MenuItem onClick={(e, data) => {
                    props.categoryDispatch({type : 'setModalTitle', modalTitle : 'Add new feed under  ' + props.feedCategory.name});
                    props.categoryDispatch({type : 'setModalContent', modalContent : <AddFeed categoryDispatch={props.categoryDispatch} feedCategory={props.feedCategory} />});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                  }}>
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
                    {'Update category ' + props.feedCategory.name}
                    </MenuItem>
                    <MenuItem onClick={async (e, data) => deleteCategory(props.feedCategory)}>
                    {'Delete category ' + props.feedCategory.name}
                    </MenuItem>
                  </React.Fragment> : null}
              </ContextMenu>  
        </React.Fragment>
          );
};

const FeedCategoryMember : React.FC<FeedCategoryMemberProps> = props => {

  const [, drag] = useDrag({
    item : {
      type : FEED_DND_TYPES.feed,
      feedConfig : props.feedConfig
    }
  })

  async function deleteFeed(feedConfig : FeedConfig) {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: `Delete feed "${feedConfig.name}"`,
      message : `Are you sure you want to delete the feed "${feedConfig.name}"?`,
      detail  : 'All news feed and archive will be cleaned up!'
    };
    
    const messageBoxReturnValuePromise : Promise<MessageBoxReturnValue> = (window as any).electron.dialog.showMessageBox(null, options);
    const messageBoxReturnValue = await messageBoxReturnValuePromise;
  
    if (messageBoxReturnValue.response !== 0) return;
  
    fetch(`http://localhost:6150/deletefeed?feedId=${feedConfig.feedConfigId}`)
      .then(res => res.json())
      .then(returnedObject => {
          if (isDeleteFeedSucceedMessage(returnedObject)) {
            props.categoryDispatch({type : 'setFeeds', feeds : returnedObject.feeds});
            props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
  
            const options = {
              type: 'info',
              buttons: ['Ok'],
              title: 'Nelly | Information',
              message : `${returnedObject.deletedObject.name} has been deleted successfully.`
            };
  
           (window as any).electron.dialog.showMessageBox(null, options);
  
          }
          else if (isDeleteFeedFailedMessage(returnedObject)) {
            const options = {
              type: 'error',
              buttons: ['Ok'],
              title: 'Nelly | Error',
              message : returnedObject.message
            };
  
           (window as any).electron.dialog.showMessageBox(null, options);
          }
          else {
            const options = {
              type: 'error',
              buttons: ['Ok'],
              title: 'Nelly | Error',
              message : 'An unknown error occured!'
            };
            
           (window as any).electron.dialog.showMessageBox(null, options);
          }
      });
    
  
  }
  

  return  (<React.Fragment>
                <ContextMenuTrigger id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <li ref={drag} id={props.feedConfig.feedConfigId}>{props.feedConfig.name}</li>
                  </ContextMenuTrigger>
                  <ContextMenu id={props.feedConfig.feedConfigId + '_contextMenu'}>
                    <MenuItem onClick={(e, data) => {
                    props.categoryDispatch({type : 'setModalTitle', modalTitle : 'Add new feed under  ' + props.feedCategory.name});
                    props.categoryDispatch({type : 'setModalContent', modalContent : <AddFeed categoryDispatch={props.categoryDispatch} feedCategory={props.feedCategory} />});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                  }}>
                      Add new Feed
                    </MenuItem>
                    <MenuItem onClick={(e, data) => {
                      props.categoryDispatch({type : 'setModalTitle', modalTitle : 'Update feed ' + props.feedConfig.name});
                      props.categoryDispatch({type : 'setModalContent', modalContent : <UpdateFeed categoryDispatch={props.categoryDispatch} feedCategory={props.feedCategory} feedConfig={props.feedConfig} />});
                      props.categoryDispatch({type : 'setModalVisible', modalVisible : true});
                    }}>
                     {'Update ' + props.feedConfig.name}
                    </MenuItem>
                    <MenuItem onClick={(e, data) => deleteFeed(props.feedConfig)}>
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
      
    fetch('http://localhost:6150/getfeeds')
      .then(res => res.json())
      .then(result => {
        const feeds : FeedConfig[] = result;
     
        dispatch({type : 'setFeeds', feeds : feeds});

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