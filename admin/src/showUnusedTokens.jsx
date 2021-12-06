import { useEffect, useState } from "react";
import './App.css';
import Modal from './modal';

const ShowUnusedTokens = () => {
    // State:
    //   unusedTokens: array of Token objects
    //   sortBy: column index to sort by
    //   sortOrder: 1 for ascending, -1 for descending
    //   serverError: if not null, show a dialog with a server error
    const [unusedTokens, setUnusedTokens] = useState([]);
    const [sortBy, setSortBy] = useState(0);
    const [sortOrder, setSortOrder] = useState(1);
    const [serverError, setServerError] = useState(null);

    const columns = [
        { title: 'Token', key: 'value' },
        { title: 'Car Model', key: 'carModelName' },
        { title: 'Date Issued', key: 'dateIssued' },
        { title: 'Test data?', key: 'isTest' },
    ];

    const getUnusedTokens = async () => {
        const response = await fetch('/Tokens?isUsed=false');

        if (response.status !== 200) {
            setServerError(await response.text());
            return [];
        }

        return await response.json();
    };

    useEffect(() => {
        // build the list of models when the component is created
        getUnusedTokens()
            .then((res) => { setUnusedTokens(res); });
    }, []);

    // TODO: build sortableTable React element (also done in ratingsView.jsx)
    return (
        <div>
            <h2>Show Unused Tokens</h2>
            {
                (unusedTokens.length === 0) 
                    ? <p>There are no unused tokens in the database.</p> 
                    : (
                        <table className="table table-sm">
                            <caption>Click a heading to sort.</caption>
                            <thead>
                                <tr key={-1}>
                                    {
                                        columns.map((col, index) => (
                                            <th className="pointerCursor" key={index} onClick={() => {
                                                if (index === sortBy) {
                                                    setSortOrder(-sortOrder);
                                                } else {
                                                    setSortBy(index);
                                                }}}>{col.title}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    unusedTokens
                                        .sort((t1, t2) => {
                                            if (t1[columns[sortBy].key] > t2[columns[sortBy].key]) {
                                                return sortOrder;
                                            } else if (t1[columns[sortBy].key] < t2[columns[sortBy].key]) {
                                                return -sortOrder;
                                            } else {
                                                return 0;
                                            }})
                                        .map((token, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td key={0}>
                                                    <a href={`/?token=${token.value.toString()}&isTest=${token.isTest.toString()}`}>{token.value.toString()}</a>
                                                </td>
                                                {
                                                    columns.slice(1).map((col, colIndex) => (
                                                        <td key={colIndex}>{token[col.key].toString()}</td>
                                                    ))
                                                }
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>  
                      )
            }
            <Modal show={serverError}>
                <p>The server returned the following error: {serverError}</p>
                <button className="btn btn-primary btn-sm" onClick={() => {
                    setServerError(null);
                }}>Got it</button>
            </Modal>
        </div>
    );}

export default ShowUnusedTokens;