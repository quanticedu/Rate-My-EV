import { useEffect, useState } from "react";
import './App.css';
import Modal from './modal';

const AddTestToken = () => {
    // State:
    //   carModels: array of all car models in the database
    //   inputModel: the model name currently input
    //   showConfirmModal: if true, show the modal confirming a new model entry
    //   showEmptyModelModal: if true, show the modal informing the user they
    //                        must have a model entry
    //   showTokenModal: if true, show the modal displaying a new token value
    //   token: the most recent token value to be created
    //   serverError: if not null, show a dialog with the error
    const [carModels, setCarModels] = useState([]);
    const [inputModel, setInputModel] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showEmptyModelModal, setShowEmptyModelModal] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [token, setToken] = useState(false);
    const [serverError, setServerError] = useState(null);

    const getCarModels = async () => {
        const response = await fetch('/CarModels');

        if (response.status !== 200) {
            setServerError(await response.text());
            return [];
        }

        const data = await response.json();
        return data;
    };

    useEffect(() => {
        // build and sort the list of models when the component is created
        getCarModels()
            .then((res) => { setCarModels(res); });
    }, []);

    const addToken = async () => {
        const chosenInputModel = inputModel.trim();
        let modelFound = null;

        for (let i = 0; i < carModels.length; i++) {
            if (carModels[i].name.toLowerCase() === chosenInputModel.toLowerCase()) {
                modelFound = carModels[i];
                break;
            }
        }

        if (!modelFound) {
            setShowConfirmModal(true);
        } else {
            getNewToken(modelFound.name);
        }
    };

    const addTokenAndModel = async () => {
        const response = await fetch('/CarModels', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: inputModel.trim(),
                isTest: true,
            })
        });

        if (response.status === 400) {
            setServerError('The body of the request was not formed correctly. This is a programming error...please let the devs know.');
            return;
        } else if (response.status === 409) {
            setServerError('A car model name is empty or already in use. This shouldn\'t happen...please let the devs know.');
            return;
        } else if (response.status !== 200) {
            setServerError(`${response.status}: ${response.statusText}. Please let the devs know.`);
            return;
        }

        const data = await response.json();
        setCarModels(carModels.concat([{ name: data.name, isTest: data.isTest }]));
        getNewToken(inputModel.trim());
    };

    const getNewToken = async (carModelName) => {
        const response = await fetch('/Tokens', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carModelName: carModelName,
                isTest: true,
            })
        });

        if (response.status !== 200) {
            setServerError(await response.text());
            return;
        }

        const data = await response.json();
        setToken(data.tokenValue);
        setShowTokenModal(true);
};
    
    return (
        <div>
            <h2>Add Test Token</h2>
            <div className="container">
                <div className="row">
                    <div className="col-2">
                        <p>EV Model:</p>
                    </div>
                    <div className="col fillBootstrapColumn">
                        <input
                            className="formControl fillBootstrapColumn"
                            placeholder="Enter the model of the EV for this token"
                            value={inputModel} 
                            onChange={(event) => {
                                setInputModel(event.target.value);
                            }} 
                        />
                        <ul className="list-group">
                            {carModels
                                 .filter((entry) => (entry.name.toLowerCase().includes(inputModel.toLowerCase().trim())))
                                 .sort((e1, e2) => {
                                     if (e1.name > e2.name) {
                                         return 1;
                                     } else if (e1.name < e2.name) {
                                         return -1;
                                     } else {
                                         return 0;
                                     }
                                 })
                                 .map((entry, idx) => (
                                    <li
                                        className="list-group-item pointerCursor"
                                        key={idx}
                                        onClick={(event) => {setInputModel(event.target.outerText)}}>
                                        {entry.name}
                                    </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-2">
                        <button className="btn btn-primary" onClick={addToken}>Add token</button>
                    </div>
                    <Modal show={showConfirmModal}>
                        <p>That model doesn't exist in the database. Would you like to add it?</p>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setShowConfirmModal(false);
                            addTokenAndModel();
                        }}>Yes</button>
                        <button className="btn btn-danger btn-sm" onClick={() => {setShowConfirmModal(false)}}>No</button>
                    </Modal>
                    <Modal show={showEmptyModelModal}>
                        <p>You need to either select a model or enter a new model.</p>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setShowEmptyModelModal(false);
                        }}>Got it</button>
                    </Modal>
                    <Modal show={showTokenModal}>
                        <p>Your new token is <a href={`/?token=${token}&isTest=true`}>{token}</a>. Click on it to use it in a rating, or copy it to the clipboard to use later.</p>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setShowTokenModal(false);
                        }}>Got it</button>
                    </Modal>
                    <Modal show={serverError}>
                        <p>The server reported the following error: {serverError}</p>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setServerError(null);
                        }}>Got it</button>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default AddTestToken;