module.exports = {
	files : {
		javascripts : {
			joinTo : {
				'app.js' : /^app/,
				'js/vendor.js' : /^(node_modules)/
			}
		},
		stylesheets : {
			joinTo : 'app.css'
		}
	},
	notifications: false,
	modules : {
		autoRequire : {
			'app.js' : [ 'ShmuprpgApp' ]
		}
	}
}
