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
  controversial?: boolean; // optional safeguard
};

export type CanonIdeology = {
  id: string;
  name: string;
  range: {
    economic: number[]; // looser typing
    social: number[];
    foreign: number[];
  };
  description: string;
};


// Canonical data, exported directly
export const questions = questionsRaw as CanonQuestion[];
export const figures = figuresRaw as CanonFigure[];
export const ideologies = ideologiesRaw as CanonIdeology[];
export const axes = axesRaw;

/**
 * Find closest ideology by centroid scoring
 */
export function findIdeologyForVector(userVector: {
  economic: number;
  social: number;
  foreign: number;
}): CanonIdeology | null {
  if (!ideologies.length) return null;

  const scored = ideologies.map((ide) => {
    const centroid = {
      economic: (ide.range.economic[0] + ide.range.economic[1]) / 2,
      social: (ide.range.social[0] + ide.range.social[1]) / 2,
      foreign: (ide.range.foreign[0] + ide.range.foreign[1]) / 2,
    };
    const dx = userVector.economic - centroid.economic;
    const dy = userVector.social - centroid.social;
    const dz = userVector.foreign - centroid.foreign;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return { ideology: ide, distance };
  });

  // Pick the closest ideology
  return scored.sort((a, b) => a.distance - b.distance)[0].ideology;
}

// Result type
export type QuizResult = {
  economic: number;
  social: number;
  foreign: number;
  ideology: CanonIdeology | null;
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
  let econ = 0,
    soc = 0,
    forn = 0;

  const total = answers.length;

  // If we have a clean 3-axis split (e.g. 15 answers => 5 per axis), compute per-axis averages
  if (total > 0 && total % 3 === 0) {
    const perAxis = total / 3;

    // economic: use only the first block, average the economic components
    let econSum = 0;
    for (let i = 0; i < perAxis; i++) {
      econSum += answers[i].economic;
    }
    econ = econSum / perAxis;

    // social: use only the second block, average the social components
    let socSum = 0;
    for (let i = perAxis; i < perAxis * 2; i++) {
      socSum += answers[i].social;
    }
    soc = socSum / perAxis;

    // foreign/political: use only the third block, average the foreign components
    let fornSum = 0;
    for (let i = perAxis * 2; i < perAxis * 3; i++) {
      fornSum += answers[i].foreign;
    }
    forn = fornSum / perAxis;
  } else {
    // Legacy fallback: average across all answers for each axis
    let econSum = 0,
      socSum = 0,
      fornSum = 0;
    let count = 0;

    for (const a of answers) {
      econSum += a.economic;
      socSum += a.social;
      fornSum += a.foreign;
      count++;
    }

    if (count > 0) {
      econ = econSum / count;
      soc = socSum / count;
      forn = fornSum / count;
    }
  }

  // Match ideology (scored by closest centroid)
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
      const maxDistance = 4 * Math.sqrt(3);
      const similarity = Math.max(0, 100 * (1 - distance / maxDistance));

      // optional weighting by uncertainty
      let weightedSimilarity = similarity;

      return { figure: f, similarity: weightedSimilarity };
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