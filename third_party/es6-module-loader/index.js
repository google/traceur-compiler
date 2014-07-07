if (!global.traceur)
  require('traceur');
module.exports = {
  Loader: require('./loader'),
  System: require('./system')
};
