pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-northeast-2' // 원하는 리전으로 변경
        S3_BUCKET = 'jenkins-fe-s3-cicd' // 업로드할 S3 버킷 이름
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect FE Changes') {
            steps {
                script {
                    // dev 브랜치 기준으로 변경된 파일을 확인
                    sh 'git fetch origin dev'

                    def changedFiles = sh(
                        script: 'git diff --name-only HEAD~1 HEAD',
                        returnStdout: true
                    ).trim().split('\n')

                    // FE 디렉토리 내부 변경 여부 체크
                    def feChanged = changedFiles.any { it.startsWith('FE/') }

                    if (feChanged) {
                        echo "FE 디렉토리에 변경사항이 있습니다. S3 업로드를 진행합니다."
                        env.FE_CHANGED = "true"
                    } else {
                        echo "FE 디렉토리에 변경사항이 없습니다. S3 업로드를 스킵합니다."
                        env.FE_CHANGED = "false"
                    }
                }
            }
        }

        stage('Upload to S3') {
            when {
                expression {
                    return env.FE_CHANGED == "true"
                }
            }
            steps {
                dir('FE') {
                    sh '''
                        aws s3 sync . s3://$S3_BUCKET/ --delete
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline 성공적으로 완료'
        }
        failure {
            echo 'Pipeline 실패'
        }
    }
}

