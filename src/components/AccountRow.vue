<template>
  <v-row class="account-row" align="center">
    <v-col cols="3">
      <v-text-field
        v-model="localAccount.localLabels"
        placeholder="Метки"
        variant="outlined"
        density="compact"
        :maxlength="50"
        @blur="$emit('update-labels', account.id, localAccount.localLabels)"
        hide-details
      ></v-text-field>
    </v-col>

    <v-col cols="2">
      <v-select
        v-model="localAccount.type"
        :items="accountTypes"
        variant="outlined"
        density="compact"
        @update:modelValue="$emit('update-type', account.id, localAccount.type)"
        hide-details
      ></v-select>
    </v-col>

    <v-col cols="3">
      <v-text-field
        v-model="localAccount.login"
        placeholder="Значение"
        variant="outlined"
        density="compact"
        :maxlength="100"
        @blur="$emit('validate-save', account.id)"
        :error-messages="account.errors?.login || ''"
        hide-details
      ></v-text-field>
    </v-col>

    <v-col cols="3">
      <v-text-field
        v-model="localAccount.password"
        :placeholder="localAccount.type === 'Локальная' ? 'Значение' : ''"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="compact"
        :maxlength="100"
        @blur="$emit('validate-save', account.id)"
        :error-messages="account.errors?.password || ''"
        :disabled="localAccount.type === 'LDAP'"
        hide-details
      >
        <template v-slot:append v-if="localAccount.type === 'Локальная'">
          <v-icon
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
          </v-icon>
        </template>
      </v-text-field>
    </v-col>

    <v-col cols="1">
      <v-btn
        color="grey"
        variant="text"
        @click="$emit('remove-account', account.id)"
        icon
        size="small"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { Account } from '@/stores/accountStore';
import './styles/AccountRow.scss';

const props = defineProps<{
  account: Account & {
    localLabels: string;
    errors?: { [key: string]: string };
  };
}>();

defineEmits(['update-labels', 'update-type', 'validate-save', 'remove-account']);

const accountTypes = ['Локальная', 'LDAP'];
const showPassword = ref(false);

// Локальная копия аккаунта для редактирования
const localAccount = reactive({
  localLabels: props.account.localLabels,
  type: props.account.type,
  login: props.account.login,
  password: props.account.password
});

// Обновление локальной копию при изменении пропсов
watch(() => props.account, (newAccount) => {
  localAccount.localLabels = newAccount.localLabels;
  localAccount.type = newAccount.type;
  localAccount.login = newAccount.login;
  localAccount.password = newAccount.password;
}, { deep: true });
</script>