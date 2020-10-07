<template>
  <v-app>
    <AppBar page-name="Video"></AppBar>
    <v-main>
      <v-container>
        <AdminVideoParts v-if="userData.admin"></AdminVideoParts>
        <UserVideoParts v-else></UserVideoParts>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AdminVideoParts from "@/components/videos/admins/VideoParts";
import AppBar from "@/components/utils/AppBar";
import {mapState} from "vuex";
import UserVideoParts from "@/components/videos/users/VideoParts";
export default {
name: "Videos",
  components: {UserVideoParts, AppBar, AdminVideoParts},
  computed: {
    ...mapState(['userData']),
  },
}
</script>

<style scoped>

</style>