import {Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [],
  imports: [RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Ficus Lead Hunter';
  version = `3.0.0`;

  constructor(){
// if (globalThis.window === undefined) {
//   globalThis.window =
//     ({
//       addEventListener: () => {},
//     } as never);
// }
  }

  ngOnInit(){
    console.log('Version ', this.version);
  }

}
