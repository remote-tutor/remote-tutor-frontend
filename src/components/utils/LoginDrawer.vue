<template>
  <v-navigation-drawer
      v-model="open"
      right
      temporary
      app
      clipped
  >
    <Login v-if="showLogin" @showRegister="() => this.showLogin = false"></Login>
    <Register v-else @backToLogin="() => this.showLogin = true"></Register>
  </v-navigation-drawer>
</template>

<script>
import Login from "@/views/users/Login";
import Register from "@/views/users/Register";

export default {
  name: "LoginDrawer",
  props: ["staticOpen"],
  components: {Register, Login},
  data() {
    return {
      open: this.staticOpen || false,
      showLogin: true,
    }
  },
  watch: {
    staticOpen: function (val) {
      if(val) this.showLogin = true
      this.open = val
    },
    open: function (val) {
      this.$emit('closedDrawer', {
        value: val
      })
    }
  }
}
</script>

<style scoped>

</style>