import { seedColors } from './colors.seed';

export async function runSeeds(): Promise<void> {
  try {
    await seedColors();
    } catch (error) {
    strapi.log.error('Failed to run seeds:', error);
  }
}
