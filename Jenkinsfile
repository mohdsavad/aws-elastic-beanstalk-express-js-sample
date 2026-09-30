pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        // Retain at most 20 builds, with a maximum age of 30 days.
        buildDiscarder(logRotator(
            numToKeepStr: '20',
            daysToKeepStr: '30'
        ))
    }

    environment {
        IMAGE_NAME = 'mohammedsavad/isec6000-assessment2-app'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                // Avoid using files or reports left by an earlier build.
                deleteDir()
                checkout scm
                sh '''
                    mkdir -p reports
                    git rev-parse HEAD > reports/commit.txt
                '''
            }
        }

        stage('Node 16 Validation') {
            agent {
                docker {
                    image 'node:16.20.2-bullseye'
                    args '--user 1000:1000'
                    reuseNode true
                }
            }

            environment {
                // Writable npm cache without changing the system HOME.
                npm_config_cache = '/tmp/npm-cache'
            }

            stages {
                stage('Install Dependencies') {
                    steps {
                        sh '''
                            id
                            test "$(id -u)" -ne 0
                            node --version
                            npm --version
                            npm ci --no-audit
                        '''
                    }
                }

                stage('Unit and HTTP Tests') {
                    steps {
                        sh '''
                            set +e
                            npm test > reports/tests.txt 2>&1
                            result=$?
                            cat reports/tests.txt
                            exit "$result"
                        '''
                    }
                }

                stage('Dependency Security Gate') {
                    steps {
                        // Preserve npm's failure status after displaying
                        // the report. High/Critical findings stop the build.
                        sh '''
                            set +e
                            npm audit --audit-level=high --json \
                                > reports/npm-audit.json 2> reports/npm-audit-errors.txt
                            result=$?
                            cat reports/npm-audit.json
                            cat reports/npm-audit-errors.txt
                            echo "Security scan exit code: $result"
                            exit "$result"
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build --progress=plain \
                        -t "$IMAGE_NAME:$IMAGE_TAG" .
                    docker image inspect "$IMAGE_NAME:$IMAGE_TAG" \
                        --format '{{.Config.User}}' > reports/image-user.txt
                    cat reports/image-user.txt
                    test "$(cat reports/image-user.txt)" = "node"
                '''
            }
        }

        stage('Publish Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'REGISTRY_USER',
                    passwordVariable: 'REGISTRY_TOKEN'
                )]) {
                    sh '''
                        set +x
                        set -eu
                        # Keep temporary registry credentials outside
                        # the workspace and remove them on exit.
                        registry_config=$(mktemp -d)
                        trap 'rm -rf "$registry_config"' EXIT

                        printf '%s' "$REGISTRY_TOKEN" |
                            docker --config "$registry_config" login \
                                --username "$REGISTRY_USER" --password-stdin

                        docker --config "$registry_config" push \
                            "$IMAGE_NAME:$IMAGE_TAG"

                        printf '%s\\n' "$IMAGE_NAME:$IMAGE_TAG" \
                            > reports/published-image.txt
                    '''
                }
            }
        }
    }

    post {
        always {
            // Keep available reports even when tests or scanning fail.
            archiveArtifacts(
                artifacts: 'reports/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }
        success {
            echo "Published ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline failed. Review the failed stage and archived reports.'
        }
    }
}
