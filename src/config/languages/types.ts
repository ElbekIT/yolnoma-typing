import { LanguageCode } from '../../types';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  script: string;
  words: string[];
  sentences: string[];
  quotes: { text: string; author: string }[];
  stories?: string[];
}
