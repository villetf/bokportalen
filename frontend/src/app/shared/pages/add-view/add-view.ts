import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AddBook } from '../../../features/books/components/add-book/add-book';
import { AddAuthor } from '../../../features/authors/components/add-author/add-author';
import { AddGenre } from '../../../features/genres/components/add-genre/add-genre';
import { AddLanguage } from '../../../features/languages/components/add-language/add-language';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-add-view',
   imports: [AddBook, AddAuthor, AddGenre, AddLanguage, RouterLink],
   templateUrl: './add-view.html',
})
export class AddView {
   readonly resources = [
      { value: 'book', label: 'Bok' },
      { value: 'author', label: 'Författare' },
      { value: 'genre', label: 'Genre' },
      { value: 'language', label: 'Språk' },
   ];
   selectedView = signal<string>('book');

   private destroyRef = inject(DestroyRef);

   constructor(private route: ActivatedRoute) {
      this.route.queryParams
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(params => {
            const resource = params['resource'];
            this.selectedView.set(
               this.resources.some(item => item.value === resource) ? resource : 'book'
            );
         });
   }

}
