export type GoogleBooksVolumeInfo = {
   title?: string;
   subtitle?: string;
   authors?: string[];
   publisher?: string;
   publishedDate?: string;
   description?: string;
   pageCount?: number;
   language?: string;
   categories?: string[];
   imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
   };
   industryIdentifiers?: Array<{
      type?: string;
      identifier?: string;
   }>;
};

export type GoogleBooksResponse = {
   items?: Array<{
      id?: string;
      volumeInfo?: GoogleBooksVolumeInfo;
   }>;
};

export type OpenLibraryBook = {
   title?: string;
   subtitle?: string;
   authors?: Array<{
      name?: string;
   }>;
   publishers?: Array<{
      name?: string;
   }>;
   publish_date?: string;
   number_of_pages?: number;
   subjects?: Array<{
      name?: string;
   }>;
   cover?: {
      small?: string;
      medium?: string;
      large?: string;
   };
   identifiers?: Record<string, string[]>;
   languages?: Array<{
      key?: string;
      name?: string;
   }>;
};

export type ISBNLookupResponse = {
   isbn: string;
   found: boolean;
   title: string | null;
   subtitle: string | null;
   authors: string[];
   publishedYear: number | null;
   language: string | null;
   categories: string[];
   coverLink: string | null;
   sources: {
      googleBooks: boolean;
      openLibrary: boolean;
   };
};