import { useState, useEffect } from 'react';
import Modal from './modal';
import './App.css';

const ManageHeaders = () => {
    // State:
    //    headers: array of RatingHeader objects
    //    showConfirmDeleteDialog: if true, show the confirm delete dialog
    //    headerToBeDeleted: a header to be deleted
    //    headerToBeAdded: the name of a header to be added
    //    serverError: if not null, show a dialog with the server error
    const [headers, setHeaders] = useState([]);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [headerToBeDeleted, setHeaderToBeDeleted] = useState(null);
    const [headerToBeAdded, setHeaderToBeAdded] = useState('');
    const [serverError, setServerError] = useState(null);

    const getHeaders = async () => {
        const response = await fetch('/RatingHeaders');

        if (response.status !== 200) {
            setServerError(await response.text());
            return [];
        }

        const data = await response.json();
        return data;
    }

    useEffect(() => {
        // build the headers, including property for updated data
        getHeaders()
            .then((res) => { 
                const hdrs = res.map((header) => {
                    header.newHeader = header.header;
                    header.newIsTest = header.isTest;
                    return header;
                })
                setHeaders(hdrs); 
            });
    }, []);

    const saveHeader = async (header) => {
        const response = await fetch('/RatingHeaders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentHeader: header.header, header: header.newHeader, isTest: header.newIsTest }),
        });

        if (response.status !== 200) {
            setServerError(await response.text());
            header.newHeader = header.header;
            header.newIsTest = header.isTest;
            setHeaders(headers.slice());
            return;
        }

        const newHeader = await response.json();
        header.header = header.newHeader = newHeader.header;
        header.isTest = header.newIsTest = newHeader.isTest;
        setHeaders(headers.slice());
    }

    const deleteHeader = async () => {
        const response = await fetch('/RatingHeaders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify( { header: headerToBeDeleted.header }),
        });

        if (response.status === 400) {
            setServerError("The request body wasn't formed properly. This is a programming error...please let the devs know.");
            return;
        } else if (response.status === 409) {
            setServerError(`The server reports the following SQL error: ${await response.text()}. Please let the devs know.`);
            return;
        } else if (response.status !== 200) {
            setServerError(`The server reported the following error: ${await response.text()}. Please let the devs know.`);
            return;
        }

        const { deleted } = await response.json();

        if (deleted !== 1) {
            setServerError(`Error: server reports ${deleted} headers deleted.`)
            return;
        }

        setHeaders(headers.filter((header) => (header.header !== headerToBeDeleted.header)));
        setHeaderToBeDeleted(null);
    }

    const addHeader = async () => {
        const response = await fetch('/RatingHeaders', { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ header: headerToBeAdded }),
        });

        if (response.status === 400) {
            setServerError("The request body wasn't formed properly. This is a programming error...please let the devs know.");
            return;
        } else if (response.status === 409) {
            setServerError("The header is already in use or is empty. This is a programming error...please let the devs know.");
            return;
        } else if (response.status !== 200) {
            setServerError(`${await response.text()}. Please let the devs know.`);
            return;
        }

        const newHeader = await response.json();
        newHeader.newHeader = newHeader.header;
        newHeader.newIsTest = newHeader.isTest;

        const newHeaders = headers.slice();
        newHeaders.push(newHeader);
        setHeaders(newHeaders);
        setHeaderToBeAdded('');
    }

    // TODO: build sortableTable React element
    return (
        <div>
            <h2>Manage Headers</h2>
            <table className="table table-sm">
                <thead>
                    <tr key={-1}>
                        <th key={0}></th>
                        <th key={1}>Header</th>
                        <th key={2}>Test data</th>
                        <th key={3}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        headers.sort((h1, h2) => {
                            if (h1.header > h2.header) {
                                return 1;
                            } else if (h1.header < h2.header) {
                                return -1;
                            } else {
                                return 0;
                            }
                        })
                          .map((header, rowIndex) => (
                              <tr key={rowIndex}>
                                  <td key={0}>{((header.header !== header.newHeader) || (header.isTest !== header.newIsTest)) ? '*' : ''}</td>
                                  <td key={1}>
                                      <input 
                                          className="form-control"
                                          type="text" 
                                          value={header.newHeader}
                                          onChange={(event) => {
                                              header.newHeader = event.target.value;
                                              setHeaders(headers.slice()); // shallow copy for the hook
                                          }} />
                                  </td>
                                  <td key={2}>
                                      <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={header.newIsTest}
                                          onChange={() => {
                                              header.newIsTest = !header.newIsTest;
                                              setHeaders(headers.slice()); // shallow copy to update state hook
                                          }} />
                                  </td>
                                  <td key={3}>
                                      <button className="btn btn-primary btn-sm" onClick={() => { saveHeader(header); }}>Save</button>
                                      <button className="btn btn-danger btn-sm" onClick={() => { 
                                          setHeaderToBeDeleted(header);
                                          setShowConfirmDeleteDialog(true);
                                       }}>Delete</button>
                                  </td>
                              </tr>
                          ))
                    }
                    <tr key={headers.length}>
                        <td key={0}></td>
                        <td key={1}>
                            <input
                                className="form-control"
                                type="text"
                                value={headerToBeAdded}
                                onChange={(event) => { setHeaderToBeAdded(event.target.value); }}
                                placeholder="Enter the name of a new header" />
                        </td>
                        <td key={2}>
                            <button className="btn btn-primary btn-sm" onClick={() => { addHeader(); }}>Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <Modal show={showConfirmDeleteDialog}>
                <p>This will delete all data associated with this header. Are you sure?</p>
                <button className="btn btn-danger btn-sm" onClick={() => {
                    setShowConfirmDeleteDialog(false);
                    deleteHeader();
                }}>Yes</button>
                <button className="btn btn-primary btn-sm" onClick={() => {
                    setShowConfirmDeleteDialog(false);
                }}>No</button>
            </Modal>
            <Modal show={serverError}>
                <p>The server returned the following error: {serverError}</p>
                <button className="btn btn-primary btn-sm" onClick={() => {
                    setServerError(null);
                }}>Got it</button>
            </Modal>
        </div>
    );
}

export default ManageHeaders;