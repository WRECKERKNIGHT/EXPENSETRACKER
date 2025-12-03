// Theme Service - Dark/Light mode
export type Theme = 'dark' | 'light' | 'auto';

export const getTheme = (): Theme => {
  return (localStorage.getItem('spendsmart_theme') || 'dark') as Theme;
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('spendsmart_theme', theme);
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Notification Service
export interface NotificationPreference {
  budgetAlerts: boolean;
  recurringReminders: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  milestoneAlerts: boolean;
}

export const getNotificationPreferences = (): NotificationPreference => {
  const prefs = localStorage.getItem('spendsmart_notifications');
  return prefs ? JSON.parse(prefs) : {
    budgetAlerts: true,
    recurringReminders: true,
    dailySummary: false,
    weeklyReport: false,
    milestoneAlerts: true,
  };
};

export const setNotificationPreferences = (prefs: NotificationPreference) => {
  localStorage.setItem('spendsmart_notifications', JSON.stringify(prefs));
};

// Smart Notifications
export const checkBudgetAlert = (categorySpending: number, budgetLimit: number): string | null => {
  const percentage = (categorySpending / budgetLimit) * 100;
  if (percentage >= 100) return `⚠️ You've exceeded your ${categorySpending} budget!`;
  if (percentage >= 90) return `🔔 You're at 90% of your budget limit!`;
  if (percentage >= 75) return `📢 You're at 75% of your budget for this category.`;
  return null;
};

export const checkMilestones = (savingsGoal: number, currentAmount: number, targetAmount: number): string | null => {
  const percentage = (currentAmount / targetAmount) * 100;
  if (percentage >= 100) return `🎉 Congratulations! You've reached your savings goal!`;
  if (percentage >= 75) return `🚀 You're 75% of the way to your goal!`;
  if (percentage >= 50) return `💪 Halfway there! Keep saving!`;
  return null;
};
