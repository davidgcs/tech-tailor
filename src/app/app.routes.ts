import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'smart-navigation',
    pathMatch: 'full',
  },
  //   {
  //     path: 'voice-control',
  //     loadComponent: () =>
  //       import('./voice-control/voice-control.component').then(
  //         (m) => m.VoiceControlComponent
  //       ),
  //   },
  {
    path: 'smart-navigation',
    loadComponent: () =>
      import('./smart-navigation/smart-navigation.component').then(
        (m) => m.SmartNavigationComponent
      ),
  },
];
