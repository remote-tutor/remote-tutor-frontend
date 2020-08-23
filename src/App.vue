<template>
  <v-app>
    <Snackbar></Snackbar>
    <router-view />
  </v-app>
</template>

<script>
import Snackbar from "@/components/shared/Snackbar.vue";
export default {
  components: {
    Snackbar,
  },
};
</script>
