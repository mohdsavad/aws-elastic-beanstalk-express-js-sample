# AWS Elastic Beanstalk Node.js Sample App

This repository contains a sample Node.js web application built using [Express](https://expressjs.com/), meant to be used as part of the AWS DevOps Learning Path.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.


## ISEC6000 Assessment 2: Jenkins CI/CD

### Project repositories
- Application: https://github.com/mohdsavad/aws-elastic-beanstalk-express-js-sample
- Jenkins infrastructure: https://github.com/mohdsavad/isec6000-assessment2-jenkins
- Registry: https://hub.docker.com/r/mohammedsavad/isec6000-assessment2-app

### Pipeline
Jenkins job: 21678527_Assessment2_pipeline

The job loads Jenkinsfile from the main branch using Pipeline script from SCM.
SCM polling is configured as H/5 * * * *.

Stages:
1. Check out the source into a clean workspace.
2. Install locked dependencies with npm ci under Node 16.20.2.
3. Run the homepage unit test and three HTTP checks.
4. Run npm audit with the High/Critical failure threshold.
5. Build the Docker image and verify its configured runtime user is node.
6. Publish a build-numbered image to Docker Hub.

Node validation runs as UID 1000 in a Docker agent.
Registry authentication uses Jenkins credential ID dockerhub-credentials.
The token is not stored in this repository.

### Logs and artifacts
The Jenkinsfile retains up to 20 builds with a maximum age of 30 days.
Console logs record pipeline activity. Available reports are archived
even when a stage fails:
- commit.txt
- tests.txt
- npm-audit.json
- npm-audit-errors.txt
- image-user.txt, when the image is built
- published-image.txt, when publication succeeds

### Security-gate verification
Build #4 checked out security-gate-demo at commit 28f3e20.
That branch deliberately adds lodash 4.17.20 as a development dependency.
Application tests passed, but npm audit detected High-severity findings
and returned exit code 1. Jenkins skipped image building and publication
and archived the scan report.

The demonstration branch must not be merged into main.

After restoring the job to main, build #5 completed successfully.

### Troubleshooting
- Missing YAML list markers on volume mounts prevented Compose validation.
  Correcting the list syntax resolved the error.
- A missing final closing brace prevented Jenkinsfile compilation.
  Adding the brace allowed the pipeline to execute.
- Docker Buildx was explicitly added to the Jenkins image to support
  BuildKit image builds.

### Scope
The npm scan assesses application dependencies. It does not assess the
container operating system or Node runtime. Node 16 is used to satisfy
the assessment's specified build-agent requirement.
