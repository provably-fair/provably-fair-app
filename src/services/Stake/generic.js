

export const handleRoullete = (server_seed, client_seed, nonce) => {
  let { MAX_ROULETTE } = this.state;
  let resolve = Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * MAX_ROULETTE);
  let res = this.result(resolve);
  console.log("result", res, "resolve", resolve);
  return res;
}

export const handleChartbet = (server_seed, client_seed, nonce) => {
  const { active_game, MAX_CHARTBET } = this.state;
  let res = this.result(active_game);
  let resolve = MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * MAX_CHARTBET) + 1) * 0.98;
  console.log("result", res, "resolve", resolve);
}

export const handlePlinko = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });
  let nums = [];

  this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 160)).map((value, index) => {
    let direction = Math.floor(value * 2) ? 'right' : 'left';
    return nums.push(direction);
  })
  console.log("Plinko -- ", nums);
  return nums;
}

export const handleBaccarat = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 48)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Baccarat : ", nums);
  return nums;
}

export const handleHilo = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Hilo : ", nums);
  return nums;
}

export const handleBlackjack = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let nums = [];
  for (const [value] of this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 448)).entries()) {
    nums.push(value);
  }
  nums = this.nums_to_card_array(nums);
  console.log("Blackjack : ", nums);
  return nums;

}

export const handleMines = (server_seed, client_seed, nonce) => {
  this.setState({ server_seed: server_seed, client_seed: client_seed, nonce: nonce });

  let res = this.result('Mines', server_seed, client_seed, nonce).slice(0, this.state.numMines);
  console.log("Mines : ", res);
  return res;
}

export const handleKeno = (server_seed, client_seed, nonce) => {
  let keno = this.result('Keno', server_seed, client_seed, nonce);
  this.setState({ keno: keno });
  return keno;
}

export const handleDiamondPoker = (server_seed, client_seed, nonce) => {
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



export const handleVideoPoker = (server_seed, client_seed, nonce) => {
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

export const handleWheel = (server_seed, client_seed, nonce, segments, risk) => {
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

export const handleVerifyBetStake = (serverSeedHash, clientSeed, nonce) => {
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

export const handleVerifyBetForRoulette = (serverSeedHash, clientSeed, nonce) => {
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

export const handleVerifyBetForLimbo = (serverSeedHash, clientSeed, nonce) => {
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


export const processBetsStake = () => {
  let { betDataById, betDataEnriched, betData, previousClientSeedStake, activeClientSeedStake, previousServerSeedStake } = this.state;
  betData = [];

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
              case 'dice':
                return isVerified = this.handleVerifyBetStake(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'limbo':
                return isVerified = this.handleVerifyBetForLimbo(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'roulette':
                return isVerified = this.handleVerifyBetForRoulette(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'plinko':
                return isVerified = this.handlePlinko(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'baccarat':
                return isVerified = this.handleBaccarat(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'videoPoker':
                return isVerified = this.handleVideoPoker(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'hilo':
                return isVerified = this.handleHilo(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'blackjack':
                return isVerified = this.handleBlackjack(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'mines':
                return isVerified = this.handleMines(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'keno':
                return isVerified = this.handleKeno(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'diamondPoker':
                return isVerified = this.handleDiamondPoker(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              case 'wheel':
                return isVerified = this.handleWheel(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce, '10', 'medium');

              case 'primedice':
                return isVerified = this.handleVerifyBetPrimeDice(item.bet.bet.serverSeed.seed, item.bet.bet.clientSeed.seed, item.bet.bet.nonce);

              default: return isVerified = 0;
            }

            // console.log("item.bet.iid.split('house:')" , item.bet.iid.split('house:'));
            element.id = item.bet.iid.split('house:'); element.game = innerItem.bet.game; element.payout = innerItem.bet.payout;
            element.nonce = item.bet.bet.nonce; element.isVerified = isVerified;
            console.log('element : ', element);
            betData.push({ element: element });
            this.setState({ betData: betData });
          }
          return betData;
        })
        this.setState({ viewRecentBetsStake: true })
        betData.sort((a, b) => {
          return a.element.nonce - b.element.nonce;
        });
        console.log("betData : ", betData);
      }
      return betData;
    })
  } catch (e) {
    console.log("YO Crash")
  }
}
