<template>
  <div class="text-center">
    <v-pagination
      v-model="currentPage"
      :length="length"
      circle
      total-visible="7"
    ></v-pagination>
  </div>
</template>

<script>
export default {
  name: "BottomNavigation",
  props: ["length", "page"],
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    }
  },
};
</script>