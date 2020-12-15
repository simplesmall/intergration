<template>
  <!-- 隐藏存放语音播放组件-->
  <div style="display: none">
    <audio controls="controls" id="playAudio">
      <source type="audio/mpeg" :src="localAudioURL">
      Your browser does not support the audio element.
    </audio>
  </div>
</template>

<script>
export default {
  name: 'HidePlayer',
  data () {
    return {
      localAudioURL: ''
    }
  },
  watch: {
    '$store.state.audioUrl': function (val) {
      this.localAudioURL = val
    }
  }
}
</script>

<style scoped>

</style>
