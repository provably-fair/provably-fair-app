

/** Generic Methods **/

/* Method for generating Randomised Client Seed */

getClientSeed = () => {
  let key = uuidv4();
  let hash = createHmac('sha256', key)
    .update('provably')
    .digest('hex');
  hash = hash.substring(0, 32);
  this.setState({ clientSeed: hash, nonce: 0 });
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

  console.log(promise1, promise2);
}



handleRoullete = (server_seed, client_seed, nonce) => {
  let { MAX_ROULETTE } = this.state;
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
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });
  let nums = [];

  this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 160)).map((value, index) => {
    let direction = Math.floor(value * 2) ? 'right' : 'left';
    return nums.push(direction);
  })
  console.log("Plinko -- ", nums);
  return nums;
}

handleBaccarat = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 48)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Baccarat : ", nums);
  return nums;
}

handleHilo = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Hilo : ", nums);
  return nums;
}

handleBlackjack = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Blackjack : ", nums);
  return nums;

}

handleMines = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let res = this.result('Mines', server_seed, client_seed, nonce).slice(0, this.state.numMines);
  console.log("Mines : ", res);
  return res;
}

handleKeno = (server_seed, client_seed, nonce) => {
  let keno = this.result('Keno', server_seed, client_seed, nonce);
  this.setState({ keno: keno });
  return keno;
}

handleDiamondPoker = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  // Index of 0 to 6 : green to blue
  const GEMS = ['green', 'purple', 'yellow', 'red', 'cyan', 'orange', 'blue'];


  let nums = [];
  nums.push(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 80)).map((x) => {
    return GEMS[Math.floor(x * 7)];
  }));
  console.log("Diamond Poker : ", nums);
  return nums;

}



handleVideoPoker = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 416)).entries()) {
    nums.push(value);
  }
  console.log("result nums:", nums);
  nums = this.nums_to_pokercards_array(nums);
  console.log("nums : ", nums);
  return nums;
}

handleWheel = (server_seed, client_seed, nonce, segments, risk) => {
  let resolve = Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * segments);
  //let res = this.result(resolve);
  //console.log("result", res, "resolve", resolve);
  const PAYOUTS = {
    '10': {
      low: [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 0],
      medium: [0, 1.9, 0, 1.5, 0, 2, 0, 1.5, 0, 3],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 9.9]
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



/* Method for Provably Fair Verification of bets for the Stake Operator */

handleVerifyBetStake = (serverSeedHash, clientSeed, nonce) => {
  // bet made with seed pair (excluding current bet)
  // crypto lib for hmac function
  const crypto = require('crypto');

  const roll = function (key, text) {
    // create HMAC using server seed as key and client seed as message
    const hash = crypto.createHmac('sha256', key).update(text).digest('hex');
    console.log('result hash', hash);


    let index = 0;
    let lucky = '';
    let compute = 0;
    while (index < 4) {
      lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
      lucky = lucky / (Math.pow(256, index + 1));
      compute = compute + lucky;
      index++;
    }

    compute = compute * 10001 / 100;
    compute = compute.toString();
    compute = compute.split('.');
    compute[1] = compute[1].slice(0, 2);
    compute = compute[0] + '.' + compute[1];
    console.log("LUCKY : ", compute);
    return compute;
  };



  let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
  this.setState({ diceVerify: diceVerify });
  console.log(diceVerify);
  return diceVerify;
}

/*****************************************************************************************************************************************************************************************************/

handleVerifyBetForRoulette = (serverSeedHash, clientSeed, nonce) => {
  // bet made with seed pair (excluding current bet)
  // crypto lib for hmac function
  const crypto = require('crypto');
  const roll = function (key, text) {
    // create HMAC using server seed as key and client seed as message
    const hash = crypto.createHmac('sha256', key).update(text).digest('hex');
    console.log('result hash', hash);


    let index = 0;
    let lucky = '';
    let compute = 0;
    while (index < 4) {
      lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
      lucky = lucky / (Math.pow(256, index + 1));
      compute = compute + lucky;
      index++;
    }

    compute = compute * 37;
    compute = compute.toString();
    compute = compute.split('.');
    //compute[1] = compute[1].slice(0,2);
    compute = compute[0];
    console.log("LUCKY : ", compute);
    return compute;
  };



  let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
  this.setState({ diceVerify: diceVerify });
  console.log(diceVerify);
  return diceVerify;
}

/*****************************************************************************************************************************************************************************************************/

handleVerifyBetForLimbo = (serverSeedHash, clientSeed, nonce) => {
  // bet made with seed pair (excluding current bet)
  // crypto lib for hmac function
  const crypto = require('crypto');
  const roll = function (key, text) {
    // create HMAC using server seed as key and client seed as message
    const hash = crypto.createHmac('sha256', key).update(text).digest('hex');
    console.log('result hash', hash);


    let index = 0;
    let lucky = '';
    let compute = 0;
    while (index < 4) {
      lucky = parseInt(hash.substring(index * 2, index * 2 + 2), 16);
      lucky = lucky / (Math.pow(256, index + 1));
      compute = compute + lucky;
      index++;
    }

    compute = compute * 100000000;
    compute = (100000000 / compute) * 0.99;
    compute = compute.toString();
    compute = compute.split('.');
    compute[1] = compute[1].slice(0, 2);
    compute = compute[0] + '.' + compute[1];
    console.log("LUCKY : ", compute);
    return compute;
  };



  let diceVerify = roll(serverSeedHash, `${clientSeed}:${nonce}:0`);
  this.setState({ diceVerify: diceVerify });
  console.log(diceVerify);
  return diceVerify;
}


processBetsStake = () => {
  let { betDataById, betDataEnriched, betData, previousClientSeedStake, activeClientSeedStake, previousServerSeedStake } = this.state;
  betData = [];

  let _ = require('lodash')

  console.log("betDataById", betDataById);
  console.log("previousClientSeedStake", previousClientSeedStake, "previousServerSeedStake", previousServerSeedStake, "activeClientSeedStake", activeClientSeedStake);
  try {
    betDataById.map((item) => {
      if (((item.bet.bet.clientSeed.seed === activeClientSeedStake) && (item.bet.bet.serverSeed.seed === previousServerSeedStake)) || ((item.bet.bet.clientSeed.seed === previousClientSeedStake) && (item.bet.bet.serverSeed.seed === previousServerSeedStake))) {
        console.log("verification eligible");
        var element = {};
        console.log('new bet has come', item.bet.iid);
        betDataEnriched.map((innerItem) => {
          // console.log("Inner Item :", innerItem);

          if (innerItem.iid === item.bet.iid) {
            let isVerified;
            const game = innerItem.bet.game;
            switch (game) {
              case 'dice': {
                isVerified = this.handleVerifyBetStake(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'limbo': {
                isVerified = this.handleVerifyBetForLimbo(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'roulette': {
                isVerified = this.handleVerifyBetForRoulette(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'plinko': {
                isVerified = this.handlePlinko(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'baccarat': {
                isVerified = this.handleBaccarat(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'videoPoker': {
                isVerified = this.handleVideoPoker(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'hilo': {
                isVerified = this.handleHilo(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'blackjack': {
                isVerified = this.handleBlackjack(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'mines': {
                isVerified = this.handleMines(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'keno': {
                isVerified = this.handleKeno(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'diamondPoker': {
                isVerified = this.handleDiamondPoker(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              case 'wheel': {
                isVerified = this.handleWheel(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce, '10', 'medium');
                console.log("isVerified", isVerified);
              }
                break;

              case 'primedice': {
                isVerified = this.handleVerifyBetPrimeDice(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);
                console.log("isVerified", isVerified);
              }
                break;

              default: isVerified = 0;
            }

            // console.log("item.bet.iid.split('house:')" , item.bet.iid.split('house:'));
            element.id = item.bet.iid.split('house:'); element.game = innerItem.bet.game; element.payout = innerItem.bet.payout;
            element.nonce = item.bet.bet.nonce; element.isVerified = isVerified;
            console.log('element : ', element);
            betData.push({ element: element });
            this.setState({ betData: betData });
          }
        })
        this.setState({ viewRecentBetsStake: true })
        betData.sort((a, b) => {
          return a.element.nonce - b.element.nonce;
        });
        console.log("betData : ", betData);
      }
    })
  } catch (e) {
    console.log("YO Crash")
  }
}
