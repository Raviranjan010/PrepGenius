import { CommunicationMetrics } from "@/types";

// Filler words to detect in transcripts
const FILLER_WORDS = [
  "um", "uh", "uhh", "umm", "like", "you know", "basically",
  "actually", "sort of", "kind of", "i mean", "right", "so yeah",
  "literally", "honestly", "well", "anyway", "whatever"
];

export class FillerWordDetector {
  private fillerCounts: Map<string, number> = new Map();
  private totalFillers = 0;

  reset() {
    this.fillerCounts.clear();
    this.totalFillers = 0;
  }

  analyze(transcript: string): { word: string; count: number }[] {
    this.reset();
    const lower = transcript.toLowerCase();

    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        this.fillerCounts.set(filler, matches.length);
        this.totalFillers += matches.length;
      }
    }

    return Array.from(this.fillerCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTotalCount(): number {
    return this.totalFillers;
  }
}

export class SpeakingPaceAnalyzer {
  private samples: number[] = [];

  reset() {
    this.samples = [];
  }

  /**
   * Call this with accumulated transcript text to calculate WPM.
   * @param transcript - the full transcript so far
   * @param elapsedSeconds - how many seconds have passed since recording started
   */
  calculateWPM(transcript: string, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 0;
    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((wordCount / elapsedSeconds) * 60);
    this.samples.push(wpm);
    return wpm;
  }

  getAverageWPM(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.samples.length);
  }

  getSamples(): number[] {
    return [...this.samples];
  }

  /**
   * Pace consistency score (0-100). 
   * Lower variance = higher consistency = higher score.
   */
  getConsistencyScore(): number {
    if (this.samples.length < 2) return 100;
    const avg = this.getAverageWPM();
    const variance = this.samples.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / this.samples.length;
    const stdDev = Math.sqrt(variance);
    // Ideal stdDev is 0 (perfect consistency). Score drops as stdDev increases.
    const score = Math.max(0, 100 - stdDev * 2);
    return Math.round(score);
  }
}

export class ConfidenceScorer {
  /**
   * Composite confidence score from 0-100 based on:
   * - Speaking pace (ideal: 130-160 WPM)
   * - Filler word ratio (fewer = better)
   * - Pace consistency
   * - Answer length (longer answers = more confident, up to a point)
   */
  calculate(
    avgWPM: number,
    fillerCount: number,
    totalWords: number,
    paceConsistency: number
  ): number {
    // Pace score: ideal range 120-170 WPM
    let paceScore: number;
    if (avgWPM >= 120 && avgWPM <= 170) {
      paceScore = 100;
    } else if (avgWPM < 120) {
      paceScore = Math.max(0, 100 - (120 - avgWPM) * 1.5);
    } else {
      paceScore = Math.max(0, 100 - (avgWPM - 170) * 1.5);
    }

    // Filler ratio score: fewer fillers per 100 words is better
    const fillerRatio = totalWords > 0 ? (fillerCount / totalWords) * 100 : 0;
    const fillerScore = Math.max(0, 100 - fillerRatio * 15);

    // Answer completeness: reward answers > 30 words
    const completenessScore = Math.min(100, (totalWords / 50) * 100);

    // Weighted composite
    const composite = (
      paceScore * 0.25 +
      fillerScore * 0.30 +
      paceConsistency * 0.25 +
      completenessScore * 0.20
    );

    return Math.round(Math.min(100, Math.max(0, composite)));
  }
}

/**
 * Convenience function to get full communication metrics from a transcript
 */
export function analyzeCommunication(
  transcript: string,
  elapsedSeconds: number
): CommunicationMetrics {
  const fillerDetector = new FillerWordDetector();
  const paceAnalyzer = new SpeakingPaceAnalyzer();
  const confidenceScorer = new ConfidenceScorer();

  const fillerWords = fillerDetector.analyze(transcript);
  const fillerCount = fillerDetector.getTotalCount();

  const wpm = paceAnalyzer.calculateWPM(transcript, elapsedSeconds);
  const avgWPM = wpm; // single sample in this case

  const totalWords = transcript.trim().split(/\s+/).filter(Boolean).length;
  const confidenceScore = confidenceScorer.calculate(
    avgWPM,
    fillerCount,
    totalWords,
    paceAnalyzer.getConsistencyScore()
  );

  return {
    fillerCount,
    avgWPM,
    confidenceScore,
    fillerWords,
    paceSamples: paceAnalyzer.getSamples(),
  };
}
