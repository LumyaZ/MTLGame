import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

export interface Game {
  id: number;
  name: string;
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  difficulty: string;
  icon: string;
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  games: Game[] = [
    {
      id: 1,
      name: "J'ai / Je n'ai jamais",
      description: "Révélez des secrets et découvrez ceux de vos amis",
      category: "taz",
      minPlayers: 3,
      maxPlayers: 15,
      duration: "15-45 min",
      difficulty: "Facile",
      icon: "🤐"
    },
    {
      id: 2,
      name: "Qui pourrait",
      description: "Devinez qui pourrait faire quoi dans le groupe",
      category: "taz",
      minPlayers: 4,
      maxPlayers: 12,
      duration: "20-40 min",
      difficulty: "Moyen",
      icon: "🤔"
    },
    {
      id: 3,
      name: "C'est un 10",
      description: "Notez les choses de 1 à 10 et découvrez les goûts de chacun",
      category: "taz",
      minPlayers: 3,
      maxPlayers: 10,
      duration: "15-30 min",
      difficulty: "Facile",
      icon: "⭐"
    }
  ];

  categories: string[] = ['taz'];
  selectedCategory: string = 'taz';
  players: any[] = [];

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  getGamesByCategory(category: string): Game[] {
    return this.games.filter(game => game.category === category);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  startGame(game: Game): void {
    // Navigation vers la page de paramètres du jeu
    this.router.navigate(['/settings', game.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
} 