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

        stage('Check Static Analysis Results') {
            steps {
                script {
                    def summary = []
                    def buildFailed = false

                    // === 1. ESLint SARIF ===
                    def eslintReportPath = 'analysis/static/reports/eslint-results.sarif'
                    if (fileExists(eslintReportPath)) {
                        def eslintSarif = readJSON file: eslintReportPath
                        def eslintIssues = eslintSarif.runs[0].results.size()
                        summary << "🔍 ESLint: ${eslintIssues} issue(s)"
                        if (eslintIssues > 0) buildFailed = true
                    } else {
                        summary << "⚠️ ESLint report not found at ${eslintReportPath}"
                        buildFailed = true
                    }

                    // === 2. Trivy SARIF ===
                    def trivyReportPath = 'analysis/static/reports/trivy-results.sarif'
                    if (fileExists(trivyReportPath)) {
                        def trivySarif = readJSON file: trivyReportPath
                        def trivyFindings = trivySarif.runs[0].results.findAll { res ->
                            res.level?.toLowerCase() in ['error', 'critical']
                        }
                        summary << "🔍 Trivy: ${trivyFindings.size()} CRITICAL/ERROR issue(s)"
                        if (trivyFindings.size() > 0) buildFailed = true
                    } else {
                        summary << "⚠️ Trivy report not found at ${trivyReportPath}"
                        buildFailed = true
                    }

                    // === 3. Bandit JSON ===
                    def banditReportPath = 'analysis/static/reports/bandit-report.json'
                    if (fileExists(banditReportPath)) {
                        def banditReport = readJSON file: banditReportPath
                        def badBanditIssues = banditReport.results.findAll { res ->
                            res.issue_severity?.toUpperCase() in ['HIGH', 'CRITICAL']
                        }
                        summary << "🔍 Bandit: ${badBanditIssues.size()} HIGH/CRITICAL issue(s)"
                        if (badBanditIssues.size() > 0) buildFailed = true
                    } else {
                        summary << "⚠️ Bandit report not found at ${banditReportPath}"
                        buildFailed = true
                    }

                    // === 결과 출력 ===
                    summary.each { echo it }

                    if (buildFailed) {
                        error("❌ Static analysis failed. See details above.")
                    } else {
                        echo "✅ All static analysis passed"
                    }
                }
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