// Funktion som gör första bokstaven i en sträng till versal och resten gemener
export function capitalizeWord(str: string): string {
   if (!str) {
      return str;
   }
   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}