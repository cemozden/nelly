import React, { useState } from "react";
import { FeedCategory } from "../models/FeedModels";


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

    /*async function handleClick(event : React.MouseEvent<HTMLInputElement, MouseEvent>) {
        event.preventDefault();
        
        if (categoryName.length === 0) {
            const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | ' + appContext.language.error,
                message: appContext.language.validations.addNewCategoryValidation.categoryNameCannotBeEmpty
            };
            (window as any).electron.dialog.showMessageBox(null, options);
            return;
        }

        const feedConfigManager = appContext.configManager.getFeedConfigManager();

        const feedCategory : FeedCategory = {
            categoryId : crc32(Math.random().toString(36).substring(2, 9)).toString(16),
            childCategories : [],
            name : categoryName,
            visible : categoryVisible
        };

        try {
            const addFeedCategoryResult = await feedConfigManager.addFeedCategory(feedCategory, props.parentCategory);

            if (addFeedCategoryResult) {
                const rootCategory = feedConfigManager.getRootCategory();
                props.categoryDispatch({type : 'setRootCategory', rootCategory : rootCategory});
                props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
            }

        }
        catch (err) {
            const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | ' + appContext.language.error,
                message: err.message
            };
            (window as any).electron.dialog.showMessageBox(null, options);
        }
        
    }*/

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
                        <tr><td colSpan={2}><input type="submit" /*onClick={handleClick}*/ value="Add Category" /></td></tr>
                    </tbody>
                    
                </table>
        </form>)
};


export default AddNewCategory;