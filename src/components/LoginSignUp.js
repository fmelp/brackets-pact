import React from "react";
import AuthContext from "../contexts/AuthContext";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Pact from "pact-lang-api";

import  '../main.css';
// import LoginInput from './LoginInput';
import { VpnKey, Lock } from '@material-ui/icons';
import { ArrowForward, AccountBox } from '@material-ui/icons';


class LoginSignUp extends React.Component {

  state = {
     publicKey: "",
     secretKey: "",
     userName: "",
     screen: "login"
  }

  showTextInputs = (keyset,
  onKeysetChange,
  setUserName,
  getUserInfo,
  getAllUsers,
  allUsers,
  getCoinAccountBalance,
  coinAccountBalance) => {
    if (this.state.screen === "login") {
      return (
        <div>
        <Grid container direction='column' style={{margin: 20}}>
        <p>To login please paste your public and private keys below</p>
        <div className="login-input-container">
          <div>
              <VpnKey/>
          </div>
          <input
            onChange={async (e) => {
              await this.setState({ publicKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            value={this.state.publicKey}
            placeholder="public key"
          />
        </div>
        <div className="login-input-container">
          <div>
              <Lock/>
          </div>
          <input
            onChange={async (e) => {
              await this.setState({ secretKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            value={this.state.secretKey}
            placeholder="private key"
            type="password"
          />
        </div>
        <div className="rounded-button-container">
          <Button variant="contained"
            disabled={this.state.loginButtonDisabled}
            color="primary"
            className="rounded-button"
            variant="contained"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={async () => {
              console.log(this.state.publicKey, this.state.secretKey)
              onKeysetChange(this.state.publicKey, this.state.secretKey);
              console.log(allUsers);
              await getAllUsers(keyset);
              console.log(allUsers);
              //if user has no account for coin
              //  point them to testnet faucet
              //if user has account for coin, but is not a bracket user
              //  show username textfield and signup button
              //this is the no username logic
              // await getCoinAccountBalance(keyset)
              if (!allUsers || !allUsers.includes(this.state.publicKey)) {
                alert('You are not a registered user! Choose signup section');
              } else {
                getUserInfo(keyset);
                this.props.history.push('/')
              }

            }}
          >
            Login
          </Button>
        </div>
        </Grid>
        </div>
      );
    } else {
      return (
        <div>
        <Grid container direction='column' style={{margin: 20}}>
        <p>To sign-up please paste your public and private keys and enter a username below</p>
        <p>If you do not have a Kadena account, please visit our <a href="http://localhost:8000/">testnet faucet</a></p>
        <div className="login-input-container">
          <div>
              <VpnKey/>
          </div>
          <input
            onChange={async (e) => {
              await this.setState({ publicKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            value={this.state.publicKey}
            placeholder="public key"
          />
        </div>
        <div className="login-input-container">
          <div>
              <Lock/>
          </div>
          <input
            onChange={async (e) => {
              await this.setState({ secretKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            value={this.state.secretKey}
            placeholder="private key"
            type="password"
          />
        </div>
        <div className="login-input-container">
          <div>
              <AccountBox/>
          </div>
          <input
            onChange={async (e) => {
              console.log(e.target.value);
              await this.setState({ userName: e.target.value });
              await onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            value={this.state.username}
            placeholder="username"
          />
        </div>
        <div className="rounded-button-container">
          <Button variant="contained"
            disabled={this.state.loginButtonDisabled}
            color="primary"
            className="rounded-button"
            variant="contained"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={async () => {
              console.log(keyset, this.state.userName);

              // await getCoinAccountBalance(keyset);
              // await getCoinAccountBalance(keyset);
              console.log(coinAccountBalance);
              await onKeysetChange(this.state.publicKey, this.state.secretKey)
              if (this.state.userName === ""){
                alert("please enter a username")
              }
              //not dealing with having non-funded accounts atm
              // else if (coinAccountBalance === 0) {
              //   alert("please go to the testnet faucet website to fund your account")
              // }
              else {
                setUserName(keyset, this.state.userName);
                getUserInfo(keyset);
                getUserInfo(keyset);
                this.props.history.push('/')
              }

            }}
          >
            Sign-Up
          </Button>
        </div>
        </Grid>
        </div>
      );
    }
  }

  render() {
    return (
        <AuthContext.Consumer>
          {({
            keyset,
            onKeysetChange,
            setUserName,
            getUserInfo,
            getAllUsers,
            allUsers,
            getCoinAccountBalance,
            coinAccountBalance
          }) =>

          <Grid container direction='column' style={{margin: 20}} alignItems='center'>
            <div style={{position: "absolute", top: 10, left: 10}}>
              <img src={require('../images/kadena.png')} />
            </div>
            <div className="welcome-style-log">Login or Sign-up to play!</div>
            <div className = "login-container">
            <Grid container direction='row' style={{margin: 20}} justify='center'>
              <div>
                <Button
                  disabled={(this.state.screen === "login") ? true : false}
                  variant="contained"
                  className={((this.state.screen === "login") ? "custom-button" : "custom-button-disabled")}
                  color="primary"
                  style={{ marginBottom: 10, marginTop: 10 }}
                  onClick={() => {
                    this.setState({ screen: "login" })
                  }}
                >
                  Login
                </Button>
                <Button
                  disabled={(this.state.screen === "signup") ? true : false}
                  className={((this.state.screen === "login") ? "custom-button-disabled" : "custom-button")}
                  variant="contained"
                  color="primary"
                  style={{ marginBottom: 10, marginTop: 10 }}
                  onClick={() => {
                    this.setState({ screen: "signup" })
                  }}
                >
                  Sign-Up
                </Button>
              </div>
            </Grid>
            {this.showTextInputs(
              keyset,
              onKeysetChange,
              setUserName,
              getUserInfo,
              getAllUsers,
              allUsers,
              getCoinAccountBalance,
              coinAccountBalance
            )}
            </div>
          </Grid>
          }
        </AuthContext.Consumer>
    );
  }

}

export default LoginSignUp;

// <TextField
//   id="standard-name"
//   placeholder="public key"
//   label={`public key`}
//   onChange={async (e) => {
//     await this.setState({ publicKey: e.target.value });
//     await onKeysetChange(this.state.publicKey, this.state.secretKey)
//   }}
//   margin="normal"
// />
// <TextField
//   id="standard-name"
//   placeholder="private key"
//   label={`private key`}
//   onChange={async (e) => {
//     await this.setState({ secretKey: e.target.value });
//     await onKeysetChange(this.state.publicKey, this.state.secretKey)
//   }}
//   type="password"
//   margin="normal"
// />
// <TextField
//   id="standard-name"
//   placeholder="username"
//   label={`username`}
//   onChange={async (e) => {
//     console.log(e.target.value);
//     await this.setState({ userName: e.target.value });
//     await onKeysetChange(this.state.publicKey, this.state.secretKey)
//   }}
//   margin="normal"
// />
//
//
//
//
//
//
//
// <TextField
//   id="standard-name"
//   placeholder="public key"
//   label={`public key`}
//   onChange={async (e) => {
//     await this.setState({ publicKey: e.target.value });
//     onKeysetChange(this.state.publicKey, this.state.secretKey)
//   }}
//   margin="normal"
// />
// <TextField
//   id="standard-name"
//   placeholder="private key"
//   label={`private key`}
//   onChange={async (e) => {
//     await this.setState({ secretKey: e.target.value });
//     onKeysetChange(this.state.publicKey, this.state.secretKey)
//   }}
//   type="password"
//   margin="normal"
// />
