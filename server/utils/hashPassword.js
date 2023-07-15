const bcrypt = require("bcryptjs");

const saltRounds = 10;
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);

  const hashedPassword = await bcrypt.hash(password, salt);

  return { hashedPassword, salt };
};

exports.hashPassword = hashPassword;
