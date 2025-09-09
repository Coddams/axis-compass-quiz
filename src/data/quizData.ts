// Axis Quiz Data - Placeholder JSON for questions and political figures

export interface QuizQuestion {
  id: number;
  text: string;
  answers: {
    text: string;
    economic: number; // -5 to 5 (left to right)
    social: number;   // -5 to 5 (authoritarian to libertarian)
  }[];
}

export interface PoliticalFigure {
  id: string;
  name: string;
  description: string;
  economic: number;
  social: number;
  image: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    text: "What is your view on economic regulation?",
    answers: [
      { text: "The market should be heavily regulated to prevent exploitation", economic: -3, social: 0 },
      { text: "Some regulation is necessary, but markets should remain mostly free", economic: 1, social: 0 },
      { text: "Minimal regulation - let the market decide", economic: 4, social: 0 },
      { text: "Complete deregulation - no government interference", economic: 5, social: 2 }
    ]
  },
  {
    id: 2,
    text: "How should society handle personal freedoms?",
    answers: [
      { text: "Strong government oversight is needed to maintain order", economic: 0, social: -3 },
      { text: "Some restrictions are necessary for public safety", economic: 0, social: -1 },
      { text: "Personal freedoms should be maximized with minimal restrictions", economic: 0, social: 3 },
      { text: "Absolute personal freedom - no government interference", economic: 0, social: 5 }
    ]
  },
  {
    id: 3,
    text: "What's your stance on healthcare?",
    answers: [
      { text: "Universal healthcare provided by the government", economic: -4, social: 1 },
      { text: "Public-private healthcare system with government support", economic: -1, social: 0 },
      { text: "Mostly private with minimal government involvement", economic: 2, social: 0 },
      { text: "Completely privatized healthcare system", economic: 4, social: 1 }
    ]
  },
  {
    id: 4,
    text: "How should education be handled?",
    answers: [
      { text: "Free public education funded entirely by government", economic: -3, social: -1 },
      { text: "Mixed public and private options with government support", economic: 0, social: 0 },
      { text: "School choice with vouchers and competition", economic: 2, social: 1 },
      { text: "Completely privatized education system", economic: 4, social: 2 }
    ]
  },
  {
    id: 5,
    text: "What's your view on law enforcement?",
    answers: [
      { text: "Strong police presence is essential for societal order", economic: 1, social: -3 },
      { text: "Police reform is needed, but law enforcement remains important", economic: -1, social: -1 },
      { text: "Significant reduction in police power and funding", economic: -2, social: 2 },
      { text: "Abolish traditional policing in favor of community solutions", economic: -3, social: 4 }
    ]
  },
  {
    id: 6,
    text: "How should taxes be structured?",
    answers: [
      { text: "High progressive taxes to fund extensive social programs", economic: -4, social: 0 },
      { text: "Moderate taxes with targeted social spending", economic: -1, social: 0 },
      { text: "Low taxes with minimal government spending", economic: 3, social: 1 },
      { text: "Minimal to no taxes - voluntary funding only", economic: 5, social: 3 }
    ]
  },
  {
    id: 7,
    text: "What's your stance on drug policy?",
    answers: [
      { text: "Strict prohibition with harsh penalties", economic: 0, social: -4 },
      { text: "Decriminalization with treatment programs", economic: -1, social: 1 },
      { text: "Legalization with government regulation", economic: 0, social: 3 },
      { text: "Complete legalization without government interference", economic: 2, social: 5 }
    ]
  },
  {
    id: 8,
    text: "How should immigration be handled?",
    answers: [
      { text: "Strict border control with limited immigration", economic: 1, social: -3 },
      { text: "Controlled immigration with clear pathways to citizenship", economic: 0, social: 0 },
      { text: "Open borders with minimal restrictions", economic: -1, social: 3 },
      { text: "Complete freedom of movement across borders", economic: 0, social: 5 }
    ]
  }
];

export const politicalFigures: PoliticalFigure[] = [
  {
    id: "gandhi",
    name: "Mahatma Gandhi",
    description: "Non-violent resistance advocate",
    economic: -3,
    social: 4,
    image: "/api/placeholder/80/80"
  },
  {
    id: "reagan",
    name: "Ronald Reagan",
    description: "Conservative economic policies",
    economic: 4,
    social: -1,
    image: "/api/placeholder/80/80"
  },
  {
    id: "mandela",
    name: "Nelson Mandela",
    description: "Social justice and equality champion",
    economic: -2,
    social: 3,
    image: "/api/placeholder/80/80"
  },
  {
    id: "thatcher",
    name: "Margaret Thatcher",
    description: "Free market capitalism advocate",
    economic: 5,
    social: -2,
    image: "/api/placeholder/80/80"
  },
  {
    id: "stalin",
    name: "Joseph Stalin",
    description: "Authoritarian communist leader",
    economic: -5,
    social: -5,
    image: "/api/placeholder/80/80"
  },
  {
    id: "friedman",
    name: "Milton Friedman",
    description: "Libertarian economist",
    economic: 4,
    social: 2,
    image: "/api/placeholder/80/80"
  },
  {
    id: "chomsky",
    name: "Noam Chomsky",
    description: "Libertarian socialist thinker",
    economic: -4,
    social: 4,
    image: "/api/placeholder/80/80"
  },
  {
    id: "pinochet",
    name: "Augusto Pinochet",
    description: "Authoritarian capitalist dictator",
    economic: 4,
    social: -5,
    image: "/api/placeholder/80/80"
  }
];

export interface QuizResult {
  economic: number;
  social: number;
  topMatches: {
    figure: PoliticalFigure;
    similarity: number;
  }[];
}

export function calculateResult(answers: { economic: number; social: number }[]): QuizResult {
  // Calculate average scores
  const economic = answers.reduce((sum, answer) => sum + answer.economic, 0) / answers.length;
  const social = answers.reduce((sum, answer) => sum + answer.social, 0) / answers.length;

  // Calculate similarity to political figures
  const similarities = politicalFigures.map(figure => {
    const distance = Math.sqrt(
      Math.pow(figure.economic - economic, 2) + 
      Math.pow(figure.social - social, 2)
    );
    return {
      figure,
      similarity: Math.max(0, 100 - (distance * 10)) // Convert distance to similarity percentage
    };
  });

  // Sort by similarity and take top 3
  const topMatches = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  return {
    economic: Math.round(economic * 10) / 10,
    social: Math.round(social * 10) / 10,
    topMatches
  };
}