# Python 이미지 사용
FROM python:3.11

# 작업 디렉토리 설정
WORKDIR /app

# Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt update && apt install -y netcat-openbsd

# 프로젝트 코드 복사
COPY . .

# Django 서버 실행 (개발용)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]