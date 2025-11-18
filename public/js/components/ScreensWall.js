export default class ScreensWall extends BaseComponent {
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
				marquee: {
					speed: 0.5,
					onHoverSpeed: 0.5
				}
			},
			// Component inner elements
			innerElements: {
				container: '.js-screens-wall__list-container',
				lanes: '.js-screens-wall__list-lane',
				items: '.js-screens-wall__list-item',
			}
		});

		this._handlers = {
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

		// Attach ResizeObserver to monitor container size changes
		this._attachResizeObserver();

		// Attach AJAX transition listener to recalculate on page transitions
		this._attachAJAXListeners();

		if (!this._hasAnimationScene()) {
			this._initMarquee();
		}

		// Ensure proper dimensions are calculated after a brief delay
		// This allows the DOM to fully settle after AJAX transition
		if (this.infiniteList && this.infiniteList.pluginsReady) {
			this.infiniteList.pluginsReady.then(() => {
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

		// Stop marquee animation if active
		if (this.infiniteList && this.infiniteList.plugins && this.infiniteList.plugins.marquee) {
			if (typeof this.infiniteList.plugins.marquee.stop === 'function') {
				this.infiniteList.plugins.marquee.stop();
			}
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
		if (this.elements.container && this.elements.container[0]) {
			const container = this.elements.container[0];
			// Remove any cloned elements created by ArtsInfiniteList
			const clonedItems = container.querySelectorAll('[data-clone]');
			clonedItems.forEach(item => {
				if (item && item.parentNode) {
					item.parentNode.removeChild(item);
				}
			});
		}
	}

	getRevealAnimation() {
		const tl = gsap.timeline({
			paused: true
		})

		if (this.elements.items.length) {
			tl.animateMask(this.elements.items, {
				animateFrom: 'bottom',
				duration: 2,
				ease: 'expo.inOut',
				stagger: distributeByPosition({
					from: 'center',
					amount: 0.5
				})
			});
		}

		tl.add(() => {
			this._initMarquee();
		}, '<50%');

		return tl;
	}

	_createInfiniteList() {
		this.infiniteList = new ArtsInfiniteList(this.elements.container[0], {
			direction: 'vertical',
			mapWheelEventYtoX: false,
			listElementsSelector: this.innerSelectors.items,
			multiLane: {
				laneSelector: this.innerSelectors.lanes,
				laneOptionsAttribute: 'data-arts-infinite-list-options'
			},
			autoClone: true,
			loop: true,
			plugins: {
				marquee: typeof this.options.marquee === 'object' ? {
					autoInit: false,
					...this.options.marquee
				} : false,
				scroll: false,
			}
		});
	}

	_initMarquee() {
		if (this.infiniteList) {
			this.infiniteList.pluginsReady.then(() => {
				if (this.infiniteList.plugins.marquee) {
					this.infiniteList.update();
					this.infiniteList.plugins.marquee.init();
				}
			});
		}
	}

	_attachResizeObserver() {
		// Monitor container size changes and update infinite list dimensions
		if (this.elements.container && this.elements.container[0] && typeof ResizeObserver !== 'undefined') {
			try {
				this.resizeObserver = new ResizeObserver(() => {
					this._handlers.containerResize();
				});

				this.resizeObserver.observe(this.elements.container[0]);
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

				// Force recalculation of marquee after update
				if (this.infiniteList.plugins && this.infiniteList.plugins.marquee) {
					if (typeof this.infiniteList.plugins.marquee.update === 'function') {
						this.infiniteList.plugins.marquee.update();
					}
				}
			} catch (e) {
				// Silently fail if update fails
			}
		}
	}
}
