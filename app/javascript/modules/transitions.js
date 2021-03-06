import { gsap } from 'gsap';

/**
 * @module transitions
 * @description <p><b>Page transition animation module</b></p>
 * <p> Once {@link module:transitions.addTransitionEvents} is called, the transition module will run
 * 	a transition-out animation on any Turbolinks-enabled link click
 * 	and a transition-in animation on any page load. It relies on three events in the
 * 	Turbolinks lifecycle:
 * 	<ol>
 * 		<li> <em>turbolinks:click</em> - it calls {@link module:transitions.onTransitionTriggered} to
 * 		process the dataset from the clicked link. This applies link-specific animation properties
 * 		to the triggered transition </li>
 * 		<li> <em>turbolinks:before-visit</em> - it calls {@link module:transitions~beforeUnload} to
 * 		run the triggered out-animation and then put through the visit </li
 * 		<li> <em>turbolinks:load</em> - it calls {@link module:transitions~animIn} to run the triggered
 * 		in-animation once the new page has loaded </li>
 * 	</ol>
 * </p>
 *
 * @example
 * <caption> To add link-specific transition animations, attach properties to overwrite {@link module:transitions~prop_defaults}
 * to the dataset of the links. So: </caption>
 * // override the animation type for both in and out animations at once
 * <a href='someplace' data-animation-type='slideRight'> Slide Right </a>
 *
 * //override just the in animation
 * <a href='someplace' data-in-animation-type='slideLeft'> Fade out, then slide left in </a>
 *
 * //make your own timeline
 * <a href='someplace' data-out-animation='gsap.timeline().to(tweenEL, 0.5, {top: '-100%'})'> Run the given timeline out, then fade in </a>
 *
 * //make a timeline with the given properties.
 * //don't forget that inProps and outProps need to be valid JSON in order to be properly parsed;
 * //that means you have to put the attribute in single quotes so that keys can be in double quotes
 * <a href='someplace' data-in-props='{'top': '-100%'}' data-in-direction='from' data-anim-length='1'>Fade out for 1 second, then slide from top -100% for 1 second </a>
 *
 * @example
 * <caption> Transition animation behavior can also be applied to fake or non-Turbolinks-enabled transition events by passing an object
 * with animation properties to {@link module:transitions.processClickData}, then calling {@link module:transitions.animOut}
 * with no parameters or with a callback that calls {@link module:transitions.animIn}</caption>
 * import {animOut, animIn, processClickData} from './modules/transitions';
 * // add click listener to random element
 * el.click((e) => {
 * 	processClickData({animationType: 'slideRight'});
 * 	animOut(() => {
 * 		// ... transition code for a fake transition
 * 		animIn()
 * 	})
 * })
 */

/**
 * Get a timeline that slides the appropriate element in the given direction
 *
 * @param  {boolean} animatingOut is this timeline animating an out transition? false for in
 * @param  {boolean} toLeft       is this timeline sliding to the left? false for right
 * @return {TimelineMax}              the timeline
 */
const slide = function(animatingOut, toLeft) {
	// get the direction name
	let dir = animatingOut ? 'out' : 'in';
	// get the right container
	let container = document.getElementById(props[`${dir}Id`]);

	// make a timeline
	let tl = gsap.timeline();
	// start by setting the position, location, and height of the element and its parent so they maintain during sliding
	tl.set(container.parentElement, {position: 'relative', overflow: 'hidden', height: container.parentElement.offsetHeight});
	tl.set(container, {position: 'absolute', width: container.offsetWidth, top: container.offsetTop, opacity: 1});

	// set the animation props based on direction
	let animProps = {};
	if (toLeft) {
		animProps[animatingOut ? 'right' : 'left'] = '100%';
	} else {
		animProps[animatingOut ? 'left' : 'right'] = '100%';
	}
	// animate to if we're animating out, from if we're animating in
	tl[animatingOut ? 'to' : 'from'](container, props.animLength, animProps);
	// clear the props after the animation is complete
	tl.set([container, container.parentElement], {clearProps: 'all'});

	// if we're animating in, remove the 0 opacity default
	if (!animatingOut) {
		tl.set(container, {opacity: 1});
	}
	return tl;
};

/**
 * Get a timeline that slides the appropriate element to the left
 * @param  {boolean} animatingOut is this timeline animating an out transition? false for in
 * @yields {TimelineMax} the timeline
 * @see module:transitions~slide
 */
const slideLeft = function(animatingOut) {
	return slide(animatingOut, true);
}

/**
 * Get a timeline that slides the appropriate element to the left
 * @param  {boolean} animatingOut is this timeline animating an out transition? false for in
 * @yields {TimelineMax} the timeline
 * @see module:transitions~slide
 */
const slideRight = function(animatingOut) {
	return slide(animatingOut, false);
}

/**
 * Get a timeline that fades the appropriate element out
 * @param  {boolean} animatingOut is this timeline animating an out transition? false for in
 * @yields {TimelineMax}              the timeline
 */
const fade = function(animatingOut) {
	let dir = animatingOut ? 'out' : 'in';
	let container = document.getElementById(props[`${dir}Id`]);
	let animProps = animatingOut ? {opacity: 0} : {opacity: 1};
	return gsap.timeline().to(container, props.animLength, animProps);
};

/**
 * Available animation functions
 * @type {Object}
 * @property {function} slideLeft {@link module:transitions~slideLeft}
 * @property {function} slideRight {@link module:transitions~slideRight}
 * @property {function} fade {@link module:transitions~fade}
 */
const animationFunctions = {
	slideLeft,
	slideRight,
	fade
};

/**
 * Default animation properties. These will be used if no other animation data is given with the click
 * @type {Object}
 * @property {Number} animLength=0.3 the length in seconds of animations
 * @property {?Object} inProps=null the properties to apply to the element with inId during in animation
 * @property {String} inId='page-container' the id of the element to apply in animations to
 * @property {String} inDirection='to' the tween direction for the in animation ('to', 'from')
 * @property {?Object} outProps=null the properties to apply to the element with outId during out animation
 * @property {String} outId='page-container' the id of the element to apply out animations to
 * @property {String} outDirection='to' the tween direction for the out animation ('to', 'from')
 * @property {?tween} inAnimation=null a Tween or Timeline instance to play for the in animation
 * @property {?tween} outAnimation=null a Tween or Timeline instance to play for the out animation
 * @property {?function} inAnimationType=null the animation from {@link module:transitions~animationFunctions} to use for the in animation
 * @property {?function} outAnimationType=null the animation from {@link module:transitions~animationFunctions} to use for the out animation
 * @property {function} [animationType={@link module:transitions~fade}] the animation from {@link module:transitions~animationFunctions} to use as a default for in or out animations that are null
 */
const prop_defaults = {
	animLength: 0.3,
	inProps: null,
	inId: 'page-container',
	inDirection: 'to',
	outProps: null,
	outId: 'page-container',
	outDirection: 'to',
	inAnimation: null,
	outAnimation: null,
	inAnimationType: null,
	outAnimationType: null,
	animationType: animationFunctions.fade
};

/**
 * The current animation properties. Copies {@link module:transitions~prop_defaults} then is overridden through {@link module:transitions.processClickData}
 * @type {Object}
 */
let props = Object.assign({}, prop_defaults);

/**
 * @summary Play the Tween or Timeline for the given transition animation
 * @description This function determines the correct timeline by checking {@link module:transitions~props} in the following order and running the first non-null value:
 * <ol>
 * <li>in/outAnimation</li>
 * <li>in/outProps</li>
 * <li>in/outAnimationType</li>
 * <li>animationType</li>
 * </ol>
 * @param  {boolean} animatingOut     is this an out animation? False for an in animation
 * @param  {function} onComplete       callback to run once the animation is complete
 * @param  {array} onCompleteParams parameters to pass to the onComplete callback
 */
const getTween = function(animatingOut, onComplete, onCompleteParams) {
	// get the direction
	let dir = animatingOut ? 'out' : 'in';

	// try to get the animation
	let anim = props[`${dir}Animation`];
	// if there isn't one
	if (!anim) {
		// check for props
		if (props[`${dir}Props`]) {
			// make a timeline using the props
			let container = document.getElementById(props[`${dir}Id`]);
			anim = gsap.timeline()[`${dir}Direction`](container, props.animLength, props[`${dir}Props`]);
		}
		// otherwise check for an animation type
		else if (props[`${dir}AnimationType`]) {
			anim = props[`${dir}AnimationType`];
		}
	}

	// if there's still nothing, default to the animationType
	if (!anim) {
		anim = props.animationType;
	}

	// if it's a function to get a tween, get the tween using the animation direction
	if (typeof anim == 'function') {
		anim = anim(animatingOut);
	}

	// add onComplete
	if (onComplete) {
		anim.eventCallback('onComplete', onComplete, onCompleteParams)
	}

	// play it
	anim.play()

	// reset the props for this animation
	props[`${dir}Animation`] = null;
}

/**
 * @summary Animate an in-transition.
 * @function
 * @description  Calls {@link module:transitions~getTween} with false
 */
export const animIn = function() {
	getTween(false);
}

/**
 * @summary Animate an out-transition.
 * @description Calls {@link module:transitions~getTween} with true. Determines other arguments based on the value of visitUrl
 * @function
 * @param  {(string|function)} visitUrl the string URL to visit after the out transition is complete, or the onComplete function to send to {@link module:transitions~getTween}
 */
export const animOut = function(visitUrl) {
	// if visitUrl is a string, it's the url to go to after the transition
	if (typeof visitUrl == 'string') {
		getTween(true, Turbolinks.visit, [visitUrl])
	}
	// if it's a function, it's the onComplete
	else if (typeof visitUrl == 'function') {
		getTween(true, visitUrl)
	}
	// otherwise send animIn as the onComplete
	else {
		getTween(true, animIn)
	}
}

// in order to allow the out animation to complete before a turbolinks visit, we need to cancel the first call to visit
let no_visit = true;

/**
 * @summary The callback to be attached to the 'turbolinks:before-visit' handler
 * @description  The first time this is called it cancels the visit so the animation can run. It adds {@link Turbolinks.visit} as the onComplete callback for the animation so that the visit can go through.
 * @fires Turbolinks.visit if it interrupts the visit event it received
 * @param  {Event} e the visit event
 */
const beforeUnload = function(e) {
	// if this is the second visit attempt, let it go through
	if (no_visit == false) {
		no_visit = true
		return;
	}

	// otherwise set it to go through next time
	no_visit = false;
	// prevent the visit
	e.preventDefault()
	// animate out, appending the visit as an onComplete
	animOut(e.data.url);
}

/**
 * Data to overwrite default animations
 * @typedef {Object} module:transitions.prop_overrides
 * @property {Number} [animLength] the length in seconds of animations
 * @property {Object} [inProps] the properties to apply to the element with inId during in animation
 * @property {String} [inId] the id of the element to apply in animations to. Ignored without inProps
 * @property {String} [inDirection] the tween direction for in animations. Ignored without inProps
 * @property {Object} [outProps] the properties to apply to the element with outId during out animation
 * @property {String} [outId] the id of the element to apply out animations to. Ignored without outProps
 * @property {String} [outDirection] the tween direction for out animations. Ignored without outProps
 * @property {tween} [inAnimation] a Tween or Timeline instance to play for the in animation
 * @property {tween} [outAnimation] a Tween or Timeline instance to play for the out animation
 * @property {String} [inAnimationType] the string key for an animation from {@link module:transitions~animationFunctions} to use for the in animation
 * @property {String} [outAnimationType] the string key for an animation from {@link module:transitions~animationFunctions} to use for the out animation
 * @property {String} [animationType] the string key for an animation from {@link module:transitions~animationFunctions} to use as a default for in or out animations that are null
 * @see  {@link module:transitions~prop_defaults} to see what will be overwritten
 * @see  {@link module:transitions~getTween} to see the priority of properties in creating an animation
 */

/**
 * Process data from a click event to overwrite properties in {@link module:transitions~props}
 * @function
 * @param  {module:transitions.prop_overrides} [dataset={}] the data to overwrite the defaults
 */
export const processClickData = function(dataset) {
	dataset = dataset || {};
	// go through each property in props
	for(let propName in props) {
		// get the property from the dataset
		let given = dataset[propName];
		// get the property from the defaults
		let granted = prop_defaults[propName];
		// if there's something from the dataset
		if (given) {
			// get animationType functions from animationFunctions
			if (propName.indexOf('Type') > 0) {
				granted = animationFunctions[given];
			}
			// make a function that evaluates the JS string for animations
			// TODO replace this eval with something
			// else if (propName.indexOf('Animation') > 0) {
			// 	granted = function() {return eval(given)}
			// }
			// parse props and numbers a JSON object or primitive
			else if (propName.indexOf('Props') > 0 || propName == 'animLength') {
				granted = JSON.parse(given);
			}
			// otherwise keep the string
			else {
				granted = given;
			}
		}
		// set whatever resulted in the props
		props[propName] = granted;
	}
};

/**
 * @summary Click listener for turbolinks-enabled links.
 * @description Processes the link's dataset with {@link module:transitions.processClickData}
 * @function
 * @param  {Event} e the click event
 */
export const onTransitionTriggered = function(e) {
	let dataset = e.target.dataset;
	processClickData(dataset);
};

/**
 * Begin listening for turbolinks transition events and running animations in response to them
 *
 * @function
 * @listens turbolinks:before-visit
 * @listens turbolinks:click
 */
export const addTransitionEvents = function() {
	document.addEventListener('turbolinks:before-visit', beforeUnload);
	document.addEventListener('turbolinks:click', onTransitionTriggered);
};
