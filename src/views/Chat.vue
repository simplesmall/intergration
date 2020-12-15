<template>
  <div class="main_content">
    <div class="main">
      <!-- 侧边栏 -->
      <!-- <Aside @pushMsg="pushMsg" :profile="profile"
             :form="form"
             @scrollToBottom="scrollToBottom"
      />-->
      <!--   内容框-->
      <div class="content">
        <!--主页面-->
        <div class="body">
          <div class="outer" style="z-index: 2">
          <!--  聊天页面   v-show="localOpenMsgView && !localFull && !localSnapshot"-->
            <div class="chat">
              <!--       v-show="this.$store.state.tempSession.openMsgView && !THIS.isFullScreen && !THIS.isSnapshot">-->
              <div class="msgProfile">
                <div style="font-size:18px;display: inline-flex;align-items: center">
                  {{this.$store.state.tempSession.tempObj.to}}
                </div>
                <i class="el-icon-info" style="font-size: 18px; padding:0px 12px; color:#000;cursor: pointer;"
                   @click="getFriendProfile"></i>
                <!-- 好友用户信息显示 -->
                <el-dialog title="好友信息" :visible.sync="dialogFriendProfileVisible" :append-to-body="true">
                  <el-form :model="form">
                    <el-form-item label="用户账号" label-width="120px">
                      {{tempUser.account}}
                    </el-form-item>
                    <el-form-item label="用户邮箱" label-width="120px">
                      {{tempUser.email}}
                    </el-form-item>
                    <el-form-item label="用户昵称" label-width="120px">
                      {{tempUser.nick}}
                    </el-form-item>
                  </el-form>
                  <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFriendProfileVisible = false">关闭</el-button>
                  </div>
                </el-dialog>
              </div>
              <!-- 聊天收发页面 -->
              <div class="msgHistory">
                <!-- 循环输出聊天消息 .slice(this.$store.state.tempSession.tempMsgs.length-20,) -->
                <!--           v-for="(msg,index) in this.THIS.tempSession.tempMsgs.slice(this.THIS.tempSession.tempMsgs.length-20,)"-->
                <div class="item" :class="sender(msg)"
                     v-for="(msg,index) in this.$store.state.tempSession.tempMsgs.slice(this.$store.state.tempSession.tempMsgs.length-20,this.$store.state.tempSession.tempMsgs.length)"
                     :key="index">
                  <img class="header-img" :src="showUserAvatar(msg)"/>
                  <span class="message" :style="messageBGC(msg)" v-html="showMsgRefType(msg)"
                        @click="handlePictureCardPreview(msg)"></span>
                  <!-- 时间戳显示 -->
                </div>
                <!--全屏展示图片预览dialog-->
                <el-dialog :visible.sync="dialogImageVisible" :append-to-body="true">
                  <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
              </div>
              <!--消息输入框-->
              <div class="inputBox">
                <div id="chooseMethod" style="font-size: 24px;">
                  <input type="file" name="打开文件" id="file" style="display:none" @change="sendPic">
                  <i class="el-icon-picture space" style="cursor: pointer;" @click="openFile"></i>
                  <i class="el-icon-video-camera space" style="cursor: pointer;" @click="chatVideo"></i>
                  <el-button size="small"
                             style="align-self: end;margin-left:auto;width: 150px;border-bottom: 0px;border-top: 0px;background-color:#EBEBEF;border-radius: 0px"
                             @click="sendMsg(inputMsg)">发送
                  </el-button>
                </div>
                <div class="textArea">
                  <el-input
                    style="height: 117px;min-height: 117px;max-height: 117px"
                    type="textarea"
                    :autosize="{ minRows: 5, maxRows: 5}"
                    placeholder=" 开始愉快的聊天~可按 ctrl+enter 键快捷发送,enter键换行"
                    v-model="inputMsg"
                    v-on:keyup.ctrl.enter.native="sendMsg(inputMsg)">
                  </el-input>
                </div>
              </div>
            </div>
          <!-- 视频及截图页面 -->
          <Video
            v-on:outDataURL="enterCanvas"
          />
          </div>
        </div>
        <HidePlayer/>
      </div>
      <div style="height:110px;width: 120%;font-size: 60px;
                     color: #909292;position: fixed;z-index: 1;
                     text-shadow: -1px -1px 1px #000, 1px 1px 1px #fff;
                        -webkit-user-select:none;
                         -moz-user-select:none;
                         -ms-user-select:none;
                         user-select:none;
                        ">
        {{sysLogo}}
      </div>
    </div>
  </div>
</template>

<script>
import Video from './Video'
import HidePlayer from './HidePlayer'
import Event, {MD5} from '../utils/md5.js'

import NIM from '../SDK/NIM_Web_NIM_v8.1.0'
import nimConfig from '../config/nim-config'

export default {
  name: 'Chat',
  data () {
    return {
      sysLogo: nimConfig.sysLogo,
      // 发起呼叫
      calling: false,
      timer: null,
      // 音频地址
      audioUrl: '',
      // 打开聊天窗口
      openMsgView: false,

      // 登录状态信息
      loginSession: false,
      // 是否已登录，如果未登录则显示登录页面
      isLogined: true,

      // SDK基础配置
      account: nimConfig.account,
      password: nimConfig.password,

      profile: {
        account: '',
        nick: '',
        sign: '',
        avatar: ''
      },
      // ==============上面是登录页
      callTimer: null,
      videoAccount: '',
      accept: 0,
      ensureVideoCount: 0,
      localFileURL: '',
      localOpenMsgView: false,
      form: {
        name: '',
        toAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
      },
      tempUser: {
        nick: null,
        avatar: '',
        account: null,
        email: null
      },
      videoViewRemoteWidth: 450,
      videoViewRemoteHeight: 600,
      localSnapshot: false,
      localFull: false,
      dataURL: '',
      fileURL: '',
      // ########################
      dialogImageUrl: '',
      dialogImageVisible: false,
      dialogFriendProfileVisible: false,
      record: 0,
      inputMsg: null
    }
  },
  methods: {
    // 初始化netcall
    initNetCall () {
      console.log(this.$store.state.nim)
      this.$store.state.NIM.use(this.$store.state.NetCall)
      this.netcall = this.$store.state.NetCall.getInstance({
        kickLast: true,
        nim: this.$store.state.nim,
        container: document.getElementById('container'),
        remoteContainer: document.getElementById('remoteContainer'),
        chromeId: '',
        // 是否开启日志打印
        debug: false,
        saveLogs: {
          isSavedLogs: true,
          useLocalStorage: false,
          maxLogsLines: 10000,
          logFilename: 'logFilename'
        }
      })
      this.$store.commit('setNetcall', this.netcall)
      console.log(this.$store.state.netcall)

      this.initWebRTCEvent()
    },
    // 初始化webrtc事件
    initWebRTCEvent () {
      // 是否被叫中
      let beCalling = false
      // 被叫信息
      let beCalledInfo = null
      // 是否正忙
      let busy = false
      // 呼叫类型
      // eslint-disable-next-line no-unused-vars
      let type = null

      let netcall = this.$store.state.netcall
      let WebRTC = this.$store.state.NetCall
      const Netcall = this.$store.state.NetCall

      const sessionConfig = {
        videoQuality: this.$store.state.NetCall.CHAT_VIDEO_QUALITY_HIGH,
        videoFrameRate: this.$store.state.NetCall.CHAT_VIDEO_FRAME_RATE_15,
        videoBitrate: 0,
        recordVideo: false,
        recordAudio: false,
        highAudio: false,
        bypassRtmp: false,
        rtmpUrl: '',
        rtmpRecord: false,
        splitMode: this.$store.state.NetCall.LAYOUT_SPLITLATTICETILE
      }
      console.log('Init webRTC Event...')

      netcall.on('beCalling', (obj) => {
        this.$store.dispatch('setIsCalledAct', true)
        console.log('on beCalling', obj, this.ensureVideoCount)
        this.$store.dispatch('setVideoObjAccountAct', obj.account)

        this.$store.commit('setTempSession', {
          key: 'tempObj',
          val: this.$store.state.data.sessions[0]
        })

        this.$store.dispatch('setTempObj', obj.account)

        if (this.ensureVideoCount < 1) {
          this.open()
        }

        const channelId = obj.channelId
        // 被叫回应主叫自己已经收到了通话请求
        netcall.control({
          channelId: channelId,
          command: WebRTC.NETCALL_CONTROL_COMMAND_START_NOTIFY_RECEIVED
        })
        // 只有在没有通话并且没有被叫的时候才记录被叫信息, 否则通知对方忙并拒绝通话
        if (!netcall.calling && !beCalling) {
          type = obj.type
          beCalling = true
          beCalledInfo = obj
        } else {
          if (netcall.calling) {
            busy = netcall.notCurrentChannelId(obj)
          } else if (beCalling) {
            busy = beCalledInfo.channelId !== channelId
          }
          if (busy) {
            netcall.control({
              channelId: channelId,
              command: WebRTC.NETCALL_CONTROL_COMMAND_BUSY
            })
            // 拒绝通话
            netcall.response({
              accepted: false,
              beCalledInfo: obj
            })
            this.$store.dispatch('setEnsureVideoCountAct', 0)
          } else {
            if (this.accept === 1) {
              console.log('NAJIUSHUCHU JIESHOU接收接收.....')

              this.$store.dispatch('setAcceptAct', 0)

              beCalling = false
              this.$store.dispatch('setEnsureVideoCountAct', 0)

              const channelId = obj.channelId
              // 通知对方自己已经收到此次通话的请求
              netcall.control({
                channelId: channelId,
                command: WebRTC.NETCALL_CONTROL_COMMAND_START_NOTIFY_RECEIVED
              })
              // 连接媒体网关
              netcall.startRtc()
              // 开启麦克风
              netcall.startDevice({
                type: Netcall.DEVICE_TYPE_AUDIO_IN
              }).catch(function (err) {
                console.log('启动麦克风失败')
                console.error(err)
              })
              // 设置采集音量
              console.log('设置音量采集')
              netcall.setCaptureVolume(255)
              // 确认接受通话
              netcall.response({
                accepted: true,
                beCalledInfo: obj,
                sessionConfig: sessionConfig
              }).catch((err) => {
                console.log('接听失败', err)
              })

              // 如果未打开聊天窗则开启聊天窗
              if (!this.$store.state.openMsgView) {
                this.$store.dispatch('setOpenMsgViewAct', true)

                this.$store.dispatch('setToAvatarAct', '')
                this.$store.state.nim.getUser({
                  account: obj.account,
                  // eslint-disable-next-line handle-callback-err
                  done: (error, user) => {
                    console.log(user.avatar)
                    if (user.avatar) {
                      this.$store.dispatch('setToAvatarAct', user.avatar)
                    }
                  }
                })
                for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                  if (this.$store.state.data.sessions[i].to === obj.account) {
                    console.log('根据teamId得到sessions:' + this.$store.state.data.sessions.length)
                    console.log('sessions  To:' + this.$store.state.data.sessions[i].to)
                    console.log('openMsgView:::  ' + this.$store.state.tempSession.openMsgView)

                    console.log(this.$store.state.data.sessions[i].id)
                    console.log(this.$store.state.data.msgs[this.$store.state.data.sessions[i].id])

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
                    this.$store.dispatch('scrollToBottomAct')
                  }
                }
                this.$forceUpdate()
              }

              // 在回调里监听对方加入通话，并显示对方的视频画面
              netcall.on('remoteTrack', obj => {
                this.$store.dispatch('setIsCalledAct', true)
                console.log('user join', obj)
                // 在此处修改加入通话的对象属性
                this.$store.dispatch('setVideoObjOnlineAct', true)
                // 播放对方声音
                netcall.startDevice({
                  type: Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT
                }).catch(function (err) {
                  console.log('播放对方的声音失败')
                  console.error(err)
                })
                // 预览对方视频画面
                netcall.startRemoteStream({
                  account: obj.account,
                  node: document.getElementById('remoteContainer')
                })
                // 设置对方预览画面大小
                netcall.setVideoViewRemoteSize({
                  account: obj.account,
                  width: this.videoViewRemoteWidth,
                  height: this.videoViewRemoteHeight,
                  cut: true
                })
              })
            } else if (this.accept === 2) {
              console.log('JUJUEJUJUE  拒绝拒绝了')
              // 点击拒绝视频通话
              netcall.control({
                channelId: obj.channelId,
                command: Netcall.NETCALL_CONTROL_COMMAND_BUSY
              })
              netcall.response({
                accepted: false,
                beCalledInfo: obj
              })

              this.$store.dispatch('hangUp')

              beCalling = false
            }
          }
        }
      })

      this.$store.state.netcall.on('callAccepted', obj => {
        console.log('Calling was callAccepted....' + obj)
        this.$store.dispatch('clearCallTimerAct')

        this.$store.state.netcall.startRtc().then(() => {
          this.$store.state.netcall.startLocalStream()
          this.$store.state.netcall.startRemoteStream({account: this.$store.state.tempSession.tempObj.to})
        }).catch(err => {
          console.log(err)
        })
      })
      this.$store.state.netcall.on('callRejected', obj => {
        this.$store.dispatch('clearCallTimerAct')

        this.$store.dispatch('hangUp')
        console.log('Calling was callRejected....' + obj)
      })
      this.$store.state.netcall.on('control', (obj) => {
        console.log('收到指令', obj)
      })
      this.$store.state.netcall.on('hangup', obj => {
        this.$store.dispatch('clearCallTimerAct')

        this.$store.dispatch('hangUp')
        console.log('Calling was hangUp....' + obj)
      })
    },
    // 是否接收视频的confirm
    open () {
      this.$confirm(
        '    <el-avatar :size="60" src="https://empty">\n' +
          '          <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>\n' +
          '    </el-avatar>\n' +
          '    <p style="color: #cecece">' + this.$store.state.videoObj.account + '</p>\n', '视频请求', {
          confirmButtonText: '接收',
          confirmButtonClass: 'el-icon-phone',
          cancelButtonText: '挂断',
          cancelButtonClass: 'el-icon-phone-outline',
          roundButton: true,
          dangerouslyUseHTMLString: true,
          center: true
        }).then(() => {
        this.$store.dispatch('setAcceptAct', 1)
        if (document.getElementById('playAudio').loop) {
          document.getElementById('playAudio').loop = false
        }

        console.log('成功接到了猪')
        this.$message({
          type: 'success',
          message: '视频接通!'
        })
      }).catch(() => {
        this.$store.dispatch('setAcceptAct', 2)
        if (document.getElementById('playAudio').loop) {
          document.getElementById('playAudio').loop = false
        }
        console.log('猪跑了')
        this.$message({
          type: 'error',
          message: '未接听'
        })
      }).finally(
        // this.audioUrl = "https://app.yunxin.163.com/webdemo/im/audio/avchat_ring.mp3",
        this.$store.dispatch('setAudioUrlAct', 'https://app.yunxin.163.com/webdemo/im/audio/avchat_ring.mp3'),
        console.log('我呼叫你时播放的语音'),
        document.getElementById('playAudio').load(),
        document.getElementById('playAudio').play(),
        document.getElementById('playAudio').loop = true,
        this.ensureVideoCount += 1,
        this.$store.dispatch('setEnsureVideoCountAct', this.ensureVideoCount)
      )
    },
    // 滚动至聊天框最底端
    scrollToBottom () {
      let content = document.querySelector('.msgHistory')
      if (content) {
        let height = content.scrollHeight ? content.scrollHeight : 3000
        content.scroll({top: height, left: 0, behavior: 'smooth'})
      }
    },
    /**
       * 执行登录
       * @param account
       * @param password
       */
    doLogin (account, password) {
      this.account = account
      this.password = password
      this.initNIM()
    },

    /**
       * 清除登录状态信息
       */
    clearLoginSession () {
      localStorage.removeItem('login_user')
    },

    /**
       * 获取登录状态信息
       */
    getLoginSession () {
      return localStorage.getItem('login_user')
    },

    /**
       * 保存登录信息
       */
    saveLoginSession (account, password) {
      localStorage.setItem('login_user', JSON.stringify({account: account, password: password}))
    },

    pushMsg (msgs) {
      if (!Array.isArray(msgs)) {
        msgs = [msgs]
      }
      console.log('pushMsg====>>>>>')
      var sessionId = msgs[0].sessionId
      this.$store.state.data.msgs = this.$store.state.data.msgs || {}
      this.$store.state.data.msgs[sessionId] = this.$store.state.nim.mergeMsgs(this.$store.state.data.msgs[sessionId], msgs)
    },
    /**
       * 连接SDK
       */
    initNIM () {
      let STATE = this.$store.state

      this.nim = NIM.getInstance({
        appKey: nimConfig.appKey,
        account: this.account,
        token: localStorage.getItem('login_user') ? JSON.parse(localStorage.getItem('login_user')).password : MD5(this.password),

        db: false, // 若不要开启数据库请设置false。SDK默认为true。

        // --连接
        onconnect: (obj) => {
          this.$store.commit('setNim', this.nim)

          console.log('连接成功')
          console.log(obj)
          // 连接成功后保存用户登录信息
          if (!localStorage.getItem('login_user')) {
            this.saveLoginSession(this.account, MD5(this.password))
          }
        },

        // --重新连接
        onwillreconnect: obj => {
          console.log('SDK即将重新连接')
          console.log(obj)
        },

        // --断开连接
        ondisconnect: obj => {
          console.log(obj)
          console.log('SDK断开连接')
          this.isLogined = false
          if (obj.cmd === 'login' && obj.code === '302') {
            this.$message.error('用户名或密码错误，请重新输入')
            // 如果状态为登录状态，则退出登录，此情况发生在用户更改密码后
            // this.$router.go(0)
          }
        },

        // --发生错误
        onerror: (error, obj) => {
          console.log('对不起我出错了' + error, obj)
          localStorage.clear()
        },

        // --收取个人信息
        onmyinfo: user => {
          console.log('个人信息', user)
          STATE.data.myInfo = user
          this.profile = user
          this.$store.dispatch('setProfileAct', user)
          console.log(this.$store.state.profile)
        },

        onfriends: friends => {
          console.log('好友列表', friends)
          this.$store.commit('setDate', {
            key: 'friends',
            val: STATE.nim.mergeFriends(STATE.data.friends, friends)
          })
          this.$store.commit('setDate', {
            key: 'friends',
            val: STATE.nim.cutFriends(STATE.data.friends, friends.invalid)
          })
        },

        onusers: users => {
          console.log('历史聊天记录', users)
          this.$store.commit('setDate', {
            key: 'users',
            val: STATE.nim.mergeUsers(STATE.data.users, users)
          })
        },

        onupdateuser: user => {
          console.log('用户名片更新了', user)
          STATE.data.users = STATE.nim.mergeUsers(STATE.data.users, user)
          this.$store.commit('setDate', {
            key: 'user',
            val: STATE.nim.mergeUsers(STATE.data.users, user)
          })
        },
        // 会话
        onsessions: sessions => {
          // eslint-disable-next-line no-array-constructor
          let dealedSessions = new Array()
          let counter = 0
          console.log('收到会话列表', sessions)
          for (let session in sessions) {
            if (sessions[session].id.lastIndexOf('team')) {
              dealedSessions[counter++] = sessions[session]
            }
          }
          console.log(dealedSessions)
          STATE.data.sessions = STATE.nim.mergeSessions(STATE.data.sessions, dealedSessions)
        },

        onupdatesession: session => {
          console.log('会话更新了')
          console.log(session)
          console.log(session.id)
          // eslint-disable-next-line no-array-constructor
          let dealedSessions = new Array()
          let counter = 0
          // // for (let temp in session) {
          if (session.id.lastIndexOf('team')) {
            dealedSessions[counter++] = session
          }
          // }
          STATE.data.sessions = STATE.nim.mergeSessions(STATE.data.sessions, dealedSessions)
          if (!this.$store.state.videoObj.online) {
            for (let i = 0; i < STATE.data.sessions.length; i++) {
              // eslint-disable-next-line no-mixed-operators
              if (!(STATE.tempSession.openMsgView === true) && STATE.data.sessions[i].to === session.lastMsg.to || STATE.data.sessions[i].to === session.lastMsg.from) {
                this.$store.commit('setTempSession', {
                  key: 'tempObj',
                  val: STATE.data.sessions[i]
                })
                this.$store.commit('setTempSession', {
                  key: 'tempMsgs',
                  val: STATE.data.msgs[STATE.data.sessions[i].id]
                })
                console.log('抓住会话更新这只螃蟹.....')
                this.$store.dispatch('scrollToBottomAct')
              }
            }
          }
        },

        // --漫游消息
        onroamingmsgs: obj => {
          console.log('漫游消息')
          console.log(obj)
          this.pushMsg(obj.msgs)
        },

        // --离线消息
        onofflinemsgs: (obj) => {
          console.log('离线消息', obj)
          this.pushMsg(obj.msgs)
        },

        // --接收消息
        onmsg: (msg) => {
          console.log('收到消息', msg)
          this.pushMsg(msg)
          if (!this.$store.state.videoObj.online) {
            for (let i = 0; i < STATE.data.sessions.length; i++) {
              if (STATE.data.sessions[i].to === msg.to || STATE.data.sessions[i].to === msg.from) {
                this.$store.commit('setTempSession', {
                  key: 'tempObj',
                  val: STATE.data.sessions[i]
                })
                this.$store.commit('setTempSession', {
                  key: 'tempMsgs',
                  val: STATE.data.msgs[STATE.data.sessions[i].id]
                })
                console.log('抓住收到消息这只螃蟹.....')
              }
            }
          }
        },

        // --多端登录的解决
        onloginportschange: (loginPorts) => {
          console.log('当前登录帐号在其它端的状态发生改变了', loginPorts)
          console.log(loginPorts[0].deviceId)
        },

        // --同步数据
        onsyncdone: () => {
          console.log('同步完成')
          // 设置为用户已登录
          this.isLogined = true

          this.initNetCall()
        }
      })
      this.$store.commit('setNim', this.nim)
    },
    // ==========================登录页面的方法
    // 收到dataURL,带着参数进入DrawBoard
    enterCanvas (inputDataURL) {
      this.dataURL = inputDataURL
      console.log('进入编辑图片界面')
    },
    // 图片预览弹窗
    handlePictureCardPreview (msg) {
      switch (msg.type) {
        case 'image':
        case 'file':
          if (msg.file.type === 'PNG' || msg.file.type === 'JPEG' || msg.file.type === 'JPG' || msg.file.ext === 'jpg') {
            this.dialogImageUrl = msg.file.url
            this.dialogImageVisible = true
            console.log(this.dialogImageUrl, this.dialogImageVisible)
          }
          return msg.file.url
        case 'audio':
          this.$store.dispatch('setAudioUrlAct', msg.file.mp3Url)
          console.log('播放语音')
          document.getElementById('playAudio').load()
          document.getElementById('playAudio').play()
          return msg
        case 'notification':
          console.log(msg.from, msg.to)
          this.$store.dispatch('setVideoObjParallelAct', true)
          this.call(msg.from === this.$store.state.data.myInfo.account ? msg.to : msg.from)
        // eslint-disable-next-line no-fallthrough
        default:
      }
    },
    // 不同类型消息分别格式化显示
    showMsgRefType (msg) {
      switch (msg.type) {
        case 'text':
          return msg.text
        case 'image':
          return '<img src="' + msg.file.url + '" alt="" style="width: 550px">'
        case 'notification':
          var netcallType = msg.attach.netcallType === 2 ? '<i class="el-icon-video-camera"></i>' : '<i class="el-icon-phone-outline"></i>'
          msg = msg.text === '' ? netcallType + ' ' + parseInt(msg.attach.duration / 60) + ':' + (msg.attach.duration % 60) : netcallType + msg.text
          return '<div style="color: red;cursor: pointer;">' + msg + '</div>'
        case 'audio':
          // eslint-disable-next-line no-unused-vars
          var mp3Url = msg.file.mp3Url
          // eslint-disable-next-line no-unused-vars
          var playAudio = '@click.native="this.showTips"'
          return '<div style="background-color:cornflowerblue;font-size: 16px;border-radius: 5px;" +@click.stop="this.showTips"+>' +
              '<i class="el-icon-video-play">' + msg.file.dur / 1000 + 's</div>'
        case 'file':
          if (msg.file.type === 'PNG' || msg.file.type === 'JPEG' || msg.file.type === 'WEBP') {
            let command = '@click.native="this.getUserInfo(\'jiandan\')"'
            return '<img src="' + msg.file.url + '" alt="" style="object-fit:cover;background-size: cover;width: 100%;height:100%;cursor: pointer;" ' + command + '>'
          }
        // eslint-disable-next-line no-fallthrough
        case 'tip':
          return msg.tip
        case 'custom':
          return '定制消息'
        default:
          return msg
      }
    },
    // 消息来源不同显示背景不同
    messageBGC (msg) {
      let background = msg.to === this.$store.state.tempSession.tempObj.to ? 'background: #9eea6a;' : 'background: #efefef;'
      let maxWidth = msg.type === 'image' || msg.type === 'file' ? 'max-width: 41%;' : 'max-width: 66%;'
      return background + maxWidth
    },
    // 显示聊天用户头像
    showUserAvatar (msg) {
      let myAvatar = this.$store.state.data.myInfo.avatar ? this.$store.state.data.myInfo.avatar : 'https://bing.ioliu.cn/v1/rand?&w=200&h=200'
      let toAvatar = this.$store.state.toAvatar ? this.$store.state.toAvatar : this.form.toAvatar
      return msg.from === this.$store.state.profile.account ? myAvatar : toAvatar
    },
    sender (msg) {
      if (msg.from === this.$store.state.profile.account) {
        return 'right'
      } else {
        return 'left'
      }
    },
    // 开启视频聊天
    chatVideo () {
      console.log('开始视频聊天....')
      // this.initNetCall()
      this.call(this.$store.state.tempSession.tempObj.to)
    },
    // 视频呼叫
    call (account) {
      const pushConfig = {
        enable: true,
        needBadge: true,
        needPushNick: true,
        pushContent: '',
        custom: '测试自定义数据',
        pushPayload: '',
        sound: '',
        forceKeepCalling: 0
      }
      const sessionConfig = {
        videoQuality: this.$store.state.NetCall.CHAT_VIDEO_QUALITY_HIGH,
        videoFrameRate: this.$store.state.NetCall.CHAT_VIDEO_FRAME_RATE_15,
        videoBitrate: 0,
        recordVideo: false,
        recordAudio: false,
        highAudio: false,
        bypassRtmp: false,
        rtmpUrl: '',
        rtmpRecord: false,
        splitMode: this.$store.state.NetCall.LAYOUT_SPLITLATTICETILE
      }
      this.$store.state.netcall.call({
        type: this.$store.state.NetCall.NETCALL_TYPE_VIDEO,
        account: account,
        pushConfig: pushConfig,
        sessionConfig: sessionConfig
      }).then(obj => {
        console.log('我呼叫你时播放的语音')
        this.$store.dispatch('setAudioUrlAct', 'https://app.yunxin.163.com/webdemo/im/audio/avchat_connecting.mp3')
        document.getElementById('playAudio').load()
        document.getElementById('playAudio').play()
        document.getElementById('playAudio').loop = true

        console.log(obj)
        this.$store.dispatch('setCallingAct', true)
        const netcall = this.$store.state.netcall
        const Netcall = this.$store.state.NetCall
        // 连接媒体网关
        netcall.startRtc().then(function () {
          // 开启麦克风
          return netcall.startDevice({
            type: Netcall.DEVICE_TYPE_AUDIO_IN
          }).catch(function (err) {
            console.log('启动麦克风失败')
            console.error(err)
          })
        })
          .then(function () {
            // 设置采集音量
            netcall.setCaptureVolume(255)
            /* 开启摄像头
               return netcall.startDevice({
                   type: Netcall.DEVICE_TYPE_VIDEO
               })
                   .catch(function (err) {
                       console.log('启动摄像头失败')
                       console.error(err)
                   }) */
          })
        /* .then(function () {
                //预览本地画面
                netcall.startLocalStream(
                    document.getElementById('localContainer')
                )

                // 设置本地预览画面大小
                netcall.setVideoViewSize({
                    width: 400,
                    height: 300,
                    cut: true
                })
            }) */
          .catch(function (err) {
            console.log('发生错误')
            console.log(err)
            this.$store.dispatch('hangUp')
          })

          // 设置超时计时器
        this.callTimer = setTimeout(() => {
          if (!netcall.callAccepted) {
            console.log('超时未接听,挂断')
            this.$message({
              message: '超时未接听,挂断',
              type: 'error'
            })
            this.$store.dispatch('hangUp')
          }
        }, 1000 * 30)

        this.$store.dispatch('setCallTimerAct', this.callTimer)

        // 在回调里监听对方加入通话，并显示对方的视频画面
        netcall.on('remoteTrack', obj => {
          console.log('用户加入....', obj)
          // 在此处修改加入通话的对象属性
          this.$store.dispatch('setVideoObjOnlineAct', true)
          this.$store.dispatch('setVideoObjAccountAct', obj.account)

          this.$store.state.tempSession.tempObj.to = obj.account

          this.$store.dispatch('setIsCalledAct', true)
          if (document.getElementById('playAudio').loop) {
            document.getElementById('playAudio').loop = false
          }
          // 播放对方声音
          netcall.startDevice({
            type: Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT
          }).catch(function (err) {
            console.log('播放对方的声音失败')
            console.error(err)
          })
          // 预览对方视频画面
          netcall.startRemoteStream({
            account: obj.account,
            node: document.getElementById('remoteContainer')
          })
          // 设置对方预览画面大小
          netcall.setVideoViewRemoteSize({
            account: obj.account,
            width: this.videoViewRemoteWidth,
            height: this.videoViewRemoteHeight,
            cut: true
          })
        })
        this.$store.state.netcall.on('hangup', obj => {
          this.$store.dispatch('clearCallTimerAct')

          this.$store.dispatch('hangUp')
          console.log('Calling was hangUp....' + obj)
        })
      }).catch()
    },
    // 打开本地文件
    openFile () {
      document.getElementById('file').click()
    },
    // 发送消息按钮
    sendMsg (inputMsg) {
      if (inputMsg != null) {
        var str = inputMsg.replace(/(^\s*)|(\s*$)|(\n\r)/g, '')// 去除空格;
      }
      if (str === '' || str === undefined || str === null) {
        this.$message({
          message: '发送消息不能为空',
          type: 'warning'
        })
        return
      }
      let tempObj = this.$store.state.tempSession.tempObj
      let to = tempObj.to
      let scene = tempObj.scene
      console.log(tempObj)
      console.log(tempObj.to)
      console.log(tempObj.scene)
      let msg = this.$store.state.nim.sendText({
        scene: scene,
        to: to,
        text: inputMsg,
        done: (error, msg) => {
          console.log(error)
          console.log(msg)
          console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient)
          console.log('mergeMsgs is running......00000000')
          for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
            if (this.$store.state.data.sessions[i].to === msg.to) {
              this.$store.commit('setTempSession', {
                key: 'tempObj',
                val: this.$store.state.data.sessions[i]
              })
              this.$store.commit('setTempSession', {
                key: 'tempMsgs',
                val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
              })
              console.log('抓住发送消息只螃蟹.....')
            }
          }
          this.$forceUpdate()
        }
      })
      console.log('正在发送p2p text消息, id=' + msg.idClient)
      this.$store.dispatch('pushMsgAct', msg)
      this.inputMsg = ''
    },
    // 发送图片
    sendPic () {
      if (document.getElementById('file').value == null || document.getElementById('file').value === '') {
        this.$message({
          message: '取消发送',
          type: 'warning'
        })
      } else {
        this.$store.dispatch('setSnapShotAct', false)
        let nim = this.$store.state.nim
        nim.previewFile({
          type: 'image',
          fileInput: document.getElementById('file'),
          fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
          uploadprogress: (obj) => {
            console.log('文件总大小: ' + obj.total + 'bytes')
            console.log('已经上传的大小: ' + obj.loaded + 'bytes')
            console.log('上传进度: ' + obj.percentage)
            console.log('上传进度文本: ' + obj.percentageText)
          },
          done: (error, file) => {
            console.log('上传image' + (!error ? '成功' : '失败'))
            // show file to the user
            if (!error) {
              var msg = nim.sendFile({
                scene: 'p2p',
                to: this.$store.state.tempSession.tempObj.to,
                file: file,
                done: (error, obj) => {
                  console.log('语音转文字' + (!error ? '成功' : '失败'), error, obj)
                }
              })
              console.log('正在发送p2p image消息, id=' + msg.idClient)
              this.$store.dispatch('pushMsgAct', msg)
              for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                if (this.$store.state.data.sessions[i].to === msg.to) {
                  this.$store.commit('setTempSession', {
                    key: 'tempObj',
                    val: this.$store.state.data.sessions[i]
                  })
                  this.$store.commit('setTempSession', {
                    key: 'tempMsgs',
                    val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                  })
                  console.log('抓住发送消息只螃蟹.....')
                }
              }
              document.getElementById('file').value = null
              this.$forceUpdate()
            }
          }
        })
      }
    },
    // 获取好友profile
    getFriendProfile () {
      console.log(this.dialogFriendProfileVisible)
      var account = ''
      this.dialogFriendProfileVisible = true
      var tempObj = this.$store.state.tempSession.tempObj
      var list = this.$store.state.data.users
      for (let i = 0; i < list.length; i++) {
        if (tempObj.scene === 'p2p') {
          if (list[i].account === tempObj.to) {
            account = list[i].account
          }
        } else {
          this.tempUser.account = tempObj.id
          this.tempUser.email = '群聊不显示邮箱字段'
          this.tempUser.nick = '群聊消息'
          return
        }
      }
      console.log('openChat:  ' + account)
      this.$store.state.nim.getUser({
        account: account,
        done: (error, user) => {
          this.tempUser = user
          console.log(user)
          console.log('获取用户资料' + (!error ? '成功' : '失败'))
        }
      })
    },
    sendPicFromEdit (dataURL) {
      let nim = this.$store.state.nim
      nim.previewFile({
        type: 'image',
        dataURL: dataURL,
        fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
        uploadprogress: (obj) => {
          console.log('上传进度文本: ' + obj.percentageText)
        },
        done: (error, file) => {
          console.log('上传image' + (!error ? '成功' : '失败'))
          if (!error) {
            var msg = nim.sendFile({
              scene: 'p2p',
              // 编辑好的图片只能发送给当前视频对端用户
              to: this.$store.state.tempSession.tempObj.to,
              file: file,
              done: (error, obj) => {
                console.log('发送图片 ' + (!error ? '成功' : '失败'), error, obj)
              }
            })
            this.$store.dispatch('pushMsgAct', msg)
            for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
              if (this.$store.state.data.sessions[i].to === msg.to) {
                this.$store.commit('setTempSession', {
                  key: 'tempObj',
                  val: this.$store.state.data.sessions[i]
                })
                this.$store.commit('setTempSession', {
                  key: 'tempMsgs',
                  val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                })
                console.log('抓住发送消息只螃蟹.....')
              }
            }
          }
        }
      })
    }
  },
  mounted () {
    Event.$on('sendMsg', val => {
      /* this.$store.state.nim.getUser({
            account: 'simple4',
            done: (error, user)=>{
                console.log(error);
                console.log(user);
                console.log('获取用户资料' + (!error?'成功':'失败'));
            }
        }); */

      console.log(val)

      this.$store.state.nim.previewFile({
        type: 'image',
        dataURL: val,
        fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
        uploadprogress: (obj) => {
          console.log('上传进度文本: ' + obj.percentageText)
        },
        done: (error, file) => {
          console.log('上传image' + (!error ? '成功' : '失败'))
          if (!error) {
            var msg = this.$store.state.nim.sendFile({
              scene: 'p2p',
              // 编辑好的图片只能发送给当前视频对端用户
              to: this.$store.state.tempSession.tempObj.to,
              file: file,
              done: (error, obj) => {
                console.log('发送图片 ' + (!error ? '成功' : '失败'), error, obj)
              }
            })
            this.$store.dispatch('pushMsgAct', msg)
            for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
              if (this.$store.state.data.sessions[i].to === msg.to) {
                this.$store.commit('setTempSession', {
                  key: 'tempObj',
                  val: this.$store.state.data.sessions[i]
                })
                this.$store.commit('setTempSession', {
                  key: 'tempMsgs',
                  val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                })
                console.log('抓住发送消息只螃蟹.....')
              }
            }
          }
        }
      })
    })
  },
  watch: {
    '$store.state.profile': function (val) {
      this.profile = val
    },
    // ========================登录页监听内容
    '$store.state.callTimer': function (val) {
      this.callTimer = val
    },
    '$store.state.videoObj.account': function (val) {
      this.videoAccount = val
    },
    '$store.state.ensureVideoCount': function (val) {
      this.ensureVideoCount = val
    },
    '$store.state.accept': function (val) {
      this.accept = val
    },
    '$store.state.openMsgView': function (val) {
      this.localOpenMsgView = val
    },
    '$store.state.isFullScreen': function (val) {
      this.localFull = val
    },
    '$store.state.isSnapshot': function (val) {
      console.log('Video 监听到 isSnapShot 状态改变:', val)
      this.localSnapshot = val
    },
    '$store.state.videoViewRemoteWidth': function (val) {
      this.videoViewRemoteWidth = val
    },
    '$store.state.videoViewRemoteHeight': function (val) {
      this.videoViewRemoteHeight = val
    },
    '$store.state.outputFileURL': function (val) {
      console.log('我要开始发送图片了.......')
      this.localFileURL = val
      // Event.$emit('sendMsg',val)
      this.sendPicFromEdit(val)
    }
  },
  created () {
    window.onload = (event) => {
      if (localStorage.getItem('login_user')) {
        this.isLogined = true
        let loginSessionJson = JSON.parse(localStorage.getItem('login_user'))
        this.account = loginSessionJson.account
        this.password = loginSessionJson.password
        console.log(loginSessionJson.account + '==========>' + loginSessionJson.password)
        this.initNIM()
      } else {
        this.initNIM()
        this.isLogined = false
      }
    }
  },
  components: {
    Video,
    HidePlayer
  }
}
</script>

<style scoped>
  .body {
    /* display: flex;
    flex-direction: row;
    justify-content: space-evenly; */
    /*height: 86vh;*/
    display: -webkit-box;
    padding: 4px 0 4px;
    height: 100%;
    width: 100%;
    overflow-x: scroll;
    /* background-color: transparent; */
  }

  .content {
    height: 98%;
    padding-left: 50px;
    /*padding-right: 20px;*/
    /*width: calc(100% - 330px);*/
    width: 100%;
  }

  .main {
    margin: 0;
    padding-right: 30px;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .main_content {
    border-radius: 5px 5px 0 0;
    height: 100%;
    background: #4e5359 url('https://app.yunxin.163.com/webdemo/im/images/bg_page.png') no-repeat no-repeat 0 0;
    background-size: cover;
    background-position: 50% 50%;
  }

  ul, li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  html {
    height: 100%;
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #d6d6e6;
    border-radius: 4px;
  }
  /*上面部分是大背景样式*/
  .header-img {
    object-fit: cover;
    width: 40px;
    height: 40px;
    margin: 0 5px;
    border-radius: 20px;
  }

  .message {
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    /*background: #efefef;*/
    /*min-height: 25px;*/
    padding: 9px 10px;
    align-items: start;
    color: #222121;
    max-width: 410px;
    height: auto;
    /*输入连续英文自动断行*/
    word-break: break-all;
  }

  .right .message, .left .message {
    margin: 10px;
  }

  .item {
    display: flex;
    margin-bottom: 10px;
  }

  .left {
    flex-direction: row;
  }

  .right {
    flex-direction: row-reverse;
  }

  #chooseMethod {
    display: flex;
    flex-direction: row;
  }

  #chooseMethod .space {
    margin: 0 5px;
  }

  .msgProfile {
    width: 100%;
    line-height: 40px;
    align-items: center;
    background: #f5f5f5;
    /*margin-bottom: auto;*/
    border-bottom: solid #e7e7e7 1px;
    border-radius: 5px 5px 0 0;
  }

  .msgHistory {
    overflow-y: scroll;
    min-height: auto;
  }

  .inputBox {
    display: flex;
    flex-direction: column;
    justify-content: start;
    justify-items: start;
    width: 100%;
    height: 149px;
    background: #FFFFFF;
    opacity: .9;
    margin-top: auto;
  }

  .inputBox input {
    flex: 1;
    border-radius: 10px;
    border: 1px #cecece solid;
    padding: 3px 4px;
    outline: none;
  }

  .chat {
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 86vh;
    /*width: 49%;*/
    width: 680px;
    /*height: 100%;*/
    background-color: #F5F5F5;
    border-radius: 5px 5px 0 0;
  }
  .outer {
    display: flex;
  }
</style>
