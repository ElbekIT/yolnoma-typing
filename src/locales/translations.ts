export type UiLanguage = 'uz' | 'ru' | 'en';

export interface MenuTranslation {
  sections: string;
  home: string;
  typingTest: string;
  spaceGame: string;
  languages: string;
  lessons: string;
  battleArena: string;
  dashboard: string;
  leaderboard: string;
  statistics: string;
  achievements: string;
  milestones: string;
  partners: string;
  about: string;
  close: string;
}

export const menuTranslations: Record<UiLanguage, MenuTranslation> = {
  uz: {
    sections: "BO'LIMLAR",
    home: "Bosh Sahifa",
    typingTest: "Yozish Testi",
    spaceGame: "Koinot Jangi 🚀",
    languages: "Tillar & Lug'atlar",
    lessons: "Saboqlar & Mashqlar",
    battleArena: "Battle Arena",
    dashboard: "Boshqaruv Paneli",
    leaderboard: "Peshqadamlar",
    statistics: "Statistika",
    achievements: "Yutuqlar",
    milestones: "Muvaffaqiyatlar",
    partners: "Hamkor & Homiy",
    about: "Sayt Haqida & Muallif",
    close: "Yopish"
  },
  ru: {
    sections: "РАЗДЕЛЫ",
    home: "Главная",
    typingTest: "Тест печати",
    spaceGame: "Космическая битва 🚀",
    languages: "Языки и словари",
    lessons: "Уроки и упражнения",
    battleArena: "Арена битв",
    dashboard: "Панель управления",
    leaderboard: "Таблица лидеров",
    statistics: "Статистика",
    achievements: "Достижения",
    milestones: "Прогресс и успехи",
    partners: "Партнёры и спонсоры",
    about: "О сайте и авторе",
    close: "Закрыть"
  },
  en: {
    sections: "SECTIONS",
    home: "Home",
    typingTest: "Typing Test",
    spaceGame: "Space Battle 🚀",
    languages: "Languages & Dicts",
    lessons: "Lessons & Practice",
    battleArena: "Battle Arena",
    dashboard: "Dashboard",
    leaderboard: "Leaderboard",
    statistics: "Statistics",
    achievements: "Achievements",
    milestones: "Milestones",
    partners: "Partners & Sponsors",
    about: "About & Author",
    close: "Close"
  }
};
