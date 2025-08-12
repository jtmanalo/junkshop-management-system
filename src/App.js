// import logo from './logo.svg';
import './App.css';
import React from 'react';

// pages
import LoginPage from './pages/LoginPage';
// import SignUpPage from './pages/SignUpPage';

console.log('LoginPage:', LoginPage);

function App() {
  return (
    <div className="App">
      {/* <header className="App-header"> */}
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p> */}
        {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      {/* </header> */}
      <LoginPage />
    </div>
  );
}

export default App;
