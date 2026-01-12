export interface DocumentState {
  originalFileName: string | null;
  isAnalyzing: boolean;
  analysisError: string | null;
}

export interface Signature {
  id: string;
  name: string;
  title: string;
  type: 'wet' | 'qr';
  label?: string;
  align?: 'left' | 'center' | 'right';
}

export interface HeaderLine {
  id: string;
  width: number;
  style: 'solid' | 'double' | 'dashed' | 'dotted';
  color: string;
  marginTop: number;
  marginBottom: number;
}

export type PageSizePreset = 'A4' | 'Letter' | 'Legal' | 'F4' | 'Custom';
export type Unit = 'mm' | 'cm' | 'in';

export interface LetterSettings {
  pageSize: PageSizePreset;
  unit: Unit;
  pageWidth: number;
  pageHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  globalFontFamily: string;
  headerFontFamily: string;
  contentFontFamily: string;
  attachmentFontFamily: string;
  fontSize: number;
  showKop: boolean;
  headerContent: string;
  headerLines: HeaderLine[];
  logoUrl: string;
  logoAspectRatio: string;
  rawHtmlContent: string;
  showFooter: boolean;
  footerContent: string;
  hasAttachment: boolean;
  attachmentShowKop: boolean;
  attachmentContent: string;
  variables: Variable[];
  showSignature: boolean;
  signatureCity: string;
  signatures: Signature[];
}

export interface Variable {
  id: string;
  key: string;
  label: string;
  defaultValue: string;
}

export interface BladeAnalysisResponse {
  cleanHtml: string;
  variables: { key: string; label: string; defaultValue: string }[];
  suggestedSettings?: Partial<LetterSettings>;
}

export enum TabView {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW'
}