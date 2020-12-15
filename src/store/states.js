/**
 * Created by 简小
 * Created on lucky 2020/12/14  21:58
 */
import nimConfig from '../config/nim-config'
const state = {
  toAvatar: '',
  videoObj: {
    online: false,
    account: 'jiandan',
    parallel: true
  },
  profile: {
    account: '',
    nick: '',
    sign: '',
    avatar: '',
    email: ''
  },
  // 编辑好的图片地址
  outputFileURL: '',
  // 截图图片BASE64
  dataURL: '',
  // 接收视频
  accept: 0,
  // 控制视频弹窗显示
  ensureVideoCount: 0,
  // -- 视频状态控制 ###################
  // 是否全屏
  isFullScreen: false,
  // 是否截图
  isSnapshot: false,
  // 是否被叫
  isCalled: false,
  // 发起呼叫
  calling: false,
  timer: null,
  // 打开聊天窗口
  openMsgView: false,
  videoViewRemoteWidth: 450,
  videoViewRemoteHeight: 600,
  drawHeight: document.body.clientHeight * 0.7,
  // 主动呼叫计时器
  callTimer: null,
  // 音频地址
  audioUrl: '',

  // --以上是全局状态控制#######################
  NIM: null,
  MD5: null,
  nim: null,
  data: {},
  NetCall: null,
  netcall: null,
  tempSession: {
    tempObj: {
      scene: 'p2p',
      to: nimConfig.toFriend
    },
    tempMsgs: ''
  }
}
export default state
