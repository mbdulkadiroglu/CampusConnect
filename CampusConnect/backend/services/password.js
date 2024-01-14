const crypto = require('crypto');

const generatePassword = (length = 12) => {
  if (length <= 0) {
    throw new Error('Password length must be greater than 0');
  }

  // Generate a random buffer of the specified length
  const buffer = crypto.randomBytes(Math.ceil(length / 2));

  // Convert the buffer to a hexadecimal string
  const password = buffer.toString('hex').slice(0, length);

  return password;
};

module.exports = {generatePassword};
