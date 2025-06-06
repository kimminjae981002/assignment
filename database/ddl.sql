###### 재평가 테이블 ######
CREATE TABLE public.revisions (
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	id serial4 NOT NULL,
	revision_reason varchar NOT NULL,
	"isRevision" bool NOT NULL,
	submission_id int4 NULL,
	CONSTRAINT "PK_4aa9ee2c71c50508c3c501573c9" PRIMARY KEY (id)
);


-- public.revisions foreign keys

ALTER TABLE public.revisions ADD CONSTRAINT "FK_5aac4b8e3d5c3e7ba52a95254ad" FOREIGN KEY (submission_id) REFERENCES public.submissions(id);

###### 학생 테이블 #####
CREATE TABLE public.students (
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	id serial4 NOT NULL,
	student_id varchar NOT NULL,
	"password" varchar NOT NULL,
	email varchar NOT NULL,
	"name" varchar NOT NULL,
	"role" varchar DEFAULT 'student'::character varying NOT NULL,
	"level" int4 DEFAULT 0 NULL,
	gender varchar NOT NULL,
	birth_date timestamp NOT NULL,
	payment_date timestamp NULL,
	CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id),
	CONSTRAINT "UQ_25985d58c714a4a427ced57507b" UNIQUE (email),
	CONSTRAINT "UQ_ba36f3e3743f80d1cdc51020103" UNIQUE (student_id)
);

###### 비디오 변환 파일 테이블 ######
CREATE TABLE public.submission_media (
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	id serial4 NOT NULL,
	azure_mp3_url varchar NOT NULL,
	azure_mp4_url varchar NOT NULL,
	metadata jsonb NOT NULL,
	submission_id int4 NULL,
	CONSTRAINT "PK_4a2ad30a956a44dba4cf46d1967" PRIMARY KEY (id),
	CONSTRAINT "REL_2e9be2f1f37d7a484e38f4ce78" UNIQUE (submission_id)
);


-- public.submission_media foreign keys

ALTER TABLE public.submission_media ADD CONSTRAINT "FK_2e9be2f1f37d7a484e38f4ce78e" FOREIGN KEY (submission_id) REFERENCES public.submissions(id);

###### 평가 테이블 ######
CREATE TABLE public.submissions (
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	id serial4 NOT NULL,
	video_file varchar NULL,
	status varchar DEFAULT 'waiting'::character varying NOT NULL,
	submit_text varchar NOT NULL,
	score int4 NOT NULL,
	component_type varchar NOT NULL,
	feedback varchar NOT NULL,
	highlights varchar NULL,
	metadata jsonb NOT NULL,
	student_id int4 NULL,
	CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY (id)
);


-- public.submissions foreign keys

ALTER TABLE public.submissions ADD CONSTRAINT "FK_435def3bbd4b4bbb9de1209cdae" FOREIGN KEY (student_id) REFERENCES public.students(id);


##### 평가 재평가 로그 테이블 #####
CREATE TABLE public.submission_logs (
	id serial4 NOT NULL,
	trace_id varchar NOT NULL,
	latency int4 NOT NULL,
	"result" varchar NOT NULL,
	api_end_point varchar NOT NULL,
	message varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	submission_id int4 NULL,
	revision_id int4 NULL,
	CONSTRAINT "PK_0e54ea9fe9d685e1614d8dc9dbf" PRIMARY KEY (id),
	CONSTRAINT "REL_005ade7bbc85e7b190565ecfbe" UNIQUE (revision_id),
	CONSTRAINT "REL_90a0447df332ee34a42ab096b4" UNIQUE (submission_id)
);


-- public.submission_logs foreign keys

ALTER TABLE public.submission_logs ADD CONSTRAINT "FK_005ade7bbc85e7b190565ecfbe0" FOREIGN KEY (revision_id) REFERENCES public.revisions(id);
ALTER TABLE public.submission_logs ADD CONSTRAINT "FK_90a0447df332ee34a42ab096b4a" FOREIGN KEY (submission_id) REFERENCES public.submissions(id);