import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactBBContext from "../contexts/PactBBContext";
import UserIcon from './UserIcon';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class CreateBracketBB extends React.Component {

  state = {
    numTeams: 0,
    teamList: [],
    buttonDisabled: true,
    bracketName: "",
    entryPrice: NaN
  };

  onChangeTeamValue = (index, value) => {
    let teamList = this.state.teamList;
    teamList[index] = value;
    this.setState({ teamList }, this.checkInputValidity());
  }

  onChangeEntryPrice = (value) => {
    const price = parseFloat(value);
      console.log(price);
      this.setState({ entryPrice: price }, this.checkInputValidity());
  }

  renderTextInputs = (numInputs) => {
    let textComponents = [];
    for (let i = 0; i < numInputs; i++) {
      textComponents.push(
        <div key={i}>
          <TextField
            key={i}
            placeholder="team"
            id="standard-name"
            label={`Team Seed ${i+1}`}
            onChange={(e) => this.onChangeTeamValue(i, e.target.value)}
            margin="normal"
          />
        </div>
      )
    }
    return textComponents;
  }

  //this function needs some work....
  checkInputValidity = () => {
    console.log('checking input...')
    this.setState({ buttonDisabled: true })
    let teams = this.state.teamList;
    let teamsSet = new Set(teams);
      //has no duplicates and is right length
      if ((teams.length === teamsSet.size)
        && (teams.length === this.state.numTeams)
        && (this.state.bracketName !== "")
        && (teams.length !== 0)
        && (!isNaN(this.state.entryPrice)))  {
          this.setState({ buttonDisabled: false });

    }

  }

  //need to show tx failing if using an already existing name
  showSubmitButton = (keyset) => {
    return (
      <PactBBContext.Consumer>
        {({ initBracket }) => {
          return (
            <div>
              <UserIcon/>
              <Button variant="contained"
                disabled={this.state.buttonDisabled}
                color="primary"
                style={{ marginBottom: 10, marginTop: 10 }}
                onClick={() => {
                  // initBracket = (keyset, bracketName, bracket, entryFee) => {
                  initBracket(
                    keyset,
                    this.state.bracketName,
                    this.makeDraw(this.state.teamList),
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
      </PactBBContext.Consumer>
    )
  }

  //function to make the first round draw for the teams.
  makeDraw = (teamList) => {
    console.log(this.makeEmptyArray(teamList));
    let teamsCopy = teamList.slice();
    //create empty array format for all rounds
    let roundLists = this.makeEmptyArray(teamList);
    let firstRoundDraw = []
    while (teamsCopy.length > 0) {
      let pair = [];
      pair[0] = teamsCopy.shift();
      pair[1] = teamsCopy.pop();
      firstRoundDraw.push(pair);
    }
    roundLists[0] = firstRoundDraw;
    return roundLists;
  }

  makeEmptyArray = (teamList) => {
    let numTeams = teamList.length;
    let roundLists = Array((Math.log2(numTeams) + 1)).fill([]);
    let index = 0;
    while (numTeams > 1) {
      roundLists[index] = Array(numTeams / 2).fill(["winner", "winner"]);
      numTeams = numTeams / 2;
      index = index + 1;
    }
    roundLists[(roundLists.length - 1)] = "winner"
    return roundLists;
  }


  render() {
    return (
      <div style={{justifyContent:'center', alignItems:'center'}}>
        <Grid container direction='column' alignItems='center'>
        <p style={{margin: 5, fontSize: 18}}>Please make sure: </p>
        <p style={{margin: 5, fontSize: 18}}>1. Team names are distinct and in order of their seed</p>
        <p style={{margin: 5, fontSize: 18}}>2. Bracket name is not already taken</p>
        <div style={{ marginBottom: 1 }}>
          <TextField
            id="standard-name"
            label={"Bracket Name"}
            onChange={(e) => this.setState({ bracketName: e.target.value}, this.checkInputValidity())}
            margin="normal"
          />

        </div>
        <TextField
          placeholder="$$$$$"
          id="$$$$$"
          label={"Entry Price"}
          onChange={(e) => this.onChangeEntryPrice(e.target.value)}
          margin="normal"
        />

        <Select
          style={{ marginBottom: 10 }}
          native
          value={this.state.numTeams}
          onChange={(e) => {
            this.renderTextInputs(this.state.numTeams);
            this.setState({
              numTeams: parseInt(e.target.value),
              teamList: Array(e.target.value).fill(""),
              buttonDisabled: true
            })}
          }
        >
          <option value={0}>PLEASE SELECT NUMBER OF TEAMS</option>
          <option value={2}>Two</option>
          <option value={4}>Four</option>
          <option value={8}>Eight</option>
          <option value={16}>Sixteen</option>
          <option value={32}>Thirty-Two</option>
        </Select>

          {this.renderTextInputs(this.state.numTeams)}
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

export default CreateBracketBB;
