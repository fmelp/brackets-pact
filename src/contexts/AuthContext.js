import React from 'react';

const Context = React.createContext();

export class AuthStore extends React.Component {

  state = {
    keyset: {
      publicKey: "f193f2c159cc4d21e7cd5c7e28f8b4e9ef2b7d04666e0e53c51adf40e86751ba",
      secretKey: "60b82fd1ca1634d3338a656d19dfbd60a68e33b2ff6dd92f9289a1a03a521c74"
    }
  }

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
