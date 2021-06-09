<template>
  <v-app>
    <Snackbar></Snackbar>
    <router-view/>
    <v-snackbar
        v-if="!isLoggedIn"
        :timeout="-1"
        :value="true"
        left
        shaped
        bottom
        multi-line
        vertical
        color="warning"
    >
      N.B. You're not logged in and all of this data is for DEMONSTRATION purposes only.
      You can login/register from the top right corner of the screen
    </v-snackbar>
    <div style="height: 85px;" v-if="!isLoggedIn"></div>

  </v-app>
</template>

<script>
import Snackbar from "@/components/utils/Snackbar.vue";
import {mapState} from "vuex";

export default {
  components: {
    Snackbar,
  },
  computed: {
    ...mapState(['isLoggedIn'])
  }
};
</script>
