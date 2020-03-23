What is "provably fair"?
Players always fear to be cheated on an online casino. This is understandable because it is technically very easy for an online casino to just make you lose. In the Bitcoin gambling community we have a solution for this called "provably fair". Provably fair is a tool that enables you (the player) to verify each roll result and make sure you are not being cheated!

The easy way is to just use our provably fair verifiers, fill in the information the website is providing you and check the roll results. Our verifiers:

BetterBets verifier
BitDice.me verifier
Bitsler verifier
Crypto-Games.net verifier
Just-Dice.com verifier
Nitrogen Dice verifier
Primedice verifier
SafeDice verifier
However I personally think it is better to fully understand how it works, so I will try to explain the provably fair method on this page.

How does provably fair work?
Although there are several implementations of the provably fair method, we will describe the most common one. With this method each roll-result is calculated by the following variables:

Serverseed - provided by the gambling site
Clientseed - provided by your browser and adjusted by you
Nonce - A number that increases with each bet you make
You will get an encrypted hash of the serverseed before you start gambling. Since you get it in advance, the site cannot change it later. However it is encrypted, so you cannot calculate your own roll results in advance (only afterwards if you get the unhashed serverseed.)

Your browser will generate a random clientseed. However, you could and should adjust this clientseed before you start. This way you can make sure the site does not know your clientseed in advance.

Now if you make a bet the nonce starts with 0 or 1 depending on the website. After each bet you make, the nonce number will go up by 1.

Calculating the roll result
A dice site uses 3 variables (server- & clientseed and nonce) to calculate the roll result. I will illustrate this with an example, let's say we have these values:


So this is:

Clientseed: ClientSeedForDiceSites.com
Serverseed unhashed: 293d5d2ddd365f54759283a8097ab2640cbe6f8864adc2b1b31e65c14c999f04
Serverseed hashed: 5ac59780d512265230d5efb3cc238886dc1b457a80b54fbf1f920b99c6505801
Nonce: for the first bet it is 0 on this dice site (PrimeDice)
PrimeDice first calculates a HMAC hash with these variables, like this:

hmac-sha512(server_seed, client_seed-nonce)
So in our case this becomes:

hmac-sha512(293d5d2ddd365f54759283a8097ab2640cbe6f8864adc2b1b31e65c14c999f04, ClientSeedForDiceSites.com-0)
