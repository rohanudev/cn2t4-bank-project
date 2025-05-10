pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'pilgrim97/django-backend:latest'
        COMPOSE_PROJECT_NAME = 'bank-project'
        PATH = "/usr/bin:/usr/local/bin:$PATH"
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Check Docker Access') {
              steps {
                  sh 'docker info'
              }
          }

        stage('Login Test') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        sh 'echo ✅ Docker Hub 로그인 성공!'
                    }
                }
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
            
         /*stage('Docker Compose Build') {
             steps {
                 echo "🔨 docker-compose build 실행 중..."
                 dir('backend'){
                   script{
                       docker.build("${DOCKER_IMAGE}")
                   }
                 }
             }
         }*/

        stages {
            stage('Static Analysis') {
                steps {
                    sh './run_static_analysis.sh'
                }
            }

        
        /*stage('Login to Docker Hub') {
            steps {
                sh '''
                echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
            }
        }*/

        /*stage('Push Image') {
            steps {
                sh '''
                docker push pilgrim97/django-backend:latest
                '''
            }
        }*/
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
