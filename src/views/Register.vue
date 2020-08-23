<template>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Register</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn href="/login" icon large v-on="on">
                      <v-icon>mdi-login</v-icon>
                    </v-btn>
                  </template>
                  <span>Login</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text>
                <ValidationObserver ref="observer">
                  <form>
                    <ValidationProvider v-slot="{errors}" rules="required">
                      <v-text-field
                        label="Full Name"
                        name="full-name"
                        type="text"
                        v-model="user.fullName"
                        :error-messages="errors"
                        prepend-icon="mdi-account-details"
                      ></v-text-field>
                    </ValidationProvider>

                    <ValidationProvider v-slot="{errors}" rules="required">
                      <v-text-field
                        label="Username"
                        name="username"
                        type="text"
                        v-model="user.username"
                        :error-messages="errors"
                        prepend-icon="mdi-account"
                      ></v-text-field>
                    </ValidationProvider>

                    <v-row>
                      <v-col cols="6">
                        <ValidationProvider
                          v-slot="{errors}"
                          rules="required|confirmed:passwordConfirmation"
                          vid="password"
                        >
                          <v-text-field
                            id="password"
                            label="Password"
                            name="password"
                            :type="hiddenPassword ? 'password' : 'text'"
                            v-model="user.password"
                            :error-messages="errors"
                            @click:append="hiddenPassword = !hiddenPassword"
                            :append-icon="hiddenPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            prepend-icon="mdi-lock"
                          ></v-text-field>
                        </ValidationProvider>
                      </v-col>
                      <v-col cols="6">
                        <ValidationProvider
                          v-slot="{errors}"
                          rules="required|confirmed:password"
                          vid="passwordConfirmation"
                        >
                          <v-text-field
                            id="confirm-password"
                            label="Confirm"
                            name="confirm-password"
                            prepend-icon="mdi-lock"
                            :error-messages="errors"
                            :append-icon="hiddenConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="hiddenConfirmPassword = !hiddenConfirmPassword"
                            :type="hiddenConfirmPassword ? 'password' : 'text'"
                            v-model="user.confirmPassword"
                          ></v-text-field>
                        </ValidationProvider>
                      </v-col>
                    </v-row>
                  </form>
                </ValidationObserver>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="register" :loading="loading">Register</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",

  data() {
    return {
      hiddenPassword: true,
      hiddenConfirmPassword: true,
      error: "",
      loading: false,
      user: {
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
      },
    };
  },

  methods: {
    async register() {
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        let formData = new FormData();
        formData.append("fullName", this.user.fullName);
        formData.append("username", this.user.username);
        formData.append("password", this.user.password);
        formData.append("confirmPassword", this.user.confirmPassword);
        axios({
          method: "POST",
          url: "//localhost:3000/register",
          data: formData,
        })
          .then((response) => {
            this.$store.dispatch("viewScnackbar", {
              text: response.data.message,
              color: "success",
            });
          })
          .catch((error) => {
            this.$store.dispatch("viewScnackbar", {
              text: error.response.data.message,
              color: "error",
            });
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
};
</script>
