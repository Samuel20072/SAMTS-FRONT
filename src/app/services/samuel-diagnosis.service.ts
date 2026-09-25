/* ═══════════════════════════════════════════════════════════
   Samuel AI — Diagnosis Service
   Central state management for the Samuel conversation.
   Uses Angular signals for reactive, zoneless updates.
   ═══════════════════════════════════════════════════════════ */

import { Injectable, signal, computed } from '@angular/core';
import {
  DiagnosticState,
  DiagnosticAnswers,
  ConversationMessage,
  SamuelAnimState,
  DiagnosisStep,
  RecommendationResult,
  BusinessLead,
} from '../core/models/samuel.models';
import {
  QUESTION_STEPS,
  SAMUEL_INTRO_MESSAGES,
  SAMUEL_THINKING_MESSAGES,
  STEP_TRANSITIONS,
  RESULT_REVEAL_MESSAGES,
  HOME_INTRO_MESSAGES,
  HOME_FIRST_REPLIES,
} from '../core/data/samuel-questions';
import {
  SAMTS_CATALOG,
  getRecommendation,
  buildReasoning,
} from '../core/data/samuel-catalog';

const INITIAL_STATE: DiagnosticState = {
  currentStep: 'intro',
  stepIndex: 0,
  totalSteps: QUESTION_STEPS.length,
  answers: {},
  messages: [],
  samuelAnimState: 'greeting',
  isThinking: false,
  isOpen: false,
  showResult: false,
};

@Injectable({ providedIn: 'root' })
export class SamuelDiagnosisService {
  // ─── State ──────────────────────────────────────────────────
  private _state = signal<DiagnosticState>({ ...INITIAL_STATE });
  readonly homeMode = signal<boolean>(false);

  // ─── Public readonly signals ─────────────────────────────────
  readonly state = this._state.asReadonly();

  readonly isOpen = computed(() => this._state().isOpen);
  readonly messages = computed(() => this._state().messages);
  readonly currentStep = computed(() => this._state().currentStep);
  readonly stepIndex = computed(() => this._state().stepIndex);
  readonly totalSteps = computed(() => this._state().totalSteps);
  readonly isThinking = computed(() => this._state().isThinking);
  readonly samuelAnimState = computed(() => this._state().samuelAnimState);
  readonly showResult = computed(() => this._state().showResult);
  readonly answers = computed(() => this._state().answers);

  /** Current quick-reply options for the active step */
  readonly currentQuickReplies = computed(() => {
    const idx = this._state().stepIndex;
    const step = QUESTION_STEPS[idx];
    return step?.quickReplies ?? [];
  });

  /** Current question step data */
  readonly currentQuestionStep = computed(() =>
    QUESTION_STEPS[this._state().stepIndex]
  );

  /** Progress 0-1 */
  readonly progress = computed(() => {
    const idx = this._state().stepIndex;
    return idx / QUESTION_STEPS.length;
  });

  /** Cached recommendation (computed once when result is shown) */
  private _recommendation = signal<RecommendationResult | null>(null);
  readonly recommendation = this._recommendation.asReadonly();

  // ─── Session tracking to prevent duplicate message race conditions ──
  private _currentSessionId = 0;

  // ─── Open / Close ────────────────────────────────────────────

  open(): void {
    const sessionId = ++this._currentSessionId;
    this.homeMode.set(false);
    this._state.set({ ...INITIAL_STATE, isOpen: true });
    this._recommendation.set(null);
    this._playIntro(sessionId);
  }

  startHome(): void {
    const sessionId = ++this._currentSessionId;
    this.homeMode.set(true);
    this._state.set({ ...INITIAL_STATE, isOpen: true });
    this._recommendation.set(null);
    this._playHomeIntro(sessionId);
  }

  close(): void {
    this._currentSessionId++;
    this._state.update((s) => ({ ...s, isOpen: false }));
  }

  restart(): void {
    if (this.homeMode()) {
      this.startHome();
    } else {
      this.open();
    }
  }

  // ─── Intro sequence ──────────────────────────────────────────

  private async _playIntro(sessionId: number): Promise<void> {
    this._setSamuelAnim('greeting');
    const firstStep = QUESTION_STEPS[0];
    this._addSamuelMessage('¡Hola! Soy Samuel, la IA de SAMTS. 👋');
    await this._delay(600);
    if (this._currentSessionId !== sessionId) return;
    this._addSamuelMessage(firstStep.messages[0]);

    if (this._currentSessionId !== sessionId) return;
    this._state.update((s) => ({
      ...s,
      currentStep: firstStep.step,
      stepIndex: 0,
      samuelAnimState: 'explaining',
    }));
  }

  private async _playHomeIntro(sessionId: number): Promise<void> {
    this._setSamuelAnim('greeting');
    const firstStep = QUESTION_STEPS[0];
    this._addSamuelMessage(firstStep.messages[0]);

    if (this._currentSessionId !== sessionId) return;
    this._state.update((s) => ({
      ...s,
      currentStep: firstStep.step,
      stepIndex: 0,
      samuelAnimState: 'explaining',
    }));
  }

  // ─── Answer Submission ───────────────────────────────────────

  async submitAnswer(value: string): Promise<void> {
    if (this._state().isThinking) return;

    const currentStepData = QUESTION_STEPS[this._state().stepIndex];
    if (!currentStepData) return;

    // 1. Add user message
    this._addUserMessage(value);

    // 2. Save answer
    const answerKey = currentStepData.answerKey as keyof DiagnosticAnswers;
    this._state.update((s) => ({
      ...s,
      answers: { ...s.answers, [answerKey]: value },
      isThinking: true,
      samuelAnimState: 'thinking',
    }));

    // 3. Quick thinking delay for smooth UX
    await this._delay(450);

    // 4. Move to next step or show result
    const nextIndex = this._state().stepIndex + 1;
    const isDone = nextIndex >= QUESTION_STEPS.length;

    if (isDone) {
      this._showResult();
    } else {
      this._advanceToStep(nextIndex);
    }
  }

  // ─── Navigation ──────────────────────────────────────────────

  private _advanceToStep(index: number): void {
    const nextStep = QUESTION_STEPS[index];
    this._addSamuelMessage(nextStep.messages[0]);

    this._state.update((s) => ({
      ...s,
      currentStep: nextStep.step,
      stepIndex: index,
      isThinking: false,
      samuelAnimState: 'explaining',
    }));
  }

  private _showResult(): void {
    // Compute recommendation
    const answers = this._state().answers;
    const { primary, alternatives } = getRecommendation(answers);
    const reasoning = buildReasoning(answers, primary);

    const result: RecommendationResult = {
      primary,
      alternatives,
      reasoning,
      problemSummary: answers.mainProblem ?? 'Optimizar tu negocio digital',
      goalSummary: answers.goal ?? 'Crecer y automatizar',
    };

    this._recommendation.set(result);

    this._state.update((s) => ({
      ...s,
      isThinking: false,
      showResult: true,
      samuelAnimState: 'recommending',
    }));
  }

  // ─── Contact capture ─────────────────────────────────────────

  setContactInfo(info: {
    contactName: string;
    businessName: string;
    whatsapp: string;
    email?: string;
  }): void {
    this._state.update((s) => ({
      ...s,
      answers: { ...s.answers, ...info },
    }));
  }

  buildLead(): BusinessLead {
    const a = this._state().answers;
    const rec = this._recommendation();
    return {
      businessName: a.businessName ?? '',
      contactName: a.contactName ?? '',
      whatsapp: a.whatsapp ?? '',
      email: a.email,
      businessType: a.businessType ?? '',
      mainProblem: a.mainProblem ?? '',
      repetitiveTasks: a.repetitiveTasks ?? '',
      goal: a.goal ?? '',
      budget: a.budget ?? '',
      urgency: a.urgency ?? '',
      recommendedSolution: rec?.primary.name ?? '',
      timestamp: new Date(),
    };
  }

  buildWhatsAppMessage(): string {
    const a = this._state().answers;
    const rec = this._recommendation();
    const name = a.contactName ? `Soy ${a.contactName}` : 'Te escribo';
    const biz = a.businessName ? ` de ${a.businessName}` : '';
    const solution = rec?.primary.name ?? 'una solución digital';

    return (
      `¡Hola SAMTS! ${name}${biz}.\n\n` +
      `Hice el diagnóstico con Samuel y estoy interesado en:\n*${solution}*\n\n` +
      `Mi principal necesidad es:\n${a.mainProblem ?? 'mejorar mi presencia digital'}\n\n` +
      `Me gustaría conocer el siguiente paso. 🙌`
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private _addSamuelMessage(text: string): void {
    this._state.update((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          text,
          sender: 'samuel',
          timestamp: new Date(),
        },
      ],
    }));
  }

  private _addUserMessage(text: string): void {
    this._state.update((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          text,
          sender: 'user',
          timestamp: new Date(),
        },
      ],
    }));
  }

  private _setSamuelAnim(state: SamuelAnimState): void {
    this._state.update((s) => ({ ...s, samuelAnimState: state }));
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
