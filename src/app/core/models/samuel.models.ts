/* ═══════════════════════════════════════════════════════════
   Samuel AI — Core TypeScript Models
   All types used across the Samuel diagnostic experience
   ═══════════════════════════════════════════════════════════ */

// ─── Conversation ────────────────────────────────────────────

export type MessageSender = 'samuel' | 'user';
export type SamuelAnimState = 'idle' | 'greeting' | 'thinking' | 'explaining' | 'recommending';

export interface ConversationMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  /** If samuel message, optional quick-replies to show after */
  quickReplies?: QuickReplyOption[];
  /** Whether this is a structured card message (recommendation) */
  isCard?: boolean;
}

export interface QuickReplyOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

// ─── Diagnosis State ─────────────────────────────────────────

export type DiagnosisStep =
  | 'intro'
  | 'business-type'
  | 'main-problem'
  | 'repetitive-tasks'
  | 'goal'
  | 'scope'
  | 'budget'
  | 'urgency'
  | 'contact'
  | 'result';

export interface DiagnosticAnswers {
  businessType?: string;
  mainProblem?: string;
  repetitiveTasks?: string;
  goal?: string;
  scope?: string;
  budget?: string;
  urgency?: string;
  // Contact info (collected at the end)
  contactName?: string;
  businessName?: string;
  whatsapp?: string;
  email?: string;
}

export interface DiagnosticState {
  currentStep: DiagnosisStep;
  stepIndex: number;           // 0-based, for progress bar
  totalSteps: number;
  answers: DiagnosticAnswers;
  messages: ConversationMessage[];
  samuelAnimState: SamuelAnimState;
  isThinking: boolean;
  isOpen: boolean;
  showResult: boolean;
}

// ─── Catalog / Recommendations ───────────────────────────────

export type SolutionId =
  | 'landing'
  | 'catalog'
  | 'ecommerce'
  | 'ai-pro'
  | 'enterprise';

export interface SolutionFeature {
  label: string;
  included: boolean;
}

export interface SolutionPlan {
  id: SolutionId;
  name: string;
  tagline: string;
  description: string;
  problem: string;          // problem it solves (1 line)
  features: string[];
  price: string;            // display price e.g. "$990 USD"
  priceNote?: string;       // e.g. "pago único · entrega en 2 semanas"
  ctaPrimary: string;
  ctaSecondary?: string;
  highlight?: boolean;
  demoType: DemoType;
}

// ─── Recommendation Engine ───────────────────────────────────

export interface RecommendationResult {
  primary: SolutionPlan;
  alternatives: SolutionPlan[];
  reasoning: string;        // personalized explanation
  problemSummary: string;   // what Samuel detected
  goalSummary: string;      // what the client wants
}

// ─── Demo Previews ───────────────────────────────────────────

export type DemoType =
  | 'boutique'
  | 'restaurant'
  | 'barbershop'
  | 'ecommerce'
  | 'dashboard'
  | 'landing';

// ─── Lead / Contact ──────────────────────────────────────────

export interface BusinessLead {
  businessName: string;
  contactName: string;
  whatsapp: string;
  email?: string;
  businessType: string;
  mainProblem: string;
  repetitiveTasks: string;
  goal: string;
  budget: string;
  urgency: string;
  recommendedSolution: string;
  timestamp: Date;
}
