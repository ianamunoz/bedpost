/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb
import TurbolinksAdapter from 'vue-turbolinks'
import Vue from 'vue/dist/vue.esm'
import Vuelidate from 'vuelidate';
import navComponent from '../components/navComponent'
import vuelidateFormComponent from '../components/vuelidateFormComponent';
import basicStepperComponent from '../components/basicStepperComponent';
import {animIn, addTransitionEvents} from '../modules/transitions';

Vue.use(TurbolinksAdapter);
Vue.use(Vuelidate);
Vue.component('nav-component', navComponent);
Vue.component('vuelidate-form', vuelidateFormComponent);
Vue.component('basic-stepper', basicStepperComponent);
let app = null;
document.addEventListener('turbolinks:load', () => {
	// remove no-js specific styling
	let classList = document.getElementById("vue-container").classList;
	classList.remove("no-js");
	classList.add("with-js");

	app = new Vue({
		el: '#vue-container',
		mounted: animIn,
		methods: {
			t: (scope, options) => {
				return I18n.t(scope, options)
			}
		}
	})
});
addTransitionEvents();
