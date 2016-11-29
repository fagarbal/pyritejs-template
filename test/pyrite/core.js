class PyriteCore {
	constructor() {
		this.components = {};
		this.services = {};
		this.ids = 0;
		this.controllers = [0];
	}

	addService(controller, params) {
		let services = [];

		for (let serviceName of params.inject) {
			services.push(this.services[serviceName]);
		}

		this.services[params.alias] = new controller(...services);
	}

	addComponent(controller, params) {		
		this.components[params.selector] = {
			controller: controller || class {},
			template: params.template || '',
			selector: params.selector,
			inject: params.inject || [],
			require: params.require || [],
			as: params.as || '$ctrl'
		};
	}

	setIncludes(element, content) {
		let includes = element.getElementsByTagName('include');

		for (let include of includes) {
			include.innerHTML = content.innerHTML;
		}
	}

	toCamelCase(str) {
		return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
	}

	toDash(str) {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

	getValue(column, path) {
		return path.split('.').reduce((object, x) => {
			if (object) return object[x];
			return null;
		}, column);
	}

	getWordsBetweenCurlies(str) {
		var results = [],
			re = /{{([^}}]+)}}/g,
			text;

		while (text = re.exec(str)) {
			results.push(text[1]);
		}

		return Array.from(new Set(results));
	}

	getWordsBetweenAts(str) {
		var results = [],
			re = /@@([^@@]+)@@/g,
			text;

		while (text = re.exec(str)) {
			results.push(text[1]);
		}

		return Array.from(new Set(results));
	}

	instanceController(component, parents) {
		let services = [];

		for (let serviceName of this.components[component].inject) {
			services.push(this.services[serviceName]);
		}

		for(let parent of this.components[component].require) {
			this.components[component].controller.prototype[this.toCamelCase(parent)] = parents[parent];
		}

		this.components[component].controller.prototype[this.components[component].as] = this.components[component].controller.prototype;

		return new this.components[component].controller(...services);
	}

	getTemplateWithController(component, parents = {}) {
		let controller = null;

		if (this.controllers[this.components[component].id]) {
			controller = this.controllers[this.components[component].id];
		} else {
			controller = this.instanceController(component, parents);
			this.components[component].id = ++this.ids;
			this.controllers.push(controller);
		}

		parents[component] = controller;

		let template = this.components[component].template;

		const variables = this.getWordsBetweenCurlies(template);

		this.components[component].templateProperties = variables;

		const fn = (ctrl, component, method, core) => {
			const ctrlAs = core.components[component].as;


			let filter = method.split('#');

			if (filter.length > 1){
				const type = filter[1].trim()
				let evalStringCustom = `
					let ${ctrlAs} = arguments[0];
					${filter[0]};`

				if (type === 'JSON') {
					return JSON.stringify(eval(evalStringCustom));
				}
			}

			let evalString = `
				let ${ctrlAs} = arguments[0];
				${method};`
			try {
				return eval(evalString);
			}catch(e) {
				return '';
			}
;
		};

		for (let propertyName of variables){
			template = template.split(`{{${propertyName}}}`).join(fn.call(controller, controller, component, propertyName, this));
		}

		return [template, controller];
	}

	setAttributes(element, controller, component, used) {
		for (let children of element.children) {
			this.setAttributes(children, controller, component, used);

			const attributes = new Array(...children.attributes);

			const filteredAttributes = attributes.filter((attr) => {
				return attr.name.indexOf('(') >= 0;
			});

			const coreAttributes = attributes.filter((attr) => {
				return attr.name.indexOf('@') >= 0;
			});

			const fnCore = (ctrl, component, expresion, core, elem, event) => {
				const ctrlAs = core.components[component].as;
				let evalStringCustom = `
					let ${ctrlAs} = arguments[0];
					${expresion} = arguments[4].value;`;
				eval(evalStringCustom);
				this.setTemplate(component, elem.parentElement.parentElement.children, {}, expresion);
			};

			for (let attribute of coreAttributes) {
				if (attribute.name === '@model' ) {
					children.value = controller[attribute.value.replace(this.components[component].as+'.', '')] || '';
					children.addEventListener('input', fnCore.bind(this, controller, component, attribute.value, this, children), false);
					if (used === attribute.value) {
						children.focus();
					}
				}

				if (attribute.name === '@if') {
					const ctrlAs = this.components[component].as;
					let evalString = `
						let ${ctrlAs} = arguments[1];
						${attribute.value}`;
					children.hidden = !Boolean(eval(evalString));
				}

				if (attribute.name === '@for') {
					const ctrlAs = this.components[component].as;
					let template = children.cloneNode(true);

					children.innerHTML = '';

					let subscope = attribute.value.split('of')[0].trim();

					let that = this;

					let evalsString = `
						let ${ctrlAs} = arguments[1];

						for(let ${attribute.value}) {
							for (let i = 0; i < template.childNodes.length; i++) {
								let temp = template.childNodes[i].cloneNode(true);

								const variables = that.getWordsBetweenAts(temp.innerHTML);
								const fn = (propertyName) => {
									return eval(propertyName);
								};

								for (let propertyName of variables){
									temp.innerHTML = temp.innerHTML.split('@@' + propertyName + '@@').join(fn.call(this, propertyName));
								}

								children.appendChild(temp);
							}
						}`;
					eval(evalsString);
				}
			}


			if (!filteredAttributes.length) continue;

			const fn = (ctrl, component, expresion, children, elem, core, event) => {
				const ctrlAs = core.components[component].as;
				const evalString = `
					let ${ctrlAs} = arguments[0];
					let $element = arguments[3];
					let $event = arguments[6];
					${expresion};`
				const result = eval(evalString);
				this.renderComponents(elem.parentElement.parentElement);

				return result;
			};

			for (let attribute of filteredAttributes) {
				const attributeName = attribute.name.replace(/\(|\)/g, '');
				const clickMethod = attribute.value;

				children.addEventListener(attributeName, fn.bind(this, controller, component, clickMethod, children, element, this));
			}
		}
	}

	setTemplate(component, elements, parents, used = false) {
		for (let element of elements) {
			let content = element.cloneNode(true);

			let [template, controller] = this.getTemplateWithController(component, parents);

			element.innerHTML = template;

			this.setAttributes(element, controller, component, used);

			this.setIncludes(element, content);
			this.renderComponents(element, parents);
		}
	}

	renderComponents(element, parents = {}) {
		for (let component in this.components) {
			let elements = element.getElementsByTagName(component);

			if (!elements.length) continue;

			this.setTemplate(component, elements, parents);
		}
	}

	run() {
		window.addEventListener('DOMContentLoaded', (event) => {
			this.renderComponents(document);
		});
	}
}

export default new PyriteCore();