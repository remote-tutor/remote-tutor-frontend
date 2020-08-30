<template>
  <div class="text-center">
    <v-sheet class="text-center">
      <v-select
          :items="years"
          :v-model="year"
          label="Year"
          prepend-icon="mdi-school"
      ></v-select>

      <v-btn color="primary" @click="search" class="ma-2">Search</v-btn>
      <v-btn color="secondary" @click="cancel" class="ma-2">Cancel</v-btn>
      <v-btn color="secondary" @click="retrieveAll" class="ma-2">Retrieve All</v-btn>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "Search",
  data: () => ({
    sheet: false,
    year: 0,
    years: [
      {text: "All Years", value: 0},
      {text: "First Year", value: 1},
      {text: "Second Year", value: 2},
      {text: "Third Year", value: 3},
    ],
  }),
  mounted() {
    this.cachedYear = this.year
  },
  methods: {
    cancel() {
      this.year = this.cachedYear
      this.$emit("closeSearchSheet");
    },
    search() {
      this.$emit("search", {
        year: this.year,
      });
    },
    retrieveAll() {
      this.year = 0;
      this.search();
    },
  },
};
</script>