module.exports = {
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    // transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
    moduleNameMapper: {
      '^axios$': require.resolve('axios'),
    },
  };