  /* Method for getting Session Token for the Bitvest Operator */

  getSessionTokenBitvest = async () => {
    const bitvest = await axios.post('https://bitvest.io/create.php');
    console.log('Token Behanchod!', bitvest.data.data.session_token);
    this.setState({ session_token: bitvest.data.data.session_token });
  }

  /* Method for getting Server Seed Hash for the Bitvest Operator */

  getNewServerseedHashBitvest = async () => {
    let { previousSeed, serverSeedHash, session_token } = this.state;
    console.log('session_token', session_token);
    const bitvest = await axios.post('https://bitvest.io/action.php',
      qs.stringify({
        "token": session_token,
        "secret": 0,
        "act": "new_server_seed"
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    this.setState({ serverSeedHash: bitvest.data.server_hash, previousSeed: bitvest.data.server_seed })
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

    bitvest.data.game.data.map(async (item) => {
      //    axios.get(`https://bitvest.io/results?query=${item.id}&game=dice&json=1`).then(sleeper(1000)).then((bet)=>{
      //     console.log("bet value is : ", bet);

      // console.log('previousSeed:',previousSeed);
      //   let hashingUnhashed = crypto.createHash('sha256').update(previousSeed).digest('hex');
      //   console.log('hashing the unhashed',hashingUnhashed);
      if (previousSeed === item.server_seed) {
        console.log("verification eligible");
        //       console.log("betDetails",bet.data);
        //let bet = await axios.get(`https://bitvest.io/results?query=${item.id}&game=dice&json=1`).then(sleeper(1000));
        //console.log('bet details:',bet);
        let serverSeed = item.server_seed;
        console.log('server seed:', serverSeed);
        let isVerified = this.handleVerifyBetBitvest(serverSeed, item.user_seed, item.user_seed_nonce, item.roll);
        if (!isVerified) numberBetsVerFailed++;
        var element = {};
        element.id = item.id; element.game = item.game; element.roll = item.roll; element.side = item.side; element.target = item.target;
        element.nonce = item.user_seed_nonce; element.isVerified = isVerified, element.timestamp = item.timestamp;
        console.log('element : ', element);
        betData.push({ element: element });
        console.log('betData', betData);
        betData = betData.sort(function (a, b) {
          return (a.element.timestamp - b.element.timestamp);
        });
        console.log('sorted betData', betData);
        this.setState({ betData: betData });

        let testNonce = 0;
        betData.map((item) => {
          if (item.element.nonce === testNonce) {
            console.log('current nonce', item.element.nonce);
            console.log('test nonce', testNonce);
            testNonce++;
            isNonceManipulated = false;
          }
          else {
            isNonceManipulated = true;
          }
        })

        this.setState({ numberBetsVerFailed: numberBetsVerFailed });
        this.setState({ isNonceManipulated: isNonceManipulated });
      }
      //    })
      console.log('unverified bets', numberBetsVerFailed);
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
    isNonceManipulated = (highestNonce === (newBets-1)) ? false : true;
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
    const roll = function (key, text) {
      // create HMAC using server seed as key and client seed as message
      const hash = crypto.createHmac('sha512', text).update(key).digest('hex');
      console.log('=============key', key);
      console.log('=======>text', text);
      console.log('=========hash', hash);
      let index = 0;
      let lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
      console.log('===================lucky', lucky);

      // keep grabbing characters from the hash while greater than
      while (lucky >= Math.pow(10, 6)) {
        index++; lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);
        // if we reach the end of the hash, just default to highest number
        if (index * 5 + 5 > 128) {
          lucky = 999999;
          break;
        }
      }
      lucky /= Math.pow(10, 4);
      if (lucky === result) {
        return true;
      }
      else {
        //numberBetsVerFailed++;
        //this.state({numberBetsVerFailed:numberBetsVerFailed});
        //return false;
      }
    };
    let diceVerify = roll(serverSeed, `${clientSeed}|${nonce}`);
    this.setState({ diceVerify: diceVerify });
    console.log('diceVerify', diceVerify);

    return diceVerify;
  }