  /* Method for getting selected coin data (say BTC) for Crypto Games Operator */

  getCoinData = async () => {
    const coin = await axios.get('https://api.crypto-games.net/v1/settings/btc');
    console.log(coin.data);

  }

  /* Method for getting selected coin stats (say BTC) for Crypto Games Operator */

  getCoinStats = async () => {
    const coin = await axios.get('https://api.crypto-games.net/v1/coinstats/btc');
    console.log(coin.data);
  }

  /* Method for getting Server Seed Hash for Crypto Games Operator */

  getServerSeed = async (apiKey) => {
    let { serverSeedHash } = this.state;
    window.localStorage.setItem('apiKey', apiKey);
    const seed = await axios.get(`https://api.crypto-games.net/v1/nextseed/btc/${apiKey}`);

    console.log(seed.data.NextServerSeedHash);
    this.setState({ serverSeedHash: seed.data.NextServerSeedHash })
  }

  /* Method for getting a User's Details for Crypto Games Operator */

  getUser = async (apiKey) => {
    const user = await axios.get(`https://api.crypto-games.net/v1/user/btc/${apiKey}`);
    this.setState({ user: user.data.Nickname });
  }

  /* Method for getting a Placing a Bet for Crypto Games Operator */

  placeBet = async (apiKey) => {
    let { clientSeed, nonce, BetIdArray, betAmount, betPayout } = this.state;
    let input = { Bet: betAmount, Payout: betPayout, UnderOver: true, ClientSeed: clientSeed, Nonce: nonce };
    let data = JSON.stringify(input);
    const bet = await axios.post(`https://api.crypto-games.net/v1/placebet/btc/${apiKey}`,
      data, { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(bet.data);
    let { Balance, BetId, Roll } = bet.data
    BetIdArray.push(BetId)
    this.setState({ BetIdArray: BetIdArray });
    //this.getBetData(BetIdArray);
    var newNonce = parseInt(nonce);
    this.setState({ BetId: BetId, Balance: Balance, Roll: Roll, nonce: newNonce + 1 });
    this.getServerSeed(apiKey);
  }

  /* Method for getting a Bet Data (say IDs) for Crypto Games Operator */

  getBetData = async (BetIdArray) => {
    let { betData, user } = this.state;

    BetIdArray.map(async (i) => {
      const bet = await axios.get(`https://api.crypto-games.net/v1/bet/${i}`);
      if (bet.data.User === user) {
        betData.push(bet.data)
        this.setState({ betData: betData });
      }
    })
    console.log('betData', betData);
  }

  /* Method for getting Complete Bet Data for Crypto Games Operator */

  getBetDataById = async (BetId) => {
    let { betData, user } = this.state;

    const bet = await axios.get(`https://api.crypto-games.net/v1/bet/${BetId}`);
    if (bet.data.User === user) {
      betData.push(bet.data)
      this.setState({ betData: betData });
    }
    console.log('betData', betData);
  }
