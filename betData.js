getMyBetsBitvest = async () => {
      let { betData, previousSeed } = this.state;
      betData = [];
      const crypto = require('crypto');
     const bitvest = await axios.get('https://bitvest.io/update.php?dice=1&json=1&self-only=1');
     bitvest.data.game.data.map( async (item) => {
       const bet =  await axios.get(https://bitvest.io/results?query=${item.id}&game=dice&json=1);       
       console.log("betDetails", bet.data);
       console.log("serverseed", bet.data.server_seed);
        //if(bet.data!='undefined' && bet.data.server_seed!='undefined'){
          if(previousSeed===bet.data.server_seed){
          console.log("verification eligible");
          let isVerified = this.handleVerifyBetBitvest(bet.data.server_seed,bet.data.user_seed, bet.data.user_seed_nonce, item.roll);
          let value;
          if(isVerified) {value = "yes"} else {value = "no"};
          // console.log("verified?",value);
          var element = {};
          element.id = item.id; element.game = item.game; element.roll = item.roll; element.side = item.side; element.target = item.target; element.user_seed_nonce = bet.data.user_seed_nonce; element.isVerified = isVerified;
          console.log('element : ', element);
          // betsDataObject.push({ id:item.id, game:item.game, roll:item.roll, side:item.side, target:item.target, server_seed:bet.data.server_seed, user_seed:bet.data.user_seed, user_seed_nonce:bet.data.user_seed_nonce, isVerified:isVerified });
          betData.push({element: element});         
          this.setState({betData:betData});     
          let res = betData.find((obj) => {
            return obj.element.id == item.id;
          });
          console.log('Result -----------',res.element.id);    
        }
     })    
   }