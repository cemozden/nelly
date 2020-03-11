import React, { useRef, useState, useEffect } from "react";
import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";
import { FeedConfig } from "../models/FeedModels";
import { isUpdateFeedSucceedMessage, isUpdateFeedFailedMessage } from "../models/apimessages/FeedMessages";
import { FeedCategory } from "../models/FeedCategoryModels";

interface UpdateFeedProps {
    feedConfig : FeedConfig,
    feedCategory : FeedCategory,
    categoryDispatch : React.Dispatch<any>
}

const UpdateFeed : React.FC<UpdateFeedProps> = props => {

    const [name, setName] = useState(props.feedConfig.name);
    const [url, setURL] = useState(props.feedConfig.url);
    const [fetchPeriod, setFetchPeriod] = useState(props.feedConfig.fetchPeriod);
    const [enabled, setEnabled] = useState(props.feedConfig.enabled);

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

    function handleEnabledChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEnabled(!enabled);
    }

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

        fetch(`http://localhost:6150/updatefeed?categoryId=${props.feedCategory.categoryId}&name=${name}&url=${url}&fetchPeriod=${JSON.stringify(fetchPeriod)}&enabled=${enabled}&feedId=${props.feedConfig.feedConfigId}`)
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

    }

    useEffect(() => {
        (timeUnitSelectBox.current as HTMLSelectElement).selectedIndex = fetchPeriod.unit.valueOf()
    });

    return (
        <form>
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
                <tr><td><label><label>Enabled: </label></label></td><td><input type="checkbox" checked={enabled} onChange={handleEnabledChange} /></td></tr>
                <tr><td colSpan={2}><input type="submit" onClick={handleClick} value="Update feed" /></td></tr>
            </tbody>
            
        </table>
</form>
    );
};


export default UpdateFeed;