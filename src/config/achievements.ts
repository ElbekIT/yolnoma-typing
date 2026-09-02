import { Achievement } from '../types';

export const initialAchievements: Achievement[] = [
  {
    id: 'first_test',
    title: 'First Step',
    description: 'Complete your very first typing test on Yolnoma Typing.',
    category: 'special',
    icon: '🎯',
    progress: 0,
    targetValue: 1,
    currentValue: 0
  },
  {
    id: 'speed_50',
    title: 'Speed Demon I',
    description: 'Reach a typing speed of 50 WPM or higher.',
    category: 'speed',
    icon: '⚡',
    progress: 0,
    targetValue: 50,
    currentValue: 0
  },
  {
    id: 'speed_100',
    title: 'Keyboard Ninja',
    description: 'Reach a typing speed of 100 WPM or higher.',
    category: 'speed',
    icon: '⚔️',
    progress: 0,
    targetValue: 100,
    currentValue: 0
  },
  {
    id: 'speed_150',
    title: 'Lightning Fingers',
    description: 'Reach a typing speed of 150 WPM or higher.',
    category: 'speed',
    icon: '🔥',
    progress: 0,
    targetValue: 150,
    currentValue: 0
  },
  {
    id: 'accuracy_100',
    title: 'Flawless Precision',
    description: 'Complete a typing test with 100% accuracy.',
    category: 'accuracy',
    icon: '✨',
    progress: 0,
    targetValue: 100,
    currentValue: 0
  },
  {
    id: 'tests_10',
    title: 'Dedicated Learner',
    description: 'Complete 10 typing tests.',
    category: 'volume',
    icon: '📚',
    progress: 0,
    targetValue: 10,
    currentValue: 0
  },
  {
    id: 'tests_100',
    title: 'Century Typer',
    description: 'Complete 100 typing tests.',
    category: 'volume',
    icon: '👑',
    progress: 0,
    targetValue: 100,
    currentValue: 0
  },
  {
    id: 'streak_7',
    title: 'Consistent Practice',
    description: 'Maintain a 7-day typing streak.',
    category: 'streak',
    icon: '🌟',
    progress: 0,
    targetValue: 7,
    currentValue: 0
  },
  {
    id: 'polyglot',
    title: 'Multilingual Master',
    description: 'Complete typing tests in 3 or more different languages.',
    category: 'special',
    icon: '🌍',
    progress: 0,
    targetValue: 3,
    currentValue: 0
  }
];
