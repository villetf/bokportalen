export interface ISBNLookupResponse {
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
}