/**
 * Register password rules.
 * Keep in sync with `backend/src/validations/custom.validation.ts` (`isPassword`).
 */

/** Punctuation or symbol (not letters/digits/whitespace) — avoids counting `é` etc. as a “symbol”. */
const PASSWORD_SYMBOL_RE = /[\p{P}\p{S}]/u;

export function passwordHasSymbol(password: string): boolean {
  return PASSWORD_SYMBOL_RE.test(password);
}

export function passwordRegisterRequirements(password: string) {
  return {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    num: /[0-9]/.test(password),
    sym: passwordHasSymbol(password),
  };
}
