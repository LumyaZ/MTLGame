import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { HttpClient } from '@angular/common/http';
import questionsData from '../../../assets/data/never-have-i-ever-hot.json';

export interface GameSettings {
  gameId: number;
  gameName: string;
  questionCount: 25 | 50 | 75 | 100;
  bonusRound: boolean;
}

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit {
  gameId: number = 0;
  gameName: string = '';
  players: any[] = [];
  questions: any[] = [];
  usedQuestions: Set<number> = new Set();
  currentQuestion: string = '';
  isGameStarted: boolean = false;
  currentQuestionNumber: number = 0;
  totalQuestions: number = 0;
  maxQuestions: number = 50; // Valeur par défaut
  gameSettings: GameSettings | null = null;

  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
      this.loadGameSettings();
      this.loadGameInfo();
      this.loadQuestions();
    });
    
    this.playerService.getPlayers().subscribe(players => {
      this.players = players.filter(p => p.isActive);
    });
  }

  loadGameSettings(): void {
    // Récupérer les paramètres du jeu depuis le localStorage
    const settingsKey = `game-settings-${this.gameId}`;
    const savedSettings = localStorage.getItem(settingsKey);
    
          if (savedSettings) {
        try {
          this.gameSettings = JSON.parse(savedSettings);
          if (this.gameSettings) {
            this.maxQuestions = this.gameSettings.questionCount;
            console.log('Settings chargés:', this.gameSettings);
          }
        } catch (error) {
        console.error('Erreur lors du chargement des settings:', error);
        this.maxQuestions = 50; // Valeur par défaut
      }
    } else {
      console.warn('Aucun settings trouvé, utilisation des valeurs par défaut');
      this.maxQuestions = 50; // Valeur par défaut
    }
  }

  loadGameInfo(): void {
    // Pour l'instant, on ne gère que le jeu "J'ai / Je n'ai jamais"
    this.gameName = "J'ai / Je n'ai jamais";
  }

  loadQuestions(): void {
    // Charger les questions directement depuis le fichier JSON importé
    try {
      console.log('Questions data:', questionsData);
      // Convertir les chaînes en objets avec propriété question
      this.questions = (questionsData as string[]).map(q => ({ question: q }));
      this.totalQuestions = this.questions.length;
      this.shuffleQuestions();
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    }
  }

  shuffleQuestions(): void {
    // Mélanger les questions pour un ordre aléatoire
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }

  startGame(): void {
    this.isGameStarted = true;
    this.currentQuestionNumber = 0;
    this.showNextQuestion();
  }

  showNextQuestion(): void {
    // Vérifier si on a atteint le nombre maximum de questions
    if (this.currentQuestionNumber >= this.maxQuestions) {
      this.endGame();
      return;
    }

    let availableQuestions = this.questions.filter((_, index) => !this.usedQuestions.has(index));
    
    if (availableQuestions.length === 0) {
      // Toutes les questions ont été utilisées, recommencer
      this.usedQuestions.clear();
      this.shuffleQuestions();
      availableQuestions = this.questions;
    }

    const questionIndex = this.questions.findIndex(q => q.question === availableQuestions[0].question);
    this.currentQuestion = availableQuestions[0].question;
    this.usedQuestions.add(questionIndex);
    this.currentQuestionNumber++;
  }

  endGame(): void {
    this.isGameStarted = false;
    this.currentQuestion = '';
    this.currentQuestionNumber = 0;
    this.usedQuestions.clear();
  }

  onCardClick(): void {
    if (this.isGameStarted) {
      this.showNextQuestion();
    } else {
      this.startGame();
    }
  }

  goBack(): void {
    this.router.navigate(['/settings', this.gameId]);
  }
} 