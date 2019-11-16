import { required, email, minLength, maxLength, sameAs, helpers } from 'vuelidate/lib/validators'
import {submitted} from '@modules/validators';
import {onTransitionTriggered} from "@modules/transitions"
import renderless from "@mixins/renderless";

/**
 * A component to wrap a validated form. Uses [Vuelidate]{@link https://monterail.github.io/vuelidate/} for validation
 * @module
 * @mixes renderless
 * @vue-data {Object} formData a JSON representation of the object being modified by the form
 * @vue-data {Object} toggles an object to track toggle states on the form
 * @vue-data {?module:components/stepper/FormStepComponent} stepper the stepper in this form, if there is one
 * @vue-data {Object} [submissionError={}] the errors returned from the last submission attempt
 * @vue-prop {String} validate a comma-separated string of fields to validate in the form
 * @vue-prop {Object} startToggles the starting state of toggles on the form
 * @vue-computed {Object} slotScope the scope to bind to the slot
 * @vue-computed {Object} $v the vuelidate object
 * @listens form.onsubmit
 * @listens from.ajax:error
 * @listens module:components/form/ToggleComponent~toggle-event
 */
export default {
	mixins: [renderless],
	data: function() {
		let name = this.name
		let fd = null
		if (name) {
			fd = {}
			fd[name] = gon.form_obj[name]
		} else {
			fd = gon.form_obj
		}

		let dt = {
			formData: fd,
			toggles: this.startToggles,
			stepper: null,
			submissionError: gon.submissionError || {},
			finalized: false
		};

		// get rid of passwords
		// TODO this should not be necessary. make the json work properly from the back end
		if (gon.form_obj.password_digest !== undefined) {
			dt.password = dt.password || "";
			dt.password_confirmation = dt.password_confirmation || "";
		}
		return dt;

	},
	props: {
		validate: String,
		startToggles: Object,
		name: String
	},
	validations: function() {
		// format the validators
		let validators = {};
		if (this.name) {
			validators[this.name] = gon.validators[this.name]
		} else {
			validators = gon.validators
		}
		return {formData: formatValidators(this.$props.validate, validators, [])};
	},
	computed: {
		slotScope: function() {
			return {
				validateForm: this.validateForm,
				handleError: this.handleError,
				toggle: this.toggle,
				$v: this.$v,
				toggles: this.toggles,
				submissionError: this.submissionError,
				formData: this.formData,
				addStepper: (newStepper) => {
					this.stepper = newStepper;
				}
			}
		}
	},
	methods: {
		/**
		 * Validate the form on submission
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
				for (var i = 0; i < this.$children.length; i++) {
					let child = this.$children[i];
					if (child.isValid && !child.isValid()) {
						child.setFocus();
						break;
					}
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
		 * @param  {Event} e the error event
		 */
		handleError(e) {
			let [respJson, status, xhr] = e.detail
			// set the new submission error
			this.submissionError = respJson.errors;
			// re-run validations
			this.$v.$touch();
		},
		/**
		 * Toggle a state
		 * @param  {String} toggleField the field to toggle
		 * @param  {Boolean|String} newVal     the value to set the toggled field to
		 * @param  {?String} clear       the name of the field to clear with this toggle
		 */
		toggle(toggleField, newVal, clear) {
			// set the value
			this.toggles[toggleField] = newVal
			// set the clear field to null if there is one
			if (clear) {
				let toClear = clear === true ? toggleField : clear
				Object.setAtPath(this, toClear, null);
			}
		}
	},
	// it's really gross to add this tight coupling, but this whole component needs major refactoring, and this is a stop gap until I get to it
	updated() {
		if (this.finalized || this.$children.length == 0) {
			return;
		}
		// only run this once
		this.finalized = true;

		// go through all the children in order to make sure dates are properly formatted for the date selector
		for (var i = 0; i < this.$children.length; i++) {
			let child = this.$children[i]
			if (child.isDate) {
				let fieldParent = this.formData[child.modelName] || this.formData;
				let origDate = fieldParent[child.field]
				// make a date object from the string
				fieldParent[child.field] = new Date(origDate);
			}
		}
	}

}

/**
 * Process the fields on the form to apply the correct validations to each. Uses recursion to process each level of nested validations
 * @param  {String} formFields    a comma-separated string of field names indicating which form fields want validation
 * @param  {Object} an object mapping arrays of validator arguments to their fields
 * @param  {String[]} path          the path to this level in recursive searching
 * @return {Object}               the validator config for this level
 */
function formatValidators(formFields, validatorVals, path) {
	// make an empty object to hold validation config
	let validators = {}
	// each field in this level
	for (let field in validatorVals) {
		// get the validator configs for it
		let f_vals = validatorVals[field];
		// add the field to the path
		let this_path = path.concat(field);
		// if the validator configs is another object, run the formatter on it as a new level
		if (f_vals.length === undefined) {
			// send this object and this path
			validators[field] = formatValidators(formFields, f_vals, this_path);
			continue;
		}

		// if the field is not in the list, continue
		if (formFields.indexOf(field) < 0) {
			continue;
		}

		// always add a submission error validator
		validators[field] = validators[field] || {}
		validators[field].submitted = submitted(this_path)

		// if it's an email field, add an email validator
		if (field == "email") {
			validators[field].email = email;
		}

		// go through the configs
		for (var f = 0; f < f_vals.length; f++) {
			if (f_vals[f] === null) {
				continue;
			}
			// destructure the array
			let [type, opts] = f_vals[f];

			// the types we currently handle
			switch(type) {
				case "presence":
					// presence validators are called 'blank' for translation purposes
					validators[field].blank = required;
					break;
				case "length":
					// length validators based on max and min
					if (opts.maximum) {
						validators[field].too_long = maxLength(opts.maximum);
					}
					if (opts.minimum) {
						validators[field].too_short = minLength(opts.minimum);
					}
					break;
				case "confirmation":
					// a confirmation validator will look for a match on a field with "_confirmation" appended to it
					let conf_field = field + "_confirmation";
					validators[conf_field] = validators[conf_field] || {};

					// validators[field].blank = required;
					validators[conf_field].confirmation = sameAs(field);
					break;
			}
		}
	}
	return validators;
}
