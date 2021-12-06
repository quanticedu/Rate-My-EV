import React, { useState, useEffect } from 'react';
import './App.css';
import Rating from './rating';
import Modal from './modal';

const RatingsView = ({ show, showTestData }) => {
    /* Props:
         show: if false, don't show this element
         showTest: if true, show test data instead of live

       State:
         ratings: object containing the headers and rating data from the database.
         sortBy: column index to sort by (-1 is the model name)
         sortOrder: 1 for ascending, 2 for descending
         serverError: if not null, display the server error in a dialog
    */
    const [ratings, setRatings] = useState(
        {
            headers: [],
            data: { },
        }
    );
    const [sortBy, setSortBy] = useState(-1);
    const [sortOrder, setSortOrder] = useState(1);
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        const getRatings = async () => {
            const response = await fetch(`/Ratings?tallyResults=true&isTest=${showTestData.toString()}`);

            if (response.status !== 200) {
                setServerError(await response.text());
                return;
            }
    
            // build headers and ratings based on the response. need to get all possible headers first.
            const res = await response.json();

            if (res.length === 0) {
                setRatings({
                    headers: [],
                    data: { },
                });

                return;
            }

            const headers = [];

            res.forEach((rating) => {
                if (headers.indexOf(rating.ratingHeader) === -1) {
                    headers.push(rating.ratingHeader);
                }
            });
    
            headers.push('Overall');
                const data = { };
    
            res.forEach((rating) => {
                if (!data[rating.carModel]) {
                    data[rating.carModel] = Array(headers.length);
                }
    
                data[rating.carModel][headers.indexOf(rating.ratingHeader)] = rating.rating;
            });

            // fill in null values and compute overall ratings
            Object.keys(data).forEach((carModel) => {
                data[carModel] = data[carModel].map((rating) => (rating || 0));
                const withoutZeroes = data[carModel].filter((rating) => (rating > 0)); // zeroes don't count in the average
                data[carModel][headers.indexOf('Overall')] = withoutZeroes.reduce((r1, r2) => (r1 + r2)) / withoutZeroes.length;
            })
    
            setRatings({
                headers: headers,
                data: data
            });
        }

        if (show) { // get fresh data from the db each time this element is shown
            getRatings();
        }
    }, [show, showTestData]);

    return (show ?
        <div className="content" >
            {
                (Object.keys(ratings.data).length === 0)
                    ? <p>There aren't any ratings to show (yet).</p>
                    : (
                        <table className="table table-sm table-onGreenBg">
                            <caption className="caption-top onGreenBg">Click a heading to sort.</caption>
                            <thead>
                                <tr key={-1}>
                                    <th className="sortableHeader" key={-1} onClick={() => {
                                        if (sortBy === -1) {
                                            setSortOrder(-sortOrder);
                                        } else {
                                            setSortBy(-1);
                                        }
                                    }}>Model</th>
                                    {
                                        ratings.headers.map((header, index) => (
                                            <th className="sortableHeader" key={index} onClick={() =>{
                                                if (index === sortBy) {
                                                    setSortOrder(-sortOrder);
                                                } else {
                                                    setSortBy(index);
                                                }
                                            }}>{header}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody className="text-start">
                                {
                                    Object.keys(ratings.data)
                                        .sort((k1, k2) => {
                                            if (sortBy === -1) {
                                                if (k1 > k2) {
                                                    return sortOrder;
                                                } else if (k1 < k2) {
                                                    return -sortOrder;
                                                } else {
                                                    return 0;
                                                }
                                            } else {
                                                return sortOrder * (ratings.data[k1][sortBy] - ratings.data[k2][sortBy]);
                                            }})
                                        .map((carModel, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td key={-1}>{carModel}</td>
                                                {
                                                    ratings.data[carModel].map((rating, colIndex) => (
                                                        <td key={colIndex} title={rating ? `Rating: ${Math.round(rating * 10) / 10}` : 'Not rated'}>
                                                            <Rating rating={rating} />
                                                        </td>
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
                <p>Oops...it looks like our server needs a quick recharge! Try again later.</p>
                <p>Error from server: {serverError}</p>
                <button className="btn btn-primary btn-sm" onClick={() => {
                    setServerError(null);
                }}>Got it</button>
            </Modal>
        </div>
        : null
    );
};

export default RatingsView;