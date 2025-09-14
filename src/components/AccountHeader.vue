<template>
  <div class="header-container">
    <h1 class="text-h5">Учётные записи</h1>
    <v-btn
      color="grey"
      variant="outlined"
      @click="$emit('add-account')"
      icon
      size="small"
      class="ml-3"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import '@/styles/AccountHeader.scss';

defineEmits(['add-account']);
</script>