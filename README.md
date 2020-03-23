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


Calculated outcome:

aa671aad5e4565ebffb8dc5c185e4df1ae6d9aca2578b5c03ec9c7750f881922276d8044e5e3d84f158ce411f667e224e9b0c1ac50fc94e9c5eb883a678f6ca2
Now the first 5 characters are being used (aa671) and converted from hexadecimal to a decimal. You can do this also with an online tool like statman.info/conversions/hexadecimal.html

If this number is over 999,999 than the next 5 characters (aad5e) would be used. But in our case it's 697,969 so this will be used. Now you only have to apply a modulus of 10^4 and divide it by 100. You can do this just on Google by typing:

697969%(10000)/100
The final result is:

79.69
This is the same roll result PrimeDice created:


For the second bet the dice site would do exactly the same but change the nonce from 0 to 1 (and after that to 2, etc.) This generates a complete different and random outcome each time you bet.

Verifying your roll results
You do not get the unhashed serverseed in advance, because that would allow you to generate all the rolls in advance (and win everything ;-).) So what you should do is generate a new hashed serverseed after your gambling session, this will reveal the old unhashed serverseed - that was being used for your gambling session. Verifying to check if you have been cheated would include 2 steps:

Step 1
First make sure the hashed serverseed you got, is really the hash of the unhashed serverseed. Otherwise they could just give you a random hash and still create fake outcomes. Let's look at our previous serverseed:

Serverseed unhashed: 293d5d2ddd365f54759283a8097ab2640cbe6f8864adc2b1b31e65c14c999f04
Serverseed hashed: 5ac59780d512265230d5efb3cc238886dc1b457a80b54fbf1f920b99c6505801
Again you can use an online tool (xorbin.com/tools/sha256-hash-calculator) to generate a SHA256 hash of the unhashed serverseed:


As you can see, the hash we got before we started to gamble, is really the serverseed that was used for the roll outcomes.

Step 2
Step 2 is to generate each roll result yourself and compare them to the rolls you made on the website. This is basically the same as we did at "Calculating the roll result".

Verify both steps - the easy way
Because you probably made tens, hundreds or even thousands of bets, it is not very simple to do verify it all manually again. Therefore you should use a provably fair verifier. We made verifiers for the most popular dice websites that should allow you to very easily verify the rolls you made. You only have to provide the several seeds and number of bets you made, and the verifier will check the serverseed hash and give you a list of all rolls.

For example, if we fill in all the variables in our PrimeDice verifier, we get the following result:


I will then compare these results with the bets I actually made to see if I was cheated or not:


Luckily, the results are exactly the same and I know I have not been cheated while gambling :-)

Provably Fair verifiers
BetterBets verifier
BitDice.me verifier
Bitsler verifier
Crypto-Games.net verifier
Just-Dice.com verifier
Nitrogen Dice verifier
Primedice verifier
SafeDice verifier
