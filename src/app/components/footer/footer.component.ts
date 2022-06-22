import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  copyRightYear: number;

  constructor() {
    this.copyRightYear = new Date().getFullYear();
  }

  ngOnInit(): void {}
}
