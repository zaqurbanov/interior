// Draft previews: /api/preview/<token> turns on Next's draft mode and stores the
// token in this cookie; the project page then also shows the unpublished or
// scheduled project whose previewToken matches.
export const PREVIEW_COOKIE = "vf-preview";

export const previewPath = (token: string) => `/api/preview/${token}`;
