// src/data/quizData.ts
// NOTE: ensure tsconfig.json has "resolveJsonModule": true and "esModuleInterop": true
import questionsRaw from "../config/questions.json";
import figuresRaw from "../config/figures.json";
import ideologiesRaw from "../config/ideologies.json";
import axesRaw from "../config/axes.json";

/**
 * Canonical exports (3-axis, -2..2) for future-proofing / admin editors
 * This is now the **only** format consumed by the UI.
 */
export type CanonQuestion = {
  id: string;
  text: string;
  answers: {
    id: string;
    text: string;
    vector: [number, number, number]; // econ, social, foreign in -2..2
    implications?: { pros?: string[]; cons?: string[] };
  }[];
};

export type CanonFigure = {
  id: string;
  name: string;
  era?: string;
  country?: string;
  quote?: string;
  axis_alignment: { economic: number; social: number; foreign: number }; // -2..2
  explain?: string;
  uncertainty?: number;
};

// Canonical data, exported directly
export const questions = questionsRaw as CanonQuestion[];
export const figures = figuresRaw as CanonFigure[];
export const ideologies = ideologiesRaw;
export const axes = axesRaw;

/**
 * Map a canonical user vector (3-axis) to an ideology.
 * Returns the first ideology that matches, or null if none.
 */
export function findIdeologyForVector(userVector: {
  economic: number;
  social: number;
  foreign: number;
}) {
  for (const ide of ideologiesRaw as any[]) {
    const re = ide.range;
    const econOk =
      userVector.economic >= re.economic[0] &&
      userVector.economic <= re.economic[1];
    const socOk =
      userVector.social >= re.social[0] &&
      userVector.social <= re.social[1];
    const forOk =
      userVector.foreign >= re.foreign[0] &&
      userVector.foreign <= re.foreign[1];

    if (econOk && socOk && forOk) {
      return ide;
    }
  }
  return null;
}


// Result type
export type QuizResult = {
  economic: number;
  social: number;
  foreign: number;
  ideology: any | null;
  topMatches: {
    figure: CanonFigure;
    similarity: number;
  }[];
};

/**
 * Calculate a user's result based on their answers
 */
export function calculateResult(
  answers: { economic: number; social: number; foreign: number }[]
): QuizResult {
  let econ = 0, soc = 0, forn = 0;
  let count = 0;

  // Loop through the stored vectors directly
  for (const a of answers) {
    econ += a.economic;
    soc += a.social;
    forn += a.foreign;
    count++;
  }

  // Average them
  if (count > 0) {
    econ /= count;
    soc /= count;
    forn /= count;
  }

  // Match ideology
  const ideology = findIdeologyForVector({
    economic: econ,
    social: soc,
    foreign: forn,
  });

  // Match top 3 figures by Euclidean similarity
  const topMatches = figures
    .map((f) => {
      const dx = econ - f.axis_alignment.economic;
      const dy = soc - f.axis_alignment.social;
      const dz = forn - f.axis_alignment.foreign;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const maxDistance = Math.sqrt(3 * 4); // worst case (-2 to +2 per axis)
      const similarity = Math.max(0, 100 * (1 - distance / maxDistance));
      return { figure: f, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  return {
    economic: econ,
    social: soc,
    foreign: forn,
    ideology,
    topMatches,
  };
}
