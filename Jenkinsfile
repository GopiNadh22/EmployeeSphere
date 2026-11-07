pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        booleanParam(
            name: 'DEPLOY_TO_EC2',
            defaultValue: false,
            description: 'Deploy to EC2 after all tests and builds pass'
        )
    }

    environment {
        DEPLOY_DIR = '/opt/employeesphere'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/app" \
                        -w /app \
                        python:3.12-slim \
                        bash -c "pip install -r backend/requirements.txt && cd backend && PYTHONPATH=. pytest -q"
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Build Docker Images') {
            environment {
                DB_NAME = 'employeesphere_ci'
                DB_USER = 'employeesphere_ci'
                DB_PASSWORD = 'ci-only-password-not-for-deployment'
                SECRET_KEY = 'ci-only-secret-not-for-deployment-000000000000'
            }
            steps {
                sh 'docker compose -f compose.yaml build'
            }
        }

        stage('Deploy to EC2') {
            when {
                expression {
                    return params.DEPLOY_TO_EC2
                }
            }
            steps {
                sh '''
                    test -f "$DEPLOY_DIR/.env"
                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        -f compose.yaml \
                        up -d --build --remove-orphans
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
