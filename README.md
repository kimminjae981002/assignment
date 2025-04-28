# 💬 [AI 기반 학생 영어 과제 프로젝트]

> 학생이 영어 문법에 대한 과제를 제출을 하면 AI가 그에 대한 피드백을 주는 프로젝트입니다.

> 음성 파일을 평가하는 기능도 개발 예정입니다.

## 📚 프로젝트 문서

- [기능 정의(Notion)] 링크: https://www.notion.so/Evaluation-1de87a33571f80e89510c951480b565e

- [ERD (DB 설계)] 링크: https://drawsql.app/teams/-2817/diagrams/evaluation

## 🧱 기술 스택

- NodeJS(20.19.0)

- NestJS(10.4.9)

- Package Manager: NPM

- TypeORM (PostgreSQL)

- OpenAI API

- Azure Blob Storage

## 📬 API 문서

- Swagger: http://localhost:3000/api-docs

## 📁 디렉터리 구조

```
src
├── azure/ (Azure Blob Storage & Azure Open AI)
├── common/
├── configs/
├── revision/ (재평가(Revision) 도메인)
├── submission/ (평가 제출(Submission) )
├── uploads/ (파일 모음)
├── user/ (유저 도메인 (회원가입, 로그인, 인증 등))
├── video/ (영상 처리 로직)

```

## 🛠️ 실행 방법

#### 1. npm install

#### 2. 환경변수(.env.local)

```
NODE_ENV=local

- server port
  SERVER_PORT=number

- postgres
  DB_HOST=db_host
  DB_PASSWORD=db_password
  DB_PORT=db_port
  DB_USERNAME=db_username
  DB_SYNC=db_sync
  DB_NAME=db_name

- jwt hash
  HASH_ROUNDS=number

- jwt secret key
  JWT_SECRET_KEY=string

- Azure blob storage
  AZURE_STORAGE_ACCOUNT=azure_storage_account
  AZURE_STORAGE_KEY=azure_storage_key
  AZURE_STORAGE_CONTAINER=azure_blob_storage_container

- Azure OpenAI
  AZURE_OPENAI_KEY=azure_openai_key
  AZURE_OPENAI_NAME=azure_openai_name
  AZURE_OPENAI_ENDPOINT=azure_openai_endpoint
  AZURE_OPENAI_DEVELOPMENT=azure_openai_development === (model)
  AZURE_OPENAI_VERSION=azure_openai_version
  AZURE_OPENAI_MODEL=azure_openai_model
```

#### 3. npm run start:dev
