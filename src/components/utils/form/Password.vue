<template>
  <ValidationProvider v-slot="{errors}" rules="required">
    <v-text-field
        :label="label || 'Password'"
        :prepend-icon="hideLockIcon ? '' : 'mdi-lock'"
        :append-icon="hiddenPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="hiddenPassword = !hiddenPassword"
        :type="hiddenPassword ? 'password' : 'text'"
        v-model="updatedPassword"
        :error-messages="errors"
        @input="(val) => $emit('update:password', val)"
    ></v-text-field>
  </ValidationProvider>
</template>

<script>
export default {
  name: "Password",
  props: ["password", "label", "hideLockIcon"],
  data() {
    return {
      updatedPassword: this.password || "",
      hiddenPassword: true,
    }
  },
}
</script>

<style scoped>

</style>