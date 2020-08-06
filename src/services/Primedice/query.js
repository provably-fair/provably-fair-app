
  /* Method to get all bet data of user bets for Stake Operator */

  getAllData = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake ? 'https://api.stake.com/graphql' : primeDice ? 'https://api.primedice.com/graphql' : '', {
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

    const client = new GraphQLClient(stake ? 'https://api.stake.com/graphql' : primeDice ? 'https://api.primedice.com/graphql' : '', {
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
      this.setState({ betDataEnriched: betDataEnriched });
      console.log('bet data enriched', betDataEnriched);

      bet.user.houseBetList.map((houseBet) => {
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
          console.log('betData --', betData);
          if (betData.bet.bet.clientSeed !== 'undefined') {
            betDataById.push(betData);
            this.setState({ betDataById: betDataById });
          }
        })
        // console.log('betDataById', betDataById);
      })
    })
  }

  /* Method to get all types of User Seeds for Stake Operator */

  getAllUserSeedsStake = () => {

    const { stake, primeDice } = this.state;

    /* GraphQl Client object with x-access-token for Stake Operator */

    const client = new GraphQLClient(stake ? 'https://api.stake.com/graphql' : primeDice ? 'https://api.primedice.com/graphql' : '', {
      headers: {
        "x-access-token": this.state.apiKeyStake,
      },
    })
    // should take user id as parameter
    let { userSeedsData, previousServerSeedStake, previousClientSeedStake, activeClientSeedStake, usernameStake } = this.state;

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
      if (userSeeds.user.previousClientSeed != null) {
        this.setState({ previousClientSeedStake: userSeeds.user.previousClientSeed.seed });
      }
      if (userSeeds.user.previousServerSeed != null) {
        this.setState({ previousServerSeedStake: userSeeds.user.previousServerSeed.seed });
      }
      this.setState({ activeClientSeedStake: userSeeds.user.activeClientSeed.seed });
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

    const client = new GraphQLClient(stake ? 'https://api.stake.com/graphql' : primeDice ? 'https://api.primedice.com/graphql' : '', {
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

    const client = new GraphQLClient(stake ? 'https://api.stake.com/graphql' : primeDice ? 'https://api.primedice.com/graphql' : '', {
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
      console.log("serverSeedHash", data.rotateServerSeed.seedHash)
      this.setState({ serverSeedHash: data.rotateServerSeed.seedHash })
    })
  }
