const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, servicePlaylists }) => {
    const exportsHandler = new ExportsHandler(service, validator, servicePlaylists);
    server.route(routes(exportsHandler));
  },
};
