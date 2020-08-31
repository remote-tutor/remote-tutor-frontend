<template>
  <v-app>
    <Snackbar></Snackbar>
    <router-view />
  </v-app>
</template>

<script>
import Snackbar from "@/components/utils/Snackbar.vue";
export default {
  components: {
    Snackbar,
  },
};
</script>
