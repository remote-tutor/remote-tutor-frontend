<template>
  <v-app id="inspire">
    <v-main>
      <v-container class="fill-height" fluid>
        <Snackbar
          :visible="snackbarSettings.visible"
          :text="snackbarSettings.text"
          :color="snackbarSettings.color"
        ></Snackbar>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Login</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn href="/register" icon large v-on="on">
                      <v-icon>mdi-account-plus-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Register</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <ValidationObserver ref="observer">
                  <form>
                    <ValidationProvider v-slot="{errors}" rules="required">
                      <v-text-field
                        label="Username"
                        prepend-icon="mdi-account"
                        type="text"
                        v-model="user.username"
                        :error-messages="errors"
                      ></v-text-field>
                    </ValidationProvider>

                    <ValidationProvider v-slot="{errors}" rules="required">
                      <v-text-field
                        id="password"
                        label="Password"
                        prepend-icon="mdi-lock"
                        :append-icon="hiddenPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="hiddenPassword = !hiddenPassword"
                        :type="hiddenPassword ? 'password' : 'text'"
                        v-model="user.password"
                        :error-messages="errors"
                      ></v-text-field>
                    </ValidationProvider>
                  </form>
                </ValidationObserver>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="login" :loading="loading">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import Snackbar from "@/components/shared/Snackbar.vue";

export default {
  name: "Login",
  components: {
    Snackbar,
  },

  data() {
    return {
      hiddenPassword: true,
      error: "",
      loading: false,
      user: {
        username: "",
        password: "",
      },
      snackbarSettings: {
        visible: false,
        text: "",
        color: "",
      },
    };
  },

  methods: {
    async login() {
      this.loading = true;
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        let formData = new FormData();
        formData.append("username", this.user.username);
        formData.append("password", this.user.password);
        axios({
          method: "POST",
          url: "//localhost:3000/login",
          data: formData,
        })
          .then((response) => {
            this.snackbarSettings.text = response.data.message;
            this.snackbarSettings.visible = true;
            this.snackbarSettings.color = "success";
          })
          .catch((error) => {
            this.snackbarSettings.text = error.response.data.message;
            this.snackbarSettings.visible = true;
            this.snackbarSettings.color = "error";
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.loading = false;
      }
    },
  },
};
</script>
