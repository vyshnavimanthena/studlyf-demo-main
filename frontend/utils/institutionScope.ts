/**
 * Production institution scope: never substitute user_id or placeholder IDs for institution APIs.
 */
export function institutionIdFromUser(user: { institution_id?: string } | null | undefined): string {
    const id = user?.institution_id?.trim();
    return id || '';
}

export function hasInstitutionScope(user: { institution_id?: string } | null | undefined): boolean {
    return Boolean(institutionIdFromUser(user));
}
