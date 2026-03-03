// lib/themes.ts
export const themes = [
  // 🎭 Situational / Hyper-specific
  "Song to play while dramatically staring out a car window",
  "Song that hits different at 2am",
  "Song you blast when nobody's home",
  "Song to pretend you're in a movie trailer",
  "Song you skip every time but never delete",
  "Song for when you're late but walking slowly anyway",
  "Song to listen to right before something big",
  "Song to clean your room aggressively to",
  "Song that makes a 10-minute walk feel like 2 minutes",
  "Song you'd put on at a party to test people",
  "Song to eat instant noodles alone to at midnight",
  "Song for sending passive-aggressive 'I'm fine' texts",
  "Song to feel like a main character on public transport",

  // 🎸 Musical nerdy
  "Song where the bass line is criminally underrated",
  "Song that was ruined by a TV ad",
  "Song that only has one truly perfect moment",
  "Song you didn't like at first but now can't stop playing",
  "Song from a genre you thought you hated",
  "Song that sounds sad but has weirdly upbeat lyrics",
  "Song that sounds upbeat but is actually devastating",
  "Song that hits harder when you finally read the lyrics",
  "Song with a music video that makes zero sense",
  "Song you only know because of a meme",
  "Song that sounds like it was made just for you",

  // 😂 Funny / Weird
  "Song to send to someone you're arguing with, no context",
  "Song a fictional villain would unironically love",
  "Song that should not work but absolutely does",
  "Song your pet would listen to if they had taste",
  "Song that makes you feel like you have your life together (you don't)",
  "Song you'd play at your own dramatic movie ending",
  "Song that makes you want to quit your job and move abroad",
  "Song that lives rent-free in your head for no reason",
  "Song that makes you walk 30% faster",
  "Song to send to your future self",

  // 🌍 Mood / Emotional
  "Song that makes homesickness feel beautiful",
  "Song to survive a Monday morning",
  "Song for when you're proud of yourself but too shy to say it",
  "Song that feels like a warm hug",
  "Song that sounds like falling in love for the first time",
  "Song that sounds like the end of summer",
  "Song you associate with a specific smell",
  "Song that makes you feel nostalgic for a time you never lived",
  "Song that sounds like driving into a city at night",
];

export function getThemeOfTheDay(): string {
  const startDate = new Date("2026-01-01");
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = diffDays % themes.length;
  return themes[index];
}
