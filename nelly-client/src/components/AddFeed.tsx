import React, { useState, useEffect, useRef } from "react";
import { FeedCategory } from "../models/FeedCategoryModels";
import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";
import { isAddFeedSucceedMessage, isAddFeedFailedMessage } from "../models/apimessages/FeedMessages";
import { MessageBoxReturnValue } from "electron";

interface AddFeedProps {
    feedCategory : FeedCategory,
    categoryDispatch : React.Dispatch<any>
}

const AddFeed : React.FC<AddFeedProps> = props => {
    
    const [name, setName] = useState('');
    const [url, setURL] = useState('');
    const [fetchPeriod, setFetchPeriod] = useState({ unit : TimeUnit.MINUTES, value : 5 } as Duration);
    const [enabled, setEnabled] = useState(true);

    const enableSelectBox = useRef<HTMLSelectElement>(null);
    const timeUnitSelectBox = useRef<HTMLSelectElement>(null);

    function handleFeedNameChange(event : React.ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleUrlChange(event : React.ChangeEvent<HTMLInputElement>) {
        setURL(event.target.value);
    }

    function handleTimeUnitChange(event : React.ChangeEvent<HTMLSelectElement>) {
        const updatedFetchPeriod : Duration = {
            unit : TimeUnit[event.target.value as keyof typeof TimeUnit],
            value : fetchPeriod.value
        };

        setFetchPeriod(updatedFetchPeriod);

    }

    function handleTimeValueChange(event : React.ChangeEvent<HTMLInputElement>) {
        
        const updatedFetchPeriod : Duration = {
            unit : fetchPeriod.unit,
            value : parseInt(event.target.value)
        }

        setFetchPeriod(updatedFetchPeriod);
    }

    function handleEnabledChange(event : React.ChangeEvent<HTMLSelectElement>) {
        setEnabled(event.target.value === 'true');
    }

    /**
     * 
     * Should be tested on electron client.
     */
    async function handleClick(event : React.MouseEvent<HTMLInputElement, MouseEvent>) {
        event.preventDefault();

        if (name.length === 0) {
            const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | Error',
                message: 'Feed name cannot be empty! Please provide a valid feed name.'
            };
            (window as any).electron.dialog.showMessageBox(null, options);
            return;
        }

        if (url.length === 0) {
            const options = {
                type: 'error',
                buttons: ['Ok'],
                title: 'Nelly | Error',
                message: 'Feed URL cannot be empty! Please provide a valid URL.'
            };
            (window as any).electron.dialog.showMessageBox(null, options);
            return;
        }

        const selectedTimeUnit = timeUnitSelectBox.current?.options[timeUnitSelectBox.current.selectedIndex].text;
        const selectedEnableOption = enableSelectBox.current?.options[enableSelectBox.current.selectedIndex].text;

        const options = {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: `Add new feed "${name}"`,
            message : 'Are you sure you want to add the following feed?',
            detail  : `Name: ${name}\nURL: ${url}\nFetch Period: ${fetchPeriod.value} ${selectedTimeUnit}\nEnabled: ${selectedEnableOption}`
          };
          
        const messageBoxReturnValuePromise : Promise<MessageBoxReturnValue> = (window as any).electron.dialog.showMessageBox(null, options);
        const messageBoxReturnValue = await messageBoxReturnValuePromise;

        if (messageBoxReturnValue.response !== 0) return;

        fetch(`http://localhost:6150/addfeed?categoryId=${props.feedCategory.categoryId}&name=${name}&url=${url}&fetchPeriod=${JSON.stringify(fetchPeriod)}&enabled=${enabled}`)
            .then(res => res.json())
            .then(returnedObject => {

                if (isAddFeedSucceedMessage(returnedObject)) {
                    props.categoryDispatch({type : 'setFeeds', feeds : returnedObject.feeds});
                    props.categoryDispatch({type : 'setModalVisible', modalVisible : false});
                }
                else if (isAddFeedFailedMessage(returnedObject)) {
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

    useEffect(() => {
        (enableSelectBox.current as HTMLSelectElement).selectedIndex = enabled ? 0 : 1;
        (timeUnitSelectBox.current as HTMLSelectElement).selectedIndex = fetchPeriod.unit.valueOf()
    });

    return (<form>
        <table>
            <tbody>
                <tr><td><label>Feed Name: </label></td><td><input onChange={handleFeedNameChange} type="text" value={name} /></td></tr>
                <tr><td><label>URL: </label></td><td><input onChange={handleUrlChange} type="text" value={url} /></td></tr>
                <tr><td><label><label>Fetch Period: </label></label></td><td><input type="text" onChange={handleTimeValueChange} value={fetchPeriod.value} />
                    <select ref={timeUnitSelectBox} onChange={handleTimeUnitChange} value="true">
                        <option value="0">Seconds</option>
                        <option value="1">Minutes</option>
                        <option value="2">Hours</option>
                        <option value="3">Days</option>
                        <option value="4">Months</option>
                    </select>
                </td></tr>
                <tr><td><label><label>Enabled: </label></label></td><td><select ref={enableSelectBox} onChange={handleEnabledChange} value="true">
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select></td></tr>
                <tr><td colSpan={2}><input type="submit" onClick={handleClick} value="Add Feed" /></td></tr>
            </tbody>
            
        </table>
</form>);
}

export default AddFeed;