<template>
  <v-row class="account-row" align="center">
    <!-- Поле метки -->
    <v-col cols="3">
      <v-text-field
        :model-value="account.localLabels"
        placeholder="Метки (разделяются ;)"
        variant="outlined"
        density="compact"
        :maxlength="50"
        @blur="emit('update-labels', account.id, account.localLabels)"
        :error="!!account.errors?.labels"
        hide-details
        @update:model-value="(value) => account.localLabels = value"
      ></v-text-field>
    </v-col>

    <!-- Поле типа записи -->
    <v-col cols="2">
      <v-select
        :model-value="account.type"
        :items="accountTypes"
        variant="outlined"
        density="compact"
        @update:model-value="emit('update-type', account.id, $event)"
        hide-details
      ></v-select>
    </v-col>

    <!-- Поле логина -->
    <v-col 
      :cols="account.type === 'Локальная' ? 3 : 6"
      :class="{'ldap-login-col': account.type === 'LDAP'}"
    >
      <v-text-field
        :model-value="account.login"
        placeholder="Логин"
        variant="outlined"
        density="compact"
        :maxlength="100"
        @blur="emit('update-login', account.id, account.login)"
        :error="!!account.errors?.login"
        hide-details
        @update:model-value="(value) => account.login = value"
      ></v-text-field>
    </v-col>

 <!-- Поле пароля (только для локальных записей) -->
  <v-col cols="3" v-if="account.type === 'Локальная'">
    <v-text-field
      :model-value="account.password || ''"
      placeholder="Пароль"
      :type="showPassword ? 'text' : 'password'"
      variant="outlined"
      density="compact"
      :maxlength="100"
      @blur="emit('update-password', account.id, account.password || '')"
      :error="!!account.errors?.password"
      hide-details
      @update:model-value="(value) => account.password = value"
    >
      <template v-slot:append>
        <v-icon
          @click="showPassword = !showPassword"
          class="password-toggle"
        >
          {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
        </v-icon>
      </template>
    </v-text-field>
  </v-col>

    <!-- Кнопка удаления -->
    <v-col cols="1">
      <v-btn
        color="grey"
        variant="text"
        @click="emit('remove-account', account.id)"
        icon
        size="small"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Account } from '@/stores/accountStore';
import '@/styles/AccountRow.scss';

const props = defineProps<{
  account: Account & {
    localLabels: string;
    errors?: { [key: string]: boolean }; // Обновляем тип ошибок
  };
}>();

const emit = defineEmits([
  'update-labels', 
  'update-type', 
  'update-login',
  'update-password', 
  'remove-account'
]);

const accountTypes = ['Локальная', 'LDAP'];
const showPassword = ref(false);
</script>