import { scan } from '@sonar/scan';

// The URL of the SonarQube server. Defaults to http://localhost:9000
const serverUrl = process.env.SONARQUBE_URL;
// The token used to connect to the SonarQube/SonarCloud server. Empty by default.
const token = process.env.SONARQUBE_TOKEN;
// projectKey must be unique in a given SonarQube instance
const projectKey = process.env.SONARQUBE_PROJECTKEY;

await scan(
  {
    serverUrl,
    token,
    options: {
      'sonar.projectKey': projectKey,
      'sonar.projectName': projectKey,
      'sonar.language': 'ts',
      'sonar.sources': 'src',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      // Encoding of the source code. Default is default system encoding
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => process.exit(),
);
