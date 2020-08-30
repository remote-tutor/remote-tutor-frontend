<template>
  <div class="text-center">
    <v-pagination
      v-model="page"
      :length="length"
      :circle="true"
      total-visible="7"
      @input="pageChanged"
    ></v-pagination>
  </div>
</template>

<script>
export default {
  name: "BottomNavigation",
  props: ["length"],
  data() {
    return {
      page: 1,
    };
  },
  methods: {
      pageChanged() {
          this.$emit("pageChanged", {
              currentPage: this.page
          })
      }
  }
};
</script>