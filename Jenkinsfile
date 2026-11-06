pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
    }

    parameters {
        booleanParam(
            name: 'DEPLOY_TO_EC2',
            defaultValue: false,
            description: 'Deploy to the configured EC2 host after tests pass'
        )
    }

    environment {
        DEPLOY_DIR = '/opt/employeesphere'
        // CI-only values used to parse Compose during image build. Never use these in a deployment.
        DB_NAME = 'employeesphere_ci'
        DB_USER = 'employeesphere_ci'
        DB_PASSWORD = 'ci-only-password-not-for-deployment'
        SECRET_KEY = 'ci-only-secret-not-for-deployment-000000000000'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Backend tests') {
            steps {
                sh '''
                    python3 -m venv .venv-ci
                    . .venv-ci/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                    cd backend
                    PYTHONPATH=. ../.venv-ci/bin/pytest -q
                '''
            }
        }

        stage('Frontend build') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Build Docker images') {
            steps {
                sh 'docker compose -f compose.yaml build'
            }
        }

        stage('Deploy to EC2') {
            when {
                allOf {
                    branch 'main'
                    expression { return params.DEPLOY_TO_EC2 }
                }
            }
            steps {
                sh '''
                    test -f "$DEPLOY_DIR/.env"
                    docker compose --env-file "$DEPLOY_DIR/.env" -f compose.yaml up -d --remove-orphans
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
    }
}
