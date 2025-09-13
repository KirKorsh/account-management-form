<template>
  <v-row class="header-row">
    <v-col cols="8">
      <h1 class="text-h5">Учётные записи</h1>
    </v-col>
    <v-col cols="4" class="text-right">
      <v-btn
        color="grey"
        variant="outlined"
        @click="$emit('add-account')"
        icon
        size="small"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import './styles/AccountHeader.scss';

defineEmits(['add-account']);
</script>