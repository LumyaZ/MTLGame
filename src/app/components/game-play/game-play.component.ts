import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { HttpClient } from '@angular/common/http';
import questionsData from '../../../assets/data/never-have-i-ever-hot.json';

export interface GameSettings {
  gameId: number;
  gameName: string;
  questionCount: 10 | 25 | 50 | 75 | 100;
  bonusRound: boolean;
}

export interface BonusQuestion {
  question: string;
  answered: boolean;
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

  // Variables pour la manche bonus
  isBonusRound: boolean = false;
  isBonusSelectionMode: boolean = false; // Nouveau : mode sélection des questions
  selectedPlayer: any = null;
  bonusQuestions: BonusQuestion[] = [];
  currentBonusQuestionIndex: number = 0;
  bonusRoundTriggered: boolean = false; // Pour éviter de redéclencher la manche bonus
  bonusQuestionsData: string[] = [
    "Pour toi, qui est le plus susceptible de faire un plan à 3 ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle vient de rencontrer ?",
    "Pour toi, qui est le plus susceptible d'envoyer un nude par accident ?",
    "Pour toi, qui est le plus susceptible de baiser dans un lieu public ?",
    "Pour toi, qui est le plus susceptible de simuler un orgasme ?",
    "Pour toi, qui est le plus susceptible de coucher avec un(e) ami(e) ?",
    "Pour toi, qui est le plus susceptible de regarder du porno en groupe ?",
    "Pour toi, qui est le plus susceptible de coucher avec un(e) ex ?",
    "Pour toi, qui est le plus susceptible de faire un plan cul régulier ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un du travail ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un de la famille (lointaine) ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne connaît pas ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un pour de l'argent ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle déteste ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle vient de rencontrer ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne trouve pas attirant ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne connaît pas ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne trouve pas attirant ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne connaît pas ?",
    "Pour toi, qui est le plus susceptible de coucher avec quelqu'un qu'il/elle ne trouve pas attirant ?"
  ];

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
    this.usedQuestions.clear();
    this.bonusRoundTriggered = false; // Réinitialiser pour une nouvelle partie
    this.shuffleQuestions();
    this.showNextQuestion();
  }

  showNextQuestion(): void {
    // Vérifier si on doit déclencher la manche bonus
    if (this.gameSettings?.bonusRound && !this.isBonusRound && !this.bonusRoundTriggered && this.currentQuestionNumber === Math.floor(this.maxQuestions / 2)) {
      this.startBonusRound();
      return;
    }

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

  startBonusRound(): void {
    this.isBonusRound = true;
    this.isBonusSelectionMode = true; // Commencer en mode sélection
    this.bonusRoundTriggered = true; // Marquer que la manche bonus a été déclenchée
    this.selectedPlayer = this.players[Math.floor(Math.random() * this.players.length)];
    
    // Sélectionner 10 questions aléatoires pour la manche bonus
    const shuffledBonusQuestions = [...this.bonusQuestionsData].sort(() => Math.random() - 0.5);
    this.bonusQuestions = shuffledBonusQuestions.slice(0, 10).map(q => ({
      question: q,
      answered: false
    }));
    
    this.currentBonusQuestionIndex = 0;
  }

  nextBonusQuestion(): void {
    if (this.currentBonusQuestionIndex < this.bonusQuestions.length - 1) {
      this.currentBonusQuestionIndex++;
      this.currentQuestion = this.bonusQuestions[this.currentBonusQuestionIndex].question;
    } else {
      // Fin de la manche bonus, retour au jeu normal
      this.endBonusRound();
    }
  }

  toggleBonusQuestionAnswer(): void {
    if (this.isBonusRound && this.bonusQuestions[this.currentBonusQuestionIndex]) {
      this.bonusQuestions[this.currentBonusQuestionIndex].answered = !this.bonusQuestions[this.currentBonusQuestionIndex].answered;
    }
  }

  endBonusRound(): void {
    this.isBonusRound = false;
    this.isBonusSelectionMode = false;
    this.selectedPlayer = null;
    this.bonusQuestions = [];
    this.currentBonusQuestionIndex = 0;
    // Continuer avec la question suivante du jeu normal
    this.showNextQuestion();
  }

  endGame(): void {
    // Nettoyer le localStorage sauf les joueurs
    this.cleanLocalStorage();
    
    // Rediriger vers la page des jeux
    this.router.navigate(['/games']);
  }

  private cleanLocalStorage(): void {
    // Sauvegarder les joueurs temporairement
    const players = localStorage.getItem('players');
    
    // Supprimer toutes les clés du localStorage
    localStorage.clear();
    
    // Remettre les joueurs
    if (players) {
      localStorage.setItem('players', players);
    }
  }

  onCardClick(): void {
    if (this.isBonusRound && !this.isBonusSelectionMode) {
      // En mode question bonus, cliquer sur la card passe à la question suivante
      this.nextBonusQuestion();
    } else if (this.isGameStarted && !this.isBonusRound) {
      this.showNextQuestion();
    } else if (!this.isGameStarted) {
      this.startGame();
    }
  }

  onBonusQuestionClick(questionIndex: number): void {
    this.bonusQuestions[questionIndex].answered = !this.bonusQuestions[questionIndex].answered;
  }

  validateBonusRound(): void {
    if (this.isBonusSelectionMode) {
      // Filtrer seulement les questions cochées
      const selectedQuestions = this.bonusQuestions.filter(q => q.answered);
      
      if (selectedQuestions.length === 0) {
        // Aucune question sélectionnée, terminer directement
        this.endBonusRound();
        return;
      }
      
      // Passer en mode question par question avec seulement les questions cochées
      this.isBonusSelectionMode = false;
      this.bonusQuestions = selectedQuestions; // Remplacer par seulement les questions cochées
      this.currentBonusQuestionIndex = 0;
      this.currentQuestion = this.bonusQuestions[0].question;
    }
  }

  goBack(): void {
    this.router.navigate(['/settings', this.gameId]);
  }
} 