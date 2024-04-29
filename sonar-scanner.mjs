import scanner from 'sonarqube-scanner';

// The URL of the SonarQube server. Defaults to http://localhost:9000
const serverUrl = process.env.SONARQUBE_URL;
// The token used to connect to the SonarQube/SonarCloud server. Empty by default.
const token = process.env.SONARQUBE_TOKEN;
// projectKey must be unique in a given SonarQube instance
const projectKey = process.env.SONARQUBE_PROJECTKEY

// options Map (optional) Used to pass extra parameters for the analysis.
// See the [official documentation](https://docs.sonarqube.org/latest/analysis/analysis-parameters/) for more details.
const options = {
  'sonar.projectKey': projectKey,

  'sonar.projectName': projectKey,

  // source language
  'sonar.language': 'ts',

  'sonar.javascript.lcov.reportPaths' : 'coverage/lcov.info',

  // Encoding of the source code. Default is default system encoding
  'sonar.sourceEncoding': 'UTF-8'
};

// parameters for sonarqube-scanner
const params = {
  serverUrl,
  token,
  options
}

const sonarScanner = async () => {

  console.log(serverUrl);
  console.log({ token });

  if (!serverUrl) {
    console.log('SonarQube url not set. Nothing to do...');
    return;
  }

  //  Function Callback (the execution of the analysis is asynchronous).
  const callback  = (result) => {
    console.log('Sonarqube scanner result:', result);
  }

  scanner(params, callback);
}

sonarScanner()
  .catch(err => console.error('Error during sonar scan', err));