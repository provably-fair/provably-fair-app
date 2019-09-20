/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer }from 'react-frame-component';
import { GraphQLClient } from 'graphql-request'
import { CookiesProvider } from 'react-cookie';
import Cookies from 'js-cookie';
import axios from 'axios';
import createHmac from 'create-hmac';
import uuidv4 from 'uuid/v4';
import converter from 'hex2dec';
import cryptoGamesIcon from './assets/img/cryptogames.png';
import "./content.css";
import './assets/css/argon.css';
import './assets/vendor/font-awesome/css/font-awesome.min.css';
import qs from 'querystring';




/* GraphQL query to get public chats of Stake Operator */

const query1 = `query {
  publicChats {
    id
    name
  }
}`


function sleeper(ms) {
  return function(x) {
    console.log('Sleep ',ms,'milisecs');
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}



/* GraphQl Client query to get new ServerSeed for Stake Operator */

const query5 = `mutation ChangeClientSeedMutation($seed: String!) {
  changeClientSeed(seed: $seed) {
    id
    seed
    __typename
  }
}`



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
        nonce:0,
        betData:[],
        cryptoGames:false,
        primeDice:false,
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
        betAmount:0.0000001,
        betPayout:2.0,
        betPlaced:false,
        stake:true,
        numberBetsVerFailed:0,
        isNonceManipulated:false,
        viewRecentBetsStake:false
      }
    }


    componentDidMount(){
      /* Type something here, it'll be executed after the App Component is loaded */
      // this.processBetsStake();
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

        // let promise3 = new Promise((resolve, reject) => {
        //   setTimeout(() => {
        //     this.getAllBetsStake();
        //   }, 7000);
        // });

        // let promise4 = new Promise((resolve, reject) => {
        //   setTimeout(() => {
        //     this.processBetsStake();
        //   }, 4000);
        // });

        console.log(promise1,promise2);


      }

/*****************************************************************************************************************************************************************/


    /* Method to get all bet data of user bets for Stake Operator */

    getAllData = () => {

      /* GraphQl Client object with x-access-token for Stake Operator */

      const client = new GraphQLClient('https://api.stake.com/graphql', {
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

      /* GraphQl Client object with x-access-token for Stake Operator */

      const client = new GraphQLClient('https://api.stake.com/graphql', {
        headers: {
          "x-access-token": this.state.apiKeyStake,
        },
      })
      //should take user name as parameter
      let { betDataById, betDataEnriched, usernameStake } = this.state;
      betDataById=[];
      betDataEnriched = [];

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

      /* GraphQl Client object with x-access-token for Stake Operator */

      const client = new GraphQLClient('https://api.stake.com/graphql', {
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

      /* GraphQl Client object with x-access-token for Stake Operator */

      const client = new GraphQLClient('https://api.stake.com/graphql', {
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

      /* GraphQl Client object with x-access-token for Stake Operator */

      const client = new GraphQLClient('https://api.stake.com/graphql', {
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
     // this.processBetsStake();
    }

    processBetsStake =  () => {
      let{betDataById, betDataEnriched, betData, previousClientSeedStake, activeClientSeedStake, previousServerSeedStake} = this.state;
      betData = [];



       console.log("betDataById", betDataById);
       console.log("previousClientSeedStake", previousClientSeedStake, "previousServerSeedStake", previousServerSeedStake ,"activeClientSeedStake", activeClientSeedStake);


      betDataById.map( (item) => {
       console.log("item.bet.bet.clientSeed.seed", item.bet.bet.clientSeed.seed, "item.bet.bet.serverSeed.seed", item.bet.bet.serverSeed.seed);
        if( ((item.bet.bet.clientSeed.seed == activeClientSeedStake) && (item.bet.bet.serverSeed.seed == previousServerSeedStake)) || ((item.bet.bet.clientSeed.seed == previousClientSeedStake) && (item.bet.bet.serverSeed.seed == previousServerSeedStake)) )
        {
           console.log("verification eligible");
           var element = {};
           console.log('new bet has come',item.bet.iid);
           betDataEnriched.map( (innerItem) => {
             console.log("Inner Item :", innerItem);

              if(innerItem.iid == item.bet.iid)
              {
                let isVerified;
                var game = innerItem.bet.game;
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

                      default : isVerified = 0;
                     }


                element.id = item.bet.iid; element.game = innerItem.bet.game; element.payout = innerItem.bet.payout;
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
    console.log('=============>>>>>>>>>>>>>>>>>>>>>>>>>key',key);
    console.log('=============>>>>>>>>>>>>>>>>>>>>>>>>>text',text);
    console.log('=============>>>>>>>>>>>>>>>>>>>>>>>>>hash',hash);
    let index = 0;
    let lucky = parseInt(hash.substring(index * 5, index * 5 + 5),16);
    console.log('======================>>>>>>>>>>>>>>>>>>lucky',lucky);

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
    if(lucky==result) {
      return true;
    }
    else{
      //numberBetsVerFailed++;
      //this.state({numberBetsVerFailed:numberBetsVerFailed});
      //return false;
    }
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

    BetIdArray.map(async (i)=>{
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
      const { gettingStarted, settings, verification, operators, clientSeed, serverSeedHash, nonce, betData, cryptoGames,primeDice, diceResult, diceVerify, verify, apiKey, apiKeyStake, usernameStake, enterAPI, enterAPIStake,
      Balance, BetId, Roll, nonceChecked, toggleState, betAmount, betPayout, betPlaced, stake, isNonceManipulated, numberBetsVerFailed, betDataById, betDataEnriched, viewRecentBetsStake, faqs } = this.state;
        return (
          <CookiesProvider>
            <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}>
               <FrameContextConsumer>
               {
               // Callback is invoked with iframe's window and document instances
                   ({document, window}) => {
                      // Render Children
                        return (
                           <div className={'my-extension text-center'}>

                            <div className="nav-wrapper">
                             <ul className="nav nav-pills nav-fill flex-md-row" id="tabs-icons-text" role="tablist">
                                 <li className="nav-item"
                                 onClick={()=>{
                                   this.setState({gettingStarted:false, settings:true, verification:false,  operators:false, faqs:false});
                                 }}>
                                     <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-1-tab" data-toggle="tab" href="#tabs-icons-text-1" role="tab" aria-controls="tabs-icons-text-1" aria-selected="true"><i className="fa fa-cloud-upload-96 mr-2"></i>Settings</a>
                                 </li>
                                 <li className="nav-item" onClick={()=>{
                                   this.getAllBetsStake();
                                   this.setState({gettingStarted:false, settings:false, verification:true,  operators:false, faqs:false});
                                 }}>
                                     <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false"><i className="fa fa-bell-55 mr-2"></i>Verification</a>
                                 </li>
                                 <li className="nav-item" onClick={()=>{
                                   this.setState({gettingStarted:false, settings:false, verification:false,  operators:true, faqs:false});
                                 }}>
                                     <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Operators</a>
                                 </li>
                                 <li className="nav-item" onClick={()=>{
                                   this.setState({gettingStarted:false, settings:false, verification:false,  operators:false, faqs:true});
                                 }}>
                                     <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>FAQs & Glossary</a>
                                 </li>
                              </ul>
                            </div>
                           <div style={{display:gettingStarted?'block':'none'}}>

                            <h4 className="text-center"><strong>CGF</strong></h4>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
                                <g fill="#61DAFB">
                                    <path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/>
                                    <circle cx="420.9" cy="296.5" r="45.7"/>
                                    <path d="M520.5 78.1z"/>
                                </g>
                            </svg>
                            <p><span style={{fontStyle:'bold'}}>Operator</span> is a CGF verified operator.</p>
                            <button className="btn btn-info mb-3" type="button" onClick={()=>{
                              // this.getSessionTokenBitvest()
                              this.setState({gettingStarted:!gettingStarted, enterAPIStake:true})
                            }}>
                            Get Started Now
                            </button>
                            <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                              <li className="nav-item">
                                <a className="nav-link rounded-circle" id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link active" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                            </ul>
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
                            <input className="form-control form-control-sm" type="text" value={apiKeyStake} placeholder="Token" onChange={(e)=>{this.setState({apiKeyStake:e.target.value})}}/>
                            <label className="form-control-label">Enter Your Username</label>
                            <input className="form-control form-control-sm" type="text" value={usernameStake} placeholder="Username" onChange={(e)=>{this.setState({usernameStake:e.target.value})}}/>
                            <button type="button" className="btn btn-secondary m-2" onClick={()=>{
                              this.handleRequest();
                              this.setState({gettingStarted:false, settings:true, enterAPIStake:false});
                            }}> Submit</button>
                          </div>


                          <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                            <li className="nav-item">
                              <a className="nav-link rounded-circle active" id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                          </ul>
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


                          <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                            <li className="nav-item">
                              <a className="nav-link rounded-circle active" id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                          </ul>
                          </div>


                          <div className="SettingsUI Bitvest Stake" style={{display:settings?'block':'none'}}>
                          <div className="form-group">
                            <label className="form-control-label" data-toggle="popover" data-placement="left" title="This is the server seed that has been created by the casino. It is sent to you in advance of any bets being made to ensure the casino did not change or manipulate the outcome of any game results. It is hashed(encrypted) to prevent players from calculating the upcoming game results. Once you request a new server seed, the one that is currently in use will be unhashed(decrypted) and sent to the verification tab. All bets made using that server seed will be automatically verified. You will be notified if any bets did not pass verification.">Next Server Seed Hash </label>
                            <input className="form-control form-control-sm" type="text" value={serverSeedHash} placeholder="" onChange={(e)=>{this.setState({serverSeedHash:e.target.value })}}/>
                            <button type="button" className="btn btn-secondary m-2"   onClick={this.handleRequest}> Request</button>
                          </div>

                          <div className="form-group">
                            <label className="form-control-label" data-toggle="popover" data-color="default" data-placement="top" title="This is the client seed. Sometimes called the player seed. It is very important that you customize this after you request a new server seed. The server seed and client seed pre-filled by default. To ensure provable fairness, you must customize your own client seed. It will be used in combination with the server seed to generate thr game results.">Client Seed</label>
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
                              <label className="custom-control-label" for="customCheck2">Add Nonce.</label>
                            </div>
                            <div className="form-group" style={{display:nonceChecked?'block':'none'}}>
                              <label className="form-control-label">Nonce</label>
                              <input classNam e="form-control form-control-sm" type="number" placeholder="" value={nonce}  onChange={(e)=>{this.setState({nonce:e.target.value})}}/>
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

                          <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                            <li className="nav-item">
                              <a className="nav-link rounded-circle active" id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                          </ul>
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
                                    <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Operators</a>
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
                              <label className="custom-control-label" for="customCheck2">Add Nonce.</label>
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

                          <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                            <li className="nav-item">
                              <a className="nav-link rounded-circle active" id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                <span className="nav-link-icon d-block"></span>
                              </a>
                            </li>
                          </ul>
                          </div>

                          <div className="VerificationUI-Stake" className="table-responsive" style={{display: verification?'block':'none', fontSize: '11px'}}>

                          <button type="button"  className="btn btn-primary">
                            <span>Nounce Manipulated</span>
                            <span  className={"badge badge-md badge-circle badge-floating badge-danger border-white"}>{isNonceManipulated?"Yes":"No"}</span>
                          </button>
                          <button type="button"  className="btn btn-primary">
                            <span>Bets Failed</span>
                            <span  className="badge badge-md badge-circle badge-floating badge-danger border-white">{numberBetsVerFailed}</span>
                          </button>
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
                                  return <tr>
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
                                  <th>Payout</th>
                                  <th>Nonce</th>
                                  <th>Result</th>
                                </tr>
                              </thead>

                              <tbody>
                                {betData.map((item,i)=>{
                                  return <tr>
                                  <td>
                                  {item.element.id}
                                  </td>
                                  <td>
                                  {item.element.game}
                                  </td>
                                  <td>
                                  {item.element.payout}
                                  </td>
                                  <td>
                                  {item.element.nonce}
                                  </td>
                                  <td>
                                  {item.element.isVerified}
                                  </td>
                                  </tr>
                                })}
                              </tbody>
                            </table>
                          </div>
                            <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                              <li className="nav-item">
                                <a className="nav-link rounded-circle " id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link active" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                            </ul>
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
                                    <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-2-tab" data-toggle="tab" href="#tabs-icons-text-2" role="tab" aria-controls="tabs-icons-text-2" aria-selected="false"><i className="fa fa-bell-55 mr-2"></i>Verification</a>
                                </li>
                                <li className="nav-item" onClick={()=>{
                                  this.setState({gettingStarted:false, settings:false, verification:false,  operators:true});
                                }}>
                                    <a className="nav-link mb-sm-3 mb-md-0" id="tabs-icons-text-3-tab" data-toggle="tab" href="#tabs-icons-text-3" role="tab" aria-controls="tabs-icons-text-3" aria-selected="false"><i className="fa fa-calendar-grid-58 mr-2"></i>Operators</a>
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




                            <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                              <li className="nav-item">
                                <a className="nav-link rounded-circle " id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link active" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                            </ul>
                          </div>


                          <div className="Operators-UI table-responsive" style={{display:!verification&&operators?'block':'none'}}>

                            <div className="operators-icons">
                              <div className="m-3" onClick={()=>{
                                this.setState({operators:false, primeDice:false, verification:true,  cryptoGames:true})
                              }}>
                                <img src={cryptoGamesIcon}  style={{width:"144.95", cursor:'pointer'}} title="Crypto Games"/>
                              </div>
                            <div className="m-3" style={{cursor:'pointer'}} onClick={()=>{
                              this.setState({operators:false, primeDice:true, verification:true,  cryptoGames:false})
                            }}>
                              <svg width="144.95" height="50" viewBox="0 0 1896 327"><title>Prime Dice</title><path d="M1750 263a74 74 0 0 1-23 17q-13 6-31 6t-31-6a63 63 0 0 1-23-14 66 66 0 0 1-15-24 86 86 0 0 1-5-29 74 74 0 0 1 6-29 72 72 0 0 1 15-23 71 71 0 0 1 23-16 80 80 0 0 1 61 0 71 71 0 0 1 23 17l-22 22a43 43 0 0 0-14-11 41 41 0 0 0-18-4 38 38 0 0 0-17 4 37 37 0 0 0-12 10 39 39 0 0 0-7 13 56 56 0 0 0-3 16 53 53 0 0 0 3 16 42 42 0 0 0 7 14 36 36 0 0 0 29 14 44 44 0 0 0 19-4 42 42 0 0 0 14-11l21 22zm-489-103a69 69 0 0 0-14 23 76 76 0 0 0-5 28 87 87 0 0 0 5 30 66 66 0 0 0 37 39 77 77 0 0 0 30 6q16 0 28-4a88 88 0 0 0 19-7 57 57 0 0 0 11-9l-19-21a41 41 0 0 1-8 5 73 73 0 0 1-13 5 71 71 0 0 1-18 1 42 42 0 0 1-13-2 39 39 0 0 1-12-7 35 35 0 0 1-9-10 28 28 0 0 1-4-14h103v-5a118 118 0 0 0-4-29 74 74 0 0 0-11-25 59 59 0 0 0-21-18q-13-7-32-7c-19 0-37 7-50 21zm80 28a29 29 0 0 1 2 10h-67a26 26 0 0 1 2-10 30 30 0 0 1 7-10 35 35 0 0 1 11-7 39 39 0 0 1 15-3 34 34 0 0 1 14 3 31 31 0 0 1 10 7 30 30 0 0 1 6 10zm459-43a67 67 0 0 0-22 15 69 69 0 0 0-14 23 76 76 0 0 0-6 28 87 87 0 0 0 6 30 66 66 0 0 0 37 39 77 77 0 0 0 30 6q16 0 28-4a88 88 0 0 0 19-7 57 57 0 0 0 11-9l-19-21a42 42 0 0 1-9 5 73 73 0 0 1-12 5 71 71 0 0 1-18 1 42 42 0 0 1-13-2 40 40 0 0 1-13-7 35 35 0 0 1-8-10 28 28 0 0 1-4-14h103v-5a118 118 0 0 0-4-29 74 74 0 0 0-11-25 59 59 0 0 0-21-18q-13-7-32-7a70 70 0 0 0-28 6zm58 43a29 29 0 0 1 2 10h-67a26 26 0 0 1 2-10 30 30 0 0 1 7-10 36 36 0 0 1 11-7 38 38 0 0 1 15-3 34 34 0 0 1 14 3 31 31 0 0 1 10 7 30 30 0 0 1 6 10zm-446-22a73 73 0 0 0-12 21q-5 12-5 28 0 17 6 30a70 70 0 0 0 13 23 57 57 0 0 0 20 13 55 55 0 0 0 22 5 53 53 0 0 0 14-2 60 60 0 0 0 11-4 47 47 0 0 0 9-6 69 69 0 0 0 7-6v13h34V86h-34v61l-7-2a39 39 0 0 0-7-2c-25-6-54 3-71 23zm73 7a28 28 0 0 1 12 5v42a45 45 0 0 1-2 13 36 36 0 0 1-6 11 29 29 0 0 1-10 9 31 31 0 0 1-15 3q-16 0-25-12t-9-29a52 52 0 0 1 3-16 46 46 0 0 1 6-14c12-14 28-17 46-12zM669 86v196h36v-73h29c16 0 32-5 44-14a56 56 0 0 0 15-20c8-14 8-32 3-47a53 53 0 0 0-10-20 70 70 0 0 0-54-22zm36 92v-60h26q13 0 22 8c12 11 12 32 1 44q-9 8-23 8zm121-34h33l1 17a67 67 0 0 1 6-6 51 51 0 0 1 42-13v33a31 31 0 0 0-4-1 55 55 0 0 0-9 0 39 39 0 0 0-13 2 32 32 0 0 0-11 7 33 33 0 0 0-10 24v74h-35V144zm109-58h37v36h-37V86zm1 58h34v137h-34V144zm66 0h33l1 16c12-13 22-19 40-19q27 0 41 20 11-11 22-15t25-5q26 0 40 15t14 42v83h-34v-83q0-13-7-20t-18-7a30 30 0 0 0-23 10 34 34 0 0 0-6 12 45 45 0 0 0-3 14v74h-34v-83q0-13-7-20c-11-12-31-8-41 3a35 35 0 0 0-6 12 45 45 0 0 0-2 14v74h-35V144zm559-58h37v36h-37V86zm2 58h34v137h-34z"></path><rect width="417" height="41" x="53" y="285" rx="8" ry="8"></rect><path d="M62 259l128-1a9 9 0 0 0 6-2 12 12 0 0 0 3-4 13 13 0 0 0 1-5 10 10 0 0 0-3-7L17 68a10 10 0 0 0-7-3 10 10 0 0 0-7 2 9 9 0 0 0-3 4 13 13 0 0 0 0 6l51 174c1 6 5 8 11 8zm399 0l-128-1a9 9 0 0 1-6-2 12 12 0 0 1-3-4 13 13 0 0 1-1-5 10 10 0 0 1 3-7L506 68a10 10 0 0 1 7-3 10 10 0 0 1 7 2 9 9 0 0 1 3 4 14 14 0 0 1 0 6l-51 174c-1 6-5 8-11 8zm-75-141L272 4a15 15 0 0 0-22 0L136 118a15 15 0 0 0 0 22l114 114c6 6 17 6 23 0l113-114a15 15 0 0 0 0-22zm-193 30a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm68 68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm0-68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm0-68a19 19 0 1 1 19-19 19 19 0 0 1-19 19zm68 68a19 19 0 1 1 19-19 19 19 0 0 1-19 19z"></path></svg>
                            </div>
                            </div>


                            <ul className="nav nav-pills nav-pills-circle ml-5 pl-3" id="tabs_2" role="tablist">
                              <li className="nav-item">
                                <a className="nav-link rounded-circle " id="home-tab" data-toggle="tab" href="#tabs_2_1" role="tab" aria-controls="home" aria-selected="true">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link active" id="profile-tab" data-toggle="tab" href="#tabs_2_2" role="tab" aria-controls="profile" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link" id="contact-tab" data-toggle="tab" href="#tabs_2_3" role="tab" aria-controls="contact" aria-selected="false">
                                  <span className="nav-link-icon d-block"></span>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        )
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
