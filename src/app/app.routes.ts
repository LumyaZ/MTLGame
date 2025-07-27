import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GamesComponent } from './components/games/games.component';
import { GameComponent } from './components/game/game.component';
import { GameSettingsComponent } from './components/game-settings/game-settings.component';
import { GamePlayComponent } from './components/game-play/game-play.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'games', component: GamesComponent },
  { path: 'game/:id', component: GameComponent },
  { path: 'settings/:id', component: GameSettingsComponent },
  { path: 'play/:id', component: GamePlayComponent }, // Pour la page de jeu après les paramètres
  { path: '**', redirectTo: '' }
];
