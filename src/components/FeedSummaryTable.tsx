import React from "react";
import { FeedItem } from "../rss/specifications/RSS20";

export interface FeedSummaryTableProps {
    feedItems : FeedItem[]
}

export interface FeedTableRowProps {
    feedItem : FeedItem
}

const FeedTableRow : React.FC<FeedTableRowProps> = props => {

    const feedItem = props.feedItem;

    return (<tr>
                <td></td>
                <td>{feedItem.title}</td>
                <td>{feedItem.author}</td>
                <td>{feedItem.pubDate?.toLocaleTimeString()}</td>
                <td>{feedItem.category?.join(',')}</td>
            </tr>);
    };

const FeedSummaryTable : React.FC<FeedSummaryTableProps> = props => {
    return (
        <div className="feeds">
                <table>
                    {props.feedItems.map(fi => <FeedTableRow feedItem={fi} />)}
                </table>
            </div>
    );
};

export default FeedSummaryTable;