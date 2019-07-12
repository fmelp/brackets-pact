import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import CreateBracketBB from "./components/CreateBracketBB";
import CreateBracketEB from "./components/CreateBracketEB";
import ViewBracketsBB from './components/ViewBracketsBB';
import ViewBracketsEB from './components/ViewBracketsEB';
import LoginSignUp from "./components/LoginSignUp";
import * as serviceWorker from './serviceWorker';
import { AuthStore } from "./contexts/AuthContext";
import { PactBBStore } from "./contexts/PactBBContext";
import { PactEBStore } from "./contexts/PactEBContext";

const routing = (
  <Router>
    <AuthStore>
    <PactEBStore>
    <PactBBStore>
      <div>
        <Route exact path="/" component={App} />
        <Route exact path="/createbb" component={CreateBracketBB} />
        <Route exact path="/createeb" component={CreateBracketEB} />
        <Route exact path="/viewbb" component={ViewBracketsBB} />
        <Route exact path="/vieweb" component={ViewBracketsEB} />
        <Route exact path="/login" component={LoginSignUp} />
      </div>
    </PactBBStore>
    </PactEBStore>
    </AuthStore>
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
