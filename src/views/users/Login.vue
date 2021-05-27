<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Login</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon large v-on="on" @click="showRegister">
                <v-icon>mdi-account-plus-outline</v-icon>
              </v-btn>
            </template>
            <span>Register</span>
          </v-tooltip>
        </v-toolbar>
        <ValidationObserver ref="observer" v-slot="{ invalid }">
          <form @submit.prevent="login">
            <v-card-text>
              <TextField :value.sync="user.username"
                         label="Username"
                         rules="required">
              </TextField>

              <Password :password.sync="user.password" :hide-lock-icon="true"></Password>

            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" type="submit" :disabled="invalid" :loading="loading">Login</v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import TextField from "@/components/utils/form/TextField";
import api from "@/gateways/api.js";
import Password from "@/components/utils/form/Password";

export default {
  name: "Login",
  components: {
    Password,
    TextField,
  },

  data() {
    return {
      loading: false,
      user: {
        username: "",
        password: "",
      },
    };
  },

  methods: {
    async login() {
      this.loading = true;
      let formData = new FormData();
      formData.append("username", this.user.username);
      formData.append("password", this.user.password);
      api({
        method: "POST",
        url: "/login",
        data: formData,
      })
          .then((response) => {
            this.$store.dispatch("setUserData", {
              name: response.data.name,
              token: response.data.token,
            })
            this.$router.push({name: 'Classes'})
          })
          .finally(() => {
            this.loading = false;
          });
    },
    showRegister() {
      this.$emit('showRegister')
    },
  },
};
</script>
