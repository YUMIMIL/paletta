import { Timestamp } from "firebase/firestore";

export interface DesignAnalysis {
  color_palette: string[];
  color_mood: string;
  layout_pattern: string;
  typography: string;
  whitespace: "tight" | "balanced" | "airy";
  target_audience: string;
  industry: string;
}

export interface PalettaVerdict {
  score: 1 | 2 | 3 | 4 | 5;
  good_points: string[];
  weak_points: string[];
  why_it_works: string;
  tags: string[];
}

export interface DesignLearning {
  id: string;
  type: "url_analysis" | "lp_feedback";
  url?: string;
  fetched_at?: Timestamp;
  design_analysis: DesignAnalysis;
  paletta_verdict: PalettaVerdict;
  generated_lp_id?: string;
  feedback_label?: "good" | "ok" | "weak";
  feedback_note?: string;
  created_at: Timestamp;
  created_by: "yumi" | "paletta";
}

export interface GeneratedLP {
  id: string;
  input: {
    style: string;
    color_variant: string;
    industry: string;
    shop_name: string;
    purpose: string;
  };
  patterns: {
    pattern_id: string;
    html: string;
    layout_description: string;
  }[];
  feedback?: {
    label: "good" | "ok" | "weak";
    note: string;
    learning_id: string;
  };
  created_at: Timestamp;
}
