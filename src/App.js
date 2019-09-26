import React, { Component } from 'react';
import createHmac from 'create-hmac';
import logo from './logo.svg';
import './App.css';



class App extends Component {
    constructor(){
      super();
      this.state = {
        client_seed: '',
        server_seed: '',
        server_hash: '',
        nonce: null,
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
        numMines: 1,
        active_game: 'Chartbet',
        MAX_ROLL: 10001,
        MAX_ROULETTE: 37,
        MAX_CHARTBET: 1000000
        }
      }

      /**
       * Returns the SHA256 hash of the input
       * @param {string} data - The data to hash
       * @returns {string} The hex representation of the SHA256 hash
       */
      sha256 = (data) => {
          let md = crypto.md.sha256.create();
          md.update(data);
          return md.digest().toHex();
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
      bytes = (length, num) => {
          let result = '';
          let round = 0;
          while(result.length < length) {
              result += this.hmac_sha256(this.server_seed, `${this.client_seed}:${this.nonce||0}:${round++}`);
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
          let mines = [];
          for(let i = 0; i < 25; i++) {
              mines.push(i);
          }
          let result = [];
          for(let i = 0; i < nums.length; i++) {
              result.push(mines.splice(Math.floor((25-i)*nums[i]), 1)[0]);
          }
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
          const cards = ['&spades;2', '&hearts;2', '&diams;2', '&clubs;2', '&spades;3', '&hearts;3', '&diams;3', '&clubs;3', '&spades;4', '&hearts;4', '&diams;4', '&clubs;4',
          '&spades;5', '&hearts;5', '&diams;5', '&clubs;5', '&spades;6', '&hearts;6', '&diams;6', '&clubs;6', '&spades;7', '&hearts;7', '&diams;7', '&clubs;7', '&spades;8', '&hearts;8',
          '&diams;8', '&clubs;8', '&spades;9', '&hearts;9', '&diams;9', '&clubs;9', '&spades;10', '&hearts;10', '&diams;10', '&clubs;10', '&spades;J', '&hearts;J', '&diams;J', '&clubs;J',
          '&spades;Q', '&hearts;Q', '&diams;Q', '&clubs;Q', '&spades;K', '&hearts;K', '&diams;K', '&clubs;K', '&spades;A', '&hearts;A', '&diams;A', '&clubs;A'];
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
      result = (game) => {
          switch(game) {
              case 'Dice':
                  return (Math.floor(this.bytes_to_number(this.bytes(8)) * this.state.MAX_ROLL) / 100).toFixed(2);
              case 'Roulette':
                  return Math.floor(this.bytes_to_number(this.bytes(8)) * this.state.MAX_ROULETTE);
              case 'Chartbet':
                  return (this.state.MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(8)) * this.state.MAX_CHARTBET) + 1) * 0.98);
              case 'Mines':
                  return this.nums_to_mine_array(this.bytes_to_num_array(this.bytes(196)));
              case 'Keno':
                  return this.nums_to_tile_array(this.bytes_to_num_array(this.bytes(80)));
              default:
                  return 'Unknown game';
          }
      }

      handleRoullete = () =>{
        const { active_game, MAX_ROULETTE } = this.state;
        let res = this.result(active_game);
        let resolve = Math.floor(this.bytes_to_number(this.bytes(8)) * MAX_ROULETTE);
        console.log("result", res, "resolve", resolve);
      }

      handleChartbet = () =>{
        const { active_game, MAX_CHARTBET } = this.state;
        let res = this.result(active_game);
        let resolve = MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(8)) * MAX_CHARTBET) + 1) * 0.98;
        console.log("result", res, "resolve", resolve);
      }


  render() {

    const { MAX_ROULETTE, active_game } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <button className="btn-primary" onClick={()=>this.handleRoullete()}>--Roullete--</button>
          <button className="btn-primary" onClick={()=>this.handleChartbet()}>--Chartbet--</button>

        </header>
        <p className="App-intro">
        </p>
      </div>
    );
  }
}

export default App;
