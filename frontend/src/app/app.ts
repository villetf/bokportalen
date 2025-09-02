import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomePage } from "./features/home/pages/home-page/home-page";
import { Header } from "./features/header/components/header/header";
import { MainContent } from "./shared/components/main-content/main-content";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomePage, Header, MainContent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bokportalen');
}
