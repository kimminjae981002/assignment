export interface responseSubmission {
  result: string;
  message: null;
  studentId: string;
  studentName: string;
  score: number;
  feedback: string;
  highlights: string[];
  submitText: string;
  highlightSubmitText: string;
  mediaUrl: {
    video: string;
    audio: string;
  };
  apiLatency: number;
}
