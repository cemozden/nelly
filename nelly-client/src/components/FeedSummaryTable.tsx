import React from "react";

export interface FeedSummaryTableProps {
 
}

export interface FeedTableRowProps {
 
}

const FeedTableRow : React.FC<FeedTableRowProps> = props => {


    return (<tr>
                <td></td>
                <td>Title</td>
                <td>Author</td>
                <td>Time</td>
                <td>Category</td>
            </tr>);
    };

const FeedSummaryTable : React.FC<FeedSummaryTableProps> = props => {
    return (
        <div className="feeds">
                <table>
                    
                </table>
            </div>
    );
};

export default FeedSummaryTable;