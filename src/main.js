import Vue from "vue";
import App from "./app.vue";
import router from "./router";
import "./bootstrap";

Vue.config.productionTip = false;

new Vue({
  router,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");
