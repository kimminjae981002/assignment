import { SubmissionLogService } from './../logger/submission-log.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from 'src/submission/entities/submission.entity';
import { Repository, DataSource } from 'typeorm';
import { Revision } from './entities/revision.entity';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Revision)
    private readonly revisionRepository: Repository<Revision>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly azureOpenAIService: AzureOpenAIService,
    private readonly dataSource: DataSource,
    private readonly submissionLogService: SubmissionLogService,
  ) {}

  // 재평가 요청
  async revisionSubmission(
    createRevisionDto: CreateRevisionDto,
    student: JwtPayloadInterface,
  ) {
    const startTime = Date.now();

    const { revision_reason, isRevision, submission_id } = createRevisionDto;

    const submission = await this.submissionRepository.findOne({
      where: { id: submission_id },
      relations: ['student'],
    });

    if (!submission) {
      throw new NotFoundException('평가를 조회할 수 없습니다.');
    }

    if (submission.student.id !== student.sub) {
      throw new BadRequestException('자신의 평가만 재평가 받을 수 있습니다.');
    }

    const prompt = `당신은 영어 문법 선생님입니다. 내용에 대하여 score, feedback, highlights를 작성해주세요. 내용: ${submission.submitText} 답변은 한국어로 부탁드리고 답변 예시 형식에 꼭 맞춰주시고 JSON 형식으로 반환해주세요.
      답변 예시) score: 2 10점 만점 평가, feedback: 전반적으로 잘 작성했지만 부족한 부분을 말씀 드리겠습니다, highlights: ["test", "where"] 내용에 대해 감전한 부분을 배열로 넣기`;

    // openAI 호출 재평가 받기
    const feedbackAI = await this.azureOpenAIService.openAI(prompt);

    // 트랜잭션 실행
    const revision = await this.createTransaction(
      submission_id,
      feedbackAI,
      revision_reason,
      isRevision,
      submission,
    );

    // API 호출 후 시간 기록
    const endTime = Date.now();

    // 응답 시간 측정
    const apiLatency = endTime - startTime;

    // createSubmission 호출 (로그 기록)
    await this.submissionLogService.saveLog({
      result: 'info',
      apiEndPoint: '/revision', // 실제 엔드포인트는 변경 가능
      latency: apiLatency,
      message: `${student.sub} 고유 아이디를 가진 학생이 재평가 제출 API를 호출했습니다.`,
      revision: revision,
    });

    return { result: 'ok', message: '해당 평가에 대해 재평가 되었습니다. ' };
  }

  // 데이터 저장 트랜잭션 로직
  async createTransaction(
    submission_id: number,
    feedbackAI,
    revision_reason: string,
    isRevision: boolean,
    submission: Submission,
  ) {
    // 트랜잭션 설정
    return await this.dataSource.transaction(async (manager) => {
      // 재평가 시 AI 평가 업데이트
      await manager.update(
        Submission,
        { id: submission_id },
        {
          score: feedbackAI.score,
          feedback: feedbackAI.feedback,
          highlights: feedbackAI.highlights,
          status: 'revised',
        },
      );

      // 재평가 이유랑 재평가 받을지 선택 후 저장
      const revision = manager.create(Revision, {
        revision_reason,
        isRevision,
        submission,
      });

      // submission DB에 저장
      await manager.save(Revision, revision);

      return revision;
    });
  }

  // 재평가 조회
  async findRevisions(page: number, size: number) {
    // size만큼 가져오기 , page를 계산해서 추출한다.
    const revisions = await this.revisionRepository.find({
      take: size || 20,
      skip: (page - 1) * size,
      order: {
        createdAt: 'DESC',
      },
      relations: ['submission'],
    });

    if (revisions.length === 0) {
      return {
        status: 204,
        result: revisions || [],
        message: '재평가를 조회할 수 없습니다.',
      };
    }

    return revisions;
  }

  // 재평가 조회
  async findRevision(revisionId: number) {
    const revision = await this.revisionRepository.findOne({
      where: {
        id: revisionId,
      },
      relations: ['submission'],
    });

    if (!revision) {
      return {
        result: false,
        message: '재평가를 조회할 수 없습니다.',
      };
    }

    return revision;
  }
}
