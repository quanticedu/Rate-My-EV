import { createElement, useState } from 'react';
import './App.css';
import AddTestToken from './addTestToken';
import ShowUnusedTokens from './showUnusedTokens';
import DeleteTestData from './deleteTestData';
import ManageHeaders from './manageHeaders';

const App = () => {
  // enumeration of the types of controls.
  const controls = {
    ADD_TEST_TOKEN: {
                       ReactControl: AddTestToken,
                       MenuItem: 'Add Test Token',
                    },
    SHOW_UNUSED_TOKENS: {
                          ReactControl: ShowUnusedTokens,
                          MenuItem: 'Show Unused Tokens',
                        },
    DELETE_TEST_DATA: {
                         ReactControl: DeleteTestData,
                         MenuItem: 'Delete Test Data',
    },
    MANAGE_HEADERS: {
                       ReactControl: ManageHeaders,
                       MenuItem: 'Manage Headers',
    }
  };

  // 
  // State:
  //    currentControl: the current set of controls being displayed
  const [control, setControl] = useState(controls.ADD_TEST_TOKEN);

  return (
    <main className="container">
      <div className="row">
        <nav className="col-3">
          <h2 className="text-start">Menu</h2>
          {Object.keys(controls).map((ctl, idx) => (
            <button className="btn btn-link d-block" key={idx} onClick={() => setControl(controls[ctl])}>{controls[ctl].MenuItem}</button>
          ))}
        </nav>
        <div className="col">
          {createElement(control.ReactControl)}
        </div>
      </div>
    </main>
  );
}

export default App;
