import { useEffect, useRef, useState } from "react";
import './App.css';
import Modal from './modal';

const LoadTest = () => {
    // State:
    //   requestsPerSecond: the number of requests to send each second
    //   serverError: if not null, show a dialog with the error
    //   backlog: number of requests not yet responded to
    //   answered: number of requests answered
    const [requestsPerSecond, setRequestsPerSecond] = useState(0.5);
    const [serverError, setServerError] = useState(null);
    const [backlog, setBacklog] = useState(0);
    const [answered, setAnswered] = useState(0);

    // Ref:
    //   intervalID: the ID of the latest setInterval call
    //   pendingRequests: the number of pending requests
    //   answeredRequests the number of answered requests
    const intervalID = useRef(null);
    const pendingRequests = useRef(0);
    const answeredRequests = useRef(0);

    const responseReceived = () => {
        let v = pendingRequests.current;
        pendingRequests.current = v - 1;
        setBacklog(pendingRequests.current);
        v = answeredRequests.current;
        answeredRequests.current = v + 1;
        setAnswered(answeredRequests.current);
    }

    const responseError = (err) => {
        if (intervalID.current) {
            clearInterval(intervalID.current);
        }

        setBacklog(0);
        setServerError(err);
    }

    const sendRequest = async () => {
        let v = pendingRequests.current;
        pendingRequests.current = v + 1;
        setBacklog(pendingRequests.current);

        fetch('/CarModels')
            .then(responseReceived, responseError);
    };

    useEffect(() => {
        // start sending requests when the component is created
        intervalID.current = setInterval(sendRequest, 1000 * (1 / requestsPerSecond));

        // clear the interval once the component unloads
        return () => {
            if (intervalID.current) {
                clearInterval(intervalID.current);
            }
        }
    }, []);

    const setNewFrequency = (value) => {
        if (intervalID.current) {
            clearInterval(intervalID.current);
        }

        if (value > 0) {
            intervalID.current = setInterval(sendRequest, 1000 * (1 / value));
            setRequestsPerSecond(value);
        }
}

    return (
        <div>
            <h2>Load Test</h2>
            <div className="container">
                <div className="row">
                    <label htmlFor="requestsPerSecond">Requests per second:</label>
                    <input 
                        type="number" 
                        id="requestsPerSecond" 
                        name="requestsPerSecond" 
                        min="0"
                        max="100" 
                        value={requestsPerSecond} 
                        step="0.1" 
                        onChange={(event) => { setNewFrequency(event.target.value); }}
                        />
                    <p>Answered requests: {answered}</p>
                    <p>Unanswered requests: {backlog}</p>
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

export default LoadTest;