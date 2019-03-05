import {animIn} from '@modules/transitions';

/**
 * The root Vue instance for the application
 * @module
 * @vue-data {Object} [confirmations={}] an object tracking the confirmation state of confirmable actions on the page
 */
export default {
	el: '#vue-container',
	mounted: animIn,
	data: function() {
		// get anything with a data-confirm to add to confirmations
		let confirmations = {};
		let confNodes = document.querySelectorAll("[data-confirm]");
		for (let i = 0; i < confNodes.length; i++) {
			let node = confNodes[i];
			confirmations[node.id] = null;
		}

		return {confirmations}
	},
	methods: {
		t: (scope, options) => I18n.t(scope, options),
		/**
		 * Is the element's purpose confirmed?
		 * @param  {String}  message the confirmation message to show
		 * @param  {HTMLElement}  element the element whose action requires confirmation
		 * @return {Boolean}         whether the action is confirmed
		 */
		isConfirmed: function(message, element) {
			let id = element.id;
			// if there's already a message showing for this element's id, this is the second try, so it's confirmed
			if (this.confirmations[id]) {
				this.cancelConfirm(id);
				return true;
			}

			// otherwise set the message to show and return false
			this.confirmations[id] = message;
			return false;
		},
		/**
		 * Cancel a confirmation
		 * @param  {String} confirmId the id of the element whose confirmation is being canceled
		 */
		cancelConfirm: function(confirmId) {
			// set it back to null
			this.confirmations[confirmId] = null;
		}
	}
}
