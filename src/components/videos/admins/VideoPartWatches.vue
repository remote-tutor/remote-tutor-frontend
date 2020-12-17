<template>
  <v-card class="elevation-12">
    <v-card-title>
      <v-spacer></v-spacer>
      <v-col cols="12" md="4">
        <v-select
            :items="parts"
            v-model="selectedID"
            item-text="name"
            item-value="ID"
            label="Select Part"
            dense
            @change="options.page = 1; getPartWatches();"
        ></v-select>
      </v-col>

    </v-card-title>

    <v-data-table
        :headers="headers"
        :items="watches"
        :loading="loading"
        :options.sync="options"
        :server-items-length="totalWatches"
        :footer-props="{
        'items-per-page-options': [10, 15, 20],
        'show-current-page': true,
        'show-first-last-page': true,
      }"
        :items-per-page="10"
        must-sort
    >
      <v-data-table-header>Some Text</v-data-table-header>

      <template v-slot:item.User.full_name="{item}">
        {{ item.user.fullName }}
      </template>

      <template v-slot:item.start_at="{item}">
        {{ item.startAt | moment }}
      </template>

      <template v-slot:item.valid_till="{item}">
        {{ item.validTill | moment }}
      </template>

    </v-data-table>
  </v-card>

</template>

<script>
import api from "@/gateways/api";
import moment from "moment";

export default {
  name: "VideoPartWatches",
  props: ['parts'],
  data() {
    return {
      selectedID: 0,
      headers: [
        {text: 'Student Name', value: 'User.full_name'},
        {text: 'Start Time', value: 'start_at'},
        {text: 'End Time', value: 'valid_till'},
      ],
      watches: [],
      loading: false,
      options: {
        sortBy: ['start_at'],
        sortDesc: ['true']
      },
      totalWatches: 0,
    }
  },
  methods: {
    getPartWatches() {
      this.loading = true
      const {sortBy, sortDesc, page, itemsPerPage} = this.options
      api({
        method: "GET",
        url: "/admin/videos/watches/part",
        params: {
          partID: this.selectedID,
          page: page,
          itemsPerPage: itemsPerPage,
          sortBy: sortBy,
          sortDesc: sortDesc,
        }
      }).then(response => {
        this.totalWatches = response.data.total
        this.watches = response.data.watches
        console.log(this.watches)
      }).finally(() => {
        this.loading = false
      })
    }
  },
  watch: {
    options: {
      handler() {
        this.getPartWatches()
      },
      deep: true,
    },
  },
  filters: {
    moment: function (date) {
      return moment(date).format('dddd Do MMM YYYY, h:mm a');
    },
  }
}
</script>

<style scoped>

</style>