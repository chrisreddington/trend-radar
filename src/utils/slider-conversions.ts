import { Likelihood, Relevance, Preparedness } from "../types";

/** Slider range boundaries for likelihood mapping. */
const LIKELIHOOD_HIGH_THRESHOLD = 80;
const LIKELIHOOD_LIKELY_THRESHOLD = 60;
const LIKELIHOOD_AVERAGE_THRESHOLD = 40;
const LIKELIHOOD_UNLIKELY_THRESHOLD = 20;

/** Slider values used when serialising a Likelihood enum to a numeric range. */
const LIKELIHOOD_VALUE_HIGHLY_LIKELY = 100;
const LIKELIHOOD_VALUE_LIKELY = 75;
const LIKELIHOOD_VALUE_AVERAGE = 50;
const LIKELIHOOD_VALUE_UNLIKELY = 25;
const LIKELIHOOD_VALUE_HIGHLY_UNLIKELY = 0;

/** Slider range boundaries for relevance mapping. */
const RELEVANCE_HIGH_THRESHOLD = 66;
const RELEVANCE_MODERATE_THRESHOLD = 33;

/** Slider values used when serialising a Relevance enum to a numeric range. */
const RELEVANCE_VALUE_HIGH = 100;
const RELEVANCE_VALUE_MODERATE = 50;
const RELEVANCE_VALUE_LOW = 0;

/** Slider range boundaries for preparedness mapping. */
const PREPAREDNESS_HIGH_THRESHOLD = 66;
const PREPAREDNESS_MODERATE_THRESHOLD = 33;

/** Slider values used when serialising a Preparedness enum to a numeric range. */
const PREPAREDNESS_VALUE_HIGHLY_PREPARED = 100;
const PREPAREDNESS_VALUE_MODERATELY_PREPARED = 50;
const PREPAREDNESS_VALUE_INADEQUATELY_PREPARED = 0;

/**
 * Maps a 0–100 slider value to the corresponding {@link Likelihood} enum member.
 * @param value - Numeric slider value in the range [0, 100].
 * @returns The matching Likelihood enum value.
 */
export function getLikelihoodFromValue(value: number): Likelihood {
  if (value >= LIKELIHOOD_HIGH_THRESHOLD) return Likelihood.HighlyLikely;
  if (value >= LIKELIHOOD_LIKELY_THRESHOLD) return Likelihood.Likely;
  if (value >= LIKELIHOOD_AVERAGE_THRESHOLD) return Likelihood.Average;
  if (value >= LIKELIHOOD_UNLIKELY_THRESHOLD) return Likelihood.Unlikely;
  return Likelihood.HighlyUnlikely;
}

/**
 * Maps a {@link Likelihood} enum member to its representative 0–100 slider value.
 * @param likelihood - The Likelihood enum value to convert.
 * @returns A numeric slider value in the range [0, 100].
 */
export function getValueFromLikelihood(likelihood: Likelihood): number {
  switch (likelihood) {
    case Likelihood.HighlyLikely: {
      return LIKELIHOOD_VALUE_HIGHLY_LIKELY;
    }
    case Likelihood.Likely: {
      return LIKELIHOOD_VALUE_LIKELY;
    }
    case Likelihood.Average: {
      return LIKELIHOOD_VALUE_AVERAGE;
    }
    case Likelihood.Unlikely: {
      return LIKELIHOOD_VALUE_UNLIKELY;
    }
    case Likelihood.HighlyUnlikely: {
      return LIKELIHOOD_VALUE_HIGHLY_UNLIKELY;
    }
  }

  throw new Error(`Invalid Likelihood value: ${String(likelihood)}`);
}

/**
 * Maps a 0–100 slider value to the corresponding {@link Relevance} enum member.
 * @param value - Numeric slider value in the range [0, 100].
 * @returns The matching Relevance enum value.
 */
export function getRelevanceFromValue(value: number): Relevance {
  if (value >= RELEVANCE_HIGH_THRESHOLD) return Relevance.High;
  if (value >= RELEVANCE_MODERATE_THRESHOLD) return Relevance.Moderate;
  return Relevance.Low;
}

/**
 * Maps a {@link Relevance} enum member to its representative 0–100 slider value.
 * @param relevance - The Relevance enum value to convert.
 * @returns A numeric slider value in the range [0, 100].
 */
export function getValueFromRelevance(relevance: Relevance): number {
  switch (relevance) {
    case Relevance.High: {
      return RELEVANCE_VALUE_HIGH;
    }
    case Relevance.Moderate: {
      return RELEVANCE_VALUE_MODERATE;
    }
    case Relevance.Low: {
      return RELEVANCE_VALUE_LOW;
    }
  }

  throw new Error(`Invalid Relevance value: ${String(relevance)}`);
}

/**
 * Maps a 0–100 slider value to the corresponding {@link Preparedness} enum member.
 * @param value - Numeric slider value in the range [0, 100].
 * @returns The matching Preparedness enum value.
 */
export function getPreparednessFromValue(value: number): Preparedness {
  if (value >= PREPAREDNESS_HIGH_THRESHOLD) return Preparedness.HighlyPrepared;
  if (value >= PREPAREDNESS_MODERATE_THRESHOLD)
    return Preparedness.ModeratelyPrepared;
  return Preparedness.InadequatelyPrepared;
}

/**
 * Maps a {@link Preparedness} enum member to its representative 0–100 slider value.
 * @param preparedness - The Preparedness enum value to convert.
 * @returns A numeric slider value in the range [0, 100].
 */
export function getValueFromPreparedness(preparedness: Preparedness): number {
  switch (preparedness) {
    case Preparedness.HighlyPrepared: {
      return PREPAREDNESS_VALUE_HIGHLY_PREPARED;
    }
    case Preparedness.ModeratelyPrepared: {
      return PREPAREDNESS_VALUE_MODERATELY_PREPARED;
    }
    case Preparedness.InadequatelyPrepared: {
      return PREPAREDNESS_VALUE_INADEQUATELY_PREPARED;
    }
  }

  throw new Error(`Invalid Preparedness value: ${String(preparedness)}`);
}
