// lib/themes.ts
export const themes = [
  "Song you'd play after scoring the winning goal",
  "Song for walking out of a job interview",
  "Song when your food order finally arrives",
  "Song for the last 10 seconds of a countdown",
  "Song to walk into a room like you own it",
  "Song for opening a package you've been waiting for",
  "Song when your ex texts you first",
  "Song for parallel parking on the first try",
  "Song when you wake up before your alarm",
  "Song for finishing an exam early",
  "Song when your team wins on the last second",
  "Song for the moment the plane lands",
  "Song for jumping into cold water",
  "Song for leaving work on a Friday",
  "Song for getting the window seat",
  "Song when you find money in old jeans",
  "Song for finally replying to a long text",
  "Song for the first bite of your favorite meal",
  "Song when you beat a final boss",
  "Song for catching a flight you almost missed",
  "Song for turning off your alarm and going back to sleep",
  "Song for the moment the Wi-Fi finally connects",
  "Song when someone cancels plans you didn't want",
  "Song for walking home after a great night out",
  "Song for stepping outside on the first warm day of the year",
  "Song for finishing a 1000-piece puzzle",
  "Song when your code finally runs without errors",
  "Song for getting a text back instantly",
  "Song for the first coffee of the day",
  "Song for realizing it's a bank holiday tomorrow",
  "Song for a road trip with no destination",
  "Song when you're the last one standing in a game",
  "Song for crossing something off your to-do list",
  "Song for sneaking snacks into a movie theater",
  "Song when your crush laughs at your joke",
  "Song for arriving exactly on time, not a second late",
  "Song for the last day before a vacation",
  "Song for telling your boss no for the first time",
  "Song when your team scores and you predicted it",
  "Song for finally finishing a show you binged too fast",
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
