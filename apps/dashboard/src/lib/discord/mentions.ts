export function escapeDiscordMentions(text: string): string {
  return text.replaceAll("@", "＠");
}
