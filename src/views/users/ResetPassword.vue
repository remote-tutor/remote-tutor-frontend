<template>
  <v-app>
    <AppBar page-name="Reset Password"></AppBar>

    <v-main>
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Reset Password</v-toolbar-title>
              </v-toolbar>
              <ValidationObserver ref="observer" v-slot="{ invalid }">
                <form @submit.prevent="submit">
                  <v-card-text>
                    <v-row>
                      <v-col>
                        <Password :password.sync="user.oldPassword" label="Old Password"></Password>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col>
                        <Password :password.sync="user.newPassword" label="New Password"></Password>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <Password :password.sync="user.confirmPassword" label="Confirm Password"></Password>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" type="submit" :disabled="invalid" :loading="loading">Change Password</v-btn>
                  </v-card-actions>
                </form>
              </ValidationObserver>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>


  </v-app>
</template>

<script>
import AppBar from "@/components/utils/AppBar";
import Password from "@/components/utils/form/Password";
import api from "@/gateways/api";

export default {
  name: "ResetPassword",
  components: {Password, AppBar},
  data() {
    return {
      user: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      loading: false
    }
  },
  methods: {
    submit() {
      this.loading = true
      let formData = new FormData()
      formData.append("oldPassword", this.user.oldPassword)
      formData.append("newPassword", this.user.confirmPassword)
      formData.append("confirmPassword", this.user.newPassword)
      api({
        method: "PUT",
        url: "/change-password",
        data: formData
      }).then(() => {
        this.$router.push({name: 'Announcements'})
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>