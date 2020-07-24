/*Generic Stake Methods for various games */

/**
 * Returns the SHA256 hash of the input
 * @param {string} data - The data to hash
 * @returns {string} The hex representation of the SHA256 hash
 */
sha256 = (data) => {
    let md = crypto.createHash('sha256').update(data).digest('hex');
    return md;
  };
  /**
   * Returns the HMAC SHA256 hash of the arguments
   * @param {string} K - The K part of the HMAC digest
   * @param {string} m - The message part of the HMAC digest
   * @returns {string} The hex representation of the HMAC SHA256 hash
   */
  hmac_sha256 = (K, m) => {
    let hmac = createHmac('sha256', K).update(m).digest('hex');
    return hmac;
  };
  /**
   * Returns a true if the server seed and provided hash match
   * @returns {boolean} True if the server seed hash matches the provided hash
   */
  seed_hash_match = () => {
    if (this.server_seed && this.server_hash) {
      return this.sha256(this.server_seed) === this.server_hash;
    }
    return false;
  };
  /**
   * Returns true if the server seed, client seed and nonce are all present
   * @returns {boolean}
   */
  all_info = () => {
    return this.server_seed && this.client_seed && this.nonce;
  };
  /**
   * Returns the hex string calculated by hashint the server seed, client seed, nonce and round
   * @param {number} length - The length IN HEX CHARACTERS of the string to return.
   * @param {number} num - If defined, the string is truncated to the last n=num characters
   * @returns {string} A hex string
   */
  bytes = (server_seed, client_seed, nonce, length, num) => {
    let result = '';
    let round = 0;
    while (result.length < length) {
      result += this.hmac_sha256(server_seed, `${client_seed}:${nonce || 0}:${round++}`);
    }
    if (result.length > length) {
      result = result.substring(0, length);
    }
    if (num) {
      result = result.substring(length - num, length);
    }
    return result;
  };
  /**
   * Returns a number in the range [0, 1)
   * @param {string} bytes - The 8 character (4 byte) hex string to convert to a number
   * @returns {number} A number in the range [0, 1)
   */
  bytes_to_number = (bytes) => {
    let total = 0;
    for (let i = 0; i < 4; i++) {
      total += parseInt(bytes.substr(i * 2, 2), 16) / Math.pow(256, i + 1);
    }
    return total;
  };
  /**
   * Splits a string of characters into an array of two character chunks
   * @param {string} bytes - The string of hex digits
   * @returns {string[]} The array of 2 character chunks
   */
  bytes_to_hex_array = (bytes) => {
    let hex = [];
    for (let i = 0; i < bytes.length; i += 2) {
      hex.push(bytes.substr(i, 2));
    }
    return hex;
  };
  /**
   * Takes a string of hex digits and converts them to an array of numbers
   * @param {string} bytes - A string of hex digits with length evenly divisible by 8
   * @returns {number[]} An array of numbers in the range [0, 1)
   */
  bytes_to_num_array = (bytes) => {
    let totals = [];
    for (let i = 0; i * 8 < bytes.length; i++) {
      totals.push(this.bytes_to_number(bytes.substr(i * 8), 8));
    }
    return totals;
  };
  /**
   * Returns the array of the 24 mine positions in order
   * @param {number[]} nums - The array of numbers
   * @returns {number[]} The array of mine positions
   */
  nums_to_mine_array = (nums) => {
    let { mines } = this.state;
    mines = [];
    for (let i = 0; i < 25; i++) {
      mines.push(i);
    }
    let result = [];
    for (let i = 0; i < nums.length; i++) {
      result.push(mines.splice(Math.floor((25 - i) * nums[i]), 1)[0]);
    }
    console.log("mines result", result);
    this.setState({ mines: result })
    return result;
  };
  /**
   * Returns the array of tile positions (Keno) in order
   * @param {number[]} nums - The array of numbers
   * @returns {number[]} The array of tile positions
   */
  nums_to_tile_array = (nums) => {
    let tiles = [];
    let result = [];
    for (let i = 0; i < 40; i++) {
      tiles.push(i);
    }
    for (let i = 0; i < nums.length; i++) {
      result.push(tiles.splice(Math.floor(nums[i] * (40 - i)), 1)[0]);
    }
    return result;
  };
  /**
   * Returns the array of cards from the numbers
   * @param {number[]} nums - The array of numbers
   * @returns {string[]} - The array of cards
   */
  nums_to_card_array = (nums) => {
    const cards = ['2_of_diamonds', '2_of_hearts', '2_of_spades', '2_of_clubs',
      '3_of_diamonds', '3_of_hearts', '3_of_spades', '3_of_clubs',
      '4_of_diamonds', '4_of_hearts', '4_of_spades', '4_of_clubs',
      '5_of_diamonds', '5_of_hearts', '5_of_spades', '5_of_clubs',
      '6_of_diamonds', '6_of_hearts', '6_of_spades', '6_of_clubs',
      '7_of_diamonds', '7_of_hearts', '7_of_spades', '7_of_clubs',
      '8_of_diamonds', '8_of_hearts', '8_of_spades', '8_of_clubs',
      '9_of_diamonds', '9_of_hearts', '9_of_spades', '9_of_clubs',
      '10_of_diamonds', '10_of_hearts', '10_of_spades', '10_of_clubs',
      'jack_of_diamonds', 'jack_of_hearts', 'jack_of_spades', 'jack_of_clubs',
      'queen_of_diamonds', 'queen_of_hearts', 'queen_of_spades', 'queen_of_clubs',
      'king_of_diamonds', 'king_of_hearts', 'king_of_spades', 'king_of_clubs',
      'ace_of_diamonds', 'ace_of_hearts', 'ace_of_spades', 'ace_of_clubs'
    ];
    nums = nums.map((num) => {
      return cards[Math.floor(num * 52)];
    });
    return nums;
  };
  
  nums_to_pokercards_array = (nums) => {
    let cards = [];
    const pokercards = ['2_of_diamonds', '2_of_hearts', '2_of_spades', '2_of_clubs',
      '3_of_diamonds', '3_of_hearts', '3_of_spades', '3_of_clubs',
      '4_of_diamonds', '4_of_hearts', '4_of_spades', '4_of_clubs',
      '5_of_diamonds', '5_of_hearts', '5_of_spades', '5_of_clubs',
      '6_of_diamonds', '6_of_hearts', '6_of_spades', '6_of_clubs',
      '7_of_diamonds', '7_of_hearts', '7_of_spades', '7_of_clubs',
      '8_of_diamonds', '8_of_hearts', '8_of_spades', '8_of_clubs',
      '9_of_diamonds', '9_of_hearts', '9_of_spades', '9_of_clubs',
      '10_of_diamonds', '10_of_hearts', '10_of_spades', '10_of_clubs',
      'jack_of_diamonds', 'jack_of_hearts', 'jack_of_spades', 'jack_of_clubs',
      'queen_of_diamonds', 'queen_of_hearts', 'queen_of_spades', 'queen_of_clubs',
      'king_of_diamonds', 'king_of_hearts', 'king_of_spades', 'king_of_clubs',
      'ace_of_diamonds', 'ace_of_hearts', 'ace_of_spades', 'ace_of_clubs'
    ];
    for (let i = 0; i < 52; i++) {
      cards.push(i);
    }
    let result = [];
    for (let i = 0; i < nums.length; i++) {
      result.push(pokercards[(cards.splice(Math.floor((52 - i) * nums[i]), 1)[0])]);
    }
    return result;
  };
  /**
   * Takes a hex string and converts it into a base10 string with exactly 3 digits
   * @param {string} item - A hex string
   * @returns {string} A base 10 string of length 3
   */
  leading_zeroes = (item) => {
    item = parseInt(item, 16);
    if (item < 10) {
      return '00' + item;
    } else if (item < 100) {
      return '0' + item;
    } else {
      return item;
    }
  };
  /**
   * Returns the final result for many games
   * @param {string} game - The game to return the result for
   * @returns The result for the game
   */
  result = (game, server_seed, client_seed, nonce) => {
    // let {server_seed, client_seed, nonce} = this.state;
    switch (game) {
      case 'Dice':
        return (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_ROLL) / 100).toFixed(2);
      case 'Roulette':
        return Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_ROULETTE);
      case 'Chartbet':
        return (this.state.MAX_CHARTBET / (Math.floor(this.bytes_to_number(this.bytes(server_seed, client_seed, nonce, 8)) * this.state.MAX_CHARTBET) + 1) * 0.98);
      case 'Mines':
        return this.nums_to_mine_array(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 196)));
      case 'Keno':
        return this.nums_to_tile_array(this.bytes_to_num_array(this.bytes(server_seed, client_seed, nonce, 80)));
      default:
        return 'Unknown game';
    }
  }