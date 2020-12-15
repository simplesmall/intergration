
/**
 * Created by 简小
 * Created on lucky 2020/12/14  21:58
 */
const actions = {
  initUtils (context) {
    context.commit('initUtils')
  },
  scrollToBottomAct (context) {
    context.commit('scrollToBottom')
  },
  setCallTimerAct (context, timer) {
    context.commit('setCallTimer', timer)
  },
  clearCallTimerAct (context) {
    context.commit('clearCallTimer')
  },
  sendMsgFromEditAct (context, url) {
    context.commit('sendMsgFromEdit', url)
  },
  setTempObj (context, param) {
    context.commit('setTempObj', param)
  },
  setToAvatarAct (context, url) {
    context.commit('setToAvatar', url)
  },
  setVideoObjOnlineAct (context, bool) {
    context.commit('setVideoObj', {key: 'online', val: bool})
  },
  setVideoObjAccountAct (context, account) {
    context.commit('setVideoObj', {key: 'account', val: account})
  },
  setVideoObjParallelAct (context, bool) {
    context.commit('setVideoObj', {key: 'parallel', val: bool})
  },
  setProfileAct (context, user) {
    context.commit('setProfile', {key: 'account', val: user.account})
    context.commit('setProfile', {key: 'avatar', val: user.avatar})
    context.commit('setProfile', {key: 'nick', val: user.nick})
    context.commit('setProfile', {key: 'sign', val: user.sign})
    context.commit('setProfile', {key: 'email', val: user.email})
  },
  hangUp (context) {
    context.commit('hangup')
    if (document.getElementById('playAudio').loop) {
      document.getElementById('playAudio').loop = false
    }
    /* this.$message({
      message: '视频通话结束...',
      type: 'success',
      showClose: true,
    }) */
    console.log('Hang up have been igitate....')
  },
  setFullScreenAct (context, bool) {
    context.commit('setFullScreen', bool)
  },
  setSnapShotAct (context, bool) {
    context.commit('setSnapShot', bool)
  },
  setOpenMsgViewAct (context, bool) {
    context.commit('setOpenMsgView', bool)
  },
  setDataURLAct (context, url) {
    context.commit('setDataURL', url)
  },
  setIsCalledAct (context, bool) {
    context.commit('setIsCalled', bool)
  },
  setCallingAct (context, bool) {
    context.commit('setCalling', bool)
  },
  setAudioUrlAct (context, url) {
    context.commit('setAudioUrl', url)
  },
  setVideoViewRemoteWidthAct (context, param) {
    context.commit('setVideoViewRemoteWidth', param)
  },
  setVideoViewRemoteHeightAct (context, param) {
    context.commit('setVideoViewRemoteHeight', param)
  },
  setAcceptAct (context, num) {
    context.commit('setAccept', num)
  },
  setEnsureVideoCountAct (context, num) {
    context.commit('setEnsureVideoCount', num)
  },
  setOutputFileURLAct (context, url) {
    context.commit('setOutputFileURL', url)
  },
  setNimAct (context, nim) {
    context.commit('setNim', nim)
  },
  setNetcallAct (context, netcall) {
    context.commit('setNetcall', netcall)
  },
  setDateAct (context, data) {
    context.commit('setDate', data)
  },
  setTempSessionAct (context, params) {
    context.commit('setTempSession', params)
  },

  removeNimAct (context) {
    context.commit('removeNim')
  },
  pushMsgAct (context, msgs) {
    context.commit('pushMsg', msgs)
  }
}
export default actions
