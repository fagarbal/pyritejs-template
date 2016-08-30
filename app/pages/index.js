import home from './home';
import login from './login';

import Template from './template.html';
import HeaderTemplate from './views/header.html';
import FooterTemplate from './views/footer.html';

export default [{
	state: '/',
	abstract: true,
	default: 'home',
	template: Template,
	views: {
		header: {
			template: HeaderTemplate
		},
		footer: {
			template: FooterTemplate
		}
	}
}, home, login];