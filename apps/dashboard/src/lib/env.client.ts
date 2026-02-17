import { parsePublicEnv } from "./env.shared";

export const envClient = parsePublicEnv(process.env);
