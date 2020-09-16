import React, { Component } from 'react';
import { GraphQLClient } from 'graphql-request';
import { connect } from 'react-redux';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterAPIStake: false,
      enterAPI: false,
      user: '',
      apiKey: '',
      apiKeyStake: '',
      usernameStake: '',
      serverSeedHash: '',
      clientSeed:''
    }
  }

  /* Method for getting a Server Seed Hash for the Stake Operator */

  getServerSeedStake = (apiKeyStake) => {

   /* GraphQl Client object with x-access-token for Stake Operator */

   const client = new GraphQLClient('https://api.stake.com/graphql', {
     headers: {
       "x-access-token": apiKeyStake,
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
     console.log('seedHash ',data.rotateServerSeed.seedHash);
     this.setState({serverSeedHash :  data.rotateServerSeed.seedHash })
   })
 }

 /* Method to get all types of User Seeds for Stake Operator */

 getAllUserSeedsStake = (apiKeyStake, usernameStake) => {

   /* GraphQl Client object with x-access-token for Stake Operator */

   const client = new GraphQLClient('https://api.stake.com/graphql', {
     headers: {
       "x-access-token": apiKeyStake,
     },
   })
   // should take user id as parameter userSeedsData,

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
     console.log('userSeeds ', userSeeds);
     this.setState({clientSeed:userSeeds.user.activeClientSeed.seed});
   })
 }

 handleRequest = (apiKeyStake, usernameStake) => {
   try {
          this.getServerSeedStake(apiKeyStake);
          this.getAllUserSeedsStake(apiKeyStake, usernameStake);
   } catch (e) {

   } finally {
       setTimeout(() => {
         let { serverSeedHash, clientSeed, apiKeyStake, usernameStake } = this.state;

         let data = {serverSeedHash:serverSeedHash, clientSeed: clientSeed, apiKeyStake: apiKeyStake, usernameStake : usernameStake}

         this.setState({ gettingStarted: false, settings: true, enterAPIStake: false });
         this.props.callback(data);
       }, 2000);
   }
 }

  componentDidMount() {
    this.setState({ enterAPI: this.props.enterAPI, enterAPIStake: this.props.enterAPIStake });
  }

  render() {
    const { enterAPI, enterAPIStake, apiKey, apiKeyStake, usernameStake, serverSeedHash } = this.state;
    return (
      <div>
        <div style={{ display: enterAPIStake ? 'block' : 'none' }}>
          <div className="form-group">
            <label className="form-control-label">Enter Your Bet Token</label>
            <img alt='' src="https://camo.githubusercontent.com/184f5fe3162ac51bdc0c89207d568c691d053aea/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f353331393931362f323437373339332f36303565656639362d623037302d313165332d383134612d3637613132383166303665312e706e67" style={{ width: '10%' }} data-toggle="popover" data-placement="left" title='Instructions for using extension on Stake and PrimeDice:
   1. Open website then click "settings" from the dropdown menu at the top of the screen.
   2. Click "Tokens"
   3. Click "Reveal" then copy the token.
   4. Enter the token and your username into the extension, then click submit.'/>
            <input className="form-control form-control-sm" type="text" value={apiKeyStake} placeholder="Token" onChange={(e) => { this.setState({ apiKeyStake: e.target.value }) }} />
            <label className="form-control-label">Enter Your Username</label>
            <input className="form-control form-control-sm" type="text" value={usernameStake} placeholder="Username" onChange={(e) => { this.setState({ usernameStake: e.target.value }) }} />
            <button type="button" className="btn btn-secondary m-2" onClick={() => {
               this.handleRequest(apiKeyStake, usernameStake);
            }}> Submit</button>
          </div>
        </div>

        <div style={{ display: enterAPI ? 'block' : 'none' }}>
          <div className="form-group">
            <label className="form-control-label">Enter Your API Key</label>
            <input className="form-control form-control-sm" type="text" value={apiKey} placeholder="API Key" onChange={(e) => { this.setState({ apiKey: e.target.value }) }} />
            <button type="button" className="btn btn-secondary m-2" onClick={() => {
              this.setState({ gettingStarted: false, settings: true, enterAPI: false })
              this.getUser(apiKey)
              this.getServerSeed(apiKey)
            }}> Submit</button>
          </div>
        </div>
      </div>
    )
  }
}
