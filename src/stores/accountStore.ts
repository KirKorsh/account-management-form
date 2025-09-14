import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Account {
  id: number;
  labels: { text: string }[];
  type: 'LDAP' | 'Локальная';
  login: string;
  password: string | null;
}

export const useAccountStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);
  const nextId = ref(1);

  // Загрузка из localStorage
  const loadFromStorage = () => {
    const savedData = localStorage.getItem('accountManagementData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      accounts.value = parsedData.accounts;
      nextId.value = parsedData.nextId;
    }
  };

  // Сохранение в localStorage
  const saveToStorage = () => {
    localStorage.setItem('accountManagementData', JSON.stringify({
      accounts: accounts.value,
      nextId: nextId.value
    }));
  };

  // Добавление учетной записи
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: nextId.value++ };
    accounts.value.push(newAccount);
    saveToStorage();
    return newAccount;
  };

  // Обновление учетной записи
  const updateAccount = (id: number, updates: Partial<Account>) => {
    const index = accounts.value.findIndex(acc => acc.id === id);
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates };
      saveToStorage();
    }
  };

// Удаление учетной записи
const removeAccount = (id: number) => {
  accounts.value = accounts.value.filter(acc => acc.id !== id);
  saveToStorage();
};

  // Строки меток в массив объектов
 const parseLabels = (labelsString: string): { text: string }[] => {
  return labelsString
    .split(';')
    .map(label => label.trim())
    .filter(label => label.length > 0) // Убираем пустые элементы
    .map(text => ({ text }));
};

  // Массив объектов в строку меток
  const formatLabels = (labels: { text: string }[]): string => {
    return labels.map(label => label.text).join('; ');
  };

  // Валидация учетной записи
  const validateAccount = (account: Partial<Account>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!account.login || account.login.trim().length === 0) {
      errors.login = 'Логин обязателен для заполнения';
    } else if (account.login.length > 100) {
      errors.login = 'Логин не может превышать 100 символов';
    }

    if (account.type === 'Локальная') {
      if (!account.password || account.password.trim().length === 0) {
        errors.password = 'Пароль обязателен для локальных записей';
      } else if (account.password.length > 100) {
        errors.password = 'Пароль не может превышать 100 символов';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Загрузка данных при инициализации
  loadFromStorage();

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    parseLabels,
    formatLabels,
    validateAccount
  };
});