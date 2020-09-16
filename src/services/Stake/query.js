import { GraphQLClient } from 'graphql-request';

/* Method to get all bet data of user bets for Stake Operator */

export const getAllData = (apiKeyStake) => {

  /* GraphQl Client object with x-access-token for Stake Operator */

  const client = new GraphQLClient('https://api.stake.com/graphql', {
    headers: {
      "x-access-token": apiKeyStake,
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
