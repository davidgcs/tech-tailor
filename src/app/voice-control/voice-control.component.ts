// import { AsyncPipe } from '@angular/common';
// import {
//   Component,
//   ElementRef,
//   inject,
//   OnDestroy,
//   OnInit,
//   ViewChild,
// } from '@angular/core';
// import { Observable } from 'rxjs';

// export enum buttonText {
//   START = 'Iniciar',
//   STOP = 'Detener',
// }

// @Component({
//   selector: 'app-voice-control',
//   imports: [AsyncPipe],
//   templateUrl: './voice-control.component.html',
//   styleUrl: './voice-control.component.scss',
// })
// export class VoiceControlComponent implements OnInit, OnDestroy {
//   @ViewChild('voiceCanvas') canvas?: ElementRef;
//   private voiceService = inject(VoiceService); //Imagine the VoiceService is already defined and imported
//   public readonly isRecording$: Observable<boolean>;
//   public readonly isProcessing$: Observable<boolean>;
//   buttonText = buttonText;

//   status$ = this.voiceService.status$;
//   constructor() {
//     this.isRecording$ = this.voiceService.isRecording$;
//     this.isProcessing$ = this.voiceService.isProcessing$; // function in voice.service.ts that returns the local observable after checking if status is 'processing'
//   }

//   async ngOnInit() {
//     this.buttonText = await this.voiceService.isRecording$;
//   }

//   toggleRecording(): void {
//     this.voiceService.toggleRecording();
//   }

//   ngOnDestroy() {
//     this.voiceService.status$.unsubscribe();
//   }
// }
