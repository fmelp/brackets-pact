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
    secretKey: ""
  }

  generateKeyPair = () => {
    const keyPairObj = Pact.crypto.genKeyPair();
    this.setState({
      publicKeyGen: keyPairObj.publicKey,
      secretKeyGen: keyPairObj.secretKey
    })
  }

  render() {
    return (
      <div>
        <AuthContext.Consumer>
          {({ keyset, onKeysetChange }) =>
          <Grid container direction='column' style={{margin: 20}}>
            <p>If you already have a keyset</p>
            <p>Enter it below</p>
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
              color="primary"
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => {
                console.log(this.state.publicKey, this.state.secretKey)
                onKeysetChange(this.state.publicKey, this.state.secretKey);
                // onKeysetChange(this.state.publicKey, this.state.secretKey)
                // onKeysetChange(this.state.publicKey, this.state.secretKey)
                // onKeysetChange(this.state.publicKey, this.state.secretKey)
                this.props.history.push('/')
              }}
            >
              Login
            </Button>
            <p>If you do not have a keyset</p>
            <p>Press Generate</p>
            <p>It will generate your key pair then enter them above to login</p>
            <p>PLEASE SAVE THESE TWO KEYS IN ORDER TO LOGIN AGAIN</p>
            <Button variant="contained"
              color="primary"
              style={{ marginBottom: 10, marginTop: 10 }}
              onClick={() => this.generateKeyPair()}
            >
              Generate
            </Button>
            <p>Public key:</p>
            <p>{this.state.publicKeyGen}</p>
            <p>Private key:</p>
            <p>{this.state.secretKeyGen}</p>
          </Grid>
          }
        </AuthContext.Consumer>
      </div>
    );
  }
}

export default LoginSignUp;
