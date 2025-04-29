# 💬 [AI 기반 학생 영어 과제 프로젝트]

> 학생의 영어 Essay 과제를 AI가 평가하고, 점수 및 피드백을 제공하는 과제입니다.

> Azure OpenAI, Azure Blob Storage, Aws EC2, Aws RDS, Github actions, winston, Jest 등이 포함되어 있습니다.

> 또한 음성 파일을 평가하는 기능도 개발 예정입니다.

## 📚 필수 산출물

- [배포 방법]: AWS EC2 & github actions를 통해 클라우드 배포 및 자동화 배포 적용

- [기능 정의(Notion)] 링크: https://www.notion.so/Evaluation-1de87a33571f80e89510c951480b565e

- [ERD (DB 설계)] 링크: https://drawsql.app/teams/-2817/diagrams/evaluation

![화면 캡처 2025-04-29 220233](https://github.com/user-attachments/assets/dd989ab3-aec0-4eea-86b5-808eefaf95af)

- [DDL] database 폴더 링크: https://github.com/kimminjae981002/assignment/tree/master/database

## ⚓ 배포 서버(Swagger) 및 API 문서

- http://16.176.15.154:3000/api-docs

#### 🌊 사용 흐름

1. POST /signUp 회원가입
2. POST /login 로그인 (accessToken: "token" 오른쪽 위 Authorize : token 삽입)
   - TEST ID: example123 TEST PW: Example123!
3. POST /submissions 평가 제출 - studentId, studentName, submitText, componentType(Essay Whiting, Speaking), file
   현재 로그인 한 사용자 ID, name이 같아야 합니다.(가드 검증)
   - 평가 과제를 제출하면 AI가 피드백을 해줍니다.
   - 평가 파일을 제출하면 변환된 파일은 Azure Blob Container에 저장됩니다.
   - API 호출 시 Logger를 통해 로그가 DB에 저장 됩니다.
4. GET /submissions 평가 전체 조회
5. GET /submissions/:submissionId 평가 상세 조회
6. POST /revision 재평가 제출 - submission_id, revision_reason, isRevision
   원하는 평가 고유아이디를 작성하여 재평가를 받을 수 있습니다.
   - 재평가를 제출하면 AI가 피드백을 하며 submission에 업데이트 됩니다.
   - API 호출 시 Logger를 통해 로그가 DB에 저장 됩니다.
7. GET /revision 재평가 전체 조회
8. GET /revision/:revisionId 재평가 상세 조회

## 📥 테스트 명령어

```
- npm run test
- npm run test:auth
- npm run test:revision
- npm run test:submission
- npm run test:azure
- npm run test:video
- npm run test:azureOpenAi
```

## 🧱 기술 스택

- NodeJS(20.19.0)

- NestJS(10.4.9)

- Package Manager: NPM

- TypeORM (PostgreSQL)

- Azure OpenAI API

- Azure Blob Storage

- AWS EC2, RDS

- github actions

- Jest

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

#### 1. git clone https://github.com/kimminjae981002/assignment.git

#### 2. npm install

#### 3. 환경변수(.env.local)

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

#### 4. npm run start:dev

# 💦 프로젝트 회고

### 😀 배운 점

1. azure 간단한 사용과 openAI 연동을 통해 외부 API 연동 경험
2. ffmpeg를 이용한 영상/오디오 변환 작업
3. logging을 위해 winston을 사용하여 db-transport를 생성하여 db에 저장
4. test를 하기 위해 Jest 사용법, 기본적인 흐름 파악
5. ERD 설계, API 문서화 등 개발 이외 영역까지 전체 흐름 이해
6. 테스트를 하며 내가 생각했던 로직과 코드 품질이 정말 안 좋다는 걸 파악

### 😌 어려웠던 점

1. Jest를 사용하여 테스트 작성이 어려워 커버리지 확보에 한계
2. 내가 생각했던 완성 시간 이상으로 더 걸림(중간 버그 발생)
3. 시간 내에 최대한 완성 하기 위해 너무 급급해서 아쉬움
4. 배포 시 postgres 설정이 까다로워 시간 소요됨

### 😬 노력한 점

1. Jest를 이해하기 위해 강의 듣고 블로그 작성

### 😖 아쉬운 점

1. Jest를 처음 사용해 Test의 중요성과 흐름을 이해하지 못했다
2. Test의 커버리지가 많이 낮아 아쉬움
3. 문서화 및 설계 능력이 많이 부족하다 생각함
