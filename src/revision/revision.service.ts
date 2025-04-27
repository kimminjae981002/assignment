import { CreateRevisionDto } from './dto/create-revision.dto';
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from 'src/submission/entities/submission.entity';
import { Repository } from 'typeorm';
import { Revision } from './entities/revision.entity';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Revision)
    private readonly revisionRepository: Repository<Revision>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly azureOpenAIService: AzureOpenAIService,
  ) {}

  // 재평가 요청
  async revisionSubmission(
    submissionId: number,
    createRevisionDto: CreateRevisionDto,
  ) {
    const { revision_reason, isRevision } = createRevisionDto;

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('평가를 조회할 수 없습니다.');
    }

    const prompt = `당신은 영어 문법 선생님입니다. 내용에 대하여 score, feedback, highlights를 작성해주세요. 내용: ${submission.submitText} 답변은 한국어로 부탁드리고 답변 예시 형식에 꼭 맞춰주시고 JSON 형식으로 반환해주세요.
      답변 예시) score: 2 10점 만점 평가, feedback: 전반적으로 잘 작성했지만 부족한 부분을 말씀 드리겠습니다, highlights: ["test", "where"] 내용에 대해 감전한 부분을 배열로 넣기`;

    // openAI 호출 재평가 받기
    const feedbackAI = await this.azureOpenAIService.openAI(prompt);

    // 재평가 시 AI 평가 업데이트
    await this.submissionRepository.update(
      { id: submissionId },
      {
        score: feedbackAI.score,
        feedback: feedbackAI.feedback,
        highlights: feedbackAI.highlights,
        status: 'revised',
      },
    );

    // 재평가 이유랑 재평가 받을지 선택 후 저장
    const revision = await this.revisionRepository.create({
      revision_reason,
      isRevision,
      submission,
    });

    await this.revisionRepository.save(revision);

    return submission;
  }
}
