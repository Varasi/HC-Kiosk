import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppLayoutService } from '../../core/services/app.layout.service';
import { TicketService } from '../../core/services/app.ticketservice.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss'
})
export class AppTopbarComponent {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: AppLayoutService, 
      public ticketService: TicketService,
      private router: Router) { }

  toggleDarkMode() {
      this.layoutService.dark = !this.layoutService.dark;

      if (this.layoutService.dark) {
        console.log('In Dark');
          this.layoutService.changeTheme('dark');
          if (this.layoutService.audio)
              window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching to dark mode'));
      } else {
        console.log('In light');
          this.layoutService.changeTheme('light');
          if (this.layoutService.audio)
              window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching to light mode'));
      }
  }

  toggleAudioMode() {
      this.layoutService.audio = !this.layoutService.audio;
      this.layoutService.changeAudio(this.layoutService.audio);

      if (this.layoutService.audio) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching audio on'));
      } else {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance('Switching audio off'));
      }
  }

  onStartOver() {
      if(this.layoutService.audio) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance('Starting over'));
      }

      this.ticketService.bookTrip = true;
      this.ticketService.initialCheck = false;
  }
}
