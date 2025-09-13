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

  // Загрузка из localStorage при инициализации
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

  // Добавление новой учетной записи
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: nextId.value++ };
    accounts.value.push(newAccount);
    saveToStorage();
    return newAccount;
  };

  // Обновление существующей учетной записи
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

  // Преобразование строки меток в массив объектов
  const parseLabels = (labelsString: string): { text: string }[] => {
    return labelsString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(text => ({ text }));
  };

  // Преобразование массива объектов в строку меток
  const formatLabels = (labels: { text: string }[]): string => {
    return labels.map(label => label.text).join('; ');
  };

  // Загрузка данных при инициализации хранилища
  loadFromStorage();

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    parseLabels,
    formatLabels
  };
});