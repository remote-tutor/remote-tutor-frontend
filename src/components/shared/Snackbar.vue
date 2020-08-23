<template>
  <div class="text-center">
    <v-snackbar v-model="visible" :top="true" :color="color" :dark="true">
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="visible = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "Snackbar",
  props: ['visible', 'text', 'color'],
};
</script>