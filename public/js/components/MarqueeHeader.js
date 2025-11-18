export default class MarqueeHeader extends BaseComponent {
	constructor({
		name,
		loadInnerComponents,
		parent,
		element,
	}) {
		super({
			name,
			loadInnerComponents,
			parent,
			element,
			// Component default options
			defaults: {
				loop: true,
				speed: 0.5,
				onHoverSpeed: 0.1,
				onScrollSpeed: false,
				onScrollInverseDirection: false,
				delimiter: '&nbsp;&nbsp;/&nbsp;&nbsp;'
			},
			// Component inner elements
			innerElements: {
				lanes: '.js-marquee-header__list-lane',
				items: '.js-marquee-header__list-item',
				labels: '.js-marquee-header__label'
			}
		});

		this._handlers = {
			afterResize: this._onAfterResize.bind(this),
			containerResize: this._onContainerResize.bind(this),
			transitionInit: this._onTransitionInit.bind(this)
		};

		this.resizeObserver = null;
		this.clamp = gsap.utils.clamp(-10, 10);

		this.setup();
	}

	init() {
		// Clean up any existing infinite list from previous initialization
		if (this.infiniteList) {
			this.destroy();
		}

		this._addDelimiter();
		this._createInfiniteList();
		this._attachEvents();

		// Attach ResizeObserver to monitor element size changes
		this._attachResizeObserver();

		// Attach AJAX transition listener to recalculate on page transitions
		this._attachAJAXListeners();

		// Ensure proper dimensions after initialization
		if (this.infiniteList) {
			setTimeout(() => {
				this._updateInfiniteListDimensions();
			}, 50);
		}
	}

	destroy() {
		// Detach AJAX transition listeners
		this._detachAJAXListeners();

		// Disconnect ResizeObserver
		this._disconnectResizeObserver();

		// Detach event listeners before destroying
		if (this.infiniteList && this.infiniteList.controller) {
			try {
				this._detachEvents();
			} catch (e) {
				// Silently fail if events were already detached
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

	getScrubAnimation() {
		if (typeof this.options.onScrollSpeed === 'number') {
			const proxy = {
				velocity: this.options.speed
			};

			const velocityWatcher = ScrollTrigger.getById('velocityWatcher');

			const config = {
				trigger: this.element,
				once: false,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					let velocity = this.clamp(Math.abs(velocityWatcher.getVelocity()) / 300) * this.options.onScrollSpeed;

					if (velocity > proxy.velocity) {
						proxy.velocity = velocity * (this.options.onScrollInverseDirection ? self.direction : 1);

						gsap.to(proxy, {
							velocity: this.options.speed,
							duration: 0.6,
							ease: 'none',
							overwrite: true,
							onUpdate: () => {
								if (this.infiniteList && 'marquee' in this.infiniteList.plugins) {
									this.infiniteList.plugins.marquee.setNormalSpeed(proxy.velocity);
								}
							}
						});
					}
				}
			}

			return config;
		}
	}

	_attachEvents() {
		this.infiniteList.controller.on('afterResize', this._handlers.afterResize);
	}

	_detachEvents() {
		this.infiniteList.controller.off('afterResize', this._handlers.afterResize);
	}

	_addDelimiter() {
		if (typeof this.options.delimiter === 'string') {
			this.elements.labels.forEach((heading) => {
				heading.innerHTML = `<span class="marquee-heading">${heading.innerHTML}</span>`;

				if (this.options.delimiter.length) {
					heading.innerHTML += `<span class="marquee-delimiter">${this.options.delimiter}</span>`;
				}
			});
		}
	}

	_createInfiniteList() {
		this.infiniteList = new ArtsInfiniteList(this.element, {
			direction: 'horizontal',
			listElementsSelector: this.innerSelectors.items,
			mapWheelEventYtoX: false,
			multiLane: {
				laneSelector: this.innerSelectors.lanes,
				laneOptionsAttribute: 'data-arts-infinite-list-options'
			},
			autoClone: this.options.loop,
			loop: this.options.loop,
			plugins: {
				marquee: {
					speed: this.options.speed,
					onHoverSpeed: this.options.onHoverSpeed
				},
				scroll: false,
			},
		});
	}

	_onAfterResize() {
		if (app.lazy && typeof app.lazy.update === 'function') {
			app.lazy.update();
		}
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

				// Refresh marquee plugin after dimension update
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
