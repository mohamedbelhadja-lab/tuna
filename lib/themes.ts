// lib/themes.ts
export const themes = [
  "Favourite song in a language you don't speak",
  "Best song to cook pasta",
  "Song to wake up to",
  "Song that makes you dance",
  "Best sad song",
  "Song for a road trip",
  "Song that reminds you of childhood",
  "Song for rainy days",
  "Song for summer nights",
  "Best song to study to",
  "Song that makes you smile",
  "Song that gives you chills",
  "Song that motivates you",
  "Song to relax",
  "Song for cooking",
  "Song that reminds you of someone",
  "Song to cry to",
  "Song to sing in the shower",
  "Song to exercise to",
  "Song that tells a story",
  "Song with your favorite instrument",
  "Song for a party",
  "Song that feels epic",
  "Song that is underrated",
  "Song that reminds you of nature"
];

export function getThemeOfTheDay(): string {
  const startDate = new Date("2026-01-01"); // pick a reference start date
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = diffDays % themes.length;
  return themes[index];
}
