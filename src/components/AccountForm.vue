<template>
  <v-container class="accounts-container">
    <account-header @add-account="addNewAccount" />
    
    <account-column-headers />
    
    <account-row
      v-for="account in localAccounts"
      :key="account.id"
      :account="account"
      @update-labels="updateLabels"
      @update-type="updateAccountType"
      @update-login="updateLogin"
      @update-password="updatePassword"
      @remove-account="removeAccount"
    />
    
    <no-accounts-alert v-if="localAccounts.length === 0" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAccountStore, type Account } from '@/stores/accountStore';
import AccountHeader from './AccountHeader.vue';
import AccountColumnHeaders from './AccountColumnHeaders.vue';
import AccountRow from './AccountRow.vue';
import NoAccountsAlert from './NoAccountsAlert.vue';
import '@/styles/AccountForm.scss';

const accountStore = useAccountStore();

interface LocalAccount extends Omit<Account, 'labels'> {
  localLabels: string;
  errors: { [key: string]: boolean }; // Изменяем тип ошибок на boolean
}

const localAccounts = ref<LocalAccount[]>([]);

// Инициализация локальных аккаунтов
onMounted(() => {
  initializeLocalAccounts();
});

const initializeLocalAccounts = () => {
  localAccounts.value = accountStore.accounts.map(acc => ({
    ...acc,
    localLabels: accountStore.formatLabels(acc.labels),
    errors: {}
  }));
  
  // Валидируем каждую запись при инициализации
  localAccounts.value.forEach(acc => {
    validateAccount(acc.id);
  });
};

// Добавление новой учетной записи
const addNewAccount = () => {
  const newAccount: Omit<Account, 'id'> = {
    labels: [],
    type: 'Локальная',
    login: '',
    password: ''
  };
  
  const addedAccount = accountStore.addAccount(newAccount);
  
  localAccounts.value.push({
    ...addedAccount,
    localLabels: '',
    errors: {}
  });
};

// Обновление меток
const updateLabels = (id: number, labelsString: string) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  // Обновляем локальное состояние
  localAccounts.value[accountIndex].localLabels = labelsString;

  // Проверка длины меток
  if (labelsString.length > 50) {
    localAccounts.value[accountIndex].errors = {
      ...localAccounts.value[accountIndex].errors,
      labels: true
    };
    return;
  } else {
    // Удаляем ошибку меток, если она была
    const { labels, ...restErrors } = localAccounts.value[accountIndex].errors;
    localAccounts.value[accountIndex].errors = restErrors;
  }

  try {
    // Преобразуем строку меток в массив объектов
    const labelsArray = accountStore.parseLabels(labelsString);
    
    // Дополнительная проверка на длину каждого элемента
    const hasLongLabel = labelsArray.some(label => label.text.length > 50);
    if (hasLongLabel) {
      localAccounts.value[accountIndex].errors = {
        ...localAccounts.value[accountIndex].errors,
        labels: true
      };
      return;
    }
    
    // Сохраняем в хранилище
    accountStore.updateAccount(id, { labels: labelsArray });
  } catch (error) {
    localAccounts.value[accountIndex].errors = {
      ...localAccounts.value[accountIndex].errors,
      labels: true
    };
  }
};

// Обновление типа учетной записи
const updateAccountType = (id: number, type: 'LDAP' | 'Локальная') => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  // Обновляем локальное состояние
  localAccounts.value[accountIndex].type = type;

  // Если тип LDAP, очищаем пароль
  if (type === 'LDAP') {
    localAccounts.value[accountIndex].password = null;
  } else if (type === 'Локальная' && !localAccounts.value[accountIndex].password) {
    // Если переключаем на Локальную и пароля нет, устанавливаем пустую строку
    localAccounts.value[accountIndex].password = '';
  }
  
  // Обновляем в хранилище
  accountStore.updateAccount(id, { 
    type,
    password: type === 'LDAP' ? null : localAccounts.value[accountIndex].password
  });
  
  // Валидируем запись после изменения типа
  validateAccount(id);
};

// Обновление логина
const updateLogin = (id: number, login: string) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  localAccounts.value[accountIndex].login = login;
  validateAccount(id);
  
  // Сохраняем только если нет ошибок
  if (!localAccounts.value[accountIndex].errors.login) {
    accountStore.updateAccount(id, { login });
  }
};

// Обновление пароля
const updatePassword = (id: number, password: string) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  localAccounts.value[accountIndex].password = password;
  validateAccount(id);
  
  // Сохраняем только если нет ошибок
  if (!localAccounts.value[accountIndex].errors.password) {
    accountStore.updateAccount(id, { password });
  }
};

// Валидация учетной записи
const validateAccount = (id: number) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  const account = localAccounts.value[accountIndex];
  const errors: { [key: string]: boolean } = {}; // Изменяем на boolean для отслеживания только наличия ошибки
  
  // Проверяем логин
  if (!account.login || account.login.trim().length === 0) {
    errors.login = true;
  } else if (account.login.length > 100) {
    errors.login = true;
  }
  
  // Проверяем пароль только для локальных записей
  if (account.type === 'Локальная') {
    if (!account.password || account.password.trim().length === 0) {
      errors.password = true;
    } else if (account.password.length > 100) {
      errors.password = true;
    }
  }
  
  // Проверяем метки
  if (account.localLabels.length > 50) {
    errors.labels = true;
  }
  
  localAccounts.value[accountIndex].errors = errors;
};


// Удаление учетной записи
const removeAccount = (id: number) => {
  accountStore.removeAccount(id);
  localAccounts.value = localAccounts.value.filter(acc => acc.id !== id);
};
</script>