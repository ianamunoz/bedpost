import {resetValidatorCache} from '@modules/validation/validators';
import ValidationProcessor from '@modules/validation/ValidationProcessor';
import {onTransitionTriggered} from '@modules/transitions';
import renderless from '@mixins/renderless';
import trackedForm from '@mixins/trackedForm';

/**
 * A component to wrap a validated form. Uses [Vuelidate]{@link https://monterail.github.io/vuelidate/} for validation
 *
 * @module
 * @mixes renderless
 * @mixes trackedForm
 * @vue-data {?module:components/stepper/FormStepComponent} stepper the stepper in this form, if there is one
 * @vue-data {Object} [submissionError={}] a mutatable copy of the errors returned from the last submission attempt
 * @vue-data {Object} formData a mutatable copy of the object being modified by the form
 * @vue-data {Object} toggles a mutatable copy of an object to track toggle states on the form
 * @vue-prop {String} validate an object containing information on what types of validation, if any, each field in the form needs
 * @vue-prop {Object} startToggles the starting state of toggles on the form
 * @vue-prop {Object} value the starting state of the value of the object modified by the form
 * @vue-prop {boolean} dynamicValidation should the form validate dynamically based on what fields are available?
 * @vue-prop {Object} error the starting state of the errors from the last submission attempt
 * @vue-computed {Object} slotScope the scope to bind to the slot
 * @vue-computed {Object} $v the vuelidate object
 * @listens form.onsubmit
 * @listens form.ajax:error
 * @listens module:components/form/ToggleComponent~toggle-event
 */
export default {
	mixins: [renderless, trackedForm],
	data: function() {
		return {
			stepper: null,
			adlValidations: {},
			// need these because vue doesn't like it when you mutate props
			submissionError: this.error,
			formData: this.value,
			toggles: this.startToggles,
		};
	},
	props: {
		validate: {
			type: Object,
			default: objectFactory
		},
		startToggles: {
			type: Object,
			default: objectFactory
		},
		value: {
			type: Object,
			default: objectFactory
		},
		error: {
			type: Object,
			default: objectFactory
		},
		dynamicValidation: Boolean,
	},
	validations: function() {
		let $refs = this.dynamicValidation && this.$root && this.$root.$refs;
		let formatted = new ValidationProcessor(this.validate, [], this.formData, $refs, this.adlValidations).process();

		return {
			formData: formatted,
		};
	},
	computed: {
		slotScope: function() {
			return {
				validateForm: this.validateForm,
				handleError: this.handleError,
				handleSuccess: this.trackSuccess,
				toggle: this.toggle,
				$v: this.$v,
				toggles: this.toggles,
				submissionError: this.submissionError,
				formData: this.formData,
				addValidation: (key, validations) => {
					if (this.adlValidations[key] === undefined) {
						this.$set(this.adlValidations, key, validations);
					}
				},
				addStepper: (newStepper) => {
					this.$set(this, 'stepper', newStepper);
				}
			};
		},
	},
	methods: {
		/**
		 * Validate the form on submission
		 *
		 * @param  {Event} e the form submission event
		 */
		validateForm(e) {
			// run validation
			this.$v.$touch();
			// if there's a stepper and it's not fully complete
			if (this.stepper && !this.stepper.allReady()) {
				// stop the event
				e.preventDefault();
				e.stopPropagation();

				// find the next incomplete step
				this.stepper.findNext();
			}
			// otherwise if the form isn't valid
			else if (this.$v.$invalid) {
				// stop the even
				e.preventDefault();
				e.stopPropagation();

				// find the first errored field and focus it
				const firstErrorField = this.$children.find((c) => c.isValid && !c.isValid());
				if (firstErrorField !== undefined) {
					firstErrorField.setFocus();
					this.trackError(firstErrorField.field);
				} else {
					this.trackError('unknown form validation error');
				}
			}
			// let the form submit
			else {
				// set the animation for if the submission triggers a page visit
				onTransitionTriggered(e);
				// clear previous submission error
				this.submissionError = {};
			}
		},
		/**
		 * Handle an ajax error
		 *
		 * @param  {Event} e the error event
		 */
		handleError(e) {
			let [respJson] = e.detail;
			// set the new submission error
			this.submissionError = respJson.errors;
			// re-run validations
			this.$v.$touch();

			// do google tracking
			this.trackError(JSON.stringify(this.submissionError));

		},
		/**
		 * Toggle a state
		 *
		 * @param  {string} toggleField the field to toggle
		 * @param  {boolean|string} newVal     the value to set the toggled field to
		 * @param  {?string} clear       the name of the field to clear with this toggle
		 */
		toggle(toggleField, newVal, clear) {
			// set the value
			this.toggles[toggleField] = newVal;
			// set the clear field to null if there is one
			if (clear) {
				let toClear = clear === true ? toggleField : clear;
				Object.setAtPath(this, `formData.${toClear}`, null);
			}
		},
	},
	mounted() {
		resetValidatorCache();
	},
};

function objectFactory() {
	return {};
}
