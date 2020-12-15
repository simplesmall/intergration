<template>
    <!-- 截图以及编辑截图 v-show="localCalling || localisCalled"  -->
    <div v-show="localCalling || localisCalled">
        <div class="edit" v-show="whichShow">
            <img src="https://tse2-mm.cn.bing.net/th/id/OIP.mCEOIgIUctrICYJIYtJ6vQHaHa?pid=Api&rs=1"
                 id="netNode" style="display: none">
            <!-- 打开全屏按钮   -->
            <!--<div style="z-index:1;display: flex;flex-direction: row;justify-content: end;justify-items: end;margin:0 5px 0 auto"
                 @click="fullScreen">
                <p style="font-size: 18px;margin-right: 150px;margin-top:5px;color: #EBEBEF">
                    {{this.$store.state.videoObj.account}}</p>
                <i class="el-icon-full-screen" style="font-size: 22px; padding:10px 5px; color:#FFF"></i>
            </div>-->

            <!--远程对端画面-->
            <div id="remoteContainer">
            </div>

            <!--截图,挂断按钮-->
            <el-row style="position: absolute; bottom: 20px;">
                <!--<el-button type="primary" icon="el-icon-camera-solid" round @click="snapShot">截图
                </el-button>-->
                <el-button type="danger" icon="el-icon-switch-button" round @click="VideoHangup">挂断
                </el-button>
            </el-row>
        </div>

        <div style="width: 88px;height: 88px;background-color: #409EFF;margin-left: 5px;border-radius: 10px;cursor: pointer"
             v-show="!whichShow" @click="backToVideo">
            <i class="el-icon-phone-outline" style="color: springgreen;margin-top: 5px;font-size: 32px;"/>
            <p style="margin: 3px;color: white">{{this.$store.state.videoObj.account.length > 8 ?
                this.$store.state.videoObj.account.substring(0, 8) + '...' : this.$store.state.videoObj.account}}</p>
            <p style="font-size: 13px;margin: 5px;">保持通话中</p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'Video',
  data () {
    return {
      localParallel: true,
      FullStatus: false,
      localSnapshot: false,
      localisCalled: false,
      localCalling: false,
      videoViewRemoteWidth: 450,
      videoViewRemoteHeight: 600
    }
  },
  computed: {
    whichShow: function () {
      return !!this.localParallel
    }
  },
  methods: {
    backToVideo () {
      console.log(this.$store.state.videoObj.account)
      for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
        if (this.$store.state.data.sessions[i].to === this.$store.state.videoObj.account) {
          // 开启消息视图
          this.$store.dispatch('setOpenMsgViewAct', true)
          // 传递一个sessions的对象到本地
          // this.tempSession.tempObj = sessions[i]
          this.$store.commit('setTempSession', {
            key: 'tempObj',
            val: this.$store.state.data.sessions[i]
          })
          // 暂存该聊天对象聊天信息
          // this.tempSession.tempMsgs = this.$store.state.data.msgs[sessions[i].id]
          this.$store.commit('setTempSession', {
            key: 'tempMsgs',
            val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
          })
          this.$store.dispatch('setVideoObjParallelAct', true)
          this.$emit('scrollToBottom')
        }
      }
    },
    VideoHangup () {
      // this.$emit('UpHangup')
      this.$store.dispatch('hangUp')
    },
    // 全屏按钮
    fullScreen () {
      this.FullStatus = this.$store.state.isFullScreen
      this.$store.dispatch('setFullScreenAct', !this.FullStatus)
      this.FullStatus = this.$store.state.isFullScreen

      // 退出全屏
      /* var video = document.querySelector("video")
                var canvasElement = document.createElement("canvas");
                var mop = canvasElement.getContext("2d");
                var pat = mop.createPattern(document.getElementById('netNode'), 'repeat');
                mop.rect(0, 0, 680, 700);
                mop.fillStyle = pat;

                canvasElement.width = 680;
                canvasElement.height = 700;
                console.log(video.videoWidth, video.videoHeight, (680 - video.videoWidth) / 2, (700 - video.videoHeight) / 2)

                mop.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, (680 - video.videoWidth) / 2, (700 - video.videoHeight) / 2, video.videoWidth, video.videoHeight);
                mop.fill(); */
    },
    // 进入全屏
    openFull () {
      this.videoViewRemoteWidth = 600
      this.videoViewRemoteHeight = 800
      this.$store.dispatch('setVideoViewRemoteWidthAct', 600)
      this.$store.dispatch('setVideoViewRemoteHeightAct', 800)
      var docE = document.querySelector('.edit')
      if (docE.requestFullScreen) {
        docE.requestFullScreen()
      } else if (docE.mozRequestFullScreen) {
        docE.mozRequestFullScreen()
      } else if (docE.webkitRequestFullScreen) {
        docE.webkitRequestFullScreen()
      }
    },
    // 退出全屏
    exitFull () {
      this.videoViewRemoteWidth = 450
      this.videoViewRemoteHeight = 600
      this.$store.dispatch('setVideoViewRemoteWidthAct', 450)
      this.$store.dispatch('setVideoViewRemoteHeightAct', 600)
      var docE = document
      if (docE.FullScreen) {
        docE.exitFullscreen()
      } else if (docE.mozFullScreen) {
        docE.mozCancelFullScreen()
      } else if (docE.webkitIsFullScreen) {
        docE.webkitCancelFullScreen()
      }
    },
    setBackgroundImg (canvas, dataURL) {
      console.log('setBackgroundImg CANVAS IS RUNNING')

      canvas.setBackgroundColor('rgb(255,255,255)')

      canvas.setBackgroundImage(dataURL,
        canvas.renderAll.bind(canvas), {
          // scaleY: this.canvas.height / 680,
          // scaleX: this.canvas.width / 700,
          originX: 'left',
          originY: 'top'
        })
    },
    // 清空画布上的指定内容
    clearCanvas (canvas) {
      console.log('CLEAR CANVAS IS RUNNING')
      canvas.clear()
    },
    //  截取视频截图
    snapShot () {
      // this.clearCanvas(this.THIS.canvas)
      // 退出全屏
      this.$store.dispatch('setFullScreenAct', false)

      this.exitFull()

      // if (this.$store.state.netcall){

      var video = document.querySelector('video')
      var canvasElement = document.createElement('canvas')

      // mop 作为画布背景来操作
      var mop = canvasElement.getContext('2d')

      var pat = mop.createPattern(document.getElementById('netNode'), 'repeat')
      mop.rect(0, 0, 680, 700)
      mop.fillStyle = pat

      canvasElement.width = 680
      canvasElement.height = 700
      // canvasElement.width = video.videoWidth, canvasElement.height = video.videoHeight;

      // 生成截图
      // drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
      // eslint-disable-next-line no-tabs
      // sx	可选。开始剪切的 x 坐标位置。 swidth	可选。被剪切图像的宽度。
      // eslint-disable-next-line no-tabs
      // x 在画布上放置图像的 x 坐标位置。  width	可选。要使用的图像的宽度。（伸展或缩小图像） 680-video.videoWidth)/2
      console.log(video.videoWidth, video.videoHeight, (680 - video.videoWidth) / 2, (700 - video.videoHeight) / 2)

      mop.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, (680 - video.videoWidth) / 2, (700 - video.videoHeight) / 2, video.videoWidth, video.videoHeight)

      mop.fill()

      var dataURL = canvasElement.toDataURL('image/png')
      // this.setBackgroundImg(this.THIS.canvas,dataURL)

      // 更改截图状态
      this.$store.dispatch('setSnapShotAct', true)

      this.$store.dispatch('setDataURLAct', dataURL)

      // }
    }
  },
  watch: {
    '$store.state.videoObj.parallel': function (val) {
      console.log('视频框显示方式改变一下', val)
      this.localParallel = val
    },
    '$store.state.videoObj.account': function (val) {
      console.log('ACCOUNT HAS BEEEN CHANGED:', val)
      console.log('ONLINE HAS BEEEN CHANGED:', this.$store.state.videoObj.online)
    },
    '$store.state.isFullScreen': function (val) {
      this.FullStatus = val
      console.log('VIDEO 监听到全局全屏状态变化了', this.FullStatus, val)
      if (this.FullStatus) {
        this.openFull()
      } else {
        this.exitFull()
      }
      this.$forceUpdate()
      this.$message({
        message: this.FullStatus ? '开启全屏' : '退出全屏',
        type: this.FullStatus ? 'success' : 'warning'
      })
    },
    '$store.state.isSnapshot': function (val) {
      this.localSnapshot = val
      console.log(this.localSnapshot)
    },
    '$store.state.isCalled': function (val) {
      this.localisCalled = val
    },
    '$store.state.calling': function (val) {
      this.localCalling = val
    },
    '$store.state.videoViewRemoteWidth': function (val) {
      this.videoViewRemoteWidth = val
    },
    '$store.state.videoViewRemoteHeight': function (val) {
      this.videoViewRemoteHeight = val
    }
  }
}
</script>

<style scoped>
    #remoteContainer {
        width: 100%;
        height: 90%;
        /*background-color: lightblue;*/
    }

    .edit {
        z-index: 2;

        width: 450px;
        height: 82%;
        margin-left: 20px;
        position: relative;
        /*background-color: darkcyan;*/
        /*background: linear-gradient(to bottom,dodgerblue 0%, #fff 100%);*/
        background-color: rgba(255, 255, 255, 0.18);
        /* border-radius: 5px 5px 5px 5px; */
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
