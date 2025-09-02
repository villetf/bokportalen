import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-all-books',
  imports: [],
  templateUrl: './all-books.html',
  styles: ``
})
export class AllBooks {
   books = signal([{}]);

   ngOnInit(): void {
      fetch('http://localhost:3000/books')
         .then(response => response.json())
         .then(data => this.books.set(data));
   }
}
