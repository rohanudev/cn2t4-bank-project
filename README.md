# 디렉토리 구조
```bash
cn2t4-bank-project/
├── frontend/        # Vanilla JS 프로젝트
│   ├── Dockerfile
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/         # Django 프로젝트
│   ├── Dockerfile
│   ├── config/      # 프로젝트 설정
│   ├── api/             # (임시 테스트용)
│   ├── auth/            # 로그인, 인증 관련
│   ├── users/           # 사용자 관리
│   ├── accounts/        # 계좌 관리
│   ├── transactions/    # 거래 처리
│   ├── notifications/   # 알림 시스템
│   ├── common/          # 공통 유틸리티, 예외 처리 등
│   ├── manage.py
│   ├── requirements.txt
└── docker-compose.yml  # 전체 프로젝트를 관리하는 파일
```
---
# 📦 로컬 개발 환경 구성 (Docker Compose 사용)

✅ 사전 준비
- Docker Desktop 설치
- git 설치

📂 1. 프로젝트 클론
```bash
git clone https://github.com/nolzaheo/cn2t4-bank-project.git
```

🚀 2. Docker 이미지 빌드 및 컨테이너 실행
```bash
docker-compose up -d --build
```
- 백엔드(Django): http://localhost:8000
- 프론트엔드(Vanilla JS + Nginx): http://localhost

🧪 3. 프로젝트 실행 및 API 연결 확인
웹 브라우저에 아래 주소 입력
- http://localhost
- http://localhost:8000/api/hello -> { "message": "Hello from Django!" }

🔁 4. 개발 중 실시간 반영  
프론트엔드와 백엔드 디렉토리는 volumes로 마운트되어 있어 코드 수정 시 자동 반영됩니다.

🛑 5. 종료
```bash
docker-compose down
```
