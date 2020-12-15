/**
 * Created by 简小
 * Created on lucky 2020/12/14  21:58
 */
import Vuex from 'vuex'

import state from './states'
import actions from './actions'
import mutations from './mutations'
import getter from './getters'
import Vue from 'vue'
Vue.use(Vuex)
const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getter
})
export default store
