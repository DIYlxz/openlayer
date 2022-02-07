import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "element-ui/lib/theme-chalk/index.css";
import { Select, 
  Option, 
  Dialog, 
  Card, 
  Form, 
  FormItem, 
  Input,
  RadioGroup,
  RadioButton,  
  Button,
  Message,
  DatePicker,
  Slider
} from "element-ui";

Vue.config.productionTip = false
//添加全局消息提示，变成vue方法
Vue.prototype.$message = Message

Vue.component(Option.name, Option);
Vue.component(Select.name, Select);
Vue.component(Dialog.name, Dialog);
Vue.component(Card.name, Card);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Input.name, Input);
Vue.component(RadioGroup.name, RadioGroup);
Vue.component(RadioButton.name, RadioButton);
Vue.component(Button.name, Button);
Vue.component(DatePicker.name, DatePicker);
Vue.component(Slider.name, Slider);


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
