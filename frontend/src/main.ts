  import { createApp } from 'vue'
  import { createBootstrap } from 'bootstrap-vue-next'
  import App from './App.vue'

  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

  createApp(App)
    .use(createBootstrap())
    .mount('#app')