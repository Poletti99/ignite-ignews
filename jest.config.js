module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__tests__/'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(scss|css|sass)$': 'identity-obj-proxy',
  },
};
