import React, { useState, useEffect, useRef} from "react";
import { FeedCategory, isFeedCategoryUpdateSucceedMessage, isFeedCategoryUpdateFailedMessage } from "../models/FeedCategoryModels";

interface UpdateFeedCategoryProps {
    feedCategory : FeedCategory,
    categoryDispatch : React.Dispatch<any>
}

const UpdateFeedCategory : React.FC<UpdateFeedCategoryProps> = props => {

    const [categoryName, setCategoryName] = useState(props.feedCategory.name);
    const [categoryVisible, setCategoryVisible] = useState(props.feedCategory.visible !== undefined && props.feedCategory.visible);
    
    const visibilitySelectBox = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        (visibilitySelectBox.current as HTMLSelectElement).selectedIndex = categoryVisible ? 0 : 1;
    });

    function handleVisibilityChange(event : React.ChangeEvent<HTMLSelectElement>) {
        setCategoryVisible(event.target.value === 'true');
    }

    function handleCategoryNameChange(event : React.ChangeEvent<HTMLInputElement>) {
        setCategoryName(event.target.value);
    }

    async function handleClick(event : React.MouseEvent<HTMLInputElement, MouseEvent>) {
        event.preventDefault();
        
        if (categoryName.length === 0) {
            const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | Error',
                message: 'Category name cannot be empty! Please provide a valid category name'
            };

            (window as any).electron.dialog.showMessageBox(null, options);
            return;
        }

        fetch(`http://localhost:6150/updatefeedcategory?categoryId=${props.feedCategory.categoryId}&categoryName=${categoryName}&visible=${categoryVisible}`)
            .then(res => res.json())
            .then(returnedObject => {
                
                if (isFeedCategoryUpdateSucceedMessage(returnedObject)) {
                    props.categoryDispatch({type : 'setRootCategory', rootCategory : returnedObject.rootCategory});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
                }
                else if (isFeedCategoryUpdateFailedMessage(returnedObject)) {
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

    }

    return (<form>
        <table>
            <tr><td><label>Category Name: </label></td><td><input onChange={handleCategoryNameChange} type="text" value={categoryName} /></td></tr>
            <tr><td><label><label>Visible: </label></label></td><td><select ref={visibilitySelectBox} onChange={handleVisibilityChange}>
            <option value="true">Yes</option>
            <option value="false">No</option>
            </select></td></tr>
            <tr><td colSpan={2}><input type="submit" onClick={handleClick} value="Update Category" /></td></tr>
        </table>
</form>);
};

export default UpdateFeedCategory;