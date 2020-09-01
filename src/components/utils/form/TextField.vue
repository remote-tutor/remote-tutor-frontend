<template>
  <ValidationProvider v-slot="{errors}" :rules="rules">
    <v-text-field
        :label="label"
        :prepend-icon="preIcon"
        type="text"
        v-model="updatedValue"
        :error-messages="errors"
        @input="(val) => $emit('update:value', val)"
    ></v-text-field>
  </ValidationProvider>
</template>

<script>
export default {
  name: "TextField",
  props: ["value", "label", "preIcon", "rules"],
  data() {
    return {
      updatedValue: this.value || ""
    }
  },
}
</script>

<style scoped>

</style>