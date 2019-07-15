import React from "react";
import AuthContext from "../contexts/AuthContext";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Pact from "pact-lang-api";

class LoginSignUp extends React.Component {

  state = {
    publicKeyGen: "",
    secretKeyGen: "",
    publicKey: "",
    secretKey: "",
    showSignUp: false,
    userName: ""
  }

  // enableLoginButton = (publicKey, allUsers) => {
  //   if (allUsers.includes(publicKey)) {
  //     this.setState({ loginButtonDisabled: false });
  //   }
  // }

  generateKeyPair = () => {
    const keyPairObj = Pact.crypto.genKeyPair();
    this.setState({
      publicKeyGen: keyPairObj.publicKey,
      secretKeyGen: keyPairObj.secretKey
    })
  }

  showSignUp = (setUserName, onKeysetChange, keyset, getUserInfo, getAllUsers, allUsers) => {
    if (this.state.showSignUp) {
      return (
        <div>
        <Grid container direction='column' style={{margin: 20}} alignItems='center'>
          <TextField
            id="standard-name"
            placeholder="public key"
            label={`public key`}
            onChange={async (e) => {
              await this.setState({ publicKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
              // getAllUsers(this.state.publicKey);
              // this.enableLoginButton(this.state.publicKey, allUsers);
            }}
            margin="normal"
          />
          <TextField
            id="standard-name"
            placeholder="private key"
            label={`private key`}
            onChange={async (e) => {
              await this.setState({ secretKey: e.target.value });
              onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            margin="normal"
          />
          <TextField
            id="standard-name"
            placeholder="username"
            label={`username`}
            onChange={async (e) => {
              console.log(e.target.value);
              await this.setState({ userName: e.target.value });
              await onKeysetChange(this.state.publicKey, this.state.secretKey)
            }}
            margin="normal"
          />
          <Button variant="contained"
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => {
              console.log(keyset, this.state.userName);
              setUserName(keyset, this.state.userName);
              getUserInfo(keyset)
              this.props.history.push('/')
            }}
          >
            Sign-Up
          </Button>
        </Grid>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <AuthContext.Consumer>
          {({
            keyset,
            onKeysetChange,
            setUserName,
            getUserInfo,
            getAllUsers,
            allUsers
          }) =>
          <Grid container direction='column' style={{margin: 20}} alignItems='center'>
            <p>If you ALREADY HAVE a keyset, enter it below</p>
            <p>Then press Login</p>
            <TextField
              id="standard-name"
              placeholder="public key"
              label={`public key`}
              onChange={async (e) => {
                await this.setState({ publicKey: e.target.value });
                onKeysetChange(this.state.publicKey, this.state.secretKey)
              }}
              margin="normal"
            />
            <TextField
              id="standard-name"
              placeholder="private key"
              label={`private key`}
              onChange={async (e) => {
                await this.setState({ secretKey: e.target.value });
                onKeysetChange(this.state.publicKey, this.state.secretKey)
              }}
              margin="normal"
            />
            <Button variant="contained"
              disabled={this.state.loginButtonDisabled}
              color="primary"
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => {
                console.log(this.state.publicKey, this.state.secretKey)
                onKeysetChange(this.state.publicKey, this.state.secretKey);
                getAllUsers(keyset);
                if (!allUsers.includes(this.state.publicKey)) {
                  alert('You are not a registered user! Please generate an account below');
                } else {
                  getUserInfo(keyset);
                  this.props.history.push('/')
                }

              }}
            >
              Login
            </Button>
            <p>If you DO NOT HAVE a keyset, press Generate</p>
            <p>It will generate your key pair then enter them above to login</p>
            <p>PLEASE SAVE THESE TWO KEYS IN ORDER TO LOGIN AGAIN</p>
            <Button variant="contained"
              color="primary"
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => {
                this.generateKeyPair()
                this.setState({ showSignUp: true });
              }}
            >
              Generate
            </Button>
            <p>Public key:</p>
            <p>{this.state.publicKeyGen}</p>
            <p>Private key:</p>
            <p>{this.state.secretKeyGen}</p>
            {this.showSignUp(setUserName, onKeysetChange, keyset, getUserInfo, getAllUsers, allUsers)}
          </Grid>
          }
        </AuthContext.Consumer>
      </div>
    );
  }
}

export default LoginSignUp;
