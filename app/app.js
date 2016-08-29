import pyrite from '../../pyrite';

import templatea from './templates/templatea.html';
import templateb from './templates/templateb.html';
import templatec from './templates/templatec.html'; 
import templated from './templates/templated.html'; 
import templatee from './templates/templatee.html'; 
import templatef from './templates/templatef.html';

const headTemplate = '<h1>Head</h1>';
const footerTemplate = '<h1>Footer</h1>';

const headLoginTemplate = '<h2>Head Login</h2>';
const footerLoginTemplate = '<h2>Footer Login</h2>';

pyrite.route([{
	state: '/',
	abstract: true,
	default: 'app/example',
	template: templatea,
	views: {
		head: {
			template: headTemplate
		},
		footer: {
			template: footerTemplate
		}
	}
}, {
	state: '/login',
	template: templatef,
	views: {
		head: {
			template: headLoginTemplate
		},
		footer: {
			template: footerLoginTemplate
		}
	}
},{
	state: '/app',
	template: templateb
}, {
	state: '/app/example',
	template: templatec
}, {
	state: '/app/example/sub',
	template: templated
}, {
	state: '/app/example/brother',
	template: templatee
}]);
