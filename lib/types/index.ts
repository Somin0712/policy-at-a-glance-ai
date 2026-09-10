export type ExplanationLevel = "quick" | "easy" | "detailed";

export type Policy = {
  id: string;
  title: string;
  category: string;
  agency: string;
  shortDescription: string;
  officialUrl?: string;
  sourceFileName?: string;
  lastVerifiedAt?: string;
  fileSearchStoreId?: string;
  purpose?: string;
  eligibility?: string[];
  benefits?: string[];
  applicationPeriod?: string;
  applicationMethod?: string[];
  requiredDocuments?: string[];
  warnings?: string[];
};

export type Citation = {
  id: number;
  fileName?: string;
  section?: string;
  evidence?: string;
  source?: string;
};

export type GeneratedArticle = {
  title: string;
  subtitle?: string;
  introduction?: string;
  whatIsThis?: string;
  whoCanApply?: string;
  benefits?: string;
  whenToApply?: string;
  howToApply?: string;
  requiredDocuments?: string;
  importantNotes?: string;
  summary?: string[];
  citations?: Citation[];
};
