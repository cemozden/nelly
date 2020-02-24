import React, { useState, useEffect, useRef, useContext } from "react";
import { FeedCategory } from "../config/FeedConfigManager";
import { ApplicationContext } from "../App";

interface UpdateFeedCategoryProps {
    feedCategory : FeedCategory,
    categoryDispatch : React.Dispatch<any>
}

const UpdateFeedCategory : React.FC<UpdateFeedCategoryProps> = props => {

    const appContext = useContext(ApplicationContext);
    const updateFeedCategoryLanguage = appContext.language.sidebar.updateCategory;

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
                title: 'Nelly | ' + appContext.language.error,
                message: appContext.language.validations.updateCategoryValidation.categoryNameCannotBeEmpty
            };
            (window as any).electron.dialog.showMessageBox(null, options);
            return;
        }

        const updatedFeedCategory : FeedCategory = {
            ...props.feedCategory
        }

        updatedFeedCategory.name = categoryName;
        updatedFeedCategory.visible = categoryVisible;

        const feedConfigManager = appContext.configManager.getFeedConfigManager();

        try {
            const feedCategoryUpdated = await feedConfigManager.updateFeedCategory(updatedFeedCategory, props.feedCategory);

            if (feedCategoryUpdated) {
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

    }

    return (<form>
        <table>
            <tr><td><label>{updateFeedCategoryLanguage.categoryName}: </label></td><td><input onChange={handleCategoryNameChange} type="text" value={categoryName} /></td></tr>
            <tr><td><label><label>{updateFeedCategoryLanguage.visible}: </label></label></td><td><select ref={visibilitySelectBox} onChange={handleVisibilityChange}>
            <option value="true">{appContext.language.yes}</option>
            <option value="false">{appContext.language.no}</option>
            </select></td></tr>
            <tr><td colSpan={2}><input type="submit" onClick={handleClick} value={updateFeedCategoryLanguage.updateCategory} /></td></tr>
        </table>
</form>);
};

export default UpdateFeedCategory;