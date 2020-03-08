import React, { useState } from "react";
import { FeedCategory, isFeedCategoryAddSucceedMessage, isFeedCategoryAddFailedMessage } from "../models/FeedCategoryModels";


interface AddNewCategoryProps {
    parentCategory : FeedCategory,
    categoryDispatch : React.Dispatch<any>
}

const AddNewCategory : React.FC<AddNewCategoryProps> = props => {
    
    const [categoryName, setCategoryName] = useState('');
    const [categoryVisible, setCategoryVisible] = useState(true);

    function handleVisibilityChange(event : React.ChangeEvent<HTMLSelectElement>) {
        setCategoryVisible(event.target.value === 'true');
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

        fetch(`http://localhost:6150/addfeedcategory?categoryName=${categoryName}&visible=${categoryVisible}&parentCategoryId=${props.parentCategory.categoryId}`)
            .then(res => res.json())
            .then(returnedObject => {
                
                if (isFeedCategoryAddSucceedMessage(returnedObject)) {
                    props.categoryDispatch({type : 'setRootCategory', rootCategory : returnedObject.rootCategory});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : false});        
                }
                else if(isFeedCategoryAddFailedMessage(returnedObject)) {
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

    function handleCategoryNameChange(event : React.ChangeEvent<HTMLInputElement>) {
        setCategoryName(event.target.value);
    }

    return (<form>
                <table>
                    <tbody>
                        <tr><td><label>Category Name: </label></td><td><input onChange={handleCategoryNameChange} type="text" value={categoryName} /></td></tr>
                        <tr><td><label><label>Visible: </label></label></td><td><select onChange={handleVisibilityChange} value="true">
                        <option value="true">Yes</option>
                        <option value="false">Yes</option>
                        </select></td></tr>
                        <tr><td colSpan={2}><input type="submit" onClick={handleClick} value="Add Category" /></td></tr>
                    </tbody>
                    
                </table>
        </form>)
};


export default AddNewCategory;