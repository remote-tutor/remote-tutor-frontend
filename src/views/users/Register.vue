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
                  <v-btn to="/login" icon large v-on="on">
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
                             pre-icon="mdi-account-details"
                             rules="required">
                  </TextField>

                  <ValidationProvider v-slot="{errors}" rules="required|username">
                    <v-text-field
                        label="Username"
                        prepend-icon="mdi-account"
                        type="text"
                        v-model="user.username"
                        :error-messages="errors"
                    ></v-text-field>
                  </ValidationProvider>

                  <v-row>
                    <v-col cols="6">
                      <Password :password.sync="user.password"></Password>
                    </v-col>
                    <v-col cols="6">
                      <Password :password.sync="user.confirmPassword"></Password>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col colr="6">
                      <TextField :value.sync="user.phoneNumber"
                                 label="Your Number"
                                 pre-icon="mdi-cellphone"
                                 rules="required|max:11|min:11">
                      </TextField>
                    </v-col>
                    <v-col cols="6">
                      <TextField :value.sync="user.parentNumber"
                                 label="Parent Number"
                                 pre-icon="mdi-cellphone"
                                 rules="required|max:11|min:11">
                      </TextField>
                    </v-col>
                  </v-row>

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
    </v-container>
  </v-main>
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
          this.$router.push({name: 'Login'})
        })
            .finally(() => {
              this.loading = false;
            });
      }
    },
  },
};
</script>
