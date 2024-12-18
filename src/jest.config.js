module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!axios)" // Allow Jest to process axios
  ],
  transform: {
    "^.+\\.js$": "babel-jest" // Ensure Babel is used to process JS files
  }
};
