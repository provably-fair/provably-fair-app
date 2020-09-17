import React from 'react';
// import axios from 'axios';
import "./content.css";
import './assets/css/argon.css';
// import qs from 'querystring';
import Navbar from './components/Navbar.js';
import Settings from './components/Settings.js';
import GettingStarted from './components/GettingStarted.js'
import Operators from './components/Operators';
import Register from './components/Register';
import Verification from './components/Verification';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      gettingStarted: true,
      register: false,
      enterAPI: false,
      enterAPIStake: false,
      settings:false,
      verification:false,
      clientSeed: '',
      serverSeedHash: null,
      apiKeyStake:'',
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
  }

  settingsCallback = (data) => {
    this.setState({
      settings: true,
      serverSeedHash: data.serverSeedHash,
      clientSeed: data.clientSeed,
      apiKeyStake: data.apiKeyStake,
      usernameStake : data.usernameStake,
    });
    console.log('data ',data);
  }

  verificationCallback = (data) => {
    this.setState({
      settings:data.settings,
      verification: data.verification,
      serverSeedHash: data.serverSeedHash,
      clientSeed: data.clientSeed,
    });
    console.log('data ',data);
  }

  render() {
    const { gettingStarted, operators, enterAPI, enterAPIStake, register, settings, serverSeedHash, clientSeed, apiKeyStake, usernameStake, verification } = this.state;
    return (
      <div className={'my-extension text-center'}>
        <Navbar />
        <GettingStarted gettingStarted={gettingStarted} callback={this.gettingStartedCallback} />
        {operators && <Operators callback={this.operatorsCallback} />}
        {register && <Register enterAPI={enterAPI} enterAPIStake={enterAPIStake} callback={this.settingsCallback}/>}
        {settings && <Settings serverSeedHash={serverSeedHash} clientSeed={clientSeed} apiKeyStake={apiKeyStake} callback={this.verificationCallback}/>}
        {verification && <Verification serverSeedHash={serverSeedHash} clientSeed={clientSeed} apiKeyStake={apiKeyStake} usernameStake={usernameStake}/>}
      </div>
    );
  }
}
