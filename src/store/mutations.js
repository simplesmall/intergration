/**
 * Created by 简小
 * Created on lucky 2020/12/14  21:58
 */
import NIM from '../SDK/NIM_Web_NIM_v8.1.0.js'
import {MD5} from '../utils/md5.js'
import WebRTC from '../SDK/NIM_Web_WebRTC_v8.1.0'

const mutations = {
  scrollToBottom () {
    let content = document.querySelector('.msgHistory')
    if (content) {
      let height = content.scrollHeight ? content.scrollHeight : 3000
      content.scroll({top: height, left: 0, behavior: 'smooth'})
    }
  },
  setCallTimer (state, timer) {
    state.callTimer = timer
  },
  clearCallTimer (state) {
    clearTimeout(state.callTimer)
  },
  setTempObj (state, param) {
    state.tempSession.tempObj.to = param
  },
  setVideoObj (state, params) {
    state.videoObj[params.key] = params.val
  },
  setToAvatar (state, url) {
    state.toAvatar = url
  },
  sendMsgFromEdit (state, dataURL) {
    state.nim.previewFile({
      type: 'image',
      dataURL: dataURL,
      fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
      uploadprogress: (obj) => {
        console.log('上传进度文本: ' + obj.percentageText)
      },
      done: (error, file) => {
        console.log('上传image' + (!error ? '成功' : '失败'))
        if (!error) {
          var msg = state.nim.sendFile({
            scene: 'p2p',
            // 编辑好的图片只能发送给当前视频对端用户
            to: state.tempSession.tempObj.to,
            file: file,
            done: (error, obj) => {
              console.log('发送图片 ' + (!error ? '成功' : '失败'), error, obj)
            }
          })
          this.$store.dispatch('pushMsgAct', msg)
          for (let i = 0; i < state.data.sessions.length; i++) {
            if (state.data.sessions[i].to == msg.to) {
              this.$store.commit('setTempSession', {
                key: 'tempObj',
                val: state.data.sessions[i]
              })
              this.$store.commit('setTempSession', {
                key: 'tempMsgs',
                val: state.data.msgs[state.data.sessions[i].id]
              })
              console.log('抓住发送消息只螃蟹.....')
            }
          }
        }
      }
    })
  },
  initUtils (state) {
    state.NIM = NIM
    state.NetCall = WebRTC
    state.MD5 = MD5

    // console.log(state.NetCall)
    // console.log(state.NIM)
    // console.log(state.MD5)
    console.log('Init NetCall as webRTC version successful')
  },
  hangup (state) {
    state.isCalled = false
    state.accept = 0
    state.calling = false
    state.ensureVideoCount = 0
    state.isFullScreen = false
    state.videoObj.online = false
    state.videoObj.account = ''
    state.videoObj.parallel = true

    state.netcall.hangup()
  },
  setProfile (state, params) {
    state.profile[params.key] = params.val
  },
  setFullScreen (state, bool) {
    state.isFullScreen = bool
  },
  setSnapShot (state, bool) {
    state.isSnapshot = bool
  },
  setIsCalled (state, bool) {
    state.isCalled = bool
  },
  setCalling (state, bool) {
    state.calling = bool
  },
  setVideoViewRemoteWidth (state, param) {
    state.videoViewRemoteWidth = param
  },
  setVideoViewRemoteHeight (state, param) {
    state.videoViewRemoteHeight = param
  },
  setTempSession (state, params) {
    state.tempSession[params.key] = params.val
    console.log(state.tempSession)
    console.log('setTempSession successful!!!')
  },
  setNetcall (state, netcall) {
    state.netcall = netcall
  },
  setAccept (state, num) {
    state.accept = num
  },
  setEnsureVideoCount (state, num) {
    state.ensureVideoCount = num
  },
  setAudioUrl (state, url) {
    state.audioUrl = url
  },
  setOpenMsgView (state, bool) {
    state.openMsgView = bool
  },
  setDataURL (state, url) {
    state.dataURL = url
  },
  setOutputFileURL (state, url) {
    state.outputFileURL = url
  },
  setNim (state, nim) {
    state.nim = nim
    console.log('setNim successful ==>' + state.nim)
    return state.nim
  },
  setDate (state, params) {
    console.log('setDate running...')
    state.data[params.key] = params.val
  },
  getDate (state, key) {
    return state.data[key]
  },
  removeNim (state) {
    state.data = null
    state.nim = null
  },
  pushMsg (STATE, msgs) {
    if (!Array.isArray(msgs)) {
      msgs = [msgs]
    }
    console.log('pushMsg====>>>>>')
    var sessionId = msgs[0].sessionId
    STATE.data.msgs = STATE.data.msgs || {}
    STATE.data.msgs[sessionId] = STATE.nim.mergeMsgs(STATE.data.msgs[sessionId], msgs)
  }
}

export default mutations
