Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', function () {
  this.render('widgets');
});

Router.route('/offers', function () {
  this.render('offers');
});