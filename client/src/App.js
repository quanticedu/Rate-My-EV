import React, { useState, useEffect } from 'react';
import './App.css';
import RatingsView from './ratingsView';
import AddRating from './addRating';

const App = () => {
  // enumeration for the views possible in the app
  const viewTypes = {
    SHOW_RATINGS: "show ratings",
    ADD_RATING: "add rating"
  }

  /* State:
        view: enumeration reflecting the current view showing in the app
        isTest: if true, show test headers and create test ratings
        token: if specified in the query, the token for which to add a rating
  */
  const [view, setView] = useState(viewTypes.SHOW_RATINGS);
  const [isTest, setIsTest] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (window.location.search) {
      const url = new URL(window.location.href);
      const tokenValue = url.searchParams.get("token");

      if (tokenValue && tokenValue.trim()) {
        setView(viewTypes.ADD_RATING);
        setToken(tokenValue.trim());
      }

      const isTest = url.searchParams.get("isTest")

      if (isTest) {
        setIsTest(true);
      }
    }
  }, [viewTypes.ADD_RATING]); // this suppresses the warning that the hook is dependent on this variable (which is actually a constant)

  return (
    <div className="container">
      {(view === viewTypes.SHOW_RATINGS)
        ? <div>
            <p>
                Check out how real EV owners rate their rides! This table shows
                the average rating of each EV model in our database. Click on any
                column header to sort the results. If you have a token from the
                government, you can click the button below to use it to
                rate <em>your</em> new electric ride!
            </p> 
            <button className="btn btn-lg btn-onGreenBg" onClick={() => setView(viewTypes.ADD_RATING)}>Add a rating</button>
          </div>
        : <div>
            <button className="btn btn-lg btn-onGreenBg" onClick={() => setView(viewTypes.SHOW_RATINGS)}>Show all ratings</button>
          </div>
      }
      <RatingsView show={view === viewTypes.SHOW_RATINGS} showTestData={isTest} />
      <AddRating show={view === viewTypes.ADD_RATING} tokenValue={token} createAsTest={isTest} />
      <a className="onGreenBg" href="/admin">Go to admin page</a>
    </div>
  );
};

export default App;
