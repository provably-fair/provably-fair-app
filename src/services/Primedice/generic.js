
/* Method for Provably Fair Verification of bets for the PrimeDice Operator */

handleVerifyBetPrimeDice = (serverSeedHash, clientSeed, nonce) => {
    // bet made with seed pair (excluding current bet)
    // crypto lib for hmac function
    const crypto = require('crypto');
    const roll = function (key, text) {
        // create HMAC using server seed as key and client seed as message
        const hash = crypto.createHmac('sha512', key).update(text).digest('hex');
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
    this.setState({ diceVerify: diceVerify });
    console.log(diceVerify);
    this.setState({ nonce: 0 })
    return diceVerify;
}
