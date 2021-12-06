import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './modal';
import Rating from './rating'

const AddRating = ({ show, tokenValue, createAsTest }) => {
    // Props:
    //     createAsTest: if true, create the rating as test data
    //     show: if false, don't show this element
    //     tokenValue: the value of a token to show
    // State:
    //     token: the rating token to use
    //     showBadToken: if true, show the bad token dialog
    //     serverError: if not null, show a dialog with the server error
    //     ratings: the ratings to set
    //     showRatingComplete: if true, show the rating complete dialog
    //     tokenInput: the value for a manually-entered token
    const [token, setToken] = useState({ });
    const [showBadToken, setShowBadToken] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [ratings, setRatings] = useState({ });
    const [showRatingComplete, setShowRatingComplete] = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    
    const getToken = async (value) => {
        const response = await fetch(`/Tokens?value=${value}&isUsed=false`);

        if (response.status !== 200) {
            setServerError(await response.text());
            return { };
        }

        const data = await response.json();
        if (data.length !== 1) {
            return { };
        }

        return data[0];
    };

    const createRatings = async (showTestRatingHeaders) => {
        const response = await fetch(showTestRatingHeaders ? '/RatingHeaders' : '/RatingHeaders?isTest=false');

        if (response.status !== 200) {
            setServerError(await response.text());
            return { };
        }

        const headers = await response.json();
        const ratingsObject = { };
        headers.forEach((header) => { ratingsObject[header.header] = 1; });
        return ratingsObject;
    };

    const submitRatings = async () => {
        const ratingsToAdd = Object.keys(ratings).map((key) => ({ 
            rating: ratings[key],
            isTest: createAsTest, 
            token: token.value, 
            ratingHeader: key 
        }));

        const response = await fetch('/Ratings', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(ratingsToAdd),
        });

        if (response.status !== 200) {
            setServerError(await response.text());
            return;
        }

        setShowRatingComplete(true);
        setRatings({ });
    };

    useEffect(() => {
        if (show) {
            if (tokenValue) {
                if (tokenValue && tokenValue.trim()) {
                    getToken(tokenValue.trim())
                      .then((res) => {  
                          if (Object.keys(res).length === 0) {
                              setShowBadToken(true);
                          } else {
                              setToken(res);
                          }
                      });
                }
            }

            createRatings(createAsTest)
              .then((res) => {
                setRatings(res);
              });
        }
    }, [show, tokenValue, createAsTest]);

    return (show ?
        <div>
            <p>Congratulations on your new {token.carModelName || ''}! Rate it using the controls below.</p>
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-md-auto">
                        <table className="table table-borderless">
                            <tbody>
                                {Object.keys(ratings).map((category, index) => (
                                    <tr key={index}>
                                        <td key={0} style={{textAlign: 'left'}}>
                                            <span className="onGreenBg">{category}</span> <br />
                                            <Rating rating={ratings[category]} /> <br />
                                            <input
                                                className="onGreenBg"
                                                type="range"
                                                style={{width: '142px'}}
                                                min={1}
                                                max={5}
                                                value={ratings[category]}
                                                onChange={(event) => {
                                                    ratings[category] = event.target.valueAsNumber;
                                                    setRatings(Object.assign({ }, ratings));
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col">
                        <button className="btn btn-primary" onClick={() => {
                            submitRatings();
                        }
                        } >Submit</button>
                    </div>
                </div>
            </div>
            <Modal show={(Object.keys(token).length === 0) && !showBadToken}>
                <label>
                    Enter the token you received from the government:
                    <input value={tokenInput} placeholder="Enter a token here" onChange={(event) => {setTokenInput(event.target.value);}} />
                </label>
                <button className="btn btn-primary" onClick={() => {
                    getToken(tokenInput.trim())
                        .then((newToken) => {
                            if (Object.keys(newToken).length > 0) {
                                setToken(newToken);
                            } else {
                                setShowBadToken(true);
                            }
                        });
                }}>Go</button>
            </Modal>
            <Modal show={serverError}>
                <p>Oops...it looks like our server needs a quick recharge! Try again later.</p>
                <p>Error from server: {serverError}</p>
                <button className="btn btn-primary" onClick={() => {
                    setServerError(null);
                }}>Got it</button>
            </Modal>
            <Modal show={showBadToken}>
                <p>
                    That token isn't valid. It may have already been used. 
                    You'll need to get another token from the government.
                </p>
                <button className="btn btn-primary" onClick={() => {
                    window.location.replace(window.location.origin);
                }}>Got it</button>
            </Modal>
            <Modal show={showRatingComplete}>
                <p>
                    Thanks for rating your ride! Click the button below to
                    view all ratings.
                </p>
                <button className="btn btn-primary" onClick={() => {
                    window.location.replace(`${window.location.origin}${createAsTest ? '/?isTest=true' : ''}`);
                }}>
                    Proceed
                </button>
            </Modal>
        </div>
        : null
    );
}

export default AddRating;