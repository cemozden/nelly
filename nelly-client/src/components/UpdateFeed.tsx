import React, { useRef, useState, useEffect } from "react";
import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";
import { FeedConfig } from "../models/FeedModels";

interface UpdateFeedProps {
    feedConfig : FeedConfig,
    categoryDispatch : React.Dispatch<any>
}

const UpdateFeed : React.FC<UpdateFeedProps> = props => {

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

    async function handleClick(event : React.MouseEvent<HTMLInputElement, MouseEvent>) {
        event.preventDefault();
    }

    useEffect(() => {
        (enableSelectBox.current as HTMLSelectElement).selectedIndex = enabled ? 0 : 1;
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
                <tr><td><label><label>Enabled: </label></label></td><td><select ref={enableSelectBox} onChange={handleEnabledChange} value="true">
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select></td></tr>
                <tr><td colSpan={2}><input type="submit" onClick={handleClick} value="Update feed" /></td></tr>
            </tbody>
            
        </table>
</form>
    );
};


export default UpdateFeed;