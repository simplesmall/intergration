<template>
  <div class="main_content">
    <div class="main">
      <!-- 侧边栏 -->
      <!--<Aside @pushMsg="pushMsg" :profile="profile"
             :form="form"
             @scrollToBottom="scrollToBottom"
      />-->
      <!--   内容框-->
      <div class="content">
        <!--主页面-->
        <div class="body">
        <!--  聊天页面   v-show="localOpenMsgView && !localFull && !localSnapshot"-->
        <div class="chat" >
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
    </div>
  </div>
</template>

<script>
    import Video from "./Video";
    import Event from '../utils/md5.js'

    export default {
        name: "Chat",
        data() {
            return {
                callTimer: null,
                videoAccount: '',
                accept: 0,
                ensureVideoCount: 0,
                localFileURL: '',
                localOpenMsgView: false,
                form: {
                    name: "",
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
                //########################
                dialogImageUrl: '',
                dialogImageVisible: false,
                dialogFriendProfileVisible: false,
                record: 0,
                inputMsg: null,
            }
        },
        methods: {
            // 收到dataURL,带着参数进入DrawBoard
            enterCanvas(inputDataURL) {
                this.dataURL = inputDataURL
                console.log("进入编辑图片界面")
            },
            // 图片预览弹窗
            handlePictureCardPreview(msg) {
                switch (msg.type) {
                    case 'image':
                    case 'file':
                        if (msg.file.type == 'PNG' || msg.file.type == 'JPEG' || msg.file.type == 'JPG' || msg.file.ext == 'jpg') {
                            this.dialogImageUrl = msg.file.url;
                            this.dialogImageVisible = true;
                            console.log(this.dialogImageUrl, this.dialogImageVisible)
                        }
                        return msg.file.url
                    case 'audio':
                        this.$store.dispatch('setAudioUrlAct', msg.file.mp3Url)
                        console.log("播放语音")
                        document.getElementById('playAudio').load()
                        document.getElementById('playAudio').play();
                        return msg
                    case 'notification':
                        console.log(msg.from, msg.to)
                        this.$store.dispatch('setVideoObjParallelAct',true)
                        this.call(msg.from == this.$store.state.data.myInfo.account ? msg.to : msg.from)
                    default:
                }
            },
            // 不同类型消息分别格式化显示
            showMsgRefType(msg) {
                switch (msg.type) {
                    case 'text':
                        return msg.text;
                    case 'image':
                        return '<img src="' + msg.file.url + '" alt="" style="width: 550px">';
                    case 'notification':
                        var netcallType = msg.attach.netcallType == 2 ? '<i class="el-icon-video-camera"></i>' : '<i class="el-icon-phone-outline"></i>';
                        msg = msg.text == '' ? netcallType + ' ' + parseInt(msg.attach.duration / 60) + ':' + (msg.attach.duration % 60) : netcallType + msg.text;
                        return '<div style="color: red;cursor: pointer;">' + msg + '</div>';
                    case 'audio':
                        var mp3Url = msg.file.mp3Url;
                        var playAudio = '@click.native="this.showTips"'
                        return '<div style="background-color:cornflowerblue;font-size: 16px;border-radius: 5px;" +@click.stop="this.showTips"+>' +
                            '<i class="el-icon-video-play">' + msg.file.dur / 1000 + 's</div>'
                    case 'file':
                        if (msg.file.type == 'PNG' || msg.file.type == 'JPEG' || msg.file.type == 'WEBP') {
                            let command = '@click.native="this.getUserInfo(\'jiandan\')"'
                            return '<img src="' + msg.file.url + '" alt="" style="object-fit:cover;background-size: cover;width: 100%;height:100%;cursor: pointer;" ' + command + '>';
                        }
                    case 'tip':
                        return msg.tip;
                    case 'custom':
                        return '定制消息'
                    default:
                        return msg
                }
            },
            // 消息来源不同显示背景不同
            messageBGC(msg) {
                let background = msg.to == this.$store.state.tempSession.tempObj.to ? 'background: #9eea6a;' : 'background: #efefef;'
                let maxWidth = msg.type == 'image' || msg.type == 'file' ? 'max-width: 41%;' : 'max-width: 66%;';
                return background + maxWidth
            },
            // 显示聊天用户头像
            showUserAvatar(msg) {
                let myAvatar = this.$store.state.data.myInfo.avatar ? this.$store.state.data.myInfo.avatar : "https://bing.ioliu.cn/v1/rand?&w=200&h=200"
                let toAvatar = this.$store.state.toAvatar ? this.$store.state.toAvatar : this.form.toAvatar
                return msg.from == this.$store.state.profile.account ? myAvatar : toAvatar
            },
            sender(msg) {
                if (msg.from == this.$store.state.profile.account) {
                    return "right";
                } else {
                    return "left";
                }
            },
            // 开启视频聊天
            chatVideo() {
                console.log("开始视频聊天....")
                // this.initNetCall()
                this.call(this.$store.state.tempSession.tempObj.to)
            },
            // 视频呼叫
            call(account) {
                const pushConfig = {
                    enable: true,
                    needBadge: true,
                    needPushNick: true,
                    pushContent: '',
                    custom: '测试自定义数据',
                    pushPayload: '',
                    sound: '',
                    forceKeepCalling: 0
                };
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
                };
                this.$store.state.netcall.call({
                    type: this.$store.state.NetCall.NETCALL_TYPE_VIDEO,
                    account: account,
                    pushConfig: pushConfig,
                    sessionConfig: sessionConfig,
                }).then(obj => {
                    console.log("我呼叫你时播放的语音")
                    this.$store.dispatch('setAudioUrlAct', "https://app.yunxin.163.com/webdemo/im/audio/avchat_connecting.mp3")
                    document.getElementById('playAudio').load();
                    document.getElementById('playAudio').play();
                    document.getElementById('playAudio').loop = true;

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
                                 })*/
                        })
                        /*.then(function () {
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
                        })*/
                        .catch(function (err) {
                            console.log('发生错误')
                            console.log(err)
                            this.$store.dispatch('hangUp')
                        })

                    // 设置超时计时器
                    this.callTimer = setTimeout(() => {
                        if (!netcall.callAccepted) {
                            console.log('超时未接听,挂断');
                            this.$message({
                                message: "超时未接听,挂断",
                                type: 'error'
                            });
                            this.$store.dispatch('hangUp')
                        }
                    }, 1000 * 30);

                    this.$store.dispatch('setCallTimerAct', this.callTimer)

                    // 在回调里监听对方加入通话，并显示对方的视频画面
                    netcall.on('remoteTrack', obj => {
                        console.log('用户加入....', obj)
                        //在此处修改加入通话的对象属性
                        this.$store.dispatch('setVideoObjOnlineAct', true)
                        this.$store.dispatch('setVideoObjAccountAct', obj.account)

                        this.$store.state.tempSession.tempObj.to = obj.account

                        this.$store.dispatch('setIsCalledAct', true)
                        if (document.getElementById('playAudio').loop) {
                            document.getElementById('playAudio').loop = false;
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
                    });
                    this.$store.state.netcall.on("hangup", obj => {
                        this.$store.dispatch('clearCallTimerAct')

                        this.$store.dispatch('hangUp')
                        console.log("Calling was hangUp...." + obj)
                    })
                }).catch();
            },
            // 打开本地文件
            openFile() {
                document.getElementById("file").click();
            },
            // 发送消息按钮
            sendMsg(inputMsg) {
                if (inputMsg != null) {
                    var str = inputMsg.replace(/(^\s*)|(\s*$)|(\n\r)/g, '');//去除空格;
                }
                if (str == '' || str == undefined || str == null) {
                    this.$message({
                        message: '发送消息不能为空',
                        type: 'warning'
                    });
                    return
                }
                let tempObj = this.$store.state.tempSession.tempObj;
                let to = tempObj.to;
                let scene = tempObj.scene;
                console.log( tempObj)
                console.log(tempObj.to)
                console.log(tempObj.scene)
                let msg = this.$store.state.nim.sendText({
                    scene: scene,
                    to: to,
                    text: inputMsg,
                    done: (error, msg) => {
                        console.log(error);
                        console.log(msg);
                        console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient);
                        console.log("mergeMsgs is running......00000000")
                        for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                            if (this.$store.state.data.sessions[i].to == msg.to) {
                                this.$store.commit('setTempSession', {
                                    key: 'tempObj',
                                    val: this.$store.state.data.sessions[i]
                                });
                                this.$store.commit('setTempSession', {
                                    key: 'tempMsgs',
                                    val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                                });
                                console.log("抓住发送消息只螃蟹.....")
                            }
                        }
                        this.$forceUpdate()
                    }
                });
                console.log('正在发送p2p text消息, id=' + msg.idClient);
                this.$store.dispatch('pushMsgAct', msg)
                this.inputMsg = '';
            },
            // 发送图片
            sendPic() {
                if (document.getElementById("file").value == null || document.getElementById("file").value == "") {
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
                            console.log('文件总大小: ' + obj.total + 'bytes');
                            console.log('已经上传的大小: ' + obj.loaded + 'bytes');
                            console.log('上传进度: ' + obj.percentage);
                            console.log('上传进度文本: ' + obj.percentageText);
                        },
                        done: (error, file) => {
                            console.log('上传image' + (!error ? '成功' : '失败'));
                            // show file to the user
                            if (!error) {
                                var msg = nim.sendFile({
                                    scene: 'p2p',
                                    to: this.$store.state.tempSession.tempObj.to,
                                    file: file,
                                    done: (error, obj) => {
                                        console.log('语音转文字' + (!error ? '成功' : '失败'), error, obj);
                                    }
                                });
                                console.log('正在发送p2p image消息, id=' + msg.idClient);
                                this.$store.dispatch('pushMsgAct', msg)
                                for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                                    if (this.$store.state.data.sessions[i].to == msg.to) {
                                        this.$store.commit('setTempSession', {
                                            key: 'tempObj',
                                            val: this.$store.state.data.sessions[i]
                                        });
                                        this.$store.commit('setTempSession', {
                                            key: 'tempMsgs',
                                            val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                                        });
                                        console.log("抓住发送消息只螃蟹.....")
                                    }
                                }
                                document.getElementById("file").value = null
                                this.$forceUpdate()
                            }
                        }
                    });
                }
            },
            // 获取好友profile
            getFriendProfile() {
                console.log(this.dialogFriendProfileVisible)
                var account = ''
                this.dialogFriendProfileVisible = true
                var tempObj = this.$store.state.tempSession.tempObj
                var list = this.$store.state.data.users
                for (let i = 0; i < list.length; i++) {
                    if (tempObj.scene == 'p2p') {
                        if (list[i].account == tempObj.to) {
                            account = list[i].account
                        }
                    } else {
                        this.tempUser.account = tempObj.id
                        this.tempUser.email = '群聊不显示邮箱字段'
                        this.tempUser.nick = '群聊消息'
                        return
                    }
                }
                console.log("openChat:  " + account)
                this.$store.state.nim.getUser({
                    account: account,
                    done: (error, user) => {
                        this.tempUser = user
                        console.log(user);
                        console.log('获取用户资料' + (!error ? '成功' : '失败'));
                    }
                })
            },
            sendPicFromEdit(dataURL) {
                let nim = this.$store.state.nim
                nim.previewFile({
                    type: 'image',
                    dataURL: dataURL,
                    fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
                    uploadprogress: (obj) => {
                        console.log('上传进度文本: ' + obj.percentageText);
                    },
                    done: (error, file) => {
                        console.log('上传image' + (!error ? '成功' : '失败'));
                        if (!error) {
                            var msg = nim.sendFile({
                                scene: 'p2p',
                                // 编辑好的图片只能发送给当前视频对端用户
                                to: this.$store.state.tempSession.tempObj.to,
                                file: file,
                                done: (error, obj) => {
                                    console.log("发送图片 " + (!error ? '成功' : '失败'), error, obj);
                                }
                            });
                            this.$store.dispatch('pushMsgAct', msg)
                            for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                                if (this.$store.state.data.sessions[i].to == msg.to) {
                                    this.$store.commit('setTempSession', {
                                        key: 'tempObj',
                                        val: this.$store.state.data.sessions[i]
                                    });
                                    this.$store.commit('setTempSession', {
                                        key: 'tempMsgs',
                                        val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                                    });
                                    console.log("抓住发送消息只螃蟹.....")
                                }
                            }
                        }
                    }
                });
            }
        },
        mounted() {
            Event.$on('sendMsg', val => {
                /*this.$store.state.nim.getUser({
                    account: 'simple4',
                    done: (error, user)=>{
                        console.log(error);
                        console.log(user);
                        console.log('获取用户资料' + (!error?'成功':'失败'));
                    }
                });*/

                console.log(val)

                this.$store.state.nim.previewFile({
                    type: 'image',
                    dataURL: val,
                    fastPass: '{"w":200,"h":110,"md5":"xxxxxxxxx"}',
                    uploadprogress: (obj) => {
                        console.log('上传进度文本: ' + obj.percentageText);
                    },
                    done: (error, file) => {
                        console.log('上传image' + (!error ? '成功' : '失败'));
                        if (!error) {
                            var msg = this.$store.state.nim.sendFile({
                                scene: 'p2p',
                                // 编辑好的图片只能发送给当前视频对端用户
                                to: this.$store.state.tempSession.tempObj.to,
                                file: file,
                                done: (error, obj) => {
                                    console.log("发送图片 " + (!error ? '成功' : '失败'), error, obj);
                                }
                            });
                            this.$store.dispatch('pushMsgAct', msg)
                            for (let i = 0; i < this.$store.state.data.sessions.length; i++) {
                                if (this.$store.state.data.sessions[i].to == msg.to) {
                                    this.$store.commit('setTempSession', {
                                        key: 'tempObj',
                                        val: this.$store.state.data.sessions[i]
                                    });
                                    this.$store.commit('setTempSession', {
                                        key: 'tempMsgs',
                                        val: this.$store.state.data.msgs[this.$store.state.data.sessions[i].id]
                                    });
                                    console.log("抓住发送消息只螃蟹.....")
                                }
                            }
                        }
                    }
                });
            })
        },
        watch: {
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
                console.log("Video 监听到 isSnapShot 状态改变:", val)
                this.localSnapshot = val
            },
            '$store.state.videoViewRemoteWidth': function (val) {
                this.videoViewRemoteWidth = val
            },
            '$store.state.videoViewRemoteHeight': function (val) {
                this.videoViewRemoteHeight = val
            },
            '$store.state.outputFileURL': function (val) {
                console.log("我要开始发送图片了.......")
                this.localFileURL = val
                // Event.$emit('sendMsg',val)
                this.sendPicFromEdit(val)
            }
        },
        components: {
            Video
        }
    }
</script>

<style scoped>
  .el-dialog__wrapper {
    text-align: center;
  }

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
    padding-left: 330px;
    padding-right: 20px;
    width: calc(100% - 330px);
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
<!--  上面是大背景样式-->

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
        max-width: 41%;
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
        /*height: 86vh;*/
        /*width: 49%;*/
        width: 680px;
        height: 100%;
        background-color: #F5F5F5;
        border-radius: 5px 5px 0 0;
    }
</style>
