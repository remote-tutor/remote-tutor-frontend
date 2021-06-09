<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Register</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon large v-on="on" @click="backToLogin">
                <v-icon>mdi-login</v-icon>
              </v-btn>
            </template>
            <span>Login</span>
          </v-tooltip>
        </v-toolbar>
        <ValidationObserver ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="register">
            <v-card-text>
              <TextField :value.sync="user.fullName"
                         label="Full Name"
                         rules="required">
              </TextField>

              <ValidationProvider v-slot="{errors}" rules="required|username">
                <v-text-field
                    label="Username"
                    type="text"
                    v-model="user.username"
                    :error-messages="errors"
                ></v-text-field>
              </ValidationProvider>

              <Password
                  :password.sync="user.password"
                  :hide-lock-icon="true"></Password>
              <Password
                  :password.sync="user.confirmPassword"
                  :hide-lock-icon="true"></Password>

              <TextField :value.sync="user.phoneNumber"
                         label="Your Number"
                         rules="required|max:11|min:11">
              </TextField>
              <TextField :value.sync="user.parentNumber"
                         label="Parent Number"
                         rules="required|max:11|min:11">
              </TextField>

            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" type="submit" :disabled="invalid" :loading="loading">Register</v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import api from "@/gateways/api";
import TextField from "@/components/utils/form/TextField";
import Password from "@/components/utils/form/Password";

export default {
  name: "Register",
  components: {Password, TextField},
  data() {
    return {
      loading: false,
      user: {
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        parentNumber: "",
      },
    };
  },

  methods: {
    async register() {
      this.loading = true
      let isValid = await this.$refs.observer.validate();
      if (isValid) {
        let formData = new FormData();
        formData.append("fullName", this.user.fullName);
        formData.append("username", this.user.username);
        formData.append("password", this.user.password);
        formData.append("confirmPassword", this.user.confirmPassword);
        formData.append("phoneNumber", this.user.phoneNumber);
        formData.append("parentNumber", this.user.parentNumber);
        api({
          method: "POST",
          url: "/register",
          data: formData,
        }).then(() => {
          this.backToLogin()
        })
            .finally(() => {
              this.loading = false;
            });
      }
    },
    backToLogin() {
      this.$emit('backToLogin')
    },
  },
};
</script>
