pipeline {
  agent any

  environment {
    REPORT_DIR = 'reports'
  }

  stages {
    stage('Prepare') {
      steps {
        sh 'mkdir -p ${REPORT_DIR}'
      }
    }

    stage('Static Analysis - Bandit (Python)') {
      steps {
        sh '''
          docker run --rm -v $PWD:/src -v $PWD/${REPORT_DIR}:/out \
          python:3.11-slim bash -c "
            pip install bandit && \
            bandit -r /src/backend -f html -o /out/bandit.html
          "
        '''
      }
    }

    stage('Static Analysis - ESLint (JavaScript)') {
      steps {
        sh '''
          docker run --rm -v $PWD:/app -w /app node:18 bash -c "
            npm install && \
            npx eslint frontend/**/*.js -f html -o ${REPORT_DIR}/eslint.html || true
          "
        '''
      }
    }

    stage('Dynamic Analysis - ZAP (Web Vuln Scan)') {
      steps {
        sh '''
          docker run -u root -v $PWD/${REPORT_DIR}:/zap/reports \
          -t owasp/zap2docker-stable zap-baseline.py \
          -t http://localhost:8000 -r zap.html
        '''
      }
    }

    stage('Dependency Scan - Trivy (Docker Image)') {
      steps {
        sh '''
          docker build -t myapp:latest .
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          -v $PWD/${REPORT_DIR}:/out aquasec/trivy:latest image myapp:latest \
          --severity HIGH,CRITICAL --format html -o /out/trivy.html
        '''
      }
    }

    stage('Publish HTML Reports') {
      steps {
        publishHTML([
          reportDir: "${REPORT_DIR}",
          reportFiles: 'bandit.html,eslint.html,zap.html,trivy.html',
          reportName: 'Security Analysis Reports'
        ])
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: "${REPORT_DIR}/*.html", fingerprint: true
    }
  }
}