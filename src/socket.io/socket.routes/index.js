const chatIo = require('./chat.route');

module.exports = (io) => {
  chatIo(io);
};
