import React from 'react';
// import SweetAlert from 'react-bootstrap-sweetalert';
// import { GraphQLClient } from 'graphql-request';
// import axios from 'axios';
// import createHmac from 'create-hmac';
// import uuidv4 from 'uuid/v4';
import "./content.css";
import './assets/css/argon.css';
// import qs from 'querystring';
import Navbar from './components/Navbar.js';
import Settings from './components/Settings.js';
import GettingStarted from './components/GettingStarted.js'
import Operators from './components/Operators';
import Register from './components/Register';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      gettingStarted: true,
      register: false,
      enterAPI: false,
      enterAPIStake: false,
      clientSeed: '',
      serverSeedHash: null,
      previousSeed: '',
      session_token: '',
      betData: [],
      cryptoGames: false,
      stake: true,
      primeDice: false,
      bitvest: false,
      verify: false,
      diceResult: 0,
      diceVerify: 0,

      BetIdArray: [],
      betDataById: [],
      betDataEnriched: [],
      userSeedsData: [],
      BetId: null,
      Balance: null,
      Roll: null,
      previousClientSeedStake: '',
      activeClientSeedStake: '',
      previousServerSeedStake: '',
      nonceChecked: false,
      toggleState: false,
      showAlert: false,
      popupResult: '',
      betAmount: 0.0000001,
      betPayout: 2.0,
      betPlaced: false,
      numberBetsVerFailed: 0,
      isNonceManipulated: false,
      viewRecentBetsStake: false,
      client_seed: null,
      server_seed: null,
      server_hash: null,
      nonce: 0,
      games: [
        { name: 'Plinko' },
        { name: 'Mines' },
        { name: 'Chartbet' },
        { name: 'Hilo' },
        { name: 'Blackjack' },
        { name: 'Diamond Poker' },
        { name: 'Roulette' },
        { name: 'Keno' },
        { name: 'Baccarat' },
        { name: 'Dice' }
      ],
      numMines: 3,
      mines: [],
      keno: [],
      numOfRows: [0, 1, 2, 3, 4],
      numOfColumnsKeno: [0, 1, 2, 3, 4, 5, 6, 7],
      numOfColumns: [0, 1, 2, 3, 4, 5, 6, 7],
      active_game: 'chartbet',
      MAX_ROLL: 10001,
      MAX_ROULETTE: 37,
      MAX_CHARTBET: 1000000
    }
  }

  gettingStartedCallback = (data) => {
    this.setState({ operators: data });
  }
  operatorsCallback = (data) => {
    this.setState({
      enterAPI: data.enterAPI,
      enterAPIStake: data.enterAPIStake,
      register: true
    });
    console.log(data);
  }

  render() {
    const { gettingStarted, operators, enterAPI, enterAPIStake, register } = this.state;
    return (
      <div className={'my-extension text-center'}>
        <Navbar />
        <GettingStarted gettingStarted={gettingStarted} callback={this.gettingStartedCallback} />
        {operators && <Operators callback={this.operatorsCallback} />}
        {register && <Register enterAPI={enterAPI} enterAPIStake={enterAPIStake} />}
        <Settings />
      </div>
    );
  }
}

export default App;
