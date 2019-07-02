import React from "react";
import AuthContext from "../contexts/AuthContext";
import PactContext from "../contexts/PactContext";
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

class CreateBracketWithSeed extends React.Component {

  state = {
    numTeams: 0,
    teamList: [],
    seedList: [],
    buttonDisabled: true,
    bracketName: ""
  };

  onChangeTeamValue = (index, value) => {
    console.log(this.state.teamList)
    let teamList = this.state.teamList;
    teamList[index] = value;
    this.setState({ teamList }, this.checkInputValidity());

  }

  onChangeSeedValue = (index, value) => {
    console.log(this.state.seedList)
    let seedList = this.state.seedList;
    seedList[index] = parseInt(value);
    this.setState({ seedList }, this.checkInputValidity());
  }

  renderTextInputs = (numInputs) => {
    let textComponents = [];
    for (let i = 0; i < numInputs; i++) {
      console.log('loopin')
      textComponents.push(
        <div key={i}>
          <TextField
            key={i}
            placeholder="team"
            id="standard-name"
            label={`Team Name ${i+1}`}
            onChange={(e) => this.onChangeTeamValue(i, e.target.value)}
            margin="normal"
          />
          <TextField
            key={i + numInputs}
            id="standard-name"
            placeholder="seed"
            label={`Seed Number ${i+1}`}
            onChange={(e) => this.onChangeSeedValue(i, e.target.value)}
            margin="normal"
          />
        </div>
      )
    }
    return textComponents;
  }

  toggleButtonDisabled = (bool) => {
    this.setState({ buttonDisabled: bool });
  }

  checkInputValidity = () => {
    this.setState({ buttonDisabled: true })
    console.log('checkin')
    let teams = this.state.teamList;
    let seeds = this.state.seedList;
    console.log(teams, seeds);
    let teamsSet = new Set(teams);
    let seedsSet = new Set(seeds);
    if (teams.length !== 0 && seeds.length !== 0){
      //has no duplicates
      if ((teams.length === teamsSet.size) && (seeds.length === seedsSet.size) && (teams.length === seeds.length)) {
        //has no ""
        //has no 0s
        console.log('1st')
        if (!teams.includes("") && !teams.includes(0)){
          console.log('2nd')
          //has all numbers from 1 -> seeds.length
          let orderedArray = Array.from({length: seeds.length}, (v, k) => k+1);
          let sortedArray = seeds.sort()
          console.log(JSON.stringify(orderedArray), JSON.stringify(sortedArray))
          if ( JSON.stringify(orderedArray) === JSON.stringify(sortedArray) ) {
            console.log('3rd')
            // this.setState({ buttonDisabled: false }, console.log('enbling button...'));
            this.setState({ buttonDisabled: false })
          }
        }
      }
    }

    //has no ""
    //has no 0s
  }



  render() {
    console.log(this.state.numTeams);
    return (
      <div>
        <Grid container direction='column'>
        <text>Please make sure: </text>
        <text>1. Team names are distinct</text>
        <text>2. Bracket name is not already taken</text>
        <text>3. Seeds range from 1 to number of teams in bracket</text>
        <div style={{ marginBottom: 10 }}>
          <TextField
            id="standard-name"
            label={"Bracket Name"}
            onChange={(e) => this.setState({ bracketName: e.target.value})}
            margin="normal"
          />
        </div>
        <Select
          style={{ marginBottom: 10 }}
          native
          value={this.state.numTeams}
          onChange={(e) => {
            this.renderTextInputs(this.state.numTeams)
            this.setState({
              numTeams: e.target.value,
              teamList: Array(e.target.value).fill("")
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
          <Button variant="contained"
            disabled={this.state.buttonDisabled}
            color="primary"
            style={{ marginBottom: 10, marginTop: 10 }}
            onClick={() => console.log('clicked')}>
            Create Bracket!
          </Button>
        </Grid>
      </div>
    );
  }
}

export default CreateBracketWithSeed;
