import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AddBook } from '../../../features/books/components/add-book/add-book';
import { AddAuthor } from '../../../features/authors/components/add-author/add-author';
import { AddGenre } from '../../../features/genres/components/add-genre/add-genre';
import { AddLanguage } from '../../../features/languages/components/add-language/add-language';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-add-view',
   imports: [AddBook, AddAuthor, AddGenre, AddLanguage, RouterLink],
   templateUrl: './add-view.html',
   styles: ''
})
export class AddView {
   selectedView = signal<string>('book');

   private destroyRef = inject(DestroyRef);

   constructor(private route: ActivatedRoute, private router: Router) {
      this.route.queryParams
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(params => {
            const resource = params['resource'];
            if (resource) {
               this.selectedView.set(resource);
            }
         });
   }

   setView(resource: 'book' | 'author' | 'genre' | 'language') {
      this.selectedView.set(resource);
      this.router.navigate([], { queryParams: { resource } });
   }
}
