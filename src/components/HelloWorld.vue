<template>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
    }
  },
  created () {
    this.showSDK()
  },
  methods: {
    showSDK () {
      console.log(this.$store.state.NIM)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
