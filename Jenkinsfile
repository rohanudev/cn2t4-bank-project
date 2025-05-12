pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'pilgrim97/django-backend:latest'
        COMPOSE_PROJECT_NAME = 'bank-project'
        PATH = "/usr/bin:/usr/local/bin:$PATH"
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 GitHub에서 소스 가져오는 중..."
                git branch: 'jenkins_jb', url: 'https://github.com/rohanudev/cn2t4-bank-project-2.git/'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
            }
        }

        stage('Run ESLint') {
            steps {
                sh 'chmod +x analysis/static/run-eslint.sh'
                sh 'analysis/static/run-eslint.sh'
            }
        }

        stage('Run Bandit') {
            steps {
                sh 'chmod +x analysis/static/run-bandit.sh'
                sh 'analysis/static/run-bandit.sh'
            }
        }

        stage('Run Trivy Scan') {
            steps {
                sh 'chmod +x analysis/static/run-trivy.sh'
                sh 'analysis/static/run-trivy.sh'
            }
        }

        stage('Publish Static Analysis Results') {
            steps {
                recordIssues(tools: [
                    sarif(pattern: 'analysis/static/reports/eslint-results.sarif'),
                    sarif(pattern: 'analysis/static/reports/bandit-results.json'),
                    sarif(pattern: 'analysis/static/reports/trivy-results.sarif')
                ])
            }
        }
    }

    post {
        success {
            echo '✅ 모든 분석 및 빌드 성공!'
        }
        failure {
            echo '❌ 빌드 실패! 로그를 확인하세요.'
        }
    }
}