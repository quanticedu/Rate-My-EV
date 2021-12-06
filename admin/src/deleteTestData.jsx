import { useState } from 'react';
import './App.css';
import Modal from './modal';

const DeleteTestData = () => {
    // State:
    //   showConfirmModal: if true, show the modal confirming the delete operation
    //   deleted: if true, data was deleted
    //   serverError: if not null, show the server error in a modal
    const [showConfirmModal, setShowConfirmModal] = useState(true);
    const [deleted, setDeleted] = useState(false);
    const [serverError, setServerError] = useState(null);

    const deleteTestData = async () => {
        const response = await fetch('/TestData', {
            method: 'DELETE',
        });

        // the API doesn't generate specific errors for this route and method
        if (response.status !== 200) {
            setServerError(`${response.status}: ${response.statusText}. Please let the devs know.`);
            return;
        }

        setDeleted(true);
    };

    return (
        <div>
            <h2>Delete Test Data</h2>
            {(deleted) 
              ? <p>Test data deleted</p>
              : (
                   <div>
                       <p>Delete operation aborted.</p>
                       <button className="btn btn-primary" onClick={() => {setShowConfirmModal(true)}}>Delete</button>
                   </div>
                )
            }
            <Modal show={showConfirmModal}>
                <p>This operation cannot be reversed. Are you sure?</p>
                <button className="btn btn-danger btn-sm" onClick={() => {
                    setShowConfirmModal(false);
                    deleteTestData();
                }}>Yes</button>
                <button className="btn btn-primary btn-sm" onClick={() => {setShowConfirmModal(false)}}>No</button>
            </Modal>
            <Modal show={serverError}>
                        <p>The server reported the following error: {serverError}</p>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setServerError(null);
                        }}>Got it</button>
            </Modal>
        </div>
    );
}

export default DeleteTestData;