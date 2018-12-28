import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

function loadView(view) {
  return () =>
    import(/* webpackChunkName: "[request]" */ `./views/${view}.vue`);
}

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "boards",
      component: loadView("boards")
    },
    {
      path: "/show-board/:id",
      name: "show-board",
      component: loadView("show-board")
    },
    {
      path: "/add-board",
      name: "add-board",
      component: loadView("add-board")
    },
    {
      path: "/edit-board/:id",
      name: "edit-board",
      component: loadView("edit-board")
    }
  ]
});