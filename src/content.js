/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer }from 'react-frame-component';
import SweetAlert from 'react-bootstrap-sweetalert';
import { GraphQLClient } from 'graphql-request';
import { CookiesProvider } from 'react-cookie';
import Cookies from 'js-cookie';
import axios from 'axios';
import createHmac from 'create-hmac';
import uuidv4 from 'uuid/v4';
import converter from 'hex2dec';
import cryptoGamesIcon from './assets/img/cryptogames.png';
import "./content.css";
import './assets/css/argon.css';
import qs from 'querystring';


class Main extends React.Component {

  constructor(){
    super();
    this.state = {
      gettingStarted:true,
      enterAPI:false,
      enterAPIStake:false,
      settings:false,
      verification:false,
      operators:false,
      clientSeed:'',
      serverSeedHash:null,
      previousSeed:'',
      session_token:'',
      betData:[],
      cryptoGames:false,
      stake:true,
      primeDice:false,
      bitvest:false,
      verify:false,
      diceResult:0,
      diceVerify:0,
      user:'',
      apiKey:null,
      apiKeyStake:null,
      usernameStake:'',
      BetIdArray: [],
      betDataById:[],
      betDataEnriched: [],
      userSeedsData:[],
      BetId:null,
      Balance:null,
      Roll:null,
      previousClientSeedStake:'',
      activeClientSeedStake:'',
      previousServerSeedStake:'',
      nonceChecked:false,
      toggleState:false,
      showAlert:false,
      popupResult:'',
      betAmount:0.0000001,
      betPayout:2.0,
      betPlaced:false,
      numberBetsVerFailed:0,
      isNonceManipulated:false,
      viewRecentBetsStake:false,
      client_seed: null,
      server_seed: null,
      server_hash: null,
      nonce: 0,
      games: [
          {name: 'Plinko'},
          {name: 'Mines'},
          {name: 'Chartbet'},
          {name: 'Hilo'},
          {name: 'Blackjack'},
          {name: 'Diamond Poker'},
          {name: 'Roulette'},
          {name: 'Keno'},
          {name: 'Baccarat'},
          {name: 'Dice'}
      ],
      numMines: 3,
      mines:[],
      keno:[],
      numOfRows:[0,1,2,3,4],
      numOfColumnsKeno:[0,1,2,3,4,5,6,7],
      numOfColumns:[0,1,2,3,4,5,6,7],
      active_game: 'chartbet',
      MAX_ROLL: 10001,
      MAX_ROULETTE: 37,
      MAX_CHARTBET: 1000000
    }
  }


/*****************************************************************************************************************************************************************/
    /** Generic Methods **/

    /* Method for generating Randomised Client Seed */

    getClientSeed = () => {
      let key = uuidv4();
      let hash = createHmac('sha256', key)
      .update('provably')
      .digest('hex');
      hash = hash.substring(0, 32);
      this.setState({clientSeed:hash, nonce:0});
    }

    handleRequest = () => {
      let self = this;
      const {stake, primeDice, bitvest} = this.state;
      let promise1 = new Promise((resolve, reject) => {
        setTimeout(() => {
          self.getServerSeedStake();
        }, 300);
      });

      let promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          self.getAllUserSeedsStake();
        }, 1000);
      });
      if(stake===true || primeDice === true){
        console.log(promise1,promise2);
      }
      if(bitvest===true){
        self.getNewServerseedHashBitvest();
      }
    }

    hideAlertConfirm = () => {
      this.setState({showAlert:false})
    }

    hideAlertCancel = () => {
      this.setState({showAlert:false})
    }


/*****************************************************************************************************************************************************************/
  /*Generic Stake Methods for various games */

  /**
   * Returns the SHA256 hash of the input
   * @param {string} data - The data to hash
   * @returns {string} The hex representation of the SHA256 hash
   */
  sha256 = (data) => {
      let md = crypto.createHash('sha256').update(data).digest('hex');
      return md;
  };
  /**
   * Returns the HMAC SHA256 hash of the arguments
   * @param {string} K - The K part of the HMAC digest
   * @param {string} m - The message part of the HMAC digest
   * @returns {string} The hex representation of the HMAC SHA256 hash
   */
  hmac_sha256 = (K, m) => {
      let hmac = createHmac('sha256', K) .update(m) .digest('hex');
      return hmac;
  };
  /**
   * Returns a true if the server seed and provided hash match
   * @returns {boolean} True if the server seed hash matches the provided hash
   */
  seed_hash_match = () => {
      if(this.server_seed && this.server_hash) {
          return this.sha256(this.server_seed) === this.server_hash;
      }
      return false;
  };
  /**
   * Returns true if the server seed, client seed and nonce are all present
   * @returns {boolean}
   */
  all_info = () => {
      return this.server_seed && this.client_seed && this.nonce;
  };
  /**
   * Returns the hex string calculated by hashint the server seed, client seed, nonce and round
   * @param {number} length - The length IN HEX CHARACTERS of the string to return.
   * @param {number} num - If defined, the string is truncated to the last n=num characters
   * @returns {string} A hex string
   */
  bytes = (server_seed, client_seed, nonce, length, num) => {
      let result = '';
      let round = 0;
      while(result.length < length) {
          result += this.hmac_sha256(server_seed, `${client_seed}:${nonce||0}:${round++}`);
      }
      if(result.length > length) {
          result = result.substring(0, length);
      }
      if(num) {
          result = result.substring(length - num, length);
      }
      return result;
  };
  /**
   * Returns a number in the range [0, 1)
   * @param {string} bytes - The 8 character (4 byte) hex string to convert to a number
   * @returns {number} A number in the range [0, 1)
   */
  bytes_to_number = (bytes) => {
      let total = 0;
      for(let i = 0; i < 4; i++) {
          total += parseInt(bytes.substr(i*2, 2),16)/Math.pow(256, i+1);
      }
      return total;
  };
  /**
   * Splits a string of characters into an array of two character chunks
   * @param {string} bytes - The string of hex digits
   * @returns {string[]} The array of 2 character chunks
   */
  bytes_to_hex_array = (bytes) => {
      let hex = [];
      for(let i = 0; i < bytes.length; i += 2) {
          hex.push(bytes.substr(i,2));
      }
      return hex;
  };
  /**
   * Takes a string of hex digits and converts them to an array of numbers
   * @param {string} bytes - A string of hex digits with length evenly divisible by 8
   * @returns {number[]} An array of numbers in the range [0, 1)
   */
  bytes_to_num_array = (bytes) => {
      let totals = [];
      for(let i = 0; i*8 < bytes.length; i++) {
          totals.push(this.bytes_to_number(bytes.substr(i*8), 8));
      }
      return totals;
  };
  /**
   * Returns the array of the 24 mine positions in order
   * @param {number[]} nums - The array of numbers
   * @returns {number[]} The array of mine positions
   */
  nums_to_mine_array = (nums) => {
      let { mines } = this.state;
      mines = [];
      for(let i = 0; i < 25; i++) {
          mines.push(i);
      }
      let result = [];
      for(let i = 0; i < nums.length; i++) {
          result.push(mines.splice(Math.floor((25-i)*nums[i]), 1)[0]);
      }
      console.log("mines result",result);
      this.setState({mines:result})
      return result;
  };
  /**
   * Returns the array of tile positions (Keno) in order
   * @param {number[]} nums - The array of numbers
   * @returns {number[]} The array of tile positions
   */
  nums_to_tile_array = (nums) => {
      let tiles = [];
      let result = [];
      for(let i = 0; i < 40; i++) {
          tiles.push(i);
      }
      for(let i = 0; i < nums.length; i++) {
          result.push(tiles.splice(Math.floor(nums[i] * (40 - i)), 1)[0]);
      }
      return result;
  };
  /**
   * Returns the array of cards from the numbers
   * @param {number[]} nums - The array of numbers
   * @returns {string[]} - The array of cards
   */
  nums_to_card_array = (nums) => {
      const cards = [
        '2_of_diamonds',
        '2_of_hearts',
        '2_of_spades',
        '2_of_clubs',

        '3_of_diamonds',
        '3_of_hearts',
        '3_of_spades',
        '3_of_clubs',

        '4_of_diamonds',
        '4_of_hearts',
        '4_of_spades',
        '4_of_clubs',

        '5_of_diamonds',
        '5_of_hearts',
        '5_of_spades',
        '5_of_clubs',

        '6_of_diamonds',
        '6_of_hearts',
        '6_of_spades',
        '6_of_clubs',

        '7_of_diamonds',
        '7_of_hearts',
        '7_of_spades',
        '7_of_clubs',

        '8_of_diamonds',
        '8_of_hearts',
        '8_of_spades',
        '8_of_clubs',

        '9_of_diamonds',
        '9_of_hearts',
        '9_of_spades',
        '9_of_clubs',

        '10_of_diamonds',
        '10_of_hearts',
        '10_of_spades',
        '10_of_clubs',

        'jack_of_diamonds',
        'jack_of_hearts',
        'jack_of_spades',
        'jack_of_clubs',

        'queen_of_diamonds',
        'queen_of_hearts',
        'queen_of_spades',
        'queen_of_clubs',

        'king_of_diamonds',
        'king_of_hearts',
        'king_of_spades',
        'king_of_clubs',

        'ace_of_diamonds',
        'ace_of_hearts',
        'ace_of_spades',
        'ace_of_clubs'
    ];
      nums = nums.map((num) => {
          return cards[Math.floor(num * 52)];
      });
      return nums;
  };
  /**
   * Takes a hex string and converts it into a base10 string with exactly 3 digits
   * @param {string} item - A hex string
   * @returns {string} A base 10 string of length 3
   */
  leading_zeroes = (item) => {
      item = parseInt(item, 16);
      if(item < 10) {
          return '00' + item;
      } else if(item < 100) {
          return '0' + item;
      } else {
          return item;
      }
  };
  /**
   * Returns the final result for many games
   * @param {string} game - The game to return the result for
   * @returns The result for the game
   */
  result = (game, server_seed, client_seed, nonce) => {
    // let {server_seed, client_seed, nonce} = this.state;
      switch(game) {
          case 'Dice':
              return (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_ROLL) / 100).toFixed(2);
          case 'Roulette':
              return Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_ROULETTE);
          case 'Chartbet':
              return (this.state.MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_CHARTBET) + 1) * 0.98);
          case 'Mines':
              return this.nums_to_mine_array(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 196)));
          case 'Keno':
              return this.nums_to_tile_array(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 80)));
          default:
              return 'Unknown game';
      }
  }

  handleRoullete = (server_seed, client_seed, nonce) => {
    let { active_game, MAX_ROULETTE } = this.state;
    active_game = 'Roulette';
    let resolve = Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * MAX_ROULETTE);
    let res = this.result(resolve);
    console.log("result", res, "resolve", resolve);
    return res;
  }

  handleChartbet = (server_seed, client_seed, nonce) => {
    const { active_game, MAX_CHARTBET } = this.state;
    let res = this.result(active_game);
    let resolve = MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * MAX_CHARTBET) + 1) * 0.98;
    console.log("result", res, "resolve", resolve);
  }

  handlePlinko = (server_seed, client_seed, nonce) => {
    this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});
    let nums = [];

    this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 160)).map((value, index) => {
      let direction = Math.floor(value*2)?'right':'left';
      nums.push(direction);
    })
      console.log("Plinko -- ", nums);
      return nums;
  }

handleBaccarat = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  let nums = [];
  for(const [index, value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 48)).entries()){
    nums.push(value);
    }
  nums = this.nums_to_card_array(nums);
  console.log("Baccarat : ", nums);
  return nums;
}

handleHilo = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  let nums = [];
  for(const [index, value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()){
    nums.push(value);
    }
  nums = this.nums_to_card_array(nums);
  console.log("Hilo : ", nums);
  return nums;
}

handleBlackjack = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  let nums = [];
  for(const [index, value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()){
    nums.push(value);
    }
  nums = this.nums_to_card_array(nums);
  console.log("Blackjack : ", nums);
  return nums;

}

handleMines = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  let res = this.result('Mines', server_seed, client_seed, nonce).slice(0,this.state.numMines);
  console.log("Mines : ", res);
  return res;
}

handleKeno = (server_seed, client_seed, nonce) => {
  let keno = this.result('Keno', server_seed, client_seed, nonce);
  this.setState({keno : keno});
  return keno;
}

handleDiamondPoker = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  // Index of 0 to 6 : green to blue
  const GEMS = [ 'green', 'purple', 'yellow', 'red', 'cyan', 'orange', 'blue' ];


  let nums = [];
   nums.push(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 80)).map((x)=>{
    return GEMS[Math.floor(x * 7)];
  }));
  console.log("Diamond Poker : ", nums);
  return nums;

}

nums_to_pokercards_array = (nums) => {
    let cards = [];
    const pokercards = [
      '2_of_diamonds',
      '2_of_hearts',
      '2_of_spades',
      '2_of_clubs',

      '3_of_diamonds',
      '3_of_hearts',
      '3_of_spades',
      '3_of_clubs',

      '4_of_diamonds',
      '4_of_hearts',
      '4_of_spades',
      '4_of_clubs',

      '5_of_diamonds',
      '5_of_hearts',
      '5_of_spades',
      '5_of_clubs',

      '6_of_diamonds',
      '6_of_hearts',
      '6_of_spades',
      '6_of_clubs',

      '7_of_diamonds',
      '7_of_hearts',
      '7_of_spades',
      '7_of_clubs',

      '8_of_diamonds',
      '8_of_hearts',
      '8_of_spades',
      '8_of_clubs',

      '9_of_diamonds',
      '9_of_hearts',
      '9_of_spades',
      '9_of_clubs',

      '10_of_diamonds',
      '10_of_hearts',
      '10_of_spades',
      '10_of_clubs',

      'jack_of_diamonds',
      'jack_of_hearts',
      'jack_of_spades',
      'jack_of_clubs',

      'queen_of_diamonds',
      'queen_of_hearts',
      'queen_of_spades',
      'queen_of_clubs',

      'king_of_diamonds',
      'king_of_hearts',
      'king_of_spades',
      'king_of_clubs',

      'ace_of_diamonds',
      'ace_of_hearts',
      'ace_of_spades',
      'ace_of_clubs'
 ];
    for(let i = 0; i < 52; i++) {
        cards.push(i);
    }
    let result = [];
    for(let i = 0; i < nums.length; i++) {
        result.push( pokercards[ (cards.splice(Math.floor((52-i)*nums[i]), 1)[0]) ] );
    }
    return result;
};

handleVideoPoker = (server_seed, client_seed, nonce) => {
  this.setState({server_seed:server_seed, client_seed:client_seed, nonce:nonce});

  let nums = [];
  for(const [index, value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 416)).entries()){
    nums.push(value);
    }
  console.log("result nums:", nums);
  nums = this.nums_to_pokercards_array(nums);
  console.log("nums : ", nums);
  return nums;
}

handleWheel = (server_seed, client_seed, nonce, segments, risk) => {
      let { active_game } = this.state;
      active_game = 'Wheel';
      let resolve = Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * segments);
      //let res = this.result(resolve);
      //console.log("result", res, "resolve", resolve);
      const PAYOUTS = {
        '10': {
          low: [ 1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0 ],
          medium: [ 0, 1.9, 0, 1.5, 0, 2, 0, 1.5, 0, 3 ],
          high: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 9.9 ]
        },
        '20': {
          low: [
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0
          ],
          medium: [
            1.5, 0, 2, 0, 2, 0, 2, 0, 1.5, 0,
            3, 0, 1.8, 0, 2, 0, 2, 0, 2, 0
          ],
          high: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 19.8
          ]
        },
        '30': {
          low: [
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0
          ],
          medium: [
            1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0,
            2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0,
            2, 0, 1.7, 0, 4, 0, 1.5, 0, 2, 0
          ],
          high: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 29.7
          ]
        },
        '40': {
          low: [
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0
          ],
          medium: [
            2, 0, 3, 0, 2, 0, 1.5, 0, 3, 0,
            1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
            1.5, 0, 2, 0, 2, 0, 1.6, 0, 2, 0,
            1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0
          ],
          high: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 39.6
          ]
        },
        '50': {
          low: [
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0,
            1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0
          ],
          medium: [
            2, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
            1.5, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
            1.5, 0, 2, 0, 1.5, 0, 2, 0, 2, 0,
            1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0,
            1.5, 0, 5, 0, 1.5, 0, 2, 0, 1.5, 0
          ],
          high: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 49.5
          ]
        }
      };

      // Game event translation
      const spin = PAYOUTS[segments][risk][resolve];

      console.log("WHEEL SPIN : ", spin);

      return spin;
    }


  /* Method to get all bet data of user bets for Stake Operator */

  getAllData = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake?'https://api.stake.com/graphql':primeDice?'https://api.primedice.com/graphql':'', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })


    /**this is for looking up all the betData of a user's bet**/
    const variables = {
      iid: "house:8691772588"
    }

    const query6 = `query betQuery($iid: String!) {

      bet(iid: $iid) {
        id
        iid
        bet {
          ... on CasinoBet {
            game
            payout
            payoutMultiplier
            createdAt
            currency
            user {
              name
            }
          }
        }
      }
    }`

     client.request(query6, variables).then((betData) => {

       console.log('All Bet data', betData);

     })
  }




  /* Method for get all Bet Data for Stake Operator */


  getAllBetsStake = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake?'https://api.stake.com/graphql':primeDice?'https://api.primedice.com/graphql':'', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })
    //should take user name as parameter
    let { betDataById, betDataEnriched, usernameStake } = this.state;
      betDataEnriched = [];
      betDataById = [];
     let name = `\"${usernameStake}\"`;

    /* GraphQL query houseBetList (i.e. game, payout, amountMultiplier, payoutMultiplier, amount, currency, createdAt) for a User of Stake Operator */

      let query3 = `{
        user(name: ${name}) {
          houseBetList(limit: 50, offset: 0) {
            id
            iid
            bet {
              ... on CasinoBet {
                game
                payout
                amountMultiplier
                payoutMultiplier
                amount
                currency
                createdAt
              }
            }
          }
        }
      }`

       client.request(query3).then((bet) => {
       betDataEnriched = bet.user.houseBetList;
       this.setState({betDataEnriched:betDataEnriched});
       console.log('bet data enriched',betDataEnriched);

       bet.user.houseBetList.map((houseBet)=>{
      //  console.log("houseBet : ", houseBet);


         /**Query is for looking up one bet**/

        let variables = {
          iid: houseBet.iid
        }

         let query7 = `query betQuery($iid: String!) {

          bet(iid: $iid) {
            id
            iid
            bet {
              ... on CasinoBet {
                id
                nonce
                game
                serverSeed {
                  seed
                  seedHash
                }
                clientSeed {
                  seed
                }
              }
            }
          }
        }`

         client.request(query7, variables).then((betData) => {
          //  console.log('betIdData', betIdData);
           betDataById.push(betData);
           this.setState({betDataById:betDataById});
         })
        // console.log('betDataById', betDataById);
       })
     })
  }

  /* Method to get all types of User Seeds for Stake Operator */

  getAllUserSeedsStake = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake?'https://api.stake.com/graphql':primeDice?'https://api.primedice.com/graphql':'', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })
    // should take user id as parameter
    let {userSeedsData, previousServerSeedStake, previousClientSeedStake, activeClientSeedStake, usernameStake} = this.state;

    const name = usernameStake;

    /**this is for looking up a user**/

    const query6 = `query userSeeds($name: String) {

      user(name: $name) {
        id
        activeServerSeed {
          seedHash
        }
        previousServerSeed {
          seed
          seedHash
        }
        activeClientSeed {
          seed
        }
        previousClientSeed {
          seed
        }
      }
    }`

     client.request(query6).then((userSeeds) => {

       console.log('userSeeds : ', userSeeds);
      //  userSeedsData.push(userSeeds)
      //console.log("userSeeds.user.previousClientSeed.seed : ", userSeeds.user.previousClientSeed.seed);
       if(userSeeds.user.previousClientSeed != null)
       {
         this.setState({previousClientSeedStake:userSeeds.user.previousClientSeed.seed});
       }
       if(userSeeds.user.previousServerSeed != null)
       {
        this.setState({previousServerSeedStake:userSeeds.user.previousServerSeed.seed});
       }
       this.setState({activeClientSeedStake:userSeeds.user.activeClientSeed.seed});
      // this.unhashServerSeedHashStake(userSeeds.user.previousServerSeed.seedHash);
      //  this.setState({userSeedsData:userSeedsData});
     })
    //  console.log("userSeedsData : ", userSeedsData);
  }


  /* Method for submitting a client seed for the Stake Operator */

  submitClientSeedStake = (clientSeed) => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client query to get new ServerSeed for Stake Operator */

    const query5 = `mutation ChangeClientSeedMutation($seed: String!) {
      changeClientSeed(seed: $seed) {
        id
        seed
        __typename
      }
    }`


    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake?'https://api.stake.com/graphql':primeDice?'https://api.primedice.com/graphql':'', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })
    const variables = {
      seed: clientSeed
    }
    client.request(query5, variables).then(data => console.log(data))
  }

  /* Method for submitting a client seed for the Stake Operator */

 /* unhashServerSeedHashStake = (serverHash) => {
    const variables = {
      hash: serverHash
    }
    /** GraphQl Client query for unhashing a seed **/

 /* const query = `query serverSeedQuery($hash: String!) {
    serverSeedByHash(hash: $hash) {
      seed
      seedHash
    }
  }`
    client.request(query, variables).then(data => {
      console.log("Unhased Server Seed", data)
      this.setState({previousServerSeedStake:data});
    })
  } /*



  /* Method for getting a Server Seed Hash for the Stake Operator */

  getServerSeedStake = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake?'https://api.stake.com/graphql':primeDice?'https://api.primedice.com/graphql':'', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })

      /* GraphQl Client query to get new ServerSeed for Stake Operator */

      const query4 = `mutation RotateServerSeedMutation {
        rotateServerSeed {
          id
          seedHash
          nonce
          user {
            id
            activeServerSeed {
              id
              seedHash
              nonce
              __typename
            }
            __typename
          }
          __typename
        }
      }`
    client.request(query4).then((data) => {
      console.log("serverSeedHash",data.rotateServerSeed.seedHash)
      this.setState({serverSeedHash:data.rotateServerSeed.seedHash})
    })
  }

  processBetsStake =  () => {
    let{betDataById, betDataEnriched, betData, previousClientSeedStake, activeClientSeedStake, previousServerSeedStake} = this.state;
    betData = [];

    let _ = require('lodash')

     console.log("betDataById", betDataById);
     console.log("previousClientSeedStake", previousClientSeedStake, "previousServerSeedStake", previousServerSeedStake ,"activeClientSeedStake", activeClientSeedStake);
   try{
    betDataById.map( (item) => {
    if (((item.bet.bet.clientSeed.seed == activeClientSeedStake) && (item.bet.bet.serverSeed.seed == previousServerSeedStake)) || ((item.bet.bet.clientSeed.seed == previousClientSeedStake) && (item.bet.bet.serverSeed.seed == previousServerSeedStake)) )
      {
         console.log("verification eligible");
         var element = {};
         console.log('new bet has come',item.bet.iid);
         betDataEnriched.map( (innerItem) => {
           // console.log("Inner Item :", innerItem);

            if(innerItem.iid == item.bet.iid)
            {
              let isVerified;
              const game = innerItem.bet.game;
              switch(game){
                case 'dice' : { isVerified = this.handleVerifyBetStake(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'limbo' : { isVerified = this.handleVerifyBetForLimbo(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'roulette' : { isVerified = this.handleVerifyBetForRoulette(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'plinko' : { isVerified = this.handlePlinko(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'baccarat' : { isVerified = this.handleBaccarat(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'videoPoker' : { isVerified = this.handleVideoPoker(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                  console.log("isVerified", isVerified);}
                  break;

                case 'hilo' : { isVerified = this.handleHilo(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'blackjack' : { isVerified = this.handleBlackjack(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'mines' : { isVerified = this.handleMines(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'keno' : { isVerified = this.handleKeno(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'diamondPoker' : { isVerified = this.handleDiamondPoker(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                case 'wheel' : { isVerified = this.handleWheel(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce, '10', 'medium');
                console.log("isVerified", isVerified);}
                break;

                case 'primedice' : { isVerified = this.handleVerifyBetPrimeDice(item.bet.bet.serverSeed.seed,item.bet.bet.clientSeed.seed,item.bet.bet.nonce);
                console.log("isVerified", isVerified);}
                break;

                default : isVerified = 0;
                   }

                   // console.log("item.bet.iid.split('house:')" , item.bet.iid.split('house:'));
              element.id = item.bet.iid.split('house:'); element.game = innerItem.bet.game; element.payout = innerItem.bet.payout;
              element.nonce = item.bet.bet.nonce; element.isVerified = isVerified;
              console.log('element : ', element);
              betData.push({element:element});
              this.setState({betData:betData});
            }
         })
        this.setState({viewRecentBetsStake:true})
        betData.sort((a, b) => {
          return a.element.nonce - b.element.nonce ;
        });
        console.log("betData : ",betData);
      }
  })
}catch(e){
 console.log("YO Crash")
}
}





    /* Method for Provably Fair Verification of bets for the PrimeDice Operator */

    handleVerifyBetStake = (serverSeedHash,clientSeed, nonce) => {
      // bet made with seed pair (excluding current bet)
      // crypto lib for hmac function
      const crypto = require('crypto');

      const roll = function(key, text) {
      // create HMAC using server seed as key and client seed as message
      const hash = crypto .createHmac('sha256', key) .update(text) .digest('hex');
      console.log('result hash',hash);


      let index = 0;
      let lucky = '';
      let compute = 0;
      while (index < 4){
        lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
        lucky = lucky/(Math.pow(256,index+1));
        compute = compute + lucky;
        index++;
      }

        compute = compute*10001/100;
        compute = compute.toString();
        compute = compute.split('.');
        compute[1] = compute[1].slice(0,2);
        compute = compute[0]+'.'+compute[1];
        console.log("LUCKY : ", compute);
        return compute;
      };



      let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
      this.setState({diceVerify:diceVerify});
      console.log(diceVerify);
      return diceVerify;
    }

/*****************************************************************************************************************************************************************************************************/

handleVerifyBetForRoulette = (serverSeedHash,clientSeed, nonce) => {
// bet made with seed pair (excluding current bet)
// crypto lib for hmac function
const crypto = require('crypto');
const roll = function(key, text) {
// create HMAC using server seed as key and client seed as message
const hash = crypto .createHmac('sha256', key) .update(text) .digest('hex');
console.log('result hash',hash);


let index = 0;
let lucky = '';
let compute = 0;
while (index < 4){
  lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
  lucky = lucky/(Math.pow(256,index+1));
  compute = compute + lucky;
  index++;
}

  compute = compute*37;
  compute = compute.toString();
  compute = compute.split('.');
  //compute[1] = compute[1].slice(0,2);
  compute = compute[0];
  console.log("LUCKY : ", compute);
  return compute;
};



let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
this.setState({diceVerify:diceVerify});
console.log(diceVerify);
return diceVerify;
}

/*****************************************************************************************************************************************************************************************************/

handleVerifyBetForLimbo = (serverSeedHash,clientSeed, nonce) => {
// bet made with seed pair (excluding current bet)
// crypto lib for hmac function
const crypto = require('crypto');
const roll = function(key, text) {
// create HMAC using server seed as key and client seed as message
const hash = crypto .createHmac('sha256', key) .update(text) .digest('hex');
console.log('result hash',hash);


let index = 0;
let lucky = '';
let compute = 0;
while (index < 4){
  lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
  lucky = lucky/(Math.pow(256,index+1));
  compute = compute + lucky;
  index++;
}

  compute = compute*100000000;
  compute = (100000000 / compute)*0.99;
  compute = compute.toString();
  compute = compute.split('.');
  compute[1] = compute[1].slice(0,2);
  compute = compute[0]+'.'+compute[1];
  console.log("LUCKY : ", compute);
  return compute;
};



let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
this.setState({diceVerify:diceVerify});
console.log(diceVerify);
return diceVerify;
}

/******************************************************************************************************************/




/* Method for Provably Fair Verification of bets for the PrimeDice Operator */

handleVerifyBetPrimeDice = (serverSeedHash,clientSeed, nonce) => {
  // bet made with seed pair (excluding current bet)
  // crypto lib for hmac function
  const crypto = require('crypto');
  const roll = function(key, text) {
  // create HMAC using server seed as key and client seed as message
  const hash = crypto .createHmac('sha512', key) .update(text) .digest('hex');
  let index = 0;
  let lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
  // keep grabbing characters from the hash while greater than
  while (lucky >= Math.pow(10, 6)) {
    index++; lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
  // if we reach the end of the hash, just default to highest number
   if (index * 5 + 5 > 128) {
     lucky = 9999; break;
   }
  }
  lucky %= Math.pow(10, 4);
  lucky /= Math.pow(10, 2);
  return lucky;
};
  let diceVerify = roll(serverSeedHash, `${clientSeed}-${nonce}`);
  this.setState({diceVerify:diceVerify});
  console.log(diceVerify);
  this.setState({nonce:0})
  return diceVerify;
}



/*****************************************************************************************************************************************************************************************************/


/* Method for getting Session Token for the Bitvest Operator */

getSessionTokenBitvest = async () => {
  const bitvest = await axios.post('https://bitvest.io/create.php');
  console.log('Token Behanchod!', bitvest.data.data.session_token);
  this.setState({session_token: bitvest.data.data.session_token});
}

/* Method for getting Server Seed Hash for the Bitvest Operator */

getNewServerseedHashBitvest = async () => {
 let {previousSeed, serverSeedHash, session_token } = this.state;
 console.log('session_token', session_token);
 const bitvest = await axios.post('https://bitvest.io/action.php',
  qs.stringify({
        "token":session_token,
        "secret":0,
        "act":"new_server_seed"
      }),
      { headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }});
 this.setState({serverSeedHash:bitvest.data.server_hash, previousSeed:bitvest.data.server_seed})
 this.getMyBetsBitvest();
}

/* Method for the User's Bet Data for the Bitvest Operator */

getMyBetsBitvest = async () => {
  let { betData, previousSeed, numberBetsVerFailed, isNonceManipulated } = this.state;
  betData = [];
  numberBetsVerFailed = 0;
  isNonceManipulated = false;
  const crypto = require('crypto');
  let bitvest = await axios.get('https://bitvest.io/update?games_only=1');
  console.log("bitvest value is : ", bitvest);

  bitvest.data.game.data.map(async (item)=>{
//    axios.get(`https://bitvest.io/results?query=${item.id}&game=dice&json=1`).then(sleeper(1000)).then((bet)=>{
//     console.log("bet value is : ", bet);

      // console.log('previousSeed:',previousSeed);
  //   let hashingUnhashed = crypto.createHash('sha256').update(previousSeed).digest('hex');
  //   console.log('hashing the unhashed',hashingUnhashed);
     if(previousSeed===item.server_seed){
      console.log("verification eligible");
//       console.log("betDetails",bet.data);
      //let bet = await axios.get(`https://bitvest.io/results?query=${item.id}&game=dice&json=1`).then(sleeper(1000));
      //console.log('bet details:',bet);
      let serverSeed = item.server_seed;
      console.log('server seed:',serverSeed);
      let isVerified = this.handleVerifyBetBitvest(serverSeed,item.user_seed, item.user_seed_nonce, item.roll);
      if(!isVerified) numberBetsVerFailed++;
      var element = {};
      element.id = item.id; element.game = item.game; element.roll = item.roll; element.side = item.side; element.target = item.target;
      element.nonce = item.user_seed_nonce;  element.isVerified = isVerified, element.timestamp = item.timestamp;
      console.log('element : ', element);
      betData.push({element:element});
      console.log('betData',betData);
      betData = betData.sort(function(a,b){
        return (a.element.timestamp - b.element.timestamp);
      });
      console.log('sorted betData',betData);
      this.setState({betData:betData});

      let testNonce = 0;
      betData.map((item)=>{
        if(item.element.nonce == testNonce)
        {
          console.log('current nonce',item.element.nonce);
          console.log('test nonce',testNonce);
          testNonce++;
          isNonceManipulated = false;
        }
        else
        {
          isNonceManipulated = true;
        }
      })

      this.setState({numberBetsVerFailed:numberBetsVerFailed});
      this.setState({isNonceManipulated:isNonceManipulated});
   }
//    })
   console.log('unverified bets',numberBetsVerFailed);
   //this.setState({isNonceManipulated:isNonceManipulated});
 })
}

/*ifNonceManipulated = () => {
  let {isNonceManipulated, betData} = this.state;
  isNonceManipulated = false;

  betData.sort(function(a,b){
    return (a.element.timestamp - b.element.timestamp);
  });
  console.log('sorted betData',betData);

  let newBets = betData.length;
  console.log('newBets',newBets);
  let highestNonce = 0;
  betData.map((item)=>{
    if(item.element.nonce > highestNonce)
    {
      highestNonce = item.element.nonce;
      console.log('current highest nonce',highestNonce);
    }
  })
  isNonceManipulated = (highestNonce == (newBets-1)) ? false : true;
  console.log('highestnonce',highestNonce);
  this.setState({isNonceManipulated:isNonceManipulated});
  this.setState({betData:betData});
}*/

/*Method for Provably Fair Verification of bets for the Bitvest Operator */


handleVerifyBetBitvest = (serverSeed, clientSeed, nonce, result) => {
  // bet made with seed pair (excluding current bet)
  // crypto lib for hmac function
  //let {numberBetsVerFailed} = this.state;
  const crypto = require('crypto');
  const roll = function(key, text) {
  // create HMAC using server seed as key and client seed as message
  const hash = crypto .createHmac('sha512', text) .update(key) .digest('hex');
  console.log('=============key',key);
  console.log('=======>text',text);
  console.log('=========hash',hash);
  let index = 0;
  let lucky = parseInt(hash.substring(index * 5, index * 5 + 5),16);
  console.log('===================lucky',lucky);

  // keep grabbing characters from the hash while greater than
  while (lucky >= Math.pow(10, 6)) {
    index++; lucky = parseInt(hash.substring(index * 5, index * 5 + 5),16);
  // if we reach the end of the hash, just default to highest number
   if (index * 5 + 5 > 128) {
     lucky = 999999;
     break;
   }
  }
  lucky /= Math.pow(10, 4);
  return lucky;
  // if(lucky==result) {
  //   return true;
  // }
  // else{
  //   //numberBetsVerFailed++;
  //   //this.state({numberBetsVerFailed:numberBetsVerFailed});
  //   //return false;
  // }
};
    let diceVerify = roll(serverSeed, `${clientSeed}|${nonce}`);
    this.setState({diceVerify:diceVerify});
    console.log('diceVerify', diceVerify);

    return diceVerify;
}

/*****************************************************************************************************************************************************************************************************/

/* Method for getting selected coin data (say BTC) for Crypto Games Operator */

getCoinData = async () => {
  const coin =  await axios.get('https://api.crypto-games.net/v1/settings/btc');
  console.log(coin.data);

}

/* Method for getting selected coin stats (say BTC) for Crypto Games Operator */

getCoinStats = async () => {
  const coin =  await axios.get('https://api.crypto-games.net/v1/coinstats/btc');
  console.log(coin.data);
}

/* Method for getting Server Seed Hash for Crypto Games Operator */

getServerSeed = async (apiKey) => {
  let {serverSeedHash} = this.state;
  window.localStorage.setItem('apiKey', apiKey);
  const seed = await axios.get(`https://api.crypto-games.net/v1/nextseed/btc/${apiKey}`);

  console.log(seed.data.NextServerSeedHash);
  this.setState({serverSeedHash:seed.data.NextServerSeedHash})
}

/* Method for getting a User's Details for Crypto Games Operator */

getUser = async (apiKey) => {
  const user = await axios.get(`https://api.crypto-games.net/v1/user/btc/${apiKey}`);
  this.setState({user:user.data.Nickname});
}

/* Method for getting a Placing a Bet for Crypto Games Operator */

placeBet = async (apiKey) => {
  let { clientSeed, nonce, BetIdArray, betAmount, betPayout } = this.state;
  let input = { Bet: betAmount, Payout: betPayout, UnderOver: true, ClientSeed: clientSeed, Nonce:nonce };
  let data = JSON.stringify(input);
  const bet = await axios.post(`https://api.crypto-games.net/v1/placebet/btc/${apiKey}`,
    data, { headers: {'Content-Type': 'application/json' }}
  );
  console.log(bet.data);
  let { Balance, BetId, Roll } = bet.data
  BetIdArray.push(BetId)
  this.setState({BetIdArray:BetIdArray});
  //this.getBetData(BetIdArray);
  var newNonce = parseInt(nonce);
  this.setState({BetId:BetId, Balance:Balance, Roll:Roll, nonce:newNonce+1});
  this.getServerSeed(apiKey);
}

/* Method for getting a Bet Data (say IDs) for Crypto Games Operator */

getBetData = async (BetIdArray) => {
  let { betData, user } = this.state;

  BetIdArray.map(async (i)=> {
   const bet =  await axios.get(`https://api.crypto-games.net/v1/bet/${i}`);
      if(bet.data.User==user){
          betData.push(bet.data)
          this.setState({betData:betData});
        }
  })
        console.log('betData', betData);
}

/* Method for getting Complete Bet Data for Crypto Games Operator */

getBetDataById = async (BetId) => {
  let { betData, user } = this.state;

   const bet =  await axios.get(`https://api.crypto-games.net/v1/bet/${BetId}`);
      if(bet.data.User==user){
          betData.push(bet.data)
          this.setState({betData:betData});
        }
        console.log('betData', betData);
}


  render() {
    const { gettingStarted, settings, verification, operators, clientSeed, serverSeedHash, nonce, betData, cryptoGames, primeDice, stake, bitvest, diceResult, diceVerify, verify, apiKey, apiKeyStake, usernameStake, enterAPI, enterAPIStake,
    Balance, BetId, Roll, nonceChecked, toggleState, betAmount, betPayout, betPlaced, isNonceManipulated, numberBetsVerFailed, betDataById, betDataEnriched, viewRecentBetsStake, faqs, showAlert, popupResult, active_game, mines, keno, numOfRows,
     numOfColumns, numOfColumnsKeno } = this.state;
      return (
          <CookiesProvider>
            <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}>
               <FrameContextConsumer>
               {
               // Callback is invoked with iframe's window and document instances
                   ({document, window}) => {
                      // Render Children
                      return (<div className={'my-extension text-center'}>

                       <div className="nav-wrapper">
                        <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                            <li className={settings?"nav-item show": "nav-item"}
                            onClick={()=>{
                              this.setState({gettingStarted:false, settings:true, verification:false,  operators:false, faqs:false});
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true">Settings</a>
                            </li>
                            <li className={verification?"nav-item show": "nav-item"} onClick={()=>{
                              this.getAllBetsStake();
                              this.setState({gettingStarted:false, settings:false, verification:true,  operators:false, faqs:false});
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false">Verification</a>
                            </li>
                            <li className={operators?"nav-item show": "nav-item"} onClick={()=>{
                              this.setState({gettingStarted:false, settings:false, verification:false,  operators:true, faqs:false});
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false">Casinos</a>
                            </li>
                            <li className={faqs?"nav-item show": "nav-item"} onClick={()=>{
                              this.setState({gettingStarted:false, settings:false, verification:false,  operators:false, faqs:true});
                            }}>
                                <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false">FAQs</a>
                            </li>
                         </ul>
                       </div>
                      <div style={{display:gettingStarted?'block':'none'}}>

                       <h6 className="text-center"><strong>Crypto Gambling Foundation Verifier</strong></h6>
                       <img src='https://pbs.twimg.com/profile_images/906057204578390016/-icT77rY_400x400.jpg'  style={{ width: '75%'}}/>

                       <p><span style={{fontStyle:'bold'}}>Operator</span> is a CGF verified operator.</p>
                       <button className="btn btn-info mb-3" type="button" onClick={()=>{
                         // this.getSessionTokenBitvest()
                         this.setState({gettingStarted:!gettingStarted, operators:true})
                       }}>
                       Get Started Now
                       </button>

                      </div>

                      <div style={{display:faqs?'block':'none'}}>
                       <div className="text-left">
                        <h3 className="text-center">Glossary</h3>

                         <h5 className="mt-3">Algorithm</h5>

                         A procedure that is carried out in sequential steps to solve a problem.

                        <h5 className="mt-3">Balance</h5>

                         The amount of money a player has in their wallet or account.

                        <h5 className="mt-3">Bust</h5>

                         The depletion of a player’s balance.

                        <h5 className="mt-3">Cryptography</h5>

                         The method of making information secure.

                        <h5 className="mt-3">Deterministic</h5>

                         An algorithm that when given a particular input, will always produce the same output.

                        <h5 className="mt-3">Hash</h5>

                         A cryptographic hash function takes any input, such as a file, image or text and transforms it into fixed-sized alphanumeric string called a ”hash”. This is a one-way process meaning, that when you are given a hash, there is no feasible way to know the original input that created it. The slightest change to the input will have a significant, human readable change to the hash. This deterministic feature is what makes hashing the perfect solution for verifying that two inputs are in fact, the same.

                        <h5 className="mt-3">House Edge</h5>

                         A percentage of each wager(usually only the winning bets apply) that an online casino keeps for itself. In a physical casino and some online games such as roulette, the house edge refers to the expectation of loses from the player due to the mathematical advantage the casino has over you based on each specific game’s design.


                        <h5 className="mt-3">Nonce</h5>

                         A nonce is a number added to the end of a seed and is only used once per seed. A nonce does not have to be secret or unpredictable, but it must be unique so iit can also be used as a counter.

                        <h5 className="mt-3">Provably Fair</h5>
                         Is a term that describes how the results generated by an RNG were not manipulated by the casino.

                        <h5 className="mt-3">Random Number Generator</h5>

                         Or RNG, is a device or algorithm that generates a sequence of numbers that has no set pattern.

                        <h5 className="mt-3">Result</h5>

                         The outcome generated by the RNG.

                        <h5 className="mt-3">Rigged</h5>

                         In an online casino’s chat room, you can find people using this term as a way to justify the money they just lost because of their conscious decision to gamble.

                        <h5 className="mt-3">Salt</h5>

                         A value that is attached to an input before hashing , that is unique to a specific user.

                        <h5 className="mt-3">Seed</h5>

                         In a provably fair system, this is the data that is used by an RNG to generate the results of a game. The server seed is provided by the operator. The client seed is provided by the player so that the player is involved in the game’s outcome.

                        <h5 className="mt-3">SHA-256</h5>
                        SHA is an acronym for “Secure Hash Algorithms”. The 256 just refers to the SHA-2 family of hash functions and is most commonly used by crypto gambling sites. These are military-grade cryptographic hash functions and they have been standardized by the U.S. National Institute of Standards and Technology (NIST).


                        <h5 className="mt-3">Wager</h5>

                         The amount that a player risks per round.

                       </div>
                     </div>


                      <div style={{display:enterAPIStake?'block':'none'}}>
                       <div className="form-group">
                         <label className="form-control-label">Enter Your Bet Token</label>
                         <img src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%'}} data-toggle="popover" data-placement="left" title='Instructions for using extension on Stake and PrimeDice:
                             1. Open website then click "settings" from the dropdown menu at the top of the screen.
                             2. Click "Tokens"
                             3. Click "Reveal" then copy the token.
                             4. Enter the token and your username into the extension, then click submit.'/>
                         <input className="form-control form-control-sm" type="text" value={apiKeyStake} placeholder="Token" onChange={(e)=>{this.setState({apiKeyStake:e.target.value})}}/>
                         <label className="form-control-label">Enter Your Username</label>
                         <input className="form-control form-control-sm" type="text" value={usernameStake} placeholder="Username" onChange={(e)=>{this.setState({usernameStake:e.target.value})}}/>
                         <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                           this.handleRequest();
                           this.setState({gettingStarted:false, settings:true, enterAPIStake:false});
                         }}> Submit</button>
                       </div>
                     </div>

                     <div style={{display:enterAPI?'block':'none'}}>

                     <div className="form-group">
                       <label className="form-control-label">Enter Your API Key</label>
                       <input className="form-control form-control-sm" type="text" value={apiKey} placeholder="API Key" onChange={(e)=>{this.setState({apiKey:e.target.value})}}/>
                       <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                         this.setState({gettingStarted:false, settings:true, enterAPI:false})
                         this.getUser(apiKey)
                         this.getServerSeed(apiKey)
                       }}> Submit</button>
                     </div>



                     </div>


                     <div className="SettingsUI Bitvest Stake" style={{display:settings?'block':'none'}}>
                     <div className="form-group">
                       <label className="form-control-label">Next Server Seed Hash </label>
                       <img src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%'}}
                       data-toggle="popover" data-placement="left" title="This is the server seed that has been created by the casino. It is sent to you in advance of any bets being made to ensure the casino did not change or manipulate the outcome of any game results. It is hashed(encrypted) to prevent players from calculating the upcoming game results. Once you request a new server seed, the one that is currently in use will be unhashed(decrypted) and sent to the verification tab. All bets made using that server seed will be automatically verified. You will be notified if any bets did not pass verification."/>
                       <input className="form-control form-control-sm" type="text" value={serverSeedHash} placeholder="" onChange={(e)=>{this.setState({serverSeedHash:e.target.value })}}/>
                       <button type="button" className="btn btn-secondary m-2"   onClick={this.handleRequest}> Request</button>
                     </div>

                     <div className="form-group">
                       <label className="form-control-label">Client Seed</label>
                       <img src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%'}} data-toggle="popover" data-placement="left" title="This is the client seed. Sometimes called the player seed. It is very important that you customize this after you request a new server seed. The server seed and client seed pre-filled by default. To ensure provable fairness, you must customize your own client seed. It will be used in combination with the server seed to generate thr game results."/>

                       <input className="form-control form-control-sm" type="text" value={clientSeed} placeholder="CURRENT CLIENT SEED" onChange={(e)=>{this.setState({clientSeed:e.target.value})}}/>
                       <button type="button" className="btn btn-secondary m-2"   onClick={this.getClientSeed}> Generate</button>
                       <button type="button" className="btn btn-secondary m-2"   onClick={()=>{stake && this.submitClientSeedStake(clientSeed)}}> Submit</button>
                     </div>

                     <div className="form-group" style={{display:toggleState?'block':'none'}}>
                       <h3> Place Bet</h3>
                       <label className="form-control-label">Amount</label>
                       <input className="form-control form-control-sm" type="number" value={betAmount} placeholder="" onChange={(e)=>{this.setState({betAmount:e.target.value})}}/>
                       <label className="form-control-label">Payout</label>
                       <input className="form-control form-control-sm" type="number" value={betPayout} placeholder="" onChange={(e)=>{this.setState({betPayout:e.target.value})}}/>

                       <div className="custom-control custom-checkbox mb-3">
                         <input className="custom-control-input" id="customCheck2" type="checkbox" checked={nonceChecked} onChange={(e)=>{this.setState({nonceChecked:e.target.checked})}}/>
                         <label className="custom-control-label" htmlFor="customCheck2">Add Nonce.</label>
                       </div>
                       <div className="form-group" style={{display:nonceChecked?'block':'none'}}>
                         <label className="form-control-label">Nonce</label>
                         <input className="form-control form-control-sm" type="number" placeholder="" value={nonce}  onChange={(e)=>{this.setState({nonce:e.target.value})}}/>
                       </div>
                       <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                         this.setState({betPlaced:true, verification:false})
                         this.placeBet(apiKey)
                       }}> Bet</button>
                     </div>

                     <div style={{display:betPlaced?'block':'none'}}>
                       <div className="alert alert-info" role="alert">
                         <strong>Your Placed Bet result : {Roll}</strong>
                       </div>
                         <div className="alert alert-primary" role="alert" style={{fontSize: '11px'}}>
                           Balance : {Balance}
                       </div>
                       <div className="alert alert-warning" role="alert" style={{fontSize: '11px'}}>
                         BetId : {BetId}
                       </div>
                   </div>


                     </div>


                     <div className="SettingsUI-CryptoGames" style={{display:cryptoGames?'block':'none'}}>
                     <div className="nav-wrapper">
                       <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                           <li className="nav-item show" onClick={()=>{
                             this.setState({gettingStarted:false, settings:true,   verification:false, operators:false});
                             this.getServerSeed(apiKey)
                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true"><i className="fa fa-cloud-upload-96 mr-2"></i>Settings</a>
                           </li>
                           <li className="nav-item" onClick={()=>{
                             this.setState({gettingStarted:false, settings:false, verification:true,  operator:false});

                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false"><i className="fa fa-bell-55 mr-2"></i>Verification</a>
                           </li>
                           <li className="nav-item" onClick={()=>{
                             this.setState({gettingStarted:false, settings:false, verification:false,  operators:true});
                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Casinos</a>
                           </li>
                       </ul>
                     </div>
                     <label className="custom-toggle" style={{position: 'absolute'}}>
                       <input type="checkbox" checked={toggleState} onChange={(e)=>{this.setState({toggleState:!toggleState, betPlaced:false})}}/>
                       <span className="custom-toggle-slider rounded-circle" data-label-off="No" data-label-on="Yes"></span>
                     </label>
                     <label className="ml-5 pl-3 form-control-label">Make bets from extension</label>

                     <div className="form-group">
                       <label className="form-control-label">Server Seed Hash</label>
                       <input className="form-control form-control-sm" type="text" value={serverSeedHash} placeholder="7dfh6fg6jg6k4hj5khj6kl4h67l7mbngdcghgkv" onChange={(e)=>{this.setState({serverSeedHash:e.target.value})}}/>
                     </div>
                     <div className="form-group">
                       <label className="form-control-label">Client Seed</label>
                       <input className="form-control form-control-sm" type="text" value={clientSeed} placeholder="CURRENT CLIENT SEED" onChange={(e)=>{this.setState({clientSeed:e.target.value})}}/>
                       <button type="button" className="btn btn-secondary m-2"   onClick={this.getClientSeed}> Generate</button>
                     </div>

                     <div className="form-group" style={{display:toggleState?'block':'none'}}>
                       <h3> Place Bet</h3>
                       <label className="form-control-label">Amount</label>
                       <input className="form-control form-control-sm" type="number" value={betAmount} placeholder="" onChange={(e)=>{this.setState({betAmount:e.target.value})}}/>
                       <label className="form-control-label">Payout</label>
                       <input className="form-control form-control-sm" type="number" value={betPayout} placeholder="" onChange={(e)=>{this.setState({betPayout:e.target.value})}}/>

                       <div className="custom-control custom-checkbox mb-3">
                         <input className="custom-control-input" id="customCheck2" type="checkbox" checked={nonceChecked} onChange={(e)=>{this.setState({nonceChecked:e.target.checked})}}/>
                         <label className="custom-control-label" htmlFor="customCheck2">Add Nonce.</label>
                       </div>
                       <div className="form-group" style={{display:nonceChecked?'block':'none'}}>
                         <label className="form-control-label">Nonce</label>
                         <input className="form-control form-control-sm" type="number" placeholder="" value={nonce}  onChange={(e)=>{this.setState({nonce:e.target.value})}}/>
                       </div>
                       <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                         this.setState({betPlaced:true, verification:false})
                         this.placeBet(apiKey)
                       }}> Bet</button>
                     </div>

                     <div style={{display:betPlaced?'block':'none'}}>
                       <div className="alert alert-info" role="alert">
                         <strong>Your Placed Bet result : {Roll}</strong>
                       </div>
                         <div className="alert alert-primary" role="alert" style={{fontSize: '11px'}}>
                           Balance : {Balance}
                       </div>
                       <div className="alert alert-warning" role="alert" style={{fontSize: '11px'}}>
                         BetId : {BetId}
                       </div>
                   </div>


                     </div>

                     <div className="VerificationUI-Stake" className="table-responsive" style={{display: verification?'block':'none', fontSize: '11px'}}>

                     <span className="alert alert-success p-2">
                       <span>Nonce</span>
                       <span  className={"badge badge-md badge-circle badge-floating badge-danger border-white"}>{isNonceManipulated?"Fail":"Ok"}</span>
                     </span>
                     <span className="alert alert-danger p-2">
                       <span>Bets Fail</span>
                       <span  className="badge badge-md badge-circle badge-floating badge-danger border-white">{numberBetsVerFailed}</span>
                     </span>
                     <div className="form-group">
                       <button type="button" className="btn btn-secondary m-2"   onClick={this.processBetsStake}> Verify Recent Bets</button>
                     </div>
                     <div className="Bitvest" style={{display:'none'}}>
                       <table className="table align-items-center table-flush table-hover">
                         <thead className="thead-light">
                           <tr>
                             <th>Id</th>
                             <th>Game</th>
                             <th>Roll</th>
                             <th>Side</th>
                             <th>Target</th>
                             <th>Nonce</th>
                             <th>Status</th>
                           </tr>
                         </thead>

                         <tbody>
                           {betData.map((item,i)=>{
                             return <tr key={i}>
                             <td>
                             {item.element.id}
                             </td>
                             <td>
                             {item.element.game}
                             </td>
                             <td>
                             {item.element.roll}
                             </td>
                             <td>
                             {item.element.side}
                             </td>
                             <td>
                             {item.element.target}
                             </td>
                             <td>
                             {item.element.nonce}
                             </td>
                             <td>
                             {item.element.isVerified
                               ? <a href="#"  className="badge badge-pill badge-success">Success</a>
                               : <a href="#"  className="badge badge-pill badge-danger">Failed</a>
                             }
                             </td>
                             </tr>
                           })}
                         </tbody>
                       </table>
                     </div>
                     <div className="Stake" style={{display:verification?'block':'none'}}>
                       <table className="table align-items-center table-flush table-hover">
                         <thead className="thead-light">
                           <tr>
                             <th>Id</th>
                             <th>Game</th>
                             <th>Payout/Side</th>
                             <th>Nonce</th>
                             <th>Result</th>
                           </tr>
                         </thead>

                         <tbody>
                           {betData.map((item,i)=>{
                             return <tr key={i}>
                             <td>
                             {item.element.id}
                             </td>
                             <td>
                             {item.element.game}
                             </td>
                             <td>
                             {item.element.payout}{item.element.side}
                             </td>
                             <td>
                             {item.element.nonce}
                             </td>
                             <td>
                             {(item.element.game==='baccarat' || item.element.game==='hilo' || item.element.game==='blackjack' || item.element.game==='diamondPoker' || item.element.game==='videoPoker' || item.element.game==='mines' || item.element.game==='keno' || item.element.game==='plinko')
                             ?<button className="btn btn-info" onClick = {() => {
                               this.setState({showAlert:true, active_game:item.element.game, popupResult:item.element.isVerified});
                             }} title="Results"> </button>
                            :item.element.isVerified
                            }

                             {showAlert &&
                               <SweetAlert
                                   confirmBtnText="Ok"
                                   confirmBtnBsStyle="info"
                                   title="Bet Results"
                                   onConfirm={this.hideAlertConfirm}
                                   style={{marginLeft: '0', left:'0%', width: '400px', marginTop:'-255px', overflowX: 'scroll', overflowY: 'scroll', height: '406px'}}
                               >
                                  {(active_game==='diamondPoker' || active_game==='plinko')?
                                    popupResult.map((item, i)=>{
                                      return <p style={{ fontSize: 'x-small'}}>{item+" "}</p>;
                                      <img src={require('./images/diamonds/diamonds/1x/' + item +'.png')} style={{width:"10%"}}/>;
                                  })
                                  :active_game==='mines'?
                                  <table>
                                  <tbody>
                                    {numOfRows.map((j) => {
                                      return (<tr key={j}>
                                                {numOfRows.map((i)=>{
                                                  return <td key={j*5+i}>
                                                  <img src={require((mines[0]==((j)*5+(i))) || (mines[1]==((j)*5+(i))) || (mines[2]==((j)*5+(i)))?'./images/mine.png':'./images/gem.png')} style={{width:"90%"}}/>
                                                  </td>
                                                })}
                                      </tr>)
                                    })}
                                  </tbody>
                                  </table>
                                  :active_game==='keno'?
                                  <table>
                                  <tbody>
                                    {numOfRows.map((j) => {
                                      return (<tr key={j}>
                                        {numOfColumnsKeno.map((i)=>{
                                          return (<td key={(j*8+i)}>
                                          <button className={(keno[0]==((j)*8+(i))) || (keno[1]==((j)*8+(i))) || (keno[2]==((j)*8+(i))) || (keno[4]==((j)*8+(i)))|| (keno[4]==((j)*8+(i))) || (keno[5]==((j)*8+(i))) || (keno[6]==((j)*8+(i))) || (keno[7]==((j)*8+(i))) || (keno[8]==((j)*8+(i))) || (keno[9]==((j)*8+(i)))?'btn btn-success':'btn btn-info'}>{(j)*8+i+1} </button>
                                          </td>);
                                        })}
                                      </tr>)
                                    })}
                                    </tbody>
                                  </table>

                                  :
                                  popupResult.map((item, i)=>{
                                    return <img src={chrome.runtime.getURL('/images/cards-png/' + item +'.png')} alt="Card" style={{width:"10%"}}/>;
                                })}
                               </SweetAlert>}
                             </td>
                             </tr>
                           })}
                         </tbody>
                       </table>
                     </div>

                     </div>


                     <div className="VerificationUI-CryptoGames table-responsive" style={{display:verification && cryptoGames?'block':'none', fontSize: '11px'}}>
                     <div className="nav-wrapper">
                       <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                           <li className="nav-item" onClick={()=>{
                             this.setState({gettingStarted:false, settings:true,   verification:false, operators:false});
                             this.getServerSeed(apiKey)
                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true"><i className="fa fa-cloud-upload-96 mr-2"></i>Settings</a>
                           </li>
                           <li className="nav-item show" onClick={()=>{
                             this.setState({gettingStarted:false, settings:false, verification:true,  operators:false});
                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false"><i className="fa fa-bell-55 mr-2"></i>Veri-----fication</a>
                           </li>
                           <li className="nav-item" onClick={()=>{
                             this.setState({gettingStarted:false, settings:false, verification:false,  operators:true});
                           }}>
                               <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Casinos</a>
                           </li>
                       </ul>
                     </div>

                     <div className="primeDice" style={{display:primeDice?'block':'none'}}>
                         <div className="form-group">
                           <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                             this.handleVerifyBetPrimeDice(serverSeedHash, clientSeed, nonce);
                             console.log(serverSeedHash, clientSeed, nonce);
                           }}> Verify</button>

                         </div>

                     </div>

                     <div style={{display:verify?'block':'none'}}>
                       <div className="alert alert-info" role="alert">
                         <strong>Your verified result : {diceVerify}</strong>
                       </div>
                         <div className="alert alert-primary" role="alert" style={{fontSize: '11px'}}>
                           ServerSeed : {serverSeedHash}
                       </div>
                       <div className="alert alert-warning" role="alert" style={{fontSize: '11px'}}>
                         Client Seed : {clientSeed}
                       </div>
                   </div>



                     </div>


                     <div className="Operators-UI table-responsive" style={{display:!verification&&operators?'block':'none'}}>

                       <div className="operators-icons">
                         <div className="m-3" onClick={()=>{
                           this.setState({operators:false, primeDice:false,  stake:true, bitvest:false, enterAPIStake:true})
                         }}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="66.95" height="33.47"><title>Stake</title> <path d="M4.34,9.62c0-4.48,2.85-7,8.1-7,3.79,0,4.46,2.47,4.47,3.36,0,1.73-2.44,3.56-2.44,3.56s.14,1.07,2.23,1.06,4.13-1.39,4.12-4.85c0-4-4.18-5.78-8.29-5.77C9.09,0,0,.5,0,9.56c0,8,15.2,8.75,15.22,13.91,0,5.59-6.26,7.1-8.37,7.11a2.72,2.72,0,0,1-3-2.35c0-4.53,4.49-5.79,4.49-5.79a1.89,1.89,0,0,0-2-1.84c-4.5,0-6.29,3.89-6.28,7.66,0,3.21,2.29,5.22,5.71,5.21,6.56,0,14-3.22,13.92-10.33C19.67,16.49,4.36,14.76,4.34,9.62Z" fill="currentColor"></path><path d="M66.83,27.42c-.06-.12-.2-.09-.4.07A8.8,8.8,0,0,1,60,29.86c-7.26,0-8.51-11.94-8.51-11.94s5.52-4.13,6.39-5.79-1.89-2-1.89-2-3.86,4.71-6.61,6.09c.3-2,2.32-6.71,2.45-9.39s-3.23-2-3.77-1.78c0,1.18-3,11.81-4,17.66-.63,1-1.54,2.18-2.35,2.18-.47,0-.64-.87-.65-2.12,0-1.73,1-4.51,1-6.19,0-1.17-.54-1.24-1-1.24l-.75,0c-1.19,0-.8-1-1.86-1-3.26,0-7.41,3.57-7.59,9a9.36,9.36,0,0,1-3.43,1.65c-.82,0-1-.77-1-1.43,0-1.15,1.88-8,1.88-8s2.38-.61,3.42-.81c.79-.15,1-.21,1.32-.59s.91-1.17,1.39-1.87,0-1.26-.89-1.25a31,31,0,0,0-4.31.74S30.65,5.16,30.65,5s-.18-.2-.43-.2A8.7,8.7,0,0,0,28,5.37a3.8,3.8,0,0,0-2,2.15c-.17.57-1.3,5-1.3,5s-6,2.09-6.87,2.4a.13.13,0,0,0-.09.12s.7,2.7,2.11,2.69a19,19,0,0,0,4-1.22s-1.53,6.1-1.53,8.12c0,1.3.62,2.83,3.16,2.82a10,10,0,0,0,5.6-2.07,3.28,3.28,0,0,0,3.15,2,6.46,6.46,0,0,0,4.28-2.08,2.89,2.89,0,0,0,2.61,2.05c.9,0,1.84-1,2.53-2a4.06,4.06,0,0,0,0,.62c.28,2.52,4,1,4.22.69.13-1.83,0-5.56.78-7.86C49.63,26.72,53.3,32,59.89,32c3.69,0,5.58-1.08,6.37-1.95A2.73,2.73,0,0,0,66.83,27.42ZM35.19,24.84c-3.16,0,1-8.2,3.67-8.21C38.86,17.68,38.8,24.82,35.19,24.84Z" fill="currentColor"></path><path d="M60.89,27.35a7.58,7.58,0,0,0,5.48-2.5c.52-.8-.61-2-1-2a5.12,5.12,0,0,1-4,1.91c-2.5,0-1.93-2.73-1.93-2.73s4.8.62,6.73-2.83a4.65,4.65,0,0,0,.39-3.29,3.85,3.85,0,0,0-3.87-1.69c-2.72.23-6.16,3.08-6.92,6.5C55.24,23.48,56.38,27.37,60.89,27.35Zm3-11.51c.45,0,.41.72.29,1.49-.17,1.05-1.61,3.72-4.36,3.62C60.05,19.4,62.1,15.9,63.94,15.84Z" fill="currentColor"></path></svg>
                         </div>
                       <div className="m-3" style={{cursor:'pointer'}} onClick={()=>{
                         this.setState({operators:false, primeDice:true, stake:false, bitvest:false, enterAPIStake:true})
                       }}>
                         <svg width="144.95" height="50" viewBox="0 0 1896 327"><title>Prime Dice</title><path d="M1750 263a74 74 0 0 1-23 17q-13 6-31 6t-31-6a63 63 0 0 1-23-14 66 66 0 0 1-15-24 86 86 0 0 1-5-29 74 74 0 0 1 6-29 72 72 0 0 1 15-23 71 71 0 0 1 23-16 80 80 0 0 1 61 0 71 71 0 0 1 23 17l-22 22a43 43 0 0 0-14-11 41 41 0 0 0-18-4 38 38 0 0 0-17 4 37 37 0 0 0-12 10 39 39 0 0 0-7 13 56 56 0 0 0-3 16 53 53 0 0 0 3 16 42 42 0 0 0 7 14 36 36 0 0 0 29 14 44 44 0 0 0 19-4 42 42 0 0 0 14-11l21 22zm-489-103a69 69 0 0 0-14 23 76 76 0 0 0-5 28 87 87 0 0 0 5 30 66 66 0 0 0 37 39 77 77 0 0 0 30 6q16 0 28-4a88 88 0 0 0 19-7 57 57 0 0 0 11-9l-19-21a41 41 0 0 1-8 5 73 73 0 0 1-13 5 71 71 0 0 1-18 1 42 42 0 0 1-13-2 39 39 0 0 1-12-7 35 35 0 0 1-9-10 28 28 0 0 1-4-14h103v-5a118 118 0 0 0-4-29 74 74 0 0 0-11-25 59 59 0 0 0-21-18q-13-7-32-7c-19 0-37 7-50 21zm80 28a29 29 0 0 1 2 10h-67a26 26 0 0 1 2-10 30 30 0 0 1 7-10 35 35 0 0 1 11-7 39 39 0 0 1 15-3 34 34 0 0 1 14 3 31 31 0 0 1 10 7 30 30 0 0 1 6 10zm459-43a67 67 0 0 0-22 15 69 69 0 0 0-14 23 76 76 0 0 0-6 28 87 87 0 0 0 6 30 66 66 0 0 0 37 39 77 77 0 0 0 30 6q16 0 28-4a88 88 0 0 0 19-7 57 57 0 0 0 11-9l-19-21a42 42 0 0 1-9 5 73 73 0 0 1-12 5 71 71 0 0 1-18 1 42 42 0 0 1-13-2 40 40 0 0 1-13-7 35 35 0 0 1-8-10 28 28 0 0 1-4-14h103v-5a118 118 0 0 0-4-29 74 74 0 0 0-11-25 59 59 0 0 0-21-18q-13-7-32-7a70 70 0 0 0-28 6zm58 43a29 29 0 0 1 2 10h-67a26 26 0 0 1 2-10 30 30 0 0 1 7-10 36 36 0 0 1 11-7 38 38 0 0 1 15-3 34 34 0 0 1 14 3 31 31 0 0 1 10 7 30 30 0 0 1 6 10zm-446-22a73 73 0 0 0-12 21q-5 12-5 28 0 17 6 30a70 70 0 0 0 13 23 57 57 0 0 0 20 13 55 55 0 0 0 22 5 53 53 0 0 0 14-2 60 60 0 0 0 11-4 47 47 0 0 0 9-6 69 69 0 0 0 7-6v13h34V86h-34v61l-7-2a39 39 0 0 0-7-2c-25-6-54 3-71 23zm73 7a28 28 0 0 1 12 5v42a45 45 0 0 1-2 13 36 36 0 0 1-6 11 29 29 0 0 1-10 9 31 31 0 0 1-15 3q-16 0-25-12t-9-29a52 52 0 0 1 3-16 46 46 0 0 1 6-14c12-14 28-17 46-12zM669 86v196h36v-73h29c16 0 32-5 44-14a56 56 0 0 0 15-20c8-14 8-32 3-47a53 53 0 0 0-10-20 70 70 0 0 0-54-22zm36 92v-60h26q13 0 22 8c12 11 12 32 1 44q-9 8-23 8zm121-34h33l1 17a67 67 0 0 1 6-6 51 51 0 0 1 42-13v33a31 31 0 0 0-4-1 55 55 0 0 0-9 0 39 39 0 0 0-13 2 32 32 0 0 0-11 7 33 33 0 0 0-10 24v74h-35V144zm109-58h37v36h-37V86zm1 58h34v137h-34V144zm66 0h33l1 16c12-13 22-19 40-19q27 0 41 20 11-11 22-15t25-5q26 0 40 15t14 42v83h-34v-83q0-13-7-20t-18-7a30 30 0 0 0-23 10 34 34 0 0 0-6 12 45 45 0 0 0-3 14v74h-34v-83q0-13-7-20c-11-12-31-8-41 3a35 35 0 0 0-6 12 45 45 0 0 0-2 14v74h-35V144zm559-58h37v36h-37V86zm2 58h34v137h-34z"></path><rect width="417" height="41" x="53" y="285" rx="8" ry="8"></rect><path d="M62 259l128-1a9 9 0 0 0 6-2 12 12 0 0 0 3-4 13 13 0 0 0 1-5 10 10 0 0 0-3-7L17 68a10 10 0 0 0-7-3 10 10 0 0 0-7 2 9 9 0 0 0-3 4 13 13 0 0 0 0 6l51 174c1 6 5 8 11 8zm399 0l-128-1a9 9 0 0 1-6-2 12 12 0 0 1-3-4 13 13 0 0 1-1-5 10 10 0 0 1 3-7L506 68a10 10 0 0 1 7-3 10 10 0 0 1 7 2 9 9 0 0 1 3 4 14 14 0 0 1 0 6l-51 174c-1 6-5 8-11 8zm-75-141L272 4a15 15 0 0 0-22 0L136 118a15 15 0 0 0 0 22l114 114c6 6 17 6 23 0l113-114a15 15 0 0 0 0-22zm-193 30a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm68 68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm0-68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm0-68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm68 68a19 19 0 1 1 19-19 19 19 0 0 1-19 19z"></path></svg>
                       </div>
                       <div className="m-3" style={{cursor:'pointer'}} onClick={()=>{
                         this.setState({operators:false, primeDice:false, stake:false, bitvest:true, settings:true, enterAPIStake:false})
                         this.getSessionTokenBitvest();
                       }}>
                         <img src="https://cdn.worldvectorlogo.com/logos/bitvest.svg"  style={{width:"144.95", width: '35%'}} title="Bitvest"/>
                       </div>
                     </div>



                     </div>
                   </div>);
                    }
                }
                </FrameContextConsumer>
            </Frame>
          </CookiesProvider>
        )
    }
}

const app = document.createElement('div');
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Main />, app);

app.style.display = "none";

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if( request.message === "clicked_browser_action") {
        toggle();
      }
   }
);

function toggle(){
   if(app.style.display === "none"){
     app.style.display = "block";
   }else{
     app.style.display = "none";
   }
}
