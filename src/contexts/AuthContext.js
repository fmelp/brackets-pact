import React from 'react';

const Context = React.createContext();

export class AuthStore extends React.Component {

  // admin
  state = {
    keyset: {
      publicKey: "f193f2c159cc4d21e7cd5c7e28f8b4e9ef2b7d04666e0e53c51adf40e86751ba",
      secretKey: "60b82fd1ca1634d3338a656d19dfbd60a68e33b2ff6dd92f9289a1a03a521c74"
    }
  }
  //non-admin 1
  // state = {
  //   keyset: {
  //     publicKey: "fc362c163a97eb6bf62650fa734a07a622a2cdcf03be63a561816607aafd64f7",
  //     secretKey: "fc518c1f34433f8598c8be16044db59d3b30b09b48073c89c8f47fa882344d8f"
  //   }
  // }
  // non-admin 2
  // state = {
  //   keyset: {
  //     publicKey: "20f75ef9e57c289acfa6b8688c93a97ddaa363a5202cc600f22c69836987a04d",
  //     secretKey: "e89f33adea23d018af02e0fad5432ac67dde5dda4056b54786fede36022bad51"
  //   }
  // }
  //non-admin 3
  // state = {
  //   keyset: {
  //     publicKey: "33fe6f90d644a0628edbeca89b85fa1041fc5e2accb15de351cb635c9f3a91bd",
  //     secretKey: "8936a49762da56e67eba8e827fcc6a1362905b63ffb01596f2c9e8c6399e6c78"
  //   }
  // }
  //non-admin 4
  // state = {
  //   keyset: {
  //     publicKey: "7675904e6855a615c437a02de6bd591d1365f4e2e7c902361b99f18841542d6a",
  //     secretKey: "ca3fe7a16c01e79bf25502e0dcba7a86962a199dd2f23e7556e47fb779973da3"
  //   }
  // }

  //can call this function from any component wrapped by this context
  //it will be very useful when actual users need to input their keyset
  onKeysetChange = (publicKey, privateKey) => {
    this.setState({
      keyset: {
        publicKey,
        privateKey
      }
    });
  }

  render() {
    return(
      <Context.Provider
        value={{ ...this.state, onKeysetChange: this.onKeysetChange }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }

}

export default Context;
