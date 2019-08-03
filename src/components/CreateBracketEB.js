import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactEBContext from "../contexts/PactEBContext";
import UserIcon from './UserIcon';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class CreateBracketEB extends React.Component {

  state = {
    numTeams: 0,
    buttonDisabled: true,
    bracketName: "",
    entryPrice: NaN
  };

  onChangeEntryPrice = (value) => {
    const price = parseFloat(value);
      this.setState({ entryPrice: price }, this.checkInputValidity());
  }

  //this function needs some work....
  checkInputValidity = () => {
    console.log('checking input...')
    this.setState({ buttonDisabled: true })
    console.log(this.state.numTeams);
      //has no duplicates and is right length
      if ((this.state.numTeams > 0)
        && (!isNaN(this.state.entryPrice)))  {
          this.setState({ buttonDisabled: false });
    }

  }

  //need to show tx failing if using an already existing name
  showSubmitButton = (keyset) => {
    return (
      <PactEBContext.Consumer>
        {({ initBracket }) => {
          console.log(keyset);
          return (
            <div>
              <UserIcon history={this.props.history}/>
              <Button variant="contained"
                className="custom-button"
                disabled={this.state.buttonDisabled}
                color="primary"
                style={{ marginBottom: 10, marginTop: 10 }}
                onClick={() => {

                  // initBracket = (keyset, bracketName, bracket, numberPlayers, entryFee) => {
                  initBracket(
                    keyset,
                    this.state.bracketName,
                    //init with empty bracket
                    [],
                    this.state.numTeams,
                    this.state.entryPrice
                  )
                  alert(`You just create a new tournament with the name ${this.state.bracketName}`)
                  //wrong page to navigate to
                  this.props.history.push('/')
                  //if success should navigate to new page
                }}>
                Create Bracket!
              </Button>
            </div>
          )
        }}
      </PactEBContext.Consumer>
    )
  }


  render() {
    return (
      <div style={{justifyContent:'center', alignItems:'center'}}>
        <div style={{position: "absolute", top: 10, left: 10}}>
          <img src={require('../images/kadena.png')} />
        </div>
        <Grid container direction='column' alignItems='center'>
        <div className = "background">
          <div className = "subTitle">Empty Bracket Betting Section</div>
          <div className = "titleMsg">Please make sure: </div>
          <div className="msg-box">
            <div className="numbers">1.</div> <div className = "ol"> Bracket name is not already taken</div>
            <div className="numbers">2.</div> <div className = "ol"> Select correct number of participants</div>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <TextField
            id="standard-name"
            label={"Bracket Name"}
            onChange={(e) => this.setState({ bracketName: e.target.value}, this.checkInputValidity())}
            margin="normal"
            className="text-field"
          />

        </div>
        <Select
          style={{ marginBottom: 10 }}
          native
          className="text-field"
          value={this.state.numTeams}
          onChange={(e) => {
            console.log(e.target.value)
            this.setState({
              numTeams: parseInt(e.target.value)
            }, this.checkInputValidity())
          }
          }
        >
          <option value={0}>PLEASE SELECT NUMBER OF TEAMS</option>
          <option value={2}>Two</option>
          <option value={4}>Four</option>
          <option value={8}>Eight</option>
          <option value={16}>Sixteen</option>
          <option value={32}>Thirty-Two</option>
        </Select>
        <TextField
          placeholder="$$$$$"
          id="$$$$$"
          label={"Entry Price"}
          onChange={(e) => this.onChangeEntryPrice(e.target.value)}
          margin="normal"
          className="text-field"
        />

          <AuthContext.Consumer>
            {({ keyset }) =>
              this.showSubmitButton(keyset)
            }
          </AuthContext.Consumer>
        </Grid>
      </div>
    );
  }
}

export default CreateBracketEB;
