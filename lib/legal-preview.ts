import 'server-only';
export const legalPreview = process.env.LEGAL_DRAFT_PREVIEW === 'true' && !process.env.VERCEL;
