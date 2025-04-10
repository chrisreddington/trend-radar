/**
 * Categories for strategic points
 */
export enum Category {
  Technological = "Technological",
  Economic = "Economic",
  Political = "Political",
  Social = "Social",
}

/**
 * Likelihood levels for strategic points
 */
export enum Likelihood {
  HighlyLikely = "Highly Likely",
  Likely = "Likely",
  Average = "Average",
  Unlikely = "Unlikely",
  HighlyUnlikely = "Highly Unlikely",
}

/**
 * Relevance levels for strategic points
 */
export enum Relevance {
  High = "High",
  Moderate = "Moderate",
  Low = "Low",
}

/**
 * Preparedness levels for strategic points
 */
export enum Preparedness {
  HighlyPrepared = "Highly Prepared",
  ModeratelyPrepared = "Moderately Prepared",
  InadequatelyPrepared = "Inadequately Prepared",
}

/**
 * Represents a strategic point on the diagram
 */
export interface Point {
  /** Unique identifier for the point */
  id: string;
  /** Label/name of the point */
  label: string;
  /** Category the point belongs to */
  category: Category;
  /** Likelihood of the point occurring */
  likelihood: Likelihood;
  /** Relevance/impact of the point */
  relevance: Relevance;
  /** Organization's preparedness for the point */
  preparedness: Preparedness;
  /** X coordinate on the diagram */
  x: number;
  /** Y coordinate on the diagram */
  y: number;
}

/**
 * State shape for the diagram store
 */
export interface DiagramState {
  /** Array of points on the diagram */
  points: Point[];
  /** ID of the currently selected point, if any */
  selectedPoint: string | null;
}
