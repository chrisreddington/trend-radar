export enum Category {
  Technological = 'Technological',
  Economic = 'Economic',
  Political = 'Political',
  Social = 'Social'
}

export enum Likelihood {
  HighlyLikely = 'Highly Likely',
  Likely = 'Likely',
  Average = 'Average',
  Unlikely = 'Unlikely',
  HighlyUnlikely = 'Highly Unlikely'
}

export enum Relevance {
  High = 'High',
  Moderate = 'Moderate',
  Low = 'Low'
}

export enum Preparedness {
  HighlyPrepared = 'Highly Prepared',
  ModeratelyPrepared = 'Moderately Prepared',
  InadequatelyPrepared = 'Inadequately Prepared'
}

export interface Point {
  id: string;
  label: string;
  category: Category;
  likelihood: Likelihood;
  relevance: Relevance;
  preparedness: Preparedness;
  x: number;
  y: number;
}

export interface DiagramState {
  points: Point[];
  selectedPoint: string | null;
}