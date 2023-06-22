if (process.env.MONGO_URL) {
  module.exports = require('./mongodb');
} else {
  module.exports = require('./sqlite');
}
