<h1 align="center"> Vue.js with Firestore</h1>
<p align="center">This is a step by step tutorial for building a web application using Vue.js 2 and Firestore database.</p>

## Table of Contents
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Firestore Database](#firestore-database)
- [Bootstrap-Vue](#bootstrap-vue)
- [Router](#router)
- [Views](#views)
- [Repository](#repository)
- [Deployment](#deployment)
- [References](#references)
- [License](#license)

<a name="getting-started"></a>
## Getting Started

In your terminal, create a project using Vue CLI 3. If you don't have it in your machine, go [here](https://cli.vuejs.org/guide/installation.html).
```
vue create <your-project-name>
```
For the follow-up questions, choose these options:
```
? Please pick a preset: Manually select features
? Check the features needed for your project: Router, Linter/Formatter
? Use history mode for router? No
? Pick a linter / formatter config: ESLint + Prettier
? Pick additional lint features: Lint on save
? Where do you prefer placing config for Babel, PostCSS, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? No
```
Next, get started with the following commands:
```
cd <your-project-name>
npm run serve
```

<a name="prerequisites"></a>
## Prerequisites

To use Firestore database, you need to install the Firebase module.
```
npm i firebase
```
We are going to use Bootstrap for the views. For that, we need to install Bootstrap-Vue module.
```
npm i bootstrap-vue
```

<a name="firestore-database"></a>
## Firestore Database

Follow these steps to setup your Firestore database:
1. Sign in to [Google Firebase Console](https://console.firebase.google.com) using your Google account.
2. Click **Add Project**, name it as `<your-project-name>`, click **Create Project** then click **Continue**.
3. After being redirected to the Project Overview page, click **Database** then click **Create Database**.
4. For Security Rules for Cloud Firestore, choose **Start in test mode** then click **Enable**.
5. Click **Add Collection**, use **boards** for the Collection ID, use **Auto-ID** for the Document ID then add **title**, **description** and **author** fields.

Follow these steps to connect your Firestore database to your web application.
1. In Project Overview page, click **</>** in the hero section.
2. Copy the `var config = {...}`.
3. Go to your project, create a file called **firebase.js** under `/src` folder.
4. Add these codes to the newly created **firebase.js**.
```js
import firebase from "firebase/app";
import "firebase/firestore";

const settings = { timestampsInSnapshots: true };
const config = {
  // paste the config you copied in step 2
};

firebase.initializeApp(config);
firebase.firestore().settings(settings);

export default firebase;
```

<a name="bootstrap-vue"></a>
## Bootstrap-Vue

Create a file called **bootstrap.js** under `/src` folder and add these codes:
```js
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
```

Open **main.js** and add this code:
```js
import "./bootstrap";
```

<a name="router"></a>
## Router

Open **router.js** and replace all with these codes:
```js
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
```

<a name="views"></a>
## Views

Create a file called **boards.vue** under `/src/views` folder and add these codes:
```vue
<template>
  <b-row>
    <b-col cols="12">
      <h2>
        Boards
        <b-link href="/add-board">(Add Board)</b-link>
      </h2>
      <b-table striped hover :items="boards" :fields="fields">
        <template slot="actions" scope="row">
          <b-btn size="sm" @click.stop="details(row.item)">Details</b-btn>
        </template>
      </b-table>
    </b-col>
  </b-row>
</template>

<script>
import firebase from "../firebase"
import router from "../router"

export default {
  name: "boards",
  data() {
    return {
      fields: {
        title: { label: "Title", sortable: true, "class": "text-left" },
        actions: { label: "Action", "class": "text-center" }
      },
      boards: [],
      errors: [],
      ref: firebase.firestore().collection("boards"),
    }
  },
  created() {
    this.ref.onSnapshot((querySnapshot) => {
      this.boards = []
      querySnapshot.forEach((doc) => {
        this.boards.push({
          key: doc.id,
          title: doc.data().title
        })
      })
    })
  },
  methods: {
    details(board) {
      router.push({ name: "show-board", params: { id: board.key }})
    }
  }
}
</script>

<style>
.table {
  width: 96%;
  margin: 0 auto;
}
</style>
```

Create a file called **show-board.vue** under `/src/views` folder and add these codes:
```vue
<template>
  <b-row>
    <b-col cols="12">
      <h2>
        Edit Board
        <b-link href="/">(Boards)</b-link>
      </h2>
      <b-jumbotron>
        <template slot="header">
          {{board.title}}
        </template>
        <template slot="lead">
          Title: {{board.title}}<br>
          Description: {{board.description}}<br>
          Author: {{board.author}}<br>
        </template>
        <hr class="my-4">
        <b-btn class="edit-btn" variant="success" @click.stop="editBoard(key)">Edit</b-btn>
        <b-btn variant="danger" @click.stop="deleteBoard(key)">Delete</b-btn>
      </b-jumbotron>
    </b-col>
  </b-row>
</template>

<script>
import firebase from "../firebase"
import router from "../router"
export default {
  name: "show-board",
  data() {
    return {
      key: "",
      board: {}
    }
  },
  created() {
    const ref = firebase.firestore().collection("boards").doc(this.$route.params.id)
    ref.get().then((doc) => {
      if (doc.exists) {
        this.key = doc.id
        this.board = doc.data()
      } else {
        alert("No such document!")
      }
    })
  },
  methods: {
    editBoard(id) {
      router.push({
        name: "edit-board",
        params: { id: id }
      })
    },
    deleteBoard(id) {
      firebase.firestore().collection("boards").doc(id).delete().then(() => {
        router.push({
          name: "boards"
        })
      }).catch((error) => {
        alert("Error removing document: ", error)
      })
    }
  }
}
</script>

<style>
.jumbotron {
  padding: 2rem;
}
.edit-btn {
  margin-right: 20px;
  width: 70px;
}
</style>
```

Create a file called **add-board.vue** under `/src/views` folder and add these codes:
```vue
<template>
  <b-row>
    <b-col cols="12">
      <h2>
        Add Board
        <b-link href="/">(Boards)</b-link>
      </h2>
      <b-jumbotron>
        <b-form @submit="onSubmit">
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Title">
            <b-form-input id="title" v-model.trim="board.title"></b-form-input>
          </b-form-group>
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Description">
              <b-form-textarea id="description"
                         v-model="board.description"
                         placeholder="Enter something"
                         :rows="2"
                         :max-rows="6">{{board.description}}</b-form-textarea>
          </b-form-group>
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Author">
            <b-form-input id="author" v-model.trim="board.author"></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Save</b-button>
        </b-form>
      </b-jumbotron>
    </b-col>
  </b-row>
</template>

<script>
import firebase from "../firebase"
import router from "../router"

export default {
  name: "add-board",
  data() {
    return {
      ref: firebase.firestore().collection("boards"),
      board: {}
    }
  },
  methods: {
    onSubmit(event) {
      event.preventDefault()
      this.ref.add(this.board).then((docRef) => {
        this.board.title = ""
        this.board.description = ""
        this.board.author = ""
        router.push({
          name: "boards"
        })
      })
      .catch((error) => {
        alert("Error adding document: ", error)
      })
    }
  }
}
</script>

<style>
.jumbotron {
  padding: 2rem;
}
</style>
```

Create a file called **edit-board.vue** under `/src/views` folder and add these codes:
```vue
<template>
  <b-row>
    <b-col cols="12">
      <h2>
        Edit Board
        <router-link :to="{ name: 'show-board', params: { id: key } }">(Show Board)</router-link>
      </h2>
      <b-jumbotron>
        <b-form @submit="onSubmit">
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Title">
            <b-form-input id="title" v-model.trim="board.title"></b-form-input>
          </b-form-group>
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Description">
              <b-form-textarea id="description"
                         v-model="board.description"
                         placeholder="Enter something"
                         :rows="2"
                         :max-rows="6">{{board.description}}</b-form-textarea>
          </b-form-group>
          <b-form-group id="fieldsetHorizontal"
                    horizontal
                    :label-cols="4"
                    breakpoint="md"
                    label="Enter Author">
            <b-form-input id="author" v-model.trim="board.author"></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Update</b-button>
        </b-form>
      </b-jumbotron>
    </b-col>
  </b-row>
</template>

<script>
import firebase from "../firebase"
import router from "../router"

export default {
  name: "edit-board",
  data() {
    return {
      key: this.$route.params.id,
      board: {}
    }
  },
  created() {
    const ref = firebase.firestore().collection("boards").doc(this.$route.params.id)
    ref.get().then((doc) => {
      if (doc.exists) {
        this.board = doc.data()
      } else {
        alert("No such document!")
      }
    })
  },
  methods: {
    onSubmit(event) {
      event.preventDefault()
      const updateRef = firebase.firestore().collection("boards").doc(this.$route.params.id)
      updateRef.set(this.board).then((docRef) => {
        this.key = ""
        this.board.title = ""
        this.board.description = ""
        this.board.author = ""
        router.push({ name: "show-board", params: { id: this.$route.params.id }})
      })
      .catch((error) => {
        alert("Error adding document: ", error)
      })
    }
  }
}
</script>

<style>
.jumbotron {
  padding: 2rem;
}
</style>
```

Open **app.vue** and replace the `<template>` with these codes:
```vue
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Boards</router-link> |
      <router-link to="/add-board">Add Board</router-link>
    </div>
    <router-view/>
  </div>
</template>
```

<a name="repository"></a>
## Repository

[Create a new repository in GitHub](https://github.com/new) then add your project.

<a name="deployment"></a>
## Deployment

Create a new branch called **gh-pages**.
```
git checkout -b gh-pages
```

Create a file called **vue.config.js** and add these codes:
```js
module.exports = {
  baseUrl: process.env.NODE_ENV === "production"
    ? "/<your-project-name>/"
    : "/"
};
```

Create a file called deploy.sh and add these codes:
```sh
#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'Deploy production'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:<USERNAME/<REPO>.git master:gh-pages

cd -
```

In your terminal, run the **deploy.sh**.
```
bash deploy.sh
```

In your repository settings under **GitHub Pages**, select **gh-pages** branch as your **Source**.

<a name="references"></a>
## References

- [vuejs firebase tutorial build firestore crud web application](https://www.djamware.com/post/5bc9313680aca7466989441e/vuejs-firebase-tutorial-build-firestore-crud-web-application#ch1)
- [lazy loading vue cli 3 webpack](https://alligator.io/vuejs/lazy-loading-vue-cli-3-webpack/)
- [vuejs deployment guide](https://cli.vuejs.org/guide/deployment.html#cors)

<a name="license"></a>
## License

© 2019 [Jolo Yonaha](https://github.com/joloyonaha)  
[MIT License](https://github.com/joloyonaha/vuejs-with-firestore/blob/master/LICENSE)
