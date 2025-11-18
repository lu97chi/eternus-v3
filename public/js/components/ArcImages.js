export default class ArcImages extends BaseComponent {
	constructor({
		name,
		loadInnerComponents,
		parent,
		element
	}) {
		super({
			name,
			loadInnerComponents,
			parent,
			element,
			// Component default options
			defaults: {
				loop: false,
				minCloneLoopRounds: 1,
				maxCloneLoopRounds: 1,
				progressEffect: {
					preset: 'arc',
					intensity: 0.4
				},
			},
			// Component inner elements
			innerElements: {
				lanes: '.js-arc-images__list-lane',
				items: '.js-arc-images__list-item'
			}
		});
		this._handlers = {
			progressScene: this._onProgressScene.bind(this),
			containerResize: this._onContainerResize.bind(this),
			transitionInit: this._onTransitionInit.bind(this)
		};

		this.resizeObserver = null;

		this.setup();
	}

	init() {
		// Clean up any existing infinite list from previous initialization
		if (this.infiniteList) {
			this.destroy();
		}

		this._createInfiniteList();
		this._animateOnScroll();

		// Attach ResizeObserver to monitor container size changes
		this._attachResizeObserver();

		// Attach AJAX transition listener to recalculate on page transitions
		this._attachAJAXListeners();

		if (this.infiniteList) {
			this.infiniteList.pluginsReady.then(() => {
				this.infiniteList.update();
				this._onProgressScene({ progress: 0.0001 });

				// Ensure proper dimensions are calculated after setup
				setTimeout(() => {
					this._updateInfiniteListDimensions();
				}, 100);
			});
		}
	}

	destroy() {
		// Detach AJAX transition listeners
		this._detachAJAXListeners();

		// Disconnect ResizeObserver
		this._disconnectResizeObserver();

		// Kill scroll trigger animation first
		if (this.animationScroll && typeof this.animationScroll.kill === 'function') {
			this.animationScroll.kill();
			this.animationScroll = null;
		}

		// Destroy the infinite list instance
		if (this.infiniteList) {
			if (typeof this.infiniteList.destroy === 'function') {
				this.infiniteList.destroy();
			}
			// Nullify the reference to help garbage collection
			this.infiniteList = null;
		}

		// Clean up element references
		if (this.element) {
			// Remove any cloned elements created by ArtsInfiniteList
			const clonedItems = this.element.querySelectorAll('[data-clone]');
			clonedItems.forEach(item => {
				if (item && item.parentNode) {
					item.parentNode.removeChild(item);
				}
			});
		}
	}

	_createInfiniteList() {
		this.infiniteList = new ArtsInfiniteList(this.element, {
			direction: 'horizontal',
			listElementsSelector: this.innerSelectors.items,
			multiLane: {
				laneSelector: this.innerSelectors.lanes,
				laneOptionsAttribute: 'data-arts-infinite-list-options'
			},
			autoClone: this.options.loop,
			loop: this.options.loop,
			minCloneLoopRounds: this.options.minCloneLoopRounds,
			maxCloneLoopRounds: this.options.maxCloneLoopRounds,
			plugins: {
				scroll: false,
				speedEffect: this.options.speedEffect,
				progressEffect: this.options.progressEffect,
			},
		});
	}

	_animateOnScroll() {
		this.animationScroll = ScrollTrigger.create({
			trigger: this.element,
			start: () => `top+=10% bottom`,
			end: () => `bottom+=20% top`,
			onUpdate: this._handlers.progressScene,
			scrub: 1,
		});
	}

	_onProgressScene({ progress } = { progress: 0 }) {
		this.infiniteList.controller.setProgress(progress);
	}

	_attachResizeObserver() {
		// Monitor element size changes and update infinite list dimensions
		if (this.element && typeof ResizeObserver !== 'undefined') {
			try {
				this.resizeObserver = new ResizeObserver(() => {
					this._handlers.containerResize();
				});

				this.resizeObserver.observe(this.element);
			} catch (e) {
				// ResizeObserver not supported, silently fail
			}
		}
	}

	_disconnectResizeObserver() {
		if (this.resizeObserver && typeof this.resizeObserver.disconnect === 'function') {
			try {
				this.resizeObserver.disconnect();
			} catch (e) {
				// Silently fail
			}
			this.resizeObserver = null;
		}
	}

	_attachAJAXListeners() {
		// Listen for AJAX transition completion to recalculate dimensions
		if (typeof document !== 'undefined') {
			document.addEventListener('arts/barba/transition/init/after', this._handlers.transitionInit);
		}
	}

	_detachAJAXListeners() {
		if (typeof document !== 'undefined') {
			document.removeEventListener('arts/barba/transition/init/after', this._handlers.transitionInit);
		}
	}

	_onContainerResize() {
		// Debounce resize updates to avoid excessive calculations
		if (this._resizeTimeout) {
			clearTimeout(this._resizeTimeout);
		}

		this._resizeTimeout = setTimeout(() => {
			this._updateInfiniteListDimensions();
		}, 100);
	}

	_onTransitionInit() {
		// After AJAX transition, recalculate dimensions
		if (this.infiniteList) {
			setTimeout(() => {
				this._updateInfiniteListDimensions();
			}, 50);
		}
	}

	_updateInfiniteListDimensions() {
		// Force the infinite list to recalculate all dimensions
		if (this.infiniteList && typeof this.infiniteList.update === 'function') {
			try {
				this.infiniteList.update();

				// Force recalculation of progress effect after update
				if (this.infiniteList.controller && typeof this.infiniteList.controller.setProgress === 'function') {
					this.infiniteList.controller.setProgress(0.0001);
				}
			} catch (e) {
				// Silently fail if update fails
			}
		}
	}
}
