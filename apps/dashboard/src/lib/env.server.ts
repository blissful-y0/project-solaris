import { parsePublicEnv } from "./env.shared";

export const envServer = parsePublicEnv(process.env);
