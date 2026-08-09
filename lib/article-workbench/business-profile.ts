import {
  BusinessProfileSchema,
  type BusinessProfile,
  type BusinessProfilePort,
} from "./contracts";

export function resolveSavedBusinessProfile(savedProfile: unknown): BusinessProfile {
  return BusinessProfileSchema.parse(savedProfile);
}

export function createBusinessProfilePort(savedProfile: unknown): BusinessProfilePort {
  const profile = resolveSavedBusinessProfile(savedProfile);

  return {
    async getProfile() {
      return BusinessProfileSchema.parse(profile);
    },
  };
}
