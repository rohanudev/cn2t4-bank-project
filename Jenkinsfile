pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'pilgrim97/django-backend:latest'
        COMPOSE_PROJECT_NAME = 'bank-project'
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Check Docker Access') {
            steps {
                sh 'docker info'
            }
        }
        
        stage('Checkout') {
            steps {
                echo "📥 GitHub에서 소스 가져오는 중..."
                git branch: 'jenkinsdev_jb',
                    credentialsId: 'Github_Token',
                    url: 'https://github.com/rohanudev/cn2t4-bank-project-2.git'
                checkout scm
            }
        }
        
        stage('Static Analysis: Bandit in Docker') {
            steps {
                echo "🔍 Python 코드 정적 분석 (Bandit via Docker)"
                dir('backend') {
                    sh 'docker run --rm -v $(pwd):/src pyupio/bandit bandit -r /src -lll || true'
                }
            }
        }

        stage('Static Analysis: ESLint in Docker') {
            steps {
                echo "🔍 JavaScript 코드 정적 분석 (ESLint via Docker)"
                dir('frontend') {
                    sh 'docker run --rm -v $(pwd):/app -w /app node:18 npx eslint . || true'
                }
            }
        }

        stage('Dependency Scan: Trivy in Docker') {
            steps {
                echo "🛡️ 의존성 취약점 분석 (Trivy via Docker)"
                dir('backend') {
                    sh 'docker run --rm -v $(pwd):/project aquasec/trivy fs --severity HIGH,CRITICAL /project || true'
                }
            }
        }
            
        // stage('Docker Compose Build') {
        //     steps {
        //         echo "🔨 docker-compose build 실행 중..."
        //         dir('backend'){
        //           script{
        //               docker.build("${DOCKER_IMAGE}")
        //           }
        //         }
        //     }
        // }

        stage('Image Scan: Trivy after Build') {
            steps {
                echo "🛡️ Docker 이미지 취약점 분석 (Trivy after build)"
                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL pilgrim97/django-backend:latest || true'
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                sh '''
                echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                docker push pilgrim97/django-backend:latest
                '''
            }
        }
    }
        
    post {
        success {
            echo '✅ Docker 이미지 빌드 완료!'
        }
        failure {
            echo '❌ 빌드 실패! 로그를 확인하세요.'
        }
    }
}
