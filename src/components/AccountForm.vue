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
      @validate-save="validateAndSave"
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
import './styles/AccountForm.scss';

const accountStore = useAccountStore();

interface LocalAccount extends Omit<Account, 'labels'> {
  localLabels: string;
  errors: { [key: string]: string };
}

const localAccounts = ref<LocalAccount[]>([]);

onMounted(() => {
  initializeLocalAccounts();
});

const initializeLocalAccounts = () => {
  localAccounts.value = accountStore.accounts.map(acc => ({
    ...acc,
    localLabels: accountStore.formatLabels(acc.labels),
    errors: {}
  }));
};

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

const updateLabels = (id: number, labelsString: string) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  const labelsArray = accountStore.parseLabels(labelsString);
  accountStore.updateAccount(id, { labels: labelsArray });
  validateAndSave(id);
};

const updateAccountType = (id: number, type: 'LDAP' | 'Локальная') => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  const updates: Partial<Account> = { type };
  if (type === 'LDAP') {
    updates.password = null;
    localAccounts.value[accountIndex].password = '';
  }
  
  accountStore.updateAccount(id, updates);
  validateAndSave(id);
};

const validateAndSave = (id: number) => {
  const accountIndex = localAccounts.value.findIndex(acc => acc.id === id);
  if (accountIndex === -1) return;

  const account = localAccounts.value[accountIndex];
  const errors: { [key: string]: string } = {};

  if (!account.login.trim()) {
    errors.login = 'Логин обязателен для заполнения';
  } else if (account.login.length > 100) {
    errors.login = 'Логин не может превышать 100 символов';
  }

  if (account.type === 'Локальная') {
    if (!account.password) {
      errors.password = 'Пароль обязателен для локальных записей';
    } else if (account.password.length > 100) {
      errors.password = 'Пароль не может превышать 100 символов';
    }
  }

  localAccounts.value[accountIndex].errors = errors;

  if (Object.keys(errors).length === 0) {
    const updates: Partial<Account> = {
      login: account.login,
      password: account.type === 'Локальная' ? account.password : null
    };
    
    accountStore.updateAccount(id, updates);
  }
};

const removeAccount = (id: number) => {
  accountStore.removeAccount(id);
  localAccounts.value = localAccounts.value.filter(acc => acc.id !== id);
};
</script>