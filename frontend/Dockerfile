FROM nginx:alpine

# 커스텀 Nginx 설정 복사
COPY default.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사 (배포용)
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]