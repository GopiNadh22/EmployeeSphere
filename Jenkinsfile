
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
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
            steps {
                sh '''
                    set -eu

                    test -f "$DEPLOY_DIR/.env"

                    # Copy the application deployment files.
                    rsync -a --delete \
                        --exclude='.env' \
                        --exclude='.git' \
                        "$WORKSPACE/" "$DEPLOY_DIR/"

                    # Deploy using the protected production configuration.
                    docker compose \
                        --project-directory "$DEPLOY_DIR" \
                        --env-file "$DEPLOY_DIR/.env" \
                        -f "$DEPLOY_DIR/compose.yaml" \
                        up -d --build --remove-orphans

                    docker compose \
                        --project-directory "$DEPLOY_DIR" \
                        --env-file "$DEPLOY_DIR/.env" \
                        -f "$DEPLOY_DIR/compose.yaml" \
                        ps
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
