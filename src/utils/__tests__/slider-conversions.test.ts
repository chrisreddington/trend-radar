import { describe, it, expect } from "vitest";
import { Likelihood, Relevance, Preparedness } from "../../types";
import {
  getLikelihoodFromValue,
  getValueFromLikelihood,
  getRelevanceFromValue,
  getValueFromRelevance,
  getPreparednessFromValue,
  getValueFromPreparedness,
} from "../slider-conversions";

describe("slider-conversions", () => {
  describe("getLikelihoodFromValue", () => {
    it("returns HighlyLikely for values >= 80", () => {
      expect(getLikelihoodFromValue(80)).toBe(Likelihood.HighlyLikely);
      expect(getLikelihoodFromValue(100)).toBe(Likelihood.HighlyLikely);
      expect(getLikelihoodFromValue(95)).toBe(Likelihood.HighlyLikely);
    });

    it("returns Likely for values in [60, 79]", () => {
      expect(getLikelihoodFromValue(60)).toBe(Likelihood.Likely);
      expect(getLikelihoodFromValue(75)).toBe(Likelihood.Likely);
      expect(getLikelihoodFromValue(79)).toBe(Likelihood.Likely);
    });

    it("returns Average for values in [40, 59]", () => {
      expect(getLikelihoodFromValue(40)).toBe(Likelihood.Average);
      expect(getLikelihoodFromValue(50)).toBe(Likelihood.Average);
      expect(getLikelihoodFromValue(59)).toBe(Likelihood.Average);
    });

    it("returns Unlikely for values in [20, 39]", () => {
      expect(getLikelihoodFromValue(20)).toBe(Likelihood.Unlikely);
      expect(getLikelihoodFromValue(25)).toBe(Likelihood.Unlikely);
      expect(getLikelihoodFromValue(39)).toBe(Likelihood.Unlikely);
    });

    it("returns HighlyUnlikely for values < 20", () => {
      expect(getLikelihoodFromValue(0)).toBe(Likelihood.HighlyUnlikely);
      expect(getLikelihoodFromValue(10)).toBe(Likelihood.HighlyUnlikely);
      expect(getLikelihoodFromValue(19)).toBe(Likelihood.HighlyUnlikely);
    });
  });

  describe("getValueFromLikelihood", () => {
    it("returns 100 for HighlyLikely", () => {
      expect(getValueFromLikelihood(Likelihood.HighlyLikely)).toBe(100);
    });

    it("returns 75 for Likely", () => {
      expect(getValueFromLikelihood(Likelihood.Likely)).toBe(75);
    });

    it("returns 50 for Average", () => {
      expect(getValueFromLikelihood(Likelihood.Average)).toBe(50);
    });

    it("returns 25 for Unlikely", () => {
      expect(getValueFromLikelihood(Likelihood.Unlikely)).toBe(25);
    });

    it("returns 0 for HighlyUnlikely", () => {
      expect(getValueFromLikelihood(Likelihood.HighlyUnlikely)).toBe(0);
    });

    it("round-trips correctly for all Likelihood values", () => {
      for (const likelihood of Object.values(Likelihood)) {
        expect(getLikelihoodFromValue(getValueFromLikelihood(likelihood))).toBe(
          likelihood,
        );
      }
    });

    it("throws for an invalid Likelihood value", () => {
      expect(() => getValueFromLikelihood("invalid" as unknown as Likelihood)).toThrow(
        "Invalid Likelihood value: invalid",
      );
    });
  });

  describe("getRelevanceFromValue", () => {
    it("returns High for values >= 66", () => {
      expect(getRelevanceFromValue(66)).toBe(Relevance.High);
      expect(getRelevanceFromValue(100)).toBe(Relevance.High);
    });

    it("returns Moderate for values in [33, 65]", () => {
      expect(getRelevanceFromValue(33)).toBe(Relevance.Moderate);
      expect(getRelevanceFromValue(50)).toBe(Relevance.Moderate);
      expect(getRelevanceFromValue(65)).toBe(Relevance.Moderate);
    });

    it("returns Low for values < 33", () => {
      expect(getRelevanceFromValue(0)).toBe(Relevance.Low);
      expect(getRelevanceFromValue(32)).toBe(Relevance.Low);
    });
  });

  describe("getValueFromRelevance", () => {
    it("returns 100 for High", () => {
      expect(getValueFromRelevance(Relevance.High)).toBe(100);
    });

    it("returns 50 for Moderate", () => {
      expect(getValueFromRelevance(Relevance.Moderate)).toBe(50);
    });

    it("returns 0 for Low", () => {
      expect(getValueFromRelevance(Relevance.Low)).toBe(0);
    });

    it("round-trips correctly for all Relevance values", () => {
      for (const relevance of Object.values(Relevance)) {
        expect(getRelevanceFromValue(getValueFromRelevance(relevance))).toBe(
          relevance,
        );
      }
    });

    it("throws for an invalid Relevance value", () => {
      expect(() => getValueFromRelevance("invalid" as unknown as Relevance)).toThrow(
        "Invalid Relevance value: invalid",
      );
    });
  });

  describe("getPreparednessFromValue", () => {
    it("returns HighlyPrepared for values >= 66", () => {
      expect(getPreparednessFromValue(66)).toBe(Preparedness.HighlyPrepared);
      expect(getPreparednessFromValue(100)).toBe(Preparedness.HighlyPrepared);
    });

    it("returns ModeratelyPrepared for values in [33, 65]", () => {
      expect(getPreparednessFromValue(33)).toBe(
        Preparedness.ModeratelyPrepared,
      );
      expect(getPreparednessFromValue(50)).toBe(
        Preparedness.ModeratelyPrepared,
      );
      expect(getPreparednessFromValue(65)).toBe(
        Preparedness.ModeratelyPrepared,
      );
    });

    it("returns InadequatelyPrepared for values < 33", () => {
      expect(getPreparednessFromValue(0)).toBe(
        Preparedness.InadequatelyPrepared,
      );
      expect(getPreparednessFromValue(32)).toBe(
        Preparedness.InadequatelyPrepared,
      );
    });
  });

  describe("getValueFromPreparedness", () => {
    it("returns 100 for HighlyPrepared", () => {
      expect(getValueFromPreparedness(Preparedness.HighlyPrepared)).toBe(100);
    });

    it("returns 50 for ModeratelyPrepared", () => {
      expect(getValueFromPreparedness(Preparedness.ModeratelyPrepared)).toBe(
        50,
      );
    });

    it("returns 0 for InadequatelyPrepared", () => {
      expect(
        getValueFromPreparedness(Preparedness.InadequatelyPrepared),
      ).toBe(0);
    });

    it("round-trips correctly for all Preparedness values", () => {
      for (const preparedness of Object.values(Preparedness)) {
        expect(
          getPreparednessFromValue(getValueFromPreparedness(preparedness)),
        ).toBe(preparedness);
      }
    });

    it("throws for an invalid Preparedness value", () => {
      expect(() =>
        getValueFromPreparedness("invalid" as unknown as Preparedness),
      ).toThrow("Invalid Preparedness value: invalid");
    });
  });
});
